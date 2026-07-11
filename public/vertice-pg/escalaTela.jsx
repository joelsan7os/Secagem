// ─── escalaTela.jsx — VÉRTICE PG · Escala editável (programação diária da PG) ─
// Semente = PG_ESCALA (pgPlano); overlay editável em pg_escala_h2/registro.
// Cada pessoa é anotada (letra + DESLOCADO) via pgEquipe/pgRotacao.
import { useState, useEffect, useMemo } from "react";
import { db, doc, setDoc, onSnapshot } from "../firebase";
import { PG_ESCALA } from "./pgPlano";
import { PG_EQUIPE, anotarPessoa } from "./pgEquipe";
import { letraNoTurno } from "./pgRotacao";

const C = {
  bg:"#04111D", card:"#0A1929", surface:"#071828",
  accent:"#00E676", cyan:"#00F0FF", blue:"#5090FF", roxo:"#B388FF", warning:"#FFC107", danger:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880", white:"#fff", borderPG:"rgba(80,144,255,0.22)",
};
const LCOR = { A:"#00F0FF", B:"#5090FF", C:"#00E676", D:"#B388FF", E:"#FFC107" };
const NOMES = PG_EQUIPE.map(o=>o.nome).sort();
const dh = s => { const d=new Date(s+"T12:00"); return `${["DOM","SEG","TER","QUA","QUI","SEX","SÁB"][d.getDay()]} ${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`; };
const clone = e => e.map(d=>({ d:d.d, t:d.t.map(([h,ps])=>[h, ps.map(p=>[...p])]) }));

export default function EscalaTela(){
  const [escala, setEscala] = useState(PG_ESCALA);
  const [idx, setIdx] = useState(()=>{ const h=new Date().toISOString().slice(0,10); const i=PG_ESCALA.findIndex(e=>e.d===h); return i>=0?i:0; });
  const [addTurno, setAddTurno] = useState(null); // índice do turno em modo "adicionar"
  const [novoNome, setNovoNome] = useState(""); const [novaFn, setNovaFn] = useState("");

  useEffect(()=>{
    const unsub = onSnapshot(doc(db,"pg_escala_h2","registro"), snap=>{
      const d = snap.data(); if(d?.escala?.length) setEscala(d.escala);
    }, ()=>{});
    return unsub;
  },[]);
  const salvar = nova => { setEscala(nova); setDoc(doc(db,"pg_escala_h2","registro"),{ escala:nova, ts:Date.now() }).catch(()=>{}); };

  const dia = escala[idx] || PG_ESCALA[idx];
  const nPessoas = useMemo(()=> dia ? dia.t.reduce((n,[,ps])=>n+ps.length,0) : 0, [dia]);

  const mut = fn => { const nova = clone(escala); fn(nova[idx]); salvar(nova); };
  const removerPessoa = (ti,pi)=> mut(d=>{ d.t[ti][1].splice(pi,1); });
  const addPessoa = ti => { if(!novoNome.trim()) return;
    mut(d=>{ const p=[novoNome.trim()]; if(novaFn.trim()) p.push(novaFn.trim()); d.t[ti][1].push(p); });
    setNovoNome(""); setNovaFn(""); setAddTurno(null);
  };

  if(!dia) return <div style={{color:C.textDim,fontSize:12}}>Sem escala.</div>;

  return (
    <>
      {/* navegação por dia */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <button onClick={()=>setIdx(Math.max(0,idx-1))} disabled={idx===0} style={navBtn(idx===0)}>‹</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:15,fontWeight:800,color:C.white}}>{dh(dia.d)}</div>
          <div style={{fontFamily:"monospace",fontSize:9,color:C.textDim,letterSpacing:".12em"}}>{nPessoas} PESSOAS</div>
        </div>
        <button onClick={()=>setIdx(Math.min(escala.length-1,idx+1))} disabled={idx===escala.length-1} style={navBtn(idx===escala.length-1)}>›</button>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {dia.t.map(([h,pessoas],ti)=>{
          const letraRot = letraNoTurno(dia.d,h);
          return (
            <div key={ti} style={{background:"rgba(10,25,41,0.45)",border:`1px solid ${C.borderPG}`,borderRadius:12,padding:"10px 12px"}}>
              <div style={{fontFamily:"monospace",fontSize:10,color:C.cyan,letterSpacing:".14em",marginBottom:8,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span>ENTRADA {h} · {pessoas.length}</span>
                {letraRot && <span style={{color:C.textDim}}>· rotação <span style={{color:LCOR[letraRot],fontWeight:800}}>{letraRot}</span></span>}
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {pessoas.map((p,pi)=>{
                  const a = anotarPessoa(p, dia.d, h);
                  return (
                    <div key={pi} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,.03)",
                      border:`1px solid ${a.he?`${C.warning}88`:a.deslocado?`${C.cyan}66`:"rgba(255,255,255,.09)"}`,borderRadius:8,padding:"4px 7px"}}>
                      {a.letra && <span style={{fontFamily:"monospace",fontSize:8.5,fontWeight:800,color:C.bg,background:LCOR[a.letra],borderRadius:4,padding:"0 4px"}}>{a.letra}</span>}
                      <span style={{fontSize:11.5,fontWeight:700,color:a.resolvido?C.white:C.textDim}}>{p[0]}</span>
                      {p[1] && <span style={{fontFamily:"monospace",fontSize:8.5,color:C.textDim}}>{p[1]}</span>}
                      {a.he && <span title="hora extra — veio na folga ou ficou além do horário" style={{fontFamily:"monospace",fontSize:8,fontWeight:800,color:C.warning,border:`1px solid ${C.warning}88`,borderRadius:4,padding:"0 4px"}}>HE</span>}
                      {a.deslocado && <span title="deslocado — inverteu/antecipou o horário da própria letra" style={{fontFamily:"monospace",fontSize:8,fontWeight:800,color:C.cyan,border:`1px solid ${C.cyan}66`,borderRadius:4,padding:"0 4px"}}>DESLOC</span>}
                      <button onClick={()=>removerPessoa(ti,pi)} style={{cursor:"pointer",background:"none",border:"none",color:C.danger,fontSize:12,padding:"0 2px",lineHeight:1}}>✕</button>
                    </div>
                  );
                })}
              </div>

              {addTurno===ti ? (
                <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",marginTop:8,padding:"8px",background:"rgba(0,0,0,.25)",borderRadius:8}}>
                  <input list="nomes-equipe" value={novoNome} onChange={e=>setNovoNome(e.target.value)} placeholder="Nome"
                    style={{background:C.bg,border:`1px solid ${C.borderPG}`,color:C.white,borderRadius:7,padding:"7px 9px",fontSize:13,minWidth:130}}/>
                  <input value={novaFn} onChange={e=>setNovaFn(e.target.value)} placeholder="função (opcional)"
                    style={{background:C.bg,border:`1px solid ${C.borderPG}`,color:C.white,borderRadius:7,padding:"7px 9px",fontSize:13,flex:1,minWidth:120}}/>
                  <button onClick={()=>addPessoa(ti)} style={{cursor:"pointer",background:C.accent,color:C.bg,border:"none",borderRadius:7,padding:"7px 12px",fontSize:13,fontWeight:800}}>Add</button>
                  <button onClick={()=>{setAddTurno(null);setNovoNome("");setNovaFn("");}} style={{cursor:"pointer",background:"none",border:`1px solid ${C.borderPG}`,color:C.textDim,borderRadius:7,padding:"7px 10px",fontSize:13}}>Cancelar</button>
                </div>
              ) : (
                <button onClick={()=>setAddTurno(ti)} style={{marginTop:8,background:"transparent",border:`1px dashed ${C.borderPG}`,color:C.textDim,borderRadius:8,padding:"6px 10px",fontSize:11,cursor:"pointer"}}>+ pessoa</button>
              )}
            </div>
          );
        })}
      </div>
      <datalist id="nomes-equipe">{NOMES.map(n=><option key={n} value={n}/>)}</datalist>
    </>
  );
}

function navBtn(dis){ return { background:"rgba(255,255,255,.03)",border:`1px solid ${C.borderPG}`,color:dis?C.textDim:C.cyan,borderRadius:9,padding:"6px 14px",fontSize:15,cursor:dis?"default":"pointer" }; }
