from fastapi import FastAPI, APIRouter, HTTPException, status, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field
from typing import List, Optional, Any
import os
import httpx
from dotenv import load_dotenv, find_dotenv
import uuid
import logging

# Carga variables de entorno (robusta)
load_dotenv(find_dotenv())

# === Config y logging
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    logging.warning("OPENROUTER_API_KEY no está definido. /chat y /chatbot/message fallarán hasta configurarlo.")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializa FastAPI
app = FastAPI(title="TuBot Backend")

# Log de entorno en startup (sin secretos)
logger.info({
    "env_ok": {
        "PERSISTENT_BOTS": os.getenv("PERSISTENT_BOTS"),
        "SUPABASE_URL": bool(os.getenv("SUPABASE_URL")),
        "SUPABASE_ANON_KEY": bool(os.getenv("SUPABASE_ANON_KEY")),
        "OPENROUTER_API_KEY": bool(os.getenv("OPENROUTER_API_KEY")),
    }
})

# CORS (dev: 5173 Vite, 3000 vercel dev; prod: tu dominio vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://tu-bot.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cliente HTTP async
client = httpx.AsyncClient(timeout=30.0)

# ----- Modelos -----
class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(system|user|assistant)$")
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    instructions: str = Field(default="", max_length=1000)
    model: str = Field(default="mistralai/mistral-7b-instruct")

class ChatResponse(BaseModel):
    reply: str
    model_used: str
    tokens_used: Optional[int] = None

class SimpleChatIn(BaseModel):
    message: str
    model: Optional[str] = "mistralai/mistral-7b-instruct"
    instructions: Optional[str] = ""

# ----- Helper común -----
async def call_openrouter(messages: List[dict], instructions: str, model: str) -> ChatResponse:
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="Falta OPENROUTER_API_KEY en variables de entorno.")
    try:
        payload = {
            "model": model,
            "messages": ([{"role": "system", "content": instructions}] if instructions else []) + messages,
            "temperature": 0.7,
            "max_tokens": 1000,
        }
        r = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://tuapp.com",
                "X-Title": "TuBot",
            },
            json=payload,
        )
        r.raise_for_status()
        data = r.json()
        return ChatResponse(
            reply=data["choices"][0]["message"]["content"],
            model_used=model,
            tokens_used=data.get("usage", {}).get("total_tokens"),
        )
    except httpx.HTTPStatusError as e:
        logger.error(f"Error HTTP OpenRouter: {e.response.text}")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Error en servicio IA: {e.response.text}")
    except Exception as e:
        logger.exception("Error inesperado")
        raise HTTPException(status_code=500, detail="Error interno procesando tu solicitud")

# ----- Rutas base / salud / favicon -----
@app.get("/", include_in_schema=False)
def root():
    return {"ok": True, "service": "tubot-backend", "routes": ["/api/health", "/chatbot/message", "/api/chat"]}

@app.get("/api/health")
def health():
    return {"ok": True}

# Diagnóstico simple
@app.get("/api/_diag", include_in_schema=False)
async def diag():
    info = {
        "persistent_bots": PERSISTENT_BOTS,
        "supabase_url": bool(SUPABASE_URL),
        "anon_key": bool(SUPABASE_ANON_KEY),
    }
    if PERSISTENT_BOTS and SUPABASE_URL and SUPABASE_ANON_KEY:
        try:
            r = await client.get(f"{SUPABASE_URL}/rest/v1", headers={"apikey": SUPABASE_ANON_KEY}, timeout=5.0)
            info["supabase_rest_v1"] = {"status": r.status_code}
        except Exception as e:
            info["supabase_rest_v1"] = {"error": str(e)}
    return info

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    # Evita 404 de favicon cuando pruebas en navegador
    return Response(status_code=204)

# ----- Router original -----
router = APIRouter(prefix="/chatbot", tags=["chatbot"])

@router.post("/message", response_model=ChatResponse)
async def chatbot_message(data: ChatRequest):
    logger.info(f"Petición recibida para modelo: {data.model}")
    messages = [m.dict() for m in data.messages]
    return await call_openrouter(messages=messages, instructions=data.instructions, model=data.model)

app.include_router(router)

# ----- Alias simple: /api/chat con {message} -----
@app.post("/api/chat", response_model=ChatResponse)
async def chat_simple(body: SimpleChatIn):
    # Convierte {message, instructions?, model?} a la forma estándar
    messages = [{"role": "user", "content": body.message}]
    return await call_openrouter(messages=messages, instructions=body.instructions or "", model=body.model or "mistralai/mistral-7b-instruct")

# Cerrar cliente al apagar
@app.on_event("shutdown")
async def shutdown_event():
    await client.aclose()

# ---------------------- BOT endpoints (per-user via Supabase) ----------------------
# Feature flag to enable/disable persistent bots via env
PERSISTENT_BOTS = os.getenv("PERSISTENT_BOTS", "false").lower() == "true"

# Env for Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")
AUTH_USER = f"{SUPABASE_URL}/auth/v1/user" if SUPABASE_URL else None
REST_CHATBOTS = f"{SUPABASE_URL}/rest/v1/chatbots" if SUPABASE_URL else None

class BotInput(BaseModel):
    name: str
    description: Optional[str] = ""
    config: Optional[dict[str, Any]] = None

async def get_user_id_from_token(token: str) -> str:
    if not SUPABASE_URL or not SUPABASE_ANON_KEY or not AUTH_USER:
        raise HTTPException(status_code=500, detail="Missing Supabase env vars")
    headers = {"Authorization": f"Bearer {token}", "apikey": SUPABASE_ANON_KEY}
    try:
        r = await client.get(AUTH_USER, headers=headers, timeout=10.0)
    except Exception as e:
        logger.error({"op": "supabase", "call": "auth_user", "error": str(e)})
        raise HTTPException(status_code=502, detail="Supabase auth request failed")
    if r.status_code != 200:
        body = r.text[:100]
        logger.error({"op": "supabase", "call": "auth_user", "status": r.status_code, "body": body})
        raise HTTPException(status_code=401, detail="Invalid auth token")
    uid = r.json().get("id")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid auth token")
    return uid

if not PERSISTENT_BOTS:
    @app.api_route("/api/bot", methods=["GET", "POST", "DELETE"])
    async def bots_disabled():
        raise HTTPException(status_code=410, detail="Bots persistentes deshabilitados")
else:
    @app.get("/api/bot")
    async def get_bot(Authorization: Optional[str] = Header(default=None), request: Request = None):
        rid = uuid.uuid4().hex[:8]
        if Authorization is None or not Authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing Authorization header")
        token = Authorization.split(" ", 1)[1]
        user_id = await get_user_id_from_token(token)
        if not REST_CHATBOTS:
            raise HTTPException(status_code=500, detail="Missing Supabase env vars")
        params = {"select": "*", "user_id": f"eq.{user_id}", "order": "created_at.desc", "limit": 1}
        headers = {"Authorization": f"Bearer {token}", "apikey": SUPABASE_ANON_KEY, "Accept": "application/json"}
        try:
            r = await client.get(REST_CHATBOTS, params=params, headers=headers, timeout=10.0)
        except Exception as e:
            logger.error({"rid": rid, "op": "supabase", "call": "select_latest_bot", "error": str(e)})
            raise HTTPException(status_code=502, detail="Supabase request failed")
        if r.status_code not in (200, 206):
            body = r.text[:100]
            logger.error({"rid": rid, "op": "supabase", "status": r.status_code, "body": body})
            raise HTTPException(status_code=502, detail={"supabase": r.status_code, "body": body})
        rows = r.json()
        bot = rows[0] if rows else None
        return {"bot": bot}

    @app.post("/api/bot")
    async def upsert_bot(body: BotInput, Authorization: Optional[str] = Header(default=None), request: Request = None):
        rid = uuid.uuid4().hex[:8]
        if Authorization is None or not Authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing Authorization header")
        token = Authorization.split(" ", 1)[1]
        user_id = await get_user_id_from_token(token)
        if not REST_CHATBOTS:
            raise HTTPException(status_code=500, detail="Missing Supabase env vars")
        base_headers = {
            "Authorization": f"Bearer {token}",
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Prefer": "return=representation",
        }
        params = {"select": "id", "user_id": f"eq.{user_id}", "order": "created_at.desc", "limit": 1}
        try:
            r = await client.get(REST_CHATBOTS, params=params, headers=base_headers, timeout=10.0)
        except Exception as e:
            logger.error({"rid": rid, "op": "supabase", "call": "select_latest_bot", "error": str(e)})
            raise HTTPException(status_code=502, detail="Supabase request failed")
        if r.status_code not in (200, 206):
            body_txt = r.text[:100]
            logger.error({"rid": rid, "op": "supabase", "status": r.status_code, "body": body_txt})
            raise HTTPException(status_code=502, detail={"supabase": r.status_code, "body": body_txt})
        rows = r.json()
        payload = {"name": body.name, "description": body.description or "", "config": body.config or {}}
        if rows:
            bot_id = rows[0]["id"]
            try:
                r2 = await client.patch(REST_CHATBOTS, params={"id": f"eq.{bot_id}"}, headers=base_headers, json=payload, timeout=10.0)
            except Exception as e:
                logger.error({"rid": rid, "op": "supabase", "call": "patch_bot", "error": str(e)})
                raise HTTPException(status_code=502, detail="Supabase request failed")
        else:
            payload_with_user = {"user_id": user_id, **payload}
            try:
                r2 = await client.post(REST_CHATBOTS, headers=base_headers, json=payload_with_user, timeout=10.0)
            except Exception as e:
                logger.error({"rid": rid, "op": "supabase", "call": "insert_bot", "error": str(e)})
                raise HTTPException(status_code=502, detail="Supabase request failed")
        if r2.status_code not in (200, 201):
            body_txt = r2.text[:100]
            logger.error({"rid": rid, "op": "supabase", "call": "upsert", "status": r2.status_code, "body": body_txt})
            raise HTTPException(status_code=502, detail={"supabase": r2.status_code, "body": body_txt})
        data = r2.json()
        bot = data[0] if isinstance(data, list) else data
        return {"bot": bot}

    @app.delete("/api/bot")
    async def delete_bots(Authorization: Optional[str] = Header(default=None), request: Request = None):
        rid = uuid.uuid4().hex[:8]
        if Authorization is None or not Authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing Authorization header")
        token = Authorization.split(" ", 1)[1]
        user_id = await get_user_id_from_token(token)
        if not REST_CHATBOTS:
            raise HTTPException(status_code=500, detail="Missing Supabase env vars")
        headers = {"Authorization": f"Bearer {token}", "apikey": SUPABASE_ANON_KEY, "Accept": "application/json", "Prefer": "return=representation"}
        params = {"user_id": f"eq.{user_id}"}
        try:
            r = await client.delete(REST_CHATBOTS, params=params, headers=headers, timeout=10.0)
        except Exception as e:
            logger.error({"rid": rid, "op": "supabase", "call": "delete_bot", "error": str(e)})
            raise HTTPException(status_code=502, detail="Supabase request failed")
        if r.status_code not in (200, 204):
            body_txt = r.text[:100]
            logger.error({"rid": rid, "op": "supabase", "status": r.status_code, "body": body_txt})
            raise HTTPException(status_code=502, detail={"supabase": r.status_code, "body": body_txt})
        deleted = len(r.json()) if r.content and r.headers.get("content-type", "").startswith("application/json") else 0
        return {"deleted": deleted}

# Opcional: endpoint para ver el usuario actual contra Supabase
@app.get("/api/_me", include_in_schema=False)
async def me(Authorization: Optional[str] = Header(default=None)):
    if Authorization is None or not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = Authorization.split(" ", 1)[1]
    if not AUTH_USER or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=500, detail="Missing Supabase env vars")
    headers = {"Authorization": f"Bearer {token}", "apikey": SUPABASE_ANON_KEY}
    r = await client.get(AUTH_USER, headers=headers, timeout=10.0)
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid auth token")
    data = r.json()
    return {"id": data.get("id"), "email": data.get("email")}
