// ─── Dashboard.jsx — Modo TV/Web · Secagem H2 ──────────────────────────────
// Grid 3×2 de painéis ao vivo. Cada painel clicável → tela operacional.
// onSnapshot em: ocorrencias_h2, chamados_h2, cleaners_h2, historico_h2, pendencias_h2
import * as React from "react";
import { COL, doc, onSnapshot } from "./firebase";

const C = {
  bg:"#04111D", surface:"#071828", card:"#0A1929",
  accent:"#00E676", accentLight:"#00E676",
  blue:"#0E2847", blueLight:"#1A5CCC",
  warning:"#b87d00", warningLight:"#FFC107",
  danger:"#c0272d", dangerLight:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880",
  border:"rgba(60,255,140,0.15)",
};

// ── helpers ──────────────────────────────────────────────────────────────────
const storageGet = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const hoje = () => new Date().toISOString().slice(0,10);
const getAutoTurno = () => { const h = new Date().getHours(); if(h<8) return "00x08"; if(h<16) return "08x16"; return "16x24"; };
const parseAlt = (v) => { if(!v) return null; const n = parseFloat(String(v).replace(",",".")); return isNaN(n)?null:n; };

const LINHAS = ["L4","L5","L6","L7","L8"];
const ALT_MIN = 1.88, ALT_MAX = 1.92;
const AREAS_CHECK = [
  {area:"pu",  tipo:"rotina",        label:"P. Úmida"},
  {area:"cs",  tipo:"cortadeira",    label:"Cortadeira"},
  {area:"enf", tipo:"enf_qualidade", label:"Enfard."},
];
const PRAZOS_COR = { Imediato:"#FF5252", Urgente:"#FF8C00", Normal:"#FFC107", Programável:"#5090FF" };
const CLEANERS_TOTAL = 24; // c1(12)+c2(6)+c3(4)+c4(2)
const CLEANERS_LIMITE = 70;

// ── Relógio ──────────────────────────────────────────────────────────────────
function Relogio() {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const hh = String(now.getHours()).padStart(2,"0");
  const mm = String(now.getMinutes()).padStart(2,"0");
  const ss = String(now.getSeconds()).padStart(2,"0");
  const turno = getAutoTurno();
  return (
    <div style={{display:"flex",alignItems:"baseline",gap:8}}>
      <span style={{fontFamily:"monospace",fontSize:28,fontWeight:900,color:C.accentLight,letterSpacing:"0.06em"}}>{hh}:{mm}<span style={{fontSize:16,opacity:.6}}>:{ss}</span></span>
      <span style={{fontSize:11,color:C.textMuted,fontWeight:700,letterSpacing:"0.1em"}}>{turno}</span>
    </div>
  );
}

// ── Card base ──────────────────────────────────────────────────────────────
function PainelCard({ title, icon, corTopo, onClick, children, alerta=false }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      style={{
        background: hover ? "#0E2847" : C.card,
        border: `1px solid ${alerta ? C.dangerLight+"44" : C.border}`,
        borderTop: `3px solid ${corTopo}`,
        borderRadius: 14,
        padding: "20px 22px 18px",
        cursor: "pointer",
        transition: "all .2s",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: hover
          ? `0 0 24px ${corTopo}33, 0 4px 32px rgba(0,0,0,.5)`
          : `0 2px 16px rgba(0,0,0,.4)`,
        overflow: "hidden",
      }}
    >
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>{icon}</span>
          <span style={{fontSize:13,fontWeight:800,color:C.textMuted,letterSpacing:"0.08em",textTransform:"uppercase"}}>{title}</span>
        </div>
        <span style={{fontSize:12,color:C.textDim}}>›</span>
      </div>
      {children}
    </div>
  );
}

// ── Painel 1 · Mural de Oportunidades ─────────────────────────────────────
function PainelMural({ pendenciasData, chamadosData, setTela }) {
  const JANELAS = [
    {id:"pu",  label:"P. Úmida"},
    {id:"clean",label:"Cleaners"},
    {id:"cs",  label:"Sec/Cort"},
    {id:"enf", label:"Enf."},
  ];
  // contagem simples por área (todas as máquinas)
  const pend = Array.isArray(pendenciasData) ? pendenciasData : [];
  const chamAbertos = Array.isArray(chamadosData) ? chamadosData.filter(c=>c.status==="aberto") : [];

  // agrupa por janela (replicando lógica do pendencias.jsx)
  function areaParaJanela(area) {
    const a = (area||"").toLowerCase();
    if(a==="cortadeira"||a==="cs"||a==="secador") return "cs";
    if(a==="enfardamento"||a==="enf") return "enf";
    if(a==="cleaners") return "clean";
    return "pu";
  }
  const countPorJanela = { pu:0, clean:0, cs:0, enf:0 };
  pend.forEach(p => {
    if(p.multiJanela) p.multiJanela.forEach(j => { if(countPorJanela[j]!==undefined) countPorJanela[j]++; });
    else { const j = p.janela || areaParaJanela(p.area); if(countPorJanela[j]!==undefined) countPorJanela[j]++; }
  });
  chamAbertos.forEach(c => {
    const j = areaParaJanela(c.area);
    if(countPorJanela[j]!==undefined) countPorJanela[j]++;
  });

  const total = Object.values(countPorJanela).reduce((a,b)=>a+b,0);
  const corTotal = total===0 ? C.accentLight : total<=5 ? C.warningLight : C.dangerLight;

  return (
    <PainelCard title="Mural de Oportunidades" icon="🔧" corTopo={corTotal} onClick={()=>setTela("mural")} alerta={total>5}>
      <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:4}}>
        <span style={{fontFamily:"monospace",fontSize:52,fontWeight:900,color:corTotal,lineHeight:1,
          textShadow:`0 0 20px ${corTotal}66`}}>{total}</span>
        <span style={{fontSize:13,color:C.textMuted,marginBottom:8}}>pendências</span>
      </div>
      <div style={{display:"flex",gap:8}}>
        {JANELAS.map(j => {
          const n = countPorJanela[j.id]||0;
          const c = n===0 ? C.textDim : n<=2 ? C.warningLight : C.dangerLight;
          return (
            <div key={j.id} style={{flex:1,background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
              <div style={{fontFamily:"monospace",fontSize:22,fontWeight:900,color:c}}>{n}</div>
              <div style={{fontSize:9,color:C.textDim,letterSpacing:"0.06em",marginTop:2}}>{j.label}</div>
            </div>
          );
        })}
      </div>
    </PainelCard>
  );
}

// ── Painel 2 · Chamados / Notas SAP ───────────────────────────────────────
function PainelChamados({ chamadosData, setTela }) {
  const chamados = Array.isArray(chamadosData) ? chamadosData.filter(c=>c.status==="aberto") : [];
  const nIme = chamados.filter(c=>c.prazo==="Imediato").length;
  const nUrg = chamados.filter(c=>c.prazo==="Urgente").length;
  const nNor = chamados.filter(c=>c.prazo==="Normal").length;
  const nPro = chamados.filter(c=>c.prazo==="Programável").length;
  const corTopo = nIme>0 ? C.dangerLight : nUrg>0 ? "#FF8C00" : chamados.length>0 ? C.warningLight : C.accentLight;

  return (
    <PainelCard title="Chamados / SAP" icon="🗒" corTopo={corTopo} onClick={()=>setTela("equipamentos")} alerta={nIme>0}>
      <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:4}}>
        <span style={{fontFamily:"monospace",fontSize:52,fontWeight:900,color:corTopo,lineHeight:1,
          textShadow:`0 0 20px ${corTopo}66`}}>{chamados.length}</span>
        <span style={{fontSize:13,color:C.textMuted,marginBottom:8}}>abertos</span>
      </div>
      <div style={{display:"flex",gap:8}}>
        {[
          {label:"Imediato", n:nIme, c:PRAZOS_COR.Imediato},
          {label:"Urgente",  n:nUrg, c:PRAZOS_COR.Urgente},
          {label:"Normal",   n:nNor, c:PRAZOS_COR.Normal},
          {label:"Program.", n:nPro, c:PRAZOS_COR.Programável},
        ].map(({label,n,c}) => (
          <div key={label} style={{flex:1,background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontFamily:"monospace",fontSize:22,fontWeight:900,color:n>0?c:C.textDim}}>{n}</div>
            <div style={{fontSize:9,color:C.textDim,letterSpacing:"0.04em",marginTop:2}}>{label}</div>
          </div>
        ))}
      </div>
    </PainelCard>
  );
}

// ── Painel 3 · Cleaners ────────────────────────────────────────────────────
function PainelCleaners({ cleanersData, setTela }) {
  const dados = cleanersData || {M2:{},M3:{}};

  function calcEfic(mq) {
    const d = dados[mq] || {};
    const opTotal = Object.values(d).filter(v=>v==="OPERANDO").length;
    const efic = Math.round((opTotal/CLEANERS_TOTAL)*100);
    return { efic, operando: opTotal, fora: CLEANERS_TOTAL - opTotal };
  }
  const m2 = calcEfic("M2");
  const m3 = calcEfic("M3");
  const eficMedia = Math.round((m2.efic + m3.efic)/2);
  const corTopo = eficMedia >= CLEANERS_LIMITE ? C.accentLight : eficMedia >= 50 ? C.warningLight : C.dangerLight;

  function BarEfic({ efic, label }) {
    const c = efic >= CLEANERS_LIMITE ? C.accentLight : efic >= 50 ? C.warningLight : C.dangerLight;
    return (
      <div style={{flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontSize:11,color:C.textMuted,fontWeight:700}}>{label}</span>
          <span style={{fontFamily:"monospace",fontSize:14,fontWeight:900,color:c}}>{efic}%</span>
        </div>
        <div style={{height:8,borderRadius:4,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:4,width:`${efic}%`,background:c,transition:"width .5s",
            boxShadow:`0 0 8px ${c}88`}}/>
        </div>
        <div style={{fontSize:10,color:C.textDim,marginTop:3}}>
          {CLEANERS_TOTAL - (efic===m2.efic?m2.fora:m3.fora)} op · {efic===m2.efic?m2.fora:m3.fora} fora
        </div>
      </div>
    );
  }

  return (
    <PainelCard title="Cleaners" icon="🫧" corTopo={corTopo} onClick={()=>setTela("cleaners")} alerta={eficMedia<50}>
      <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:4}}>
        <span style={{fontFamily:"monospace",fontSize:52,fontWeight:900,color:corTopo,lineHeight:1,
          textShadow:`0 0 20px ${corTopo}66`}}>{eficMedia}%</span>
        <span style={{fontSize:13,color:C.textMuted,marginBottom:8}}>eficiência</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <BarEfic efic={m2.efic} label="M2" />
        <BarEfic efic={m3.efic} label="M3" />
      </div>
    </PainelCard>
  );
}

// ── Painel 4 · Checklists do Turno ────────────────────────────────────────
function PainelChecklists({ historicoData, setTela }) {
  const historico = Array.isArray(historicoData) ? historicoData : [];
  const turnoAtual = getAutoTurno();
  const hj = hoje();

  const checkTurno = historico.filter(h => h.data===hj && h.turno===turnoAtual);

  // X/3 para cada área+máquina (PU: por máq; CS: por máq; ENF: por linha)
  const areas = [
    {area:"pu",  tipo:"rotina",        label:"P.Úmida", maquinas:["M2","M3"]},
    {area:"cs",  tipo:"cortadeira",    label:"Sec/Cort", maquinas:["M2","M3"]},
    {area:"enf", tipo:"enf_qualidade", label:"Enf.", maquinas:["L4","L5","L6","L7","L8"]},
  ];

  let totalFeito=0, totalEsp=0;
  const blocos = areas.map(a => {
    const esp = a.maquinas.length;
    const feito = a.maquinas.filter(mq =>
      checkTurno.some(h => h.tipoId===a.tipo && (h.maquina===mq || h.linha===mq))
    ).length;
    totalFeito += feito;
    totalEsp += esp;
    const c = feito===esp ? C.accentLight : feito===0 ? C.dangerLight : C.warningLight;
    return { label:a.label, feito, esp, c };
  });

  const corTopo = totalFeito===totalEsp ? C.accentLight : totalFeito===0 ? C.dangerLight : C.warningLight;

  return (
    <PainelCard title="Checklists do Turno" icon="✓" corTopo={corTopo} onClick={()=>setTela("checklist")} alerta={totalFeito===0}>
      <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:4}}>
        <span style={{fontFamily:"monospace",fontSize:52,fontWeight:900,color:corTopo,lineHeight:1,
          textShadow:`0 0 20px ${corTopo}66`}}>{totalFeito}</span>
        <span style={{fontFamily:"monospace",fontSize:30,color:C.textDim,lineHeight:1,marginBottom:4}}>/{totalEsp}</span>
        <span style={{fontSize:13,color:C.textMuted,marginBottom:8}}>lançamentos</span>
      </div>
      <div style={{display:"flex",gap:8}}>
        {blocos.map(({label,feito,esp,c}) => (
          <div key={label} style={{flex:1,background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontFamily:"monospace",fontSize:18,fontWeight:900,color:c}}>{feito}/{esp}</div>
            <div style={{fontSize:9,color:C.textDim,letterSpacing:"0.05em",marginTop:2}}>{label}</div>
          </div>
        ))}
      </div>
    </PainelCard>
  );
}

// ── Painel 5 · Altura das Units ────────────────────────────────────────────
function PainelAlturaUnits({ historicoData, setTela }) {
  const historico = Array.isArray(historicoData) ? historicoData : [];

  // última leitura por linha
  const ultAlt = {};
  [...historico].sort((a,b)=>b.id-a.id)
    .filter(h=>h.tipoId==="enf_qualidade")
    .forEach(r => {
      const ln = r.linha || r.maquina;
      if(ln && !ultAlt[ln]) {
        const it = r.items?.find(i=>i.id==="enf_14");
        const v = it ? parseAlt(it.resp) : null;
        if(v!==null) ultAlt[ln] = v;
      }
    });

  const linhas = LINHAS.map(l => ({ l, v: ultAlt[l]||null }));
  const comLeitura = linhas.filter(x=>x.v!==null);
  const foraDeFaixa = comLeitura.filter(x=>x.v<ALT_MIN||x.v>ALT_MAX);
  const corTopo = foraDeFaixa.length===0 ? C.accentLight : C.dangerLight;

  function corAlt(v) {
    if(v===null) return C.textDim;
    if(v<ALT_MIN||v>ALT_MAX) return C.dangerLight;
    return C.accentLight;
  }

  return (
    <PainelCard title="Altura das Units" icon="📏" corTopo={corTopo} onClick={()=>setTela("historico")} alerta={foraDeFaixa.length>0}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        <span style={{fontSize:11,color:C.textMuted}}>Faixa:</span>
        <span style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:C.accentLight}}>
          {ALT_MIN.toFixed(2)}–{ALT_MAX.toFixed(2)} m
        </span>
        {foraDeFaixa.length>0 && (
          <span style={{marginLeft:"auto",background:C.dangerLight+"22",border:`1px solid ${C.dangerLight}55`,
            color:C.dangerLight,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:800}}>
            ⚠ {foraDeFaixa.length} fora
          </span>
        )}
      </div>
      <div style={{display:"flex",gap:8}}>
        {linhas.map(({l,v}) => {
          const c = corAlt(v);
          const dentro = v!==null && v>=ALT_MIN && v<=ALT_MAX;
          return (
            <div key={l} style={{
              flex:1,
              background: dentro?"rgba(0,230,118,0.06)":v!==null?"rgba(192,39,45,0.12)":"rgba(255,255,255,0.03)",
              border:`1px solid ${c}33`,borderRadius:8,padding:"10px 4px",textAlign:"center"
            }}>
              <div style={{fontSize:9,color:C.textDim,letterSpacing:"0.1em",marginBottom:4}}>{l}</div>
              <div style={{fontFamily:"monospace",fontSize:15,fontWeight:900,color:c}}>
                {v!==null ? v.toFixed(2) : "—"}
              </div>
              {v!==null && (
                <div style={{fontSize:8,color:c,marginTop:2}}>
                  {dentro ? "✓ ok" : v<ALT_MIN ? "↓ baixa" : "↑ alta"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PainelCard>
  );
}

// ── Painel 6 · Semáforo Operacional ────────────────────────────────────────
function PainelSemaforo({ ocorrencias, setTela }) {
  const oc = ocorrencias || {M2:null,M3:null};

  function StatusMaq({ mq, ocr }) {
    const cor = !ocr ? C.accentLight : ocr.cor==="vermelho" ? C.dangerLight : C.warningLight;
    const emoji = !ocr ? "🟢" : ocr.cor==="vermelho" ? "🔴" : "🟡";
    const label = !ocr ? "Normal" : ocr.motivo || (ocr.cor==="vermelho"?"Crítico":"Atenção");
    return (
      <div style={{flex:1,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"14px 10px",textAlign:"center"}}>
        <div style={{fontSize:9,color:C.textDim,letterSpacing:"0.1em",marginBottom:6}}>{mq}</div>
        <div style={{fontSize:28,marginBottom:6}}>{emoji}</div>
        <div style={{fontSize:11,fontWeight:800,color:cor,lineHeight:1.3,minHeight:28}}>{label}</div>
        {ocr?.hora && <div style={{fontSize:9,color:C.textDim,marginTop:4,fontFamily:"monospace"}}>{ocr.hora}</div>}
      </div>
    );
  }

  const ocMaisCrit = (oc.M2?.cor==="vermelho"||oc.M3?.cor==="vermelho") ? "vermelho"
    : (oc.M2?.cor==="amarelo"||oc.M3?.cor==="amarelo") ? "amarelo" : null;
  const corTopo = !ocMaisCrit ? C.accentLight : ocMaisCrit==="vermelho" ? C.dangerLight : C.warningLight;

  return (
    <PainelCard title="Estado Operacional" icon="🚦" corTopo={corTopo} onClick={()=>setTela("dashboard")} alerta={ocMaisCrit==="vermelho"}>
      <div style={{display:"flex",gap:16,marginTop:8}}>
        <StatusMaq mq="M2" ocr={oc.M2} />
        <StatusMaq mq="M3" ocr={oc.M3} />
      </div>
      <div style={{fontSize:10,color:C.textDim,textAlign:"center",marginTop:4}}>
        Clique no 🚦 do app para atualizar
      </div>
    </PainelCard>
  );
}

// ── DashboardTV principal ──────────────────────────────────────────────────
export default function DashboardTV({ setTela, setModoVisao }) {
  const [ocorrencias, setOcorrencias] = React.useState(() => storageGet("ocorrencias_h2")||{M2:null,M3:null});
  const [chamados,    setChamados]    = React.useState(() => storageGet("chamados_h2")||[]);
  const [cleaners,    setCleaners]    = React.useState(() => storageGet("cleaners_h2")||{M2:{},M3:{}});
  const [historico,   setHistorico]   = React.useState(() => storageGet("historico_h2")||[]);
  const [pendencias,  setPendencias]  = React.useState(() => storageGet("pendencias_h2")||[]);

  React.useEffect(() => {
    const unsubs = [
      onSnapshot(doc(COL,"ocorrencias_h2"), s => { if(s.exists()&&s.data().val) setOcorrencias(s.data().val); }),
      onSnapshot(doc(COL,"chamados_h2"),    s => { if(s.exists()&&s.data().val) setChamados(s.data().val); }),
      onSnapshot(doc(COL,"cleaners_h2"),    s => { if(s.exists()&&s.data().val) setCleaners(s.data().val); }),
      onSnapshot(doc(COL,"historico_h2"),   s => { if(s.exists()&&s.data().val) setHistorico(s.data().val); }),
      onSnapshot(doc(COL,"pendencias_h2"),  s => { if(s.exists()&&s.data().val) setPendencias(s.data().val); }),
    ];
    return () => unsubs.forEach(u=>u());
  }, []);

  return (
    <div style={{
      background:C.bg, minHeight:"100vh", minWidth:"100vw",
      fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.text,
      display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <style>{`
        @keyframes led-pulse-d {
          0%,100%{opacity:1;box-shadow:0 0 6px #00E676,0 0 12px #00E67688;}
          50%{opacity:.55;box-shadow:0 0 3px #00E676,0 0 6px #00E67644;}
        }
        .led-d{animation:led-pulse-d 2.5s ease-in-out infinite;}
      `}</style>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 28px", borderBottom:`1px solid ${C.border}`,
        background:"rgba(7,24,40,0.95)", backdropFilter:"blur(20px)",
        flexShrink:0,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:C.accentLight}} className="led-d"/>
            <span style={{fontSize:11,color:C.textMuted,letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:700}}>SECAGEM · H2</span>
          </div>
          <div style={{width:1,height:24,background:C.border}}/>
          <span style={{fontSize:13,fontWeight:800,color:C.text}}>Dashboard Operacional</span>
        </div>

        <Relogio />

        <button
          onClick={() => setModoVisao("app")}
          style={{
            background:"rgba(80,144,255,0.12)",
            border:`1px solid ${C.blueLight}55`,
            color:C.blueLight, borderRadius:9,
            padding:"8px 16px", cursor:"pointer",
            fontSize:12, fontWeight:800,
          }}
        >
          📱 Modo App
        </button>
      </div>

      {/* ── Grid 3×2 ──────────────────────────────────────────────── */}
      <div style={{
        flex:1, display:"grid",
        gridTemplateColumns:"1fr 1fr 1fr",
        gridTemplateRows:"1fr 1fr",
        gap:16, padding:20,
        overflow:"hidden",
      }}>
        <PainelMural     pendenciasData={pendencias} chamadosData={chamados} setTela={setTela} />
        <PainelChamados  chamadosData={chamados} setTela={setTela} />
        <PainelCleaners  cleanersData={cleaners}  setTela={setTela} />
        <PainelChecklists historicoData={historico} setTela={setTela} />
        <PainelAlturaUnits historicoData={historico} setTela={setTela} />
        <PainelSemaforo  ocorrencias={ocorrencias} setTela={setTela} />
      </div>
    </div>
  );
}
