import { supabaseServer } from "@/lib/supabaseServer";
import ProductsSectionClient from "@/components/ProductsSectionClient";

export default async function ProductsSectionServer() {
  const { data: products } = await supabaseServer
    .from("products")
    .select("*")
    .eq("active", true)
    .order("id");

  return <ProductsSectionClient products={products || []} />;
}
