// ─── pendencias.jsx — Mural de Oportunidades · Secagem H2 · Indústria 5.0 ─────
// Cards de área com split M2/M3, donut, criticidade, tempo estimado, próxima
// parada agendável, ranking, tabela com abas. Mobile-first (empilha).
// Auto (leitura): chamados, válvula c/ passagem, equip. fora.
// Manual (editável): pendencias_h2 · Paradas: paradas_h2 · Excel via SheetJS CDN.
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
const fmtMin    = (m) => { if(!m||m<=0) return "—"; const h=Math.floor(m/60), mm=m%60; return h>0?`${h}h${mm>0?String(mm).padStart(2,"0"):"00"}min`:`${mm}min`; };
function proximaParadaLabel(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso); const ag = new Date();
    const mesmoDia = d.toDateString()===ag.toDateString();
    const amanha = new Date(ag); amanha.setDate(ag.getDate()+1);
    const ehAmanha = d.toDateString()===amanha.toDateString();
    const hh = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
    if (mesmoDia) return `Hoje · ${hh}`;
    if (ehAmanha) return `Amanhã · ${hh}`;
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")} · ${hh}`;
  } catch { return null; }
}

const JANELAS = [
  { id:"pu",   label:"Parte Úmida",        sigla:"PU",       cor:"#00FF94", impacto:"IMPACTO DIRETO", impCor:"#FF3B6B", desc:"Parada de máquina" },
  { id:"clean",label:"Cleaners",           sigla:"Cleaners", cor:"#00F0FF", impacto:"IMPACTO DIRETO", impCor:"#FF3B6B", desc:"Isolamento / válvula" },
  { id:"cs",   label:"Secador/Cortadeira", sigla:"Sec/Cort", cor:"#3B9BFF", impacto:"PROGRAMÁVEL",    impCor:"#3B9BFF", desc:"PP — faquinhas, facão, secador" },
  { id:"enf",  label:"Enfardamento",       sigla:"Enf",      cor:"#C77DFF", impacto:"PROGRAMÁVEL",    impCor:"#C77DFF", desc:"PP de linha L4–L8" },
];
const MAQUINAS = ["M2","M3"];
const PESO_PRAZO = { "Imediato":0, "Urgente":1, "Normal":2, "Programável":3, "":4 };

function criticidade(p) {
  // Válvula com passagem = crítica máxima (multi-janela)
  if (p.origem==="Cleaners" && p.multiJanela) return "Crítica";
  if (p.prazo==="Imediato" || p.descricao?.includes("manutenção")) return "Crítica";
  if (p.prazo==="Urgente") return "Crítica";
  if (p.prazo==="Normal" || p.prazo==="") return "Média";
  return "Baixa";
}
const CRIT_COR = { "Crítica":"#FF5252", "Média":"#FFC107", "Baixa":"#00E676" };

function areaParaJanela(area) {
  const a = (area||"").toLowerCase();
  if (a === "cortadeira" || a === "cs" || a === "secador") return "cs";
  if (a === "enfardamento" || a === "enf") return "enf";
  if (a === "cleaners") return "clean";
  return "pu";
}
function scorePrioridade(p) {
  let s = (PESO_PRAZO[p.prazo] ?? 4) * 100;
  if (p.origem === "Cleaners" && p.multiJanela) s -= 80;  // válvula c/ passagem = dor máxima
  if (p.descricao?.includes("manutenção")) s -= 20;
  return s;
}

const STYLES = `
@keyframes mural-led { 0%,100%{opacity:1;filter:brightness(1.3);} 50%{opacity:.55;filter:brightness(1);} }
@keyframes mural-stagger { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:none;} }
@keyframes mural-breathe { 0%,100%{box-shadow:0 0 18px var(--gc),inset 0 0 14px rgba(255,255,255,0.03);} 50%{box-shadow:0 0 34px var(--gc),inset 0 0 22px rgba(255,255,255,0.05);} }
.mural-led { animation: mural-led 1.6s ease-in-out infinite; }
.mural-item { animation: mural-stagger .3s ease backwards; }
.mural-breathe { animation: mural-breathe 2.8s ease-in-out infinite; }
`;
// glow helper para números neon
const neon = (cor) => ({ textShadow:`0 0 8px ${cor}99, 0 0 18px ${cor}55` });

// ── Donut gauge ────────────────────────────────────────────────────────────────
function DonutGauge({ total, segs, cor, size=104 }) {
  const R=size*0.38, SW=size*0.085, circ=2*Math.PI*R;
  let acc=0;
  const partes = segs.filter(s=>s.v>0);
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={SW}/>
        {partes.map((s,i) => {
          const frac = total>0 ? s.v/total : 0;
          const len = frac*circ, off=-acc*circ; acc+=frac;
          return <circle key={i} cx={size/2} cy={size/2} r={R} fill="none" stroke={s.cor} strokeWidth={SW}
            strokeDasharray={`${len} ${circ-len}`} strokeDashoffset={off} strokeLinecap="round"
            style={{ filter:`drop-shadow(0 0 4px ${s.cor}88)` }}/>;
        })}
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:size*0.28, fontWeight:900, fontFamily:"monospace", lineHeight:1, color:cor, textShadow:`0 0 14px ${cor}aa, 0 0 28px ${cor}55` }}>{total}</span>
        <span style={{ color:C.textDim, fontSize:7, letterSpacing:"0.18em", marginTop:1 }}>TOTAL</span>
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
  const [historico, setHistorico] = React.useState(() => storageGet("historico_h2") || []);
  const [paradas, setParadas]   = React.useState(() => storageGet("paradas_h2") || {});
  const [sel, setSel]           = React.useState("pu");
  const [modoGeral, setModoGeral] = React.useState(false);
  const [selMaq, setSelMaq]     = React.useState(null);
  const [tela, setTela]         = React.useState("geral");  // "geral" | "area"
  const [prioridades, setPrioridades] = React.useState(() => storageGet("prioridades_h2") || {});
  const [editPrio, setEditPrio] = React.useState(null);  // chave da pendência sendo editada
  const [tabOrigem, setTabOrigem] = React.useState("Todas");
  const [addOpen, setAddOpen]   = React.useState(false);
  const [agOpen, setAgOpen]     = React.useState(null);   // {janId} ao agendar
  const [exportando, setExportando] = React.useState(false);
  // form add
  const [janelaAdd, setJanelaAdd] = React.useState("pu");
  const [maqAdd, setMaqAdd]       = React.useState("M2");
  const [descAdd, setDescAdd]     = React.useState("");
  const [notaAdd, setNotaAdd]     = React.useState("");
  const [tempoAdd, setTempoAdd]   = React.useState("");
  // form agendar
  const [agMaq, setAgMaq]   = React.useState("M2");
  const [agData, setAgData] = React.useState(hoje());
  const [agHora, setAgHora] = React.useState("08:00");

  React.useEffect(() => {
    if (!document.getElementById("mural-styles")) {
      const s=document.createElement("style"); s.id="mural-styles"; s.textContent=STYLES; document.head.appendChild(s);
    }
    cloudGet("pendencias_h2").then(d => { if (Array.isArray(d)) setManuais(d); });
    cloudGet("chamados_h2").then(d => { if (Array.isArray(d)) setChamados(d); });
    cloudGet("cleaners_h2").then(d => { if (d) setCleaners(d); });
    cloudGet("historico_h2").then(d => { if (Array.isArray(d)) setHistorico(d); });
    cloudGet("paradas_h2").then(d => { if (d && typeof d==="object") setParadas(d); });
    cloudGet("prioridades_h2").then(d => { if (d && typeof d==="object") setPrioridades(d); });
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
          data:c.dataAbertura||"", operador:c.operador||"", tempo:c.tempoEstimado||0, tipo:"auto" });
      });
      ["M2","M3"].forEach(mq => {
        const garrafas = (cleaners && cleaners[mq]) || {};
        Object.entries(garrafas).forEach(([key, g]) => {
          // toda garrafa presente em cleaners_h2 está FORA de operação
          const ms = g?.motivos || (g?.motivo ? [g.motivo] : []);
          const temPassagem = (Array.isArray(ms) && ms.includes("Válvula com passagem")) || g?.motivo==="Válvula com passagem";
          // label do cleaner: chave c1_3 → "Cleaners 1 · G3"
          const cfgMap = { c1:"Cleaners 1", c2:"Cleaners 2", c3:"Cleaners 3", c4:"Cleaners 4" };
          const cId = key.split("_")[0];
          const gNum = key.split("_")[1];
          const cleanerLabel = cfgMap[cId] || cId;
          const motivoTxt = ms.length>0 ? ms.join(", ") : (g?.motivo || g?.status || "Fora de operação");
          if (temPassagem) {
            lista.push({ chave:`pass:${mq}:${key}`, janela:"clean", origem:"Cleaners",
              titulo:`${cleanerLabel} · G${gNum} — Válvula c/ passagem`, tag:mq,
              descricao:"Válvula com passagem — só resolve com cleaners isolado ou máquina parada",
              nota:"", prazo:"Urgente", disciplina:"Mecânica", maquina:mq, area:"Cleaners",
              data:g?.data||"", operador:g?.operador||"", tempo:0, tipo:"auto", multiJanela:["clean","pu"] });
          } else {
            lista.push({ chave:`cln:${mq}:${key}`, janela:"clean", origem:"Cleaners",
              titulo:`${cleanerLabel} · G${gNum} — ${motivoTxt}`, tag:mq,
              descricao:`Garrafa fora de operação (${motivoTxt}) — recolocar no isolamento dos cleaners`,
              nota:"", prazo:"Normal", disciplina:"Mecânica", maquina:mq, area:"Cleaners",
              data:g?.data||"", operador:g?.operador||"", tempo:0, tipo:"auto" });
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
          disciplina:"", maquina:e.sub||"", area:e.area||"", data:"", operador:"", tempo:0, tipo:"auto" });
      });
      (Array.isArray(manuais)?manuais:[]).filter(p => p && p.status !== "resolvida").forEach(p => {
        lista.push({ chave:"man:"+p.id, id:p.id, janela:p.janela, origem:"Manual",
          titulo:p.descricao, tag:"", descricao:p.descricao, nota:p.nota||"", prazo:"",
          disciplina:"", maquina:p.maquina||"", area:"", data:p.data||"", operador:p.operador||"", tempo:p.tempo||0, tipo:"manual" });
      });

      // 5. Faquinhas com pressão ≥ 3 bar (último checklist de cortadeira por máquina)
      ["M2","M3"].forEach(mq => {
        const itemId = mq==="M2" ? "cs2_31" : "cs3_31";
        const ultimo = (Array.isArray(historico)?historico:[])
          .filter(h => h && h.tipoId==="cortadeira" && h.maquina===mq)
          .sort((a,b)=>(b.id||0)-(a.id||0))[0];
        if (!ultimo) return;
        // valores das 11 faquinhas: chave itemId + "_" + índice
        for (let fi=0; fi<11; fi++) {
          const raw = ultimo.valores?.[`${itemId}_${fi}`];
          const num = parseFloat(String(raw||"").replace(",","."));
          if (!isNaN(num) && num >= 3) {
            lista.push({ chave:`faq:${mq}:${fi}`, janela:"cs", origem:"Faquinha",
              titulo:`Faquinha ${fi+1} — ${String(raw).replace(".",",")} bar`, tag:mq,
              descricao:`Pressão ${String(raw).replace(".",",")} bar (ref 1,5) — trocar em PP da cortadeira`,
              nota:"", prazo:num>=3.5?"Urgente":"Normal", disciplina:"Mecânica", maquina:mq, area:"Cortadeira",
              data:ultimo.data||"", operador:ultimo.opPU||"", tempo:0, tipo:"auto" });
          }
        }
        // 6. Facão por fardo: Médio ou Alto → pendência (ambos Críticos)
        const facaoId = mq==="M2" ? "cs2_34" : "cs3_34";
        for (let fi=0; fi<12; fi++) {
          const nivel = ultimo.valores?.[`${facaoId}_${fi}`];
          if (nivel==="medio" || nivel==="alto") {
            const lbl = nivel==="alto" ? "Alto" : "Médio";
            lista.push({ chave:`facao:${mq}:${fi}`, janela:"cs", origem:"Facão",
              titulo:`Fardo ${fi+1} — corte ${lbl}`, tag:mq,
              descricao:`Falha de corte do facão nível ${lbl} — ajustar/trocar em PP da cortadeira`,
              nota:"", prazo:"Urgente", disciplina:"Mecânica", maquina:mq, area:"Cortadeira",
              data:ultimo.data||"", operador:ultimo.opPU||"", tempo:0, tipo:"auto" });
          }
        }
      });
    } catch (err) { console.error("Erro ao montar pendências:", err); }
    return lista;
  }, [chamados, cleaners, eqState, manuais, historico]);

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
  // total por máquina somando todas as áreas (para seletor M2/M3/Geral)
  const totalMaqGlobal = (mq) => JANELAS.reduce((acc,j)=>acc+(porJanela[j.id]||[]).filter(p=>mq==="Geral"?true:(p.maquina===mq||(!p.maquina&&mq==="M2"))).length, 0);
  // qtd de uma área respeitando a máquina fixada
  const qtdAreaMaq = (janId) => (porJanela[janId]||[]).filter(p=>!selMaq?true:(p.maquina===selMaq||(!p.maquina&&selMaq==="M2"))).length;

  // helpers por máquina
  // todas as pendências (todas as áreas) sem duplicar multi-janela
  const todasPendencias = React.useMemo(() => {
    const vistas = new Set(); const out = [];
    JANELAS.forEach(j => (porJanela[j.id]||[]).forEach(p => { if(!vistas.has(p.chave)){ vistas.add(p.chave); out.push(p); } }));
    return out;
  }, [porJanela]);
  // itens de uma máquina: se modoGeral, soma todas as áreas; senão só a área janId
  const itensMaq = (janId, mq) => {
    const base = modoGeral ? todasPendencias : (porJanela[janId]||[]);
    return base.filter(p => p.maquina===mq || (!p.maquina && mq==="M2"));
  };
  const tempoMaq = (janId, mq) => itensMaq(janId,mq).reduce((a,p)=>a+(p.tempo||0),0);
  // criticidade final: prioridade manual sobrescreve a automática
  const critFinal = (p) => prioridades[p.chave] || criticidade(p);
  function salvarPrioridade(chave, nivel) {
    const novo = { ...prioridades };
    if (nivel) novo[chave] = nivel; else delete novo[chave];
    setPrioridades(novo); storageSet("prioridades_h2", novo);
    setEditPrio(null);
  }
  function critCount(arr) {
    return { crit:arr.filter(p=>critFinal(p)==="Crítica").length, med:arr.filter(p=>critFinal(p)==="Média").length, baixa:arr.filter(p=>critFinal(p)==="Baixa").length };
  }
  function origensDe(arr) { const m={}; arr.forEach(p=>{m[p.origem]=(m[p.origem]||0)+1;}); return m; }
  const corOrig = (o) => o==="Chamado"?"#5090FF":o==="Cleaners"?"#00E5D1":o==="Equipamento"?C.warningLight:o==="Faquinha"?"#FF8C00":o==="Facão"?"#E0457B":C.accentLight;

  function addManual() {
    if (!descAdd.trim()) return;
    const nova = { id:Date.now(), janela:janelaAdd, maquina:maqAdd, descricao:descAdd.trim(), nota:notaAdd.trim(), tempo:parseInt(tempoAdd)||0, data:hoje(), hora:horaAtual(), operador, status:"aberta" };
    const novo = [nova, ...manuais]; setManuais(novo); storageSet("pendencias_h2", novo);
    setDescAdd(""); setNotaAdd(""); setTempoAdd(""); setAddOpen(false);
  }
  function resolverManual(id) {
    const novo = manuais.map(p => p.id === id ? {...p, status:"resolvida", dataResol:hoje(), horaResol:horaAtual()} : p);
    setManuais(novo); storageSet("pendencias_h2", novo);
  }
  function salvarParada() {
    const iso = `${agData}T${agHora}:00`;
    const chave = `${agOpen.janId}:${agMaq}`;
    const novo = { ...paradas, [chave]: iso };
    setParadas(novo); storageSet("paradas_h2", novo);
    setAgOpen(null);
  }

  function exportarExcel() {
    setExportando(true);
    const gerar = () => {
      if (!window.XLSX) { alert("Biblioteca Excel não carregou."); setExportando(false); return; }
      const linhas = [];
      JANELAS.forEach(jan => (porJanela[jan.id]||[]).forEach((p,i) => linhas.push({
        "Área":jan.label, "Máquina":p.maquina||"—", "Rank":i+1, "Origem":p.origem, "Pendência":p.titulo, "TAG":p.tag,
        "Criticidade":criticidade(p), "Tempo (min)":p.tempo||"", "Descrição":p.descricao, "Nota SAP":p.nota,
        "Prazo":p.prazo, "Disciplina":p.disciplina, "Data":fmtData(p.data), "Operador":p.operador,
      })));
      const ws = window.XLSX.utils.json_to_sheet(linhas);
      ws["!cols"]=[{wch:16},{wch:8},{wch:6},{wch:12},{wch:32},{wch:18},{wch:12},{wch:11},{wch:40},{wch:14},{wch:12},{wch:14},{wch:12},{wch:16}];
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

  // ── Bloco de máquina dentro do card ─────────────────────────────────────────
  function MaqBlock({ jan, mq, grande }) {
    const arr = itensMaq(jan.id, mq);
    const qtd = arr.length;
    const cc = critCount(arr);
    const origens = origensDe(arr);
    const segs = Object.keys(origens).map(o=>({ v:origens[o], cor:corOrig(o) }));
    const tempo = tempoMaq(jan.id, mq);
    const parada = proximaParadaLabel(paradas[`${jan.id}:${mq}`]);
    const evidencia = selMaq === mq;

    return (
      <div onClick={(e)=>{ e.stopPropagation(); setSelMaq(evidencia?null:mq); setTabOrigem("Todas"); }}
        style={{ flex:1, minWidth:0, cursor:"pointer", transition:"all .18s",
          background: evidencia?`${jan.cor}14`:"rgba(4,17,29,0.5)",
          border:`1.5px solid ${evidencia?jan.cor:C.border}`, borderRadius:11, padding:"11px 12px",
          boxShadow: evidencia?`0 0 20px ${jan.cor}55, 0 4px 16px ${jan.cor}33`:"none", transform: evidencia?"translateY(-2px)":"none" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={{ color:evidencia?jan.cor:C.text, fontSize:12, fontWeight:800, fontFamily:"monospace", letterSpacing:"0.05em" }}>{mq}{evidencia?" ●":""}</span>
          <span className={qtd>0?"mural-led":""} style={{ width:8, height:8, borderRadius:"50%", background:qtd>0?jan.cor:C.textDim, boxShadow:qtd>0?`0 0 6px ${jan.cor}`:"none" }}/>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {grande && qtd>0 ? <DonutGauge total={qtd} segs={segs} cor={jan.cor} size={72}/> : (
            <span style={{ fontSize:grande?34:28, fontWeight:900, fontFamily:"monospace", lineHeight:1, color:qtd>0?C.text:C.textDim, ...(qtd>0?neon(jan.cor):{}) }}>{qtd}</span>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            {[["Crít",cc.crit,"#FF5252"],["Méd",cc.med,"#FFC107"],["Bax",cc.baixa,"#00E676"]].map(([l,v,co])=>(
              <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:co, boxShadow:`0 0 6px ${co}` }}/>
                <span style={{ color:C.text, fontSize:11, fontWeight:700 }}>{v}</span>
                <span style={{ color:C.textDim, fontSize:9 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        {/* tempo + parada */}
        <div style={{ marginTop:9, paddingTop:8, borderTop:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:4 }}>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:C.textDim, fontSize:9 }}>Janela</span>
            <span style={{ color:tempo>0?C.text:C.textDim, fontSize:10, fontWeight:700, fontFamily:"monospace" }}>{fmtMin(tempo)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ color:C.textDim, fontSize:9 }}>Parada</span>
            {parada
              ? <span style={{ color:jan.cor, fontSize:10, fontWeight:700 }}>{parada}</span>
              : <span style={{ color:C.textDim, fontSize:9, fontStyle:"italic" }}>—</span>}
          </div>
        </div>
      </div>
    );
  }

  // ── Card de área ────────────────────────────────────────────────────────────
  function AreaCard({ jan, grande }) {
    const qtd = modoGeral ? todasPendencias.length : (porJanela[jan.id]||[]).length;
    const titulo = modoGeral ? "GERAL — TODAS AS ÁREAS" : jan.label.toUpperCase();
    const subt = modoGeral ? "Todas as pendências por máquina" : jan.desc;
    const cor = modoGeral ? "#FFFFFF" : jan.cor;
    return (
      <div style={{ position:"relative", overflow:"hidden",
          background:`linear-gradient(155deg, ${cor}10, rgba(7,24,40,0.96))`,
          border:`1.5px solid ${cor}88`, borderRadius:16, padding:15,
          boxShadow:`0 8px 28px ${cor}22` }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${cor}, transparent)` }}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <div>
            <span style={{ color:cor, fontSize:grande?16:14, fontWeight:800 }}>{titulo}</span>
            <span style={{ color:C.textDim, fontSize:10, display:"block", marginTop:1 }}>{qtd} total · {subt}</span>
          </div>
          {!modoGeral && <span style={{ background:`${jan.impCor}1f`, border:`1px solid ${jan.impCor}55`, color:jan.impCor, borderRadius:6, padding:"2px 8px", fontSize:8, fontWeight:800 }}>{jan.impacto}</span>}
        </div>
        {/* M2 + M3 lado a lado (clicáveis para filtrar tabela) */}
        <div style={{ display:"flex", gap:9 }}>
          {MAQUINAS.map(mq => <MaqBlock key={mq} jan={jan} mq={mq} grande={grande}/>)}
        </div>
        {/* ações */}
        <div style={{ display:"flex", gap:8, marginTop:12, paddingTop:11, borderTop:`1px solid ${C.border}` }}>
          {!modoGeral && <button onClick={()=>{ setAgOpen({janId:jan.id}); setAgMaq("M2"); }} style={{ flex:1, background:C.tagBg, border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:8, padding:"7px", fontSize:11, fontWeight:700, cursor:"pointer" }}>📅 Agendar parada</button>}
          {selMaq
            ? <button onClick={()=>setSelMaq(null)} style={{ flex:1, background:`${cor}14`, border:`1px solid ${cor}44`, color:cor, borderRadius:8, padding:"7px", fontSize:11, fontWeight:700, cursor:"pointer" }}>Mostrar M2 + M3</button>
            : <div style={{ flex:1, textAlign:"center", color:C.textDim, fontSize:10, alignSelf:"center" }}>Toque numa máquina para filtrar</div>}
        </div>
      </div>
    );
  }

  const janSel = JANELAS.find(j=>j.id===sel) || JANELAS[0];
  const tituloSel = modoGeral ? "GERAL" : janSel.label;
  const corSel = modoGeral ? "#FFFFFF" : janSel.cor;
  const arrSelTodas = modoGeral ? todasPendencias : (porJanela[sel]||[]);
  const PESO_CRIT = { "Crítica":0, "Média":1, "Baixa":2 };
  const arrSelBase = selMaq ? arrSelTodas.filter(p => p.maquina===selMaq || (!p.maquina && selMaq==="M2")) : arrSelTodas;
  const arrSel = [...arrSelBase].sort((a,b)=>(PESO_CRIT[critFinal(a)]-PESO_CRIT[critFinal(b)]) || (scorePrioridade(a)-scorePrioridade(b)));
  const origensTab = ["Todas", ...Object.keys(origensDe(arrSel))];
  const arrFiltrado = tabOrigem==="Todas" ? arrSel : arrSel.filter(p=>p.origem===tabOrigem);

  return (
    <div style={{ padding:"16px 16px 80px" }}>
      <button onClick={onVoltar} style={{ background:C.tagBg, border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:9, padding:"9px 14px", cursor:"pointer", fontSize:12, fontWeight:700, marginBottom:14 }}>← Início</button>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ color:C.text, fontSize:21, fontWeight:900, margin:"0 0 4px", letterSpacing:"0.02em" }}>MURAL DE OPORTUNIDADES</h2>
          <p style={{ color:C.textMuted, fontSize:12, margin:0 }}>Selecione a área · M2 e M3 lado a lado</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>setAddOpen(true)} style={{ padding:"9px 14px", borderRadius:9, border:`1px solid ${C.border}`, background:C.tagBg, color:C.text, fontSize:12, fontWeight:700, cursor:"pointer" }}>+ Adicionar</button>
          <button onClick={exportarExcel} disabled={exportando||totalGlobal===0} style={{ padding:"9px 14px", borderRadius:9, border:"none", background:totalGlobal===0?C.textDim:"linear-gradient(135deg,#006B2E,#00E676)", color:"#fff", fontSize:12, fontWeight:800, cursor:totalGlobal===0?"not-allowed":"pointer" }}>
            {exportando?"Gerando…":"Exportar Excel"}
          </button>
        </div>
      </div>

      {tela==="geral" ? (
        <>
          {/* ════ TELA GERAL ════ */}
          {/* Cards de máquina M2/M3 no topo (somam todas as áreas, ou filtra ao escolher) */}
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            {MAQUINAS.map(mq => {
              const arr = todasPendencias.filter(p => p.maquina===mq || (!p.maquina && mq==="M2"));
              const cc = critCount(arr);
              const ativo = selMaq===mq;
              const corM = mq==="M2" ? "#00F0FF" : "#C77DFF";
              return (
                <button key={mq} onClick={()=>setSelMaq(ativo?null:mq)}
                  className={ativo?"mural-breathe":""} style={{ "--gc":`${corM}44`, flex:1, cursor:"pointer", textAlign:"left",
                    background: ativo?`${corM}1a`:"rgba(10,25,41,0.7)", border:`1.5px solid ${ativo?corM:C.border}`,
                    borderRadius:14, padding:"13px 14px", transition:"all .18s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <span style={{ color:ativo?corM:C.text, fontSize:15, fontWeight:900, fontFamily:"monospace", ...(ativo?neon(corM):{}) }}>{mq}{ativo?" ●":""}</span>
                    <span style={{ fontSize:26, fontWeight:900, fontFamily:"monospace", lineHeight:1, color:arr.length>0?(ativo?corM:C.text):C.textDim, ...(arr.length>0?neon(corM):{}) }}>{arr.length}</span>
                  </div>
                  <div style={{ display:"flex", gap:10 }}>
                    {[["Alta",cc.crit,"#FF5252"],["Méd",cc.med,"#FFC107"],["Bax",cc.baixa,"#00E676"]].map(([l,v,co])=>(
                      <div key={l} style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:co, boxShadow:`0 0 6px ${co}` }}/>
                        <span style={{ color:C.text, fontSize:11, fontWeight:700 }}>{v}</span>
                        <span style={{ color:C.textDim, fontSize:9 }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mini-cards de área (com divisão Alta/Méd/Baixa, respeitam máquina selecionada) */}
          <div style={{ color:C.textDim, fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>
            Áreas {selMaq?`· ${selMaq}`:"· M2 + M3"} — toque para abrir
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:8 }}>
            {JANELAS.map(jan => {
              const arr = (porJanela[jan.id]||[]).filter(p=>!selMaq?true:(p.maquina===selMaq||(!p.maquina&&selMaq==="M2")));
              const cc = critCount(arr);
              return (
                <button key={jan.id} onClick={()=>{ setSel(jan.id); setModoGeral(false); setTabOrigem("Todas"); setTela("area"); }}
                  style={{ position:"relative", overflow:"hidden", cursor:"pointer", textAlign:"left",
                    background:`linear-gradient(150deg, ${jan.cor}0e, rgba(10,25,41,0.8))`,
                    border:`1.5px solid ${arr.length>0?jan.cor+"77":C.border}`, borderRadius:14, padding:"13px 14px",
                    boxShadow:arr.length>0?`0 0 16px ${jan.cor}22`:"none", transition:"all .18s" }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${jan.cor}, transparent)` }}/>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <span style={{ color:jan.cor, fontSize:13, fontWeight:800, lineHeight:1.1 }}>{jan.label}</span>
                    <span style={{ fontSize:28, fontWeight:900, fontFamily:"monospace", lineHeight:1, color:arr.length>0?jan.cor:C.textDim, ...(arr.length>0?neon(jan.cor):{}) }}>{arr.length}</span>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    {[["Alta",cc.crit,"#FF5252"],["Méd",cc.med,"#FFC107"],["Bax",cc.baixa,"#00E676"]].map(([l,v,co])=>(
                      <div key={l} style={{ flex:1, background:"rgba(4,17,29,0.5)", borderRadius:7, padding:"5px 4px", textAlign:"center" }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:3 }}>
                          <span style={{ width:6, height:6, borderRadius:"50%", background:co, boxShadow:v>0?`0 0 6px ${co}`:"none" }}/>
                          <span style={{ color:v>0?C.text:C.textDim, fontSize:13, fontWeight:800 }}>{v}</span>
                        </div>
                        <div style={{ color:C.textDim, fontSize:8, marginTop:1 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:4, marginTop:9 }}>
                    <span style={{ color:jan.cor, fontSize:10, fontWeight:700 }}>Abrir</span>
                    <span style={{ color:jan.cor, fontSize:12 }}>›</span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* ════ TELA DA ÁREA ════ */}
          <button onClick={()=>setTela("geral")} style={{ background:C.tagBg, border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:9, padding:"8px 14px", cursor:"pointer", fontSize:12, fontWeight:700, marginBottom:14, display:"flex", alignItems:"center", gap:6 }}>← Voltar às áreas</button>

          {/* Cabeçalho futurista da área */}
          {(() => {
            const arr = porJanela[sel]||[];
            const cc = critCount(arr);
            const principais = [...arr].sort((a,b)=>scorePrioridade(a)-scorePrioridade(b)).slice(0,3);
            const paradaM2 = proximaParadaLabel(paradas[`${sel}:M2`]);
            const paradaM3 = proximaParadaLabel(paradas[`${sel}:M3`]);
            return (
              <div className="mural-breathe" style={{ "--gc":`${janSel.cor}33`, position:"relative", overflow:"hidden", borderRadius:18, padding:18, marginBottom:16,
                background:`linear-gradient(155deg, ${janSel.cor}12, rgba(7,24,40,0.97))`, border:`1.5px solid ${janSel.cor}77` }}>
                <div style={{ position:"absolute", inset:0, pointerEvents:"none", opacity:0.4, backgroundImage:`radial-gradient(${janSel.cor}18 1px, transparent 1px)`, backgroundSize:"18px 18px" }}/>
                <div style={{ position:"relative" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                    <div>
                      <div style={{ color:janSel.cor, fontSize:20, fontWeight:900, letterSpacing:"0.02em", ...neon(janSel.cor) }}>{janSel.label.toUpperCase()}</div>
                      <div style={{ color:C.textMuted, fontSize:11, marginTop:2 }}>{arr.length} oportunidades · {janSel.desc}</div>
                    </div>
                    <span style={{ background:`${janSel.impCor}1f`, border:`1px solid ${janSel.impCor}66`, color:janSel.impCor, borderRadius:7, padding:"3px 9px", fontSize:9, fontWeight:800 }}>{janSel.impacto}</span>
                  </div>
                  {/* criticidade resumo */}
                  <div style={{ display:"flex", gap:10, marginBottom:14 }}>
                    {[["Alta",cc.crit,"#FF5252"],["Média",cc.med,"#FFC107"],["Baixa",cc.baixa,"#00E676"]].map(([l,v,co])=>(
                      <div key={l} style={{ flex:1, background:"rgba(4,17,29,0.45)", border:`1px solid ${co}33`, borderRadius:10, padding:"9px", textAlign:"center" }}>
                        <div style={{ fontSize:22, fontWeight:900, fontFamily:"monospace", color:v>0?co:C.textDim, ...(v>0?neon(co):{}) }}>{v}</div>
                        <div style={{ color:C.textMuted, fontSize:9, marginTop:2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  {/* data prevista de parada */}
                  <div style={{ display:"flex", gap:10, marginBottom:14 }}>
                    {[["M2",paradaM2],["M3",paradaM3]].map(([mq,pl])=>(
                      <div key={mq} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(4,17,29,0.45)", borderRadius:9, padding:"8px 11px" }}>
                        <span style={{ color:C.textDim, fontSize:10, fontWeight:700, fontFamily:"monospace" }}>{mq} parada</span>
                        {pl ? <span style={{ color:janSel.cor, fontSize:11, fontWeight:700 }}>{pl}</span> : <span style={{ color:C.textDim, fontSize:10, fontStyle:"italic" }}>—</span>}
                      </div>
                    ))}
                    <button onClick={()=>{ setAgOpen({janId:sel}); setAgMaq("M2"); }} style={{ background:C.tagBg, border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:9, padding:"8px 11px", fontSize:11, fontWeight:700, cursor:"pointer" }}>📅</button>
                  </div>
                  {/* principais equipamentos em falha */}
                  {principais.length>0 && (
                    <div>
                      <div style={{ color:C.textDim, fontSize:9, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Principais em falha</div>
                      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                        {principais.map(p=>{
                          const cf = critFinal(p);
                          return (
                            <div key={p.chave} style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <span style={{ width:7, height:7, borderRadius:"50%", background:CRIT_COR[cf], boxShadow:`0 0 6px ${CRIT_COR[cf]}`, flexShrink:0 }}/>
                              <span style={{ color:C.text, fontSize:12, fontWeight:600, flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.titulo}</span>
                              {p.maquina && <span style={{ color:C.textDim, fontSize:9, fontFamily:"monospace", fontWeight:700 }}>{p.maquina}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Lista de prioridades com alterar prioridade */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <h3 style={{ color:C.text, fontSize:14, fontWeight:800, margin:0 }}>Lista de Prioridades</h3>
            <div style={{ display:"flex", gap:4 }}>
              {[["Todas",null],["M2","M2"],["M3","M3"]].map(([l,v])=>(
                <button key={l} onClick={()=>setSelMaq(v)} style={{ padding:"4px 10px", borderRadius:7, border:`1px solid ${selMaq===v?janSel.cor:C.border}`, background:selMaq===v?`${janSel.cor}1a`:"transparent", color:selMaq===v?janSel.cor:C.textMuted, fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"monospace" }}>{l}</button>
              ))}
            </div>
          </div>
          {arrSel.length===0 ? (
            <div style={{ color:C.textDim, fontSize:12, textAlign:"center", padding:32, fontStyle:"italic" }}>Nada pendente nesta área 🎉</div>
          ) : arrSel.map((p,i) => {
            const cf = critFinal(p);
            const manual = !!prioridades[p.chave];
            return (
              <div key={p.chave} className="mural-item" style={{ animationDelay:`${i*0.04}s`, background:C.card, border:`1px solid ${C.border}`, borderLeft:`3px solid ${CRIT_COR[cf]}`, borderRadius:11, padding:"11px 12px", marginBottom:8, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ width:20, color:C.textDim, fontSize:12, fontWeight:700, fontFamily:"monospace", flexShrink:0 }}>{i+1}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:C.text, fontSize:13, fontWeight:600, lineHeight:1.3 }}>{p.titulo}</div>
                  <div style={{ display:"flex", gap:8, marginTop:2, alignItems:"center", flexWrap:"wrap" }}>
                    <span style={{ color:corOrig(p.origem), fontSize:9, fontWeight:700 }}>{p.origem}</span>
                    {p.maquina && <span style={{ color:C.textDim, fontSize:9, fontFamily:"monospace", fontWeight:700 }}>{p.maquina}</span>}
                    {p.tempo>0 && <span style={{ color:C.textMuted, fontSize:9 }}>⏱ {fmtMin(p.tempo)}</span>}
                  </div>
                </div>
                {/* botão de prioridade (abre seletor) */}
                <div style={{ position:"relative", flexShrink:0 }}>
                  <button onClick={()=>setEditPrio(editPrio===p.chave?null:p.chave)} style={{ display:"flex", alignItems:"center", gap:5, background:`${CRIT_COR[cf]}18`, border:`1px solid ${CRIT_COR[cf]}66`, borderRadius:7, padding:"5px 9px", cursor:"pointer" }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:CRIT_COR[cf] }}/>
                    <span style={{ color:CRIT_COR[cf], fontSize:10, fontWeight:700 }}>{cf}{manual?" ✎":""}</span>
                    <span style={{ color:CRIT_COR[cf], fontSize:9 }}>▾</span>
                  </button>
                  {editPrio===p.chave && (
                    <div style={{ position:"absolute", top:"110%", right:0, zIndex:50, background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:6, minWidth:130, boxShadow:"0 8px 24px rgba(0,0,0,0.5)" }}>
                      <div style={{ color:C.textDim, fontSize:8, textTransform:"uppercase", padding:"2px 6px 6px", letterSpacing:"0.08em" }}>Definir prioridade</div>
                      {["Crítica","Média","Baixa"].map(niv=>(
                        <button key={niv} onClick={()=>salvarPrioridade(p.chave, niv)} style={{ width:"100%", display:"flex", alignItems:"center", gap:7, padding:"7px 8px", borderRadius:7, border:"none", background:cf===niv?`${CRIT_COR[niv]}1a`:"transparent", cursor:"pointer", marginBottom:2 }}>
                          <span style={{ width:8, height:8, borderRadius:"50%", background:CRIT_COR[niv] }}/>
                          <span style={{ color:cf===niv?CRIT_COR[niv]:C.textMuted, fontSize:12, fontWeight:cf===niv?800:500 }}>{niv}</span>
                        </button>
                      ))}
                      {manual && <button onClick={()=>salvarPrioridade(p.chave, null)} style={{ width:"100%", padding:"6px", borderRadius:7, border:`1px solid ${C.border}`, background:"transparent", color:C.textDim, fontSize:10, cursor:"pointer", marginTop:4 }}>↺ Voltar ao automático</button>}
                    </div>
                  )}
                </div>
                {p.tipo==="manual" && (
                  <button onClick={()=>resolverManual(p.id)} style={{ flexShrink:0, background:"rgba(0,230,118,0.12)", border:`1px solid ${C.accentLight}44`, color:C.accentLight, borderRadius:6, padding:"5px 8px", fontSize:10, fontWeight:700, cursor:"pointer" }}>✓</button>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Modal adicionar */}
      {addOpen && (
        <div onClick={()=>setAddOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20, maxWidth:380, width:"100%", maxHeight:"85vh", overflowY:"auto" }}>
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
            <label style={{ color:C.textMuted, fontSize:10, textTransform:"uppercase", display:"block", marginBottom:6 }}>Máquina</label>
            <div style={{ display:"flex", gap:6, marginBottom:12 }}>
              {MAQUINAS.map(mq => (
                <button key={mq} onClick={()=>setMaqAdd(mq)} style={{ flex:1, padding:"9px", borderRadius:9, cursor:"pointer", fontSize:12, fontWeight:800, fontFamily:"monospace",
                  background: maqAdd===mq?C.blue:C.tagBg, border:`1.5px solid ${maqAdd===mq?"rgba(255,255,255,0.5)":C.border}`, color:maqAdd===mq?"#fff":C.textMuted }}>{mq}</button>
              ))}
            </div>
            <label style={{ color:C.textMuted, fontSize:10, textTransform:"uppercase", display:"block", marginBottom:6 }}>Descrição</label>
            <textarea value={descAdd} onChange={e=>setDescAdd(e.target.value)} rows={2} placeholder="O que precisa ser feito..." style={{ ...inputStyle, resize:"vertical", fontFamily:"inherit", marginBottom:12 }}/>
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              <div style={{ flex:1 }}>
                <label style={{ color:C.textMuted, fontSize:10, textTransform:"uppercase", display:"block", marginBottom:6 }}>Tempo est. (min)</label>
                <input value={tempoAdd} onChange={e=>setTempoAdd(e.target.value.replace(/\D/g,""))} placeholder="ex: 45" style={{ ...inputStyle, fontFamily:"monospace" }}/>
              </div>
              <div style={{ flex:1 }}>
                <label style={{ color:C.textMuted, fontSize:10, textTransform:"uppercase", display:"block", marginBottom:6 }}>Nota SAP</label>
                <input value={notaAdd} onChange={e=>setNotaAdd(e.target.value)} placeholder="opcional" style={{ ...inputStyle, fontFamily:"monospace" }}/>
              </div>
            </div>
            <button onClick={addManual} disabled={!descAdd.trim()} style={{ width:"100%", padding:12, borderRadius:10, border:"none", background:descAdd.trim()?C.accent:C.textDim, color:"#fff", fontSize:13, fontWeight:800, cursor:descAdd.trim()?"pointer":"not-allowed" }}>Adicionar</button>
          </div>
        </div>
      )}

      {/* Modal agendar parada */}
      {agOpen && (
        <div onClick={()=>setAgOpen(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20, maxWidth:340, width:"100%" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <span style={{ color:C.text, fontWeight:800, fontSize:15 }}>📅 Agendar Parada</span>
              <button onClick={()=>setAgOpen(null)} style={{ background:"none", border:"none", color:C.textMuted, fontSize:20, cursor:"pointer" }}>×</button>
            </div>
            <div style={{ color:C.textMuted, fontSize:11, marginBottom:12 }}>{JANELAS.find(j=>j.id===agOpen.janId)?.label}</div>
            <label style={{ color:C.textMuted, fontSize:10, textTransform:"uppercase", display:"block", marginBottom:6 }}>Máquina</label>
            <div style={{ display:"flex", gap:6, marginBottom:12 }}>
              {MAQUINAS.map(mq => (
                <button key={mq} onClick={()=>setAgMaq(mq)} style={{ flex:1, padding:"9px", borderRadius:9, cursor:"pointer", fontSize:12, fontWeight:800, fontFamily:"monospace",
                  background: agMaq===mq?C.blue:C.tagBg, border:`1.5px solid ${agMaq===mq?"rgba(255,255,255,0.5)":C.border}`, color:agMaq===mq?"#fff":C.textMuted }}>{mq}</button>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              <div style={{ flex:1.4 }}>
                <label style={{ color:C.textMuted, fontSize:10, textTransform:"uppercase", display:"block", marginBottom:6 }}>Data</label>
                <input type="date" value={agData} onChange={e=>setAgData(e.target.value)} style={{ ...inputStyle, fontFamily:"monospace" }}/>
              </div>
              <div style={{ flex:1 }}>
                <label style={{ color:C.textMuted, fontSize:10, textTransform:"uppercase", display:"block", marginBottom:6 }}>Hora</label>
                <input type="time" value={agHora} onChange={e=>setAgHora(e.target.value)} style={{ ...inputStyle, fontFamily:"monospace" }}/>
              </div>
            </div>
            <button onClick={salvarParada} style={{ width:"100%", padding:12, borderRadius:10, border:"none", background:C.accent, color:"#fff", fontSize:13, fontWeight:800, cursor:"pointer" }}>Salvar Parada</button>
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
