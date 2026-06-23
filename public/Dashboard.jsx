// ─── Dashboard.jsx — Modo TV/Web · Secagem H2 ──────────────────────────────
// Layout TV 60": banner de segurança + grid 3×2 com gráficos reais.
// onSnapshot: ocorrencias_h2, chamados_h2, cleaners_h2, cleaners_hist_h2,
//             cleaners_sedim_h2, historico_h2, pendencias_h2, seguranca_h2
import * as React from "react";
import { COL, doc, onSnapshot, setDoc, getDoc } from "./firebase";

const C = {
  bg:"#04111D", surface:"#071828", card:"#0A1929", cardHover:"#0D2140",
  accent:"#00E676", accentLight:"#00E676", accentDark:"#006B2E",
  blue:"#0E2847", blueLight:"#1A5CCC",
  warning:"#b87d00", warningLight:"#FFC107",
  danger:"#c0272d", dangerLight:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880",
  border:"rgba(60,255,140,0.15)", tagBg:"rgba(255,255,255,0.04)",
};

// ── helpers ──────────────────────────────────────────────────────────────────
const storageGet = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const storageSet = (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} try { setDoc(doc(COL,k),{val:v,ts:Date.now()}); } catch {} };
const hoje = () => new Date().toISOString().slice(0,10);
const getAutoTurno = () => { const h=new Date().getHours(); if(h<8)return"00x08"; if(h<16)return"08x16"; return"16x24"; };
const parseAlt = (v) => { if(!v)return null; const n=parseFloat(String(v).replace(",",".")); return isNaN(n)?null:n; };
const diffDias = (dataIso) => { if(!dataIso)return null; const d=new Date(dataIso+"T00:00:00"); const hoje2=new Date(); hoje2.setHours(0,0,0,0); return Math.floor((hoje2-d)/86400000); };

const CLEANERS_TOTAL = 24;
const CLEANERS_LIMITE = 70;
const ALT_MIN = 1.88, ALT_MAX = 1.92;
const LINHAS = ["L4","L5","L6","L7","L8"];
const PRAZOS_COR = { Imediato:"#FF5252", Urgente:"#FF8C00", Normal:"#FFC107", Programável:"#5090FF" };
const JANELAS = [
  {id:"pu",   label:"P. Úmida", cor:"#00FF94"},
  {id:"clean",label:"Cleaners", cor:"#00F0FF"},
  {id:"cs",   label:"Sec/Cort", cor:"#3B9BFF"},
  {id:"enf",  label:"Enf.",     cor:"#C77DFF"},
];

function areaParaJanela(area) {
  const a=(area||"").toLowerCase();
  if(a==="cortadeira"||a==="cs"||a==="secador")return"cs";
  if(a==="enfardamento"||a==="enf")return"enf";
  if(a==="cleaners")return"clean";
  return"pu";
}

// bezier path helper
function bPath(pts) {
  if(pts.length<2) return "";
  const p=pts.map(s=>{const[x,y]=s.split(",").map(Number);return{x,y};});
  let d=`M${p[0].x},${p[0].y}`;
  for(let i=1;i<p.length;i++){const c=(p[i-1].x+p[i].x)/2;d+=` C${c},${p[i-1].y} ${c},${p[i].y} ${p[i].x},${p[i].y}`;}
  return d;
}

// ── Relógio ──────────────────────────────────────────────────────────────────
function Relogio() {
  const [now,setNow]=React.useState(new Date());
  React.useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t);},[]);
  const hh=String(now.getHours()).padStart(2,"0");
  const mm=String(now.getMinutes()).padStart(2,"0");
  const ss=String(now.getSeconds()).padStart(2,"0");
  return(
    <div style={{display:"flex",alignItems:"baseline",gap:6}}>
      <span style={{fontFamily:"monospace",fontSize:26,fontWeight:900,color:C.accentLight,letterSpacing:"0.06em",textShadow:`0 0 18px ${C.accentLight}88`}}>{hh}:{mm}<span style={{fontSize:14,opacity:.5}}>:{ss}</span></span>
      <span style={{fontSize:10,color:C.textMuted,fontWeight:700,letterSpacing:"0.12em"}}>{getAutoTurno()}</span>
    </div>
  );
}

// ── Banner de segurança ───────────────────────────────────────────────────────
function BannerSeguranca({ historicoData, segurancaData, onEditarAcidente }) {
  const historico = Array.isArray(historicoData)?historicoData:[];

  function diasSemQuebra(mq) {
    const registros = historico
      .filter(h => (h.tipoId==="passagem_ponta"||h.tipoId==="passagem_ponta_cs") && h.maquina===mq && h.data)
      .sort((a,b)=>b.data.localeCompare(a.data));
    if(!registros.length) return null;
    return diffDias(registros[0].data);
  }

  const dM2 = diasSemQuebra("M2");
  const dM3 = diasSemQuebra("M3");
  const dAcid = segurancaData?.diasAcidente ?? null;

  function SegBlock({ label, dias, cor, onClick }) {
    return(
      <div onClick={onClick} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:10,cursor:onClick?"pointer":"default",padding:"0 12px"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"monospace",fontSize:36,fontWeight:900,color:cor,lineHeight:1,
            textShadow:`0 0 20px ${cor}88, 0 0 40px ${cor}44`}}>
            {dias!==null?dias:"—"}
          </div>
          <div style={{fontSize:9,color:C.textDim,letterSpacing:"0.14em",marginTop:2}}>{label}</div>
        </div>
      </div>
    );
  }

  return(
    <div style={{display:"flex",alignItems:"stretch",background:"rgba(7,24,40,0.95)",
      borderBottom:`1px solid ${C.border}`,borderTop:`2px solid ${C.accentLight}`,
      height:72, flexShrink:0}}>
      <style>{`@keyframes seg-pulse{0%,100%{opacity:1;}50%{opacity:.6;}} .seg-div{width:1px;background:${C.border};margin:10px 0;}`}</style>
      <SegBlock label="DIAS SEM ACIDENTE 🛡️" dias={dAcid} cor={dAcid!==null&&dAcid>30?C.accentLight:dAcid!==null&&dAcid>7?C.warningLight:C.dangerLight} onClick={onEditarAcidente}/>
      <div className="seg-div"/>
      <SegBlock label="DIAS SEM QUEBRA · M2 ⚙️" dias={dM2} cor={dM2===null?C.textDim:dM2>14?C.accentLight:dM2>3?C.warningLight:C.dangerLight}/>
      <div className="seg-div"/>
      <SegBlock label="DIAS SEM QUEBRA · M3 ⚙️" dias={dM3} cor={dM3===null?C.textDim:dM3>14?C.accentLight:dM3>3?C.warningLight:C.dangerLight}/>
    </div>
  );
}

// ── Modal editar dias sem acidente ───────────────────────────────────────────
function ModalAcidente({ valor, onSalvar, onFechar }) {
  const [v,setV]=React.useState(valor!==null?String(valor):"");
  return(
    <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onFechar}>
      <div style={{background:C.surface,border:`1px solid ${C.accentLight}44`,borderRadius:16,padding:28,width:280,maxWidth:"90vw"}} onClick={e=>e.stopPropagation()}>
        <div style={{color:C.text,fontWeight:800,fontSize:15,marginBottom:4}}>🛡️ Dias sem acidentes</div>
        <div style={{color:C.textMuted,fontSize:12,marginBottom:16}}>Atualize manualmente.</div>
        <input type="number" value={v} onChange={e=>setV(e.target.value)} placeholder="ex: 42"
          style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,
            padding:"12px",color:C.text,fontSize:28,fontWeight:900,fontFamily:"monospace",
            textAlign:"center",outline:"none",boxSizing:"border-box"}} autoFocus/>
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <button onClick={onFechar} style={{flex:1,padding:11,borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:13,background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted}}>Cancelar</button>
          <button onClick={()=>{const n=parseInt(v,10);if(!isNaN(n)&&n>=0)onSalvar(n);}} disabled={isNaN(parseInt(v,10))||parseInt(v,10)<0}
            style={{flex:2,padding:11,borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:13,background:C.accentDark||C.accent,border:"none",color:"#fff",opacity:isNaN(parseInt(v,10))?0.4:1}}>
            ✓ Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Card base ──────────────────────────────────────────────────────────────
function PainelCard({ title, icon, corTopo, onClick, children, alerta=false }) {
  const [hov,setHov]=React.useState(false);
  return(
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov?C.cardHover:C.card, border:`1px solid ${alerta?C.dangerLight+"44":C.border}`,
        borderTop:`3px solid ${corTopo}`, borderRadius:14, padding:"14px 18px 12px",
        cursor:"pointer", transition:"all .2s", display:"flex", flexDirection:"column", gap:10,
        boxShadow:hov?`0 0 28px ${corTopo}33, 0 4px 32px rgba(0,0,0,.6)`:`0 2px 16px rgba(0,0,0,.5)`,
        overflow:"hidden", position:"relative"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <span style={{fontSize:18}}>{icon}</span>
          <span style={{fontSize:11,fontWeight:800,color:C.textMuted,letterSpacing:"0.09em",textTransform:"uppercase"}}>{title}</span>
        </div>
        <span style={{fontSize:12,color:C.textDim,opacity:.6}}>›</span>
      </div>
      {children}
    </div>
  );
}

// ── Painel 1 · Mural de Oportunidades ─────────────────────────────────────
function PainelMural({ pendenciasData, chamadosData, setTela }) {
  const pend = Array.isArray(pendenciasData)?pendenciasData:[];
  const chamAbertos = Array.isArray(chamadosData)?chamadosData.filter(c=>c.status==="aberto"):[];

  // ── LÓGICA (inalterada): contagem por janela ──
  const cnt = {pu:0,clean:0,cs:0,enf:0};
  pend.forEach(p=>{
    if(p.multiJanela) p.multiJanela.forEach(j=>{if(cnt[j]!==undefined)cnt[j]++;});
    else{const j=p.janela||areaParaJanela(p.area);if(cnt[j]!==undefined)cnt[j]++;}
  });
  chamAbertos.forEach(c=>{const j=areaParaJanela(c.area);if(cnt[j]!==undefined)cnt[j]++;});
  const total=Object.values(cnt).reduce((a,b)=>a+b,0);

  // ── severidade por prazo (lógica já existente nos dados) ──
  const prazoDe = (item) => (item.prazo||"").toLowerCase();
  let nCrit=0,nMed=0,nBaixa=0;
  const classifica = (pz) => { if(pz==="imediato"||pz==="urgente")nCrit++; else if(pz==="normal")nMed++; else nBaixa++; };
  pend.forEach(p=>classifica(prazoDe(p)));
  chamAbertos.forEach(c=>classifica(prazoDe(c)));

  // ── donut multicolor por severidade (igual mockup: vermelho/amarelo/verde) ──
  const sevSegs=[
    {v:nCrit, cor:C.dangerLight},
    {v:nMed,  cor:C.warningLight},
    {v:nBaixa,cor:C.accentLight},
  ].filter(s=>s.v>0);
  const corCentro = nCrit>0?C.dangerLight:nMed>0?C.warningLight:C.accentLight;
  const R=52,SW=13,circ=2*Math.PI*R;
  let acc=0;

  // ── linhas da lista (área-pai → sub) igual mockup ──
  // Parte Úmida engloba Máquina(pu) + Cleaners(clean); Cortadeira=cs; Enfardamento=enf
  const puTotal = cnt.pu + cnt.clean;
  const corBarra = (n,base) => n===0?C.textDim:base;
  const linhas = [
    {tipo:"pai", label:"Parte Úmida", n:puTotal, cor: puTotal===0?C.textDim:(nCrit>0?C.dangerLight:C.warningLight)},
    {tipo:"sub", label:"Máquina",     n:cnt.pu},
    {tipo:"sub", label:"Cleaners",    n:cnt.clean},
    {tipo:"pai", label:"Cortadeira",  n:cnt.cs,  cor: cnt.cs===0?C.textDim:C.warningLight},
    {tipo:"pai", label:"Enfardamento",n:cnt.enf, cor: cnt.enf===0?C.textDim:C.accentLight},
  ];
  const maxBar = Math.max(1, puTotal, cnt.cs, cnt.enf);

  return(
    <PainelCard title="Mural de Oportunidades" icon="🔧" corTopo={corCentro} onClick={()=>setTela("mural")} alerta={nCrit>0}>
      <div style={{display:"flex",gap:18,alignItems:"center"}}>
        {/* ── DONUT ── */}
        <div style={{position:"relative",flexShrink:0,width:140,height:140}}>
          <svg width={140} height={140} viewBox="0 0 140 140" style={{transform:"rotate(-90deg)"}}>
            <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={SW}/>
            {total===0
              ? <circle cx="70" cy="70" r={R} fill="none" stroke={C.accentLight} strokeWidth={SW} strokeDasharray={`${circ} 0`} style={{filter:`drop-shadow(0 0 8px ${C.accentLight})`}}/>
              : sevSegs.map((s,i)=>{
                  const frac=s.v/total; const len=frac*circ; const off=-acc*circ; acc+=frac;
                  const gap=2; // micro-gap entre segmentos
                  return <circle key={i} cx="70" cy="70" r={R} fill="none" stroke={s.cor} strokeWidth={SW}
                    strokeDasharray={`${Math.max(0,len-gap)} ${circ-len+gap}`} strokeDashoffset={off} strokeLinecap="round"
                    style={{filter:`drop-shadow(0 0 6px ${s.cor}aa)`,transition:"stroke-dasharray .6s"}}/>;
                })
            }
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontFamily:"monospace",fontSize:46,fontWeight:900,color:corCentro,lineHeight:1,
              textShadow:`0 0 22px ${corCentro}aa, 0 0 44px ${corCentro}44`}}>{total}</span>
            <span style={{fontSize:10,color:C.textMuted,letterSpacing:"0.06em",marginTop:2}}>oportunidades</span>
          </div>
        </div>

        {/* ── LISTA ── */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,paddingBottom:5,marginBottom:7}}>
            <span style={{fontSize:8,color:C.textDim,letterSpacing:"0.14em",fontWeight:700}}>ÁREA / MÁQUINA</span>
            <span style={{fontSize:8,color:C.textDim,letterSpacing:"0.14em",fontWeight:700}}>TOTAL</span>
          </div>
          {linhas.map((ln,i)=>{
            const isSub=ln.tipo==="sub";
            const w=ln.tipo==="pai"?Math.round((ln.n/maxBar)*100):0;
            return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:isSub?3:5,
                paddingLeft:isSub?14:0}}>
                {/* ícone/marcador */}
                {!isSub&&<span style={{width:5,height:5,borderRadius:"50%",background:ln.cor,flexShrink:0,
                  boxShadow:ln.n>0?`0 0 6px ${ln.cor}`:"none"}}/>}
                {isSub&&<span style={{color:C.textDim,fontSize:10,flexShrink:0,marginLeft:-8}}>└</span>}
                <span style={{fontSize:isSub?10:12,color:isSub?C.textDim:C.text,fontWeight:isSub?500:700,
                  whiteSpace:"nowrap",flexShrink:0}}>{ln.label}</span>
                {/* barra (só pai) */}
                {!isSub&&(
                  <div style={{flex:1,height:5,borderRadius:3,background:"rgba(255,255,255,0.05)",overflow:"hidden",minWidth:20}}>
                    <div style={{height:"100%",width:`${w}%`,borderRadius:3,background:ln.cor,transition:"width .5s",
                      boxShadow:ln.n>0?`0 0 6px ${ln.cor}aa`:"none"}}/>
                  </div>
                )}
                {isSub&&<div style={{flex:1}}/>}
                <span style={{fontFamily:"monospace",fontSize:isSub?11:13,fontWeight:900,
                  color:ln.n>0?(isSub?C.textMuted:ln.cor):C.textDim,flexShrink:0,minWidth:16,textAlign:"right"}}>{ln.n}</span>
              </div>
            );
          })}
          {/* total geral */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            borderTop:`1px solid ${C.border}`,paddingTop:6,marginTop:4}}>
            <span style={{fontSize:11,color:C.textMuted,fontWeight:600}}>Total geral</span>
            <span style={{fontFamily:"monospace",fontSize:14,fontWeight:900,color:corCentro}}>{total}</span>
          </div>
        </div>
      </div>

      {/* ── RODAPÉ: severidade + botão ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4,
        borderTop:`1px solid ${C.border}`,paddingTop:10}}>
        <div style={{display:"flex",gap:20}}>
          {[
            {n:nCrit, label:"CRÍTICAS", cor:C.dangerLight},
            {n:nMed,  label:"MÉDIAS",   cor:C.warningLight},
            {n:nBaixa,label:"BAIXAS",   cor:C.accentLight},
          ].map(({n,label,cor})=>(
            <div key={label} style={{textAlign:"center"}}>
              <div style={{fontFamily:"monospace",fontSize:24,fontWeight:900,color:n>0?cor:C.textDim,lineHeight:1,
                textShadow:n>0?`0 0 14px ${cor}88`:"none"}}>{n}</div>
              <div style={{fontSize:8,color:C.textDim,letterSpacing:"0.12em",marginTop:3,fontWeight:600}}>{label}</div>
            </div>
          ))}
        </div>
        <button onClick={(e)=>{e.stopPropagation();setTela("mural");}}
          style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 14px",
            cursor:"pointer",color:C.textMuted,fontSize:10,fontWeight:700,letterSpacing:"0.08em",
            display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>
          VER DETALHES <span style={{fontSize:12}}>›</span>
        </button>
      </div>
    </PainelCard>
  );
}

// ── Painel 2 · Chamados / SAP ─────────────────────────────────────────────
function PainelChamados({ chamadosData, setTela }) {
  const chamados=Array.isArray(chamadosData)?chamadosData.filter(c=>c.status==="aberto"):[];
  const nIme=chamados.filter(c=>c.prazo==="Imediato").length;
  const nUrg=chamados.filter(c=>c.prazo==="Urgente").length;
  const nNor=chamados.filter(c=>c.prazo==="Normal").length;
  const nPro=chamados.filter(c=>c.prazo==="Programável").length;
  const cor=nIme>0?C.dangerLight:nUrg>0?"#FF8C00":chamados.length>0?C.warningLight:C.accentLight;
  const blocos=[{l:"Imediato",n:nIme,c:PRAZOS_COR.Imediato},{l:"Urgente",n:nUrg,c:PRAZOS_COR.Urgente},{l:"Normal",n:nNor,c:PRAZOS_COR.Normal},{l:"Program.",n:nPro,c:PRAZOS_COR.Programável}];
  // mini barras
  const maxN=Math.max(1,...blocos.map(b=>b.n));
  return(
    <PainelCard title="Chamados / SAP" icon="🗒" corTopo={cor} onClick={()=>setTela("equipamentos")} alerta={nIme>0}>
      <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:2}}>
        <span style={{fontFamily:"monospace",fontSize:48,fontWeight:900,color:cor,lineHeight:1,
          textShadow:`0 0 24px ${cor}88`}}>{chamados.length}</span>
        <span style={{fontSize:13,color:C.textMuted,marginBottom:8}}>abertos</span>
      </div>
      {/* barras visuais */}
      <div style={{display:"flex",gap:8,alignItems:"flex-end",height:52}}>
        {blocos.map(({l,n,c})=>{
          const h=Math.max(4,Math.round((n/maxN)*44));
          return(
            <div key={l} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <span style={{fontFamily:"monospace",fontSize:13,fontWeight:900,color:n>0?c:C.textDim}}>{n}</span>
              <div style={{width:"100%",height:h,borderRadius:"3px 3px 0 0",background:n>0?c:"rgba(255,255,255,0.06)",
                boxShadow:n>0?`0 0 8px ${c}66`:"none",transition:"height .5s"}}/>
              <span style={{fontSize:8,color:C.textDim,textAlign:"center",lineHeight:1.2}}>{l}</span>
            </div>
          );
        })}
      </div>
    </PainelCard>
  );
}

// ── Painel 3 · Cleaners ────────────────────────────────────────────────────
function PainelCleaners({ cleanersData, cleanersHistData, setTela }) {
  const dados=cleanersData||{M2:{},M3:{}};
  const histAll=Array.isArray(cleanersHistData)?cleanersHistData:[];

  // sparkline 7 dias por máquina
  const sparkDays=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return d.toISOString().slice(0,10);});
  function getSparkMaq(mq) {
    const snap={};
    const sorted=[...histAll].sort((a,b)=>(a.data+(a.hora||"00:00")).localeCompare(b.data+(b.hora||"00:00")));
    return sparkDays.map(d=>{
      sorted.filter(ev=>ev.data===d&&ev.maquina===mq).forEach(ev=>{
        if(ev.status==="REMOVIDA")snap[ev.garrafa]=1; else delete snap[ev.garrafa];
      });
      return Math.round((CLEANERS_TOTAL-Object.keys(snap).length)/CLEANERS_TOTAL*100);
    });
  }

  function CardMaq({ mq }) {
    const nFora=Object.keys(dados[mq]||{}).length;
    const nOp=CLEANERS_TOTAL-nFora;
    const efic=Math.round(nOp/CLEANERS_TOTAL*100);
    const cor=efic>=90?C.accentLight:efic>=CLEANERS_LIMITE?C.warningLight:C.dangerLight;
    const spark=getSparkMaq(mq);
    const R=28,circ=2*Math.PI*R,fillOp=circ*(nOp/CLEANERS_TOTAL),fillFora=circ*(nFora/CLEANERS_TOTAL);
    const W2=70,H2=22,mn=Math.max(0,Math.min(...spark)-5),mx=Math.min(100,Math.max(...spark)+5),rng=mx-mn||1;
    const pts=spark.map((v,i)=>`${(i/(spark.length-1))*W2},${H2-(v-mn)/rng*H2}`).join(" ");
    return(
      <div style={{flex:1,background:"rgba(255,255,255,0.03)",border:`1px solid ${cor}33`,borderTop:`2px solid ${cor}`,borderRadius:10,padding:"10px 10px 8px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <svg width={64} height={64} viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7"/>
            <circle cx="40" cy="40" r={R} fill="none" stroke={C.accentLight} strokeWidth="7"
              strokeDasharray={`${fillOp} ${circ}`} strokeLinecap="butt" strokeDashoffset={circ*0.25}
              style={{filter:`drop-shadow(0 0 4px ${C.accentLight}88)`,transition:"stroke-dasharray .6s"}}/>
            {nFora>0&&<circle cx="40" cy="40" r={R} fill="none" stroke={C.warningLight} strokeWidth="7"
              strokeDasharray={`${fillFora} ${circ}`} strokeLinecap="butt" strokeDashoffset={circ*0.25-fillOp}
              style={{filter:`drop-shadow(0 0 4px ${C.warningLight}88)`,transition:"stroke-dasharray .6s"}}/>}
            <text x="40" y="44" textAnchor="middle" fontSize="16" fontWeight="900" fill={cor} fontFamily="monospace">{efic}</text>
            <text x="40" y="54" textAnchor="middle" fontSize="7" fill={C.textDim}>%</text>
          </svg>
          <div>
            <div style={{fontFamily:"monospace",fontSize:11,fontWeight:900,color:C.textMuted,letterSpacing:"0.1em",marginBottom:2}}>MÁQ {mq.replace("M","")}</div>
            <div style={{color:C.accentLight,fontWeight:900,fontSize:14,fontFamily:"monospace"}}>{nOp}<span style={{color:C.textDim,fontSize:10}}>/{CLEANERS_TOTAL}</span></div>
            <div style={{color:nFora>0?C.warningLight:C.textDim,fontWeight:700,fontSize:11,fontFamily:"monospace"}}>{nFora} fora</div>
          </div>
        </div>
        {/* sparkline */}
        <div style={{background:C.tagBg,borderRadius:6,padding:"4px 6px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
          <span style={{fontSize:7,color:C.textDim}}>7d</span>
          <svg width={W2} height={H2}>
            <polyline points={pts} fill="none" stroke={cor} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"
              style={{filter:`drop-shadow(0 0 3px ${cor}88)`}}/>
            <circle cx={W2} cy={H2-(spark[spark.length-1]-mn)/rng*H2} r="2.5" fill={cor}/>
          </svg>
          <span style={{color:cor,fontFamily:"monospace",fontWeight:900,fontSize:10}}>{spark[spark.length-1]}%</span>
        </div>
      </div>
    );
  }

  return(
    <PainelCard title="Cleaners" icon="🫧" corTopo={C.accentLight} onClick={()=>setTela("cleaners")}>
      <div style={{display:"flex",gap:8}}>
        <CardMaq mq="M2"/>
        <CardMaq mq="M3"/>
      </div>
    </PainelCard>
  );
}

// ── Painel 4 · Tendência + Sedimentáveis ──────────────────────────────────
function PainelTendencia({ cleanersHistData, sedimData, setTela }) {
  const histAll=Array.isArray(cleanersHistData)?cleanersHistData:[];
  const sedimAll=Array.isArray(sedimData)?sedimData:[];

  // 30 pontos: 10 dias × 3 turnos
  const shiftBounds=[];
  for(let day=0;day<10;day++){
    const d=new Date(); d.setDate(d.getDate()-9+day);
    const ds=d.toISOString().slice(0,10);
    for(const h of[8,16,24]){
      const nd=h===24;
      const bd=nd?new Date(d.getTime()+86400000).toISOString().slice(0,10):ds;
      const bh=nd?"00:00":String(h).padStart(2,"0")+":00";
      shiftBounds.push({ts:bd+"T"+bh,label:ds});
    }
  }
  const sortedEf=[...histAll].sort((a,b)=>(a.data+(a.hora||"00:00")).localeCompare(b.data+(b.hora||"00:00")));
  const snapEf={M2:{},M3:{}}; let eIdx=0;
  const effVals=shiftBounds.map(({ts})=>{
    while(eIdx<sortedEf.length){const ev=sortedEf[eIdx];if((ev.data+"T"+(ev.hora||"00:00"))>ts)break;
      if(ev.maquina&&snapEf[ev.maquina]){if(ev.status==="REMOVIDA")snapEf[ev.maquina][ev.garrafa]=1; else delete snapEf[ev.maquina][ev.garrafa];}eIdx++;}
    const fora=Object.keys(snapEf.M2||{}).length+Object.keys(snapEf.M3||{}).length;
    return Math.round(((CLEANERS_TOTAL*2)-fora)/(CLEANERS_TOTAL*2)*100);
  });
  const sedimVals=shiftBounds.map(({ts})=>{const recs=sedimAll.filter(s=>s.data+"T"+(s.hora||"00:00")<=ts);return recs.length>0?recs[recs.length-1].valor:null;});
  const hasSedim=sedimVals.some(v=>v!==null);
  const lastSedim=sedimAll.length>0?sedimAll[sedimAll.length-1]:null;
  const corSedim=lastSedim?(lastSedim.valor<150?C.accentLight:lastSedim.valor<=250?C.warningLight:C.dangerLight):C.textDim;

  const W=260,H=80;
  const HU=Math.round(H*0.45),HG=Math.round(H*0.1),HL=H-HU-HG;
  const efMin=Math.max(0,Math.min(...effVals)-5),efMax=Math.min(100,Math.max(...effVals)+5),efRng=efMax-efMin||1;
  const sdMax=Math.max(300,...sedimVals.filter(v=>v!==null))+30;
  const xOf=(i)=>(i/(shiftBounds.length-1))*W;
  const yEf=(v)=>HU-((v-efMin)/efRng)*HU;
  const ySd=(v)=>HU+HG+(v/sdMax)*HL;
  const efPts=effVals.map((v,i)=>`${xOf(i)},${yEf(v)}`);
  const efLine=bPath(efPts);
  const efArea=efLine+` L${W},${HU} L0,${HU} Z`;
  const firstSd=sedimVals.find(v=>v!==null);
  const sdFilled=firstSd!=null?sedimVals.map((v,i)=>v!==null?v:(i<sedimVals.findIndex(x=>x!==null)?firstSd:null)):sedimVals;
  const sdPts=sdFilled.map((v,i)=>v!==null?`${xOf(i)},${ySd(v)}`:null).filter(Boolean);
  const sdLine=bPath(sdPts);
  const efAtual=effVals[effVals.length-1];
  const corEf=efAtual>=90?C.accentLight:efAtual>=CLEANERS_LIMITE?C.warningLight:C.dangerLight;

  return(
    <PainelCard title="Tendência Cleaners" icon="📈" corTopo={corEf} onClick={()=>setTela("cleaners")}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <span style={{fontSize:9,color:C.textDim,letterSpacing:"0.1em"}}>EFICIÊNCIA · 10 DIAS · 3 TURNOS</span>
        {lastSedim&&<span style={{background:`${corSedim}22`,border:`1px solid ${corSedim}44`,color:corSedim,
          borderRadius:20,padding:"2px 8px",fontSize:9,fontFamily:"monospace",fontWeight:800}}>Sedim: {lastSedim.valor} mL/L</span>}
      </div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:"block"}}>
        <defs>
          <linearGradient id="efFillD" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.accentLight} stopOpacity="0.25"/>
            <stop offset="100%" stopColor={C.accentLight} stopOpacity="0.02"/>
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={W} height={HU} fill="rgba(0,230,118,0.03)" rx="2"/>
        <rect x={0} y={HU+HG} width={W} height={HL} fill="rgba(255,193,7,0.03)" rx="2"/>
        <line x1={0} y1={HU+HG/2} x2={W} y2={HU+HG/2} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4,4"/>
        <path d={efArea} fill="url(#efFillD)" opacity={0.8}/>
        <path d={efLine} fill="none" stroke={corEf} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
          style={{filter:`drop-shadow(0 0 4px ${corEf}88)`}}/>
        {hasSedim&&sdLine&&<path d={sdLine} fill="none" stroke={C.warningLight} strokeWidth="2" strokeLinejoin="round"
          style={{filter:`drop-shadow(0 0 3px ${C.warningLight}66)`}}/>}
        <circle cx={xOf(effVals.length-1)} cy={yEf(efAtual)} r="3" fill={corEf} style={{filter:`drop-shadow(0 0 5px ${corEf})`}}/>
        <text x={W-2} y={10} textAnchor="end" fontSize="8" fill={corEf} fontFamily="monospace" fontWeight="700">EF%</text>
        {hasSedim&&<text x={W-2} y={H-3} textAnchor="end" fontSize="8" fill={C.warningLight} fontFamily="monospace" fontWeight="700">mL/L</text>}
      </svg>
      <div style={{display:"flex",gap:12,marginTop:2}}>
        <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:12,height:2,background:corEf,display:"inline-block",borderRadius:1,boxShadow:`0 0 4px ${corEf}`}}/><span style={{color:C.textDim,fontSize:8}}>Eficiência %</span></span>
        {hasSedim&&<span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:12,height:2,background:C.warningLight,display:"inline-block",borderRadius:1}}/><span style={{color:C.textDim,fontSize:8}}>Sedimentáveis mL/L</span></span>}
      </div>
    </PainelCard>
  );
}

// ── Painel 5 · Altura das Units ────────────────────────────────────────────
function PainelAlturaUnits({ historicoData, setTela }) {
  const historico=Array.isArray(historicoData)?historicoData:[];
  const ultAlt={};
  [...historico].sort((a,b)=>b.id-a.id).filter(h=>h.tipoId==="enf_qualidade").forEach(r=>{
    const ln=r.linha||r.maquina;
    if(ln&&!ultAlt[ln]){const it=r.items?.find(i=>i.id==="enf_14");const v=it?parseAlt(it.resp):null;if(v!==null)ultAlt[ln]=v;}
  });
  const linhas=LINHAS.map(l=>({l,v:ultAlt[l]||null}));
  const comLeitura=linhas.filter(x=>x.v!==null);
  const fora=comLeitura.filter(x=>x.v<ALT_MIN||x.v>ALT_MAX);
  const corTopo=fora.length===0&&comLeitura.length>0?C.accentLight:fora.length>0?C.dangerLight:C.textDim;
  // SVG barras
  const H=52,W_BAR=36,GAP=10;
  const totalW=LINHAS.length*(W_BAR+GAP)-GAP;
  const vMin=1.80,vMax=1.96,vRng=vMax-vMin;
  const yFaixaMin=H-(ALT_MIN-vMin)/vRng*H;
  const yFaixaMax=H-(ALT_MAX-vMin)/vRng*H;
  const yHeight=yFaixaMin-yFaixaMax;
  return(
    <PainelCard title="Altura das Units" icon="📏" corTopo={corTopo} onClick={()=>setTela("historico")} alerta={fora.length>0}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <span style={{fontSize:9,color:C.textDim}}>Faixa: <span style={{color:C.accentLight,fontFamily:"monospace",fontWeight:700}}>{ALT_MIN.toFixed(2)}–{ALT_MAX.toFixed(2)} m</span></span>
        {fora.length>0&&<span style={{background:C.dangerLight+"22",border:`1px solid ${C.dangerLight}44`,color:C.dangerLight,borderRadius:20,padding:"2px 8px",fontSize:9,fontWeight:800}}>⚠ {fora.length} fora</span>}
      </div>
      <svg width="100%" height={H+24} viewBox={`0 0 ${totalW} ${H+24}`} preserveAspectRatio="xMidYMid meet">
        {/* faixa verde */}
        <rect x={0} y={yFaixaMax} width={totalW} height={yHeight} fill="rgba(0,230,118,0.08)" rx="2"/>
        <line x1={0} y1={yFaixaMax} x2={totalW} y2={yFaixaMax} stroke={C.accentLight} strokeWidth="0.8" strokeDasharray="3,3" opacity={0.5}/>
        <line x1={0} y1={yFaixaMin} x2={totalW} y2={yFaixaMin} stroke={C.accentLight} strokeWidth="0.8" strokeDasharray="3,3" opacity={0.5}/>
        {linhas.map(({l,v},idx)=>{
          const x=idx*(W_BAR+GAP);
          const c=v===null?C.textDim:v<ALT_MIN||v>ALT_MAX?C.dangerLight:C.accentLight;
          const yTop=v!==null?H-(v-vMin)/vRng*H:H;
          const barH=v!==null?H-yTop:0;
          return(
            <g key={l}>
              {v!==null&&<>
                <rect x={x} y={yTop} width={W_BAR} height={barH} fill={`${c}33`} rx="2"/>
                <rect x={x} y={yTop} width={W_BAR} height={3} fill={c} rx="1" style={{filter:`drop-shadow(0 0 4px ${c})`}}/>
              </>}
              {v===null&&<rect x={x} y={H-4} width={W_BAR} height={4} fill="rgba(255,255,255,0.06)" rx="2"/>}
              <text x={x+W_BAR/2} y={H+10} textAnchor="middle" fontSize="8" fill={C.textDim}>{l}</text>
              <text x={x+W_BAR/2} y={H+20} textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="700" fill={c}>
                {v!==null?v.toFixed(2):"—"}
              </text>
            </g>
          );
        })}
      </svg>
    </PainelCard>
  );
}

// ── Painel 6 · Checklists do Turno ────────────────────────────────────────
function PainelChecklists({ historicoData, setTela }) {
  const historico=Array.isArray(historicoData)?historicoData:[];
  const turnoAtual=getAutoTurno();
  const hj=hoje();
  const checkTurno=historico.filter(h=>h.data===hj&&h.turno===turnoAtual);
  const areas=[
    {area:"pu",  tipo:"rotina",        label:"P.Úmida",  maquinas:["M2","M3"]},
    {area:"cs",  tipo:"cortadeira",    label:"Sec/Cort", maquinas:["M2","M3"]},
    {area:"enf", tipo:"enf_qualidade", label:"Enf.",     maquinas:["L4","L5","L6","L7","L8"]},
  ];
  let totalFeito=0,totalEsp=0;
  const blocos=areas.map(a=>{
    const esp=a.maquinas.length;
    const feito=a.maquinas.filter(mq=>checkTurno.some(h=>h.tipoId===a.tipo&&(h.maquina===mq||h.linha===mq))).length;
    totalFeito+=feito; totalEsp+=esp;
    const c=feito===esp?C.accentLight:feito===0?C.dangerLight:C.warningLight;
    return{label:a.label,feito,esp,c,maquinas:a.maquinas};
  });
  const corTopo=totalFeito===totalEsp?C.accentLight:totalFeito===0?C.dangerLight:C.warningLight;
  return(
    <PainelCard title="Checklists do Turno" icon="✓" corTopo={corTopo} onClick={()=>setTela("checklist")} alerta={totalFeito===0}>
      <div style={{display:"flex",alignItems:"flex-end",gap:6,marginBottom:6}}>
        <span style={{fontFamily:"monospace",fontSize:44,fontWeight:900,color:corTopo,lineHeight:1,
          textShadow:`0 0 20px ${corTopo}88`}}>{totalFeito}</span>
        <span style={{fontFamily:"monospace",fontSize:26,color:C.textDim,lineHeight:1,marginBottom:3}}>/{totalEsp}</span>
        <span style={{fontSize:12,color:C.textMuted,marginBottom:6}}>lançamentos</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {blocos.map(({label,feito,esp,c,maquinas})=>(
          <div key={label}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:10,color:C.textMuted}}>{label}</span>
              <span style={{fontFamily:"monospace",fontSize:11,fontWeight:900,color:c}}>{feito}/{esp}</span>
            </div>
            {/* dots por máquina/linha */}
            <div style={{display:"flex",gap:4}}>
              {maquinas.map((mq,i)=>{
                const ok=checkTurno.some(h=>(h.tipoId==="rotina"||h.tipoId==="cortadeira"||h.tipoId==="enf_qualidade")&&(h.maquina===mq||h.linha===mq));
                return<div key={i} style={{flex:1,height:6,borderRadius:3,background:ok?c:"rgba(255,255,255,0.07)",
                  boxShadow:ok?`0 0 6px ${c}88`:"none",transition:"background .3s"}}/>;
              })}
            </div>
          </div>
        ))}
      </div>
    </PainelCard>
  );
}

// ── DashboardTV principal ──────────────────────────────────────────────────
export default function DashboardTV({ setTela, setModoVisao }) {
  const [ocorrencias, setOcorrencias] = React.useState(()=>storageGet("ocorrencias_h2")||{M2:null,M3:null});
  const [chamados,    setChamados]    = React.useState(()=>storageGet("chamados_h2")||[]);
  const [cleaners,    setCleaners]    = React.useState(()=>storageGet("cleaners_h2")||{M2:{},M3:{}});
  const [cleanersHist,setCleanersHist]= React.useState(()=>storageGet("cleaners_hist_h2")||[]);
  const [sedim,       setSedim]       = React.useState(()=>storageGet("cleaners_sedim_h2")||[]);
  const [historico,   setHistorico]   = React.useState(()=>storageGet("historico_h2")||[]);
  const [pendencias,  setPendencias]  = React.useState(()=>storageGet("pendencias_h2")||[]);
  const [seguranca,   setSeguranca]   = React.useState(()=>storageGet("seguranca_h2")||{});
  const [modalAcid,   setModalAcid]   = React.useState(false);

  React.useEffect(()=>{
    const unsubs=[
      onSnapshot(doc(COL,"ocorrencias_h2"), s=>{if(s.exists()&&s.data().val)setOcorrencias(s.data().val);}),
      onSnapshot(doc(COL,"chamados_h2"),    s=>{if(s.exists()&&s.data().val)setChamados(s.data().val);}),
      onSnapshot(doc(COL,"cleaners_h2"),    s=>{if(s.exists()&&s.data().val)setCleaners(s.data().val);}),
      onSnapshot(doc(COL,"cleaners_hist_h2"),s=>{if(s.exists()&&s.data().val)setCleanersHist(s.data().val);}),
      onSnapshot(doc(COL,"cleaners_sedim_h2"),s=>{if(s.exists()&&s.data().val)setSedim(s.data().val);}),
      onSnapshot(doc(COL,"historico_h2"),   s=>{if(s.exists()&&s.data().val)setHistorico(s.data().val);}),
      onSnapshot(doc(COL,"pendencias_h2"),  s=>{if(s.exists()&&s.data().val)setPendencias(s.data().val);}),
      onSnapshot(doc(COL,"seguranca_h2"),   s=>{if(s.exists()&&s.data().val)setSeguranca(s.data().val);}),
    ];
    return()=>unsubs.forEach(u=>u());
  },[]);

  function salvarAcidente(dias) {
    const novo={...seguranca,diasAcidente:dias};
    setSeguranca(novo); storageSet("seguranca_h2",novo); setModalAcid(false);
  }

  // semáforo operacional — determina cor do painel (usado no fundo)
  const ocM2=ocorrencias?.M2;
  const ocM3=ocorrencias?.M3;
  const hasCritico=ocM2?.cor==="vermelho"||ocM3?.cor==="vermelho";

  return(
    <div style={{background:C.bg,minHeight:"100vh",width:"100vw",fontFamily:"'Segoe UI',system-ui,sans-serif",color:C.text,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{`
        @keyframes led-d{0%,100%{opacity:1;box-shadow:0 0 6px #00E676,0 0 16px #00E67666;}50%{opacity:.5;box-shadow:0 0 3px #00E676;}}
        .led-d{animation:led-d 2.5s ease-in-out infinite;}
        @keyframes crit-pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
        .crit{animation:crit-pulse 1.2s ease-in-out infinite;}
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 24px",
        borderBottom:`1px solid ${C.border}`,background:"rgba(7,24,40,0.98)",backdropFilter:"blur(20px)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div className="led-d" style={{width:8,height:8,borderRadius:"50%",background:C.accentLight}}/>
          <span style={{fontSize:10,color:C.textMuted,letterSpacing:"0.2em",fontWeight:800}}>SECAGEM · H2</span>
          <div style={{width:1,height:20,background:C.border}}/>
          <span style={{fontSize:12,fontWeight:800,color:C.text}}>Dashboard Operacional</span>
          {hasCritico&&<span className="crit" style={{background:C.dangerLight+"22",border:`1px solid ${C.dangerLight}55`,
            color:C.dangerLight,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:800}}>🔴 CRÍTICO</span>}
        </div>
        <Relogio/>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {/* semáforo M2/M3 compacto no header */}
          {[["M2",ocM2],["M3",ocM3]].map(([mq,oc])=>{
            const cor=!oc?C.accentLight:oc.cor==="vermelho"?C.dangerLight:C.warningLight;
            const em=!oc?"🟢":oc.cor==="vermelho"?"🔴":"🟡";
            return<span key={mq} style={{fontSize:10,color:cor,fontWeight:700}}>{em} {mq}</span>;
          })}
          <div style={{width:1,height:20,background:C.border,margin:"0 4px"}}/>
          <button onClick={()=>setModoVisao("app")} style={{background:"rgba(80,144,255,0.12)",border:`1px solid ${C.blueLight}55`,
            color:C.blueLight,borderRadius:9,padding:"7px 14px",cursor:"pointer",fontSize:11,fontWeight:800}}>📱 App</button>
        </div>
      </div>

      {/* ── Banner segurança ──────────────────────────────────────────── */}
      <BannerSeguranca historicoData={historico} segurancaData={seguranca} onEditarAcidente={()=>setModalAcid(true)}/>

      {/* ── Grid 3×2 ─────────────────────────────────────────────────── */}
      <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gridTemplateRows:"1fr 1fr",gap:14,padding:14,overflow:"hidden"}}>
        <PainelMural       pendenciasData={pendencias} chamadosData={chamados}    setTela={setTela}/>
        <PainelChamados    chamadosData={chamados}                                setTela={setTela}/>
        <PainelCleaners    cleanersData={cleaners}     cleanersHistData={cleanersHist} setTela={setTela}/>
        <PainelTendencia   cleanersHistData={cleanersHist} sedimData={sedim}      setTela={setTela}/>
        <PainelAlturaUnits historicoData={historico}                              setTela={setTela}/>
        <PainelChecklists  historicoData={historico}                              setTela={setTela}/>
      </div>

      {/* ── Modal acidente ───────────────────────────────────────────── */}
      {modalAcid&&<ModalAcidente valor={seguranca?.diasAcidente??null} onSalvar={salvarAcidente} onFechar={()=>setModalAcid(false)}/>}
    </div>
  );
}
