from fastapi import FastAPI, APIRouter, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import logging
from app.openrouter_client import OpenRouterClient

# Inicializar FastAPI
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializar Router y Cliente
router = APIRouter(prefix="/chatbot", tags=["chatbot"])
client = OpenRouterClient()

# Modelos
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

# Endpoint principal
@router.post("/message", response_model=ChatResponse)
async def chatbot_message_route(data: ChatRequest):
    try:
        logger.info(f"Petición recibida para modelo: {data.model}")
        response_data = await client.chat(
            messages=[m.dict() for m in data.messages],
            model=data.model,
            instructions=data.instructions
        )
        return {
            "reply": response_data["choices"][0]["message"]["content"],
            "model_used": data.model,
            "tokens_used": response_data.get("usage", {}).get("total_tokens")
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error inesperado: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno en el servidor")

# Registrar router
app.include_router(router)
