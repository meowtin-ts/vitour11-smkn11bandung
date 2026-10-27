import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "./info";

// Singleton instance to avoid multiple GoTrueClient instances
const supabaseInstance = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export function getSupabaseClient() {
  return supabaseInstance;
}
