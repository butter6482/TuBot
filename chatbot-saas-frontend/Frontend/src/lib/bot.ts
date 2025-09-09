import { supabase } from "./supabase";

export type Bot = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  config: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");
  return token;
}

export async function getMyBot(): Promise<Bot | null> {
  const token = await getAccessToken();
  const res = await fetch("/api/bot", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { bot: Bot | null };
  return data.bot ?? null;
}

export async function createOrUpdateBot(input: {
  name: string;
  description?: string;
  config?: Record<string, any>;
}): Promise<Bot> {
  const token = await getAccessToken();
  const res = await fetch("/api/bot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { bot: Bot };
  return data.bot;
}

export async function deleteMyBot(): Promise<number> {
  const token = await getAccessToken();
  const res = await fetch("/api/bot", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { deleted: number };
  return data.deleted ?? 0;
}

