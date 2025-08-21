from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Dict, Any
from datetime import datetime

# ===== Chat (petición/respuesta IA) =====
class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    instructions: str = Field(default="", max_length=1000)
    model: str = Field(default="mistralai/mistral-7b-instruct")
    temperature: float = Field(default=0.7, ge=0, le=1)

class ChatResponse(BaseModel):
    reply: str
    model_used: str
    tokens_used: Optional[int] = None

# ===== Configuración del bot (SIN user_id; lo saca el backend del JWT) =====
class ChatbotConfig(BaseModel):
    name: str = Field(..., max_length=50)
    description: Optional[str] = Field(default="", max_length=500)
    instructions: Optional[str] = Field(default="", max_length=1000)
    color: Optional[str] = Field(default="#00ffff", max_length=16)
    temperature: Optional[float] = Field(default=0.7, ge=0, le=1)

# ===== (Opcional) Modelos DB / mensajes =====
class ChatbotDB(BaseModel):
    id: str
    user_id: str
    name: str
    description: str
    config: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

class MessageCreate(BaseModel):
    bot_id: str
    role: Literal["user", "assistant", "system"]
    content: str

class MessageDB(BaseModel):
    id: str
    bot_id: str
    user_id: str
    role: Literal["user", "assistant", "system"]
    content: str
    created_at: datetime
