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

export default function DashboardPG({ onChecklist, onOperacao, onSair }) {
  const [estados, setEstados] = useState({});
  const [agora, setAgora] = useState(Date.now());
  const [aba, setAba] = useState(()=> Date.now() < new Date(PG_MARCOS[0][1]).getTime() ? "plan" : "exec");

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

  // Marcos: passados / agora / próximos
  const idxAgora = PG_MARCOS.findIndex(m => agora <= new Date(m[2]||m[1]).getTime());
  const janela = PG_MARCOS.slice(Math.max(0,idxAgora-1), idxAgora+4);

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
      <style>{`@keyframes trava{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

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
        {[["plan","01","PLANEJAMENTO"],["exec","02","EXECUÇÃO"],["pos","03","PÓS-EXECUÇÃO"]].map(([id,num,lab])=>(
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

          {/* ── Linha do Tempo ── */}
          <div style={{background:"rgba(10,25,41,0.55)",backdropFilter:"blur(12px)",border:`1px solid ${C.borderPG}`,
            borderRadius:14,overflow:"hidden"}}>
            <div style={{padding:"11px 15px",borderBottom:"1px solid rgba(255,255,255,.06)",fontWeight:800,fontSize:13.5}}>LINHA DO TEMPO</div>
            <div style={{display:"flex",overflowX:"auto",gap:0,padding:"14px 15px"}}>
              {janela.map((m,i)=>{
                const [id,ini,fim,maqM,titulo] = m;
                const tIni = new Date(ini).getTime(), tFim = fim?new Date(fim).getTime():tIni;
                const atual = agora>=tIni && agora<=tFim;
                const passado = agora>tFim;
                return (
                  <div key={id} style={{minWidth:150,flexShrink:0,padding:"0 12px",borderLeft: i>0?"1px solid rgba(255,255,255,.08)":"none"}}>
                    <div style={{width:10,height:10,borderRadius:"50%",margin:"0 auto 6px",
                      background: atual?C.cyan:passado?C.accent:"rgba(255,255,255,.18)",
                      boxShadow: atual?`0 0 10px ${C.cyan}`:"none"}}/>
                    <div style={{fontFamily:"monospace",fontSize:9.5,color:atual?C.cyan:C.textDim,textAlign:"center"}}>{dh(ini)}</div>
                    <div style={{fontSize:11,fontWeight:700,textAlign:"center",marginTop:3,color:passado?C.textMuted:C.white,lineHeight:1.25}}>{titulo}</div>
                    <div style={{textAlign:"center",marginTop:4}}>
                      <span style={{fontFamily:"monospace",fontSize:8,fontWeight:700,color:CORMAQ[maqM],
                        border:`1px solid ${CORMAQ[maqM]}55`,borderRadius:4,padding:"0 4px"}}>{maqM}</span>
                    </div>
                  </div>
                );
              })}
            </div>
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

          {/* ── Progresso do Checklist por área ── */}
          <div style={{background:"rgba(10,25,41,0.55)",backdropFilter:"blur(12px)",border:`1px solid ${C.borderPG}`,
            borderRadius:14,overflow:"hidden",flex:1}}>
            <div style={{padding:"11px 15px",borderBottom:"1px solid rgba(255,255,255,.06)",fontWeight:800,fontSize:13.5}}>CHECKLIST POR ÁREA</div>
            <div style={{padding:"10px 15px",display:"flex",flexDirection:"column",gap:9,maxHeight:340,overflowY:"auto"}}>
              {["MQ2","MQ3","COMUM"].filter(m=>PG_DATA[m]).flatMap(m=>areasDe(m).map(a=>{
                const f = feitosNoDoc(estados[docIdDe(m,a)]);
                const t = TOTAIS[m][a];
                return (
                  <div key={m+a}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                      <span style={{color:C.white,fontWeight:600}}>{a} <span style={{color:CORMAQ[m],fontFamily:"monospace",fontSize:9}}>{m}</span></span>
                      <span style={{fontFamily:"monospace",color:C.textMuted}}>{f}/{t}</span>
                    </div>
                    <Barra f={f} t={t} h={5}/>
                  </div>
                );
              }))}
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
            <div style={{fontFamily:"monospace",fontSize:9.5,color:C.textDim,margin:"6px 0 10px",lineHeight:1.5}}>
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
