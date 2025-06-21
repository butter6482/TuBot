from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.supabase_client import register_user, login_user
from app.models import UserData
import httpx
import os

app = FastAPI()

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo para login y registro
class AuthRequest(BaseModel):
    email: str
    password: str

@app.get("/")
def root():
    return {"message": "TuBot backend funcionando"}

@app.post("/register")
async def register(auth: AuthRequest):
    return await register_user(auth.email, auth.password)

@app.post("/login")
async def login(auth: AuthRequest):
    return await login_user(auth.email, auth.password)

@app.post("/save-data")
async def save_data(data: UserData):
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY")

    headers = {
        "apikey": SUPABASE_API_KEY,
        "Authorization": f"Bearer {SUPABASE_API_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SUPABASE_URL}/rest/v1/user_data",
            headers=headers,
            json={
                "user_id": data.user_id,
                "content": data.content
            }
        )
        return response.json()
