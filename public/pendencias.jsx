// ─── pendencias.jsx — Mural de Oportunidades · Secagem H2 · Indústria 5.0 ─────
// Card "torre de controle": glassmorphism, blueprint grid, tiles-reatores com
// led-pulse, hero number animado, ranking de prioridade em cascata.
// Fontes automáticas (só leitura): chamados, válvula c/ passagem, equip. fora.
// Fonte manual (editável): pendencias_h2. Exporta .xlsx via SheetJS (CDN).
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

// ── Janelas de oportunidade (cor por área, sem emoji) ─────────────────────────
const JANELAS = [
  { id:"pu",   label:"Parte Úmida",   sigla:"PU",  cor:"#FF5252", desc:"Parada de máquina" },
  { id:"cs",   label:"Cortadeira",    sigla:"CS",  cor:"#5090FF", desc:"PP — faquinhas, facão" },
  { id:"enf",  label:"Enfardamento",  sigla:"ENF", cor:"#FFC107", desc:"PP de linha L4–L8" },
  { id:"clean",label:"Cleaners",      sigla:"CLN", cor:"#00E5D1", desc:"Isolamento / válvula" },
];

// Peso de prioridade (menor = mais urgente, sobe no ranking)
const PESO_PRAZO = { "Imediato":0, "Urgente":1, "Normal":2, "Programável":3, "":4 };

function areaParaJanela(area) {
  const a = (area||"").toLowerCase();
  if (a === "cortadeira" || a === "cs") return "cs";
  if (a === "enfardamento" || a === "enf") return "enf";
  if (a === "cleaners") return "clean";
  return "pu";
}

// Score de prioridade para ranking (menor = mais crítico)
function scorePrioridade(p) {
  let s = (PESO_PRAZO[p.prazo] ?? 4) * 100;
  if (p.origem === "Cleaners") s -= 50;        // válvula c/ passagem = dor principal
  if (p.descricao?.includes("manutenção")) s -= 20;
  return s;
}

// ── Animações CSS ─────────────────────────────────────────────────────────────
const STYLES = `
@keyframes mural-led { 0%,100%{opacity:1;box-shadow:0 0 0 0 var(--lc);} 50%{opacity:.55;box-shadow:0 0 0 5px transparent;} }
@keyframes mural-stagger { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:none;} }
@keyframes mural-crit { 0%,100%{box-shadow:inset 3px 0 0 0 var(--cc),0 0 0 0 rgba(255,82,82,.5);} 50%{box-shadow:inset 3px 0 0 0 var(--cc),-2px 0 8px 0 rgba(255,82,82,.4);} }
@keyframes mural-sev { 0%,100%{opacity:.85;} 50%{opacity:1;} }
.mural-led { animation: mural-led 1.8s ease-in-out infinite; }
.mural-item { animation: mural-stagger .3s ease backwards; }
.mural-crit { animation: mural-crit 1.4s ease-in-out infinite; }
.mural-sev-pulse { animation: mural-sev 1.5s ease-in-out infinite; }
`;

// ─────────────────────────────────────────────────────────────────────────────
function MuralInterno({ eqState = {}, onVoltar }) {
  const cfg = storageGet("op_config") || {};
  const operador = cfg.nomeOperador || "";

  const [manuais, setManuais]   = React.useState(() => storageGet("pendencias_h2") || []);
  const [chamados, setChamados] = React.useState(() => storageGet("chamados_h2") || []);
  const [cleaners, setCleaners] = React.useState(() => storageGet("cleaners_h2") || {M2:{},M3:{}});
  const [sel, setSel]           = React.useState(null);   // área selecionada
  const [addOpen, setAddOpen]   = React.useState(false);
  const [exportando, setExportando] = React.useState(false);
  const [janelaAdd, setJanelaAdd]   = React.useState("pu");
  const [descAdd, setDescAdd]       = React.useState("");
  const [notaAdd, setNotaAdd]       = React.useState("");
  const [heroAnim, setHeroAnim]     = React.useState(0);   // count-up

  React.useEffect(() => {
    if (!document.getElementById("mural-styles")) {
      const s=document.createElement("style"); s.id="mural-styles"; s.textContent=STYLES; document.head.appendChild(s);
    }
    cloudGet("pendencias_h2").then(d => { if (Array.isArray(d)) setManuais(d); });
    cloudGet("chamados_h2").then(d => { if (Array.isArray(d)) setChamados(d); });
    cloudGet("cleaners_h2").then(d => { if (d) setCleaners(d); });
  }, []);

  // ── Coletar pendências (lógica preservada + blindada) ───────────────────────
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

  // Agrupar por janela
  const porJanela = React.useMemo(() => {
    const g = { pu:[], cs:[], enf:[], clean:[] };
    pendencias.forEach(p => {
      if (p.multiJanela) p.multiJanela.forEach(j => g[j]?.push(p));
      else g[p.janela]?.push(p);
    });
    // ordenar cada área por prioridade
    Object.keys(g).forEach(k => g[k].sort((a,b)=>scorePrioridade(a)-scorePrioridade(b)));
    return g;
  }, [pendencias]);

  const totalGlobal = JANELAS.reduce((acc,j)=>acc+(porJanela[j.id]?.length||0),0);
  const criticos = pendencias.filter(p=>p.prazo==="Imediato"||p.prazo==="Urgente"||p.origem==="Cleaners").length;
  // severidade 0..1
  const severidade = totalGlobal===0?0:Math.min(1, criticos/Math.max(totalGlobal,1) + (criticos>0?0.2:0));
  const sevCor = severidade>0.5?C.dangerLight:severidade>0.2?C.warningLight:C.accentLight;

  // Count-up do hero
  React.useEffect(() => {
    let raf, ini=null; const dur=600; const alvo=totalGlobal;
    const tick=(t)=>{ if(ini===null)ini=t; const p=Math.min(1,(t-ini)/dur);
      setHeroAnim(Math.round(alvo*p)); if(p<1)raf=requestAnimationFrame(tick); };
    raf=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf);
  }, [totalGlobal]);

  // ── Ações ───────────────────────────────────────────────────────────────────
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
        "Descrição":p.descricao, "Nota SAP":p.nota, "Prazo":p.prazo, "Disciplina":p.disciplina,
        "Máquina":p.maquina, "Data":fmtData(p.data), "Operador":p.operador,
      })));
      const ws = window.XLSX.utils.json_to_sheet(linhas);
      ws["!cols"]=[{wch:16},{wch:6},{wch:12},{wch:32},{wch:18},{wch:40},{wch:14},{wch:12},{wch:14},{wch:8},{wch:12},{wch:16}];
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

  const lista = sel ? (porJanela[sel]||[]) : [];
  const janSel = JANELAS.find(j=>j.id===sel);

  // ── Item do ranking ─────────────────────────────────────────────────────────
  function RankItem({ p, idx }) {
    const critico = p.prazo==="Imediato"||p.prazo==="Urgente"||p.origem==="Cleaners";
    const corOrigem = p.origem==="Chamado"?"#5090FF":p.origem==="Cleaners"?"#00E5D1":p.origem==="Equipamento"?C.warningLight:C.accentLight;
    const podio = idx<3;
    const podioCor = idx===0?"#FFD700":idx===1?"#C0C0C0":"#CD7F32";
    return (
      <div className={"mural-item"+(critico?" mural-crit":"")}
        style={{ "--cc":corOrigem, animationDelay:`${idx*0.05}s`,
          background:C.card, border:`1px solid ${C.border}`,
          borderLeft:critico?undefined:`3px solid ${corOrigem}`,
          borderRadius:11, padding:"11px 13px", marginBottom:8, display:"flex", gap:11, alignItems:"flex-start" }}>
        {/* Rank badge */}
        <div style={{ flexShrink:0, width:30, height:30, borderRadius:8,
          background:podio?`${podioCor}22`:C.tagBg, border:`1.5px solid ${podio?podioCor:C.border}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontWeight:900, fontSize:13, fontFamily:"monospace", color:podio?podioCor:C.textMuted }}>
          {idx+1}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:3, alignItems:"center" }}>
            <span style={{ background:`${corOrigem}1f`, border:`1px solid ${corOrigem}55`, color:corOrigem, borderRadius:5, padding:"1px 7px", fontSize:9, fontWeight:800, letterSpacing:"0.04em" }}>{p.origem}</span>
            {p.prazo && <span style={{ color:critico?C.dangerLight:C.textDim, fontSize:9, fontWeight:700 }}>{p.prazo}</span>}
            {p.multiJanela && <span style={{ color:"#00E5D1", fontSize:9, fontWeight:700 }}>↔ 2 janelas</span>}
          </div>
          <div style={{ color:C.text, fontWeight:700, fontSize:13, lineHeight:1.3 }}>{p.titulo}</div>
          {p.tag && <code style={{ color:C.textMuted, fontSize:10, fontFamily:"monospace" }}>{p.tag}</code>}
          {p.descricao && p.descricao!==p.titulo && <p style={{ color:C.textMuted, fontSize:11, margin:"3px 0 0", lineHeight:1.4 }}>{p.descricao}</p>}
          <div style={{ display:"flex", gap:10, marginTop:5, flexWrap:"wrap" }}>
            {p.nota && <span style={{ color:C.warningLight, fontSize:10, fontFamily:"monospace", fontWeight:700 }}>SAP {p.nota}</span>}
            {p.data && <span style={{ color:C.textDim, fontSize:9 }}>{fmtData(p.data)}</span>}
            {p.operador && <span style={{ color:C.textDim, fontSize:9 }}>{p.operador}</span>}
          </div>
        </div>
        {p.tipo==="manual" && (
          <button onClick={()=>resolverManual(p.id)} style={{ flexShrink:0, background:"rgba(0,230,118,0.12)", border:`1px solid ${C.accentLight}44`, color:C.accentLight, borderRadius:7, padding:"5px 9px", fontSize:10, fontWeight:700, cursor:"pointer" }}>✓</button>
        )}
      </div>
    );
  }

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding:"16px 16px 80px" }}>
      <button onClick={onVoltar} style={{ background:C.tagBg, border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:9, padding:"9px 14px", cursor:"pointer", fontSize:12, fontWeight:700, marginBottom:14 }}>← Início</button>

      {/* ════ CARD TORRE DE CONTROLE ════ */}
      <div style={{ position:"relative", borderRadius:18, overflow:"hidden", marginBottom:16,
        background:`linear-gradient(160deg, rgba(10,25,41,0.95), rgba(7,24,40,0.98))`,
        border:`1px solid ${C.border}`,
        boxShadow:"0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)" }}>

        {/* Blueprint grid de fundo */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", opacity:0.4,
          backgroundImage:"radial-gradient(rgba(80,144,255,0.12) 1px, transparent 1px)",
          backgroundSize:"18px 18px" }}/>

        {/* Barra de severidade no topo */}
        <div className={severidade>0.2?"mural-sev-pulse":""} style={{ height:4, width:"100%",
          background:`linear-gradient(90deg, ${sevCor}, ${sevCor}88)`,
          boxShadow:`0 0 12px ${sevCor}` }}/>

        <div style={{ position:"relative", padding:"18px 18px 16px" }}>
          {/* Header + Hero */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
            <div>
              <div style={{ color:C.textDim, fontSize:9, fontWeight:800, letterSpacing:"0.22em", textTransform:"uppercase", fontFamily:"monospace" }}>Mural de Oportunidades</div>
              <div style={{ color:C.textMuted, fontSize:11, marginTop:3 }}>Janelas de parada · prioridade dinâmica</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:38, fontWeight:900, fontFamily:"monospace", lineHeight:1, color:sevCor, textShadow:`0 0 16px ${sevCor}66` }}>{heroAnim}</div>
              <div style={{ color:C.textDim, fontSize:8, letterSpacing:"0.15em", textTransform:"uppercase", marginTop:2 }}>pendências</div>
            </div>
          </div>

          {/* Tiles-reatores */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {JANELAS.map(jan => {
              const qtd = porJanela[jan.id]?.length || 0;
              const ativo = sel === jan.id;
              const intensidade = totalGlobal>0 ? qtd/Math.max(...JANELAS.map(j=>porJanela[j.id]?.length||0),1) : 0;
              return (
                <button key={jan.id} onClick={()=>setSel(ativo?null:jan.id)}
                  style={{ position:"relative", textAlign:"left", cursor:"pointer",
                    background: ativo?`${jan.cor}14`:"rgba(255,255,255,0.025)",
                    border:`1.5px solid ${ativo?jan.cor:C.border}`,
                    borderRadius:13, padding:"12px 13px", transition:"all .2s",
                    transform:ativo?"translateY(-2px)":"none",
                    boxShadow:ativo?`0 6px 18px ${jan.cor}33, 0 0 0 1px ${jan.cor}44`:"none" }}>
                  {/* dot led + sigla */}
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
                    <span className={qtd>0?"mural-led":""} style={{ "--lc":jan.cor, width:9, height:9, borderRadius:"50%", background:qtd>0?jan.cor:C.textDim, flexShrink:0, boxShadow:qtd>0?`0 0 8px ${jan.cor}`:"none" }}/>
                    <span style={{ color:ativo?jan.cor:C.textMuted, fontSize:11, fontWeight:800, letterSpacing:"0.05em" }}>{jan.label}</span>
                  </div>
                  {/* número grande */}
                  <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
                    <span style={{ fontSize:30, fontWeight:900, fontFamily:"monospace", lineHeight:1, color:qtd>0?(ativo?jan.cor:C.text):C.textDim }}>{qtd}</span>
                    <span style={{ color:C.textDim, fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em" }}>{qtd===1?"item":"itens"}</span>
                  </div>
                  {/* micro-barra de intensidade */}
                  <div style={{ marginTop:9, height:4, borderRadius:3, background:"rgba(255,255,255,0.05)", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${Math.max(intensidade*100, qtd>0?12:0)}%`, borderRadius:3,
                      background:jan.cor, boxShadow:qtd>0?`0 0 6px ${jan.cor}88`:"none", transition:"width .4s" }}/>
                  </div>
                  <div style={{ color:C.textDim, fontSize:8, marginTop:6, letterSpacing:"0.03em" }}>{jan.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ações */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <button onClick={()=>setAddOpen(true)} style={{ flex:1, padding:11, borderRadius:10, border:`1px solid ${C.border}`, background:C.tagBg, color:C.text, fontSize:12, fontWeight:700, cursor:"pointer" }}>+ Adicionar</button>
        <button onClick={exportarExcel} disabled={exportando||totalGlobal===0} style={{ flex:1, padding:11, borderRadius:10, border:"none", background:totalGlobal===0?C.textDim:"linear-gradient(135deg,#006B2E,#00E676)", color:"#fff", fontSize:12, fontWeight:800, cursor:totalGlobal===0?"not-allowed":"pointer", boxShadow:totalGlobal>0?"0 0 12px rgba(0,230,118,0.3)":"none" }}>
          {exportando?"Gerando…":"Exportar Excel"}
        </button>
      </div>

      {/* ════ RANKING DA ÁREA SELECIONADA ════ */}
      {sel ? (
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:12, paddingBottom:8, borderBottom:`2px solid ${janSel.cor}44` }}>
            <span className="mural-led" style={{ "--lc":janSel.cor, width:10, height:10, borderRadius:"50%", background:janSel.cor, boxShadow:`0 0 10px ${janSel.cor}` }}/>
            <div style={{ flex:1 }}>
              <div style={{ color:C.text, fontWeight:800, fontSize:15 }}>{janSel.label}</div>
              <div style={{ color:C.textDim, fontSize:10 }}>Ranking de prioridade · {lista.length} oportunidade{lista.length!==1?"s":""}</div>
            </div>
            <button onClick={()=>setSel(null)} style={{ background:"none", border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:8, padding:"5px 10px", fontSize:11, cursor:"pointer" }}>Fechar</button>
          </div>
          {lista.length===0 ? (
            <div style={{ color:C.textDim, fontSize:12, textAlign:"center", padding:32, fontStyle:"italic" }}>Nada pendente nesta janela 🎉</div>
          ) : lista.map((p,i) => <RankItem key={p.chave} p={p} idx={i}/>)}
        </div>
      ) : (
        <div style={{ color:C.textDim, fontSize:12, textAlign:"center", padding:"24px 16px", fontStyle:"italic" }}>
          Toque numa área acima para ver o ranking de prioridade
        </div>
      )}

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
