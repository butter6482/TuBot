# app/main.py
from fastapi import FastAPI
from app.routes import chatbot  # ✅ solo funciona si app/routes/chatbot.py existe

app = FastAPI(title="TuBot API", version="1.0.0")

@app.get("/")
def read_root():
    return {"status": "API funcionando", "endpoints": ["POST /chatbot/message"]}

# ✅ Incluimos el router con etiquetas para que aparezca bien en los docs
app.include_router(
    chatbot.router,
    prefix="/chatbot",
    tags=["Chatbot"]
)
