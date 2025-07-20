# app/supabase_client.py
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY")

headers = {
    "apikey": SUPABASE_API_KEY,
    "Authorization": f"Bearer {SUPABASE_API_KEY}",
    "Content-Type": "application/json"
}

async def create_chatbot(user_id: str, name: str, description: str = ""):
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
async def register_user(email: str, password: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SUPABASE_URL}/auth/v1/signup",
            headers=headers,
            json={"email": email, "password": password}
        )
        return response.json()

async def login_user(email: str, password: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers=headers,
            json={"email": email, "password": password}
        )
        return response.json()
