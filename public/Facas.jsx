// ─── facas.jsx — Controle de Facas & Facão · Cortadeira · Secagem H2 ──────────
// Rastreabilidade de troca/ajuste das 11 facas (corte longitudinal) e do
// facão (corte transversal, referenciado por posição de fardo).
import { useState } from "react";
import * as React from "react";
import { COL, doc, setDoc, getDoc } from "./firebase";

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

const storageGet=(k)=>{try{return JSON.parse(localStorage.getItem(k));}catch{return null;}};
const storageSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}try{setDoc(doc(COL,k),{val:v,ts:Date.now()});}catch{}};
const cloudGet=async(k)=>{try{const s=await getDoc(doc(COL,k));if(s.exists()){const d=s.data().val;try{localStorage.setItem(k,JSON.stringify(d));}catch{}return d;}}catch{}return storageGet(k);};

const hoje=()=>new Date().toISOString().slice(0,10);
const horaAtual=()=>{const a=new Date();return`${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`;};
const fmtD=d=>{if(!d)return"—";const[y,m,dia]=d.split("-");return`${dia}/${m}/${y.slice(2)}`;};
const diasDesde=d=>{if(!d)return null;const a=new Date(d+"T00:00:00");const b=new Date(hoje()+"T00:00:00");return Math.round((b-a)/86400000);};
const corPorDias=(dias)=>{
  if(dias===null)return C.textDim;
  if(dias<=7)return C.accentLight;
  if(dias<=15)return C.warningLight;
  return C.dangerLight;
};

const N_FACAS=11;
const N_FARDOS=12;

// ── Ícone da faca: disco (lâmina) + haste vertical (atuador) ──────────────────
function IconeFaca({cor, ativo, size=40}){
  return(
    <svg width={size} height={size*1.15} viewBox="0 0 40 46">
      {/* haste do atuador */}
      <line x1="20" y1="2" x2="20" y2="16" stroke={cor} strokeWidth="2.5" strokeLinecap="round" opacity={ativo?1:0.4}/>
      {/* disco/lamina */}
      <circle cx="20" cy="28" r="13" fill={`${cor}18`} stroke={cor} strokeWidth="2" opacity={ativo?1:0.4}/>
      <circle cx="20" cy="28" r="4" fill={cor} opacity={ativo?0.9:0.35}/>
      {ativo&&<circle cx="20" cy="28" r="13" fill="none" stroke={cor} strokeWidth="1" opacity="0.3" style={{filter:`drop-shadow(0 0 4px ${cor})`}}/>}
    </svg>
  );
}

// ── Registro/estrutura de dados ────────────────────────────────────────────────
// facas_h2: { M2:{ f1..f11:{ultimaTroca,ultimoAjuste,historico:[]} }, M3:{...} }
// facao_h2: { M2:{ ultimaTroca, historico:[{tipo,data,hora,fardoRef,operador}] }, M3:{...} }

export function FacasTela({ maquina="M2" }){
  const [maq,setMaq]=useState(maquina);
  const [facas,setFacas]=useState(()=>storageGet("facas_h2")||{M2:{},M3:{}});
  const [facao,setFacao]=useState(()=>storageGet("facao_h2")||{M2:{},M3:{}});
  React.useEffect(()=>{
    cloudGet("facas_h2").then(d=>{if(d)setFacas(d);});
    cloudGet("facao_h2").then(d=>{if(d)setFacao(d);});
  },[]);
  const [modalFaca,setModalFaca]=useState(null); // {pos}
  const [modalFacao,setModalFacao]=useState(false);
  const [tipoReg,setTipoReg]=useState("ajuste"); // ajuste | troca
  const [fardoRef,setFardoRef]=useState("");
  const [obs,setObs]=useState("");
  const cfg=storageGet("op_config")||{};
  const operador=cfg.matricula||cfg.nome||"—";

  const dadosFaca=(pos)=>facas[maq]?.["f"+pos]||{ultimaTroca:null,ultimoAjuste:null,historico:[]};
  const dadosFacao=()=>facao[maq]||{ultimaTroca:null,historico:[]};

  const salvarFaca=()=>{
    const pos=modalFaca.pos;
    const chave="f"+pos;
    const atual=facas[maq]?.[chave]||{ultimaTroca:null,ultimoAjuste:null,historico:[]};
    const evento={tipo:tipoReg,data:hoje(),hora:horaAtual(),operador,obs:obs.trim()};
    const novo={
      ultimaTroca: tipoReg==="troca"?hoje():atual.ultimaTroca,
      ultimoAjuste: tipoReg==="ajuste"?hoje():atual.ultimoAjuste,
      historico:[evento,...(atual.historico||[])],
    };
    const novoFacas={...facas,[maq]:{...facas[maq],[chave]:novo}};
    setFacas(novoFacas);
    storageSet("facas_h2",novoFacas);
    setModalFaca(null); setObs(""); setTipoReg("ajuste");
  };

  const salvarFacao=()=>{
    const atual=facao[maq]||{ultimaTroca:null,historico:[]};
    const evento={tipo:tipoReg,data:hoje(),hora:horaAtual(),operador,fardoRef:fardoRef||null,obs:obs.trim()};
    const novo={
      ultimaTroca: tipoReg==="troca"?hoje():atual.ultimaTroca,
      historico:[evento,...(atual.historico||[])],
    };
    const novoFacao={...facao,[maq]:novo};
    setFacao(novoFacao);
    storageSet("facao_h2",novoFacao);
    setModalFacao(false); setObs(""); setFardoRef(""); setTipoReg("ajuste");
  };

  return(
    <div>
      {/* Seletor M2/M3 */}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {["M2","M3"].map(m=>(
          <button key={m} onClick={()=>setMaq(m)} style={{flex:1,padding:"10px",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:13,
            background:maq===m?C.accentDark:C.tagBg,border:`2px solid ${maq===m?C.accentLight:C.border}`,color:maq===m?C.accentLight:C.textMuted}}>
            {m}
          </button>
        ))}
      </div>

      {/* Régua de facas */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800,marginBottom:12}}>
          Facas — corte longitudinal ({N_FACAS} posições)
        </div>
        <div style={{display:"flex",justifyContent:"space-between",overflowX:"auto",gap:2,paddingBottom:4}}>
          {Array.from({length:N_FACAS},(_,i)=>i+1).map(pos=>{
            const d=dadosFaca(pos);
            const dias=diasDesde(d.ultimaTroca);
            const cor=corPorDias(dias);
            return(
              <button key={pos} onClick={()=>setModalFaca({pos})}
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"transparent",border:"none",cursor:"pointer",flexShrink:0,minWidth:42}}>
                <IconeFaca cor={cor} ativo={!!d.ultimaTroca}/>
                <span style={{color:C.textDim,fontSize:9,fontFamily:"monospace",fontWeight:700}}>{pos}</span>
              </button>
            );
          })}
        </div>
        <div style={{display:"flex",gap:12,marginTop:10,fontSize:9,color:C.textDim,justifyContent:"center"}}>
          <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:C.accentLight}}/>≤7d</span>
          <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:C.warningLight}}/>8–15d</span>
          <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:C.dangerLight}}/>{">15d"}</span>
        </div>
      </div>

      {/* Facão */}
      <div onClick={()=>setModalFacao(true)} style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.blueLight}`,borderRadius:12,padding:16,cursor:"pointer"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800}}>
            Facão — corte transversal
          </div>
          <span style={{color:C.textDim,fontSize:16}}>›</span>
        </div>
        {(()=>{
          const d=dadosFacao();
          const ultimoAjuste=d.historico?.find(h=>h.tipo==="ajuste");
          return(
            <>
              {/* régua 1-12 com marcador */}
              <div style={{position:"relative",height:34,marginBottom:10}}>
                <div style={{position:"absolute",top:14,left:0,right:0,height:3,background:C.blueLight,borderRadius:2,boxShadow:`0 0 6px ${C.blueLight}88`}}/>
                <div style={{display:"flex",justifyContent:"space-between",position:"relative"}}>
                  {Array.from({length:N_FARDOS},(_,i)=>i+1).map(f=>{
                    const marcado=ultimoAjuste?.fardoRef===String(f);
                    return(
                      <div key={f} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                        <div style={{width:marcado?12:6,height:marcado?12:6,borderRadius:"50%",
                          background:marcado?C.warningLight:C.blueLight,
                          border:marcado?`2px solid ${C.warningLight}`:"none",
                          boxShadow:marcado?`0 0 8px ${C.warningLight}`:"none",marginTop:marcado?8:11}}/>
                        <span style={{fontSize:7,color:C.textDim,fontFamily:"monospace"}}>{f}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}>
                <span style={{color:C.textMuted}}>Último ajuste: <b style={{color:C.text}}>{ultimoAjuste?`fardo ${ultimoAjuste.fardoRef} · ${fmtD(ultimoAjuste.data)}`:"sem registro"}</b></span>
                <span style={{color:C.textMuted}}>Última troca: <b style={{color:d.ultimaTroca?C.accentLight:C.textDim}}>{d.ultimaTroca?fmtD(d.ultimaTroca):"—"}</b></span>
              </div>
            </>
          );
        })()}
      </div>

      {/* ── Modal Faca ── */}
      {modalFaca&&(()=>{
        const d=dadosFaca(modalFaca.pos);
        const dias=diasDesde(d.ultimaTroca);
        const cor=corPorDias(dias);
        return(
          <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>{setModalFaca(null);setObs("");setTipoReg("ajuste");}}>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"18px 18px 0 0",padding:22,width:"100%",maxWidth:600,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <IconeFaca cor={cor} ativo={!!d.ultimaTroca} size={34}/>
                <div>
                  <div style={{color:C.white,fontWeight:800,fontSize:15}}>Faca {modalFaca.pos}</div>
                  <div style={{color:C.textDim,fontSize:10}}>Máquina {maq.replace("M","")}</div>
                </div>
              </div>

              {/* status atual */}
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:14,display:"flex",justifyContent:"space-between"}}>
                <div>
                  <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase"}}>Última troca</div>
                  <div style={{color:d.ultimaTroca?cor:C.textDim,fontWeight:800,fontSize:13,fontFamily:"monospace"}}>{d.ultimaTroca?fmtD(d.ultimaTroca):"—"}</div>
                  {dias!==null&&<div style={{color:cor,fontSize:9,fontWeight:700}}>{dias} dia{dias!==1?"s":""} em uso</div>}
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase"}}>Último ajuste</div>
                  <div style={{color:d.ultimoAjuste?C.text:C.textDim,fontWeight:800,fontSize:13,fontFamily:"monospace"}}>{d.ultimoAjuste?fmtD(d.ultimoAjuste):"—"}</div>
                </div>
              </div>

              {/* registrar novo evento */}
              <div style={{display:"flex",gap:6,marginBottom:12}}>
                {[{t:"ajuste",l:"Ajuste (inverter lado)",c:C.warningLight},{t:"troca",l:"Troca",c:C.dangerLight}].map(({t,l,c})=>(
                  <button key={t} onClick={()=>setTipoReg(t)} style={{flex:1,padding:"11px 6px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:12,
                    background:tipoReg===t?`${c}22`:C.tagBg,border:`1.5px solid ${tipoReg===t?c:C.border}`,color:tipoReg===t?c:C.textMuted}}>
                    {l}
                  </button>
                ))}
              </div>
              <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={2} placeholder="Observação opcional..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit",marginBottom:12}}/>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                <button onClick={()=>{setModalFaca(null);setObs("");setTipoReg("ajuste");}} style={{...btnSec,flex:1,padding:13,fontSize:13}}>Cancelar</button>
                <button onClick={salvarFaca} style={{flex:2,padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,
                  background:tipoReg==="troca"?C.danger:C.warning,border:"none",color:"#fff"}}>
                  Confirmar {tipoReg==="troca"?"Troca":"Ajuste"}
                </button>
              </div>

              {/* histórico */}
              <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8,fontWeight:800}}>Histórico</div>
              {(d.historico||[]).length===0?(
                <div style={{textAlign:"center",color:C.textDim,padding:"20px 0",fontSize:12}}>Nenhum evento registrado.</div>
              ):(d.historico||[]).map((ev,i)=>{
                const c=ev.tipo==="troca"?C.dangerLight:C.warningLight;
                return(
                  <div key={i} style={{display:"flex",gap:10,marginBottom:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:c,marginTop:4,flexShrink:0,boxShadow:`0 0 5px ${c}`}}/>
                    <div style={{flex:1,background:C.card,border:`1px solid ${c}22`,borderLeft:`3px solid ${c}`,borderRadius:8,padding:"7px 10px"}}>
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <span style={{color:c,fontWeight:800,fontSize:11}}>{ev.tipo==="troca"?"Troca":"Ajuste"}</span>
                        <span style={{color:C.textDim,fontFamily:"monospace",fontSize:9}}>{fmtD(ev.data)} {ev.hora}</span>
                      </div>
                      {ev.obs&&<div style={{color:C.textMuted,fontSize:10,marginTop:2}}>{ev.obs}</div>}
                      <div style={{color:C.textDim,fontSize:9,marginTop:2}}>{ev.operador}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Modal Facão ── */}
      {modalFacao&&(()=>{
        const d=dadosFacao();
        return(
          <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>{setModalFacao(false);setObs("");setFardoRef("");setTipoReg("ajuste");}}>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"18px 18px 0 0",padding:22,width:"100%",maxWidth:600,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
              <div style={{color:C.white,fontWeight:800,fontSize:15,marginBottom:2}}>Facão</div>
              <div style={{color:C.textDim,fontSize:10,marginBottom:14}}>Máquina {maq.replace("M","")} · corte transversal</div>

              <div style={{display:"flex",gap:6,marginBottom:12}}>
                {[{t:"ajuste",l:"Ajuste (por fardo)",c:C.warningLight},{t:"troca",l:"Troca",c:C.dangerLight}].map(({t,l,c})=>(
                  <button key={t} onClick={()=>setTipoReg(t)} style={{flex:1,padding:"11px 6px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:12,
                    background:tipoReg===t?`${c}22`:C.tagBg,border:`1.5px solid ${tipoReg===t?c:C.border}`,color:tipoReg===t?c:C.textMuted}}>
                    {l}
                  </button>
                ))}
              </div>

              {tipoReg==="ajuste"&&(
                <div style={{marginBottom:12}}>
                  <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",marginBottom:6}}>Ajuste feito entre qual fardo?</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:5}}>
                    {Array.from({length:N_FARDOS},(_,i)=>i+1).map(f=>(
                      <button key={f} onClick={()=>setFardoRef(String(f))} style={{padding:"9px 0",borderRadius:8,cursor:"pointer",fontWeight:800,fontSize:12,fontFamily:"monospace",
                        background:fardoRef===String(f)?`${C.warningLight}22`:C.tagBg,border:`1.5px solid ${fardoRef===String(f)?C.warningLight:C.border}`,color:fardoRef===String(f)?C.warningLight:C.textMuted}}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={2} placeholder="Observação opcional..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit",marginBottom:12}}/>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                <button onClick={()=>{setModalFacao(false);setObs("");setFardoRef("");setTipoReg("ajuste");}} style={{...btnSec,flex:1,padding:13,fontSize:13}}>Cancelar</button>
                <button disabled={tipoReg==="ajuste"&&!fardoRef} onClick={salvarFacao} style={{flex:2,padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,
                  background:tipoReg==="troca"?C.danger:C.warning,border:"none",color:"#fff",opacity:(tipoReg==="ajuste"&&!fardoRef)?0.4:1}}>
                  Confirmar {tipoReg==="troca"?"Troca":"Ajuste"}
                </button>
              </div>

              <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8,fontWeight:800}}>Histórico</div>
              {(d.historico||[]).length===0?(
                <div style={{textAlign:"center",color:C.textDim,padding:"20px 0",fontSize:12}}>Nenhum evento registrado.</div>
              ):(d.historico||[]).map((ev,i)=>{
                const c=ev.tipo==="troca"?C.dangerLight:C.warningLight;
                return(
                  <div key={i} style={{display:"flex",gap:10,marginBottom:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:c,marginTop:4,flexShrink:0,boxShadow:`0 0 5px ${c}`}}/>
                    <div style={{flex:1,background:C.card,border:`1px solid ${c}22`,borderLeft:`3px solid ${c}`,borderRadius:8,padding:"7px 10px"}}>
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <span style={{color:c,fontWeight:800,fontSize:11}}>{ev.tipo==="troca"?"Troca":`Ajuste — fardo ${ev.fardoRef||"?"}`}</span>
                        <span style={{color:C.textDim,fontFamily:"monospace",fontSize:9}}>{fmtD(ev.data)} {ev.hora}</span>
                      </div>
                      {ev.obs&&<div style={{color:C.textMuted,fontSize:10,marginTop:2}}>{ev.obs}</div>}
                      <div style={{color:C.textDim,fontSize:9,marginTop:2}}>{ev.operador}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
