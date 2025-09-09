import os
from typing import Any, Optional

import httpx
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel


app = FastAPI()

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    # Do not crash the function; raise on first request that needs them
    pass

AUTH_USER = f"{SUPABASE_URL}/auth/v1/user" if SUPABASE_URL else None
REST_CHATBOTS = f"{SUPABASE_URL}/rest/v1/chatbots" if SUPABASE_URL else None


class BotInput(BaseModel):
    name: str
    description: Optional[str] = ""
    config: Optional[dict[str, Any]] = None


class ChatInput(BaseModel):
    message: str
    model: Optional[str] = None
    instructions: Optional[str] = None


async def get_user_id_from_token(token: str) -> str:
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=500, detail="Missing Supabase env vars")
    assert AUTH_USER is not None
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": SUPABASE_ANON_KEY,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(AUTH_USER, headers=headers)
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid auth token")
    data = r.json()
    uid = data.get("id")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid auth token")
    return uid


@app.get("/api/health")
async def health():
    return {"ok": True}


@app.get("/api/bot")
async def get_bot(Authorization: Optional[str] = Header(default=None)):
    if Authorization is None or not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = Authorization.split(" ", 1)[1]
    user_id = await get_user_id_from_token(token)

    assert REST_CHATBOTS is not None
    params = {
        "select": "*",
        "user_id": f"eq.{user_id}",
        "order": "created_at.desc",
        "limit": 1,
    }
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": SUPABASE_ANON_KEY,  # type: ignore[arg-type]
        "Accept": "application/json",
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(REST_CHATBOTS, params=params, headers=headers)
    if r.status_code not in (200, 206):
        raise HTTPException(status_code=502, detail=f"Supabase error {r.status_code}")
    rows = r.json()
    bot = rows[0] if rows else None
    return {"bot": bot}


@app.post("/api/bot")
async def upsert_bot(body: BotInput, Authorization: Optional[str] = Header(default=None)):
    if Authorization is None or not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = Authorization.split(" ", 1)[1]
    user_id = await get_user_id_from_token(token)

    assert REST_CHATBOTS is not None
    base_headers = {
        "Authorization": f"Bearer {token}",
        "apikey": SUPABASE_ANON_KEY,  # type: ignore[arg-type]
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Prefer": "return=representation",
    }

    # Find most recent bot
    params = {
        "select": "id",
        "user_id": f"eq.{user_id}",
        "order": "created_at.desc",
        "limit": 1,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(REST_CHATBOTS, params=params, headers=base_headers)
    if r.status_code not in (200, 206):
        raise HTTPException(status_code=502, detail="Failed to query existing bot")
    rows = r.json()

    payload = {
        "name": body.name,
        "description": body.description or "",
        "config": body.config or {},
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        if rows:
            bot_id = rows[0]["id"]
            r2 = await client.patch(
                REST_CHATBOTS,
                params={"id": f"eq.{bot_id}"},
                headers=base_headers,
                json=payload,
            )
        else:
            payload_with_user = {"user_id": user_id, **payload}
            r2 = await client.post(
                REST_CHATBOTS,
                headers=base_headers,
                json=payload_with_user,
            )
    if r2.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail=f"Supabase upsert failed {r2.status_code}")
    data = r2.json()
    bot = data[0] if isinstance(data, list) else data
    return {"bot": bot}


@app.delete("/api/bot")
async def delete_bots(Authorization: Optional[str] = Header(default=None)):
    if Authorization is None or not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = Authorization.split(" ", 1)[1]
    user_id = await get_user_id_from_token(token)

    assert REST_CHATBOTS is not None
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": SUPABASE_ANON_KEY,  # type: ignore[arg-type]
        "Accept": "application/json",
        "Prefer": "return=representation",
    }
    params = {"user_id": f"eq.{user_id}"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.delete(REST_CHATBOTS, params=params, headers=headers)
    if r.status_code not in (200, 204):
        raise HTTPException(status_code=502, detail=f"Supabase delete failed {r.status_code}")
    deleted = len(r.json()) if r.content and r.headers.get("content-type", "").startswith("application/json") else 0
    return {"deleted": deleted}


OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_SITE_URL = os.getenv("OPENROUTER_SITE_URL", os.getenv("VERCEL_URL", "https://tu-bot.vercel.app"))
OPENROUTER_APP_TITLE = os.getenv("OPENROUTER_APP_TITLE", "TuBot")


@app.post("/api/chat")
async def chat_completion(body: ChatInput):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="Missing OPENROUTER_API_KEY env var")

    model = body.model or "mistralai/mistral-7b-instruct"
    sys = body.instructions or "Responde en español, claro y corto."
    messages = [
        {"role": "system", "content": sys},
        {"role": "user", "content": body.message},
    ]

    url = f"{OPENROUTER_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        # Recommended by OpenRouter for attribution
        "HTTP-Referer": str(OPENROUTER_SITE_URL),
        "X-Title": OPENROUTER_APP_TITLE,
    }
    payload = {"model": model, "messages": messages}

    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(url, headers=headers, json=payload)
    if r.status_code != 200:
        try:
            err = r.json()
        except Exception:
            err = {"error": r.text}
        raise HTTPException(status_code=502, detail={"openrouter": err, "status": r.status_code})

    data = r.json()
    reply = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "Lo siento, no pude generar una respuesta.")
    )
    return {"reply": reply}
