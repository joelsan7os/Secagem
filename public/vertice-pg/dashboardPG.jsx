// ─── dashboardPG.jsx — VÉRTICE PG · Dashboard de Gestão (organizadores) ──────
import { useState, useEffect } from "react";
import { db, doc, setDoc, onSnapshot } from "../firebase";
import { collection } from "firebase/firestore";
import { usePerfilAtivo } from "../auth";
import { PG_AREAS, PG_MAQUINAS, PG_DATA } from "./pgData";
import { PG_MARCOS, PG_ATIVIDADES, PG_AREAS_ATIV, PG_ESCALA } from "./pgPlano";
import { PG_CENARIOS, PG_TEMPOS_LIB } from "./pgTempos";
import { PG_PERIODO, PG_FACILITADORES, PG_LTS, PG_PREMISSAS, PG_MATERIAIS, PG_MAT_SEGURANCA, PG_RADIOS, PG_INSPECAO_TANQUES, PG_LIMPEZA } from "./pgBook";
import EquipeTela from "./equipeTela";
import EscalaTela from "./escalaTela";
import SalaBloqueio from "./salaBloqueio";
import { gerarCronograma, envelopePeriodo, atividadesDoDia } from "./pgCronograma";
import { PG_BIBLIOTECA } from "./pgBiblioteca";

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
const LIB_MAP = Object.fromEntries(PG_TEMPOS_LIB.map(([nome,dur])=>[slug(nome), dur]));
const CORMAQ = { MQ2:"#00F0FF", MQ3:"#00E676", GERAL:"#5090FF" };
const cronBtn = { cursor:"pointer", background:"rgba(255,255,255,.05)", border:`1px solid ${C.borderPG}`, color:C.cyan, borderRadius:5, width:22, height:22, fontSize:12, lineHeight:1, padding:0 };
const campoS = { width:"100%",boxSizing:"border-box",padding:"6px 9px",borderRadius:7,
  background:"rgba(255,255,255,.04)",border:"1px solid rgba(80,144,255,.3)",
  color:"#FFFFFF",fontSize:11,fontFamily:"monospace",outline:"none" };
const btnOk = { fontFamily:"monospace",fontSize:10,fontWeight:800,color:"#04111D",background:"#00E676",
  border:"none",borderRadius:7,padding:"4px 10px",cursor:"pointer" };
const btnX = { fontFamily:"monospace",fontSize:10,color:"#B5C6DA",background:"none",
  border:"1px solid rgba(255,255,255,.18)",borderRadius:7,padding:"4px 10px",cursor:"pointer" };
const durMin = hhmm => { const [h,m] = hhmm.split(":").map(Number); return h*60+m; };
const sugestaoDur = titulo => {
  const chave = slug(titulo);
  const exata = LIB_MAP[chave];
  if(exata) return exata;
  const achado = PG_TEMPOS_LIB.find(([nome])=> slug(nome).includes(chave) || chave.includes(slug(nome)));
  return achado ? achado[1] : null;
};
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

function TrilhoPG({ agora, pctExec, pctCheck, marcos }) {
  const PG_MARCOS = marcos;
  const [tocado, setTocado] = useState(null);
  const T0 = new Date("2026-04-15T12:00").getTime();
  const T1 = new Date("2026-05-04T12:00").getTime();
  const W = 1000, H = 340;
  const VX = W - 60, VY = 190;            // ponto de fuga (futuro afunda aqui)
  const X0 = 60, Y0 = 250;                // presente (perto, base)
  const prog = t => (Math.min(Math.max(t,T0),T1) - T0) / (T1 - T0);
  const dep = t => Math.pow(prog(t), 0.72);            // profundidade 0..1
  const esc = d => 1 - d * 0.82;                        // escala por profundidade
  const pt = (t, alt=0) => {
    const d = dep(t), k = esc(d);
    const bx = X0 + (VX - X0) * d;
    const by = Y0 + (VY - Y0) * d;
    const serp = Math.sin(prog(t) * Math.PI * 3.2) * 26 * k;
    return [bx, by + serp - alt * 44 * k, k, d];
  };
  const xNow = pt(agora)[0];
  const curto = t => t.length > 22 ? t.slice(0,21)+"…" : t;
  const altBase = { MQ3:1, GERAL:0.35, MQ2:-0.35 };
  const alt3 = [1, 0, -1];
  const prox = PG_MARCOS.find(m => new Date(m[2]||m[1]).getTime() >= agora);
  const proxIni = prox ? new Date(prox[1]).getTime() : null;
  const proxFim = prox ? new Date(prox[2]||prox[1]).getTime() : null;
  const dias = []; for(let t = new Date("2026-04-16T00:00").getTime(); t <= T1; t += 2*86400000) dias.push(t);
  const via = [];
  for(let i=0;i<=60;i++){ const t = T0 + (T1-T0)*i/60; const [x,y,k] = pt(t); via.push([x,y,k]); }
  const bordaSup = via.map(([x,y,k])=>`${x.toFixed(1)},${(y-10*k).toFixed(1)}`).join(" ");
  const bordaInf = via.slice().reverse().map(([x,y,k])=>`${x.toFixed(1)},${(y+10*k).toFixed(1)}`).join(" ");
  const eixo = via.map(([x,y],i)=>`${i?"L":"M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const dNow = dep(agora);
  const flip = dNow > 0.7;
  // cascata anti-colisão: nível de haste calculado por sobreposição horizontal real
  const layout = {};
  {
    const grupos = [PG_MARCOS.filter(m=>m[3]!=="MQ2"), PG_MARCOS.filter(m=>m[3]==="MQ2")];
    for(const lista of grupos){
      const ocupado = [];
      for(const m of lista){
        const x = pt(new Date(m[1]).getTime())[0];
        const txt = curto(m[4]);
        const larg = Math.min(txt.length*8.6*0.6+16, 172);
        const ta = x < 90 ? "start" : x > W-larg ? "end" : "middle";
        const x1 = ta==="start" ? x : ta==="end" ? x-larg : x-larg/2;
        let nv = 0;
        while(nv < 6 && (ocupado[nv]||[]).some(([a,b])=> x1 < b+10 && x1+larg > a-10)) nv++;
        (ocupado[nv] = ocupado[nv]||[]).push([x1, x1+larg]);
        layout[m[0]] = { nv, x1, larg, ta };
      }
    }
  }
  return (
    <div style={{background:"rgba(10,25,41,0.55)",backdropFilter:"blur(12px)",border:`1px solid ${C.borderPG}`,
      borderRadius:14,padding:"13px 16px 11px",marginBottom:16,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,
        background:`linear-gradient(90deg,${C.accent},${C.cyan},${C.blue})`,opacity:.8}}/>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
        <span style={{fontFamily:"monospace",fontSize:10.5,fontWeight:700,color:C.textDim}}>02</span>
        <span style={{fontWeight:800,fontSize:13.5,letterSpacing:".05em"}}>TRILHO DA PG</span>
        <span style={{fontFamily:"monospace",fontSize:9.5,color:CORMAQ.MQ3,letterSpacing:".1em"}}>▲ MQ3</span>
        <span style={{fontFamily:"monospace",fontSize:9.5,color:CORMAQ.MQ2,letterSpacing:".1em"}}>▼ MQ2</span>
        <span style={{fontFamily:"monospace",fontSize:9.5,color:CORMAQ.GERAL,letterSpacing:".1em"}}>● GERAL</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:270,display:"block"}}>
        <defs>
          <linearGradient id="pgroad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.accent} stopOpacity=".5"/>
            <stop offset=".55" stopColor={C.cyan} stopOpacity=".28"/>
            <stop offset="1" stopColor={C.blue} stopOpacity=".05"/>
          </linearGradient>
          <linearGradient id="pgedge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.cyan} stopOpacity=".7"/>
            <stop offset="1" stopColor={C.blue} stopOpacity=".08"/>
          </linearGradient>
          <radialGradient id="pgvanish" cx={VX/W} cy={VY/H} r=".5">
            <stop offset="0" stopColor={C.blue} stopOpacity=".28"/>
            <stop offset="1" stopColor={C.blue} stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* brilho no ponto de fuga */}
        <rect x="0" y="0" width={W} height={H} fill="url(#pgvanish)"/>

        {/* pista com volume (2.5D) */}
        <polygon points={`${bordaSup} ${bordaInf}`} fill="url(#pgroad)"/>
        <path d={eixo} fill="none" stroke="url(#pgedge)" strokeWidth="2" strokeDasharray="1 9" strokeLinecap="round" opacity=".5"/>
        {/* trecho já percorrido (presente→agora), aceso */}
        {(()=>{
          const perc = via.filter((_,i)=> (T0+(T1-T0)*i/60) <= agora);
          if(perc.length<2) return null;
          const dpath = perc.map(([x,y],i)=>`${i?"L":"M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
          return <path d={dpath} fill="none" stroke="url(#pgedge)" strokeWidth="3.5" strokeLinecap="round"/>;
        })()}

        {/* travessas de dia (perspectiva) */}
        {dias.map(t=>{
          const [x,y,k] = pt(t);
          return (
            <g key={t}>
              <line x1={x} y1={y-10*k} x2={x} y2={y+10*k} stroke="rgba(255,255,255,.14)" strokeWidth={k*1.2}/>
              {k>0.45 && <text x={x} y={y+10*k+11*k+3} textAnchor="middle" fill="#3A5880"
                fontFamily="monospace" fontSize={9*k}>{dh(t).slice(0,5)}</text>}
            </g>
          );
        })}

        {/* marcos com profundidade e altura alternada */}
        {PG_MARCOS.map((m,idx)=>{
          const [id,ini,fim,maqM,titulo] = m;
          const tIni = new Date(ini).getTime(), tFim = new Date(fim||ini).getTime();
          const alt = altBase[maqM] + alt3[idx%3]*0.5;
          const [x,y,k,d] = pt(tIni, alt);
          const atual = agora>=tIni && agora<=tFim;
          const passado = agora>tFim;
          const ehProx = prox && prox[0]===id;
          const r = (ehProx?7:5.5) * (0.55+0.45*k);
          const op = passado?0.9:ehProx?1:0.4+0.5*k;
          const txt = curto(titulo);
          const cor = CORMAQ[maqM];
          const corTxt = ehProx?C.warning:atual?C.cyan:"#C7D6E6";
          const acima = maqM!=="MQ2";
          const fs = 8.6, chipH = 22;
          const { nv, x1:chipX, larg, ta } = layout[id];
          const hasteLen = (acima ? 20 : 16) + nv*27;
          const chipY = acima ? y - hasteLen - chipH : y + hasteLen;
          const hAncora = acima ? chipY+chipH : chipY;
          const dim = passado && !atual && !ehProx;
          return (
            <g key={id} onClick={()=>setTocado(tt=>tt===id?null:id)} style={{cursor:"pointer",opacity:dim?0.6:1}}>
              <line x1={x} y1={y} x2={x} y2={hAncora} stroke={cor} strokeWidth={1} opacity={0.5}/>
              <g style={ehProx?{filter:`drop-shadow(0 0 5px ${cor}66)`}:undefined}>
                <rect x={chipX} y={chipY} width={larg} height={chipH} rx={5}
                  fill="#061523" stroke={cor} strokeWidth={ehProx||atual?1.4:1} opacity={0.96}/>
                <rect x={chipX} y={chipY} width={3} height={chipH} rx={1.5} fill={cor}/>
                <text x={chipX+10} y={chipY+9.5} fill={corTxt} fontFamily="monospace" fontSize={fs}
                  fontWeight={ehProx||atual?"800":"600"}
                  style={atual?{animation:"pgblink 1.8s ease-in-out infinite"}:undefined}>{txt}</text>
                <text x={chipX+10} y={chipY+18.5} fill="#5E7A99" fontFamily="monospace" fontSize={7.5}>
                  {maqM} · {dh(tIni)}
                </text>
              </g>
              {(atual||ehProx) && <circle cx={x} cy={y} r={r+5} fill="none" strokeWidth={1.5}
                stroke={atual?C.cyan:C.warning} style={{animation:"trava 1.4s ease-in-out infinite"}}/>}
              <circle cx={x} cy={y} r={r} fill={passado?cor:"#0A1929"}
                stroke={cor} strokeWidth={1.5} opacity={op}
                style={{filter: ehProx||atual?`drop-shadow(0 0 5px ${cor})`:"none"}}/>
            </g>
          );
        })}

        {/* plano AGORA (só a linha vertical na pista) */}
        {(()=>{ const [nx,ny,nk] = pt(agora); return (
          <g>
            <line x1={nx} y1={ny-58*nk} x2={nx} y2={ny+30*nk} stroke={C.cyan} strokeWidth={1.6}
              style={{animation:"pgblink 1.8s ease-in-out infinite"}}/>
            <circle cx={nx} cy={ny} r={4} fill={C.cyan} style={{filter:`drop-shadow(0 0 6px ${C.cyan})`}}/>
          </g>
        ); })()}

        {/* indicador AGORA % fixo, canto superior-esquerdo, fora da pista */}
        <g>
          <text x={16} y={26} fill={C.textDim} fontFamily="monospace" fontSize={9.5} letterSpacing=".22em">AGORA</text>
          <text x={16} y={54} fill={C.cyan} fontFamily="monospace" fontSize={30} fontWeight="800"
            style={{animation:"pgblink 1.8s ease-in-out infinite"}}>{pctExec}%</text>
        </g>
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

function PainelTV({ agora, frentes, maqs, resumo, alertas, liber, pctExec, pctCheck }) {
  const T0 = new Date(PG_MARCOS[0][1]).getTime();
  const TF = new Date(PG_MARCOS[PG_MARCOS.length-1][2]||PG_MARCOS[PG_MARCOS.length-1][1]).getTime();
  const pctTempo = Math.round(Math.min(Math.max((agora-T0)/(TF-T0),0),1)*100);
  const dif = pctExec - pctTempo;
  const tend = dif>=5 ? ["▲ ADIANTADA",C.accent] : dif<=-5 ? ["▼ ATRASADA",C.danger] : ["▶ EM DIA",C.cyan];
  return (
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* hero geral + tendência */}
        <div style={{background:"rgba(10,25,41,0.55)",backdropFilter:"blur(12px)",border:`1px solid ${C.borderPG}`,
          borderRadius:16,padding:"20px 26px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,
            background:`linear-gradient(90deg,${C.accent},${C.cyan},${C.blue})`,opacity:.85}}/>
          <div style={{fontFamily:"monospace",fontSize:11,color:C.textDim,letterSpacing:".22em"}}>PROGRESSO GERAL DA PG</div>
          <div style={{display:"flex",alignItems:"baseline",gap:18,margin:"8px 0 12px",flexWrap:"wrap"}}>
            <span style={{fontFamily:"monospace",fontSize:64,fontWeight:800,color:C.cyan,lineHeight:1}}>{pctExec}%</span>
            <span style={{fontFamily:"monospace",fontSize:20,fontWeight:800,color:tend[1],
              animation:dif<=-5?"trava 1.4s ease-in-out infinite":"none"}}>{tend[0]}</span>
            <span style={{fontFamily:"monospace",fontSize:12,color:C.textDim}}>tempo decorrido {pctTempo}% · checklist {pctCheck}%</span>
          </div>
          <Barra f={pctExec} t={100} h={12}/>
        </div>
        {/* contadores gigantes */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {[["CONCLUÍDAS",resumo.concl,C.accent],["EM ANDAMENTO",resumo.emAnd,C.cyan],
            ["CRÍTICAS PENDENTES",resumo.critPend,C.warning],["ATRASADAS",resumo.atr,resumo.atr?C.danger:C.textDim]].map(([lab,v,cor])=>(
            <div key={lab} style={{background:"rgba(10,25,41,0.55)",border:`1px solid ${cor}33`,borderRadius:14,
              padding:"16px 8px",textAlign:"center"}}>
              <div style={{fontFamily:"monospace",fontSize:44,fontWeight:800,color:cor,lineHeight:1,
                animation: lab==="ATRASADAS"&&v?"trava 1.4s ease-in-out infinite":"none"}}>{v}</div>
              <div style={{fontFamily:"monospace",fontSize:9.5,color:C.textDim,letterSpacing:".16em",marginTop:8}}>{lab}</div>
            </div>
          ))}
        </div>
        {/* carrossel de frentes */}
        <CarrosselExec frentes={frentes}/>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* máquinas */}
        {maqs.map(([lab,m,f,t])=>(
          <div key={m} style={{background:"rgba(10,25,41,0.55)",border:`1px solid ${CORMAQ[m]}44`,borderRadius:14,
            padding:"13px 16px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:CORMAQ[m],opacity:.8}}/>
            <div style={{display:"flex",alignItems:"baseline",gap:10}}>
              <span style={{fontFamily:"monospace",fontSize:11,color:C.textDim,letterSpacing:".16em"}}>{lab}</span>
              <span style={{marginLeft:"auto",fontFamily:"monospace",fontSize:30,fontWeight:800,color:CORMAQ[m]}}>{pct(f,t)}%</span>
            </div>
            <div style={{marginTop:8}}><Barra f={f} t={t} h={8} cor={CORMAQ[m]}/></div>
          </div>
        ))}
        {/* alertas */}
        <div style={{background:"rgba(10,25,41,0.55)",border:`1px solid ${C.danger}44`,borderRadius:14,overflow:"hidden",flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:C.danger,boxShadow:`0 0 8px ${C.danger}`,
              animation:"trava 1.4s ease-in-out infinite"}}/>
            <span style={{fontWeight:800,fontSize:13}}>ALERTAS</span>
          </div>
          <div style={{padding:"8px 14px"}}>
            {alertas.length===0 && <div style={{fontFamily:"monospace",fontSize:11.5,color:C.textMuted,padding:"6px 0"}}>Sem alertas ativos.</div>}
            {alertas.map(([id,titulo,maqA,st])=>(
              <div key={id} style={{display:"flex",gap:8,alignItems:"center",padding:"5px 0"}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:st==="atrasada"?C.danger:C.warning,flexShrink:0,
                  boxShadow:`0 0 5px ${st==="atrasada"?C.danger:C.warning}`}}/>
                <span style={{flex:1,fontSize:12.5,color:"#E6EEF6",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{titulo}</span>
                <span style={{fontFamily:"monospace",fontSize:9.5,fontWeight:700,color:CORMAQ[maqA]}}>{maqA}</span>
              </div>
            ))}
          </div>
        </div>
        {/* próximas liberações */}
        <div style={{background:"rgba(10,25,41,0.55)",border:`1px solid ${C.borderPG}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,.06)",fontWeight:800,fontSize:13}}>PRÓXIMAS LIBERAÇÕES</div>
          <div style={{padding:"8px 14px"}}>
            {liber.length===0 && <div style={{fontFamily:"monospace",fontSize:11.5,color:C.textMuted,padding:"6px 0"}}>Todas as frentes liberadas.</div>}
            {liber.map(a=>(
              <div key={a[0]} style={{display:"flex",gap:8,alignItems:"center",padding:"5px 0"}}>
                <span style={{width:6,height:6,borderRadius:"50%",border:`1.5px solid ${CORMAQ[a[1]]}`,flexShrink:0}}/>
                <span style={{flex:1,fontSize:12.5,color:"#E6EEF6"}}>{a[2]}</span>
                <span style={{fontFamily:"monospace",fontSize:9.5,fontWeight:700,color:CORMAQ[a[1]]}}>{a[1]}</span>
              </div>
            ))}
          </div>
        </div>
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

function FormMarcoEdit({ v, set, onSalvar, onCancelar }) {
  const [id,ini,fim,maqM,titulo] = v;
  const upd = (i,val) => { const n=[...v]; n[i]=val; set(n); };
  return (
    <div style={{background:"rgba(0,240,255,.05)",border:`1px solid ${C.cyan}66`,borderRadius:9,padding:"8px 10px",marginBottom:6}}>
      <input value={titulo} onChange={e=>upd(4,e.target.value)} placeholder="Título do marco" style={campoS}/>
      <div style={{display:"flex",gap:6,marginTop:5}}>
        <input value={ini||""} onChange={e=>upd(1,e.target.value)} placeholder="AAAA-MM-DDTHH:MM" style={{...campoS,flex:1}}/>
        <input value={fim||""} onChange={e=>upd(2,e.target.value||null)} placeholder="fim (opcional)" style={{...campoS,flex:1}}/>
      </div>
      <div style={{display:"flex",gap:6,marginTop:5,alignItems:"center"}}>
        <select value={maqM} onChange={e=>upd(3,e.target.value)} style={campoS}>
          {["MQ2","MQ3","GERAL"].map(m=><option key={m} value={m}>{m}</option>)}
        </select>
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          <button onClick={onSalvar} style={btnOk}>Salvar</button>
          <button onClick={onCancelar} style={btnX}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
function FormAtivEdit({ v, set, onSalvar, onCancelar }) {
  const [id,maqA,areaA,titulo,ini,fim,resp,cc] = v;
  const upd = (i,val) => { const n=[...v]; n[i]=val; set(n); };
  return (
    <div style={{background:"rgba(0,240,255,.05)",border:`1px solid ${C.cyan}66`,borderRadius:9,padding:"8px 10px",marginBottom:6}}>
      <input value={titulo} onChange={e=>upd(3,e.target.value)} placeholder="Título da atividade" style={campoS}/>
      <div style={{display:"flex",gap:6,marginTop:5}}>
        <select value={maqA} onChange={e=>upd(1,e.target.value)} style={campoS}>
          {["MQ2","MQ3","GERAL"].map(m=><option key={m} value={m}>{m}</option>)}
        </select>
        <select value={areaA} onChange={e=>upd(2,e.target.value)} style={{...campoS,flex:1}}>
          {PG_AREAS_ATIV.map(a=><option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div style={{display:"flex",gap:6,marginTop:5}}>
        <input value={ini||""} onChange={e=>upd(4,e.target.value||null)} placeholder="início (opcional)" style={{...campoS,flex:1}}/>
        <input value={fim||""} onChange={e=>upd(5,e.target.value||null)} placeholder="fim (opcional)" style={{...campoS,flex:1}}/>
      </div>
      <div style={{display:"flex",gap:6,marginTop:5,alignItems:"center"}}>
        <input value={resp||""} onChange={e=>upd(6,e.target.value||null)} placeholder="responsável" style={{...campoS,flex:1}}/>
        <label style={{display:"flex",alignItems:"center",gap:4,fontSize:9.5,color:C.textDim,fontFamily:"monospace"}}>
          <input type="checkbox" checked={cc===1} onChange={e=>upd(7,e.target.checked?1:0)}/> crítico
        </label>
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          <button onClick={onSalvar} style={btnOk}>Salvar</button>
          <button onClick={onCancelar} style={btnX}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPG({ onChecklist, onOperacao, onSair, tv }) {
  const [estados, setEstados] = useState({});
  const [cfgEscala, setCfgEscala] = useState({}); // pg_escala_h2/config_periodo + cronograma (collection gravável)
  const [agora, setAgora] = useState(Date.now());
  const [aba, setAba] = useState(()=> tv ? "exec" : (Date.now() < new Date(PG_MARCOS[0][1]).getTime() ? "plan" : "exec"));
  const [modoExec, setModoExec] = useState(tv ? "tv" : "comando");
  const { perfil } = usePerfilAtivo();
  const [buscaTempo, setBuscaTempo] = useState("");
  const [cenAberto, setCenAberto] = useState(null);
  const [editTempo, setEditTempo] = useState(null);
  const [valTempo, setValTempo] = useState("");
  const [editMarco, setEditMarco] = useState(null);
  const [formMarco, setFormMarco] = useState(null);
  const [editAtiv, setEditAtiv] = useState(null);
  const [formAtiv, setFormAtiv] = useState(null);

  useEffect(()=>{
    const unsub = onSnapshot(collection(db,"pg_checklist_h2"), snap=>{
      const m = {}; snap.forEach(d=>{ m[d.id] = d.data(); });
      setEstados(m);
    }, ()=>{});
    const unsub2 = onSnapshot(collection(db,"pg_escala_h2"), snap=>{
      const m = {}; snap.forEach(d=>{ m[d.id] = d.data(); });
      setCfgEscala(m);
    }, ()=>{});
    const t = setInterval(()=>setAgora(Date.now()), 30000);
    return ()=>{ unsub(); unsub2(); clearInterval(t); };
  },[]);

  const ativEstado = (estados["plano_atividades"] && estados["plano_atividades"].ativ) || {};

  const tempoAjuste = (estados["tempos_ajustes"] && estados["tempos_ajustes"].lib) || {};
  const gravaTempo = (chave)=>{
    let v = valTempo.trim();
    if(!/^\d{1,2}:[0-5]\d$/.test(v)) return;
    if(v.length===4) v = "0"+v;
    setDoc(doc(db,"pg_checklist_h2","tempos_ajustes"),{
      lib:{ [chave]: { dur:v, op:(perfil&&perfil.nome)||"—", ts:Date.now() } },
      upd:Date.now(),
    },{merge:true}).catch(()=>{});
    setEditTempo(null); setValTempo("");
  };

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

  const planoEdits = estados["pg_plano_edits"] || {};
  const MARCOS = PG_MARCOS
    .filter(m=>!(planoEdits.marcosDel||[]).includes(m[0]))
    .map(m=> (planoEdits.marcosEdit||{})[m[0]] || m)
    .concat(planoEdits.marcosAdd||[]);
  const ATIV = PG_ATIVIDADES
    .filter(a=>!(planoEdits.ativDel||[]).includes(a[0]))
    .map(a=> (planoEdits.ativEdit||{})[a[0]] || a)
    .concat(planoEdits.ativAdd||[]);
  const salvarPlano = (campo, valor) => setDoc(doc(db,"pg_checklist_h2","pg_plano_edits"),
    { [campo]: valor, op:(perfil&&perfil.nome)||"—", ts:Date.now() },{merge:true}).catch(()=>{});

  const atrasadas = ATIV.filter(a=>statusAtiv(a)==="atrasada");
  const emRisco = ATIV.filter(a=>statusAtiv(a)==="risco");
  const criticasAndamento = ATIV.filter(a=>a[7]===1 && statusAtiv(a)==="andamento");
  const concluidas = ATIV.filter(a=>statusAtiv(a)==="concluida").length;

  const cfgPG = estados["pg_config"] || {};
  const prioAuto = (MARCOS.find(m=>m[3]!=="GERAL" && agora <= new Date(m[2]||m[1]).getTime())||[])[3] || null;
  const prioridade = (cfgPG.prioridade && cfgPG.prioridade!=="auto") ? cfgPG.prioridade : prioAuto;
  const gravaPrio = v => setDoc(doc(db,"pg_checklist_h2","pg_config"),
    { prioridade:v, op:(perfil&&perfil.nome)||"—", ts:Date.now() },{merge:true}).catch(()=>{});

  // Período editável da PG (bloco 01). Semente = PG_PERIODO do book; overlay em pg_config.periodo.
  const periodoPG = { ...{ MQ3:PG_PERIODO.MQ3, MQ2:PG_PERIODO.MQ2 }, ...((cfgEscala["registro"]||{}).periodo||{}) };
  const [gravaLog, setGravaLog] = useState("nenhuma gravação ainda");
  const gravaPeriodo = (maq, campo, valor) => {
    const novoPeriodo = {
      MQ3: { ...periodoPG.MQ3 },
      MQ2: { ...periodoPG.MQ2 },
    };
    novoPeriodo[maq] = { ...novoPeriodo[maq], [campo]: valor };
    setGravaLog(`gravando ${maq}.${campo}=${valor}...`);
    return setDoc(doc(db,"pg_escala_h2","registro"),
      { periodo:novoPeriodo, op:(perfil&&perfil.nome)||"—", ts:Date.now() },{merge:true})
      .then(()=>setGravaLog(`OK ${maq}.${campo}=${valor} às ${new Date().toLocaleTimeString()}`))
      .catch(e=>setGravaLog(`ERRO ${maq}.${campo}: ${String(e&&e.message||e)}`));
  };

  // Cronograma (atividade → data). Vive em pg_checklist_h2/cronograma.
  const cronograma = (cfgEscala["registro"] && cfgEscala["registro"].cronograma) || [];
  const _bibNome = Object.fromEntries(PG_BIBLIOTECA.map(a=>[a.id, a.nome]));
  const salvarCronograma = itens => setDoc(doc(db,"pg_escala_h2","registro"),
    { cronograma:itens, op:(perfil&&perfil.nome)||"—", ts:Date.now() },{merge:true}).catch(()=>{});
  const gerarCron = () => { const it = gerarCronograma(periodoPG); if(it.length) salvarCronograma(it); };
  const moverItem = (idx, dias) => {
    const novo = cronograma.map((it,i)=>{ if(i!==idx) return it;
      const d=new Date(it.data+"T12:00"); d.setDate(d.getDate()+dias);
      return { ...it, data:d.toISOString().slice(0,10) }; });
    salvarCronograma(novo);
  };
  const removerItem = idx => salvarCronograma(cronograma.filter((_,i)=>i!==idx));
  const zonaAcao = [...atrasadas, ...emRisco, ...criticasAndamento]
    .sort((a,b)=>(b[1]===prioridade?1:0)-(a[1]===prioridade?1:0)).slice(0,8);

  const frentes = PG_AREAS_ATIV.map(ar=>{
    const acts = ATIV.filter(a=>a[2]===ar);
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
        {[["plan","01","PLANEJAMENTO"],["exec","02","EXECUÇÃO"],["pos","03","RETOMADA"],["blq","04","SALA DE BLOQUEIO"]].map(([id,num,lab])=>(
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

      {modoExec==="tv" ? (
        <PainelTV agora={agora} frentes={frentes}
          pctExec={pct(concluidas, ATIV.length)} pctCheck={pct(feitosGeral, TOTAIS.__geral)}
          maqs={[["MÁQUINA 2","MQ2",feitosMaq("MQ2"),TOTAIS.MQ2.__total],["MÁQUINA 3","MQ3",feitosMaq("MQ3"),TOTAIS.MQ3.__total]]}
          resumo={{ concl:concluidas, emAnd:frentes.reduce((n,f)=>n+f.andamento,0),
            critPend:ATIV.filter(a=>a[7]===1 && statusAtiv(a)!=="concluida").length, atr:atrasadas.length }}
          alertas={[...atrasadas,...emRisco].slice(0,6).map(a=>[a[0],a[3],a[1],statusAtiv(a)])}
          liber={ATIV.filter(a=>/^Liberar/i.test(a[3]) && statusAtiv(a)!=="concluida").slice(0,5)}
        />
      ) : (<>

      {/* ── 01 Resumo Executivo ── */}
      <Sec num="01" titulo="RESUMO EXECUTIVO">
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:10}}>
          {[
            ["EXECUÇÃO", pct(concluidas, ATIV.length)+"%", C.cyan, "das atividades"],
            ["CONCLUÍDAS", concluidas+"/"+ATIV.length, C.accent, "atividades"],
            ["EM ANDAMENTO", frentes.reduce((n,f)=>n+f.andamento,0), C.cyan, "agora"],
            ["ATRASADAS", atrasadas.length, atrasadas.length?C.danger:C.textDim, "exigem ação"],
            ["EM RISCO", emRisco.length, emRisco.length?C.warning:C.textDim, "janela >70%"],
            ["CHECKLIST", pct(feitosGeral, TOTAIS.__geral)+"%", C.accent, feitosGeral+"/"+TOTAIS.__geral],
          ].map(([lab,v,cor,sub])=>(
            <div key={lab} style={{textAlign:"center",border:`1px solid ${cor}33`,borderRadius:11,padding:"10px 4px"}}>
              <div style={{fontFamily:"monospace",fontSize:24,fontWeight:800,color:cor,lineHeight:1,
                animation: lab==="ATRASADAS"&&atrasadas.length?"trava 1.4s ease-in-out infinite":"none"}}>{v}</div>
              <div style={{fontFamily:"monospace",fontSize:8.5,color:C.textDim,letterSpacing:".14em",marginTop:5}}>{lab}</div>
              <div style={{fontFamily:"monospace",fontSize:8,color:C.textDim,opacity:.7,marginTop:1}}>{sub}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9,fontFamily:"monospace"}}>
          <span style={{fontSize:9.5,color:C.textDim,letterSpacing:".16em"}}>MÁQUINA PRIORITÁRIA</span>
          {["auto","MQ2","MQ3"].map(v=>{
            const ativo = (cfgPG.prioridade||"auto")===v;
            return <button key={v} onClick={()=>gravaPrio(v)} style={{
              padding:"3px 10px",borderRadius:7,cursor:"pointer",fontFamily:"monospace",fontSize:9.5,fontWeight:800,
              border:`1.5px solid ${ativo?(CORMAQ[v]||C.cyan):"rgba(255,255,255,.12)"}`,
              background:ativo?`${CORMAQ[v]||C.cyan}18`:"rgba(255,255,255,.02)",
              color:ativo?"#FFFFFF":C.textDim,letterSpacing:".08em"}}>{v.toUpperCase()}</button>;
          })}
          {prioridade && <span style={{marginLeft:6,fontSize:10.5,fontWeight:800,color:CORMAQ[prioridade],
            border:`1px solid ${CORMAQ[prioridade]}66`,borderRadius:6,padding:"2px 8px",
            boxShadow:`0 0 10px ${CORMAQ[prioridade]}33`}}>▸ {prioridade}</span>}
          {cfgPG.prioridade && cfgPG.prioridade!=="auto" && cfgPG.op &&
            <span style={{fontSize:8,color:C.textDim}}>definida por {cfgPG.op} · {hm(cfgPG.ts)}</span>}
        </div>
        {(()=>{ const pm = MARCOS.find(m=>new Date(m[2]||m[1]).getTime()>=agora);
          const pi = pm?new Date(pm[1]).getTime():0, pf = pm?new Date(pm[2]||pm[1]).getTime():0;
          return (
          <div style={{display:"flex",alignItems:"center",gap:9,flexWrap:"wrap",fontFamily:"monospace"}}>
            <span style={{fontSize:9.5,color:C.textDim,letterSpacing:".16em"}}>PRÓXIMA META</span>
            <span style={{width:7,height:7,borderRadius:"50%",background:C.warning,boxShadow:`0 0 8px ${C.warning}`,
              animation:"trava 1.4s ease-in-out infinite"}}/>
            <span style={{fontSize:12,fontWeight:800,color:"#FFFFFF",fontFamily:"system-ui"}}>{pm?pm[4]:"PG concluída"}</span>
            {pm && <span style={{fontSize:9,fontWeight:700,color:CORMAQ[pm[3]],border:`1px solid ${CORMAQ[pm[3]]}55`,
              borderRadius:4,padding:"1px 5px"}}>{pm[3]}</span>}
            {pm && <span style={{fontSize:10.5,color:C.cyan}}>{agora<pi?`faltam ${falta(pi-agora)}`:`termina em ${falta(pf-agora)}`}</span>}
            <span style={{marginLeft:"auto",fontSize:10,color:C.textDim}}>
              TURNO ATUAL {turnoAtual?`· entrada ${turnoAtual[0]} · ${turnoAtual[1].length} pessoas`:"· sem escala agora"}
            </span>
          </div>
        ); })()}
      </Sec>

      {/* ── 02 Trilho ── */}
      <div style={{margin:"14px 0"}}>
        <TrilhoPG agora={agora} marcos={MARCOS} pctExec={pct(concluidas, ATIV.length)} pctCheck={pct(feitosGeral, TOTAIS.__geral)}/>
      </div>

      {/* ── 03 Zona de Ação ── */}
      <div style={{background:"rgba(10,25,41,0.55)",backdropFilter:"blur(12px)",border:`1px solid ${C.danger}44`,
        borderRadius:14,overflow:"hidden",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:9,padding:"11px 15px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
          <span style={{fontFamily:"monospace",fontSize:10.5,fontWeight:700,color:C.textDim}}>03</span>
          <span style={{width:8,height:8,borderRadius:"50%",background:C.danger,boxShadow:`0 0 8px ${C.danger}`,
            animation:"trava 1.4s ease-in-out infinite"}}/>
          <span style={{fontWeight:800,fontSize:13,letterSpacing:".05em"}}>ZONA DE AÇÃO</span>
          <span style={{marginLeft:"auto",fontFamily:"monospace",fontSize:11,color:C.textDim}}>{zonaAcao.length} itens</span>
        </div>
        {zonaAcao.length===0 && (
          <div style={{padding:"16px 15px",fontSize:12.5,color:C.textMuted,fontFamily:"monospace"}}>Nenhuma pendência crítica no momento.</div>
        )}
        {zonaAcao.map((a,i)=>{
          const [id,maqA,areaA,titulo,ini,fim,resp] = a;
          const st = statusAtiv(a);
          return (
            <div key={id} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 15px",
              borderBottom: i<zonaAcao.length-1?"1px solid rgba(255,255,255,.05)":"none"}}>
              <div style={{width:3,alignSelf:"stretch",borderRadius:2,background:COR_ST[st],flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12.5,fontWeight:700,color:C.text,lineHeight:1.3}}>{titulo}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4,fontFamily:"monospace",fontSize:9}}>
                  <span style={{fontWeight:800,color:COR_ST[st]}}>{LABEL_ST[st]}</span>
                  <span style={{color:CORMAQ[maqA]}}>{maqA}</span>
                  <span style={{color:C.textDim}}>{areaA}</span>
                  {ini && <span style={{color:C.textDim}}>janela {hm(ini)}→{hm(fim||ini)}</span>}
                  {resp && <span style={{color:C.textDim}}>{resp}</span>}
                  {(()=>{
                    if(!ini || !fim) return null;
                    const sug = sugestaoDur(titulo);
                    if(!sug) return null;
                    const planej = Math.round((new Date(fim)-new Date(ini))/60000);
                    if(planej >= durMin(sug)) return null;
                    return <span style={{color:C.warning,fontWeight:800}}>⚑ histórico sugere {sug}</span>;
                  })()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 04 Atividades Críticas ── */}
      <div style={{marginBottom:14}}>
      <Sec num="04" titulo="ATIVIDADES CRÍTICAS · CAMINHO CRÍTICO">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 18px"}}>
          {ATIV.filter(a=>a[7]===1).map(a=>{
            const st = statusAtiv(a);
            const cor = st==="concluida"?C.accent:COR_ST[st]||C.textDim;
            return (
              <div key={a[0]} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",
                borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:cor,flexShrink:0,
                  boxShadow:st==="atrasada"?`0 0 6px ${cor}`:"none"}}/>
                <span style={{flex:1,fontSize:11.5,color:st==="concluida"?C.textMuted:"#E6EEF6",
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a[3]}</span>
                <span style={{fontFamily:"monospace",fontSize:9,fontWeight:700,color:CORMAQ[a[1]]}}>{a[1]}</span>
                <span style={{fontFamily:"monospace",fontSize:8.5,color:cor}}>
                  {st==="concluida"?"OK":st==="andamento"?"ANDAMENTO":st==="atrasada"?"ATRASADA":st==="risco"?"RISCO":"PENDENTE"}
                </span>
              </div>
            );
          })}
        </div>
      </Sec>
      </div>

      {/* ── 05 Indicadores por Máquina ── */}
      <div style={{marginBottom:14}}>
      <Sec num="05" titulo="INDICADORES POR MÁQUINA · CHECKLIST">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          {[["Máquina 2","MQ2"],["Máquina 3","MQ3"],["Geral","GERAL"]].map(([lab,m])=>{
            const f = m==="GERAL" ? feitosGeral : feitosMaq(m);
            const t = m==="GERAL" ? TOTAIS.__geral : TOTAIS[m].__total;
            const prio = m===prioridade;
            return (
              <div key={m} style={{border:`${prio?1.5:1}px solid ${CORMAQ[m]}${prio?"":"44"}`,borderRadius:12,padding:"12px 14px",
                position:"relative",overflow:"hidden",boxShadow:prio?`0 0 18px ${CORMAQ[m]}33`:"none"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:CORMAQ[m],opacity:.8}}/>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontFamily:"monospace",fontSize:10,color:C.textDim,letterSpacing:".18em"}}>{lab.toUpperCase()}</span>
                  {prio && <span style={{fontFamily:"monospace",fontSize:7.5,fontWeight:800,color:"#04111D",
                    background:CORMAQ[m],borderRadius:4,padding:"1px 5px",letterSpacing:".1em",
                    animation:"pgblink 1.8s ease-in-out infinite"}}>PRIORIDADE</span>}
                </div>
                <div style={{display:"flex",alignItems:"baseline",gap:8,margin:"6px 0"}}>
                  <span style={{fontFamily:"monospace",fontSize:26,fontWeight:800,color:CORMAQ[m]}}>{pct(f,t)}%</span>
                  <span style={{fontFamily:"monospace",fontSize:11,color:C.textMuted}}>{f}/{t} itens</span>
                </div>
                <Barra f={f} t={t} h={7} cor={CORMAQ[m]}/>
              </div>
            );
          })}
        </div>
      </Sec>
      </div>

      {/* ── 06 Indicadores por Área ── */}
      <div style={{marginBottom:14}}>
      <Sec num="06" titulo="INDICADORES POR ÁREA · ATIVIDADES">
        {frentes.map(f=>(
          <div key={f.ar} style={{marginBottom:9}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11.5,marginBottom:3}}>
              <span style={{fontWeight:700,color:"#FFFFFF",flex:1}}>{f.ar}</span>
              {f.atrasadas.length>0 && <span style={{fontFamily:"monospace",fontSize:9,fontWeight:800,color:C.danger,
                animation:"trava 1.4s ease-in-out infinite"}}>{f.atrasadas.length} ATRASADA{f.atrasadas.length>1?"S":""}</span>}
              {f.andamento>0 && <span style={{fontFamily:"monospace",fontSize:9,color:C.cyan}}>{f.andamento} EM ANDAMENTO</span>}
              <span style={{fontFamily:"monospace",fontSize:10.5,color:C.textMuted}}>{f.feitas}/{f.total}</span>
            </div>
            <Barra f={f.feitas} t={f.total} h={6}/>
          </div>
        ))}
      </Sec>
      </div>

      {/* ── 07 Liberações ── */}
      <div style={{marginBottom:14}}>
      <Sec num="07" titulo="LIBERAÇÕES DE TRABALHO">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1.2fr",gap:16}}>
          <div>
            <div style={{fontFamily:"monospace",fontSize:9,color:C.textDim,letterSpacing:".14em",marginBottom:4}}>RESPONSÁVEIS (BOOK)</div>
            {PG_LTS.map(([l,r])=><Linha key={l} l={l} r={r}/>)}
          </div>
          <div>
            <div style={{fontFamily:"monospace",fontSize:9,color:C.textDim,letterSpacing:".14em",marginBottom:4}}>FRENTES DE LIBERAÇÃO</div>
            {ATIV.filter(a=>/^Liberar/i.test(a[3])).map(a=>{
              const st = statusAtiv(a);
              const cor = st==="concluida"?C.accent:COR_ST[st]||C.textDim;
              return (
                <div key={a[0]} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",
                  borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:cor,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:11.5,color:"#E6EEF6"}}>{a[2]}</span>
                  <span style={{fontFamily:"monospace",fontSize:9,fontWeight:700,color:CORMAQ[a[1]]}}>{a[1]}</span>
                  <span style={{fontFamily:"monospace",fontSize:8.5,color:cor}}>
                    {st==="concluida"?"LIBERADA":st==="andamento"?"EM CURSO":"PENDENTE"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Sec>
      </div>

      {/* ── 08 Checklist de Retomada (resumo) ── */}
      <Sec num="08" titulo="CHECKLIST DE RETOMADA · RESUMO">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:14,alignItems:"center"}}>
          {[["MQ2","MQ2"],["MQ3","MQ3"],["GERAL","GERAL"]].map(([lab,m])=>{
            const f = m==="GERAL" ? feitosGeral : feitosMaq(m);
            const t = m==="GERAL" ? TOTAIS.__geral : TOTAIS[m].__total;
            return (
              <div key={m}>
                <div style={{display:"flex",justifyContent:"space-between",fontFamily:"monospace",fontSize:10,marginBottom:3}}>
                  <span style={{color:CORMAQ[m],fontWeight:700}}>{lab}</span>
                  <span style={{color:C.textMuted}}>{pct(f,t)}%</span>
                </div>
                <Barra f={f} t={t} h={6} cor={CORMAQ[m]}/>
              </div>
            );
          })}
          <button onClick={()=>setAba("pos")} style={{padding:"9px 16px",borderRadius:9,cursor:"pointer",
            fontFamily:"monospace",fontSize:10.5,fontWeight:800,letterSpacing:".08em",
            border:`1.5px solid ${C.cyan}`,background:"rgba(0,240,255,.07)",color:"#FFFFFF"}}>VER RETOMADA ›</button>
        </div>
      </Sec>
      </>)}
      </>)}

      {/* ── Aba Planejamento ── */}
      {aba==="plan" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{gridColumn:"1 / -1"}}>
            <Sec num="00" titulo="GESTÃO DE TIME">
              <EquipeTela/>
            </Sec>
          </div>
          <div style={{gridColumn:"1 / -1"}}>
            <Sec num="00b" titulo="ESCALA DA PG">
              <EscalaTela/>
            </Sec>
          </div>
          <Sec num="01" titulo="PERÍODO E FACILITADORES">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              {["MQ3","MQ2"].map(m=>{
                const p = periodoPG[m] || {};
                const book = (m==="MQ3"?PG_PERIODO.MQ3:PG_PERIODO.MQ2) || {};
                // valor ISO só se já preenchido pela gestão (book é dd/mm sem ano → não vira type=date)
                const isoDe = v => (typeof v==="string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) ? v : "";
                const dataCampo = (lbl,campoId,ref)=>(
                  <label style={{display:"flex",flexDirection:"column",gap:2}}>
                    <span style={{fontFamily:"monospace",fontSize:8,color:C.textDim,letterSpacing:".08em"}}>{lbl} <span style={{color:`${CORMAQ[m]}99`}}>· book {ref}</span></span>
                    <input key={`${m}-${campoId}-${isoDe(p[campoId])}`} type="date" defaultValue={isoDe(p[campoId])} onChange={e=>{ if(e.target.value!==isoDe(p[campoId])) gravaPeriodo(m,campoId,e.target.value); }}
                      style={{background:C.bg,border:`1px solid ${CORMAQ[m]}44`,color:"#FFFFFF",borderRadius:6,padding:"5px 6px",fontSize:11,colorScheme:"dark"}}/>
                  </label>
                );
                return (
                  <div key={m} style={{border:`1px solid ${CORMAQ[m]}44`,borderRadius:10,padding:"8px 10px"}}>
                    <div style={{fontFamily:"monospace",fontSize:9.5,color:CORMAQ[m],letterSpacing:".14em",marginBottom:7}}>{m}</div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {dataCampo("INÍCIO","ini",book.ini||"—")}
                      {dataCampo("TÉRMINO","fim",book.fim||"—")}
                      <label style={{display:"flex",flexDirection:"column",gap:2}}>
                        <span style={{fontFamily:"monospace",fontSize:8,color:C.textDim,letterSpacing:".08em"}}>PARADA</span>
                        <input key={`${m}-parada-${p.parada||book.parada||""}`} type="text" defaultValue={p.parada||book.parada||""} onBlur={e=>{ if(e.target.value!==(p.parada||book.parada||"")) gravaPeriodo(m,"parada",e.target.value); }}
                          style={{background:C.bg,border:`1px solid ${CORMAQ[m]}44`,color:"#FFFFFF",borderRadius:6,padding:"5px 6px",fontSize:11}}/>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{fontFamily:"monospace",fontSize:9,color:C.textDim,marginBottom:8,lineHeight:1.5}}>
              Preencha início e término com o ano real; a escala usa o intervalo que cobre as duas máquinas (menor início → maior término). Ajuste manual sempre prevalece.
            </div>
            {PG_FACILITADORES.map(([l,r])=><Linha key={l} l={l} r={r}/>)}
          </Sec>

          <Sec num="01b" titulo="CRONOGRAMA DE ATIVIDADES">
            <div style={{fontFamily:"monospace",fontSize:9,color:C.warning,background:"rgba(255,193,7,.08)",border:`1px solid ${C.warning}44`,borderRadius:6,padding:"6px 8px",marginBottom:8,wordBreak:"break-all"}}>
              DIAG · periodoPG = {JSON.stringify(periodoPG)}
              <br/>DIAG · última gravação: {gravaLog}
            </div>
            {(()=>{
              const env = envelopePeriodo(periodoPG);
              if(!env) return (
                <div style={{fontSize:11.5,color:C.textMuted,lineHeight:1.5}}>
                  Defina início e término (com ano) no bloco 01 para gerar o cronograma.
                </div>
              );
              const porData = {};
              cronograma.forEach((it,i)=>{ (porData[it.data]=porData[it.data]||[]).push({...it,idx:i}); });
              const datas = Object.keys(porData).sort();
              return (
                <>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:10}}>
                    <button onClick={gerarCron} style={{cursor:"pointer",background:C.cyan,color:C.bg,border:"none",borderRadius:7,padding:"7px 13px",fontSize:12,fontWeight:800}}>
                      {cronograma.length ? "Regerar" : "Gerar cronograma"}
                    </button>
                    <span style={{fontFamily:"monospace",fontSize:9.5,color:C.textDim}}>
                      {env.ini.split("-").reverse().slice(0,2).join("/")} → {env.fim.split("-").reverse().slice(0,2).join("/")} · {cronograma.length} atividades
                    </span>
                  </div>
                  {!cronograma.length ? (
                    <div style={{fontSize:11,color:C.textDim}}>Sem cronograma. Clique em Gerar para distribuir as atividades pelo período.</div>
                  ) : (
                    <div style={{display:"flex",flexDirection:"column",gap:7}}>
                      {datas.map(d=>(
                        <div key={d} style={{border:`1px solid ${C.borderPG}`,borderRadius:9,padding:"7px 9px"}}>
                          <div style={{fontFamily:"monospace",fontSize:9.5,color:C.cyan,letterSpacing:".1em",marginBottom:5}}>{d.split("-").reverse().join("/")}</div>
                          <div style={{display:"flex",flexDirection:"column",gap:4}}>
                            {porData[d].map(it=>(
                              <div key={it.idx} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.03)",borderRadius:6,padding:"4px 7px"}}>
                                <span style={{flex:1,fontSize:11,color:"#FFFFFF"}}>{_bibNome[it.atividadeId]||it.atividadeId}</span>
                                <button onClick={()=>moverItem(it.idx,-1)} title="dia anterior" style={cronBtn}>‹</button>
                                <button onClick={()=>moverItem(it.idx,1)} title="dia seguinte" style={cronBtn}>›</button>
                                <button onClick={()=>removerItem(it.idx)} title="remover" style={{...cronBtn,color:C.danger}}>✕</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
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
          <div style={{gridColumn:"1 / -1"}}>
            <Sec num="07" titulo="BIBLIOTECA DE TEMPOS · HISTÓRICO DE PARADAS">
              <div style={{display:"grid",gridTemplateColumns:"1.1fr 1fr",gap:16}}>
                <div>
                  <input value={buscaTempo} onChange={e=>setBuscaTempo(e.target.value)}
                    placeholder="Buscar atividade…" style={{
                      width:"100%",boxSizing:"border-box",padding:"8px 11px",borderRadius:9,marginBottom:9,
                      background:"rgba(255,255,255,.04)",border:`1px solid ${C.borderPG}`,
                      color:"#FFFFFF",fontSize:12,fontFamily:"monospace",outline:"none"}}/>
                  <div style={{fontFamily:"monospace",fontSize:9.5,color:C.textDim,letterSpacing:".14em",marginBottom:6}}>
                    ATIVIDADES CATALOGADAS · TOQUE NA DURAÇÃO PARA AJUSTAR
                  </div>
                  <div style={{maxHeight:330,overflowY:"auto",display:"flex",flexDirection:"column"}}>
                    {PG_TEMPOS_LIB.filter(([a])=>a.toLowerCase().includes(buscaTempo.toLowerCase())).map(([atv,dur,n])=>{
                      const chave = slug(atv);
                      const aj = tempoAjuste[chave];
                      const efetiva = aj ? aj.dur : dur;
                      const editando = editTempo===chave;
                      return (
                        <div key={chave} style={{display:"flex",alignItems:"center",gap:9,padding:"6px 2px",
                          borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:11.5,color:"#E6EEF6",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{atv}</div>
                            {aj && <div style={{fontFamily:"monospace",fontSize:8,color:C.cyan,marginTop:1}}>
                              ajustado · {aj.op} · {hm(aj.ts)} {aj.dur!==dur && `(histórico ${dur})`}
                            </div>}
                            {(()=>{
                              const usada = ATIV.find(a=>slug(a[3])===chave);
                              if(!usada || !usada[4] || !usada[5]) return null;
                              const planej = Math.round((new Date(usada[5])-new Date(usada[4]))/60000);
                              const apertado = planej < durMin(efetiva);
                              return <div style={{fontFamily:"monospace",fontSize:8,color:apertado?C.warning:C.accent,marginTop:1}}>
                                no plano: {planej}min {apertado?"⚑ abaixo do histórico":"✓"}
                              </div>;
                            })()}
                          </div>
                          <span style={{fontFamily:"monospace",fontSize:9,color:C.textDim}}>×{n}</span>
                          {editando ? (
                            <span style={{display:"flex",gap:5,alignItems:"center"}}>
                              <input autoFocus value={valTempo} onChange={e=>setValTempo(e.target.value)}
                                onKeyDown={e=>{ if(e.key==="Enter") gravaTempo(chave); if(e.key==="Escape") setEditTempo(null); }}
                                placeholder="hh:mm" style={{width:56,padding:"4px 6px",borderRadius:7,
                                  background:"rgba(0,240,255,.07)",border:`1px solid ${C.cyan}`,color:"#FFFFFF",
                                  fontFamily:"monospace",fontSize:11.5,outline:"none",textAlign:"center"}}/>
                              <button onClick={()=>gravaTempo(chave)} style={{background:C.cyan,border:"none",
                                borderRadius:7,padding:"4px 9px",fontWeight:800,fontSize:11,color:"#04111D",cursor:"pointer"}}>OK</button>
                              <button onClick={()=>setEditTempo(null)} style={{background:"none",
                                border:`1px solid rgba(255,255,255,.18)`,borderRadius:7,padding:"4px 8px",
                                color:C.textMuted,fontSize:11,cursor:"pointer"}}>×</button>
                            </span>
                          ) : (
                            <button onClick={()=>{setEditTempo(chave); setValTempo(efetiva);}} style={{
                              fontFamily:"monospace",fontSize:12,fontWeight:800,cursor:"pointer",
                              color:aj?C.cyan:"#FFFFFF",background:"rgba(255,255,255,.03)",
                              border:`1px solid ${aj?C.cyan+"88":"rgba(255,255,255,.14)"}`,
                              borderRadius:7,padding:"4px 10px"}}>{efetiva}</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div style={{fontFamily:"monospace",fontSize:9.5,color:C.textDim,letterSpacing:".14em",margin:"2px 0 6px"}}>
                    CENÁRIOS HISTÓRICOS · {PG_CENARIOS.length} PARADAS REGISTRADAS
                  </div>
                  <div style={{maxHeight:372,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
                    {PG_CENARIOS.map(cn=>{
                      const aberto = cenAberto===cn.id;
                      return (
                        <div key={cn.id} style={{border:`1px solid ${aberto?C.cyan+"66":C.borderPG}`,borderRadius:10,overflow:"hidden"}}>
                          <div onClick={()=>setCenAberto(aberto?null:cn.id)} style={{display:"flex",alignItems:"center",
                            gap:9,padding:"8px 11px",cursor:"pointer",background:aberto?"rgba(0,240,255,.05)":"transparent"}}>
                            <span style={{fontFamily:"monospace",fontSize:9.5,color:C.textDim}}>{cn.id}</span>
                            <span style={{flex:1,fontSize:11.5,fontWeight:700,color:"#FFFFFF",overflow:"hidden",
                              textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cn.nome}</span>
                            {cn.data && <span style={{fontFamily:"monospace",fontSize:9,color:C.textDim}}>{cn.data}</span>}
                            <span style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:C.accent}}>{cn.total||"—"}</span>
                            <span style={{color:C.textDim,fontSize:11}}>{aberto?"▾":"▸"}</span>
                          </div>
                          {aberto && (
                            <div style={{padding:"4px 11px 9px",borderTop:"1px solid rgba(255,255,255,.05)"}}>
                              {cn.itens.map((it,i)=>{
                                const [seq,atv,dur,resp,ponte,bloco] = it;
                                const novoBloco = bloco && (i===0 || cn.itens[i-1][5]!==bloco);
                                return (
                                  <div key={i}>
                                    {novoBloco && <div style={{fontFamily:"monospace",fontSize:8.5,color:C.blue,
                                      letterSpacing:".12em",margin:"7px 0 3px"}}>{bloco.toUpperCase()}</div>}
                                    <div style={{display:"flex",gap:8,alignItems:"center",padding:"3px 0",fontSize:11}}>
                                      <span style={{fontFamily:"monospace",fontSize:9,color:C.textDim,minWidth:16}}>{String(seq).padStart(2,"0")}</span>
                                      <span style={{flex:1,color:"#C7D6E6",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{atv}</span>
                                      {ponte===1 && <span style={{fontFamily:"monospace",fontSize:8,fontWeight:800,color:C.warning,
                                        border:`1px solid ${C.warning}66`,borderRadius:4,padding:"0 4px"}}>PONTE</span>}
                                      {resp && <span style={{fontFamily:"monospace",fontSize:9,color:C.textDim}}>{resp}</span>}
                                      <span style={{fontFamily:"monospace",fontSize:10.5,fontWeight:700,color:C.cyan}}>{dur}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Sec>
          </div>

          <div style={{gridColumn:"1 / -1"}}>
            <Sec num="08" titulo="EDITOR DO PLANO · MARCOS E ATIVIDADES">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",marginBottom:6}}>
                    <span style={{fontFamily:"monospace",fontSize:9.5,color:C.textDim,letterSpacing:".14em",flex:1}}>MARCOS ({MARCOS.length})</span>
                    <button onClick={()=>{setEditMarco("__novo"); setFormMarco(["M"+Date.now(), "", "", "GERAL", ""]);}} style={{
                      fontFamily:"monospace",fontSize:10,fontWeight:800,color:C.accent,background:"rgba(0,230,118,.08)",
                      border:`1px solid ${C.accent}66`,borderRadius:7,padding:"3px 9px",cursor:"pointer"}}>+ NOVO</button>
                  </div>
                  <div style={{maxHeight:300,overflowY:"auto"}}>
                    {MARCOS.map(m=>{
                      const [id,ini,fim,maqM,titulo] = m;
                      if(editMarco===id) return (
                        <FormMarcoEdit key={id} v={formMarco} set={setFormMarco}
                          onSalvar={()=>{
                            salvarPlano("marcosEdit", {...(planoEdits.marcosEdit||{}), [id]:formMarco});
                            setEditMarco(null);
                          }} onCancelar={()=>setEditMarco(null)}/>
                      );
                      return (
                        <div key={id} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 0",
                          borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                          <span style={{fontFamily:"monospace",fontSize:9,fontWeight:700,color:CORMAQ[maqM]}}>{maqM}</span>
                          <span style={{flex:1,fontSize:11,color:"#E6EEF6",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{titulo}</span>
                          <span style={{fontFamily:"monospace",fontSize:9,color:C.textDim}}>{dh(ini)}</span>
                          <button onClick={()=>{setEditMarco(id); setFormMarco(m);}} style={{
                            background:"none",border:"none",color:C.cyan,cursor:"pointer",fontSize:12}}>✎</button>
                          <button onClick={()=>salvarPlano("marcosDel",[...(planoEdits.marcosDel||[]),id])} style={{
                            background:"none",border:"none",color:C.danger,cursor:"pointer",fontSize:12}}>×</button>
                        </div>
                      );
                    })}
                    {editMarco==="__novo" && (
                      <FormMarcoEdit v={formMarco} set={setFormMarco}
                        onSalvar={()=>{ salvarPlano("marcosAdd",[...(planoEdits.marcosAdd||[]),formMarco]); setEditMarco(null); }}
                        onCancelar={()=>setEditMarco(null)}/>
                    )}
                  </div>
                </div>
                <div>
                  <div style={{display:"flex",alignItems:"center",marginBottom:6}}>
                    <span style={{fontFamily:"monospace",fontSize:9.5,color:C.textDim,letterSpacing:".14em",flex:1}}>ATIVIDADES ({ATIV.length})</span>
                    <button onClick={()=>{setEditAtiv("__novo"); setFormAtiv(["A"+Date.now(), "GERAL", PG_AREAS_ATIV[0], "", "", "", "", 0]);}} style={{
                      fontFamily:"monospace",fontSize:10,fontWeight:800,color:C.accent,background:"rgba(0,230,118,.08)",
                      border:`1px solid ${C.accent}66`,borderRadius:7,padding:"3px 9px",cursor:"pointer"}}>+ NOVA</button>
                  </div>
                  <div style={{maxHeight:300,overflowY:"auto"}}>
                    {ATIV.map(a=>{
                      const [id,maqA,areaA,titulo,ini,fim] = a;
                      if(editAtiv===id) return (
                        <FormAtivEdit key={id} v={formAtiv} set={setFormAtiv}
                          onSalvar={()=>{ salvarPlano("ativEdit", {...(planoEdits.ativEdit||{}), [id]:formAtiv}); setEditAtiv(null); }}
                          onCancelar={()=>setEditAtiv(null)}/>
                      );
                      return (
                        <div key={id} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 0",
                          borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                          <span style={{fontFamily:"monospace",fontSize:9,fontWeight:700,color:CORMAQ[maqA]}}>{maqA}</span>
                          <span style={{flex:1,fontSize:11,color:"#E6EEF6",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{titulo}</span>
                          <span style={{fontFamily:"monospace",fontSize:9,color:C.textDim}}>{areaA}</span>
                          <button onClick={()=>{setEditAtiv(id); setFormAtiv(a);}} style={{
                            background:"none",border:"none",color:C.cyan,cursor:"pointer",fontSize:12}}>✎</button>
                          <button onClick={()=>salvarPlano("ativDel",[...(planoEdits.ativDel||[]),id])} style={{
                            background:"none",border:"none",color:C.danger,cursor:"pointer",fontSize:12}}>×</button>
                        </div>
                      );
                    })}
                    {editAtiv==="__novo" && (
                      <FormAtivEdit v={formAtiv} set={setFormAtiv}
                        onSalvar={()=>{ salvarPlano("ativAdd",[...(planoEdits.ativAdd||[]),formAtiv]); setEditAtiv(null); }}
                        onCancelar={()=>setEditAtiv(null)}/>
                    )}
                  </div>
                </div>
              </div>
              {(planoEdits.op) && <div style={{fontFamily:"monospace",fontSize:8.5,color:C.textDim,marginTop:10}}>
                última edição · {planoEdits.op} · {hm(planoEdits.ts)}
              </div>}
            </Sec>
          </div>
        </div>
      )}

      {/* ── Aba Pós-execução ── */}
      {aba==="blq" && (
        <Sec num="01" titulo="SALA DE BLOQUEIO · CAIXAS DE TRAVAMENTO">
          <SalaBloqueio/>
        </Sec>
      )}

      {aba==="pos" && (
        <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:14}}>
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

          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Sec num="02" titulo="SITUAÇÃO DA PARTIDA">
              {MARCOS.filter(m=>/instala|teste|passagem|produzindo/i.test(m[4])).map(m=>{
                const [id,ini,fim,maqM,titulo] = m;
                const tFim = new Date(fim||ini).getTime();
                const done = agora > tFim;
                const atual = agora>=new Date(ini).getTime() && agora<=tFim;
                return (
                  <div key={id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",
                    borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <span style={{width:7,height:7,borderRadius:"50%",flexShrink:0,
                      background:done?C.accent:atual?C.cyan:"rgba(255,255,255,.18)",
                      boxShadow:atual?`0 0 6px ${C.cyan}`:"none"}}/>
                    <span style={{flex:1,fontSize:11.5,color:done?C.textMuted:"#E6EEF6"}}>{titulo}</span>
                    <span style={{fontFamily:"monospace",fontSize:9,fontWeight:700,color:CORMAQ[maqM]}}>{maqM}</span>
                    <span style={{fontFamily:"monospace",fontSize:9,color:C.textDim}}>{dh(ini)}</span>
                  </div>
                );
              })}
            </Sec>

            <Sec num="03" titulo="PENDÊNCIAS · EQUIPAMENTOS EM ABERTO">
              {(()=>{
                const pend = [];
                for(const m of ["MQ2","MQ3","COMUM"]) for(const a of areasDe(m)) {
                  const dDoc = estados[docIdDe(m,a)];
                  for(const eq of PG_DATA[m][a]) {
                    const f = eq.itens.filter(([id])=>dDoc&&dDoc.itens&&dDoc.itens[id]&&dDoc.itens[id].ok).length;
                    if(f>0 && f<eq.itens.length) pend.push({m,a,eq,f,t:eq.itens.length});
                  }
                }
                if(!pend.length) return <div style={{fontFamily:"monospace",fontSize:11,color:C.textMuted}}>Nenhum equipamento parcialmente concluído.</div>;
                return pend.slice(0,10).map((p,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",
                    borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <span style={{flex:1,fontSize:11.5,color:"#E6EEF6",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {p.eq.local||p.eq.tag}</span>
                    <span style={{fontFamily:"monospace",fontSize:9,color:C.textDim}}>{p.a}</span>
                    <span style={{fontFamily:"monospace",fontSize:9,fontWeight:700,color:CORMAQ[p.m]}}>{p.m}</span>
                    <span style={{fontFamily:"monospace",fontSize:10.5,fontWeight:700,color:C.warning}}>{p.f}/{p.t}</span>
                  </div>
                ));
              })()}
            </Sec>

            <Sec num="04" titulo="LIBERAÇÕES POR ÁREA">
              {["MQ2","MQ3","COMUM"].filter(m=>PG_DATA[m]).flatMap(m=>areasDe(m).map(a=>{
                const f = feitosNoDoc(estados[docIdDe(m,a)]);
                const t = TOTAIS[m][a];
                const liberada = f===t;
                return (
                  <div key={m+a} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",
                    borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <span style={{width:7,height:7,borderRadius:"50%",flexShrink:0,
                      background:liberada?C.accent:"rgba(255,255,255,.18)"}}/>
                    <span style={{flex:1,fontSize:11.5,color:liberada?C.textMuted:"#E6EEF6"}}>{a}</span>
                    <span style={{fontFamily:"monospace",fontSize:9,fontWeight:700,color:CORMAQ[m]}}>{m}</span>
                    <span style={{fontFamily:"monospace",fontSize:9,fontWeight:800,
                      color:liberada?C.accent:C.textDim}}>{liberada?"LIBERADA":`${f}/${t}`}</span>
                  </div>
                );
              }))}
            </Sec>
          </div>
        </div>
      )}
    </div>
  );
}
