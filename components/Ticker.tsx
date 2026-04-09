const items = [
  "FRETE GRÁTIS ACIMA DE R$ 299",
  "PIX COM 5% DE DESCONTO",
  "ENTREGA EM TODO O BRASIL",
  "CAMISAS E TÊNIS PREMIUM",
  "PAGAMENTO 100% SEGURO",
];

export default function Ticker() {
  const doubled = [...items, ...items];
  return (
    <div style={{ background: "var(--green)", padding: "9px 0", overflow: "hidden", borderTop: "2px solid var(--yellow)", borderBottom: "2px solid var(--yellow)" }}>
      <div className="ticker-animate" style={{ display: "flex", whiteSpace: "nowrap" }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "3px", color: "#fff", padding: "0 36px", flexShrink: 0 }}>{item}</span>
            <span style={{ color: "var(--yellow)", padding: "0 16px" }}>★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
