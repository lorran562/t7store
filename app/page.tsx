import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import ProductsSection from "@/components/ProductsSection";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Ticker />
        <ProductsSection />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
    </>
  );
}
