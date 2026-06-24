// ─── avarias.jsx — Inspeção de Avarias + Analytics · Enfardamento · Secagem H2
// AvariasTela: wizard de registro (sem emojis)
// AvariasAnalytics: gráfico por turno + top3 + filtro letra (para histórico)
// PainelAvariasTV: card do Dashboard TV
import { useState, useRef, useCallback, useEffect } from "react";
import { COL, doc, setDoc, onSnapshot } from "./firebase";

const C = {
  bg:"#04111D", surface:"#071828", card:"#0A1929",
  accent:"#00E676", accentDark:"#006B2E", accentLight:"#00E676",
  blue:"#0E2847", blueLight:"#1A5CCC",
  warning:"#b87d00", warningLight:"#FFC107",
  danger:"#c0272d", dangerLight:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880",
  border:"rgba(60,255,140,0.15)", tagBg:"rgba(255,255,255,0.04)",
};

const storageGet = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const storageSet = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} };
const hoje = () => new Date().toISOString().slice(0,10);
const horaAtual = () => { const a=new Date(); return `${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`; };
const calcularLetra = () => { const h=new Date().getHours(); if(h<8)return"C"; if(h<16)return"A"; return"B"; };
const maqDaLinha = (l) => ["L4","L5"].includes(l)?"M2":"M3";
const mesAtual = () => new Date().toISOString().slice(0,7); // "2025-06"

const LINHAS = ["L4","L5","L6","L7","L8"];
const MAX_W = 1280, MAX_H = 720, QUALITY = 0.80;

export const TIPOS_AVARIA = [
  { id:"alt_linha",    label:"Diferença de altura",     cor:"#5090FF" },
  { id:"capa_rasgada", label:"Capa rasgada",            cor:"#FF5252" },
  { id:"sem_capa",     label:"Faltando capa",           cor:"#FF8C00" },
  { id:"arame_esp",    label:"Arame espaçado",          cor:"#FFC107" },
  { id:"arame_cod",    label:"Arame sobre o código",    cor:"#C77DFF" },
  { id:"sem_imp",      label:"Falta de impressão",      cor:"#00F0FF" },
  { id:"sem_logo",     label:"Unit sem logo",           cor:"#00E676" },
];

// ── Compressão ───────────────────────────────────────────────────────────────
function comprimirImagem(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width:w, height:h } = img;
      const ratio = Math.min(MAX_W/w, MAX_H/h, 1);
      w = Math.round(w*ratio); h = Math.round(h*ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img,0,0,w,h);
      const base64 = canvas.toDataURL("image/jpeg", QUALITY);
      URL.revokeObjectURL(url);
      resolve({ base64, kb: Math.round((base64.length*3)/4/1024), w, h });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Falha")); };
    img.src = url;
  });
}

// bezier path
function bPath(pts) {
  if(pts.length<2) return "";
  const p=pts.map(s=>{const[x,y]=s.split(",").map(Number);return{x,y};});
  let d=`M${p[0].x},${p[0].y}`;
  for(let i=1;i<p.length;i++){const c=(p[i-1].x+p[i].x)/2;d+=` C${c},${p[i-1].y} ${c},${p[i].y} ${p[i].x},${p[i].y}`;}
  return d;
}

// ── AvariasTela (wizard de registro) ────────────────────────────────────────
export function AvariasTela({ onSalvar, turno, letra:letraProp, opPU, opPainel, data }) {
  const hora = horaAtual();
  const letra = calcularLetra();
  const [passo, setPasso]       = useState(1);
  const [linha, setLinha]       = useState("L4");
  const [contadores, setContadores] = useState(() => Object.fromEntries(TIPOS_AVARIA.map(t=>[t.id,0])));
  const [fotos, setFotos]       = useState(() => Object.fromEntries(TIPOS_AVARIA.map(t=>[t.id,[]])));
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo]       = useState(false);
  const [fotoProc, setFotoProc] = useState(null);
  const inputRefs = useRef({});

  const totalAvarias = Object.values(contadores).reduce((a,b)=>a+b,0);
  const tiposComAvaria = TIPOS_AVARIA.filter(t=>contadores[t.id]>0);

  const setContador = (id, val) => setContadores(prev=>({...prev,[id]:Math.max(0,Math.min(8,val))}));

  const onFotoChange = useCallback(async (tipoId, e) => {
    const files = Array.from(e.target.files||[]);
    if(!files.length) return;
    setFotoProc(tipoId);
    const novas = [];
    for(const file of files) {
      if(!file.type.startsWith("image/")) continue;
      try { novas.push(await comprimirImagem(file)); } catch {}
    }
    setFotos(prev=>({...prev,[tipoId]:[...(prev[tipoId]||[]),...novas]}));
    setFotoProc(null);
    e.target.value = "";
  }, []);

  const removerFoto = (tipoId, idx) =>
    setFotos(prev=>({...prev,[tipoId]:prev[tipoId].filter((_,i)=>i!==idx)}));

  const salvar = async (teveAvaria) => {
    setSalvando(true);
    const opConfig = storageGet("op_config")||{};
    const registro = {
      id: Date.now(),
      tipoId: "avaria_enf",
      tipoLabel: "Inspeção de Avarias",
      linha, maquina: maqDaLinha(linha),
      turno: turno||(storageGet("turno_ativo")||""),
      letra: letraProp||letra, hora,
      data: data||hoje(),
      matricula: opConfig.matricula||"",
      opPU: opPU||"", opPainel: opPainel||"",
      teveAvaria,
      totalAvarias: teveAvaria?totalAvarias:0,
      itens: teveAvaria?TIPOS_AVARIA.map(t=>({
        id:t.id, label:t.label,
        quantidade:contadores[t.id],
        fotos:(fotos[t.id]||[]).map(f=>({base64:f.base64,kb:f.kb})),
      })):[],
    };
    try {
      const hist = storageGet("historico_h2")||[];
      hist.push(registro);
      storageSet("historico_h2",hist);
      await setDoc(doc(COL,"historico_h2"),{val:hist,ts:Date.now()});

      const avHist = storageGet("avarias_h2")||[];
      avHist.push({
        id:registro.id, data:registro.data, turno:registro.turno,
        letra:registro.letra, linha, maquina:registro.maquina,
        teveAvaria, total:registro.totalAvarias,
        itens:registro.itens.filter(i=>i.quantidade>0).map(i=>({id:i.id,label:i.label,quantidade:i.quantidade})),
      });
      storageSet("avarias_h2",avHist);
      await setDoc(doc(COL,"avarias_h2"),{val:avHist,ts:Date.now()});

      setSalvo(true);
      if(onSalvar) onSalvar(registro);
    } catch(e) { alert("Erro ao salvar: "+e.message); }
    setSalvando(false);
  };

  if(salvo) return (
    <div style={{background:C.card,border:`1px solid ${C.accentLight}44`,borderTop:`3px solid ${C.accentLight}`,borderRadius:12,padding:24,textAlign:"center"}}>
      <div style={{color:C.accentLight,fontWeight:800,fontSize:18,marginBottom:6}}>Inspeção salva</div>
      <div style={{color:C.textMuted,fontSize:13,marginBottom:4}}>Linha {linha} · {maqDaLinha(linha)} · Turno {letraProp||letra}</div>
      <div style={{fontFamily:"monospace",fontSize:28,fontWeight:900,color:totalAvarias>0?C.dangerLight:C.accentLight,marginTop:12}}>
        {totalAvarias>0?`${totalAvarias} avaria${totalAvarias>1?"s":""}`:"Sem avarias"}
      </div>
    </div>
  );

  return (
    <div>
      {/* Linha */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.accentLight}`,borderRadius:12,padding:14,marginBottom:12}}>
        <div style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Linha</div>
        <div style={{display:"flex",gap:8}}>
          {LINHAS.map(l=>{
            const ativo=linha===l;
            return(
              <button key={l} onClick={()=>setLinha(l)}
                style={{flex:1,padding:"10px 4px",borderRadius:10,cursor:"pointer",
                  border:`2px solid ${ativo?"rgba(255,255,255,0.55)":C.border}`,
                  background:ativo?"#0E2847":C.tagBg,color:ativo?"#fff":C.textMuted,
                  fontWeight:ativo?800:500,fontSize:13,
                  boxShadow:ativo?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4)":"none"}}>
                {l}<div style={{fontSize:8,opacity:.6,marginTop:2}}>{maqDaLinha(l)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Passo 1 */}
      {passo===1&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.warningLight}`,borderRadius:12,padding:20,textAlign:"center"}}>
          <div style={{color:C.text,fontWeight:800,fontSize:16,marginBottom:6}}>Inspeção de Avarias</div>
          <div style={{color:C.textMuted,fontSize:13,marginBottom:24}}>Houve avaria neste turno na linha <strong style={{color:C.accentLight}}>{linha}</strong>?</div>
          <div style={{display:"flex",gap:12}}>
            <button onClick={()=>salvar(false)} disabled={salvando}
              style={{flex:1,padding:"16px",borderRadius:12,cursor:"pointer",fontWeight:800,fontSize:15,
                background:C.accentDark,border:`2px solid ${C.accentLight}`,color:C.accentLight}}>
              Nao houve avaria
            </button>
            <button onClick={()=>setPasso(2)}
              style={{flex:1,padding:"16px",borderRadius:12,cursor:"pointer",fontWeight:800,fontSize:15,
                background:C.danger+"33",border:`2px solid ${C.dangerLight}`,color:C.dangerLight}}>
              Sim, houve avaria
            </button>
          </div>
        </div>
      )}

      {/* Passo 2 — contadores */}
      {passo===2&&(
        <div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.dangerLight}`,borderRadius:12,padding:14,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{color:C.text,fontWeight:800,fontSize:14}}>Tipos de avaria</div>
              {totalAvarias>0&&(
                <div style={{background:C.dangerLight+"22",border:`1px solid ${C.dangerLight}44`,borderRadius:20,padding:"3px 12px"}}>
                  <span style={{fontFamily:"monospace",fontWeight:900,fontSize:14,color:C.dangerLight}}>{totalAvarias}</span>
                  <span style={{fontSize:10,color:C.textDim,marginLeft:4}}>total</span>
                </div>
              )}
            </div>
            {TIPOS_AVARIA.map(tipo=>{
              const n=contadores[tipo.id];
              const fotosT=fotos[tipo.id]||[];
              return(
                <div key={tipo.id} style={{
                  background:n>0?"rgba(192,39,45,0.08)":C.tagBg,
                  border:`1px solid ${n>0?C.dangerLight+"44":C.border}`,
                  borderLeft:`3px solid ${n>0?tipo.cor:C.textDim}`,
                  borderRadius:10,padding:12,marginBottom:10,transition:"all .2s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{color:n>0?C.text:C.textMuted,fontWeight:n>0?700:500,fontSize:13}}>{tipo.label}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                      <button onClick={()=>setContador(tipo.id,n-1)}
                        style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.border}`,
                          background:C.tagBg,color:C.textMuted,cursor:"pointer",fontSize:18,fontWeight:900,
                          opacity:n===0?0.3:1}}>−</button>
                      <input type="number" value={n} min={0} max={8}
                        onChange={e=>setContador(tipo.id,parseInt(e.target.value,10)||0)}
                        style={{width:40,textAlign:"center",background:"transparent",border:"none",
                          color:n>0?C.dangerLight:C.textMuted,fontFamily:"monospace",fontWeight:900,
                          fontSize:20,outline:"none"}}/>
                      <button onClick={()=>setContador(tipo.id,n+1)}
                        style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.border}`,
                          background:C.tagBg,color:C.textMuted,cursor:"pointer",fontSize:18,fontWeight:900,
                          opacity:n===8?0.3:1}}>+</button>
                    </div>
                  </div>
                  {n>0&&(
                    <div style={{marginTop:8}}>
                      <input ref={el=>inputRefs.current[tipo.id]=el} type="file"
                        accept="image/*" multiple onChange={e=>onFotoChange(tipo.id,e)} style={{display:"none"}}/>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                        {fotosT.map((f,fi)=>(
                          <div key={fi} style={{position:"relative",width:60,height:44}}>
                            <img src={f.base64} style={{width:60,height:44,objectFit:"cover",borderRadius:6,border:`1px solid ${C.border}`}}/>
                            <button onClick={()=>removerFoto(tipo.id,fi)}
                              style={{position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:"50%",
                                background:C.dangerLight,border:"none",color:"#fff",fontSize:10,
                                cursor:"pointer",fontWeight:900,padding:0}}>x</button>
                          </div>
                        ))}
                        <button onClick={()=>inputRefs.current[tipo.id]?.click()} disabled={fotoProc===tipo.id}
                          style={{height:44,padding:"0 10px",borderRadius:8,cursor:"pointer",
                            border:`1px dashed ${C.border}`,background:"transparent",
                            color:fotoProc===tipo.id?C.textDim:C.textMuted,fontSize:11,fontWeight:600,
                            display:"flex",alignItems:"center",gap:4}}>
                          {fotoProc===tipo.id?"Processando...":"+ Foto"}
                        </button>
                        {fotosT.length>0&&<span style={{fontSize:10,color:C.textDim}}>{fotosT.length} foto{fotosT.length>1?"s":""}</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setPasso(1)}
              style={{flex:1,padding:13,borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,
                background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted}}>
              Voltar
            </button>
            <button onClick={()=>setPasso(3)} disabled={totalAvarias===0}
              style={{flex:2,padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,
                background:totalAvarias>0?"linear-gradient(135deg,#c0272d,#FF5252)":C.tagBg,
                border:`1px solid ${totalAvarias>0?C.dangerLight:C.border}`,
                color:totalAvarias>0?"#fff":C.textDim,opacity:totalAvarias===0?0.5:1}}>
              Revisar ({totalAvarias} avaria{totalAvarias!==1?"s":""})
            </button>
          </div>
        </div>
      )}

      {/* Passo 3 — resumo */}
      {passo===3&&(
        <div>
          <div style={{background:C.card,border:`1px solid ${C.dangerLight}44`,borderTop:`3px solid ${C.dangerLight}`,borderRadius:12,padding:16,marginBottom:12}}>
            <div style={{color:C.text,fontWeight:800,fontSize:15,marginBottom:4}}>Resumo da Inspeção</div>
            <div style={{color:C.textMuted,fontSize:12,marginBottom:14}}>Linha {linha} · {maqDaLinha(linha)} · Turno {letraProp||letra}</div>
            <div style={{textAlign:"center",padding:"16px 0",borderBottom:`1px solid ${C.border}`,marginBottom:14}}>
              <div style={{fontFamily:"monospace",fontSize:52,fontWeight:900,color:C.dangerLight,lineHeight:1,
                textShadow:`0 0 20px ${C.dangerLight}66`}}>{totalAvarias}</div>
              <div style={{fontSize:12,color:C.textMuted,marginTop:4}}>avaria{totalAvarias!==1?"s":""} registrada{totalAvarias!==1?"s":""}</div>
            </div>
            {tiposComAvaria.map(tipo=>{
              const fts=fotos[tipo.id]||[];
              return(
                <div key={tipo.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:4,height:32,borderRadius:2,background:tipo.cor,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{color:C.text,fontSize:13,fontWeight:600}}>{tipo.label}</div>
                    {fts.length>0&&(
                      <div style={{display:"flex",gap:4,marginTop:4}}>
                        {fts.map((f,fi)=>(
                          <img key={fi} src={f.base64} style={{width:40,height:30,objectFit:"cover",borderRadius:4,border:`1px solid ${C.border}`}}/>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{fontFamily:"monospace",fontWeight:900,fontSize:18,color:C.dangerLight}}>{contadores[tipo.id]}</div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setPasso(2)}
              style={{flex:1,padding:13,borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,
                background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted}}>
              Corrigir
            </button>
            <button onClick={()=>salvar(true)} disabled={salvando}
              style={{flex:2,padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,
                background:"linear-gradient(135deg,#c0272d,#FF5252)",border:"none",color:"#fff",
                opacity:salvando?0.6:1}}>
              {salvando?"Salvando...":"Confirmar e Salvar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AvariasAnalytics (tela do historico — filtro letra + grafico + top3) ──────
export function AvariasAnalytics({ avariasData, perfil }) {
  const dados = Array.isArray(avariasData)?avariasData:[];
  const podeVerLetra = perfil?.funcao==="operador_painel"||perfil?.funcao==="supervisor"||perfil?.funcao==="dev";
  const [filtroLetra, setFiltroLetra] = useState("TODAS");
  const [filtroLinha, setFiltroLinha] = useState("TODAS");

  const LETRAS = ["TODAS","A","B","C"];

  const filtrados = dados.filter(r=>{
    if(filtroLetra!=="TODAS"&&r.letra!==filtroLetra) return false;
    if(filtroLinha!=="TODAS"&&r.linha!==filtroLinha) return false;
    return true;
  });

  // Últimos 15 registros com avaria para o gráfico
  const comAvaria = filtrados.filter(r=>r.teveAvaria);
  const ultimos = [...filtrados].sort((a,b)=>b.id-a.id).slice(0,20).reverse();

  // Top 3 tipos
  const contTipos = {};
  TIPOS_AVARIA.forEach(t=>{ contTipos[t.id]=0; });
  comAvaria.forEach(r=>{ r.itens?.forEach(it=>{ if(contTipos[it.id]!==undefined) contTipos[it.id]+=it.quantidade; }); });
  const top3 = TIPOS_AVARIA.map(t=>({...t,total:contTipos[t.id]})).sort((a,b)=>b.total-a.total).slice(0,3);
  const maxTop = Math.max(1,...top3.map(t=>t.total));

  // Gráfico de linha — pontos por turno
  const W=280,H=70,PAD=8;
  const vals = ultimos.map(r=>r.teveAvaria?r.total:0);
  const maxV = Math.max(1,...vals);
  const xOf = (i)=>PAD+(i/(Math.max(1,ultimos.length-1)))*(W-PAD*2);
  const yOf = (v)=>H-PAD-((v/maxV)*(H-PAD*2));
  const pts = vals.map((v,i)=>`${xOf(i)},${yOf(v)}`);
  const linha = bPath(pts);
  const area = linha?linha+` L${xOf(vals.length-1)},${H-PAD} L${xOf(0)},${H-PAD} Z`:"";

  const totalMes = dados.filter(r=>r.data?.slice(0,7)===mesAtual()&&r.teveAvaria).reduce((s,r)=>s+r.total,0);

  return (
    <div>
      {/* Filtros */}
      {podeVerLetra&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:12}}>
          <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Filtrar por letra de turno</div>
          <div style={{display:"flex",gap:6}}>
            {LETRAS.map(l=>{
              const ativo=filtroLetra===l;
              return(
                <button key={l} onClick={()=>setFiltroLetra(l)}
                  style={{flex:1,padding:"8px 4px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,
                    border:`2px solid ${ativo?C.accentLight:C.border}`,
                    background:ativo?C.accentDark:C.tagBg,
                    color:ativo?C.accentLight:C.textMuted}}>
                  {l==="TODAS"?"Todas":l}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtro por linha */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:12}}>
        <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Linha</div>
        <div style={{display:"flex",gap:6}}>
          {["TODAS",...LINHAS].map(l=>{
            const ativo=filtroLinha===l;
            return(
              <button key={l} onClick={()=>setFiltroLinha(l)}
                style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:700,
                  border:`2px solid ${ativo?"rgba(255,255,255,0.55)":C.border}`,
                  background:ativo?"#0E2847":C.tagBg,
                  color:ativo?"#fff":C.textMuted}}>
                {l==="TODAS"?"Todas":l}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grafico de linha */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.dangerLight}`,borderRadius:12,padding:14,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Avarias por turno</span>
          <span style={{fontSize:9,color:C.textDim}}>{ultimos.length} turnos</span>
        </div>
        {ultimos.length>0?(
          <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:"block"}}>
            <defs>
              <linearGradient id="avFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.dangerLight} stopOpacity="0.25"/>
                <stop offset="100%" stopColor={C.dangerLight} stopOpacity="0.02"/>
              </linearGradient>
            </defs>
            {area&&<path d={area} fill="url(#avFill)"/>}
            {linha&&<path d={linha} fill="none" stroke={C.dangerLight} strokeWidth="2"
              strokeLinejoin="round" strokeLinecap="round"
              style={{filter:`drop-shadow(0 0 4px ${C.dangerLight}aa)`}}/>}
            {vals.map((v,i)=>(
              <circle key={i} cx={xOf(i)} cy={yOf(v)} r="3"
                fill={v>0?C.dangerLight:C.textDim}
                style={{filter:v>0?`drop-shadow(0 0 4px ${C.dangerLight})`:"none"}}/>
            ))}
            {/* labels últimos 3 */}
            {ultimos.slice(-3).map((r,i)=>{
              const idx=ultimos.length-3+i;
              const v=vals[idx];
              return v>0?(
                <text key={i} x={xOf(idx)} y={yOf(v)-6} textAnchor="middle"
                  fontSize="8" fill={C.dangerLight} fontFamily="monospace" fontWeight="700">{v}</text>
              ):null;
            })}
          </svg>
        ):(
          <div style={{height:H,display:"flex",alignItems:"center",justifyContent:"center",color:C.textDim,fontSize:12}}>
            Sem registros
          </div>
        )}
      </div>

      {/* Top 3 */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.warningLight}`,borderRadius:12,padding:14,marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>
          Top 3 tipos de avaria
        </div>
        {top3.map((t,i)=>(
          <div key={t.id} style={{marginBottom:i<2?12:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontFamily:"monospace",fontSize:11,color:C.textDim,fontWeight:700,minWidth:16}}>#{i+1}</span>
                <span style={{fontSize:13,color:t.total>0?C.text:C.textDim,fontWeight:t.total>0?600:400}}>{t.label}</span>
              </div>
              <span style={{fontFamily:"monospace",fontSize:15,fontWeight:900,color:t.total>0?t.cor:C.textDim}}>{t.total}</span>
            </div>
            <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}>
              <div style={{height:"100%",width:`${(t.total/maxTop)*100}%`,borderRadius:3,
                background:t.cor,transition:"width .5s",
                boxShadow:t.total>0?`0 0 8px ${t.cor}88`:"none"}}/>
            </div>
          </div>
        ))}
        {comAvaria.length===0&&(
          <div style={{textAlign:"center",color:C.textDim,fontSize:12,padding:"12px 0"}}>Sem avarias no periodo</div>
        )}
      </div>

      {/* Total mes */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{color:C.textMuted,fontSize:12}}>Acumulado do mes</div>
        <div style={{fontFamily:"monospace",fontSize:28,fontWeight:900,color:totalMes>0?C.dangerLight:C.accentLight,
          textShadow:totalMes>0?`0 0 14px ${C.dangerLight}66`:"none"}}>{totalMes}</div>
      </div>
    </div>
  );
}

// ── PainelAvariasTV (card do Dashboard) ──────────────────────────────────────
export function PainelAvariasTV({ avariasData, setTela }) {
  const dados = Array.isArray(avariasData)?avariasData:[];
  const mes = mesAtual();

  const totalMes = dados.filter(r=>r.data?.slice(0,7)===mes&&r.teveAvaria).reduce((s,r)=>s+r.total,0);

  // Gráfico: últimos 10 dias × 3 turnos
  const shiftBounds=[];
  for(let day=0;day<10;day++){
    const d=new Date(); d.setDate(d.getDate()-9+day);
    const ds=d.toISOString().slice(0,10);
    for(const lt of["A","B","C"]){
      shiftBounds.push({data:ds,letra:lt,label:`${ds.slice(8,10)}/${ds.slice(5,7)} ${lt}`});
    }
  }
  const vals=shiftBounds.map(s=>{
    const recs=dados.filter(r=>r.data===s.data&&r.letra===s.letra&&r.teveAvaria);
    return recs.reduce((a,r)=>a+r.total,0);
  });

  const W=260,H=60,PAD=6;
  const maxV=Math.max(1,...vals);
  const xOf=(i)=>PAD+(i/(Math.max(1,shiftBounds.length-1)))*(W-PAD*2);
  const yOf=(v)=>H-PAD-((v/maxV)*(H-PAD*2));
  const pts=vals.map((v,i)=>`${xOf(i)},${yOf(v)}`);
  const linha=bPath(pts);
  const area=linha?linha+` L${xOf(vals.length-1)},${H-PAD} L${xOf(0)},${H-PAD} Z`:"";

  // Top 3
  const contTipos={};
  TIPOS_AVARIA.forEach(t=>{contTipos[t.id]=0;});
  dados.filter(r=>r.data?.slice(0,7)===mes&&r.teveAvaria)
    .forEach(r=>{r.itens?.forEach(it=>{if(contTipos[it.id]!==undefined)contTipos[it.id]+=it.quantidade;});});
  const top3=TIPOS_AVARIA.map(t=>({...t,total:contTipos[t.id]})).sort((a,b)=>b.total-a.total).slice(0,3);
  const maxTop=Math.max(1,...top3.map(t=>t.total));
  const corTopo=totalMes===0?C.accentLight:totalMes<=10?C.warningLight:C.dangerLight;

  return(
    <div onClick={()=>setTela&&setTela("historico")} style={{
      background:C.card,border:`1px solid ${totalMes>0?C.dangerLight+"44":C.border}`,
      borderTop:`3px solid ${corTopo}`,borderRadius:14,padding:"14px 18px 12px",
      cursor:"pointer",display:"flex",flexDirection:"column",gap:10,overflow:"hidden",
      boxShadow:`0 2px 16px rgba(0,0,0,.5)`,height:"100%",boxSizing:"border-box"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:11,fontWeight:800,color:C.textMuted,letterSpacing:"0.09em",textTransform:"uppercase"}}>Avarias por Turno</span>
        <span style={{fontSize:12,color:C.textDim,opacity:.6}}>›</span>
      </div>

      {/* Numero do mes */}
      <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
        <span style={{fontFamily:"monospace",fontSize:42,fontWeight:900,color:corTopo,lineHeight:1,
          textShadow:`0 0 20px ${corTopo}66`}}>{totalMes}</span>
        <span style={{fontSize:11,color:C.textMuted,marginBottom:6}}>no mes</span>
      </div>

      {/* Grafico */}
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:"block"}}>
        <defs>
          <linearGradient id="avTVFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={corTopo} stopOpacity="0.2"/>
            <stop offset="100%" stopColor={corTopo} stopOpacity="0.01"/>
          </linearGradient>
        </defs>
        {area&&<path d={area} fill="url(#avTVFill)"/>}
        {linha&&<path d={linha} fill="none" stroke={corTopo} strokeWidth="1.5"
          strokeLinejoin="round" strokeLinecap="round"
          style={{filter:`drop-shadow(0 0 3px ${corTopo}aa)`}}/>}
        {vals.map((v,i)=>v>0?(
          <circle key={i} cx={xOf(i)} cy={yOf(v)} r="2.5" fill={corTopo}
            style={{filter:`drop-shadow(0 0 3px ${corTopo})`}}/>
        ):null)}
      </svg>

      {/* Top 3 */}
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {top3.map((t,i)=>(
          <div key={t.id}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
              <span style={{fontSize:9,color:t.total>0?C.textMuted:C.textDim}}>#{i+1} {t.label}</span>
              <span style={{fontFamily:"monospace",fontSize:10,fontWeight:900,color:t.total>0?t.cor:C.textDim}}>{t.total}</span>
            </div>
            <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}>
              <div style={{height:"100%",width:`${(t.total/maxTop)*100}%`,borderRadius:2,
                background:t.cor,boxShadow:t.total>0?`0 0 5px ${t.cor}88`:"none",transition:"width .5s"}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
