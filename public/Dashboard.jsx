// ═══════════════════════════════════════════════════════════════════════════
// Dashboard.jsx — CENTRO DE COMANDO H2 · Secagem · Suzano
// Painel de operacao futurista. Logica de dados preservada; visual reconstruido.
// ═══════════════════════════════════════════════════════════════════════════
import * as React from "react";
import { COL, doc, onSnapshot, setDoc } from "./firebase";
import { CarrosselViewer } from "./carrossel";

const C = {
  void:"#020A12", deep:"#04111D", panel:"#071826", panelHi:"#0A2032",
  line:"rgba(0,230,118,0.12)", lineHi:"rgba(0,230,118,0.28)",
  green:"#00E676", greenDim:"#00A152", cyan:"#00F0FF", blue:"#5090FF",
  purple:"#C77DFF", amber:"#FFC107", orange:"#FF8C00", red:"#FF5252",
  ink:"#FFFFFF", mute:"#9FB4CC", dim:"#41597A", faint:"#22344B",
};
const mono = "'SF Mono','Roboto Mono',ui-monospace,monospace";
const sans = "'Inter','Segoe UI',system-ui,sans-serif";

const sGet = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const sSet = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} try { setDoc(doc(COL,k),{val:v,ts:Date.now()}); } catch {} };
const hojeISO = () => new Date().toISOString().slice(0,10);
const mesISO = () => new Date().toISOString().slice(0,7);
const autoTurno = () => { const h=new Date().getHours(); if(h<8)return"00x08"; if(h<16)return"08x16"; return"16x24"; };
const parseAlt = (v) => { if(!v)return null; const n=parseFloat(String(v).replace(",",".")); return isNaN(n)?null:n; };
const diffDias = (iso) => { if(!iso)return null; const d=new Date(iso+"T00:00:00"); const h=new Date(); h.setHours(0,0,0,0); return Math.floor((h-d)/864e5); };

const CLN_TOTAL = 24, CLN_LIM = 70;
const ALT_MIN = 1.88, ALT_MAX = 1.92, ALT_TGT = 1.90;
const LINHAS = ["L4","L5","L6","L7","L8"];
const PRAZO_COR = { Imediato:"#FF5252", Urgente:"#FF8C00", Normal:"#FFC107", "Programavel":"#5090FF", "Programável":"#5090FF" };
const TIPOS_AV = [
  { id:"alt_linha",    label:"Diferenca de altura", cor:"#5090FF" },
  { id:"capa_rasgada", label:"Capa rasgada",        cor:"#FF5252" },
  { id:"sem_capa",     label:"Faltando capa",       cor:"#FF8C00" },
  { id:"arame_esp",    label:"Arame espacado",      cor:"#FFC107" },
  { id:"arame_cod",    label:"Arame sobre codigo",  cor:"#C77DFF" },
  { id:"sem_imp",      label:"Falta de impressao",  cor:"#00F0FF" },
  { id:"sem_logo",     label:"Unit sem logo",       cor:"#00E676" },
];
const jReg = (area) => { const a=(area||"").toLowerCase(); if(a==="cortadeira"||a==="cs"||a==="secador")return"cs"; if(a==="enfardamento"||a==="enf")return"enf"; if(a==="cleaners")return"clean"; return"pu"; };
const pct = (n,d) => d>0?Math.round(n/d*100):0;
function bezier(pts){ if(pts.length<2)return""; const p=pts.map(s=>{const[x,y]=s.split(",").map(Number);return{x,y};}); let d=`M${p[0].x},${p[0].y}`; for(let i=1;i<p.length;i++){const c=(p[i-1].x+p[i].x)/2;d+=` C${c},${p[i-1].y} ${c},${p[i].y} ${p[i].x},${p[i].y}`;} return d; }

// ── animacoes globais ──
const GlobalFX = () => (
  <style>{`
    @keyframes cmd-pulse{0%,100%{opacity:1}50%{opacity:.45}}
    @keyframes cmd-ring{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.6);opacity:0}}
    @keyframes cmd-scan{0%{transform:translateY(-100%)}100%{transform:translateY(2400%)}}
    @keyframes cmd-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    @keyframes cmd-marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @keyframes cmd-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    .cmd-card{position:relative;background:linear-gradient(160deg,rgba(10,32,50,.55),rgba(7,24,38,.82));backdrop-filter:blur(14px);border-radius:16px;overflow:hidden;border:1px solid rgba(0,230,118,.1)}
    .cmd-card::after{content:'';position:absolute;inset:0;border-radius:16px;padding:1px;background:linear-gradient(140deg,rgba(0,230,118,.4),rgba(0,230,118,.03) 45%,transparent 75%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
    .cmd-corner{position:absolute;width:9px;height:9px;pointer-events:none;z-index:2}
  `}</style>
);

const Corners = ({c=C.green}) => (
  <>
    <div className="cmd-corner" style={{top:7,left:7,borderTop:`1.5px solid ${c}55`,borderLeft:`1.5px solid ${c}55`}}/>
    <div className="cmd-corner" style={{top:7,right:7,borderTop:`1.5px solid ${c}55`,borderRight:`1.5px solid ${c}55`}}/>
    <div className="cmd-corner" style={{bottom:7,left:7,borderBottom:`1.5px solid ${c}55`,borderLeft:`1.5px solid ${c}55`}}/>
    <div className="cmd-corner" style={{bottom:7,right:7,borderBottom:`1.5px solid ${c}55`,borderRight:`1.5px solid ${c}55`}}/>
  </>
);

const PanelHead = ({ code, title, accent=C.green, right }) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
    <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
      <span style={{fontFamily:mono,fontSize:9,fontWeight:700,color:accent,opacity:.65,letterSpacing:"0.1em"}}>{code}</span>
      <span style={{width:3,height:3,borderRadius:"50%",background:accent,boxShadow:`0 0 5px ${accent}`}}/>
      <span style={{fontFamily:sans,fontSize:10.5,fontWeight:800,color:C.mute,letterSpacing:"0.16em",textTransform:"uppercase",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{title}</span>
    </div>
    {right}
  </div>
);

// ── Gauge radial ──
function RadialGauge({ value, max=100, size=120, stroke=9, color, label, sub="", danger=false, idk="g" }) {
  const r = (size-stroke)/2 - 4;
  const circ = 2*Math.PI*r;
  const frac = Math.max(0,Math.min(1,value/max));
  const arc = circ*0.75;
  const fill = arc*frac;
  const rot = 135;
  return (
    <div style={{position:"relative",width:size,height:size}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`gg${idk}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.45"/><stop offset="100%" stopColor={color}/>
          </linearGradient>
          <filter id={`gf${idk}`}><feGaussianBlur stdDeviation="2.5"/></filter>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)"
          strokeWidth={stroke} strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"
          transform={`rotate(${rot} ${size/2} ${size/2})`}/>
        {Array.from({length:28}).map((_,i)=>{
          const a=(rot+i*(270/27))*Math.PI/180;
          const x1=size/2+Math.cos(a)*(r+stroke/2+1.5), y1=size/2+Math.sin(a)*(r+stroke/2+1.5);
          const x2=size/2+Math.cos(a)*(r+stroke/2+4.5), y2=size/2+Math.sin(a)*(r+stroke/2+4.5);
          const on=i/27<=frac;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={on?color:C.faint} strokeWidth="1" opacity={on?0.65:0.28}/>;
        })}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" opacity="0.45"
          filter={`url(#gf${idk})`} transform={`rotate(${rot} ${size/2} ${size/2})`}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#gg${idk})`} strokeWidth={stroke}
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          transform={`rotate(${rot} ${size/2} ${size/2})`}
          style={{transition:"stroke-dasharray .8s cubic-bezier(.4,0,.2,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontFamily:mono,fontSize:size*0.27,fontWeight:900,color:danger?C.red:C.ink,lineHeight:1,textShadow:`0 0 16px ${color}99`}}>
          {value}<span style={{fontSize:size*0.13,color:C.dim}}>{sub}</span>
        </span>
        {label&&<span style={{fontFamily:sans,fontSize:8,color:C.dim,letterSpacing:"0.12em",marginTop:3,textTransform:"uppercase"}}>{label}</span>}
      </div>
    </div>
  );
}

const Delta = ({ v, invert=false }) => {
  if(v===0||v==null) return <span style={{fontFamily:mono,fontSize:9,color:C.dim}}>—</span>;
  const up=v>0, good=invert?!up:up, c=good?C.green:C.red;
  return <span style={{fontFamily:mono,fontSize:9,fontWeight:700,color:c}}>{up?"↑":"↓"}{Math.abs(v)}</span>;
};

function Spark({ data, color=C.green, w=70, h=22, fill=true, idk="sp" }) {
  if(!data||data.length<2) return <div style={{width:w,height:h}}/>;
  const mn=Math.min(...data), mx=Math.max(...data), rng=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/rng)*h}`);
  const line=bezier(pts), area=line+` L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} style={{display:"block",overflow:"visible"}}>
      <defs><linearGradient id={idk} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.28"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      {fill&&<path d={area} fill={`url(#${idk})`}/>}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"
        style={{filter:`drop-shadow(0 0 3px ${color}aa)`}}/>
      <circle cx={w} cy={h-((data[data.length-1]-mn)/rng)*h} r="2" fill={color} style={{filter:`drop-shadow(0 0 4px ${color})`}}/>
    </svg>
  );
}

// ════════ RELOGIO / STATUS BAR ════════
function CmdClock() {
  const [now,setNow]=React.useState(new Date());
  React.useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t);},[]);
  const hh=String(now.getHours()).padStart(2,"0"), mm=String(now.getMinutes()).padStart(2,"0"), ss=String(now.getSeconds()).padStart(2,"0");
  const dataFmt=now.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}).toUpperCase().replace(".","");
  return (
    <div style={{display:"flex",alignItems:"center",gap:14}}>
      <div style={{textAlign:"right"}}>
        <div style={{fontFamily:mono,fontSize:9,color:C.dim,letterSpacing:"0.1em"}}>{dataFmt}</div>
        <div style={{fontFamily:mono,fontSize:9,color:C.green,letterSpacing:"0.1em"}}>TURNO {autoTurno()}</div>
      </div>
      <div style={{fontFamily:mono,fontSize:30,fontWeight:900,color:C.green,letterSpacing:"0.04em",textShadow:`0 0 20px ${C.green}77`,lineHeight:1}}>
        {hh}<span style={{animation:"cmd-pulse 1s infinite"}}>:</span>{mm}<span style={{fontSize:16,color:C.dim}}>:{ss}</span>
      </div>
    </div>
  );
}

// ════════ BANNER HEROI: SEGURANCA + EFICIENCIA GLOBAL ════════
function HeroBar({ historico, seguranca, cleaners, cleanersHist, avarias, onEditAcid }) {
  // dias sem quebra
  const diasQuebra=(mq)=>{const r=historico.filter(h=>(h.tipoId==="passagem_ponta"||h.tipoId==="passagem_ponta_cs")&&h.maquina===mq&&h.data).sort((a,b)=>b.data.localeCompare(a.data));return r.length?diffDias(r[0].data):null;};
  const dM2=diasQuebra("M2"), dM3=diasQuebra("M3");
  const dAcid=seguranca?.diasAcidente??null;
  // eficiencia cleaners global
  const foraM2=Object.keys(cleaners?.M2||{}).length, foraM3=Object.keys(cleaners?.M3||{}).length;
  const eficGlobal=Math.round(((CLN_TOTAL*2)-(foraM2+foraM3))/(CLN_TOTAL*2)*100);
  // avarias mes
  const avMes=(avarias||[]).filter(r=>r.data?.slice(0,7)===mesISO()&&r.teveAvaria).reduce((s,r)=>s+r.total,0);

  const Metric=({val,unit,label,color,glyph,onClick,pulse})=>(
    <div onClick={onClick} style={{flex:1,display:"flex",alignItems:"center",gap:12,padding:"0 18px",cursor:onClick?"pointer":"default",position:"relative"}}>
      <div style={{position:"relative",width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <svg width="42" height="42" style={{position:"absolute",inset:0}}>
          <circle cx="21" cy="21" r="18" fill="none" stroke={`${color}22`} strokeWidth="2"/>
          <circle cx="21" cy="21" r="18" fill="none" stroke={color} strokeWidth="2" strokeDasharray="85 200" strokeLinecap="round" transform="rotate(-90 21 21)" style={{filter:`drop-shadow(0 0 3px ${color})`}}/>
        </svg>
        <span style={{filter:`drop-shadow(0 0 5px ${color}aa)`}}>{glyph}</span>
        {pulse&&<span style={{position:"absolute",inset:0,borderRadius:"50%",border:`1.5px solid ${color}`,animation:"cmd-ring 1.6s ease-out infinite"}}/>}
      </div>
      <div style={{minWidth:0}}>
        <div style={{display:"flex",alignItems:"baseline",gap:3}}>
          <span style={{fontFamily:mono,fontSize:30,fontWeight:900,color,lineHeight:1,textShadow:`0 0 16px ${color}66`}}>{val??"--"}</span>
          <span style={{fontFamily:mono,fontSize:11,color:C.dim}}>{unit}</span>
        </div>
        <div style={{fontFamily:sans,fontSize:8.5,color:C.dim,letterSpacing:"0.1em",textTransform:"uppercase",marginTop:2,whiteSpace:"nowrap"}}>{label}</div>
      </div>
    </div>
  );
  const Sep=()=>(<div style={{width:1,alignSelf:"stretch",margin:"10px 0",background:`linear-gradient(180deg,transparent,${C.line},transparent)`}}/>);

  const cAcid=dAcid==null?C.dim:dAcid>30?C.green:dAcid>7?C.amber:C.red;
  const cM2=dM2==null?C.dim:dM2>14?C.green:dM2>3?C.amber:C.red;
  const cM3=dM3==null?C.dim:dM3>14?C.green:dM3>3?C.amber:C.red;
  const cEf=eficGlobal>=90?C.green:eficGlobal>=CLN_LIM?C.amber:C.red;
  const cAv=avMes===0?C.green:avMes<=10?C.amber:C.red;

  // glyphs SVG geometricos (sem emoji)
  const GShield=(c)=>(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5z"/></svg>);
  const GGear=(c)=>(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>);
  const GDrop=(c)=>(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.5c-3.5 4-6 7-6 10a6 6 0 0 0 12 0c0-3-2.5-6-6-10z"/></svg>);
  const GBox=(c)=>(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>);

  return (
    <div className="cmd-card" style={{display:"flex",alignItems:"stretch",height:74,flexShrink:0,margin:"0 0 12px"}}>
      <Corners/>
      <Metric val={dAcid} unit="dias" label="Sem Acidente" color={cAcid} glyph={GShield(cAcid)} onClick={onEditAcid}/>
      <Sep/>
      <Metric val={dM2} unit="dias" label="Sem Quebra M2" color={cM2} glyph={GGear(cM2)}/>
      <Sep/>
      <Metric val={dM3} unit="dias" label="Sem Quebra M3" color={cM3} glyph={GGear(cM3)}/>
      <Sep/>
      <Metric val={eficGlobal} unit="%" label="Eficiencia Cleaners" color={cEf} glyph={GDrop(cEf)} pulse={eficGlobal<CLN_LIM}/>
      <Sep/>
      <Metric val={avMes} unit="" label="Avarias no Mes" color={cAv} glyph={GBox(cAv)} pulse={avMes>10}/>
    </div>
  );
}

// ════════ PAINEL: MURAL (radial multi-anel) ════════
function PanelMural({ pendencias, chamados, setTela }) {
  const pend=Array.isArray(pendencias)?pendencias:[];
  const chA=Array.isArray(chamados)?chamados.filter(c=>c.status==="aberto"):[];
  const cnt={pu:0,clean:0,cs:0,enf:0};
  pend.forEach(p=>{if(p.multiJanela)p.multiJanela.forEach(j=>{if(cnt[j]!==undefined)cnt[j]++;});else{const j=p.janela||jReg(p.area);if(cnt[j]!==undefined)cnt[j]++;}});
  chA.forEach(c=>{const j=jReg(c.area);if(cnt[j]!==undefined)cnt[j]++;});
  const total=Object.values(cnt).reduce((a,b)=>a+b,0);
  // severidade
  let nC=0,nM=0,nB=0; const cl=(pz)=>{const p=(pz||"").toLowerCase();if(p==="imediato"||p==="urgente")nC++;else if(p==="normal")nM++;else nB++;};
  pend.forEach(p=>cl(p.prazo)); chA.forEach(c=>cl(c.prazo));
  const cCenter=nC>0?C.red:nM>0?C.amber:C.green;
  const areas=[{id:"pu",l:"P.UMIDA",c:C.green},{id:"clean",l:"CLEANERS",c:C.cyan},{id:"cs",l:"SEC/CORT",c:C.blue},{id:"enf",l:"ENFARD.",c:C.purple}];
  // aneis concentricos
  const cx=72,cy=72; const rings=[54,44,34,24];
  return (
    <div className="cmd-card" style={{padding:16,display:"flex",flexDirection:"column"}}>
      <Corners c={cCenter}/>
      <PanelHead code="01" title="Mural de Oportunidades" accent={cCenter}
        right={<span style={{fontFamily:mono,fontSize:9,color:C.dim}}>{total} ABERTAS</span>}/>
      <div style={{display:"flex",gap:14,flex:1}}>
        {/* aneis */}
        <div style={{position:"relative",width:144,height:144,flexShrink:0}}>
          <svg width="144" height="144" viewBox="0 0 144 144">
            {areas.map((a,i)=>{
              const v=cnt[a.id], frac=total>0?v/total:0, r=rings[i], circ=2*Math.PI*r;
              return (
                <g key={a.id}>
                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6"/>
                  <circle cx={cx} cy={cy} r={r} fill="none" stroke={a.c} strokeWidth="6"
                    strokeDasharray={`${frac*circ} ${circ}`} strokeLinecap="round"
                    transform={`rotate(-90 ${cx} ${cy})`}
                    style={{filter:`drop-shadow(0 0 4px ${a.c}aa)`,transition:"stroke-dasharray .7s"}}/>
                </g>
              );
            })}
            <text x={cx} y={cy-2} textAnchor="middle" fontFamily={mono} fontSize="32" fontWeight="900" fill={cCenter} style={{filter:`drop-shadow(0 0 10px ${cCenter})`}}>{total}</text>
            <text x={cx} y={cy+14} textAnchor="middle" fontFamily={sans} fontSize="7" fill={C.dim} letterSpacing="2">PENDENCIAS</text>
          </svg>
        </div>
        {/* legenda + severidade */}
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:7}}>
          {areas.map(a=>{
            const v=cnt[a.id], w=total>0?Math.round(v/total*100):0;
            return (
              <div key={a.id} style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{width:6,height:6,borderRadius:2,background:a.c,boxShadow:v>0?`0 0 5px ${a.c}`:"none",flexShrink:0}}/>
                <span style={{fontFamily:sans,fontSize:9,color:C.mute,minWidth:54}}>{a.l}</span>
                <div style={{flex:1,height:3,borderRadius:2,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${w}%`,background:a.c,borderRadius:2,boxShadow:v>0?`0 0 4px ${a.c}`:"none",transition:"width .6s"}}/>
                </div>
                <span style={{fontFamily:mono,fontSize:11,fontWeight:900,color:v>0?a.c:C.dim,minWidth:14,textAlign:"right"}}>{v}</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* severidade rodape */}
      <div style={{display:"flex",gap:8,marginTop:12,paddingTop:10,borderTop:`1px solid ${C.line}`}}>
        {[{n:nC,l:"CRITICAS",c:C.red},{n:nM,l:"MEDIAS",c:C.amber},{n:nB,l:"BAIXAS",c:C.green}].map(s=>(
          <div key={s.l} onClick={()=>setTela&&setTela("mural")} style={{flex:1,cursor:"pointer",textAlign:"center",padding:"6px 0",borderRadius:8,background:`${s.c}0c`,border:`1px solid ${s.c}22`}}>
            <div style={{fontFamily:mono,fontSize:20,fontWeight:900,color:s.n>0?s.c:C.dim,lineHeight:1,textShadow:s.n>0?`0 0 10px ${s.c}66`:"none"}}>{s.n}</div>
            <div style={{fontFamily:sans,fontSize:7,color:C.dim,letterSpacing:"0.1em",marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════ PAINEL: CLEANERS (duplo gauge + sedimentaveis) ════════
function PanelCleaners({ cleaners, cleanersHist, sedim, setTela }) {
  const dados=cleaners||{M2:{},M3:{}};
  const hist=Array.isArray(cleanersHist)?cleanersHist:[];
  const sed=Array.isArray(sedim)?sedim:[];
  // spark por maquina
  const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return d.toISOString().slice(0,10);});
  const sparkMq=(mq)=>{const snap={};const sorted=[...hist].sort((a,b)=>(a.data+(a.hora||"00:00")).localeCompare(b.data+(b.hora||"00:00")));return days.map(d=>{sorted.filter(e=>e.data===d&&e.maquina===mq).forEach(e=>{if(e.status==="REMOVIDA")snap[e.garrafa]=1;else delete snap[e.garrafa];});return Math.round((CLN_TOTAL-Object.keys(snap).length)/CLN_TOTAL*100);});};
  const MqGauge=({mq,idk})=>{
    const fora=Object.keys(dados[mq]||{}).length, op=CLN_TOTAL-fora, efic=Math.round(op/CLN_TOTAL*100);
    const c=efic>=90?C.green:efic>=CLN_LIM?C.amber:C.red;
    const sp=sparkMq(mq);
    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
        <RadialGauge value={efic} size={104} stroke={8} color={c} label={`MAQUINA ${mq.replace("M","")}`} sub="%" idk={idk}/>
        <div style={{display:"flex",gap:10,fontFamily:mono,fontSize:10}}>
          <span style={{color:C.green}}>{op}<span style={{color:C.dim,fontSize:8}}>op</span></span>
          <span style={{color:fora>0?C.amber:C.dim}}>{fora}<span style={{color:C.dim,fontSize:8}}>fora</span></span>
        </div>
        <div style={{width:"100%",background:"rgba(255,255,255,0.03)",borderRadius:6,padding:"4px 6px",display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontFamily:mono,fontSize:7,color:C.dim}}>7D</span>
          <div style={{flex:1}}><Spark data={sp} color={c} w={68} h={18} idk={"clsp"+idk}/></div>
          <span style={{fontFamily:mono,fontSize:9,fontWeight:900,color:c}}>{sp[sp.length-1]}%</span>
        </div>
      </div>
    );
  };
  const lastSed=sed.length>0?sed[sed.length-1]:null;
  const cSed=lastSed?(lastSed.valor<150?C.green:lastSed.valor<=250?C.amber:C.red):C.dim;

  // Top 3 motivos — garrafas atualmente fora (M2+M3), do estado atual
  const motCont={};
  ["M2","M3"].forEach(mq=>{
    Object.values(dados[mq]||{}).forEach(g=>{
      const ms=g?.motivos||(g?.motivo?[g.motivo]:[]);
      ms.filter(Boolean).forEach(m=>{motCont[m]=(motCont[m]||0)+1;});
    });
  });
  const top3Mot=Object.entries(motCont).map(([m,n])=>({m,n})).sort((a,b)=>b.n-a.n).slice(0,3);
  const maxMot=Math.max(1,...top3Mot.map(t=>t.n));
  const motCor=(m)=>m==="Válvula com passagem"?C.red:m==="Entupida"?C.orange:m.startsWith("Falta")?C.amber:C.cyan;

  return (
    <div className="cmd-card" style={{padding:16,display:"flex",flexDirection:"column"}}>
      <Corners c={C.cyan}/>
      <PanelHead code="02" title="Cleaners" accent={C.cyan}
        right={lastSed?<span style={{fontFamily:mono,fontSize:9,color:cSed,background:`${cSed}18`,border:`1px solid ${cSed}33`,borderRadius:12,padding:"2px 8px"}}>SED {lastSed.valor} mL/L</span>:null}/>
      <div style={{display:"flex",gap:12}}>
        <MqGauge mq="M2" idk="cm2"/>
        <div style={{width:1,background:`linear-gradient(180deg,transparent,${C.line},transparent)`}}/>
        <MqGauge mq="M3" idk="cm3"/>
      </div>
      {/* Top 3 motivos de retirada */}
      <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${C.line}`,flex:1}}>
        <div style={{fontFamily:sans,fontSize:8,color:C.dim,letterSpacing:"0.12em",marginBottom:8}}>PRINCIPAIS MOTIVOS · FORA DE OP.</div>
        {top3Mot.length>0?top3Mot.map((t,i)=>(
          <div key={t.m} style={{marginBottom:i<top3Mot.length-1?7:0}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
              <span style={{fontFamily:sans,fontSize:9,color:C.mute}}><span style={{fontFamily:mono,color:C.dim,marginRight:5}}>{i+1}</span>{t.m}</span>
              <span style={{fontFamily:mono,fontSize:11,fontWeight:900,color:motCor(t.m)}}>{t.n}</span>
            </div>
            <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.04)",overflow:"hidden"}}>
              <div style={{height:"100%",width:`${t.n/maxMot*100}%`,background:motCor(t.m),borderRadius:2,boxShadow:`0 0 5px ${motCor(t.m)}`,transition:"width .6s"}}/>
            </div>
          </div>
        )):(
          <div style={{textAlign:"center",color:C.dim,fontFamily:sans,fontSize:10,padding:"8px 0"}}>Nenhuma garrafa fora de operação</div>
        )}
      </div>
    </div>
  );
}

// ════════ PAINEL: ALTURA UNITS (colunas verticais estilo equalizador) ════════
function PanelAltura({ historico, setTela }) {
  const hist=Array.isArray(historico)?historico:[];
  const ult={};
  [...hist].sort((a,b)=>b.id-a.id).filter(h=>h.tipoId==="enf_qualidade").forEach(r=>{const ln=r.linha||r.maquina;if(ln&&!ult[ln]){const it=r.items?.find(i=>i.id==="enf_14");const v=it?parseAlt(it.resp):null;if(v!=null)ult[ln]=v;}});
  const dados=LINHAS.map(l=>({l,v:ult[l]??null}));
  const comV=dados.filter(d=>d.v!=null);
  const fora=comV.filter(d=>d.v<ALT_MIN||d.v>ALT_MAX);
  const cTop=comV.length===0?C.dim:fora.length>0?C.red:C.green;
  const vMin=1.84,vMax=1.96,vRng=vMax-vMin;
  const H=110;
  const yOf=(v)=>H-((v-vMin)/vRng)*H;
  const yTgt=yOf(ALT_TGT), yMin=yOf(ALT_MIN), yMax=yOf(ALT_MAX);
  return (
    <div className="cmd-card" style={{padding:16,display:"flex",flexDirection:"column"}}>
      <Corners c={cTop}/>
      <PanelHead code="03" title="Altura das Units" accent={cTop}
        right={<span style={{fontFamily:mono,fontSize:9,color:C.dim}}>ALVO {ALT_TGT.toFixed(2)}m</span>}/>
      <div onClick={()=>setTela&&setTela("historico")} style={{flex:1,display:"flex",alignItems:"flex-end",gap:10,cursor:"pointer",position:"relative",paddingTop:6}}>
        {/* faixa alvo */}
        <div style={{position:"absolute",left:0,right:0,top:yMax+6,height:yMin-yMax,background:`${C.green}0c`,borderTop:`1px dashed ${C.green}44`,borderBottom:`1px dashed ${C.green}44`,pointerEvents:"none",zIndex:0}}/>
        {dados.map((d,i)=>{
          const dentro=d.v!=null&&d.v>=ALT_MIN&&d.v<=ALT_MAX;
          const c=d.v==null?C.faint:dentro?C.green:C.red;
          const barH=d.v!=null?Math.max(8,H-yOf(d.v)):4;
          return (
            <div key={d.l} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5,position:"relative",zIndex:1}}>
              {d.v!=null&&<span style={{fontFamily:mono,fontSize:11,fontWeight:900,color:c,textShadow:`0 0 8px ${c}88`}}>{d.v.toFixed(2)}</span>}
              {d.v==null&&<span style={{fontFamily:mono,fontSize:10,color:C.dim}}>--</span>}
              <div style={{width:"100%",maxWidth:34,height:barH,borderRadius:"4px 4px 2px 2px",
                background:`linear-gradient(180deg,${c},${c}44)`,
                boxShadow:d.v!=null?`0 0 12px ${c}66, inset 0 1px 0 ${c}`:"none",
                border:`1px solid ${c}66`,position:"relative",transition:"height .6s",transformOrigin:"bottom"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:c,borderRadius:2,boxShadow:`0 0 6px ${c}`}}/>
              </div>
              <span style={{fontFamily:sans,fontSize:9,fontWeight:700,color:dentro?C.mute:c,letterSpacing:"0.05em"}}>{d.l}</span>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontFamily:mono,fontSize:7.5,color:C.dim}}>
        <span>TOLERANCIA {ALT_MIN}-{ALT_MAX}m</span>
        {fora.length>0?<span style={{color:C.red}}>{fora.length} FORA DA FAIXA</span>:<span style={{color:C.green}}>TODAS OK</span>}
      </div>
    </div>
  );
}

// ════════ PAINEL: AVARIAS (heatmap turnos + top3 + total) ════════
function PanelAvarias({ avarias, setTela }) {
  const dados=Array.isArray(avarias)?avarias:[];
  const mes=mesISO();
  const totalMes=dados.filter(r=>r.data?.slice(0,7)===mes&&r.teveAvaria).reduce((s,r)=>s+r.total,0);
  // heatmap: 7 dias x 3 turnos
  const dias=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return d.toISOString().slice(0,10);});
  const letras=["A","B","C"];
  const cell=(d,lt)=>dados.filter(r=>r.data===d&&r.letra===lt&&r.teveAvaria).reduce((a,r)=>a+r.total,0);
  const allVals=[]; dias.forEach(d=>letras.forEach(lt=>allVals.push(cell(d,lt))));
  const maxCell=Math.max(1,...allVals);
  const heatColor=(v)=>{if(v===0)return"rgba(255,255,255,0.03)";const t=v/maxCell;if(t<=0.33)return`rgba(255,193,7,${0.25+t})`;if(t<=0.66)return`rgba(255,140,0,${0.4+t*0.3})`;return`rgba(255,82,82,${0.5+t*0.4})`;};
  // top3
  const ct={}; TIPOS_AV.forEach(t=>ct[t.id]=0);
  dados.filter(r=>r.data?.slice(0,7)===mes&&r.teveAvaria).forEach(r=>r.itens?.forEach(it=>{if(ct[it.id]!==undefined)ct[it.id]+=it.quantidade;}));
  const top3=TIPOS_AV.map(t=>({...t,total:ct[t.id]})).sort((a,b)=>b.total-a.total).slice(0,3);
  const maxTop=Math.max(1,...top3.map(t=>t.total));
  const cTop=totalMes===0?C.green:totalMes<=10?C.amber:C.red;
  return (
    <div className="cmd-card" style={{padding:16,display:"flex",flexDirection:"column"}} onClick={()=>setTela&&setTela("historico")}>
      <Corners c={cTop}/>
      <PanelHead code="04" title="Avarias por Turno" accent={cTop}
        right={<span style={{fontFamily:mono,fontSize:18,fontWeight:900,color:cTop,textShadow:`0 0 12px ${cTop}66`}}>{totalMes}<span style={{fontSize:8,color:C.dim}}>/mes</span></span>}/>
      {/* heatmap */}
      <div style={{marginBottom:12}}>
        <div style={{display:"flex",gap:3,marginLeft:18}}>
          {dias.map((d,i)=>(<span key={i} style={{flex:1,textAlign:"center",fontFamily:mono,fontSize:7,color:C.dim}}>{d.slice(8,10)}</span>))}
        </div>
        {letras.map(lt=>(
          <div key={lt} style={{display:"flex",alignItems:"center",gap:3,marginTop:3}}>
            <span style={{width:15,fontFamily:mono,fontSize:9,fontWeight:700,color:C.dim}}>{lt}</span>
            {dias.map((d,i)=>{const v=cell(d,lt);return(
              <div key={i} style={{flex:1,height:18,borderRadius:4,background:heatColor(v),border:`1px solid ${v>0?"rgba(255,82,82,0.3)":C.line}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"background .4s"}}>
                {v>0&&<span style={{fontFamily:mono,fontSize:9,fontWeight:900,color:"#fff",textShadow:"0 0 4px #000"}}>{v}</span>}
              </div>
            );})}
          </div>
        ))}
      </div>
      {/* top3 */}
      <div style={{paddingTop:10,borderTop:`1px solid ${C.line}`,flex:1}}>
        <div style={{fontFamily:sans,fontSize:8,color:C.dim,letterSpacing:"0.12em",marginBottom:8}}>TOP 3 TIPOS</div>
        {top3.map((t,i)=>(
          <div key={t.id} style={{marginBottom:i<2?7:0}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
              <span style={{fontFamily:sans,fontSize:9,color:t.total>0?C.mute:C.dim}}><span style={{fontFamily:mono,color:C.dim,marginRight:5}}>{i+1}</span>{t.label}</span>
              <span style={{fontFamily:mono,fontSize:11,fontWeight:900,color:t.total>0?t.cor:C.dim}}>{t.total}</span>
            </div>
            <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.04)",overflow:"hidden"}}>
              <div style={{height:"100%",width:`${t.total/maxTop*100}%`,background:t.cor,borderRadius:2,boxShadow:t.total>0?`0 0 5px ${t.cor}`:"none",transition:"width .6s"}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════ PAINEL: CHAMADOS (matriz de prazo) ════════
function PanelChamados({ chamados, setTela }) {
  const ch=Array.isArray(chamados)?chamados.filter(c=>c.status==="aberto"):[];
  const byP=(p)=>ch.filter(c=>c.prazo===p).length;
  const prazos=[{k:"Imediato",c:C.red},{k:"Urgente",c:C.orange},{k:"Normal",c:C.amber},{k:"Programavel",c:C.blue}];
  // tratar "Programável" com acento tambem
  const cnt=(k)=>k==="Programavel"?ch.filter(c=>c.prazo==="Programavel"||c.prazo==="Programável").length:byP(k);
  const total=ch.length;
  const nIme=cnt("Imediato");
  const cTop=nIme>0?C.red:cnt("Urgente")>0?C.orange:total>0?C.amber:C.green;
  return (
    <div className="cmd-card" style={{padding:16,display:"flex",flexDirection:"column"}} onClick={()=>setTela&&setTela("equipamentos")}>
      <Corners c={cTop}/>
      <PanelHead code="05" title="Chamados / SAP" accent={cTop}/>
      <div style={{display:"flex",alignItems:"center",gap:14,flex:1}}>
        <div style={{textAlign:"center",flexShrink:0}}>
          <div style={{fontFamily:mono,fontSize:46,fontWeight:900,color:cTop,lineHeight:1,textShadow:`0 0 20px ${cTop}66`}}>{total}</div>
          <div style={{fontFamily:sans,fontSize:8,color:C.dim,letterSpacing:"0.1em",marginTop:2}}>ABERTOS</div>
        </div>
        <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
          {prazos.map(p=>{const n=cnt(p.k);return(
            <div key={p.k} style={{background:`${p.c}0c`,border:`1px solid ${p.c}${n>0?"55":"22"}`,borderRadius:8,padding:"7px 9px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontFamily:sans,fontSize:8,color:C.mute,letterSpacing:"0.05em"}}>{p.k.toUpperCase()}</span>
              <span style={{fontFamily:mono,fontSize:16,fontWeight:900,color:n>0?p.c:C.dim,textShadow:n>0?`0 0 8px ${p.c}66`:"none"}}>{n}</span>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

// ════════ PAINEL: CHECKLISTS (anel de progresso + barras) ════════
function PanelChecklists({ historico, setTela }) {
  const hist=Array.isArray(historico)?historico:[];
  const turno=autoTurno(), hj=hojeISO();
  const ct=hist.filter(h=>h.data===hj&&h.turno===turno);
  const areas=[{a:"pu",t:"rotina",l:"P.UMIDA",mq:["M2","M3"]},{a:"cs",t:"cortadeira",l:"SEC/CORT",mq:["M2","M3"]},{a:"enf",t:"enf_qualidade",l:"ENFARD.",mq:["L4","L5","L6","L7","L8"]}];
  let feito=0,esp=0;
  const blocos=areas.map(ar=>{const e=ar.mq.length;const f=ar.mq.filter(m=>ct.some(h=>h.tipoId===ar.t&&(h.maquina===m||h.linha===m))).length;feito+=f;esp+=e;return{l:ar.l,f,e,mq:ar.mq,t:ar.t};});
  const fracTotal=esp>0?feito/esp:0;
  const cTop=feito===esp?C.green:feito===0?C.red:C.amber;
  return (
    <div className="cmd-card" style={{padding:16,display:"flex",flexDirection:"column"}} onClick={()=>setTela&&setTela("checklist")}>
      <Corners c={cTop}/>
      <PanelHead code="06" title="Checklists do Turno" accent={cTop}
        right={<span style={{fontFamily:mono,fontSize:9,color:C.dim}}>{turno}</span>}/>
      <div style={{display:"flex",gap:14,flex:1,alignItems:"center"}}>
        <RadialGauge value={feito} max={esp} size={100} stroke={8} color={cTop} label="LANCAMENTOS" sub={`/${esp}`} idk="chk"/>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:9}}>
          {blocos.map(b=>(
            <div key={b.l}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontFamily:sans,fontSize:9,color:C.mute}}>{b.l}</span>
                <span style={{fontFamily:mono,fontSize:10,fontWeight:900,color:b.f===b.e?C.green:b.f===0?C.red:C.amber}}>{b.f}/{b.e}</span>
              </div>
              <div style={{display:"flex",gap:3}}>
                {b.mq.map((m,i)=>{const ok=ct.some(h=>h.tipoId===b.t&&(h.maquina===m||h.linha===m));const c=ok?C.green:C.faint;return(
                  <div key={i} style={{flex:1,height:5,borderRadius:3,background:c,boxShadow:ok?`0 0 5px ${c}aa`:"none",transition:"background .4s"}}/>
                );})}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════ PAINEL: TENDENCIA EFICIENCIA (area grande) ════════
function PanelTendencia({ cleanersHist, setTela }) {
  const hist=Array.isArray(cleanersHist)?cleanersHist:[];
  const bounds=[];
  for(let day=0;day<10;day++){const d=new Date();d.setDate(d.getDate()-9+day);const ds=d.toISOString().slice(0,10);for(const h of[8,16,24]){const nd=h===24;const bd=nd?new Date(d.getTime()+864e5).toISOString().slice(0,10):ds;const bh=nd?"00:00":String(h).padStart(2,"0")+":00";bounds.push({ts:bd+"T"+bh,label:ds});}}
  const sorted=[...hist].sort((a,b)=>(a.data+(a.hora||"00:00")).localeCompare(b.data+(b.hora||"00:00")));
  const snap={M2:{},M3:{}};let idx=0;
  const vals=bounds.map(({ts})=>{while(idx<sorted.length){const e=sorted[idx];if((e.data+"T"+(e.hora||"00:00"))>ts)break;if(e.maquina&&snap[e.maquina]){if(e.status==="REMOVIDA")snap[e.maquina][e.garrafa]=1;else delete snap[e.maquina][e.garrafa];}idx++;}const fora=Object.keys(snap.M2||{}).length+Object.keys(snap.M3||{}).length;return Math.round(((CLN_TOTAL*2)-fora)/(CLN_TOTAL*2)*100);});
  const W=560,H=120,PT=10,PB=20,PLOT=H-PT-PB;
  const mn=Math.max(0,Math.min(...vals)-5),mx=Math.min(100,Math.max(...vals)+5),rng=mx-mn||1;
  const xOf=(i)=>(i/(bounds.length-1))*W, yOf=(v)=>PT+PLOT-((v-mn)/rng)*PLOT;
  const pts=vals.map((v,i)=>`${xOf(i)},${yOf(v)}`);
  const line=bezier(pts), area=line+` L${W},${PT+PLOT} L0,${PT+PLOT} Z`;
  const atual=vals[vals.length-1];
  const c=atual>=90?C.green:atual>=CLN_LIM?C.amber:C.red;
  const yLim=yOf(CLN_LIM);
  const dayMarks=bounds.filter((_,i)=>i%3===0);
  return (
    <div className="cmd-card" style={{padding:16,display:"flex",flexDirection:"column"}} onClick={()=>setTela&&setTela("cleaners")}>
      <Corners c={c}/>
      <PanelHead code="07" title="Tendencia de Eficiencia · Cleaners" accent={c}
        right={<span style={{fontFamily:mono,fontSize:20,fontWeight:900,color:c,textShadow:`0 0 12px ${c}66`}}>{atual}%</span>}/>
      <div style={{flex:1,position:"relative"}}>
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:"block"}}>
          <defs>
            <linearGradient id="tendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity="0.3"/><stop offset="100%" stopColor={c} stopOpacity="0.01"/>
            </linearGradient>
          </defs>
          {/* grid horizontal */}
          {[0,25,50,75,100].map(g=>{const y=yOf(g);if(y<PT||y>PT+PLOT)return null;return(<g key={g}><line x1="0" y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/><text x="2" y={y-2} fontFamily={mono} fontSize="7" fill={C.faint}>{g}</text></g>);})}
          {/* limite */}
          {yLim>PT&&yLim<PT+PLOT&&<line x1="0" y1={yLim} x2={W} y2={yLim} stroke={C.amber} strokeWidth="1" strokeDasharray="4,4" opacity="0.5"/>}
          <path d={area} fill="url(#tendFill)"/>
          <path d={line} fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" style={{filter:`drop-shadow(0 0 5px ${c}aa)`}}/>
          <circle cx={xOf(vals.length-1)} cy={yOf(atual)} r="4" fill={c} style={{filter:`drop-shadow(0 0 6px ${c})`}}/>
          {dayMarks.map((m,i)=>{const x=xOf(i*3);const dd=m.label.slice(8,10)+"/"+m.label.slice(5,7);return(<text key={i} x={x} y={H-4} fontFamily={mono} fontSize="7" fill={C.dim} textAnchor={i===0?"start":i===dayMarks.length-1?"end":"middle"}>{dd}</text>);})}
        </svg>
      </div>
    </div>
  );
}

// ════════ MODAL ACIDENTE ════════
function ModalAcid({ valor, onSave, onClose }) {
  const [v,setV]=React.useState(valor!=null?String(valor):"");
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(2,10,18,0.85)",backdropFilter:"blur(4px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} className="cmd-card" style={{padding:28,width:300}}>
        <Corners/>
        <div style={{color:C.ink,fontFamily:sans,fontWeight:800,fontSize:15,marginBottom:4}}>Dias sem acidentes</div>
        <div style={{color:C.dim,fontFamily:sans,fontSize:11,marginBottom:18}}>Atualizacao manual do indicador</div>
        <input type="number" value={v} onChange={e=>setV(e.target.value)} placeholder="42" autoFocus
          style={{width:"100%",background:C.void,border:`1px solid ${C.line}`,borderRadius:10,padding:14,color:C.green,fontFamily:mono,fontSize:30,fontWeight:900,textAlign:"center",outline:"none",boxSizing:"border-box"}}/>
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button onClick={onClose} style={{flex:1,padding:11,borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12,background:"rgba(255,255,255,0.05)",border:`1px solid ${C.line}`,color:C.mute,fontFamily:sans}}>Cancelar</button>
          <button onClick={()=>{const n=parseInt(v,10);if(!isNaN(n)&&n>=0)onSave(n);}} style={{flex:2,padding:11,borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:12,background:C.greenDim,border:"none",color:"#fff",fontFamily:sans}}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ════════ TICKER (eventos correndo na base) ════════
function Ticker({ historico, chamados, avarias }) {
  const eventos=[];
  [...(historico||[])].sort((a,b)=>b.id-a.id).slice(0,4).forEach(h=>{eventos.push({c:C.green,t:`${h.tipoLabel||h.tipoId} registrado · ${h.linha||h.maquina||""} · ${h.hora||""}`});});
  (chamados||[]).filter(c=>c.status==="aberto").slice(0,3).forEach(c=>{eventos.push({c:PRAZO_COR[c.prazo]||C.amber,t:`Chamado ${c.prazo} · ${c.equipamentoNome||""} · ${c.maquina||""}`});});
  (avarias||[]).filter(a=>a.teveAvaria).slice(-3).forEach(a=>{eventos.push({c:C.red,t:`${a.total} avaria(s) · ${a.linha} · turno ${a.letra}`});});
  if(eventos.length===0) eventos.push({c:C.dim,t:"Sistema operando · sem eventos recentes"});
  const loop=[...eventos,...eventos];
  return (
    <div style={{position:"relative",height:26,overflow:"hidden",background:"rgba(2,10,18,0.6)",borderRadius:8,border:`1px solid ${C.line}`,flexShrink:0}}>
      <div style={{position:"absolute",display:"flex",alignItems:"center",height:"100%",whiteSpace:"nowrap",animation:"cmd-marquee 40s linear infinite"}}>
        {loop.map((e,i)=>(
          <span key={i} style={{display:"inline-flex",alignItems:"center",gap:7,padding:"0 20px",fontFamily:mono,fontSize:9.5,color:C.mute}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:e.c,boxShadow:`0 0 5px ${e.c}`,flexShrink:0}}/>
            {e.t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  DASHBOARD PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function DashboardTV({ setTela, setModoVisao }) {
  const [ocorrencias,setOcorrencias]=React.useState(()=>sGet("ocorrencias_h2")||{M2:null,M3:null});
  const [chamados,setChamados]=React.useState(()=>sGet("chamados_h2")||[]);
  const [cleaners,setCleaners]=React.useState(()=>sGet("cleaners_h2")||{M2:{},M3:{}});
  const [cleanersHist,setCleanersHist]=React.useState(()=>sGet("cleaners_hist_h2")||[]);
  const [sedim,setSedim]=React.useState(()=>sGet("cleaners_sedim_h2")||[]);
  const [historico,setHistorico]=React.useState(()=>sGet("historico_h2")||[]);
  const [pendencias,setPendencias]=React.useState(()=>sGet("pendencias_h2")||[]);
  const [seguranca,setSeguranca]=React.useState(()=>sGet("seguranca_h2")||{});
  const [avarias,setAvarias]=React.useState(()=>sGet("avarias_h2")||[]);
  const [modalAcid,setModalAcid]=React.useState(false);

  React.useEffect(()=>{
    const u=[
      onSnapshot(doc(COL,"ocorrencias_h2"),s=>{if(s.exists()&&s.data().val)setOcorrencias(s.data().val);}),
      onSnapshot(doc(COL,"chamados_h2"),s=>{if(s.exists()&&s.data().val)setChamados(s.data().val);}),
      onSnapshot(doc(COL,"cleaners_h2"),s=>{if(s.exists()&&s.data().val)setCleaners(s.data().val);}),
      onSnapshot(doc(COL,"cleaners_hist_h2"),s=>{if(s.exists()&&s.data().val)setCleanersHist(s.data().val);}),
      onSnapshot(doc(COL,"cleaners_sedim_h2"),s=>{if(s.exists()&&s.data().val)setSedim(s.data().val);}),
      onSnapshot(doc(COL,"historico_h2"),s=>{if(s.exists()&&s.data().val)setHistorico(s.data().val);}),
      onSnapshot(doc(COL,"pendencias_h2"),s=>{if(s.exists()&&s.data().val)setPendencias(s.data().val);}),
      onSnapshot(doc(COL,"seguranca_h2"),s=>{if(s.exists()&&s.data().val)setSeguranca(s.data().val);}),
      onSnapshot(doc(COL,"avarias_h2"),s=>{if(s.exists()&&s.data().val)setAvarias(s.data().val);}),
    ];
    return()=>u.forEach(f=>f());
  },[]);

  const salvarAcid=(d)=>{const novo={...seguranca,diasAcidente:d};setSeguranca(novo);sSet("seguranca_h2",novo);setModalAcid(false);};

  const ocM2=ocorrencias?.M2, ocM3=ocorrencias?.M3;
  const critico=ocM2?.cor==="vermelho"||ocM3?.cor==="vermelho";

  return (
    <div style={{position:"relative",minHeight:"100vh",width:"100vw",background:`radial-gradient(ellipse at 50% 0%,#0a2138 0%,${C.deep} 45%,${C.void} 100%)`,color:C.ink,fontFamily:sans,overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <GlobalFX/>
      {/* grid de fundo */}
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,230,118,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,.025) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}}/>
      {/* scanline */}
      <div style={{position:"absolute",left:0,right:0,height:80,background:"linear-gradient(180deg,transparent,rgba(0,230,118,0.025),transparent)",animation:"cmd-scan 12s linear infinite",pointerEvents:"none",zIndex:1}}/>

      {/* ═══ HEADER ═══ */}
      <div style={{position:"relative",zIndex:10,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 22px",borderBottom:`1px solid ${C.line}`,background:"rgba(4,17,29,0.6)",backdropFilter:"blur(16px)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{position:"relative",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="30" height="30" style={{position:"absolute",animation:"cmd-spin 8s linear infinite"}}>
                <circle cx="15" cy="15" r="12" fill="none" stroke={`${C.green}33`} strokeWidth="1.5" strokeDasharray="3 6"/>
              </svg>
              <span style={{fontFamily:mono,fontWeight:900,fontSize:15,color:C.green,textShadow:`0 0 10px ${C.green}`}}>H2</span>
            </div>
            <div>
              <div style={{fontFamily:sans,fontSize:13,fontWeight:900,color:C.ink,letterSpacing:"0.08em"}}>CENTRO DE COMANDO</div>
              <div style={{fontFamily:mono,fontSize:8,color:C.dim,letterSpacing:"0.2em"}}>SECAGEM H2 · SUZANO · INDUSTRIA 5.0</div>
            </div>
          </div>
          {critico&&<div style={{display:"flex",alignItems:"center",gap:6,background:`${C.red}1a`,border:`1px solid ${C.red}55`,borderRadius:20,padding:"4px 12px",animation:"cmd-pulse 1.2s infinite"}}><span style={{width:6,height:6,borderRadius:"50%",background:C.red,boxShadow:`0 0 6px ${C.red}`}}/><span style={{fontFamily:mono,fontSize:9,fontWeight:800,color:C.red,letterSpacing:"0.1em"}}>ALERTA CRITICO</span></div>}
        </div>

        <CmdClock/>

        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {[["M2",ocM2],["M3",ocM3]].map(([mq,oc])=>{const cor=!oc?C.green:oc.cor==="vermelho"?C.red:C.amber;return(
            <div key={mq} style={{display:"flex",alignItems:"center",gap:5,background:`${cor}12`,border:`1px solid ${cor}44`,borderRadius:8,padding:"5px 10px"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:cor,boxShadow:`0 0 6px ${cor}`,animation:oc?.cor==="vermelho"?"cmd-pulse 1s infinite":"none"}}/>
              <span style={{fontFamily:mono,fontSize:10,fontWeight:800,color:cor}}>{mq}</span>
            </div>
          );})}
          <button onClick={()=>setModoVisao&&setModoVisao("app")} style={{background:`${C.blue}14`,border:`1px solid ${C.blue}44`,color:C.blue,borderRadius:9,padding:"8px 14px",cursor:"pointer",fontFamily:sans,fontSize:11,fontWeight:800,letterSpacing:"0.05em"}}>APP</button>
        </div>
      </div>

      {/* ═══ CORPO ═══ */}
      <div style={{position:"relative",zIndex:5,flex:1,padding:"12px 14px",display:"flex",flexDirection:"column",gap:0,overflow:"hidden"}}>
        <HeroBar historico={historico} seguranca={seguranca} cleaners={cleaners} cleanersHist={cleanersHist} avarias={avarias} onEditAcid={()=>setModalAcid(true)}/>

        {/* grid principal: 4 col x 2 linhas + faixa */}
        <div style={{flex:1,display:"grid",gridTemplateColumns:"1.1fr 1.1fr 1fr 1fr",gridTemplateRows:"1fr 1fr",gap:12,minHeight:0}}>
          {/* linha 1 */}
          <PanelMural pendencias={pendencias} chamados={chamados} setTela={setTela}/>
          <PanelCleaners cleaners={cleaners} cleanersHist={cleanersHist} sedim={sedim} setTela={setTela}/>
          <PanelAltura historico={historico} setTela={setTela}/>
          <PanelAvarias avarias={avarias} setTela={setTela}/>
          {/* linha 2 */}
          <div style={{gridColumn:"span 2"}}><PanelTendencia cleanersHist={cleanersHist} setTela={setTela}/></div>
          <PanelChamados chamados={chamados} setTela={setTela}/>
          <PanelChecklists historico={historico} setTela={setTela}/>
        </div>

        {/* faixa inferior: galeria + ticker */}
        <div style={{display:"flex",gap:12,marginTop:12,height:96,flexShrink:0}}>
          <div className="cmd-card" style={{width:280,padding:0,overflow:"hidden",flexShrink:0,position:"relative"}}>
            <Corners c={C.blue}/>
            <CarrosselViewer/>
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
            <Ticker historico={historico} chamados={chamados} avarias={avarias}/>
            {/* mini status strip */}
            <div className="cmd-card" style={{flex:1,padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <Corners/>
              {[
                {l:"SISTEMA",v:"ONLINE",c:C.green},
                {l:"FIREBASE",v:"SYNC",c:C.cyan},
                {l:"DISPOSITIVOS",v:"3 ATIVOS",c:C.blue},
                {l:"ATUALIZACAO",v:"AO VIVO",c:C.green},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:s.c,boxShadow:`0 0 6px ${s.c}`,animation:"cmd-pulse 2s infinite"}}/>
                  <div>
                    <div style={{fontFamily:mono,fontSize:7,color:C.dim,letterSpacing:"0.1em"}}>{s.l}</div>
                    <div style={{fontFamily:mono,fontSize:10,fontWeight:800,color:s.c}}>{s.v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalAcid&&<ModalAcid valor={seguranca?.diasAcidente??null} onSave={salvarAcid} onClose={()=>setModalAcid(false)}/>}
    </div>
  );
}
