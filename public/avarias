// ─── avarias.jsx — Checklist de Inspeção de Avarias · Enfardamento · Secagem H2
// Fluxo wizard: Teve avaria? → Contadores por tipo + fotos → Resumo → Salvar
// Integração: CATALOGO tipo:"avaria_enf", area:"enf" → renderizado em MVPSecagem
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

const LINHAS = ["L4","L5","L6","L7","L8"];
const MAX_W = 1280, MAX_H = 720, QUALITY = 0.80;

// ── Tipos de avaria ──────────────────────────────────────────────────────────
const TIPOS_AVARIA = [
  { id:"alt_linha",   label:"Diferença de altura",      icon:"📐", desc:"Mesma linha com alturas diferentes" },
  { id:"capa_rasgada",label:"Capa rasgada",             icon:"🔥", desc:"Rasgo visível na embalagem" },
  { id:"sem_capa",    label:"Faltando capa",            icon:"📭", desc:"Unit sem capa de embalagem" },
  { id:"arame_esp",   label:"Arame espaçado",           icon:"〰️", desc:"Arame fora da posição correta" },
  { id:"arame_cod",   label:"Arame em cima do código",  icon:"🏷️", desc:"Arame cobrindo código de barras" },
  { id:"sem_imp",     label:"Falta de impressão",       icon:"🖨️", desc:"Código ou dados sem impressão" },
  { id:"sem_logo",    label:"Unit sem logo",            icon:"🚫", desc:"Embalagem sem identificação" },
];

// ── Compressão de imagem ─────────────────────────────────────────────────────
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

// ── Componente principal ─────────────────────────────────────────────────────
export function AvariasTela({ onSalvar, turno, letra:letraProp, opPU, opPainel, data }) {
  const agora = new Date();
  const hora = horaAtual();
  const letra = calcularLetra();

  // estados
  const [passo, setPasso]       = useState(1); // 1=pergunta, 2=contadores, 3=resumo
  const [linha, setLinha]       = useState("L4");
  const [contadores, setContadores] = useState(() => Object.fromEntries(TIPOS_AVARIA.map(t=>[t.id,0])));
  const [fotos, setFotos]       = useState(() => Object.fromEntries(TIPOS_AVARIA.map(t=>[t.id,[]])));
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo]       = useState(false);
  const [fotoProcessando, setFotoProcessando] = useState(null);
  const inputRefs = useRef({});

  const totalAvarias = Object.values(contadores).reduce((a,b)=>a+b,0);
  const tiposComAvaria = TIPOS_AVARIA.filter(t=>contadores[t.id]>0);

  // ── Contador ──
  const setContador = (id, val) => {
    const v = Math.max(0, Math.min(8, val));
    setContadores(prev => ({ ...prev, [id]: v }));
  };

  // ── Foto por tipo ──
  const onFotoChange = useCallback(async (tipoId, e) => {
    const files = Array.from(e.target.files||[]);
    if(!files.length) return;
    setFotoProcessando(tipoId);
    const novas = [];
    for(const file of files) {
      if(!file.type.startsWith("image/")) continue;
      try { novas.push(await comprimirImagem(file)); } catch {}
    }
    setFotos(prev => ({ ...prev, [tipoId]: [...(prev[tipoId]||[]), ...novas] }));
    setFotoProcessando(null);
    e.target.value = "";
  }, []);

  const removerFoto = (tipoId, idx) => {
    setFotos(prev => ({ ...prev, [tipoId]: prev[tipoId].filter((_,i)=>i!==idx) }));
  };

  // ── Salvar ──
  const salvar = async (teveAvaria) => {
    setSalvando(true);
    const opConfig = storageGet("op_config")||{};
    const matricula = opConfig.matricula||"";
    const registro = {
      id: Date.now(),
      tipoId: "avaria_enf",
      tipoLabel: "Inspeção de Avarias",
      linha,
      maquina: maqDaLinha(linha),
      turno: turno || (storageGet("turno_ativo")||""),
      letra: letraProp || letra,
      hora,
      data: data || hoje(),
      matricula,
      opPU: opPU||"",
      opPainel: opPainel||"",
      teveAvaria,
      totalAvarias: teveAvaria ? totalAvarias : 0,
      itens: teveAvaria ? TIPOS_AVARIA.map(t=>({
        id: t.id,
        label: t.label,
        quantidade: contadores[t.id],
        fotos: (fotos[t.id]||[]).map(f=>({ base64:f.base64, kb:f.kb })),
      })) : [],
    };
    try {
      // Salva no historico_h2 (mesmo padrão dos outros checklists)
      const hist = storageGet("historico_h2")||[];
      hist.push(registro);
      storageSet("historico_h2", hist);
      await setDoc(doc(COL,"historico_h2"),{ val:hist, ts:Date.now() });

      // Salva também em avarias_h2 (para o dashboard de avarias)
      const avarHist = storageGet("avarias_h2")||[];
      avarHist.push({
        id: registro.id, data: registro.data, turno: registro.turno,
        letra: registro.letra, linha, maquina: registro.maquina,
        teveAvaria, total: registro.totalAvarias,
        itens: registro.itens.filter(i=>i.quantidade>0).map(i=>({ id:i.id, label:i.label, quantidade:i.quantidade })),
      });
      storageSet("avarias_h2", avarHist);
      await setDoc(doc(COL,"avarias_h2"),{ val:avarHist, ts:Date.now() });

      setSalvo(true);
      if(onSalvar) onSalvar(registro);
    } catch(e) { alert("Erro ao salvar: "+e.message); }
    setSalvando(false);
  };

  // ── SALVO ──
  if(salvo) return (
    <div style={{background:C.card,border:`1px solid ${C.accentLight}44`,borderTop:`3px solid ${C.accentLight}`,borderRadius:12,padding:24,textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:12}}>✅</div>
      <div style={{color:C.accentLight,fontWeight:800,fontSize:18,marginBottom:6}}>Inspeção salva!</div>
      <div style={{color:C.textMuted,fontSize:13,marginBottom:4}}>Linha {linha} · {maqDaLinha(linha)} · {letra}</div>
      <div style={{fontFamily:"monospace",fontSize:22,fontWeight:900,color:totalAvarias>0?C.dangerLight:C.accentLight,marginTop:12}}>
        {totalAvarias>0 ? `${totalAvarias} avaria${totalAvarias>1?"s":""}` : "Sem avarias"}
      </div>
    </div>
  );

  return (
    <div>
      {/* ── Seleção de linha ── */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.accentLight}`,borderRadius:12,padding:14,marginBottom:12}}>
        <div style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Linha</div>
        <div style={{display:"flex",gap:8}}>
          {LINHAS.map(l=>{
            const ativo=linha===l;
            return(
              <button key={l} onClick={()=>setLinha(l)}
                style={{flex:1,padding:"10px 4px",borderRadius:10,cursor:"pointer",
                  border:`2px solid ${ativo?"rgba(255,255,255,0.55)":C.border}`,
                  background:ativo?"#0E2847":C.tagBg,
                  color:ativo?"#fff":C.textMuted,fontWeight:ativo?800:500,fontSize:13,
                  boxShadow:ativo?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4)":"none"}}>
                {l}<div style={{fontSize:8,opacity:.6,marginTop:2}}>{maqDaLinha(l)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── PASSO 1: Teve avaria? ── */}
      {passo===1&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.warningLight}`,borderRadius:12,padding:20,textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:10}}>📋</div>
          <div style={{color:C.text,fontWeight:800,fontSize:16,marginBottom:6}}>Inspeção de Avarias</div>
          <div style={{color:C.textMuted,fontSize:13,marginBottom:24}}>Houve avaria neste turno na linha <strong style={{color:C.accentLight}}>{linha}</strong>?</div>
          <div style={{display:"flex",gap:12}}>
            <button onClick={()=>salvar(false)} disabled={salvando}
              style={{flex:1,padding:"16px",borderRadius:12,cursor:"pointer",fontWeight:800,fontSize:15,
                background:C.accentDark,border:`2px solid ${C.accentLight}`,color:C.accentLight}}>
              ✅ Não houve avaria
            </button>
            <button onClick={()=>setPasso(2)}
              style={{flex:1,padding:"16px",borderRadius:12,cursor:"pointer",fontWeight:800,fontSize:15,
                background:C.danger+"33",border:`2px solid ${C.dangerLight}`,color:C.dangerLight}}>
              ⚠️ Sim, houve avaria
            </button>
          </div>
        </div>
      )}

      {/* ── PASSO 2: Contadores por tipo ── */}
      {passo===2&&(
        <div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.dangerLight}`,borderRadius:12,padding:14,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{color:C.text,fontWeight:800,fontSize:14}}>⚠️ Tipos de avaria</div>
              {totalAvarias>0&&(
                <div style={{background:C.dangerLight+"22",border:`1px solid ${C.dangerLight}44`,borderRadius:20,padding:"3px 12px"}}>
                  <span style={{fontFamily:"monospace",fontWeight:900,fontSize:14,color:C.dangerLight}}>{totalAvarias}</span>
                  <span style={{fontSize:10,color:C.textDim,marginLeft:4}}>total</span>
                </div>
              )}
            </div>
            <div style={{color:C.textDim,fontSize:11,marginBottom:12}}>Indique a quantidade por tipo. Toque em 📷 para adicionar fotos.</div>

            {TIPOS_AVARIA.map(tipo=>{
              const n = contadores[tipo.id];
              const fotosDoTipo = fotos[tipo.id]||[];
              const processando = fotoProcessando===tipo.id;
              return(
                <div key={tipo.id} style={{
                  background:n>0?"rgba(192,39,45,0.08)":C.tagBg,
                  border:`1px solid ${n>0?C.dangerLight+"44":C.border}`,
                  borderLeft:`3px solid ${n>0?C.dangerLight:C.textDim}`,
                  borderRadius:10,padding:12,marginBottom:10,transition:"all .2s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:n>0?10:0}}>
                    <span style={{fontSize:18,flexShrink:0}}>{tipo.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:n>0?C.text:C.textMuted,fontWeight:n>0?700:500,fontSize:13}}>{tipo.label}</div>
                      <div style={{color:C.textDim,fontSize:10,marginTop:1}}>{tipo.desc}</div>
                    </div>
                    {/* Contador + / - */}
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

                  {/* Fotos — só aparece se contador > 0 */}
                  {n>0&&(
                    <div>
                      <input ref={el=>inputRefs.current[tipo.id]=el} type="file"
                        accept="image/*" multiple onChange={e=>onFotoChange(tipo.id,e)}
                        style={{display:"none"}}/>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",marginTop:6}}>
                        {fotosDoTipo.map((f,fi)=>(
                          <div key={fi} style={{position:"relative",width:60,height:44}}>
                            <img src={f.base64} style={{width:60,height:44,objectFit:"cover",borderRadius:6,
                              border:`1px solid ${C.border}`}}/>
                            <button onClick={()=>removerFoto(tipo.id,fi)}
                              style={{position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:"50%",
                                background:C.dangerLight,border:"none",color:"#fff",fontSize:10,
                                cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                                fontWeight:900,padding:0}}>×</button>
                          </div>
                        ))}
                        <button onClick={()=>inputRefs.current[tipo.id]?.click()} disabled={processando}
                          style={{height:44,padding:"0 10px",borderRadius:8,cursor:"pointer",
                            border:`1px dashed ${C.border}`,background:"transparent",
                            color:processando?C.textDim:C.textMuted,fontSize:11,fontWeight:600,
                            display:"flex",alignItems:"center",gap:4}}>
                          {processando?"⏳":"📷"} {fotosDoTipo.length>0?`+foto`:"Foto"}
                        </button>
                        {fotosDoTipo.length>0&&(
                          <span style={{fontSize:10,color:C.textDim}}>{fotosDoTipo.length} foto{fotosDoTipo.length>1?"s":""}</span>
                        )}
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
              ← Voltar
            </button>
            <button onClick={()=>setPasso(3)} disabled={totalAvarias===0}
              style={{flex:2,padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,
                background:totalAvarias>0?"linear-gradient(135deg,#c0272d,#FF5252)":C.tagBg,
                border:`1px solid ${totalAvarias>0?C.dangerLight:C.border}`,
                color:totalAvarias>0?"#fff":C.textDim,
                opacity:totalAvarias===0?0.5:1}}>
              Revisar ({totalAvarias} avaria{totalAvarias!==1?"s":""}) →
            </button>
          </div>
        </div>
      )}

      {/* ── PASSO 3: Resumo ── */}
      {passo===3&&(
        <div>
          <div style={{background:C.card,border:`1px solid ${C.dangerLight}44`,borderTop:`3px solid ${C.dangerLight}`,borderRadius:12,padding:16,marginBottom:12}}>
            <div style={{color:C.text,fontWeight:800,fontSize:15,marginBottom:4}}>📋 Resumo da Inspeção</div>
            <div style={{color:C.textMuted,fontSize:12,marginBottom:14}}>Linha {linha} · {maqDaLinha(linha)} · Turno {letraProp||letra}</div>

            {/* Total destaque */}
            <div style={{textAlign:"center",padding:"16px 0",borderBottom:`1px solid ${C.border}`,marginBottom:14}}>
              <div style={{fontFamily:"monospace",fontSize:52,fontWeight:900,color:C.dangerLight,lineHeight:1,
                textShadow:`0 0 20px ${C.dangerLight}66`}}>{totalAvarias}</div>
              <div style={{fontSize:12,color:C.textMuted,marginTop:4}}>avaria{totalAvarias!==1?"s":""} registrada{totalAvarias!==1?"s":""}</div>
            </div>

            {/* Lista por tipo */}
            {tiposComAvaria.map(tipo=>{
              const n=contadores[tipo.id];
              const fts=fotos[tipo.id]||[];
              return(
                <div key={tipo.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <span style={{fontSize:16}}>{tipo.icon}</span>
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
                  <div style={{fontFamily:"monospace",fontWeight:900,fontSize:18,color:C.dangerLight}}>{n}</div>
                </div>
              );
            })}
          </div>

          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setPasso(2)}
              style={{flex:1,padding:13,borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,
                background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted}}>
              ← Corrigir
            </button>
            <button onClick={()=>salvar(true)} disabled={salvando}
              style={{flex:2,padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,
                background:"linear-gradient(135deg,#c0272d,#FF5252)",border:"none",color:"#fff",
                opacity:salvando?0.6:1}}>
              {salvando?"Salvando…":"✓ Confirmar e Salvar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
