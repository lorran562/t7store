import Link from "next/link";

const payments = ["PIX", "VISA", "MASTER", "BOLETO", "ELO"];

const links = {
  institucional: [
    { label: "Sobre nós", href: "#" },
    { label: "Política de Privacidade", href: "#" },
    { label: "Termos de Uso", href: "#" },
    { label: "Trocas e Devoluções", href: "#" },
  ],
  categorias: [
    { label: "Clubes Nacionais", href: "/#produtos" },
    { label: "Clubes Internacionais", href: "/#produtos" },
    { label: "Seleções", href: "/#produtos" },
    { label: "Camisas Retrô", href: "/#produtos" },
  ],
  contato: [
    { label: "WhatsApp", href: "https://wa.me/5500000000000", icon: "💬" },
    { label: "contato@t7store.com", href: "mailto:contato@t7store.com", icon: "📧" },
    { label: "@t7store", href: "#", icon: "📷" },
  ],
};

export default function Footer() {
  return (
    <footer
      id="contato"
      style={{
        background: "#050505",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Newsletter */}
      <div
        style={{
          background: "linear-gradient(90deg, rgba(10,140,42,0.15), rgba(10,140,42,0.05))",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          padding: "40px 5vw",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.8rem",
              letterSpacing: "2px",
              color: "#fff",
              marginBottom: "8px",
            }}
          >
            RECEBA <span style={{ color: "var(--yellow)" }}>OFERTAS EXCLUSIVAS</span>
          </h3>
          <p
            style={{
              fontSize: "0.92rem",
              color: "rgba(245,245,245,0.6)",
              marginBottom: "20px",
            }}
          >
            Cadastre-se e ganhe 10% de desconto na primeira compra!
          </p>
          <div
            style={{
              display: "flex",
              gap: "10px",
              maxWidth: "450px",
              margin: "0 auto",
            }}
            className="flex-col sm:flex-row"
          >
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px",
                padding: "14px 18px",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
            <button
              style={{
                background: "var(--green)",
                border: "none",
                borderRadius: "8px",
                padding: "14px 28px",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.92rem",
                letterSpacing: "1px",
                color: "#fff",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              CADASTRAR
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div
        style={{
          padding: "48px 5vw 24px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "2rem",
                letterSpacing: "3px",
                background: "linear-gradient(135deg,#fff 30%,#f5c800)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "16px",
              }}
            >
              T7 STORE
            </div>
            <p
              style={{
                fontSize: "0.88rem",
                color: "rgba(245,245,245,0.55)",
                lineHeight: 1.6,
                marginBottom: "16px",
              }}
            >
              As melhores camisas de futebol do Brasil. Qualidade premium, preço justo e entrega
              rápida para todo o país.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              {["Fb", "Ig", "Tw"].map((social) => (
                <a
                  key={social}
                  href="#"
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(245,245,245,0.5)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  className="hover:border-green-500 hover:text-green-400"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Institucional */}
          <div>
            <h4
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.92rem",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#fff",
                marginBottom: "20px",
              }}
            >
              Institucional
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {links.institucional.map((link) => (
                <li key={link.label} style={{ marginBottom: "12px" }}>
                  <a
                    href={link.href}
                    style={{
                      color: "rgba(245,245,245,0.55)",
                      fontSize: "0.88rem",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    className="hover:text-green-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorias */}
          <div>
            <h4
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.92rem",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#fff",
                marginBottom: "20px",
              }}
            >
              Categorias
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {links.categorias.map((link) => (
                <li key={link.label} style={{ marginBottom: "12px" }}>
                  <Link
                    href={link.href}
                    style={{
                      color: "rgba(245,245,245,0.55)",
                      fontSize: "0.88rem",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    className="hover:text-green-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.92rem",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#fff",
                marginBottom: "20px",
              }}
            >
              Contato
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {links.contato.map((link) => (
                <li key={link.label} style={{ marginBottom: "12px" }}>
                  <a
                    href={link.href}
                    style={{
                      color: "rgba(245,245,245,0.55)",
                      fontSize: "0.88rem",
                      textDecoration: "none",
                      transition: "color 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    className="hover:text-green-400"
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            paddingTop: "24px",
          }}
        >
          <p style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.28)" }}>
            © 2025 T7 Store. Todos os direitos reservados. CNPJ: 00.000.000/0001-00
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {payments.map((p) => (
              <div
                key={p}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "4px",
                  padding: "5px 12px",
                  fontSize: "0.72rem",
                  color: "rgba(245,245,245,0.5)",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  letterSpacing: "1px",
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
