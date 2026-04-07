import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "T7 Store - Camisas de Futebol Premium | Entrega Rapida",
  description:
    "Camisas dos maiores clubes nacionais e internacionais. Qualidade AAA+, frete gratis acima de R$299. Entrega rapida para todo o Brasil. Pague com Pix e ganhe 5% de desconto!",
  keywords: [
    "camisas de futebol",
    "camisa de time",
    "camisa flamengo",
    "camisa corinthians",
    "camisa selecao brasileira",
    "camisas retro",
    "camisas premium",
  ],
  openGraph: {
    title: "T7 Store - Camisas de Futebol Premium",
    description: "As melhores camisas de futebol do Brasil. Qualidade premium, preco justo.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a8c2a",
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
