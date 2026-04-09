"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase, Product, fmt, isTenis, getSizes } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

export default function ProductPage() {
  const params = useParams();
  const { addToCart, openCart } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id;
    supabase.from("products").select("*").eq("id", id).single().then(({ data }) => {
      if (data) {
        setProduct(data);
        // Buscar relacionados
        supabase.from("products").select("*").eq("category", data.category).eq("active", true).neq("id", id).limit(4).then(({ data: rel }) => setRelated(rel || []));
      }
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--black)" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "rgba(245,245,245,0.3)", letterSpacing: "3px" }}>CARREGANDO...</div>
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "24px", background: "var(--black)" }}>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#fff" }}>Produto não encontrado</h1>
      <Link href="/" style={{ background: "var(--green)", color: "#fff", padding: "12px 24px", borderRadius: "8px", textDecoration: "none" }}>Voltar</Link>
    </div>
  );

  const tenis = isTenis(product.category);
  const sizes = product.sizes?.length ? product.sizes : getSizes(product.category);
  const discount = product.old_price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;
  const accent = tenis ? "#0057b7" : "var(--green)";
  const gradient = tenis ? "linear-gradient(135deg,#003d99,#0057b7)" : "linear-gradient(135deg,#0a8c2a,#12b83a)";

  const handleBuyNow = () => {
    if (!selectedSize) { showToast(tenis ? "Selecione a numeração!" : "Selecione um tamanho!"); return; }
    for (let i = 0; i < quantity; i++) addToCart(product, selectedSize);
    openCart();
  };

  const handleAddToCart = () => {
    if (!selectedSize) { showToast(tenis ? "Selecione a numeração!" : "Selecione um tamanho!"); return; }
    for (let i = 0; i < quantity; i++) addToCart(product, selectedSize);
    showToast(`${quantity}x ${product.club} (${selectedSize}) adicionado!`);
  };

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh" }}>
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(8,8,8,0.95)", backdropFilter: "blur(12px)", borderBottom: `2px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 5vw", height: "64px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <Image src="/t7estore.jpg" alt="T7" width={48} height={48} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.7rem", letterSpacing: "2px", background: "linear-gradient(135deg,#fff 30%,#f5c800)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>T7 STORE</span>
        </Link>
        <Link href="/" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#fff", textDecoration: "none" }}>← Voltar</Link>
      </header>

      <main style={{ paddingTop: "96px", padding: "96px 5vw 48px", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }} className="lg:grid-cols-2">
          {/* Imagem */}
          <div style={{ background: "linear-gradient(135deg,var(--dark2),var(--dark3))", borderRadius: "20px", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12rem", position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
            {product.image_url
              ? <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span>{product.emoji}</span>}
            {product.badge === "sale" && discount > 0 && (
              <div style={{ position: "absolute", top: "20px", left: "20px", background: "#e03c3c", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.85rem", padding: "6px 14px", borderRadius: "6px" }}>
                {discount}% OFF
              </div>
            )}
            {tenis && (
              <div style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(0,87,183,0.7)", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.78rem", padding: "5px 12px", borderRadius: "6px" }}>
                👟 TÊNIS
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: tenis ? "#6baed6" : "var(--green-light)", marginBottom: "8px" }}>{product.club}</div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem,4vw,3rem)", letterSpacing: "2px", color: "#fff", marginBottom: "8px" }}>{product.name}</h1>
            <div style={{ fontSize: "0.92rem", color: "rgba(245,245,245,0.55)", marginBottom: "8px" }}>{product.meta}</div>
            {product.description && (
              <div style={{ fontSize: "0.88rem", color: "rgba(245,245,245,0.45)", marginBottom: "24px", lineHeight: 1.6 }}>{product.description}</div>
            )}

            <div style={{ background: "var(--dark2)", borderRadius: "16px", padding: "24px", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
              {product.old_price && <div style={{ fontSize: "1rem", color: "rgba(245,245,245,0.4)", textDecoration: "line-through", marginBottom: "4px" }}>De R$ {fmt(product.old_price)}</div>}
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", color: "var(--yellow)", lineHeight: 1 }}>R$ {fmt(product.price)}</div>
                {product.old_price && <div style={{ background: "#e03c3c", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.78rem", padding: "4px 10px", borderRadius: "4px" }}>ECONOMIZE R$ {fmt(product.old_price - product.price)}</div>}
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.88rem", letterSpacing: "1px", textTransform: "uppercase", color: "#fff", display: "block", marginBottom: "12px" }}>
                {tenis ? "Numeração:" : "Tamanho:"} {selectedSize && <span style={{ color: tenis ? "#6baed6" : "var(--green-light)", marginLeft: "8px" }}>{selectedSize}</span>}
              </span>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {sizes.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    style={{ background: selectedSize === size ? accent : "rgba(255,255,255,0.05)", border: `2px solid ${selectedSize === size ? accent : "rgba(255,255,255,0.1)"}`, color: selectedSize === size ? "#fff" : "rgba(245,245,245,0.65)", padding: "12px 20px", borderRadius: "8px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", cursor: "pointer", minWidth: "60px" }}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.88rem", letterSpacing: "1px", textTransform: "uppercase", color: "#fff", display: "block", marginBottom: "12px" }}>Quantidade:</span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--dark2)", borderRadius: "8px", padding: "4px", width: "fit-content", border: "1px solid rgba(255,255,255,0.1)" }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "6px", color: "#fff", fontSize: "1.2rem", cursor: "pointer" }}>-</button>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", color: "#fff", minWidth: "40px", textAlign: "center" }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "6px", color: "#fff", fontSize: "1.2rem", cursor: "pointer" }}>+</button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              <button onClick={handleBuyNow} style={{ width: "100%", background: gradient, border: "none", padding: "18px 32px", borderRadius: "10px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.1rem", letterSpacing: "2px", textTransform: "uppercase", color: "#fff", cursor: "pointer" }}>
                COMPRAR AGORA
              </button>
              <button onClick={handleAddToCart} style={{ width: "100%", background: "transparent", border: "2px solid rgba(255,255,255,0.2)", padding: "16px 32px", borderRadius: "10px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "1px", textTransform: "uppercase", color: "#fff", cursor: "pointer" }}>
                ADICIONAR AO CARRINHO
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px" }}>
              {[{ icon: "🚚", text: "Frete Grátis acima de R$ 299" }, { icon: "🔒", text: "Pagamento 100% Seguro" }, { icon: "⚡", text: "Entrega em até 7 dias" }, { icon: "💬", text: "Suporte via WhatsApp" }].map(item => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
                  <span style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.65)" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section style={{ marginTop: "64px" }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "2px", color: "#fff", marginBottom: "24px" }}>
              {tenis ? "OUTROS " : "VOCÊ TAMBÉM VAI "}<span style={{ color: "var(--yellow)" }}>{tenis ? "TÊNIS" : "GOSTAR"}</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "20px" }}>
              {related.map(r => (
                <Link key={r.id} href={`/produto/${r.id}`} style={{ textDecoration: "none" }} onClick={e => { e.preventDefault(); window.location.href = `/produto/${r.id}`; }}>
                  <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{ height: "160px", background: "var(--dark3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
                      {r.image_url ? <img src={r.image_url} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : r.emoji}
                    </div>
                    <div style={{ padding: "14px" }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.72rem", fontWeight: 700, color: isTenis(r.category) ? "#6baed6" : "var(--green-light)", marginBottom: "4px" }}>{r.club}</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.92rem", color: "#fff", marginBottom: "8px" }}>{r.name}</div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", color: "var(--yellow)" }}>R$ {fmt(r.price)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
