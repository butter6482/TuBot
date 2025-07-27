import os
import httpx
from dotenv import load_dotenv
from fastapi import HTTPException
from typing import Optional, Dict

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY")

headers = {
    "apikey": SUPABASE_API_KEY,
    "Authorization": f"Bearer {SUPABASE_API_KEY}",
    "Content-Type": "application/json"
}

async def get_current_user(credentials: HTTPAuthorizationCredentials) -> Dict:
    """Verifica el token JWT con Supabase y devuelve los datos del usuario"""
    token = credentials.credentials
    if not token:
        raise HTTPException(status_code=401, detail="Token no proporcionado")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={"Authorization": f"Bearer {token}"}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Token inválido")
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al verificar el token")

async def register_user(email: str, password: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SUPABASE_URL}/auth/v1/signup",
                headers=headers,
                json={"email": email, "password": password}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail=response.json().get("message", "Error en registro"))
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def login_user(email: str, password: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
                headers=headers,
                json={"email": email, "password": password}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Credenciales inválidas")
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def create_chatbot(user_id: str, name: str, description: str = ""):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/chatbots",
                headers=headers,
                json={
                    "user_id": user_id,
                    "name": name,
                    "description": description
                }
            )
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))