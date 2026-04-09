"use client";

import { useEffect, useState } from "react";
import { DbOrder } from "@/lib/supabase";

const STATUS_OPTIONS = [
  { value: "pending",   label: "⏳ Pendente",  color: "#f5c800" },
  { value: "confirmed", label: "✅ Confirmado", color: "#12b83a" },
  { value: "shipped",   label: "🚚 Enviado",    color: "#0057b7" },
  { value: "delivered", label: "📬 Entregue",   color: "#888"    },
  { value: "cancelled", label: "❌ Cancelado",  color: "#e03c3c" },
];

export default function AdminPedidos() {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/pedidos").then(r => r.json()).then(data => { setOrders(data || []); setLoading(false); });
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/pedidos/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as DbOrder["status"] } : o));
  };

  const filtered = filterStatus === "all" ? orders : orders.filter(o => o.status === filterStatus);
  const getStatus = (s: string) => STATUS_OPTIONS.find(x => x.value === s) || STATUS_OPTIONS[0];

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "rgba(245,245,245,0.3)", letterSpacing: "3px" }}>CARREGANDO...</div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", letterSpacing: "2px", color: "#fff", marginBottom: "4px" }}>PEDIDOS</h1>
        <p style={{ color: "rgba(245,245,245,0.45)", fontSize: "0.9rem" }}>{orders.length} pedido(s)</p>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
        {STATUS_OPTIONS.map(s => (
          <button key={s.value} onClick={() => setFilterStatus(s.value === filterStatus ? "all" : s.value)}
            style={{ background: filterStatus === s.value ? `${s.color}22` : "var(--dark2)", border: `1px solid ${filterStatus === s.value ? s.color : "rgba(255,255,255,0.07)"}`, borderRadius: "10px", padding: "10px 16px", cursor: "pointer", color: filterStatus === s.value ? s.color : "rgba(245,245,245,0.5)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem" }}>
            {s.label} <span style={{ color: s.color, fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem" }}>{orders.filter(o => o.status === s.value).length}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "60px", textAlign: "center", color: "rgba(245,245,245,0.3)" }}>Nenhum pedido</div>
        : <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map(order => {
              const st = getStatus(order.status);
              const isOpen = expanded === order.id;
              return (
                <div key={order.id} style={{ background: "var(--dark2)", border: `1px solid ${isOpen ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)"}`, borderRadius: "14px", overflow: "hidden" }}>
                  <div onClick={() => setExpanded(isOpen ? null : order.id)}
                    style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", cursor: "pointer" }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "rgba(245,245,245,0.3)", minWidth: "40px" }}>#{order.id}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem" }}>{order.customer_name || "Cliente"}</div>
                      <div style={{ fontSize: "0.75rem", color: "rgba(245,245,245,0.38)" }}>{order.items.length} item(ns) · {new Date(order.created_at).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", color: "var(--yellow)" }}>R$ {Number(order.total).toFixed(2).replace(".",",")}</div>
                    <select value={order.status} onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value); }} onClick={e => e.stopPropagation()}
                      style={{ background: `${st.color}18`, border: `1px solid ${st.color}44`, color: st.color, borderRadius: "20px", padding: "6px 12px", fontSize: "0.78rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, cursor: "pointer", outline: "none" }}>
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value} style={{ background: "#141414", color: "#fff" }}>{s.label}</option>)}
                    </select>
                    <span style={{ color: "rgba(245,245,245,0.3)", transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}>▾</span>
                  </div>
                  {isOpen && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px", background: "rgba(255,255,255,0.01)" }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", marginBottom: "8px" }}>
                          <span style={{ fontSize: "1.4rem" }}>{item.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.88rem", color: "#fff", fontWeight: 600 }}>{item.club} — {item.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "rgba(245,245,245,0.4)" }}>Tamanho: {item.size}</div>
                          </div>
                          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "var(--yellow)" }}>R$ {Number(item.price).toFixed(2).replace(".",",")}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
      }
    </div>
  );
}
