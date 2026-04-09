"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { fmt } from "@/lib/supabase";

type PaymentMethod = "pix" | "card" | "boleto";

interface FormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;
  installments: string;
}

export default function CheckoutPage() {
  const { cart, cartTotal, removeFromCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
    installments: "1",
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const shipping = subtotal >= 299 ? 0 : 29.90;
  const pixDiscount = paymentMethod === "pix" ? subtotal * 0.05 : 0;
  const total = subtotal + shipping - pixDiscount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setOrderComplete(true);
  };

  if (cart.length === 0 && !orderComplete) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--black)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          padding: "20px",
        }}
      >
        <div style={{ fontSize: "5rem" }}>🛒</div>
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "2rem",
            color: "#fff",
            textAlign: "center",
          }}
        >
          Seu carrinho está vazio
        </h1>
        <Link
          href="/"
          style={{
            background: "var(--green)",
            color: "#fff",
            padding: "14px 32px",
            borderRadius: "8px",
            textDecoration: "none",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            letterSpacing: "1px",
          }}
        >
          Voltar para a loja
        </Link>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--black)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "100px",
            height: "100px",
            background: "linear-gradient(135deg, var(--green), var(--green-light))",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "3rem",
            marginBottom: "16px",
          }}
        >
          ✓
        </div>
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            color: "#fff",
          }}
        >
          PEDIDO <span style={{ color: "var(--yellow)" }}>CONFIRMADO!</span>
        </h1>
        <p
          style={{
            color: "rgba(245,245,245,0.7)",
            maxWidth: "400px",
            lineHeight: 1.6,
          }}
        >
          Obrigado pela sua compra! Você receberá um e-mail com os detalhes do pedido e
          informações de rastreamento.
        </p>
        <div
          style={{
            background: "var(--dark2)",
            borderRadius: "12px",
            padding: "20px 32px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ fontSize: "0.82rem", color: "rgba(245,245,245,0.5)", marginBottom: "8px" }}>
            Número do pedido
          </div>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.5rem",
              color: "var(--green-light)",
              letterSpacing: "2px",
            }}
          >
            #T7{Date.now().toString().slice(-8)}
          </div>
        </div>
        {paymentMethod === "pix" && (
          <div
            style={{
              background: "var(--dark2)",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid rgba(255,255,255,0.1)",
              maxWidth: "320px",
              width: "100%",
            }}
          >
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: "#fff",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              Pague via PIX
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23000' x='10' y='10' width='10' height='10'/%3E%3Crect fill='%23000' x='20' y='10' width='10' height='10'/%3E%3Crect fill='%23000' x='30' y='10' width='10' height='10'/%3E%3Crect fill='%23000' x='40' y='10' width='10' height='10'/%3E%3Crect fill='%23000' x='50' y='10' width='10' height='10'/%3E%3Crect fill='%23000' x='60' y='10' width='10' height='10'/%3E%3Crect fill='%23000' x='70' y='10' width='10' height='10'/%3E%3Crect fill='%23000' x='10' y='20' width='10' height='10'/%3E%3Crect fill='%23000' x='70' y='20' width='10' height='10'/%3E%3Crect fill='%23000' x='10' y='30' width='10' height='10'/%3E%3Crect fill='%23000' x='30' y='30' width='10' height='10'/%3E%3Crect fill='%23000' x='50' y='30' width='10' height='10'/%3E%3Crect fill='%23000' x='70' y='30' width='10' height='10'/%3E%3Crect fill='%23000' x='10' y='40' width='10' height='10'/%3E%3Crect fill='%23000' x='30' y='40' width='10' height='10'/%3E%3Crect fill='%23000' x='50' y='40' width='10' height='10'/%3E%3Crect fill='%23000' x='70' y='40' width='10' height='10'/%3E%3Crect fill='%23000' x='10' y='50' width='10' height='10'/%3E%3Crect fill='%23000' x='30' y='50' width='10' height='10'/%3E%3Crect fill='%23000' x='50' y='50' width='10' height='10'/%3E%3Crect fill='%23000' x='70' y='50' width='10' height='10'/%3E%3Crect fill='%23000' x='10' y='60' width='10' height='10'/%3E%3Crect fill='%23000' x='70' y='60' width='10' height='10'/%3E%3Crect fill='%23000' x='10' y='70' width='10' height='10'/%3E%3Crect fill='%23000' x='20' y='70' width='10' height='10'/%3E%3Crect fill='%23000' x='30' y='70' width='10' height='10'/%3E%3Crect fill='%23000' x='40' y='70' width='10' height='10'/%3E%3Crect fill='%23000' x='50' y='70' width='10' height='10'/%3E%3Crect fill='%23000' x='60' y='70' width='10' height='10'/%3E%3Crect fill='%23000' x='70' y='70' width='10' height='10'/%3E%3C/svg%3E")`,
                  backgroundSize: "contain",
                }}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.82rem", color: "rgba(245,245,245,0.5)", marginBottom: "8px" }}>
                Valor a pagar
              </div>
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "1.8rem",
                  color: "var(--yellow)",
                }}
              >
                R$ {fmt(total)}
              </div>
            </div>
          </div>
        )}
        <Link
          href="/"
          style={{
            background: "var(--green)",
            color: "#fff",
            padding: "14px 32px",
            borderRadius: "8px",
            textDecoration: "none",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            letterSpacing: "1px",
            marginTop: "16px",
          }}
        >
          Continuar comprando
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{
          background: "rgba(8,8,8,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "2px solid var(--green)",
          padding: "0 5vw",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <Image
            src="/t7estore.jpg"
            alt="T7 Store"
            width={40}
            height={40}
            style={{ objectFit: "contain" }}
          />
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.5rem",
              letterSpacing: "2px",
              background: "linear-gradient(135deg,#fff 30%,#f5c800)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            T7 STORE
          </span>
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--green-light)",
            fontSize: "0.88rem",
          }}
        >
          <span style={{ fontSize: "1.1rem" }}>🔒</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>
            Checkout Seguro
          </span>
        </div>
      </header>

      {/* Progress Steps */}
      <div
        style={{
          background: "var(--dark2)",
          padding: "20px 5vw",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "40px",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          {[
            { num: 1, label: "Dados" },
            { num: 2, label: "Pagamento" },
            { num: 3, label: "Confirmação" },
          ].map((s, index) => (
            <div
              key={s.num}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                opacity: step >= s.num ? 1 : 0.4,
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: step >= s.num ? "var(--green)" : "rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "1rem",
                  color: "#fff",
                }}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  letterSpacing: "1px",
                  color: step >= s.num ? "#fff" : "rgba(255,255,255,0.5)",
                }}
                className="hidden sm:inline"
              >
                {s.label}
              </span>
              {index < 2 && (
                <div
                  style={{
                    width: "40px",
                    height: "2px",
                    background: step > s.num ? "var(--green)" : "rgba(255,255,255,0.1)",
                  }}
                  className="hidden sm:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main
        style={{
          padding: "40px 5vw",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "32px",
          }}
          className="lg:grid-cols-[1fr_400px]"
        >
          {/* Left Column - Forms */}
          <div>
            {step === 1 && (
              <div>
                <h2
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "1.8rem",
                    letterSpacing: "2px",
                    color: "#fff",
                    marginBottom: "24px",
                  }}
                >
                  DADOS <span style={{ color: "var(--yellow)" }}>PESSOAIS</span>
                </h2>

                <div style={{ display: "grid", gap: "16px" }}>
                  <InputField
                    label="Nome completo"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Seu nome completo"
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <InputField
                      label="E-mail"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                    />
                    <InputField
                      label="Telefone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <InputField
                    label="CPF"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                  />
                </div>

                <h3
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "1.5rem",
                    letterSpacing: "2px",
                    color: "#fff",
                    marginTop: "40px",
                    marginBottom: "24px",
                  }}
                >
                  ENDEREÇO DE <span style={{ color: "var(--yellow)" }}>ENTREGA</span>
                </h3>

                <div style={{ display: "grid", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "16px" }}>
                    <InputField
                      label="CEP"
                      name="cep"
                      value={formData.cep}
                      onChange={handleInputChange}
                      placeholder="00000-000"
                    />
                    <InputField
                      label="Endereço"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Rua, Avenida..."
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", gap: "16px" }}>
                    <InputField
                      label="Número"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      placeholder="123"
                    />
                    <InputField
                      label="Complemento"
                      name="complement"
                      value={formData.complement}
                      onChange={handleInputChange}
                      placeholder="Apto, Bloco..."
                    />
                    <InputField
                      label="Bairro"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleInputChange}
                      placeholder="Seu bairro"
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "16px" }}>
                    <InputField
                      label="Cidade"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Sua cidade"
                    />
                    <InputField
                      label="Estado"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="UF"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, var(--green), var(--green-light))",
                    border: "none",
                    padding: "16px",
                    borderRadius: "10px",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 900,
                    fontSize: "1rem",
                    letterSpacing: "2px",
                    color: "#fff",
                    cursor: "pointer",
                    marginTop: "32px",
                    boxShadow: "0 4px 20px rgba(10,140,42,0.4)",
                  }}
                >
                  CONTINUAR PARA PAGAMENTO
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--green-light)",
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  ← Voltar para dados
                </button>

                <h2
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "1.8rem",
                    letterSpacing: "2px",
                    color: "#fff",
                    marginBottom: "24px",
                  }}
                >
                  FORMA DE <span style={{ color: "var(--yellow)" }}>PAGAMENTO</span>
                </h2>

                {/* Payment Methods */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                  {[
                    { id: "pix" as const, label: "PIX", icon: "💚", discount: "5% de desconto" },
                    { id: "card" as const, label: "Cartão de Crédito", icon: "💳", discount: "até 3x sem juros" },
                    { id: "boleto" as const, label: "Boleto Bancário", icon: "📄", discount: "vence em 3 dias" },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "20px",
                        background: paymentMethod === method.id ? "rgba(18,184,58,0.1)" : "var(--dark2)",
                        border: `2px solid ${
                          paymentMethod === method.id ? "var(--green)" : "rgba(255,255,255,0.1)"
                        }`,
                        borderRadius: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>{method.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontWeight: 700,
                            fontSize: "1rem",
                            color: "#fff",
                          }}
                        >
                          {method.label}
                        </div>
                        <div
                          style={{
                            fontSize: "0.82rem",
                            color: method.id === "pix" ? "var(--green-light)" : "rgba(245,245,245,0.5)",
                          }}
                        >
                          {method.discount}
                        </div>
                      </div>
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          border: `2px solid ${
                            paymentMethod === method.id ? "var(--green)" : "rgba(255,255,255,0.2)"
                          }`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {paymentMethod === method.id && (
                          <div
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              background: "var(--green)",
                            }}
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Card Form */}
                {paymentMethod === "card" && (
                  <div
                    style={{
                      background: "var(--dark2)",
                      borderRadius: "16px",
                      padding: "24px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      marginBottom: "24px",
                    }}
                  >
                    <div style={{ display: "grid", gap: "16px" }}>
                      <InputField
                        label="Número do cartão"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="0000 0000 0000 0000"
                      />
                      <InputField
                        label="Nome no cartão"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        placeholder="Como está no cartão"
                      />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                        <InputField
                          label="Validade"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleInputChange}
                          placeholder="MM/AA"
                        />
                        <InputField
                          label="CVV"
                          name="cardCvv"
                          value={formData.cardCvv}
                          onChange={handleInputChange}
                          placeholder="123"
                        />
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontFamily: "'Barlow Condensed', sans-serif",
                              fontWeight: 700,
                              fontSize: "0.82rem",
                              letterSpacing: "1px",
                              color: "rgba(245,245,245,0.65)",
                              marginBottom: "8px",
                            }}
                          >
                            Parcelas
                          </label>
                          <select
                            name="installments"
                            value={formData.installments}
                            onChange={handleInputChange}
                            style={{
                              width: "100%",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.15)",
                              borderRadius: "8px",
                              padding: "14px 16px",
                              color: "#fff",
                              fontSize: "0.95rem",
                            }}
                          >
                            <option value="1">1x R$ {fmt(total)}</option>
                            <option value="2">2x R$ {fmt(total / 2)}</option>
                            <option value="3">3x R$ {fmt(total / 3)}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "pix" && (
                  <div
                    style={{
                      background: "rgba(18,184,58,0.1)",
                      border: "1px solid rgba(18,184,58,0.3)",
                      borderRadius: "12px",
                      padding: "20px",
                      marginBottom: "24px",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <span style={{ fontSize: "2rem" }}>💚</span>
                    <div>
                      <div style={{ fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
                        5% de desconto no PIX!
                      </div>
                      <div style={{ fontSize: "0.88rem", color: "rgba(245,245,245,0.7)" }}>
                        Economize R$ {fmt(pixDiscount)} pagando via PIX
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  style={{
                    width: "100%",
                    background: isProcessing
                      ? "rgba(255,255,255,0.1)"
                      : "linear-gradient(135deg, var(--green), var(--green-light))",
                    border: "none",
                    padding: "18px",
                    borderRadius: "10px",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    letterSpacing: "2px",
                    color: "#fff",
                    cursor: isProcessing ? "wait" : "pointer",
                    boxShadow: isProcessing ? "none" : "0 4px 20px rgba(10,140,42,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                  }}
                >
                  {isProcessing ? (
                    <>
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      PROCESSANDO...
                    </>
                  ) : (
                    `FINALIZAR PEDIDO - R$ ${fmt(total)}`
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div
              style={{
                background: "var(--dark2)",
                borderRadius: "16px",
                padding: "24px",
                border: "1px solid rgba(255,255,255,0.1)",
                position: "sticky",
                top: "100px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "1.3rem",
                  letterSpacing: "2px",
                  color: "#fff",
                  marginBottom: "20px",
                }}
              >
                RESUMO DO PEDIDO
              </h3>

              {/* Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                {cart.map((item) => (
                  <div
                    key={item.uid}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        background: "var(--dark3)",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                      }}
                    >
                      {"📦"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#fff" }}>
                        {item.club}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.5)" }}>
                        Tam: {item.size}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: "1.1rem",
                        color: "var(--yellow)",
                      }}
                    >
                      R$ {fmt(item.price)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.uid)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(245,245,245,0.3)",
                        cursor: "pointer",
                        fontSize: "1rem",
                        padding: "4px",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  paddingTop: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(245,245,245,0.6)" }}>Subtotal</span>
                  <span style={{ color: "#fff" }}>R$ {fmt(subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(245,245,245,0.6)" }}>Frete</span>
                  <span style={{ color: shipping === 0 ? "var(--green-light)" : "#fff" }}>
                    {shipping === 0 ? "Grátis" : `R$ ${fmt(shipping)}`}
                  </span>
                </div>
                {paymentMethod === "pix" && pixDiscount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--green-light)" }}>Desconto PIX (5%)</span>
                    <span style={{ color: "var(--green-light)" }}>-R$ {fmt(pixDiscount)}</span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#fff",
                    }}
                  >
                    TOTAL
                  </span>
                  <span
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "1.8rem",
                      color: "var(--yellow)",
                    }}
                  >
                    R$ {fmt(total)}
                  </span>
                </div>
              </div>

              {/* Trust badges */}
              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  justifyContent: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                {["SSL", "PCI DSS", "LGPD"].map((badge) => (
                  <div
                    key={badge}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      fontSize: "0.72rem",
                      color: "rgba(245,245,245,0.5)",
                      fontWeight: 600,
                    }}
                  >
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: "0.82rem",
          letterSpacing: "1px",
          color: "rgba(245,245,245,0.65)",
          marginBottom: "8px",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "8px",
          padding: "14px 16px",
          color: "#fff",
          fontSize: "0.95rem",
          outline: "none",
          transition: "border-color 0.2s",
        }}
      />
    </div>
  );
}
