export type Category = "todos" | "nacional" | "internacional" | "selecao" | "retro";
export type Badge = "sale" | "new" | "retro" | null;

export interface Product {
  id: number;
  emoji: string;
  club: string;
  name: string;
  meta: string;
  price: number;
  oldPrice: number | null;
  badge: Badge;
  category: Exclude<Category, "todos">;
}

export interface CartItem extends Product {
  size: string;
  uid: number;
}

export const products: Product[] = [
  { id: 1, emoji: "⚽", club: "brasil", name: "camisa do brasil azul", meta: "25/26", price: 189, oldPrice: null, badge: null, category: "nacional" },
];

export function fmt(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

export const SIZES = ["PP", "P", "M", "G", "GG", "XGG"] as const;
export const CATEGORIES: { label: string; value: Category }[] = [
  { label: "Todos", value: "todos" },
  { label: "Nacionais", value: "nacional" },
  { label: "Internacionais", value: "internacional" },
  { label: "Seleções", value: "selecao" },
  { label: "Retrô", value: "retro" },
];
