// ─── chuveiros.jsx — Controle & Rotação de Escovação de Chuveiros · Secagem H2
// Motor de rotação genérico (reaproveitável para microscreens no futuro).
// Integra com o checklist de rotina: chuveiro marcado "entupido" vira prioridade.
import { useState } from "react";
import * as React from "react";
import { COL, doc, setDoc, getDoc } from "./firebase";

const C = {
  bg:"#04111D", surface:"#071828", card:"#0A1929",
  accent:"#00E676", accentLight:"#00E676", accentDark:"#006B2E",
  blue:"#0E2847", blueLight:"#5090FF",
  warning:"#b87d00", warningLight:"#FFC107",
  danger:"#c0272d", dangerLight:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880", white:"#ffffff",
  border:"rgba(60,255,140,0.15)", tagBg:"rgba(255,255,255,0.04)",
};
const inputStyle={width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.white,fontSize:14,outline:"none"};
const btnSec={background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:9,padding:"9px 14px",cursor:"pointer",fontSize:12,fontWeight:700};

const storageGet=(k)=>{try{return JSON.parse(localStorage.getItem(k));}catch{return null;}};
const storageSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}try{setDoc(doc(COL,k),{val:v,ts:Date.now()});}catch{}};
const cloudGet=async(k)=>{try{const s=await getDoc(doc(COL,k));if(s.exists()){const d=s.data().val;try{localStorage.setItem(k,JSON.stringify(d));}catch{}return d;}}catch{}return storageGet(k);};

const hoje=()=>new Date().toISOString().slice(0,10);
const horaAtual=()=>{const a=new Date();return`${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`;};
const fmtD=d=>{if(!d)return"nunca";const[y,m,dia]=d.split("-");return`${dia}/${m}/${y.slice(2)}`;};
const diasDesde=d=>{if(!d)return Infinity;const a=new Date(d+"T00:00:00");const b=new Date(hoje()+"T00:00:00");return Math.round((b-a)/86400000);};

// ── Comprimir foto (mesmo padrão do checklist) ────────────────────────────────
function comprimirFoto(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=(e)=>{
      const img=new Image();
      img.onload=()=>{
        const MAX=1280;
        let{width,height}=img;
        if(width>height&&width>MAX){height=height*MAX/width;width=MAX;}
        else if(height>MAX){width=width*MAX/height;height=MAX;}
        const canvas=document.createElement("canvas");
        canvas.width=width;canvas.height=height;
        canvas.getContext("2d").drawImage(img,0,0,width,height);
        resolve(canvas.toDataURL("image/jpeg",0.72));
      };
      img.onerror=reject;
      img.src=e.target.result;
    };
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// MOTOR DE ROTAÇÃO GENÉRICO — reaproveitável para outros grupos (microscreens)
// ═══════════════════════════════════════════════════════════════════════════
// grupo: array de { id, label, intervaloDias, vezesPorCiclo, ultimaData, entupido }
// turno: "madrugada" | "adm" | "noite" (define quantos sugerir)
// Retorna os N itens priorizados: entupidos primeiro, depois mais vencidos.
function sugerirItens(itens, qtd){
  const scored = itens.map(it=>{
    const dias = diasDesde(it.ultimaData);
    const vencido = dias >= it.intervaloDias;
    // score: entupido sempre primeiro (infinito), depois proporção dias/intervalo (>1 = vencido)
    const score = it.entupido ? 999999 : (dias / it.intervaloDias);
    return {...it, dias, vencido, score};
  });
  scored.sort((a,b)=>b.score-a.score);
  return scored.slice(0,qtd);
}

const QTD_POR_TURNO = { madrugada:4, adm:2, noite:4 };
const turnoPorHora = (h)=>{
  if(h>=0&&h<8)return"madrugada";
  if(h>=8&&h<16)return"adm";
  return"noite";
};
const LABEL_TURNO = { madrugada:"Madrugada (00h–08h)", adm:"ADM (08h–16h)", noite:"Noite (16h–00h)" };

// ═══════════════════════════════════════════════════════════════════════════
// DEFINIÇÃO DOS 12 CHUVEIROS POR MÁQUINA (20 execuções por ciclo)
// ═══════════════════════════════════════════════════════════════════════════
// Mapeia para os itens ok_nok do checklist de rotina (entupido = prioridade).
const DEF_CHUVEIROS = (maq)=>{
  const p = maq==="M2"?"m2":"m3";
  return [
    // Feltro Pickup
    { id:"feltro1_alta",    label:"Feltro Pickup — Alta",    grupo:"Feltro Pickup",     tipo:"alta",    intervaloDias:10, checklistItem:`${p}c11` },
    { id:"feltro1_leque",   label:"Feltro Pickup — Leque",   grupo:"Feltro Pickup",     tipo:"leque",   intervaloDias:6,  checklistItem:`${p}c10` },
    { id:"feltro1_quimico", label:"Feltro Pickup — Químico", grupo:"Feltro Pickup",     tipo:"quimico", intervaloDias:10, checklistItem:`${p}c35` },
    // Feltro 2ª Prensa
    { id:"feltro2_alta",    label:"Feltro 2ªPrensa — Alta",    grupo:"Feltro 2ª Prensa", tipo:"alta",    intervaloDias:10, checklistItem:`${p}c14` },
    { id:"feltro2_leque",   label:"Feltro 2ªPrensa — Leque",   grupo:"Feltro 2ª Prensa", tipo:"leque",   intervaloDias:6,  checklistItem:`${p}c13` },
    { id:"feltro2_quimico", label:"Feltro 2ªPrensa — Químico", grupo:"Feltro 2ª Prensa", tipo:"quimico", intervaloDias:10, checklistItem:`${p}c36` },
    // Feltro 3ª Prensa Sup
    { id:"feltro3s_alta",    label:"Feltro 3ªP.Sup — Alta",    grupo:"Feltro 3ª Prensa Sup", tipo:"alta",    intervaloDias:10, checklistItem:`${p}c17` },
    { id:"feltro3s_leque",   label:"Feltro 3ªP.Sup — Leque",   grupo:"Feltro 3ª Prensa Sup", tipo:"leque",   intervaloDias:6,  checklistItem:`${p}c16` },
    { id:"feltro3s_quimico", label:"Feltro 3ªP.Sup — Químico", grupo:"Feltro 3ª Prensa Sup", tipo:"quimico", intervaloDias:10, checklistItem:`${p}c37` },
    // Feltro 3ª Prensa Inf
    { id:"feltro3i_alta",    label:"Feltro 3ªP.Inf — Alta",    grupo:"Feltro 3ª Prensa Inf", tipo:"alta",    intervaloDias:10, checklistItem:`${p}c20` },
    { id:"feltro3i_leque",   label:"Feltro 3ªP.Inf — Leque",   grupo:"Feltro 3ª Prensa Inf", tipo:"leque",   intervaloDias:6,  checklistItem:`${p}c19` },
    { id:"feltro3i_quimico", label:"Feltro 3ªP.Inf — Químico", grupo:"Feltro 3ª Prensa Inf", tipo:"quimico", intervaloDias:10, checklistItem:`${p}c38` },
    // Tela Superior
    { id:"telasup_alta",  label:"Tela Superior — Alta",  grupo:"Tela Superior", tipo:"alta",  intervaloDias:10, checklistItem:`${p}c6` },
    { id:"telasup_leque", label:"Tela Superior — Leque", grupo:"Tela Superior", tipo:"leque", intervaloDias:6,  checklistItem:`${p}c33` },
    // Tela Inferior
    { id:"telainf_alta",  label:"Tela Inferior — Alta",  grupo:"Tela Inferior", tipo:"alta",  intervaloDias:10, checklistItem:`${p}c8` },
    { id:"telainf_leque", label:"Tela Inferior — Leque", grupo:"Tela Inferior", tipo:"leque", intervaloDias:6,  checklistItem:`${p}c34` },
  ];
};

const TIPO_LABEL = { alta:"Alta Pressão", leque:"Leque", quimico:"Químico" };
const TIPO_COR = { alta:C.blueLight, leque:C.warningLight, quimico:C.dangerLight };

// lê o último checklist de rotina de uma máquina (para saber quem está entupido)
const ultimoChecklistRotina=(maq)=>{
  const hist=storageGet("historico_h2")||[];
  return hist.filter(h=>h&&h.tipoId==="rotina"&&h.maquina===maq).sort((a,b)=>(b.id||0)-(a.id||0))[0]||null;
};
const estaEntupido=(maq,checklistItem)=>{
  const ult=ultimoChecklistRotina(maq);
  if(!ult)return false;
  return ult.valores?.[checklistItem]==="nok";
};

// ── Ícone de chuveiro (bico + jato) ────────────────────────────────────────────
function IconeChuveiro({cor, tipo, ativo=true, size=30}){
  return(
    <svg width={size} height={size} viewBox="0 0 30 30">
      <line x1="8" y1="4" x2="22" y2="4" stroke={cor} strokeWidth="2" strokeLinecap="round" opacity={ativo?1:0.4}/>
      <line x1="15" y1="4" x2="15" y2="9" stroke={cor} strokeWidth="2" opacity={ativo?1:0.4}/>
      <circle cx="15" cy="12" r="4" fill={`${cor}22`} stroke={cor} strokeWidth="1.8" opacity={ativo?1:0.4}/>
      {tipo==="alta"&&<line x1="15" y1="16" x2="15" y2="27" stroke={cor} strokeWidth="1.4" strokeDasharray="2,2" opacity={ativo?0.9:0.3}/>}
      {tipo==="leque"&&<>
        <line x1="11" y1="16" x2="8" y2="27" stroke={cor} strokeWidth="1.2" opacity={ativo?0.9:0.3}/>
        <line x1="15" y1="16" x2="15" y2="27" stroke={cor} strokeWidth="1.2" opacity={ativo?0.9:0.3}/>
        <line x1="19" y1="16" x2="22" y2="27" stroke={cor} strokeWidth="1.2" opacity={ativo?0.9:0.3}/>
      </>}
      {tipo==="quimico"&&<circle cx="15" cy="22" r="3" fill="none" stroke={cor} strokeWidth="1.4" opacity={ativo?0.9:0.3}/>}
      {ativo&&<circle cx="15" cy="12" r="4" fill="none" stroke={cor} strokeWidth="1" opacity="0.3" style={{filter:`drop-shadow(0 0 4px ${cor})`}}/>}
    </svg>
  );
}

export function ChuveirosTela({ maquina="M2" }){
  const [maq,setMaq]=useState(maquina);
  const [chuveiros,setChuveiros]=useState(()=>storageGet("chuveiros_h2")||{M2:{},M3:{}});
  const [tick,setTick]=useState(0);
  React.useEffect(()=>{
    cloudGet("chuveiros_h2").then(d=>{if(d)setChuveiros(d);});
    cloudGet("historico_h2").then(()=>setTick(t=>t+1));
  },[]);
  const [modalChuveiro,setModalChuveiro]=useState(null); // {id}
  const [dataReg,setDataReg]=useState(hoje());
  const [fotos,setFotos]=useState([]);
  const inputFotoRef=React.useRef();
  const cfg=storageGet("op_config")||{};
  const operador=cfg.matricula||cfg.nomeOperador||cfg.nome||"—";

  const turnoAgora = turnoPorHora(new Date().getHours());

  // monta lista completa com estado atual (data + entupido) para a máquina
  const listaCompleta = React.useMemo(()=>{
    const def = DEF_CHUVEIROS(maq);
    const dados = chuveiros[maq]||{};
    return def.map(d=>({
      ...d,
      ultimaData: dados[d.id]?.ultimaData||null,
      historico: dados[d.id]?.historico||[],
      entupido: estaEntupido(maq,d.checklistItem),
    }));
  },[maq,chuveiros,tick]);

  const sugeridos = React.useMemo(()=>sugerirItens(listaCompleta, QTD_POR_TURNO[turnoAgora]),[listaCompleta,turnoAgora]);
  const sugeridosIds = new Set(sugeridos.map(s=>s.id));

  const abrirModal=(id)=>{
    setModalChuveiro(id);
    setDataReg(hoje());
    setFotos([]);
  };

  const handleFotos=async(e)=>{
    const files=Array.from(e.target.files||[]);
    e.target.value="";
    for(const f of files){
      try{ const b64=await comprimirFoto(f); setFotos(p=>[...p,b64]); }
      catch{ const rd=new FileReader(); rd.onload=ev=>setFotos(p=>[...p,ev.target.result]); rd.readAsDataURL(f); }
    }
  };

  const salvar=()=>{
    const id=modalChuveiro;
    const atual=chuveiros[maq]?.[id]||{historico:[]};
    const evento={data:dataReg||hoje(),hora:horaAtual(),operador,fotos};
    const novo={ ultimaData: dataReg||hoje(), historico:[evento,...(atual.historico||[])] };
    const novoChuveiros={...chuveiros,[maq]:{...chuveiros[maq],[id]:novo}};
    setChuveiros(novoChuveiros);
    storageSet("chuveiros_h2",novoChuveiros);
    setModalChuveiro(null); setFotos([]); setDataReg(hoje());
  };

  // agrupa por grupo (feltro/tela) para exibição visual
  const grupos = React.useMemo(()=>{
    const g={};
    listaCompleta.forEach(it=>{ if(!g[it.grupo])g[it.grupo]=[]; g[it.grupo].push(it); });
    return g;
  },[listaCompleta]);

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

      {/* Sugestão do turno */}
      <div style={{background:C.card,border:`1px solid ${C.blueLight}55`,borderTop:`3px solid ${C.blueLight}`,borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800}}>Sugestão de limpeza — {LABEL_TURNO[turnoAgora]}</div>
          <span style={{background:`${C.blueLight}22`,color:C.blueLight,borderRadius:10,padding:"2px 8px",fontSize:10,fontWeight:900}}>{sugeridos.length} chuveiros</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {sugeridos.map(s=>(
            <button key={s.id} onClick={()=>abrirModal(s.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",textAlign:"left",
              background:s.entupido?"rgba(255,82,82,0.12)":C.tagBg,border:`1.5px solid ${s.entupido?C.dangerLight:C.border}`,borderRadius:10,padding:"9px 12px",cursor:"pointer"}}>
              <IconeChuveiro cor={TIPO_COR[s.tipo]} tipo={s.tipo} size={26}/>
              <div style={{flex:1}}>
                <div style={{color:C.text,fontWeight:700,fontSize:12}}>{s.label}</div>
                <div style={{color:C.textDim,fontSize:9}}>{s.ultimaData?`última: ${fmtD(s.ultimaData)} (${s.dias}d)`:"nunca escovado"}</div>
              </div>
              {s.entupido&&<span style={{background:"rgba(255,82,82,0.2)",color:C.dangerLight,borderRadius:8,padding:"2px 7px",fontSize:9,fontWeight:900}}>ENTUPIDO</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Visão geral por grupo */}
      <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:800,marginBottom:8}}>Todos os chuveiros — {maq}</div>
      {Object.entries(grupos).map(([grupo,itens])=>(
        <div key={grupo} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
          <div style={{color:C.textMuted,fontSize:10,fontWeight:800,marginBottom:6}}>{grupo}</div>
          <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
            {itens.map(it=>{
              const dias=diasDesde(it.ultimaData);
              const vencido=dias>=it.intervaloDias;
              const cor = it.entupido?C.dangerLight:(vencido?C.warningLight:TIPO_COR[it.tipo]);
              return(
                <button key={it.id} onClick={()=>abrirModal(it.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"transparent",border:"none",cursor:"pointer"}}>
                  <IconeChuveiro cor={cor} tipo={it.tipo} ativo={!!it.ultimaData} size={26}/>
                  <span style={{color:cor,fontSize:8,fontWeight:800}}>{TIPO_LABEL[it.tipo].split(" ")[0]}</span>
                  <span style={{color:C.textDim,fontSize:7,fontFamily:"monospace"}}>{it.ultimaData?`${dias}d`:"—"}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* ── Modal registro ── */}
      {modalChuveiro&&(()=>{
        const it=listaCompleta.find(x=>x.id===modalChuveiro);
        if(!it)return null;
        const dias=diasDesde(it.ultimaData);
        return(
          <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setModalChuveiro(null)}>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"18px 18px 0 0",padding:22,width:"100%",maxWidth:600,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <IconeChuveiro cor={TIPO_COR[it.tipo]} tipo={it.tipo} size={32}/>
                <div>
                  <div style={{color:C.white,fontWeight:800,fontSize:15}}>{it.label}</div>
                  <div style={{color:C.textDim,fontSize:10}}>{it.grupo} · Máquina {maq.replace("M","")} · intervalo {it.intervaloDias}d</div>
                </div>
              </div>

              {it.entupido&&(
                <div style={{background:"rgba(255,82,82,0.15)",border:`1.5px solid ${C.dangerLight}`,borderRadius:10,padding:"8px 12px",marginBottom:12}}>
                  <span style={{color:C.dangerLight,fontWeight:900,fontSize:11}}>Apontado como ENTUPIDO no checklist de rotina</span>
                </div>
              )}

              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:14}}>
                <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase"}}>Última escovação</div>
                <div style={{color:C.text,fontWeight:800,fontSize:14,fontFamily:"monospace"}}>{it.ultimaData?`${fmtD(it.ultimaData)} (${dias} dias atrás)`:"nunca escovado"}</div>
              </div>

              <div style={{marginBottom:12}}>
                <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",marginBottom:5}}>Data do registro</div>
                <input type="date" value={dataReg} onChange={e=>setDataReg(e.target.value)} style={{...inputStyle,colorScheme:"dark"}}/>
              </div>

              <div style={{marginBottom:14}}>
                <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",marginBottom:6}}>Fotos (opcional)</div>
                <input ref={inputFotoRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handleFotos}/>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {fotos.map((f,i)=>(
                    <div key={i} style={{position:"relative",width:56,height:56}}>
                      <img src={f} style={{width:56,height:56,objectFit:"cover",borderRadius:8,border:`1px solid ${C.border}`}}/>
                      <button onClick={()=>setFotos(p=>p.filter((_,idx)=>idx!==i))} style={{position:"absolute",top:-6,right:-6,width:18,height:18,borderRadius:"50%",background:C.danger,color:"#fff",border:"none",fontSize:11,cursor:"pointer",lineHeight:1}}>×</button>
                    </div>
                  ))}
                  <button onClick={()=>inputFotoRef.current?.click()} style={{width:56,height:56,borderRadius:8,border:`1.5px dashed ${C.border}`,background:C.tagBg,color:C.textDim,fontSize:20,cursor:"pointer"}}>+</button>
                </div>
              </div>

              <div style={{display:"flex",gap:8,marginBottom:16}}>
                <button onClick={()=>setModalChuveiro(null)} style={{...btnSec,flex:1,padding:13,fontSize:13}}>Cancelar</button>
                <button onClick={salvar} style={{flex:2,padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,
                  background:C.accentDark,border:`1px solid ${C.accentLight}`,color:C.accentLight}}>
                  Confirmar Escovação
                </button>
              </div>

              <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8,fontWeight:800}}>Histórico</div>
              {(it.historico||[]).length===0?(
                <div style={{textAlign:"center",color:C.textDim,padding:"20px 0",fontSize:12}}>Nenhum registro ainda.</div>
              ):(it.historico||[]).map((ev,i)=>(
                <div key={i} style={{display:"flex",gap:10,marginBottom:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:C.accentLight,marginTop:4,flexShrink:0,boxShadow:`0 0 5px ${C.accentLight}`}}/>
                  <div style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.accentLight}`,borderRadius:8,padding:"7px 10px"}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{color:C.text,fontWeight:800,fontSize:11}}>{ev.operador}</span>
                      <span style={{color:C.textDim,fontFamily:"monospace",fontSize:9}}>{fmtD(ev.data)} {ev.hora}</span>
                    </div>
                    {ev.fotos?.length>0&&(
                      <div style={{display:"flex",gap:4,marginTop:5}}>
                        {ev.fotos.map((f,fi)=>(<img key={fi} src={f} style={{width:34,height:34,objectFit:"cover",borderRadius:5,border:`1px solid ${C.border}`}}/>))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
