import * as React from "react";
import { useState, useRef } from "react";
import { COL, doc, setDoc, getDoc } from "./firebase";
import { FacasTela } from "./facas";

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  bg:           "#04111D",
  surface:      "#071828",
  card:         "#0A1929",
  cardHover:    "#0E2847",
  border:       "rgba(60,255,140,0.15)",
  borderLight:  "rgba(60,255,140,0.3)",
  accent:       "#00E676",
  accentHover:  "#52FF9C",
  accentDark:   "#006B2E",
  accentLight:  "#00E676",
  blue:         "#0E2847",
  blueLight:    "#1A5CCC",
  blueDark:     "#020C16",
  success:      "#00E676",
  successLight: "#52FF9C",
  warning:      "#b87d00",
  warningLight: "#FFC107",
  danger:       "#c0272d",
  dangerLight:  "#FF5252",
  text:         "#FFFFFF",
  textMuted:    "#B5C6DA",
  textDim:      "#3A5880",
  white:        "#ffffff",
  tagBg:        "rgba(10,25,45,0.9)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const storageGet = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const storageSet = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  try { setDoc(doc(COL, key), { val, ts: Date.now() }); } catch {}
};
const cloudGet = async (key) => {
  try {
    const snap = await getDoc(doc(COL, key));
    if (snap.exists()) {
      const data = snap.data().val;
      try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
      return data;
    }
  } catch {}
  return storageGet(key);
};

const inputStyle = {background:C.tagBg,border:`1px solid ${C.border}`,color:C.text,borderRadius:8,padding:"8px 12px",fontSize:13,width:"100%",boxSizing:"border-box"};
const btnPrim={background:C.accent,border:"none",color:"#fff",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:700};
const btnSec ={background:C.surface,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:8,padding:"8px 14px",cursor:"pointer",fontSize:13};
const btnIcon={background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:13};

const statusColor = (s) => s==="OP"?"green":s==="ALERTA"?"yellow":"red";
const subColor    = (s) => s==="Comum"?C.warningLight:s==="M2"?C.blueLight:C.accentLight;
const subLabel    = (s) => s==="Comum"?"⚡ COMUM":s;


// ─── Componentes auxiliares ──────────────────────────────────────────────────
const Badge = ({ children, color }) => {
  const map = {
    green: ["#002A10","#006830","#00C855"],
    yellow:["#2A1800","#8A5000","#F0A500"],
    red:   ["#2A0808","#8A1818","#E83030"],
    blue:  ["#001838","#003DA5","#5090FF"],
  };
  const [bg,bd,tx] = map[color]||map.blue;
  return <span style={{background:bg,border:`1px solid ${bd}`,color:tx,padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:800,letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{children}</span>;
};


// ─── BotaoFoto ────────────────────────────────────────────────────────────────
function BotaoFoto({ fotos=[], onAdd, onRemove, compact=false }) {
  const inputRef = React.useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onAdd(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleFile}/>
      {fotos.length>0&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
          {fotos.map((src,i)=>(
            <div key={i} style={{position:"relative"}}>
              <img src={src} alt={`foto-${i}`} style={{width:compact?48:72,height:compact?48:72,objectFit:"cover",borderRadius:8,border:`2px solid ${C.accentLight}55`}}/>
              {onRemove&&<button onClick={()=>onRemove(i)} style={{position:"absolute",top:-5,right:-5,background:C.danger,border:"none",color:"#fff",width:28,height:28,borderRadius:"50%",fontSize:10,cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>}
            </div>
          ))}
        </div>
      )}
      <button onClick={()=>inputRef.current.click()} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,background:fotos.length>0?"#0a2015":C.tagBg,border:`1px solid ${fotos.length>0?C.accentLight+"55":C.border}`,color:fotos.length>0?C.accentLight:C.textMuted,borderRadius:8,padding:compact?"4px 8px":"7px 12px",cursor:"pointer",fontSize:compact?14:16,transition:"all .15s",position:"relative"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accentLight;e.currentTarget.style.color=C.accentLight;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=fotos.length>0?C.accentLight+"55":C.border;e.currentTarget.style.color=fotos.length>0?C.accentLight:C.textMuted;}}>
        📷
        {fotos.length>0&&<span style={{background:C.accent,color:"#fff",borderRadius:"50%",width:14,height:14,fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",position:"absolute",top:-5,right:-5}}>{fotos.length}</span>}
      </button>
    </div>
  );
}

// ─── ObsFotos ─────────────────────────────────────────────────────────────────
function ObsFotos({ fotos }) {
  const [ampliada, setAmpliada] = useState(null);
  return (
    <>
      {ampliada&&<div onClick={()=>setAmpliada(null)} style={{position:"fixed",inset:0,background:"#000000ee",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}}><img src={ampliada} alt="amp" style={{maxWidth:"95vw",maxHeight:"90vh",borderRadius:12}}/></div>}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {fotos.map((src,i)=>(
          <img key={i} src={src} alt={`f-${i}`} onClick={()=>setAmpliada(src)}
            style={{width:68,height:68,objectFit:"cover",borderRadius:9,border:`2px solid ${C.accentLight}44`,cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.06)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
        ))}
      </div>
    </>
  );
}

// ─── ModalObservacao ──────────────────────────────────────────────────────────
function ModalObservacao({ eq, onClose, onSave }) {
  const now=new Date();
  const horaAtual=now.toTimeString().slice(0,5);
  const dataAtual=now.toISOString().slice(0,10);
  const [obs,setObs]=useState(eq.obsRota||"");
  const [fotos,setFotos]=useState(eq.obsRotaFotos||[]);
  const [status,setStatus]=useState(eq.status);
  const [hora,setHora]=useState(horaAtual);
  const [fotoAmpliada,setFotoAmpliada]=useState(null);
  const addFoto=(src)=>setFotos(p=>[...p,src]);
  const removeFoto=(i)=>setFotos(p=>p.filter((_,j)=>j!==i));
  return (
    <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      {fotoAmpliada&&<div onClick={()=>setFotoAmpliada(null)} style={{position:"fixed",inset:0,background:"#000000dd",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}}><img src={fotoAmpliada} alt="amp" style={{maxWidth:"95vw",maxHeight:"90vh",borderRadius:12}}/></div>}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"18px 18px 0 0",padding:22,width:"100%",maxWidth:600,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <p style={{color:C.textMuted,fontSize:10,margin:"0 0 3px",textTransform:"uppercase"}}>Observação de Rota</p>
            <h3 style={{color:C.white,fontSize:15,fontWeight:800,margin:"0 0 2px"}}>{eq.nome}</h3>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <code style={{color:C.textMuted,fontSize:10}}>{eq.tag}</code>
              <span style={{color:C.textDim,fontSize:10}}>· {eq.area}</span>
            </div>
          </div>
          <button onClick={onClose} style={{...btnSec,padding:"5px 11px"}}>✕</button>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:C.textMuted,fontSize:11}}>📅 {dataAtual.split("-").reverse().join("/")}</span>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{color:C.textMuted,fontSize:11}}>⏱</span>
            <input type="time" value={hora} onChange={e=>setHora(e.target.value)} style={{...inputStyle,width:90,padding:"3px 8px",fontSize:11}}/>
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:6}}>Status do equipamento</label>
          <div style={{display:"flex",gap:7}}>
            {["OP","ALERTA","MANUTENÇÃO"].map(s=>(
              <button key={s} onClick={()=>setStatus(s)} style={{flex:1,padding:"7px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:10,textTransform:"uppercase",background:status===s?(s==="OP"?C.success:s==="ALERTA"?C.warning:C.danger):C.tagBg,border:`1px solid ${status===s?(s==="OP"?C.accentLight:s==="ALERTA"?C.warningLight:C.dangerLight):C.border}`,color:status===s?"#fff":C.textMuted}}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:6}}>Descrição</label>
          <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={3} placeholder="Descreva o que observou durante a rota..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/>
        </div>
        <div style={{marginBottom:18}}>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:8}}>Fotos ({fotos.length})</label>
          {fotos.length>0&&(
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
              {fotos.map((src,i)=>(
                <div key={i} style={{position:"relative"}}>
                  <img src={src} alt={`obs-${i}`} onClick={()=>setFotoAmpliada(src)} style={{width:80,height:80,objectFit:"cover",borderRadius:10,border:`2px solid ${C.accentLight}55`,cursor:"pointer"}}/>
                  <button onClick={()=>removeFoto(i)} style={{position:"absolute",top:-6,right:-6,background:C.danger,border:"none",color:"#fff",width:20,height:20,borderRadius:"50%",fontSize:10,cursor:"pointer",fontWeight:700}}>✕</button>
                </div>
              ))}
            </div>
          )}
          <BotaoFoto fotos={[]} onAdd={addFoto}/>
        </div>
        <button onClick={()=>onSave(eq.id,{obs,fotos,status,data:dataAtual,hora})} style={{...btnPrim,width:"100%",padding:13}}>✓ Salvar Observação</button>
      </div>
    </div>
  );
}

// ─── ModalNotas ───────────────────────────────────────────────────────────────
function ModalNotas({ eq, onClose, onSave }) {
  const [notas,setNotas]=useState(eq.notas.map((n,i)=>({...n,_id:i})));
  const [novaNum,setNovaNum]=useState("");
  const [novaDesc,setNovaDesc]=useState("");
  const [editando,setEditando]=useState(null);
  const addNota=()=>{if(!novaNum.trim()&&!novaDesc.trim())return;setNotas(p=>[...p,{_id:Date.now(),num:novaNum.trim(),desc:novaDesc.trim()}]);setNovaNum("");setNovaDesc("");};
  const del=(id)=>setNotas(p=>p.filter(n=>n._id!==id));
  const upd=(id,f,v)=>setNotas(p=>p.map(n=>n._id===id?{...n,[f]:v}:n));
  return (
    <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"18px 18px 0 0",padding:24,width:"100%",maxWidth:600,maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.accentLight,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800,fontFamily:"monospace"}}>{eq.sub}</span>
              {eq.sub==="Comum"&&<span style={{background:"#2a180088",border:`1px solid ${C.warningLight}55`,color:C.warningLight,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800}}>⚡ IMPACTA M2 E M3</span>}
            </div>
            <h3 style={{color:C.text,fontSize:15,fontWeight:800,margin:"0 0 2px"}}>{eq.nome}</h3>
            <code style={{color:C.textMuted,fontSize:11}}>{eq.tag}</code>
          </div>
          <button onClick={onClose} style={{...btnSec,padding:"5px 11px"}}>✕</button>
        </div>
        {notas.length===0
          ?<div style={{background:C.card,border:`1px dashed ${C.border}`,borderRadius:10,padding:20,textAlign:"center",color:C.textMuted,fontSize:13,marginBottom:18}}>Nenhuma nota aberta.</div>
          :<div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
            {notas.map(nota=>(
              <div key={nota._id} style={{background:C.card,border:`1px solid ${editando===nota._id?C.accent:C.border}`,borderLeft:`3px solid ${C.warningLight}`,borderRadius:10,padding:"12px 14px"}}>
                {editando===nota._id?(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <input value={nota.num} onChange={e=>upd(nota._id,"num",e.target.value)} placeholder="Número da nota" style={inputStyle}/>
                    <textarea value={nota.desc} onChange={e=>upd(nota._id,"desc",e.target.value)} rows={2} style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/>
                    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                      <button onClick={()=>setEditando(null)} style={btnSec}>Cancelar</button>
                      <button onClick={()=>setEditando(null)} style={btnPrim}>Salvar</button>
                    </div>
                  </div>
                ):(
                  <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <span style={{background:"#2a180055",border:`1px solid ${C.warningLight}55`,color:C.warningLight,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800,fontFamily:"monospace",display:"inline-block",marginBottom:5}}>{nota.num||"S/Nº"}</span>
                      <p style={{color:C.text,fontSize:13,margin:0,lineHeight:1.5}}>{nota.desc||"—"}</p>
                    </div>
                    <div style={{display:"flex",gap:5,flexShrink:0}}>
                      <button onClick={()=>setEditando(nota._id)} style={btnIcon}>✏</button>
                      <button onClick={()=>del(nota._id)} style={{...btnIcon,color:C.dangerLight}}>🗑</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        }
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:16}}>
          <p style={{color:C.textMuted,fontSize:11,textTransform:"uppercase",margin:"0 0 10px"}}>+ Nova Nota</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <input value={novaNum} onChange={e=>setNovaNum(e.target.value)} placeholder="Número da nota (ex: MNT-2025-1234)" style={inputStyle}/>
            <textarea value={novaDesc} onChange={e=>setNovaDesc(e.target.value)} rows={2} placeholder="Descreva o problema..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/>
            <button onClick={addNota} disabled={!novaNum.trim()&&!novaDesc.trim()} style={{...btnPrim,opacity:(!novaNum.trim()&&!novaDesc.trim())?0.4:1}}>Adicionar</button>
          </div>
        </div>
        <button onClick={()=>onSave(eq.id,notas.map(({_id,...r})=>r))} style={{...btnPrim,width:"100%",padding:13}}>✓ Confirmar e Fechar</button>
      </div>
    </div>
  );
}

// ─── Arrays de Equipamentos ──────────────────────────────────────────────────
const equipamentosComum = [
  { id:"co01", tag:"31-20-0-25-01", nome:"Agitador Torre HD 1",            area:"Torre HD",      sub:"Comum" },
  { id:"co02", tag:"31-20-0-25-02", nome:"Agitador Torre HD 2",            area:"Torre HD",      sub:"Comum" },
  { id:"co03", tag:"31-20-0-25-03", nome:"Agitador Torre HD 3",            area:"Torre HD",      sub:"Comum" },
  { id:"co04", tag:"31-20-0-25-04", nome:"Agitador Torre HD 4",            area:"Torre HD",      sub:"Comum" },
  { id:"co05", tag:"31-20-0-30-01", nome:"Bomba Torre HD → Linha Fibras",  area:"Torre HD",      sub:"Comum" },
  { id:"co06", tag:"31-20-0-25-05", nome:"Agitador Torre de Quebras",      area:"Torre Quebras", sub:"Comum" },
  { id:"co07", tag:"31-20-0-30-04", nome:"Bomba Torre Quebras → Torre",    area:"Torre Quebras", sub:"Comum" },
  { id:"co08", tag:"31-20-0-30-07", nome:"Bomba Torre Água Branca → Diluição","area":"Torre Água Branca","sub":"Comum"},
  { id:"co09", tag:"31-20-HV-093",  nome:"Válvula WFT Make Up (Auto)",     area:"Torre Água Branca","sub":"Comum"},
  { id:"co10", tag:"31-20-0-30-13", nome:"Bomba Água Resfriamento",        area:"Utilidades",    sub:"Comum" },
  { id:"co11", tag:"31-00-0-30-01", nome:"Bomba Efluentes 01",             area:"Efluentes",     sub:"Comum" },
  { id:"co12", tag:"31-00-0-30-02", nome:"Bomba Efluentes 02",             area:"Efluentes",     sub:"Comum" },
  { id:"co13", tag:"31-00-0-30-03", nome:"Bomba Efluentes 03",             area:"Efluentes",     sub:"Comum" },
  { id:"co14", tag:"31-00-0-30-04", nome:"Bomba TQ Efluentes Sanitário 1", area:"Efluentes",     sub:"Comum" },
  { id:"co15", tag:"31-00-0-30-05", nome:"Bomba TQ Efluentes 2",           area:"Efluentes",     sub:"Comum" },
  { id:"co16", tag:"31-20-0-30-08", nome:"Bomba Saída Stand Pipe",         area:"Depuração",     sub:"Comum" },
  { id:"co17", tag:"31-20-LV-112A", nome:"Válvula Stand Pipe → 3º Est. L2",area:"Depuração",     sub:"Comum" },
  { id:"co18", tag:"31-20-LV-112B", nome:"Válvula Stand Pipe → 3º Est. L3",area:"Depuração",     sub:"Comum" },
].map(e => ({ ...e, status:"OP", notas:[] }));

// ─── Equipamentos M2 (32-21-xx) ───────────────────────────────────────────────
const equipamentosM2 = [
  // Acionamentos / Formação
  { id:"m2e01", tag:"32-21-0-10-13",  nome:"Acionamento Tela Superior",        area:"Formação",  sub:"M2" },
  { id:"m2e02", tag:"32-21-0-10-24",  nome:"Acionamento Tela Inferior",         area:"Formação",  sub:"M2" },
  { id:"m2e03", tag:"32-21-0-10-23",  nome:"Acionamento Rolo Couch",            area:"Formação",  sub:"M2" },
  { id:"m2e04", tag:"32-21-0-10-06",  nome:"Caixa de Vapor",                    area:"Formação",  sub:"M2" },
  { id:"m2e05", tag:"32-21-0-30-15",  nome:"Bomba 1 Pichasso",                  area:"Formação",  sub:"M2" },
  { id:"m2e06", tag:"32-21-0-30-16",  nome:"Bomba 2 Pichasso",                  area:"Formação",  sub:"M2" },
  // Prensas
  { id:"m2e07", tag:"32-21-0-10-28",  nome:"Acionamento Pick-up",               area:"Prensa",    sub:"M2" },
  { id:"m2e08", tag:"32-21-0-10-42",  nome:"Acionamento 2ª Prensa",             area:"Prensa",    sub:"M2" },
  { id:"m2e09", tag:"32-21-0-10-62A", nome:"Acionamento Prime Roll A",           area:"Prensa",    sub:"M2" },
  { id:"m2e10", tag:"32-21-0-10-62B", nome:"Acionamento Prime Roll B",           area:"Prensa",    sub:"M2" },
  { id:"m2e11", tag:"32-21-0-10-45",  nome:"Rolo Abridor após 2ª Prensa",        area:"Prensa",    sub:"M2" },
  { id:"m2e12", tag:"32-21-0-10-78",  nome:"Rolo Abridor após 3ª Prensa",        area:"Prensa",    sub:"M2" },
  // UH / Lubrificação
  { id:"m2e13", tag:"32-21-0-30-43",  nome:"Bomba UH Prensas Circulação",        area:"UH / Lub.", sub:"M2" },
  { id:"m2e14", tag:"32-21-0-30-44",  nome:"Bomba UH Prensas A",                 area:"UH / Lub.", sub:"M2" },
  { id:"m2e15", tag:"32-21-0-30-45",  nome:"Bomba UH Prensas B",                 area:"UH / Lub.", sub:"M2" },
  { id:"m2e16", tag:"32-21-0-30-46",  nome:"Bomba Lubrificação A",               area:"UH / Lub.", sub:"M2" },
  { id:"m2e17", tag:"32-21-0-30-47",  nome:"Bomba Lubrificação B",               area:"UH / Lub.", sub:"M2" },
  // Prime Press
  { id:"m2e18", tag:"32-21-0-30-39",  nome:"Bomba Alimentação Prime Press",      area:"Prime Press","sub":"M2" },
  { id:"m2e19", tag:"32-21-0-30-40",  nome:"Bomba Pressão Prime Press A",        area:"Prime Press","sub":"M2" },
  { id:"m2e20", tag:"32-21-0-30-41",  nome:"Bomba Pressão Prime Press B",        area:"Prime Press","sub":"M2" },
  { id:"m2e21", tag:"32-21-0-30-42",  nome:"Bomba Retorno Prime Press",          area:"Prime Press","sub":"M2" },
  { id:"m2e22", tag:"32-21-0-35-101A",nome:"Soprador 1 Prime Press",             area:"Prime Press","sub":"M2" },
  { id:"m2e23", tag:"32-21-0-35-101B",nome:"Soprador 2 Prime Press",             area:"Prime Press","sub":"M2" },
  // Vácuo / Extração
  { id:"m2e24", tag:"32-21-0-30-33",  nome:"Bomba de Vácuo 33",                  area:"Vácuo",     sub:"M2" },
  { id:"m2e25", tag:"32-21-0-30-35",  nome:"Bomba de Vácuo 35",                  area:"Vácuo",     sub:"M2" },
  { id:"m2e26", tag:"32-21-0-30-36",  nome:"Bomba de Vácuo 36",                  area:"Vácuo",     sub:"M2" },
  { id:"m2e27", tag:"32-21-0-30-37",  nome:"Bomba de Vácuo 37",                  area:"Vácuo",     sub:"M2" },
  { id:"m2e28", tag:"32-21-0-30-38",  nome:"Bomba de Vácuo 38",                  area:"Vácuo",     sub:"M2" },
  { id:"m2e29", tag:"32-21-0-30-26",  nome:"Bomba de Extração 26",               area:"Vácuo",     sub:"M2" },
  { id:"m2e30", tag:"32-21-0-30-28",  nome:"Bomba de Extração 28",               area:"Vácuo",     sub:"M2" },
  // Bombas de processo
  { id:"m2e31", tag:"32-21-0-30-06",  nome:"Bomba Tanque da Máquina",            area:"Bombas",    sub:"M2" },
  { id:"m2e32", tag:"32-21-0-30-07",  nome:"Bomba de Mistura",                   area:"Bombas",    sub:"M2" },
  { id:"m2e33", tag:"32-21-0-30-09",  nome:"Bomba Diluição Cx. Entrada",         area:"Bombas",    sub:"M2" },
  { id:"m2e34", tag:"32-21-0-30-11",  nome:"Bomba TQ Água Branca L2",            area:"Bombas",    sub:"M2" },
  { id:"m2e35", tag:"32-21-0-30-18",  nome:"Bomba 4 BAR",                        area:"Bombas",    sub:"M2" },
  { id:"m2e36", tag:"32-21-0-30-19",  nome:"Bomba 20 BAR",                       area:"Bombas",    sub:"M2" },
  { id:"m2e37", tag:"32-21-0-30-21",  nome:"Bomba 8 BAR",                        area:"Bombas",    sub:"M2" },
  { id:"m2e38", tag:"32-21-0-30-01",  nome:"Bomba Trocador de Calor",            area:"Bombas",    sub:"M2" },
  { id:"m2e39", tag:"32-21-0-30-03",  nome:"Bomba Torre Água → Pulper Úmido",    area:"Bombas",    sub:"M2" },
  { id:"m2e40", tag:"32-21-0-30-12",  nome:"Bomba Chuveiro Destacador",          area:"Bombas",    sub:"M2" },
  // Quebras / Pulper
  { id:"m2e41", tag:"32-21-0-10-71",  nome:"Transportador de Quebras",           area:"Quebras",      sub:"M2" },
  { id:"m2e42", tag:"32-21-0-25-03",  nome:"Agitador Pulper Úmido 03",           area:"Quebras",      sub:"M2" },
  { id:"m2e43", tag:"32-21-0-25-04",  nome:"Agitador Pulper Úmido 04",           area:"Quebras",      sub:"M2" },
  { id:"m2e44", tag:"32-21-0-30-13",  nome:"Bomba Pulper Úmido → Torre",         area:"Quebras",      sub:"M2" },
  { id:"m2e45", tag:"32-21-0-25-02",  nome:"Agitador TQ da Máquina",             area:"Quebras",      sub:"M2" },
  // Depuração
  { id:"m2e46", tag:"32-11-0-10-01",  nome:"Depurador 1º Estágio P1",            area:"Depuração",    sub:"M2" },
  { id:"m2e47", tag:"32-11-0-10-02",  nome:"Depurador 1º Estágio P2",            area:"Depuração",    sub:"M2" },
  { id:"m2e48", tag:"32-11-0-10-03",  nome:"Depurador 1º Estágio P3",            area:"Depuração",    sub:"M2" },
  { id:"m2e49", tag:"32-11-0-10-04",  nome:"Depurador 2º Estágio",               area:"Depuração",    sub:"M2" },
  { id:"m2e50", tag:"32-11-0-10-05",  nome:"Depurador 3º Estágio",               area:"Depuração",    sub:"M2" },
  { id:"m2e51", tag:"32-11-0-30-04",  nome:"Bomba TQ Depuração → Depuradores",   area:"Depuração",    sub:"M2" },
  { id:"m2e52", tag:"32-11-0-30-06",  nome:"Bomba Alimentação 2º Estágio",       area:"Depuração",    sub:"M2" },
  { id:"m2e53", tag:"32-11-0-30-07",  nome:"Bomba Alimentação 3º Estágio",       area:"Depuração",    sub:"M2" },
  // Cleaners / DOS
  { id:"m2e54", tag:"32-11-0-30-08",  nome:"Bomba Alimentação Cleaners 1º Est.", area:"Cleaners",     sub:"M2" },
  { id:"m2e55", tag:"32-11-0-30-09",  nome:"Bomba Alimentação Cleaners 2º Est.", area:"Cleaners",     sub:"M2" },
  { id:"m2e56", tag:"32-11-0-30-10",  nome:"Bomba Alimentação Cleaners 3º Est.", area:"Cleaners",     sub:"M2" },
  { id:"m2e57", tag:"32-11-0-30-11",  nome:"Bomba Alimentação Cleaners 4º Est.", area:"Cleaners",     sub:"M2" },
  { id:"m2e58", tag:"32-11-OV-037",   nome:"Válvula Geral Água Elutriação",       area:"Cleaners",     sub:"M2" },
  // Tanques
  { id:"m2e59", tag:"32-11-0-25-07",  nome:"Agitador TQ Depuração",              area:"Tanques",      sub:"M2" },
  { id:"m2e60", tag:"32-21-0-30-31",  nome:"Bomba Alimentação Micrascreen",      area:"Tanques",      sub:"M2" },
].map(e => ({ ...e, status:"OP", notas:[] }));

// ─── Equipamentos M3 (33-21-xx) ───────────────────────────────────────────────
const equipamentosM3 = [
  // Acionamentos / Formação
  { id:"m3e01", tag:"33-21-0-10-13",  nome:"Acionamento Tela Superior",         area:"Formação",  sub:"M3" },
  { id:"m3e02", tag:"33-21-0-10-24",  nome:"Acionamento Tela Inferior",          area:"Formação",  sub:"M3" },
  { id:"m3e03", tag:"33-21-10-23",    nome:"Rolo Tela Sucção (Couch)",           area:"Formação",  sub:"M3" },
  { id:"m3e04", tag:"33-21-0-10-06",  nome:"Caixa de Vapor",                     area:"Formação",  sub:"M3" },
  { id:"m3e05", tag:"33-21-0-30-15",  nome:"Bomba 1 Pichasso",                   area:"Formação",  sub:"M3" },
  { id:"m3e06", tag:"33-21-0-30-16",  nome:"Bomba 2 Pichasso",                   area:"Formação",  sub:"M3" },
  { id:"m3e07", tag:"33-21-0-10-183", nome:"Motor Movimento Pichasso",           area:"Formação",  sub:"M3" },
  // Prensas
  { id:"m3e08", tag:"33-21-0-10-28",  nome:"Acionamento Pick-up",                area:"Prensa",    sub:"M3" },
  { id:"m3e09", tag:"33-21-0-10-42",  nome:"Acionamento 2ª Prensa",              area:"Prensa",    sub:"M3" },
  { id:"m3e10", tag:"33-21-0-10-62A", nome:"Acionamento Prime Roll A",            area:"Prensa",    sub:"M3" },
  { id:"m3e11", tag:"33-21-0-10-62B", nome:"Acionamento Prime Roll B",            area:"Prensa",    sub:"M3" },
  { id:"m3e12", tag:"33-21-10-45",    nome:"Rolo Abridor 1",                      area:"Prensa",    sub:"M3" },
  { id:"m3e13", tag:"33-21-10-78",    nome:"Rolo Abridor 2",                      area:"Prensa",    sub:"M3" },
  // UH / Lubrificação
  { id:"m3e14", tag:"33-21-0-30-43",  nome:"Bomba UH Prensas Circulação",         area:"UH / Lub.", sub:"M3" },
  { id:"m3e15", tag:"33-21-0-30-44",  nome:"Bomba UH Prensas A",                  area:"UH / Lub.", sub:"M3" },
  { id:"m3e16", tag:"33-21-0-30-45",  nome:"Bomba UH Prensas B",                  area:"UH / Lub.", sub:"M3" },
  { id:"m3e17", tag:"33-21-0-30-46",  nome:"Bomba Lubrificação A",                area:"UH / Lub.", sub:"M3" },
  { id:"m3e18", tag:"33-21-0-30-47",  nome:"Bomba Lubrificação B",                area:"UH / Lub.", sub:"M3" },
  // Prime Press
  { id:"m3e19", tag:"33-21-0-30-39",  nome:"Bomba Alimentação Prime Press",       area:"Prime Press","sub":"M3" },
  { id:"m3e20", tag:"33-21-0-30-40",  nome:"Bomba Pressão Prime Press A",         area:"Prime Press","sub":"M3" },
  { id:"m3e21", tag:"33-21-0-30-41",  nome:"Bomba Pressão Prime Press B",         area:"Prime Press","sub":"M3" },
  { id:"m3e22", tag:"33-21-0-30-42",  nome:"Bomba Retorno Prime Press",           area:"Prime Press","sub":"M3" },
  { id:"m3e23", tag:"33-21-0-35-101A",nome:"Soprador 1 Prime Press",              area:"Prime Press","sub":"M3" },
  { id:"m3e24", tag:"33-21-0-35-101B",nome:"Soprador 2 Prime Press",              area:"Prime Press","sub":"M3" },
  // Vácuo / Extração
  { id:"m3e25", tag:"33-21-0-30-33",  nome:"Bomba de Vácuo 33",                   area:"Vácuo",     sub:"M3" },
  { id:"m3e26", tag:"33-21-0-30-35",  nome:"Bomba de Vácuo 35",                   area:"Vácuo",     sub:"M3" },
  { id:"m3e27", tag:"33-21-0-30-36",  nome:"Bomba de Vácuo 36",                   area:"Vácuo",     sub:"M3" },
  { id:"m3e28", tag:"33-21-0-30-37",  nome:"Bomba de Vácuo 37",                   area:"Vácuo",     sub:"M3" },
  { id:"m3e29", tag:"33-21-0-30-38",  nome:"Bomba de Vácuo 38",                   area:"Vácuo",     sub:"M3" },
  { id:"m3e30", tag:"33-21-0-30-26",  nome:"Bomba de Extração 26",                area:"Vácuo",     sub:"M3" },
  { id:"m3e31", tag:"33-21-0-30-27",  nome:"Bomba de Extração 27",                area:"Vácuo",     sub:"M3" },
  { id:"m3e32", tag:"33-21-0-30-28",  nome:"Bomba de Extração 28",                area:"Vácuo",     sub:"M3" },
  { id:"m3e33", tag:"33-21-0-30-29",  nome:"Bomba de Extração 29",                area:"Vácuo",     sub:"M3" },
  { id:"m3e34", tag:"33-21-0-30-30",  nome:"Bomba de Extração 30",                area:"Vácuo",     sub:"M3" },
  // Bombas de processo
  { id:"m3e35", tag:"33-21-0-30-06",  nome:"Bomba Tanque da Máquina",             area:"Bombas",    sub:"M3" },
  { id:"m3e36", tag:"33-21-0-30-07",  nome:"Bomba de Mistura",                    area:"Bombas",    sub:"M3" },
  { id:"m3e37", tag:"33-21-0-30-09",  nome:"Bomba Diluição Cx. Entrada",          area:"Bombas",    sub:"M3" },
  { id:"m3e38", tag:"33-21-0-30-11",  nome:"Bomba TQ Água Branca L3",             area:"Bombas",    sub:"M3" },
  { id:"m3e39", tag:"33-21-0-30-18",  nome:"Bomba 4 BAR Chuveiros",               area:"Bombas",    sub:"M3" },
  { id:"m3e40", tag:"33-21-0-30-21",  nome:"Bomba 8 BAR",                         area:"Bombas",    sub:"M3" },
  { id:"m3e41", tag:"33-21-0-30-01",  nome:"Bomba Trocador de Calor",             area:"Bombas",    sub:"M3" },
  { id:"m3e42", tag:"33-21-0-30-03",  nome:"Bomba Torre Água → Pulper Úmido",     area:"Bombas",    sub:"M3" },
  { id:"m3e43", tag:"33-21-0-30-12",  nome:"Bomba Chuveiro Destacador",           area:"Bombas",    sub:"M3" },
  { id:"m3e44", tag:"33-21-0-30-31",  nome:"Bomba Alimentação Micrascreen",       area:"Bombas",    sub:"M3" },
  // Quebras / Pulper
  { id:"m3e45", tag:"33-21-0-10-71",  nome:"Transportador de Quebras",            area:"Quebras",      sub:"M3" },
  { id:"m3e46", tag:"33-21-0-25-03",  nome:"Agitador Pulper Úmido 03",            area:"Quebras",      sub:"M3" },
  { id:"m3e47", tag:"33-21-0-25-04",  nome:"Agitador Pulper Úmido 04",            area:"Quebras",      sub:"M3" },
  { id:"m3e48", tag:"33-21-0-30-13",  nome:"Bomba Pulper Úmido → Torre",          area:"Quebras",      sub:"M3" },
  { id:"m3e49", tag:"33-21-0-25-02",  nome:"Agitador TQ da Máquina",              area:"Quebras",      sub:"M3" },
  // Depuração
  { id:"m3e50", tag:"33-11-0-10-01",  nome:"Depurador 1º Estágio P1",             area:"Depuração",    sub:"M3" },
  { id:"m3e51", tag:"33-11-0-10-02",  nome:"Depurador 1º Estágio P2",             area:"Depuração",    sub:"M3" },
  { id:"m3e52", tag:"33-11-0-10-03",  nome:"Depurador 1º Estágio P3",             area:"Depuração",    sub:"M3" },
  { id:"m3e53", tag:"33-11-0-10-04",  nome:"Depurador 2º Estágio",                area:"Depuração",    sub:"M3" },
  { id:"m3e54", tag:"33-11-0-10-05",  nome:"Depurador 3º Estágio",                area:"Depuração",    sub:"M3" },
  { id:"m3e55", tag:"33-11-0-30-04",  nome:"Bomba TQ Depuração → Depuradores",    area:"Depuração",    sub:"M3" },
  { id:"m3e56", tag:"33-11-0-30-06",  nome:"Bomba Alimentação 2º Estágio",        area:"Depuração",    sub:"M3" },
  { id:"m3e57", tag:"33-11-0-30-07",  nome:"Bomba Alimentação 3º Estágio",        area:"Depuração",    sub:"M3" },
  // Cleaners / DOS
  { id:"m3e58", tag:"33-11-0-30-08",  nome:"Bomba Alimentação Cleaners 1º Est.",  area:"Cleaners",     sub:"M3" },
  { id:"m3e59", tag:"33-11-0-30-09",  nome:"Bomba Alimentação Cleaners 2º Est.",  area:"Cleaners",     sub:"M3" },
  { id:"m3e60", tag:"33-11-0-30-10",  nome:"Bomba Alimentação Cleaners 3º Est.",  area:"Cleaners",     sub:"M3" },
  { id:"m3e61", tag:"33-11-0-30-11",  nome:"Bomba Alimentação Cleaners 4º Est.",  area:"Cleaners",     sub:"M3" },
  { id:"m3e62", tag:"33-11-OV-037",   nome:"Válvula Geral Água Elutriação",        area:"Cleaners",     sub:"M3" },
  // Tanques
  { id:"m3e63", tag:"33-11-0-25-07",  nome:"Agitador TQ Depuração",               area:"Tanques",      sub:"M3" },
  { id:"m3e64", tag:"33-21-0-30-31",  nome:"Bomba Alimentação Micrascreen",       area:"Tanques",      sub:"M3" },
  { id:"m3e65", tag:"33-21-0-30-18",  nome:"Bomba 4 BAR Chuveiros",               area:"Tanques",      sub:"M3" },
].map(e => ({ ...e, status:"OP", notas:[] }));

// ─── Check-lists (M2 e M3 com valores separados) ─────────────────────────────
const checklistM2 = [
  { id:"m2c1",  secao:"Pichasso", item:"Nível do tanque do Pichasso",                           ref:"—",             unit:"ok/ñok",  tipo:"ok_nok"  },
  { id:"m2c2",  secao:"Pichasso", item:"Funcionamento da bomba do Pichasso",                    ref:"—",             unit:"ok/ñok",  tipo:"ok_nok"  },
  { id:"m2c3",  secao:"Pichasso", item:"Posição Pichasso L.C — está sujando?",                  ref:"5 e 4",         unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c4",  secao:"Pichasso", item:"Posição Pichasso L.A — está sujando?",                  ref:"5,3 e 5,5",     unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c5",  secao:"Telas",    item:"Tela superior – tensão, marcas, desgaste, posic.",      ref:"7,5",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m2c6",  secao:"Telas",    item:"Chuveiro tela superior está oscilando?",                ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c7",  secao:"Telas",    item:"Tela inferior – tensão, marcas, desgaste, posic.",      ref:"7,0",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m2c8",  secao:"Telas",    item:"Chuveiro tela inferior está oscilando?",                ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c9",  secao:"Feltros",  item:"Feltro pickup – tensão, marcas, desgaste, posic.",      ref:"3,2",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m2c10", secao:"Feltros",  item:"Feltro pickup – chuveiro leque com bico entupido?",     ref:"2,5 bar",       unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c11", secao:"Feltros",  item:"Feltro pickup – chuveiro oscilante entupido?",          ref:"12,5 bar",      unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c12", secao:"Feltros",  item:"Feltro 2ª prensa – tensão, marcas, desgaste, posic.",   ref:"3,5",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m2c13", secao:"Feltros",  item:"Feltro 2ª prensa – chuveiro leque entupido?",           ref:"2,5 bar",       unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c14", secao:"Feltros",  item:"Feltro 2ª prensa – chuveiro oscilante entupido?",       ref:"12,5 bar",      unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c15", secao:"Feltros",  item:"Feltro 3ª prensa Sup – tensão, marcas, desgaste.",      ref:"—",             unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m2c16", secao:"Feltros",  item:"Feltro 3ª prensa Sup – chuveiro leque entupido?",       ref:"2,5 bar",       unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c17", secao:"Feltros",  item:"Feltro 3ª prensa Sup – chuveiro oscilante entupido?",   ref:"12,5 bar",      unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c18", secao:"Feltros",  item:"Feltro 3ª prensa Inf – tensão, marcas, desgaste.",      ref:"3,5",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m2c19", secao:"Feltros",  item:"Feltro 3ª prensa Inf – chuveiro leque entupido?",       ref:"2,5 bar",       unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c20", secao:"Feltros",  item:"Feltro 3ª prensa Inf – chuveiro oscilante entupido?",   ref:"12,5 bar",      unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c21", secao:"Prensas",  item:"Pressão WED ZONE – zonas 1 a 5",                        ref:"2/1,5/1/1,5/2", unit:"ok/ñok",  tipo:"ok_nok"  },
  { id:"m2c22", secao:"Prensas",  item:"Pressão régua vedação COUCH",                           ref:"0,85 e 0,5",    unit:"bar",     tipo:"valor"   },
  { id:"m2c23", secao:"Prensas",  item:"Pressão régua vedação PICK UP",                         ref:"0,75 e 0,75",   unit:"bar",     tipo:"valor"   },
  { id:"m2c24", secao:"Prensas",  item:"Vazão água rolo COUCH",                                 ref:"—",             unit:"m³/h",    tipo:"valor"   },
  { id:"m2c25", secao:"Prensas",  item:"Vazão água rolo PICK UP",                               ref:"—",             unit:"m³/h",    tipo:"valor"   },
  { id:"m2c26", secao:"Prensas",  item:"Pressão Lump Breaker",                                  ref:"25",            unit:"kN/m",    tipo:"valor"   },
  { id:"m2c27", secao:"Prensas",  item:"Pressão 1ª prensa",                                     ref:"55",            unit:"kN/m",    tipo:"valor"   },
  { id:"m2c28", secao:"Prensas",  item:"Pressão 2ª prensa",                                     ref:"151",           unit:"kN/m",    tipo:"valor"   },
  { id:"m2c29", secao:"Prensas",  item:"Pressão 3ª prensa",                                     ref:"1200",          unit:"kN/m",    tipo:"valor"   },
  { id:"m2c30", secao:"Rolos",    item:"Passe Rolo curvo após 2ª Prensa (32-21-0-10-45)",        ref:"1",             unit:"%",       tipo:"valor"   },
  { id:"m2c31", secao:"Rolos",    item:"Passe PRIME PRESS",                                     ref:"1,6",           unit:"%",       tipo:"valor"   },
  { id:"m2c32", secao:"Rolos",    item:"Passe Rolo curvo após 3ª Prensa (32-21-0-10-78)",        ref:"0,2",           unit:"%",       tipo:"valor"   },
];
const checklistM3 = [
  { id:"m3c1",  secao:"Pichasso", item:"Nível do tanque do Pichasso",                           ref:"—",             unit:"ok/ñok",  tipo:"ok_nok"  },
  { id:"m3c2",  secao:"Pichasso", item:"Funcionamento da bomba do Pichasso",                    ref:"—",             unit:"ok/ñok",  tipo:"ok_nok"  },
  { id:"m3c3",  secao:"Pichasso", item:"Posição Pichasso L.C — está sujando?",                  ref:"5 e 4,9",       unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c4",  secao:"Pichasso", item:"Posição Pichasso L.A — está sujando?",                  ref:"5,1 e 6,5",     unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c5",  secao:"Telas",    item:"Tela superior – tensão, marcas, desgaste, posic.",      ref:"6,5",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m3c6",  secao:"Telas",    item:"Chuveiro tela superior está oscilando?",                ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c7",  secao:"Telas",    item:"Tela inferior – tensão, marcas, desgaste, posic.",      ref:"6,8",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m3c8",  secao:"Telas",    item:"Chuveiro tela inferior está oscilando?",                ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c9",  secao:"Feltros",  item:"Feltro pickup – tensão, marcas, desgaste, posic.",      ref:"3,8",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m3c10", secao:"Feltros",  item:"Feltro pickup – chuveiro leque com bico entupido?",     ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c11", secao:"Feltros",  item:"Feltro pickup – chuveiro oscilante entupido?",          ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c12", secao:"Feltros",  item:"Feltro 2ª prensa – tensão, marcas, desgaste, posic.",   ref:"3,6",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m3c13", secao:"Feltros",  item:"Feltro 2ª prensa – chuveiro leque entupido?",           ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c14", secao:"Feltros",  item:"Feltro 2ª prensa – chuveiro oscilante entupido?",       ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c15", secao:"Feltros",  item:"Feltro 3ª prensa Sup – tensão, marcas, desgaste.",      ref:"4,3",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m3c16", secao:"Feltros",  item:"Feltro 3ª prensa Sup – chuveiro leque entupido?",       ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c17", secao:"Feltros",  item:"Feltro 3ª prensa Sup – chuveiro oscilante entupido?",   ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c18", secao:"Feltros",  item:"Feltro 3ª prensa Inf – tensão, marcas, desgaste.",      ref:"4,7",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m3c19", secao:"Feltros",  item:"Feltro 3ª prensa Inf – chuveiro leque entupido?",       ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c20", secao:"Feltros",  item:"Feltro 3ª prensa Inf – chuveiro oscilante entupido?",   ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c21", secao:"Prensas",  item:"Pressão WED ZONE – zonas 1 a 5",                        ref:"2/1,5/1/1,5/2", unit:"ok/ñok",  tipo:"ok_nok"  },
  { id:"m3c22", secao:"Prensas",  item:"Pressão régua vedação COUCH",                           ref:"0,9 e 0,7",     unit:"bar",     tipo:"valor"   },
  { id:"m3c23", secao:"Prensas",  item:"Pressão régua vedação PICK UP",                         ref:"0,75 e 0,7",    unit:"bar",     tipo:"valor"   },
  { id:"m3c24", secao:"Prensas",  item:"Vazão água rolo COUCH",                                 ref:"—",             unit:"m³/h",    tipo:"valor"   },
  { id:"m3c25", secao:"Prensas",  item:"Vazão água rolo PICK UP",                               ref:"—",             unit:"m³/h",    tipo:"valor"   },
  { id:"m3c26", secao:"Prensas",  item:"Pressão Lump Breaker",                                  ref:"25",            unit:"kN/m",    tipo:"valor"   },
  { id:"m3c27", secao:"Prensas",  item:"Pressão 1ª prensa",                                     ref:"55",            unit:"kN/m",    tipo:"valor"   },
  { id:"m3c28", secao:"Prensas",  item:"Pressão 2ª prensa",                                     ref:"150",           unit:"kN/m",    tipo:"valor"   },
  { id:"m3c29", secao:"Prensas",  item:"Pressão 3ª prensa",                                     ref:"1200",          unit:"kN/m",    tipo:"valor"   },
  { id:"m3c30", secao:"Rolos",    item:"Passe Rolo curvo após 2ª Prensa (33-21-0-10-45)",        ref:"1",             unit:"%",       tipo:"valor"   },
  { id:"m3c31", secao:"Rolos",    item:"Passe PRIME PRESS",                                     ref:"1,6",           unit:"%",       tipo:"valor"   },
  { id:"m3c32", secao:"Rolos",    item:"Passe Rolo curvo após 3ª Prensa (33-21-0-10-78)",        ref:"0,2",           unit:"%",       tipo:"valor"   },
];

// ─── Check-list Passagem de Ponta (igual M2 e M3 — mesmo formulário) ─────────
const checklistPassagemPonta = [
  // ── Operação Parte Úmida ──────────────────────────────────────────────────
  { id:"pp01", secao:"P. Úmida",    item:"1ª checagem — movimento do pichasso — verificar corrente",          ref:"—",         unit:"ok/ñok",  tipo:"ok_nok" },
  { id:"pp02", secao:"P. Úmida",    item:"Verificar acúmulo de massa nas estruturas do pichasso e caixa de vapor", ref:"—",    unit:"ok/ñok",  tipo:"ok_nok" },
  { id:"pp03", secao:"P. Úmida",    item:"Velocidade da máquina",                                             ref:"150",       unit:"m/min",   tipo:"valor"  },
  { id:"pp04", secao:"P. Úmida",    item:"Ratio de ajuste da gramatura",                                      ref:"1,0000",    unit:"—",       tipo:"valor"  },
  { id:"pp05", secao:"P. Úmida",    item:"Relação de dosagem de quebras",                                     ref:"80%",       unit:"%",       tipo:"valor"  },
  { id:"pp06", secao:"P. Úmida",    item:"Relação de dosagem de massa da torre HD",                           ref:"20%",       unit:"%",       tipo:"valor"  },
  { id:"pp07", secao:"P. Úmida",    item:"Bombas de vácuo (MODO E1 LIGADAS)",                                 ref:"—",         unit:"ok/ñok",  tipo:"ok_nok" },
  { id:"pp08", secao:"P. Úmida",    item:"Fluxo de massa para caixa de entrada (consist. E1 - pop-up W4)",    ref:"±2950",     unit:"m³/h",    tipo:"valor"  },
  { id:"pp09", secao:"P. Úmida",    item:"Consistência tanque da máquina (consist. E1 - pop-up W4)",          ref:"3,30%",     unit:"%",       tipo:"valor"  },
  { id:"pp10", secao:"P. Úmida",    item:"Wedge Zone (FECHADA COM CARGA)",                                    ref:"—",         unit:"ok/ñok",  tipo:"ok_nok" },
  { id:"pp11", secao:"P. Úmida",    item:"Pressão do Lumpbreaker",                                            ref:"30",        unit:"kN/m",    tipo:"valor"  },
  { id:"pp12", secao:"P. Úmida",    item:"Pressão da 1ª prensa",                                              ref:"45",        unit:"kN/m",    tipo:"valor"  },
  { id:"pp13", secao:"P. Úmida",    item:"Pressão da 2ª prensa",                                              ref:"170",       unit:"kN/m",    tipo:"valor"  },
  { id:"pp14", secao:"P. Úmida",    item:"Folha acompanhando feltro pick up",                                 ref:"—",         unit:"sim/não", tipo:"sim_nao"},
  { id:"pp15", secao:"P. Úmida",    item:"Pressão da shoe press",                                             ref:"1150",      unit:"kN/m",    tipo:"valor"  },
  { id:"pp16", secao:"P. Úmida",    item:"Caixa de vapor (ABAIXADA e VAPOR LIGADO)",                          ref:"—",         unit:"ok/ñok",  tipo:"ok_nok" },
  { id:"pp17", secao:"P. Úmida",    item:"Ajuste do perfil de gramatura MODO PASSAGEM DE PONTA (SDCD)",       ref:"—",         unit:"ok/ñok",  tipo:"ok_nok" },
  { id:"pp18", secao:"P. Úmida",    item:"Válvula de recirculação da caixa de entrada ajustada para fase inicial", ref:"20%",  unit:"%",       tipo:"valor"  },
  { id:"pp19", secao:"P. Úmida",    item:"Chapinha fim de curso do pichasso móvel LA alinhada com pichasso fixo", ref:"—",     unit:"ok/ñok",  tipo:"ok_nok" },
];

// ─── Check-list Passagem de Ponta — Parte Seca/Cortadeira ────────────────────
// (Os itens abaixo foram movidos do checklist de Passagem de Ponta da P.Úmida)
const checklistPassagemPontaCS = [
  { id:"ppcs01", secao:"P. Seca", item:"Todas caixas sopradoras do secador (ABAIXADAS)",                    ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs02", secao:"P. Seca", item:"Setpoint do sensor Slack (MODO AUTO)",                              ref:"19%",  unit:"%",      tipo:"valor"  },
  { id:"ppcs03", secao:"P. Seca", item:"Setpoint do sensor Slack (INDICAÇÃO SEM FOLHA)",                    ref:"100%", unit:"%",      tipo:"valor"  },
  { id:"ppcs04", secao:"P. Seca", item:"Set point da célula de carga antes passagem de ponta",              ref:"280",  unit:"KN/m",   tipo:"valor"  },
  { id:"ppcs05", secao:"P. Seca", item:"Cabo de aço da fita de passagem de ponta folgado",                  ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs06", secao:"P. Seca", item:"Pressão do rolo de tração (MODO PASSAGEM DE PONTA)",                ref:"0,6",  unit:"KN/m",   tipo:"valor"  },
  { id:"ppcs07", secao:"P. Seca", item:"Rolo direcionador na posição central e testado",                    ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs08", secao:"P. Seca", item:"Posicionamento dos operadores nas passarelas do secador",           ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs09", secao:"P. Seca", item:"Verificado estrutura atrás do rolo tração — sem pedaços de celulose",ref:"—",   unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs10", secao:"P. Seca", item:"Controle de carga do tração em MODO PASSAGEM DE PONTA",             ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs11", secao:"P. Seca", item:"Cortadeira em operação",                                            ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs12", secao:"P. Seca", item:"Sistema de passagem ponta antes secador testado",                   ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs13", secao:"P. Seca", item:"Medição dos rolos retornos",                                        ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs14", secao:"P. Seca", item:"Todas as grades entre decks bem fixadas",                           ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs15", secao:"P. Seca", item:"Limpeza e inspeção do secador concluída",                           ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs16", secao:"P. Seca", item:"Pulper seco ligado e testado",                                      ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
];

// ─── Check-list PP / Quebra de Máquina — Parte Úmida ─────────────────────────
const checklistQuebraMaquina = [
  // VERIFICAR TRAVAS ────────────────────────────────────────────────────────
  { id:"qm01", secao:"Verificar Travas", item:"Lumpbreaker",           ref:"—", unit:"ok/nok", tipo:"ok_nok", trava:true },
  { id:"qm02", secao:"Verificar Travas", item:"3ª Prensa Inferior",    ref:"—", unit:"ok/nok", tipo:"ok_nok", trava:true },
  { id:"qm03", secao:"Verificar Travas", item:"Caixa de Vapor",        ref:"—", unit:"ok/nok", tipo:"ok_nok", trava:true },
  // TESTES DE ATUAÇÃO ───────────────────────────────────────────────────────
  { id:"qm04", secao:"Testes de Atuação", item:"Apalpador Tela Superior",               ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm05", secao:"Testes de Atuação", item:"Apalpador Tela Inferior",               ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm06", secao:"Testes de Atuação", item:"Apalpador Feltro Pick Up",              ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm07", secao:"Testes de Atuação", item:"Apalpador Feltro 2ª Prensa",            ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm08", secao:"Testes de Atuação", item:"Apalpador Feltro 3ª Prensa Superior",   ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm09", secao:"Testes de Atuação", item:"Apalpador Feltro 3ª Prensa Inferior",   ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm10", secao:"Testes de Atuação", item:"Esticador Feltro Pick Up",              ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm11", secao:"Testes de Atuação", item:"Esticador Feltro 2ª Prensa",            ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm12", secao:"Testes de Atuação", item:"Esticador Feltro 3ª Prensa Superior",   ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm13", secao:"Testes de Atuação", item:"Esticador Feltro 3ª Prensa Inferior",   ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  // INSPEÇÕES ───────────────────────────────────────────────────────────────
  { id:"qm14", secao:"Inspeções", item:"Raspas dos Rolos",                  ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm15", secao:"Inspeções", item:"Emenda Feltro Pick Up",             ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm16", secao:"Inspeções", item:"Emenda Feltro 2ª Prensa",           ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm17", secao:"Inspeções", item:"Emenda Feltro 3ª Prensa Superior",  ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm18", secao:"Inspeções", item:"Emenda Feltro 3ª Prensa Inferior",  ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm19", secao:"Inspeções", item:"Manta Shoe Press",                  ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm20", secao:"Inspeções", item:"Caixa de Vapor",                    ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  // LIMPEZAS ────────────────────────────────────────────────────────────────
  { id:"qm21", secao:"Limpezas", item:"Chuveiros da Máquina",   ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm22", secao:"Limpezas", item:"Filtros dos Pichassos",  ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm23", secao:"Limpezas", item:"Bicos dos Pichassos",    ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm24", secao:"Limpezas", item:"Estruturas",             ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm25", secao:"Limpezas", item:"Calhas",                 ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm26", secao:"Limpezas", item:"Raspas",                 ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  // MEDIÇÕES ────────────────────────────────────────────────────────────────
  { id:"qm27", secao:"Medições", item:"GAP Wedge Zone",
    ref:"4–5", unit:"mm", tipo:"valor",
    alertaMin:4, alertaMax:5,
    descMin:"Abaixo de 4 mm — fora da faixa",
    descMax:"Acima de 5 mm — fora da faixa" },
];

// ─── WFT — dados do fluxo de diagnóstico (H2 = M2 + M3, meta 315 m³/h) ───────
// Estrutura: cada "passo" tem uma pergunta ou verificação com ação associada
const WFT_META_H2 = 315; // m³/h

const WFT_VERIFICACOES_SEM_REJEICAO = [
  { id:"wv1",  item:"Existe algum tanque transbordando?",                                     acao:"Verificar no SDCD e em campo — se houver, avaliar problema e corrigir." },
  { id:"wv2",  item:"Existe algum dreno aberto?",                                             acao:"Verificar todos os tanques e fechar caso haja dreno aberto." },
  { id:"wv3",  item:"Pressão dos chuveiros de baixa pressão estão em 2,5 bar?",               acao:"Caso esteja com pressão elevada, ajustar imediatamente." },
  { id:"wv4",  item:"Pressão do chuveiro de alta está maior que 13 bar?",                     acao:"Caso esteja, realizar ajuste imediatamente." },
  { id:"wv5",  item:"Válvula manual de WBR do tanque água morna para trocador ar/água aberta?",acao:"Verificar em campo e ajustar e voltar para posição." },
  { id:"wv6",  item:"Há mangueiras abertas nas laterais da máquina?",                         acao:"Verificar em campo — priorizar fechamento caso não seja crítico por acúmulo de massa." },
  { id:"wv7",  item:"Há mangueiras de limpeza abertas na área para limpeza do piso?",         acao:"Verificar em campo e fechar imediatamente caso já não seja mais necessária para limpeza." },
  { id:"wv8",  item:"Mangueiras de campo com água morna e não de WFT?",                       acao:"Verificar em campo e fechar imediatamente." },
  { id:"wv9",  item:"Pressão do chuveiro de alta e baixa está maior que 2,5 bar / 13 bar?",   acao:"Caso esteja, realizar a limpeza imediatamente." },
  { id:"wv10", item:"Peneira micra screen está suja?",                                         acao:"Pressão do chuveiro de limpeza está maior que 2,5 bar — realizar ajuste imediatamente." },
];

// ─── Catálogo de tipos de Check-list ─────────────────────────────────────────

// ─── Equipamentos Cortadeira/Secador — M2 ─────────────────────────────────
const equipamentosCS_M2 = [
  { id:"m2001", tag:"32-30-0-45-004", nome:"Transp. Móvel L4 M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2002", tag:"32-23-0-10-03", nome:"Rolo guia M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2003", tag:"32-23-0-10-04", nome:"Facas circulares M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2004", tag:"32-23-0-10-05", nome:"Rolo Medidor M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2005", tag:"32-23-0-10-12", nome:"Rolos Conj Tração M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2006", tag:"32-23-0-10-15", nome:"Rolo de transferência M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2007", tag:"32-23-0-10-19", nome:"Rolo Kick-out M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2008", tag:"32-23-0-10-08", nome:"Facão M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2009", tag:"32-22-0-30-06", nome:"Bomba pichasso da Cortadeira (na área) M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2010", tag:"32-23-0-10-23A", nome:"Mesa de Garfo A M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2011", tag:"32-23-0-10-23B", nome:"Mesa de Garfo B M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2012", tag:"32-23-0-10-23", nome:"Mesa de Garfo C/D/E/F/G/H M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2013", tag:"32-23-0-45-01", nome:"Transp. Superior Vacuo M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2014", tag:"32-23-0-35-01", nome:"Ventilador vacuo M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2015", tag:"32-23-0-35-03", nome:"Ventilador Rampa de Rejeição M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2016", tag:"32-23-0-35-04", nome:"Ventilador Exaustão M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2017", tag:"32-23-0-10-22", nome:"Vibrador de folhas M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2018", tag:"32-23-0-50-01", nome:"Elevação do Layboy M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2019", tag:"32-23-0-45-04A", nome:"Transp. Layboy Corrente A M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2020", tag:"32-23-0-45-04B", nome:"Transp. Layboy Corrente B M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2021", tag:"32-23-HSS-014", nome:"Seccionadora Manutenção", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2022", tag:"32-23-HSS-015", nome:"Geral Cortadeira", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2023", tag:"32-23-HSS-016", nome:"Lay Boy - Fita Longa", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2024", tag:"32-30-0-45-001", nome:"Transp. Intermediário pequeno LA M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2025", tag:"32-30-0-45-002A", nome:"Transp. Giratório A LA M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2026", tag:"32-30-0-45-002B", nome:"Transp. Giratório B LA M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2027", tag:"32-30-0-45-003", nome:"Transp. Intermediário LA M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2028", tag:"32-30-0-45-051", nome:"Transp. Intermediário pequeno LC M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2029", tag:"32-30-0-45-052A", nome:"Transp. Giratório A LC M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2030", tag:"32-30-0-45-052B", nome:"Transp. Giratório B LC M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2031", tag:"32-30-0-45-053", nome:"Transp. Intermediário LC M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2032", tag:"32-30-0-45-054", nome:"Transp. Móvel L5 M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2033", tag:"32-22-0-10-41", nome:"Rolo de Tração (Pull roll) M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2034", tag:"32-22-0-10-19", nome:"Rolo direcionar (sistema de controle) M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2035", tag:"32-22-0-10-17", nome:"Acionamento da Fita do Secador M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2036", tag:"32-22-0-10-36", nome:"Rolo Direcionador Cortadeira M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2037", tag:"32-22-0-10-37", nome:"Rolo Guia da Saída do Secador M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2038", tag:"32-22-0-10-12", nome:"Passagem de Ponta Cortadeira (Esteira) M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2039", tag:"32-22-0-10-26", nome:"Rolo de Retorno Entrada M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2040", tag:"32-22-0-10-27", nome:"Rolo de Retorno Saída M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2041", tag:"32-22-0-10-21", nome:"Rolo Guia da Entrada do Secador M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2042", tag:"32-22-0-10-22", nome:"Rolo de Tensão Secador M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2043", tag:"91-33-0-64-06", nome:"Vantiladores de circulação G1 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2044", tag:"91-33-0-64-07", nome:"Vantiladores de circulação G2 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2045", tag:"91-33-0-64-08", nome:"Vantiladores de circulação G3 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2046", tag:"91-33-0-64-09", nome:"Vantiladores de circulação G4 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2047", tag:"32-22-0-35-331", nome:"Ventilador Resfriamento 1 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2048", tag:"32-22-0-35-332", nome:"Ventilador Resfriamento 2 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2049", tag:"32-22-0-35-333", nome:"Ventilador Resfriamento 3 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2050", tag:"32-22-0-35-325", nome:"Ventilador Suprimento 1 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2051", tag:"32-22-0-35-327", nome:"Ventilador Suprimento 2 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2052", tag:"32-22-0-35-329", nome:"Ventilador Suprimento 3 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2053", tag:"32-22-0-35-326", nome:"Ventilador Exaustão 1 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2054", tag:"32-22-0-35-328", nome:"Ventilador Exaustão 2 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2055", tag:"32-22-0-35-330", nome:"Ventilador Exaustão 3 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2056", tag:"32-21-0-30-08", nome:"Bomba Tq filtrado p/ Trocador de calor M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2057", tag:"32-22-0-30-01", nome:"Bomba do Tq Condensado 1 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2058", tag:"32-00-0-35-01", nome:"Ventilador exaustão 01 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2059", tag:"32-00-0-35-02", nome:"Ventilador exaustão 02 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2060", tag:"32-00-0-35-03", nome:"Ventilador exaustão 03 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2061", tag:"32-00-0-35-04", nome:"Ventilador exaustão 04 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2062", tag:"32-00-0-35-05", nome:"Ventilador exaustão 05 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2063", tag:"32-00-0-35-06", nome:"Ventilador exaustão 06 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2064", tag:"32-00-0-35-07", nome:"Ventilador exaustão 07 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2065", tag:"32-00-0-35-08", nome:"Ventilador exaustão 08 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2066", tag:"32-00-0-35-09", nome:"Ventilador exaustão 09 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2067", tag:"32-00-0-35-10", nome:"Ventilador exaustão 10 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
].map(e=>({...e}));

// ─── Equipamentos Cortadeira/Secador — M3 ─────────────────────────────────
const equipamentosCS_M3 = [
  { id:"m3001", tag:"33-22-0-10-12", nome:"Passagem de Ponta Cortadeira (Esteira) M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3002", tag:"33-22-0-10-19", nome:"Rolo direcionar (sistema de controle) M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3003", tag:"33-22-0-10-41", nome:"Rolo de Tração (Pull roll) M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3004", tag:"33-22-0-10-17", nome:"Acionamento da Fita do Secador M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3005", tag:"33-22-0-10-36", nome:"Rolo Direcionador Cortadeira M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3006", tag:"33-22-0-10-37", nome:"Rolo Guia da Saída do Secador M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3007", tag:"33-22-0-10-26", nome:"Rolo de Retorno Entrada M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3008", tag:"33-22-0-10-27", nome:"Rolo de Retorno Saída M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3009", tag:"33-22-0-10-21", nome:"Rolo Guia da Entrada do Secador M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3010", tag:"33-22-0-10-22", nome:"Rolo de Tensão Secador M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3011", tag:"91-43-0-64-06", nome:"Vantiladores de circulação G1 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3012", tag:"91-43-0-64-07", nome:"Vantiladores de circulação G2 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3013", tag:"91-43-0-64-08", nome:"Vantiladores de circulação G3 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3014", tag:"91-43-0-64-09", nome:"Vantiladores de circulação G4 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3015", tag:"33-22-0-35-331", nome:"Ventilador Resfriamento 1 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3016", tag:"33-22-0-35-332", nome:"Ventilador Resfriamento 2 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3017", tag:"33-22-0-35-333", nome:"Ventilador Resfriamento 3 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3018", tag:"33-22-0-35-325", nome:"Ventilador Suprimento 1 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3019", tag:"33-22-0-35-327", nome:"Ventilador Suprimento 2 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3020", tag:"33-22-0-35-329", nome:"Ventilador Suprimento 3 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3021", tag:"33-22-0-35-326", nome:"Ventilador Exaustão 1 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3022", tag:"33-22-0-35-328", nome:"Ventilador Exaustão 2 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3023", tag:"33-22-0-35-330", nome:"Ventilador Exaustão 3 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3024", tag:"33-21-0-30-08", nome:"Bomba Tq filtrado p/ Trocador de calor M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3025", tag:"33-22-0-30-01", nome:"Bomba do Tq Condensado 1 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3026", tag:"33-00-0-35-22", nome:"Venti. do Teto falso M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3027", tag:"33-00-0-35-01", nome:"Ventilador exaustão 01 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3028", tag:"33-00-0-35-02", nome:"Ventilador exaustão 02 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3029", tag:"33-00-0-35-03", nome:"Ventilador exaustão 03 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3030", tag:"33-00-0-35-04", nome:"Ventilador exaustão 04 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3031", tag:"33-00-0-35-05", nome:"Ventilador exaustão 05 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3032", tag:"33-00-0-35-06", nome:"Ventilador exaustão 06 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3033", tag:"33-00-0-35-07", nome:"Ventilador exaustão 07 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3034", tag:"33-00-0-35-08", nome:"Ventilador exaustão 08 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3035", tag:"33-00-0-35-09", nome:"Ventilador exaustão 09 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3036", tag:"33-00-0-35-10", nome:"Ventilador exaustão 10 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3037", tag:"33-22-0-30-06", nome:"Bomba pichasso da Cortadeira (na área) M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3038", tag:"33-23-0-10-03", nome:"Rolo guia M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3039", tag:"33-23-0-10-04", nome:"Facas circulares M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3040", tag:"33-23-0-10-05", nome:"Rolo Medidor M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3041", tag:"33-23-0-10-12", nome:"Rolos Conj Tração M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3042", tag:"33-23-0-10-15", nome:"Rolo de transferência M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3043", tag:"33-23-0-10-19", nome:"Rolo Kick-out M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3044", tag:"33-23-0-10-08", nome:"Facão M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3045", tag:"33-23-0-10-23A", nome:"Mesa de Garfo A M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3046", tag:"33-23-0-10-23B", nome:"Mesa de Garfo B M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3047", tag:"33-23-0-10-23", nome:"Mesa de Garfo C/D/E/F/G/H M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3048", tag:"33-23-0-45-01", nome:"Transp. Superior Vacuo M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3049", tag:"33-23-0-35-01", nome:"Ventilador vacuo M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3050", tag:"33-23-0-35-03", nome:"Ventilador Rampa de Rejeição M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3051", tag:"33-23-0-35-04", nome:"Ventilador Exaustão M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3052", tag:"33-23-0-10-22", nome:"Vibrador de folhas M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3053", tag:"33-23-0-50-01", nome:"Elevação do Layboy M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3054", tag:"33-23-0-45-04A", nome:"Transp. Layboy Corrente A M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3055", tag:"33-23-0-45-04B", nome:"Transp. Layboy Corrente B M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3056", tag:"33-30-0-45-001", nome:"Transp. Intermediário pequeno LA M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3057", tag:"33-30-0-45-002A", nome:"Transp. Giratório A LA M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3058", tag:"33-30-0-45-002B", nome:"Transp. Giratório B LA M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3059", tag:"33-30-0-45-003", nome:"Transp. Intermediário LA M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3060", tag:"33-30-0-45-004", nome:"Transp. Móvel L6 M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3061", tag:"33-30-0-45-051", nome:"Transp. Intermediário pequeno LC M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3062", tag:"33-30-0-45-052A", nome:"Transp. Giratório A LC M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3063", tag:"33-30-0-45-052B", nome:"Transp. Giratório B LC M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3064", tag:"33-30-0-45-053", nome:"Transp. Intermediário LC M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3065", tag:"33-30-0-45-054", nome:"Transp. Móvel L7 M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
].map(e=>({...e}));

// ─── Equipamentos Enfardamento — M2 (L4, L5) ──────────────────────────────
const equipamentosEnf_M2 = [
  { id:"m2001", tag:"32-30-0-45-009", nome:"Transp. fardos pulmão L4 (009)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2002", tag:"32-24-0-64-01", nome:"Seccionadora geral L4", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2003", tag:"32-30-0-45-005", nome:"Transp. fardos L4 (005)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2004", tag:"32-30-0-45-006", nome:"Transp. fardos L4 (006)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2005", tag:"32-30-0-45-007", nome:"Transp. fardos L4 (007)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2006", tag:"32-30-0-45-008", nome:"Transp. fardos L4 (008)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2007", tag:"32-30-0-45-010", nome:"Transp. fardos pulmão L4 (010)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2008", tag:"32-30-0-45-011", nome:"Transp. fardos pulmão L4 (011)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2009", tag:"32-30-0-45-012", nome:"Transp. fardos pulmão L4 (012)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2010", tag:"32-30-0-45-013", nome:"Transp. fardos pulmão L4 (013)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2011", tag:"32-30-0-45-014", nome:"Transp. fardos pulmão L4 (014)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2012", tag:"32-30-0-45-015", nome:"Transp. fardos pulmão L4 (015)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2013", tag:"32-30-0-45-016", nome:"Transp. fardos pulmão L4 (016)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2014", tag:"32-30-0-64-01.01", nome:"Geral transp. capas L4", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2015", tag:"32-24-0-10-020", nome:"Transp. móvel unit L4", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2016", tag:"32-00-106-API", nome:"Válvula geral de API L4", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2017", tag:"32-25-0-64-01", nome:"Seccionadora geral L5", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2018", tag:"32-30-0-45-055", nome:"Transp. fardos L5 (055)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2019", tag:"32-30-0-45-056", nome:"Transp. fardos L5 (056)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2020", tag:"32-30-0-45-057", nome:"Transp. fardos L5 (057)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2021", tag:"32-30-0-45-058", nome:"Transp. fardos L5 (058)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2022", tag:"32-30-0-45-059", nome:"Transp. fardos pulmão L5 (059)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2023", tag:"32-30-0-45-060", nome:"Transp. fardos pulmão L5 (060)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2024", tag:"32-30-0-45-061", nome:"Transp. fardos pulmão L5 (061)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2025", tag:"32-30-0-45-062", nome:"Transp. fardos pulmão L5 (062)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2026", tag:"32-30-0-45-063", nome:"Transp. fardos pulmão L5 (063)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2027", tag:"32-30-0-45-064", nome:"Transp. fardos pulmão L5 (064)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2028", tag:"32-30-0-45-065", nome:"Transp. fardos pulmão L5 (065)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2029", tag:"32-30-0-45-066", nome:"Transp. fardos pulmão L5 (066)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2030", tag:"32-25-0-10-020", nome:"Transp. móvel unit L5", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2031", tag:"32-00-107-API", nome:"Válvula geral de API L5", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
].map(e=>({...e}));

// ─── Equipamentos Enfardamento — M3 (L6, L7, L8) ──────────────────────────
const equipamentosEnf_M3 = [
  { id:"m3001", tag:"33-30-0-45-008", nome:"Transp. fardos L6 (008)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3002", tag:"33-26-0-64-01", nome:"Seccionadora geral L6", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3003", tag:"33-30-0-45-005", nome:"Transp. fardos L6 (005)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3004", tag:"33-30-0-45-006", nome:"Transp. fardos L6 (006)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3005", tag:"33-30-0-45-007", nome:"Transp. fardos L6 (007)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3006", tag:"33-30-0-45-009", nome:"Transp. fardos pulmão L6(009)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3007", tag:"33-30-0-45-010", nome:"Transp. fardos pulmão L6(010)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3008", tag:"33-30-0-45-011", nome:"Transp. fardos pulmão L6(011)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3009", tag:"33-30-0-45-012", nome:"Transp. fardos pulmão L6(012)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3010", tag:"33-30-0-45-013", nome:"Transp. fardos pulmão L6(013)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3011", tag:"33-30-0-45-014", nome:"Transp. fardos pulmão L6(014)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3012", tag:"33-30-0-45-015", nome:"Transp. fardos pulmão L6(015)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3013", tag:"33-30-0-45-016", nome:"Transp. fardos pulmão L6(016)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3014", tag:"33-30-0-64-01.01.", nome:"Geral transp. capas L6", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3015", tag:"33-26-0-10-020", nome:"Transp. móvel unit L6", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3016", tag:"33-00-107-API", nome:"Válvula geral de API L6", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3017", tag:"33-27-0-64-01", nome:"Seccionadora geral L7", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3018", tag:"33-30-0-45-055", nome:"Transp. fardos L7 (055)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3019", tag:"33-30-0-45-056", nome:"Transp. fardos L7 (056)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3020", tag:"33-30-0-45-057", nome:"Transp. fardos L7 (057)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3021", tag:"33-30-0-45-058", nome:"Transp. fardos L7 (058)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3022", tag:"33-30-0-45-059", nome:"Transp. fardos pulmão L7 (059)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3023", tag:"33-30-0-45-060", nome:"Transp. fardos pulmão L7 (060)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3024", tag:"33-30-0-45-061", nome:"Transp. fardos pulmão L7 (061)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3025", tag:"33-30-0-45-062", nome:"Transp. fardos pulmão L7 (062)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3026", tag:"33-30-0-45-063", nome:"Transp. fardos pulmão L7 (063)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3027", tag:"33-30-0-45-064", nome:"Transp. fardos pulmão L7 (064)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3028", tag:"33-30-0-45-065", nome:"Transp. fardos pulmão L7 (065)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3029", tag:"33-30-0-45-066", nome:"Transp. fardos pulmão L7 (066)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3030", tag:"33-30-0-64-01.01", nome:"Geral transp. capas L7", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3031", tag:"32-27-0-10-020", nome:"Transp. móvel unit L7", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3032", tag:"33-00-106-API", nome:"Válvula geral de API L7", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3033", tag:"33-30-0-45-069", nome:"Transp. Pulmão de capas", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3034", tag:"33-30-0-45-070", nome:"Transp. Pulmão de capas.", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3035", tag:"33-27-0-45-017", nome:"Transp. Alim. De capas", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3036", tag:"33-27-0-45-018", nome:"Transp. Alim. De capas.", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3037", tag:"33-28-0-64-01", nome:"Seccionadora geral L8", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3038", tag:"33-30-0-45-105", nome:"Transp. fardos L8 (105)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3039", tag:"33-30-0-45-106", nome:"Transp. fardos L8 (106)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3040", tag:"33-30-0-45-107", nome:"Transp. fardos L8 (107)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3041", tag:"33-30-0-45-108", nome:"Transp. fardos L8 (108)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3042", tag:"33-00-110-API", nome:"Válvula geral de API L8.", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3043", tag:"33-30-0-45-119", nome:"Transportador Pulmão de Capas 119.", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3044", tag:"33-30-0-45-120", nome:"Transportador Pulmão de Capas 120", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
].map(e=>({...e}));

// ─── Check-list Cortadeira/Secador — M2 ──────────────────────────────────────
// Validações ativas:
//  alertaMin    → valor < mínimo = alerta vermelho
//  alertaExato  → valor diferente do ref = NOK laranja
//  alertaWarn   → valor igual ao aviso = amarelo (lembrete)
//  faixas       → para faquinhas: [[min,max,label,cor], ...]
const checklistCortadeiraM2 = [
  // SECADOR ──────────────────────────────────────────────────────────────────
  { id:"cs2_01", secao:"Secador",    item:"Célula de carga",
    ref:"310",       unit:"N/m",    tipo:"valor",
    alertaWarn:280,  descWarn:"Valor de Passagem de Ponta — lembrar de voltar para 310 N/m" },
  { id:"cs2_02", secao:"Secador",    item:"Trocador de Calor 1",
    ref:"< 100", unit:"mbar",  tipo:"valor",
    alertaMax:100,descMax:"Trocador Sujo — verificar imediatamente", alertaTrocador:true },
  { id:"cs2_03", secao:"Secador",    item:"Trocador de Calor 2",
    ref:"< 100", unit:"mbar",  tipo:"valor",
    alertaMax:100,descMax:"Trocador Sujo — verificar imediatamente", alertaTrocador:true },
  { id:"cs2_04", secao:"Secador",    item:"Rolo Marginador",
    ref:"5",         unit:"—",      tipo:"valor" },
  { id:"cs2_05", secao:"Secador",    item:"Acúmulo de Fibras",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_06", secao:"Secador",    item:"Extrator de Folhas (Entrada/Saída)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_07", secao:"Secador",    item:"Água Sucção BBA Pichasso",
    ref:"≥ 0,35",    unit:"bar",    tipo:"valor",
    alertaMin:0.35,  descMin:"CRÍTICO — abaixo do mínimo permitido (0,35 bar)" },
  // CORTADEIRA ───────────────────────────────────────────────────────────────
  { id:"cs2_08", secao:"Cortadeira", item:"QCS (Gramatura/Teor Seco) Controle LIGADO",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_09", secao:"Cortadeira", item:"Verificar Controle de Peso (Contagem ou Peso)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_10", secao:"Cortadeira", item:"Peso Layboy",
    ref:"F:2959 / C:2600", unit:"kg", tipo:"duplo_valor" },
  { id:"cs2_11", secao:"Cortadeira", item:"Velocidade",
    ref:"≥150",       unit:"m/min",  tipo:"valor_direto", velMin:150 },
  { id:"cs2_12", secao:"Cortadeira", item:"Passe Faca Circulares",
    ref:"F:5 / C:5",    unit:"%",      tipo:"duplo_valor" },
  { id:"cs2_13", secao:"Cortadeira", item:"Rolo Medidor",
    ref:"0,35",      unit:"%",      tipo:"valor",
    alertaExato:"0,35", descExato:"Padrão fixo — NOK se diferente de 0,35%" },
  { id:"cs2_14", secao:"Cortadeira", item:"Pinch Roll",
    ref:"F:0,3",     unit:"N/mm",   tipo:"duplo_valor" },
  { id:"cs2_15", secao:"Cortadeira", item:"Rolos de Tração",
    ref:"F:10 / C:10",    unit:"%",      tipo:"duplo_valor" },
  { id:"cs2_16", secao:"Cortadeira", item:"Faca Voadora Capa",
    ref:"3,8",       unit:"%",      tipo:"valor",
    alertaExato:"3,8",  descExato:"Padrão fixo — NOK se diferente de 3,8%" },
  { id:"cs2_17", secao:"Cortadeira", item:"Faca Voadora Fardo",
    ref:"0,7",       unit:"%",      tipo:"valor",
    alertaExato:"0,7",  descExato:"Padrão fixo — NOK se diferente de 0,7%" },
  { id:"cs2_18", secao:"Cortadeira", item:"Sobreposição",
    ref:"F:15 / C:15", unit:"%",      tipo:"duplo_valor" },
  { id:"cs2_19", secao:"Cortadeira", item:"Kickout",
    ref:"F:6 / C:8",      unit:"%",      tipo:"duplo_valor" },
  { id:"cs2_20", secao:"Cortadeira", item:"Nível Reservatório UH",
    ref:"> 86",      unit:"%",      tipo:"valor",
    alertaMin:87,    descMin:"ALERTA — nível igual ou abaixo de 86% (mínimo de segurança)" },
  { id:"cs2_21", secao:"Cortadeira", item:"Temperatura Óleo UH",
    ref:"28",        unit:"°C",     tipo:"valor" },
  { id:"cs2_22", secao:"Cortadeira", item:"Pressão Sistema Hidráulico",
    ref:"82",        unit:"bar",    tipo:"valor" },
  { id:"cs2_23", secao:"Cortadeira", item:"Vazamentos/Limpeza (Hid./Lubrif./Pneum.)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_24", secao:"Cortadeira", item:"Qualidade Corte (Facão/Faquinhas)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_25", secao:"Cortadeira", item:"Caixas Formação (Alinhamento/Fixação)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_26", secao:"Cortadeira", item:"Garfos (Funcionamento/Guias/Alinhamento)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  // LAYBOY ───────────────────────────────────────────────────────────────────
  { id:"cs2_27", secao:"Layboy",     item:"Pegar Folhas",
    ref:"395",       unit:"mm",     tipo:"valor" },
  { id:"cs2_28", secao:"Layboy",     item:"Mesa Garfo (Espera)",
    ref:"495",       unit:"mm",     tipo:"valor" },
  { id:"cs2_29", secao:"Layboy",     item:"Mesa Garfo (Tomada)",
    ref:"330",       unit:"mm",     tipo:"valor" },
  { id:"cs2_30", secao:"Layboy",     item:"Acúmulo de Folhas",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  // FAQUINHAS — 11 facas ─────────────────────────────────────────────────────
  // Faixas: 1,5–2,5 = Normal 🟢 | 2,5–3,5 = Atenção 🟡 | 3,5–4,0 = Crítico 🔴
  { id:"cs2_31", secao:"Faquinhas",  item:"Pressão das Faquinhas (1 a 11)",
    ref:"1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5", unit:"bar", tipo:"faquinhas",
    refs:["1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5"],
    faixas:[[1.5,2.5,"Normal","green"],[2.5,3.5,"Atenção","yellow"],[3.5,4.0,"Crítico","red"]] },
  { id:"cs2_34", secao:"Faquinhas",  item:"Corte do Facão por Fardo (1 a 12)",
    ref:"OK", unit:"nível", tipo:"facao_fardos", fardos:12 },
  // EXTRA ────────────────────────────────────────────────────────────────────
  { id:"cs2_32", secao:"Extra",      item:"Atuadores reparados disponíveis na área",
    ref:"—",         unit:"qtde",   tipo:"valor" },
  { id:"cs2_33", secao:"Extra",      item:"Produto Limpa Lente",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
];

// ─── Check-list Cortadeira/Secador — M3 ──────────────────────────────────────
const checklistCortadeiraM3 = [
  // SECADOR ──────────────────────────────────────────────────────────────────
  { id:"cs3_01", secao:"Secador",    item:"Célula de carga",
    ref:"310",       unit:"N/m",    tipo:"valor",
    alertaWarn:280,  descWarn:"Valor de Passagem de Ponta — lembrar de voltar para 310 N/m" },
  { id:"cs3_02", secao:"Secador",    item:"Trocador de Calor 1",
    ref:"< 100", unit:"mbar",  tipo:"valor",
    alertaMax:100,descMax:"Trocador Sujo — verificar imediatamente", alertaTrocador:true },
  { id:"cs3_03", secao:"Secador",    item:"Trocador de Calor 2",
    ref:"< 100", unit:"mbar",  tipo:"valor",
    alertaMax:100,descMax:"Trocador Sujo — verificar imediatamente", alertaTrocador:true },
  { id:"cs3_04", secao:"Secador",    item:"Rolo Marginador",
    ref:"-8",        unit:"—",      tipo:"valor" },
  { id:"cs3_05", secao:"Secador",    item:"Acúmulo de Fibras",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_06", secao:"Secador",    item:"Extrator de Folhas (Entrada/Saída)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_07", secao:"Secador",    item:"Água Sucção BBA Pichasso",
    ref:"≥ 0,35",    unit:"bar",    tipo:"valor",
    alertaMin:0.35,  descMin:"CRÍTICO — abaixo do mínimo permitido (0,35 bar)" },
  // CORTADEIRA ───────────────────────────────────────────────────────────────
  { id:"cs3_08", secao:"Cortadeira", item:"QCS (Gramatura/Teor Seco) Controle LIGADO",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_09", secao:"Cortadeira", item:"Verificar Controle de Peso (Contagem ou Peso)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_10", secao:"Cortadeira", item:"Peso Layboy",
    ref:"F:2898 / C:2800", unit:"kg", tipo:"duplo_valor" },
  { id:"cs3_11", secao:"Cortadeira", item:"Velocidade",
    ref:"≥150",       unit:"m/min",  tipo:"valor_direto", velMin:150 },
  { id:"cs3_12", secao:"Cortadeira", item:"Passe Faca Circulares",
    ref:"F:5 / C:5",    unit:"%",      tipo:"duplo_valor" },
  { id:"cs3_13", secao:"Cortadeira", item:"Rolo Medidor",
    ref:"0,35",      unit:"%",      tipo:"valor",
    alertaExato:"0,35", descExato:"Padrão fixo — NOK se diferente de 0,35%" },
  { id:"cs3_14", secao:"Cortadeira", item:"Pinch Roll",
    ref:"F:0,2 / C:0,00", unit:"kN/m",  tipo:"duplo_valor" },
  { id:"cs3_15", secao:"Cortadeira", item:"Rolos de Tração",
    ref:"F:11 / C:10",    unit:"%",      tipo:"duplo_valor" },
  { id:"cs3_16", secao:"Cortadeira", item:"Faca Voadora Capa",
    ref:"3,8",       unit:"%",      tipo:"valor",
    alertaExato:"3,8",  descExato:"Padrão fixo — NOK se diferente de 3,8%" },
  { id:"cs3_17", secao:"Cortadeira", item:"Faca Voadora Fardo",
    ref:"0,7",       unit:"%",      tipo:"valor",
    alertaExato:"0,7",  descExato:"Padrão fixo — NOK se diferente de 0,7%" },
  { id:"cs3_18", secao:"Cortadeira", item:"Sobreposição",
    ref:"F:17 / C:17", unit:"%",      tipo:"duplo_valor" },
  { id:"cs3_19", secao:"Cortadeira", item:"Kickout",
    ref:"F:8 / C:5",      unit:"%",      tipo:"duplo_valor" },
  { id:"cs3_20", secao:"Cortadeira", item:"Nível Reservatório UH",
    ref:"> 86",      unit:"%",      tipo:"valor",
    alertaMin:87,    descMin:"ALERTA — nível igual ou abaixo de 86% (mínimo de segurança)" },
  { id:"cs3_21", secao:"Cortadeira", item:"Temperatura Óleo UH",
    ref:"28",        unit:"°C",     tipo:"valor" },
  { id:"cs3_22", secao:"Cortadeira", item:"Pressão Sistema Hidráulica",
    ref:"82",        unit:"bar",    tipo:"valor" },
  { id:"cs3_23", secao:"Cortadeira", item:"Vazamentos/Limpeza (Hid./Lubrif./Pneum.)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_24", secao:"Cortadeira", item:"Qualidade Corte (Facão/Faquinhas)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_25", secao:"Cortadeira", item:"Caixas Formação (Alinhamento/Fixação)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_26", secao:"Cortadeira", item:"Garfos (Funcionamento/Guias/Alinhamento)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  // LAYBOY ───────────────────────────────────────────────────────────────────
  { id:"cs3_27", secao:"Layboy",     item:"Pegar Folhas",
    ref:"395",       unit:"mm",     tipo:"valor" },
  { id:"cs3_28", secao:"Layboy",     item:"Mesa Garfo (Espera)",
    ref:"450",       unit:"mm",     tipo:"valor" },
  { id:"cs3_29", secao:"Layboy",     item:"Mesa Garfo (Tomada)",
    ref:"330",       unit:"mm",     tipo:"valor" },
  { id:"cs3_30", secao:"Layboy",     item:"Acúmulo de Folhas",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  // FAQUINHAS — 11 facas ─────────────────────────────────────────────────────
  { id:"cs3_31", secao:"Faquinhas",  item:"Pressão das Faquinhas (1 a 11)",
    ref:"1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5", unit:"bar", tipo:"faquinhas",
    refs:["1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5"],
    faixas:[[1.5,2.5,"Normal","green"],[2.5,3.5,"Atenção","yellow"],[3.5,4.0,"Crítico","red"]] },
  { id:"cs3_34", secao:"Faquinhas",  item:"Corte do Facão por Fardo (1 a 12)",
    ref:"OK", unit:"nível", tipo:"facao_fardos", fardos:12 },
  // EXTRA ────────────────────────────────────────────────────────────────────
  { id:"cs3_32", secao:"Extra",      item:"Atuadores reparados disponíveis na área",
    ref:"—",         unit:"qtde",   tipo:"valor" },
  { id:"cs3_33", secao:"Extra",      item:"Produto Limpa Lente",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
];


// ─── Check-list Enfardamento — Qualidade (itens 8–14) ────────────────────────
const checklistEnfardamento = [
  { id:"enf_08", secao:"Qualidade", item:"Fardo está com marca de corrente?",
    ref:"Não", unit:"", tipo:"opcoes",
    instrucao:"Verificar na mesa giro 1 — Pare a mesa com fardo levantado. Abaixe e verifique visualmente sem adentrar a grade de proteção.",
    opcoes:["Não","Um pouco","Sim - Parar a linha e verificar"],
    alertOpcoes:["Sim - Parar a linha e verificar","Um pouco"] },
  { id:"enf_09", secao:"Qualidade", item:"Como está a tensão dos arames do fardo (2,18 mm)?",
    ref:"Tensionado", unit:"", tipo:"opcoes",
    opcoes:["Está tensionado","Está folgado"], alertOpcoes:["Está folgado"] },
  { id:"enf_10", secao:"Qualidade", item:"Como está a qualidade de impressão (logo/código de barras) no fardo?",
    ref:"Bom", unit:"", tipo:"opcoes",
    opcoes:["Bom","Regular","Ruim - Ação: Realizar ajuste/instrumentação"],
    alertOpcoes:["Ruim - Ação: Realizar ajuste/instrumentação","Regular"] },
  { id:"enf_11", secao:"Qualidade", item:"O arame 3mm está distante 15cm do arame 2,18mm?",
    ref:"Sim", unit:"", tipo:"opcoes",
    opcoes:["Sim","Não? Realizei o ajuste"], alertOpcoes:[] },
  { id:"enf_12", secao:"Qualidade", item:"A unit está com marca de corrente na parte inferior?",
    ref:"Não", unit:"", tipo:"opcoes",
    opcoes:["Não","Um pouco","Sim - Parar linha e verificar"],
    alertOpcoes:["Sim - Parar linha e verificar","Um pouco"] },
  { id:"enf_14", secao:"Altura Unit", item:"Qual a altura da Unit (metros) [H2]? [Medir com régua]",
    ref:"1,90 m - Target", unit:"m", tipo:"opcoes",
    opcoes:["1,85 m","1,86 m","1,87 m","1,88 m - Dentro da tolerância","1,89 m - Dentro da tolerância","1,90 m - Target","1,91 m - Dentro da tolerância","1,92 m - Dentro da tolerância","1,93 m","1,94 m"],
    alertOpcoes:["1,85 m","1,86 m","1,87 m","1,93 m","1,94 m"] },
];

// ─── Check-list Rota Enfardamento ────────────────────────────────────────────
const checklistRotaEnfardamento = [
  {id:"re01",secao:"Balança",           item:"Balança zerada e calibrada",            ref:"—",   unit:"sim/não",tipo:"sim_nao"},
  {id:"re02",secao:"Mesas Giratórias",  item:"Entregando fardo bem alinhado",         ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re03",secao:"Prensa",            item:"Temperatura UH Prensa",                 ref:"<55", unit:"°C",     tipo:"temp"},
  {id:"re04",secao:"Prensa",            item:"Nível reservatório UH",                 ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re05",secao:"Prensa",            item:"Esteira em bom estado",                 ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re06",secao:"Prensa",            item:"Bombas operando normalmente",            ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re07",secao:"Alinhador",         item:"Hastes em perfeito estado",             ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re08",secao:"Alinhador",         item:"Alinhando corretamente",                ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re09",secao:"Encapadeira",       item:"Offset correto",                        ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re10",secao:"Encapadeira",       item:"Status geral",                          ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re11",secao:"Encapadeira",       item:"Vazamentos",                            ref:"Não", unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re12",secao:"Amarradeira",       item:"Reservatório de óleo",                  ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re13",secao:"Amarradeira",       item:"Rodando sem trava",                     ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re14",secao:"Amarradeira",       item:"Travas das caloiras travadas",          ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re15",secao:"Amarradeira",       item:"Limpeza cabeçote de torção realizada",  ref:"—",   unit:"sim/não",tipo:"sim_nao"},
  {id:"re16",secao:"Dobradeira",        item:"Molas em ok",                           ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re17",secao:"Dobradeira",        item:"Sem vazamento de ar",                   ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re18",secao:"Dobradeira",        item:"Dobragem adequada",                     ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re19",secao:"Impressora",        item:"Qualidade de impressão do logo",        ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re20",secao:"Impressora",        item:"Código de barras legível",              ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re21",secao:"Impressora",        item:"Data de produção correta",              ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re22",secao:"Impressora",        item:"Arame não está sobre a impressão",      ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re23",secao:"Impressora",        item:"Tinta reserva disponível (mín. 1)",     ref:"Sim", unit:"sim/não",tipo:"sim_nao"},
  {id:"re24",secao:"Empilhador",        item:"Status geral",                          ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re25",secao:"Unitizadora",       item:"Reservatório de óleo",                  ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re26",secao:"Unitizadora",       item:"Temperatura UH Unitizadora",            ref:"<55", unit:"°C",     tipo:"temp"},
  {id:"re27",secao:"Unitizadora",       item:"Rodando sem trava",                     ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re28",secao:"Unitizadora",       item:"Travas das caloiras travadas",          ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re29",secao:"Unitizadora",       item:"Limpeza cabeçote de torção realizada",  ref:"—",   unit:"sim/não",tipo:"sim_nao"},
  {id:"re30",secao:"Transp. de Unit",   item:"Transportadores operando normalmente",  ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true,nokGrav:true},
];

const LINHAS = [
  { id:"L4", label:"Linha 4", maquina:"M2" },
  { id:"L5", label:"Linha 5", maquina:"M2" },
  { id:"L6", label:"Linha 6", maquina:"M3" },
  { id:"L7", label:"Linha 7", maquina:"M3" },
  { id:"L8", label:"Linha 8", maquina:"M3" },
];

const AREAS = [
  { id:"pu",  label:"Parte Úmida",           icon:"", desc:"Formação, prensas, feltros, vácuo"      },
  { id:"cs",  label:"Parte Seca/Cortadeira", icon:"", desc:"Secador, cortadeira, layboy, faquinhas" },
  { id:"enf", label:"Enfardamento",           icon:"", desc:"Enfardamento L4/L5 e L6/L7/L8"         },
];

const CATALOGO = [
  { id:"rotina",           label:"Rotina",              icon:"", desc:"Verificação por turno — Parte Úmida",                  porMaquina:true,  tipo:"padrao",   area:"pu",  getItems:(m)=>m==="M2"?checklistM2:checklistM3 },
  { id:"passagem_ponta",   label:"Passagem de Ponta",   icon:"", desc:"Check-list M2 e M3 — antes da passagem",               porMaquina:true,  tipo:"padrao",   area:"pu",  passagem:true, getItems:()=>checklistPassagemPonta },
  { id:"quebra_pu",        label:"PP / Quebra de Máq.", icon:"", desc:"Segurança, testes, inspeções e limpezas pós-quebra",    porMaquina:true,  tipo:"padrao",   area:"pu",  getItems:()=>checklistQuebraMaquina },
  { id:"wft",              label:"Consumo WFT",         icon:"", desc:"Diagnóstico de consumo de água — Meta H2: 315 m³/h",   porMaquina:false, tipo:"wft",      area:"pu",  getItems:()=>[] },
  { id:"cortadeira",       label:"Rotina",              icon:"", desc:"Check-list operacional — Secador + Cortadeira + Layboy",porMaquina:true,  tipo:"padrao",   area:"cs",  getItems:(m)=>m==="M2"?checklistCortadeiraM2:checklistCortadeiraM3 },
  { id:"passagem_ponta_cs",label:"Passagem de Ponta",   icon:"", desc:"Check-list Parte Seca — antes da passagem de ponta",   porMaquina:true,  tipo:"padrao",   area:"cs",  passagem:true, getItems:()=>checklistPassagemPontaCS },
  { id:"rejeicao",         label:"Diagnóstico Rejeição",icon:"⚠️",desc:"Fluxo de diagnóstico — Faca circular / Facão / Transversal",porMaquina:false,tipo:"rejeicao",area:"cs",getItems:()=>[] },
  { id:"enf_qualidade",    label:"Check List Qualidade",icon:"", desc:"Qualidade do fardo — todas as linhas",                 porMaquina:false, tipo:"enf",      area:"enf", getItems:()=>checklistEnfardamento },
  { id:"rota_enf",         label:"Rota Enfardamento",   icon:"", desc:"Inspeção por turno — todos os equipamentos",           porMaquina:true,  tipo:"rota_enf", area:"enf", getItems:()=>checklistRotaEnfardamento },
  { id:"barcode_enf",      label:"Validação de Fardos", icon:"📦", desc:"Leitura de código de barras — Lado A / Lado B",        porMaquina:false, tipo:"barcode_enf",area:"enf", getItems:()=>[] },
];


// ─── Storage helpers (Firestore + localStorage offline-safe) ──────────────────

// ─── EquipamentosTela ─────────────────────────────────────────────────────────
function EquipamentosTela({ eqState, setEqState, areaAtiva, setAreaAtiva, historico, setTela }) {
  const getListasByArea=()=>{
    if(areaAtiva==="pu")return{sub1:"M2",lista1:eqState.m2,sub2:"M3",lista2:eqState.m3,sub3:"Comum",lista3:eqState.comum};
    if(areaAtiva==="cs")return{sub1:"M2",lista1:eqState.cs_m2,sub2:"M3",lista2:eqState.cs_m3,sub3:null,lista3:[]};
    if(areaAtiva==="enf")return{sub1:"M2",lista1:eqState.enf_m2,sub2:"M3",lista2:eqState.enf_m3,sub3:null,lista3:[]};
    return{sub1:"M2",lista1:[],sub2:"M3",lista2:[],sub3:null,lista3:[]};
  };
  const{sub1,lista1,sub2,lista2,sub3,lista3}=getListasByArea();
  const [filtroSub,setFiltroSub]=useState("M2");
  const [filtroArea,setFiltroArea]=useState("TODAS");
  const [filtroStatus,setFiltroStatus]=useState("TODOS");
  const [busca,setBusca]=useState("");
  const [selId,setSelId]=useState(null);
  const [modalEq,setModalEq]=useState(null);
  const [modalObs,setModalObs]=useState(null);
  const [subModulo,setSubModulo]=useState("lista");
  const [showNotasHist,setShowNotasHist]=useState(false);
  const [modalPendencia,setModalPendencia]=useState(null);
  const [notaInput,setNotaInput]=useState("");
  const [pendencias,setPendencias]=useState(()=>storageGet("pendencias_h2")||{});
  const salvarPendencia=(eq,nota)=>{
    const agora=new Date();
    const data=agora.toISOString().slice(0,10);
    const hora=`${String(agora.getHours()).padStart(2,"0")}:${String(agora.getMinutes()).padStart(2,"0")}`;
    const cfg=storageGet("op_config")||{};
    const nova={...pendencias,[eq.id]:{nota,abertoEm:data+"T"+hora,abertoBy:cfg.nomeOperador||"—",eqNome:eq.nome}};
    setPendencias(nova);
    storageSet("pendencias_h2",nova);
    setModalPendencia(null);setNotaInput("");
  };

  const listaAtualRaw=filtroSub==="Comum"?lista3:filtroSub==="M2"?lista1:lista2;
  const listaAtual=listaAtualRaw||[];
  const areas=["TODAS",...new Set(listaAtual.map(e=>e.area))];
  const filtrados=listaAtual.filter(eq=>{
    const mA=filtroArea==="TODAS"||eq.area===filtroArea;
    const mS=filtroStatus==="TODOS"||eq.status===filtroStatus;
    const mB=!busca||eq.nome.toLowerCase().includes(busca.toLowerCase())||eq.tag.toLowerCase().includes(busca.toLowerCase());
    return mA&&mS&&mB;
  });

  const getListKey=()=>{
    if(areaAtiva==="pu")return filtroSub==="M2"?"m2":filtroSub==="M3"?"m3":"comum";
    if(areaAtiva==="cs")return filtroSub==="M2"?"cs_m2":"cs_m3";
    if(areaAtiva==="enf")return filtroSub==="M2"?"enf_m2":"enf_m3";
    return "m2";
  };

  const salvarNotas=(eqId,novasNotas)=>{
    const key=getListKey();
    setEqState(p=>({...p,[key]:p[key].map(e=>e.id===eqId?{...e,notas:novasNotas,status:novasNotas.length>0&&e.status==="OP"?"ALERTA":e.status}:e)}));
    setModalEq(null);
  };
  const salvarObservacao=(eqId,{obs,fotos,status,data,hora})=>{
    const key=getListKey();
    const novaObs={id:Date.now(),obs,fotos,data,hora};
    setEqState(p=>({...p,[key]:p[key].map(e=>e.id===eqId?{...e,status,obsRota:obs,obsRotaFotos:fotos,obsRotaHistorico:[...(e.obsRotaHistorico||[]),novaObs]}:e)}));
    setModalObs(null);
  };
  const setStatus=(eqId,s)=>{const key=getListKey();setEqState(p=>({...p,[key]:p[key].map(e=>e.id===eqId?{...e,status:s}:e)}));};
  const dotColor2=(s)=>s==="OP"?C.accentLight:s==="ALERTA"?C.warningLight:C.dangerLight;
  const eq=selId?listaAtual.find(e=>e.id===selId):null;

  if(eq)return (
    <div>
      {modalEq&&<ModalNotas eq={modalEq} onClose={()=>setModalEq(null)} onSave={salvarNotas}/>}
      {modalObs&&<ModalObservacao eq={modalObs} onClose={()=>setModalObs(null)} onSave={salvarObservacao}/>}
      <button onClick={()=>setSelId(null)} style={{...btnSec,marginBottom:18}}>← Voltar</button>
      <div style={{position:"relative",background:`linear-gradient(155deg,${dotColor2(eq.status)}12,rgba(7,24,40,0.97))`,border:`1.5px solid ${dotColor2(eq.status)}77`,borderRadius:14,padding:20,boxShadow:`0 4px 28px ${dotColor2(eq.status)}28`,overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${dotColor2(eq.status)},transparent)`}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:5}}>
              <span style={{background:`${subColor(eq.sub)}18`,border:`1px solid ${subColor(eq.sub)}99`,color:subColor(eq.sub),borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800,boxShadow:`0 0 8px ${subColor(eq.sub)}33`}}>{subLabel(eq.sub)}</span>
              <span style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:6,padding:"2px 8px",fontSize:10}}>{eq.area}</span>
            </div>
            <h3 style={{color:C.white,fontSize:16,fontWeight:800,margin:"0 0 3px"}}>{eq.nome}</h3>
            <code style={{color:C.textMuted,fontSize:12,letterSpacing:"0.05em"}}>{eq.tag}</code>
          </div>
          <Badge color={statusColor(eq.status)}>{eq.status}</Badge>
        </div>
        {eq.sub==="Comum"&&<div style={{background:"#1a0f0055",border:`1px solid ${C.warningLight}44`,borderRadius:8,padding:"10px 12px",marginBottom:16}}><p style={{color:C.warningLight,fontSize:12,margin:0,fontWeight:600}}>⚡ Equipamento de Área Comum — uma falha aqui impacta Máquina 2 e Máquina 3</p></div>}
        {/* Notas */}
        <div style={{background:C.surface,border:`1px solid ${eq.notas.length>0?C.warningLight+"44":C.border}`,borderTop:`2px solid ${eq.notas.length>0?C.warningLight:C.border}`,borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span>🗒</span><span style={{color:C.text,fontWeight:700,fontSize:13}}>Notas de Manutenção</span>
              {eq.notas.length>0&&<span style={{background:"#2a180055",border:`1px solid ${C.warningLight}55`,color:C.warningLight,borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:800}}>{eq.notas.length}</span>}
            </div>
            <button onClick={()=>setModalEq(eq)} style={{...btnPrim,padding:"5px 12px",fontSize:11}}>🗒 Registrar Nota</button>
          </div>
          {eq.notas.length===0?<p style={{color:C.textDim,fontSize:12,margin:0}}>Nenhuma nota aberta.</p>:eq.notas.map((n,i)=>(<div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.warningLight}`,borderRadius:7,padding:"9px 12px",marginBottom:6}}><span style={{background:"#2a180055",border:`1px solid ${C.warningLight}55`,color:C.warningLight,borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:800,fontFamily:"monospace",display:"inline-block",marginBottom:4}}>{n.num||"S/Nº"}</span><p style={{color:C.text,fontSize:12,margin:0,lineHeight:1.5}}>{n.desc}</p></div>))}
        </div>
        {/* Status */}
        <div style={{background:C.surface,border:`1px solid ${dotColor2(eq.status)}44`,borderTop:`2px solid ${dotColor2(eq.status)}`,borderRadius:10,padding:12}}>
          <p style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",margin:"0 0 8px"}}>Status</p>
          <div style={{display:"flex",gap:7}}>
            {["OP","ALERTA","MANUTENÇÃO"].map(s=>{const cor=s==="OP"?C.accentLight:s==="ALERTA"?C.warningLight:C.dangerLight;const ativo=eq.status===s;return(<button key={s} onClick={()=>setStatus(eq.id,s)} style={{flex:1,padding:"7px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:10,textTransform:"uppercase",background:ativo?`linear-gradient(135deg,${cor}33,${cor}18)`:C.tagBg,border:`1.5px solid ${ativo?cor:C.border}`,color:ativo?cor:C.textMuted,boxShadow:ativo?`0 0 10px ${cor}44,0 0 20px ${cor}22`:"none"}}>{s}</button>);})}
          </div>
        </div>
        {/* Observações de Rota */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderTop:`2px solid #5090FF`,borderRadius:10,padding:14,marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span>📝</span><span style={{color:C.text,fontWeight:700,fontSize:13}}>Observações de Rota</span>
              {(eq.obsRotaHistorico||[]).length>0&&<span style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:700}}>{(eq.obsRotaHistorico||[]).length}</span>}
            </div>
            <button onClick={()=>setModalObs(eq)} style={{...btnPrim,padding:"5px 12px",fontSize:11}}>+ Registrar</button>
          </div>
          {!(eq.obsRotaHistorico||[]).length?<p style={{color:C.textDim,fontSize:12,margin:0}}>Nenhuma observação registrada.</p>:(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[...(eq.obsRotaHistorico||[])].reverse().map((o,i)=>(
                <div key={o.id||i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                    <span style={{color:C.textDim,fontSize:10}}>📅 {o.data?.split("-").reverse().join("/")} · {o.hora}</span>
                    <button onClick={()=>{
                      const novaHist=(eq.obsRotaHistorico||[]).filter((_,idx)=>(eq.obsRotaHistorico.length-1-idx)!==i);
                      const key=getListKey();
                      setEqState(p=>({...p,[key]:p[key].map(e2=>e2.id===eq.id?{...e2,obsRotaHistorico:novaHist}:e2)}));
                    }} style={{background:"rgba(255,82,82,0.1)",border:`1px solid ${C.dangerLight}44`,color:C.dangerLight,borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:800,cursor:"pointer",flexShrink:0,marginLeft:8}}>
                      Encerrar
                    </button>
                  </div>
                  {o.obs&&<p style={{color:C.text,fontSize:12,margin:"4px 0 6px",lineHeight:1.5}}>{o.obs}</p>}
                  {o.fotos?.length>0&&<ObsFotos fotos={o.fotos}/>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const todosAreaEq=areaAtiva==="pu"?[...eqState.comum,...eqState.m2,...eqState.m3]:areaAtiva==="cs"?[...eqState.cs_m2,...eqState.cs_m3]:[...eqState.enf_m2,...eqState.enf_m3];
  const totalEq=todosAreaEq.length;
  const qtdOP=todosAreaEq.filter(e=>e.status==="OP").length;
  const pctOP=totalEq>0?Math.round(qtdOP/totalEq*100):100;
  const corOp=pctOP>=90?C.accentLight:pctOP>=70?C.warningLight:C.dangerLight;
  const chamadosAbertos=(storageGet("chamados_h2")||[]).filter(c=>c.status==="aberto").length;
  if(subModulo==="chamados") return <ChamadosTela eqState={eqState} setEqState={setEqState} areaAtiva={areaAtiva} onVoltar={()=>setSubModulo("lista")}/>;
  if(subModulo==="cleaners") return <div><button onClick={()=>setSubModulo("lista")} style={{...btnSec,marginBottom:14}}>← Voltar</button><CleanersTela/></div>;
  if(subModulo==="facas") return <div><button onClick={()=>setSubModulo("lista")} style={{...btnSec,marginBottom:14}}>← Voltar</button><FacasTela maquina={eq?.sub||"M2"}/></div>;
  if(subModulo==="pendencias"){
    const todosA=[...(lista1||[]),...(lista2||[]),...(lista3||[])];
    const chamA=(storageGet("chamados_h2")||[]).filter(c=>c.status==="aberto");
    const notasA=todosA.flatMap(e=>(e.notas||[]).map(n=>({...n,eqNome:e.nome,eqId:e.id})));
    const tratativa=Object.entries(pendencias).map(([id,p])=>({...p,eqId:id})).filter(p=>{const eq=todosA.find(e=>e.id===p.eqId);return eq&&eq.status!=="OP";});
    const fmtTs=ts=>{if(!ts)return"—";const[d,t]=(ts||"").split("T");if(!d)return"—";const[y,m,dia]=d.split("-");return`${dia}/${m} ${(t||"").slice(0,5)}`;};
    const corPrazo=p=>p==="Imediato"?C.dangerLight:p==="Urgente"?"#FF8C00":"#5090FF";
    return(
      <div>
        <button onClick={()=>setSubModulo("lista")} style={{...btnSec,marginBottom:14}}>← Voltar</button>
        <h2 style={{color:C.white,fontSize:17,fontWeight:900,margin:"0 0 10px",letterSpacing:"0.04em"}}>PENDÊNCIAS</h2>
        <button onClick={()=>setSubModulo("chamados")} style={{...btnPrim,width:"100%",padding:"11px",marginBottom:14,fontSize:12}}>+ Abrir Chamado / Nota SAP →</button>
        {/* Chamados */}
        <div style={{color:C.dangerLight,fontSize:9,fontWeight:800,letterSpacing:"0.1em",marginBottom:6}}>CHAMADOS ({chamA.length})</div>
        {chamA.length===0?<div style={{color:C.textDim,fontSize:10,marginBottom:12,fontStyle:"italic"}}>— nenhum chamado aberto —</div>:(
          <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
            {chamA.map((c,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${corPrazo(c.prazo)}33`,borderLeft:`3px solid ${corPrazo(c.prazo)}`,borderRadius:8,padding:"8px 10px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                  <span style={{color:C.text,fontWeight:700,fontSize:11}}>{c.equipamentoNome||"—"}</span>
                  <span style={{background:`${corPrazo(c.prazo)}22`,border:`1px solid ${corPrazo(c.prazo)}55`,color:corPrazo(c.prazo),borderRadius:20,padding:"1px 7px",fontSize:9,fontWeight:800}}>{c.prazo}</span>
                </div>
                {c.descricao&&<div style={{color:C.textDim,fontSize:10}}>{c.descricao}</div>}
              </div>
            ))}
          </div>
        )}
        {/* Em tratativa */}
        <div style={{color:"#5090FF",fontSize:9,fontWeight:800,letterSpacing:"0.1em",marginBottom:6}}>EM TRATATIVA ({tratativa.length})</div>
        {tratativa.length===0?<div style={{color:C.textDim,fontSize:10,fontStyle:"italic"}}>— nenhum item em tratativa —</div>:(
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {tratativa.map((p,i)=>(
              <div key={i} style={{background:C.card,border:"1px solid #5090FF33",borderLeft:"3px solid #5090FF",borderRadius:8,padding:"8px 10px"}}>
                <div style={{color:C.text,fontWeight:700,fontSize:11,marginBottom:2}}>{p.eqNome||"—"}</div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {p.nota?<span style={{color:C.accentLight,fontFamily:"monospace",fontSize:10,fontWeight:700}}>📋 {p.nota}</span>:<span style={{color:"#5090FF",fontSize:9}}>sem nº SAP</span>}
                  <span style={{color:C.textDim,fontSize:9}}>· {p.abertoBy} · {fmtTs(p.abertoEm)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <div>
      {modalEq&&<ModalNotas eq={modalEq} onClose={()=>setModalEq(null)} onSave={salvarNotas}/>}
      {modalObs&&<ModalObservacao eq={modalObs} onClose={()=>setModalObs(null)} onSave={salvarObservacao}/>}
      {modalPendencia&&(
        <div onClick={()=>{setModalPendencia(null);setNotaInput("");}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.accentLight}33`,borderRadius:"18px 18px 0 0",padding:22,width:"100%",maxWidth:600}}>
            <div style={{color:C.accentLight,fontWeight:800,fontSize:14,marginBottom:3}}>📋 Abrir chamado / nota</div>
            <div style={{color:C.textDim,fontSize:11,marginBottom:12}}>{modalPendencia.nome}</div>
            <input value={notaInput} onChange={e=>setNotaInput(e.target.value)} placeholder="Nº nota SAP ou chamado..." style={{...inputStyle,marginBottom:14,fontSize:15,fontFamily:"monospace",fontWeight:700}} autoFocus/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setModalPendencia(null);setNotaInput("");}} style={{...btnSec,flex:1,padding:13,fontSize:13}}>Cancelar</button>
              <button disabled={!notaInput.trim()} onClick={()=>salvarPendencia(modalPendencia,notaInput.trim())} style={{flex:2,padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,background:notaInput.trim()?C.blue:C.tagBg,border:"none",color:notaInput.trim()?"#fff":C.textDim,opacity:notaInput.trim()?1:0.5}}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
      {/* ── ALARMES ── */}
      {(()=>{
        const todosA=[...(lista1||[]),...(lista2||[]),...(lista3||[])];
        const falhas=todosA.filter(e=>e.status!=="OP");
        const alarmes=falhas.filter(e=>!pendencias[e.id]);
        const nAl=falhas.filter(e=>e.status==="ALERTA").length;
        const nMn=falhas.filter(e=>e.status==="MANUTENÇÃO").length;
        const temCrit=nMn>0;
        const dispensar=(eq)=>{
          const nova={...pendencias,[eq.id]:{nota:"",abertoEm:new Date().toISOString(),abertoBy:(storageGet("op_config")||{}).nomeOperador||"—",eqNome:eq.nome,tipo:"tratativa"}};
          setPendencias(nova);storageSet("pendencias_h2",nova);
        };
        return(
          <div style={{background:C.card,border:`1px solid ${alarmes.length>0?C.dangerLight+"44":C.border}`,borderTop:`2px solid ${alarmes.length>0?C.dangerLight:C.accentLight}`,borderRadius:12,padding:"10px 12px",marginBottom:10,boxShadow:temCrit?`0 0 10px ${C.dangerLight}22`:"none"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <span style={{color:alarmes.length>0?C.dangerLight:C.textDim,fontSize:9,fontFamily:"monospace",fontWeight:700,letterSpacing:"0.12em"}}>ALARMES</span>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                {[{v:nAl,l:"ALERTA",c:C.warningLight},{v:nMn,l:"MANUT",c:C.dangerLight}].map(({v,l,c})=>(
                  <span key={l} style={{display:"flex",alignItems:"center",gap:4}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:v>0?c:C.textDim,boxShadow:v>0?`0 0 5px ${c}`:"none",display:"inline-block"}}/>
                    <span style={{color:v>0?c:C.textDim,fontSize:11,fontWeight:900,fontFamily:"monospace"}}>{v}</span>
                    <span style={{color:C.textDim,fontSize:8,letterSpacing:"0.08em"}}>{l}</span>
                  </span>
                ))}
              </div>
            </div>
            {alarmes.length===0?(
              <div style={{color:C.textDim,fontSize:10,fontFamily:"monospace",textAlign:"center",padding:"3px 0"}}>— sem alarmes ativos —</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:200,overflowY:"auto"}}>
                {[...alarmes].sort((a,b)=>a.status==="MANUTENÇÃO"&&b.status!=="MANUTENÇÃO"?-1:1).map(eq=>{
                  const cor=eq.status==="MANUTENÇÃO"?C.dangerLight:C.warningLight;
                  return(
                    <div key={eq.id} style={{display:"flex",alignItems:"center",gap:6,background:C.tagBg,border:`1px solid ${cor}33`,borderLeft:`3px solid ${cor}`,borderRadius:7,padding:"7px 8px"}}>
                      <span style={{fontSize:12,flexShrink:0}}>{eq.status==="MANUTENÇÃO"?"🔧":"⚡"}</span>
                      <div onClick={()=>setSelId(eq.id)} style={{minWidth:0,flex:1,cursor:"pointer"}}>
                        <div style={{color:C.text,fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{eq.nome}</div>
                        <div style={{color:cor,fontSize:8.5,fontFamily:"monospace",fontWeight:700,marginTop:1}}>{eq.status}</div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();setModalPendencia(eq);setNotaInput("");}} style={{flexShrink:0,background:`${C.accentLight}15`,border:`1px solid ${C.accentLight}44`,borderRadius:7,padding:"4px 7px",cursor:"pointer",color:C.accentLight,fontSize:9,fontWeight:800,whiteSpace:"nowrap"}}>+ nota</button>
                      <button onClick={e=>{e.stopPropagation();dispensar(eq);}} style={{flexShrink:0,width:26,height:26,borderRadius:6,border:`1px solid ${cor}55`,background:`${cor}11`,color:cor,fontSize:13,fontWeight:900,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
      {/* ── Header + Chamados ── */}
      {(()=>{
        const chamA=(storageGet("chamados_h2")||[]).filter(c=>c.status==="aberto");
        const nIme=chamA.filter(c=>c.prazo==="Imediato").length;
        const nUrg=chamA.filter(c=>c.prazo==="Urgente").length;
        const nNor=chamA.length-nIme-nUrg;
        const grupos=[["M2",lista1],["M3",lista2],["Comum",lista3]].map(([sub,lst])=>({sub,n:(lst||[]).reduce((a,e)=>a+e.notas.length,0)}));
        const totalN=grupos.reduce((a,g)=>a+g.n,0);
        const nTratativa=Object.keys(pendencias).filter(id=>{const todosA=[...(lista1||[]),...(lista2||[]),...(lista3||[])];return todosA.some(e=>e.id===id&&e.status!=="OP");}).length;
        const totalPend=chamA.length+totalN+nTratativa;
        const corC=nIme>0?C.dangerLight:nUrg>0?"#FF8C00":totalPend>0?"#5090FF":C.accentLight;
        return(
          <>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:6}}>
              <h2 style={{color:C.white,fontSize:17,fontWeight:900,margin:0,letterSpacing:"0.04em"}}>GESTÃO DE ATIVOS</h2>
              <span style={{color:C.textDim,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase"}}>· {AREAS.find(a=>a.id===areaAtiva)?.label||""}</span>
            </div>
            <button onClick={()=>setTela("dashboard")} style={{...btnSec,padding:"5px 12px",fontSize:11,marginBottom:8}}>← Início</button>
            <div style={{height:1,background:`linear-gradient(90deg,${C.accent}66,transparent)`,margin:"0 0 10px"}}/>
            <button onClick={()=>setSubModulo("pendencias")} style={{width:"100%",background:C.card,border:`1.5px solid ${corC}44`,borderTop:`2px solid ${corC}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",textAlign:"left",marginBottom:14,animation:nIme>0?"trava-pulse 1.8s ease-in-out infinite":"none"}}
              onMouseEnter={e=>e.currentTarget.style.background=`${corC}0d`}
              onMouseLeave={e=>e.currentTarget.style.background=C.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <span style={{color:C.textDim,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"monospace"}}>Pendências</span>
                <span style={{color:C.textDim,fontSize:13}}>›</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[{v:chamA.length,l:"CHAMADOS",c:corC,sub:nIme>0?`${nIme} IM · ${nUrg} UR`:nUrg>0?`${nUrg} URGENTE`:null},{v:totalN,l:"NOTAS",c:C.warningLight,sub:null},{v:nTratativa,l:"EM TRATATIVA",c:"#5090FF",sub:null}].map(({v,l,c,sub})=>(
                  <div key={l} style={{textAlign:"center"}}>
                    <div style={{color:v>0?c:C.textDim,fontWeight:900,fontSize:26,fontFamily:"monospace",lineHeight:1}}>{v}</div>
                    <div style={{color:C.textDim,fontSize:7.5,letterSpacing:"0.07em",marginTop:3}}>{l}</div>
                    {sub&&<div style={{color:c,fontSize:8,fontWeight:700,marginTop:2,fontFamily:"monospace"}}>{sub}</div>}
                  </div>
                ))}
              </div>
              {totalPend===0&&<div style={{color:C.accentLight,fontSize:10,fontWeight:700,textAlign:"center",marginTop:6}}>✓ sem pendências</div>}
            </button>
          </>
        );
      })()}
      {/* Cards operacionais por máquina */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <span style={{color:C.accentLight,fontSize:9,fontWeight:900,letterSpacing:"0.1em"}}>02</span>
        <span style={{color:C.accentLight,fontSize:11,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase"}}>Seleção de Área e Máquina</span>
        <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(0,230,118,0.27),transparent)"}}/>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        {[{id:"pu",l:"P. ÚMIDA",cor:"#5090FF",glow:"rgba(80,144,255,0.6)"},{id:"cs",l:"CORTADEIRA",cor:"#A855F7",glow:"rgba(168,85,247,0.6)"},{id:"enf",l:"ENFARD.",cor:"#FFB300",glow:"rgba(255,179,0,0.6)"}].map(a=>{const ativo=areaAtiva===a.id;return(
          <button key={a.id} onClick={()=>{setAreaAtiva(a.id);setFiltroSub("M2");setFiltroArea("TODAS");setFiltroStatus("TODOS");setBusca("");}}
            style={{flex:1,padding:"7px 4px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:10,letterSpacing:"0.05em",transition:"all .15s",position:"relative",overflow:"hidden",
              background:ativo?`linear-gradient(135deg,${a.cor}22,${a.cor}0a)`:C.tagBg,
              border:`2px solid ${ativo?a.cor+"99":C.border}`,
              color:ativo?a.cor:C.textMuted,
              boxShadow:ativo?`0 0 12px ${a.glow},0 0 24px ${a.glow.replace("0.6","0.25")}`:"none"}}>
            {ativo&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${a.cor},transparent)`}}/>}
            {a.l}
          </button>
        );})}

      </div>
      {(()=>{
        const chamA=(storageGet("chamados_h2")||[]).filter(c=>c.status==="aberto");
        const mkSel=(k,label,eqs,cor,glow)=>{
          const al=eqs.filter(e=>e.status!=="OP").length;
          const nts=eqs.reduce((a,e)=>a+e.notas.length,0);
          const cham=chamA.filter(c=>c.maquina===k).length;
          const ok=al===0&&nts===0&&cham===0;
          const ativo=filtroSub===k;
          return(
            <button key={k} onClick={()=>{setFiltroSub(k);setFiltroArea("TODAS");setFiltroStatus("TODOS");setBusca("");}}
              style={{flex:1,padding:"10px 6px",borderRadius:11,cursor:"pointer",transition:"all .15s",position:"relative",overflow:"hidden",
                background:ativo?`linear-gradient(155deg,${cor}22,rgba(7,24,40,0.97))`:C.tagBg,
                border:`2px solid ${ativo?cor+"99":C.border}`,
                boxShadow:ativo?`0 0 14px ${glow},0 0 28px ${glow.replace("0.6","0.25")}`:"none",
                display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
              {ativo&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${cor},transparent)`}}/>}
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:ok?C.success:al>0?C.warning:C.warningLight,boxShadow:`0 0 5px ${ok?C.success:C.warning}`}}/>
                <span style={{color:ativo?cor:C.textMuted,fontWeight:900,fontSize:13,letterSpacing:"0.04em"}}>{label}</span>
              </div>
              <div style={{display:"flex",gap:4,minHeight:16}}>
                {al>0&&<span style={{background:"rgba(255,193,7,0.15)",border:`1px solid ${C.warningLight}55`,color:C.warningLight,borderRadius:10,padding:"0 6px",fontSize:9,fontWeight:800}}>⚡{al}</span>}
                {nts>0&&<span style={{background:"rgba(255,82,82,0.12)",border:`1px solid ${C.dangerLight}44`,color:C.dangerLight,borderRadius:10,padding:"0 6px",fontSize:9,fontWeight:800}}>🗒{nts}</span>}
                {cham>0&&<span style={{background:"rgba(80,144,255,0.12)",border:"1px solid rgba(80,144,255,0.4)",color:"#5090FF",borderRadius:10,padding:"0 6px",fontSize:9,fontWeight:800}}>🔧{cham}</span>}
                {al===0&&nts===0&&cham===0&&<span style={{color:C.textDim,fontSize:9}}>{eqs.length} eq.</span>}
              </div>
            </button>
          );
        };
        return(
          <div style={{display:"flex",gap:7,marginBottom:14}}>
            {mkSel("M2","MÁQ. 2",[...eqState.m2,...eqState.cs_m2,...eqState.enf_m2],"#5090FF","rgba(80,144,255,0.6)")}
            {mkSel("M3","MÁQ. 3",[...eqState.m3,...eqState.cs_m3,...eqState.enf_m3],C.accentLight,"rgba(0,230,118,0.6)")}
            {areaAtiva==="pu"&&mkSel("Comum","⚡ COMUM",eqState.comum,C.warningLight,"rgba(255,193,7,0.6)")}
          </div>
        );
      })()}
      {areaAtiva==="cs"&&(()=>{
        // resumo rápido: nº de facas em atenção/crítico no último checklist da máquina
        const itemId=filtroSub==="M2"?"cs2_31":"cs3_31";
        const hist=storageGet("historico_h2")||[];
        const ult=hist.filter(h=>h&&h.tipoId==="cortadeira"&&h.maquina===filtroSub).sort((a,b)=>(b.id||0)-(a.id||0))[0];
        let atencao=0,critico=0,maxBar=0;
        if(ult){for(let i=0;i<11;i++){const n=parseFloat(String(ult.valores?.[`${itemId}_${i}`]||"").replace(",","."));if(!isNaN(n)){if(n>maxBar)maxBar=n;if(n>=3.5)critico++;else if(n>=2.5)atencao++;}}}
        return(
          <button onClick={()=>setSubModulo("facas")} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
            background:`linear-gradient(155deg,${C.blueLight}18,rgba(7,24,40,0.97))`,border:`2px solid ${C.blueLight}66`,borderRadius:12,padding:"13px 16px",
            cursor:"pointer",marginBottom:14,boxShadow:`0 0 14px ${C.blueLight}22`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>🗡️</span>
              <div style={{textAlign:"left"}}>
                <div style={{color:C.text,fontWeight:900,fontSize:13,letterSpacing:"0.03em"}}>Controle de Facas & Facão</div>
                <div style={{color:C.textDim,fontSize:10}}>11 facas + facão · {filtroSub}</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {critico>0&&<span style={{background:"rgba(255,82,82,0.15)",border:`1px solid ${C.dangerLight}55`,color:C.dangerLight,borderRadius:10,padding:"2px 8px",fontSize:10,fontWeight:900}}>{critico} no limite</span>}
              {atencao>0&&<span style={{background:"rgba(255,193,7,0.12)",border:`1px solid ${C.warningLight}55`,color:C.warningLight,borderRadius:10,padding:"2px 8px",fontSize:10,fontWeight:900}}>{atencao} atenção</span>}
              {critico===0&&atencao===0&&<span style={{color:C.accentLight,fontSize:11,fontWeight:700}}>✓ OK</span>}
              <span style={{color:C.blueLight,fontSize:18}}>›</span>
            </div>
          </button>
        );
      })()}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <span style={{color:C.textMuted,fontSize:9,fontWeight:900,letterSpacing:"0.1em"}}>03</span>
        <span style={{color:C.text,fontSize:11,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase"}}>Ativos</span>
        <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.border},transparent)`}}/>
      </div>
      <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="🔍  Buscar nome ou TAG..." style={{...inputStyle,marginBottom:8}}/>
      <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4,marginBottom:12}}>
        {["TODOS","OP","ALERTA","MANUTENÇÃO"].map(s=>(<button key={s} onClick={()=>setFiltroStatus(s)} style={{padding:"4px 10px",borderRadius:20,cursor:"pointer",whiteSpace:"nowrap",fontSize:10,fontWeight:700,textTransform:"uppercase",background:filtroStatus===s?C.accent:C.tagBg,border:`1px solid ${filtroStatus===s?C.accent:C.border}`,color:filtroStatus===s?"#fff":C.textMuted}}>{s}</button>))}
        <div style={{width:1,background:C.border,margin:"0 3px"}}/>
        {areas.map(a=>(<button key={a} onClick={()=>setFiltroArea(a)} style={{padding:"4px 10px",borderRadius:20,cursor:"pointer",whiteSpace:"nowrap",fontSize:10,fontWeight:600,background:filtroArea===a?"#0d2810":C.tagBg,border:`1px solid ${filtroArea===a?C.accentLight:C.border}`,color:filtroArea===a?C.accentLight:C.textMuted}}>{a}</button>))}
      </div>
      <div style={{color:C.textDim,fontSize:11,marginBottom:8}}>{filtrados.length} equipamento{filtrados.length!==1?"s":""}</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {filtrados.length===0&&<div style={{textAlign:"center",color:C.textMuted,padding:"36px 0",fontSize:13}}>Nenhum resultado.</div>}
        {filtrados.map(eq=>(
          <div key={eq.id} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${dotColor2(eq.status)}`,borderRadius:10,padding:"11px 12px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:9,height:9,borderRadius:"50%",flexShrink:0,background:dotColor2(eq.status),boxShadow:`0 0 6px ${dotColor2(eq.status)}88`}}/>
            <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setSelId(eq.id)}>
              <div style={{color:C.text,fontWeight:600,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{eq.nome}</div>
              <div style={{display:"flex",gap:6,alignItems:"center",marginTop:3}}>
                <code style={{color:"#8FB8E8",fontSize:9.5,letterSpacing:"0.05em",background:"rgba(14,40,71,0.65)",border:"1px solid rgba(80,144,255,0.25)",borderRadius:4,padding:"1px 6px",fontWeight:700}}>{eq.tag}</code>
                <span style={{color:C.textDim,fontSize:10}}>{eq.area}</span>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
              {eq.notas.length>0&&<button onClick={()=>setModalEq(eq)} style={{background:"#2a080833",border:`1px solid ${C.dangerLight}55`,color:C.dangerLight,borderRadius:20,padding:"2px 7px",fontSize:10,fontWeight:800,cursor:"pointer"}}>🗒{eq.notas.length}</button>}
              {(eq.obsRotaHistorico||[]).length>0&&<button onClick={()=>setSelId(eq.id)} style={{background:"#0a2015",border:`1px solid ${C.accentLight}44`,color:C.accentLight,borderRadius:20,padding:"2px 7px",fontSize:10,fontWeight:800,cursor:"pointer"}}>📝{(eq.obsRotaHistorico||[]).length}</button>}
              <button onClick={e=>{e.stopPropagation();setModalObs(eq);}} style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:20,padding:"2px 8px",fontSize:10,cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accentLight;e.currentTarget.style.color=C.accentLight;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMuted;}}>📷</button>
              <Badge color={statusColor(eq.status)}>{eq.status}</Badge>
              <span style={{color:C.textDim,fontSize:15,cursor:"pointer"}} onClick={()=>setSelId(eq.id)}>›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── ChamadosTela ────────────────────────────────────────────────────────────
const PRAZOS=[{id:"Imediato",cor:C.dangerLight,desc:"No turno"},{id:"Urgente",cor:"#FF8C00",desc:"Até 24h"},{id:"Normal",cor:C.warningLight,desc:"Até 7 dias"},{id:"Programável",cor:"#5090FF",desc:"Até 30 dias"}];
const DISCIPLINAS=["Mecânica","Instrumentação","Automação","Elétrica","Operacional"];
const CONDICOES=["Em operação","Parada de máquina"];

function ChamadosTela({ eqState, setEqState, areaAtiva, onVoltar }) {
  const [subView,setSubView]=useState("lista");
  const [abaAtiva,setAbaAtiva]=useState("chamados");
  const [buscaTag,setBuscaTag]=useState("");
  const [showRegNota,setShowRegNota]=useState(false);
  const [regBusca,setRegBusca]=useState("");
  const [regEq,setRegEq]=useState(null);
  const [regNum,setRegNum]=useState("");
  const [regDesc,setRegDesc]=useState("");
  const [showHistN,setShowHistN]=useState(false);
  const [chamados,setChamados]=useState(()=>storageGet("chamados_h2")||[]);
  React.useEffect(()=>{cloudGet("chamados_h2").then(data=>{if(data&&Array.isArray(data))setChamados(data);});},[]);
  const [filtro,setFiltro]=useState("aberto");
  const [showChamadosHist,setShowChamadosHist]=useState(false);
  const [buscarEq,setBuscarEq]=useState("");
  const [eqSel,setEqSel]=useState(null);
  const [notaSAP,setNotaSAP]=useState("");
  const [descricao,setDescricao]=useState("");
  const [prazo,setPrazo]=useState("Normal");
  const [disciplina,setDisciplina]=useState("");
  const [condicao,setCondicao]=useState("");
  const [selId,setSelId]=useState(null);
  const [resolucao,setResolucao]=useState("");
  const [fotosAbertura,setFotosAbertura]=useState([]);
  const [fotosEncerramento,setFotosEncerramento]=useState([]);
  const comprimirFoto=(file)=>new Promise(res=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const MAX=800,ratio=Math.min(MAX/img.width,MAX/img.height,1);
        const cv=document.createElement("canvas");
        cv.width=img.width*ratio;cv.height=img.height*ratio;
        cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
        res(cv.toDataURL("image/jpeg",0.72));
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });

  const cfg=storageGet("op_config")||{};
  const getNow=()=>{const d=new Date();return{data:d.toISOString().slice(0,10),hora:`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`};};
  const todosEq=[...eqState.comum,...eqState.m2,...eqState.m3,...eqState.cs_m2,...eqState.cs_m3,...eqState.enf_m2,...eqState.enf_m3];
  const sugestoes=buscarEq.length>=3?todosEq.filter(e=>e.tag.toLowerCase().includes(buscarEq.toLowerCase())||e.nome.toLowerCase().includes(buscarEq.toLowerCase())).slice(0,6):[];
  const salvar=(novos)=>{setChamados(novos);storageSet("chamados_h2",novos);};
  const corP=(p)=>PRAZOS.find(x=>x.id===p)?.cor||C.textMuted;
  const fmtData=d=>{if(!d)return"—";const[y,m,day]=d.split("-");return`${day}/${m}/${y}`;};
  const filtrados=chamados.filter(c=>c.status===filtro).sort((a,b)=>b.id-a.id);
  const sel=selId?chamados.find(c=>c.id===selId):null;

  const abrirChamado=()=>{
    if(!eqSel||!descricao.trim()||!disciplina||!condicao)return;
    const{data,hora}=getNow();
    salvar([...chamados,{id:Date.now(),equipamentoId:eqSel.id,equipamentoNome:eqSel.nome,equipamentoTag:eqSel.tag,maquina:eqSel.sub,area:eqSel.area,notaSAP:notaSAP.trim(),descricao:descricao.trim(),prazo,disciplina,condicao,operador:cfg.nomeOperador||"",matricula:cfg.matricula||"",dataAbertura:data,horaAbertura:hora,status:"aberto",resolucao:"",dataEncerramento:"",horaEncerramento:"",fotosAbertura:[...fotosAbertura],fotosEncerramento:[]}]);
    setBuscarEq("");setEqSel(null);setNotaSAP("");setDescricao("");setPrazo("Normal");setDisciplina("");setCondicao("");setFotosAbertura([]);setSubView("lista");
  };

  const encerrar=(id)=>{
    const{data,hora}=getNow();
    salvar(chamados.map(c=>c.id===id?{...c,status:"encerrado",resolucao,dataEncerramento:data,horaEncerramento:hora,fotosEncerramento:[...fotosEncerramento]}:c));
    setResolucao("");setFotosEncerramento([]);setSelId(null);
  };

  if(sel)return(
    <div>
      <button onClick={()=>setSelId(null)} style={{...btnSec,marginBottom:16}}>← Voltar</button>
      <div style={{background:C.card,border:`1px solid ${corP(sel.prioridade)}44`,borderLeft:`3px solid ${corP(sel.prioridade)}`,borderRadius:12,padding:16,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>
              <span style={{background:`${corP(sel.prazo)}22`,border:`1px solid ${corP(sel.prazo)}55`,color:corP(sel.prazo),borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800}}>{sel.prazo||sel.prioridade}</span>
              {sel.disciplina&&<span style={{background:"rgba(14,40,71,0.9)",border:"1px solid rgba(26,92,204,0.4)",color:"#5090FF",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{sel.disciplina}</span>}
              {sel.condicao&&<span style={{background:sel.condicao==="Parada de máquina"?"rgba(42,8,8,0.9)":"rgba(0,40,20,0.9)",border:`1px solid ${sel.condicao==="Parada de máquina"?C.dangerLight:C.accentLight}44`,color:sel.condicao==="Parada de máquina"?C.dangerLight:C.accentLight,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{sel.condicao}</span>}
              <span style={{background:sel.status==="aberto"?"#2a080833":"#002810",border:`1px solid ${sel.status==="aberto"?C.dangerLight:C.accentLight}44`,color:sel.status==="aberto"?C.dangerLight:C.accentLight,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{sel.status==="aberto"?"🔴 Aberto":"✓ Encerrado"}</span>
            </div>
            <div style={{color:C.white,fontWeight:700,fontSize:14}}>{sel.equipamentoNome}</div>
            <code style={{color:C.textMuted,fontSize:11}}>{sel.equipamentoTag}</code>
          </div>
        </div>
        {sel.notaSAP&&<div style={{background:C.tagBg,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 10px",marginBottom:10}}><span style={{color:C.textDim,fontSize:10}}>SAP: </span><span style={{color:C.warningLight,fontWeight:700,fontSize:12}}>{sel.notaSAP}</span></div>}
        <p style={{color:C.text,fontSize:13,margin:"0 0 10px",lineHeight:1.5}}>{sel.descricao}</p>
        <div style={{display:"flex",gap:12,color:C.textMuted,fontSize:11}}>
          <span>📅 {fmtData(sel.dataAbertura)} {sel.horaAbertura}</span>
          <span>👤 {sel.operador||"—"}</span>
        </div>
        {sel.status==="encerrado"&&sel.resolucao&&<div style={{marginTop:10,background:"#002810",border:`1px solid ${C.accentLight}33`,borderRadius:8,padding:"8px 12px"}}><p style={{color:C.textDim,fontSize:10,margin:"0 0 3px",textTransform:"uppercase"}}>Resolução</p><p style={{color:C.accentLight,fontSize:12,margin:0}}>{sel.resolucao}</p><p style={{color:C.textMuted,fontSize:10,margin:"4px 0 0"}}>{fmtData(sel.dataEncerramento)} {sel.horaEncerramento}</p></div>}
        {(sel.fotosAbertura?.length>0||sel.fotosEncerramento?.length>0)&&(
          <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
            {sel.fotosAbertura?.length>0&&(
              <div>
                <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",marginBottom:6}}>Fotos da abertura</div>
                <div style={{display:"flex",gap:8}}>
                  {sel.fotosAbertura.map((f,i)=><img key={i} src={f} style={{width:90,height:90,objectFit:"cover",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>window.open(f,"_blank")}/>)}
                </div>
              </div>
            )}
            {sel.fotosEncerramento?.length>0&&(
              <div>
                <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",marginBottom:6}}>Fotos do reparo</div>
                <div style={{display:"flex",gap:8}}>
                  {sel.fotosEncerramento.map((f,i)=><img key={i} src={f} style={{width:90,height:90,objectFit:"cover",borderRadius:8,border:`1px solid ${C.accentLight}33`,cursor:"pointer"}} onClick={()=>window.open(f,"_blank")}/>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {sel.status==="aberto"&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:14}}>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:7}}>Encerrar chamado — o que foi feito?</label>
          <textarea value={resolucao} onChange={e=>setResolucao(e.target.value)} rows={3} placeholder="Descreva a resolução..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit",marginBottom:10}}/>
          <div style={{marginBottom:10}}>
            <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:8}}>Foto do reparo <span style={{color:C.textDim,fontWeight:400,textTransform:"none"}}>(até 2 fotos)</span></label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {fotosEncerramento.map((f,i)=>(
                <div key={i} style={{position:"relative",width:72,height:72}}>
                  <img src={f} style={{width:72,height:72,objectFit:"cover",borderRadius:8,border:`1px solid ${C.border}`}}/>
                  <button onClick={()=>setFotosEncerramento(p=>p.filter((_,j)=>j!==i))} style={{position:"absolute",top:-6,right:-6,background:C.danger,border:"none",borderRadius:"50%",width:20,height:20,color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>✕</button>
                </div>
              ))}
              {fotosEncerramento.length<2&&(
                <label style={{width:72,height:72,borderRadius:8,border:`1.5px dashed ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:4,background:C.tagBg}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.accentLight}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={async e=>{if(e.target.files[0]){const b64=await comprimirFoto(e.target.files[0]);setFotosEncerramento(p=>[...p,b64]);}e.target.value="";}}/>
                  <span style={{fontSize:20}}>📷</span>
                  <span style={{color:C.textDim,fontSize:9}}>Foto</span>
                </label>
              )}
            </div>
          </div>
          <button onClick={()=>encerrar(sel.id)} disabled={!resolucao.trim()} style={{...btnPrim,width:"100%",opacity:!resolucao.trim()?0.4:1}}>✓ Encerrar Chamado</button>
        </div>
      )}
    </div>
  );

  if(subView==="novo")return(
    <div>
      <button onClick={()=>setSubView("lista")} style={{...btnSec,marginBottom:16}}>← Voltar</button>
      <h3 style={{color:C.white,fontSize:16,fontWeight:800,marginBottom:14}}>Novo Chamado</h3>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:5}}>Equipamento</label>
          <input value={eqSel?`${eqSel.tag} — ${eqSel.nome}`:buscarEq} onChange={e=>{setBuscarEq(e.target.value);setEqSel(null);}} placeholder="Digite TAG ou nome (mín. 3 letras)..." style={inputStyle}/>
          {sugestoes.length>0&&!eqSel&&(
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,marginTop:4,overflow:"hidden"}}>
              {sugestoes.map(eq=>(
                <button key={eq.id} onClick={()=>{setEqSel(eq);setBuscarEq("");}} style={{width:"100%",background:"none",border:"none",borderBottom:`1px solid ${C.border}`,padding:"10px 12px",textAlign:"left",cursor:"pointer",color:C.text}}>
                  <div style={{fontWeight:600,fontSize:12}}>{eq.nome}</div>
                  <div style={{display:"flex",gap:8,marginTop:2}}><code style={{color:C.textMuted,fontSize:10}}>{eq.tag}</code><span style={{color:C.textDim,fontSize:10}}>{eq.sub} · {eq.area}</span></div>
                </button>
              ))}
            </div>
          )}
          {eqSel&&<div style={{background:"#002810",border:`1px solid ${C.accentLight}33`,borderRadius:8,padding:"8px 12px",marginTop:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{color:C.accentLight,fontWeight:700,fontSize:12}}>{eqSel.nome}</div><code style={{color:C.textMuted,fontSize:10}}>{eqSel.tag}</code></div><button onClick={()=>{setEqSel(null);setBuscarEq("");}} style={{...btnSec,padding:"3px 8px",fontSize:11}}>✕</button></div>}
        </div>
        <div>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:5}}>Nota SAP (opcional)</label>
          <input value={notaSAP} onChange={e=>setNotaSAP(e.target.value)} placeholder="Ex: 1234567" style={inputStyle}/>
        </div>
        <div>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:6}}>Prazo</label>
          <div style={{display:"flex",gap:6}}>
            {PRAZOS.map(p=>(<button key={p.id} onClick={()=>setPrazo(p.id)} style={{flex:1,padding:"9px 2px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,background:prazo===p.id?`${p.cor}22`:C.tagBg,border:`1.5px solid ${prazo===p.id?p.cor:C.border}`,color:prazo===p.id?p.cor:C.textMuted,textAlign:"center"}}>{p.id}</button>))}
          </div>
        </div>
        <div>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:6}}>Disciplina</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {DISCIPLINAS.map(d=>(<button key={d} onClick={()=>setDisciplina(d)} style={{flex:1,padding:"7px 4px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,background:disciplina===d?"rgba(14,40,71,0.9)":C.tagBg,border:`1.5px solid ${disciplina===d?"#5090FF":C.border}`,color:disciplina===d?"#5090FF":C.textMuted}}>{d}</button>))}
          </div>
        </div>
        <div>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:6}}>Condição de execução</label>
          <div style={{display:"flex",gap:6}}>
            {CONDICOES.map(co=>(<button key={co} onClick={()=>setCondicao(co)} style={{flex:1,padding:"9px 6px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,background:condicao===co?(co==="Parada de máquina"?"rgba(42,8,8,0.9)":"rgba(0,40,20,0.9)"):C.tagBg,border:`1.5px solid ${condicao===co?(co==="Parada de máquina"?C.dangerLight:C.accentLight):C.border}`,color:condicao===co?(co==="Parada de máquina"?C.dangerLight:C.accentLight):C.textMuted}}>{co}</button>))}
          </div>
        </div>
        <div>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:5}}>Descrição do Problema</label>
          <textarea value={descricao} onChange={e=>setDescricao(e.target.value)} rows={3} placeholder="Descreva o problema observado..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/>
        </div>
        <div>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:8}}>Evidência fotográfica <span style={{color:C.textDim,fontWeight:400,textTransform:"none"}}>(até 2 fotos)</span></label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {fotosAbertura.map((f,i)=>(
              <div key={i} style={{position:"relative",width:80,height:80}}>
                <img src={f} style={{width:80,height:80,objectFit:"cover",borderRadius:8,border:`1px solid ${C.border}`}}/>
                <button onClick={()=>setFotosAbertura(p=>p.filter((_,j)=>j!==i))} style={{position:"absolute",top:-6,right:-6,background:C.danger,border:"none",borderRadius:"50%",width:20,height:20,color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>✕</button>
              </div>
            ))}
            {fotosAbertura.length<2&&(
              <label style={{width:80,height:80,borderRadius:8,border:`1.5px dashed ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:4,background:C.tagBg,transition:"border-color .15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.accentLight}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={async e=>{if(e.target.files[0]){const b64=await comprimirFoto(e.target.files[0]);setFotosAbertura(p=>[...p,b64]);}e.target.value="";}}/>
                <span style={{fontSize:22}}>📷</span>
                <span style={{color:C.textDim,fontSize:9}}>Foto</span>
              </label>
            )}
          </div>
        </div>
        <button onClick={abrirChamado} disabled={!eqSel||!descricao.trim()||!disciplina||!condicao} style={{background:(!eqSel||!descricao.trim()||!disciplina||!condicao)?"rgba(80,144,255,0.08)":`linear-gradient(135deg,#1a4aaa,#2563eb)`,border:`1.5px solid ${(!eqSel||!descricao.trim()||!disciplina||!condicao)?"rgba(80,144,255,0.2)":"rgba(100,160,255,0.5)"}`,borderRadius:12,padding:"14px",width:"100%",cursor:(!eqSel||!descricao.trim()||!disciplina||!condicao)?"not-allowed":"pointer",color:(!eqSel||!descricao.trim()||!disciplina||!condicao)?C.textMuted:"#fff",fontSize:14,fontWeight:800,letterSpacing:"0.04em",boxShadow:(!eqSel||!descricao.trim()||!disciplina||!condicao)?"none":"0 0 16px rgba(80,144,255,0.4),0 4px 12px rgba(0,0,0,0.3)",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <span style={{fontSize:16}}>🔧</span> Abrir Chamado
        </button>
      </div>
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div><h3 style={{color:C.white,fontSize:16,fontWeight:800,margin:0}}>Chamados & Notas</h3></div>
        <div style={{display:"flex",gap:8}}><button onClick={onVoltar} style={{...btnSec,padding:"6px 12px",fontSize:12}}>← Voltar</button>{abaAtiva==="chamados"&&<button onClick={()=>setSubView("novo")} style={{...btnPrim,padding:"6px 14px",fontSize:12}}>+ Novo</button>}</div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[{id:"chamados",l:"🔧 Chamados"},{id:"notas",l:"🗒 Notas Registradas"}].map(a=>(
          <button key={a.id} onClick={()=>setAbaAtiva(a.id)} style={{flex:1,padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:11,background:abaAtiva===a.id?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${abaAtiva===a.id?"rgba(255,255,255,0.55)":C.border}`,color:abaAtiva===a.id?"#fff":C.textMuted,boxShadow:abaAtiva===a.id?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4)":"none"}}>{a.l}</button>
        ))}
      </div>
      {abaAtiva==="notas"?(()=>{
        const todosEq=[...((eqState?.m2)||[]),...((eqState?.m3)||[]),...((eqState?.comum)||[]),...((eqState?.cs_m2)||[]),...((eqState?.cs_m3)||[]),...((eqState?.enf_m2)||[]),...((eqState?.enf_m3)||[])];
        const cfg=storageGet("op_config")||{};
        const sugs=regBusca.length>=3?todosEq.filter(e=>e.tag.toLowerCase().includes(regBusca.toLowerCase())||e.nome.toLowerCase().includes(regBusca.toLowerCase())).slice(0,6):[];
        const notasHist=storageGet("notas_hist_h2")||[];
        const salvarNotaLocal=(eqId,novasNotas)=>{
          if(!setEqState)return;
          const keys=["m2","m3","comum","cs_m2","cs_m3","enf_m2","enf_m3"];
          setEqState(p=>{const np={...p};keys.forEach(k=>{if(np[k])np[k]=np[k].map(e=>e.id===eqId?{...e,notas:novasNotas,status:novasNotas.length>0&&e.status==="OP"?"ALERTA":e.status}:e);});return np;});
        };
        const registrar=()=>{
          if(!regEq||(!regNum.trim()&&!regDesc.trim()))return;
          const agora=new Date();
          const data=agora.toISOString().slice(0,10);
          const hora=`${String(agora.getHours()).padStart(2,"0")}:${String(agora.getMinutes()).padStart(2,"0")}`;
          const novasNotas=[...(regEq.notas||[]),{num:regNum.trim(),desc:regDesc.trim(),data,hora,responsavel:cfg.nomeOperador||""}];
          salvarNotaLocal(regEq.id,novasNotas);
          setRegEq(null);setRegBusca("");setRegNum("");setRegDesc("");setShowRegNota(false);
        };
        const encerrarN=(n,eq)=>{
          const agora=new Date();
          const dataEnc=agora.toISOString().slice(0,10);
          const horaEnc=`${String(agora.getHours()).padStart(2,"0")}:${String(agora.getMinutes()).padStart(2,"0")}`;
          const hist=storageGet("notas_hist_h2")||[];
          storageSet("notas_hist_h2",[...hist,{...n,eqNome:eq.nome,eqTag:eq.tag,sub:eq.sub,eqId:eq.id,dataEncerramento:dataEnc,horaEncerramento:horaEnc,encerradoPor:cfg.nomeOperador||""}]);
          salvarNotaLocal(eq.id,eq.notas.filter(x=>!(x.num===n.num&&x.desc===n.desc)));
        };
        const busqTagFilt=buscaTag.toLowerCase();
        const eqComNotas=todosEq.filter(e=>e.notas.length>0&&(!buscaTag||e.tag.toLowerCase().includes(busqTagFilt)||e.nome.toLowerCase().includes(busqTagFilt)));
        const totalN=eqComNotas.reduce((a,e)=>a+e.notas.length,0);
        return(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input value={buscaTag} onChange={e=>setBuscaTag(e.target.value)} placeholder="🔍 Buscar por TAG ou nome..." style={{...inputStyle,flex:1}}/>
              <button onClick={()=>setShowRegNota(v=>!v)} style={{...btnPrim,padding:"8px 12px",fontSize:11,whiteSpace:"nowrap"}}>+ Registrar</button>
            </div>
            {showRegNota&&(
              <div style={{background:C.card,border:`1px solid ${C.accentLight}33`,borderRadius:12,padding:14,marginBottom:14,display:"flex",flexDirection:"column",gap:10}}>
                <div>
                  <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:5}}>Equipamento</label>
                  <input value={regEq?`${regEq.tag} — ${regEq.nome}`:regBusca} onChange={e=>{setRegBusca(e.target.value);setRegEq(null);}} placeholder="TAG ou nome (mín. 3 letras)..." style={inputStyle}/>
                  {sugs.length>0&&!regEq&&<div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,marginTop:4,overflow:"hidden"}}>{sugs.map(eq=>(<button key={eq.id} onClick={()=>{setRegEq(eq);setRegBusca("");}} style={{width:"100%",background:"none",border:"none",borderBottom:`1px solid ${C.border}`,padding:"10px 12px",textAlign:"left",cursor:"pointer",color:C.text}}><div style={{fontWeight:600,fontSize:12}}>{eq.nome}</div><div style={{display:"flex",gap:8,marginTop:2}}><code style={{color:C.textMuted,fontSize:10}}>{eq.tag}</code><span style={{color:C.textDim,fontSize:10}}>{eq.sub} · {eq.area}</span></div></button>))}</div>}
                  {regEq&&<div style={{background:"#002810",border:`1px solid ${C.accentLight}33`,borderRadius:8,padding:"8px 12px",marginTop:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{color:C.accentLight,fontWeight:700,fontSize:12}}>{regEq.nome}</div><code style={{color:C.textMuted,fontSize:10}}>{regEq.tag} · {regEq.sub} · {regEq.area}</code></div><button onClick={()=>{setRegEq(null);setRegBusca("");}} style={{...btnSec,padding:"3px 8px",fontSize:11}}>✕</button></div>}
                </div>
                <div><label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:5}}>Número da Nota SAP</label><input value={regNum} onChange={e=>setRegNum(e.target.value)} placeholder="Ex: MNT-2025-1234" style={inputStyle}/></div>
                <div><label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:5}}>Descrição</label><textarea value={regDesc} onChange={e=>setRegDesc(e.target.value)} rows={2} placeholder="Descreva o problema..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/></div>
                <div style={{background:C.tagBg,borderRadius:8,padding:"7px 10px",display:"flex",gap:16}}><span style={{color:C.textDim,fontSize:10}}>Responsável: <b style={{color:C.text}}>{cfg.nomeOperador||"—"}</b></span><span style={{color:C.textDim,fontSize:10}}>Data: <b style={{color:C.text}}>{new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}</b></span></div>
                <button disabled={!regEq||(!regNum.trim()&&!regDesc.trim())} onClick={registrar} style={{...btnPrim,opacity:!regEq||(!regNum.trim()&&!regDesc.trim())?0.4:1,padding:12}}>🗒 Registrar Nota</button>
              </div>
            )}
            {totalN===0&&!showHistN&&<div style={{textAlign:"center",color:C.textMuted,padding:"28px 0",fontSize:13}}>{buscaTag?"Nenhuma nota encontrada para este filtro.":"Nenhuma nota registrada."}</div>}
            {eqComNotas.map(eq=>(
              <div key={eq.id} style={{marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                  <code style={{color:"#8FB8E8",fontSize:9.5,background:"rgba(14,40,71,0.65)",border:"1px solid rgba(80,144,255,0.25)",borderRadius:4,padding:"1px 6px",fontWeight:700}}>{eq.tag}</code>
                  <span style={{color:C.text,fontSize:12,fontWeight:700}}>{eq.nome}</span>
                  <span style={{color:C.textDim,fontSize:9}}>{eq.sub} · {eq.area}</span>
                </div>
                {eq.notas.map((n,i)=>(
                  <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.warningLight}`,borderRadius:9,padding:"9px 12px",marginBottom:5}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                          <span style={{background:"#2a180055",border:`1px solid ${C.warningLight}55`,color:C.warningLight,borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:800,fontFamily:"monospace"}}>{n.num||"S/Nº"}</span>
                          {n.data&&<span style={{color:C.textDim,fontSize:9}}>📅 {n.data.split("-").reverse().slice(0,2).join("/")} {n.hora||""}</span>}
                          {n.responsavel&&<span style={{color:C.textDim,fontSize:9}}>👤 {n.responsavel}</span>}
                        </div>
                        {n.desc&&<div style={{color:C.textMuted,fontSize:11,lineHeight:1.4}}>{n.desc}</div>}
                      </div>
                      <button onClick={()=>encerrarN(n,eq)} style={{flexShrink:0,background:"rgba(0,230,118,0.1)",border:`1px solid ${C.accentLight}44`,color:C.accentLight,borderRadius:8,padding:"6px 10px",fontSize:10,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>✓ Encerrar</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={()=>setShowHistN(v=>!v)} style={{width:"100%",marginTop:4,background:C.tagBg,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",color:C.textMuted,fontWeight:700,fontSize:11}}>
              <span>📋 Histórico de Notas Encerradas ({notasHist.length})</span>
              <span>{showHistN?"▲":"▼"}</span>
            </button>
            {showHistN&&(
              <div style={{marginTop:8}}>
                {notasHist.length===0?<div style={{textAlign:"center",color:C.textMuted,padding:"16px 0",fontSize:12}}>Nenhuma nota encerrada ainda.</div>
                :[...notasHist].reverse().map((n,i)=>(
                  <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.accentLight}44`,borderRadius:9,padding:"9px 12px",marginBottom:5,opacity:.85}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                      <span style={{background:"rgba(0,230,118,0.08)",border:`1px solid ${C.accentLight}44`,color:C.accentLight,borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:800,fontFamily:"monospace"}}>{n.num||"S/Nº"}</span>
                      <span style={{color:C.textDim,fontSize:9,fontWeight:700}}>{n.sub} · {n.eqNome}</span>
                      <code style={{color:C.textDim,fontSize:9}}>{n.eqTag}</code>
                    </div>
                    {n.desc&&<div style={{color:C.textMuted,fontSize:11,lineHeight:1.4,marginBottom:4}}>{n.desc}</div>}
                    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                      {n.data&&<span style={{color:C.textDim,fontSize:9}}>📅 Aberta: {n.data.split("-").reverse().slice(0,2).join("/")} {n.hora||""}</span>}
                      <span style={{color:C.accentLight,fontSize:9}}>✓ Encerrada: {n.dataEncerramento?.split("-").reverse().slice(0,2).join("/")} {n.horaEncerramento}</span>
                      {n.encerradoPor&&<span style={{color:C.textDim,fontSize:9}}>👤 {n.encerradoPor}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })():(
      <>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[{id:"aberto",label:"Abertos"},{id:"encerrado",label:"Encerrados"}].map(f=>(<button key={f.id} onClick={()=>setFiltro(f.id)} style={{flex:1,padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12,background:filtro===f.id?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${filtro===f.id?"rgba(255,255,255,0.55)":C.border}`,color:filtro===f.id?"#fff":C.textMuted,boxShadow:filtro===f.id?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4),0 0 40px rgba(80,144,255,0.2)":"none"}}>{f.label}</button>))}
      </div>
      {filtrados.length===0?(
        <div style={{background:C.card,border:`1px dashed ${C.border}`,borderRadius:12,padding:"36px 20px",textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:8}}>📋</div>
          <p style={{color:C.textMuted,fontSize:13,margin:0}}>Nenhum chamado {filtro}.</p>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {filtrados.map(ch=>(
            <div key={ch.id} onClick={()=>setSelId(ch.id)} style={{background:C.card,border:`1px solid ${corP(ch.prioridade)}33`,borderLeft:`3px solid ${corP(ch.prioridade)}`,borderRadius:11,padding:"12px 14px",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div style={{flex:1,marginRight:10}}>
                  <div style={{color:C.white,fontWeight:700,fontSize:13}}>{ch.equipamentoNome}</div>
                  <code style={{color:C.textMuted,fontSize:10}}>{ch.equipamentoTag}</code>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end",flexShrink:0}}>
                  <span style={{background:`${corP(ch.prazo||ch.prioridade)}22`,border:`1px solid ${corP(ch.prazo||ch.prioridade)}55`,color:corP(ch.prazo||ch.prioridade),borderRadius:6,padding:"2px 7px",fontSize:9,fontWeight:800}}>{ch.prazo||ch.prioridade}</span>
                  {ch.disciplina&&<span style={{color:"#5090FF",fontSize:9,fontWeight:700}}>{ch.disciplina}</span>}
                </div>
              </div>
              <p style={{color:C.textMuted,fontSize:11,margin:"0 0 6px",lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{ch.descricao}</p>
              <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                {ch.notaSAP&&<span style={{color:C.warningLight,fontSize:10,fontWeight:700}}>SAP: {ch.notaSAP}</span>}
                <span style={{color:C.textDim,fontSize:10}}>📅 {fmtData(ch.dataAbertura)} {ch.horaAbertura}</span>
                {ch.status==="encerrado"&&ch.dataEncerramento&&<span style={{color:C.accentLight,fontSize:10}}>✓ {fmtData(ch.dataEncerramento)} {ch.horaEncerramento}</span>}
                <span style={{color:C.textDim,fontSize:10}}>👤 {ch.operador||"—"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {filtro==="aberto"&&(
        <>
          <button onClick={()=>setShowChamadosHist(v=>!v)} style={{width:"100%",marginTop:10,background:C.tagBg,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",color:C.textMuted,fontWeight:700,fontSize:11}}>
            <span>📋 Histórico de Chamados Encerrados ({chamados.filter(c=>c.status==="encerrado").length})</span>
            <span>{showChamadosHist?"▲":"▼"}</span>
          </button>
          {showChamadosHist&&(
            <div style={{marginTop:8}}>
              {chamados.filter(c=>c.status==="encerrado").sort((a,b)=>b.id-a.id).length===0
                ?<div style={{textAlign:"center",color:C.textMuted,padding:"20px 0",fontSize:12}}>Nenhum chamado encerrado ainda.</div>
                :chamados.filter(c=>c.status==="encerrado").sort((a,b)=>b.id-a.id).map(ch=>(
                  <div key={ch.id} onClick={()=>setSelId(ch.id)} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.accentLight}44`,borderRadius:9,padding:"9px 12px",marginBottom:5,cursor:"pointer",opacity:.85}}>
                    <div style={{color:C.text,fontWeight:600,fontSize:12,marginBottom:3}}>{ch.equipamentoNome}</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      <code style={{color:C.textDim,fontSize:9}}>{ch.equipamentoTag}</code>
                      {ch.prazo&&<span style={{color:corP(ch.prazo),fontSize:9,fontWeight:700}}>{ch.prazo}</span>}
                    </div>
                    {ch.descricao&&<p style={{color:C.textMuted,fontSize:10,margin:"4px 0",lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{ch.descricao}</p>}
                    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:3}}>
                      <span style={{color:C.textDim,fontSize:9}}>📅 Aberto: {fmtData(ch.dataAbertura)} {ch.horaAbertura}</span>
                      {ch.dataEncerramento&&<span style={{color:C.accentLight,fontSize:9}}>✓ Encerrado: {fmtData(ch.dataEncerramento)} {ch.horaEncerramento}</span>}
                      <span style={{color:C.textDim,fontSize:9}}>👤 {ch.operador||"—"}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </>
      )}
    </>
    )}
    </div>
  );
}
const ROTAS_CONFIG = {
  pu:  { label:"Parte Úmida",
    rotas:[{id:"rotina",label:"Rotina PU — M2",maquina:"M2"},{id:"rotina",label:"Rotina PU — M3",maquina:"M3"}],
    motivos:["Máquina quebrada","Variação grande no processo","Falta de operador","Outro"] },
  cs:  { label:"Cortadeira / P. Seca",
    rotas:[{id:"cortadeira",label:"Rotina Cortadeira — M2",maquina:"M2"},{id:"cortadeira",label:"Rotina Cortadeira — M3",maquina:"M3"}],
    motivos:["PP da cortadeira","PP de linha","Quebra de folha","Parada de máquina","Variação grande no processo","Outro"] },
  enf: { label:"Enfardamento",
    rotas:[{id:"enf_qualidade",label:"Check List Qualidade — M2",maquina:"M2"},{id:"enf_qualidade",label:"Check List Qualidade — M3",maquina:"M3"},{id:"rota_enf",label:"Rota Enfardamento — M2",maquina:"M2"},{id:"rota_enf",label:"Rota Enfardamento — M3",maquina:"M3"}],
    motivos:["PP de linha","Quebra na máquina","Variação grande no processo","Falta de operador","Outro"] },
};


export { EquipamentosTela, equipamentosComum, equipamentosM2, equipamentosM3, equipamentosCS_M2, equipamentosCS_M3, equipamentosEnf_M2, equipamentosEnf_M3 };
