import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "T7 Store - Camisas de Futebol & Tênis Premium",
  description: "Camisas dos maiores clubes nacionais e internacionais + Tênis esportivos. Qualidade AAA+, frete grátis acima de R$299. Pague com PIX e ganhe 5% de desconto!",
  keywords: ["camisas de futebol", "camisa flamengo", "camisa corinthians", "tênis futebol", "camisas premium", "camisas retro"],
  openGraph: {
    title: "T7 Store - Camisas e Tênis Premium",
    description: "As melhores camisas de futebol do Brasil. Qualidade premium, preço justo.",
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
