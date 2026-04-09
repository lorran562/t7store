import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || url === "https://placeholder.supabase.co") {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL não configurada no Vercel!");
}
if (!key || key === "placeholder") {
  console.error("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada no Vercel!");
}

export const supabaseServer = createClient(
  url || "https://pfmtwfkfdtytlwvqggce.supabase.co",
  key || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmbXR3ZmtmZHR5dGx3dnFnZ2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MDIxMTYsImV4cCI6MjA4OTk3ODExNn0.tsEkJRa2KAW-pUCg_cZ4zJApKIiS0siK2xOvpo5-br0"
);
