import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PromoBanner from "@/components/PromoBanner";
import Ticker from "@/components/Ticker";
import FeaturedProducts from "@/components/FeaturedProducts";
import Benefits from "@/components/Benefits";
import ProductsSectionServer from "@/components/ProductsSectionServer";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export const revalidate = 0;

export default function Home() {
  return (
    <>
      <Header />
      <PromoBanner />
      <main>
        <Hero />
        <Ticker />
        <FeaturedProducts />
        <Benefits />
        <ProductsSectionServer />
        <Testimonials />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
    </>
  );
}
