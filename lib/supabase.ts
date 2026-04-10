import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL  || "https://pfmtwfkfdtytlwvqggce.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmbXR3ZmtmZHR5dGx3dnFnZ2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MDIxMTYsImV4cCI6MjA4OTk3ODExNn0.tsEkJRa2KAW-pUCg_cZ4zJApKIiS0siK2xOvpo5-br0";

export const supabase = createClient(url, key);

// ─── Tipos de dado ────────────────────────────────────────────────────────────

export type SizeStock = { size: string; stock: number };

export type ColorGroup = {
  id: number;
  product_id: number;
  color: string;       // "" = produto sem cor específica
  image_url: string;   // imagem desta cor
  sizes: SizeStock[];  // [{size:"M", stock:10}, ...]
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// Formulário de um grupo de cor (usado no admin — sem IDs gerados)
export type ColorGroupForm = {
  tempId: string;
  color: string;
  image_url: string;
  sizes: { tempId: string; size: string; stock: number }[];
};

export type Product = {
  id: number;
  club: string;
  brand: string;
  name: string;
  meta: string;
  description: string;
  type: "camisa" | "tenis";
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
  // Joined
  colorGroups?: ColorGroup[];
};

export type CartItem = {
  uid: number;
  product_id: number;
  color_group_id: number | null;
  club: string;
  brand: string;
  name: string;
  category: string;
  type: string;
  color: string;
  size: string;
  price: number;
  image_url: string;
  qty: number;
};

export type Order = {
  id: number;
  items: Array<{ club: string; name: string; color: string; size: string; price: number; qty: number }>;
  total: number;
  customer_name: string | null;
  customer_phone: string | null;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  notes: string | null;
  created_at: string;
};

// ─── Utilitários ─────────────────────────────────────────────────────────────

export function fmt(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

export type Category = "todos" | "nacional" | "internacional" | "selecao";

export const CATEGORIES: { label: string; value: Category }[] = [
  { label: "Todos",          value: "todos"         },
  { label: "Nacionais",      value: "nacional"      },
  { label: "Internacionais", value: "internacional" },
  { label: "Seleções",       value: "selecao"       },
];

export const SHIRT_SIZES = ["PP", "P", "M", "G", "GG", "XGG"];
export const SHOE_SIZES  = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

export function getSizes(type: string): string[] {
  return type === "tenis" ? SHOE_SIZES : SHIRT_SIZES;
}

export function isTenis(type: string): boolean {
  return type === "tenis";
}

// Retorna imagem efetiva: do grupo de cor ou do produto pai
export function effectiveImage(product: Product, group?: ColorGroup | null): string {
  return group?.image_url || product.image_url;
}

// Estoque total de um produto (soma de todos os grupos)
export function totalStock(groups: ColorGroup[]): number {
  return groups.reduce((s, g) => s + g.sizes.reduce((ss, x) => ss + x.stock, 0), 0);
}

export async function uploadProductImage(file: File): Promise<string | null> {
  const ext  = file.name.split(".").pop() || "jpg";
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return null;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

// Helper para criar ID temporário
export function tmpId(): string {
  return Math.random().toString(36).slice(2);
}
