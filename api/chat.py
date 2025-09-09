import os
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional


app = FastAPI()


class ChatInput(BaseModel):
    message: str
    model: Optional[str] = None
    instructions: Optional[str] = None


OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_SITE_URL = os.getenv("OPENROUTER_SITE_URL", os.getenv("VERCEL_URL", "https://tu-bot.vercel.app"))
OPENROUTER_APP_TITLE = os.getenv("OPENROUTER_APP_TITLE", "TuBot")


@app.post("/")
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

