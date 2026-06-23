// ─── barcode.jsx — Validação de Código de Barras · Secagem H2 ────────────────
// Checklist de enfardamento: valida 8 fardos (Lado A + Lado B) por unidade.
// Regra: A ≥ 2 E B ≥ 2 → APROVADO; senão → AVARIA DE IMPRESSÃO.
// Grava histórico no Firebase (tipoId:"barcode_enf") para aparecer no Histórico geral.
import * as React from "react";
import { COL, doc, setDoc, getDoc } from "./firebase";

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  bg:"#04111D", surface:"#071828", card:"#0A1929",
  accent:"#00E676", accentLight:"#00E676", accentDark:"#006B2E",
  blue:"#0E2847", blueLight:"#1A5CCC",
  warning:"#b87d00", warningLight:"#FFC107",
  danger:"#c0272d", dangerLight:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880",
  border:"rgba(60,255,140,0.15)", tagBg:"rgba(255,255,255,0.04)",
};

// ── Storage helpers ───────────────────────────────────────────────────────────
const storageGet = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const storageSet = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  try { setDoc(doc(COL, k), { val: v, ts: Date.now() }); } catch {}
};
const cloudGet = async (k) => {
  try {
    const s = await getDoc(doc(COL, k));
    if (s.exists()) { const d = s.data().val; try { localStorage.setItem(k, JSON.stringify(d)); } catch {} return d; }
  } catch {}
  return storageGet(k);
};

// ── Decodificador ─────────────────────────────────────────────────────────────
const ANO_MAP = { E:2026, F:2027, G:2028, H:2029 };
const MAQ_MAP = { P:"Máq 1", Q:"Máq 2", R:"Máq 3" };
function decodificar(raw) {
  if (!raw || raw.length < 12) return null;
  const r = raw.trim().toUpperCase();
  return {
    raw: r,
    ano:    ANO_MAP[r[0]] || r[0],
    mes:    r.slice(1,3),
    dia:    r.slice(3,5),
    maq:    MAQ_MAP[r[5]] || r[5],
    linha:  "L" + r[6],
    lote:   r.slice(7,9).replace(/^0+/,"") || "0",
    unidade: r.slice(9,12),
  };
}

// ── Helpers turno/letra ───────────────────────────────────────────────────────
const hoje       = () => new Date().toISOString().slice(0,10);
const horaAtual  = () => new Date().toTimeString().slice(0,5);
const getAutoTurno = () => { const h=new Date().getHours(); return h<8?"00x08":h<16?"08x16":"16x24"; };
const calcularLetra = () => {
  const S=["E","D","A","B","C"], BASE=new Date("2026-06-09T00:00:00"), a=new Date();
  const dias=Math.floor((a-BASE)/(864e5)), bloco=Math.floor(dias/2)%5, t=a.getHours()<8?0:a.getHours()<16?1:2;
  return S[((bloco-t)%5+5)%5];
};

const initialFardos = () => ({ A:[null,null,null,null], B:[null,null,null,null] });
const initialArames = () => ({ a218:"", a3mm:"" });

// ── Animações CSS ─────────────────────────────────────────────────────────────
const STYLES = `
@keyframes trava-pulse {
  0%,100%{box-shadow:0 0 0 0 rgba(255,82,82,0.7),inset 0 0 12px rgba(255,82,82,0.15);}
  50%{box-shadow:0 0 0 8px rgba(255,82,82,0),inset 0 0 20px rgba(255,82,82,0.3);}
}
@keyframes glow-pulse {
  0%,100%{box-shadow:0 0 0 0 rgba(0,230,118,0.6);}
  50%{box-shadow:0 0 0 8px rgba(0,230,118,0);}
}
@keyframes scan-line {
  0%{top:20%;}50%{top:75%;}100%{top:20%;}
}
@keyframes fade-in {
  from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}
}
.barcode-aprovado { animation: glow-pulse 1.5s ease-in-out 3; }
.barcode-avaria   { animation: trava-pulse 1s ease-in-out infinite; }
.barcode-fade     { animation: fade-in .25s ease; }
`;

// ── Itens de arame ────────────────────────────────────────────────────────────
const ITENS_ARAME = [
  {
    id:"a218",
    label:"Arame 2,18 mm",
    pergunta:"Arame 2,18 mm está fora da área de impressão?",
    instrucao:"Verifique se o arame fino não está sobreposto ao código de barras ou logotipo.",
    opcoes:["OK — fora da impressão","Não OK — arame sobre o código","Não se aplica — produção sem arame 2,18 mm"],
    alertOpcoes:["Não OK — arame sobre o código"],
  },
  {
    id:"a3mm",
    label:"Arame 3 mm",
    pergunta:"Arame 3 mm está fora da área de impressão?",
    instrucao:"Verifique se o arame grosso não está sobreposto ao código de barras ou logotipo.",
    opcoes:["OK — fora da impressão","Não OK — arame sobre o código"],
    alertOpcoes:["Não OK — arame sobre o código"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BarcodeModal
// Props: linha ("L4"…"L8"), onFechar ()=>void
// ─────────────────────────────────────────────────────────────────────────────
export function BarcodeModal({ linha, onFechar }) {
  const cfg      = storageGet("op_config") || {};
  const operador = cfg.nomeOperador || "";

  const [fardos,   setFardos]   = React.useState(initialFardos);
  const [arames,   setArames]   = React.useState(initialArames);
  const [lendo,    setLendo]    = React.useState(null);
  const [meta,     setMeta]     = React.useState(null);
  const [erroScan, setErroScan] = React.useState("");
  const [salvo,    setSalvo]    = React.useState(false);
  const [salvando, setSalvando] = React.useState(false);

  const scannerRef  = React.useRef(null);
  const SCANNER_DIV = "bc-scanner-div";

  React.useEffect(() => {
    if (!document.getElementById("bc-styles")) {
      const s = document.createElement("style");
      s.id = "bc-styles"; s.textContent = STYLES;
      document.head.appendChild(s);
    }
  }, []);

  // Contagens
  const contA = fardos.A.filter(Boolean).length;
  const contB = fardos.B.filter(Boolean).length;
  const fardosOk  = contA >= 2 && contB >= 2;

  // Arames: a218 pode ser "Não se aplica" (ok); a3mm sempre precisa resposta OK
  const arameOk = (id) => {
    if (id === "a218") return arames.a218 === "OK — fora da impressão" || arames.a218 === "Não se aplica — produção sem arame 2,18 mm";
    return arames.a3mm === "OK — fora da impressão";
  };
  const aramesTodosOk = arameOk("a218") && arameOk("a3mm");
  const aramesRespondidos = ITENS_ARAME.every(i => arames[i.id] !== "");
  const temAlerta218 = arames.a218 === "Não OK — arame sobre o código";
  const temAlerta3mm = arames.a3mm === "Não OK — arame sobre o código";

  const aprovado   = fardosOk && aramesTodosOk;
  const temAlgum   = contA > 0 || contB > 0 || aramesRespondidos;
  const podeSalvar = temAlgum && !salvo;

  // ── Câmera ──────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!lendo) {
      if (scannerRef.current) {
        try { scannerRef.current.stop().catch(()=>{}); } catch {}
        scannerRef.current = null;
      }
      return;
    }
    setErroScan("");

    const iniciar = () => {
      if (!window.Html5Qrcode) { setErroScan("Biblioteca não carregou."); setLendo(null); return; }
      try {
        const scanner = new window.Html5Qrcode(SCANNER_DIV);
        scannerRef.current = scanner;
        scanner.start(
          { facingMode:"environment" },
          { fps:10, qrbox:{ width:320, height:140 } },
          (txt) => {
            scanner.stop().catch(()=>{});
            scannerRef.current = null;
            handleScanSuccess(txt, lendo.lado, lendo.idx);
          },
          ()=>{}
        ).catch(()=>{ setErroScan("Câmera bloqueada. Verifique as permissões."); setLendo(null); });
      } catch { setErroScan("Erro ao iniciar câmera."); setLendo(null); }
    };

    const scriptId = "html5qrcode-script";
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js";
      s.onload = iniciar;
      s.onerror = () => { setErroScan("Falha ao carregar leitor."); setLendo(null); };
      document.head.appendChild(s);
    } else { iniciar(); }

    return () => {
      if (scannerRef.current) { try { scannerRef.current.stop().catch(()=>{}); } catch {} scannerRef.current = null; }
    };
  }, [lendo]);

  function handleScanSuccess(raw, lado, idx) {
    const dec = decodificar(raw);
    if (!dec) { setErroScan(`Código inválido: ${raw}`); setLendo(null); return; }
    if (!meta) setMeta(dec);
    setFardos(prev => { const n={A:[...prev.A],B:[...prev.B]}; n[lado][idx]=dec.raw; return n; });
    setSalvo(false);
    setLendo(null);
  }

  function removerFardo(lado, idx) {
    setFardos(prev => { const n={A:[...prev.A],B:[...prev.B]}; n[lado][idx]=null; return n; });
    setSalvo(false);
  }

  function setArame(id, val) {
    setArames(prev => ({...prev, [id]: prev[id]===val ? "" : val}));
    setSalvo(false);
  }

  async function handleSalvar() {
    setSalvando(true);
    // monta items (cada fardo lido + arames) para o detalhe do Histórico
    const items = [];
    ["A","B"].forEach(lado => {
      fardos[lado].forEach((cod, i) => {
        items.push({ id:`fardo_${lado}_${i}`, secao:`Lado ${lado}`, item:`Fardo ${i+1}`, ref:"lido", unit:"barcode",
          resp: cod ? "ok" : "nao", codigo: cod || "" });
      });
    });
    items.push({ id:"arame_218", secao:"Arames", item:"Arame 2,18 mm", ref:"OK", unit:"nível", resp: arames.a218==="Não OK — arame sobre o código"?"nok":"ok", obs:arames.a218 });
    items.push({ id:"arame_3mm", secao:"Arames", item:"Arame 3 mm", ref:"OK", unit:"nível", resp: arames.a3mm==="Não OK — arame sobre o código"?"nok":"ok", obs:arames.a3mm });
    const reg = {
      id:Date.now(),
      tipoId:"barcode_enf",
      tipoLabel:"Validação de Fardos",
      data:hoje(), hora:horaAtual(),
      turno:getAutoTurno(), letra:calcularLetra(),
      operador, opPU:operador, linha,
      lote:meta?.lote||"", unidade:meta?.unidade||"", maquina:meta?.maq||"",
      fardos:{ A:fardos.A, B:fardos.B, contA, contB },
      arames:{ a218:arames.a218, a3mm:arames.a3mm },
      resultado: aprovado ? "APROVADO" : "AVARIA",
      noks: [temAlerta218, temAlerta3mm, !fardosOk].filter(Boolean).length,
      total: 8,
      items,
      obs: meta?.raw ? `Código: ${meta.raw}` : "",
    };
    const hist = storageGet("barcode_hist_h2") || [];
    storageSet("barcode_hist_h2", [reg, ...hist].slice(0,200));
    // Grava no histórico do app (mesma chave que a tela Histórico lê)
    const histApp = storageGet("historico_h2") || [];
    storageSet("historico_h2", [...histApp, reg]);
    setSalvo(true);
    setSalvando(false);
  }

  function handleNova() {
    setFardos(initialFardos()); setArames(initialArames());
    setMeta(null); setSalvo(false); setErroScan("");
  }

  // ── FardoCard ─────────────────────────────────────────────────────────────
  function FardoCard({ lado, idx }) {
    const cod   = fardos[lado][idx];
    const ativo = lendo?.lado === lado && lendo?.idx === idx;
    const lido  = Boolean(cod);
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, flex:1 }}>
        <div
          onClick={() => lido ? removerFardo(lado,idx) : setLendo({ lado, idx })}
          className={lido ? "barcode-fade" : ""}
          style={{
            width:"100%", minWidth:56, height:78, borderRadius:10, cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            gap:4, position:"relative", transition:"all .2s",
            background: ativo?"rgba(255,193,7,0.12)":lido?"rgba(0,230,118,0.12)":"rgba(255,82,82,0.08)",
            border:`2px solid ${ativo?C.warningLight:lido?C.accentLight:C.dangerLight}`,
            boxShadow: ativo?`0 0 16px ${C.warningLight}66`:lido?`0 0 12px ${C.accentLight}44`:"none",
          }}
        >
          <svg width="32" height="22" viewBox="0 0 32 22" fill="none">
            <rect x="1" y="1" width="30" height="20" rx="3"
              fill={lido?"rgba(0,230,118,0.15)":ativo?"rgba(255,193,7,0.1)":"rgba(255,82,82,0.08)"}
              stroke={lido?C.accentLight:ativo?C.warningLight:C.dangerLight} strokeWidth="1.5"/>
            <line x1="8"  y1="1" x2="8"  y2="21" stroke={lido?C.accentLight:C.textDim} strokeWidth="1"/>
            <line x1="24" y1="1" x2="24" y2="21" stroke={lido?C.accentLight:C.textDim} strokeWidth="1"/>
            {lido
              ? <path d="M13 11 L15.5 13.5 L19 9" stroke={C.accentLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              : ativo
                ? <rect x="12" y="8" width="8" height="6" rx="1" fill={C.warningLight} opacity=".7"/>
                : <path d="M13 9 L19 13 M19 9 L13 13" stroke={C.dangerLight} strokeWidth="1.5" strokeLinecap="round"/>
            }
          </svg>
          <span style={{ fontSize:9, fontWeight:700, fontFamily:"monospace",
            color:ativo?C.warningLight:lido?C.accentLight:C.dangerLight }}>F{idx+1}</span>
          {lido && (
            <div onClick={e=>{e.stopPropagation();removerFardo(lado,idx);}} style={{
              position:"absolute", top:-7, right:-7, width:18, height:18,
              borderRadius:"50%", background:C.danger, color:"#fff",
              fontSize:11, display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:700, cursor:"pointer", zIndex:2,
            }}>×</div>
          )}
        </div>
        {lido && <span style={{ fontSize:8, color:C.accentLight, fontFamily:"monospace", fontWeight:700, maxWidth:"100%", wordBreak:"break-all", lineHeight:1.2, textAlign:"center" }}>{cod}</span>}
        {!lido && !ativo && (
          <button onClick={()=>setLendo({lado,idx})} style={{ padding:"3px 6px", borderRadius:5, border:`1px solid ${C.dangerLight}55`, background:"transparent", color:C.dangerLight, fontSize:8, cursor:"pointer", fontWeight:700 }}>📷 LER</button>
        )}
        {ativo && <span style={{ fontSize:8, color:C.warningLight, fontWeight:700 }}>aguardando…</span>}
      </div>
    );
  }

  // ── Placar A/B ────────────────────────────────────────────────────────────
  function Placar({ lado, cont }) {
    const ok = cont >= 2;
    return (
      <div style={{ flex:1, borderRadius:12, padding:"10px 12px", background:ok?"rgba(0,230,118,0.08)":"rgba(255,82,82,0.08)", border:`1.5px solid ${ok?C.accentLight+"66":C.dangerLight+"66"}`, borderTop:`3px solid ${ok?C.accentLight:C.dangerLight}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={{ color:C.textMuted, fontSize:10, fontWeight:700, letterSpacing:"0.1em" }}>LADO {lado}</span>
          <span style={{ color:ok?C.accentLight:C.dangerLight, fontSize:12, fontWeight:900 }}>{cont}/4 {ok?"✓":"(mín 2)"}</span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {[0,1,2,3].map(i=>(
            <div key={i} style={{ flex:1, height:8, borderRadius:4, transition:"background .3s",
              background:i<cont?(ok?C.accentLight:C.warningLight):"rgba(255,255,255,0.06)",
              boxShadow:i<cont&&ok?`0 0 6px ${C.accentLight}88`:"none" }}/>
          ))}
        </div>
      </div>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:C.bg, display:"flex", flexDirection:"column", fontFamily:"system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div>
          <div style={{ color:C.accentLight, fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}>📦 Validação de Fardos</div>
          <div style={{ color:C.text, fontSize:15, fontWeight:800, marginTop:1, fontFamily:"monospace" }}>
            {linha}
            {meta && <span style={{ color:C.textMuted, fontSize:12, fontWeight:400 }}>{" "}· Lote <b style={{color:C.text}}>{meta.lote}</b> · Un. <b style={{color:C.text}}>{meta.unidade}</b></span>}
          </div>
        </div>
        <button onClick={onFechar} style={{ background:"rgba(255,82,82,0.12)", border:`1px solid ${C.dangerLight}44`, borderRadius:8, color:C.dangerLight, fontSize:20, width:38, height:38, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>✕</button>
      </div>

      {/* Conteúdo */}
      <div style={{ flex:1, overflowY:"auto", padding:"14px 16px" }}>

        {/* Banner resultado */}
        {temAlgum && (
          <div className={aprovado?"barcode-aprovado":"barcode-avaria"} style={{ borderRadius:12, padding:"12px 16px", marginBottom:14, background:aprovado?"rgba(0,230,118,0.10)":"rgba(255,82,82,0.12)", border:`2px solid ${aprovado?C.accentLight:C.dangerLight}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ color:aprovado?C.accentLight:C.dangerLight, fontWeight:900, fontSize:15, letterSpacing:"0.05em" }}>
                {aprovado?"✅ APROVADO":"🚨 AVARIA"}
              </div>
              <div style={{ color:C.textMuted, fontSize:10, marginTop:3 }}>
                A: {contA}/4 · B: {contB}/4
                {temAlerta218 && " · ⚠ Arame 2,18 mm sobre código"}
                {temAlerta3mm && " · ⚠ Arame 3 mm sobre código"}
              </div>
            </div>
            <div style={{ fontSize:32 }}>{aprovado?"✅":"🚨"}</div>
          </div>
        )}

        {/* Placares */}
        <div style={{ display:"flex", gap:10, marginBottom:14 }}>
          <Placar lado="A" cont={contA}/>
          <Placar lado="B" cont={contB}/>
        </div>

        {/* Scanner tela cheia */}
        {lendo && (
          <div style={{ position:"fixed", inset:0, zIndex:10000, background:"#000", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"14px 16px", background:"rgba(0,0,0,0.85)", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid rgba(255,193,7,0.3)" }}>
              <div>
                <div style={{ color:C.warningLight, fontWeight:800, fontSize:13 }}>📷 Lendo — Lado {lendo.lado} · Fardo {lendo.idx+1}</div>
                <div style={{ color:"rgba(255,255,255,0.5)", fontSize:10, marginTop:2 }}>Aponte a câmera para o código de barras do fardo</div>
              </div>
              <button onClick={()=>{ setLendo(null); setErroScan(""); }} style={{ background:"rgba(255,82,82,0.2)", border:`1px solid ${C.dangerLight}55`, borderRadius:8, color:C.dangerLight, fontSize:18, width:38, height:38, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>
            <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
              <div id={SCANNER_DIV} style={{ width:"100%", height:"100%" }}/>
              <div style={{ position:"absolute", inset:0, pointerEvents:"none", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ width:320, height:140, position:"relative", border:"2px solid rgba(255,193,7,0.8)", borderRadius:8, boxShadow:"0 0 0 9999px rgba(0,0,0,0.55)" }}>
                  {[[true,true,true,false],[true,true,false,true],[false,false,true,false],[false,false,false,true]].map(([bt,bb,bl,br],i)=>(
                    <div key={i} style={{ position:"absolute", top:i<2?-2:"auto", bottom:i>=2?-2:"auto", left:i%2===0?-2:"auto", right:i%2===1?-2:"auto", width:20, height:20,
                      borderTop:bt?`3px solid ${C.warningLight}`:"none", borderBottom:bb?`3px solid ${C.warningLight}`:"none",
                      borderLeft:bl?`3px solid ${C.warningLight}`:"none", borderRight:br?`3px solid ${C.warningLight}`:"none" }}/>
                  ))}
                  <div style={{ position:"absolute", left:4, right:4, height:2, background:`linear-gradient(90deg,transparent,${C.dangerLight},transparent)`, animation:"scan-line 2s ease-in-out infinite", boxShadow:`0 0 8px ${C.dangerLight}` }}/>
                </div>
              </div>
            </div>
            <div style={{ padding:"12px 16px", background:"rgba(0,0,0,0.85)", textAlign:"center", color:"rgba(255,255,255,0.45)", fontSize:11 }}>
              Código linear grande — mantenha o fardo estável e bem iluminado
            </div>
          </div>
        )}

        {/* Erro scan */}
        {erroScan && (
          <div style={{ background:"rgba(255,82,82,0.1)", border:`1px solid ${C.dangerLight}44`, borderRadius:8, padding:"8px 12px", marginBottom:12 }}>
            <span style={{ color:C.dangerLight, fontSize:11 }}>⚠ {erroScan}</span>
          </div>
        )}

        {/* Lados A e B */}
        {["A","B"].map(lado => {
          const cont = lado==="A"?contA:contB;
          const ok   = cont >= 2;
          return (
            <div key={lado} style={{ background:C.card, borderRadius:12, padding:"12px 14px", marginBottom:12, border:`1px solid ${C.border}`, borderTop:`3px solid ${ok?C.accentLight:C.dangerLight}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <span style={{ color:C.text, fontWeight:800, fontSize:14 }}>LADO {lado}</span>
                <span style={{ padding:"3px 10px", borderRadius:20, background:ok?"rgba(0,230,118,0.12)":"rgba(255,82,82,0.12)", color:ok?C.accentLight:C.dangerLight, fontSize:10, fontWeight:800 }}>
                  {cont}/4 {ok?"✓":"mín 2"}
                </span>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {[0,1,2,3].map(idx=><FardoCard key={idx} lado={lado} idx={idx}/>)}
              </div>
            </div>
          );
        })}

        {/* ── Checklist de Arames ── */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderTop:`3px solid ${C.blueLight}`, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
          <div style={{ color:C.text, fontWeight:800, fontSize:13, marginBottom:12, letterSpacing:"0.04em" }}>
            🪢 Posição dos Arames
          </div>
          {ITENS_ARAME.map(item => {
            const resp = arames[item.id];
            const isAlerta = item.alertOpcoes.includes(resp);
            const isOk     = resp && !isAlerta;
            return (
              <div key={item.id} style={{ marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:4 }}>
                  <div style={{ width:18, height:18, borderRadius:"50%", flexShrink:0, marginTop:1,
                    background:isAlerta?C.danger:isOk?C.accent:C.tagBg,
                    border:`2px solid ${isAlerta?C.dangerLight:isOk?C.accentLight:C.border}`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"#fff", fontWeight:800 }}>
                    {isAlerta?"⚠":isOk?"✓":""}
                  </div>
                  <div>
                    <div style={{ color:C.text, fontSize:12, fontWeight:700 }}>{item.label}</div>
                    <div style={{ color:C.textMuted, fontSize:11, marginTop:1 }}>{item.pergunta}</div>
                    <div style={{ color:C.textDim, fontSize:10, marginTop:2, fontStyle:"italic" }}>{item.instrucao}</div>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6, paddingLeft:26 }}>
                  {item.opcoes.map(op => {
                    const ativo  = resp === op;
                    const alerta = item.alertOpcoes.includes(op);
                    return (
                      <button key={op} onClick={()=>setArame(item.id, op)} style={{
                        padding:"9px 12px", borderRadius:9, cursor:"pointer", textAlign:"left",
                        fontWeight:ativo?700:400, fontSize:12, transition:"all .15s",
                        background:ativo?(alerta?C.danger:C.accent):"rgba(255,255,255,0.03)",
                        border:`1.5px solid ${ativo?(alerta?C.dangerLight:C.accentLight):C.border}`,
                        color:ativo?"#fff":alerta?C.dangerLight:C.textMuted,
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                      }}>
                        <span>{op}</span>
                        {ativo && <span style={{ fontSize:13 }}>{alerta?"⚠":"✓"}</span>}
                      </button>
                    );
                  })}
                </div>
                {isAlerta && (
                  <div style={{ marginTop:8, paddingLeft:26 }}>
                    <div style={{ background:"rgba(255,82,82,0.08)", border:`1px solid ${C.dangerLight}44`, borderRadius:8, padding:"7px 10px" }}>
                      <span style={{ color:C.dangerLight, fontSize:11, fontWeight:700 }}>⚠ Ajuste necessário — reposicione o arame antes de liberar a unit</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Meta código */}
        {meta && (
          <div style={{ background:C.tagBg, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px", marginBottom:14 }}>
            <div style={{ color:C.textDim, fontSize:9, textTransform:"uppercase", marginBottom:6, letterSpacing:"0.1em" }}>Código detectado</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 16px" }}>
              {[["Código",meta.raw],["Ano",meta.ano],["Data",`${meta.dia}/${meta.mes}`],["Máquina",meta.maq],["Linha",meta.linha],["Lote",meta.lote],["Unidade",meta.unidade]].map(([l,v])=>(
                <div key={l} style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                  <span style={{ color:C.textDim, fontSize:8, textTransform:"uppercase" }}>{l}</span>
                  <span style={{ color:C.text, fontSize:11, fontWeight:700, fontFamily:"monospace" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões */}
        <div style={{ display:"flex", gap:8, marginBottom:8 }}>
          <button onClick={handleNova} style={{ flex:1, padding:12, borderRadius:10, cursor:"pointer", background:C.tagBg, border:`1px solid ${C.border}`, color:C.textMuted, fontSize:12, fontWeight:700 }}>🔄 Nova</button>
          <button onClick={handleSalvar} disabled={!podeSalvar||salvando} style={{
            flex:2.5, padding:12, borderRadius:10, border:"none", fontSize:13, fontWeight:800, color:"#fff",
            cursor:podeSalvar&&!salvando?"pointer":"not-allowed", transition:"background .3s",
            background:salvo?C.accentDark:!temAlgum?C.textDim:aprovado?C.accent:C.danger,
          }}>
            {salvando?"Salvando…":salvo?"✓ Salvo!":aprovado?"✓ Salvar — Aprovado":"⚠ Salvar — Avaria"}
          </button>
        </div>
        {operador && (
          <div style={{ color:C.textDim, fontSize:9, textAlign:"center" }}>
            👤 {operador} · {getAutoTurno()} · Letra {calcularLetra()}
          </div>
        )}
      </div>
    </div>
  );
}
