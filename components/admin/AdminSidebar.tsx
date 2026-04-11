"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

const navItems = [
  { href: "/admin",         label: "Produtos", icon: "👕" },
  { href: "/admin/pedidos", label: "Pedidos",  icon: "📦" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = () => {
    document.cookie = "admin-auth=; path=/; max-age=0";
    router.push("/admin/login");
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* ── SIDEBAR: desktop ── */}
      <aside className="hidden md:flex" style={{
        width: "220px", background: "var(--dark2)", borderRight: "1px solid rgba(255,255,255,0.07)",
        flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <Image src="/t7estore.jpg" alt="T7" width={36} height={36} style={{ objectFit: "contain", borderRadius: "8px" }} />
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", letterSpacing: "2px", background: "linear-gradient(135deg,#fff 30%,#f5c800)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>T7 STORE</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(245,245,245,0.3)", letterSpacing: "1px", textTransform: "uppercase" }}>Admin Panel</div>
            </div>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "12px" }}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "10px", textDecoration: "none", marginBottom: "4px", background: isActive(item.href) ? "rgba(10,140,42,0.2)" : "transparent", border: isActive(item.href) ? "1px solid rgba(10,140,42,0.4)" : "1px solid transparent", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.92rem", transition: "all .2s" }}>
              <span>{item.icon}</span>
              {item.label}
              {isActive(item.href) && <div style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", background: "var(--green-light)" }} />}
            </Link>
          ))}
        </nav>

        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <Link href="/"
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", textDecoration: "none", color: "rgba(245,245,245,0.4)", fontSize: "0.85rem", marginBottom: "6px" }}>
            🏪 Ver a loja
          </Link>
          <button onClick={handleLogout}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", background: "rgba(224,60,60,0.1)", border: "1px solid rgba(224,60,60,0.2)", color: "#ff6b6b", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.9rem" }}>
            🚪 Sair
          </button>
        </div>
      </aside>

      {/* ── BOTTOM BAR: mobile ── */}
      <nav className="md:hidden" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(14,14,14,0.98)", borderTop: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", zIndex: 100, display: "flex", alignItems: "center", height: "60px", paddingBottom: "env(safe-area-inset-bottom)" }}>
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", textDecoration: "none", color: isActive(item.href) ? "var(--green-light)" : "rgba(245,245,245,0.38)", transition: "color .2s" }}>
            <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
            <span style={{ fontSize: "0.62rem", fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>{item.label}</span>
          </Link>
        ))}
        <Link href="/"
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", textDecoration: "none", color: "rgba(245,245,245,0.38)" }}>
          <span style={{ fontSize: "1.3rem" }}>🏪</span>
          <span style={{ fontSize: "0.62rem", fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>Loja</span>
        </Link>
        <button onClick={handleLogout}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", background: "none", border: "none", color: "rgba(224,60,60,0.6)", cursor: "pointer" }}>
          <span style={{ fontSize: "1.3rem" }}>🚪</span>
          <span style={{ fontSize: "0.62rem", fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>Sair</span>
        </button>
      </nav>

      {/* Espaçador mobile para não sobrepor conteúdo */}
      <div className="md:hidden" style={{ height: "60px" }} />
    </>
  );
}
