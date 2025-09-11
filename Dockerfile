# ===== Stage 1: build del frontend =====
FROM node:18-alpine AS fe
WORKDIR /fe
COPY chatbot-saas-frontend/Frontend/package*.json ./
RUN npm ci || npm install
COPY chatbot-saas-frontend/Frontend ./
RUN npm run build

# ===== Stage 2: backend + nginx + supervisor =====
FROM python:3.11-slim AS be
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends nginx supervisor ca-certificates && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY chatbot-saas-backend ./chatbot-saas-backend
COPY --from=fe /fe/dist /usr/share/nginx/html

RUN rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf || true
COPY deploy/nginx.conf /etc/nginx/conf.d/app.conf
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

ENV PORT=8080
EXPOSE 8080

CMD ["/usr/bin/supervisord","-c","/etc/supervisor/conf.d/supervisord.conf"]
