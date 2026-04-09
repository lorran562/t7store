import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pfmtwfkfdtytlwvqggce.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmbXR3ZmtmZHR5dGx3dnFnZ2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MDIxMTYsImV4cCI6MjA4OTk3ODExNn0.tsEkJRa2KAW-pUCg_cZ4zJApKIiS0siK2xOvpo5-br0";

export const supabase = createClient(url, key);

export type Product = {
  id: number;
  club: string;
  name: string;
  meta: string;
  description: string;
  price: number;
  old_price: number | null;
  badge: "sale" | "new" | "retro" | null;
  category: "nacional" | "internacional" | "selecao" | "retro" | "tenis";
  image_url: string;
  active: boolean;
  stock: number;
  sizes: string[];
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: number;
  items: Array<{ club: string; name: string; size: string; price: number; image_url?: string }>;
  total: number;
  customer_name: string | null;
  customer_phone: string | null;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  notes: string | null;
  created_at: string;
};

export type CartItem = Product & { size: string; uid: number };

export function fmt(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

export type Category = "todos" | "nacional" | "internacional" | "selecao" | "retro" | "tenis";

export const CATEGORIES: { label: string; value: Category }[] = [
  { label: "Todos",          value: "todos"         },
  { label: "Nacionais",      value: "nacional"      },
  { label: "Internacionais", value: "internacional" },
  { label: "Seleções",       value: "selecao"       },
  { label: "Retrô",          value: "retro"         },
  { label: "👟 Tênis",       value: "tenis"         },
];

export const SHIRT_SIZES = ["PP", "P", "M", "G", "GG", "XGG"];
export const SHOE_SIZES  = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

export function getSizes(category: string): string[] {
  return category === "tenis" ? SHOE_SIZES : SHIRT_SIZES;
}

export function isTenis(category: string): boolean {
  return category === "tenis";
}

// Upload de imagem para o storage do Supabase
export async function uploadProductImage(file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return null;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
