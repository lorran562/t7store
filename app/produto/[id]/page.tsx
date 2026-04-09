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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--black)" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "rgba(245,245,245,0.3)", letterSpacing: "3px" }}>CARREGANDO...</div>
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "24px", background: "var(--black)" }}>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#fff" }}>Produto não encontrado</h1>
      <Link href="/" style={{ background: "var(--green)", color: "#fff", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>Voltar</Link>
    </div>
  );

  const tenis = isTenis(product.category);
  const sizes = product.sizes?.length ? product.sizes : getSizes(product.category);
  const discount = product.old_price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;
  const accent = tenis ? "#0057b7" : "var(--green)";
  const gradient = tenis ? "linear-gradient(135deg,#003d99,#0057b7)" : "linear-gradient(135deg,#0a8c2a,#12b83a)";
  const hasImage = product.image_url && product.image_url.length > 0 && !imgError;

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

      <main style={{ paddingTop: "64px", maxWidth: "1400px", margin: "0 auto", padding: "80px 5vw 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "56px", alignItems: "start" }} className="lg:grid-cols-2">

          {/* Imagem — destaque principal */}
          <div style={{ position: "sticky", top: "84px" }}>
            <div style={{ borderRadius: "20px", overflow: "hidden", aspectRatio: "1", background: "var(--dark2)", position: "relative", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>
              {hasImage ? (
                <img
                  src={product.image_url}
                  alt={`${product.club} ${product.name}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", background: "linear-gradient(135deg,var(--dark2),var(--dark3))" }}>
                  <div style={{ fontSize: "6rem", opacity: 0.25 }}>{tenis ? "👟" : "⚽"}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "3px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>Sem imagem</div>
                </div>
              )}

              {/* Badges sobre a imagem */}
              {discount > 0 && product.badge === "sale" && (
                <div style={{ position: "absolute", top: "20px", left: "20px", background: "#e03c3c", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.9rem", padding: "6px 14px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(224,60,60,0.4)" }}>
                  {discount}% OFF
                </div>
              )}
              {product.badge === "new" && (
                <div style={{ position: "absolute", top: "20px", left: "20px", background: "var(--green)", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.9rem", padding: "6px 14px", borderRadius: "8px" }}>
                  NOVO
                </div>
              )}
              {tenis && (
                <div style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(0,87,183,0.85)", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.8rem", padding: "5px 12px", borderRadius: "7px" }}>
                  👟 TÊNIS
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: tenis ? "#6baed6" : "var(--green-light)", marginBottom: "8px" }}>
              {product.club}
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem,4vw,3.2rem)", letterSpacing: "2px", color: "#fff", marginBottom: "6px", lineHeight: 1.05 }}>
              {product.name}
            </h1>
            <div style={{ fontSize: "0.9rem", color: "rgba(245,245,245,0.5)", marginBottom: "10px" }}>{product.meta}</div>
            {product.description && (
              <div style={{ fontSize: "0.9rem", color: "rgba(245,245,245,0.42)", marginBottom: "28px", lineHeight: 1.65, borderLeft: `3px solid ${accent}`, paddingLeft: "14px" }}>
                {product.description}
              </div>
            )}

            {/* Preço */}
            <div style={{ background: "var(--dark2)", borderRadius: "16px", padding: "22px 24px", marginBottom: "28px", border: "1px solid rgba(255,255,255,0.07)" }}>
              {product.old_price && (
                <div style={{ fontSize: "1rem", color: "rgba(245,245,245,0.38)", textDecoration: "line-through", marginBottom: "4px" }}>
                  De R$ {fmt(product.old_price)}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "baseline", gap: "14px" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3.2rem", color: "var(--yellow)", lineHeight: 1 }}>
                  R$ {fmt(product.price)}
                </div>
                {product.old_price && (
                  <div style={{ background: "#e03c3c", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.78rem", padding: "4px 10px", borderRadius: "4px" }}>
                    -{discount}%
                  </div>
                )}
              </div>
            </div>

            {/* Tamanhos */}
            <div style={{ marginBottom: "24px" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "#fff", display: "block", marginBottom: "12px" }}>
                {tenis ? "Numeração:" : "Tamanho:"} {selectedSize && <span style={{ color: tenis ? "#6baed6" : "var(--green-light)", marginLeft: "8px" }}>{selectedSize}</span>}
              </span>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {sizes.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    style={{ background: selectedSize === size ? accent : "rgba(255,255,255,0.05)", border: `2px solid ${selectedSize === size ? accent : "rgba(255,255,255,0.1)"}`, color: selectedSize === size ? "#fff" : "rgba(245,245,245,0.65)", padding: "11px 20px", borderRadius: "9px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", cursor: "pointer", transition: "all .15s", minWidth: "58px", textAlign: "center" }}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantidade */}
            <div style={{ marginBottom: "28px" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "#fff", display: "block", marginBottom: "12px" }}>Quantidade:</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0", background: "var(--dark2)", borderRadius: "10px", width: "fit-content", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: "44px", height: "44px", background: "transparent", border: "none", color: "#fff", fontSize: "1.2rem", cursor: "pointer", borderRight: "1px solid rgba(255,255,255,0.1)" }}>−</button>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", color: "#fff", minWidth: "48px", textAlign: "center" }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} style={{ width: "44px", height: "44px", background: "transparent", border: "none", color: "#fff", fontSize: "1.2rem", cursor: "pointer", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>+</button>
              </div>
            </div>

            {/* Botões */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              <button onClick={handleBuyNow} style={{ width: "100%", background: gradient, border: "none", padding: "18px 32px", borderRadius: "12px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.1rem", letterSpacing: "2px", textTransform: "uppercase", color: "#fff", cursor: "pointer", boxShadow: tenis ? "0 6px 24px rgba(0,87,183,0.45)" : "0 6px 24px rgba(10,140,42,0.45)" }}>
                COMPRAR AGORA
              </button>
              <button onClick={handleAddToCart} style={{ width: "100%", background: "transparent", border: `2px solid ${accent}`, padding: "16px 32px", borderRadius: "12px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "1px", textTransform: "uppercase", color: "#fff", cursor: "pointer" }}>
                ADICIONAR AO CARRINHO
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "10px" }}>
              {[{ icon: "🚚", text: "Frete Grátis acima de R$ 299" }, { icon: "🔒", text: "Pagamento 100% Seguro" }, { icon: "⚡", text: "Entrega em até 7 dias" }, { icon: "💬", text: "Suporte via WhatsApp" }].map(item => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                  <span style={{ fontSize: "0.76rem", color: "rgba(245,245,245,0.6)" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Relacionados */}
        {related.length > 0 && (
          <section style={{ marginTop: "72px" }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "2px", color: "#fff", marginBottom: "28px" }}>
              {tenis ? "OUTROS " : "VOCÊ TAMBÉM VAI "}<span style={{ color: "var(--yellow)" }}>{tenis ? "TÊNIS" : "GOSTAR"}</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "20px" }}>
              {related.map(r => (
                <a key={r.id} href={`/produto/${r.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden", transition: "transform .2s, border-color .2s" }} className="hover:-translate-y-1 hover:border-white/20">
                    <div style={{ height: "180px", background: "var(--dark3)", overflow: "hidden" }}>
                      {r.image_url ? (
                        <img src={r.image_url} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem", opacity: 0.3 }}>
                          {isTenis(r.category) ? "👟" : "⚽"}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "14px" }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem", fontWeight: 700, color: isTenis(r.category) ? "#6baed6" : "var(--green-light)", marginBottom: "4px" }}>{r.club}</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.92rem", color: "#fff", marginBottom: "8px" }}>{r.name}</div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", color: "var(--yellow)" }}>R$ {fmt(r.price)}</div>
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
