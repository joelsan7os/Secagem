// ─── avarias.jsx — Inspeção de Avarias + Analytics · Enfardamento · Secagem H2
// AvariasTela: wizard por avaria individual (motivo → linha → lote/unit → foto)
// AvariasAnalytics: ranking por linha + por motivo + filtros
// PainelAvariasTV: card do Dashboard TV
import { useState, useRef, useCallback } from "react";
import { COL, doc, setDoc } from "./firebase";

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
const mesAtual = () => new Date().toISOString().slice(0,7);

const LINHAS = ["L4","L5","L6","L7","L8"];
const COR_LINHA = { L4:"#5090FF", L5:"#00E676", L6:"#FFC107", L7:"#FF8C00", L8:"#C77DFF" };
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

// ── FormAvaria — formulário de uma avaria individual ─────────────────────────
function FormAvaria({ index, onSalvar, onCancelar }) {
  const [tipoId, setTipoId]   = useState(null);
  const [linha, setLinha]     = useState(null);
  const [lote, setLote]       = useState("");
  const [unidade, setUnidade] = useState("");
  const [fotos, setFotos]     = useState([]);
  const [fotoProc, setFotoProc] = useState(false);
  const inputRef = useRef(null);

  const tipo = TIPOS_AVARIA.find(t=>t.id===tipoId);
  const pronto = tipoId && linha && (lote || unidade);

  const onFotoChange = useCallback(async (e) => {
    const files = Array.from(e.target.files||[]);
    if(!files.length) return;
    setFotoProc(true);
    const novas = [];
    for(const file of files) {
      if(!file.type.startsWith("image/")) continue;
      try { novas.push(await comprimirImagem(file)); } catch {}
    }
    setFotos(prev=>[...prev,...novas]);
    setFotoProc(false);
    e.target.value = "";
  }, []);

  const confirmar = () => {
    if(!pronto) return;
    onSalvar({
      tipoId, tipoLabel: tipo.label, tipoColor: tipo.cor,
      linha, maquina: maqDaLinha(linha),
      lote: lote.trim(), unidade: unidade.trim(),
      fotos: fotos.map(f=>({base64:f.base64,kb:f.kb})),
    });
  };

  return (
    <div style={{background:C.card,border:`1px solid ${C.dangerLight}33`,borderTop:`3px solid ${C.dangerLight}`,borderRadius:12,padding:16,marginBottom:12}}>
      <div style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>
        Avaria #{index+1}
      </div>

      {/* Motivo */}
      <div style={{marginBottom:14}}>
        <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Motivo</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {TIPOS_AVARIA.map(t=>{
            const ativo = tipoId===t.id;
            return (
              <button key={t.id} onClick={()=>setTipoId(t.id)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,cursor:"pointer",textAlign:"left",
                  border:`2px solid ${ativo?t.cor+"99":C.border}`,
                  background:ativo?t.cor+"18":C.tagBg,
                  boxShadow:ativo?`0 0 10px ${t.cor}44`:"none",transition:"all .15s"}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:ativo?t.cor:C.textDim,flexShrink:0,
                  boxShadow:ativo?`0 0 6px ${t.cor}`:"none"}}/>
                <span style={{color:ativo?C.text:C.textMuted,fontWeight:ativo?700:500,fontSize:13}}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Linha */}
      {tipoId && (
        <div style={{marginBottom:14}}>
          <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Linha</div>
          <div style={{display:"flex",gap:8}}>
            {LINHAS.map(l=>{
              const ativo=linha===l;
              const cor=COR_LINHA[l];
              return (
                <button key={l} onClick={()=>setLinha(l)}
                  style={{flex:1,padding:"10px 4px",borderRadius:10,cursor:"pointer",
                    border:`2px solid ${ativo?cor+"99":C.border}`,
                    background:ativo?cor+"18":C.tagBg,
                    color:ativo?cor:C.textMuted,fontWeight:ativo?800:500,fontSize:13,
                    boxShadow:ativo?`0 0 10px ${cor}44`:"none",transition:"all .15s"}}>
                  {l}
                  <div style={{fontSize:8,opacity:.7,marginTop:2}}>{maqDaLinha(l)}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lote / Unidade */}
      {linha && (
        <div style={{marginBottom:14}}>
          <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Lote / Unidade</div>
          <div style={{display:"flex",gap:8}}>
            <input
              value={lote} onChange={e=>setLote(e.target.value)}
              placeholder="Lote"
              style={{flex:1,padding:"10px 12px",borderRadius:10,background:C.tagBg,
                border:`1px solid ${lote?C.accentLight+"55":C.border}`,color:C.text,
                fontFamily:"monospace",fontSize:14,outline:"none"}}/>
            <input
              value={unidade} onChange={e=>setUnidade(e.target.value)}
              placeholder="Unidade"
              style={{flex:1,padding:"10px 12px",borderRadius:10,background:C.tagBg,
                border:`1px solid ${unidade?C.accentLight+"55":C.border}`,color:C.text,
                fontFamily:"monospace",fontSize:14,outline:"none"}}/>
          </div>
        </div>
      )}

      {/* Foto */}
      {linha && (
        <div style={{marginBottom:14}}>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={onFotoChange} style={{display:"none"}}/>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            {fotos.map((f,fi)=>(
              <div key={fi} style={{position:"relative",width:60,height:44}}>
                <img src={f.base64} style={{width:60,height:44,objectFit:"cover",borderRadius:6,border:`1px solid ${C.border}`}}/>
                <button onClick={()=>setFotos(prev=>prev.filter((_,i)=>i!==fi))}
                  style={{position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:"50%",
                    background:C.dangerLight,border:"none",color:"#fff",fontSize:10,cursor:"pointer",fontWeight:900,padding:0}}>x</button>
              </div>
            ))}
            <button onClick={()=>inputRef.current?.click()} disabled={fotoProc}
              style={{height:44,padding:"0 12px",borderRadius:8,cursor:"pointer",
                border:`1px dashed ${C.border}`,background:"transparent",
                color:fotoProc?C.textDim:C.textMuted,fontSize:11,fontWeight:600}}>
              {fotoProc?"Processando...":"+ Foto"}
            </button>
          </div>
        </div>
      )}

      {/* Ações */}
      <div style={{display:"flex",gap:8}}>
        <button onClick={onCancelar}
          style={{flex:1,padding:"11px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,
            background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted}}>
          Cancelar
        </button>
        <button onClick={confirmar} disabled={!pronto}
          style={{flex:2,padding:"11px",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,
            background:pronto?"linear-gradient(135deg,#c0272d,#FF5252)":C.tagBg,
            border:`1px solid ${pronto?C.dangerLight:C.border}`,
            color:pronto?"#fff":C.textDim,opacity:pronto?1:0.5}}>
          Confirmar avaria
        </button>
      </div>
    </div>
  );
}

// ── AvariasTela (wizard principal) ───────────────────────────────────────────
export function AvariasTela({ onSalvar, turno, letra:letraProp, opPU, opPainel, data }) {
  const letra = calcularLetra();
  const [passo, setPasso]         = useState(1); // 1=pergunta, 2=lista avarias, 3=resumo
  const [avarias, setAvarias]     = useState([]); // avarias confirmadas
  const [adicionando, setAdicionando] = useState(false);
  const [salvando, setSalvando]   = useState(false);
  const [salvo, setSalvo]         = useState(false);

  const onNovaAvaria = (av) => {
    setAvarias(prev=>[...prev,av]);
    setAdicionando(false);
  };

  const removerAvaria = (idx) => setAvarias(prev=>prev.filter((_,i)=>i!==idx));

  const salvar = async (teveAvaria) => {
    setSalvando(true);
    const hora = horaAtual();
    const opConfig = storageGet("op_config")||{};
    const registro = {
      id: Date.now(),
      tipoId: "avaria_enf",
      tipoLabel: "Inspeção de Avarias",
      turno: turno||(storageGet("turno_ativo")||""),
      letra: letraProp||letra, hora,
      data: data||hoje(),
      matricula: opConfig.matricula||"",
      opPU: opPU||"", opPainel: opPainel||"",
      teveAvaria,
      totalAvarias: teveAvaria?avarias.length:0,
      avarias: teveAvaria?avarias:[],
      // compatibilidade retroativa — itens aggregados por tipo
      itens: teveAvaria?TIPOS_AVARIA.map(t=>({
        id:t.id, label:t.label,
        quantidade: avarias.filter(a=>a.tipoId===t.id).length,
      })).filter(i=>i.quantidade>0):[],
    };
    try {
      const hist = storageGet("historico_h2")||[];
      hist.push(registro);
      storageSet("historico_h2",hist);
      await setDoc(doc(COL,"historico_h2"),{val:hist,ts:Date.now()});

      const avHist = storageGet("avarias_h2")||[];
      avHist.push({
        id:registro.id, data:registro.data, turno:registro.turno,
        letra:registro.letra, hora:registro.hora,
        teveAvaria, total:registro.totalAvarias,
        avarias:registro.avarias,
        itens:registro.itens,
      });
      storageSet("avarias_h2",avHist);
      await setDoc(doc(COL,"avarias_h2"),{val:avHist,ts:Date.now()});

      setSalvo(true);
      if(onSalvar) onSalvar(registro);
    } catch(e) { alert("Erro ao salvar: "+e.message); }
    setSalvando(false);
  };

  // ── Salvo ─────────────────────────────────────────────────────────────────
  if(salvo) return (
    <div style={{background:C.card,border:`1px solid ${C.accentLight}44`,borderTop:`3px solid ${C.accentLight}`,borderRadius:12,padding:24,textAlign:"center"}}>
      <div style={{color:C.accentLight,fontWeight:800,fontSize:18,marginBottom:6}}>Inspeção salva</div>
      <div style={{color:C.textMuted,fontSize:13,marginBottom:4}}>Turno {letraProp||letra}</div>
      <div style={{fontFamily:"monospace",fontSize:28,fontWeight:900,color:avarias.length>0?C.dangerLight:C.accentLight,marginTop:12}}>
        {avarias.length>0?`${avarias.length} avaria${avarias.length>1?"s":""}`:"Sem avarias"}
      </div>
    </div>
  );

  // ── Passo 1 — pergunta inicial ─────────────────────────────────────────────
  if(passo===1) return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.warningLight}`,borderRadius:12,padding:20,textAlign:"center"}}>
      <div style={{color:C.text,fontWeight:800,fontSize:16,marginBottom:6}}>Inspeção de Avarias</div>
      <div style={{color:C.textMuted,fontSize:13,marginBottom:24}}>Houve avaria neste turno?</div>
      <div style={{display:"flex",gap:12}}>
        <button onClick={()=>salvar(false)} disabled={salvando}
          style={{flex:1,padding:"16px",borderRadius:12,cursor:"pointer",fontWeight:800,fontSize:15,
            background:C.accentDark,border:`2px solid ${C.accentLight}`,color:C.accentLight}}>
          Não houve
        </button>
        <button onClick={()=>setPasso(2)}
          style={{flex:1,padding:"16px",borderRadius:12,cursor:"pointer",fontWeight:800,fontSize:15,
            background:C.danger+"33",border:`2px solid ${C.dangerLight}`,color:C.dangerLight}}>
          Sim, houve
        </button>
      </div>
    </div>
  );

  // ── Passo 2 — lista de avarias ─────────────────────────────────────────────
  if(passo===2) return (
    <div>
      {/* Avarias confirmadas */}
      {avarias.map((av,idx)=>(
        <div key={idx} style={{background:C.card,border:`1px solid ${av.tipoColor}33`,borderLeft:`4px solid ${av.tipoColor}`,
          borderRadius:12,padding:"12px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1}}>
            <div style={{color:C.text,fontWeight:700,fontSize:13}}>{av.tipoLabel}</div>
            <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:COR_LINHA[av.linha]||C.textMuted,fontWeight:700,fontFamily:"monospace"}}>{av.linha}</span>
              <span style={{fontSize:11,color:C.textDim}}>{av.maquina}</span>
              {av.lote&&<span style={{fontSize:11,color:C.textDim,fontFamily:"monospace"}}>Lote {av.lote}</span>}
              {av.unidade&&<span style={{fontSize:11,color:C.textDim,fontFamily:"monospace"}}>Un {av.unidade}</span>}
              {av.fotos?.length>0&&<span style={{fontSize:11,color:C.textDim}}>{av.fotos.length} foto{av.fotos.length>1?"s":""}</span>}
            </div>
          </div>
          <button onClick={()=>removerAvaria(idx)}
            style={{width:28,height:28,borderRadius:8,border:`1px solid ${C.border}`,background:C.tagBg,
              color:C.textDim,cursor:"pointer",fontSize:14,fontWeight:900}}>×</button>
        </div>
      ))}

      {/* Formulário de nova avaria */}
      {adicionando?(
        <FormAvaria index={avarias.length} onSalvar={onNovaAvaria} onCancelar={()=>setAdicionando(false)}/>
      ):(
        <button onClick={()=>setAdicionando(true)}
          style={{width:"100%",padding:"13px",borderRadius:12,cursor:"pointer",fontWeight:700,fontSize:14,
            background:"transparent",border:`2px dashed ${C.dangerLight}55`,color:C.dangerLight,marginBottom:12}}>
          + Registrar avaria
        </button>
      )}

      {/* Navegação */}
      {!adicionando&&(
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setPasso(1)}
            style={{flex:1,padding:"12px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,
              background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted}}>
            Voltar
          </button>
          <button onClick={()=>setPasso(3)} disabled={avarias.length===0}
            style={{flex:2,padding:"12px",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,
              background:avarias.length>0?"linear-gradient(135deg,#c0272d,#FF5252)":C.tagBg,
              border:`1px solid ${avarias.length>0?C.dangerLight:C.border}`,
              color:avarias.length>0?"#fff":C.textDim,opacity:avarias.length===0?0.5:1}}>
            Revisar ({avarias.length} avaria{avarias.length!==1?"s":""})
          </button>
        </div>
      )}
    </div>
  );

  // ── Passo 3 — resumo ───────────────────────────────────────────────────────
  return (
    <div>
      <div style={{background:C.card,border:`1px solid ${C.dangerLight}44`,borderTop:`3px solid ${C.dangerLight}`,borderRadius:12,padding:16,marginBottom:12}}>
        <div style={{color:C.text,fontWeight:800,fontSize:15,marginBottom:4}}>Resumo da Inspeção</div>
        <div style={{color:C.textMuted,fontSize:12,marginBottom:14}}>Turno {letraProp||letra}</div>
        <div style={{textAlign:"center",padding:"14px 0",borderBottom:`1px solid ${C.border}`,marginBottom:14}}>
          <div style={{fontFamily:"monospace",fontSize:52,fontWeight:900,color:C.dangerLight,lineHeight:1,
            textShadow:`0 0 20px ${C.dangerLight}66`}}>{avarias.length}</div>
          <div style={{fontSize:12,color:C.textMuted,marginTop:4}}>avaria{avarias.length!==1?"s":""} registrada{avarias.length!==1?"s":""}</div>
        </div>
        {avarias.map((av,idx)=>(
          <div key={idx} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:12}}>
            <div style={{width:4,minHeight:32,borderRadius:2,background:av.tipoColor||C.dangerLight,flexShrink:0,marginTop:2}}/>
            <div style={{flex:1}}>
              <div style={{color:C.text,fontSize:13,fontWeight:700}}>{av.tipoLabel}</div>
              <div style={{display:"flex",gap:8,marginTop:3,flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:COR_LINHA[av.linha]||C.textMuted,fontWeight:700,fontFamily:"monospace"}}>{av.linha} · {av.maquina}</span>
                {av.lote&&<span style={{fontSize:11,color:C.textDim,fontFamily:"monospace"}}>Lote {av.lote}</span>}
                {av.unidade&&<span style={{fontSize:11,color:C.textDim,fontFamily:"monospace"}}>Un {av.unidade}</span>}
              </div>
              {av.fotos?.length>0&&(
                <div style={{display:"flex",gap:4,marginTop:6}}>
                  {av.fotos.map((f,fi)=>(
                    <img key={fi} src={f.base64} style={{width:40,height:30,objectFit:"cover",borderRadius:4,border:`1px solid ${C.border}`}}/>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>setPasso(2)}
          style={{flex:1,padding:13,borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,
            background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted}}>
          Corrigir
        </button>
        <button onClick={()=>salvar(true)} disabled={salvando}
          style={{flex:2,padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,
            background:"linear-gradient(135deg,#c0272d,#FF5252)",border:"none",color:"#fff",opacity:salvando?0.6:1}}>
          {salvando?"Salvando...":"Confirmar e Salvar"}
        </button>
      </div>
    </div>
  );
}

// ── AvariasAnalytics ──────────────────────────────────────────────────────────
export function AvariasAnalytics({ avariasData, perfil }) {
  const dados = Array.isArray(avariasData)?avariasData:[];
  const podeVerLetra = perfil?.funcao==="operador_painel"||perfil?.funcao==="supervisor"||perfil?.funcao==="dev";
  const [filtroLetra, setFiltroLetra] = useState("TODAS");
  const [filtroLinha, setFiltroLinha] = useState("TODAS");
  const [abaMes, setAbaMes]           = useState("tipos"); // "tipos" | "linhas"

  const LETRAS = ["TODAS","A","B","C"];

  const filtrados = dados.filter(r=>{
    if(filtroLetra!=="TODAS"&&r.letra!==filtroLetra) return false;
    if(filtroLinha!=="TODAS"){
      // verificar nas avarias individuais
      const temLinha = r.avarias?.some(a=>a.linha===filtroLinha);
      const temLinhaLeg = r.linha===filtroLinha; // compatibilidade legado
      if(!temLinha&&!temLinhaLeg) return false;
    }
    return true;
  });

  const comAvaria = filtrados.filter(r=>r.teveAvaria);
  const totalMes = dados.filter(r=>r.data?.slice(0,7)===mesAtual()&&r.teveAvaria)
    .reduce((s,r)=>s+(r.total||0),0);

  // ── Ranking por tipo (todos os tipos, não só top3) ────────────────────────
  const contTipos = {};
  TIPOS_AVARIA.forEach(t=>{ contTipos[t.id]=0; });
  comAvaria.forEach(r=>{
    // novo formato — avarias individuais
    if(r.avarias?.length) {
      r.avarias.forEach(av=>{ if(contTipos[av.tipoId]!==undefined) contTipos[av.tipoId]++; });
    } else {
      // legado — itens com quantidade
      r.itens?.forEach(it=>{ if(contTipos[it.id]!==undefined) contTipos[it.id]+=it.quantidade; });
    }
  });
  const rankTipos = TIPOS_AVARIA.map(t=>({...t,total:contTipos[t.id]}))
    .sort((a,b)=>b.total-a.total);
  const maxTipo = Math.max(1,...rankTipos.map(t=>t.total));

  // ── Ranking por linha ─────────────────────────────────────────────────────
  const contLinhas = {};
  LINHAS.forEach(l=>{ contLinhas[l]=0; });
  comAvaria.forEach(r=>{
    if(r.avarias?.length) {
      r.avarias.forEach(av=>{ if(contLinhas[av.linha]!==undefined) contLinhas[av.linha]++; });
    } else if(r.linha&&contLinhas[r.linha]!==undefined) {
      contLinhas[r.linha]+=(r.total||1);
    }
  });
  const rankLinhas = LINHAS.map(l=>({linha:l,cor:COR_LINHA[l],total:contLinhas[l]}))
    .sort((a,b)=>b.total-a.total);
  const maxLinha = Math.max(1,...rankLinhas.map(l=>l.total));

  // ── Gráfico de linha — últimos 20 registros ───────────────────────────────
  const ultimos = [...filtrados].sort((a,b)=>b.id-a.id).slice(0,20).reverse();
  const W=280,H=70,PAD=8;
  const vals = ultimos.map(r=>r.teveAvaria?(r.avarias?.length||r.total||0):0);
  const maxV = Math.max(1,...vals);
  const xOf = (i)=>PAD+(i/(Math.max(1,ultimos.length-1)))*(W-PAD*2);
  const yOf = (v)=>H-PAD-((v/maxV)*(H-PAD*2));
  const pts = vals.map((v,i)=>`${xOf(i)},${yOf(v)}`);
  const linhaPath = bPath(pts);
  const area = linhaPath?linhaPath+` L${xOf(vals.length-1)},${H-PAD} L${xOf(0)},${H-PAD} Z`:"";

  return (
    <div>
      {/* Filtros */}
      {podeVerLetra&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:10}}>
          <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Turno</div>
          <div style={{display:"flex",gap:6}}>
            {LETRAS.map(l=>{
              const ativo=filtroLetra===l;
              return(
                <button key={l} onClick={()=>setFiltroLetra(l)}
                  style={{flex:1,padding:"8px 4px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,
                    border:`2px solid ${ativo?C.accentLight:C.border}`,
                    background:ativo?C.accentDark:C.tagBg,color:ativo?C.accentLight:C.textMuted}}>
                  {l==="TODAS"?"Todas":l}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:12}}>
        <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Linha</div>
        <div style={{display:"flex",gap:6}}>
          {["TODAS",...LINHAS].map(l=>{
            const ativo=filtroLinha===l;
            const cor=l==="TODAS"?C.accentLight:COR_LINHA[l];
            return(
              <button key={l} onClick={()=>setFiltroLinha(l)}
                style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:700,
                  border:`2px solid ${ativo?cor+"99":C.border}`,
                  background:ativo?cor+"18":C.tagBg,
                  color:ativo?cor:C.textMuted}}>
                {l==="TODAS"?"Todas":l}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gráfico tendência */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.dangerLight}`,borderRadius:12,padding:14,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Tendência</span>
          <span style={{fontSize:9,color:C.textDim}}>{ultimos.length} registros</span>
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
            {linhaPath&&<path d={linhaPath} fill="none" stroke={C.dangerLight} strokeWidth="2"
              strokeLinejoin="round" strokeLinecap="round"
              style={{filter:`drop-shadow(0 0 4px ${C.dangerLight}aa)`}}/>}
            {vals.map((v,i)=>(
              <circle key={i} cx={xOf(i)} cy={yOf(v)} r="3"
                fill={v>0?C.dangerLight:C.textDim}
                style={{filter:v>0?`drop-shadow(0 0 4px ${C.dangerLight})`:"none"}}/>
            ))}
          </svg>
        ):(
          <div style={{height:H,display:"flex",alignItems:"center",justifyContent:"center",color:C.textDim,fontSize:12}}>Sem registros</div>
        )}
      </div>

      {/* Abas ranking */}
      <div style={{display:"flex",gap:0,marginBottom:12,borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
        {[["tipos","Por motivo"],["linhas","Por linha"]].map(([key,label])=>(
          <button key={key} onClick={()=>setAbaMes(key)}
            style={{flex:1,padding:"10px",cursor:"pointer",fontWeight:700,fontSize:12,border:"none",
              background:abaMes===key?C.blue:C.tagBg,
              color:abaMes===key?C.text:C.textMuted,
              borderRight:key==="tipos"?`1px solid ${C.border}`:"none"}}>
            {label}
          </button>
        ))}
      </div>

      {/* Ranking por motivo */}
      {abaMes==="tipos"&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.warningLight}`,borderRadius:12,padding:14,marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Avarias por motivo</div>
          {rankTipos.map((t,i)=>(
            <div key={t.id} style={{marginBottom:i<rankTipos.length-1?12:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:"monospace",fontSize:11,color:C.textDim,fontWeight:700,minWidth:16}}>#{i+1}</span>
                  <span style={{fontSize:13,color:t.total>0?C.text:C.textDim,fontWeight:t.total>0?600:400}}>{t.label}</span>
                </div>
                <span style={{fontFamily:"monospace",fontSize:15,fontWeight:900,color:t.total>0?t.cor:C.textDim}}>{t.total}</span>
              </div>
              <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(t.total/maxTipo)*100}%`,borderRadius:3,
                  background:t.cor,transition:"width .5s",boxShadow:t.total>0?`0 0 8px ${t.cor}88`:"none"}}/>
              </div>
            </div>
          ))}
          {comAvaria.length===0&&<div style={{textAlign:"center",color:C.textDim,fontSize:12,padding:"12px 0"}}>Sem avarias no período</div>}
        </div>
      )}

      {/* Ranking por linha */}
      {abaMes==="linhas"&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.blueLight}`,borderRadius:12,padding:14,marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Avarias por linha</div>
          {rankLinhas.map((l,i)=>(
            <div key={l.linha} style={{marginBottom:i<rankLinhas.length-1?14:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:"monospace",fontSize:11,color:C.textDim,fontWeight:700,minWidth:16}}>#{i+1}</span>
                  <span style={{fontSize:14,color:l.total>0?l.cor:C.textDim,fontWeight:l.total>0?800:400,fontFamily:"monospace"}}>{l.linha}</span>
                  <span style={{fontSize:11,color:C.textDim}}>{maqDaLinha(l.linha)}</span>
                </div>
                <span style={{fontFamily:"monospace",fontSize:18,fontWeight:900,color:l.total>0?l.cor:C.textDim,
                  textShadow:l.total>0?`0 0 10px ${l.cor}88`:"none"}}>{l.total}</span>
              </div>
              <div style={{height:8,borderRadius:4,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(l.total/maxLinha)*100}%`,borderRadius:4,
                  background:l.cor,transition:"width .6s",boxShadow:l.total>0?`0 0 10px ${l.cor}77`:"none"}}/>
              </div>
            </div>
          ))}
          {comAvaria.length===0&&<div style={{textAlign:"center",color:C.textDim,fontSize:12,padding:"12px 0"}}>Sem avarias no período</div>}
        </div>
      )}

      {/* Acumulado mês */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{color:C.textMuted,fontSize:12}}>Acumulado do mês</div>
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

  const totalMes = dados.filter(r=>r.data?.slice(0,7)===mes&&r.teveAvaria)
    .reduce((s,r)=>s+(r.avarias?.length||r.total||0),0);

  const shiftBounds=[];
  for(let day=0;day<10;day++){
    const d=new Date(); d.setDate(d.getDate()-9+day);
    const ds=d.toISOString().slice(0,10);
    for(const lt of["A","B","C"]){
      shiftBounds.push({data:ds,letra:lt});
    }
  }
  const vals=shiftBounds.map(s=>{
    const recs=dados.filter(r=>r.data===s.data&&r.letra===s.letra&&r.teveAvaria);
    return recs.reduce((a,r)=>a+(r.avarias?.length||r.total||0),0);
  });

  const W=260,H=60,PAD=6;
  const maxV=Math.max(1,...vals);
  const xOf=(i)=>PAD+(i/(Math.max(1,shiftBounds.length-1)))*(W-PAD*2);
  const yOf=(v)=>H-PAD-((v/maxV)*(H-PAD*2));
  const pts=vals.map((v,i)=>`${xOf(i)},${yOf(v)}`);
  const linhaPath=bPath(pts);
  const area=linhaPath?linhaPath+` L${xOf(vals.length-1)},${H-PAD} L${xOf(0)},${H-PAD} Z`:"";

  // Ranking linhas (mês)
  const contLinhas={};
  LINHAS.forEach(l=>{contLinhas[l]=0;});
  dados.filter(r=>r.data?.slice(0,7)===mes&&r.teveAvaria).forEach(r=>{
    if(r.avarias?.length){r.avarias.forEach(av=>{if(contLinhas[av.linha]!==undefined)contLinhas[av.linha]++;});}
    else if(r.linha&&contLinhas[r.linha]!==undefined){contLinhas[r.linha]+=(r.total||1);}
  });
  const topLinhas=LINHAS.map(l=>({linha:l,cor:COR_LINHA[l],total:contLinhas[l]})).sort((a,b)=>b.total-a.total).slice(0,3);
  const maxL=Math.max(1,...topLinhas.map(t=>t.total));

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

      <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
        <span style={{fontFamily:"monospace",fontSize:42,fontWeight:900,color:corTopo,lineHeight:1,
          textShadow:`0 0 20px ${corTopo}66`}}>{totalMes}</span>
        <span style={{fontSize:11,color:C.textMuted,marginBottom:6}}>no mês</span>
      </div>

      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:"block"}}>
        <defs>
          <linearGradient id="avTVFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={corTopo} stopOpacity="0.2"/>
            <stop offset="100%" stopColor={corTopo} stopOpacity="0.01"/>
          </linearGradient>
        </defs>
        {area&&<path d={area} fill="url(#avTVFill)"/>}
        {linhaPath&&<path d={linhaPath} fill="none" stroke={corTopo} strokeWidth="1.5"
          strokeLinejoin="round" strokeLinecap="round"
          style={{filter:`drop-shadow(0 0 3px ${corTopo}aa)`}}/>}
        {vals.map((v,i)=>v>0?(
          <circle key={i} cx={xOf(i)} cy={yOf(v)} r="2.5" fill={corTopo}
            style={{filter:`drop-shadow(0 0 3px ${corTopo})`}}/>
        ):null)}
      </svg>

      {/* Top linhas */}
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {topLinhas.map((l,i)=>(
          <div key={l.linha}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
              <span style={{fontSize:9,color:l.total>0?l.cor:C.textDim,fontFamily:"monospace",fontWeight:700}}>#{i+1} {l.linha}</span>
              <span style={{fontFamily:"monospace",fontSize:10,fontWeight:900,color:l.total>0?l.cor:C.textDim}}>{l.total}</span>
            </div>
            <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}>
              <div style={{height:"100%",width:`${(l.total/maxL)*100}%`,borderRadius:2,
                background:l.cor,boxShadow:l.total>0?`0 0 5px ${l.cor}88`:"none",transition:"width .5s"}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
