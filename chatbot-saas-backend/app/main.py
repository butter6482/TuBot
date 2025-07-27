from fastapi import FastAPI, APIRouter, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import os
import httpx
from dotenv import load_dotenv
import logging

# Carga variables de entorno
load_dotenv()

# Inicializa FastAPI
app = FastAPI()

# Configura CORS (permite conexión desde frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Ajusta según tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router para endpoints de chatbot
router = APIRouter(prefix="/chatbot", tags=["chatbot"])

# Configura logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Modelos Pydantic
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
    tokens_used: Optional[int] = None  # ¡Corregido! (antes tenía 'to')

# Cliente HTTP async
client = httpx.AsyncClient(timeout=30.0)

# Endpoint principal
@router.post("/message", response_model=ChatResponse)
async def chatbot_message(data: ChatRequest):
    """Envía mensajes a OpenRouter y devuelve la respuesta"""
    try:
        logger.info(f"Petición recibida para modelo: {data.model}")

        # Llamada a la API de OpenRouter
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://tuapp.com",  # Opcional: para estadísticas
                "X-Title": "TuBot"  # Opcional: nombre de tu app
            },
            json={
                "model": data.model,
                "messages": [{"role": "system", "content": data.instructions}] + [m.dict() for m in data.messages],
                "temperature": 0.7,
                "max_tokens": 1000
            }
        )
        response.raise_for_status()
        response_data = response.json()

        return {
            "reply": response_data["choices"][0]["message"]["content"],
            "model_used": data.model,
            "tokens_used": response_data.get("usage", {}).get("total_tokens")
        }

    except httpx.HTTPStatusError as e:
        logger.error(f"Error HTTP: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error en el servicio de IA: {e.response.text}"
        )
    except Exception as e:
        logger.error(f"Error inesperado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno procesando tu solicitud"
        )

# Incluye el router en la app
app.include_router(router)

# Cierra el cliente HTTP al apagar la app
@app.on_event("shutdown")
async def shutdown_event():
    await client.aclose()