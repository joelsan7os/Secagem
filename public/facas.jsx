// ─── facas.jsx — Controle de Facas & Facão · Cortadeira · Secagem H2 ──────────
// Integra com o checklist (item cs2_31/cs3_31 = bar das 11 facas) e com o
// mural de pendências: ao ajustar/trocar, o bar volta a 1,5 e a faca sai do mural.
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

const N_FACAS=11;
const N_FARDOS=12;
const BAR_REF=1.5; // valor de referência ao ajustar/trocar

// regra de cor oficial (mesma do checklist/mural)
const corPorBar=(bar)=>{
  if(bar===null||isNaN(bar))return C.textDim;
  if(bar>=3.5)return C.dangerLight;
  if(bar>=2.5)return C.warningLight;
  if(bar>=1.5)return C.accentLight;
  return C.textDim;
};

// lê o último checklist de cortadeira de uma máquina
const ultimoChecklist=(maq)=>{
  const hist=storageGet("historico_h2")||[];
  return hist.filter(h=>h&&h.tipoId==="cortadeira"&&h.maquina===maq).sort((a,b)=>(b.id||0)-(a.id||0))[0]||null;
};
// bar atual de uma faca (posição 1-based) a partir do último checklist
const barDaFaca=(maq,pos)=>{
  const itemId=maq==="M2"?"cs2_31":"cs3_31";
  const ult=ultimoChecklist(maq);
  if(!ult)return null;
  const raw=ult.valores?.[`${itemId}_${pos-1}`];
  const n=parseFloat(String(raw||"").replace(",","."));
  return isNaN(n)?null:n;
};
// passe das facas (F/C) — valor único para todas, do item cs2_12/cs3_12
const passeAtual=(maq)=>{
  const itemId=maq==="M2"?"cs2_12":"cs3_12";
  const ult=ultimoChecklist(maq);
  if(!ult)return{f:null,c:null};
  const rf=ult.valores?.[`${itemId}_f`], rc=ult.valores?.[`${itemId}_c`];
  return{
    f: rf!==undefined&&rf!==""?rf:null,
    c: rc!==undefined&&rc!==""?rc:null,
  };
};
const gravarPasse=(maq,f,c)=>{
  const itemId=maq==="M2"?"cs2_12":"cs3_12";
  const hist=storageGet("historico_h2")||[];
  let idx=-1, melhorId=-1;
  hist.forEach((h,i)=>{ if(h&&h.tipoId==="cortadeira"&&h.maquina===maq&&(h.id||0)>melhorId){melhorId=h.id||0;idx=i;} });
  if(idx<0)return false;
  const reg={...hist[idx]};
  reg.valores={...(reg.valores||{})};
  reg.valores[`${itemId}_f`]=String(f).replace(".",",");
  reg.valores[`${itemId}_c`]=String(c).replace(".",",");
  hist[idx]=reg;
  storageSet("historico_h2",hist);
  return true;
};

// níveis do corte do facão por fardo — mesmos 4 níveis do checklist
const NIVEIS_FACAO=[
  {id:"ok",label:"OK",cor:"#00E676"},
  {id:"baixo",label:"Baixo",cor:"#FFC107"},
  {id:"medio",label:"Médio",cor:"#FF8C00"},
  {id:"alto",label:"Alto",cor:"#FF5252"},
];
const nivelFardo=(maq,fardoIdx)=>{
  const itemId=maq==="M2"?"cs2_34":"cs3_34";
  const ult=ultimoChecklist(maq);
  if(!ult)return null;
  const val=ult.valores?.[`${itemId}_${fardoIdx}`];
  return NIVEIS_FACAO.find(n=>n.id===val)||null;
};
const gravarNivelFardo=(maq,fardoIdx,nivelId)=>{
  const itemId=maq==="M2"?"cs2_34":"cs3_34";
  const hist=storageGet("historico_h2")||[];
  let idx=-1, melhorId=-1;
  hist.forEach((h,i)=>{ if(h&&h.tipoId==="cortadeira"&&h.maquina===maq&&(h.id||0)>melhorId){melhorId=h.id||0;idx=i;} });
  if(idx<0)return false;
  const reg={...hist[idx]};
  reg.valores={...(reg.valores||{})};
  reg.valores[`${itemId}_${fardoIdx}`]=nivelId;
  hist[idx]=reg;
  storageSet("historico_h2",hist);
  return true;
};

// ── Ícone do fardo: bloco retangular com profundidade (pseudo-3D) ─────────────
function IconeFardo({cor, size=22}){
  const h=size*0.8, d=size*0.32;
  return(
    <svg width={size+d} height={h+d} viewBox={`0 0 ${size+d} ${h+d}`}>
      {/* face lateral direita (sombra) */}
      <polygon points={`${size},${d} ${size+d},0 ${size+d},${h} ${size},${h+d}`} fill={cor} opacity="0.45"/>
      {/* face superior (topo) */}
      <polygon points={`0,${d} ${size},${d} ${size+d},0 ${d},0`} fill={cor} opacity="0.75"/>
      {/* face frontal */}
      <rect x="0" y={d} width={size} height={h} fill={cor} opacity="0.9" rx="1"/>
      <rect x="0" y={d} width={size} height={h} fill="none" stroke={cor} strokeWidth="1" opacity="0.6" rx="1"/>
    </svg>
  );
}
function IconeFaca({cor, ativo, size=40}){
  return(
    <svg width={size} height={size*1.15} viewBox="0 0 40 46">
      <line x1="20" y1="2" x2="20" y2="16" stroke={cor} strokeWidth="2.5" strokeLinecap="round" opacity={ativo?1:0.45}/>
      <circle cx="20" cy="28" r="13" fill={`${cor}18`} stroke={cor} strokeWidth="2" opacity={ativo?1:0.45}/>
      <circle cx="20" cy="28" r="4" fill={cor} opacity={ativo?0.9:0.4}/>
      {ativo&&<circle cx="20" cy="28" r="13" fill="none" stroke={cor} strokeWidth="1" opacity="0.3" style={{filter:`drop-shadow(0 0 4px ${cor})`}}/>}
    </svg>
  );
}

export function FacasTela({ maquina="M2" }){
  const [maq,setMaq]=useState(maquina);
  const [facas,setFacas]=useState(()=>storageGet("facas_h2")||{M2:{},M3:{}});
  const [facao,setFacao]=useState(()=>storageGet("facao_h2")||{M2:{},M3:{}});
  const [tick,setTick]=useState(0); // força releitura do checklist após ajuste
  React.useEffect(()=>{
    cloudGet("facas_h2").then(d=>{if(d)setFacas(d);});
    cloudGet("facao_h2").then(d=>{if(d)setFacao(d);});
    cloudGet("historico_h2").then(()=>setTick(t=>t+1));
  },[]);
  const [modalFaca,setModalFaca]=useState(null);
  const [modalFacao,setModalFacao]=useState(false);
  const [modalFardo,setModalFardo]=useState(null); // {idx}
  const [nivelSel,setNivelSel]=useState("ok");
  const [modalPasse,setModalPasse]=useState(false);
  const [passeF,setPasseF]=useState("");
  const [passeC,setPasseC]=useState("");
  const [tipoReg,setTipoReg]=useState("ajuste");
  const [fardoRef,setFardoRef]=useState("");
  const [obs,setObs]=useState("");
  const [dataReg,setDataReg]=useState(hoje());
  const cfg=storageGet("op_config")||{};
  const operador=cfg.matricula||cfg.nomeOperador||cfg.nome||"—";

  const dadosFaca=(pos)=>facas[maq]?.["f"+pos]||{historico:[]};
  const dadosFacao=()=>facao[maq]||{ultimaTroca:null,historico:[]};

  // grava o bar de uma faca de volta no último checklist (e sincroniza mural)
  const resetarBarNoChecklist=(pos,valor)=>{
    const itemId=maq==="M2"?"cs2_31":"cs3_31";
    const hist=storageGet("historico_h2")||[];
    // acha o índice do último checklist de cortadeira dessa máquina
    let idx=-1, melhorId=-1;
    hist.forEach((h,i)=>{ if(h&&h.tipoId==="cortadeira"&&h.maquina===maq&&(h.id||0)>melhorId){melhorId=h.id||0;idx=i;} });
    if(idx<0)return;
    const reg={...hist[idx]};
    reg.valores={...(reg.valores||{})};
    reg.valores[`${itemId}_${pos-1}`]=String(valor).replace(".",",");
    hist[idx]=reg;
    storageSet("historico_h2",hist);
    setTick(t=>t+1);
  };

  const salvarFaca=()=>{
    const pos=modalFaca.pos;
    const chave="f"+pos;
    const atual=facas[maq]?.[chave]||{historico:[]};
    const barAntes=barDaFaca(maq,pos);
    const evento={tipo:tipoReg,data:dataReg||hoje(),hora:horaAtual(),operador,barAntes,obs:obs.trim()};
    const novo={
      ultimaTroca: tipoReg==="troca"?(dataReg||hoje()):atual.ultimaTroca,
      ultimoAjuste: tipoReg==="ajuste"?(dataReg||hoje()):atual.ultimoAjuste,
      historico:[evento,...(atual.historico||[])],
    };
    const novoFacas={...facas,[maq]:{...facas[maq],[chave]:novo}};
    setFacas(novoFacas);
    storageSet("facas_h2",novoFacas);
    // ajuste/troca sempre volta o bar para a referência (1,5) → sai do mural
    resetarBarNoChecklist(pos,BAR_REF);
    setModalFaca(null); setObs(""); setTipoReg("ajuste"); setDataReg(hoje());
  };

  const salvarFacao=()=>{
    const atual=facao[maq]||{ultimaTroca:null,historico:[]};
    const evento={tipo:tipoReg,data:dataReg||hoje(),hora:horaAtual(),operador,fardoRef:fardoRef||null,obs:obs.trim()};
    const novo={
      ultimaTroca: tipoReg==="troca"?(dataReg||hoje()):atual.ultimaTroca,
      historico:[evento,...(atual.historico||[])],
    };
    const novoFacao={...facao,[maq]:novo};
    setFacao(novoFacao);
    storageSet("facao_h2",novoFacao);
    setModalFacao(false); setObs(""); setFardoRef(""); setTipoReg("ajuste"); setDataReg(hoje());
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
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800}}>
            Facas — corte longitudinal · pressão atual
          </div>
          <button onClick={()=>{const p=passeAtual(maq);setPasseF(p.f!==null?String(p.f):"5");setPasseC(p.c!==null?String(p.c):"5");setModalPasse(true);}}
            style={{display:"flex",alignItems:"center",gap:6,background:C.tagBg,border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 9px",cursor:"pointer"}}>
            {(()=>{const p=passeAtual(maq);return(
              <>
                <span style={{color:C.textDim,fontSize:9,fontWeight:700}}>PASSE</span>
                <span style={{color:C.text,fontFamily:"monospace",fontSize:11,fontWeight:800}}>F:{p.f!==null?p.f:"—"} C:{p.c!==null?p.c:"—"}%</span>
              </>
            );})()}
          </button>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",overflowX:"auto",gap:2,paddingBottom:4}}>
          {Array.from({length:N_FACAS},(_,i)=>i+1).map(pos=>{
            const bar=barDaFaca(maq,pos);
            const cor=corPorBar(bar);
            return(
              <button key={pos} onClick={()=>setModalFaca({pos})}
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"transparent",border:"none",cursor:"pointer",flexShrink:0,minWidth:44}}>
                <IconeFaca cor={cor} ativo={bar!==null}/>
                <span style={{color:cor,fontSize:11,fontFamily:"monospace",fontWeight:900}}>{bar!==null?String(bar).replace(".",","):"—"}</span>
                <span style={{color:C.textDim,fontSize:8,fontFamily:"monospace"}}>#{pos}</span>
              </button>
            );
          })}
        </div>
        <div style={{display:"flex",gap:12,marginTop:10,fontSize:9,color:C.textDim,justifyContent:"center"}}>
          <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:C.accentLight}}/>1,5–2,5</span>
          <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:C.warningLight}}/>2,5–3,5</span>
          <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:C.dangerLight}}/>{"≥3,5 bar"}</span>
        </div>
      </div>

      {/* Facão */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.blueLight}`,borderRadius:12,padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800}}>Facão — corte transversal</div>
          <button onClick={()=>setModalFacao(true)} style={{background:"transparent",border:"none",color:C.textDim,fontSize:16,cursor:"pointer"}}>›</button>
        </div>
        {(()=>{
          const d=dadosFacao();
          return(
            <>
              <div style={{position:"relative",marginBottom:10}}>
                <div style={{position:"absolute",top:11,left:0,right:0,height:3,background:C.blueLight,borderRadius:2,boxShadow:`0 0 6px ${C.blueLight}88`,zIndex:0}}/>
                <div style={{display:"flex",justifyContent:"space-between",position:"relative",zIndex:1}}>
                  {Array.from({length:N_FARDOS},(_,i)=>i).map(fi=>{
                    const nivel=nivelFardo(maq,fi);
                    const cor=nivel?nivel.cor:C.textDim;
                    return(
                      <button key={fi} onClick={()=>{setModalFardo({idx:fi});setNivelSel(nivel?nivel.id:"ok");setDataReg(hoje());setObs("");}}
                        style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"transparent",border:"none",cursor:"pointer",padding:0}}>
                        <IconeFardo cor={cor} size={16}/>
                        <span style={{fontSize:7,color:C.textDim,fontFamily:"monospace"}}>{fi+1}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{display:"flex",gap:10,marginBottom:10,fontSize:8,color:C.textDim,justifyContent:"center"}}>
                {NIVEIS_FACAO.map(n=>(
                  <span key={n.id} style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:6,height:6,borderRadius:2,background:n.cor}}/>{n.label}</span>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}>
                <span style={{color:C.textMuted}}>Última troca: <b style={{color:d.ultimaTroca?C.accentLight:C.textDim}}>{d.ultimaTroca?fmtD(d.ultimaTroca):"—"}</b></span>
                <span onClick={()=>setModalFacao(true)} style={{color:C.blueLight,fontWeight:700,cursor:"pointer"}}>Ver histórico geral →</span>
              </div>
            </>
          );
        })()}
      </div>

      {/* ── Modal Fardo individual (nível + data editável) ── */}
      {modalFardo&&(
        <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setModalFardo(null)}>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"18px 18px 0 0",padding:22,width:"100%",maxWidth:600}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <IconeFardo cor={NIVEIS_FACAO.find(n=>n.id===nivelSel)?.cor||C.textDim} size={26}/>
              <div>
                <div style={{color:C.white,fontWeight:800,fontSize:15}}>Fardo {modalFardo.idx+1}</div>
                <div style={{color:C.textDim,fontSize:10}}>Facão · Máquina {maq.replace("M","")}</div>
              </div>
            </div>
            <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",marginBottom:6}}>Qualidade do corte</div>
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {NIVEIS_FACAO.map(n=>(
                <button key={n.id} onClick={()=>setNivelSel(n.id)} style={{flex:1,padding:"11px 4px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:11,
                  background:nivelSel===n.id?`${n.cor}22`:C.tagBg,border:`1.5px solid ${nivelSel===n.id?n.cor:C.border}`,color:nivelSel===n.id?n.cor:C.textMuted}}>
                  {n.label}
                </button>
              ))}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",marginBottom:5}}>Data do registro</div>
              <input type="date" value={dataReg} onChange={e=>setDataReg(e.target.value)} style={{...inputStyle,colorScheme:"dark"}}/>
            </div>
            {(nivelSel==="medio"||nivelSel==="alto")&&(
              <div style={{background:"rgba(255,140,0,0.12)",border:`1px solid ${NIVEIS_FACAO.find(n=>n.id===nivelSel).cor}55`,borderRadius:8,padding:"8px 12px",marginBottom:14}}>
                <span style={{color:NIVEIS_FACAO.find(n=>n.id===nivelSel).cor,fontSize:11,fontWeight:700}}>Este nível aparece no mural de oportunidades.</span>
              </div>
            )}
            {nivelSel==="ok"&&(
              <div style={{background:`${C.accentLight}11`,border:`1px solid ${C.accentLight}33`,borderRadius:8,padding:"8px 12px",marginBottom:14}}>
                <span style={{color:C.accentLight,fontSize:11,fontWeight:700}}>OK — sai do mural de oportunidades.</span>
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setModalFardo(null)} style={{...btnSec,flex:1,padding:13,fontSize:13}}>Cancelar</button>
              <button onClick={()=>{
                  gravarNivelFardo(maq,modalFardo.idx,nivelSel);
                  // registra também no historico do facão para rastreabilidade
                  const atual=facao[maq]||{ultimaTroca:null,historico:[]};
                  const evento={tipo:"ajuste",data:dataReg||hoje(),hora:horaAtual(),operador,fardoRef:String(modalFardo.idx+1),nivel:nivelSel,obs:obs.trim()};
                  const novo={ultimaTroca:atual.ultimaTroca,historico:[evento,...(atual.historico||[])]};
                  const novoFacao={...facao,[maq]:novo};
                  setFacao(novoFacao); storageSet("facao_h2",novoFacao);
                  setTick(t=>t+1); setModalFardo(null);
                }}
                style={{flex:2,padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,background:C.accentDark,border:`1px solid ${C.accentLight}`,color:C.accentLight}}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Faca ── */}
      {modalFaca&&(()=>{
        const d=dadosFaca(modalFaca.pos);
        const bar=barDaFaca(maq,modalFaca.pos);
        const cor=corPorBar(bar);
        return(
          <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>{setModalFaca(null);setObs("");setTipoReg("ajuste");}}>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"18px 18px 0 0",padding:22,width:"100%",maxWidth:600,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <IconeFaca cor={cor} ativo={bar!==null} size={34}/>
                <div>
                  <div style={{color:C.white,fontWeight:800,fontSize:15}}>Faca {modalFaca.pos}</div>
                  <div style={{color:C.textDim,fontSize:10}}>Máquina {maq.replace("M","")}</div>
                </div>
              </div>

              {/* bar atual */}
              <div style={{background:C.card,border:`1px solid ${cor}44`,borderRadius:10,padding:"12px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase"}}>Pressão atual</div>
                  <div style={{color:cor,fontWeight:900,fontSize:22,fontFamily:"monospace"}}>{bar!==null?`${String(bar).replace(".",",")} bar`:"sem leitura"}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase"}}>Últ. troca / ajuste</div>
                  <div style={{color:C.text,fontSize:11,fontFamily:"monospace"}}>{d.ultimaTroca?`T ${fmtD(d.ultimaTroca)}`:""}{d.ultimoAjuste?`  A ${fmtD(d.ultimoAjuste)}`:(!d.ultimaTroca?"—":"")}</div>
                </div>
              </div>

              {bar!==null&&bar>=3.5&&(
                <div style={{background:"rgba(255,82,82,0.15)",border:`1.5px solid ${C.dangerLight}`,borderRadius:10,padding:"8px 12px",marginBottom:12}}>
                  <span style={{color:C.dangerLight,fontWeight:900,fontSize:11}}>NO LIMITE — priorizar na PP</span>
                </div>
              )}

              <div style={{display:"flex",gap:6,marginBottom:12}}>
                {[{t:"ajuste",l:"Ajuste (inverter lado)",c:C.warningLight},{t:"troca",l:"Troca",c:C.dangerLight}].map(({t,l,c})=>(
                  <button key={t} onClick={()=>setTipoReg(t)} style={{flex:1,padding:"11px 6px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:12,
                    background:tipoReg===t?`${c}22`:C.tagBg,border:`1.5px solid ${tipoReg===t?c:C.border}`,color:tipoReg===t?c:C.textMuted}}>
                    {l}
                  </button>
                ))}
              </div>
              <div style={{background:`${C.accentLight}11`,border:`1px solid ${C.accentLight}33`,borderRadius:8,padding:"8px 12px",marginBottom:12}}>
                <span style={{color:C.accentLight,fontSize:11,fontWeight:700}}>Ao confirmar, a pressão volta para 1,5 bar e sai do mural.</span>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",marginBottom:5}}>Data do registro</div>
                <input type="date" value={dataReg} onChange={e=>setDataReg(e.target.value)} style={{...inputStyle,colorScheme:"dark"}}/>
              </div>
              <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={2} placeholder="Observação opcional..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit",marginBottom:12}}/>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                <button onClick={()=>{setModalFaca(null);setObs("");setTipoReg("ajuste");setDataReg(hoje());}} style={{...btnSec,flex:1,padding:13,fontSize:13}}>Cancelar</button>
                <button onClick={salvarFaca} style={{flex:2,padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,
                  background:tipoReg==="troca"?C.danger:C.warning,border:"none",color:"#fff"}}>
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
                        <span style={{color:c,fontWeight:800,fontSize:11}}>{ev.tipo==="troca"?"Troca":"Ajuste"}{ev.barAntes!=null?` · de ${String(ev.barAntes).replace(".",",")} bar`:""}</span>
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
          <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>{setModalFacao(false);setObs("");setFardoRef("");setTipoReg("ajuste");setDataReg(hoje());}}>
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
                  <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",marginBottom:6}}>Ajuste feito em qual fardo?</div>
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

              <div style={{marginBottom:12}}>
                <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",marginBottom:5}}>Data do registro</div>
                <input type="date" value={dataReg} onChange={e=>setDataReg(e.target.value)} style={{...inputStyle,colorScheme:"dark"}}/>
              </div>
              <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={2} placeholder="Observação opcional..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit",marginBottom:12}}/>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                <button onClick={()=>{setModalFacao(false);setObs("");setFardoRef("");setTipoReg("ajuste");setDataReg(hoje());}} style={{...btnSec,flex:1,padding:13,fontSize:13}}>Cancelar</button>
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
      {/* ── Modal Passe (F/C) ── */}
      {modalPasse&&(
        <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setModalPasse(false)}>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"18px 18px 0 0",padding:22,width:"100%",maxWidth:600}} onClick={e=>e.stopPropagation()}>
            <div style={{color:C.white,fontWeight:800,fontSize:15,marginBottom:2}}>Passe das Facas</div>
            <div style={{color:C.textDim,fontSize:10,marginBottom:16}}>Máquina {maq.replace("M","")} · valor único para as 11 facas</div>
            <div style={{display:"flex",gap:10,marginBottom:14}}>
              <div style={{flex:1}}>
                <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",marginBottom:5}}>Frente (F) %</div>
                <input type="number" inputMode="decimal" value={passeF} onChange={e=>setPasseF(e.target.value)} style={{...inputStyle,textAlign:"center",fontSize:16,fontWeight:800}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",marginBottom:5}}>Costa (C) %</div>
                <input type="number" inputMode="decimal" value={passeC} onChange={e=>setPasseC(e.target.value)} style={{...inputStyle,textAlign:"center",fontSize:16,fontWeight:800}}/>
              </div>
            </div>
            <div style={{background:`${C.accentLight}11`,border:`1px solid ${C.accentLight}33`,borderRadius:8,padding:"8px 12px",marginBottom:16}}>
              <span style={{color:C.accentLight,fontSize:11,fontWeight:700}}>Após PP com ajuste/troca geral, o passe costuma voltar para 5%.</span>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setModalPasse(false)} style={{...btnSec,flex:1,padding:13,fontSize:13}}>Cancelar</button>
              <button onClick={()=>{gravarPasse(maq,passeF||"0",passeC||"0");setModalPasse(false);setTick(t=>t+1);}}
                style={{flex:2,padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,background:C.accentDark,border:`1px solid ${C.accentLight}`,color:C.accentLight}}>
                Salvar Passe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
