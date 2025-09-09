TuBot – SaaS platform to create personalized chatbots 🤖

Status: MVP • Frontend: React + Vite + Tailwind 🎨 • Backend: FastAPI ⚡ • Auth/DB: Supabase 🗄️ • LLM: OpenRouter 🧠

What is TuBot? 💡

TuBot is a SaaS platform that allows anyone to create a personalized chatbot with their own name and personality. The goal is for teachers, businesses, or creators to have a bot that answers in their own style.

Features (MVP) ✨

🔐 Authentication with Supabase (email/password).

👤 One chatbot per user (the last created bot replaces the previous one).

🤖 LLM via OpenRouter (configurable model; default Mistral).

⚙️ FastAPI backend with /message endpoint and bot configuration persistence.

🗄️ Supabase database with chatbots table.

💻 React + Vite + Tailwind frontend with ChatGPT‑style interface.

