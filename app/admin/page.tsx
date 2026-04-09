"use client";
import { useState, useEffect } from "react";
import { supabase, Product, fmt, CATEGORIES, getSizes } from "@/lib/supabase";

type FormState = {
  club: string; name: string; meta: string; description: string;
  price: string; old_price: string; badge: string;
  category: string; emoji: string; active: boolean; stock: string;
  sizes: string[];
};

const EMPTY: FormState = {
  club: "", name: "", meta: "", description: "", price: "", old_price: "",
  badge: "", category: "nacional", emoji: "⚽", active: true, stock: "10", sizes: [],
};

const badgeColor: Record<string, string> = { sale: "#e03c3c", new: "#12b83a", retro: "#f5c800" };

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<"list" | "edit">("list");
  const [isNew, setIsNew] = useState(false);
  const [editing, setEditing] = useState<FormState & { id?: number }>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = () => {
    supabase.from("products").select("*").order("category").order("id").then(({ data }) => setProducts(data || []));
  };
  useEffect(load, []);

  const startNew = () => {
    setEditing({ ...EMPTY });
    setIsNew(true);
    setTab("edit");
    setError("");
  };

  const startEdit = (p: Product) => {
    setEditing({
      id: p.id, club: p.club, name: p.name, meta: p.meta,
      description: p.description || "", price: String(p.price),
      old_price: p.old_price ? String(p.old_price) : "",
      badge: p.badge || "", category: p.category, emoji: p.emoji,
      active: p.active, stock: String(p.stock),
      sizes: p.sizes || getSizes(p.category),
    });
    setIsNew(false);
    setTab("edit");
    setError("");
  };

  const saveEdit = async () => {
    if (!editing.club || !editing.name || !editing.price) { setError("Preencha clube, nome e preço."); return; }
    setSaving(true); setError("");
    const payload = {
      club: editing.club.trim(), name: editing.name.trim(), meta: editing.meta.trim(),
      description: editing.description.trim(),
      price: parseFloat(editing.price),
      old_price: editing.old_price ? parseFloat(editing.old_price) : null,
      badge: editing.badge || null, category: editing.category,
      emoji: editing.emoji || "⚽", active: editing.active,
      stock: parseInt(editing.stock) || 0,
      sizes: editing.sizes.length ? editing.sizes : getSizes(editing.category),
    };
    try {
      if (isNew) {
        await supabase.from("products").insert([payload]);
      } else {
        await supabase.from("products").update(payload).eq("id", editing.id!);
      }
      load();
      setTab("list");
    } catch (e: any) {
      setError(e.message);
    }
    setSaving(false);
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Excluir produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  const toggleActive = async (id: number, active: boolean) => {
    await supabase.from("products").update({ active: !active }).eq("id", id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !active } : p));
  };

  const filtered = products.filter(p =>
    p.club.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const inp: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "0.88rem", outline: "none" };
  const lbl: React.CSSProperties = { display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "1px", textTransform: "uppercase", color: "rgba(245,245,245,0.45)", marginBottom: "6px" };

  // Toggle size
  const toggleSize = (size: string) => {
    setEditing(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "2px", color: "#fff" }}>
            {tab === "list" ? "PRODUTOS" : isNew ? "NOVO PRODUTO" : "EDITAR PRODUTO"}
          </h1>
          <p style={{ color: "rgba(245,245,245,0.4)", fontSize: "0.85rem" }}>
            {tab === "list" ? `${products.length} produtos · ${products.filter(p => p.active).length} ativos` : "Preencha e salve"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {tab === "list" ? (
            <button onClick={startNew} style={{ background: "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", borderRadius: "10px", padding: "11px 22px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.9rem", letterSpacing: "1px", color: "#fff", cursor: "pointer" }}>
              + Novo Produto
            </button>
          ) : (
            <>
              <button onClick={() => { setTab("list"); setError(""); }} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "11px 22px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#fff", cursor: "pointer" }}>
                ← Cancelar
              </button>
              <button onClick={saveEdit} disabled={saving} style={{ background: saving ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", borderRadius: "10px", padding: "11px 22px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.9rem", color: "#fff", cursor: "pointer" }}>
                {saving ? "SALVANDO..." : "💾 SALVAR"}
              </button>
            </>
          )}
        </div>
      </div>

      {tab === "list" && (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por clube, nome ou categoria..."
            style={{ ...inp, maxWidth: "400px", marginBottom: "20px" }} />

          <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 110px 110px 80px 80px 90px", padding: "10px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              {["", "Produto", "Categoria", "Preço", "Badge", "Status", "Ações"].map(h => (
                <div key={h} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(245,245,245,0.35)" }}>{h}</div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div style={{ padding: "48px", textAlign: "center", color: "rgba(245,245,245,0.3)" }}>Nenhum produto encontrado</div>
            )}
            {filtered.map((p, i) => (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "48px 1fr 110px 110px 80px 80px 90px", padding: "12px 18px", alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", opacity: p.active ? 1 : 0.4 }}>
                <div style={{ fontSize: "1.6rem" }}>{p.emoji}</div>
                <div>
                  <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.88rem" }}>{p.club}</div>
                  <div style={{ fontSize: "0.73rem", color: "rgba(245,245,245,0.38)" }}>{p.name}</div>
                </div>
                <div style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.5)", textTransform: "capitalize" }}>{p.category}</div>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "var(--yellow)" }}>R$ {fmt(p.price)}</div>
                  {p.old_price && <div style={{ fontSize: "0.7rem", color: "rgba(245,245,245,0.28)", textDecoration: "line-through" }}>R$ {fmt(p.old_price)}</div>}
                </div>
                <div>
                  {p.badge
                    ? <span style={{ padding: "3px 9px", borderRadius: "20px", background: `${badgeColor[p.badge]}22`, color: badgeColor[p.badge], fontSize: "0.7rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>{p.badge}</span>
                    : <span style={{ color: "rgba(245,245,245,0.18)", fontSize: "0.8rem" }}>—</span>}
                </div>
                <div>
                  <button onClick={() => toggleActive(p.id, p.active)}
                    style={{ padding: "4px 10px", borderRadius: "20px", border: "none", background: p.active ? "rgba(18,184,58,0.2)" : "rgba(255,255,255,0.07)", color: p.active ? "#12b83a" : "rgba(245,245,245,0.35)", fontSize: "0.7rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, cursor: "pointer" }}>
                    {p.active ? "ATIVO" : "OCULTO"}
                  </button>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => startEdit(p)} style={{ padding: "5px 10px", borderRadius: "7px", background: "rgba(0,87,183,0.2)", border: "1px solid rgba(0,87,183,0.3)", color: "#6baed6", fontSize: "0.8rem", cursor: "pointer" }}>✏️</button>
                  <button onClick={() => deleteProduct(p.id)} style={{ padding: "5px 10px", borderRadius: "7px", background: "rgba(224,60,60,0.15)", border: "1px solid rgba(224,60,60,0.3)", color: "#ff6b6b", fontSize: "0.8rem", cursor: "pointer" }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "edit" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "18px" }}>INFORMAÇÕES</div>
              <div style={{ display: "grid", gap: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 72px", gap: "12px" }}>
                  <div><label style={lbl}>Clube / Marca *</label><input style={inp} value={editing.club} onChange={e => setEditing(p => ({ ...p, club: e.target.value }))} placeholder="Ex: Flamengo, Nike" /></div>
                  <div><label style={lbl}>Emoji</label><input style={inp} value={editing.emoji} onChange={e => setEditing(p => ({ ...p, emoji: e.target.value }))} /></div>
                </div>
                <div><label style={lbl}>Nome *</label><input style={inp} value={editing.name} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Camisa Oficial I 24/25" /></div>
                <div><label style={lbl}>Meta (subtítulo)</label><input style={inp} value={editing.meta} onChange={e => setEditing(p => ({ ...p, meta: e.target.value }))} placeholder="Ex: Home · Adidas · 2024/25" /></div>
                <div><label style={lbl}>Descrição</label><textarea style={{ ...inp, minHeight: "80px", resize: "vertical" } as React.CSSProperties} value={editing.description} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} placeholder="Descreva o produto..." /></div>
              </div>
            </div>

            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "18px" }}>PREÇO E ESTOQUE</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div><label style={lbl}>Preço *</label><input style={inp} type="number" step="0.01" min="0" value={editing.price} onChange={e => setEditing(p => ({ ...p, price: e.target.value }))} placeholder="189.90" /></div>
                <div><label style={lbl}>Preço antigo</label><input style={inp} type="number" step="0.01" min="0" value={editing.old_price} onChange={e => setEditing(p => ({ ...p, old_price: e.target.value }))} placeholder="239.90" /></div>
                <div><label style={lbl}>Estoque</label><input style={inp} type="number" min="0" value={editing.stock} onChange={e => setEditing(p => ({ ...p, stock: e.target.value }))} /></div>
              </div>
            </div>

            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "18px" }}>CATEGORIA, BADGE E TAMANHOS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div>
                  <label style={lbl}>Categoria *</label>
                  <select style={{ ...inp, cursor: "pointer" }} value={editing.category}
                    onChange={e => {
                      const cat = e.target.value;
                      setEditing(p => ({ ...p, category: cat, sizes: getSizes(cat), emoji: cat === "tenis" ? "👟" : "⚽" }));
                    }}>
                    <option value="nacional">Nacionais</option>
                    <option value="internacional">Internacionais</option>
                    <option value="selecao">Seleções</option>
                    <option value="retro">Retrô</option>
                    <option value="tenis">👟 Tênis</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Badge</label>
                  <select style={{ ...inp, cursor: "pointer" }} value={editing.badge} onChange={e => setEditing(p => ({ ...p, badge: e.target.value }))}>
                    <option value="">Sem badge</option>
                    <option value="new">🟢 Novo</option>
                    <option value="sale">🔴 Oferta</option>
                    <option value="retro">🟡 Retrô</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={lbl}>Tamanhos disponíveis</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {getSizes(editing.category).map(size => (
                    <button key={size} type="button" onClick={() => toggleSize(size)}
                      style={{ background: editing.sizes.includes(size) ? "var(--green)" : "rgba(255,255,255,0.05)", border: `1px solid ${editing.sizes.includes(size) ? "var(--green)" : "rgba(255,255,255,0.15)"}`, color: editing.sizes.includes(size) ? "#fff" : "rgba(245,245,245,0.6)", padding: "6px 14px", borderRadius: "6px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "16px" }}>STATUS</div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }} onClick={() => setEditing(p => ({ ...p, active: !p.active }))}>
                <div style={{ width: "48px", height: "26px", borderRadius: "13px", background: editing.active ? "var(--green)" : "rgba(255,255,255,0.1)", position: "relative", transition: "background .2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: "3px", left: editing.active ? "24px" : "3px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
                </div>
                <span style={{ color: editing.active ? "#fff" : "rgba(245,245,245,0.4)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
                  {editing.active ? "Ativo no site" : "Oculto no site"}
                </span>
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(224,60,60,0.1)", border: "1px solid rgba(224,60,60,0.3)", borderRadius: "10px", padding: "12px 16px", fontSize: "0.82rem", color: "#ff6b6b" }}>
                {error}
              </div>
            )}

            <button onClick={saveEdit} disabled={saving || !editing.club || !editing.name || !editing.price}
              style={{ background: (!editing.club || !editing.name || !editing.price) ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", borderRadius: "12px", padding: "16px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", color: "#fff", cursor: "pointer" }}>
              {saving ? "SALVANDO..." : "💾 SALVAR PRODUTO"}
            </button>

            <div style={{ background: "rgba(245,200,0,0.08)", border: "1px solid rgba(245,200,0,0.2)", borderRadius: "10px", padding: "12px 14px", fontSize: "0.78rem", color: "rgba(245,200,0,0.8)" }}>
              💡 Produto salvo automaticamente no Supabase — aparece no site em segundos.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
