"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, Product, ColorGroup, ColorGroupForm, fmt, getSizes, uploadProductImage, isTenis, isBone, tmpId } from "@/lib/supabase";

type ProductForm = {
  club: string; brand: string; name: string; meta: string; description: string;
  price: string; old_price: string; badge: string;
  type: "camisa" | "tenis" | "bone"; category: string; active: boolean;
  image_url: string;
};

const EMPTY: ProductForm = {
  club: "", brand: "", name: "", meta: "", description: "",
  price: "", old_price: "", badge: "", type: "camisa",
  category: "nacional", active: true, image_url: "",
};

function emptyGroup(type: string): ColorGroupForm {
  return {
    tempId: tmpId(), color: "", image_url: "",
    sizes: getSizes(type).map(s => ({ tempId: tmpId(), size: s, stock: 0 })),
  };
}

const inp: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px",
  padding: "12px 14px", color: "#fff", fontSize: "16px", outline: "none",
  fontFamily: "var(--font-body)",
};
const lbl: React.CSSProperties = {
  display: "block", fontFamily: "var(--font-body)", fontWeight: 700,
  fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase",
  color: "rgba(245,245,245,0.45)", marginBottom: "6px",
};

function typeIcon(type: string) {
  if (type === "tenis") return "👟";
  if (type === "bone")  return "🧢";
  return "⚽";
}
function typeColor(type: string) {
  if (type === "tenis") return "#0057b7";
  if (type === "bone")  return "#8b5cf6";
  return "var(--green)";
}

// ─── Sub-componente: card de produto na lista ─────────────────────────────────
function ProductCard({ p, onEdit, onDelete, onToggle }: {
  p: Product;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const groups   = p.colorGroups || [];
  const stock    = groups.reduce((s, g) => s + (g.sizes || []).reduce((ss, x) => ss + x.stock, 0), 0);
  const hasImg   = Boolean(p.image_url);
  const icon     = typeIcon(p.type);
  const tc       = typeColor(p.type);

  return (
    <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden", opacity: p.active ? 1 : 0.5 }}>
      <div style={{ display: "flex", gap: "12px", padding: "14px" }}>
        {/* Thumbnail */}
        <div style={{ width: "68px", height: "68px", borderRadius: "10px", background: "var(--dark3)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", opacity: 0.5 }}>
          {hasImg ? <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : icon}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "4px" }}>
            <span style={{ background: `${tc}22`, color: tc, fontSize: "0.6rem", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0, marginTop: "2px" }}>
              {icon} {p.type}
            </span>
            <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.92rem", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as React.CSSProperties}>
              {p.club} — {p.name}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--yellow)" }}>R$ {fmt(p.price)}</span>
            {p.old_price && <span style={{ fontSize: "0.72rem", color: "rgba(245,245,245,0.3)", textDecoration: "line-through" }}>R$ {fmt(p.old_price)}</span>}
            <span style={{ fontSize: "0.72rem", color: stock > 0 ? "var(--green-light)" : "#ff6b6b" }}>
              {stock} un.
            </span>
            {/* Mini swatches */}
            {groups.filter(g => g.color).slice(0, 4).map(g => (
              <div key={g.id} title={g.color} style={{ width: "14px", height: "14px", borderRadius: "50%", background: g.image_url ? `url(${g.image_url}) center/cover` : "#555", border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Ações */}
      <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onToggle}
          style={{ flex: 1, padding: "10px", background: "none", border: "none", color: p.active ? "var(--green-light)" : "rgba(245,245,245,0.35)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)", letterSpacing: "0.5px" }}>
          {p.active ? "✓ ATIVO" : "OCULTO"}
        </button>
        <div style={{ width: "1px", background: "rgba(255,255,255,0.06)" }} />
        <button onClick={onEdit}
          style={{ flex: 1, padding: "10px", background: "none", border: "none", color: "#6baed6", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)" }}>
          ✏️ EDITAR
        </button>
        <div style={{ width: "1px", background: "rgba(255,255,255,0.06)" }} />
        <button onClick={onDelete}
          style={{ flex: 1, padding: "10px", background: "none", border: "none", color: "#ff6b6b", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)" }}>
          🗑️ EXCLUIR
        </button>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function AdminPage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [tab, setTab]             = useState<"list" | "edit">("list");
  const [isNew, setIsNew]         = useState(true);
  const [editingId, setEditingId] = useState<number | undefined>();
  const [form, setForm]           = useState<ProductForm>(EMPTY);
  const [colorGroups, setColorGroups] = useState<ColorGroupForm[]>([]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [mainPreview, setMainPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState<"info" | "price" | "colors" | "image">("info");
  const mainFileRef  = useRef<HTMLInputElement>(null);
  const groupFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(async () => {
    const { data: prods } = await supabase.from("products").select("*").order("category").order("id");
    if (!prods) return;
    const { data: groups } = await supabase.from("product_color_groups").select("*").order("sort_order");
    const gMap: Record<number, ColorGroup[]> = {};
    (groups || []).forEach(g => { if (!gMap[g.product_id]) gMap[g.product_id] = []; gMap[g.product_id].push(g); });
    setProducts(prods.map(p => ({ ...p, colorGroups: gMap[p.id] || [] })));
  }, []);

  useEffect(() => { load(); }, [load]);

  const startNew = () => {
    setForm({ ...EMPTY }); setColorGroups([emptyGroup("camisa")]);
    setMainPreview(""); setIsNew(true); setEditingId(undefined);
    setActiveSection("info"); setTab("edit"); setError("");
  };

  const startEdit = (p: Product) => {
    setForm({
      club: p.club, brand: p.brand || p.club, name: p.name, meta: p.meta || "",
      description: p.description || "", price: String(p.price),
      old_price: p.old_price ? String(p.old_price) : "",
      badge: p.badge || "", type: p.type || "camisa", category: p.category,
      active: p.active, image_url: p.image_url || "",
    });
    const cg: ColorGroupForm[] = (p.colorGroups || []).map(g => ({
      tempId: String(g.id), color: g.color, image_url: g.image_url,
      sizes: (g.sizes || []).map(ss => ({ tempId: tmpId(), size: ss.size, stock: ss.stock })),
    }));
    setColorGroups(cg.length ? cg : [emptyGroup(p.type)]);
    setMainPreview(p.image_url || ""); setIsNew(false);
    setEditingId(p.id); setActiveSection("info"); setTab("edit"); setError("");
  };

  const handleMainUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    setMainPreview(URL.createObjectURL(f));
    const url = await uploadProductImage(f);
    if (url) { setForm(p => ({ ...p, image_url: url })); setMainPreview(url); }
    else setError("Erro no upload. Use URL direta.");
    setUploading(false);
  };

  const handleGroupUpload = async (e: React.ChangeEvent<HTMLInputElement>, gTempId: string) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await uploadProductImage(f);
    if (url) setColorGroups(prev => prev.map(g => g.tempId === gTempId ? { ...g, image_url: url } : g));
  };

  const addGroup  = () => setColorGroups(p => [...p, emptyGroup(form.type)]);
  const removeGroup = (tid: string) => setColorGroups(p => p.filter(g => g.tempId !== tid));
  const setGroup  = (tid: string, key: keyof ColorGroupForm, val: string) =>
    setColorGroups(p => p.map(g => g.tempId === tid ? { ...g, [key]: val } : g));
  const addSize   = (gTid: string) =>
    setColorGroups(prev => prev.map(g => g.tempId === gTid
      ? { ...g, sizes: [...g.sizes, { tempId: tmpId(), size: "", stock: 5 }] } : g));
  const removeSize = (gTid: string, sTid: string) =>
    setColorGroups(prev => prev.map(g => g.tempId === gTid
      ? { ...g, sizes: g.sizes.filter(s => s.tempId !== sTid) } : g));
  const setSize   = (gTid: string, sTid: string, key: "size" | "stock", val: string | number) =>
    setColorGroups(prev => prev.map(g => g.tempId === gTid
      ? { ...g, sizes: g.sizes.map(s => s.tempId === sTid ? { ...s, [key]: val } : s) } : g));

  const save = async () => {
    if (!form.club || !form.name || !form.price) { setError("Preencha clube, nome e preço."); return; }
    if (colorGroups.some(g => g.sizes.some(s => !s.size))) { setError("Todos os tamanhos precisam ter valor."); return; }
    setSaving(true); setError("");

    const allSizes   = Array.from(new Set(colorGroups.flatMap(g => g.sizes.map(s => s.size)).filter(Boolean)));
    const totalStock = colorGroups.reduce((s, g) => s + g.sizes.reduce((ss, x) => ss + (Number(x.stock) || 0), 0), 0);

    const payload = {
      club: form.club.trim(), brand: (form.brand || form.club).trim(),
      name: form.name.trim(), meta: form.meta.trim(), description: form.description.trim(),
      price: parseFloat(form.price), old_price: form.old_price ? parseFloat(form.old_price) : null,
      badge: form.badge || null, type: form.type, category: form.category,
      active: form.active, image_url: form.image_url.trim(),
      stock: totalStock, sizes: allSizes,
    };

    let pid = editingId;
    if (isNew) {
      const { data, error: e } = await supabase.from("products").insert([payload]).select().single();
      if (e || !data) { setError(e?.message || "Erro"); setSaving(false); return; }
      pid = data.id;
    } else {
      const { error: e } = await supabase.from("products").update(payload).eq("id", pid!);
      if (e) { setError(e.message); setSaving(false); return; }
      await supabase.from("product_color_groups").delete().eq("product_id", pid!);
    }

    const groupsPayload = colorGroups.map((g, i) => ({
      product_id: pid!,
      color: g.color.trim(), image_url: g.image_url.trim(),
      sizes: g.sizes.filter(s => s.size).map(s => ({ size: s.size, stock: Number(s.stock) || 0 })),
      sort_order: i,
    }));

    const { error: ge } = await supabase.from("product_color_groups").insert(groupsPayload);
    if (ge) { setError(ge.message); setSaving(false); return; }

    await load();
    setTab("list"); setSaving(false);
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Excluir produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleActive = async (id: number, active: boolean) => {
    await supabase.from("products").update({ active: !active }).eq("id", id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !active } : p));
  };

  const filtered = products.filter(p =>
    [p.club, p.name, p.category].some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const SECTIONS = [
    { id: "info",   label: "📝 Info",   icon: "📝" },
    { id: "price",  label: "💰 Preço",  icon: "💰" },
    { id: "colors", label: "🎨 Cores",  icon: "🎨" },
    { id: "image",  label: "📸 Imagem", icon: "📸" },
  ] as const;

  // ─────────────────────────────────────────────────────────────────────────────
  // LISTA
  if (tab === "list") return (
    <div style={{ paddingBottom: "80px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "#fff", marginBottom: "2px" }}>PRODUTOS</h1>
        <p style={{ color: "rgba(245,245,245,0.4)", fontSize: "0.82rem" }}>
          {products.length} total · {products.filter(p => p.active).length} ativos
        </p>
      </div>

      {/* Busca */}
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Buscar produto..."
        style={{ ...inp, marginBottom: "16px" }} />

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "rgba(245,245,245,0.3)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>📦</div>
            <div>Nenhum produto encontrado</div>
          </div>
        )}
        {filtered.map(p => (
          <ProductCard key={p.id} p={p}
            onEdit={() => startEdit(p)}
            onDelete={() => deleteProduct(p.id)}
            onToggle={() => toggleActive(p.id, p.active)}
          />
        ))}
      </div>

      {/* Botão flutuante */}
      <button onClick={startNew}
        style={{ position: "fixed", bottom: "24px", right: "16px", width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", color: "#fff", fontSize: "1.8rem", cursor: "pointer", boxShadow: "0 6px 24px rgba(10,140,42,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
        +
      </button>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // FORMULÁRIO (mobile: abas por seção)
  return (
    <div style={{ paddingBottom: "100px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <button onClick={() => { setTab("list"); setError(""); }}
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 16px", color: "#fff", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.85rem" }}>
          ← Voltar
        </button>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "#fff" }}>
            {isNew ? "NOVO PRODUTO" : "EDITAR"}
          </h1>
          <p style={{ color: "rgba(245,245,245,0.4)", fontSize: "0.75rem" }}>{colorGroups.length} cor(es)</p>
        </div>
      </div>

      {/* Preview rápido */}
      {(mainPreview || form.name) && (
        <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "12px", marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "8px", background: "var(--dark3)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", opacity: 0.5 }}>
            {mainPreview ? <img src={mainPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : typeIcon(form.type)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.92rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {form.club || "—"} {form.name ? `— ${form.name}` : ""}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--yellow)" }}>
              {form.price ? `R$ ${parseFloat(form.price).toFixed(2).replace(".", ",")}` : "Sem preço"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => setForm(p => ({ ...p, active: !p.active }))}>
            <div style={{ width: "36px", height: "20px", borderRadius: "10px", background: form.active ? "var(--green)" : "rgba(255,255,255,0.1)", position: "relative", transition: "background .2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: "2px", left: form.active ? "18px" : "2px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
            </div>
          </div>
        </div>
      )}

      {/* Abas de seção */}
      <div style={{ display: "flex", gap: "6px", overflowX: "auto", marginBottom: "16px", paddingBottom: "2px" }} className="no-scrollbar">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "none", background: activeSection === s.id ? "var(--green)" : "rgba(255,255,255,0.06)", color: activeSection === s.id ? "#fff" : "rgba(245,245,245,0.55)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all .15s" }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── ABA: INFO ── */}
      {activeSection === "info" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "18px" }}>
            <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
              <div style={{ flex: 1 }}>
                <label style={lbl}>Tipo *</label>
                <select style={{ ...inp }} value={form.type}
                  onChange={e => {
                    const t = e.target.value as "camisa" | "tenis" | "bone";
                    setForm(p => ({ ...p, type: t, category: t === "tenis" ? "tenis" : t === "bone" ? "bone" : "nacional" }));
                    setColorGroups(prev => prev.map(g => ({ ...g, sizes: getSizes(t).map(s => ({ tempId: tmpId(), size: s, stock: 0 })) })));
                  }}>
                  <option value="camisa">⚽ Camisa</option>
                  <option value="tenis">👟 Tênis</option>
                  <option value="bone">🧢 Boné</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={lbl}>Categoria</label>
                <select style={{ ...inp }} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {form.type === "tenis" ? <option value="tenis">Tênis</option>
                    : form.type === "bone" ? <option value="bone">Boné</option>
                    : <>
                      <option value="nacional">Nacional</option>
                      <option value="internacional">Internacional</option>
                      <option value="selecao">Seleção</option>
                      <option value="retro">Retrô</option>
                    </>}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={lbl}>Clube / Marca *</label>
                <input style={inp} value={form.club} onChange={e => setForm(p => ({ ...p, club: e.target.value, brand: e.target.value }))} placeholder="Ex: Flamengo, Nike" />
              </div>
              <div>
                <label style={lbl}>Nome *</label>
                <input style={inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Camisa Oficial I 25/26" />
              </div>
              <div>
                <label style={lbl}>Meta / Subtítulo</label>
                <input style={inp} value={form.meta} onChange={e => setForm(p => ({ ...p, meta: e.target.value }))} placeholder="Ex: Home · Adidas · 2025/26" />
              </div>
              <div>
                <label style={lbl}>Descrição</label>
                <textarea style={{ ...inp, minHeight: "80px", resize: "vertical" } as React.CSSProperties}
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descreva o produto..." />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ABA: PREÇO ── */}
      {activeSection === "price" && (
        <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={lbl}>Preço *</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(245,245,245,0.4)", fontWeight: 700 }}>R$</span>
              <input style={{ ...inp, paddingLeft: "40px" }} type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0,00" inputMode="decimal" />
            </div>
          </div>
          <div>
            <label style={lbl}>Preço antigo <span style={{ color: "rgba(245,245,245,0.25)", fontWeight: 400 }}>(opcional)</span></label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(245,245,245,0.4)", fontWeight: 700 }}>R$</span>
              <input style={{ ...inp, paddingLeft: "40px" }} type="number" step="0.01" min="0" value={form.old_price} onChange={e => setForm(p => ({ ...p, old_price: e.target.value }))} placeholder="0,00" inputMode="decimal" />
            </div>
          </div>
          <div>
            <label style={lbl}>Badge</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { v: "", label: "Nenhum", icon: "—" },
                { v: "new",   label: "Novo",   icon: "🟢" },
                { v: "sale",  label: "Oferta", icon: "🔴" },
                { v: "retro", label: "Retrô",  icon: "🟡" },
              ].map(b => (
                <button key={b.v} type="button" onClick={() => setForm(p => ({ ...p, badge: b.v }))}
                  style={{ padding: "10px 12px", borderRadius: "8px", border: `1.5px solid ${form.badge === b.v ? "var(--green)" : "rgba(255,255,255,0.1)"}`, background: form.badge === b.v ? "rgba(10,140,42,0.15)" : "transparent", color: "#fff", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  {b.icon} {b.label}
                </button>
              ))}
            </div>
          </div>
          {/* Preview desconto */}
          {form.price && form.old_price && parseFloat(form.old_price) > parseFloat(form.price) && (
            <div style={{ background: "rgba(224,60,60,0.1)", border: "1px solid rgba(224,60,60,0.25)", borderRadius: "8px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", color: "rgba(245,245,245,0.6)" }}>Desconto</span>
              <span style={{ color: "#ff6b6b", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
                -{Math.round(((parseFloat(form.old_price) - parseFloat(form.price)) / parseFloat(form.old_price)) * 100)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── ABA: CORES ── */}
      {activeSection === "colors" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {colorGroups.map((g, gi) => {
            const groupStock = g.sizes.reduce((s, x) => s + (Number(x.stock) || 0), 0);
            return (
              <div key={g.tempId} style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
                {/* Header da cor */}
                <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "10px" }}>
                  {g.color && <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: g.image_url ? `url(${g.image_url}) center/cover` : "#555", flexShrink: 0, border: "1px solid rgba(255,255,255,0.2)" }} />}
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", color: "rgba(245,245,245,0.4)" }}>COR #{gi + 1}</span>
                  {g.color && <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", textTransform: "capitalize" }}>{g.color}</span>}
                  <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: groupStock > 0 ? "var(--green-light)" : "rgba(245,245,245,0.3)" }}>{groupStock} un.</span>
                  {colorGroups.length > 1 && (
                    <button onClick={() => removeGroup(g.tempId)}
                      style={{ background: "rgba(224,60,60,0.15)", border: "none", borderRadius: "6px", padding: "4px 10px", color: "#ff6b6b", fontSize: "0.72rem", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700 }}>✕</button>
                  )}
                </div>

                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Nome e imagem */}
                  <div>
                    <label style={lbl}>Nome da cor</label>
                    <input style={inp} value={g.color} onChange={e => setGroup(g.tempId, "color", e.target.value)} placeholder="Ex: Azul, Vermelho, Preto..." />
                  </div>

                  <div>
                    <label style={lbl}>Imagem desta cor</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input style={{ ...inp, flex: 1 }} value={g.image_url} onChange={e => setGroup(g.tempId, "image_url", e.target.value)} placeholder="URL da imagem..." />
                      <button onClick={() => groupFileRefs.current[g.tempId]?.click()}
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "0 14px", color: "rgba(245,245,245,0.7)", cursor: "pointer", fontSize: "1.1rem", flexShrink: 0, minHeight: "46px" }}>📷</button>
                      <input ref={el => { groupFileRefs.current[g.tempId] = el; }} type="file" accept="image/*" onChange={e => handleGroupUpload(e, g.tempId)} style={{ display: "none" }} />
                    </div>
                    {g.image_url && (
                      <div style={{ marginTop: "8px", width: "60px", height: "60px", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <img src={g.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                  </div>

                  {/* Tamanhos */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <label style={{ ...lbl, marginBottom: 0 }}>Tamanhos e estoque</label>
                      <button onClick={() => addSize(g.tempId)}
                        style={{ background: "rgba(10,140,42,0.15)", border: "1px solid rgba(10,140,42,0.3)", borderRadius: "6px", padding: "4px 12px", color: "var(--green-light)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700 }}>
                        + Tamanho
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {g.sizes.map(s => (
                        <div key={s.tempId} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <select style={{ ...inp, flex: 2 }} value={s.size} onChange={e => setSize(g.tempId, s.tempId, "size", e.target.value)}>
                            <option value="">Tamanho</option>
                            {getSizes(form.type).map(sz => <option key={sz} value={sz}>{sz}</option>)}
                          </select>
                          <div style={{ flex: 1, position: "relative" }}>
                            <input type="number" min="0" value={s.stock}
                              onChange={e => setSize(g.tempId, s.tempId, "stock", parseInt(e.target.value) || 0)}
                              style={{ ...inp, textAlign: "center", paddingRight: "36px" }}
                              inputMode="numeric" placeholder="0" />
                            <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.65rem", color: "rgba(245,245,245,0.3)", pointerEvents: "none" }}>un</span>
                          </div>
                          {g.sizes.length > 1 && (
                            <button onClick={() => removeSize(g.tempId, s.tempId)}
                              style={{ background: "none", border: "none", color: "rgba(245,245,245,0.3)", cursor: "pointer", fontSize: "1rem", padding: "0 8px", minHeight: "44px" }}>✕</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button onClick={addGroup}
            style={{ background: "rgba(10,140,42,0.1)", border: "1.5px dashed rgba(10,140,42,0.4)", borderRadius: "12px", padding: "14px", color: "var(--green-light)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            + Adicionar cor
          </button>
        </div>
      )}

      {/* ── ABA: IMAGEM ── */}
      {activeSection === "image" && (
        <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Preview clicável */}
          <div onClick={() => !uploading && mainFileRef.current?.click()}
            style={{ width: "100%", aspectRatio: "1", background: "var(--dark3)", borderRadius: "12px", overflow: "hidden", cursor: "pointer", border: "2px dashed rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            {uploading && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700 }}>ENVIANDO...</span>
              </div>
            )}
            {mainPreview
              ? <img src={mainPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setMainPreview("")} />
              : <div style={{ textAlign: "center", color: "rgba(245,245,245,0.3)" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "8px" }}>📷</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}>Toque para adicionar imagem</div>
                </div>
            }
          </div>
          <input ref={mainFileRef} type="file" accept="image/*" onChange={handleMainUpload} style={{ display: "none" }} />

          <button onClick={() => mainFileRef.current?.click()} disabled={uploading}
            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "13px", color: mainPreview ? "#fff" : "rgba(245,245,245,0.6)", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.9rem" }}>
            {uploading ? "Enviando..." : mainPreview ? "📷 Trocar imagem" : "📷 Fazer upload"}
          </button>

          <div>
            <label style={lbl}>Ou cole uma URL</label>
            <input style={inp} value={form.image_url}
              onChange={e => { setForm(p => ({ ...p, image_url: e.target.value })); setMainPreview(e.target.value); }}
              placeholder="https://..." />
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div style={{ background: "rgba(224,60,60,0.1)", border: "1px solid rgba(224,60,60,0.3)", borderRadius: "10px", padding: "12px 16px", fontSize: "0.85rem", color: "#ff6b6b", marginTop: "12px" }}>
          {error}
        </div>
      )}

      {/* Botão salvar fixo no rodapé */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 16px", background: "rgba(14,14,14,0.97)", borderTop: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(10px)", zIndex: 50 }} className="safe-bottom">
        <button onClick={save} disabled={saving}
          style={{ width: "100%", background: saving ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", borderRadius: "12px", padding: "16px", fontFamily: "var(--font-body)", fontWeight: 900, fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", color: "#fff", cursor: saving ? "wait" : "pointer", boxShadow: saving ? "none" : "0 4px 20px rgba(10,140,42,0.4)", minHeight: "52px" }}>
          {saving ? "SALVANDO..." : isNew ? "💾 CRIAR PRODUTO" : "💾 SALVAR ALTERAÇÕES"}
        </button>
      </div>
    </div>
  );
}
