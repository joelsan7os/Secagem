// ─── pg.jsx — VÉRTICE PG · Checklist de Partida (Parada Geral) ────────────────
import { useState, useEffect } from "react";
import { db, doc, setDoc, onSnapshot } from "./firebase";
import { collection } from "firebase/firestore";
import { usePerfilAtivo } from "./auth";
import { PG_AREAS, PG_MAQUINAS, PG_DATA } from "./pgData";

// ─── Paleta (mesmos tokens do app) ───────────────────────────────────────────
const C = {
  bg:"#04111D", surface:"#071828", card:"#0A1929",
  accent:"#00E676", cyan:"#00F0FF", blue:"#5090FF",
  warning:"#FFC107", danger:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880", white:"#ffffff",
  border:"rgba(60,255,140,0.15)", borderPG:"rgba(80,144,255,0.22)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const slug = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-");
const docIdDe = (maq, area) => `${maq}__${slug(area)}`;
const p2 = n => String(n).padStart(2,"0");
const hora = ts => { const d = new Date(ts); return `${p2(d.getDate())}/${p2(d.getMonth()+1)} ${p2(d.getHours())}:${p2(d.getMinutes())}`; };
const pct = (f,t) => t ? Math.round((f/t)*100) : 0;

// Totais estáticos por máquina/área (calculados uma vez do PG_DATA)
const TOTAIS = (()=>{
  const t = { __geral:0 };
  for(const m in PG_DATA){
    t[m] = { __total:0 };
    for(const a in PG_DATA[m]){
      const n = PG_DATA[m][a].reduce((s,e)=>s+e.itens.length,0);
      t[m][a] = n; t[m].__total += n; t.__geral += n;
    }
  }
  return t;
})();

const feitosNoDoc = d => {
  if(!d || !d.itens) return 0;
  let n = 0; for(const k in d.itens) if(d.itens[k].ok) n++;
  return n;
};
const feitosEq = (d, eq) => {
  if(!d || !d.itens) return 0;
  let n = 0; for(const [id] of eq.itens) if(d.itens[id] && d.itens[id].ok) n++;
  return n;
};

// ─── Componentes visuais ──────────────────────────────────────────────────────
function Barra({ f, t, h=6 }) {
  const v = pct(f,t);
  return (
    <div style={{height:h,borderRadius:h,background:"rgba(255,255,255,.07)",overflow:"hidden"}}>
      <div style={{
        width:`${v}%`, height:"100%", borderRadius:h, transition:"width .4s ease",
        background: v===100 ? C.accent : `linear-gradient(90deg,${C.accent},${C.cyan})`,
        boxShadow: v>0 ? `0 0 8px ${v===100?C.accent:C.cyan}66` : "none",
      }}/>
    </div>
  );
}

function MarcaPG() {
  return (
    <svg viewBox="0 0 48 44" style={{width:26,height:24,overflow:"visible"}} aria-label="Vértice PG">
      <defs>
        <linearGradient id="pgvxA" gradientUnits="userSpaceOnUse" x1="24" y1="4" x2="4" y2="40">
          <stop offset="0" stopColor="#00E676"/><stop offset="1" stopColor="#00F0FF"/>
        </linearGradient>
        <linearGradient id="pgvxB" gradientUnits="userSpaceOnUse" x1="4" y1="40" x2="44" y2="40">
          <stop offset="0" stopColor="#00F0FF"/><stop offset="1" stopColor="#5090FF"/>
        </linearGradient>
        <linearGradient id="pgvxC" gradientUnits="userSpaceOnUse" x1="44" y1="40" x2="24" y2="4">
          <stop offset="0" stopColor="#5090FF"/><stop offset="1" stopColor="#00E676"/>
        </linearGradient>
      </defs>
      <path d="M24,4 L4,40" stroke="url(#pgvxA)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M4,40 L44,40" stroke="url(#pgvxB)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M44,40 L24,4" stroke="url(#pgvxC)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="24" cy="28" r="3.4" fill="#00F0FF" style={{filter:"drop-shadow(0 0 4px #00F0FF)"}}/>
    </svg>
  );
}

function BtnTopo({ cor, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background:"rgba(255,255,255,.03)", border:`1px solid ${cor}55`, color:cor,
      borderRadius:9, padding:"6px 11px", fontSize:11, fontWeight:700,
      cursor:"pointer", letterSpacing:".04em", whiteSpace:"nowrap",
    }}>{children}</button>
  );
}

function Voltar({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:7, background:"none", border:"none",
      color:C.textMuted, fontSize:13, fontWeight:700, cursor:"pointer", padding:"4px 0",
    }}>
      <span style={{color:C.cyan,fontSize:17,lineHeight:1}}>‹</span>{children}
    </button>
  );
}

function CardNav({ num, titulo, sub, f, t, extra, onClick }) {
  const done = t>0 && f===t;
  return (
    <div onClick={onClick} style={{
      background:"rgba(10,25,41,0.55)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
      border:`1px solid ${done?"rgba(0,230,118,.35)":C.borderPG}`, borderRadius:14,
      padding:"13px 15px", cursor:"pointer", position:"relative", overflow:"hidden",
    }}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,
        background:done?C.accent:`linear-gradient(90deg,${C.accent},${C.cyan},${C.blue})`,opacity:.8}}/>
      <div style={{display:"flex",alignItems:"center",gap:11}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:C.textDim,fontWeight:700,minWidth:20}}>{num}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:14,fontWeight:800,color:done?C.accent:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{titulo}</div>
            {done && <span style={{color:C.accent,fontSize:13}}>✓</span>}
          </div>
          {sub && <div style={{fontSize:10.5,color:C.textDim,marginTop:2,fontFamily:"monospace"}}>{sub}</div>}
          {extra}
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:done?C.accent:C.cyan}}>{f}/{t}</div>
          <div style={{fontFamily:"monospace",fontSize:9.5,color:C.textDim}}>{pct(f,t)}%</div>
        </div>
        <span style={{color:C.textDim,fontSize:16}}>›</span>
      </div>
      <div style={{marginTop:10}}><Barra f={f} t={t}/></div>
    </div>
  );
}

// ─── App PG ───────────────────────────────────────────────────────────────────
export default function PGApp() {
  const { perfil, logout } = usePerfilAtivo();
  const [estados, setEstados] = useState({});
  const [maq, setMaq] = useState(null);
  const [area, setArea] = useState(null);
  const [eqI, setEqI] = useState(null);

  useEffect(()=>{
    const unsub = onSnapshot(collection(db,"pg_checklist_h2"), snap=>{
      const m = {}; snap.forEach(d=>{ m[d.id] = d.data(); });
      setEstados(m);
    }, ()=>{});
    return ()=>unsub();
  },[]);

  const irOperacao = ()=>{ localStorage.setItem("vertice_modo","operacao"); location.reload(); };
  const sair = ()=>{ localStorage.setItem("vertice_modo","operacao"); logout(); location.reload(); };

  if(!perfil) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.textMuted,fontFamily:"monospace",fontSize:12,padding:24,textAlign:"center"}}>
      Sessão encerrada. Recarregue para entrar novamente.
    </div>
  );

  const dId = maq && area ? docIdDe(maq,area) : null;
  const dDoc = dId ? estados[dId] : null;

  const marcar = (id, atual)=>{
    setDoc(doc(db,"pg_checklist_h2",dId),{
      itens:{ [id]: { ok: atual?0:1, op:perfil.nome, m:perfil.matricula, ts:Date.now() } },
      upd:Date.now(),
    },{merge:true}).catch(()=>{});
  };
  const assumir = ()=>{
    setDoc(doc(db,"pg_checklist_h2",dId),{ resp:{ nome:perfil.nome, m:perfil.matricula, ts:Date.now() } },{merge:true}).catch(()=>{});
  };
  const liberar = ()=>{
    setDoc(doc(db,"pg_checklist_h2",dId),{ resp:null },{merge:true}).catch(()=>{});
  };

  // Progresso geral
  let feitosGeral = 0; for(const k in estados) feitosGeral += feitosNoDoc(estados[k]);

  const areasDe = m => PG_AREAS.filter(a=>PG_DATA[m] && PG_DATA[m][a]);
  const eqs = maq && area ? PG_DATA[maq][area] : null;
  const eq = eqs && eqI!=null ? eqs[eqI] : null;
  const rotuloMaq = m => (PG_MAQUINAS.find(x=>x[0]===m)||[m,m])[1];

  return (
    <div style={{minHeight:"100vh",background:"radial-gradient(80% 60% at 50% 0%,#0a1622,#04080e 70%,#01040a)",color:C.text,fontFamily:"system-ui,sans-serif"}}>
      <style>{`@keyframes pgLed{0%,100%{opacity:1}50%{opacity:.45}}`}</style>

      {/* Linha LED topo — identidade PG */}
      <div style={{position:"fixed",top:0,left:0,right:0,height:3,zIndex:10,
        background:`linear-gradient(90deg,transparent,${C.accent} 25%,${C.cyan} 50%,${C.blue} 75%,transparent)`,
        boxShadow:`0 0 16px 2px ${C.blue}`,animation:"pgLed 2.4s ease-in-out infinite"}}/>

      {/* Header */}
      <div style={{position:"sticky",top:0,zIndex:9,background:"rgba(4,17,29,.88)",backdropFilter:"blur(10px)",
        WebkitBackdropFilter:"blur(10px)",borderBottom:`1px solid ${C.borderPG}`,padding:"12px 16px 10px"}}>
        <div style={{display:"flex",alignItems:"center",gap:9,maxWidth:640,margin:"0 auto"}}>
          <MarcaPG/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"baseline",gap:7}}>
              <span style={{fontWeight:800,fontSize:15,letterSpacing:".26em"}}>VÉRTICE</span>
              <span style={{fontFamily:"monospace",fontWeight:800,fontSize:12,color:C.blue,letterSpacing:".14em",
                border:`1px solid ${C.blue}66`,borderRadius:5,padding:"1px 6px"}}>PG</span>
            </div>
            <div style={{fontFamily:"monospace",fontSize:9.5,color:C.textDim,letterSpacing:".08em",marginTop:2,
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {perfil.nome} · {feitosGeral}/{TOTAIS.__geral} ITENS · {pct(feitosGeral,TOTAIS.__geral)}%
            </div>
          </div>
          <BtnTopo cor={C.accent} onClick={irOperacao}>Operação</BtnTopo>
          <BtnTopo cor={C.danger} onClick={sair}>Sair</BtnTopo>
        </div>
      </div>

      <div style={{maxWidth:640,margin:"0 auto",padding:"16px 16px 48px",display:"flex",flexDirection:"column",gap:10}}>

        {/* ── Nível 1: máquinas ── */}
        {!maq && (<>
          <div style={{background:"rgba(10,25,41,0.55)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
            border:`1px solid ${C.borderPG}`,borderRadius:14,padding:"14px 16px",marginBottom:4}}>
            <div style={{fontFamily:"monospace",fontSize:10,color:C.textDim,letterSpacing:".22em",marginBottom:8}}>CHECKLIST DE PARTIDA · PROGRESSO GERAL</div>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:10}}>
              <span style={{fontFamily:"monospace",fontSize:26,fontWeight:800,color:C.cyan}}>{pct(feitosGeral,TOTAIS.__geral)}%</span>
              <span style={{fontFamily:"monospace",fontSize:11,color:C.textMuted}}>{feitosGeral} de {TOTAIS.__geral} itens</span>
            </div>
            <Barra f={feitosGeral} t={TOTAIS.__geral} h={8}/>
          </div>
          {PG_MAQUINAS.map(([m,label],i)=>{
            if(!PG_DATA[m]) return null;
            let f = 0; for(const a of areasDe(m)) f += feitosNoDoc(estados[docIdDe(m,a)]);
            return <CardNav key={m} num={p2(i+1)} titulo={label} sub={`${areasDe(m).length} ÁREAS`}
              f={f} t={TOTAIS[m].__total} onClick={()=>setMaq(m)}/>;
          })}
        </>)}

        {/* ── Nível 2: áreas ── */}
        {maq && !area && (<>
          <Voltar onClick={()=>setMaq(null)}>Máquinas</Voltar>
          <div style={{fontSize:17,fontWeight:800,margin:"2px 0 6px"}}>{rotuloMaq(maq)}</div>
          {areasDe(maq).map((a,i)=>{
            const d = estados[docIdDe(maq,a)];
            const resp = d && d.resp;
            return <CardNav key={a} num={p2(i+1)} titulo={a}
              sub={resp ? `● ${resp.nome}` : "SEM RESPONSÁVEL"}
              f={feitosNoDoc(d)} t={TOTAIS[maq][a]} onClick={()=>setArea(a)}/>;
          })}
        </>)}

        {/* ── Nível 3: equipamentos ── */}
        {maq && area && !eq && (<>
          <Voltar onClick={()=>setArea(null)}>{rotuloMaq(maq)}</Voltar>
          <div style={{background:"rgba(10,25,41,0.55)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
            border:`1px solid ${C.borderPG}`,borderRadius:14,padding:"13px 15px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:800}}>{area}</div>
                <div style={{fontFamily:"monospace",fontSize:10,color:C.textDim,marginTop:2}}>
                  {rotuloMaq(maq).toUpperCase()} · {feitosNoDoc(dDoc)}/{TOTAIS[maq][area]} ITENS
                </div>
              </div>
              {dDoc && dDoc.resp && dDoc.resp.m===perfil.matricula
                ? <BtnTopo cor={C.warning} onClick={liberar}>Liberar</BtnTopo>
                : <BtnTopo cor={C.cyan} onClick={assumir}>Assumir área</BtnTopo>}
            </div>
            <div style={{fontFamily:"monospace",fontSize:10.5,color:dDoc && dDoc.resp?C.cyan:C.textDim,marginBottom:9}}>
              {dDoc && dDoc.resp ? `RESPONSÁVEL: ${dDoc.resp.nome} · desde ${hora(dDoc.resp.ts)}` : "ÁREA SEM RESPONSÁVEL — assuma para coordenar"}
            </div>
            <Barra f={feitosNoDoc(dDoc)} t={TOTAIS[maq][area]} h={7}/>
          </div>
          {eqs.map((e,i)=>{
            const f = feitosEq(dDoc, e);
            return <CardNav key={e.tag+i} num={p2(i+1)} titulo={e.local||e.tag}
              sub={e.tag} f={f} t={e.itens.length} onClick={()=>setEqI(i)}/>;
          })}
        </>)}

        {/* ── Nível 4: itens ── */}
        {eq && (<>
          <Voltar onClick={()=>setEqI(null)}>{area}</Voltar>
          <div style={{background:"rgba(10,25,41,0.55)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
            border:`1px solid ${C.borderPG}`,borderRadius:14,padding:"13px 15px"}}>
            <div style={{fontSize:15.5,fontWeight:800}}>{eq.local||"Equipamento"}</div>
            <div style={{fontFamily:"monospace",fontSize:10.5,color:C.textDim,marginTop:3,marginBottom:9}}>
              {eq.tag} · {feitosEq(dDoc,eq)}/{eq.itens.length} ITENS
            </div>
            <Barra f={feitosEq(dDoc,eq)} t={eq.itens.length} h={7}/>
          </div>
          <div style={{background:"rgba(10,25,41,0.45)",border:`1px solid ${C.borderPG}`,borderRadius:14,overflow:"hidden"}}>
            {eq.itens.map(([id,texto],i)=>{
              const reg = dDoc && dDoc.itens ? dDoc.itens[id] : null;
              const ok = reg && reg.ok===1;
              return (
                <div key={id} onClick={()=>marcar(id, ok?1:0)} style={{
                  display:"flex",gap:12,alignItems:"flex-start",padding:"13px 14px",cursor:"pointer",
                  borderBottom: i<eq.itens.length-1 ? "1px solid rgba(255,255,255,.05)" : "none",
                  background: ok ? "rgba(0,230,118,.05)" : "transparent",
                }}>
                  <div style={{
                    width:26,height:26,borderRadius:8,flexShrink:0,marginTop:1,
                    border:`2px solid ${ok?C.accent:"rgba(255,255,255,.22)"}`,
                    background: ok?C.accent:"transparent",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    color:"#04111D",fontWeight:900,fontSize:15,
                    boxShadow: ok?`0 0 10px ${C.accent}55`:"none", transition:"all .15s",
                  }}>{ok?"✓":""}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13.5,lineHeight:1.35,color:ok?C.textMuted:C.white}}>{texto}</div>
                    {reg && (
                      <div style={{fontFamily:"monospace",fontSize:9.5,color:ok?C.accent:C.textDim,marginTop:4,opacity:.85}}>
                        {ok?"OK":"DESFEITO"} · {reg.op} · {hora(reg.ts)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>)}

      </div>
    </div>
  );
}
