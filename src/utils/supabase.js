import dotenv from "dotenv";
dotenv.config(); 

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("❌ Supabase env vars missing", {
    SUPABASE_URL,
    ANON_KEY: ANON_KEY ? "loaded" : "missing",
  });
}
