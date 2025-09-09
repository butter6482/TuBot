export async function sendMessage(message: string) {
  const res = await fetch(`/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as { reply: string };
}

// Backward-compatible alias some components may expect
export const sendMessageToBot = sendMessage;
