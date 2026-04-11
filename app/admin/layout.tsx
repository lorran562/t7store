import type { Metadata } from "next";
import "../globals.css";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Providers from "@/components/Providers";

export const metadata: Metadata = { title: "Admin — T7 Store" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <div style={{ display:"flex", minHeight:"100vh", background:"var(--black)" }}>
            <AdminSidebar />
            {/* PC: margem esquerda da sidebar (240px). Mobile: sem margem, padding bottom para bottom nav */}
            <main className="md:ml-[240px]" style={{ flex:1, padding:"28px 24px", overflowY:"auto" }}>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
