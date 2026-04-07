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
  { id: 1,  emoji: "🔴", club: "Flamengo",           name: "Camisa Oficial I 24/25",   meta: "Home · Adidas",       price: 189.90, oldPrice: 239.90, badge: "sale",  category: "nacional"      },
  { id: 2,  emoji: "⚫", club: "Corinthians",         name: "Camisa Oficial III 24/25", meta: "Third · Nike",        price: 179.90, oldPrice: null,   badge: "new",   category: "nacional"      },
  { id: 3,  emoji: "🔵", club: "Cruzeiro",            name: "Camisa Oficial I 24/25",   meta: "Home · Adidas",       price: 169.90, oldPrice: null,   badge: null,    category: "nacional"      },
  { id: 4,  emoji: "🟢", club: "Palmeiras",           name: "Camisa Oficial I 24/25",   meta: "Home · Puma",         price: 175.90, oldPrice: null,   badge: null,    category: "nacional"      },
  { id: 5,  emoji: "⚽", club: "São Paulo FC",        name: "Camisa Oficial I 24/25",   meta: "Home · Under Armour", price: 159.90, oldPrice: null,   badge: null,    category: "nacional"      },
  { id: 6,  emoji: "🇧🇷", club: "Seleção Brasileira", name: "Camisa Oficial I 24/25",   meta: "Home · Nike",         price: 329.90, oldPrice: 399.90, badge: "sale",  category: "selecao"       },
  { id: 7,  emoji: "🇦🇷", club: "Argentina",          name: "Camisa Oficial I 24/25",   meta: "Home · Adidas",       price: 299.90, oldPrice: null,   badge: null,    category: "selecao"       },
  { id: 8,  emoji: "🔴", club: "Real Madrid",         name: "Camisa Oficial I 24/25",   meta: "Home · Adidas",       price: 299.90, oldPrice: 349.90, badge: "sale",  category: "internacional" },
  { id: 9,  emoji: "🔵", club: "Barcelona",           name: "Camisa Oficial I 24/25",   meta: "Home · Nike",         price: 289.90, oldPrice: null,   badge: "new",   category: "internacional" },
  { id: 10, emoji: "🔵", club: "Manchester City",     name: "Camisa Oficial I 24/25",   meta: "Home · Puma",         price: 289.90, oldPrice: 319.90, badge: "sale",  category: "internacional" },
  { id: 11, emoji: "⚫", club: "Juventus",            name: "Camisa Oficial I 24/25",   meta: "Home · Adidas",       price: 279.90, oldPrice: null,   badge: "new",   category: "internacional" },
  { id: 12, emoji: "🟡", club: "Palmeiras",           name: "Camisa Retrô 1993",        meta: "Edição Especial",     price: 149.90, oldPrice: 199.90, badge: "retro", category: "retro"         },
  { id: 13, emoji: "🟢", club: "Chapecoense",         name: "Camisa Retrô 2016",        meta: "Edição Memorial",     price: 139.90, oldPrice: null,   badge: "retro", category: "retro"         },
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
