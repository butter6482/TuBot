from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def health():
    return {"ok": True, "service": "tubot", "env": "vercel"}

