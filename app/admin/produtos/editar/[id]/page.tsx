"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/lib/supabase";
import ProductForm from "@/components/admin/ProductForm";

export default function EditarProdutoPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/produtos/${id}`)
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "rgba(245,245,245,0.3)", letterSpacing: "3px" }}>CARREGANDO...</div>
    </div>
  );

  if (!product) return <div style={{ textAlign: "center", padding: "60px", color: "rgba(245,245,245,0.4)" }}>Produto não encontrado</div>;

  return <ProductForm product={product} isEdit />;
}
