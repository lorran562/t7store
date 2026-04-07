"use client";

import { useEffect, useState } from "react";
import { supabase, DbProduct, DbOrder } from "@/lib/supabase";
import Link from "next/link";

export default function AdminDashboard() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: prods }, { data: ords }] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setProducts(prods || []);
      setOrders(ords || []);
      setLoading(false);
    }
    load();
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const activeProducts = products.filter(p => p.active).length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;

  const statusLabel: Record<string, string> = {
    pending: "⏳ Pendente", confirmed: "✅ Confirmado",
    shipped: "🚚 Enviado", delivered: "📬 Entregue", cancelled: "❌ Cancelado",
  };
  const statusColor: Record<string, string> = {
    pending: "#f5c800", confirmed: "#12b83a",
    shipped: "#0057b7", delivered: "#888", cancelled: "#e03c3c",
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem",
        color: "rgba(245,245,245,0.3)", letterSpacing: "3px" }}>CARREGANDO...</div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem",
          letterSpacing: "2px", color: "#fff", marginBottom: "4px" }}>
          DASHBOARD
        </h1>
        <p style={{ color: "rgba(245,245,245,0.45)", fontSize: "0.9rem" }}>
          Bem-vindo ao painel da T7 Store
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px", marginBottom: "40px" }}>
        {[
          { label: "Produtos Ativos", value: activeProducts, icon: "👕", color: "#12b83a" },
          { label: "Total Pedidos", value: orders.length, icon: "📦", color: "#0057b7" },
          { label: "Pedidos Pendentes", value: pendingOrders, icon: "⏳", color: "#f5c800" },
          { label: "Receita (últimos)", value: `R$ ${totalRevenue.toFixed(2).replace(".", ",")}`, icon: "💰", color: "#12b83a" },
        ].map(card => (
          <div key={card.label} style={{ background: "var(--dark2)",
            border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{card.icon}</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem",
              color: card.color, lineHeight: 1, marginBottom: "6px" }}>
              {card.value}
            </div>
            <div style={{ fontSize: "0.82rem", color: "rgba(245,245,245,0.45)", letterSpacing: "0.5px" }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Ações rápidas */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem",
          letterSpacing: "2px", color: "#fff", marginBottom: "16px" }}>
          AÇÕES RÁPIDAS
        </h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/admin/produtos/novo"
            style={{ background: "linear-gradient(135deg,#0a8c2a,#12b83a)", color: "#fff",
              padding: "14px 24px", borderRadius: "10px", textDecoration: "none",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
              fontSize: "0.95rem", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "8px" }}>
            ➕ Novo Produto
          </Link>
          <Link href="/admin/pedidos"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", padding: "14px 24px", borderRadius: "10px", textDecoration: "none",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: "0.95rem", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "8px" }}>
            📦 Ver Pedidos
          </Link>
          <Link href="/admin/produtos"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", padding: "14px 24px", borderRadius: "10px", textDecoration: "none",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: "0.95rem", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "8px" }}>
            👕 Gerenciar Produtos
          </Link>
        </div>
      </div>

      {/* Últimos pedidos */}
      <div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem",
          letterSpacing: "2px", color: "#fff", marginBottom: "16px" }}>
          ÚLTIMOS PEDIDOS
        </h2>
        {orders.length === 0 ? (
          <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "14px", padding: "40px", textAlign: "center",
            color: "rgba(245,245,245,0.3)", fontSize: "0.9rem" }}>
            Nenhum pedido ainda
          </div>
        ) : (
          <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "14px", overflow: "hidden" }}>
            {orders.map((order, i) => (
              <div key={order.id} style={{
                display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px",
                borderBottom: i < orders.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem",
                  color: "rgba(245,245,245,0.3)", minWidth: "40px" }}>
                  #{order.id}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.88rem", color: "#fff", fontWeight: 600, marginBottom: "2px" }}>
                    {order.customer_name || "Cliente"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(245,245,245,0.4)" }}>
                    {order.items.length} item(ns) · {new Date(order.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem",
                  color: "var(--yellow)" }}>
                  R$ {Number(order.total).toFixed(2).replace(".", ",")}
                </div>
                <div style={{ padding: "4px 12px", borderRadius: "20px",
                  background: `${statusColor[order.status]}22`,
                  border: `1px solid ${statusColor[order.status]}44`,
                  color: statusColor[order.status], fontSize: "0.75rem",
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, whiteSpace: "nowrap" }}>
                  {statusLabel[order.status]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
