import { supabase } from "./supabase";

export async function sendMessage(
  message: string,
  opts?: { model?: string; instructions?: string }
) {
  // Prefer a direct backend URL if provided (local dev or external server),
  // otherwise use the unified serverless route under /api/chat.
  const directBase =
    (import.meta as any).env?.VITE_BACKEND_URL ||
    (import.meta as any).env?.VITE_API_BASE;

  // Optional Supabase bearer for serverless API that reads user config
  let authHeader: Record<string, string> = {};
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) authHeader = { Authorization: `Bearer ${token}` };
  } catch {}

  const isDirect = typeof directBase === "string" && directBase.length > 0;

  const url = isDirect
    ? `${directBase.replace(/\/$/, "")}/chatbot/message`
    : `/api/chat`;

  const body = isDirect
    ? // Backend FastAPI (chatbot-saas-backend/app/main.py)
      {
        model: opts?.model ?? "mistralai/mistral-7b-instruct",
        instructions: opts?.instructions ?? "",
        messages: [{ role: "user", content: message }],
      }
    : // Vercel serverless route (api/index.py)
      {
        message,
        model: opts?.model,
        instructions: opts?.instructions,
      };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as { reply: string; model_used?: string; tokens_used?: number };
}

// Backward-compatible alias some components may expect
export const sendMessageToBot = sendMessage;
