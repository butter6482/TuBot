import { supabase } from "./supabase";
import { deleteMyBot } from "./bot";

export async function signOutAndCleanup(): Promise<void> {
  try {
    // Try to delete user's bots before signing out
    await deleteMyBot().catch((err) => {
      // Non-fatal: log and continue to sign out
      console.warn("deleteMyBot failed:", err);
    });
  } finally {
    await supabase.auth.signOut();
  }
}

