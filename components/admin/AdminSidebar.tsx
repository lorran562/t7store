"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "admin-auth=; path=/; max-age=0";
    router.push("/admin/login");
  };

  return (
    <aside style={{
      width: "220px", background: "var(--dark2)", borderRight: "1px solid rgba(255,255,255,0.07)",
      display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
    }}>
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <Image src="/t7estore.jpg" alt="T7" width={36} height={36} style={{ objectFit: "contain", borderRadius: "8px" }} />
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", letterSpacing: "2px", background: "linear-gradient(135deg,#fff 30%,#f5c800)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>T7 STORE</div>
            <div style={{ fontSize: "0.65rem", color: "rgba(245,245,245,0.35)", letterSpacing: "1px", textTransform: "uppercase" }}>Admin Panel</div>
          </div>
        </Link>
      </div>

      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <Link href="/admin"
          style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "10px", textDecoration: "none",
            background: "rgba(10,140,42,0.2)", border: "1px solid rgba(10,140,42,0.4)", color: "#fff",
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.95rem" }}>
          <span>👕</span> Produtos
          <div style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", background: "var(--green-light)" }} />
        </Link>
      </nav>

      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", textDecoration: "none", color: "rgba(245,245,245,0.4)", fontSize: "0.85rem", marginBottom: "8px" }}>
          🏪 Ver a loja
        </Link>
        <button onClick={handleLogout}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", background: "rgba(224,60,60,0.1)", border: "1px solid rgba(224,60,60,0.2)", color: "#ff6b6b", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.9rem" }}>
          🚪 Sair
        </button>
      </div>
    </aside>
  );
}
