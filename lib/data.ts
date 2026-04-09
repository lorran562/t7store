export type Category = "todos" | "nacional" | "internacional" | "selecao" | "retro" | "tenis";
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
  // NACIONAIS
  { id: 1,  emoji: "⚽", club: "Flamengo",   name: "Camisa I 24/25",        meta: "Home · Adidas · 2024/25",        price: 189.90, oldPrice: 239.90, badge: "sale",  category: "nacional"       },
  { id: 2,  emoji: "⚽", club: "Corinthians", name: "Camisa I 24/25",        meta: "Home · Nike · 2024/25",          price: 179.90, oldPrice: null,   badge: "new",   category: "nacional"       },
  { id: 3,  emoji: "⚽", club: "Palmeiras",   name: "Camisa I 24/25",        meta: "Home · Puma · 2024/25",          price: 179.90, oldPrice: null,   badge: null,    category: "nacional"       },
  { id: 4,  emoji: "⚽", club: "São Paulo",   name: "Camisa I 24/25",        meta: "Home · Adidas · 2024/25",        price: 169.90, oldPrice: 199.90, badge: "sale",  category: "nacional"       },
  // INTERNACIONAIS
  { id: 5,  emoji: "⚽", club: "Real Madrid", name: "Camisa I 24/25",        meta: "Home · Adidas · 2024/25",        price: 199.90, oldPrice: 249.90, badge: "sale",  category: "internacional"  },
  { id: 6,  emoji: "⚽", club: "Barcelona",   name: "Camisa I 24/25",        meta: "Home · Nike · 2024/25",          price: 199.90, oldPrice: null,   badge: "new",   category: "internacional"  },
  { id: 7,  emoji: "⚽", club: "PSG",         name: "Camisa I 24/25",        meta: "Home · Nike · 2024/25",          price: 189.90, oldPrice: null,   badge: null,    category: "internacional"  },
  { id: 8,  emoji: "⚽", club: "Manchester City", name: "Camisa I 24/25",   meta: "Home · Puma · 2024/25",          price: 189.90, oldPrice: 229.90, badge: "sale",  category: "internacional"  },
  // SELEÇÕES
  { id: 9,  emoji: "⚽", club: "Brasil",      name: "Camisa I 24/25",        meta: "Home · Nike · 2024/25",          price: 209.90, oldPrice: null,   badge: "new",   category: "selecao"        },
  { id: 10, emoji: "⚽", club: "Argentina",   name: "Camisa I 24/25",        meta: "Home · Adidas · 2024/25",        price: 199.90, oldPrice: 239.90, badge: "sale",  category: "selecao"        },
  { id: 11, emoji: "⚽", club: "França",      name: "Camisa I 24/25",        meta: "Home · Nike · 2024/25",          price: 189.90, oldPrice: null,   badge: null,    category: "selecao"        },
  { id: 12, emoji: "⚽", club: "Portugal",    name: "Camisa I 24/25",        meta: "Home · Nike · 2024/25",          price: 189.90, oldPrice: null,   badge: null,    category: "selecao"        },
  // RETRÔ
  { id: 13, emoji: "⚽", club: "Flamengo",    name: "Camisa Retrô 1981",     meta: "Retrô · 1981",                   price: 149.90, oldPrice: 179.90, badge: "retro", category: "retro"          },
  { id: 14, emoji: "⚽", club: "Brasil",      name: "Camisa Retrô 1970",     meta: "Retrô Copa do Mundo · 1970",     price: 159.90, oldPrice: null,   badge: "retro", category: "retro"          },
  { id: 15, emoji: "⚽", club: "São Paulo",   name: "Camisa Retrô 1992",     meta: "Retrô Libertadores · 1992",      price: 149.90, oldPrice: null,   badge: "retro", category: "retro"          },
  // TÊNIS
  { id: 16, emoji: "👟", club: "Nike",        name: "Air Max 90 Futebol",    meta: "Nike · Masculino · 38-44",       price: 299.90, oldPrice: 399.90, badge: "sale",  category: "tenis"          },
  { id: 17, emoji: "👟", club: "Adidas",      name: "Predator Precision",    meta: "Adidas · Masculino · 38-44",     price: 279.90, oldPrice: null,   badge: "new",   category: "tenis"          },
  { id: 18, emoji: "👟", club: "Puma",        name: "King Top Futebol",      meta: "Puma · Masculino · 38-44",       price: 249.90, oldPrice: 299.90, badge: "sale",  category: "tenis"          },
  { id: 19, emoji: "👟", club: "Nike",        name: "Mercurial Vapor",       meta: "Nike · Masculino · 38-44",       price: 319.90, oldPrice: null,   badge: "new",   category: "tenis"          },
  { id: 20, emoji: "👟", club: "Adidas",      name: "Copa Mundial",          meta: "Adidas · Unissex · 36-44",       price: 259.90, oldPrice: 319.90, badge: "sale",  category: "tenis"          },
  { id: 21, emoji: "👟", club: "New Balance", name: "442 Pro Futebol",       meta: "New Balance · Masculino · 38-44",price: 239.90, oldPrice: null,   badge: null,    category: "tenis"          },
  { id: 22, emoji: "👟", club: "Nike",        name: "Tiempo Legend 10",      meta: "Nike · Masculino · 38-44",       price: 289.90, oldPrice: 349.90, badge: "sale",  category: "tenis"          },
  { id: 23, emoji: "👟", club: "Adidas",      name: "X Speedportal",         meta: "Adidas · Masculino · 38-44",     price: 269.90, oldPrice: null,   badge: "new",   category: "tenis"          },
];

export function fmt(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

export const SIZES = ["PP", "P", "M", "G", "GG", "XGG"] as const;
export const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44"] as const;

export const CATEGORIES: { label: string; value: Category }[] = [
  { label: "Todos",            value: "todos"         },
  { label: "Nacionais",        value: "nacional"      },
  { label: "Internacionais",   value: "internacional" },
  { label: "Seleções",         value: "selecao"       },
  { label: "Retrô",            value: "retro"         },
  { label: "👟 Tênis",         value: "tenis"         },
];
