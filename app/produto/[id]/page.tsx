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
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    supabase.from("products").select("*").eq("id", params.id).single().then(({ data }) => {
      if (data) {
        setProduct(data);
        supabase.from("products").select("*").eq("category", data.category).eq("active", true).neq("id", params.id).limit(4)
          .then(({ data: rel }) => setRelated(rel || []));
      }
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return (
    <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--black)" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", color: "rgba(245,245,245,0.3)", letterSpacing: "3px" }}>CARREGANDO...</div>
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px", background: "var(--black)", padding: "20px" }}>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "#fff", textAlign: "center" }}>Produto não encontrado</h1>
      <Link href="/" style={{ background: "var(--green)", color: "#fff", padding: "14px 28px", borderRadius: "10px", textDecoration: "none", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>Voltar</Link>
    </div>
  );

  const tenis = isTenis(product.category);
  const sizes = product.sizes?.length ? product.sizes : getSizes(product.category);
  const discount = product.old_price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;
  const accent = tenis ? "#0057b7" : "var(--green)";
  const gradient = tenis ? "linear-gradient(135deg,#003d99,#0057b7)" : "linear-gradient(135deg,#0a8c2a,#12b83a)";
  const hasImage = Boolean(product.image_url) && !imgError;

  const handleBuyNow = () => {
    if (!selectedSize) { showToast(tenis ? "Selecione a numeração!" : "Selecione um tamanho!"); return; }
    for (let i = 0; i < quantity; i++) addToCart(product, null, selectedSize, 1);
    openCart();
  };

  const handleAdd = () => {
    if (!selectedSize) { showToast(tenis ? "Selecione a numeração!" : "Selecione um tamanho!"); return; }
    for (let i = 0; i < quantity; i++) addToCart(product, null, selectedSize, 1);
    showToast(`${quantity}x ${product.club} (${selectedSize}) adicionado!`);
  };

  return (
    <div style={{ background: "var(--black)", minHeight: "100svh" }}>
      {/* Header compacto */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(8,8,8,0.96)", backdropFilter: "blur(14px)", borderBottom: `2px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: "var(--header-h)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <Image src="/t7estore.jpg" alt="T7" width={34} height={34} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "2px", background: "linear-gradient(135deg,#fff 30%,#f5c800)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>T7 STORE</span>
        </Link>
        <Link href="/" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#fff", textDecoration: "none", padding: "8px 0", minHeight: "44px", display: "flex", alignItems: "center" }}>← Voltar</Link>
      </header>

      <main style={{ paddingTop: "calc(var(--header-h) + 16px)", padding: "calc(var(--header-h) + 16px) 16px 80px" }}>
        {/* Grid produto — coluna no mobile, 2 col no desktop */}
        <div className="product-detail-grid" style={{ maxWidth: "1200px", margin: "0 auto" }}>

          {/* Imagem */}
          <div style={{ borderRadius: "16px", overflow: "hidden", aspectRatio: "1", background: "var(--dark2)", position: "relative", border: "1px solid rgba(255,255,255,0.07)" }}>
            {hasImage ? (
              <img src={product.image_url} alt={`${product.club} ${product.name}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgError(true)} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px" }}>
                <span style={{ fontSize: "5rem", opacity: 0.2 }}>{tenis ? "👟" : "⚽"}</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.18)", letterSpacing: "2px" }}>SEM IMAGEM</span>
              </div>
            )}
            {discount > 0 && product.badge === "sale" && (
              <div style={{ position: "absolute", top: "14px", left: "14px", background: "#e03c3c", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.82rem", padding: "5px 12px", borderRadius: "7px" }}>{discount}% OFF</div>
            )}
            {tenis && (
              <div style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(0,87,183,0.85)", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.75rem", padding: "4px 10px", borderRadius: "6px" }}>👟 TÊNIS</div>
            )}
          </div>

          {/* Info */}
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: tenis ? "#6baed6" : "var(--green-light)", marginBottom: "6px" }}>{product.club}</div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.8rem,5vw,3rem)", letterSpacing: "2px", color: "#fff", marginBottom: "6px", lineHeight: 1.05 }}>{product.name}</h1>
            <div style={{ fontSize: "0.88rem", color: "rgba(245,245,245,0.48)", marginBottom: product.description ? "10px" : "20px" }}>{product.meta}</div>
            {product.description && (
              <div style={{ fontSize: "0.88rem", color: "rgba(245,245,245,0.42)", marginBottom: "20px", lineHeight: 1.6, borderLeft: `3px solid ${accent}`, paddingLeft: "12px" }}>{product.description}</div>
            )}

            {/* Preço */}
            <div style={{ background: "var(--dark2)", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.07)" }}>
              {product.old_price && <div style={{ fontSize: "0.9rem", color: "rgba(245,245,245,0.38)", textDecoration: "line-through" }}>De R$ {fmt(product.old_price)}</div>}
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem,6vw,3rem)", color: "var(--yellow)", lineHeight: 1 }}>R$ {fmt(product.price)}</div>
                {product.old_price && <div style={{ background: "#e03c3c", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.75rem", padding: "4px 9px", borderRadius: "4px" }}>-{discount}%</div>}
              </div>
            </div>

            {/* Tamanhos */}
            <div style={{ marginBottom: "18px" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "1px", textTransform: "uppercase", color: "#fff", display: "block", marginBottom: "10px" }}>
                {tenis ? "Numeração:" : "Tamanho:"} {selectedSize && <span style={{ color: tenis ? "#6baed6" : "var(--green-light)", marginLeft: "8px" }}>{selectedSize}</span>}
              </span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {sizes.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    style={{ background: selectedSize === size ? accent : "rgba(255,255,255,0.05)", border: `2px solid ${selectedSize === size ? accent : "rgba(255,255,255,0.1)"}`, color: selectedSize === size ? "#fff" : "rgba(245,245,245,0.65)", padding: "10px 16px", borderRadius: "9px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", minWidth: "52px", minHeight: "46px", textAlign: "center", transition: "all .15s" }}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantidade */}
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "1px", textTransform: "uppercase", color: "#fff", display: "block", marginBottom: "10px" }}>Quantidade:</span>
              <div style={{ display: "flex", alignItems: "center", background: "var(--dark2)", borderRadius: "10px", width: "fit-content", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: "48px", height: "48px", background: "transparent", border: "none", color: "#fff", fontSize: "1.2rem", cursor: "pointer", borderRight: "1px solid rgba(255,255,255,0.08)" }}>−</button>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", color: "#fff", minWidth: "52px", textAlign: "center" }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} style={{ width: "48px", height: "48px", background: "transparent", border: "none", color: "#fff", fontSize: "1.2rem", cursor: "pointer", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>+</button>
              </div>
            </div>

            {/* Botões — full width no mobile */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              <button onClick={handleBuyNow} style={{ width: "100%", background: gradient, border: "none", padding: "16px 24px", borderRadius: "12px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", color: "#fff", cursor: "pointer", minHeight: "52px", boxShadow: tenis ? "0 4px 20px rgba(0,87,183,0.4)" : "0 4px 20px rgba(10,140,42,0.4)" }}>
                COMPRAR AGORA
              </button>
              <button onClick={handleAdd} style={{ width: "100%", background: "transparent", border: `2px solid ${accent}`, padding: "14px 24px", borderRadius: "12px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "1px", textTransform: "uppercase", color: "#fff", cursor: "pointer", minHeight: "52px" }}>
                ADICIONAR AO CARRINHO
              </button>
            </div>

            {/* Trust badges — 2x2 no mobile */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "8px" }}>
              {[{ icon: "🚚", text: "Frete Grátis +R$299" }, { icon: "🔒", text: "Pagamento Seguro" }, { icon: "⚡", text: "Entrega em 7 dias" }, { icon: "💬", text: "Suporte WhatsApp" }].map(item => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                  <span style={{ fontSize: "0.74rem", color: "rgba(245,245,245,0.6)" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Relacionados */}
        {related.length > 0 && (
          <section style={{ marginTop: "56px", maxWidth: "1200px", margin: "56px auto 0" }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "2px", color: "#fff", marginBottom: "20px" }}>
              {tenis ? "OUTROS " : "VEJA TAMBÉM "}<span style={{ color: "var(--yellow)" }}>{tenis ? "TÊNIS" : "CAMISAS"}</span>
            </h2>
            <div className="products-grid">
              {related.map(r => (
                <a key={r.id} href={`/produto/${r.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{ aspectRatio: "1", background: "var(--dark3)", overflow: "hidden" }}>
                      {r.image_url ? (
                        <img src={r.image_url} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", opacity: 0.25 }}>
                          {isTenis(r.category) ? "👟" : "⚽"}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "10px 12px 12px" }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.65rem", fontWeight: 700, color: isTenis(r.category) ? "#6baed6" : "var(--green-light)", marginBottom: "3px" }}>{r.club}</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#fff", marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", color: "var(--yellow)" }}>R$ {fmt(r.price)}</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
