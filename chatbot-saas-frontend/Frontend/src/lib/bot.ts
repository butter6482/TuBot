// Frontend/src/lib/bot.ts
// Implementación EFÍMERA en el cliente (sessionStorage). No toca backend.
// Mantiene la misma API para no romper componentes que la usaban.

export type Bot = {
  id?: string;
  name: string;
  description?: string;
  config?: any;
  model?: string;
};

const KEY = "tubot.session.bot";

export async function getMyBot(): Promise<{ bot: Bot | null }> {
  if (typeof window === "undefined") return { bot: null };
  const raw = window.sessionStorage.getItem(KEY);
  return { bot: raw ? (JSON.parse(raw) as Bot) : null };
}

export async function createOrUpdateBot(input: Bot): Promise<{ bot: Bot }> {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(KEY, JSON.stringify(input));
  }
  return { bot: input };
}

export async function deleteMyBot(): Promise<{ deleted: number }> {
  if (typeof window === "undefined") return { deleted: 0 };
  const existed = !!window.sessionStorage.getItem(KEY);
  window.sessionStorage.removeItem(KEY);
  return { deleted: existed ? 1 : 0 };
}
