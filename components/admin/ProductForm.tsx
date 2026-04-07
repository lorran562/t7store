"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase, DbProduct } from "@/lib/supabase";
import Link from "next/link";

type ProductForm = {
  club: string; name: string; meta: string;
  price: string; old_price: string;
  badge: string; category: string;
  emoji: string; active: boolean; stock: string;
};

const empty: ProductForm = {
  club: "", name: "", meta: "", price: "", old_price: "",
  badge: "", category: "nacional", emoji: "⚽", active: true, stock: "10",
};

interface Props {
  product?: DbProduct;
  isEdit?: boolean;
}

export default function ProductForm({ product, isEdit }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProductForm>(
    product ? {
      club: product.club, name: product.name, meta: product.meta,
      price: String(product.price), old_price: product.old_price ? String(product.old_price) : "",
      badge: product.badge || "", category: product.category,
      emoji: product.emoji, active: product.active, stock: String(product.stock),
    } : empty
  );
  const [imagePreview, setImagePreview] = useState<string>(product?.image_url || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof ProductForm, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return product?.image_url || null;
    const ext = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile, { upsert: true });
    if (error) { console.error(error); return null; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!form.club || !form.name || !form.price || !form.category) {
      setError("Preencha os campos obrigatórios.");
      setSaving(false); return;
    }

    const imageUrl = await uploadImage();
    const payload = {
      club: form.club, name: form.name, meta: form.meta,
      price: parseFloat(form.price),
      old_price: form.old_price ? parseFloat(form.old_price) : null,
      badge: form.badge || null, category: form.category,
      emoji: form.emoji, active: form.active,
      stock: parseInt(form.stock) || 0,
      ...(imageUrl !== null && { image_url: imageUrl }),
    };

    if (isEdit && product) {
      const { error } = await supabase.from("products").update(payload).eq("id", product.id);
      if (error) { setError("Erro ao salvar. Tente novamente."); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { setError("Erro ao criar produto. Tente novamente."); setSaving(false); return; }
    }

    router.push("/admin/produtos");
    router.refresh();
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px",
    padding: "12px 16px", color: "#fff", fontSize: "0.9rem", outline: "none",
  };
  const labelStyle = {
    display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
    fontSize: "0.75rem", letterSpacing: "1px", textTransform: "uppercase" as const,
    color: "rgba(245,245,245,0.5)", marginBottom: "8px",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
        <Link href="/admin/produtos"
          style={{ color: "rgba(245,245,245,0.4)", textDecoration: "none", fontSize: "0.9rem" }}>
          ← Produtos
        </Link>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem",
          letterSpacing: "2px", color: "#fff" }}>
          {isEdit ? "EDITAR PRODUTO" : "NOVO PRODUTO"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px",
          alignItems: "start" }}>

          {/* Coluna principal */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px", padding: "28px" }}>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem",
                letterSpacing: "2px", color: "#fff", marginBottom: "20px" }}>
                INFORMAÇÕES
              </h3>
              <div style={{ display: "grid", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div><label style={labelStyle}>Clube *</label>
                    <input style={inputStyle} value={form.club} onChange={e => set("club", e.target.value)}
                      placeholder="Ex: Flamengo" required /></div>
                  <div><label style={labelStyle}>Emoji</label>
                    <input style={inputStyle} value={form.emoji} onChange={e => set("emoji", e.target.value)}
                      placeholder="⚽" maxLength={4} /></div>
                </div>
                <div><label style={labelStyle}>Nome do produto *</label>
                  <input style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)}
                    placeholder="Ex: Camisa Oficial I 24/25" required /></div>
                <div><label style={labelStyle}>Meta (fornecedor/temporada)</label>
                  <input style={inputStyle} value={form.meta} onChange={e => set("meta", e.target.value)}
                    placeholder="Ex: Home · Adidas · 2024/25" /></div>
              </div>
            </div>

            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px", padding: "28px" }}>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem",
                letterSpacing: "2px", color: "#fff", marginBottom: "20px" }}>
                PREÇO E ESTOQUE
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div><label style={labelStyle}>Preço *</label>
                  <input style={inputStyle} type="number" step="0.01" min="0"
                    value={form.price} onChange={e => set("price", e.target.value)}
                    placeholder="189.90" required /></div>
                <div><label style={labelStyle}>Preço antigo (opcional)</label>
                  <input style={inputStyle} type="number" step="0.01" min="0"
                    value={form.old_price} onChange={e => set("old_price", e.target.value)}
                    placeholder="239.90" /></div>
                <div><label style={labelStyle}>Estoque</label>
                  <input style={inputStyle} type="number" min="0"
                    value={form.stock} onChange={e => set("stock", e.target.value)}
                    placeholder="10" /></div>
              </div>
            </div>

            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px", padding: "28px" }}>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem",
                letterSpacing: "2px", color: "#fff", marginBottom: "20px" }}>
                CATEGORIA E BADGE
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Categoria *</label>
                  <select style={{ ...inputStyle, cursor: "pointer" }}
                    value={form.category} onChange={e => set("category", e.target.value)}>
                    {[["nacional","Nacionais"],["internacional","Internacionais"],
                      ["selecao","Seleções"],["retro","Retrô"]].map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Badge</label>
                  <select style={{ ...inputStyle, cursor: "pointer" }}
                    value={form.badge} onChange={e => set("badge", e.target.value)}>
                    <option value="">Sem badge</option>
                    <option value="new">🆕 Novo</option>
                    <option value="sale">🔥 Oferta</option>
                    <option value="retro">⭐ Retrô</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna lateral */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Upload foto */}
            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px", padding: "24px" }}>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem",
                letterSpacing: "2px", color: "#fff", marginBottom: "16px" }}>
                FOTO DO PRODUTO
              </h3>
              <div onClick={() => fileRef.current?.click()}
                style={{ width: "100%", aspectRatio: "1", background: "var(--dark3)",
                  borderRadius: "12px", display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer", overflow: "hidden",
                  border: "2px dashed rgba(255,255,255,0.1)", marginBottom: "12px",
                  transition: "border-color .2s" }}>
                {imagePreview
                  ? <img src={imagePreview} alt="preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ textAlign: "center", color: "rgba(245,245,245,0.3)" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>{form.emoji || "📷"}</div>
                      <div style={{ fontSize: "0.8rem" }}>Clique para enviar foto</div>
                    </div>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*"
                onChange={handleImageChange} style={{ display: "none" }} />
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{ width: "100%", background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
                  padding: "10px", color: "rgba(245,245,245,0.7)", cursor: "pointer",
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: "0.85rem", letterSpacing: "1px" }}>
                📷 {imagePreview ? "TROCAR FOTO" : "ESCOLHER FOTO"}
              </button>
            </div>

            {/* Status */}
            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px", padding: "24px" }}>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem",
                letterSpacing: "2px", color: "#fff", marginBottom: "16px" }}>
                STATUS
              </h3>
              <label style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}>
                <div onClick={() => set("active", !form.active)}
                  style={{ width: "48px", height: "26px", borderRadius: "13px",
                    background: form.active ? "var(--green)" : "rgba(255,255,255,0.1)",
                    position: "relative", transition: "background .2s", cursor: "pointer",
                    flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: "3px",
                    left: form.active ? "24px" : "3px", width: "20px", height: "20px",
                    borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
                </div>
                <span style={{ color: form.active ? "#fff" : "rgba(245,245,245,0.4)",
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>
                  {form.active ? "Produto ativo" : "Produto inativo"}
                </span>
              </label>
              <p style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.35)", marginTop: "10px" }}>
                {form.active ? "Visível na loja" : "Oculto da loja"}
              </p>
            </div>

            {/* Salvar */}
            {error && (
              <div style={{ background: "rgba(224,60,60,0.15)",
                border: "1px solid rgba(224,60,60,0.4)", borderRadius: "10px",
                padding: "12px 16px", fontSize: "0.88rem", color: "#ff6b6b" }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={saving}
              style={{ background: saving ? "rgba(255,255,255,0.1)"
                : "linear-gradient(135deg,#0a8c2a,#12b83a)",
                border: "none", borderRadius: "12px", padding: "16px",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                fontSize: "1.05rem", letterSpacing: "2px", textTransform: "uppercase",
                color: "#fff", cursor: saving ? "wait" : "pointer",
                boxShadow: saving ? "none" : "0 4px 20px rgba(10,140,42,0.4)" }}>
              {saving ? "SALVANDO..." : (isEdit ? "💾 SALVAR ALTERAÇÕES" : "➕ CRIAR PRODUTO")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
