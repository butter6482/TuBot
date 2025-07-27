from pydantic import BaseModel, Field
from typing import Optional

class UserData(BaseModel):
    user_id: str = Field(..., min_length=3)
    name: str = Field(..., max_length=50)
    description: str = Field(default="", max_length=500)
    instructions: str = Field(default="")
    temperature: float = Field(default=0.7, ge=0, le=1)

class ChatbotConfig(BaseModel):
    user_id: str
    name: str = Field(..., max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    instructions: Optional[str] = Field(None, max_length=1000)
    temperature: Optional[float] = Field(0.7, ge=0, le=1)

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user123",
                "name": "Mi Chatbot",
                "temperature": 0.5
            }
        }