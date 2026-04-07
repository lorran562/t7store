import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DbProduct = {
  id: number;
  club: string;
  name: string;
  meta: string;
  price: number;
  old_price: number | null;
  badge: "sale" | "new" | "retro" | null;
  category: "nacional" | "internacional" | "selecao" | "retro";
  image_url: string | null;
  emoji: string;
  active: boolean;
  stock: number;
  created_at: string;
  updated_at: string;
};

export type DbOrder = {
  id: number;
  items: Array<{ club: string; name: string; size: string; price: number; emoji: string }>;
  total: number;
  customer_name: string | null;
  customer_phone: string | null;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  notes: string | null;
  created_at: string;
};
