"use client";

import { useEffect, useState } from "react";
import { supabase, DbOrder } from "@/lib/supabase";

const STATUS_OPTIONS = [
  { value: "pending",   label: "⏳ Pendente",    color: "#f5c800" },
  { value: "confirmed", label: "✅ Confirmado",   color: "#12b83a" },
  { value: "shipped",   label: "🚚 Enviado",      color: "#0057b7" },
  { value: "delivered", label: "📬 Entregue",     color: "#888"    },
  { value: "cancelled", label: "❌ Cancelado",    color: "#e03c3c" },
];

export default function AdminPedidos() {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    supabase.from("orders").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false); });
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as DbOrder["status"] } : o));
  };

  const filtered = filterStatus === "all"
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const getStatus = (s: string) => STATUS_OPTIONS.find(x => x.value === s) || STATUS_OPTIONS[0];

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem",
        color: "rgba(245,245,245,0.3)", letterSpacing: "3px" }}>CARREGANDO...</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem",
          letterSpacing: "2px", color: "#fff", marginBottom: "4px" }}>PEDIDOS</h1>
        <p style={{ color: "rgba(245,245,245,0.45)", fontSize: "0.9rem" }}>
          {orders.length} pedido(s) no total
        </p>
      </div>

      {/* Cards resumo */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "28px" }}>
        {STATUS_OPTIONS.map(s => {
          const count = orders.filter(o => o.status === s.value).length;
          return (
            <button key={s.value} onClick={() => setFilterStatus(s.value === filterStatus ? "all" : s.value)}
              style={{ background: filterStatus === s.value ? `${s.color}22` : "var(--dark2)",
                border: `1px solid ${filterStatus === s.value ? s.color : "rgba(255,255,255,0.07)"}`,
                borderRadius: "10px", padding: "12px 18px", cursor: "pointer",
                color: filterStatus === s.value ? s.color : "rgba(245,245,245,0.5)",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: "0.85rem", letterSpacing: "0.5px", transition: "all .2s" }}>
              {s.label} <span style={{ marginLeft: "6px", fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.1rem", color: s.color }}>{count}</span>
            </button>
          );
        })}
        {filterStatus !== "all" && (
          <button onClick={() => setFilterStatus("all")}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px", padding: "12px 18px", cursor: "pointer",
              color: "rgba(245,245,245,0.4)", fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: "0.85rem" }}>
            Ver todos
          </button>
        )}
      </div>

      {/* Lista de pedidos */}
      {filtered.length === 0 ? (
        <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "14px", padding: "60px", textAlign: "center",
          color: "rgba(245,245,245,0.3)", fontSize: "0.9rem" }}>
          Nenhum pedido encontrado
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map(order => {
            const st = getStatus(order.status);
            const isOpen = expanded === order.id;
            return (
              <div key={order.id} style={{ background: "var(--dark2)",
                border: `1px solid ${isOpen ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: "14px", overflow: "hidden", transition: "border-color .2s" }}>

                {/* Header do pedido */}
                <div onClick={() => setExpanded(isOpen ? null : order.id)}
                  style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px",
                    cursor: "pointer", userSelect: "none" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem",
                    color: "rgba(245,245,245,0.35)", minWidth: "48px" }}>
                    #{order.id}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.92rem", marginBottom: "2px" }}>
                      {order.customer_name || "Cliente sem nome"}
                      {order.customer_phone && (
                        <span style={{ color: "rgba(245,245,245,0.4)", fontWeight: 400,
                          fontSize: "0.82rem", marginLeft: "10px" }}>
                          {order.customer_phone}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(245,245,245,0.38)" }}>
                      {order.items.length} item(ns) ·{" "}
                      {new Date(order.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem",
                    color: "var(--yellow)", marginRight: "12px" }}>
                    R$ {Number(order.total).toFixed(2).replace(".", ",")}
                  </div>

                  {/* Status select */}
                  <select value={order.status}
                    onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value); }}
                    onClick={e => e.stopPropagation()}
                    style={{ background: `${st.color}18`, border: `1px solid ${st.color}44`,
                      color: st.color, borderRadius: "20px", padding: "6px 12px",
                      fontSize: "0.78rem", fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700, cursor: "pointer", outline: "none" }}>
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}
                        style={{ background: "#141414", color: "#fff" }}>
                        {s.label}
                      </option>
                    ))}
                  </select>

                  <span style={{ color: "rgba(245,245,245,0.3)", fontSize: "1rem",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}>
                    ▾
                  </span>
                </div>

                {/* Detalhes expandidos */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)",
                    padding: "16px 20px", background: "rgba(255,255,255,0.01)" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                      fontSize: "0.75rem", letterSpacing: "1.5px", textTransform: "uppercase",
                      color: "rgba(245,245,245,0.4)", marginBottom: "12px" }}>
                      ITENS DO PEDIDO
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px",
                          padding: "10px 14px", background: "rgba(255,255,255,0.03)",
                          borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                          <span style={{ fontSize: "1.4rem" }}>{item.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.88rem", color: "#fff", fontWeight: 600 }}>
                              {item.club} — {item.name}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "rgba(245,245,245,0.4)" }}>
                              Tamanho: {item.size}
                            </div>
                          </div>
                          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem",
                            color: "var(--yellow)" }}>
                            R$ {Number(item.price).toFixed(2).replace(".", ",")}
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div style={{ marginTop: "12px", padding: "10px 14px",
                        background: "rgba(245,200,0,0.08)", border: "1px solid rgba(245,200,0,0.2)",
                        borderRadius: "8px", fontSize: "0.85rem", color: "rgba(245,245,245,0.7)" }}>
                        📝 {order.notes}
                      </div>
                    )}

                    {/* Total */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px",
                      paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.75rem", color: "rgba(245,245,245,0.4)",
                          marginBottom: "4px" }}>TOTAL DO PEDIDO</div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem",
                          color: "var(--yellow)" }}>
                          R$ {Number(order.total).toFixed(2).replace(".", ",")}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
