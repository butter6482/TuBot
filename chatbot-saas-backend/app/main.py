from fastapi import FastAPI, APIRouter, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import os
import httpx
import logging

# ========= Config =========
# Pon aquí tu dominio real de Vercel (¡sin slash final!)
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://tu-bot.vercel.app")

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# ========= App =========
app = FastAPI(title="TuBot API")

# CORS:
# - allow_origins: dominios exactos (prod + dev local)
# - allow_origin_regex: previews de Vercel (*.vercel.app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tubot")

# ========= Modelos =========
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

# ========= HTTP client (ciclo de vida) =========
client: httpx.AsyncClient | None = None

@app.on_event("startup")
async def _startup():
    global client
    client = httpx.AsyncClient(timeout=httpx.Timeout(30.0))

@app.on_event("shutdown")
async def _shutdown():
    global client
    if client is not None:
        await client.aclose()
        client = None

# ========= Rutas =========
@router.post("/message", response_model=ChatResponse)
async def chatbot_message(data: ChatRequest):
    """
    Envía mensajes a OpenRouter y devuelve la respuesta.
    """
    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OPENROUTER_API_KEY no está configurada en el servidor."
        )

    assert client is not None, "HTTP client no inicializado"

    try:
        logger.info(f"Petición para modelo: {data.model}")

        payload = {
            "model": data.model,
            "messages": (
                [{"role": "system", "content": data.instructions}]
                + [m.dict() for m in data.messages]
            ),
            "temperature": 0.7,
            "max_tokens": 1000,
        }

        resp = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                # OpenRouter recomienda referer + title para métricas/permit-list
                "HTTP-Referer": FRONTEND_URL,
                "X-Title": "TuBot",
            },
            json=payload,
        )
        resp.raise_for_status()
        j = resp.json()

        return ChatResponse(
            reply=j["choices"][0]["message"]["content"],
            model_used=data.model,
            tokens_used=j.get("usage", {}).get("total_tokens"),
        )

    except httpx.HTTPStatusError as e:
        logger.error(f"Error HTTP {e.response.status_code}: {e.response.text}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error en el servicio de IA: {e.response.text}",
        )
    except Exception as e:
        logger.exception("Error inesperado procesando la solicitud")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno procesando tu solicitud",
        )

app.include_router(router)

@app.get("/health")
def health():
    return {"status": "ok"}
