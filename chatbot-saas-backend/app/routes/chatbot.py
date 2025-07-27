from fastapi import APIRouter, Depends, HTTPException
from ..models import ChatRequest, ChatResponse
from ..openrouter import OpenRouterClient

router = APIRouter()

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