// ─── equipeTela.jsx — VÉRTICE PG · Gestão de Time (registro editável do time) ─
// Fonte da verdade do pessoal. Semente = PG_EQUIPE (pgEquipe.js); persiste no
// Firestore em pg_equipe_h2/registro. As demais telas só consomem este registro.
import { useState, useEffect, useMemo } from "react";
import { db, doc, setDoc, onSnapshot } from "../firebase";
import { PG_EQUIPE } from "./pgEquipe";

const C = {
  bg:"#04111D", surface:"#071828", card:"#0A1929",
  accent:"#00E676", cyan:"#00F0FF", blue:"#5090FF", roxo:"#B388FF",
  warning:"#FFC107", danger:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880", white:"#ffffff",
  borderPG:"rgba(80,144,255,0.22)",
};
const LETRAS = ["A","B","C","D","E"];
const LCOR = { A:"#00F0FF", B:"#5090FF", C:"#00E676", D:"#B388FF", E:"#FFC107" };
const AREAS = [
  ["painel","Painel"], ["parte_umida","Parte Úmida"],
  ["secador_cortadeira","Secador/Cortadeira"], ["enfardamento","Enfardamento"],
];
const ALABEL = Object.fromEntries(AREAS);
const hoje = () => new Date().toISOString().slice(0,10);
const fmt = s => s ? s.split("-").reverse().slice(0,2).join("/") : "—";
const emFerias = (o,d=hoje()) => (o.ausencias||[]).some(a => a.inicio<=d && d<=a.fim);

export default function EquipeTela({ onVoltar }){
  const [equipe, setEquipe] = useState(PG_EQUIPE.map((o,i)=>({ id:o.id||"op_"+i, ausencias:[], ...o })));
  const [edit, setEdit] = useState(null);
  const [novo, setNovo] = useState(false);

  // Firestore: pg_equipe_h2/registro = { operadores:[...] }
  useEffect(()=>{
    const unsub = onSnapshot(doc(db,"pg_equipe_h2","registro"), snap=>{
      const d = snap.data();
      if(d?.operadores?.length) setEquipe(d.operadores);
    }, ()=>{});
    return unsub;
  },[]);
  const salvar = lista => {
    setEquipe(lista);
    setDoc(doc(db,"pg_equipe_h2","registro"), { operadores:lista, ts:Date.now() }).catch(()=>{});
  };
  const upOp = op => { const i=equipe.findIndex(x=>x.id===op.id);
    const l = i===-1 ? [...equipe,op] : equipe.map(x=>x.id===op.id?op:x); salvar(l); setEdit(null); setNovo(false); };

  const turnistas = equipe.filter(o=>o.tipo==="turnista");
  const adm = equipe.filter(o=>o.tipo==="administrativo");
  const cont = useMemo(()=>{ const c=Object.fromEntries(LETRAS.map(l=>[l,0]));
    turnistas.forEach(o=>{ if(o.letra && !emFerias(o)) c[o.letra]++; }); return c; },[turnistas]);
  const grid = useMemo(()=>{ const g={};
    AREAS.forEach(([s])=>g[s]=Object.fromEntries(LETRAS.map(l=>[l,[]])));
    turnistas.forEach(o=>{ if(o.area && o.letra && g[o.area]) g[o.area][o.letra].push(o); }); return g; },[turnistas]);
  const alertas = useMemo(()=>equipe.flatMap(o=>(o.ausencias||[]).map(a=>({...a,op:o})))
    .filter(a=>a.tipo==="ferias").sort((x,y)=>x.inicio.localeCompare(y.inicio)).slice(0,6),[equipe]);

  return (
    <>
      <button onClick={onVoltar} style={{background:"none",border:"none",color:C.cyan,fontSize:13,cursor:"pointer",padding:"4px 0",marginBottom:6}}>‹ Início</button>

      {/* contagem por letra */}
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        {LETRAS.map(l=>(
          <div key={l} style={{flex:1,background:"rgba(10,25,41,.55)",border:`1px solid ${C.borderPG}`,borderTop:`2px solid ${LCOR[l]}`,borderRadius:10,padding:"6px 0",textAlign:"center"}}>
            <div style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:LCOR[l]}}>{l}</div>
            <div style={{fontFamily:"monospace",fontSize:17,fontWeight:800,color:C.white}}>{cont[l]}</div>
          </div>
        ))}
      </div>

      {alertas.length>0 && (
        <div style={{background:"rgba(10,25,41,.55)",border:`1px solid ${C.borderPG}`,borderLeft:`3px solid ${C.warning}`,borderRadius:10,padding:"9px 11px",marginBottom:8}}>
          <div style={{fontFamily:"monospace",fontSize:9,color:C.warning,letterSpacing:".14em",marginBottom:6}}>FÉRIAS PROGRAMADAS</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {alertas.map((a,i)=>(
              <button key={i} onClick={()=>setEdit(a.op)} style={{background:"rgba(255,255,255,.03)",border:`1px solid ${C.borderPG}`,borderRadius:8,padding:"5px 9px",cursor:"pointer",color:C.white,fontSize:11}}>
                <b>{a.op.nome}</b> <span style={{color:C.textDim,fontFamily:"monospace",fontSize:9}}>{fmt(a.inicio)}–{fmt(a.fim)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* grade área × letra */}
      <div style={{overflowX:"auto",border:`1px solid ${C.borderPG}`,borderRadius:12,background:"rgba(10,25,41,.45)"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:560}}>
          <thead><tr>
            <th style={{textAlign:"left",padding:"8px 10px",fontSize:9,color:C.textDim,fontFamily:"monospace",letterSpacing:".1em"}}>ÁREA</th>
            {LETRAS.map(l=><th key={l} style={{padding:"8px"}}><span style={{display:"inline-flex",width:22,height:22,alignItems:"center",justifyContent:"center",borderRadius:6,fontFamily:"monospace",fontWeight:800,fontSize:11,color:C.bg,background:LCOR[l]}}>{l}</span></th>)}
          </tr></thead>
          <tbody>
            {AREAS.map(([s,lab])=>(
              <tr key={s}>
                <td style={{padding:"6px 10px",fontSize:11,fontWeight:700,color:C.textMuted,borderTop:`1px solid ${C.borderPG}`,whiteSpace:"nowrap"}}>{lab}</td>
                {LETRAS.map(l=>(
                  <td key={l} style={{padding:5,borderTop:`1px solid ${C.borderPG}`,borderLeft:`1px solid ${C.borderPG}`,verticalAlign:"top"}}>
                    {grid[s][l].map(o=>{ const f=emFerias(o);
                      return (
                        <button key={o.id} onClick={()=>setEdit(o)} style={{display:"flex",alignItems:"center",gap:5,width:"100%",background:"rgba(255,255,255,.03)",border:`1px solid ${C.borderPG}`,borderRadius:7,padding:"5px 7px",marginBottom:4,cursor:"pointer",color:C.white,textAlign:"left"}}>
                          <span style={{width:6,height:6,borderRadius:"50%",flex:"0 0 auto",background:f?C.warning:C.accent,boxShadow:`0 0 5px ${f?C.warning:C.accent}`}}/>
                          <span style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",opacity:f?.55:1}}>{o.nome}</span>
                          {(o.tags||[]).includes("facilitador_pg") && <span style={{fontSize:8,fontWeight:800,color:C.bg,background:C.roxo,borderRadius:3,padding:"0 3px"}}>PG</span>}
                        </button>
                      );
                    })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADM */}
      <div style={{marginTop:8,background:"rgba(10,25,41,.45)",border:`1px solid ${C.borderPG}`,borderRadius:12,padding:"10px 11px"}}>
        <div style={{fontFamily:"monospace",fontSize:9,color:C.textDim,letterSpacing:".14em",marginBottom:8}}>ADMINISTRATIVO · FORA DA ROTAÇÃO</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {adm.map(o=>(
            <button key={o.id} onClick={()=>setEdit(o)} style={{background:"rgba(255,255,255,.03)",border:`1px solid ${C.borderPG}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",color:C.white,textAlign:"left"}}>
              <div style={{fontSize:12,fontWeight:700}}>{o.nome}</div>
              <div style={{fontSize:9.5,color:C.textDim}}>{o.cargo||"—"}</div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={()=>{ setNovo(true); setEdit({ id:"op_"+Date.now(), nome:"", tipo:"turnista", letra:"A", area:"painel", fab:"H2", tags:[], ausencias:[] }); }}
        style={{marginTop:10,width:"100%",background:"transparent",border:`1px dashed ${C.borderPG}`,color:C.textDim,borderRadius:10,padding:11,cursor:"pointer",fontSize:12}}>+ Adicionar operador</button>

      {edit && <Editor op={edit} novo={novo} onSalvar={upOp} onFechar={()=>{setEdit(null);setNovo(false);}}/>}
    </>
  );
}

function Editor({ op, novo, onSalvar, onFechar }){
  const [f,setF] = useState({ ...op, tags:[...(op.tags||[])], ausencias:(op.ausencias||[]).map(a=>({...a})) });
  const up = (k,v)=>setF(p=>({...p,[k]:v}));
  const turn = f.tipo==="turnista";
  const addAus = ()=>setF(p=>({...p,ausencias:[...p.ausencias,{tipo:"ferias",inicio:"",fim:""}]}));
  const upAus = (i,k,v)=>setF(p=>({...p,ausencias:p.ausencias.map((a,j)=>j===i?{...a,[k]:v}:a)}));
  const rmAus = i=>setF(p=>({...p,ausencias:p.ausencias.filter((_,j)=>j!==i)}));
  const submit = ()=>{ if(!f.nome.trim()) return;
    onSalvar({ ...f, nome:f.nome.trim().toUpperCase(),
      letra:turn?f.letra:null, area:turn?f.area:null, fab:turn?f.fab:null,
      ausencias:f.ausencias.filter(a=>a.inicio&&a.fim) }); };
  const inp = { width:"100%",background:C.bg,border:`1px solid ${C.borderPG}`,color:C.white,borderRadius:8,padding:"9px 11px",fontSize:14 };
  const lbl = { display:"block",fontFamily:"monospace",fontSize:9,color:C.textDim,letterSpacing:".1em",margin:"12px 0 5px" };

  return (
    <div onClick={onFechar} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:60}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",borderRadius:"18px 18px 0 0",border:`1px solid ${C.borderPG}`,padding:"14px 18px 22px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <h3 style={{margin:0,fontSize:16,color:C.white}}>{novo?"Novo operador":f.nome}</h3>
          <button onClick={onFechar} style={{background:C.surface,border:`1px solid ${C.borderPG}`,color:C.textDim,width:30,height:30,borderRadius:8,cursor:"pointer"}}>✕</button>
        </div>

        <label style={lbl}>NOME</label>
        <input style={inp} value={f.nome} onChange={e=>up("nome",e.target.value)} placeholder="Nome"/>

        <label style={lbl}>VÍNCULO</label>
        <div style={{display:"flex",background:C.bg,border:`1px solid ${C.borderPG}`,borderRadius:8,overflow:"hidden"}}>
          {["turnista","administrativo"].map(t=>(
            <button key={t} onClick={()=>up("tipo",t)} style={{flex:1,background:f.tipo===t?C.blue:"transparent",color:f.tipo===t?C.bg:C.textDim,border:"none",padding:9,cursor:"pointer",fontSize:12,fontWeight:700}}>{t==="turnista"?"Turno":"ADM"}</button>
          ))}
        </div>

        {turn ? (<>
          <label style={lbl}>LETRA</label>
          <div style={{display:"flex",gap:6}}>
            {LETRAS.map(l=>(
              <button key={l} onClick={()=>up("letra",l)} style={{flex:1,background:f.letra===l?LCOR[l]:C.bg,color:f.letra===l?C.bg:C.textDim,border:`1px solid ${f.letra===l?LCOR[l]:C.borderPG}`,borderRadius:8,padding:"10px 0",fontSize:15,fontWeight:800,cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          <label style={lbl}>ÁREA PRINCIPAL</label>
          <select style={inp} value={f.area} onChange={e=>up("area",e.target.value)}>
            {AREAS.map(([s,lab])=><option key={s} value={s}>{lab}</option>)}
          </select>
          <label style={lbl}>FÁBRICA</label>
          <div style={{display:"flex",gap:6}}>
            {["H1","H2"].map(x=>(
              <button key={x} onClick={()=>up("fab",x)} style={{flex:1,background:f.fab===x?C.cyan:C.bg,color:f.fab===x?C.bg:C.textDim,border:`1px solid ${C.borderPG}`,borderRadius:8,padding:"9px 0",fontSize:13,fontWeight:700,cursor:"pointer"}}>{x}</button>
            ))}
          </div>
        </>) : (<>
          <label style={lbl}>CARGO</label>
          <input style={inp} value={f.cargo||""} onChange={e=>up("cargo",e.target.value)} placeholder="Gerente, Coordenador…"/>
        </>)}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
          <label style={{...lbl,margin:0}}>FÉRIAS / AFASTAMENTOS</label>
          <button onClick={addAus} style={{background:C.surface,border:`1px solid ${C.borderPG}`,color:C.cyan,borderRadius:7,padding:"4px 9px",fontSize:11,cursor:"pointer"}}>+ período</button>
        </div>
        {f.ausencias.map((a,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:5,marginTop:6,alignItems:"center"}}>
            <input type="date" style={{...inp,padding:7,fontSize:12}} value={a.inicio} onChange={e=>upAus(i,"inicio",e.target.value)}/>
            <input type="date" style={{...inp,padding:7,fontSize:12}} value={a.fim} onChange={e=>upAus(i,"fim",e.target.value)}/>
            <button onClick={()=>rmAus(i)} style={{background:"transparent",border:`1px solid ${C.borderPG}`,color:C.danger,borderRadius:7,width:32,height:32,cursor:"pointer"}}>✕</button>
          </div>
        ))}

        <button onClick={submit} style={{marginTop:20,width:"100%",background:C.accent,border:"none",color:C.bg,borderRadius:10,padding:12,fontSize:14,fontWeight:800,cursor:"pointer"}}>{novo?"Adicionar":"Salvar"}</button>
      </div>
    </div>
  );
}
