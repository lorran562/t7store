export default function WhatsAppFloat() {
  return (
    <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer" title="WhatsApp"
      style={{ position: "fixed", bottom: "24px", right: "16px", zIndex: 150, width: "52px", height: "52px", background: "#25d366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", textDecoration: "none", color: "#fff", boxShadow: "0 4px 16px rgba(37,211,102,0.5)" }}
      className="hover:scale-110 transition-transform active:scale-95">
      💬
    </a>
  );
}
