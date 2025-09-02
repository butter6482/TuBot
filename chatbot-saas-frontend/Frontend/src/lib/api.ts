export async function sendMessage(message: string) {
  const API = import.meta.env.VITE_API_URL!; // https://tubot.onrender.com en Vercel

  const res = await fetch(`${API}/chatbot/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: message }],
      instructions: "Responde en español, claro y corto.",
      model: "mistralai/mistral-7b-instruct"
    })
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<{ reply: string }>;
}
