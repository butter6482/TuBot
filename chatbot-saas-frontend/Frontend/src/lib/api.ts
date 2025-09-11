type MsgObj = { message: string; instructions?: string; model?: string };
type MsgOpts = { instructions?: string; model?: string };

export async function sendMessage(a: string | MsgObj, b?: MsgOpts) {
  const payload: MsgObj =
    typeof a === "string" ? { message: a, ...(b || {}) } : { ...a };

  // Fallback: usar bot efímero guardado en Session Storage
  try {
    if (typeof window !== "undefined") {
      const raw = window.sessionStorage.getItem("tubot.session.bot");
      if (raw) {
        const bot = JSON.parse(raw) as {
          instructions?: string;
          personality?: string;
          model?: string;
        };
        const botInstructions = bot.instructions || bot.personality;
        if (!payload.instructions && botInstructions) payload.instructions = botInstructions;
        if (!payload.model && bot.model) payload.model = bot.model;
      }
    }
  } catch {}

  const res = await fetch(`/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as {
    reply: string;
    model_used?: string;
    tokens_used?: number;
  };
}

export const sendMessageToBot = sendMessage;
