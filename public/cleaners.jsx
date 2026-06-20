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

export function CleanersTela(){
  const [dados,setDados]=useState(()=>storageGet("cleaners_h2")||{M2:{},M3:{}});
  const [est,setEst]=useState(()=>storageGet("cleaners_estoque_h2")||{});
  React.useEffect(()=>{
    cloudGet("cleaners_h2").then(data=>{if(data)setDados(data);});
    cloudGet("cleaners_estoque_h2").then(data=>{if(data)setEst(data);});
  },[]);
  const [maq,setMaq]=useState("M2");
  const [selGest,setSelGest]=useState("Ambas");
  const [subAba,setSubAba]=useState("op");
  const [modalG,setModalG]=useState(null);
  const [mStatus,setMStatus]=useState("REMOVIDA");
  const [mMotivo,setMMotivo]=useState("");
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
  const abrirModal=(estId,idx)=>{
    const g=dados[maq]?.[estId+"_"+idx];
    setMStatus(g?.status||"REMOVIDA");setMMotivo(g?.motivo||"");setMObs(g?.obs||"");
    setModalG({estId,idx});
  };
  const salvarGarrafa=(operando)=>{
    const key=modalG.estId+"_"+modalG.idx;
    const{data,hora}=getNowCl();
    const novo={...dados,[maq]:{...dados[maq]}};
    if(operando){delete novo[maq][key];}
    else{novo[maq][key]={status:mStatus,motivo:mMotivo,obs:mObs,data,hora,operador:cfg.nomeOperador||""};}
    salvarD(novo);
    pushHist({data,hora,maquina:maq,garrafa:key,status:operando?"OPERANDO":mStatus,motivo:operando?"":mMotivo,operador:cfg.nomeOperador||""});
    setModalG(null);setMMotivo("");setMObs("");
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
        {[{id:"op",l:"⚙ OPERAÇÃO"},{id:"est",l:"📦 ESTOQUE"}].map(a=>(
          <button key={a.id} onClick={()=>setSubAba(a.id)} style={{flex:1,padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:11,letterSpacing:"0.05em",background:subAba===a.id?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${subAba===a.id?"rgba(255,255,255,0.55)":C.border}`,color:subAba===a.id?"#fff":C.textMuted,boxShadow:subAba===a.id?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4)":"none"}}>{a.l}</button>
        ))}
      </div>
      {subAba==="op"?(
        <>
          {/* ── GESTÃO CLEANERS ── */}
          {(()=>{
            const maqsFilt=selGest==="Ambas"?["M2","M3"]:[selGest];
            const hist=(storageGet("cleaners_hist_h2")||[]).filter(h=>maqsFilt.includes(h.maquina));
            const totalG=CLEANERS_TOTAL*(selGest==="Ambas"?2:1);
            const foraKeys=new Set();
            maqsFilt.forEach(m=>Object.keys(dados[m]||{}).forEach(k=>foraKeys.add(m+":"+k)));
            const nFora=foraKeys.size;
            const nOp=totalG-nFora;
            const effG=Math.round(nOp/totalG*100);
            const corG=effG>=90?C.accentLight:effG>=70?C.warningLight:C.dangerLight;
            // ranking motivos
            const motCont={};
            hist.filter(h=>h.status!=="OPERANDO"&&h.motivo).forEach(h=>{motCont[h.motivo]=(motCont[h.motivo]||0)+1;});
            const ranking=Object.entries(motCont).sort((a,b)=>b[1]-a[1]).slice(0,5);
            return(
              <div style={{background:C.card,border:`1px solid ${corG}33`,borderTop:`2px solid ${corG}`,borderRadius:12,padding:"12px 14px",marginBottom:12,boxShadow:effG<70?`0 0 10px ${C.dangerLight}22`:"none"}}>
                {/* seletor */}
                <div style={{display:"flex",gap:6,marginBottom:10}}>
                  {["M2","M3","Ambas"].map(o=>{
                    const sel=selGest===o;
                    return(<button key={o} onClick={()=>{setSelGest(o);if(o!=="Ambas")setMaq(o);}} style={{flex:1,padding:"10px 6px",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:13,background:sel?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${sel?"rgba(255,255,255,0.5)":C.border}`,color:sel?"#fff":C.textMuted,boxShadow:sel?"0 0 10px rgba(80,144,255,0.5)":"none"}}>{o}</button>);
                  })}
                </div>
                {/* resumo dinâmico */}
                {(()=>{
                  const MOTIVOS_FORA_OP=["Entupida","Válvula com passagem","Falta de visor","Falta de vedação"];
                  const nForaOp=maqsFilt.reduce((a,m)=>a+Object.values(dados[m]||{}).filter(g=>MOTIVOS_FORA_OP.includes(g?.motivo)).length,0);
                  const nRemovida=nFora-nForaOp;
                  return(
                    <>
                      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
                        <div>
                          <div style={{color:corG,fontWeight:900,fontSize:36,fontFamily:"monospace",lineHeight:1}}>{effG}<span style={{fontSize:16,color:corG}}>%</span></div>
                          <div style={{color:C.textDim,fontSize:8,letterSpacing:"0.08em",marginTop:2}}>EFICIÊNCIA · {selGest==="Ambas"?"M2 + M3":selGest}</div>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{height:7,background:C.tagBg,borderRadius:3,overflow:"hidden",marginBottom:4}}><div style={{width:`${effG}%`,height:"100%",background:corG,borderRadius:3,transition:"width .5s"}}/></div>
                          <div style={{display:"flex",justifyContent:"space-between"}}>
                            <span style={{color:C.accentLight,fontSize:9,fontFamily:"monospace",fontWeight:800}}>{nOp}/{totalG} OP</span>
                            <span style={{color:C.dangerLight,fontSize:9,fontFamily:"monospace",fontWeight:800}}>{nFora} FORA</span>
                          </div>
                        </div>
                      </div>
                      {/* contadores fora de op vs removida */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                        {[{v:nForaOp,l:"FORA DE OPERAÇÃO",c:C.warningLight,i:"⚠"},{v:nRemovida,l:"REMOVIDAS",c:C.dangerLight,i:"🔴"}].map(({v,l,c,i})=>(
                          <div key={l} style={{background:C.tagBg,border:`1px solid ${v>0?c+"44":C.border}`,borderTop:`2px solid ${v>0?c:C.border}`,borderRadius:10,padding:"8px 10px"}}>
                            <div style={{color:v>0?c:C.textDim,fontFamily:"monospace",fontWeight:900,fontSize:24,lineHeight:1}}>{v}</div>
                            <div style={{color:C.textDim,fontSize:7.5,letterSpacing:"0.08em",marginTop:3}}>{l}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
                {/* causas de remoção */}
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10}}>
                  <div style={{color:"#B388FF",fontSize:9,fontWeight:800,letterSpacing:"0.1em",marginBottom:8}}>CAUSAS DE REMOÇÃO</div>
                  {ranking.length===0?(
                    <div style={{color:C.textDim,fontSize:9,fontStyle:"italic"}}>— nenhum evento registrado —</div>
                  ):ranking.slice(0,3).map(([m,n],i)=>{
                    const pct=Math.round(n/hist.filter(h=>h.status!=="OPERANDO"&&h.motivo).length*100);
                    const cores=["#FF5252","#FF8C00","#B388FF"];
                    const cor=cores[i]||"#B388FF";
                    return(
                      <div key={m} style={{marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                          <span style={{color:cor,fontFamily:"monospace",fontWeight:900,fontSize:12,minWidth:16}}>#{i+1}</span>
                          <span style={{flex:1,color:C.text,fontSize:10,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m}</span>
                          <span style={{color:cor,fontFamily:"monospace",fontWeight:900,fontSize:12}}>{n}</span>
                          <span style={{color:C.textDim,fontFamily:"monospace",fontSize:9,minWidth:30,textAlign:"right"}}>{pct}%</span>
                        </div>
                        <div style={{height:5,background:C.tagBg,borderRadius:3,overflow:"hidden"}}>
                          <div style={{width:`${pct}%`,height:"100%",background:cor,borderRadius:3,boxShadow:`0 0 6px ${cor}88`,transition:"width .4s"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
          {/* Estágios */}
          {CLEANERS_CONFIG.map(e=>{
            const ev=effEst(maq,e);
            return(
              <div key={e.id} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${effCor(ev)}`,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{color:C.text,fontWeight:800,fontSize:13}}>{e.label}</span>
                  <span style={{color:effCor(ev),fontWeight:900,fontSize:14,fontFamily:"monospace"}}>{e.garrafas-Object.keys(dados[maq]||{}).filter(k=>k.startsWith(e.id+"_")).length}/{e.garrafas} · {ev}%</span>
                </div>
                <code style={{color:"#8FB8E8",fontSize:9,letterSpacing:"0.05em",background:"rgba(14,40,71,0.65)",border:"1px solid rgba(80,144,255,0.25)",borderRadius:4,padding:"1px 6px",fontWeight:700}}>Bomba {e.bomba[maq]}</code>
                <div style={{marginTop:10,overflowX:"auto"}}>
                  {(()=>{
                    const W=36,GAP=4,H=70;
                    const total=e.garrafas;
                    const totalW=total*(W+GAP)-GAP+2;
                    return(
                      <svg width={totalW} height={H+24} style={{display:"block",cursor:"pointer"}}>
                        {/* header bar */}
                        <rect x={0} y={8} width={totalW} height={10} rx={2} fill={`rgba(100,150,255,0.25)`} stroke="rgba(100,150,255,0.5)" strokeWidth={1}/>
                        {Array.from({length:total},(_,i)=>{
                          const g=dados[maq]?.[e.id+"_"+(i+1)];
                          const c=gStatusCor(g);
                          const cx=(W+GAP)*i+W/2;
                          const isOk=!g;
                          const fill=isOk?"rgba(0,230,118,0.18)":g.status==="REMOVIDA"?"rgba(255,82,82,0.2)":"rgba(255,193,7,0.2)";
                          const stroke=c;
                          return(
                            <g key={i} onClick={()=>abrirModal(e.id,i+1)} style={{cursor:"pointer"}}>
                              {/* cone shape */}
                              <polygon points={`${(W+GAP)*i},18 ${(W+GAP)*i+W},18 ${cx},${H}`} fill={fill} stroke={stroke} strokeWidth={1.5} filter={isOk?undefined:`url(#glow${i})`}/>
                              {/* glow filter */}
                              {!isOk&&<defs><filter id={`glow${i}`}><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>}
                              {/* slot cut on header */}
                              <rect x={(W+GAP)*i+W*0.3} y={8} width={W*0.4} height={10} fill="rgba(4,17,29,0.9)"/>
                              {/* status dot inside cone */}
                              <circle cx={cx} cy={H-22} r={5} fill={stroke} opacity={0.9}/>
                              {/* number below cone */}
                              <text x={cx} y={H+14} textAnchor="middle" fontSize={11} fontWeight="900" fill={stroke}>{i+1}</text>
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
          })}
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
      ):(
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
            <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Motivo</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:12}}>
              {CLEANERS_MOTIVOS.map(m=>(
                <button key={m} onClick={()=>setMMotivo(m===mMotivo?"":m)} style={{padding:"8px 8px",borderRadius:8,cursor:"pointer",fontWeight:mMotivo===m?700:400,fontSize:11,textAlign:"left",background:mMotivo===m?"rgba(255,193,7,0.15)":C.tagBg,border:`1px solid ${mMotivo===m?C.warningLight:C.border}`,color:mMotivo===m?C.warningLight:C.textMuted}}>{m}</button>
              ))}
            </div>
            <textarea value={mObs} onChange={e=>setMObs(e.target.value)} rows={2} placeholder="Observação opcional..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit",marginBottom:12}}/>
            <button disabled={!mMotivo} onClick={()=>salvarGarrafa(false)} style={{width:"100%",padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,background:mStatus==="REMOVIDA"?C.danger:C.warning,border:"none",color:"#fff",opacity:!mMotivo?0.4:1}}>Confirmar {mStatus==="REMOVIDA"?"Remoção":"Isolamento"}</button>
          </div>
        </div>
      )}
      {modalRetorno&&(
        <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{background:C.surface,border:`1px solid ${C.accentLight}33`,borderRadius:"18px 18px 0 0",padding:22,width:"100%",maxWidth:600}}>
            <div style={{color:C.accentLight,fontWeight:800,fontSize:14,marginBottom:4}}>✓ Retornando à operação</div>
            <div style={{color:C.textDim,fontSize:11,marginBottom:14}}>O que foi realizado? (selecione tudo que se aplica)</div>
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
                if(retornoItens.length>0){
                  const ts=`${data}T${hora}`;
                  const keyG=modalRetorno.estId+"_"+modalRetorno.idx;
                  const compAtual=storageGet("comp_em_h2")||{};
                  const chave=maq+":"+keyG;
                  const anterior=compAtual[chave]||{};
                  const novoComp={...anterior};
                  retornoItens.forEach(id=>{novoComp[id]=ts;});
                  storageSet("comp_em_h2",{...compAtual,[chave]:novoComp});
                }
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


export function RelatorioCleaners() {
  const [maqF,setMaqF]=useState("todas");
  const [garrafaF,setGarrafaF]=useState("todas");
  const fmtData=d=>{if(!d)return"—";const[y,m,dia]=d.split("-");return`${dia}/${m}`;};
  const fmtGarrafa=key=>{const cfg=CLEANERS_CONFIG.find(c=>key?.startsWith(c.id+"_"));if(!cfg)return key||"—";const num=key.replace(cfg.id+"_","");return`${cfg.label} · G${num}`;};
  const ITENS_LABEL={garrafa:"Garrafa",valvula:"Válvula",visor:"Visor",bico:"Bico de porcelana",vedacao:"Borracha de vedação",pescoco:"Pescoço da válvula"};
  const hist=(storageGet("cleaners_hist_h2")||[]).slice().reverse();
  const garrafasDisponiveis=[...new Set(hist.map(h=>h.garrafa).filter(Boolean))].sort();
  const lista=hist.filter(h=>{
    if(maqF!=="todas"&&h.maquina!==maqF)return false;
    if(garrafaF!=="todas"&&h.garrafa!==garrafaF)return false;
    return true;
  });
  return(
    <div>
      {/* filtros */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`2px solid #5090FF`,borderRadius:12,padding:"12px 14px",marginBottom:12}}>
        <div style={{color:C.textDim,fontSize:9,fontWeight:800,letterSpacing:"0.1em",marginBottom:8}}>LINHA DO TEMPO · CLEANERS</div>
        <div style={{display:"flex",gap:5,marginBottom:8}}>
          {[{id:"todas",l:"Todas"},{id:"M2",l:"M2"},{id:"M3",l:"M3"}].map(m=>(
            <button key={m.id} onClick={()=>setMaqF(m.id)} style={{flex:1,padding:"7px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,border:`1.5px solid ${maqF===m.id?"#5090FF":C.border}`,background:maqF===m.id?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,color:maqF===m.id?C.white:C.textMuted}}>{m.l}</button>
          ))}
        </div>
        <select value={garrafaF} onChange={e=>setGarrafaF(e.target.value)} style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",color:garrafaF!=="todas"?C.accentLight:C.textMuted,fontSize:11,fontWeight:700,outline:"none"}}>
          <option value="todas">🔍 Todas as garrafas</option>
          {garrafasDisponiveis.map(g=>(<option key={g} value={g}>{fmtGarrafa(g)}</option>))}
        </select>
      </div>
      {/* timeline */}
      {lista.length===0?(
        <div style={{textAlign:"center",color:C.textDim,padding:"40px 0",fontSize:12}}>Nenhum evento registrado.</div>
      ):lista.map((ev,i)=>{
        const removida=ev.status==="REMOVIDA";
        const cor=removida?C.dangerLight:C.accentLight;
        const icone=removida?"🔴":"✅";
        const subs=(ev.itensSubstituidos||[]).map(id=>ITENS_LABEL[id]||id).filter(Boolean);
        return(
          <div key={i} style={{display:"flex",gap:10,marginBottom:10}}>
            {/* linha vertical */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:`${cor}22`,border:`2px solid ${cor}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{icone}</div>
              {i<lista.length-1&&<div style={{width:2,flex:1,minHeight:16,background:`${C.border}`,marginTop:2}}/>}
            </div>
            {/* card evento */}
            <div style={{flex:1,background:C.card,border:`1px solid ${cor}22`,borderLeft:`3px solid ${cor}`,borderRadius:10,padding:"9px 11px",marginBottom:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <span style={{color:cor,fontWeight:900,fontSize:11}}>{fmtGarrafa(ev.garrafa)}</span>
                <span style={{color:C.textDim,fontFamily:"monospace",fontSize:9}}>{fmtData(ev.data)} {ev.hora||""}</span>
              </div>
              <div style={{color:C.text,fontWeight:700,fontSize:10,marginBottom:3}}>
                {removida?(ev.motivo||"Removida"):`Retornou à operação${subs.length>0?"":""}`}
              </div>
              {subs.length>0&&(
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:3}}>
                  {subs.map(s=>(<span key={s} style={{background:"rgba(0,230,118,0.1)",border:"1px solid rgba(0,230,118,0.3)",color:C.accentLight,borderRadius:20,padding:"1px 7px",fontSize:9,fontWeight:700}}>🔧 {s}</span>))}
                </div>
              )}
              {ev.obs&&<div style={{color:C.textDim,fontSize:9,fontStyle:"italic",marginBottom:2}}>"{ev.obs}"</div>}
              <div style={{display:"flex",gap:8,marginTop:3}}>
                {ev.operador&&<span style={{color:C.textDim,fontSize:9}}>👤 {ev.operador}</span>}
                {ev.maquina&&<span style={{color:"#5090FF",fontSize:9,fontFamily:"monospace",fontWeight:700}}>{ev.maquina}</span>}
                {ev.letra&&<span style={{color:C.textDim,fontSize:9}}>Letra {ev.letra}</span>}
                {ev.turno&&<span style={{color:C.textDim,fontSize:9}}>{ev.turno}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

