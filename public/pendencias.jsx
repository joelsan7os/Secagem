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
  { id:"pu",   label:"Parte Úmida",        cor:"#00E676", impacto:"IMPACTO DIRETO", impCor:"#FF5252", desc:"Parada de máquina" },
  { id:"clean",label:"Cleaners",           cor:"#00E5D1", impacto:"IMPACTO DIRETO", impCor:"#FF5252", desc:"Isolamento / válvula" },
  { id:"cs",   label:"Secador/Cortadeira", cor:"#5090FF", impacto:"PROGRAMÁVEL",    impCor:"#5090FF", desc:"PP — faquinhas, facão, secador" },
  { id:"enf",  label:"Enfardamento",       cor:"#A87DF0", impacto:"PROGRAMÁVEL",    impCor:"#A87DF0", desc:"PP de linha L4–L8" },
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
@keyframes mural-led { 0%,100%{opacity:1;} 50%{opacity:.5;} }
@keyframes mural-stagger { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:none;} }
.mural-led { animation: mural-led 1.8s ease-in-out infinite; }
.mural-item { animation: mural-stagger .3s ease backwards; }
`;

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
        <span style={{ fontSize:size*0.28, fontWeight:900, fontFamily:"monospace", lineHeight:1, color:cor, textShadow:`0 0 12px ${cor}66` }}>{total}</span>
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
  const [selMaq, setSelMaq]     = React.useState(null);  // null=ambas, "M2", "M3"
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

  // helpers por máquina
  const itensMaq = (janId, mq) => (porJanela[janId]||[]).filter(p => p.maquina===mq || (!p.maquina && mq==="M2"));
  const tempoMaq = (janId, mq) => itensMaq(janId,mq).reduce((a,p)=>a+(p.tempo||0),0);
  function critCount(arr) {
    return { crit:arr.filter(p=>criticidade(p)==="Crítica").length, med:arr.filter(p=>criticidade(p)==="Média").length, baixa:arr.filter(p=>criticidade(p)==="Baixa").length };
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
      <div onClick={()=>setSelMaq(evidencia?null:mq)}
        style={{ flex:1, minWidth:0, cursor:"pointer", transition:"all .18s",
          background: evidencia?`${jan.cor}14`:"rgba(4,17,29,0.5)",
          border:`1.5px solid ${evidencia?jan.cor:C.border}`, borderRadius:11, padding:"11px 12px",
          boxShadow: evidencia?`0 4px 16px ${jan.cor}33`:"none",
          transform: evidencia?"translateY(-2px)":"none" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={{ color:evidencia?jan.cor:C.text, fontSize:12, fontWeight:800, fontFamily:"monospace", letterSpacing:"0.05em" }}>{mq}{evidencia?" ●":""}</span>
          <span className={qtd>0?"mural-led":""} style={{ width:8, height:8, borderRadius:"50%", background:qtd>0?jan.cor:C.textDim, boxShadow:qtd>0?`0 0 6px ${jan.cor}`:"none" }}/>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {grande && qtd>0 ? <DonutGauge total={qtd} segs={segs} cor={jan.cor} size={72}/> : (
            <span style={{ fontSize:grande?34:28, fontWeight:900, fontFamily:"monospace", lineHeight:1, color:qtd>0?C.text:C.textDim }}>{qtd}</span>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            {[["Crít",cc.crit,"#FF5252"],["Méd",cc.med,"#FFC107"],["Bax",cc.baixa,"#00E676"]].map(([l,v,co])=>(
              <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:co }}/>
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
    const arr = porJanela[jan.id]||[];
    const qtd = arr.length;
    const ativo = sel === jan.id;
    return (
      <div onClick={()=>{ setSel(jan.id); setTabOrigem("Todas"); setSelMaq(null); }}
        style={{ position:"relative", overflow:"hidden", cursor:"pointer",
          background: ativo?`linear-gradient(155deg, ${jan.cor}10, rgba(7,24,40,0.96))`:"rgba(10,25,41,0.7)",
          border:`1.5px solid ${ativo?jan.cor+"88":C.border}`, borderRadius:16, padding:15,
          boxShadow: ativo?`0 8px 28px ${jan.cor}22`:"none", transition:"all .2s" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${jan.cor}, transparent)` }}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <div>
            <span style={{ color:jan.cor, fontSize:grande?16:14, fontWeight:800 }}>{jan.label.toUpperCase()}</span>
            <span style={{ color:C.textDim, fontSize:10, display:"block", marginTop:1 }}>{qtd} total · {jan.desc}</span>
          </div>
          <span style={{ background:`${jan.impCor}1f`, border:`1px solid ${jan.impCor}55`, color:jan.impCor, borderRadius:6, padding:"2px 8px", fontSize:8, fontWeight:800 }}>{jan.impacto}</span>
        </div>
        {/* M2 + M3 lado a lado */}
        <div style={{ display:"flex", gap:9 }}>
          {MAQUINAS.map(mq => <MaqBlock key={mq} jan={jan} mq={mq} grande={grande}/>)}
        </div>
        {/* ações */}
        <div style={{ display:"flex", gap:8, marginTop:12, paddingTop:11, borderTop:`1px solid ${C.border}` }}>
          <button onClick={(e)=>{ e.stopPropagation(); setAgOpen({janId:jan.id}); setAgMaq("M2"); }} style={{ flex:1, background:C.tagBg, border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:8, padding:"7px", fontSize:11, fontWeight:700, cursor:"pointer" }}>📅 Agendar parada</button>
          <button onClick={()=>{ setSel(jan.id); setTabOrigem("Todas"); setSelMaq(null); }} style={{ flex:1, background:`${jan.cor}14`, border:`1px solid ${jan.cor}44`, color:jan.cor, borderRadius:8, padding:"7px", fontSize:11, fontWeight:700, cursor:"pointer" }}>Ver oportunidades ›</button>
        </div>
      </div>
    );
  }

  const janSel = JANELAS.find(j=>j.id===sel) || JANELAS[0];
  const arrSelTodas = porJanela[sel]||[];
  const arrSel = selMaq ? arrSelTodas.filter(p => p.maquina===selMaq || (!p.maquina && selMaq==="M2")) : arrSelTodas;
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

      {/* ════ SELETORES DE ÁREA (fixos no topo) ════ */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:16 }}>
        {JANELAS.map(jan => {
          const qtd = porJanela[jan.id]?.length||0;
          const ativo = sel===jan.id;
          return (
            <button key={jan.id} onClick={()=>{ setSel(jan.id); setTabOrigem("Todas"); setSelMaq(null); }}
              style={{ position:"relative", cursor:"pointer", textAlign:"center", padding:"11px 6px", borderRadius:12,
                background: ativo?`${jan.cor}1a`:"rgba(255,255,255,0.025)",
                border:`1.5px solid ${ativo?jan.cor:C.border}`,
                boxShadow: ativo?`0 4px 14px ${jan.cor}33`:"none", transition:"all .18s" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, marginBottom:5 }}>
                <span className={qtd>0?"mural-led":""} style={{ width:8, height:8, borderRadius:"50%", background:qtd>0?jan.cor:C.textDim, boxShadow:qtd>0?`0 0 7px ${jan.cor}`:"none" }}/>
                <span style={{ fontSize:24, fontWeight:900, fontFamily:"monospace", lineHeight:1, color:qtd>0?(ativo?jan.cor:C.text):C.textDim }}>{qtd}</span>
              </div>
              <div style={{ color:ativo?jan.cor:C.textMuted, fontSize:10, fontWeight:800, lineHeight:1.15 }}>{jan.label}</div>
            </button>
          );
        })}
      </div>

      {/* ════ PAINEL ÚNICO DA ÁREA SELECIONADA ════ */}
      <div style={{ marginBottom:14 }}><AreaCard jan={janSel} grande/></div>

      {/* Ranking interno da área */}
      {arrSel.length>0 && (
        <div style={{ marginBottom:14 }}>
          <h3 style={{ color:C.text, fontSize:14, fontWeight:800, margin:"0 0 3px" }}>🏆 Prioridade — {janSel.label}</h3>
          <p style={{ color:C.textDim, fontSize:10, margin:"0 0 10px" }}>Ordenado por criticidade · {arrSel.length} oportunidade{arrSel.length!==1?"s":""}</p>
          {arrSel.slice(0,3).map((p, idx) => {
            const podioCor = idx===0?"#FFD700":idx===1?"#C0C0C0":"#CD7F32";
            const crit = criticidade(p);
            return (
              <div key={p.chave} className="mural-item" style={{ animationDelay:`${idx*0.05}s`,
                background:C.card, border:`1px solid ${C.border}`, borderLeft:`3px solid ${podioCor}`,
                borderRadius:11, padding:"10px 12px", marginBottom:7, display:"flex", alignItems:"center", gap:11 }}>
                <div style={{ width:26, height:26, borderRadius:7, flexShrink:0, background:`${podioCor}22`, border:`1.5px solid ${podioCor}`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:12, fontFamily:"monospace", color:podioCor }}>{idx+1}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:C.text, fontWeight:700, fontSize:13, lineHeight:1.3 }}>{p.titulo}</div>
                  <div style={{ display:"flex", gap:8, marginTop:2, alignItems:"center" }}>
                    <span style={{ color:corOrig(p.origem), fontSize:9, fontWeight:700 }}>{p.origem}</span>
                    {p.maquina && <span style={{ color:C.textDim, fontSize:9, fontFamily:"monospace", fontWeight:700 }}>{p.maquina}</span>}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:CRIT_COR[crit] }}/>
                  <span style={{ color:CRIT_COR[crit], fontSize:10, fontWeight:700 }}>{crit}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabela completa da área */}
      <div style={{ background:"rgba(10,25,41,0.7)", border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px 0" }}>
          <span style={{ color:janSel.cor, fontSize:15, fontWeight:800 }}>{janSel.label.toUpperCase()}</span>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color:selMaq?janSel.cor:C.textDim, fontSize:10, fontWeight:700, fontFamily:"monospace" }}>
              {selMaq ? `▶ ${selMaq}` : "M2 + M3"}
            </span>
            {selMaq && <button onClick={()=>setSelMaq(null)} style={{ background:"none", border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:6, padding:"2px 8px", fontSize:9, cursor:"pointer" }}>limpar</button>}
            <span style={{ background:`${janSel.impCor}1f`, border:`1px solid ${janSel.impCor}55`, color:janSel.impCor, borderRadius:6, padding:"2px 8px", fontSize:8, fontWeight:800 }}>{janSel.impacto}</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:4, padding:"10px 16px 0", borderBottom:`1px solid ${C.border}`, overflowX:"auto" }}>
          {origensTab.map(o => {
            const n = o==="Todas"?arrSel.length:origensDe(arrSel)[o]||0;
            const ativo = tabOrigem===o;
            return (
              <button key={o} onClick={()=>setTabOrigem(o)} style={{ flexShrink:0, padding:"7px 12px", border:"none", background:"transparent", cursor:"pointer", color:ativo?janSel.cor:C.textMuted, fontWeight:ativo?800:500, fontSize:12, borderBottom:ativo?`2px solid ${janSel.cor}`:"2px solid transparent" }}>
                {o} {o!=="Todas"&&`(${n})`}
              </button>
            );
          })}
        </div>
        <div style={{ padding:"6px 8px 12px" }}>
          {arrFiltrado.length===0 ? (
            <div style={{ color:C.textDim, fontSize:12, textAlign:"center", padding:28, fontStyle:"italic" }}>Nada pendente 🎉</div>
          ) : arrFiltrado.map((p,i) => {
            const crit = criticidade(p);
            return (
              <div key={p.chave} className="mural-item" style={{ animationDelay:`${i*0.04}s`, display:"flex", alignItems:"center", gap:9, padding:"10px 8px", borderBottom:i<arrFiltrado.length-1?`1px solid ${C.border}`:"none" }}>
                <span style={{ width:20, color:C.textDim, fontSize:12, fontWeight:700, fontFamily:"monospace", flexShrink:0 }}>{i+1}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:C.text, fontSize:13, fontWeight:600, lineHeight:1.3 }}>{p.titulo}</div>
                  <div style={{ display:"flex", gap:8, marginTop:1, alignItems:"center" }}>
                    {p.tag && <code style={{ color:C.textDim, fontSize:9 }}>{p.tag}</code>}
                    {p.maquina && <span style={{ color:C.textDim, fontSize:9, fontFamily:"monospace", fontWeight:700 }}>{p.maquina}</span>}
                    {p.tempo>0 && <span style={{ color:C.textMuted, fontSize:9 }}>⏱ {fmtMin(p.tempo)}</span>}
                  </div>
                </div>
                <span style={{ color:C.textMuted, fontSize:10, flexShrink:0, width:56 }}>{p.origem}</span>
                <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0, width:62 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:CRIT_COR[crit] }}/>
                  <span style={{ color:CRIT_COR[crit], fontSize:10, fontWeight:700 }}>{crit}</span>
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
