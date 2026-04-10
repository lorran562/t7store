"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password === "02608151280") {
      document.cookie = "admin-auth=t7store-admin; path=/; max-age=86400";
      router.push("/admin");
      router.refresh();
    } else {
      setError("Senha incorreta.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--black)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }}>
      <div style={{
        background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px", padding: "48px 40px", width: "100%", maxWidth: "400px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <Image src="/t7estore.jpg" alt="T7 Store" width={72} height={72}
            style={{ objectFit: "contain", borderRadius: "12px", marginBottom: "12px",
              filter: "drop-shadow(0 0 16px rgba(18,184,58,0.5))" }} />
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem",
            letterSpacing: "3px", background: "linear-gradient(135deg,#fff 30%,#f5c800)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            T7 STORE ADMIN
          </div>
          <div style={{ fontSize: "0.82rem", color: "rgba(245,245,245,0.4)", marginTop: "4px" }}>
            Painel de Gerenciamento
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontFamily: "var(--font-body)",
              fontWeight: 700, fontSize: "0.8rem", letterSpacing: "1px", textTransform: "uppercase",
              color: "rgba(245,245,245,0.55)", marginBottom: "8px" }}>
              Senha
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required autoFocus
              style={{ width: "100%", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px",
                padding: "14px 16px", color: "#fff", fontSize: "0.95rem", outline: "none" }} />
          </div>

          {error && (
            <div style={{ background: "rgba(224,60,60,0.15)", border: "1px solid rgba(224,60,60,0.4)",
              borderRadius: "8px", padding: "12px 16px", fontSize: "0.88rem", color: "#ff6b6b" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#0a8c2a,#12b83a)",
              border: "none", borderRadius: "10px", padding: "16px", marginTop: "8px",
              fontFamily: "var(--font-body)", fontWeight: 900, fontSize: "1rem",
              letterSpacing: "2px", textTransform: "uppercase", color: "#fff",
              cursor: loading ? "wait" : "pointer" }}>
            {loading ? "ENTRANDO..." : "ENTRAR NO PAINEL"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <a href="/" style={{ fontSize: "0.82rem", color: "rgba(245,245,245,0.35)", textDecoration: "none" }}>
            ← Voltar para a loja
          </a>
        </div>
      </div>
    </div>
  );
}
