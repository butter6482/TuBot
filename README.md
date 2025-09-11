# TuBot — SaaS platform to create personalized chatbots 🤖

https://tubot-6tuf.onrender.com

**TuBot** lets anyone create a chatbot with their **own name, personality, and instructions** so it replies in their style. It’s built for teachers, businesses, and creators who want a simple, fast conversational experience.

## What’s included
- 🔐 **Authentication with Supabase** (email/password).
- 🤖 **Chat via OpenRouter** (configurable model; default *mistralai/mistral-7b-instruct*).
- 🧠 **Session-only bot** (not persisted by default).  
- ⚡ **FastAPI backend** with endpoints `/api/health` and `/api/chat` (and `/api/bot` if persistence is enabled).
- 🎨 **React + Vite + Tailwind** frontend with a chat-style UI.
- 🐳 **Single Docker container deployment** (Nginx serves the SPA and proxies to Uvicorn/FastAPI).

## Stack
- **Frontend:** React + Vite + Tailwind  
- **Backend:** FastAPI (Uvicorn)  
- **Auth/DB:** Supabase 
- **LLM:** OpenRouter  
- **Infra:** Docker

## How it works (flow)
1. Sign in.
2. Create your bot by entering a name and instructions (it’s kept for the session).
3. Chat and tweak tone/model as you like.
