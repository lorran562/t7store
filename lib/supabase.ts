import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL  || "https://pfmtwfkfdtytlwvqggce.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmbXR3ZmtmZHR5dGx3dnFnZ2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MDIxMTYsImV4cCI6MjA4OTk3ODExNn0.tsEkJRa2KAW-pUCg_cZ4zJApKIiS0siK2xOvpo5-br0";

export const supabase = createClient(url, key);

export type ProductVariation = {
  id: number;
  product_id: number;
  color: string;
  size: string;
  stock: number;
  price: number | null;
  image_url: string;
  created_at: string;
  updated_at: string;
};

export type VariationForm = {
  tempId: string;
  color: string;
  size: string;
  stock: number;
  price: string;
  image_url: string;
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
  variations?: ProductVariation[];
};

export type CartItem = {
  uid: number;
  product_id: number;
  variation_id: number | null;
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

export function getSizes(type: string): string[] {
  return type === "tenis" ? SHOE_SIZES : SHIRT_SIZES;
}

export function isTenis(type: string): boolean {
  return type === "tenis";
}

export function getColors(variations: ProductVariation[]): string[] {
  return Array.from(new Set(variations.map(v => v.color).filter(Boolean)));
}

export function findVariation(
  variations: ProductVariation[],
  color: string,
  size: string
): ProductVariation | undefined {
  return variations.find(v => {
    const colorMatch = color ? v.color === color : true;
    return colorMatch && v.size === size;
  });
}

export function effectivePrice(product: Product, variation?: ProductVariation | null): number {
  return variation?.price ?? product.price;
}

export function effectiveImage(product: Product, variation?: ProductVariation | null): string {
  return (variation?.image_url) || product.image_url;
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
