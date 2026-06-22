// ─── pendencias.jsx — Mural de Oportunidades · Secagem H2 · Indústria 5.0 ─────
// Cards de área com donut gauge, breakdown por origem, badges de criticidade,
// ranking com pódio, tabela com abas. Adaptado mobile (empilha).
// Fontes auto (leitura): chamados, válvula c/ passagem, equip. fora.
// Fonte manual (editável): pendencias_h2. Exporta .xlsx via SheetJS (CDN).
import * as React from "react";
import { COL, doc, setDoc, getDoc } from "./firebase";

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

const storageGet = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const storageSet = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  try { setDoc(doc(COL, k), { val: v, ts: Date.now() }); } catch {}
};
const cloudGet = async (k) => {
  try { const s = await getDoc(doc(COL, k)); if (s.exists()) { const d=s.data().val; try{localStorage.setItem(k,JSON.stringify(d));}catch{} return d; } } catch {}
  return storageGet(k);
};

const hoje      = () => new Date().toISOString().slice(0,10);
const horaAtual = () => new Date().toTimeString().slice(0,5);
const fmtData   = d => { if(!d) return "—"; const [y,m,dd]=d.split("-"); return `${dd}/${m}/${y}`; };

// ── Janelas (cor + tipo de impacto) ───────────────────────────────────────────
const JANELAS = [
  { id:"pu",   label:"Parte Úmida",   cor:"#00E676", impacto:"IMPACTO DIRETO", impCor:"#FF5252", desc:"Parada de máquina" },
  { id:"cs",   label:"Cortadeira",    cor:"#5090FF", impacto:"PROGRAMÁVEL",    impCor:"#5090FF", desc:"PP — faquinhas, facão" },
  { id:"enf",  label:"Enfardamento",  cor:"#A87DF0", impacto:"PROGRAMÁVEL",    impCor:"#A87DF0", desc:"PP de linha L4–L8" },
  { id:"clean",label:"Cleaners",      cor:"#00E5D1", impacto:"IMPACTO DIRETO", impCor:"#FF5252", desc:"Isolamento / válvula" },
];

const PESO_PRAZO = { "Imediato":0, "Urgente":1, "Normal":2, "Programável":3, "":4 };

// Criticidade: Imediato→Crítica, Urgente/Cleaners→Média-alta, Normal→Média, Programável→Baixa
function criticidade(p) {
  if (p.prazo==="Imediato" || p.descricao?.includes("manutenção")) return "Crítica";
  if (p.prazo==="Urgente" || p.origem==="Cleaners") return "Crítica";
  if (p.prazo==="Normal" || p.prazo==="") return "Média";
  return "Baixa";
}
const CRIT_COR = { "Crítica":"#FF5252", "Média":"#FFC107", "Baixa":"#00E676" };

function areaParaJanela(area) {
  const a = (area||"").toLowerCase();
  if (a === "cortadeira" || a === "cs") return "cs";
  if (a === "enfardamento" || a === "enf") return "enf";
  if (a === "cleaners") return "clean";
  return "pu";
}
function scorePrioridade(p) {
  let s = (PESO_PRAZO[p.prazo] ?? 4) * 100;
  if (p.origem === "Cleaners") s -= 50;
  if (p.descricao?.includes("manutenção")) s -= 20;
  return s;
}

const STYLES = `
@keyframes mural-led { 0%,100%{opacity:1;} 50%{opacity:.5;} }
@keyframes mural-stagger { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:none;} }
@keyframes mural-dash { from{stroke-dashoffset:var(--circ);} to{stroke-dashoffset:var(--off);} }
.mural-led { animation: mural-led 1.8s ease-in-out infinite; }
.mural-item { animation: mural-stagger .3s ease backwards; }
.mural-ring { animation: mural-dash 1s ease forwards; }
`;

// ── Donut gauge (SVG puro) ────────────────────────────────────────────────────
function DonutGauge({ total, segs, cor }) {
  const R=46, SW=10, circ=2*Math.PI*R;
  let acc=0;
  const partes = segs.filter(s=>s.v>0);
  return (
    <div style={{ position:"relative", width:120, height:120, flexShrink:0 }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform:"rotate(-90deg)" }}>
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={SW}/>
        {partes.map((s,i) => {
          const frac = total>0 ? s.v/total : 0;
          const len = frac*circ;
          const off = -acc*circ;
          acc += frac;
          return (
            <circle key={i} cx="60" cy="60" r={R} fill="none" stroke={s.cor} strokeWidth={SW}
              strokeDasharray={`${len} ${circ-len}`} strokeDashoffset={off} strokeLinecap="round"
              style={{ filter:`drop-shadow(0 0 4px ${s.cor}88)` }}/>
          );
        })}
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:34, fontWeight:900, fontFamily:"monospace", lineHeight:1, color:cor, textShadow:`0 0 14px ${cor}66` }}>{total}</span>
        <span style={{ color:C.textDim, fontSize:8, letterSpacing:"0.18em", marginTop:2 }}>TOTAL</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function MuralInterno({ eqState = {}, onVoltar }) {
  const cfg = storageGet("op_config") || {};
  const operador = cfg.nomeOperador || "";

  const [manuais, setManuais]   = React.useState(() => storageGet("pendencias_h2") || []);
  const [chamados, setChamados] = React.useState(() => storageGet("chamados_h2") || []);
  const [cleaners, setCleaners] = React.useState(() => storageGet("cleaners_h2") || {M2:{},M3:{}});
  const [sel, setSel]           = React.useState("pu");
  const [tabOrigem, setTabOrigem] = React.useState("Todas");
  const [addOpen, setAddOpen]   = React.useState(false);
  const [exportando, setExportando] = React.useState(false);
  const [janelaAdd, setJanelaAdd]   = React.useState("pu");
  const [descAdd, setDescAdd]       = React.useState("");
  const [notaAdd, setNotaAdd]       = React.useState("");

  React.useEffect(() => {
    if (!document.getElementById("mural-styles")) {
      const s=document.createElement("style"); s.id="mural-styles"; s.textContent=STYLES; document.head.appendChild(s);
    }
    cloudGet("pendencias_h2").then(d => { if (Array.isArray(d)) setManuais(d); });
    cloudGet("chamados_h2").then(d => { if (Array.isArray(d)) setChamados(d); });
    cloudGet("cleaners_h2").then(d => { if (d) setCleaners(d); });
  }, []);

  const pendencias = React.useMemo(() => {
    const lista = [];
    try {
      (Array.isArray(chamados)?chamados:[]).filter(c => c && c.status === "aberto").forEach(c => {
        const jan = c.condicao === "Parada de máquina" ? "pu" : areaParaJanela(c.area);
        lista.push({ chave:"cham:"+c.id, janela:jan, origem:"Chamado",
          titulo:c.equipamentoNome||"Equipamento", tag:c.equipamentoTag||"",
          descricao:c.descricao||"", nota:c.notaSAP||"", prazo:c.prazo||"",
          disciplina:c.disciplina||"", maquina:c.maquina||"", area:c.area||"",
          data:c.dataAbertura||"", operador:c.operador||"", tipo:"auto" });
      });
      ["M2","M3"].forEach(mq => {
        const garrafas = (cleaners && cleaners[mq]) || {};
        Object.entries(garrafas).forEach(([key, g]) => {
          const ms = g?.motivos || (g?.motivo ? [g.motivo] : []);
          if (Array.isArray(ms) && ms.includes("Válvula com passagem")) {
            lista.push({ chave:`pass:${mq}:${key}`, janela:"clean", origem:"Cleaners",
              titulo:`Válvula c/ passagem — ${key}`, tag:mq,
              descricao:"Válvula com passagem — só resolve com cleaners isolado ou máquina parada",
              nota:"", prazo:"Urgente", disciplina:"Mecânica", maquina:mq, area:"Cleaners",
              data:g?.data||"", operador:g?.operador||"", tipo:"auto", multiJanela:["clean","pu"] });
          }
        });
      });
      const es = eqState || {};
      const todosEq = [
        ...(Array.isArray(es.comum)?es.comum:[]), ...(Array.isArray(es.m2)?es.m2:[]), ...(Array.isArray(es.m3)?es.m3:[]),
        ...(Array.isArray(es.cs_m2)?es.cs_m2:[]), ...(Array.isArray(es.cs_m3)?es.cs_m3:[]),
        ...(Array.isArray(es.enf_m2)?es.enf_m2:[]), ...(Array.isArray(es.enf_m3)?es.enf_m3:[]),
      ];
      todosEq.filter(e => e && (e.status === "MANUTENÇÃO" || e.status === "ALERTA")).forEach(e => {
        lista.push({ chave:"eq:"+e.id, janela:areaParaJanela(e.area), origem:"Equipamento",
          titulo:e.nome||"Equipamento", tag:e.tag||"",
          descricao:e.status==="MANUTENÇÃO"?"Em manutenção / fora de operação":"Em alerta",
          nota:"", prazo:e.status==="MANUTENÇÃO"?"Urgente":"Normal",
          disciplina:"", maquina:e.sub||"", area:e.area||"", data:"", operador:"", tipo:"auto" });
      });
      (Array.isArray(manuais)?manuais:[]).filter(p => p && p.status !== "resolvida").forEach(p => {
        lista.push({ chave:"man:"+p.id, id:p.id, janela:p.janela, origem:"Manual",
          titulo:p.descricao, tag:"", descricao:p.descricao, nota:p.nota||"", prazo:"",
          disciplina:"", maquina:"", area:"", data:p.data||"", operador:p.operador||"", tipo:"manual" });
      });
    } catch (err) { console.error("Erro ao montar pendências:", err); }
    return lista;
  }, [chamados, cleaners, eqState, manuais]);

  const porJanela = React.useMemo(() => {
    const g = { pu:[], cs:[], enf:[], clean:[] };
    pendencias.forEach(p => {
      if (p.multiJanela) p.multiJanela.forEach(j => g[j]?.push(p));
      else g[p.janela]?.push(p);
    });
    Object.keys(g).forEach(k => g[k].sort((a,b)=>scorePrioridade(a)-scorePrioridade(b)));
    return g;
  }, [pendencias]);

  const totalGlobal = JANELAS.reduce((acc,j)=>acc+(porJanela[j.id]?.length||0),0);

  // contagem de criticidade por área
  function critCount(janId) {
    const arr = porJanela[janId]||[];
    return {
      crit: arr.filter(p=>criticidade(p)==="Crítica").length,
      med:  arr.filter(p=>criticidade(p)==="Média").length,
      baixa:arr.filter(p=>criticidade(p)==="Baixa").length,
    };
  }
  // breakdown por origem (pra donut e tabela)
  function origensDe(janId) {
    const arr = porJanela[janId]||[];
    const m = {};
    arr.forEach(p => { m[p.origem]=(m[p.origem]||0)+1; });
    return m;
  }

  function addManual() {
    if (!descAdd.trim()) return;
    const nova = { id:Date.now(), janela:janelaAdd, descricao:descAdd.trim(), nota:notaAdd.trim(), data:hoje(), hora:horaAtual(), operador, status:"aberta" };
    const novo = [nova, ...manuais]; setManuais(novo); storageSet("pendencias_h2", novo);
    setDescAdd(""); setNotaAdd(""); setAddOpen(false);
  }
  function resolverManual(id) {
    const novo = manuais.map(p => p.id === id ? {...p, status:"resolvida", dataResol:hoje(), horaResol:horaAtual()} : p);
    setManuais(novo); storageSet("pendencias_h2", novo);
  }

  function exportarExcel() {
    setExportando(true);
    const gerar = () => {
      if (!window.XLSX) { alert("Biblioteca Excel não carregou."); setExportando(false); return; }
      const linhas = [];
      JANELAS.forEach(jan => (porJanela[jan.id]||[]).forEach((p,i) => linhas.push({
        "Área":jan.label, "Rank":i+1, "Origem":p.origem, "Pendência":p.titulo, "TAG":p.tag,
        "Criticidade":criticidade(p), "Descrição":p.descricao, "Nota SAP":p.nota, "Prazo":p.prazo,
        "Disciplina":p.disciplina, "Máquina":p.maquina, "Data":fmtData(p.data), "Operador":p.operador,
      })));
      const ws = window.XLSX.utils.json_to_sheet(linhas);
      ws["!cols"]=[{wch:16},{wch:6},{wch:12},{wch:32},{wch:18},{wch:12},{wch:40},{wch:14},{wch:12},{wch:14},{wch:8},{wch:12},{wch:16}];
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, "Oportunidades");
      window.XLSX.writeFile(wb, `Mural_Oportunidades_${hoje()}.xlsx`);
      setExportando(false);
    };
    if (!window.XLSX) {
      const s=document.createElement("script");
      s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      s.onload=gerar; s.onerror=()=>{alert("Falha ao carregar Excel.");setExportando(false);};
      document.head.appendChild(s);
    } else gerar();
  }

  // ── Card de área grande ─────────────────────────────────────────────────────
  function AreaCard({ jan, grande }) {
    const arr = porJanela[jan.id]||[];
    const qtd = arr.length;
    const cc = critCount(jan.id);
    const origens = origensDe(jan.id);
    const ativo = sel === jan.id;
    const origNomes = Object.keys(origens);
    const segs = origNomes.map(o => ({
      v:origens[o],
      cor: o==="Chamado"?"#5090FF":o==="Cleaners"?"#00E5D1":o==="Equipamento"?C.warningLight:C.accentLight
    }));

    return (
      <div onClick={()=>{ setSel(jan.id); setTabOrigem("Todas"); }}
        style={{ position:"relative", overflow:"hidden", cursor:"pointer",
          background: ativo?`linear-gradient(155deg, ${jan.cor}10, rgba(7,24,40,0.96))`:"rgba(10,25,41,0.7)",
          border:`1.5px solid ${ativo?jan.cor+"88":C.border}`, borderRadius:16, padding:16,
          boxShadow: ativo?`0 8px 28px ${jan.cor}22`:"none", transition:"all .2s",
          minHeight: grande?undefined:140 }}>
        {/* linha de luz topo */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${jan.cor}, transparent)` }}/>
        {/* header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <span style={{ color:jan.cor, fontSize:grande?17:14, fontWeight:800, letterSpacing:"0.03em" }}>{jan.label.toUpperCase()}</span>
          <span style={{ background:`${jan.impCor}1f`, border:`1px solid ${jan.impCor}55`, color:jan.impCor, borderRadius:6, padding:"2px 8px", fontSize:8, fontWeight:800, letterSpacing:"0.06em" }}>{jan.impacto}</span>
        </div>

        {grande ? (
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ flex:1 }}>
              <div style={{ color:C.textMuted, fontSize:11, marginBottom:4 }}>Total de oportunidades</div>
              <div style={{ fontSize:48, fontWeight:900, fontFamily:"monospace", lineHeight:1, color:C.text }}>{qtd}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:12 }}>
                {[["Críticas",cc.crit,"#FF5252"],["Médias",cc.med,"#FFC107"],["Baixas",cc.baixa,"#00E676"]].map(([l,v,co])=>(
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ width:8, height:8, borderRadius:"50%", background:co, boxShadow:`0 0 6px ${co}88` }}/>
                    <span style={{ color:C.text, fontSize:13, fontWeight:800 }}>{v}</span>
                    <span style={{ color:C.textMuted, fontSize:11 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <DonutGauge total={qtd} segs={segs} cor={jan.cor}/>
            {/* breakdown origens */}
            <div style={{ display:"flex", flexDirection:"column", gap:12, minWidth:80 }}>
              {origNomes.length>0 ? origNomes.map(o=>{
                const co = o==="Chamado"?"#5090FF":o==="Cleaners"?"#00E5D1":o==="Equipamento"?C.warningLight:C.accentLight;
                const pct = qtd>0?Math.round(origens[o]/qtd*100):0;
                return (
                  <div key={o}>
                    <div style={{ color:C.textMuted, fontSize:10 }}>{o}</div>
                    <div style={{ color:C.text, fontSize:22, fontWeight:900, fontFamily:"monospace", lineHeight:1 }}>{origens[o]}</div>
                    <div style={{ color:co, fontSize:11, fontWeight:700 }}>{pct}%</div>
                  </div>
                );
              }) : <div style={{ color:C.textDim, fontSize:10 }}>—</div>}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ color:C.textMuted, fontSize:11, marginBottom:4 }}>Total de oportunidades</div>
            <div style={{ fontSize:40, fontWeight:900, fontFamily:"monospace", lineHeight:1, color:qtd>0?C.text:C.textDim }}>{qtd}</div>
            <div style={{ display:"flex", gap:12, marginTop:10, flexWrap:"wrap" }}>
              {[["Críticas",cc.crit,"#FF5252"],["Médias",cc.med,"#FFC107"],["Baixas",cc.baixa,"#00E676"]].map(([l,v,co])=>(
                <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:co }}/>
                  <span style={{ color:C.text, fontSize:12, fontWeight:800 }}>{v}</span>
                  <span style={{ color:C.textMuted, fontSize:10 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:14, paddingTop:12, borderTop:`1px solid ${C.border}` }}>
          <span style={{ color:jan.cor, fontSize:12, fontWeight:700 }}>Ver oportunidades</span>
          <span style={{ color:jan.cor, fontSize:13 }}>›</span>
        </div>
      </div>
    );
  }

  // ── Ranking (ordenado por qtd) ──────────────────────────────────────────────
  const rankAreas = [...JANELAS].sort((a,b)=>(porJanela[b.id]?.length||0)-(porJanela[a.id]?.length||0));

  // ── Tabela da área selecionada ──────────────────────────────────────────────
  const janSel = JANELAS.find(j=>j.id===sel) || JANELAS[0];
  const arrSel = porJanela[sel]||[];
  const origensTab = ["Todas", ...Object.keys(origensDe(sel))];
  const arrFiltrado = tabOrigem==="Todas" ? arrSel : arrSel.filter(p=>p.origem===tabOrigem);

  return (
    <div style={{ padding:"16px 16px 80px" }}>
      <button onClick={onVoltar} style={{ background:C.tagBg, border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:9, padding:"9px 14px", cursor:"pointer", fontSize:12, fontWeight:700, marginBottom:14 }}>← Início</button>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ color:C.text, fontSize:22, fontWeight:900, margin:"0 0 4px", letterSpacing:"0.02em" }}>MURAL DE OPORTUNIDADES</h2>
          <p style={{ color:C.textMuted, fontSize:12, margin:0 }}>Visão geral das oportunidades por área da Secagem H2</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>setAddOpen(true)} style={{ padding:"9px 14px", borderRadius:9, border:`1px solid ${C.border}`, background:C.tagBg, color:C.text, fontSize:12, fontWeight:700, cursor:"pointer" }}>+ Adicionar</button>
          <button onClick={exportarExcel} disabled={exportando||totalGlobal===0} style={{ padding:"9px 14px", borderRadius:9, border:"none", background:totalGlobal===0?C.textDim:"linear-gradient(135deg,#006B2E,#00E676)", color:"#fff", fontSize:12, fontWeight:800, cursor:totalGlobal===0?"not-allowed":"pointer" }}>
            {exportando?"Gerando…":"Exportar Excel"}
          </button>
        </div>
      </div>

      {/* Card grande = área selecionada */}
      <div style={{ marginBottom:12 }}>
        <AreaCard jan={janSel} grande/>
      </div>

      {/* Cards menores = demais áreas */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
        {JANELAS.filter(j=>j.id!==sel).map(jan => <AreaCard key={jan.id} jan={jan}/>)}
      </div>

      {/* Ranking de prioridade */}
      <div style={{ marginBottom:20 }}>
        <h3 style={{ color:C.text, fontSize:16, fontWeight:800, margin:"0 0 3px" }}>🏆 Ranking de Prioridade</h3>
        <p style={{ color:C.textDim, fontSize:11, margin:"0 0 12px" }}>Ordenado por volume e criticidade</p>
        {rankAreas.map((jan, idx) => {
          const qtd = porJanela[jan.id]?.length||0;
          const podioCor = idx===0?"#FFD700":idx===1?"#C0C0C0":idx===2?"#CD7F32":C.textDim;
          return (
            <div key={jan.id} onClick={()=>{ setSel(jan.id); setTabOrigem("Todas"); }}
              className="mural-item" style={{ animationDelay:`${idx*0.05}s`, cursor:"pointer",
                background:sel===jan.id?`${jan.cor}10`:C.card, border:`1px solid ${sel===jan.id?jan.cor+"66":C.border}`,
                borderRadius:12, padding:"12px 14px", marginBottom:8, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:30, height:30, borderRadius:8, flexShrink:0, background:`${podioCor}22`, border:`1.5px solid ${podioCor}`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:13, fontFamily:"monospace", color:podioCor }}>{idx+1}</div>
              <span className={qtd>0?"mural-led":""} style={{ width:9, height:9, borderRadius:"50%", background:jan.cor, flexShrink:0, boxShadow:`0 0 8px ${jan.cor}` }}/>
              <div style={{ flex:1 }}>
                <div style={{ color:C.text, fontWeight:800, fontSize:14 }}>{jan.label}</div>
                <span style={{ background:`${jan.impCor}1f`, border:`1px solid ${jan.impCor}55`, color:jan.impCor, borderRadius:5, padding:"1px 6px", fontSize:8, fontWeight:800 }}>{jan.impacto}</span>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ color:C.text, fontSize:20, fontWeight:900, fontFamily:"monospace", lineHeight:1 }}>{qtd}</div>
                <div style={{ color:C.textDim, fontSize:9 }}>{qtd===1?"oportunidade":"oportunidades"}</div>
              </div>
              <span style={{ color:jan.cor, fontSize:16 }}>›</span>
            </div>
          );
        })}
      </div>

      {/* Tabela da área selecionada */}
      <div style={{ background:"rgba(10,25,41,0.7)", border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px 0" }}>
          <span style={{ color:janSel.cor, fontSize:15, fontWeight:800 }}>{janSel.label.toUpperCase()}</span>
          <span style={{ background:`${janSel.impCor}1f`, border:`1px solid ${janSel.impCor}55`, color:janSel.impCor, borderRadius:6, padding:"2px 8px", fontSize:8, fontWeight:800 }}>{janSel.impacto}</span>
        </div>
        {/* Abas de origem */}
        <div style={{ display:"flex", gap:4, padding:"10px 16px 0", borderBottom:`1px solid ${C.border}`, overflowX:"auto" }}>
          {origensTab.map(o => {
            const n = o==="Todas"?arrSel.length:origensDe(sel)[o]||0;
            const ativo = tabOrigem===o;
            return (
              <button key={o} onClick={()=>setTabOrigem(o)} style={{ flexShrink:0, padding:"7px 12px", border:"none", background:"transparent", cursor:"pointer", color:ativo?janSel.cor:C.textMuted, fontWeight:ativo?800:500, fontSize:12, borderBottom:ativo?`2px solid ${janSel.cor}`:"2px solid transparent" }}>
                {o} {o!=="Todas"&&`(${n})`}
              </button>
            );
          })}
        </div>
        {/* Linhas */}
        <div style={{ padding:"6px 8px 12px" }}>
          {arrFiltrado.length===0 ? (
            <div style={{ color:C.textDim, fontSize:12, textAlign:"center", padding:28, fontStyle:"italic" }}>Nada pendente 🎉</div>
          ) : arrFiltrado.map((p,i) => {
            const crit = criticidade(p);
            return (
              <div key={p.chave} className="mural-item" style={{ animationDelay:`${i*0.04}s`, display:"flex", alignItems:"center", gap:10, padding:"10px 10px", borderBottom:i<arrFiltrado.length-1?`1px solid ${C.border}`:"none" }}>
                <span style={{ width:22, color:C.textDim, fontSize:12, fontWeight:700, fontFamily:"monospace", flexShrink:0 }}>{i+1}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:C.text, fontSize:13, fontWeight:600, lineHeight:1.3 }}>{p.titulo}</div>
                  {p.tag && <code style={{ color:C.textDim, fontSize:9 }}>{p.tag}</code>}
                </div>
                <span style={{ color:C.textMuted, fontSize:11, flexShrink:0, width:64 }}>{p.origem}</span>
                <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0, width:72 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:CRIT_COR[crit] }}/>
                  <span style={{ color:CRIT_COR[crit], fontSize:11, fontWeight:700 }}>{crit}</span>
                </div>
                {p.tipo==="manual" && (
                  <button onClick={()=>resolverManual(p.id)} style={{ flexShrink:0, background:"rgba(0,230,118,0.12)", border:`1px solid ${C.accentLight}44`, color:C.accentLight, borderRadius:6, padding:"4px 8px", fontSize:10, fontWeight:700, cursor:"pointer" }}>✓</button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal adicionar */}
      {addOpen && (
        <div onClick={()=>setAddOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20, maxWidth:380, width:"100%" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <span style={{ color:C.text, fontWeight:800, fontSize:15 }}>Nova Pendência</span>
              <button onClick={()=>setAddOpen(false)} style={{ background:"none", border:"none", color:C.textMuted, fontSize:20, cursor:"pointer" }}>×</button>
            </div>
            <label style={{ color:C.textMuted, fontSize:10, textTransform:"uppercase", display:"block", marginBottom:6 }}>Área</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
              {JANELAS.map(j => (
                <button key={j.id} onClick={()=>setJanelaAdd(j.id)} style={{ padding:"9px 8px", borderRadius:9, cursor:"pointer", fontSize:11, fontWeight:700, textAlign:"left",
                  background: janelaAdd===j.id?`${j.cor}1f`:C.tagBg, border:`1.5px solid ${janelaAdd===j.id?j.cor:C.border}`, color:janelaAdd===j.id?j.cor:C.textMuted, display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:j.cor, flexShrink:0 }}/>{j.label}
                </button>
              ))}
            </div>
            <label style={{ color:C.textMuted, fontSize:10, textTransform:"uppercase", display:"block", marginBottom:6 }}>Descrição</label>
            <textarea value={descAdd} onChange={e=>setDescAdd(e.target.value)} rows={3} placeholder="O que precisa ser feito..." style={{ ...inputStyle, resize:"vertical", fontFamily:"inherit", marginBottom:12 }}/>
            <label style={{ color:C.textMuted, fontSize:10, textTransform:"uppercase", display:"block", marginBottom:6 }}>Nota SAP (opcional)</label>
            <input value={notaAdd} onChange={e=>setNotaAdd(e.target.value)} placeholder="Nº nota SAP..." style={{ ...inputStyle, fontFamily:"monospace", marginBottom:16 }}/>
            <button onClick={addManual} disabled={!descAdd.trim()} style={{ width:"100%", padding:12, borderRadius:10, border:"none", background:descAdd.trim()?C.accent:C.textDim, color:"#fff", fontSize:13, fontWeight:800, cursor:descAdd.trim()?"pointer":"not-allowed" }}>Adicionar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
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
