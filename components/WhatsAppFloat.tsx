export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/5500000000000"
      target="_blank"
      rel="noopener noreferrer"
      title="WhatsApp"
      style={{
        position: "fixed", bottom: "26px", right: "26px", zIndex: 150,
        width: "54px", height: "54px", background: "#25d366", borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.6rem", textDecoration: "none", color: "#fff",
        boxShadow: "0 4px 18px rgba(37,211,102,0.5)",
      }}
      className="hover:scale-110 transition-transform"
    >
      💬
    </a>
  );
}
