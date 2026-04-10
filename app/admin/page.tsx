"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, Product, ProductVariation, VariationForm, fmt, getSizes, uploadProductImage, isTenis } from "@/lib/supabase";

type FormState = {
  club: string; brand: string; name: string; meta: string; description: string;
  price: string; old_price: string; badge: string;
  type: "camisa" | "tenis"; category: string; active: boolean;
  image_url: string;
};

const EMPTY_FORM: FormState = {
  club: "", brand: "", name: "", meta: "", description: "", price: "", old_price: "",
  badge: "", type: "camisa", category: "nacional", active: true, image_url: "",
};

function newVar(): VariationForm {
  return { tempId: Math.random().toString(36).slice(2), color: "", size: "", stock: 5, price: "", image_url: "" };
}

const badgeColor: Record<string, string> = { sale: "#e03c3c", new: "#12b83a", retro: "#f5c800" };

const inp: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "0.88rem", outline: "none" };
const lbl: React.CSSProperties = { display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "1px", textTransform: "uppercase", color: "rgba(245,245,245,0.45)", marginBottom: "6px" };

export default function AdminPage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [tab, setTab]             = useState<"list" | "edit">("list");
  const [isNew, setIsNew]         = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();
  const [form, setForm]           = useState<FormState>(EMPTY_FORM);
  const [variations, setVariations] = useState<VariationForm[]>([newVar()]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const varFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(async () => {
    const { data: prods } = await supabase.from("products").select("*").order("category").order("id");
    if (!prods) return;
    const { data: vars } = await supabase.from("product_variations").select("*");
    const varMap: Record<number, ProductVariation[]> = {};
    (vars || []).forEach(v => { if (!varMap[v.product_id]) varMap[v.product_id] = []; varMap[v.product_id].push(v); });
    setProducts(prods.map(p => ({ ...p, variations: varMap[p.id] || [] })));
  }, []);

  useEffect(() => { load(); }, [load]);

  const startNew = () => {
    setForm({ ...EMPTY_FORM });
    setVariations([newVar()]);
    setImagePreview(""); setIsNew(true); setEditingId(undefined);
    setTab("edit"); setError("");
  };

  const startEdit = (p: Product) => {
    setForm({
      club: p.club, brand: p.brand || p.club, name: p.name, meta: p.meta || "",
      description: p.description || "", price: String(p.price),
      old_price: p.old_price ? String(p.old_price) : "",
      badge: p.badge || "", type: p.type || "camisa", category: p.category,
      active: p.active, image_url: p.image_url || "",
    });
    const vars: VariationForm[] = (p.variations || []).map(v => ({
      tempId: String(v.id),
      color: v.color, size: v.size, stock: v.stock,
      price: v.price !== null ? String(v.price) : "",
      image_url: v.image_url || "",
    }));
    setVariations(vars.length ? vars : [newVar()]);
    setImagePreview(p.image_url || ""); setIsNew(false);
    setEditingId(p.id); setTab("edit"); setError("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    setImagePreview(URL.createObjectURL(file));
    const url = await uploadProductImage(file);
    if (url) { setForm(p => ({ ...p, image_url: url })); setImagePreview(url); }
    else setError("Erro no upload. Use URL direta.");
    setUploading(false);
  };

  const handleVarImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, tempId: string) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = await uploadProductImage(file);
    if (url) setVariations(prev => prev.map(v => v.tempId === tempId ? { ...v, image_url: url } : v));
  };

  const setV = (tempId: string, key: keyof VariationForm, value: string | number) => {
    setVariations(prev => prev.map(v => v.tempId === tempId ? { ...v, [key]: value } : v));
  };

  const removeVar = (tempId: string) => {
    setVariations(prev => prev.filter(v => v.tempId !== tempId));
  };

  const sizes = getSizes(form.type);

  const saveEdit = async () => {
    if (!form.club || !form.name || !form.price) { setError("Preencha clube, nome e preço."); return; }
    if (variations.some(v => !v.size)) { setError("Todas as variações precisam ter tamanho."); return; }
    setSaving(true); setError("");

    const productPayload = {
      club: form.club.trim(), brand: (form.brand || form.club).trim(),
      name: form.name.trim(), meta: form.meta.trim(),
      description: form.description.trim(), price: parseFloat(form.price),
      old_price: form.old_price ? parseFloat(form.old_price) : null,
      badge: form.badge || null, type: form.type, category: form.category,
      active: form.active, image_url: form.image_url.trim(),
      stock: variations.reduce((s, v) => s + (Number(v.stock) || 0), 0),
      sizes: Array.from(new Set(variations.map(v => v.size))),
    };

    let productId = editingId;

    if (isNew) {
      const { data, error: err } = await supabase.from("products").insert([productPayload]).select().single();
      if (err || !data) { setError(err?.message || "Erro ao criar"); setSaving(false); return; }
      productId = data.id;
    } else {
      const { error: err } = await supabase.from("products").update(productPayload).eq("id", productId!);
      if (err) { setError(err.message); setSaving(false); return; }
      // Deletar variações antigas
      await supabase.from("product_variations").delete().eq("product_id", productId!);
    }

    // Inserir variações
    const varPayload = variations.map(v => ({
      product_id: productId!,
      color: v.color.trim(),
      size: v.size.trim(),
      stock: Number(v.stock) || 0,
      price: v.price ? parseFloat(v.price) : null,
      image_url: v.image_url.trim(),
    }));

    if (varPayload.length > 0) {
      const { error: varErr } = await supabase.from("product_variations").insert(varPayload);
      if (varErr) { setError(varErr.message); setSaving(false); return; }
    }

    await load();
    setTab("list"); setSaving(false);
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Excluir produto e todas as variações?")) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleActive = async (id: number, active: boolean) => {
    await supabase.from("products").update({ active: !active }).eq("id", id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !active } : p));
  };

  const filtered = products.filter(p =>
    p.club.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  // ─── LISTA ────────────────────────────────────────────────────────────────
  if (tab === "list") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "2px", color: "#fff" }}>PRODUTOS</h1>
          <p style={{ color: "rgba(245,245,245,0.4)", fontSize: "0.85rem" }}>{products.length} produtos · {products.filter(p => p.active).length} ativos</p>
        </div>
        <button onClick={startNew} style={{ background: "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", borderRadius: "10px", padding: "11px 22px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.9rem", letterSpacing: "1px", color: "#fff", cursor: "pointer" }}>+ Novo Produto</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
        style={{ ...inp, maxWidth: "400px", marginBottom: "20px" }} />

      <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 80px 110px 110px 80px 80px 90px", padding: "10px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
          {["Foto", "Produto", "Tipo", "Categoria", "Preço", "Vars", "Status", "Ações"].map(h => (
            <div key={h} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(245,245,245,0.35)" }}>{h}</div>
          ))}
        </div>
        {filtered.length === 0 && <div style={{ padding: "48px", textAlign: "center", color: "rgba(245,245,245,0.3)" }}>Nenhum produto</div>}
        {filtered.map((p, i) => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 80px 110px 110px 80px 80px 90px", padding: "12px 18px", alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", opacity: p.active ? 1 : 0.4 }}>
            <div style={{ width: "44px", height: "44px", background: "var(--dark3)", borderRadius: "8px", overflow: "hidden" }}>
              {p.image_url ? <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", opacity: 0.4 }}>{isTenis(p.type) ? "👟" : "⚽"}</div>}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.88rem" }}>{p.club}</div>
              <div style={{ fontSize: "0.73rem", color: "rgba(245,245,245,0.38)" }}>{p.name}</div>
            </div>
            <div>
              <span style={{ padding: "3px 8px", borderRadius: "4px", background: isTenis(p.type) ? "rgba(0,87,183,0.25)" : "rgba(10,140,42,0.25)", color: isTenis(p.type) ? "#6baed6" : "var(--green-light)", fontSize: "0.68rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>
                {isTenis(p.type) ? "👟 tênis" : "⚽ camisa"}
              </span>
            </div>
            <div style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.5)", textTransform: "capitalize" }}>{p.category}</div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "var(--yellow)" }}>R$ {fmt(p.price)}</div>
              {p.old_price && <div style={{ fontSize: "0.7rem", color: "rgba(245,245,245,0.28)", textDecoration: "line-through" }}>R$ {fmt(p.old_price)}</div>}
            </div>
            <div style={{ fontSize: "0.82rem", color: "rgba(245,245,245,0.5)", textAlign: "center" }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", color: "#fff" }}>{(p.variations || []).length}</span> vars
            </div>
            <div>
              <button onClick={() => toggleActive(p.id, p.active)}
                style={{ padding: "4px 10px", borderRadius: "20px", border: "none", background: p.active ? "rgba(18,184,58,0.2)" : "rgba(255,255,255,0.07)", color: p.active ? "#12b83a" : "rgba(245,245,245,0.35)", fontSize: "0.7rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, cursor: "pointer" }}>
                {p.active ? "ATIVO" : "OCULTO"}
              </button>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => startEdit(p)} style={{ padding: "5px 10px", borderRadius: "7px", background: "rgba(0,87,183,0.2)", border: "1px solid rgba(0,87,183,0.3)", color: "#6baed6", fontSize: "0.8rem", cursor: "pointer" }}>✏️</button>
              <button onClick={() => deleteProduct(p.id)} style={{ padding: "5px 10px", borderRadius: "7px", background: "rgba(224,60,60,0.15)", border: "1px solid rgba(224,60,60,0.3)", color: "#ff6b6b", fontSize: "0.8rem", cursor: "pointer" }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── FORMULÁRIO ────────────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "2px", color: "#fff" }}>{isNew ? "NOVO PRODUTO" : "EDITAR PRODUTO"}</h1>
          <p style={{ color: "rgba(245,245,245,0.4)", fontSize: "0.85rem" }}>{variations.length} variação(ões)</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => { setTab("list"); setError(""); }} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "11px 22px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#fff", cursor: "pointer" }}>← Cancelar</button>
          <button onClick={saveEdit} disabled={saving} style={{ background: saving ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", borderRadius: "10px", padding: "11px 22px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.9rem", color: "#fff", cursor: "pointer" }}>{saving ? "SALVANDO..." : "💾 SALVAR"}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* Informações básicas */}
          <section style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "18px" }}>INFORMAÇÕES</div>
            <div style={{ display: "grid", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={lbl}>Clube / Marca *</label>
                  <input style={inp} value={form.club} onChange={e => setForm(p => ({ ...p, club: e.target.value, brand: e.target.value }))} placeholder="Ex: Flamengo, Nike" />
                </div>
                <div>
                  <label style={lbl}>Tipo *</label>
                  <select style={{ ...inp, cursor: "pointer" }} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as "camisa" | "tenis", category: e.target.value === "tenis" ? "tenis" : "nacional" }))}>
                    <option value="camisa">⚽ Camisa</option>
                    <option value="tenis">👟 Tênis</option>
                  </select>
                </div>
              </div>
              <div><label style={lbl}>Nome *</label><input style={inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Camisa Oficial I 24/25" /></div>
              <div><label style={lbl}>Meta (subtítulo)</label><input style={inp} value={form.meta} onChange={e => setForm(p => ({ ...p, meta: e.target.value }))} placeholder="Ex: Home · Adidas · 2024/25" /></div>
              <div><label style={lbl}>Descrição</label><textarea style={{ ...inp, minHeight: "80px", resize: "vertical" } as React.CSSProperties} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descreva o produto..." /></div>
            </div>
          </section>

          {/* Preço e categoria */}
          <section style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "18px" }}>PREÇO E CATEGORIA</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px" }}>
              <div>
                <label style={lbl}>Preço base *</label>
                <input style={inp} type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="189.90" />
              </div>
              <div>
                <label style={lbl}>Preço antigo</label>
                <input style={inp} type="number" step="0.01" min="0" value={form.old_price} onChange={e => setForm(p => ({ ...p, old_price: e.target.value }))} placeholder="239.90" />
              </div>
              <div>
                <label style={lbl}>Categoria</label>
                <select style={{ ...inp, cursor: "pointer" }} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {form.type === "tenis" ? (
                    <option value="tenis">Tênis</option>
                  ) : (
                    <>
                      <option value="nacional">Nacional</option>
                      <option value="internacional">Internacional</option>
                      <option value="selecao">Seleção</option>
                      <option value="retro">Retrô</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label style={lbl}>Badge</label>
                <select style={{ ...inp, cursor: "pointer" }} value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))}>
                  <option value="">Sem badge</option>
                  <option value="new">🟢 Novo</option>
                  <option value="sale">🔴 Oferta</option>
                  <option value="retro">🟡 Retrô</option>
                </select>
              </div>
            </div>
          </section>

          {/* VARIAÇÕES */}
          <section style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff" }}>VARIAÇÕES</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(245,245,245,0.4)", marginTop: "2px" }}>Cor + Tamanho + Estoque + Imagem por variação</div>
              </div>
              <button onClick={() => setVariations(p => [...p, newVar()])}
                style={{ background: "rgba(10,140,42,0.2)", border: "1px solid rgba(10,140,42,0.4)", borderRadius: "8px", padding: "8px 16px", color: "var(--green-light)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                + Adicionar variação
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {variations.map((v, idx) => (
                <div key={v.tempId} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px", position: "relative" }}>
                  <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", color: "rgba(245,245,245,0.3)" }}>#{idx + 1}</span>
                    {variations.length > 1 && (
                      <button onClick={() => removeVar(v.tempId)} style={{ background: "rgba(224,60,60,0.15)", border: "1px solid rgba(224,60,60,0.3)", borderRadius: "6px", padding: "4px 10px", color: "#ff6b6b", fontSize: "0.75rem", cursor: "pointer" }}>✕</button>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 120px", gap: "12px", marginBottom: "12px" }}>
                    {/* Cor */}
                    <div>
                      <label style={lbl}>Cor (opcional)</label>
                      <input style={inp} value={v.color} onChange={e => setV(v.tempId, "color", e.target.value)} placeholder="Ex: Vermelho, Azul..." />
                    </div>
                    {/* Tamanho */}
                    <div>
                      <label style={lbl}>Tamanho *</label>
                      <select style={{ ...inp, cursor: "pointer" }} value={v.size} onChange={e => setV(v.tempId, "size", e.target.value)}>
                        <option value="">Selecione...</option>
                        {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {/* Estoque */}
                    <div>
                      <label style={lbl}>Estoque</label>
                      <input style={inp} type="number" min="0" value={v.stock} onChange={e => setV(v.tempId, "stock", parseInt(e.target.value) || 0)} />
                    </div>
                    {/* Preço */}
                    <div>
                      <label style={lbl}>Preço (opcional)</label>
                      <input style={inp} type="number" step="0.01" value={v.price} onChange={e => setV(v.tempId, "price", e.target.value)} placeholder="Usa base" />
                    </div>
                  </div>

                  {/* Imagem da variação */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    {v.image_url && (
                      <div style={{ width: "56px", height: "56px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)" }}>
                        <img src={v.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <label style={lbl}>Imagem da variação</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input style={{ ...inp, flex: 1 }} value={v.image_url} onChange={e => setV(v.tempId, "image_url", e.target.value)} placeholder="Cole URL ou faça upload..." />
                        <button onClick={() => varFileRefs.current[v.tempId]?.click()}
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0 12px", color: "rgba(245,245,245,0.7)", cursor: "pointer", fontSize: "0.82rem", whiteSpace: "nowrap", minHeight: "40px" }}>
                          📷 Upload
                        </button>
                        <input
                          ref={el => { varFileRefs.current[v.tempId] = el; }}
                          type="file" accept="image/*"
                          onChange={e => handleVarImageUpload(e, v.tempId)}
                          style={{ display: "none" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Coluna direita */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Imagem principal */}
          <section style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "16px" }}>📸 IMAGEM PRINCIPAL</div>
            <div onClick={() => !uploading && fileRef.current?.click()}
              style={{ width: "100%", aspectRatio: "1", background: "var(--dark3)", borderRadius: "12px", overflow: "hidden", marginBottom: "12px", cursor: "pointer", border: "2px dashed rgba(255,255,255,0.12)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {uploading && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: "0.85rem", fontFamily: "'Barlow Condensed', sans-serif" }}>ENVIANDO...</span></div>}
              {imagePreview ? <img src={imagePreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImagePreview("")} /> : <div style={{ textAlign: "center", color: "rgba(245,245,245,0.3)" }}><div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📷</div><div style={{ fontSize: "0.75rem", fontFamily: "'Barlow Condensed', sans-serif" }}>Clique para upload</div></div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", color: "rgba(245,245,245,0.7)", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", marginBottom: "10px" }}>
              {uploading ? "ENVIANDO..." : imagePreview ? "📷 TROCAR" : "📷 UPLOAD"}
            </button>
            <label style={lbl}>Ou URL direta:</label>
            <input style={inp} value={form.image_url} onChange={e => { setForm(p => ({ ...p, image_url: e.target.value })); setImagePreview(e.target.value); }} placeholder="https://..." />
          </section>

          {/* Status */}
          <section style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "16px" }}>STATUS</div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }} onClick={() => setForm(p => ({ ...p, active: !p.active }))}>
              <div style={{ width: "48px", height: "26px", borderRadius: "13px", background: form.active ? "var(--green)" : "rgba(255,255,255,0.1)", position: "relative", transition: "background .2s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: "3px", left: form.active ? "24px" : "3px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
              </div>
              <span style={{ color: form.active ? "#fff" : "rgba(245,245,245,0.4)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>{form.active ? "Ativo no site" : "Oculto"}</span>
            </div>
          </section>

          {error && <div style={{ background: "rgba(224,60,60,0.1)", border: "1px solid rgba(224,60,60,0.3)", borderRadius: "10px", padding: "12px 16px", fontSize: "0.82rem", color: "#ff6b6b" }}>{error}</div>}

          <button onClick={saveEdit} disabled={saving}
            style={{ background: saving ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", borderRadius: "12px", padding: "16px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", color: "#fff", cursor: "pointer", boxShadow: "0 4px 20px rgba(10,140,42,0.3)" }}>
            {saving ? "SALVANDO..." : "💾 SALVAR PRODUTO"}
          </button>
        </div>
      </div>
    </div>
  );
}
