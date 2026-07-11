// ─── salaBloqueio.jsx — VÉRTICE PG · Sala de Bloqueio ─
// Gestão das caixas de travamento da PG: bloqueio/desbloqueio por caixa e por
// cartão, cadeados pessoais, progresso geral. Seed = pgBloqueioData; estado
// vivo (overlay) em pg_bloqueio_h2/estado. Independente das demais telas.
import { useState, useEffect, useMemo } from "react";
import { db, doc, setDoc, onSnapshot } from "../firebase";
import { BLOQUEIO_CAIXAS } from "./pgBloqueioData";

const C = {
  bg:"#04111D", card:"#0A1929", surface:"#071828",
  accent:"#00E676", cyan:"#00F0FF", blue:"#5090FF", warning:"#FFC107", danger:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880", borderPG:"rgba(80,144,255,0.22)",
  cinza:"#8A93A0", vermelho:"#D32F2F",
};
const GRUPOS=["M2","M3","COMUM"];
const GCOR={M2:C.cyan, M3:C.accent, COMUM:C.blue};

// estado de caixa: "aberta" (cinza) -> "bloqueada" (vermelha) -> "desbloqueada" (verde)
const ST={aberta:{cor:C.cinza,lab:"ABERTA"},bloqueada:{cor:C.vermelho,lab:"BLOQUEADA"},desbloqueada:{cor:C.accent,lab:"DESBLOQUEADA"}};

export default function SalaBloqueio(){
  const [ov,setOv]=useState({caixas:{},caixasExtras:[]});   // overlay Firestore
  const [grupo,setGrupo]=useState("M2");
  const [sel,setSel]=useState(null);                         // id da caixa aberta
  const [novoCad,setNovoCad]=useState("");
  const [novoCartao,setNovoCartao]=useState(null);           // {desc,tag,ccm,gaveta} | null
  const [novaCaixa,setNovaCaixa]=useState(null);             // {nome} | null

  useEffect(()=>{
    const unsub=onSnapshot(doc(db,"pg_bloqueio_h2","estado"),snap=>{
      const d=snap.data(); if(d) setOv({caixas:d.caixas||{},caixasExtras:d.caixasExtras||[]});
    },()=>{});
    return unsub;
  },[]);
  const persist=n=>{ setOv(n); setDoc(doc(db,"pg_bloqueio_h2","estado"),{...n,ts:Date.now()}).catch(()=>{}); };
  const upCx=(id,patch)=>persist({...ov,caixas:{...ov.caixas,[id]:{...(ov.caixas[id]||{}),...patch}}});

  // caixas = seed + extras − removidas
  const caixas=useMemo(()=>{
    const seed=BLOQUEIO_CAIXAS.map(c=>({...c}));
    const extras=(ov.caixasExtras||[]).map(c=>({...c,extra:true}));
    return [...seed,...extras].filter(c=>!(ov.caixas[c.id]||{}).removida);
  },[ov]);

  // cartões efetivos de uma caixa (seed − removidos + extras)
  const cartoesDe=cx=>{
    const st=ov.caixas[cx.id]||{};
    const rem=new Set(st.cartoesRemovidos||[]);
    const base=(cx.cartoes||[]).filter(c=>!rem.has(c.id));
    return [...base,...(st.cartoesExtras||[]).map((c,i)=>({...c,id:"x"+i,extra:true}))];
  };
  const bloqueado=(cxId,cartaoId)=>!!((ov.caixas[cxId]||{}).cartoes||{})[cartaoId];

  // progresso geral
  const stats=useMemo(()=>{
    let bl=0,db_=0,ab=0,cartTot=0,cartBl=0;
    caixas.forEach(cx=>{
      const s=(ov.caixas[cx.id]||{}).status||"aberta";
      if(s==="bloqueada")bl++; else if(s==="desbloqueada")db_++; else ab++;
      const cs=cartoesDe(cx); cartTot+=cs.length;
      cs.forEach(c=>{ if(bloqueado(cx.id,c.id)) cartBl++; });
    });
    return {bl,db:db_,ab,cartTot,cartBl};
  },[caixas,ov]);

  const doGrupo=caixas.filter(cx=> grupo==="COMUM"
    ? cartoesDe(cx).some(c=>c.grupo==="COMUM")
    : cx.grupo===grupo);

  const cxSel=caixas.find(c=>c.id===sel);

  // ações
  const bloquearCaixa=cx=>{ // marca caixa + todos os cartões
    const todos={}; cartoesDe(cx).forEach(c=>todos[c.id]={b:1,ts:Date.now()});
    upCx(cx.id,{status:"bloqueada",cartoes:todos});
  };
  const desbloquearCaixa=cx=>upCx(cx.id,{status:"desbloqueada",cartoes:{}});
  const toggleCartao=(cx,c)=>{
    const st=ov.caixas[cx.id]||{}; const cur={...(st.cartoes||{})};
    if(cur[c.id]) delete cur[c.id]; else cur[c.id]={b:1,ts:Date.now()};
    // status derivado: algum cartão -> bloqueada; nenhum -> mantém desbloqueada se já foi, senão aberta
    const n=Object.keys(cur).length;
    upCx(cx.id,{cartoes:cur,status:n>0?"bloqueada":(st.status==="desbloqueada"?"desbloqueada":"aberta")});
  };
  const addCadeado=cx=>{ if(!novoCad.trim())return;
    const st=ov.caixas[cx.id]||{}; upCx(cx.id,{cadeados:[...(st.cadeados||[]),novoCad.trim().toUpperCase()]}); setNovoCad(""); };
  const rmCadeado=(cx,i)=>{ const st=ov.caixas[cx.id]||{}; const l=[...(st.cadeados||[])]; l.splice(i,1); upCx(cx.id,{cadeados:l}); };
  const rmCartao=(cx,c)=>{
    const st=ov.caixas[cx.id]||{};
    if(c.extra){ const ex=[...(st.cartoesExtras||[])]; ex.splice(Number(String(c.id).slice(1)),1); upCx(cx.id,{cartoesExtras:ex}); }
    else upCx(cx.id,{cartoesRemovidos:[...(st.cartoesRemovidos||[]),c.id]});
  };
  const addCartao=cx=>{ if(!novoCartao?.desc?.trim())return;
    const st=ov.caixas[cx.id]||{};
    const g=/^31[-/]/.test(novoCartao.tag||"")?"COMUM":/^33[-/]/.test(novoCartao.tag||"")?"M3":/^32[-/]/.test(novoCartao.tag||"")?"M2":cx.grupo;
    upCx(cx.id,{cartoesExtras:[...(st.cartoesExtras||[]),{...novoCartao,grupo:g}]}); setNovoCartao(null); };
  const addCaixa=()=>{ if(!novaCaixa?.nome?.trim())return;
    const id="extra_"+Date.now();
    persist({...ov,caixasExtras:[...(ov.caixasExtras||[]),{id,nome:novaCaixa.nome.trim(),origem:grupo==="COMUM"?"M2":grupo,grupo:grupo==="COMUM"?"M2":grupo,cartoes:[]}]});
    setNovaCaixa(null); };
  const rmCaixa=cx=>{ upCx(cx.id,{removida:true}); setSel(null); };

  const inp={background:C.bg,border:`1px solid ${C.borderPG}`,color:"#fff",borderRadius:7,padding:"7px 9px",fontSize:12.5};

  return (
    <>
      {/* progresso geral */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
        {[["CAIXAS BLOQUEADAS",stats.bl,C.vermelho],["DESBLOQUEADAS",stats.db,C.accent],
          ["ABERTAS",stats.ab,C.cinza],["CARTÕES APLICADOS",`${stats.cartBl}/${stats.cartTot}`,C.cyan]].map(([lab,v,cor])=>(
          <div key={lab} style={{flex:"1 1 120px",background:"rgba(10,25,41,.55)",border:`1px solid ${C.borderPG}`,borderTop:`2px solid ${cor}`,borderRadius:10,padding:"8px 10px",textAlign:"center"}}>
            <div style={{fontFamily:"monospace",fontSize:17,fontWeight:800,color:cor}}>{v}</div>
            <div style={{fontFamily:"monospace",fontSize:8.5,color:C.textDim,letterSpacing:".1em"}}>{lab}</div>
          </div>
        ))}
      </div>

      {/* seletor de grupo */}
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {GRUPOS.map(g=>(
          <button key={g} onClick={()=>{setGrupo(g);setSel(null);}} style={{flex:1,padding:"9px 0",borderRadius:9,cursor:"pointer",
            fontFamily:"monospace",fontSize:12,fontWeight:800,letterSpacing:".12em",
            border:`1.5px solid ${grupo===g?GCOR[g]:C.borderPG}`,
            background:grupo===g?"rgba(0,240,255,.06)":"transparent",color:grupo===g?GCOR[g]:C.textDim}}>{g}</button>
        ))}
      </div>

      {/* grade de caixas 3D */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12}}>
        {doGrupo.map(cx=>{
          const st=(ov.caixas[cx.id]||{}).status||"aberta";
          const cads=((ov.caixas[cx.id]||{}).cadeados||[]).length;
          const cs=cartoesDe(cx); const nb=cs.filter(c=>bloqueado(cx.id,c.id)).length;
          const nComum=cs.filter(c=>c.grupo==="COMUM").length;
          return (
            <button key={cx.id} onClick={()=>setSel(sel===cx.id?null:cx.id)} style={{
              background:sel===cx.id?"rgba(0,240,255,.05)":"rgba(10,25,41,.45)",
              border:`1px solid ${sel===cx.id?C.cyan:C.borderPG}`,borderRadius:12,padding:"12px 8px 9px",cursor:"pointer",color:"#fff"}}>
              <Caixa3D cor={ST[st].cor} cadeados={cads}/>
              <div style={{fontSize:11,fontWeight:700,marginTop:8,lineHeight:1.15,minHeight:26}}>{cx.nome}</div>
              <div style={{fontFamily:"monospace",fontSize:8.5,color:ST[st].cor,letterSpacing:".08em",marginTop:3}}>{ST[st].lab}</div>
              <div style={{fontFamily:"monospace",fontSize:8.5,color:C.textDim,marginTop:2}}>
                {nb}/{cs.length} cartões{grupo==="COMUM"&&nComum?` · ${nComum} comuns`:""}{cads?` · ${cads} 🔒`:""}
              </div>
            </button>
          );
        })}
        {/* add caixa */}
        {novaCaixa ? (
          <div style={{border:`1px dashed ${C.borderPG}`,borderRadius:12,padding:10,display:"flex",flexDirection:"column",gap:6}}>
            <input autoFocus style={inp} placeholder="Nome da caixa" value={novaCaixa.nome} onChange={e=>setNovaCaixa({nome:e.target.value})}/>
            <div style={{display:"flex",gap:6}}>
              <button onClick={addCaixa} style={{flex:1,background:C.accent,border:"none",color:C.bg,borderRadius:7,padding:"7px 0",fontWeight:800,cursor:"pointer",fontSize:12}}>Add</button>
              <button onClick={()=>setNovaCaixa(null)} style={{flex:1,background:"none",border:`1px solid ${C.borderPG}`,color:C.textDim,borderRadius:7,cursor:"pointer",fontSize:12}}>Cancelar</button>
            </div>
          </div>
        ):(
          <button onClick={()=>setNovaCaixa({nome:""})} style={{border:`1px dashed ${C.borderPG}`,background:"transparent",color:C.textDim,borderRadius:12,minHeight:120,cursor:"pointer",fontSize:12}}>+ Adicionar caixa</button>
        )}
      </div>

      {/* painel da caixa selecionada */}
      {cxSel && (()=>{
        const st=ov.caixas[cxSel.id]||{}; const status=st.status||"aberta";
        const cs=cartoesDe(cxSel); const nb=cs.filter(c=>bloqueado(cxSel.id,c.id)).length;
        return (
          <div style={{marginTop:14,background:"rgba(10,25,41,.55)",border:`1px solid ${C.borderPG}`,borderLeft:`3px solid ${ST[status].cor}`,borderRadius:12,padding:"12px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontSize:15,fontWeight:800}}>{cxSel.nome} <span style={{fontFamily:"monospace",fontSize:9,color:GCOR[cxSel.grupo]}}>{cxSel.grupo}</span></div>
                <div style={{fontFamily:"monospace",fontSize:9.5,color:C.textDim}}>{nb}/{cs.length} cartões aplicados · {ST[status].lab}</div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <button onClick={()=>bloquearCaixa(cxSel)} style={{background:C.vermelho,border:"none",color:"#fff",borderRadius:8,padding:"8px 12px",fontWeight:800,fontSize:11.5,cursor:"pointer"}}>BLOQUEAR CAIXA</button>
                <button onClick={()=>desbloquearCaixa(cxSel)} style={{background:C.accent,border:"none",color:C.bg,borderRadius:8,padding:"8px 12px",fontWeight:800,fontSize:11.5,cursor:"pointer"}}>DESBLOQUEAR</button>
                <button onClick={()=>rmCaixa(cxSel)} style={{background:"none",border:`1px solid ${C.danger}55`,color:C.danger,borderRadius:8,padding:"8px 10px",fontSize:11.5,cursor:"pointer"}}>Remover caixa</button>
              </div>
            </div>

            {/* cadeados pessoais */}
            <div style={{marginTop:10,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              <span style={{fontFamily:"monospace",fontSize:9,color:C.warning,letterSpacing:".1em"}}>CADEADOS:</span>
              {(st.cadeados||[]).map((n,i)=>(
                <span key={i} style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(255,193,7,.1)",border:`1px solid ${C.warning}55`,borderRadius:14,padding:"3px 9px",fontSize:11}}>
                  🔒 {n} <button onClick={()=>rmCadeado(cxSel,i)} style={{background:"none",border:"none",color:C.danger,cursor:"pointer",fontSize:11,padding:0}}>✕</button>
                </span>
              ))}
              <input style={{...inp,width:130}} placeholder="nome" value={novoCad} onChange={e=>setNovoCad(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCadeado(cxSel)}/>
              <button onClick={()=>addCadeado(cxSel)} style={{background:"rgba(255,193,7,.15)",border:`1px solid ${C.warning}66`,color:C.warning,borderRadius:7,padding:"6px 10px",fontSize:11,cursor:"pointer"}}>+ cadeado</button>
            </div>

            {/* cartões */}
            <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:4,maxHeight:340,overflowY:"auto"}}>
              {cs.map(c=>{
                const b=bloqueado(cxSel.id,c.id);
                return (
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.02)",
                    border:`1px solid ${b?`${C.vermelho}66`:"rgba(255,255,255,.07)"}`,borderRadius:8,padding:"6px 9px"}}>
                    <button onClick={()=>toggleCartao(cxSel,c)} title={b?"desbloquear cartão":"bloquear cartão"} style={{
                      width:30,height:22,borderRadius:5,border:"none",cursor:"pointer",fontFamily:"monospace",fontSize:9,fontWeight:800,
                      background:b?C.vermelho:"rgba(255,255,255,.08)",color:b?"#fff":C.textDim}}>{b?"BLQ":"—"}</button>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11.5,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.desc||"(sem descrição)"}</div>
                      <div style={{fontFamily:"monospace",fontSize:9,color:C.textDim}}>
                        {c.tag}{c.ccm?` · CCM ${c.ccm}`:""}{c.gaveta?` · ${c.gaveta}`:""}
                      </div>
                    </div>
                    <span style={{fontFamily:"monospace",fontSize:8.5,fontWeight:800,color:GCOR[c.grupo]||C.textDim}}>{c.grupo}</span>
                    <button onClick={()=>rmCartao(cxSel,c)} style={{background:"none",border:"none",color:C.danger,cursor:"pointer",fontSize:12}}>✕</button>
                  </div>
                );
              })}
            </div>

            {/* add cartão */}
            {novoCartao ? (
              <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap",background:"rgba(0,0,0,.25)",borderRadius:8,padding:8}}>
                <input style={{...inp,flex:2,minWidth:150}} placeholder="Descrição" value={novoCartao.desc||""} onChange={e=>setNovoCartao({...novoCartao,desc:e.target.value})}/>
                <input style={{...inp,width:120}} placeholder="TAG" value={novoCartao.tag||""} onChange={e=>setNovoCartao({...novoCartao,tag:e.target.value})}/>
                <input style={{...inp,width:130}} placeholder="CCM" value={novoCartao.ccm||""} onChange={e=>setNovoCartao({...novoCartao,ccm:e.target.value})}/>
                <input style={{...inp,width:80}} placeholder="Gaveta" value={novoCartao.gaveta||""} onChange={e=>setNovoCartao({...novoCartao,gaveta:e.target.value})}/>
                <button onClick={()=>addCartao(cxSel)} style={{background:C.accent,border:"none",color:C.bg,borderRadius:7,padding:"7px 12px",fontWeight:800,fontSize:12,cursor:"pointer"}}>Add</button>
                <button onClick={()=>setNovoCartao(null)} style={{background:"none",border:`1px solid ${C.borderPG}`,color:C.textDim,borderRadius:7,padding:"7px 10px",fontSize:12,cursor:"pointer"}}>Cancelar</button>
              </div>
            ):(
              <button onClick={()=>setNovoCartao({desc:""})} style={{marginTop:8,background:"transparent",border:`1px dashed ${C.borderPG}`,color:C.textDim,borderRadius:8,padding:"7px 12px",fontSize:11,cursor:"pointer"}}>+ cartão</button>
            )}
          </div>
        );
      })()}
    </>
  );
}

// ─── Caixa de travamento em 3D (CSS puro) ─────────────────────────────────────
function Caixa3D({ cor, cadeados=0 }){
  const dark=shade(cor,-28), darker=shade(cor,-45);
  return (
    <div style={{width:120,height:86,margin:"0 auto",position:"relative",transformStyle:"preserve-3d",
      transform:"rotateX(58deg) rotateZ(-38deg)",transformOrigin:"50% 60%"}}>
      {/* corpo */}
      <div style={{position:"absolute",width:110,height:56,left:5,top:26,background:cor,borderRadius:5,
        transform:"translateZ(0px)",boxShadow:"0 0 0 1px rgba(0,0,0,.25) inset"}}/>
      {/* face frontal */}
      <div style={{position:"absolute",width:110,height:34,left:5,top:82,background:dark,borderRadius:"0 0 6px 6px",
        transform:"rotateX(-90deg)",transformOrigin:"top"}}/>
      {/* face lateral */}
      <div style={{position:"absolute",width:34,height:56,left:115,top:26,background:darker,borderRadius:"0 6px 6px 0",
        transform:"rotateY(90deg)",transformOrigin:"left"}}/>
      {/* tampa com furos */}
      <div style={{position:"absolute",width:110,height:56,left:5,top:26,transform:"translateZ(10px)",
        background:shade(cor,10),borderRadius:5,display:"grid",gridTemplateColumns:"repeat(6,1fr)",
        alignItems:"center",justifyItems:"center",padding:"6px 8px",boxSizing:"border-box",gap:2}}>
        {Array.from({length:12}).map((_,i)=>(
          <span key={i} style={{width:8,height:8,borderRadius:2,background:"rgba(0,0,0,.45)"}}/>
        ))}
      </div>
      {/* alça */}
      <div style={{position:"absolute",width:56,height:12,left:32,top:14,transform:"translateZ(22px)",
        background:"#151A21",borderRadius:6,boxShadow:"0 2px 0 #000 inset"}}/>
      {/* cadeados pendurados */}
      {cadeados>0 && (
        <div style={{position:"absolute",left:10,top:96,transform:"rotateX(-58deg) rotateZ(38deg)",display:"flex",gap:3}}>
          {Array.from({length:Math.min(cadeados,5)}).map((_,i)=>(
            <span key={i} style={{fontSize:13,filter:"drop-shadow(0 1px 1px #000)"}}>🔒</span>
          ))}
          {cadeados>5 && <span style={{fontFamily:"monospace",fontSize:10,color:"#FFC107",fontWeight:800}}>+{cadeados-5}</span>}
        </div>
      )}
    </div>
  );
}
function shade(hex,pct){
  const n=parseInt(hex.slice(1),16);
  const f=v=>Math.max(0,Math.min(255,Math.round(v+(pct/100)*255)));
  return "#"+[f(n>>16&255),f(n>>8&255),f(n&255)].map(v=>v.toString(16).padStart(2,"0")).join("");
}
