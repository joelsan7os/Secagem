// ─── pendencias.jsx — Mural de Oportunidades · Secagem H2 ────────────────────
// Agrupa pendências por janela de oportunidade (quando dá pra resolver):
//  🔴 Parada Parte Úmida · ✂️ PP Cortadeira · 📦 PP Enfardamento · 💧 Isolamento Cleaners
// Fontes automáticas (só leitura): chamados abertos, válvula c/ passagem, equip. fora.
// Fonte manual (editável): pendencias_h2.
// Exporta .xlsx via SheetJS (CDN). Resolução das automáticas é feita na origem.
import * as React from "react";
import { COL, doc, setDoc, getDoc } from "./firebase";

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  bg:"#04111D", surface:"#071828", card:"#0A1929",
  accent:"#00E676", accentLight:"#00E676", accentDark:"#006B2E",
  blue:"#0E2847", blueLight:"#1A5CCC",
  warning:"#b87d00", warningLight:"#FFC107",
  danger:"#c0272d", dangerLight:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880",
  border:"rgba(60,255,140,0.15)", tagBg:"rgba(255,255,255,0.04)",
};
const inputStyle={width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:14,outline:"none"};

// ── Storage helpers ───────────────────────────────────────────────────────────
const storageGet = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const storageSet = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  try { setDoc(doc(COL, k), { val: v, ts: Date.now() }); } catch {}
};
const cloudGet = async (k) => {
  try { const s = await getDoc(doc(COL, k)); if (s.exists()) { const d=s.data().val; try{localStorage.setItem(k,JSON.stringify(d));}catch{} return d; } } catch {}
  return storageGet(k);
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const hoje      = () => new Date().toISOString().slice(0,10);
const horaAtual = () => new Date().toTimeString().slice(0,5);
const fmtData   = d => { if(!d) return "—"; const [y,m,dd]=d.split("-"); return `${dd}/${m}/${y}`; };

// ── Janelas de oportunidade ───────────────────────────────────────────────────
const JANELAS = [
  { id:"pu",   label:"Parada — Parte Úmida",   icon:"🔴", cor:C.dangerLight,  desc:"Quebra de máquina / parada da PU" },
  { id:"cs",   label:"PP — Cortadeira",         icon:"✂️", cor:"#5090FF",       desc:"Faquinhas, facão, parada programada" },
  { id:"enf",  label:"PP — Enfardamento",       icon:"📦", cor:C.warningLight,  desc:"Manutenções de linha (L4–L8)" },
  { id:"clean",label:"Isolamento Cleaners",     icon:"💧", cor:"#00C2D1",       desc:"Válvula c/ passagem — isola e faz PP" },
];

// Mapeia área granular do equipamento → janela
function areaParaJanela(area) {
  const a = (area||"").toLowerCase();
  if (a === "cortadeira" || a === "cs") return "cs";
  if (a === "enfardamento" || a === "enf") return "enf";
  if (a === "cleaners") return "clean";
  return "pu"; // formação, prensa, secador, vácuo, bombas, depuração, etc.
}

// ─────────────────────────────────────────────────────────────────────────────
function MuralInterno({ eqState = {}, onVoltar }) {
  const cfg = storageGet("op_config") || {};
  const operador = cfg.nomeOperador || "";

  const [manuais, setManuais]   = React.useState(() => storageGet("pendencias_h2") || []);
  const [chamados, setChamados] = React.useState(() => storageGet("chamados_h2") || []);
  const [cleaners, setCleaners] = React.useState(() => storageGet("cleaners_h2") || {M2:{},M3:{}});
  const [addOpen, setAddOpen]   = React.useState(false);
  const [exportando, setExportando] = React.useState(false);
  const [janelaAdd, setJanelaAdd]   = React.useState("pu");
  const [descAdd, setDescAdd]       = React.useState("");
  const [notaAdd, setNotaAdd]       = React.useState("");

  React.useEffect(() => {
    cloudGet("pendencias_h2").then(d => { if (Array.isArray(d)) setManuais(d); });
    cloudGet("chamados_h2").then(d => { if (Array.isArray(d)) setChamados(d); });
    cloudGet("cleaners_h2").then(d => { if (d) setCleaners(d); });
  }, []);

  // ── Coletar pendências automáticas ──────────────────────────────────────────
  const pendencias = React.useMemo(() => {
    const lista = [];
    try {
      // 1. Chamados abertos
      (Array.isArray(chamados)?chamados:[]).filter(c => c && c.status === "aberto").forEach(c => {
        const jan = c.condicao === "Parada de máquina" ? "pu" : areaParaJanela(c.area);
        lista.push({
          chave: "cham:"+c.id, janela: jan, origem: "Chamado",
          titulo: c.equipamentoNome || "Equipamento", tag: c.equipamentoTag || "",
          descricao: c.descricao || "", nota: c.notaSAP || "", prazo: c.prazo || "",
          disciplina: c.disciplina || "", maquina: c.maquina || "", area: c.area || "",
          data: c.dataAbertura || "", operador: c.operador || "", tipo: "auto",
        });
      });

      // 2. Válvula com passagem (cleaners)
      ["M2","M3"].forEach(mq => {
        const garrafas = (cleaners && cleaners[mq]) || {};
        Object.entries(garrafas).forEach(([key, g]) => {
          const ms = g?.motivos || (g?.motivo ? [g.motivo] : []);
          if (Array.isArray(ms) && ms.includes("Válvula com passagem")) {
            lista.push({
              chave: `pass:${mq}:${key}`, janela: "clean", origem: "Cleaners",
              titulo: `Válvula c/ passagem — ${key}`, tag: mq,
              descricao: "Válvula com passagem — só resolve com cleaners isolado ou máquina parada",
              nota: "", prazo: "Urgente", disciplina: "Mecânica", maquina: mq, area: "Cleaners",
              data: g?.data || "", operador: g?.operador || "", tipo: "auto",
              multiJanela: ["clean","pu"],
            });
          }
        });
      });

      // 3. Equipamentos fora de operação (ALERTA / MANUTENÇÃO)
      const es = eqState || {};
      const todosEq = [
        ...(Array.isArray(es.comum)?es.comum:[]), ...(Array.isArray(es.m2)?es.m2:[]), ...(Array.isArray(es.m3)?es.m3:[]),
        ...(Array.isArray(es.cs_m2)?es.cs_m2:[]), ...(Array.isArray(es.cs_m3)?es.cs_m3:[]),
        ...(Array.isArray(es.enf_m2)?es.enf_m2:[]), ...(Array.isArray(es.enf_m3)?es.enf_m3:[]),
      ];
      todosEq.filter(e => e && (e.status === "MANUTENÇÃO" || e.status === "ALERTA")).forEach(e => {
        lista.push({
          chave: "eq:"+e.id, janela: areaParaJanela(e.area), origem: "Equipamento",
          titulo: e.nome || "Equipamento", tag: e.tag || "",
          descricao: e.status === "MANUTENÇÃO" ? "Em manutenção / fora de operação" : "Em alerta",
          nota: "", prazo: e.status === "MANUTENÇÃO" ? "Urgente" : "Normal",
          disciplina: "", maquina: e.sub || "", area: e.area || "",
          data: "", operador: "", tipo: "auto",
        });
      });

      // 4. Pendências manuais (abertas)
      (Array.isArray(manuais)?manuais:[]).filter(p => p && p.status !== "resolvida").forEach(p => {
        lista.push({
          chave: "man:"+p.id, id: p.id, janela: p.janela, origem: "Manual",
          titulo: p.descricao, tag: "", descricao: p.descricao,
          nota: p.nota || "", prazo: "", disciplina: "", maquina: "", area: "",
          data: p.data || "", operador: p.operador || "", tipo: "manual",
        });
      });
    } catch (err) {
      console.error("Erro ao montar pendências:", err);
    }
    return lista;
  }, [chamados, cleaners, eqState, manuais]);

  // Agrupar por janela (válvula c/ passagem aparece em clean E pu)
  const porJanela = React.useMemo(() => {
    const g = { pu:[], cs:[], enf:[], clean:[] };
    pendencias.forEach(p => {
      if (p.multiJanela) { p.multiJanela.forEach(j => g[j]?.push(p)); }
      else g[p.janela]?.push(p);
    });
    return g;
  }, [pendencias]);

  const total = pendencias.filter(p => !p.multiJanela).length + pendencias.filter(p=>p.multiJanela).length;

  // ── Adicionar manual ──────────────────────────────────────────────────────────
  function addManual() {
    if (!descAdd.trim()) return;
    const nova = { id:Date.now(), janela:janelaAdd, descricao:descAdd.trim(), nota:notaAdd.trim(), data:hoje(), hora:horaAtual(), operador, status:"aberta" };
    const novo = [nova, ...manuais];
    setManuais(novo); storageSet("pendencias_h2", novo);
    setDescAdd(""); setNotaAdd(""); setAddOpen(false);
  }
  function resolverManual(id) {
    const novo = manuais.map(p => p.id === id ? {...p, status:"resolvida", dataResol:hoje(), horaResol:horaAtual()} : p);
    setManuais(novo); storageSet("pendencias_h2", novo);
  }

  // ── Exportar Excel (SheetJS via CDN) ──────────────────────────────────────────
  function exportarExcel() {
    setExportando(true);
    const gerar = () => {
      if (!window.XLSX) { alert("Biblioteca Excel não carregou. Tente novamente."); setExportando(false); return; }
      const linhas = [];
      JANELAS.forEach(jan => {
        (porJanela[jan.id]||[]).forEach(p => {
          linhas.push({
            "Janela": jan.label,
            "Origem": p.origem,
            "Pendência": p.titulo,
            "TAG": p.tag,
            "Descrição": p.descricao,
            "Nota SAP": p.nota,
            "Prazo": p.prazo,
            "Disciplina": p.disciplina,
            "Máquina": p.maquina,
            "Área": p.area,
            "Data": fmtData(p.data),
            "Operador": p.operador,
          });
        });
      });
      const ws = window.XLSX.utils.json_to_sheet(linhas);
      ws["!cols"] = [{wch:24},{wch:12},{wch:32},{wch:18},{wch:40},{wch:14},{wch:12},{wch:14},{wch:8},{wch:14},{wch:12},{wch:16}];
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, "Oportunidades");
      window.XLSX.writeFile(wb, `Mural_Oportunidades_${hoje()}.xlsx`);
      setExportando(false);
    };
    if (!window.XLSX) {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      s.onload = gerar;
      s.onerror = () => { alert("Falha ao carregar biblioteca Excel."); setExportando(false); };
      document.head.appendChild(s);
    } else { gerar(); }
  }

  // ── Card de pendência ─────────────────────────────────────────────────────────
  function PendCard({ p }) {
    const corOrigem = p.origem === "Chamado" ? "#5090FF" : p.origem === "Cleaners" ? "#00C2D1" : p.origem === "Equipamento" ? C.warningLight : C.accentLight;
    return (
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderLeft:`3px solid ${corOrigem}`, borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:4 }}>
              <span style={{ background:`${corOrigem}22`, border:`1px solid ${corOrigem}55`, color:corOrigem, borderRadius:5, padding:"1px 7px", fontSize:9, fontWeight:800 }}>{p.origem}</span>
              {p.prazo && <span style={{ color:C.textDim, fontSize:9, fontWeight:700 }}>{p.prazo}</span>}
              {p.disciplina && <span style={{ color:C.textDim, fontSize:9 }}>{p.disciplina}</span>}
              {p.multiJanela && <span style={{ color:"#00C2D1", fontSize:9, fontWeight:700 }}>↔ 2 janelas</span>}
            </div>
            <div style={{ color:C.text, fontWeight:700, fontSize:13 }}>{p.titulo}</div>
            {p.tag && <code style={{ color:C.textMuted, fontSize:10 }}>{p.tag}</code>}
            {p.descricao && p.descricao !== p.titulo && <p style={{ color:C.textMuted, fontSize:11, margin:"4px 0 0", lineHeight:1.4 }}>{p.descricao}</p>}
            <div style={{ display:"flex", gap:10, marginTop:5, flexWrap:"wrap" }}>
              {p.nota && <span style={{ color:C.warningLight, fontSize:10, fontFamily:"monospace", fontWeight:700 }}>📋 {p.nota}</span>}
              {p.data && <span style={{ color:C.textDim, fontSize:9 }}>📅 {fmtData(p.data)}</span>}
              {p.operador && <span style={{ color:C.textDim, fontSize:9 }}>👤 {p.operador}</span>}
            </div>
          </div>
          {p.tipo === "manual" && (
            <button onClick={()=>resolverManual(p.id)} style={{ flexShrink:0, background:"rgba(0,230,118,0.12)", border:`1px solid ${C.accentLight}44`, color:C.accentLight, borderRadius:7, padding:"5px 9px", fontSize:10, fontWeight:700, cursor:"pointer" }}>✓ Resolver</button>
          )}
        </div>
      </div>
    );
  }

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding:"16px 16px 80px" }}>
      <button onClick={onVoltar} style={{ background:C.tagBg, border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:9, padding:"9px 14px", cursor:"pointer", fontSize:12, fontWeight:700, marginBottom:14 }}>← Início</button>

      {/* Header */}
      <div style={{ marginBottom:16 }}>
        <h2 style={{ color:C.text, fontSize:20, fontWeight:800, margin:"0 0 4px" }}>🎯 Mural de Oportunidades</h2>
        <p style={{ color:C.textMuted, fontSize:12, margin:0 }}>O que aproveitar em cada janela de parada — {total} pendência{total!==1?"s":""}</p>
      </div>

      {/* Ações */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <button onClick={()=>setAddOpen(true)} style={{ flex:1, padding:11, borderRadius:10, border:`1px solid ${C.border}`, background:C.tagBg, color:C.text, fontSize:12, fontWeight:700, cursor:"pointer" }}>➕ Adicionar</button>
        <button onClick={exportarExcel} disabled={exportando||total===0} style={{ flex:1, padding:11, borderRadius:10, border:"none", background:total===0?C.textDim:"linear-gradient(135deg,#006B2E,#00E676)", color:"#fff", fontSize:12, fontWeight:800, cursor:total===0?"not-allowed":"pointer", boxShadow:total>0?"0 0 12px rgba(0,230,118,0.3)":"none" }}>
          {exportando?"Gerando…":"📥 Exportar Excel"}
        </button>
      </div>

      {/* Modal adicionar */}
      {addOpen && (
        <div onClick={()=>setAddOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20, maxWidth:380, width:"100%" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <span style={{ color:C.text, fontWeight:800, fontSize:15 }}>➕ Nova Pendência</span>
              <button onClick={()=>setAddOpen(false)} style={{ background:"none", border:"none", color:C.textMuted, fontSize:20, cursor:"pointer" }}>×</button>
            </div>
            <label style={{ color:C.textMuted, fontSize:10, textTransform:"uppercase", display:"block", marginBottom:6 }}>Janela</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
              {JANELAS.map(j => (
                <button key={j.id} onClick={()=>setJanelaAdd(j.id)} style={{ padding:"8px 6px", borderRadius:8, cursor:"pointer", fontSize:11, fontWeight:700, textAlign:"left",
                  background: janelaAdd===j.id ? `${j.cor}22` : C.tagBg,
                  border:`1.5px solid ${janelaAdd===j.id ? j.cor : C.border}`,
                  color: janelaAdd===j.id ? j.cor : C.textMuted }}>
                  {j.icon} {j.label}
                </button>
              ))}
            </div>
            <label style={{ color:C.textMuted, fontSize:10, textTransform:"uppercase", display:"block", marginBottom:6 }}>Descrição</label>
            <textarea value={descAdd} onChange={e=>setDescAdd(e.target.value)} rows={3} placeholder="O que precisa ser feito..." style={{ ...inputStyle, resize:"vertical", fontFamily:"inherit", marginBottom:12 }}/>
            <label style={{ color:C.textMuted, fontSize:10, textTransform:"uppercase", display:"block", marginBottom:6 }}>Nota SAP (opcional)</label>
            <input value={notaAdd} onChange={e=>setNotaAdd(e.target.value)} placeholder="Nº nota SAP..." style={{ ...inputStyle, fontFamily:"monospace", marginBottom:16 }}/>
            <button onClick={addManual} disabled={!descAdd.trim()} style={{ width:"100%", padding:12, borderRadius:10, border:"none", background:descAdd.trim()?C.accent:C.textDim, color:"#fff", fontSize:13, fontWeight:800, cursor:descAdd.trim()?"pointer":"not-allowed" }}>Adicionar Pendência</button>
          </div>
        </div>
      )}

      {/* Janelas */}
      {JANELAS.map(jan => {
        const itens = porJanela[jan.id] || [];
        return (
          <div key={jan.id} style={{ marginBottom:18 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, paddingBottom:6, borderBottom:`2px solid ${jan.cor}44` }}>
              <span style={{ fontSize:18 }}>{jan.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ color:C.text, fontWeight:800, fontSize:14 }}>{jan.label}</div>
                <div style={{ color:C.textDim, fontSize:10 }}>{jan.desc}</div>
              </div>
              <span style={{ background:`${jan.cor}22`, color:jan.cor, borderRadius:20, padding:"2px 10px", fontSize:12, fontWeight:800 }}>{itens.length}</span>
            </div>
            {itens.length === 0 ? (
              <div style={{ color:C.textDim, fontSize:11, fontStyle:"italic", padding:"8px 0" }}>— nada pendente nesta janela —</div>
            ) : itens.map(p => <PendCard key={p.chave} p={p}/>)}
          </div>
        );
      })}
    </div>
  );
}

// ─── Error Boundary — captura erros e mostra na tela (não deixa app preto) ────
class MuralErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state={erro:null}; }
  static getDerivedStateFromError(erro){ return {erro}; }
  componentDidCatch(erro,info){ console.error("Mural crash:",erro,info); }
  render(){
    if(this.state.erro){
      return (
        <div style={{padding:"16px 16px 80px"}}>
          <button onClick={this.props.onVoltar} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:9,padding:"9px 14px",cursor:"pointer",fontSize:12,fontWeight:700,marginBottom:14}}>← Início</button>
          <div style={{background:C.card,border:`1px solid ${C.dangerLight}44`,borderLeft:`3px solid ${C.dangerLight}`,borderRadius:12,padding:16}}>
            <div style={{color:C.dangerLight,fontWeight:800,fontSize:14,marginBottom:8}}>⚠ Erro ao carregar o Mural</div>
            <pre style={{color:C.textMuted,fontSize:11,whiteSpace:"pre-wrap",wordBreak:"break-word",margin:0,fontFamily:"monospace"}}>{String(this.state.erro?.message||this.state.erro)}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function MuralOportunidades(props){
  return (
    <MuralErrorBoundary onVoltar={props.onVoltar}>
      <MuralInterno {...props}/>
    </MuralErrorBoundary>
  );
}
