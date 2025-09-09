TuBot – Plataforma SaaS para crear chatbots personalizados

Estado: MVP funcional • Frontend: React + Vite + Tailwind • Backend: FastAPI • Auth/DB: Supabase • LLM: OpenRouter

¿Qué es TuBot?

TuBot es una plataforma tipo SaaS que permite a cualquier persona crear un chatbot personalizado con su propio nombre y personalidad. El objetivo es que profesores, negocios o creadores puedan tener un bot que responda en su estilo.

Features (MVP)

Autenticación con Supabase (email/password).

Chatbot por usuario (el último bot creado reemplaza al anterior).

LLM vía OpenRouter (modelo configurable; por defecto Mistral).

Backend FastAPI con endpoint /message y persistencia de configuración del bot.

Base de datos Supabase con tabla chatbots.

Frontend React + Vite + Tailwind con UI tipo ChatGPT.

Estructura del proyecto
