from pydantic import BaseModel

class UserData(BaseModel):
    user_id: str
    name: str
    description: str
    instructions: str
    temperature: float

class ChatbotConfig(BaseModel):
    user_id: str
    name: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    temperature: Optional[float] = 0.7