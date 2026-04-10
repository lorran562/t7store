"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, Product, ColorGroup, ColorGroupForm, fmt, getSizes, uploadProductImage, isTenis, tmpId } from "@/lib/supabase";

type ProductForm = {
  club: string; brand: string; name: string; meta: string; description: string;
  price: string; old_price: string; badge: string;
  type: "camisa" | "tenis"; category: string; active: boolean;
  image_url: string;
};

const EMPTY: ProductForm = {
  club: "", brand: "", name: "", meta: "", description: "",
  price: "", old_price: "", badge: "", type: "camisa",
  category: "nacional", active: true, image_url: "",
};

function emptyGroup(type: string): ColorGroupForm {
  const sizes = getSizes(type);
  return {
    tempId: tmpId(), color: "", image_url: "",
    sizes: sizes.map(s => ({ tempId: tmpId(), size: s, stock: 0 })),
  };
}

const inp: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "0.88rem", outline: "none",
};
const lbl: React.CSSProperties = {
  display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
  fontSize: "0.72rem", letterSpacing: "1px", textTransform: "uppercase",
  color: "rgba(245,245,245,0.45)", marginBottom: "6px",
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<"list" | "edit">("list");
  const [isNew, setIsNew] = useState(true);
  const [editingId, setEditingId] = useState<number | undefined>();
  const [form, setForm] = useState<ProductForm>(EMPTY);
  const [colorGroups, setColorGroups] = useState<ColorGroupForm[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [mainPreview, setMainPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const mainFileRef = useRef<HTMLInputElement>(null);
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
    setMainPreview(""); setIsNew(true); setEditingId(undefined); setTab("edit"); setError("");
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
    setEditingId(p.id); setTab("edit"); setError("");
  };

  // ── Upload imagem principal ──
  const handleMainUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    setMainPreview(URL.createObjectURL(f));
    const url = await uploadProductImage(f);
    if (url) { setForm(p => ({ ...p, image_url: url })); setMainPreview(url); }
    else setError("Erro no upload. Use URL direta.");
    setUploading(false);
  };

  // ── Upload imagem de cor ──
  const handleGroupUpload = async (e: React.ChangeEvent<HTMLInputElement>, gTempId: string) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await uploadProductImage(f);
    if (url) setColorGroups(prev => prev.map(g => g.tempId === gTempId ? { ...g, image_url: url } : g));
  };

  // ── Helpers de grupo ──
  const addGroup = () => setColorGroups(p => [...p, emptyGroup(form.type)]);
  const removeGroup = (tid: string) => setColorGroups(p => p.filter(g => g.tempId !== tid));
  const setGroup = (tid: string, key: keyof ColorGroupForm, val: string) =>
    setColorGroups(p => p.map(g => g.tempId === tid ? { ...g, [key]: val } : g));

  const addSize = (gTid: string) =>
    setColorGroups(prev => prev.map(g => g.tempId === gTid
      ? { ...g, sizes: [...g.sizes, { tempId: tmpId(), size: "", stock: 5 }] }
      : g));

  const removeSize = (gTid: string, sTid: string) =>
    setColorGroups(prev => prev.map(g => g.tempId === gTid
      ? { ...g, sizes: g.sizes.filter(s => s.tempId !== sTid) }
      : g));

  const setSize = (gTid: string, sTid: string, key: "size" | "stock", val: string | number) =>
    setColorGroups(prev => prev.map(g => g.tempId === gTid
      ? { ...g, sizes: g.sizes.map(s => s.tempId === sTid ? { ...s, [key]: val } : s) }
      : g));

  // ── Salvar ──
  const save = async () => {
    if (!form.club || !form.name || !form.price) { setError("Preencha clube, nome e preço."); return; }
    if (colorGroups.some(g => g.sizes.some(s => !s.size))) { setError("Todos os tamanhos precisam ser preenchidos."); return; }
    setSaving(true); setError("");

    const allSizes = Array.from(new Set(colorGroups.flatMap(g => g.sizes.map(s => s.size)).filter(Boolean)));
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

    // Inserir grupos de cor
    const groupsPayload = colorGroups.map((g, i) => ({
      product_id: pid!,
      color: g.color.trim(),
      image_url: g.image_url.trim(),
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

  // ────────────────────────────────────────────────────────────────────────────
  // LISTA
  if (tab === "list") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "2px", color: "#fff" }}>PRODUTOS</h1>
          <p style={{ color: "rgba(245,245,245,0.4)", fontSize: "0.85rem" }}>{products.length} produtos · {products.filter(p => p.active).length} ativos</p>
        </div>
        <button onClick={startNew} style={{ background: "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", borderRadius: "10px", padding: "11px 22px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.9rem", color: "#fff", cursor: "pointer" }}>+ Novo Produto</button>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={{ ...inp, maxWidth: "400px", marginBottom: "20px" }} />
      <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 80px 120px 100px 80px 80px 90px", padding: "10px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
          {["Foto","Produto","Tipo","Preço","Cores","Estoque","Status","Ações"].map(h => (
            <div key={h} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(245,245,245,0.35)" }}>{h}</div>
          ))}
        </div>
        {filtered.length === 0 && <div style={{ padding: "48px", textAlign: "center", color: "rgba(245,245,245,0.3)" }}>Nenhum produto</div>}
        {filtered.map((p, i) => {
          const groups = p.colorGroups || [];
          const totalStock = groups.reduce((s, g) => s + (g.sizes || []).reduce((ss, x) => ss + x.stock, 0), 0);
          return (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 80px 120px 100px 80px 80px 90px", padding: "12px 18px", alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", opacity: p.active ? 1 : 0.4 }}>
              <div style={{ width: "44px", height: "44px", background: "var(--dark3)", borderRadius: "8px", overflow: "hidden" }}>
                {p.image_url ? <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", opacity: 0.4 }}>{isTenis(p.type) ? "👟" : "⚽"}</div>}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.88rem" }}>{p.club}</div>
                <div style={{ fontSize: "0.73rem", color: "rgba(245,245,245,0.38)" }}>{p.name}</div>
              </div>
              <div><span style={{ padding: "3px 8px", borderRadius: "4px", background: isTenis(p.type) ? "rgba(0,87,183,0.25)" : "rgba(10,140,42,0.25)", color: isTenis(p.type) ? "#6baed6" : "var(--green-light)", fontSize: "0.68rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>{isTenis(p.type) ? "👟" : "⚽"}</span></div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "var(--yellow)" }}>R$ {fmt(p.price)}</div>
                {p.old_price && <div style={{ fontSize: "0.7rem", color: "rgba(245,245,245,0.28)", textDecoration: "line-through" }}>R$ {fmt(p.old_price)}</div>}
              </div>
              {/* Mini swatches de cores */}
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {groups.filter(g => g.color).slice(0, 4).map(g => (
                  <div key={g.id} title={g.color}
                    style={{ width: "16px", height: "16px", borderRadius: "50%", background: g.image_url ? `url(${g.image_url}) center/cover` : "#555", border: "1px solid rgba(255,255,255,0.2)" }} />
                ))}
                {groups.length > 4 && <span style={{ fontSize: "0.65rem", color: "rgba(245,245,245,0.4)" }}>+{groups.length - 4}</span>}
                {groups.length === 0 && <span style={{ fontSize: "0.72rem", color: "rgba(245,245,245,0.3)" }}>—</span>}
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", color: totalStock > 0 ? "var(--green-light)" : "#ff6b6b" }}>{totalStock}</div>
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
          );
        })}
      </div>
    </div>
  );

  // ────────────────────────────────────────────────────────────────────────────
  // FORMULÁRIO
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "2px", color: "#fff" }}>{isNew ? "NOVO PRODUTO" : "EDITAR PRODUTO"}</h1>
          <p style={{ color: "rgba(245,245,245,0.4)", fontSize: "0.85rem" }}>{colorGroups.length} cor(es) cadastrada(s)</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => { setTab("list"); setError(""); }} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "11px 22px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#fff", cursor: "pointer" }}>← Voltar</button>
          <button onClick={save} disabled={saving} style={{ background: saving ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", borderRadius: "10px", padding: "11px 22px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.9rem", color: "#fff", cursor: "pointer" }}>{saving ? "SALVANDO..." : "💾 SALVAR"}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* ── Informações ── */}
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
                  <select style={{ ...inp, cursor: "pointer" }} value={form.type}
                    onChange={e => {
                      const t = e.target.value as "camisa" | "tenis";
                      setForm(p => ({ ...p, type: t, category: t === "tenis" ? "tenis" : "nacional" }));
                      setColorGroups(prev => prev.map(g => ({ ...g, sizes: getSizes(t).map(s => ({ tempId: tmpId(), size: s, stock: 0 })) })));
                    }}>
                    <option value="camisa">⚽ Camisa</option>
                    <option value="tenis">👟 Tênis</option>
                  </select>
                </div>
              </div>
              <div><label style={lbl}>Nome *</label><input style={inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Camisa Oficial I 24/25" /></div>
              <div><label style={lbl}>Meta (subtítulo)</label><input style={inp} value={form.meta} onChange={e => setForm(p => ({ ...p, meta: e.target.value }))} placeholder="Ex: Home · Adidas · 2024/25" /></div>
              <div><label style={lbl}>Descrição</label><textarea style={{ ...inp, minHeight: "80px", resize: "vertical" } as React.CSSProperties} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            </div>
          </section>

          {/* ── Preço ── */}
          <section style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "18px" }}>PREÇO E CATEGORIA</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px" }}>
              <div><label style={lbl}>Preço *</label><input style={inp} type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="189.90" /></div>
              <div><label style={lbl}>Preço antigo</label><input style={inp} type="number" step="0.01" min="0" value={form.old_price} onChange={e => setForm(p => ({ ...p, old_price: e.target.value }))} placeholder="239.90" /></div>
              <div>
                <label style={lbl}>Categoria</label>
                <select style={{ ...inp, cursor: "pointer" }} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {form.type === "tenis" ? <option value="tenis">Tênis</option> : (
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
                  <option value="">—</option>
                  <option value="new">🟢 Novo</option>
                  <option value="sale">🔴 Oferta</option>
                  <option value="retro">🟡 Retrô</option>
                </select>
              </div>
            </div>
          </section>

          {/* ── CORES E TAMANHOS ── */}
          <section style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff" }}>CORES E TAMANHOS</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(245,245,245,0.4)", marginTop: "2px" }}>Cada cor tem sua própria imagem e estoques por tamanho</div>
              </div>
              <button onClick={addGroup}
                style={{ background: "rgba(10,140,42,0.2)", border: "1px solid rgba(10,140,42,0.4)", borderRadius: "8px", padding: "8px 16px", color: "var(--green-light)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                + Adicionar cor
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {colorGroups.map((g, gi) => {
                const totalGroupStock = g.sizes.reduce((s, x) => s + (Number(x.stock) || 0), 0);
                return (
                  <div key={g.tempId} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "12px", overflow: "hidden" }}>
                    {/* Header da cor */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", color: "rgba(245,245,245,0.4)", minWidth: "24px" }}>#{gi + 1}</div>
                      <div style={{ flex: 1, display: "flex", gap: "10px", alignItems: "center" }}>
                        <input
                          style={{ ...inp, maxWidth: "200px" }}
                          value={g.color}
                          onChange={e => setGroup(g.tempId, "color", e.target.value)}
                          placeholder="Nome da cor (ex: Azul, Vermelho...)"
                        />
                        {g.color && (
                          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: g.image_url ? `url(${g.image_url}) center/cover` : "#555", flexShrink: 0, border: "1px solid rgba(255,255,255,0.2)" }} />
                        )}
                        <span style={{ fontSize: "0.78rem", color: totalGroupStock > 0 ? "var(--green-light)" : "rgba(245,245,245,0.3)" }}>
                          {totalGroupStock} un.
                        </span>
                      </div>
                      {colorGroups.length > 1 && (
                        <button onClick={() => removeGroup(g.tempId)}
                          style={{ background: "rgba(224,60,60,0.15)", border: "1px solid rgba(224,60,60,0.3)", borderRadius: "6px", padding: "6px 12px", color: "#ff6b6b", fontSize: "0.78rem", cursor: "pointer" }}>
                          Remover cor
                        </button>
                      )}
                    </div>

                    {/* Imagem da cor */}
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <label style={lbl}>Imagem desta cor</label>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        {g.image_url && (
                          <div style={{ width: "52px", height: "52px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)" }}>
                            <img src={g.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        )}
                        <input style={{ ...inp, flex: 1 }} value={g.image_url} onChange={e => setGroup(g.tempId, "image_url", e.target.value)} placeholder="Cole URL ou faça upload..." />
                        <button onClick={() => groupFileRefs.current[g.tempId]?.click()}
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0 14px", color: "rgba(245,245,245,0.7)", cursor: "pointer", fontSize: "0.82rem", whiteSpace: "nowrap", height: "40px" }}>
                          📷
                        </button>
                        <input
                          ref={el => { groupFileRefs.current[g.tempId] = el; }}
                          type="file" accept="image/*"
                          onChange={e => handleGroupUpload(e, g.tempId)}
                          style={{ display: "none" }}
                        />
                      </div>
                    </div>

                    {/* Tamanhos desta cor */}
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <label style={{ ...lbl, marginBottom: 0 }}>Tamanhos e estoque</label>
                        <button onClick={() => addSize(g.tempId)}
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", padding: "4px 12px", color: "rgba(245,245,245,0.6)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
                          + Tamanho
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "8px" }}>
                        {g.sizes.map(s => (
                          <div key={s.tempId} style={{ display: "flex", gap: "6px", alignItems: "center", background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "8px 10px", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <select style={{ ...inp, flex: 1, padding: "6px 8px", fontSize: "0.82rem" }} value={s.size} onChange={e => setSize(g.tempId, s.tempId, "size", e.target.value)}>
                              <option value="">Tam.</option>
                              {getSizes(form.type).map(sz => <option key={sz} value={sz}>{sz}</option>)}
                            </select>
                            <input
                              type="number" min="0" value={s.stock}
                              onChange={e => setSize(g.tempId, s.tempId, "stock", parseInt(e.target.value) || 0)}
                              style={{ ...inp, width: "54px", padding: "6px 8px", fontSize: "0.82rem", textAlign: "center" }}
                              title="Estoque"
                            />
                            {g.sizes.length > 1 && (
                              <button onClick={() => removeSize(g.tempId, s.tempId)}
                                style={{ background: "none", border: "none", color: "rgba(245,245,245,0.28)", cursor: "pointer", fontSize: "0.85rem", padding: "2px", minWidth: "24px" }}>✕</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── Coluna direita ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Imagem principal */}
          <section style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "16px" }}>📸 IMAGEM PRINCIPAL</div>
            <div onClick={() => !uploading && mainFileRef.current?.click()}
              style={{ width: "100%", aspectRatio: "1", background: "var(--dark3)", borderRadius: "12px", overflow: "hidden", marginBottom: "12px", cursor: "pointer", border: "2px dashed rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              {uploading && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: "0.85rem", fontFamily: "'Barlow Condensed', sans-serif" }}>ENVIANDO...</span></div>}
              {mainPreview ? <img src={mainPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setMainPreview("")} /> : <div style={{ textAlign: "center", color: "rgba(245,245,245,0.3)" }}><div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📷</div><div style={{ fontSize: "0.75rem", fontFamily: "'Barlow Condensed', sans-serif" }}>Clique para upload</div></div>}
            </div>
            <input ref={mainFileRef} type="file" accept="image/*" onChange={handleMainUpload} style={{ display: "none" }} />
            <button onClick={() => mainFileRef.current?.click()} disabled={uploading}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", color: "rgba(245,245,245,0.7)", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", marginBottom: "10px" }}>
              {uploading ? "ENVIANDO..." : mainPreview ? "📷 TROCAR" : "📷 UPLOAD"}
            </button>
            <label style={lbl}>Ou URL:</label>
            <input style={inp} value={form.image_url} onChange={e => { setForm(p => ({ ...p, image_url: e.target.value })); setMainPreview(e.target.value); }} placeholder="https://..." />
          </section>

          {/* Status */}
          <section style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "2px", color: "#fff", marginBottom: "16px" }}>STATUS</div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }} onClick={() => setForm(p => ({ ...p, active: !p.active }))}>
              <div style={{ width: "48px", height: "26px", borderRadius: "13px", background: form.active ? "var(--green)" : "rgba(255,255,255,0.1)", position: "relative", transition: "background .2s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: "3px", left: form.active ? "24px" : "3px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
              </div>
              <span style={{ color: form.active ? "#fff" : "rgba(245,245,245,0.4)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>{form.active ? "Ativo" : "Oculto"}</span>
            </div>
          </section>

          {error && <div style={{ background: "rgba(224,60,60,0.1)", border: "1px solid rgba(224,60,60,0.3)", borderRadius: "10px", padding: "12px 16px", fontSize: "0.82rem", color: "#ff6b6b" }}>{error}</div>}

          <button onClick={save} disabled={saving}
            style={{ background: saving ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", borderRadius: "12px", padding: "16px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", color: "#fff", cursor: "pointer", boxShadow: "0 4px 20px rgba(10,140,42,0.3)" }}>
            {saving ? "SALVANDO..." : "💾 SALVAR PRODUTO"}
          </button>
        </div>
      </div>
    </div>
  );
}
