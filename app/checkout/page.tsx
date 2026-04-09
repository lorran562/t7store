"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { fmt } from "@/lib/supabase";

type PayMethod = "pix" | "credito" | "debito" | "dinheiro";

const PAY_OPTIONS: { id: PayMethod; label: string; icon: string; desc: string }[] = [
  { id: "pix",      label: "PIX",                icon: "💚", desc: "5% de desconto" },
  { id: "credito",  label: "Cartão de Crédito",  icon: "💳", desc: "Até 3x sem juros" },
  { id: "debito",   label: "Cartão de Débito",   icon: "🏦", desc: "Pagamento na entrega" },
  { id: "dinheiro", label: "Dinheiro",            icon: "💵", desc: "Na entrega" },
];

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const WHATSAPP_NUMBER = "556993209150";

type Form = {
  nome: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
};

const EMPTY: Form = { nome: "", telefone: "", cep: "", endereco: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" };

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "1px", textTransform: "uppercase", color: error ? "#ff6b6b" : "rgba(245,245,245,0.5)", marginBottom: "6px" }}>
        {label}{required && <span style={{ color: "#ff6b6b", marginLeft: "3px" }}>*</span>}
      </label>
      {children}
      {error && <p style={{ fontSize: "0.72rem", color: "#ff6b6b", marginTop: "4px" }}>{error}</p>}
    </div>
  );
}

const inp: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "16px", outline: "none", fontFamily: "inherit", transition: "border-color .2s" };
const inpErr: React.CSSProperties = { ...inp, borderColor: "rgba(224,60,60,0.6)" };

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useCart();
  const [form, setForm] = useState<Form>(EMPTY);
  const [payment, setPayment] = useState<PayMethod>("pix");
  const [errors, setErrors] = useState<Partial<Form>>({});
  const [sent, setSent] = useState(false);

  const shipping = cartSubtotal >= 299 ? 0 : 29.90;
  const pixDiscount = payment === "pix" ? cartSubtotal * 0.05 : 0;
  const total = cartSubtotal + shipping - pixDiscount;

  // Máscara de telefone
  const maskPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  };

  // Máscara de CEP
  const maskCep = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0,5)}-${d.slice(5)}`;
  };

  // Buscar endereço pelo CEP
  const fetchCep = async (cep: string) => {
    const raw = cep.replace(/\D/g, "");
    if (raw.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(f => ({ ...f, endereco: data.logradouro || f.endereco, bairro: data.bairro || f.bairro, cidade: data.localidade || f.cidade, estado: data.uf || f.estado }));
      }
    } catch {}
  };

  const set = (k: keyof Form, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Form> = {};
    if (!form.nome.trim())     e.nome     = "Nome obrigatório";
    if (!form.telefone.trim() || form.telefone.replace(/\D/g,"").length < 10) e.telefone = "Telefone inválido";
    if (!form.cep.trim() || form.cep.replace(/\D/g,"").length < 8) e.cep = "CEP inválido";
    if (!form.endereco.trim()) e.endereco = "Endereço obrigatório";
    if (!form.numero.trim())   e.numero   = "Número obrigatório";
    if (!form.bairro.trim())   e.bairro   = "Bairro obrigatório";
    if (!form.cidade.trim())   e.cidade   = "Cidade obrigatória";
    if (!form.estado)          e.estado   = "Estado obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildMessage = (): string => {
    const payLabel = PAY_OPTIONS.find(p => p.id === payment)?.label || payment;
    const enderecoFull = `${form.endereco}, ${form.numero}${form.complemento ? ` - ${form.complemento}` : ""}, ${form.bairro}, ${form.cidade}/${form.estado}, CEP ${form.cep}`;

    // Agrupar itens iguais
    const grouped: Record<string, { name: string; qty: number; price: number }> = {};
    cart.forEach(item => {
      const key = `${item.club} - ${item.name} (${item.size})`;
      if (grouped[key]) { grouped[key].qty++; }
      else grouped[key] = { name: key, qty: 1, price: item.price };
    });

    const items = Object.values(grouped)
      .map(i => `• ${i.name}${i.qty > 1 ? ` x${i.qty}` : ""} - R$ ${fmt(i.price * i.qty)}`)
      .join("\n");

    const lines = [
      `🛒 *NOVO PEDIDO - T7 STORE*`,
      ``,
      `👤 *Cliente:* ${form.nome}`,
      `📱 *Telefone:* ${form.telefone}`,
      ``,
      `📍 *Endereço de entrega:*`,
      enderecoFull,
      ``,
      `🛍️ *Produtos:*`,
      items,
      ``,
      `━━━━━━━━━━━━━━━━`,
      `Subtotal: R$ ${fmt(cartSubtotal)}`,
      shipping === 0 ? `Frete: Grátis 🎉` : `Frete: R$ ${fmt(shipping)}`,
      payment === "pix" ? `Desconto PIX (5%): -R$ ${fmt(pixDiscount)}` : null,
      `*TOTAL: R$ ${fmt(total)}*`,
      ``,
      `💳 *Pagamento:* ${payLabel}`,
    ].filter(Boolean).join("\n");

    return lines;
  };

  const handleSubmit = () => {
    if (cart.length === 0) return;
    if (!validate()) {
      // Scroll para o primeiro erro
      document.querySelector("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const msg = encodeURIComponent(buildMessage());
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    setSent(true);
    clearCart();
  };

  // Carrinho vazio sem ter enviado
  if (cart.length === 0 && !sent) {
    return (
      <div style={{ minHeight: "100svh", background: "var(--black)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "24px" }}>
        <div style={{ fontSize: "4rem" }}>🛒</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#fff", textAlign: "center" }}>Carrinho vazio</h1>
        <p style={{ color: "rgba(245,245,245,0.5)", textAlign: "center", fontSize: "0.9rem" }}>Adicione produtos antes de finalizar.</p>
        <Link href="/" style={{ background: "var(--green)", color: "#fff", padding: "14px 32px", borderRadius: "10px", textDecoration: "none", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "1px", minHeight: "52px", display: "flex", alignItems: "center" }}>
          ← VOLTAR À LOJA
        </Link>
      </div>
    );
  }

  // Sucesso após enviar
  if (sent) {
    return (
      <div style={{ minHeight: "100svh", background: "var(--black)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "24px", textAlign: "center" }}>
        <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg,#0a8c2a,#12b83a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", boxShadow: "0 8px 32px rgba(10,140,42,0.5)" }}>✓</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff" }}>
          PEDIDO <span style={{ color: "var(--yellow)" }}>ENVIADO!</span>
        </h1>
        <p style={{ color: "rgba(245,245,245,0.65)", maxWidth: "360px", lineHeight: 1.65, fontSize: "0.92rem" }}>
          Seu pedido foi enviado para nosso WhatsApp. Em breve nossa equipe entrará em contato para confirmar.
        </p>
        <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "16px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "1.5rem" }}>💬</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "1px", color: "var(--green-light)" }}>WHATSAPP</div>
            <div style={{ color: "#fff", fontSize: "0.92rem" }}>(69) 9320-9150</div>
          </div>
        </div>
        <Link href="/" style={{ background: "var(--green)", color: "#fff", padding: "14px 32px", borderRadius: "10px", textDecoration: "none", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "1px", minHeight: "52px", display: "inline-flex", alignItems: "center" }}>
          CONTINUAR COMPRANDO
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--black)", minHeight: "100svh" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(8,8,8,0.97)", backdropFilter: "blur(14px)", borderBottom: "2px solid var(--green)", height: "var(--header-h)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <Image src="/t7estore.jpg" alt="T7" width={34} height={34} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "2px", background: "linear-gradient(135deg,#fff 30%,#f5c800)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>T7 STORE</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--green-light)", fontSize: "0.82rem" }}>
          <span>🔒</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>Checkout Seguro</span>
        </div>
      </header>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px 80px" }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.8rem,5vw,2.4rem)", letterSpacing: "2px", color: "#fff", marginBottom: "4px" }}>
          FINALIZAR <span style={{ color: "var(--yellow)" }}>PEDIDO</span>
        </h1>
        <p style={{ color: "rgba(245,245,245,0.4)", fontSize: "0.85rem", marginBottom: "28px" }}>Preencha seus dados e confirme pelo WhatsApp</p>

        <div style={{ display: "grid", gap: "20px" }} className="checkout-grid">
          {/* ── COLUNA ESQUERDA: Formulário ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Dados pessoais */}
            <section style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "2px", color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "var(--green)", borderRadius: "50%", width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontFamily: "sans-serif", fontWeight: 900 }}>1</span>
                SEUS DADOS
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Field label="Nome completo" required error={errors.nome}>
                  <input style={errors.nome ? inpErr : inp} value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Seu nome completo" data-error={errors.nome ? "" : undefined} />
                </Field>
                <Field label="Telefone / WhatsApp" required error={errors.telefone}>
                  <input style={errors.telefone ? inpErr : inp} value={form.telefone} onChange={e => set("telefone", maskPhone(e.target.value))} placeholder="(00) 00000-0000" inputMode="tel" />
                </Field>
              </div>
            </section>

            {/* Endereço */}
            <section style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "2px", color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "var(--green)", borderRadius: "50%", width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontFamily: "sans-serif", fontWeight: 900 }}>2</span>
                ENDEREÇO DE ENTREGA
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* CEP — busca automática */}
                <Field label="CEP" required error={errors.cep}>
                  <input style={errors.cep ? inpErr : inp} value={form.cep} onChange={e => { const v = maskCep(e.target.value); set("cep", v); if (v.replace(/\D/g,"").length === 8) fetchCep(v); }} placeholder="00000-000" inputMode="numeric" maxLength={9} />
                </Field>

                <Field label="Endereço" required error={errors.endereco}>
                  <input style={errors.endereco ? inpErr : inp} value={form.endereco} onChange={e => set("endereco", e.target.value)} placeholder="Rua, Avenida..." />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "10px" }}>
                  <Field label="Número" required error={errors.numero}>
                    <input style={errors.numero ? inpErr : inp} value={form.numero} onChange={e => set("numero", e.target.value)} placeholder="123" inputMode="numeric" />
                  </Field>
                  <Field label="Complemento">
                    <input style={inp} value={form.complemento} onChange={e => set("complemento", e.target.value)} placeholder="Apto, Bloco..." />
                  </Field>
                </div>

                <Field label="Bairro" required error={errors.bairro}>
                  <input style={errors.bairro ? inpErr : inp} value={form.bairro} onChange={e => set("bairro", e.target.value)} placeholder="Seu bairro" />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: "10px" }}>
                  <Field label="Cidade" required error={errors.cidade}>
                    <input style={errors.cidade ? inpErr : inp} value={form.cidade} onChange={e => set("cidade", e.target.value)} placeholder="Sua cidade" />
                  </Field>
                  <Field label="Estado" required error={errors.estado}>
                    <select style={errors.estado ? { ...inpErr, cursor: "pointer" } : { ...inp, cursor: "pointer" }} value={form.estado} onChange={e => set("estado", e.target.value)}>
                      <option value="">UF</option>
                      {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            </section>

            {/* Pagamento */}
            <section style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "2px", color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "var(--green)", borderRadius: "50%", width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontFamily: "sans-serif", fontWeight: 900 }}>3</span>
                FORMA DE PAGAMENTO
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {PAY_OPTIONS.map(opt => (
                  <button key={opt.id} type="button" onClick={() => setPayment(opt.id)}
                    style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: payment === opt.id ? "rgba(10,140,42,0.12)" : "rgba(255,255,255,0.03)", border: `1.5px solid ${payment === opt.id ? "var(--green)" : "rgba(255,255,255,0.1)"}`, borderRadius: "12px", cursor: "pointer", textAlign: "left", width: "100%", transition: "all .15s", minHeight: "58px" }}>
                    <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#fff" }}>{opt.label}</div>
                      <div style={{ fontSize: "0.75rem", color: opt.id === "pix" ? "var(--green-light)" : "rgba(245,245,245,0.45)" }}>{opt.desc}</div>
                    </div>
                    {/* Radio visual */}
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${payment === opt.id ? "var(--green)" : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {payment === opt.id && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--green)" }} />}
                    </div>
                  </button>
                ))}
              </div>

              {payment === "pix" && (
                <div style={{ marginTop: "12px", background: "rgba(10,140,42,0.1)", border: "1px solid rgba(10,140,42,0.3)", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span>💚</span>
                  <div style={{ fontSize: "0.82rem" }}>
                    <strong style={{ color: "#fff" }}>5% de desconto no PIX!</strong>
                    <span style={{ color: "rgba(245,245,245,0.6)" }}> Economize R$ {fmt(pixDiscount)}</span>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* ── COLUNA DIREITA: Resumo ── */}
          <div>
            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", position: "sticky", top: "calc(var(--header-h) + 16px)" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "2px", color: "#fff", marginBottom: "16px" }}>
                RESUMO DO PEDIDO
              </h2>

              {/* Itens */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px", maxHeight: "280px", overflowY: "auto" }}>
                {cart.map(item => (
                  <div key={item.uid} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "10px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "var(--dark3)", overflow: "hidden", flexShrink: 0 }}>
                      {item.image_url ? <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", opacity: 0.4 }}>{item.category === "tenis" ? "👟" : "⚽"}</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.8rem", color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.club}</div>
                      <div style={{ fontSize: "0.72rem", color: "rgba(245,245,245,0.4)" }}>{item.name} · {item.category === "tenis" ? "Nº" : "Tam."} {item.size}</div>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", color: "var(--yellow)", flexShrink: 0 }}>R$ {fmt(item.price)}</div>
                  </div>
                ))}
              </div>

              {/* Totais */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.83rem", color: "rgba(245,245,245,0.55)" }}>
                  <span>Subtotal ({cart.length} {cart.length === 1 ? "item" : "itens"})</span>
                  <span>R$ {fmt(cartSubtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.83rem" }}>
                  <span style={{ color: shipping === 0 ? "var(--green-light)" : "rgba(245,245,245,0.55)" }}>Frete</span>
                  <span style={{ color: shipping === 0 ? "var(--green-light)" : "rgba(245,245,245,0.55)" }}>{shipping === 0 ? "Grátis 🎉" : `R$ ${fmt(shipping)}`}</span>
                </div>
                {payment === "pix" && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.83rem", color: "var(--green-light)" }}>
                    <span>Desconto PIX (5%)</span>
                    <span>-R$ {fmt(pixDiscount)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.92rem", color: "#fff" }}>TOTAL</span>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.7rem", color: "var(--yellow)" }}>R$ {fmt(total)}</span>
                </div>
              </div>

              {/* Botão principal */}
              <button onClick={handleSubmit}
                style={{ width: "100%", marginTop: "16px", background: "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", padding: "17px 20px", borderRadius: "12px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", color: "#fff", cursor: "pointer", boxShadow: "0 6px 24px rgba(10,140,42,0.45)", minHeight: "56px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.2rem" }}>💬</span>
                CONFIRMAR PELO WHATSAPP
              </button>

              {/* Trust badges */}
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "14px", flexWrap: "wrap" }}>
                {["🔒 Seguro", "⚡ Rápido", "✅ Confiável"].map(b => (
                  <span key={b} style={{ fontSize: "0.72rem", color: "rgba(245,245,245,0.35)", fontFamily: "'Barlow Condensed', sans-serif" }}>{b}</span>
                ))}
              </div>

              <p style={{ textAlign: "center", fontSize: "0.72rem", color: "rgba(245,245,245,0.25)", marginTop: "10px", lineHeight: 1.5 }}>
                Ao confirmar, você será redirecionado ao WhatsApp com seu pedido completo.
              </p>
            </div>
          </div>
        </div>

        {/* Botão flutuante mobile — aparece só em mobile */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--dark2)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px", zIndex: 40 }} className="md:hidden safe-bottom">
          <button onClick={handleSubmit}
            style={{ width: "100%", background: "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", padding: "16px", borderRadius: "12px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", color: "#fff", cursor: "pointer", boxShadow: "0 4px 20px rgba(10,140,42,0.45)", minHeight: "52px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            💬 CONFIRMAR PELO WHATSAPP · R$ {fmt(total)}
          </button>
        </div>
      </main>
    </div>
  );
}
