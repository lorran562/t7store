"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/supabase";

export default function AdminProdutos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    const res = await fetch("/api/produtos");
    const data = await res.json();
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (id: number, active: boolean) => {
    await fetch(`/api/produtos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !active } : p));
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Excluir este produto?")) return;
    await fetch(`/api/produtos/${id}`, { method: "DELETE" });
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const filtered = products.filter(p =>
    p.club.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const badgeStyle: Record<string, { bg: string; color: string }> = {
    sale:  { bg: "rgba(224,60,60,0.15)",  color: "#ff6b6b" },
    new:   { bg: "rgba(18,184,58,0.15)",  color: "#12b83a" },
    retro: { bg: "rgba(245,200,0,0.15)",  color: "#f5c800" },
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "rgba(245,245,245,0.3)", letterSpacing: "3px" }}>CARREGANDO...</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", letterSpacing: "2px", color: "#fff", marginBottom: "4px" }}>PRODUTOS</h1>
          <p style={{ color: "rgba(245,245,245,0.45)", fontSize: "0.9rem" }}>{products.length} produtos · {products.filter(p => p.active).length} ativos</p>
        </div>
        <Link href="/admin/produtos/novo"
          style={{ background: "linear-gradient(135deg,#0a8c2a,#12b83a)", color: "#fff", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.95rem", letterSpacing: "1px" }}>
          + Novo Produto
        </Link>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..."
        style={{ width: "100%", maxWidth: "400px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "12px 16px", color: "#fff", fontSize: "0.9rem", outline: "none", marginBottom: "24px" }} />

      <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 110px 100px 90px 80px 100px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
          {["Foto","Produto","Categoria","Preço","Badge","Status","Ações"].map(h => (
            <div key={h} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(245,245,245,0.4)" }}>{h}</div>
          ))}
        </div>

        {filtered.length === 0
          ? <div style={{ padding: "48px", textAlign: "center", color: "rgba(245,245,245,0.3)" }}>Nenhum produto encontrado</div>
          : filtered.map((p, i) => (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "56px 1fr 110px 100px 90px 80px 100px", padding: "14px 20px", alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", opacity: p.active ? 1 : 0.45 }}>
              <div style={{ width: "40px", height: "40px", background: "var(--dark3)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", overflow: "hidden" }}>
                {p.image_url ? <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : p.emoji}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.88rem" }}>{p.club}</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(245,245,245,0.4)" }}>{p.name}</div>
              </div>
              <div style={{ fontSize: "0.8rem", color: "rgba(245,245,245,0.55)", textTransform: "capitalize" }}>{p.category}</div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "var(--yellow)" }}>R$ {Number(p.price).toFixed(2).replace(".",",")}</div>
                {p.old_price && <div style={{ fontSize: "0.7rem", color: "rgba(245,245,245,0.3)", textDecoration: "line-through" }}>R$ {Number(p.old_price).toFixed(2).replace(".",",")}</div>}
              </div>
              <div>
                {p.badge
                  ? <span style={{ padding: "3px 10px", borderRadius: "20px", background: badgeStyle[p.badge]?.bg, color: badgeStyle[p.badge]?.color, fontSize: "0.72rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>{p.badge}</span>
                  : <span style={{ color: "rgba(245,245,245,0.2)", fontSize: "0.8rem" }}>—</span>}
              </div>
              <div>
                <button onClick={() => toggleActive(p.id, p.active)}
                  style={{ padding: "5px 12px", borderRadius: "20px", border: "none", background: p.active ? "rgba(18,184,58,0.2)" : "rgba(255,255,255,0.07)", color: p.active ? "#12b83a" : "rgba(245,245,245,0.4)", fontSize: "0.72rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, cursor: "pointer" }}>
                  {p.active ? "✓ ATIVO" : "INATIVO"}
                </button>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <Link href={`/admin/produtos/editar/${p.id}`}
                  style={{ padding: "6px 12px", borderRadius: "8px", textDecoration: "none", background: "rgba(0,87,183,0.2)", border: "1px solid rgba(0,87,183,0.3)", color: "#6baed6", fontSize: "0.8rem" }}>✏️</Link>
                <button onClick={() => deleteProduct(p.id)}
                  style={{ padding: "6px 12px", borderRadius: "8px", background: "rgba(224,60,60,0.15)", border: "1px solid rgba(224,60,60,0.3)", color: "#ff6b6b", fontSize: "0.8rem", cursor: "pointer" }}>🗑️</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
