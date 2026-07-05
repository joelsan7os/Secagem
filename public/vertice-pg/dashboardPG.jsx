// ─── dashboardPG.jsx — VÉRTICE PG · Dashboard de Gestão (organizadores) ──────
import { useState, useEffect } from "react";
import { db, doc, onSnapshot } from "../firebase";
import { collection } from "firebase/firestore";
import { PG_AREAS, PG_MAQUINAS, PG_DATA } from "./pgData";
import { PG_MARCOS, PG_ATIVIDADES, PG_AREAS_ATIV, PG_ESCALA } from "./pgPlano";
import { PG_PERIODO, PG_FACILITADORES, PG_LTS, PG_PREMISSAS, PG_MATERIAIS, PG_MAT_SEGURANCA, PG_RADIOS, PG_INSPECAO_TANQUES, PG_LIMPEZA } from "./pgBook";

const C = {
  bg:"#04111D", accent:"#00E676", cyan:"#00F0FF", blue:"#5090FF",
  warning:"#FFC107", danger:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880",
  borderPG:"rgba(80,144,255,0.22)",
};
const p2 = n => String(n).padStart(2,"0");
const dh = s => { const d = new Date(s); return `${p2(d.getDate())}/${p2(d.getMonth()+1)} ${p2(d.getHours())}:${p2(d.getMinutes())}`; };
const hm = s => { const d = new Date(s); return `${p2(d.getHours())}:${p2(d.getMinutes())}`; };
const pct = (f,t) => t ? Math.round((f/t)*100) : 0;
const slug = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-");
const docIdDe = (maq, area) => `${maq}__${slug(area)}`;
const CORMAQ = { MQ2:"#00F0FF", MQ3:"#00E676", GERAL:"#5090FF" };
const falta = ms => {
  const m = Math.max(0, ms);
  const d = Math.floor(m/86400000), h = Math.floor(m%86400000/3600000), mi = Math.floor(m%3600000/60000);
  return d ? `${d}d ${p2(h)}h` : h ? `${h}h ${p2(mi)}min` : `${mi}min`;
};

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
const feitosNoDoc = d => { if(!d||!d.itens) return 0; let n=0; for(const k in d.itens) if(d.itens[k].ok) n++; return n; };

function Barra({ f, t, h=6, cor }) {
  const v = pct(f,t);
  return (
    <div style={{height:h,borderRadius:h,background:"rgba(255,255,255,.07)",overflow:"hidden"}}>
      <div style={{width:`${v}%`,height:"100%",borderRadius:h,transition:"width .5s ease",
        background: cor || (v===100?C.accent:`linear-gradient(90deg,${C.accent},${C.cyan})`),
        boxShadow: v>0?`0 0 8px ${cor||C.cyan}66`:"none"}}/>
    </div>
  );
}

function Btn({ cor, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background:"rgba(255,255,255,.03)", border:`1px solid ${cor}55`, color:cor,
      borderRadius:9, padding:"6px 12px", fontSize:11.5, fontWeight:700,
      cursor:"pointer", letterSpacing:".04em", whiteSpace:"nowrap",
    }}>{children}</button>
  );
}

function Sec({ num, titulo, children }) {
  return (
    <div style={{background:"rgba(10,25,41,0.55)",backdropFilter:"blur(12px)",border:`1px solid ${C.borderPG}`,
      borderRadius:14,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:9,padding:"11px 15px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <span style={{fontFamily:"monospace",fontSize:10.5,fontWeight:700,color:C.textDim}}>{num}</span>
        <span style={{fontWeight:800,fontSize:13,letterSpacing:".05em"}}>{titulo}</span>
      </div>
      <div style={{padding:"11px 15px"}}>{children}</div>
    </div>
  );
}

const Linha = ({ l, r }) => (
  <div style={{display:"flex",justifyContent:"space-between",gap:10,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
    <span style={{fontSize:11.5,color:"#B5C6DA"}}>{l}</span>
    <span style={{fontSize:11.5,fontWeight:700,color:"#FFFFFF",textAlign:"right"}}>{r}</span>
  </div>
);

const Topico = ({ children }) => (
  <div style={{display:"flex",gap:7,padding:"3px 0",fontSize:11,color:"#B5C6DA",lineHeight:1.4}}>
    <span style={{color:"#00F0FF"}}>·</span><span>{children}</span>
  </div>
);

function TrilhoPG({ agora, pctExec, pctCheck }) {
  const [tocado, setTocado] = useState(null);
  const T0 = new Date("2026-04-15T12:00").getTime();
  const T1 = new Date("2026-05-04T12:00").getTime();
  const W = 1000, H = 252, RY = 140;
  const X = t => 42 + (Math.min(Math.max(t,T0),T1) - T0) / (T1 - T0) * (W - 84);
  const xNow = X(agora);
  const laneY = { MQ3:112, MQ2:176, GERAL:RY };
  const curto = t => t.length > 24 ? t.slice(0,23)+"…" : t;
  const nivel = {};
  PG_MARCOS.filter(m=>m[3]!=="MQ2").forEach((m,i)=>{ nivel[m[0]] = 54 + (i%3)*20; });
  PG_MARCOS.filter(m=>m[3]==="MQ2").forEach((m,i)=>{ nivel[m[0]] = 200 + (i%3)*20; });
  const prox = PG_MARCOS.find(m => new Date(m[2]||m[1]).getTime() >= agora);
  const proxIni = prox ? new Date(prox[1]).getTime() : null;
  const proxFim = prox ? new Date(prox[2]||prox[1]).getTime() : null;
  const dias = []; for(let t = new Date("2026-04-16T00:00").getTime(); t <= T1; t += 2*86400000) dias.push(t);
  const flip = xNow > W - 190;
  return (
    <div style={{background:"rgba(10,25,41,0.55)",backdropFilter:"blur(12px)",border:`1px solid ${C.borderPG}`,
      borderRadius:14,padding:"13px 16px 11px",marginBottom:16,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,
        background:`linear-gradient(90deg,${C.accent},${C.cyan},${C.blue})`,opacity:.8}}/>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
        <span style={{fontWeight:800,fontSize:13.5,letterSpacing:".05em"}}>TRILHO DA PG</span>
        <span style={{fontFamily:"monospace",fontSize:9.5,color:CORMAQ.MQ3,letterSpacing:".1em"}}>▲ MQ3</span>
        <span style={{fontFamily:"monospace",fontSize:9.5,color:CORMAQ.MQ2,letterSpacing:".1em"}}>▼ MQ2</span>
        <span style={{fontFamily:"monospace",fontSize:9.5,color:CORMAQ.GERAL,letterSpacing:".1em"}}>● GERAL</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:218,display:"block"}}>
        <defs>
          <linearGradient id="pgtg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.accent}/><stop offset=".55" stopColor={C.cyan}/><stop offset="1" stopColor={C.blue}/>
          </linearGradient>
        </defs>
        {/* janelas (marcos com duração) */}
        {PG_MARCOS.filter(m=>m[2]).map(m=>{
          const x1 = X(new Date(m[1]).getTime()), x2 = X(new Date(m[2]).getTime());
          const y = laneY[m[3]];
          const passado = agora > new Date(m[2]).getTime();
          return <rect key={"w"+m[0]} x={x1} y={y-8} width={Math.max(x2-x1,3)} height={16} rx={8}
            fill={CORMAQ[m[3]]} opacity={passado?0.07:0.14}/>;
        })}
        {/* trilho */}
        <line x1={42} y1={RY} x2={W-42} y2={RY} stroke="rgba(255,255,255,.09)" strokeWidth={4} strokeLinecap="round"/>
        <line x1={42} y1={RY} x2={xNow} y2={RY} stroke="url(#pgtg)" strokeWidth={4} strokeLinecap="round"/>
        {/* eixo de dias */}
        {dias.map(t=>(
          <g key={t}>
            <line x1={X(t)} y1={238} x2={X(t)} y2={243} stroke="rgba(255,255,255,.18)" strokeWidth={1}/>
            <text x={X(t)} y={250} textAnchor="middle" fill="#3A5880" fontFamily="monospace" fontSize={9}>{dh(t).slice(0,5)}</text>
          </g>
        ))}
        {/* marcos */}
        {PG_MARCOS.map(m=>{
          const [id,ini,fim,maqM,titulo] = m;
          const tIni = new Date(ini).getTime(), tFim = new Date(fim||ini).getTime();
          const x = X(tIni), y = laneY[maqM];
          const atual = agora>=tIni && agora<=tFim;
          const passado = agora>tFim;
          const ehProx = prox && prox[0]===id;
          const yl = nivel[id];
          const acima = maqM!=="MQ2";
          const ta = x<110 ? "start" : x>W-110 ? "end" : "middle";
          const mostrar = atual || ehProx || tocado===id;
          const txt = curto(titulo);
          const largura = Math.min(txt.length*5.1+10, 150);
          const cx0 = ta==="start" ? x : ta==="end" ? x-largura : x-largura/2;
          return (
            <g key={id} onClick={()=>setTocado(t=>t===id?null:id)} style={{cursor:"pointer"}}>
              <line x1={x} y1={acima? yl+3 : y} x2={x} y2={acima? y : yl-9}
                stroke={CORMAQ[maqM]} strokeWidth={1} opacity={mostrar?0.4:0.12}/>
              {mostrar && <rect x={cx0} y={acima?yl-10:yl-2} width={largura} height={14} rx={4}
                fill="#04111D" opacity={0.85}/>}
              {mostrar && <text x={x} y={yl} textAnchor={ta} fontFamily="monospace" fontSize={8.5}
                fill={ehProx?C.warning:atual?C.cyan:"#B5C6DA"}
                fontWeight={ehProx||atual?"800":"600"}
                style={atual?{animation:"pgblink 1.8s ease-in-out infinite"}:undefined}>{txt}</text>}
              {(atual||ehProx) && <circle cx={x} cy={y} r={11} fill="none" strokeWidth={1.5}
                stroke={atual?C.cyan:C.warning} style={{animation:"trava 1.4s ease-in-out infinite"}}/>}
              <circle cx={x} cy={y} r={ehProx?6:tocado===id?6:4.5}
                fill={passado?CORMAQ[maqM]:"#0A1929"}
                stroke={CORMAQ[maqM]} strokeWidth={1.5} opacity={passado?0.95:ehProx?1:0.6}/>
            </g>
          );
        })}
        {/* AGORA */}
        <line x1={xNow} y1={16} x2={xNow} y2={H-30} stroke={C.cyan} strokeWidth={1.5}
          style={{animation:"pgblink 1.8s ease-in-out infinite"}}/>
        <text x={flip?xNow-9:xNow+9} y={22} textAnchor={flip?"end":"start"} fill={C.cyan}
          fontFamily="monospace" fontSize={9.5} letterSpacing=".16em">AGORA</text>
        <text x={flip?xNow-9:xNow+9} y={44} textAnchor={flip?"end":"start"} fill={C.cyan}
          fontFamily="monospace" fontSize={24} fontWeight="800"
          style={{animation:"pgblink 1.8s ease-in-out infinite"}}>{pctExec}%</text>
      </svg>
      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginTop:2}}>
        <span style={{fontFamily:"monospace",fontSize:9.5,color:C.textDim,letterSpacing:".16em"}}>PRÓXIMA META</span>
        <span style={{width:8,height:8,borderRadius:"50%",background:C.warning,boxShadow:`0 0 8px ${C.warning}`,
          animation:"trava 1.4s ease-in-out infinite",flexShrink:0}}/>
        <span style={{fontSize:12.5,fontWeight:800,color:"#FFFFFF"}}>{prox?prox[4]:"PG concluída"}</span>
        {prox && <span style={{fontFamily:"monospace",fontSize:9,fontWeight:700,color:CORMAQ[prox[3]],
          border:`1px solid ${CORMAQ[prox[3]]}55`,borderRadius:4,padding:"1px 5px"}}>{prox[3]}</span>}
        {prox && <span style={{fontFamily:"monospace",fontSize:11,color:C.cyan}}>
          {agora < proxIni ? `faltam ${falta(proxIni-agora)}` : `em andamento · termina em ${falta(proxFim-agora)}`}
        </span>}
        <span style={{marginLeft:"auto",fontFamily:"monospace",fontSize:10,color:C.textDim}}>
          EXECUÇÃO <b style={{color:C.cyan}}>{pctExec}%</b> · CHECKLIST <b style={{color:C.accent}}>{pctCheck}%</b>
        </span>
      </div>
    </div>
  );
}

function CarrosselExec({ frentes }) {
  const [idx, setIdx] = useState(0);
  const [pausa, setPausa] = useState(false);
  useEffect(()=>{
    if(pausa || frentes.length<2) return;
    const t = setInterval(()=>setIdx(i=>(i+1)%frentes.length), 4000);
    return ()=>clearInterval(t);
  },[pausa, frentes.length]);
  const f = frentes[idx];
  if(!f) return null;
  const restam = f.total - f.feitas;
  return (
    <div>
      <div key={idx} onClick={()=>setPausa(p=>!p)} style={{
        background:"rgba(10,25,41,0.55)",backdropFilter:"blur(12px)",border:`1px solid ${C.borderPG}`,
        borderRadius:16,padding:"24px 28px",cursor:"pointer",position:"relative",overflow:"hidden",
        minHeight:330,animation:"slideIn .45s ease"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,
          background:`linear-gradient(90deg,${C.accent},${C.cyan},${C.blue})`,opacity:.85}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontFamily:"monospace",fontSize:10.5,color:C.textDim,letterSpacing:".18em"}}>
          <span>FRENTE {p2(idx+1)}/{p2(frentes.length)}</span>
          <span style={{color:pausa?C.warning:C.textDim}}>{pausa?"⏸ PAUSADO — toque para continuar":"● AUTO"}</span>
        </div>
        <div style={{fontSize:34,fontWeight:800,margin:"8px 0 18px",letterSpacing:".02em"}}>{f.ar}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:18}}>
          {[["FEITAS",f.feitas,C.accent],["EM ANDAMENTO",f.andamento,C.cyan],["RESTAM",restam,"#FFFFFF"],["ATRASADAS",f.atrasadas.length,f.atrasadas.length?C.danger:C.textDim]].map(([lab,v,cor])=>(
            <div key={lab} style={{textAlign:"center",border:`1px solid ${cor}33`,borderRadius:12,padding:"12px 6px",
              boxShadow: lab==="ATRASADAS"&&v?`0 0 16px ${C.danger}44`:"none"}}>
              <div style={{fontFamily:"monospace",fontSize:38,fontWeight:800,color:cor,lineHeight:1,
                animation: lab==="ATRASADAS"&&v?"trava 1.4s ease-in-out infinite":"none"}}>{v}</div>
              <div style={{fontFamily:"monospace",fontSize:9,color:C.textDim,letterSpacing:".16em",marginTop:6}}>{lab}</div>
            </div>
          ))}
        </div>
        <Barra f={f.feitas} t={f.total} h={9}/>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"14px 0 4px"}}>
          {f.porMaq.map(([m,fe,tt])=>(
            <span key={m} style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:CORMAQ[m],
              border:`1px solid ${CORMAQ[m]}44`,borderRadius:7,padding:"3px 9px"}}>{m} {fe}/{tt}</span>
          ))}
        </div>
        {f.atrasadas.slice(0,3).map(a=>(
          <div key={a[0]} style={{display:"flex",gap:8,alignItems:"center",marginTop:7}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:C.danger,boxShadow:`0 0 6px ${C.danger}`,flexShrink:0}}/>
            <span style={{fontSize:12.5,color:C.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              <b style={{color:CORMAQ[a[1]]}}>{a[1]}</b> · {a[3]}
            </span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:12}}>
        {frentes.map((x,i)=>(
          <span key={x.ar} onClick={()=>{setIdx(i);setPausa(true);}} style={{
            width:i===idx?22:8,height:8,borderRadius:8,cursor:"pointer",transition:"all .3s",
            background:i===idx?C.cyan:"rgba(255,255,255,.16)",
            boxShadow:i===idx?`0 0 8px ${C.cyan}`:"none"}}/>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPG({ onChecklist, onOperacao, onSair }) {
  const [estados, setEstados] = useState({});
  const [agora, setAgora] = useState(Date.now());
  const [aba, setAba] = useState(()=> Date.now() < new Date(PG_MARCOS[0][1]).getTime() ? "plan" : "exec");
  const [modoExec, setModoExec] = useState("comando");

  useEffect(()=>{
    const unsub = onSnapshot(collection(db,"pg_checklist_h2"), snap=>{
      const m = {}; snap.forEach(d=>{ m[d.id] = d.data(); });
      setEstados(m);
    }, ()=>{});
    const t = setInterval(()=>setAgora(Date.now()), 30000);
    return ()=>{ unsub(); clearInterval(t); };
  },[]);

  const ativEstado = (estados["plano_atividades"] && estados["plano_atividades"].ativ) || {};

  // Progresso do checklist por máquina
  const areasDe = m => PG_AREAS.filter(a=>PG_DATA[m] && PG_DATA[m][a]);
  let feitosGeral = 0; for(const k in estados) feitosGeral += feitosNoDoc(estados[k]);
  const feitosMaq = m => { let f=0; for(const a of areasDe(m)) f += feitosNoDoc(estados[docIdDe(m,a)]); return f; };

  // Status computado das atividades: pendente / andamento / concluida / atrasada / risco
  const statusAtiv = a => {
    const [id,,,,ini,fim] = a;
    const reg = ativEstado[id] || {};
    if(reg.st===2) return "concluida";
    if(!ini) return reg.st===1 ? "andamento" : "pendente";
    const tIni = new Date(ini).getTime(), tFim = new Date(fim||ini).getTime();
    if(agora > tFim) return "atrasada";
    if(reg.st!==1 && agora < tIni) return "pendente";
    const consumo = (agora - tIni) / Math.max(tFim - tIni, 1);
    if(reg.st===1 && consumo > 0.7) return "risco";
    return reg.st===1 ? "andamento" : "pendente";
  };

  const atrasadas = PG_ATIVIDADES.filter(a=>statusAtiv(a)==="atrasada");
  const emRisco = PG_ATIVIDADES.filter(a=>statusAtiv(a)==="risco");
  const criticasAndamento = PG_ATIVIDADES.filter(a=>a[7]===1 && statusAtiv(a)==="andamento");
  const concluidas = PG_ATIVIDADES.filter(a=>statusAtiv(a)==="concluida").length;
  const zonaAcao = [...atrasadas, ...emRisco, ...criticasAndamento].slice(0,8);

  const frentes = PG_AREAS_ATIV.map(ar=>{
    const acts = PG_ATIVIDADES.filter(a=>a[2]===ar);
    const st = acts.map(statusAtiv);
    return {
      ar, total: acts.length,
      feitas: st.filter(s=>s==="concluida").length,
      andamento: st.filter(s=>s==="andamento"||s==="risco").length,
      atrasadas: acts.filter((a,i)=>st[i]==="atrasada"),
      porMaq: ["MQ2","MQ3","GERAL"].map(m=>{
        const l = acts.filter(a=>a[1]===m);
        return [m, l.filter(a=>statusAtiv(a)==="concluida").length, l.length];
      }).filter(x=>x[2]>0),
    };
  });


  // Escala do turno atual
  const hojeISO = new Date(agora).toISOString().slice(0,10);
  const diaEscala = PG_ESCALA.find(e=>e.d===hojeISO);
  const horaAtual = new Date(agora).getHours();
  const turnoAtual = diaEscala ? diaEscala.t.slice().reverse().find(([h])=>horaAtual>=parseInt(h)) : null;

  const COR_ST = { atrasada:C.danger, risco:C.warning, andamento:C.cyan };
  const LABEL_ST = { atrasada:"ATRASADA", risco:"EM RISCO", andamento:"CRÍTICA · EM ANDAMENTO" };

  return (
    <div style={{minHeight:"100vh",background:"radial-gradient(80% 60% at 50% 0%,#0a1622,#04080e 70%,#01040a)",
      color:C.text,fontFamily:"system-ui,sans-serif",padding:"20px 24px 40px"}}>
      <style>{`@keyframes trava{0%,100%{opacity:1}50%{opacity:.4}}@keyframes slideIn{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:translateX(0)}}@keyframes pgblink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>

      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        <span style={{fontWeight:800,fontSize:20,letterSpacing:".24em"}}>VÉRTICE</span>
        <span style={{fontFamily:"monospace",fontWeight:800,fontSize:13,color:C.blue,letterSpacing:".14em",
          border:`1px solid ${C.blue}66`,borderRadius:5,padding:"1px 7px"}}>PG · DASHBOARD</span>
        <span style={{marginLeft:"auto",fontFamily:"monospace",fontSize:11,color:C.textDim}}>
          {new Date(agora).toLocaleString("pt-BR",{weekday:"short",day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}
        </span>
        {onChecklist && <Btn cor={C.cyan} onClick={onChecklist}>Checklist</Btn>}
        {onOperacao && <Btn cor={C.accent} onClick={onOperacao}>Operação</Btn>}
        {onSair && <Btn cor={C.danger} onClick={onSair}>Sair</Btn>}
      </div>

      {/* ── Abas ── */}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[["plan","01","PLANEJAMENTO"],["exec","02","EXECUÇÃO"],["pos","03","RETOMADA"]].map(([id,num,lab])=>(
          <button key={id} onClick={()=>setAba(id)} style={{
            flex:1, padding:"9px 6px", borderRadius:10, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            fontFamily:"monospace", fontSize:11.5, fontWeight:800, letterSpacing:".12em",
            border:`1.5px solid ${aba===id?C.cyan:"rgba(255,255,255,.1)"}`,
            background: aba===id ? "rgba(0,240,255,.08)" : "rgba(255,255,255,.02)",
            color: aba===id ? "#FFFFFF" : C.textDim,
            boxShadow: aba===id ? `0 0 14px rgba(0,240,255,.15)` : "none",
          }}>
            <span style={{color:aba===id?C.cyan:C.textDim}}>{num}</span>{lab}
          </button>
        ))}
      </div>

      {aba==="exec" && (<>
      <div style={{display:"flex",gap:8,marginBottom:14,maxWidth:360}}>
        {[["comando","MODO COMANDO"],["tv","MODO APRESENTAÇÃO"]].map(([id,lab])=>(
          <button key={id} onClick={()=>setModoExec(id)} style={{
            flex:1,padding:"7px 8px",borderRadius:9,cursor:"pointer",
            fontFamily:"monospace",fontSize:10,fontWeight:800,letterSpacing:".1em",
            border:`1.5px solid ${modoExec===id?C.blue:"rgba(255,255,255,.1)"}`,
            background:modoExec===id?"rgba(80,144,255,.1)":"rgba(255,255,255,.02)",
            color:modoExec===id?"#FFFFFF":C.textDim,
          }}>{lab}</button>
        ))}
      </div>

      {modoExec==="tv" ? <CarrosselExec frentes={frentes}/> : (<>
      <TrilhoPG agora={agora} pctExec={pct(concluidas, PG_ATIVIDADES.length)} pctCheck={pct(feitosGeral, TOTAIS.__geral)}/>
      {/* ── Termômetro geral ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
        {[["Máquina 2","MQ2"],["Máquina 3","MQ3"],["Geral","GERAL"]].map(([lab,m])=>{
          const f = m==="GERAL" ? feitosGeral : feitosMaq(m);
          const t = m==="GERAL" ? TOTAIS.__geral : TOTAIS[m].__total;
          return (
            <div key={m} style={{background:"rgba(10,25,41,0.55)",backdropFilter:"blur(12px)",
              border:`1px solid ${CORMAQ[m]}44`,borderRadius:14,padding:"14px 16px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:CORMAQ[m],opacity:.8}}/>
              <div style={{fontFamily:"monospace",fontSize:10,color:C.textDim,letterSpacing:".18em"}}>{lab.toUpperCase()}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:8,margin:"6px 0"}}>
                <span style={{fontFamily:"monospace",fontSize:28,fontWeight:800,color:CORMAQ[m]}}>{pct(f,t)}%</span>
                <span style={{fontFamily:"monospace",fontSize:11,color:C.textMuted}}>{f}/{t} itens</span>
              </div>
              <Barra f={f} t={t} h={7} cor={CORMAQ[m]}/>
            </div>
          );
        })}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:14}}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* ── Zona de Ação ── */}
          <div style={{background:"rgba(10,25,41,0.55)",backdropFilter:"blur(12px)",border:`1px solid ${C.danger}44`,
            borderRadius:14,overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"11px 15px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:C.danger,boxShadow:`0 0 8px ${C.danger}`,
                animation:"trava 1.4s ease-in-out infinite"}}/>
              <span style={{fontWeight:800,fontSize:13.5,letterSpacing:".05em"}}>ZONA DE AÇÃO</span>
              <span style={{marginLeft:"auto",fontFamily:"monospace",fontSize:11,color:C.textDim}}>{zonaAcao.length} itens</span>
            </div>
            {zonaAcao.length===0 && (
              <div style={{padding:"18px 15px",fontSize:12.5,color:C.textMuted,fontFamily:"monospace"}}>Nenhuma pendência crítica no momento.</div>
            )}
            {zonaAcao.map((a,i)=>{
              const [id,maqA,areaA,titulo,ini,fim,resp,cc] = a;
              const st = statusAtiv(a);
              return (
                <div key={id} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 15px",
                  borderBottom: i<zonaAcao.length-1?"1px solid rgba(255,255,255,.05)":"none"}}>
                  <div style={{width:3,alignSelf:"stretch",borderRadius:2,background:COR_ST[st],flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12.5,fontWeight:700,color:C.white,lineHeight:1.3}}>{titulo}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4,fontFamily:"monospace",fontSize:9}}>
                      <span style={{fontWeight:800,color:COR_ST[st]}}>{LABEL_ST[st]}</span>
                      <span style={{color:CORMAQ[maqA]}}>{maqA}</span>
                      <span style={{color:C.textDim}}>{areaA}</span>
                      {ini && <span style={{color:C.textDim}}>janela {hm(ini)}→{hm(fim||ini)}</span>}
                      {resp && <span style={{color:C.textDim}}>{resp}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* ── Escala do turno atual ── */}
          <div style={{background:"rgba(10,25,41,0.55)",backdropFilter:"blur(12px)",border:`1px solid ${C.borderPG}`,
            borderRadius:14,overflow:"hidden"}}>
            <div style={{padding:"11px 15px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
              <span style={{fontWeight:800,fontSize:13.5}}>ESCALA · TURNO ATUAL</span>
              {turnoAtual && <span style={{marginLeft:8,fontFamily:"monospace",fontSize:10,color:C.cyan}}>entrada {turnoAtual[0]}</span>}
            </div>
            <div style={{padding:"12px 15px",display:"flex",gap:6,flexWrap:"wrap"}}>
              {!turnoAtual && <span style={{fontSize:11.5,color:C.textDim,fontFamily:"monospace"}}>Sem escala para agora.</span>}
              {turnoAtual && turnoAtual[1].map((p,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,.03)",border:`1px solid ${p[2]?`${C.blue}66`:"rgba(255,255,255,.09)"}`,
                  borderRadius:8,padding:"4px 8px",display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:11,fontWeight:700}}>{p[0]}</span>
                  {p[1] && <span style={{fontFamily:"monospace",fontSize:8,color:C.textDim}}>{p[1]}</span>}
                  {p[2] && <span style={{fontFamily:"monospace",fontSize:7.5,fontWeight:800,color:C.blue,
                    border:`1px solid ${C.blue}66`,borderRadius:4,padding:"0 3px"}}>HE</span>}
                </div>
              ))}
            </div>
          </div>
          {/* ── Concluídas ── */}
          <div style={{background:"rgba(0,230,118,.06)",border:`1px solid ${C.accent}44`,borderRadius:14,padding:"12px 15px",
            display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:12,fontWeight:700,color:C.textMuted}}>ATIVIDADES CONCLUÍDAS</span>
            <span style={{fontFamily:"monospace",fontSize:18,fontWeight:800,color:C.accent}}>{concluidas}/{PG_ATIVIDADES.length}</span>
          </div>
        </div>
      </div>
      </>)}
      </>)}

      {/* ── Aba Planejamento ── */}
      {aba==="plan" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Sec num="01" titulo="PERÍODO E FACILITADORES">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              {[["MQ3",PG_PERIODO.MQ3],["MQ2",PG_PERIODO.MQ2]].map(([m,p])=>(
                <div key={m} style={{border:`1px solid ${CORMAQ[m]}44`,borderRadius:10,padding:"8px 10px"}}>
                  <div style={{fontFamily:"monospace",fontSize:9.5,color:CORMAQ[m],letterSpacing:".14em"}}>{m} · {p.ini} → {p.fim}</div>
                  <div style={{fontFamily:"monospace",fontSize:11.5,fontWeight:800,color:"#FFFFFF",marginTop:3}}>Parada {p.parada}</div>
                </div>
              ))}
            </div>
            {PG_FACILITADORES.map(([l,r])=><Linha key={l} l={l} r={r}/>)}
          </Sec>
          <Sec num="02" titulo="LIBERAÇÕES DE TRABALHO E BLOQUEIO">
            {PG_LTS.map(([l,r])=><Linha key={l} l={l} r={r}/>)}
            <div style={{fontFamily:"monospace",fontSize:9.5,color:C.textDim,marginTop:9,lineHeight:1.5}}>
              LTs centralizadas no responsável ou, na falta, no operador do horário.
            </div>
          </Sec>
          <Sec num="03" titulo="PREMISSAS · MÁQUINA 3">
            <div style={{fontFamily:"monospace",fontSize:9.5,color:CORMAQ.MQ3,letterSpacing:".14em",marginBottom:4}}>PRÉ-PARADA</div>
            {PG_PREMISSAS.MQ3.pre.map((t,i)=><Topico key={i}>{t}</Topico>)}
            <div style={{fontFamily:"monospace",fontSize:9.5,color:CORMAQ.MQ3,letterSpacing:".14em",margin:"9px 0 4px"}}>PARADA</div>
            {PG_PREMISSAS.MQ3.parada.map((t,i)=><Topico key={i}>{t}</Topico>)}
          </Sec>
          <Sec num="04" titulo="PREMISSAS · MÁQUINA 2">
            <div style={{fontFamily:"monospace",fontSize:9.5,color:CORMAQ.MQ2,letterSpacing:".14em",marginBottom:4}}>PRÉ-PARADA</div>
            {PG_PREMISSAS.MQ2.pre.map((t,i)=><Topico key={i}>{t}</Topico>)}
            <div style={{fontFamily:"monospace",fontSize:9.5,color:CORMAQ.MQ2,letterSpacing:".14em",margin:"9px 0 4px"}}>PARADA</div>
            {PG_PREMISSAS.MQ2.parada.map((t,i)=><Topico key={i}>{t}</Topico>)}
          </Sec>
          <Sec num="05" titulo="MATERIAIS, SEGURANÇA E RÁDIOS">
            {PG_MATERIAIS.map((t,i)=><Topico key={i}>{t}</Topico>)}
            <div style={{fontFamily:"monospace",fontSize:9.5,color:C.warning,letterSpacing:".14em",margin:"9px 0 4px"}}>SEGURANÇA</div>
            {PG_MAT_SEGURANCA.map((t,i)=><Topico key={i}>{t}</Topico>)}
            <div style={{fontFamily:"monospace",fontSize:9.5,color:C.blue,letterSpacing:".14em",margin:"9px 0 4px"}}>RÁDIOS</div>
            {PG_RADIOS.map((t,i)=><Topico key={i}>{t}</Topico>)}
          </Sec>
          <Sec num="06" titulo="INSPEÇÃO E LIMPEZA">
            <div style={{fontFamily:"monospace",fontSize:9.5,color:C.cyan,letterSpacing:".14em",marginBottom:4}}>TANQUES PARA INSPEÇÃO</div>
            {PG_INSPECAO_TANQUES.map((t,i)=><Topico key={i}>{t}</Topico>)}
            <div style={{fontFamily:"monospace",fontSize:9.5,color:C.cyan,letterSpacing:".14em",margin:"9px 0 4px"}}>PLANO DE LIMPEZA</div>
            {PG_LIMPEZA.map((t,i)=><Topico key={i}>{t}</Topico>)}
          </Sec>
        </div>
      )}

      {/* ── Aba Pós-execução ── */}
      {aba==="pos" && (
        <div style={{display:"flex",flexDirection:"column",gap:14,maxWidth:760}}>
          <Sec num="01" titulo="CHECKLIST DE RETOMADA · PROGRESSO">
            {[["Máquina 2","MQ2"],["Máquina 3","MQ3"],["Geral","GERAL"]].map(([lab,m])=>{
              const f = m==="GERAL" ? feitosGeral : feitosMaq(m);
              const t = m==="GERAL" ? TOTAIS.__geral : TOTAIS[m].__total;
              return (
                <div key={m} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:4}}>
                    <span style={{fontWeight:700,color:"#FFFFFF"}}>{lab}</span>
                    <span style={{fontFamily:"monospace",color:CORMAQ[m]}}>{f}/{t} · {pct(f,t)}%</span>
                  </div>
                  <Barra f={f} t={t} h={7} cor={CORMAQ[m]}/>
                </div>
              );
            })}
            <div style={{fontFamily:"monospace",fontSize:9.5,color:C.textDim,margin:"10px 0 6px",letterSpacing:".1em"}}>POR ÁREA</div>
            <div style={{display:"flex",flexDirection:"column",gap:9,maxHeight:280,overflowY:"auto"}}>
              {["MQ2","MQ3","COMUM"].filter(m=>PG_DATA[m]).flatMap(m=>areasDe(m).map(a=>{
                const f2 = feitosNoDoc(estados[docIdDe(m,a)]);
                const t2 = TOTAIS[m][a];
                return (
                  <div key={m+a}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                      <span style={{color:C.white,fontWeight:600}}>{a} <span style={{color:CORMAQ[m],fontFamily:"monospace",fontSize:9}}>{m}</span></span>
                      <span style={{fontFamily:"monospace",color:C.textMuted}}>{f2}/{t2}</span>
                    </div>
                    <Barra f={f2} t={t2} h={5}/>
                  </div>
                );
              }))}
            </div>
            <div style={{fontFamily:"monospace",fontSize:9.5,color:C.textDim,margin:"14px 0 10px",lineHeight:1.5}}>
              Alimentado pelos operadores de área conforme os equipamentos são liberados na retomada.
            </div>
            {onChecklist && (
              <button onClick={onChecklist} style={{
                width:"100%",padding:"11px",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:13,
                border:`1.5px solid ${C.cyan}`,background:"rgba(0,240,255,.08)",color:"#FFFFFF",
                boxShadow:"0 0 14px rgba(0,240,255,.18)",letterSpacing:".05em",
              }}>ABRIR CHECKLIST DE RETOMADA</button>
            )}
          </Sec>
        </div>
      )}
    </div>
  );
}
