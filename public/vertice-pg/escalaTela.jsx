// ─── escalaTela.jsx — VÉRTICE PG · Escala editável (programação diária da PG) ─
// Semente = PG_ESCALA (pgPlano); overlay editável em pg_escala_h2/registro.
// Cada pessoa é anotada (letra + DESLOCADO) via pgEquipe/pgRotacao.
import { useState, useEffect, useMemo } from "react";
import { db, doc, setDoc, onSnapshot } from "../firebase";
import { PG_ESCALA } from "./pgPlano";
import { PG_EQUIPE, anotarPessoa, resolverNome, skillsDe } from "./pgEquipe";
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
  const [ficha, setFicha] = useState(null); // {p, a, dia, hora} operador clicado

  useEffect(()=>{
    const unsub = onSnapshot(doc(db,"pg_escala_h2","registro"), snap=>{
      const d = snap.data(); if(d?.escala?.length) setEscala(d.escala);
    }, ()=>{});
    return unsub;
  },[]);
  const salvar = nova => { setEscala(nova); setDoc(doc(db,"pg_escala_h2","registro"),{ escala:nova, ts:Date.now() }).catch(()=>{}); };

  const dia = escala[idx] || PG_ESCALA[idx];
  const nPessoas = useMemo(()=> dia ? dia.t.reduce((n,[,ps])=>n+ps.length,0) : 0, [dia]);

  // conflitos de descanso: < 11h entre o fim de um turno e o início do próximo da mesma pessoa
  const REST_MIN_H = 11;
  const conflitos = useMemo(()=>{
    const porPessoa = {};
    escala.forEach(d=>d.t.forEach(([h,ps])=>ps.forEach(p=>{
      const [H,M]=h.split(":").map(Number);
      const start=new Date(`${d.d}T${String(H).padStart(2,"0")}:${String(M||0).padStart(2,"0")}:00`).getTime();
      (porPessoa[p[0]]=porPessoa[p[0]]||[]).push({start,end:start+8*3600e3,key:`${p[0]}|${d.d}|${h}`});
    })));
    const viol=new Set();
    Object.values(porPessoa).forEach(list=>{
      list.sort((a,b)=>a.start-b.start);
      for(let i=1;i<list.length;i++){
        const gapH=(list[i].start-list[i-1].end)/3600e3;
        if(gapH>=0 && gapH<REST_MIN_H) viol.add(list[i].key);
      }
    });
    return viol;
  },[escala]);

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
          {(()=>{ const nc=dia.t.reduce((n,[h,ps])=>n+ps.filter(p=>conflitos.has(`${p[0]}|${dia.d}|${h}`)).length,0);
            return nc>0 ? <div style={{fontFamily:"monospace",fontSize:9,color:C.danger,letterSpacing:".06em",marginTop:2}}>⚠ {nc} c/ descanso &lt; 11h</div> : null; })()}
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
                  const semDescanso = conflitos.has(`${p[0]}|${dia.d}|${h}`);
                  return (
                    <div key={pi} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,.03)",
                      border:`1px solid ${semDescanso?`${C.danger}88`:a.he?`${C.warning}88`:a.deslocado?`${C.cyan}66`:"rgba(255,255,255,.09)"}`,borderRadius:8,padding:"4px 7px"}}>
                      {semDescanso && <span title="descanso menor que 11h desde o turno anterior" style={{fontSize:11}}>⚠</span>}
                      {a.letra && <span style={{fontFamily:"monospace",fontSize:8.5,fontWeight:800,color:C.bg,background:LCOR[a.letra],borderRadius:4,padding:"0 4px"}}>{a.letra}</span>}
                      <button onClick={()=>setFicha({p, a, dia:dia.d, hora:h})} style={{background:"none",border:"none",padding:0,cursor:"pointer",fontSize:11.5,fontWeight:700,color:a.resolvido?C.white:C.textDim,textDecoration:a.resolvido?"none":"underline dotted"}}>{p[0]}</button>
                      {p[1] && <span style={{fontFamily:"monospace",fontSize:8.5,color:C.textDim}}>{p[1]}</span>}
                      {a.he && <span title="hora extra — veio na folga ou ficou além do horário" style={{fontFamily:"monospace",fontSize:8,fontWeight:800,color:C.warning,border:`1px solid ${C.warning}88`,borderRadius:4,padding:"0 4px"}}>HE</span>}
                      {a.deslocado && <span title="deslocado — inverteu/antecipou o horário da própria letra" style={{fontFamily:"monospace",fontSize:8,fontWeight:800,color:C.cyan,border:`1px solid ${C.cyan}66`,borderRadius:4,padding:"0 4px"}}>DESLOC</span>}
                      <button onClick={()=>removerPessoa(ti,pi)} style={{cursor:"pointer",background:"none",border:"none",color:C.danger,fontSize:12,padding:"0 2px",lineHeight:1}}>✕</button>
                    </div>
                  );
                })}
              </div>

              {addTurno===ti ? (
                <div style={{marginTop:8,padding:"8px",background:"rgba(0,0,0,.25)",borderRadius:8}}>
                  {(()=>{
                    const jaNoTurno = new Set(pessoas.map(x=>x[0].toUpperCase()));
                    const sug = PG_EQUIPE.filter(o=>o.tipo==="turnista" && o.letra===letraRot && !jaNoTurno.has(o.nome.toUpperCase())).slice(0,10);
                    return sug.length ? (
                      <div style={{marginBottom:8}}>
                        <div style={{fontFamily:"monospace",fontSize:9,color:C.textDim,letterSpacing:".08em",marginBottom:5}}>SUGESTÕES · rotação {letraRot}</div>
                        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                          {sug.map(o=>(
                            <button key={o.id||o.nome} onClick={()=>mut(d=>{ d.t[ti][1].push([o.nome]); })} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,.03)",border:`1px solid ${C.borderPG}`,borderRadius:14,padding:"3px 9px",color:C.white,fontSize:11}}>
                              <span style={{fontFamily:"monospace",fontSize:8,fontWeight:800,color:C.bg,background:LCOR[o.letra],borderRadius:3,padding:"0 3px"}}>{o.letra}</span>{o.nome}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                    <input list="nomes-equipe" value={novoNome} onChange={e=>setNovoNome(e.target.value)} placeholder="Nome"
                      style={{background:C.bg,border:`1px solid ${C.borderPG}`,color:C.white,borderRadius:7,padding:"7px 9px",fontSize:13,minWidth:130}}/>
                    <input value={novaFn} onChange={e=>setNovaFn(e.target.value)} placeholder="função (opcional)"
                      style={{background:C.bg,border:`1px solid ${C.borderPG}`,color:C.white,borderRadius:7,padding:"7px 9px",fontSize:13,flex:1,minWidth:120}}/>
                    <button onClick={()=>addPessoa(ti)} style={{cursor:"pointer",background:C.accent,color:C.bg,border:"none",borderRadius:7,padding:"7px 12px",fontSize:13,fontWeight:800}}>Add</button>
                    <button onClick={()=>{setAddTurno(null);setNovoNome("");setNovaFn("");}} style={{cursor:"pointer",background:"none",border:`1px solid ${C.borderPG}`,color:C.textDim,borderRadius:7,padding:"7px 10px",fontSize:13}}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <button onClick={()=>setAddTurno(ti)} style={{marginTop:8,background:"transparent",border:`1px dashed ${C.borderPG}`,color:C.textDim,borderRadius:8,padding:"6px 10px",fontSize:11,cursor:"pointer"}}>+ pessoa</button>
              )}
            </div>
          );
        })}
      </div>
      <datalist id="nomes-equipe">{NOMES.map(n=><option key={n} value={n}/>)}</datalist>
      {ficha && <FichaOperador ficha={ficha} onFechar={()=>setFicha(null)}/>}
    </>
  );
}

function navBtn(dis){ return { background:"rgba(255,255,255,.03)",border:`1px solid ${C.borderPG}`,color:dis?C.textDim:C.cyan,borderRadius:9,padding:"6px 14px",fontSize:15,cursor:dis?"default":"pointer" }; }

// ─── Ficha do operador (skill / treinamentos) ─────────────────────────────────
function FichaOperador({ ficha, onFechar }){
  const { p, a, dia, hora } = ficha;
  const op = resolverNome(p[0]);
  const sk = skillsDe(op);
  const linha = (k,v)=>(
    <div style={{display:"flex",justifyContent:"space-between",gap:10,padding:"7px 0",borderBottom:`1px solid rgba(255,255,255,.05)`}}>
      <span style={{fontFamily:"monospace",fontSize:10,color:C.textDim,letterSpacing:".06em"}}>{k}</span>
      <span style={{fontSize:12.5,fontWeight:700,color:C.white,textAlign:"right"}}>{v}</span>
    </div>
  );
  const sitLabel = a.he ? "HE — veio na folga" : a.deslocado ? "Deslocado — outro horário" : a.situacao==="externo" ? "Externo / apoio" : "No turno normal";
  const sitCor = a.he ? C.warning : a.deslocado ? C.cyan : a.situacao==="externo" ? C.textDim : C.accent;
  return (
    <div onClick={onFechar} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:70}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,width:"100%",maxWidth:460,maxHeight:"88vh",overflowY:"auto",borderRadius:"16px 16px 0 0",border:`1px solid ${C.borderPG}`,padding:"14px 18px 22px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {a.letra && <span style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:C.bg,background:LCOR[a.letra],borderRadius:5,padding:"2px 7px"}}>{a.letra}</span>}
            <h3 style={{margin:0,fontSize:17,color:C.white}}>{p[0]}</h3>
          </div>
          <button onClick={onFechar} style={{background:C.surface,border:`1px solid ${C.borderPG}`,color:C.textDim,width:28,height:28,borderRadius:7,cursor:"pointer"}}>✕</button>
        </div>

        {!op ? (
          <div style={{fontSize:13,color:C.textMuted,padding:"8px 0"}}>Operador não encontrado no registro do time. Cadastre-o na Gestão de Time para ver função e treinamentos.</div>
        ) : (
          <>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:`${sitCor}18`,border:`1px solid ${sitCor}66`,borderRadius:20,padding:"4px 11px",marginBottom:8}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:sitCor}}/>
              <span style={{fontSize:11.5,fontWeight:700,color:sitCor}}>{sitLabel}</span>
            </div>
            {linha("FUNÇÃO", sk.funcao)}
            {linha("HORÁRIO NESTE DIA", `${hora} · ${dia.split("-").reverse().slice(0,2).join("/")}`)}
            {linha("LETRA / TURMA", sk.letra || "—")}
            {linha("LOTAÇÃO", sk.lotacao)}
            {linha("OPERA H1 e H2", sk.operaAmbas ? "Sim (mesma função nas duas)" : `Somente ${sk.lotacao}`)}
            {p[1] && linha("ATIVIDADE", p[1])}

            <div style={{marginTop:12}}>
              <div style={{fontFamily:"monospace",fontSize:10,color:C.textDim,letterSpacing:".1em",marginBottom:7}}>TREINAMENTOS</div>
              {sk.treinamentos.length ? (
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {sk.treinamentos.map(t=>(
                    <span key={t} style={{background:"rgba(0,230,118,.1)",border:`1px solid ${C.accent}55`,color:C.accent,borderRadius:16,padding:"4px 11px",fontSize:11.5,fontWeight:700}}>{t}</span>
                  ))}
                </div>
              ) : <span style={{fontSize:12,color:C.textDim}}>Nenhum treinamento derivado para esta função.</span>}
            </div>
            <div style={{marginTop:12,fontSize:9.5,color:C.textDim,fontStyle:"italic"}}>Treinamentos derivados por função/tags. Validades individuais ainda não são cadastradas.</div>
          </>
        )}
      </div>
    </div>
  );
}
