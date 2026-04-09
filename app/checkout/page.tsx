"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { fmt } from "@/lib/supabase";

type PayMethod = "pix" | "credito" | "debito" | "dinheiro";

const PAY_OPTIONS: { id: PayMethod; label: string; icon: string; desc: string }[] = [
  { id: "pix",      label: "PIX",               icon: "💚", desc: "5% de desconto" },
  { id: "credito",  label: "Cartão de Crédito",  icon: "💳", desc: "Até 3x sem juros" },
  { id: "debito",   label: "Cartão de Débito",   icon: "🏦", desc: "Pagamento na entrega" },
  { id: "dinheiro", label: "Dinheiro",            icon: "💵", desc: "Na entrega" },
];

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const WHATSAPP = "556993209150";

type Form = {
  nome: string; telefone: string; cep: string;
  endereco: string; numero: string; complemento: string;
  bairro: string; cidade: string; estado: string;
};
const EMPTY: Form = { nome: "", telefone: "", cep: "", endereco: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" };

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g,"").slice(0,11);
  if (d.length <= 2)  return `(${d}`;
  if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
};
const maskCep = (v: string) => {
  const d = v.replace(/\D/g,"").slice(0,8);
  return d.length > 5 ? `${d.slice(0,5)}-${d.slice(5)}` : d;
};

function Label({ text, required, error }: { text: string; required?: boolean; error?: string }) {
  return (
    <label style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "1px", textTransform: "uppercase", color: error ? "#ff6b6b" : "rgba(245,245,245,0.5)", marginBottom: "6px" }}>
      {text}{required && <span style={{ color: "#ff6b6b", marginLeft: "3px" }}>*</span>}
      {error && <span style={{ marginLeft: "8px", fontSize: "0.68rem", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{error}</span>}
    </label>
  );
}

const inp = (err?: string): React.CSSProperties => ({
  width: "100%", background: "rgba(255,255,255,0.05)",
  border: `1px solid ${err ? "rgba(224,60,60,0.6)" : "rgba(255,255,255,0.12)"}`,
  borderRadius: "10px", padding: "12px 14px", color: "#fff",
  fontSize: "16px", outline: "none", fontFamily: "inherit",
  transition: "border-color .2s",
});

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useCart();
  const [form, setForm]       = useState<Form>(EMPTY);
  const [payment, setPayment] = useState<PayMethod>("pix");
  const [errors, setErrors]   = useState<Partial<Form>>({});
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);

  // Garantir que o carrinho seja lido do localStorage no cliente
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const shipping   = cartSubtotal >= 299 ? 0 : 29.90;
  const pixDisc    = payment === "pix" ? cartSubtotal * 0.05 : 0;
  const total      = cartSubtotal + shipping - pixDisc;

  const set = (k: keyof Form, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const fetchCep = async (cep: string) => {
    const raw = cep.replace(/\D/g,"");
    if (raw.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const d = await r.json();
      if (!d.erro) setForm(f => ({ ...f, endereco: d.logradouro || f.endereco, bairro: d.bairro || f.bairro, cidade: d.localidade || f.cidade, estado: d.uf || f.estado }));
    } catch {}
  };

  const validate = () => {
    const e: Partial<Form> = {};
    if (!form.nome.trim())       e.nome     = "obrigatório";
    if (form.telefone.replace(/\D/g,"").length < 10) e.telefone = "inválido";
    if (form.cep.replace(/\D/g,"").length < 8) e.cep = "inválido";
    if (!form.endereco.trim())   e.endereco = "obrigatório";
    if (!form.numero.trim())     e.numero   = "obrigatório";
    if (!form.bairro.trim())     e.bairro   = "obrigatório";
    if (!form.cidade.trim())     e.cidade   = "obrigatório";
    if (!form.estado)            e.estado   = "obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildMessage = () => {
    const payLabel = PAY_OPTIONS.find(p => p.id === payment)?.label || "";
    const addr = `${form.endereco}, ${form.numero}${form.complemento ? ` - ${form.complemento}` : ""}, ${form.bairro}, ${form.cidade}/${form.estado}, CEP ${form.cep}`;

    // Agrupar mesmo produto+tamanho
    const groups: Record<string, { name: string; qty: number; price: number }> = {};
    cart.forEach(item => {
      const k = `${item.club} - ${item.name} (${item.size})`;
      const q = item.qty || 1;
      groups[k] = groups[k]
        ? { ...groups[k], qty: groups[k].qty + q }
        : { name: k, qty: q, price: item.price };
    });

    const itens = Object.values(groups)
      .map(i => `• ${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""} — R$ ${fmt(i.price * i.qty)}`)
      .join("\n");

    return [
      `🛒 *NOVO PEDIDO — T7 STORE*`,
      ``,
      `👤 *Nome:* ${form.nome}`,
      `📱 *Telefone:* ${form.telefone}`,
      ``,
      `📍 *Endereço:*`,
      addr,
      ``,
      `🛍️ *Produtos:*`,
      itens,
      ``,
      `━━━━━━━━━━━━━━━━`,
      `Subtotal: R$ ${fmt(cartSubtotal)}`,
      shipping === 0 ? `Frete: Grátis 🎉` : `Frete: R$ ${fmt(shipping)}`,
      payment === "pix" ? `Desconto PIX (5%): -R$ ${fmt(pixDisc)}` : null,
      `*TOTAL: R$ ${fmt(total)}*`,
      ``,
      `💳 *Pagamento:* ${payLabel}`,
    ].filter(Boolean).join("\n");
  };

  const handleSubmit = () => {
    if (!hydrated || cart.length === 0) return;
    if (!validate()) return;
    setSending(true);
    const msg = encodeURIComponent(buildMessage());
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, "_blank");
    clearCart();
    setSent(true);
    setSending(false);
  };

  // Estado: carrinho vazio (antes de enviar)
  if (hydrated && cart.length === 0 && !sent) {
    return (
      <div style={{ minHeight: "100svh", background: "var(--black)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "4rem" }}>🛒</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#fff" }}>Carrinho vazio</h1>
        <p style={{ color: "rgba(245,245,245,0.5)", fontSize: "0.9rem" }}>Adicione produtos antes de finalizar.</p>
        <Link href="/" style={{ background: "var(--green)", color: "#fff", padding: "14px 32px", borderRadius: "10px", textDecoration: "none", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "1px", minHeight: "52px", display: "inline-flex", alignItems: "center" }}>
          ← VOLTAR À LOJA
        </Link>
      </div>
    );
  }

  // Estado: pedido enviado
  if (sent) {
    return (
      <div style={{ minHeight: "100svh", background: "var(--black)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "24px", textAlign: "center" }}>
        <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg,#0a8c2a,#12b83a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", boxShadow: "0 8px 32px rgba(10,140,42,0.5)" }}>✓</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff" }}>
          PEDIDO <span style={{ color: "var(--yellow)" }}>ENVIADO!</span>
        </h1>
        <p style={{ color: "rgba(245,245,245,0.65)", maxWidth: "360px", lineHeight: 1.65, fontSize: "0.92rem" }}>
          Seu pedido foi enviado para o nosso WhatsApp. Em breve nossa equipe entra em contato para confirmar.
        </p>
        <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "16px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "1.5rem" }}>💬</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "1px", color: "var(--green-light)" }}>WHATSAPP</div>
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

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px 100px" }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.8rem,5vw,2.4rem)", letterSpacing: "2px", color: "#fff", marginBottom: "4px" }}>
          FINALIZAR <span style={{ color: "var(--yellow)" }}>PEDIDO</span>
        </h1>
        <p style={{ color: "rgba(245,245,245,0.4)", fontSize: "0.85rem", marginBottom: "28px" }}>Preencha seus dados e confirme pelo WhatsApp</p>

        <div style={{ display: "grid", gap: "20px" }} className="checkout-grid">

          {/* ─── Formulário ─── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Dados pessoais */}
            <section style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "var(--green)", borderRadius: "50%", width: "22px", height: "22px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontFamily: "sans-serif", fontWeight: 900, flexShrink: 0 }}>1</span>
                SEUS DADOS
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <Label text="Nome completo" required error={errors.nome} />
                  <input style={inp(errors.nome)} value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Seu nome completo" autoComplete="name" />
                </div>
                <div>
                  <Label text="Telefone / WhatsApp" required error={errors.telefone} />
                  <input style={inp(errors.telefone)} value={form.telefone} onChange={e => set("telefone", maskPhone(e.target.value))} placeholder="(69) 99999-9999" inputMode="tel" autoComplete="tel" />
                </div>
              </div>
            </section>

            {/* Endereço */}
            <section style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "var(--green)", borderRadius: "50%", width: "22px", height: "22px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontFamily: "sans-serif", fontWeight: 900, flexShrink: 0 }}>2</span>
                ENDEREÇO DE ENTREGA
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <Label text="CEP" required error={errors.cep} />
                  <input style={inp(errors.cep)} value={form.cep} onChange={e => { const v = maskCep(e.target.value); set("cep", v); if (v.replace(/\D/g,"").length === 8) fetchCep(v); }} placeholder="00000-000" inputMode="numeric" maxLength={9} autoComplete="postal-code" />
                </div>
                <div>
                  <Label text="Endereço" required error={errors.endereco} />
                  <input style={inp(errors.endereco)} value={form.endereco} onChange={e => set("endereco", e.target.value)} placeholder="Rua, Avenida..." autoComplete="street-address" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "10px" }}>
                  <div>
                    <Label text="Número" required error={errors.numero} />
                    <input style={inp(errors.numero)} value={form.numero} onChange={e => set("numero", e.target.value)} placeholder="123" inputMode="numeric" />
                  </div>
                  <div>
                    <Label text="Complemento" />
                    <input style={inp()} value={form.complemento} onChange={e => set("complemento", e.target.value)} placeholder="Apto, Casa..." />
                  </div>
                </div>
                <div>
                  <Label text="Bairro" required error={errors.bairro} />
                  <input style={inp(errors.bairro)} value={form.bairro} onChange={e => set("bairro", e.target.value)} placeholder="Seu bairro" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: "10px" }}>
                  <div>
                    <Label text="Cidade" required error={errors.cidade} />
                    <input style={inp(errors.cidade)} value={form.cidade} onChange={e => set("cidade", e.target.value)} placeholder="Sua cidade" autoComplete="address-level2" />
                  </div>
                  <div>
                    <Label text="Estado" required error={errors.estado} />
                    <select style={{ ...inp(errors.estado), cursor: "pointer" }} value={form.estado} onChange={e => set("estado", e.target.value)} autoComplete="address-level1">
                      <option value="">UF</option>
                      {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Pagamento */}
            <section style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "var(--green)", borderRadius: "50%", width: "22px", height: "22px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontFamily: "sans-serif", fontWeight: 900, flexShrink: 0 }}>3</span>
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
                    <span style={{ color: "rgba(245,245,245,0.6)" }}> Economize R$ {fmt(pixDisc)}</span>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* ─── Resumo ─── */}
          <div>
            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", position: "sticky", top: "calc(var(--header-h) + 16px)" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "16px" }}>RESUMO DO PEDIDO</h2>

              {/* Itens */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px", maxHeight: "300px", overflowY: "auto" }}>
                {cart.map(item => {
                  const q = item.qty || 1;
                  return (
                    <div key={item.uid} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "10px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "var(--dark3)", overflow: "hidden", flexShrink: 0 }}>
                        {item.image_url ? <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", opacity: 0.35 }}>{item.category === "tenis" ? "👟" : "⚽"}</div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.8rem", color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.club} — {item.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "rgba(245,245,245,0.4)" }}>
                          {item.category === "tenis" ? "Nº" : "Tam."} {item.size}{q > 1 ? ` · ×${q}` : ""}
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", color: "var(--yellow)", flexShrink: 0 }}>R$ {fmt(item.price * q)}</div>
                    </div>
                  );
                })}
              </div>

              {/* Totais */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "rgba(245,245,245,0.55)" }}>
                  <span>Subtotal</span>
                  <span>R$ {fmt(cartSubtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                  <span style={{ color: shipping === 0 ? "var(--green-light)" : "rgba(245,245,245,0.55)" }}>Frete</span>
                  <span style={{ color: shipping === 0 ? "var(--green-light)" : "rgba(245,245,245,0.55)" }}>{shipping === 0 ? "Grátis 🎉" : `R$ ${fmt(shipping)}`}</span>
                </div>
                {payment === "pix" && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--green-light)" }}>
                    <span>Desconto PIX (5%)</span>
                    <span>-R$ {fmt(pixDisc)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#fff" }}>TOTAL</span>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.7rem", color: "var(--yellow)" }}>R$ {fmt(total)}</span>
                </div>
              </div>

              {/* Botão desktop */}
              <button
                onClick={handleSubmit}
                disabled={sending}
                style={{ width: "100%", marginTop: "16px", background: sending ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", padding: "16px 20px", borderRadius: "12px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", color: "#fff", cursor: sending ? "wait" : "pointer", boxShadow: sending ? "none" : "0 6px 24px rgba(10,140,42,0.45)", minHeight: "54px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
                className="hidden md:flex"
              >
                <span style={{ fontSize: "1.2rem" }}>💬</span>
                CONFIRMAR PELO WHATSAPP
              </button>

              <p style={{ textAlign: "center", fontSize: "0.72rem", color: "rgba(245,245,245,0.25)", marginTop: "12px", lineHeight: 1.5 }} className="hidden md:block">
                Você será redirecionado ao WhatsApp com o pedido completo.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Botão flutuante mobile ─── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(20,20,20,0.97)", borderTop: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", padding: "12px 16px", zIndex: 40 }} className="md:hidden safe-bottom">
        <button
          onClick={handleSubmit}
          disabled={sending}
          style={{ width: "100%", background: sending ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", padding: "16px", borderRadius: "12px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", color: "#fff", cursor: sending ? "wait" : "pointer", boxShadow: "0 4px 20px rgba(10,140,42,0.45)", minHeight: "52px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          💬 CONFIRMAR · R$ {fmt(total)}
        </button>
      </div>
    </div>
  );
}
