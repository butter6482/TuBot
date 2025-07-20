# app/routes/chatbot.py
from fastapi import APIRouter
from pydantic import BaseModel
import os
import requests
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError("❌ OPENROUTER_API_KEY no está cargada. Verifica tu archivo .env.")

class ChatRequest(BaseModel):
    messages: list
    instructions: str

def generar_respuesta(messages: list, instrucciones: str) -> str:
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",  # Cambia si tu app va online
        "X-Title": "TuBot"
    }

    if instrucciones:
        messages = [{"role": "system", "content": instrucciones}] + messages

    data = {
        "model": "openai/gpt-3.5-turbo",  # Puedes cambiar el modelo si usas otro
        "messages": messages
    }

    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]

@router.post("/message")
async def chatbot_message_route(data: ChatRequest):
    respuesta = generar_respuesta(data.messages, data.instructions)
    return {"reply": respuesta}
