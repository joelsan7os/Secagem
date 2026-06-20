// ─── cleaners.jsx — Módulo Cleaners (isolado) · Secagem H2 ────────────────────
// Maior gargalo da operação — mantido separado para evoluir sem inchar o app.
// Exporta: CleanersTela, RelatorioCleaners, gerarRelatoriosCleaners,
//          calcEficienciaCleaners, CLEANERS_TOTAL, CLEANERS_LIMITE.
import { useState } from "react";
import * as React from "react";
import { COL, doc, setDoc, getDoc } from "./firebase";

// ── Paleta (espelha o app) ──
const C = {
  bg:"#04111D", surface:"#071828", card:"#0A1929", cardHover:"#0E2847",
  accent:"#00E676", accentLight:"#00E676", accentDark:"#006B2E",
  blue:"#0E2847", blueLight:"#1A5CCC",
  warning:"#b87d00", warningLight:"#FFC107",
  danger:"#c0272d", dangerLight:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880", white:"#ffffff",
  border:"rgba(60,255,140,0.15)", tagBg:"rgba(255,255,255,0.04)", success:"#00E676",
};
const inputStyle={width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.white,fontSize:14,outline:"none"};
const btnSec={background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:9,padding:"9px 14px",cursor:"pointer",fontSize:12,fontWeight:700};

// ── Helpers de turno/letra (cópia local, mesma lógica do app) ──
const getAutoTurno=()=>{const h=new Date().getHours();if(h>=0&&h<8)return"00x08";if(h>=8&&h<16)return"08x16";return"16x24";};
const calcularLetra=()=>{const S=["E","D","A","B","C"];const BASE=new Date("2026-06-09T00:00:00");const a=new Date();const dias=Math.floor((a-BASE)/(1000*60*60*24));const bloco=Math.floor(dias/2)%5;const h=a.getHours();const t=h<8?0:h<16?1:2;return S[((bloco-t)%5+5)%5];};
const turnoDoHorario=(hhmm)=>{const h=parseInt((hhmm||"00:00").split(":")[0],10);return h<8?0:h<16?1:2;};

// ── Storage helpers (local + nuvem) ──
const storageGet=(k)=>{try{return JSON.parse(localStorage.getItem(k));}catch{return null;}};
const storageSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}try{setDoc(doc(COL,k),{val:v,ts:Date.now()});}catch{}};
const cloudGet=async(k)=>{try{const s=await getDoc(doc(COL,k));if(s.exists()){const d=s.data().val;try{localStorage.setItem(k,JSON.stringify(d));}catch{}return d;}}catch{}return storageGet(k);};

const CLEANERS_CONFIG=[
  {id:"c1",label:"Cleaners 1",garrafas:12,bomba:{M2:"32-11-0-30-08",M3:"33-11-0-30-08"}},
  {id:"c2",label:"Cleaners 2",garrafas:6, bomba:{M2:"32-11-0-30-09",M3:"33-11-0-30-09"}},
  {id:"c3",label:"Cleaners 3",garrafas:4, bomba:{M2:"32-11-0-30-10",M3:"33-11-0-30-10"}},
  {id:"c4",label:"Cleaners 4",garrafas:2, bomba:{M2:"32-11-0-30-11",M3:"33-11-0-30-11"}},
];
export const CLEANERS_TOTAL=CLEANERS_CONFIG.reduce((a,e)=>a+e.garrafas,0);
export const CLEANERS_LIMITE=70;
const CLEANERS_MOTIVOS=["Garrafa removida","Garrafa furada","Válvula com passagem","Falta de garrafa","Falta de válvula","Falta de vedação","Falta de visor","Entupida","Falta de material","Outro"];
const ESTOQUE_ITENS=[{id:"garrafa",label:"Garrafa"},{id:"valvula",label:"Válvula"},{id:"visor",label:"Visor"},{id:"bico",label:"Bico de porcelana"},{id:"vedacao",label:"Borracha de vedação"},{id:"pescoco",label:"Pescoço da válvula"}];

// ─── Relatório de Turno dos Cleaners ──────────────────────────────────────────
// Agrupa cleaners_hist_h2 por (data + turno + máquina). Conta movimentações.
export function gerarRelatoriosCleaners() {
  const hist = (()=>{ try{ return JSON.parse(localStorage.getItem("cleaners_hist_h2"))||[]; }catch{ return []; } })();
  if(!hist.length) return [];
  const grupos = {};
  hist.forEach(ev=>{
    if(!ev.data) return;
    const turno = ev.turno || "—";
    const maq = ev.maquina || "—";
    const chave = `${ev.data}|${turno}|${maq}`;
    if(!grupos[chave]) grupos[chave] = { data:ev.data, turno, maquina:maq, letra:ev.letra||"—", operadores:new Set(), removidas:0, desobstruidas:0, eventos:[] };
    const g = grupos[chave];
    if(ev.letra) g.letra = ev.letra;
    if(ev.operador) g.operadores.add(ev.operador);
    if(ev.status==="OPERANDO") g.desobstruidas += 1;       // voltou a operar = desobstruída/recolocada
    else g.removidas += 1;                                  // removida/sem garrafa
    g.eventos.push(ev);
  });
  return Object.values(grupos)
    .map(g=>({ ...g, operadores:Array.from(g.operadores), totalMov:g.removidas+g.desobstruidas }))
    .sort((a,b)=> b.data.localeCompare(a.data) || (b.turno||"").localeCompare(a.turno||""));
}

export function CleanersTela({eqState=[]}){
  const [modalBomba,setModalBomba]=useState(null);
  const [dados,setDados]=useState(()=>storageGet("cleaners_h2")||{M2:{},M3:{}});
  const [est,setEst]=useState(()=>storageGet("cleaners_estoque_h2")||{});
  React.useEffect(()=>{
    cloudGet("cleaners_h2").then(data=>{if(data)setDados(data);});
    cloudGet("cleaners_estoque_h2").then(data=>{if(data)setEst(data);});
  },[]);
  const [maq,setMaq]=useState("M2");
  const [selGest,setSelGest]=useState("Ambas");
  const [subAba,setSubAba]=useState("op");
  const [snapData,setSnapData]=useState(()=>new Date().toISOString().slice(0,10));
  const hoje=new Date().toISOString().slice(0,10);
  const [modalG,setModalG]=useState(null);
  const [mStatus,setMStatus]=useState("REMOVIDA");
  const [mMotivos,setMMotivos]=useState([]);
  const [mObs,setMObs]=useState("");
  const [editEst,setEditEst]=useState(null);
  const [modalRetorno,setModalRetorno]=useState(null);
  const [retornoItens,setRetornoItens]=useState([]);
  const cfg=storageGet("op_config")||{};
  const salvarD=(n)=>{setDados(n);storageSet("cleaners_h2",n);};
  const salvarE=(n)=>{setEst(n);storageSet("cleaners_estoque_h2",n);};
  const pushHist=(ev)=>{const h=storageGet("cleaners_hist_h2")||[];storageSet("cleaners_hist_h2",[...h,{...ev,turno:getAutoTurno(),letra:calcularLetra()}]);};
  const getNowCl=()=>{const a=new Date();return{data:a.toISOString().slice(0,10),hora:`${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`};};
  const eff=(m)=>{const fora=Object.keys(dados[m]||{}).length;return Math.round((CLEANERS_TOTAL-fora)/CLEANERS_TOTAL*100);};
  const effEst=(m,e)=>{const fora=Object.keys(dados[m]||{}).filter(k=>k.startsWith(e.id+"_")).length;return Math.round((e.garrafas-fora)/e.garrafas*100);};
  const effCor=(v)=>v>=90?C.accentLight:v>=CLEANERS_LIMITE?C.warningLight:C.dangerLight;
  const temPassagem=(g)=>{const ms=g?.motivos||[];const m=g?.motivo||"";return ms.includes("Válvula com passagem")||m==="Válvula com passagem";};
  const abrirModal=(estId,idx)=>{
    const g=dados[maq]?.[estId+"_"+idx];
    setMStatus(g?.status||"REMOVIDA");
    setMMotivos(g?.motivos||(g?.motivo?[g.motivo]:[]));
    setMObs(g?.obs||"");
    setModalG({estId,idx});
  };
  const salvarGarrafa=(operando)=>{
    const key=modalG.estId+"_"+modalG.idx;
    const{data,hora}=getNowCl();
    const novo={...dados,[maq]:{...dados[maq]}};
    if(operando){delete novo[maq][key];}
    else{novo[maq][key]={status:mStatus,motivos:mMotivos,motivo:mMotivos[0]||"",obs:mObs,data,hora,operador:cfg.nomeOperador||""};}
    salvarD(novo);
    pushHist({data,hora,maquina:maq,garrafa:key,status:operando?"OPERANDO":mStatus,motivo:mMotivos.join(", "),motivos:mMotivos,operador:cfg.nomeOperador||""});
    setModalG(null);setMMotivos([]);setMObs("");
  };
  const ajusteEst=(id,d)=>{
    const{data,hora}=getNowCl();
    const cur=est[id]||{qtd:0};
    salvarE({...est,[id]:{qtd:Math.max(0,(cur.qtd||0)+d),data,hora,operador:cfg.nomeOperador||""}});
  };
  const setQtdEst=(id,v)=>{
    const{data,hora}=getNowCl();
    salvarE({...est,[id]:{qtd:Math.max(0,parseInt(v)||0),data,hora,operador:cfg.nomeOperador||""}});
  };
  const hist=storageGet("cleaners_hist_h2")||[];
  const statsMotivos=hist.filter(h=>h.motivo).reduce((a,h)=>{a[h.motivo]=(a[h.motivo]||0)+1;return a;},{});
  const e2=eff("M2"),e3=eff("M3");
  const effGeral=Math.round((e2+e3)/2);
  const gStatusCor=(g)=>!g?C.success:g.status==="REMOVIDA"?C.danger:C.warning;
  return(
    <div>
      <div style={{display:"flex",alignItems:"baseline",gap:8}}>
        <h2 style={{color:C.white,fontSize:17,fontWeight:900,margin:0,letterSpacing:"0.04em"}}>GESTÃO CLEANERS</h2>
        <span style={{color:C.textDim,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase"}}>· Depuração H2</span>
      </div>
      <div style={{height:1,background:`linear-gradient(90deg,${C.accent}66,transparent)`,margin:"8px 0 12px"}}/>
      {/* Sub-abas */}
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {[{id:"op",l:"⚙ OP"},{id:"est",l:"📦 ESTOQUE"},{id:"hist",l:"📋 HISTÓRICO"}].map(a=>(
          <button key={a.id} onClick={()=>setSubAba(a.id)} style={{flex:1,padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:11,letterSpacing:"0.05em",background:subAba===a.id?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${subAba===a.id?"rgba(255,255,255,0.55)":C.border}`,color:subAba===a.id?"#fff":C.textMuted,boxShadow:subAba===a.id?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4)":"none"}}>{a.l}</button>
        ))}
      </div>
      {subAba==="op"?(
        <>
          {/* ── BARRA DE ALERTAS — PASSAGEM NA VÁLVULA ── */}
          {(()=>{
            const fmtG=key=>{const cfg=CLEANERS_CONFIG.find(c=>key?.startsWith(c.id+"_"));if(!cfg)return key||"?";return`G${key.replace(cfg.id+"_","")} · ${cfg.label}`;};
            const alertas=[];
            ["M2","M3"].forEach(mq=>Object.entries(dados[mq]||{}).forEach(([k,g])=>{if(temPassagem(g))alertas.push({key:k,mq,label:`${fmtG(k)} · ${mq}`});}));
            if(alertas.length===0)return null;
            return(
              <div style={{background:"rgba(255,82,82,0.1)",border:"1.5px solid #FF5252",borderRadius:10,padding:"7px 10px",marginBottom:10,animation:"trava-pulse 1.4s ease-in-out infinite"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                  <span style={{color:"#FF5252",fontSize:9,fontWeight:900,letterSpacing:"0.12em"}}>⚠ PASSAGEM NA VÁLVULA</span>
                  <span style={{background:"#FF5252",color:"#fff",borderRadius:20,padding:"0px 6px",fontSize:9,fontWeight:900,fontFamily:"monospace"}}>{alertas.length}</span>
                  <span style={{color:"#FF5252",fontSize:8,marginLeft:"auto",fontWeight:700}}>RISCO DE QUEIMADURA</span>
                </div>
                <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
                  {alertas.map(({key,mq,label})=>{
                    const estId=key.split("_")[0];const idx=parseInt(key.split("_")[1]);
                    return(
                      <button key={key} onClick={()=>{setMaq(mq);abrirModal(estId,idx);}} style={{flexShrink:0,background:"rgba(255,82,82,0.18)",border:"1px solid #FF525288",borderRadius:8,padding:"5px 10px",cursor:"pointer",color:"#FF5252",fontSize:10,fontWeight:800,whiteSpace:"nowrap"}}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
          {/* ── SELETOR DE DATA ── */}
          {(()=>{
            const isToday=snapData===hoje;
            const reconstruirSnap=(data)=>{const estado={M2:{},M3:{}};[...( storageGet("cleaners_hist_h2")||[])].sort((a,b)=>(a.data+a.hora).localeCompare(b.data+b.hora)).filter(ev=>ev.data<=data).forEach(ev=>{const m=ev.maquina;if(!m||!estado[m])return;if(ev.status==="REMOVIDA")estado[m][ev.garrafa]={status:"REMOVIDA",motivo:ev.motivo,motivos:ev.motivos||[]};else if(ev.status==="OPERANDO")delete estado[m][ev.garrafa];});return estado;};
            const dadosSnap=isToday?dados:reconstruirSnap(snapData);
            return(
              <div style={{background:C.card,border:`1px solid ${isToday?C.border:"#5090FF44"}`,borderTop:`2px solid ${isToday?C.accentLight:"#5090FF"}`,borderRadius:10,padding:"8px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
                <span style={{color:C.textDim,fontSize:9,fontWeight:800,letterSpacing:"0.08em",flexShrink:0}}>{isToday?"HOJE":"DATA"}</span>
                <input type="date" value={snapData} onChange={e=>setSnapData(e.target.value)} style={{flex:1,background:"transparent",border:"none",color:isToday?C.accentLight:"#5090FF",fontSize:12,fontWeight:800,fontFamily:"monospace",outline:"none",cursor:"pointer"}}/>
                {!isToday&&<button onClick={()=>setSnapData(hoje)} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,padding:"3px 8px",color:C.textDim,fontSize:9,cursor:"pointer"}}>Hoje</button>}
              </div>
            );
          })()}
          {/* ── CARDS M2 · M3 ── */}
          {(()=>{
            const histAll=storageGet("cleaners_hist_h2")||[];
            const isToday=snapData===hoje;
            const reconstruirSnap=(data)=>{const estado={M2:{},M3:{}};[...histAll].sort((a,b)=>(a.data+a.hora).localeCompare(b.data+b.hora)).filter(ev=>ev.data<=data).forEach(ev=>{const m=ev.maquina;if(!m||!estado[m])return;if(ev.status==="REMOVIDA")estado[m][ev.garrafa]={status:"REMOVIDA",motivo:ev.motivo,motivos:ev.motivos||[]};else if(ev.status==="OPERANDO")delete estado[m][ev.garrafa];});return estado;};
            const dadosSnap=isToday?dados:reconstruirSnap(snapData);
            // sparkline leve: agregar eficiência por dia dos últimos 7 dias
            const sparkDays=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return d.toISOString().slice(0,10);});
            const getSparkMaq=(mq)=>{
              const snap={M2:{},M3:{}};
              const sorted=[...histAll].sort((a,b)=>(a.data+a.hora).localeCompare(b.data+b.hora));
              return sparkDays.map(d=>{
                sorted.filter(ev=>ev.data===d).forEach(ev=>{if(!ev.maquina||ev.maquina!==mq)return;if(ev.status==="REMOVIDA")snap[mq][ev.garrafa]=1;else delete snap[mq][ev.garrafa];});
                return Math.round((CLEANERS_TOTAL-Object.keys(snap[mq]||{}).length)/CLEANERS_TOTAL*100);
              });
            };
            const MOTIVO_ICON={"Entupida":"🔧","Garrafa removida":"📤","Válvula com passagem":"💧","Garrafa furada":"💥","Falta de garrafa":"📦","Falta de válvula":"🔩","Falta de visor":"👁","Falta de vedação":"⭕","Falta de material":"📦","Outro":"❓"};
            return(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                {["M2","M3"].map(mq=>{
                  const sel=maq===mq;
                  const nFora=Object.keys(dadosSnap[mq]||{}).length;
                  const nOp=CLEANERS_TOTAL-nFora;
                  const effG=Math.round(nOp/CLEANERS_TOTAL*100);
                  const cor=effG>=90?C.accentLight:effG>=70?C.warningLight:C.dangerLight;
                  const histMq=histAll.filter(h=>h.maquina===mq);
                  const passagem=Object.values(dadosSnap[mq]||{}).filter(g=>temPassagem(g)).length;
                  const recentes=histMq.filter(h=>{try{const hd=new Date(h.data+"T"+(h.hora||"00:00"));return(Date.now()-hd)<86400000&&h.status==="REMOVIDA";}catch{return false;}}).length;
                  const hs=Math.max(0,100-nFora*4-passagem*10-recentes*3);
                  const hsCor=hs>=70?C.accentLight:hs>=40?C.warningLight:C.dangerLight;
                  const motCont={};
                  // motivos do estado atual (garrafas fora agora)
                  Object.values(dadosSnap[mq]||{}).forEach(g=>(g?.motivos||(g?.motivo?[g.motivo]:[])).filter(Boolean).forEach(m=>{motCont[m]=(motCont[m]||0)+1;}));
                  // motivos do histórico (acumulado)
                  histMq.filter(h=>h.status!=="OPERANDO").forEach(h=>(h.motivos||(h.motivo?[h.motivo]:[])).filter(Boolean).forEach(m=>{motCont[m]=(motCont[m]||0)+1;}));
                  const top2=Object.entries(motCont).sort((a,b)=>b[1]-a[1]).slice(0,2);
                  const spark=getSparkMaq(mq);
                  const r=38,circ=2*Math.PI*r;
                  const fillOp=circ*(nOp/CLEANERS_TOTAL);
                  const fillFora=circ*(nFora/CLEANERS_TOTAL);
                  const W2=72,H2=24,mn=Math.max(0,Math.min(...spark)-5),mx=Math.min(100,Math.max(...spark)+5),rng=mx-mn||1;
                  const pts=spark.map((v,i)=>`${(i/(spark.length-1))*W2},${H2-(v-mn)/rng*H2}`).join(" ");
                  return(
                    <div key={mq} onClick={()=>setMaq(mq)} style={{background:sel?`linear-gradient(160deg,${C.card},${cor}18)`:C.card,border:`2px solid ${sel?cor:C.border}`,borderTop:`3px solid ${cor}`,borderRadius:14,padding:"12px 10px",cursor:"pointer",boxShadow:sel?`0 0 18px ${cor}33`:"none",transition:"all .25s"}}>
                      {/* título + seleção */}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <span style={{color:sel?cor:C.textDim,fontSize:9,fontWeight:900,letterSpacing:"0.14em"}}>MÁQ {mq.replace("M","")}</span>
                        {sel&&<span style={{background:`${cor}22`,border:`1px solid ${cor}55`,color:cor,borderRadius:20,padding:"1px 7px",fontSize:8,fontWeight:800}}>SELECIONADA</span>}
                      </div>
                      {/* gauge bicolor SVG */}
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                        <svg width={84} height={84} viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9"/>
                          <circle cx="50" cy="50" r={r} fill="none" stroke={C.accentLight} strokeWidth="9" strokeDasharray={`${fillOp} ${circ}`} strokeLinecap="butt" strokeDashoffset={circ*0.25} style={{filter:`drop-shadow(0 0 3px ${C.accentLight}88)`,transition:"stroke-dasharray .6s"}}/>
                          {nFora>0&&<circle cx="50" cy="50" r={r} fill="none" stroke={C.warningLight} strokeWidth="9" strokeDasharray={`${fillFora} ${circ}`} strokeLinecap="butt" strokeDashoffset={circ*0.25-fillOp} style={{filter:`drop-shadow(0 0 3px ${C.warningLight}88)`,transition:"stroke-dasharray .6s"}}/>}
                          <text x="50" y="47" textAnchor="middle" fontSize="18" fontWeight="900" fill={cor} fontFamily="monospace">{effG}</text>
                          <text x="50" y="59" textAnchor="middle" fontSize="9" fill={C.textDim}>%</text>
                        </svg>
                        <div style={{flex:1}}>
                          <div style={{marginBottom:5}}>
                            <div style={{color:C.accentLight,fontWeight:900,fontSize:16,fontFamily:"monospace",lineHeight:1}}>{nOp}<span style={{color:C.textDim,fontSize:10}}>/{CLEANERS_TOTAL}</span></div>
                            <div style={{color:C.textDim,fontSize:8}}>Operando</div>
                          </div>
                          <div>
                            <div style={{color:nFora>0?C.warningLight:C.textDim,fontWeight:900,fontSize:13,fontFamily:"monospace",lineHeight:1}}>{nFora}</div>
                            <div style={{color:C.textDim,fontSize:8}}>Fora de op.</div>
                          </div>
                        </div>
                      </div>
                      {/* sparkline */}
                      {spark.length>=2&&(
                        <div style={{background:C.tagBg,borderRadius:8,padding:"6px 8px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <div style={{color:C.textDim,fontSize:8,letterSpacing:"0.06em"}}>7 dias</div>
                          <svg width={W2} height={H2}>
                            <polyline points={pts} fill="none" stroke={cor} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" style={{filter:`drop-shadow(0 0 3px ${cor}66)`}}/>
                            <circle cx={W2} cy={H2-(spark[spark.length-1]-mn)/rng*H2} r="2.5" fill={cor}/>
                          </svg>
                          <div style={{color:cor,fontFamily:"monospace",fontWeight:900,fontSize:11}}>{spark[spark.length-1]}%</div>
                        </div>
                      )}
                      {/* motivos */}
                      {top2.length>0&&(
                        <div>
                          <div style={{color:C.textDim,fontSize:8,letterSpacing:"0.08em",marginBottom:4}}>MOTIVOS</div>
                          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                            {top2.map(([m,n])=>(
                              <div key={m} style={{display:"flex",alignItems:"center",gap:4,background:C.tagBg,borderRadius:8,padding:"3px 7px"}}>
                                <div style={{color:C.textMuted,fontSize:8,lineHeight:1.2}}>{m}</div>
                                <div style={{color:cor,fontFamily:"monospace",fontWeight:900,fontSize:11,marginLeft:2}}>{n}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
          {/* Estágios */}
          {(()=>{
            const isToday=snapData===hoje;
            const reconstruirSnap=(data)=>{const estado={M2:{},M3:{}};[...(storageGet("cleaners_hist_h2")||[])].sort((a,b)=>(a.data+a.hora).localeCompare(b.data+b.hora)).filter(ev=>ev.data<=data).forEach(ev=>{const m=ev.maquina;if(!m||!estado[m])return;if(ev.status==="REMOVIDA")estado[m][ev.garrafa]={status:"REMOVIDA",motivo:ev.motivo,motivos:ev.motivos||[]};else if(ev.status==="OPERANDO")delete estado[m][ev.garrafa];});return estado;};
            const dadosSnap=isToday?dados:reconstruirSnap(snapData);
            const effEstSnap=(m,e)=>{const fora=Object.keys(dadosSnap[m]||{}).filter(k=>k.startsWith(e.id+"_")).length;return Math.round((e.garrafas-fora)/e.garrafas*100);};
            return CLEANERS_CONFIG.map(e=>{
            const ev=effEstSnap(maq,e);
            const bombaTag=(e.bomba&&e.bomba[maq])||"";
            const todosEq=[...(eqState.comum||[]),...(eqState.m2||[]),...(eqState.m3||[]),...(eqState.cs_m2||[]),...(eqState.cs_m3||[]),...(eqState.enf_m2||[]),...(eqState.enf_m3||[])];
            const eqBomba=bombaTag?todosEq.find(eq=>eq.nome&&(eq.nome.includes(bombaTag)||bombaTag.includes(eq.nome.replace(/[^0-9-]/g,"")))):null;
            const bombaManut=eqBomba&&(eqBomba.status==="MANUTENÇÃO"||eqBomba.status==="ALERTA"||(eqBomba.notas||[]).length>0);
            return(
              <div key={e.id} style={{background:C.card,border:`1px solid ${bombaManut?C.dangerLight+"44":C.border}`,borderLeft:`3px solid ${effCor(ev)}`,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{color:C.text,fontWeight:800,fontSize:13}}>{e.label}</span>
                  <span style={{color:effCor(ev),fontWeight:900,fontSize:14,fontFamily:"monospace"}}>{e.garrafas-Object.keys(dadosSnap[maq]||{}).filter(k=>k.startsWith(e.id+"_")).length}/{e.garrafas} · {ev}%</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <code style={{color:"#8FB8E8",fontSize:9,letterSpacing:"0.05em",background:"rgba(14,40,71,0.65)",border:"1px solid rgba(80,144,255,0.25)",borderRadius:4,padding:"1px 6px",fontWeight:700}}>Bomba {bombaTag}</code>
                  {bombaManut&&(
                    <button onClick={()=>setModalBomba(eqBomba)} style={{background:`${C.dangerLight}22`,border:`1px solid ${C.dangerLight}55`,borderRadius:6,padding:"1px 7px",cursor:"pointer",display:"flex",alignItems:"center",gap:3,animation:"trava-pulse 1.8s ease-in-out infinite"}}>
                      <span style={{fontSize:11}}>📋</span>
                      <span style={{color:C.dangerLight,fontSize:9,fontWeight:800}}>{eqBomba.status}</span>
                    </button>
                  )}
                </div>
                <div style={{marginTop:10,overflowX:"auto"}}>
                  {(()=>{
                    const W=36,GAP=4,H=70;
                    const total=e.garrafas;
                    const totalW=total*(W+GAP)-GAP+2;
                    return(
                      <svg width={totalW} height={H+30} style={{display:"block",cursor:"pointer"}}>
                        {/* header bar */}
                        <rect x={0} y={8} width={totalW} height={10} rx={2} fill={`rgba(100,150,255,0.25)`} stroke="rgba(100,150,255,0.5)" strokeWidth={1}/>
                        {Array.from({length:total},(_,i)=>{
                          const g=dadosSnap[maq]?.[e.id+"_"+(i+1)];
                          const passagem=temPassagem(g);
                          const cx=(W+GAP)*i+W/2;
                          const dotCor=!g?C.accentLight:passagem?C.dangerLight:C.warningLight;
                          return(
                            <g key={i} onClick={()=>abrirModal(e.id,i+1)} style={{cursor:"pointer",animation:passagem?"trava-pulse 1s ease-in-out infinite":"none"}}>
                              {/* cone cinza */}
                              <polygon points={`${(W+GAP)*i},18 ${(W+GAP)*i+W},18 ${cx},${H}`} fill="rgba(120,140,160,0.13)" stroke="rgba(160,180,200,0.35)" strokeWidth={1.5}/>
                              {/* slot header */}
                              <rect x={(W+GAP)*i+W*0.3} y={8} width={W*0.4} height={10} fill="rgba(4,17,29,0.9)"/>
                              {/* dot status — maior, colorido */}
                              <circle cx={cx} cy={H-20} r={7} fill={dotCor} opacity={0.95} style={{filter:`drop-shadow(0 0 4px ${dotCor})`}}/>
                              {/* número abaixo da barra coletora */}
                              <text x={cx} y={H+20} textAnchor="middle" fontSize={10} fontWeight="900" fill="rgba(160,180,200,0.7)">{i+1}</text>
                            </g>
                          );
                        })}
                        {/* collector pipe */}
                        <rect x={0} y={H} width={totalW} height={10} rx={4} fill="rgba(100,150,255,0.2)" stroke="rgba(100,150,255,0.4)" strokeWidth={1}/>
                      </svg>
                    );
                  })()}
                </div>
              </div>
            );
          });
          })()}
          {/* Estatística de motivos */}
          {Object.keys(statsMotivos).length>0&&(
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`2px solid #B388FF`,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
              <div style={{color:"#B388FF",fontWeight:800,fontSize:11,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:8}}>📊 Estatística de Motivos (acumulado)</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {Object.entries(statsMotivos).sort((a,b)=>b[1]-a[1]).map(([m,n])=>(
                  <span key={m} style={{background:C.tagBg,border:`1px solid ${C.border}`,borderRadius:20,padding:"3px 10px",fontSize:10,color:C.textMuted}}><b style={{color:C.warningLight,fontFamily:"monospace"}}>{n}</b> {m}</span>
                ))}
              </div>
            </div>
          )}
        </>
      ):subAba==="est"?(
        <>
          {/* ESTOQUE */}
          <div style={{color:C.textDim,fontSize:10,marginBottom:10,lineHeight:1.5}}>Estoque comum às duas máquinas. Atualize ao usar ou receber material.</div>
          {ESTOQUE_ITENS.map(it=>{
            const d=est[it.id]||{};
            const qtd=d.qtd||0;
            return(
              <div key={it.id} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${qtd===0?C.dangerLight:C.accentLight}`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{color:C.text,fontWeight:700,fontSize:13}}>{it.label}</div>
                  {d.data&&<div style={{color:C.textDim,fontSize:9,marginTop:3}}>últ: {d.data.split("-").reverse().slice(0,2).join("/")} {d.hora}{d.operador?` · ${d.operador}`:""}</div>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button onClick={()=>ajusteEst(it.id,-1)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.border}`,background:C.tagBg,color:C.text,fontSize:18,fontWeight:700,cursor:"pointer",lineHeight:1}}>−</button>
                  {editEst===it.id?(
                    <input autoFocus type="text" inputMode="numeric" defaultValue={qtd}
                      onBlur={e=>{setQtdEst(it.id,e.target.value);setEditEst(null);}}
                      onKeyDown={e=>{if(e.key==="Enter"){setQtdEst(it.id,e.target.value);setEditEst(null);}}}
                      style={{...inputStyle,width:54,textAlign:"center",padding:"5px",fontSize:15,fontWeight:900}}/>
                  ):(
                    <button onClick={()=>setEditEst(it.id)} style={{minWidth:54,padding:"5px 8px",borderRadius:8,border:`1px solid ${qtd===0?C.dangerLight+"66":C.border}`,background:C.tagBg,cursor:"pointer",textAlign:"center"}}>
                      <span style={{color:qtd===0?C.dangerLight:C.text,fontWeight:900,fontSize:16,fontFamily:"monospace"}}>{qtd}</span>
                      <span style={{color:C.textDim,fontSize:8,display:"block"}}>un.</span>
                    </button>
                  )}
                  <button onClick={()=>ajusteEst(it.id,1)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.border}`,background:C.tagBg,color:C.text,fontSize:18,fontWeight:700,cursor:"pointer",lineHeight:1}}>+</button>
                </div>
              </div>
            );
          })}
        </>
      ):(
        /* ── HISTÓRICO ── */
        <>
          {(()=>{
            const histAll=(storageGet("cleaners_hist_h2")||[]).slice().reverse();
            const ITENS_LABEL={garrafa:"Garrafa",valvula:"Válvula",visor:"Visor",bico:"Bico de porcelana",vedacao:"Borracha de vedação",pescoco:"Pescoço da válvula",desentupida:"Desentupida"};
            const fmtGar=key=>{const cfg=CLEANERS_CONFIG.find(c=>key?.startsWith(c.id+"_"));if(!cfg)return key||"—";return`${cfg.label} · G${key.replace(cfg.id+"_","")}`;}
            const fmtD=d=>{if(!d)return"—";const[y,m,dia]=d.split("-");return`${dia}/${m}`;};
            return histAll.length===0?(
              <div style={{textAlign:"center",color:C.textDim,padding:"40px 0",fontSize:12}}>Nenhum evento registrado ainda.</div>
            ):histAll.map((ev,i)=>{
              const rem=ev.status==="REMOVIDA";
              const cor=rem?C.dangerLight:C.accentLight;
              const subs=(ev.itensSubstituidos||[]).map(id=>ITENS_LABEL[id]||id).filter(Boolean);
              const motivos=ev.motivos||(ev.motivo?[ev.motivo]:[]);
              return(
                <div key={i} style={{display:"flex",gap:10,marginBottom:10}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:`${cor}22`,border:`2px solid ${cor}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{rem?"🔴":"✅"}</div>
                    {i<histAll.length-1&&<div style={{width:2,flex:1,minHeight:16,background:C.border,marginTop:2}}/>}
                  </div>
                  <div style={{flex:1,background:C.card,border:`1px solid ${cor}22`,borderLeft:`3px solid ${cor}`,borderRadius:10,padding:"9px 11px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{color:cor,fontWeight:900,fontSize:11}}>{fmtGar(ev.garrafa)}</span>
                      <span style={{color:C.textDim,fontFamily:"monospace",fontSize:9}}>{fmtD(ev.data)} {ev.hora||""} · {ev.maquina}</span>
                    </div>
                    <div style={{color:C.text,fontWeight:700,fontSize:10,marginBottom:motivos.length>0?3:0}}>{rem?"Removida":"Retornou à operação"}</div>
                    {motivos.length>0&&<div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:3}}>{motivos.map(m=>(<span key={m} style={{background:m==="Válvula com passagem"?"rgba(255,82,82,0.15)":"rgba(255,193,7,0.1)",border:`1px solid ${m==="Válvula com passagem"?"#FF5252":"rgba(255,193,7,0.4)"}`,color:m==="Válvula com passagem"?"#FF5252":C.warningLight,borderRadius:20,padding:"1px 7px",fontSize:9,fontWeight:700}}>{m}</span>))}</div>}
                    {subs.length>0&&<div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:3}}>{subs.map(s=>(<span key={s} style={{background:"rgba(0,230,118,0.1)",border:"1px solid rgba(0,230,118,0.3)",color:C.accentLight,borderRadius:20,padding:"1px 7px",fontSize:9,fontWeight:700}}>🔧 {s}</span>))}</div>}
                    {ev.obs&&<div style={{color:C.textDim,fontSize:9,fontStyle:"italic"}}>"{ev.obs}"</div>}
                    <div style={{display:"flex",gap:8,marginTop:3}}>
                      {ev.operador&&<span style={{color:C.textDim,fontSize:9}}>👤 {ev.operador}</span>}
                      {ev.letra&&<span style={{color:C.textDim,fontSize:9}}>Letra {ev.letra}</span>}
                      {ev.turno&&<span style={{color:C.textDim,fontSize:9}}>{ev.turno}</span>}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </>
      )}
      {/* Modal bomba em manutenção */}
      {modalBomba&&(
        <div onClick={()=>setModalBomba(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.dangerLight}44`,borderRadius:"18px 18px 0 0",padding:22,width:"100%",maxWidth:600,maxHeight:"70vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{color:C.dangerLight,fontWeight:900,fontSize:14}}>🔧 {modalBomba.nome}</div>
                <div style={{color:C.textDim,fontSize:11,marginTop:2}}>Status: <span style={{color:modalBomba.status==="MANUTENÇÃO"?C.dangerLight:C.warningLight,fontWeight:800}}>{modalBomba.status}</span></div>
              </div>
              <button onClick={()=>setModalBomba(null)} style={{background:"transparent",border:"none",color:C.textDim,fontSize:20,cursor:"pointer"}}>✕</button>
            </div>
            {(modalBomba.notas||[]).length>0?(
              <div>
                <div style={{color:C.textDim,fontSize:9,fontWeight:800,letterSpacing:"0.1em",marginBottom:8}}>NOTAS / OCORRÊNCIAS</div>
                {(modalBomba.notas||[]).map((n,i)=>(
                  <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.dangerLight}`,borderRadius:9,padding:"9px 12px",marginBottom:7}}>
                    <div style={{color:C.text,fontSize:11,fontWeight:700,marginBottom:3}}>{n.titulo||n.desc||"Sem descrição"}</div>
                    {n.obs&&<div style={{color:C.textDim,fontSize:10}}>{n.obs}</div>}
                    {n.data&&<div style={{color:C.textDim,fontSize:9,marginTop:4,fontFamily:"monospace"}}>{n.data} {n.hora||""}</div>}
                  </div>
                ))}
              </div>
            ):(
              <div style={{color:C.textDim,fontSize:11,fontStyle:"italic"}}>Equipamento em {modalBomba.status} — sem notas registradas.</div>
            )}
          </div>
        </div>
      )}
      {/* Modal garrafa */}
      {modalG&&(
        <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setModalG(null)}>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"18px 18px 0 0",padding:22,width:"100%",maxWidth:600,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{color:C.white,fontWeight:800,fontSize:14,marginBottom:2}}>🌀 {CLEANERS_CONFIG.find(c=>c.id===modalG.estId)?.label} — Garrafa {modalG.idx}</div>
            <div style={{color:C.textDim,fontSize:11,marginBottom:10}}>Máquina {maq.replace("M","")}</div>
            {/* diagrama de componentes */}
            {(()=>{
              const key=modalG.estId+"_"+modalG.idx;
              const compEm=(storageGet("comp_em_h2")||{})[maq+":"+key]||{};
              const fmtTs=ts=>{if(!ts)return"sem registro";const[d,t]=(ts||"").split("T");if(!d)return"sem registro";const[y,m,dia]=d.split("-");return`${dia}/${m} ${(t||"").slice(0,5)}`;};
              const comps=[
                {id:"garrafa",l:"Corpo",desc:"Garrafa (corpo principal)",cor:"#5090FF"},
                {id:"visor",l:"Visor",desc:"Visor de inspeção",cor:"#00E676"},
                {id:"bico",l:"Bico",desc:"Cone de cerâmica",cor:"#B388FF"},
                {id:"valvula",l:"Válvula",desc:"Válvula",cor:"#FF8C00"},
              ];
              return(
                <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:12}}>
                  <div style={{color:C.textDim,fontSize:8,fontWeight:800,letterSpacing:"0.1em",marginBottom:8}}>RASTREABILIDADE DE COMPONENTES</div>
                  {/* mini diagrama SVG */}
                  <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
                    <svg width={80} height={110} viewBox="0 0 80 110">
                      {/* corpo/garrafa */}
                      <polygon points="10,10 70,10 55,75 25,75" fill="rgba(80,144,255,0.15)" stroke={compEm.garrafa?"#5090FF":"rgba(80,144,255,0.3)"} strokeWidth={1.5}/>
                      {/* visor */}
                      <rect x={28} y={30} width={24} height={10} rx={2} fill={compEm.visor?"rgba(0,230,118,0.25)":"rgba(0,230,118,0.08)"} stroke={compEm.visor?"#00E676":"rgba(0,230,118,0.3)"} strokeWidth={1.5}/>
                      {/* bico */}
                      <polygon points="33,75 47,75 43,95 37,95" fill={compEm.bico?"rgba(179,136,255,0.25)":"rgba(179,136,255,0.08)"} stroke={compEm.bico?"#B388FF":"rgba(179,136,255,0.3)"} strokeWidth={1.5}/>
                      {/* válvula */}
                      <rect x={20} y={6} width={40} height={6} rx={2} fill={compEm.valvula?"rgba(255,140,0,0.25)":"rgba(255,140,0,0.08)"} stroke={compEm.valvula?"#FF8C00":"rgba(255,140,0,0.3)"} strokeWidth={1.5}/>
                      {/* labels */}
                      <text x={40} y={5} textAnchor="middle" fontSize={6} fill="#FF8C00" fontWeight="700">VÁL</text>
                      <text x={40} y={40} textAnchor="middle" fontSize={6} fill="#00E676" fontWeight="700">VSR</text>
                      <text x={40} y={55} textAnchor="middle" fontSize={6} fill="#5090FF" fontWeight="700">CORPO</text>
                      <text x={40} y={90} textAnchor="middle" fontSize={6} fill="#B388FF" fontWeight="700">BICO</text>
                    </svg>
                  </div>
                  {/* lista de componentes */}
                  {comps.map(({id,l,desc,cor})=>(
                    <div key={id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:compEm[id]?cor:"rgba(255,255,255,0.15)",boxShadow:compEm[id]?`0 0 5px ${cor}`:"none",flexShrink:0}}/>
                      <span style={{color:C.text,fontSize:10,fontWeight:700,minWidth:45}}>{l}</span>
                      <span style={{flex:1,color:compEm[id]?C.accentLight:C.textDim,fontSize:9,fontFamily:"monospace"}}>desde {fmtTs(compEm[id])}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {[{s:"OP",l:"✓ Operando",c:C.success},{s:"REMOVIDA",l:"Removida",c:C.danger},{s:"ISOLADA",l:"Isolada",c:C.warning}].map(({s,l,c})=>(
                <button key={s} onClick={()=>s==="OP"?(()=>{setModalRetorno(modalG);setRetornoItens([]);setModalG(null);})():setMStatus(s)} style={{flex:1,padding:"10px 6px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:11,background:(s!=="OP"&&mStatus===s)?c:C.tagBg,border:`1.5px solid ${(s!=="OP"&&mStatus===s)?c:C.border}`,color:(s!=="OP"&&mStatus===s)?"#fff":C.textMuted}}>{l}</button>
              ))}
            </div>
            {temPassagem(dados[maq]?.[modalG.estId+"_"+modalG.idx])&&(
              <div style={{background:"rgba(255,82,82,0.15)",border:"1.5px solid #FF5252",borderRadius:10,padding:"8px 12px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>⚠️</span>
                <div>
                  <div style={{color:"#FF5252",fontWeight:900,fontSize:12}}>RISCO DE QUEIMADURA</div>
                  <div style={{color:"#FF5252",fontSize:10}}>Válvula com passagem · Não manusear</div>
                </div>
              </div>
            )}
            <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Motivo <span style={{color:C.textDim,fontSize:9,fontWeight:400,textTransform:"none"}}>(selecione um ou mais)</span></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:12}}>
              {CLEANERS_MOTIVOS.map(m=>{
                const sel=mMotivos.includes(m);
                const isPassagem=m==="Válvula com passagem";
                return(<button key={m} onClick={()=>setMMotivos(p=>sel?p.filter(x=>x!==m):[...p,m])} style={{padding:"8px 8px",borderRadius:8,cursor:"pointer",fontWeight:sel?700:400,fontSize:11,textAlign:"left",background:sel?(isPassagem?"rgba(255,82,82,0.2)":"rgba(255,193,7,0.15)"):C.tagBg,border:`1px solid ${sel?(isPassagem?"#FF5252":C.warningLight):C.border}`,color:sel?(isPassagem?"#FF5252":C.warningLight):C.textMuted}}>{m}</button>);
              })}
            </div>
            <textarea value={mObs} onChange={e=>setMObs(e.target.value)} rows={2} placeholder="Observação opcional..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit",marginBottom:12}}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setModalG(null);setMMotivos([]);setMObs("");}} style={{...btnSec,flex:1,padding:13,fontSize:13}}>Cancelar</button>
              <button disabled={mMotivos.length===0} onClick={()=>salvarGarrafa(false)} style={{flex:2,padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,background:mStatus==="REMOVIDA"?C.danger:C.warning,border:"none",color:"#fff",opacity:mMotivos.length===0?0.4:1}}>Confirmar {mStatus==="REMOVIDA"?"Remoção":"Isolamento"}</button>
            </div>
          </div>
        </div>
      )}
      {modalRetorno&&(
        <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{background:C.surface,border:`1px solid ${C.accentLight}33`,borderRadius:"18px 18px 0 0",padding:22,width:"100%",maxWidth:600}}>
            <div style={{color:C.accentLight,fontWeight:800,fontSize:14,marginBottom:4}}>✓ Retornando à operação</div>
            <div style={{color:C.textDim,fontSize:11,marginBottom:10}}>O que foi realizado? (selecione tudo que se aplica)</div>
            {/* atalho desentupida */}
            <button onClick={()=>setRetornoItens(p=>p.includes("desentupida")?p.filter(x=>x!=="desentupida"):[...p.filter(x=>x!=="desentupida"),"desentupida"])} style={{width:"100%",padding:"9px",borderRadius:9,marginBottom:6,cursor:"pointer",fontWeight:800,fontSize:12,background:retornoItens.includes("desentupida")?"rgba(0,230,118,0.15)":C.tagBg,border:`1.5px solid ${retornoItens.includes("desentupida")?C.accentLight:C.border}`,color:retornoItens.includes("desentupida")?C.accentLight:C.textMuted}}>
              {retornoItens.includes("desentupida")?"✓ Desentupida":"🔧 Desentupida (sem troca de peças)"}
            </button>
            <button onClick={()=>setRetornoItens(p=>p.length===5?[]:["garrafa","visor","bico","valvula","pescoco"])} style={{width:"100%",padding:"9px",borderRadius:9,marginBottom:10,cursor:"pointer",fontWeight:800,fontSize:12,background:retornoItens.length===5?"rgba(0,230,118,0.15)":C.tagBg,border:`1.5px solid ${retornoItens.length===5?C.accentLight:C.border}`,color:retornoItens.length===5?C.accentLight:C.textMuted}}>
              {retornoItens.length===5?"✓ Garrafa nova (tudo selecionado)":"⚡ Garrafa nova — selecionar todos os componentes"}
            </button>
            {[
              {id:"garrafa",l:"Trocado garrafa",est:"garrafa"},
              {id:"visor",l:"Trocado visor",est:"visor"},
              {id:"bico",l:"Trocado cone de cerâmica",est:"bico"},
              {id:"valvula",l:"Trocada válvula",est:"valvula"},
              {id:"pescoco",l:"Trocado pescoço da válvula",est:"pescoco"},
            ].map(it=>{
              const sel=retornoItens.includes(it.id);
              const qtdEst=(est[it.est]?.qtd||0);
              return(
                <button key={it.id} onClick={()=>setRetornoItens(p=>sel?p.filter(x=>x!==it.id):[...p,it.id])}
                  style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:9,marginBottom:6,cursor:"pointer",
                    background:sel?"rgba(0,230,118,0.1)":C.tagBg,border:`1.5px solid ${sel?C.accentLight:C.border}`,color:sel?C.accentLight:C.textMuted,fontWeight:sel?700:400,fontSize:12,textAlign:"left"}}>
                  <span>{it.l}</span>
                  <span style={{fontSize:10,color:qtdEst===0?C.dangerLight:C.textDim}}>estoque: {qtdEst}</span>
                </button>
              );
            })}
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button onClick={()=>{
                const{data,hora}=getNowCl();
                const novo={...dados,[maq]:{...dados[maq]}};
                delete novo[maq][modalRetorno.estId+"_"+modalRetorno.idx];
                salvarD(novo);
                if(retornoItens.length>0){
                  const novoEst={...est};
                  retornoItens.forEach(id=>{const cur=novoEst[id]||{qtd:0};novoEst[id]={...cur,qtd:Math.max(0,(cur.qtd||0)-1),data,hora,operador:cfg.nomeOperador||""};});
                  salvarE(novoEst);
                }
                pushHist({data,hora,maquina:maq,garrafa:modalRetorno.estId+"_"+modalRetorno.idx,status:"OPERANDO",itensSubstituidos:retornoItens,operador:cfg.nomeOperador||""});
                // gravar timestamps de componentes instalados
                {const ts=`${data}T${hora}`;
                const ALL_COMP=["garrafa","visor","bico","valvula","pescoco"];
                const ids=retornoItens.length>0?retornoItens:ALL_COMP;
                const keyG=modalRetorno.estId+"_"+modalRetorno.idx;
                const compAtual=storageGet("comp_em_h2")||{};
                const chave=maq+":"+keyG;
                const novoComp={...(compAtual[chave]||{})};
                ids.forEach(id=>{novoComp[id]=ts;});
                storageSet("comp_em_h2",{...compAtual,[chave]:novoComp});}
                setModalRetorno(null);setRetornoItens([]);
              }} style={{flex:1,padding:12,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:13,background:C.success,border:"none",color:"#fff"}}>✓ Confirmar</button>
              <button onClick={()=>{setModalRetorno(null);setRetornoItens([]);}} style={{...btnSec,padding:12,fontSize:13}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export function RelatorioCleaners(){return null;}
