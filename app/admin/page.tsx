"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { products as initialProducts, fmt } from "@/lib/data";

type Badge = "sale" | "new" | "retro" | null;
type Category = "nacional" | "internacional" | "selecao" | "retro";

type Product = {
  id: number;
  emoji: string;
  club: string;
  name: string;
  meta: string;
  price: number;
  oldPrice: number | null;
  badge: Badge;
  category: Category;
  active: boolean;
  imageUrl: string;
};

const EMPTY: Omit<Product, "id"> = {
  emoji: "⚽", club: "", name: "", meta: "", price: 0,
  oldPrice: null, badge: null, category: "nacional", active: true, imageUrl: "",
};

const STORAGE_KEY = "t7_admin_products";

function load(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return initialProducts.map((p, i) => ({
    id: i + 1,
    emoji: p.emoji,
    club: p.club,
    name: p.name,
    meta: p.meta,
    price: p.price,
    oldPrice: p.oldPrice,
    badge: p.badge,
    category: p.category,
    active: true,
    imageUrl: "",
  }));
}

function save(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"list" | "edit">("list");

  useEffect(() => { setProducts(load()); }, []);

  const persist = (prods: Product[]) => { setProducts(prods); save(prods); };

  const startNew = () => {
    const id = Math.max(0, ...products.map(p => p.id)) + 1;
    setEditing({ id, ...EMPTY });
    setIsNew(true);
    setTab("edit");
  };

  const startEdit = (p: Product) => { setEditing({ ...p }); setIsNew(false); setTab("edit"); };

  const saveEdit = () => {
    if (!editing) return;
    if (!editing.club || !editing.name || !editing.price) return;
    const updated = isNew
      ? [...products, editing]
      : products.map(p => p.id === editing.id ? editing : p);
    persist(updated);
    setTab("list");
    setEditing(null);
  };

  const deleteProduct = (id: number) => {
    if (!confirm("Excluir produto?")) return;
    persist(products.filter(p => p.id !== id));
  };

  const toggleActive = (id: number) => {
    persist(products.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const exportDataTs = () => {
    const active = products.filter(p => p.active);
    const lines = active.map(p => `  { id: ${p.id}, emoji: "${p.emoji}", club: "${p.club}", name: "${p.name}", meta: "${p.meta}", price: ${p.price}, oldPrice: ${p.oldPrice ?? "null"}, badge: ${p.badge ? `"${p.badge}"` : "null"}, category: "${p.category}" },`).join("\n");
    const content = `export type Category = "todos" | "nacional" | "internacional" | "selecao" | "retro";
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
${lines}
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
`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.ts";
    a.click();
    URL.revokeObjectURL(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inp = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "0.88rem", outline: "none" };
  const lbl = { display: "block" as const, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "1px", textTransform: "uppercase" as const, color: "rgba(245,245,245,0.45)", marginBottom: "6px" };

  const badgeColor: Record<string, string> = { sale: "#e03c3c", new: "#12b83a", retro: "#f5c800" };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "2px", color: "#fff" }}>
            {tab === "list" ? "PRODUTOS" : isNew ? "NOVO PRODUTO" : "EDITAR PRODUTO"}
          </h1>
          <p style={{ color: "rgba(245,245,245,0.4)", fontSize: "0.85rem" }}>
            {tab === "list" ? `${products.length} produtos · ${products.filter(p => p.active).length} ativos` : "Preencha e salve"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {tab === "list" ? (
            <>
              <button onClick={startNew}
                style={{ background: "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", borderRadius: "10px", padding: "11px 22px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.9rem", letterSpacing: "1px", color: "#fff", cursor: "pointer" }}>
                + Novo Produto
              </button>
              <button onClick={exportDataTs}
                style={{ background: saved ? "rgba(18,184,58,0.2)" : "rgba(245,200,0,0.15)", border: `1px solid ${saved ? "#12b83a" : "#f5c800"}`, borderRadius: "10px", padding: "11px 22px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.9rem", letterSpacing: "1px", color: saved ? "#12b83a" : "#f5c800", cursor: "pointer" }}>
                {saved ? "✅ BAIXADO!" : "⬇️ EXPORTAR data.ts"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setTab("list"); setEditing(null); }}
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "11px 22px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#fff", cursor: "pointer" }}>
                ← Cancelar
              </button>
              <button onClick={saveEdit}
                style={{ background: "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", borderRadius: "10px", padding: "11px 22px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.9rem", letterSpacing: "1px", color: "#fff", cursor: "pointer" }}>
                💾 SALVAR
              </button>
            </>
          )}
        </div>
      </div>

      {/* Aviso exportar */}
      {tab === "list" && (
        <div style={{ background: "rgba(245,200,0,0.08)", border: "1px solid rgba(245,200,0,0.25)", borderRadius: "12px", padding: "14px 18px", marginBottom: "24px", fontSize: "0.85rem", color: "rgba(245,200,0,0.9)", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.2rem" }}>💡</span>
          <span>Após configurar os produtos, clique em <strong>EXPORTAR data.ts</strong> → baixe o arquivo → suba no GitHub em <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px" }}>lib/data.ts</code> → o site atualiza automaticamente.</span>
        </div>
      )}

      {/* Lista */}
      {tab === "list" && (
        <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 120px 110px 80px 80px 90px", padding: "10px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
            {["", "Produto", "Categoria", "Preço", "Badge", "Status", "Ações"].map(h => (
              <div key={h} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(245,245,245,0.35)" }}>{h}</div>
            ))}
          </div>

          {products.length === 0 && (
            <div style={{ padding: "48px", textAlign: "center", color: "rgba(245,245,245,0.3)" }}>Nenhum produto. Clique em "+ Novo Produto"</div>
          )}

          {products.map((p, i) => (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "48px 1fr 120px 110px 80px 80px 90px", padding: "12px 18px", alignItems: "center", borderBottom: i < products.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", opacity: p.active ? 1 : 0.4 }}>
              <div style={{ fontSize: "1.6rem" }}>{p.emoji}</div>
              <div>
                <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.88rem" }}>{p.club}</div>
                <div style={{ fontSize: "0.73rem", color: "rgba(245,245,245,0.38)" }}>{p.name}</div>
              </div>
              <div style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.5)", textTransform: "capitalize" }}>{p.category}</div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "var(--yellow)" }}>R$ {fmt(p.price)}</div>
                {p.oldPrice && <div style={{ fontSize: "0.7rem", color: "rgba(245,245,245,0.28)", textDecoration: "line-through" }}>R$ {fmt(p.oldPrice)}</div>}
              </div>
              <div>
                {p.badge
                  ? <span style={{ padding: "3px 9px", borderRadius: "20px", background: `${badgeColor[p.badge]}22`, color: badgeColor[p.badge], fontSize: "0.7rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>{p.badge}</span>
                  : <span style={{ color: "rgba(245,245,245,0.18)", fontSize: "0.8rem" }}>—</span>}
              </div>
              <div>
                <button onClick={() => toggleActive(p.id)}
                  style={{ padding: "4px 10px", borderRadius: "20px", border: "none", background: p.active ? "rgba(18,184,58,0.2)" : "rgba(255,255,255,0.07)", color: p.active ? "#12b83a" : "rgba(245,245,245,0.35)", fontSize: "0.7rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, cursor: "pointer" }}>
                  {p.active ? "ATIVO" : "OCULTO"}
                </button>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => startEdit(p)}
                  style={{ padding: "5px 10px", borderRadius: "7px", background: "rgba(0,87,183,0.2)", border: "1px solid rgba(0,87,183,0.3)", color: "#6baed6", fontSize: "0.8rem", cursor: "pointer" }}>✏️</button>
                <button onClick={() => deleteProduct(p.id)}
                  style={{ padding: "5px 10px", borderRadius: "7px", background: "rgba(224,60,60,0.15)", border: "1px solid rgba(224,60,60,0.3)", color: "#ff6b6b", fontSize: "0.8rem", cursor: "pointer" }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulário edição */}
      {tab === "edit" && editing && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "18px" }}>INFORMAÇÕES</div>
              <div style={{ display: "grid", gap: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 72px", gap: "12px" }}>
                  <div><label style={lbl}>Clube *</label><input style={inp} value={editing.club} onChange={e => setEditing({ ...editing, club: e.target.value })} placeholder="Ex: Flamengo" /></div>
                  <div><label style={lbl}>Emoji</label><input style={inp} value={editing.emoji} onChange={e => setEditing({ ...editing, emoji: e.target.value })} /></div>
                </div>
                <div><label style={lbl}>Nome *</label><input style={inp} value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Ex: Camisa Oficial I 24/25" /></div>
                <div><label style={lbl}>Meta</label><input style={inp} value={editing.meta} onChange={e => setEditing({ ...editing, meta: e.target.value })} placeholder="Ex: Home · Adidas · 2024/25" /></div>
              </div>
            </div>

            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "18px" }}>PREÇO</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div><label style={lbl}>Preço *</label><input style={inp} type="number" step="0.01" min="0" value={editing.price || ""} onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} placeholder="189.90" /></div>
                <div><label style={lbl}>Preço antigo</label><input style={inp} type="number" step="0.01" min="0" value={editing.oldPrice || ""} onChange={e => setEditing({ ...editing, oldPrice: parseFloat(e.target.value) || null })} placeholder="239.90" /></div>
              </div>
            </div>

            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "18px" }}>CATEGORIA E BADGE</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={lbl}>Categoria *</label>
                  <select style={{ ...inp, cursor: "pointer" }} value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value as Category })}>
                    <option value="nacional">Nacionais</option>
                    <option value="internacional">Internacionais</option>
                    <option value="selecao">Seleções</option>
                    <option value="retro">Retrô</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Badge</label>
                  <select style={{ ...inp, cursor: "pointer" }} value={editing.badge || ""} onChange={e => setEditing({ ...editing, badge: (e.target.value || null) as Badge })}>
                    <option value="">Sem badge</option>
                    <option value="new">Novo</option>
                    <option value="sale">Oferta</option>
                    <option value="retro">Retrô</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "16px" }}>STATUS</div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }} onClick={() => setEditing({ ...editing, active: !editing.active })}>
                <div style={{ width: "48px", height: "26px", borderRadius: "13px", background: editing.active ? "var(--green)" : "rgba(255,255,255,0.1)", position: "relative", transition: "background .2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: "3px", left: editing.active ? "24px" : "3px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
                </div>
                <span style={{ color: editing.active ? "#fff" : "rgba(245,245,245,0.4)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
                  {editing.active ? "Ativo no site" : "Oculto no site"}
                </span>
              </div>
            </div>

            {(!editing.club || !editing.name || !editing.price) && (
              <div style={{ background: "rgba(224,60,60,0.1)", border: "1px solid rgba(224,60,60,0.3)", borderRadius: "10px", padding: "12px 16px", fontSize: "0.82rem", color: "#ff6b6b" }}>
                Preencha clube, nome e preço
              </div>
            )}

            <button onClick={saveEdit} disabled={!editing.club || !editing.name || !editing.price}
              style={{ background: (!editing.club || !editing.name || !editing.price) ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", borderRadius: "12px", padding: "16px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", color: "#fff", cursor: "pointer", boxShadow: "0 4px 20px rgba(10,140,42,0.3)" }}>
              💾 SALVAR PRODUTO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
