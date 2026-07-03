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
const getAutoTurno=()=>{const h=new Date().getHours();if(h>=0&&h<8)return"00x08";if(h>=8&&h<16)return"08x16";return"16x24";};
const calcularLetra=()=>{
  const SEQUENCIA=["E","D","A","B","C"];
  const BASE=new Date("2026-06-09T00:00:00");
  const agora=new Date();
  const diasPassados=Math.floor((agora-BASE)/(1000*60*60*24));
  const blocoAtual=Math.floor(diasPassados/2)%5;
  const h=agora.getHours();
  const turno=h<8?0:h<16?1:2;
  const indice=((blocoAtual-turno)%5+5)%5;
  return SEQUENCIA[indice];
};
const fmtD=d=>{if(!d)return"nunca";const[y,m,dia]=d.split("-");return`${dia}/${m}/${y.slice(2)}`;};
const diasDesde=d=>{if(!d)return Infinity;const a=new Date(d+"T00:00:00");const b=new Date(hoje()+"T00:00:00");return Math.round((b-a)/86400000);};
// Regra de cor: entupido/vencido = vermelho; ≤3 dias pra vencer = amarelo; senão verde.
export const corChuveiro=(item, C_)=>{
  if(item.entupido)return C_.dangerLight;
  const dias=diasDesde(item.ultimaData);
  const restam=item.intervaloDias-dias; // dias até vencer
  if(restam<=0)return C_.dangerLight;   // vencido
  if(restam<=3)return C_.warningLight;  // perto de vencer
  return C_.accentLight;                // ok
};

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
export function IconeChuveiro({cor, tipo, ativo=true, size=30}){
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

// ═══════════════════════════════════════════════════════════════════════════
// EFICIÊNCIA MENSAL — vencimento real dia a dia vs execuções feitas
// ═══════════════════════════════════════════════════════════════════════════
export function eficienciaMes(maq){
  const def = DEF_CHUVEIROS(maq);
  const dados = storageGet("chuveiros_h2")?.[maq]||{};
  const hoje_ = new Date();
  const inicioMes = new Date(hoje_.getFullYear(), hoje_.getMonth(), 1);
  const diasNoMes = Math.floor((hoje_-inicioMes)/86400000)+1;

  // para cada chuveiro, monta lista de datas de execução (ordenada) dentro/antes do mês
  const execsPorChuveiro = {};
  def.forEach(d=>{
    const hist = (dados[d.id]?.historico||[]).map(h=>h.data).sort();
    execsPorChuveiro[d.id]=hist;
  });

  let esperado=0, feito=0;
  def.forEach(d=>{
    const execs = execsPorChuveiro[d.id];
    // "última execução antes do mês" define a base do primeiro vencimento
    let ultimaData = null;
    for(const dt of execs){ if(dt < inicioMes.toISOString().slice(0,10)) ultimaData=dt; }
    // percorre cada dia do mês até hoje, verifica se venceu e se foi feito depois
    for(let i=0;i<diasNoMes;i++){
      const dia = new Date(inicioMes); dia.setDate(dia.getDate()+i);
      const diaStr = dia.toISOString().slice(0,10);
      const diasDesdeUltima = ultimaData ? Math.round((dia-new Date(ultimaData+"T00:00:00"))/86400000) : d.intervaloDias; // sem histórico = já "vencido" ao entrar no mês
      if(diasDesdeUltima >= d.intervaloDias){
        esperado++;
        const feitoNoDia = execs.includes(diaStr);
        if(feitoNoDia){ feito++; ultimaData=diaStr; }
      }
      // atualiza ultimaData se houve execução nesse dia (mesmo sem estar vencido, conta como feito extra)
      if(execs.includes(diaStr) && diasDesdeUltima < d.intervaloDias){ ultimaData=diaStr; }
    }
  });

  const pct = esperado>0 ? Math.round((feito/esperado)*100) : 100;
  return { pct, esperado, feito };
}

export function sugestaoTurno(maq){
  const def = DEF_CHUVEIROS(maq);
  const dados = storageGet("chuveiros_h2")?.[maq]||{};
  const lista = def.map(d=>({
    ...d,
    ultimaData: dados[d.id]?.ultimaData||null,
    entupido: estaEntupido(maq,d.checklistItem),
  }));
  const turnoAgora = turnoPorHora(new Date().getHours());
  return { turno:turnoAgora, itens: sugerirItens(lista, QTD_POR_TURNO[turnoAgora]) };
}

export function ModalRegistroChuveiro({ maq, chuveiroId, onClose, onSalvo }){
  const [dataReg,setDataReg]=useState(hoje());
  const [fotos,setFotos]=useState([]);
  const inputFotoRef=React.useRef();
  const cfg=storageGet("op_config")||{};
  const operador=cfg.matricula||cfg.nomeOperador||cfg.nome||"—";

  const item = React.useMemo(()=>{
    const def=DEF_CHUVEIROS(maq).find(d=>d.id===chuveiroId);
    if(!def)return null;
    const dados=storageGet("chuveiros_h2")?.[maq]?.[chuveiroId]||{};
    return{...def,ultimaData:dados.ultimaData||null,historico:dados.historico||[],entupido:estaEntupido(maq,def.checklistItem)};
  },[maq,chuveiroId]);

  const handleFotos=async(e)=>{
    const files=Array.from(e.target.files||[]);
    e.target.value="";
    for(const f of files){
      try{ const b64=await comprimirFoto(f); setFotos(p=>[...p,b64]); }
      catch{ const rd=new FileReader(); rd.onload=ev=>setFotos(p=>[...p,ev.target.result]); rd.readAsDataURL(f); }
    }
  };

  const salvar=()=>{
    const chuveiros=storageGet("chuveiros_h2")||{M2:{},M3:{}};
    const atual=chuveiros[maq]?.[chuveiroId]||{historico:[]};
    const evento={data:dataReg||hoje(),hora:horaAtual(),operador,turno:getAutoTurno(),letra:calcularLetra(),fotos};
    const novo={ ultimaData: dataReg||hoje(), historico:[evento,...(atual.historico||[])] };
    const novoChuveiros={...chuveiros,[maq]:{...chuveiros[maq],[chuveiroId]:novo}};
    storageSet("chuveiros_h2",novoChuveiros);
    if(onSalvo)onSalvo();
    if(onClose)onClose();
  };

  if(!item)return null;
  const dias=diasDesde(item.ultimaData);

  return(
    <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"18px 18px 0 0",padding:22,width:"100%",maxWidth:600,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <IconeChuveiro cor={TIPO_COR[item.tipo]} tipo={item.tipo} size={32}/>
          <div>
            <div style={{color:C.white,fontWeight:800,fontSize:15}}>{item.label}</div>
            <div style={{color:C.textDim,fontSize:10}}>{item.grupo} · Máquina {maq.replace("M","")} · intervalo {item.intervaloDias}d</div>
          </div>
        </div>

        {item.entupido&&(
          <div style={{background:"rgba(255,82,82,0.15)",border:`1.5px solid ${C.dangerLight}`,borderRadius:10,padding:"8px 12px",marginBottom:12}}>
            <span style={{color:C.dangerLight,fontWeight:900,fontSize:11}}>Apontado como ENTUPIDO no checklist de rotina</span>
          </div>
        )}

        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:14}}>
          <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase"}}>Última escovação</div>
          <div style={{color:C.text,fontWeight:800,fontSize:14,fontFamily:"monospace"}}>{item.ultimaData?`${fmtD(item.ultimaData)} (${dias} dias atrás)`:"nunca escovado"}</div>
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
          <button onClick={onClose} style={{...btnSec,flex:1,padding:13,fontSize:13}}>Cancelar</button>
          <button onClick={salvar} style={{flex:2,padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,
            background:C.accentDark,border:`1px solid ${C.accentLight}`,color:C.accentLight}}>
            Confirmar Escovação
          </button>
        </div>

        <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8,fontWeight:800}}>Histórico</div>
        {(item.historico||[]).length===0?(
          <div style={{textAlign:"center",color:C.textDim,padding:"20px 0",fontSize:12}}>Nenhum registro ainda.</div>
        ):(item.historico||[]).map((ev,i)=>(
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
}

export function ChuveirosTela({ maquina="M2", abrirDireto=null }){
  const [aba,setAba]=useState("chuveiros"); // "chuveiros" | "prioridade" | "ranking"
  const [rkMaq,setRkMaq]=useState("todas");
  const [rkLetra,setRkLetra]=useState("todas");
  const [rkOperador,setRkOperador]=useState("todos");
  const [maq,setMaq]=useState(maquina);
  const [chuveiros,setChuveiros]=useState(()=>storageGet("chuveiros_h2")||{M2:{},M3:{}});
  const [tick,setTick]=useState(0);
  React.useEffect(()=>{
    cloudGet("chuveiros_h2").then(d=>{if(d)setChuveiros(d);});
    cloudGet("historico_h2").then(()=>setTick(t=>t+1));
  },[]);
  const [modalChuveiro,setModalChuveiro]=useState(null); // {id}
  const cfg=storageGet("op_config")||{};
  const operador=cfg.matricula||cfg.nomeOperador||cfg.nome||"—";
  React.useEffect(()=>{
    if(abrirDireto){
      if(abrirDireto.maq) setMaq(abrirDireto.maq);
      if(abrirDireto.id) setModalChuveiro(abrirDireto.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

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

  // Cota do turno é travada: calculada 1x por dia+turno+maq, não realimenta ao escovar.
  const cotaKey = `cota_${maq}_${hoje()}_${turnoAgora}`;
  const cotaTravada = React.useMemo(()=>{
    const salvo = storageGet(cotaKey);
    if(salvo) return salvo;
    const gerada = sugerirItens(listaCompleta, QTD_POR_TURNO[turnoAgora]).map(it=>it.id);
    storageSet(cotaKey, gerada);
    return gerada;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[cotaKey]);

  const sugeridos = React.useMemo(()=>
    cotaTravada.map(id=>listaCompleta.find(it=>it.id===id)).filter(Boolean)
  ,[cotaTravada,listaCompleta]);
  const sugeridosIds = new Set(sugeridos.map(s=>s.id));

  const abrirModal=(id)=>setModalChuveiro(id);

  // agrupa por grupo (feltro/tela) para exibição visual
  const grupos = React.useMemo(()=>{
    const g={};
    listaCompleta.forEach(it=>{ if(!g[it.grupo])g[it.grupo]=[]; g[it.grupo].push(it); });
    return g;
  },[listaCompleta]);

  const rankingDados = React.useMemo(()=>{
    const mesAtual = hoje().slice(0,7); // YYYY-MM
    const maquinas = rkMaq==="todas" ? ["M2","M3"] : [rkMaq];
    const contagem = {}; // operador -> {total, porMaq:{M2,M3}}
    maquinas.forEach(m=>{
      const def = DEF_CHUVEIROS(m);
      const dados = chuveiros[m]||{};
      def.forEach(d=>{
        (dados[d.id]?.historico||[]).forEach(ev=>{
          if(!ev.data?.startsWith(mesAtual))return;
          if(rkLetra!=="todas" && ev.letra!==rkLetra)return;
          if(rkOperador!=="todos" && ev.operador!==rkOperador)return;
          if(!contagem[ev.operador])contagem[ev.operador]={total:0,M2:0,M3:0,letras:new Set()};
          contagem[ev.operador].total++;
          contagem[ev.operador][m]++;
          if(ev.letra)contagem[ev.operador].letras.add(ev.letra);
        });
      });
    });
    return Object.entries(contagem).map(([op,d])=>({operador:op,...d,letras:Array.from(d.letras).sort().join(", ")})).sort((a,b)=>b.total-a.total);
  },[chuveiros,rkMaq,rkLetra,rkOperador,tick]);

  const operadoresDisponiveis = React.useMemo(()=>{
    const set=new Set();
    ["M2","M3"].forEach(m=>{
      const def=DEF_CHUVEIROS(m);
      const dados=chuveiros[m]||{};
      def.forEach(d=>(dados[d.id]?.historico||[]).forEach(ev=>set.add(ev.operador)));
    });
    return Array.from(set).sort();
  },[chuveiros]);

  // progresso do turno: quantos dos sugeridos já foram escovados hoje
  const feitosHoje = sugeridos.filter(s=>(chuveiros[maq]?.[s.id]?.historico||[]).some(h=>h.data===hoje())).length;
  const cotaTurno = QTD_POR_TURNO[turnoAgora];

  return(
    <div>
      {/* Toggle Chuveiros / Ranking */}
      <div style={{display:"flex",gap:8,marginBottom:18,background:C.surface,padding:4,borderRadius:14,border:`1px solid ${C.border}`}}>
        {[{id:"chuveiros",l:"CHUVEIROS"},{id:"prioridade",l:"PRIORIDADE"},{id:"ranking",l:"RANKING"}].map(t=>(
          <button key={t.id} onClick={()=>setAba(t.id)} style={{flex:1,padding:"10px",borderRadius:10,cursor:"pointer",fontWeight:900,fontSize:11,letterSpacing:"0.08em",transition:"all .25s",
            background:aba===t.id?`linear-gradient(135deg,${C.blueLight}33,${C.blue})`:"transparent",
            border:`1px solid ${aba===t.id?C.blueLight+"88":"transparent"}`,color:aba===t.id?C.white:C.textDim,
            boxShadow:aba===t.id?`0 0 16px ${C.blueLight}33`:"none"}}>
            {t.l}
          </button>
        ))}
      </div>

      {aba==="ranking"?(
        <div>
          {/* filtros */}
          <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
            <select value={rkMaq} onChange={e=>setRkMaq(e.target.value)} style={{...inputStyle,flex:1,minWidth:90,fontSize:12}}>
              <option value="todas">Ambas máquinas</option><option value="M2">M2</option><option value="M3">M3</option>
            </select>
            <select value={rkLetra} onChange={e=>setRkLetra(e.target.value)} style={{...inputStyle,flex:1,minWidth:90,fontSize:12}}>
              <option value="todas">Todas letras</option>
              {["A","B","C","D","E"].map(l=><option key={l} value={l}>Letra {l}</option>)}
            </select>
            <select value={rkOperador} onChange={e=>setRkOperador(e.target.value)} style={{...inputStyle,flex:1,minWidth:110,fontSize:12}}>
              <option value="todos">Todos operadores</option>
              {operadoresDisponiveis.map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {rankingDados.length===0?(
            <div style={{textAlign:"center",color:C.textDim,padding:"40px 0",fontSize:12}}>Nenhum registro no mês com esses filtros.</div>
          ):(<>
            {/* pódio top 3 */}
            <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:18}}>
              {[1,0,2].map(pos=>{
                const r=rankingDados[pos]; if(!r)return <div key={pos} style={{flex:1}}/>;
                const alturas=[92,74,60], medal=["🥇","🥈","🥉"], glow=[C.warningLight,"#C0C8D4","#CD7F32"];
                return(
                  <div key={pos} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                    <div style={{fontSize:22}}>{medal[pos]}</div>
                    <div style={{color:C.white,fontWeight:800,fontSize:11,textAlign:"center",lineHeight:1.1}}>{r.operador}</div>
                    <div style={{width:"100%",height:alturas[pos],borderRadius:"10px 10px 0 0",position:"relative",
                      background:`linear-gradient(180deg,${glow[pos]}33,${C.card})`,border:`1px solid ${glow[pos]}66`,borderBottom:"none",
                      boxShadow:`0 0 20px ${glow[pos]}22`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
                      <span style={{color:glow[pos],fontWeight:900,fontSize:26,fontFamily:"monospace",textShadow:`0 0 12px ${glow[pos]}88`}}>{r.total}</span>
                      <span style={{color:C.textDim,fontSize:8}}>escovas</span>
                      <span style={{color:C.textMuted,fontSize:8,fontWeight:700}}>Letra {r.letras||"—"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* restante da lista */}
            {rankingDados.slice(3).map((r,i)=>(
              <div key={r.operador} style={{display:"flex",alignItems:"center",gap:12,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",marginBottom:6}}>
                <span style={{color:C.textDim,fontWeight:900,fontSize:14,fontFamily:"monospace",width:24}}>{i+4}º</span>
                <div style={{flex:1}}>
                  <div style={{color:C.text,fontWeight:800,fontSize:13}}>{r.operador}</div>
                  <div style={{color:C.textDim,fontSize:9}}>Letra {r.letras||"—"} · M2 {r.M2} · M3 {r.M3}</div>
                </div>
                <span style={{color:C.accentLight,fontWeight:900,fontSize:20,fontFamily:"monospace"}}>{r.total}</span>
              </div>
            ))}
          </>)}
        </div>
      ):aba==="prioridade"?(
        <div>
          <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:900,marginBottom:12}}>
            Fila geral de prioridade — todos os chuveiros, ambas máquinas
          </div>
          {(()=>{
            const todos = [
              ...DEF_CHUVEIROS("M2").map(d=>({...d,maq:"M2"})),
              ...DEF_CHUVEIROS("M3").map(d=>({...d,maq:"M3"})),
            ].map(d=>{
              const dadosM = chuveiros[d.maq]||{};
              return{
                ...d,
                ultimaData: dadosM[d.id]?.ultimaData||null,
                entupido: estaEntupido(d.maq,d.checklistItem),
              };
            });
            const ordenados = todos.map(it=>{
              const dias=diasDesde(it.ultimaData);
              const score = it.entupido?999999:(dias/it.intervaloDias);
              return{...it,dias,score};
            }).sort((a,b)=>b.score-a.score);
            return ordenados.map((it,i)=>{
              const cor=corChuveiro(it,C);
              const restam=it.intervaloDias-it.dias;
              return(
                <button key={it.maq+it.id} onClick={()=>{setMaq(it.maq);setAba("chuveiros");abrirModal(it.id);}}
                  style={{display:"flex",alignItems:"center",gap:10,width:"100%",textAlign:"left",background:C.card,
                  border:`1px solid ${cor}44`,borderLeft:`3px solid ${cor}`,borderRadius:10,padding:"9px 12px",marginBottom:6,cursor:"pointer"}}>
                  <span style={{color:C.textDim,fontSize:10,fontFamily:"monospace",width:20}}>{i+1}</span>
                  <div style={{filter:`drop-shadow(0 0 4px ${cor}55)`}}><IconeChuveiro cor={cor} tipo={it.tipo} size={24}/></div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{color:it.maq==="M2"?C.accentLight:C.blueLight,fontSize:9,fontWeight:900,fontFamily:"monospace"}}>{it.maq}</span>
                      <span style={{color:C.text,fontWeight:700,fontSize:12}}>{it.label}</span>
                    </div>
                    <div style={{color:C.textDim,fontSize:9,fontFamily:"monospace"}}>{it.ultimaData?`última ${fmtD(it.ultimaData)}`:"nunca escovado"}</div>
                  </div>
                  {it.entupido?<span style={{color:C.dangerLight,fontSize:8,fontWeight:900}}>ENTUPIDO</span>
                    :<span style={{color:cor,fontSize:9,fontFamily:"monospace",fontWeight:700}}>{restam<=0?"vencido":`${restam}d`}</span>}
                </button>
              );
            });
          })()}
        </div>
      ):(
      <>
      {/* Seletor M2/M3 */}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {["M2","M3"].map(m=>(
          <button key={m} onClick={()=>setMaq(m)} style={{flex:1,padding:"11px",borderRadius:12,cursor:"pointer",fontWeight:900,fontSize:14,letterSpacing:"0.05em",transition:"all .2s",
            background:maq===m?`linear-gradient(135deg,${C.accentDark},${C.card})`:C.tagBg,border:`2px solid ${maq===m?C.accentLight:C.border}`,color:maq===m?C.accentLight:C.textMuted,
            boxShadow:maq===m?`0 0 18px ${C.accentLight}22`:"none"}}>
            {m}
          </button>
        ))}
      </div>

      {/* MISSÃO DO TURNO */}
      <div style={{background:`linear-gradient(160deg,${C.card},${C.blueLight}0A)`,border:`1px solid ${C.blueLight}44`,borderTop:`3px solid ${C.blueLight}`,borderRadius:16,padding:16,marginBottom:16,boxShadow:`0 4px 28px ${C.blueLight}12`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{color:C.blueLight,fontSize:9,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:900}}>Missão do Turno</div>
            <div style={{color:C.white,fontSize:15,fontWeight:800,marginTop:2}}>{LABEL_TURNO[turnoAgora]}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{color:feitosHoje>=cotaTurno?C.accentLight:C.blueLight,fontFamily:"monospace",fontWeight:900,fontSize:22}}>{feitosHoje}<span style={{color:C.textDim,fontSize:14}}>/{cotaTurno}</span></div>
            <div style={{color:C.textDim,fontSize:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>concluído</div>
          </div>
        </div>
        {/* barra de progresso */}
        <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.06)",marginBottom:14,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:3,width:`${Math.min(feitosHoje/cotaTurno*100,100)}%`,transition:"width .6s",
            background:feitosHoje>=cotaTurno?C.accentLight:C.blueLight,boxShadow:`0 0 10px ${feitosHoje>=cotaTurno?C.accentLight:C.blueLight}`}}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {sugeridos.map(s=>{
            const cor=corChuveiro(s,C);
            const jaFeito=(chuveiros[maq]?.[s.id]?.historico||[]).some(h=>h.data===hoje());
            return(
              <button key={s.id} onClick={()=>abrirModal(s.id)} style={{display:"flex",alignItems:"center",gap:12,width:"100%",textAlign:"left",
                background:jaFeito?`${C.accentLight}0C`:C.tagBg,border:`1.5px solid ${jaFeito?C.accentLight+"55":cor+"44"}`,borderLeft:`3px solid ${jaFeito?C.accentLight:cor}`,
                borderRadius:12,padding:"11px 13px",cursor:"pointer",opacity:jaFeito?0.65:1,transition:"all .2s"}}>
                <div style={{filter:`drop-shadow(0 0 5px ${cor}66)`}}><IconeChuveiro cor={jaFeito?C.accentLight:cor} tipo={s.tipo} size={30}/></div>
                <div style={{flex:1}}>
                  <div style={{color:C.text,fontWeight:800,fontSize:12.5}}>{s.label}</div>
                  <div style={{color:C.textDim,fontSize:9,fontFamily:"monospace"}}>{s.ultimaData?`última ${fmtD(s.ultimaData)} · ${s.dias}d`:"nunca escovado"}</div>
                </div>
                {jaFeito ? <span style={{color:C.accentLight,fontSize:16}}>✓</span>
                  : s.entupido ? <span style={{background:"rgba(255,82,82,0.2)",color:C.dangerLight,borderRadius:8,padding:"3px 8px",fontSize:8,fontWeight:900,letterSpacing:"0.05em"}}>ENTUPIDO</span>
                  : <span style={{color:cor,fontSize:15}}>›</span>}
              </button>
            );
          })}
          {sugeridos.length===0&&<div style={{textAlign:"center",color:C.textDim,padding:"14px 0",fontSize:11}}>Nada pendente neste turno.</div>}
        </div>
      </div>

      {/* MAPA DE CHUVEIROS (SCADA) */}
      <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:900,marginBottom:10}}>Mapa de Chuveiros — {maq}</div>
      {Object.entries(grupos).map(([grupo,itens],gi)=>(
        <div key={grupo} style={{background:`linear-gradient(150deg,${C.card},transparent)`,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{color:C.textDim,fontSize:9,fontFamily:"monospace",fontWeight:900}}>{String(gi+1).padStart(2,"0")}</span>
            <span style={{color:C.textMuted,fontSize:11,fontWeight:800,letterSpacing:"0.03em"}}>{grupo}</span>
            <div style={{flex:1,height:1,background:C.border}}/>
          </div>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            {itens.map(it=>{
              const dias=diasDesde(it.ultimaData);
              const cor=corChuveiro(it,C);
              const restam=it.intervaloDias-dias;
              return(
                <button key={it.id} onClick={()=>abrirModal(it.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"transparent",border:"none",cursor:"pointer",minWidth:52}}>
                  <div style={{position:"relative",filter:`drop-shadow(0 0 6px ${cor}55)`}}>
                    <IconeChuveiro cor={cor} tipo={it.tipo} ativo={!!it.ultimaData} size={30}/>
                    {it.entupido&&<span style={{position:"absolute",top:-4,right:-4,width:9,height:9,borderRadius:"50%",background:C.dangerLight,boxShadow:`0 0 6px ${C.dangerLight}`}}/>}
                  </div>
                  <span style={{color:cor,fontSize:8,fontWeight:900,letterSpacing:"0.03em"}}>{TIPO_LABEL[it.tipo].split(" ")[0].toUpperCase()}</span>
                  <span style={{color:C.textDim,fontSize:7.5,fontFamily:"monospace"}}>{it.ultimaData?(restam<=0?"vencido":`${restam}d`):"—"}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* ── Modal registro ── */}
      {modalChuveiro&&(
        <ModalRegistroChuveiro maq={maq} chuveiroId={modalChuveiro}
          onClose={()=>setModalChuveiro(null)}
          onSalvo={()=>{ cloudGet("chuveiros_h2").then(d=>{if(d)setChuveiros(d);}); setTick(t=>t+1); }}/>
      )}
      </>
      )}
    </div>
  );
}
