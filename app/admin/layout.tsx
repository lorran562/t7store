import type { Metadata } from "next";
import "../globals.css";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Admin — T7 Store",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <div style={{ display: "flex", minHeight: "100vh", background: "var(--black)" }}>
            <AdminSidebar />
            <main style={{ flex: 1, padding: "32px", overflowY: "auto", marginLeft: "240px" }}>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
