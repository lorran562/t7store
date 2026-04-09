"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase, Product, getSizes, uploadProductImage } from "@/lib/supabase";
import Link from "next/link";

type FormData = {
  club: string; name: string; meta: string; description: string;
  price: string; old_price: string; badge: string;
  category: string; active: boolean; stock: string;
  sizes: string[]; image_url: string;
};

const empty: FormData = {
  club: "", name: "", meta: "", description: "", price: "", old_price: "",
  badge: "", category: "nacional", active: true, stock: "10", sizes: [], image_url: "",
};

export default function ProductForm({ product, isEdit }: { product?: Product; isEdit?: boolean }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormData>(product ? {
    club: product.club, name: product.name, meta: product.meta,
    description: product.description || "",
    price: String(product.price),
    old_price: product.old_price ? String(product.old_price) : "",
    badge: product.badge || "", category: product.category,
    active: product.active, stock: String(product.stock),
    sizes: product.sizes || getSizes(product.category),
    image_url: product.image_url || "",
  } : empty);
  const [imagePreview, setImagePreview] = useState(product?.image_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FormData, v: string | boolean | string[]) => setForm(p => ({ ...p, [k]: v }));

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setImagePreview(URL.createObjectURL(f));
    const url = await uploadProductImage(f);
    if (url) { set("image_url", url); setImagePreview(url); }
    else setError("Erro no upload. Use uma URL direta.");
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.club || !form.name || !form.price) { setError("Preencha clube, nome e preço."); return; }
    setSaving(true); setError("");
    const payload = {
      club: form.club.trim(), name: form.name.trim(), meta: form.meta.trim(),
      description: form.description.trim(), price: parseFloat(form.price),
      old_price: form.old_price ? parseFloat(form.old_price) : null,
      badge: form.badge || null, category: form.category, active: form.active,
      stock: parseInt(form.stock) || 0,
      sizes: form.sizes.length ? form.sizes : getSizes(form.category),
      image_url: form.image_url.trim(),
    };
    const url = isEdit && product ? `/api/produtos/${product.id}` : "/api/produtos";
    const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (!res.ok) { setError(json.error); setSaving(false); return; }
    router.push("/admin/produtos");
    router.refresh();
  };

  const inp: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "12px 16px", color: "#fff", fontSize: "0.9rem", outline: "none" };
  const lbl: React.CSSProperties = { display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "1px", textTransform: "uppercase", color: "rgba(245,245,245,0.5)", marginBottom: "8px" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
        <Link href="/admin/produtos" style={{ color: "rgba(245,245,245,0.4)", textDecoration: "none", fontSize: "0.9rem" }}>← Produtos</Link>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "2px", color: "#fff" }}>
          {isEdit ? "EDITAR PRODUTO" : "NOVO PRODUTO"}
        </h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px" }}>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "2px", color: "#fff", marginBottom: "20px" }}>INFORMAÇÕES</h3>
              <div style={{ display: "grid", gap: "16px" }}>
                <div><label style={lbl}>Clube / Marca *</label><input style={inp} value={form.club} onChange={e => set("club", e.target.value)} placeholder="Ex: Flamengo, Nike" /></div>
                <div><label style={lbl}>Nome *</label><input style={inp} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ex: Camisa Oficial I 24/25" /></div>
                <div><label style={lbl}>Meta</label><input style={inp} value={form.meta} onChange={e => set("meta", e.target.value)} placeholder="Ex: Home · Adidas · 2024/25" /></div>
                <div><label style={lbl}>Descrição</label><textarea style={{ ...inp, minHeight: "80px", resize: "vertical" } as React.CSSProperties} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Descreva o produto..." /></div>
              </div>
            </div>
            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px" }}>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "2px", color: "#fff", marginBottom: "20px" }}>PREÇO E ESTOQUE</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div><label style={lbl}>Preço *</label><input style={inp} type="number" step="0.01" min="0" value={form.price} onChange={e => set("price", e.target.value)} placeholder="189.90" /></div>
                <div><label style={lbl}>Preço antigo</label><input style={inp} type="number" step="0.01" min="0" value={form.old_price} onChange={e => set("old_price", e.target.value)} placeholder="239.90" /></div>
                <div><label style={lbl}>Estoque</label><input style={inp} type="number" min="0" value={form.stock} onChange={e => set("stock", e.target.value)} /></div>
              </div>
            </div>
            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px" }}>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "2px", color: "#fff", marginBottom: "20px" }}>CATEGORIA, BADGE E TAMANHOS</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={lbl}>Categoria *</label>
                  <select style={{ ...inp, cursor: "pointer" }} value={form.category} onChange={e => { const cat = e.target.value; set("category", cat); set("sizes", getSizes(cat)); }}>
                    <option value="nacional">Nacionais</option>
                    <option value="internacional">Internacionais</option>
                    <option value="selecao">Seleções</option>
                    <option value="retro">Retrô</option>
                    <option value="tenis">👟 Tênis</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Badge</label>
                  <select style={{ ...inp, cursor: "pointer" }} value={form.badge} onChange={e => set("badge", e.target.value)}>
                    <option value="">Sem badge</option>
                    <option value="new">🟢 Novo</option>
                    <option value="sale">🔴 Oferta</option>
                    <option value="retro">🟡 Retrô</option>
                  </select>
                </div>
              </div>
              <label style={lbl}>Tamanhos</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {getSizes(form.category).map(size => {
                  const active = form.sizes.includes(size);
                  return (
                    <button key={size} type="button" onClick={() => set("sizes", active ? form.sizes.filter(s => s !== size) : [...form.sizes, size])}
                      style={{ background: active ? "var(--green)" : "rgba(255,255,255,0.05)", border: `1px solid ${active ? "var(--green)" : "rgba(255,255,255,0.15)"}`, color: active ? "#fff" : "rgba(245,245,245,0.6)", padding: "6px 14px", borderRadius: "6px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Imagem */}
            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px" }}>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "2px", color: "#fff", marginBottom: "16px" }}>📸 IMAGEM</h3>
              <div onClick={() => !uploading && fileRef.current?.click()}
                style={{ width: "100%", aspectRatio: "1", background: "var(--dark3)", borderRadius: "12px", overflow: "hidden", marginBottom: "12px", cursor: "pointer", border: "2px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {uploading && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ color: "#fff", fontSize: "0.85rem", fontFamily: "'Barlow Condensed', sans-serif" }}>ENVIANDO...</div>
                  </div>
                )}
                {imagePreview
                  ? <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImagePreview("")} />
                  : <div style={{ textAlign: "center", color: "rgba(245,245,245,0.3)" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📷</div>
                      <div style={{ fontSize: "0.75rem", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "1px" }}>Clique para upload</div>
                    </div>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", color: "rgba(245,245,245,0.7)", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", marginBottom: "12px" }}>
                {uploading ? "ENVIANDO..." : imagePreview ? "📷 TROCAR" : "📷 UPLOAD"}
              </button>
              <label style={lbl}>Ou cole uma URL:</label>
              <input style={inp} value={form.image_url} onChange={e => { set("image_url", e.target.value); setImagePreview(e.target.value); }} placeholder="https://..." />
            </div>

            <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px" }}>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "2px", color: "#fff", marginBottom: "16px" }}>STATUS</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }} onClick={() => set("active", !form.active)}>
                <div style={{ width: "48px", height: "26px", borderRadius: "13px", background: form.active ? "var(--green)" : "rgba(255,255,255,0.1)", position: "relative", transition: "background .2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: "3px", left: form.active ? "24px" : "3px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
                </div>
                <span style={{ color: form.active ? "#fff" : "rgba(245,245,245,0.4)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
                  {form.active ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>

            {error && <div style={{ background: "rgba(224,60,60,0.15)", border: "1px solid rgba(224,60,60,0.4)", borderRadius: "10px", padding: "12px 16px", fontSize: "0.85rem", color: "#ff6b6b" }}>{error}</div>}

            <button type="submit" disabled={saving}
              style={{ background: saving ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", borderRadius: "12px", padding: "16px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.05rem", letterSpacing: "2px", textTransform: "uppercase", color: "#fff", cursor: saving ? "wait" : "pointer", boxShadow: "0 4px 20px rgba(10,140,42,0.4)" }}>
              {saving ? "SALVANDO..." : isEdit ? "SALVAR ALTERAÇÕES" : "CRIAR PRODUTO"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
