"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  supabase, Product, ColorGroup, ColorGroupForm,
  fmt, getSizes, uploadProductImage, isTenis, isBone, tmpId
} from "@/lib/supabase";

type ProductForm = {
  club: string; brand: string; name: string; meta: string; description: string;
  price: string; old_price: string; badge: string;
  type: "camisa" | "tenis" | "bone"; category: string; active: boolean; image_url: string;
};
const EMPTY: ProductForm = {
  club:"", brand:"", name:"", meta:"", description:"",
  price:"", old_price:"", badge:"", type:"camisa",
  category:"nacional", active:true, image_url:"",
};

function emptyGroup(type: string): ColorGroupForm {
  return { tempId: tmpId(), color:"", image_url:"",
    sizes: getSizes(type).map(s => ({ tempId: tmpId(), size: s, stock: 0 })) };
}

const inp: React.CSSProperties = {
  width:"100%", background:"rgba(255,255,255,0.05)",
  border:"1px solid rgba(255,255,255,0.12)", borderRadius:"10px",
  padding:"11px 14px", color:"#fff", fontSize:"16px", outline:"none",
  fontFamily:"var(--font-body)",
};
const lbl: React.CSSProperties = {
  display:"block", fontFamily:"var(--font-body)", fontWeight:700,
  fontSize:"0.7rem", letterSpacing:"1px", textTransform:"uppercase",
  color:"rgba(245,245,245,0.45)", marginBottom:"6px",
};
const card: React.CSSProperties = {
  background:"var(--dark2)", border:"1px solid rgba(255,255,255,0.07)",
  borderRadius:"14px", padding:"20px",
};

function typeIcon(t: string) { return t==="tenis"?"👟":t==="bone"?"🧢":"⚽"; }
function typeColor(t: string) { return t==="tenis"?"#0057b7":t==="bone"?"#8b5cf6":"var(--green)"; }

const BADGE_OPTIONS = [
  {v:"",      label:"Nenhum", icon:"—"},
  {v:"new",   label:"Novo",   icon:"🟢"},
  {v:"sale",  label:"Oferta", icon:"🔴"},
  {v:"retro", label:"Retrô",  icon:"🟡"},
];

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [products,    setProducts]    = useState<Product[]>([]);
  const [tab,         setTab]         = useState<"list"|"edit">("list");
  const [isNew,       setIsNew]       = useState(true);
  const [editingId,   setEditingId]   = useState<number|undefined>();
  const [form,        setForm]        = useState<ProductForm>(EMPTY);
  const [colorGroups, setColorGroups] = useState<ColorGroupForm[]>([]);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [search,      setSearch]      = useState("");
  const [mainPreview, setMainPreview] = useState("");
  const [uploading,   setUploading]   = useState(false);
  const mainFileRef   = useRef<HTMLInputElement>(null);
  const groupFileRefs = useRef<Record<string,HTMLInputElement|null>>({});

  const load = useCallback(async () => {
    const { data: prods } = await supabase.from("products").select("*").order("category").order("id");
    if (!prods) return;
    const { data: groups } = await supabase.from("product_color_groups").select("*").order("sort_order");
    const gMap: Record<number,ColorGroup[]> = {};
    (groups||[]).forEach(g => { if (!gMap[g.product_id]) gMap[g.product_id]=[]; gMap[g.product_id].push(g); });
    setProducts(prods.map(p => ({ ...p, colorGroups: gMap[p.id]||[] })));
  }, []);

  useEffect(() => { load(); }, [load]);

  const startNew = () => {
    setForm({...EMPTY}); setColorGroups([emptyGroup("camisa")]);
    setMainPreview(""); setIsNew(true); setEditingId(undefined); setTab("edit"); setError("");
  };

  const startEdit = (p: Product) => {
    setForm({ club:p.club, brand:p.brand||p.club, name:p.name, meta:p.meta||"",
      description:p.description||"", price:String(p.price),
      old_price:p.old_price?String(p.old_price):"",
      badge:p.badge||"", type:p.type||"camisa", category:p.category,
      active:p.active, image_url:p.image_url||"" });
    const cg: ColorGroupForm[] = (p.colorGroups||[]).map(g => ({
      tempId:String(g.id), color:g.color, image_url:g.image_url,
      sizes:(g.sizes||[]).map(ss => ({ tempId:tmpId(), size:ss.size, stock:ss.stock })),
    }));
    setColorGroups(cg.length ? cg : [emptyGroup(p.type)]);
    setMainPreview(p.image_url||""); setIsNew(false); setEditingId(p.id); setTab("edit"); setError("");
  };

  const handleMainUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true); setMainPreview(URL.createObjectURL(f));
    const url = await uploadProductImage(f);
    if (url) { setForm(p=>({...p,image_url:url})); setMainPreview(url); }
    else setError("Erro no upload.");
    setUploading(false);
  };
  const handleGroupUpload = async (e: React.ChangeEvent<HTMLInputElement>, gTid: string) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await uploadProductImage(f);
    if (url) setColorGroups(prev => prev.map(g => g.tempId===gTid?{...g,image_url:url}:g));
  };

  const addGroup    = () => setColorGroups(p=>[...p,emptyGroup(form.type)]);
  const removeGroup = (tid:string) => setColorGroups(p=>p.filter(g=>g.tempId!==tid));
  const setGroup    = (tid:string,key:keyof ColorGroupForm,val:string) =>
    setColorGroups(p=>p.map(g=>g.tempId===tid?{...g,[key]:val}:g));
  const addSize     = (gTid:string) =>
    setColorGroups(prev=>prev.map(g=>g.tempId===gTid?{...g,sizes:[...g.sizes,{tempId:tmpId(),size:"",stock:5}]}:g));
  const removeSize  = (gTid:string,sTid:string) =>
    setColorGroups(prev=>prev.map(g=>g.tempId===gTid?{...g,sizes:g.sizes.filter(s=>s.tempId!==sTid)}:g));
  const setSize     = (gTid:string,sTid:string,key:"size"|"stock",val:string|number) =>
    setColorGroups(prev=>prev.map(g=>g.tempId===gTid?{...g,sizes:g.sizes.map(s=>s.tempId===sTid?{...s,[key]:val}:s)}:g));

  const save = async () => {
    if (!form.club||!form.name||!form.price) { setError("Preencha clube, nome e preço."); return; }
    if (colorGroups.some(g=>g.sizes.some(s=>!s.size))) { setError("Todos os tamanhos precisam ter valor."); return; }
    setSaving(true); setError("");
    const allSizes   = Array.from(new Set(colorGroups.flatMap(g=>g.sizes.map(s=>s.size)).filter(Boolean)));
    const totalStock = colorGroups.reduce((s,g)=>s+g.sizes.reduce((ss,x)=>ss+(Number(x.stock)||0),0),0);
    const payload = {
      club:form.club.trim(), brand:(form.brand||form.club).trim(),
      name:form.name.trim(), meta:form.meta.trim(), description:form.description.trim(),
      price:parseFloat(form.price), old_price:form.old_price?parseFloat(form.old_price):null,
      badge:form.badge||null, type:form.type, category:form.category,
      active:form.active, image_url:form.image_url.trim(), stock:totalStock, sizes:allSizes,
    };
    let pid = editingId;
    if (isNew) {
      const { data, error:e } = await supabase.from("products").insert([payload]).select().single();
      if (e||!data) { setError(e?.message||"Erro"); setSaving(false); return; }
      pid = data.id;
    } else {
      const { error:e } = await supabase.from("products").update(payload).eq("id",pid!);
      if (e) { setError(e.message); setSaving(false); return; }
      await supabase.from("product_color_groups").delete().eq("product_id",pid!);
    }
    const gp = colorGroups.map((g,i)=>({ product_id:pid!, color:g.color.trim(), image_url:g.image_url.trim(),
      sizes:g.sizes.filter(s=>s.size).map(s=>({size:s.size,stock:Number(s.stock)||0})), sort_order:i }));
    const { error:ge } = await supabase.from("product_color_groups").insert(gp);
    if (ge) { setError(ge.message); setSaving(false); return; }
    await load(); setTab("list"); setSaving(false);
  };

  const deleteProduct = async (id:number) => {
    if (!confirm("Excluir produto?")) return;
    await supabase.from("products").delete().eq("id",id);
    setProducts(prev=>prev.filter(p=>p.id!==id));
  };
  const toggleActive = async (id:number,active:boolean) => {
    await supabase.from("products").update({active:!active}).eq("id",id);
    setProducts(prev=>prev.map(p=>p.id===id?{...p,active:!active}:p));
  };

  const filtered = products.filter(p=>
    [p.club,p.name,p.category].some(s=>s.toLowerCase().includes(search.toLowerCase()))
  );

  // ── LISTA ─────────────────────────────────────────────────────────────────
  if (tab==="list") return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px", flexWrap:"wrap", gap:"12px" }}>
        <div>
          <h1 style={{ fontFamily:"var(--font-display)", fontSize:"2rem", letterSpacing:"2px", color:"#fff" }}>PRODUTOS</h1>
          <p style={{ color:"rgba(245,245,245,0.4)", fontSize:"0.82rem" }}>{products.length} total · {products.filter(p=>p.active).length} ativos</p>
        </div>
        <button onClick={startNew}
          style={{ background:"linear-gradient(135deg,#0a8c2a,#12b83a)", border:"none", borderRadius:"10px", padding:"11px 22px", fontFamily:"var(--font-body)", fontWeight:900, fontSize:"0.9rem", letterSpacing:"1px", color:"#fff", cursor:"pointer" }}>
          + Novo Produto
        </button>
      </div>

      {/* Busca */}
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar produto..."
        style={{ ...inp, marginBottom:"20px", maxWidth:"400px" }} />

      {/* ── TABELA: desktop ── */}
      <div className="hidden md:block" style={{ background:"var(--dark2)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", overflow:"hidden" }}>
        {/* Cabeçalho */}
        <div style={{ display:"grid", gridTemplateColumns:"56px 1fr 80px 130px 90px 70px 80px 100px", padding:"10px 18px", borderBottom:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)" }}>
          {["Foto","Produto","Tipo","Preço","Cores","Estoque","Status","Ações"].map(h=>(
            <div key={h} style={{ fontFamily:"var(--font-body)", fontWeight:700, fontSize:"0.68rem", letterSpacing:"1.5px", textTransform:"uppercase", color:"rgba(245,245,245,0.35)" }}>{h}</div>
          ))}
        </div>
        {filtered.length===0 && <div style={{ padding:"48px", textAlign:"center", color:"rgba(245,245,245,0.3)" }}>Nenhum produto encontrado</div>}
        {filtered.map((p,i)=>{
          const groups = p.colorGroups||[];
          const stock  = groups.reduce((s,g)=>s+(g.sizes||[]).reduce((ss,x)=>ss+x.stock,0),0);
          return (
            <div key={p.id} style={{ display:"grid", gridTemplateColumns:"56px 1fr 80px 130px 90px 70px 80px 100px", padding:"12px 18px", alignItems:"center", borderBottom:i<filtered.length-1?"1px solid rgba(255,255,255,0.04)":"none", opacity:p.active?1:0.45 }}>
              {/* Foto */}
              <div style={{ width:"44px", height:"44px", background:"var(--dark3)", borderRadius:"8px", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", opacity:0.5 }}>
                {p.image_url?<img src={p.image_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>:typeIcon(p.type)}
              </div>
              {/* Produto */}
              <div>
                <div style={{ fontWeight:600, color:"#fff", fontSize:"0.88rem" }}>{p.club}</div>
                <div style={{ fontSize:"0.73rem", color:"rgba(245,245,245,0.38)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
              </div>
              {/* Tipo */}
              <div>
                <span style={{ background:`${typeColor(p.type)}22`, color:typeColor(p.type), fontSize:"0.65rem", fontWeight:700, padding:"3px 8px", borderRadius:"4px", textTransform:"uppercase" }}>
                  {typeIcon(p.type)} {p.type}
                </span>
              </div>
              {/* Preço */}
              <div>
                <div style={{ fontFamily:"var(--font-display)", fontSize:"1.05rem", color:"var(--yellow)" }}>R$ {fmt(p.price)}</div>
                {p.old_price&&<div style={{ fontSize:"0.7rem", color:"rgba(245,245,245,0.28)", textDecoration:"line-through" }}>R$ {fmt(p.old_price)}</div>}
              </div>
              {/* Cores (swatches) */}
              <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
                {groups.filter(g=>g.color).slice(0,5).map(g=>(
                  <div key={g.id} title={g.color} style={{ width:"14px", height:"14px", borderRadius:"50%", background:g.image_url?`url(${g.image_url}) center/cover`:"#555", border:"1px solid rgba(255,255,255,0.2)" }}/>
                ))}
                {groups.length===0&&<span style={{ fontSize:"0.72rem", color:"rgba(245,245,245,0.3)" }}>—</span>}
              </div>
              {/* Estoque */}
              <div style={{ fontFamily:"var(--font-display)", fontSize:"1rem", color:stock>0?"var(--green-light)":"#ff6b6b" }}>{stock}</div>
              {/* Status */}
              <div>
                <button onClick={()=>toggleActive(p.id,p.active)}
                  style={{ padding:"4px 10px", borderRadius:"20px", border:"none", background:p.active?"rgba(18,184,58,0.2)":"rgba(255,255,255,0.07)", color:p.active?"#12b83a":"rgba(245,245,245,0.35)", fontSize:"0.7rem", fontFamily:"var(--font-body)", fontWeight:700, cursor:"pointer" }}>
                  {p.active?"ATIVO":"OCULTO"}
                </button>
              </div>
              {/* Ações */}
              <div style={{ display:"flex", gap:"6px" }}>
                <button onClick={()=>startEdit(p)} style={{ padding:"5px 10px", borderRadius:"7px", background:"rgba(0,87,183,0.2)", border:"1px solid rgba(0,87,183,0.3)", color:"#6baed6", fontSize:"0.8rem", cursor:"pointer" }}>✏️</button>
                <button onClick={()=>deleteProduct(p.id)} style={{ padding:"5px 10px", borderRadius:"7px", background:"rgba(224,60,60,0.15)", border:"1px solid rgba(224,60,60,0.3)", color:"#ff6b6b", fontSize:"0.8rem", cursor:"pointer" }}>🗑️</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CARDS: mobile ── */}
      <div className="md:hidden" style={{ display:"flex", flexDirection:"column", gap:"10px", paddingBottom:"80px" }}>
        {filtered.length===0&&(
          <div style={{ textAlign:"center", padding:"48px 20px", color:"rgba(245,245,245,0.3)" }}>
            <div style={{ fontSize:"2.5rem", marginBottom:"10px" }}>📦</div>
            <div>Nenhum produto</div>
          </div>
        )}
        {filtered.map(p=>{
          const groups = p.colorGroups||[];
          const stock  = groups.reduce((s,g)=>s+(g.sizes||[]).reduce((ss,x)=>ss+x.stock,0),0);
          return (
            <div key={p.id} style={{ background:"var(--dark2)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", overflow:"hidden", opacity:p.active?1:0.5 }}>
              <div style={{ display:"flex", gap:"12px", padding:"14px" }}>
                <div style={{ width:"64px", height:"64px", borderRadius:"10px", background:"var(--dark3)", overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem", opacity:0.5 }}>
                  {p.image_url?<img src={p.image_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>:typeIcon(p.type)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", gap:"6px", alignItems:"flex-start", marginBottom:"4px" }}>
                    <span style={{ background:`${typeColor(p.type)}22`, color:typeColor(p.type), fontSize:"0.58rem", fontWeight:700, padding:"2px 6px", borderRadius:"4px", textTransform:"uppercase", flexShrink:0, marginTop:"2px" }}>{typeIcon(p.type)}</span>
                    <span style={{ color:"#fff", fontWeight:700, fontSize:"0.9rem", lineHeight:1.2 }}>{p.club} — {p.name}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
                    <span style={{ fontFamily:"var(--font-display)", fontSize:"1.05rem", color:"var(--yellow)" }}>R$ {fmt(p.price)}</span>
                    <span style={{ fontSize:"0.72rem", color:stock>0?"var(--green-light)":"#ff6b6b" }}>{stock} un.</span>
                    {groups.filter(g=>g.color).slice(0,4).map(g=>(
                      <div key={g.id} style={{ width:"12px", height:"12px", borderRadius:"50%", background:g.image_url?`url(${g.image_url}) center/cover`:"#555", border:"1px solid rgba(255,255,255,0.2)" }}/>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <button onClick={()=>toggleActive(p.id,p.active)} style={{ flex:1, padding:"10px", background:"none", border:"none", color:p.active?"var(--green-light)":"rgba(245,245,245,0.35)", fontSize:"0.75rem", fontWeight:700, cursor:"pointer", fontFamily:"var(--font-body)" }}>{p.active?"✓ ATIVO":"OCULTO"}</button>
                <div style={{ width:"1px", background:"rgba(255,255,255,0.06)" }}/>
                <button onClick={()=>startEdit(p)} style={{ flex:1, padding:"10px", background:"none", border:"none", color:"#6baed6", fontSize:"0.75rem", fontWeight:700, cursor:"pointer", fontFamily:"var(--font-body)" }}>✏️ EDITAR</button>
                <div style={{ width:"1px", background:"rgba(255,255,255,0.06)" }}/>
                <button onClick={()=>deleteProduct(p.id)} style={{ flex:1, padding:"10px", background:"none", border:"none", color:"#ff6b6b", fontSize:"0.75rem", fontWeight:700, cursor:"pointer", fontFamily:"var(--font-body)" }}>🗑️</button>
              </div>
            </div>
          );
        })}
        {/* FAB mobile */}
        <button onClick={startNew}
          style={{ position:"fixed", bottom:"72px", right:"16px", width:"52px", height:"52px", borderRadius:"50%", background:"linear-gradient(135deg,#0a8c2a,#12b83a)", border:"none", color:"#fff", fontSize:"1.8rem", cursor:"pointer", boxShadow:"0 6px 24px rgba(10,140,42,0.5)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
      </div>
    </div>
  );

  // ── FORMULÁRIO ─────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px", flexWrap:"wrap", gap:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <button onClick={()=>{setTab("list");setError("");}}
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"10px 18px", color:"#fff", cursor:"pointer", fontFamily:"var(--font-body)", fontWeight:700, fontSize:"0.88rem" }}>
            ← Voltar
          </button>
          <div>
            <h1 style={{ fontFamily:"var(--font-display)", fontSize:"1.8rem", letterSpacing:"2px", color:"#fff" }}>{isNew?"NOVO PRODUTO":"EDITAR PRODUTO"}</h1>
            <p style={{ color:"rgba(245,245,245,0.4)", fontSize:"0.8rem" }}>{colorGroups.length} cor(es) cadastrada(s)</p>
          </div>
        </div>
        {/* Salvar — desktop header */}
        <button onClick={save} disabled={saving}
          className="hidden md:block"
          style={{ background:saving?"rgba(255,255,255,0.1)":"linear-gradient(135deg,#0a8c2a,#12b83a)", border:"none", borderRadius:"10px", padding:"11px 28px", fontFamily:"var(--font-body)", fontWeight:900, fontSize:"0.9rem", letterSpacing:"1px", color:"#fff", cursor:saving?"wait":"pointer" }}>
          {saving?"SALVANDO...":"💾 SALVAR"}
        </button>
      </div>

      {/* ── GRID: desktop 2 colunas, mobile 1 coluna ── */}
      <div style={{ display:"grid", gap:"20px" }} className="md:grid-cols-[1fr_300px]">

        {/* Coluna principal */}
        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>

          {/* INFO */}
          <section style={card}>
            <div style={{ fontFamily:"var(--font-display)", fontSize:"0.95rem", letterSpacing:"2px", color:"#fff", marginBottom:"16px" }}>INFORMAÇÕES</div>
            <div style={{ display:"grid", gap:"12px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <label style={lbl}>Tipo *</label>
                  <select style={inp} value={form.type}
                    onChange={e=>{
                      const t = e.target.value as "camisa"|"tenis"|"bone";
                      setForm(p=>({...p,type:t,category:t==="tenis"?"tenis":t==="bone"?"bone":"nacional"}));
                      setColorGroups(prev=>prev.map(g=>({...g,sizes:getSizes(t).map(s=>({tempId:tmpId(),size:s,stock:0}))})));
                    }}>
                    <option value="camisa">⚽ Camisa</option>
                    <option value="tenis">👟 Tênis</option>
                    <option value="bone">🧢 Boné</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Categoria</label>
                  <select style={inp} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                    {form.type==="tenis"?<option value="tenis">Tênis</option>
                      :form.type==="bone"?<option value="bone">Boné</option>
                      :<>
                        <option value="nacional">Nacional</option>
                        <option value="internacional">Internacional</option>
                        <option value="selecao">Seleção</option>
                        <option value="retro">Retrô</option>
                      </>}
                  </select>
                </div>
              </div>
              <div>
                <label style={lbl}>Clube / Marca *</label>
                <input style={inp} value={form.club} onChange={e=>setForm(p=>({...p,club:e.target.value,brand:e.target.value}))} placeholder="Ex: Flamengo, Nike"/>
              </div>
              <div>
                <label style={lbl}>Nome *</label>
                <input style={inp} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Ex: Camisa Oficial I 25/26"/>
              </div>
              <div>
                <label style={lbl}>Meta / Subtítulo</label>
                <input style={inp} value={form.meta} onChange={e=>setForm(p=>({...p,meta:e.target.value}))} placeholder="Ex: Home · Adidas · 2025/26"/>
              </div>
              <div>
                <label style={lbl}>Descrição</label>
                <textarea style={{...inp,minHeight:"80px",resize:"vertical"} as React.CSSProperties}
                  value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Descrição do produto..."/>
              </div>
            </div>
          </section>

          {/* PREÇO */}
          <section style={card}>
            <div style={{ fontFamily:"var(--font-display)", fontSize:"0.95rem", letterSpacing:"2px", color:"#fff", marginBottom:"16px" }}>PREÇO E BADGE</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"12px", marginBottom:"14px" }}>
              <div>
                <label style={lbl}>Preço *</label>
                <input style={inp} type="number" step="0.01" min="0" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="189.90" inputMode="decimal"/>
              </div>
              <div>
                <label style={lbl}>Preço antigo</label>
                <input style={inp} type="number" step="0.01" min="0" value={form.old_price} onChange={e=>setForm(p=>({...p,old_price:e.target.value}))} placeholder="239.90" inputMode="decimal"/>
              </div>
              <div style={{ gridColumn:"span 2" }}>
                <label style={lbl}>Badge</label>
                <div style={{ display:"flex", gap:"8px" }}>
                  {BADGE_OPTIONS.map(b=>(
                    <button key={b.v} type="button" onClick={()=>setForm(p=>({...p,badge:b.v}))}
                      style={{ flex:1, padding:"9px 8px", borderRadius:"8px", border:`1.5px solid ${form.badge===b.v?"var(--green)":"rgba(255,255,255,0.1)"}`, background:form.badge===b.v?"rgba(10,140,42,0.15)":"transparent", color:"#fff", cursor:"pointer", fontFamily:"var(--font-body)", fontWeight:700, fontSize:"0.8rem", display:"flex", alignItems:"center", justifyContent:"center", gap:"4px" }}>
                      {b.icon} {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {form.price&&form.old_price&&parseFloat(form.old_price)>parseFloat(form.price)&&(
              <div style={{ background:"rgba(224,60,60,0.08)", border:"1px solid rgba(224,60,60,0.2)", borderRadius:"8px", padding:"10px 14px", display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:"0.82rem", color:"rgba(245,245,245,0.5)" }}>Desconto calculado</span>
                <span style={{ color:"#ff6b6b", fontWeight:700 }}>-{Math.round(((parseFloat(form.old_price)-parseFloat(form.price))/parseFloat(form.old_price))*100)}%</span>
              </div>
            )}
          </section>

          {/* CORES E TAMANHOS */}
          <section style={card}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
              <div>
                <div style={{ fontFamily:"var(--font-display)", fontSize:"0.95rem", letterSpacing:"2px", color:"#fff" }}>CORES E TAMANHOS</div>
                <div style={{ fontSize:"0.72rem", color:"rgba(245,245,245,0.4)", marginTop:"2px" }}>Cada cor tem sua imagem e estoques por tamanho</div>
              </div>
              <button onClick={addGroup}
                style={{ background:"rgba(10,140,42,0.15)", border:"1px solid rgba(10,140,42,0.35)", borderRadius:"8px", padding:"8px 16px", color:"var(--green-light)", fontFamily:"var(--font-body)", fontWeight:700, fontSize:"0.82rem", cursor:"pointer", whiteSpace:"nowrap" }}>
                + Adicionar cor
              </button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              {colorGroups.map((g,gi)=>{
                const gStock = g.sizes.reduce((s,x)=>s+(Number(x.stock)||0),0);
                return (
                  <div key={g.tempId} style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", overflow:"hidden" }}>
                    {/* Header */}
                    <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
                      {g.color&&<div style={{ width:"20px", height:"20px", borderRadius:"50%", background:g.image_url?`url(${g.image_url}) center/cover`:"#555", flexShrink:0, border:"1px solid rgba(255,255,255,0.2)" }}/>}
                      <span style={{ fontFamily:"var(--font-display)", fontSize:"0.85rem", color:"rgba(245,245,245,0.4)" }}>COR #{gi+1}</span>
                      {g.color&&<span style={{ color:"#fff", fontWeight:700, fontSize:"0.85rem", textTransform:"capitalize" }}>{g.color}</span>}
                      <span style={{ marginLeft:"auto", fontSize:"0.75rem", color:gStock>0?"var(--green-light)":"rgba(245,245,245,0.3)" }}>{gStock} un.</span>
                      {colorGroups.length>1&&(
                        <button onClick={()=>removeGroup(g.tempId)}
                          style={{ background:"rgba(224,60,60,0.15)", border:"none", borderRadius:"6px", padding:"4px 10px", color:"#ff6b6b", fontSize:"0.72rem", cursor:"pointer", fontFamily:"var(--font-body)", fontWeight:700 }}>✕ Remover</button>
                      )}
                    </div>
                    <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:"12px" }}>
                      {/* Nome + Imagem */}
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                        <div>
                          <label style={lbl}>Nome da cor</label>
                          <input style={inp} value={g.color} onChange={e=>setGroup(g.tempId,"color",e.target.value)} placeholder="Ex: Azul, Vermelho..."/>
                        </div>
                        <div>
                          <label style={lbl}>Imagem desta cor</label>
                          <div style={{ display:"flex", gap:"6px" }}>
                            <input style={{...inp,flex:1,fontSize:"0.8rem",padding:"11px 10px"}} value={g.image_url} onChange={e=>setGroup(g.tempId,"image_url",e.target.value)} placeholder="URL..."/>
                            <button onClick={()=>groupFileRefs.current[g.tempId]?.click()}
                              style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", padding:"0 12px", color:"rgba(245,245,245,0.7)", cursor:"pointer", fontSize:"1rem", flexShrink:0, minHeight:"44px" }}>📷</button>
                            <input ref={el=>{groupFileRefs.current[g.tempId]=el;}} type="file" accept="image/*" onChange={e=>handleGroupUpload(e,g.tempId)} style={{ display:"none" }}/>
                          </div>
                          {g.image_url&&<div style={{ marginTop:"6px", width:"44px", height:"44px", borderRadius:"6px", overflow:"hidden", border:"1px solid rgba(255,255,255,0.1)" }}><img src={g.image_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/></div>}
                        </div>
                      </div>
                      {/* Tamanhos */}
                      <div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                          <label style={{...lbl,marginBottom:0}}>Tamanhos e estoques</label>
                          <button onClick={()=>addSize(g.tempId)}
                            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"6px", padding:"4px 12px", color:"rgba(245,245,245,0.6)", fontSize:"0.72rem", cursor:"pointer", fontFamily:"var(--font-body)", fontWeight:700 }}>
                            + Tamanho
                          </button>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:"8px" }}>
                          {g.sizes.map(s=>(
                            <div key={s.tempId} style={{ display:"flex", gap:"6px", alignItems:"center", background:"rgba(255,255,255,0.03)", borderRadius:"8px", padding:"8px 10px", border:"1px solid rgba(255,255,255,0.07)" }}>
                              <select style={{...inp,flex:1,padding:"6px 8px",fontSize:"0.85rem"}} value={s.size} onChange={e=>setSize(g.tempId,s.tempId,"size",e.target.value)}>
                                <option value="">Tam.</option>
                                {getSizes(form.type).map(sz=><option key={sz} value={sz}>{sz}</option>)}
                              </select>
                              <input type="number" min="0" value={s.stock}
                                onChange={e=>setSize(g.tempId,s.tempId,"stock",parseInt(e.target.value)||0)}
                                style={{...inp,width:"56px",padding:"6px 8px",fontSize:"0.85rem",textAlign:"center"}}
                                inputMode="numeric" placeholder="0"/>
                              {g.sizes.length>1&&(
                                <button onClick={()=>removeSize(g.tempId,s.tempId)}
                                  style={{ background:"none", border:"none", color:"rgba(245,245,245,0.25)", cursor:"pointer", fontSize:"0.85rem", padding:"2px", minWidth:"22px" }}>✕</button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Coluna direita — Imagem + Status + Salvar */}
        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>

          {/* Imagem principal */}
          <section style={card}>
            <div style={{ fontFamily:"var(--font-display)", fontSize:"0.95rem", letterSpacing:"2px", color:"#fff", marginBottom:"14px" }}>📸 IMAGEM PRINCIPAL</div>
            <div onClick={()=>!uploading&&mainFileRef.current?.click()}
              style={{ width:"100%", aspectRatio:"1", background:"var(--dark3)", borderRadius:"12px", overflow:"hidden", marginBottom:"10px", cursor:"pointer", border:"2px dashed rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
              {uploading&&<div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ color:"#fff", fontFamily:"var(--font-body)", fontWeight:700 }}>ENVIANDO...</span></div>}
              {mainPreview?<img src={mainPreview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={()=>setMainPreview("")}/>
                :<div style={{ textAlign:"center", color:"rgba(245,245,245,0.3)" }}><div style={{ fontSize:"2.5rem", marginBottom:"8px" }}>📷</div><div style={{ fontSize:"0.78rem", fontFamily:"var(--font-body)" }}>Clique para upload</div></div>}
            </div>
            <input ref={mainFileRef} type="file" accept="image/*" onChange={handleMainUpload} style={{ display:"none" }}/>
            <button onClick={()=>mainFileRef.current?.click()} disabled={uploading}
              style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", padding:"10px", color:"rgba(245,245,245,0.7)", cursor:"pointer", fontFamily:"var(--font-body)", fontWeight:700, fontSize:"0.85rem", marginBottom:"10px" }}>
              {uploading?"ENVIANDO...":mainPreview?"📷 Trocar imagem":"📷 Fazer upload"}
            </button>
            <label style={lbl}>Ou cole uma URL:</label>
            <input style={inp} value={form.image_url} onChange={e=>{ setForm(p=>({...p,image_url:e.target.value})); setMainPreview(e.target.value); }} placeholder="https://..."/>
          </section>

          {/* Status */}
          <section style={card}>
            <div style={{ fontFamily:"var(--font-display)", fontSize:"0.95rem", letterSpacing:"2px", color:"#fff", marginBottom:"14px" }}>STATUS</div>
            <div style={{ display:"flex", alignItems:"center", gap:"14px", cursor:"pointer" }} onClick={()=>setForm(p=>({...p,active:!p.active}))}>
              <div style={{ width:"48px", height:"26px", borderRadius:"13px", background:form.active?"var(--green)":"rgba(255,255,255,0.1)", position:"relative", transition:"background .2s", flexShrink:0 }}>
                <div style={{ position:"absolute", top:"3px", left:form.active?"24px":"3px", width:"20px", height:"20px", borderRadius:"50%", background:"#fff", transition:"left .2s" }}/>
              </div>
              <span style={{ color:form.active?"#fff":"rgba(245,245,245,0.4)", fontFamily:"var(--font-body)", fontWeight:700 }}>{form.active?"Ativo no site":"Oculto"}</span>
            </div>
          </section>

          {error&&<div style={{ background:"rgba(224,60,60,0.1)", border:"1px solid rgba(224,60,60,0.3)", borderRadius:"10px", padding:"12px 16px", fontSize:"0.82rem", color:"#ff6b6b" }}>{error}</div>}

          {/* Salvar — na coluna direita desktop */}
          <button onClick={save} disabled={saving}
            className="hidden md:block"
            style={{ background:saving?"rgba(255,255,255,0.08)":"linear-gradient(135deg,#0a8c2a,#12b83a)", border:"none", borderRadius:"12px", padding:"16px", fontFamily:"var(--font-body)", fontWeight:900, fontSize:"1rem", letterSpacing:"2px", textTransform:"uppercase", color:"#fff", cursor:saving?"wait":"pointer", boxShadow:"0 4px 20px rgba(10,140,42,0.3)" }}>
            {saving?"SALVANDO...":"💾 SALVAR PRODUTO"}
          </button>
        </div>
      </div>

      {/* Salvar — fixo no rodapé mobile */}
      <div className="md:hidden" style={{ position:"fixed", bottom:0, left:0, right:0, padding:"12px 16px", background:"rgba(12,12,12,0.97)", borderTop:"1px solid rgba(255,255,255,0.07)", backdropFilter:"blur(10px)", zIndex:50 }} >
        <button onClick={save} disabled={saving}
          style={{ width:"100%", background:saving?"rgba(255,255,255,0.08)":"linear-gradient(135deg,#0a8c2a,#12b83a)", border:"none", borderRadius:"12px", padding:"15px", fontFamily:"var(--font-body)", fontWeight:900, fontSize:"0.95rem", letterSpacing:"2px", textTransform:"uppercase", color:"#fff", cursor:saving?"wait":"pointer", boxShadow:"0 4px 20px rgba(10,140,42,0.4)", minHeight:"52px" }}>
          {saving?"SALVANDO...":isNew?"💾 CRIAR PRODUTO":"💾 SALVAR ALTERAÇÕES"}
        </button>
      </div>
    </div>
  );
}
