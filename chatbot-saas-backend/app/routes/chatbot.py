from fastapi import APIRouter, Depends, HTTPException
from app.models import ChatRequest, ChatResponse, ChatbotConfig
from app.openrouter_client import OpenRouterClient
from app.supabase_client import supabase
from app.supabase_client import get_current_user

from uuid import uuid4

router = APIRouter()


# ✅ Enviar mensaje al bot
@router.post("/message", response_model=ChatResponse)
async def chatbot_message(
    request: ChatRequest,
    openrouter: OpenRouterClient = Depends(OpenRouterClient)
):
    try:
        response = await openrouter.chat(
            messages=request.messages,
            model=request.model,
            temperature=request.temperature
        )
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del servidor: {str(e)}"
        )


# ✅ Crear un nuevo bot, ligado al usuario autenticado
@router.post("/create", status_code=201)
async def create_chatbot(
    config: ChatbotConfig,
    user=Depends(get_current_user)
):
    try:
        new_bot = {
            "id": str(uuid4()),
            "user_id": user["id"],
            "name": config.name,
            "instructions": config.instructions or "",
            "description": config.description or "",
            "color": config.color or "#00ffff"
        }

        data = supabase.table("chatbots").insert(new_bot).execute()

        if data.error:
            raise HTTPException(status_code=400, detail=data.error.message)

        return {"message": "Chatbot creado exitosamente", "bot": data.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear chatbot: {str(e)}")


# ✅ Listar solo los bots del usuario autenticado
@router.get("/list", status_code=200)
async def list_chatbots(user=Depends(get_current_user)):
    try:
        user_id = user["id"]
        bots = supabase.table("chatbots").select("*").eq("user_id", user_id).execute()

        if bots.error:
            raise HTTPException(status_code=400, detail=bots.error.message)

        return bots.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener bots: {str(e)}")
