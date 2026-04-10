import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "T7 Store — Camisas de Futebol Premium",
  description: "Camisas dos maiores clubes nacionais e internacionais. Qualidade AAA+, frete grátis acima de R$299.",
  keywords: ["camisas de futebol", "camisa flamengo", "camisa corinthians", "camisas premium"],
  openGraph: {
    title: "T7 Store - Camisas e Tênis Premium",
    description: "Camisas de futebol premium. Qualidade AAA+.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a8c2a",
  // Garante que o viewport considera barras do browser
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
