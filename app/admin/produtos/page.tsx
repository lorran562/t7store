"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, DbProduct } from "@/lib/supabase";

export default function AdminProdutos() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("id");
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (id: number, active: boolean) => {
    await supabase.from("products").update({ active: !active }).eq("id", id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !active } : p));
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const filtered = products.filter(p =>
    p.club.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const badgeStyle: Record<string, { bg: string; color: string }> = {
    sale:  { bg: "rgba(224,60,60,0.15)",   color: "#ff6b6b" },
    new:   { bg: "rgba(18,184,58,0.15)",   color: "#12b83a" },
    retro: { bg: "rgba(245,200,0,0.15)",   color: "#f5c800" },
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem",
        color: "rgba(245,245,245,0.3)", letterSpacing: "3px" }}>CARREGANDO...</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem",
            letterSpacing: "2px", color: "#fff", marginBottom: "4px" }}>PRODUTOS</h1>
          <p style={{ color: "rgba(245,245,245,0.45)", fontSize: "0.9rem" }}>
            {products.length} produtos · {products.filter(p => p.active).length} ativos
          </p>
        </div>
        <Link href="/admin/produtos/novo"
          style={{ background: "linear-gradient(135deg,#0a8c2a,#12b83a)", color: "#fff",
            padding: "12px 24px", borderRadius: "10px", textDecoration: "none",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
            fontSize: "0.95rem", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "8px" }}>
          ➕ Novo Produto
        </Link>
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por clube ou nome..."
        style={{ width: "100%", maxWidth: "400px", background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px",
          padding: "12px 16px", color: "#fff", fontSize: "0.9rem", outline: "none",
          marginBottom: "24px" }} />

      {/* Tabela */}
      <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ display: "grid",
          gridTemplateColumns: "60px 1fr 1fr 100px 90px 80px 120px",
          gap: "0", padding: "12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.02)" }}>
          {["Foto", "Clube / Nome", "Categoria", "Preço", "Badge", "Status", "Ações"].map(h => (
            <div key={h} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase",
              color: "rgba(245,245,245,0.4)" }}>
              {h}
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "rgba(245,245,245,0.3)" }}>
            Nenhum produto encontrado
          </div>
        ) : filtered.map((p, i) => (
          <div key={p.id} style={{
            display: "grid", gridTemplateColumns: "60px 1fr 1fr 100px 90px 80px 120px",
            gap: "0", padding: "14px 20px", alignItems: "center",
            borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            opacity: p.active ? 1 : 0.45,
          }}>
            {/* Foto/Emoji */}
            <div style={{ width: "44px", height: "44px", background: "var(--dark3)",
              borderRadius: "10px", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "1.6rem", overflow: "hidden" }}>
              {p.image_url
                ? <img src={p.image_url} alt={p.club}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : p.emoji}
            </div>

            {/* Nome */}
            <div>
              <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem", marginBottom: "2px" }}>
                {p.club}
              </div>
              <div style={{ fontSize: "0.75rem", color: "rgba(245,245,245,0.4)" }}>{p.name}</div>
            </div>

            {/* Categoria */}
            <div style={{ fontSize: "0.8rem", color: "rgba(245,245,245,0.55)",
              textTransform: "capitalize" }}>
              {p.category}
            </div>

            {/* Preço */}
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem",
                color: "var(--yellow)" }}>
                R$ {Number(p.price).toFixed(2).replace(".", ",")}
              </div>
              {p.old_price && (
                <div style={{ fontSize: "0.7rem", color: "rgba(245,245,245,0.3)",
                  textDecoration: "line-through" }}>
                  R$ {Number(p.old_price).toFixed(2).replace(".", ",")}
                </div>
              )}
            </div>

            {/* Badge */}
            <div>
              {p.badge ? (
                <span style={{ padding: "3px 10px", borderRadius: "20px",
                  background: badgeStyle[p.badge].bg, color: badgeStyle[p.badge].color,
                  fontSize: "0.72rem", fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
                  {p.badge}
                </span>
              ) : <span style={{ color: "rgba(245,245,245,0.2)", fontSize: "0.8rem" }}>—</span>}
            </div>

            {/* Status toggle */}
            <div>
              <button onClick={() => toggleActive(p.id, p.active)}
                style={{ padding: "5px 12px", borderRadius: "20px", border: "none",
                  background: p.active ? "rgba(18,184,58,0.2)" : "rgba(255,255,255,0.07)",
                  color: p.active ? "#12b83a" : "rgba(245,245,245,0.4)",
                  fontSize: "0.72rem", fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px" }}>
                {p.active ? "✓ ATIVO" : "INATIVO"}
              </button>
            </div>

            {/* Ações */}
            <div style={{ display: "flex", gap: "8px" }}>
              <Link href={`/admin/produtos/editar/${p.id}`}
                style={{ padding: "6px 12px", borderRadius: "8px", textDecoration: "none",
                  background: "rgba(0,87,183,0.2)", border: "1px solid rgba(0,87,183,0.3)",
                  color: "#6baed6", fontSize: "0.8rem", fontWeight: 600 }}>
                ✏️
              </Link>
              <button onClick={() => deleteProduct(p.id)}
                style={{ padding: "6px 12px", borderRadius: "8px",
                  background: "rgba(224,60,60,0.15)", border: "1px solid rgba(224,60,60,0.3)",
                  color: "#ff6b6b", fontSize: "0.8rem", cursor: "pointer" }}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
