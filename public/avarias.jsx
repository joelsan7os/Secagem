// ─── avarias.jsx — Inspeção de Avarias + Analytics · Enfardamento · Secagem H2
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

const cardStyle = {
  position:"relative", borderRadius:20, overflow:"hidden", isolation:"isolate",
  background:"rgba(10,24,18,0.42)",
  backgroundImage:"linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 20%, transparent 44%),radial-gradient(120px 120px at 0% 0%, rgba(210,255,235,0.14), transparent 70%)",
  backdropFilter:"blur(22px) saturate(1.4)", WebkitBackdropFilter:"blur(22px) saturate(1.4)",
  border:"1px solid rgba(255,255,255,0.12)",
  boxShadow:"inset 0 1px 0 rgba(255,255,255,0.30),inset 0 0 30px rgba(255,255,255,0.03),0 10px 30px -10px rgba(0,0,0,0.7)",
};
const glassMini = {
  position:"relative", overflow:"hidden",
  background:"rgba(255,255,255,0.05)",
  backgroundImage:"linear-gradient(135deg, rgba(255,255,255,0.10), transparent 50%)",
  border:"1px solid rgba(255,255,255,0.08)",
  boxShadow:"inset 0 1px 0 rgba(255,255,255,0.14)",
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
  { id:"alt_linha",    label:"Dif. de altura",   cor:"#5090FF" },
  { id:"capa_rasgada", label:"Capa rasgada",      cor:"#FF5252" },
  { id:"sem_capa",     label:"Faltando capa",     cor:"#FF8C00" },
  { id:"arame_esp",    label:"Arame espaçado",    cor:"#FFC107" },
  { id:"arame_cod",    label:"Arame s/ código",   cor:"#C77DFF" },
  { id:"sem_imp",      label:"Falta impressão",   cor:"#00F0FF" },
  { id:"sem_logo",     label:"Unit sem logo",     cor:"#00E676" },
];

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
      resolve({ base64, kb: Math.round((base64.length*3)/4/1024) });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Falha")); };
    img.src = url;
  });
}

function bPath(pts) {
  if(pts.length<2) return "";
  const p=pts.map(s=>{const[x,y]=s.split(",").map(Number);return{x,y};});
  let d=`M${p[0].x},${p[0].y}`;
  for(let i=1;i<p.length;i++){const c=(p[i-1].x+p[i].x)/2;d+=` C${c},${p[i-1].y} ${c},${p[i].y} ${p[i].x},${p[i].y}`;}
  return d;
}

// formulário inline de um tipo — reseta após OK
function FormTipo({ tipo, inicial, onOk, onCancelar }) {
  const [qtd, setQtd]         = useState(inicial?.qtd||0);
  const [linha, setLinha]     = useState(inicial?.linha||null);
  const [lote, setLote]       = useState(inicial?.lote||"");
  const [unidade, setUnidade] = useState(inicial?.unidade||"");
  const [fotos, setFotos]     = useState(inicial?.fotos||[]);
  const [fotoProc, setFotoProc] = useState(false);
  const inputRef = useRef(null);

  const pronto = qtd > 0 && linha;

  const onFotoChange = useCallback(async (e) => {
    const files = Array.from(e.target.files||[]);
    if(!files.length) return;
    setFotoProc(true);
    const novas = [];
    for(const file of files){
      if(!file.type.startsWith("image/")) continue;
      try { novas.push(await comprimirImagem(file)); } catch {}
    }
    setFotos(prev=>[...prev,...novas]);
    setFotoProc(false);
    e.target.value="";
  },[]);

  return (
    <div style={{
      background:tipo.cor+"0F",
      border:`2px solid ${tipo.cor+"55"}`,
      borderRadius:12, padding:"12px 14px", marginBottom:10
    }}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:tipo.cor,boxShadow:`0 0 6px ${tipo.cor}`}}/>
        <span style={{color:C.text,fontWeight:800,fontSize:14}}>{tipo.label}</span>
      </div>

      {/* Qtd */}
      <div style={{marginBottom:12}}>
        <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Quantidade</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setQtd(q=>Math.max(0,q-1))}
            style={{width:36,height:36,borderRadius:9,border:`1px solid ${C.border}`,
              background:C.tagBg,color:C.textMuted,cursor:"pointer",fontSize:20,fontWeight:900,opacity:qtd===0?0.3:1}}>−</button>
          <input type="number" value={qtd} min={0} max={99}
            onChange={e=>setQtd(Math.max(0,Math.min(99,parseInt(e.target.value)||0)))}
            style={{width:56,textAlign:"center",background:"transparent",border:"none",
              color:qtd>0?tipo.cor:C.textMuted,fontFamily:"monospace",fontWeight:900,fontSize:24,outline:"none"}}/>
          <button onClick={()=>setQtd(q=>Math.min(99,q+1))}
            style={{width:36,height:36,borderRadius:9,border:`1px solid ${C.border}`,
              background:C.tagBg,color:C.textMuted,cursor:"pointer",fontSize:20,fontWeight:900}}>+</button>
        </div>
      </div>

      {/* Linha */}
      <div style={{marginBottom:12}}>
        <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Linha</div>
        <div style={{display:"flex",gap:6}}>
          {LINHAS.map(l=>{
            const sel=linha===l; const cor=COR_LINHA[l];
            return (
              <button key={l} onClick={()=>setLinha(sel?null:l)}
                style={{flex:1,padding:"8px 2px",borderRadius:9,cursor:"pointer",
                  border:`2px solid ${sel?cor+"99":C.border}`,
                  background:sel?cor+"1A":C.tagBg,
                  color:sel?cor:C.textDim,fontWeight:sel?800:500,fontSize:13,
                  boxShadow:sel?`0 0 8px ${cor}44`:"none",transition:"all .12s"}}>
                {l}
                <div style={{fontSize:7,opacity:.7,marginTop:1}}>{maqDaLinha(l)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lote + Unidade + Foto */}
      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:fotos.length>0?8:0}}>
        <input value={lote} onChange={e=>setLote(e.target.value)} placeholder="Lote"
          style={{flex:1,padding:"8px 10px",borderRadius:8,background:"rgba(0,0,0,0.3)",
            border:`1px solid ${lote?tipo.cor+"55":C.border}`,color:C.text,
            fontFamily:"monospace",fontSize:12,outline:"none",minWidth:0}}/>
        <input value={unidade} onChange={e=>setUnidade(e.target.value)} placeholder="Unidade"
          style={{flex:1,padding:"8px 10px",borderRadius:8,background:"rgba(0,0,0,0.3)",
            border:`1px solid ${unidade?tipo.cor+"55":C.border}`,color:C.text,
            fontFamily:"monospace",fontSize:12,outline:"none",minWidth:0}}/>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={onFotoChange} style={{display:"none"}}/>
        <button onClick={()=>inputRef.current?.click()} disabled={fotoProc}
          style={{flexShrink:0,width:36,height:36,borderRadius:8,cursor:"pointer",
            border:`1px solid ${fotos.length>0?tipo.cor+"55":C.border}`,
            background:fotos.length>0?tipo.cor+"1A":C.tagBg,
            color:fotos.length>0?tipo.cor:C.textDim,fontSize:15}}>
          {fotoProc?"…":""}
        </button>
      </div>

      {fotos.length>0&&(
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
          {fotos.map((f,fi)=>(
            <div key={fi} style={{position:"relative",width:52,height:38}}>
              <img src={f.base64} style={{width:52,height:38,objectFit:"cover",borderRadius:5,border:`1px solid ${C.border}`}}/>
              <button onClick={()=>setFotos(prev=>prev.filter((_,i)=>i!==fi))}
                style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",
                  background:C.dangerLight,border:"none",color:"#fff",fontSize:9,cursor:"pointer",fontWeight:900,padding:0}}>x</button>
            </div>
          ))}
        </div>
      )}

      {/* Ações */}
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <button onClick={onCancelar}
          style={{flex:1,padding:"10px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:13,
            background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted}}>
          Cancelar
        </button>
        <button onClick={()=>pronto&&onOk({qtd,linha,lote:lote.trim(),unidade:unidade.trim(),fotos})}
          disabled={!pronto}
          style={{flex:2,padding:"10px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:14,
            background:pronto?`linear-gradient(135deg,${tipo.cor}cc,${tipo.cor})`:"transparent",
            border:`1px solid ${pronto?tipo.cor:C.border}`,
            color:pronto?"#000":C.textDim,opacity:pronto?1:0.45,transition:"all .15s"}}>
          OK — registrar
        </button>
      </div>
    </div>
  );
}

// ── AvariasTela ───────────────────────────────────────────────────────────────
export function AvariasTela({ onSalvar, turno, letra:letraProp, opPU, opPainel, data }) {
  const letra = calcularLetra();
  const [passo, setPasso]       = useState(1); // 1=pergunta 2=grade 3=revisão
  const [fila, setFila]         = useState([]); // entradas confirmadas [{uid,tipoId,tipoLabel,tipoColor,qtd,linha,...}]
  const [aberto, setAberto]     = useState(null); // tipoId com form aberto
  const [editando, setEditando] = useState(null); // {uid, tipoId} sendo editado (no passo 3)
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo]       = useState(false);

  const totalAvarias = fila.reduce((s,r)=>s+r.qtd,0);

  // confirma entrada nova (grade)
  const onOkTipo = (tipoId, dados) => {
    const tipo = TIPOS_AVARIA.find(t=>t.id===tipoId);
    setFila(prev=>[...prev,{
      uid: Date.now()+Math.random(),
      tipoId, tipoLabel:tipo.label, tipoColor:tipo.cor,
      ...dados
    }]);
    setAberto(null);
  };

  // salva edição (revisão)
  const onOkEditar = (dados) => {
    setFila(prev=>prev.map(r=>r.uid===editando.uid?{...r,...dados}:r));
    setEditando(null);
  };

  const remover = (uid) => setFila(prev=>prev.filter(r=>r.uid!==uid));

  const salvar = async (houve) => {
    setSalvando(true);
    const hora = horaAtual();
    const opConfig = storageGet("op_config")||{};
    const itens = fila.map(r=>({
      id:r.tipoId, label:r.tipoLabel,
      quantidade:r.qtd, linha:r.linha,
      maquina:maqDaLinha(r.linha),
      lote:r.lote, unidade:r.unidade,
      fotos:(r.fotos||[]).map(f=>({base64:f.base64,kb:f.kb})),
    }));
    const registro = {
      id:Date.now(), tipoId:"avaria_enf", tipoLabel:"Inspeção de Avarias",
      turno:turno||(storageGet("turno_ativo")||""),
      letra:letraProp||letra, hora, data:data||hoje(),
      matricula:opConfig.matricula||"",
      opPU:opPU||"", opPainel:opPainel||"",
      teveAvaria:houve, totalAvarias:houve?totalAvarias:0,
      itens:houve?itens:[],
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
        teveAvaria:houve, total:registro.totalAvarias, itens:registro.itens,
      });
      storageSet("avarias_h2",avHist);
      await setDoc(doc(COL,"avarias_h2"),{val:avHist,ts:Date.now()});

      setSalvo(true);
      if(onSalvar) onSalvar(registro);
    } catch(e){ alert("Erro ao salvar: "+e.message); }
    setSalvando(false);
  };

  // ── Salvo ──────────────────────────────────────────────────────────────────
  if(salvo) return (
    <div style={{ ...cardStyle,border:`1px solid ${C.accentLight}44`,borderTop:`3px solid ${C.accentLight}`,borderRadius:12,padding:24,textAlign:"center"}}>
      <div style={{color:C.accentLight,fontWeight:800,fontSize:18,marginBottom:6}}>Inspeção salva</div>
      <div style={{color:C.textMuted,fontSize:13,marginBottom:4}}>Turno {letraProp||letra}</div>
      <div style={{fontFamily:"monospace",fontSize:28,fontWeight:900,
        color:totalAvarias>0?C.dangerLight:C.accentLight,marginTop:12}}>
        {totalAvarias>0?`${totalAvarias} avaria${totalAvarias>1?"s":""}`:"Sem avarias"}
      </div>
    </div>
  );

  // ── Passo 1 — pergunta ─────────────────────────────────────────────────────
  if(passo===1) return (
    <div style={{ ...cardStyle,borderTop:`3px solid ${C.warningLight}`,borderRadius:12,padding:20,textAlign:"center"}}>
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

  // ── Passo 2 — grade de lançamento ─────────────────────────────────────────
  if(passo===2) return (
    <div>
      {/* Cabeçalho */}
      <div style={{ ...cardStyle,borderTop:`3px solid ${C.dangerLight}`,
        borderRadius:12,padding:"12px 14px",marginBottom:12,
        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{color:C.text,fontWeight:800,fontSize:14}}>Lançamento</div>
        {fila.length>0&&(
          <div style={{background:C.dangerLight+"22",border:`1px solid ${C.dangerLight}44`,borderRadius:20,padding:"3px 12px",
            display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontFamily:"monospace",fontWeight:900,fontSize:14,color:C.dangerLight}}>{totalAvarias}</span>
            <span style={{fontSize:10,color:C.textDim}}>em {fila.length} entrada{fila.length>1?"s":""}</span>
          </div>
        )}
      </div>

      {/* Entradas já na fila */}
      {fila.length>0&&(
        <div style={{marginBottom:12}}>
          {fila.map(r=>(
            <div key={r.uid} style={{
              background:r.tipoColor+"0A",border:`1px solid ${r.tipoColor+"33"}`,
              borderLeft:`3px solid ${r.tipoColor}`,borderRadius:10,
              padding:"9px 12px",marginBottom:6,
              display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{color:C.text,fontWeight:700,fontSize:13}}>{r.tipoLabel}</span>
                  <span style={{fontFamily:"monospace",fontWeight:900,fontSize:14,color:r.tipoColor}}>{r.qtd}</span>
                </div>
                <div style={{display:"flex",gap:6,marginTop:2,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,color:COR_LINHA[r.linha],fontWeight:700,fontFamily:"monospace"}}>{r.linha} · {maqDaLinha(r.linha)}</span>
                  {r.lote&&<span style={{fontSize:11,color:C.textDim,fontFamily:"monospace"}}>Lote {r.lote}</span>}
                  {r.unidade&&<span style={{fontSize:11,color:C.textDim,fontFamily:"monospace"}}>Un {r.unidade}</span>}
                </div>
              </div>
              <button onClick={()=>remover(r.uid)}
                style={{width:26,height:26,borderRadius:7,border:`1px solid ${C.border}`,
                  background:C.tagBg,color:C.textDim,cursor:"pointer",fontSize:14,fontWeight:900,flexShrink:0}}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Form do tipo aberto */}
      {aberto?(
        <FormTipo
          tipo={TIPOS_AVARIA.find(t=>t.id===aberto)}
          inicial={null}
          onOk={(dados)=>onOkTipo(aberto,dados)}
          onCancelar={()=>setAberto(null)}/>
      ):(
        /* Grid de tipos */
        <div style={{ ...cardStyle,borderRadius:12,padding:14,marginBottom:12}}>
          <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Selecione o tipo de avaria</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {TIPOS_AVARIA.map(tipo=>(
              <button key={tipo.id} onClick={()=>setAberto(tipo.id)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:10,
                  cursor:"pointer",textAlign:"left",
                  border:`1px solid ${C.border}`,background:C.tagBg,transition:"all .12s"}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:tipo.cor,flexShrink:0,
                  boxShadow:`0 0 6px ${tipo.cor}88`}}/>
                <span style={{color:C.textMuted,fontSize:13,fontWeight:500,flex:1}}>{tipo.label}</span>
                {fila.filter(r=>r.tipoId===tipo.id).length>0&&(
                  <span style={{fontSize:10,color:tipo.cor,fontFamily:"monospace",fontWeight:700}}>
                    ×{fila.filter(r=>r.tipoId===tipo.id).length}
                  </span>
                )}
                <span style={{color:C.textDim,fontSize:16}}>›</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navegação */}
      {!aberto&&(
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setPasso(1)}
            style={{flex:1,padding:13,borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,
              background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted}}>
            Voltar
          </button>
          <button onClick={()=>setPasso(3)} disabled={fila.length===0}
            style={{flex:2,padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,
              background:fila.length>0?"linear-gradient(135deg,#c0272d,#FF5252)":C.tagBg,
              border:`1px solid ${fila.length>0?C.dangerLight:C.border}`,
              color:fila.length>0?"#fff":C.textDim,opacity:fila.length===0?0.5:1}}>
            Revisar ({totalAvarias} avaria{totalAvarias!==1?"s":""})
          </button>
        </div>
      )}
    </div>
  );

  // ── Passo 3 — revisão ─────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ ...cardStyle,border:`1px solid ${C.dangerLight}44`,borderTop:`3px solid ${C.dangerLight}`,
        borderRadius:12,padding:16,marginBottom:12}}>
        <div style={{color:C.text,fontWeight:800,fontSize:15,marginBottom:4}}>Revisão</div>
        <div style={{color:C.textMuted,fontSize:12,marginBottom:14}}>Turno {letraProp||letra}</div>
        <div style={{textAlign:"center",padding:"12px 0",borderBottom:`1px solid ${C.border}`,marginBottom:14}}>
          <div style={{fontFamily:"monospace",fontSize:48,fontWeight:900,color:C.dangerLight,lineHeight:1,
            textShadow:`0 0 20px ${C.dangerLight}66`}}>{totalAvarias}</div>
          <div style={{fontSize:12,color:C.textMuted,marginTop:4}}>avaria{totalAvarias!==1?"s":""} registrada{totalAvarias!==1?"s":""}</div>
        </div>

        {fila.map(r=>(
          <div key={r.uid}>
            {/* Modo edição inline */}
            {editando?.uid===r.uid?(
              <FormTipo
                tipo={TIPOS_AVARIA.find(t=>t.id===r.tipoId)}
                inicial={r}
                onOk={onOkEditar}
                onCancelar={()=>setEditando(null)}/>
            ):(
              <div style={{
                background:r.tipoColor+"0A",border:`1px solid ${r.tipoColor+"33"}`,
                borderLeft:`3px solid ${r.tipoColor}`,borderRadius:10,
                padding:"10px 12px",marginBottom:10,
                display:"flex",alignItems:"flex-start",gap:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{color:C.text,fontSize:13,fontWeight:700}}>{r.tipoLabel}</span>
                    <span style={{fontFamily:"monospace",fontWeight:900,fontSize:18,color:r.tipoColor}}>{r.qtd}</span>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:3,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:COR_LINHA[r.linha],fontWeight:700,fontFamily:"monospace"}}>{r.linha} · {maqDaLinha(r.linha)}</span>
                    {r.lote&&<span style={{fontSize:11,color:C.textDim,fontFamily:"monospace"}}>Lote {r.lote}</span>}
                    {r.unidade&&<span style={{fontSize:11,color:C.textDim,fontFamily:"monospace"}}>Un {r.unidade}</span>}
                    {r.fotos?.length>0&&<span style={{fontSize:11,color:C.textDim}}>{r.fotos.length} foto{r.fotos.length>1?"s":""}</span>}
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <button onClick={()=>setEditando({uid:r.uid,tipoId:r.tipoId})}
                    style={{width:30,height:30,borderRadius:8,border:`1px solid ${C.border}`,
                      background:C.tagBg,color:C.textMuted,cursor:"pointer",fontSize:14}}>️</button>
                  <button onClick={()=>remover(r.uid)}
                    style={{width:30,height:30,borderRadius:8,border:`1px solid ${C.border}`,
                      background:C.tagBg,color:C.textDim,cursor:"pointer",fontSize:15,fontWeight:900}}>×</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Adicionar mais */}
        {!editando&&(
          <button onClick={()=>setPasso(2)}
            style={{width:"100%",padding:"10px",borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:13,
              background:"transparent",border:`1px dashed ${C.border}`,color:C.textDim,marginTop:4}}>
            + Adicionar outra avaria
          </button>
        )}
      </div>

      {!editando&&(
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setPasso(2)}
            style={{flex:1,padding:13,borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,
              background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted}}>
            Voltar
          </button>
          <button onClick={()=>salvar(true)} disabled={salvando||fila.length===0}
            style={{flex:2,padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,
              background:"linear-gradient(135deg,#c0272d,#FF5252)",border:"none",color:"#fff",opacity:salvando?0.6:1}}>
            {salvando?"Salvando...":"Confirmar e Salvar"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── AvariasAnalytics ──────────────────────────────────────────────────────────
export function AvariasAnalytics({ avariasData, perfil }) {
  const dados = Array.isArray(avariasData)?avariasData:[];
  const podeVerLetra = perfil?.funcao==="operador_painel"||perfil?.funcao==="supervisor"||perfil?.funcao==="dev";
  const [filtroLetra, setFiltroLetra] = useState("TODAS");
  const [filtroLinha, setFiltroLinha] = useState("TODAS");
  const [aba, setAba]                 = useState("tipos");
  const LETRAS = ["TODAS","A","B","C","D","E"];

  const filtrados = dados.filter(r=>{
    if(filtroLetra!=="TODAS"&&r.letra!==filtroLetra) return false;
    if(filtroLinha!=="TODAS"){
      const temLinha = r.itens?.some(i=>i.linha===filtroLinha);
      if(!temLinha&&r.linha!==filtroLinha) return false;
    }
    return true;
  });

  const comAvaria = filtrados.filter(r=>r.teveAvaria);
  const totalMes  = dados.filter(r=>r.data?.slice(0,7)===mesAtual()&&r.teveAvaria)
    .reduce((s,r)=>s+(r.totalAvarias||r.total||0),0);

  const contTipos = {};
  TIPOS_AVARIA.forEach(t=>{contTipos[t.id]=0;});
  comAvaria.forEach(r=>{
    r.itens?.forEach(it=>{ if(contTipos[it.id]!==undefined) contTipos[it.id]+=(it.quantidade||1); });
  });
  const rankTipos = TIPOS_AVARIA.map(t=>({...t,total:contTipos[t.id]})).sort((a,b)=>b.total-a.total);
  const maxTipo   = Math.max(1,...rankTipos.map(t=>t.total));

  const contLinhas = {};
  LINHAS.forEach(l=>{contLinhas[l]=0;});
  comAvaria.forEach(r=>{
    r.itens?.forEach(it=>{ if(it.linha&&contLinhas[it.linha]!==undefined) contLinhas[it.linha]+=(it.quantidade||1); });
    if(!r.itens?.length&&r.linha&&contLinhas[r.linha]!==undefined) contLinhas[r.linha]+=(r.total||1);
  });
  const rankLinhas = LINHAS.map(l=>({linha:l,cor:COR_LINHA[l],total:contLinhas[l]})).sort((a,b)=>b.total-a.total);
  const maxLinha   = Math.max(1,...rankLinhas.map(l=>l.total));

  const ultimos = [...filtrados].sort((a,b)=>b.id-a.id).slice(0,20).reverse();
  const W=280,H=70,PAD=8;
  const vals  = ultimos.map(r=>r.teveAvaria?(r.totalAvarias||r.total||0):0);
  const maxV  = Math.max(1,...vals);
  const xOf   = (i)=>PAD+(i/(Math.max(1,ultimos.length-1)))*(W-PAD*2);
  const yOf   = (v)=>H-PAD-((v/maxV)*(H-PAD*2));
  const pts   = vals.map((v,i)=>`${xOf(i)},${yOf(v)}`);
  const lp    = bPath(pts);
  const area  = lp?lp+` L${xOf(vals.length-1)},${H-PAD} L${xOf(0)},${H-PAD} Z`:"";

  return (
    <div>
      {podeVerLetra&&(
        <div style={{ ...cardStyle,borderRadius:10,padding:12,marginBottom:10}}>
          <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Turno</div>
          <div style={{display:"flex",gap:6}}>
            {LETRAS.map(l=>{
              const at=filtroLetra===l;
              return <button key={l} onClick={()=>setFiltroLetra(l)}
                style={{flex:1,padding:"8px 4px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,
                  border:`2px solid ${at?C.accentLight:C.border}`,
                  background:at?C.accentDark:C.tagBg,color:at?C.accentLight:C.textMuted}}>
                {l==="TODAS"?"Todas":l}
              </button>;
            })}
          </div>
        </div>
      )}

      <div style={{ ...cardStyle,borderRadius:10,padding:12,marginBottom:12}}>
        <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Linha</div>
        <div style={{display:"flex",gap:6}}>
          {["TODAS",...LINHAS].map(l=>{
            const at=filtroLinha===l; const cor=l==="TODAS"?C.accentLight:COR_LINHA[l];
            return <button key={l} onClick={()=>setFiltroLinha(l)}
              style={{flex:1,padding:"7px 2px",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:700,
                border:`2px solid ${at?cor+"99":C.border}`,
                background:at?cor+"18":C.tagBg,color:at?cor:C.textMuted}}>
              {l==="TODAS"?"Todas":l}
            </button>;
          })}
        </div>
      </div>

      <div style={{ ...cardStyle,borderTop:`3px solid ${C.dangerLight}`,borderRadius:12,padding:14,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Tendência</span>
          <span style={{fontSize:9,color:C.textDim}}>{ultimos.length} registros</span>
        </div>
        {ultimos.length>0?(
          <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:"block"}}>
            <defs>
              <linearGradient id="avFill2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.dangerLight} stopOpacity="0.25"/>
                <stop offset="100%" stopColor={C.dangerLight} stopOpacity="0.02"/>
              </linearGradient>
            </defs>
            {area&&<path d={area} fill="url(#avFill2)"/>}
            {lp&&<path d={lp} fill="none" stroke={C.dangerLight} strokeWidth="2"
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

      <div style={{display:"flex",gap:0,marginBottom:12,borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
        {[["tipos","Por motivo"],["linhas","Por linha"]].map(([key,label])=>(
          <button key={key} onClick={()=>setAba(key)}
            style={{flex:1,padding:"10px",cursor:"pointer",fontWeight:700,fontSize:12,border:"none",
              background:aba===key?C.blue:C.tagBg,color:aba===key?C.text:C.textMuted,
              borderRight:key==="tipos"?`1px solid ${C.border}`:"none"}}>
            {label}
          </button>
        ))}
      </div>

      {aba==="tipos"&&(
        <div style={{ ...cardStyle,borderTop:`3px solid ${C.warningLight}`,borderRadius:12,padding:14,marginBottom:12}}>
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

      {aba==="linhas"&&(
        <div style={{ ...cardStyle,borderTop:`3px solid ${C.blueLight}`,borderRadius:12,padding:14,marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Avarias por linha</div>
          {rankLinhas.map((l,i)=>(
            <div key={l.linha} style={{marginBottom:i<rankLinhas.length-1?14:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:"monospace",fontSize:11,color:C.textDim,fontWeight:700,minWidth:16}}>#{i+1}</span>
                  <span style={{fontSize:14,color:l.total>0?l.cor:C.textDim,fontWeight:800,fontFamily:"monospace"}}>{l.linha}</span>
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

      <div style={{ ...cardStyle,borderRadius:10,padding:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{color:C.textMuted,fontSize:12}}>Acumulado do mês</div>
        <div style={{fontFamily:"monospace",fontSize:28,fontWeight:900,color:totalMes>0?C.dangerLight:C.accentLight,
          textShadow:totalMes>0?`0 0 14px ${C.dangerLight}66`:"none"}}>{totalMes}</div>
      </div>
    </div>
  );
}

// ── PainelAvariasTV ───────────────────────────────────────────────────────────
export function PainelAvariasTV({ avariasData, setTela }) {
  const dados = Array.isArray(avariasData)?avariasData:[];
  const mes   = mesAtual();

  const totalMes = dados.filter(r=>r.data?.slice(0,7)===mes&&r.teveAvaria)
    .reduce((s,r)=>s+(r.totalAvarias||r.total||0),0);

  const shiftBounds=[];
  for(let day=0;day<10;day++){
    const d=new Date(); d.setDate(d.getDate()-9+day);
    const ds=d.toISOString().slice(0,10);
    for(const lt of["A","B","C"]) shiftBounds.push({data:ds,letra:lt});
  }
  const vals=shiftBounds.map(s=>{
    const recs=dados.filter(r=>r.data===s.data&&r.letra===s.letra&&r.teveAvaria);
    return recs.reduce((a,r)=>a+(r.totalAvarias||r.total||0),0);
  });

  const W=260,H=60,PAD=6;
  const maxV=Math.max(1,...vals);
  const xOf=(i)=>PAD+(i/(Math.max(1,shiftBounds.length-1)))*(W-PAD*2);
  const yOf=(v)=>H-PAD-((v/maxV)*(H-PAD*2));
  const pts=vals.map((v,i)=>`${xOf(i)},${yOf(v)}`);
  const lp=bPath(pts);
  const area=lp?lp+` L${xOf(vals.length-1)},${H-PAD} L${xOf(0)},${H-PAD} Z`:"";

  const contLinhas={};
  LINHAS.forEach(l=>{contLinhas[l]=0;});
  dados.filter(r=>r.data?.slice(0,7)===mes&&r.teveAvaria).forEach(r=>{
    r.itens?.forEach(it=>{ if(it.linha&&contLinhas[it.linha]!==undefined) contLinhas[it.linha]+=(it.quantidade||1); });
    if(!r.itens?.length&&r.linha&&contLinhas[r.linha]!==undefined) contLinhas[r.linha]+=(r.total||1);
  });
  const topLinhas=LINHAS.map(l=>({linha:l,cor:COR_LINHA[l],total:contLinhas[l]})).sort((a,b)=>b.total-a.total).slice(0,3);
  const maxL=Math.max(1,...topLinhas.map(t=>t.total));
  const corTopo=totalMes===0?C.accentLight:totalMes<=10?C.warningLight:C.dangerLight;

  return(
    <div onClick={()=>setTela&&setTela("historico")} style={{ ...cardStyle,border:`1px solid ${totalMes>0?C.dangerLight+"44":C.border}`,
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
        {lp&&<path d={lp} fill="none" stroke={corTopo} strokeWidth="1.5"
          strokeLinejoin="round" strokeLinecap="round"
          style={{filter:`drop-shadow(0 0 3px ${corTopo}aa)`}}/>}
        {vals.map((v,i)=>v>0?(
          <circle key={i} cx={xOf(i)} cy={yOf(v)} r="2.5" fill={corTopo}
            style={{filter:`drop-shadow(0 0 3px ${corTopo})`}}/>
        ):null)}
      </svg>
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
