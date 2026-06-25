// ─── carrossel.jsx — Gestão e exibição de imagens · Secagem H2 ────────────
// PainelCarrossel: upload, preview, remover, reordenar (só dev, via admin.jsx)
// CarrosselViewer: slideshow pro Dashboard
import { useState, useEffect, useRef, useCallback } from "react";
import { db, doc, onSnapshot, setDoc, deleteDoc } from "./firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const C = {
  bg:"#04111D", surface:"#071828", card:"#0A1929", cardHover:"#0E2847",
  accent:"#00E676", accentDark:"#006B2E",
  blue:"#0E2847", blueLight:"#1A5CCC",
  danger:"#c0272d", dangerLight:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880",
  border:"rgba(60,255,140,0.15)", tagBg:"rgba(255,255,255,0.04)",
  warningLight:"#FFC107",
};

// Cada imagem = doc próprio em carrossel_h2/{id} → sem limite de 1MB
const CARR_COL = () => collection(db, "carrossel_h2");
const MAX_W = 1920, MAX_H = 1080, QUALITY = 0.82;

// ── Compressão via canvas ─────────────────────────────────────────────────
function comprimirImagem(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width: w, height: h } = img;
      const ratio = Math.min(MAX_W / w, MAX_H / h, 1);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL("image/jpeg", QUALITY);
      URL.revokeObjectURL(url);
      const kb = Math.round((base64.length * 3) / 4 / 1024);
      resolve({ base64, kb, w, h });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Falha ao carregar imagem")); };
    img.src = url;
  });
}

// ── PainelCarrossel ───────────────────────────────────────────────────────
export function PainelCarrossel() {
  const [imagens, setImagens]       = useState([]);
  const [preview, setPreview]       = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando]     = useState(false);
  const [msg, setMsg]               = useState("");
  const [confirmarRem, setConfirmarRem] = useState(null);
  const inputRef = useRef();

  const flash = (t, ok=true) => { setMsg({ texto: t, ok }); setTimeout(() => setMsg(""), 3000); };

  // Lê todos os docs da coleção carrossel_h2, ordenados por ordem
  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const snap = await getDocs(query(CARR_COL(), orderBy("ordem", "asc")));
      const lista = [];
      snap.forEach(d => lista.push({ id: d.id, ...d.data() }));
      setImagens(lista);
    } catch { setImagens([]); }
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const onFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { flash("Selecione uma imagem.", false); return; }
    try {
      const result = await comprimirImagem(file);
      setPreview({ ...result, nome: file.name });
    } catch { flash("Erro ao processar imagem.", false); }
    e.target.value = "";
  }, []);

  // Cada imagem = doc próprio → sem limite de 1MB por upload
  const confirmarUpload = async () => {
    if (!preview) return;
    setSalvando(true);
    try {
      const id = Date.now().toString();
      const maxOrdem = imagens.length > 0 ? Math.max(...imagens.map(i => i.ordem ?? 0)) : -1;
      await setDoc(doc(db, "carrossel_h2", id), {
        id,
        base64: preview.base64,
        nome: preview.nome,
        kb: preview.kb,
        w: preview.w,
        h: preview.h,
        ordem: maxOrdem + 1,
        adicionadaEm: new Date().toISOString(),
      });
      setPreview(null);
      flash(`Imagem adicionada (${preview.kb} KB).`);
      await carregar();
    } catch (e) { flash("Erro ao salvar: " + e.message, false); }
    setSalvando(false);
  };

  const remover = async (id) => {
    setSalvando(true);
    try {
      await deleteDoc(doc(db, "carrossel_h2", id));
      setConfirmarRem(null);
      flash("Imagem removida.");
      await carregar();
    } catch { flash("Erro ao remover.", false); }
    setSalvando(false);
  };

  // Reordenar: troca o campo `ordem` entre dois docs
  const mover = async (idx, dir) => {
    const alvo = idx + dir;
    if (alvo < 0 || alvo >= imagens.length) return;
    setSalvando(true);
    try {
      const a = imagens[idx], b = imagens[alvo];
      await setDoc(doc(db, "carrossel_h2", a.id), { ...a, ordem: b.ordem });
      await setDoc(doc(db, "carrossel_h2", b.id), { ...b, ordem: a.ordem });
      await carregar();
    } catch { flash("Erro ao reordenar.", false); }
    setSalvando(false);
  };

  return (
    <div style={{ padding: "0 0 24px" }}>
      {/* Msg feedback */}
      {msg && (
        <div style={{ background: msg.ok ? C.accentDark+"33" : C.danger+"22",
          border: `1px solid ${msg.ok ? C.accent : C.dangerLight}55`,
          borderRadius: 9, padding: "9px 12px", marginBottom: 12 }}>
          <span style={{ color: msg.ok ? C.accent : C.dangerLight, fontSize: 12, fontWeight: 600 }}>{msg.texto}</span>
        </div>
      )}

      {/* ── Upload ── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>
          🖼️ Adicionar Imagem
        </div>

        {preview ? (
          <div>
            <img src={preview.base64} alt="preview"
              style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginBottom: 10, border: `1px solid ${C.border}` }}/>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: C.textDim }}>{preview.nome}</span>
              <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "monospace" }}>
                {preview.kb} KB · {preview.w}×{preview.h}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setPreview(null)}
                style={{ flex: 1, padding: 10, borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 12,
                  background: C.tagBg, border: `1px solid ${C.border}`, color: C.textMuted }}>
                Cancelar
              </button>
              <button onClick={confirmarUpload} disabled={salvando}
                style={{ flex: 2, padding: 10, borderRadius: 9, cursor: "pointer", fontWeight: 800, fontSize: 12,
                  background: C.accent, border: "none", color: "#000", opacity: salvando ? 0.6 : 1 }}>
                {salvando ? "Salvando…" : "✓ Adicionar ao carrossel"}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => inputRef.current?.click()}
            style={{ width: "100%", padding: "18px 12px", borderRadius: 10, cursor: "pointer",
              border: `2px dashed ${C.border}`, background: "transparent", color: C.textMuted,
              fontSize: 13, fontWeight: 600, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 28 }}>📷</span>
            <span>Toque para escolher foto</span>
            <span style={{ fontSize: 10, color: C.textDim }}>JPG, PNG, HEIC · comprimido automaticamente</span>
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange}
          style={{ display: "none" }}/>
      </div>

      {/* ── Lista de imagens ── */}
      <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
        marginBottom: 10, textTransform: "uppercase" }}>
        📋 Imagens no carrossel ({imagens.length})
      </div>

      {carregando ? (
        <div style={{ textAlign: "center", color: C.textDim, padding: 24, fontSize: 13 }}>Carregando…</div>
      ) : imagens.length === 0 ? (
        <div style={{ textAlign: "center", color: C.textDim, padding: 24, fontSize: 13,
          border: `1px solid ${C.border}`, borderRadius: 10 }}>
          Nenhuma imagem adicionada ainda.
        </div>
      ) : (
        imagens.map((img, idx) => (
          <div key={img.id} style={{ background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
            {confirmarRem === img.id ? (
              <div style={{ padding: 14, background: C.danger+"11", border: `1px solid ${C.dangerLight}33` }}>
                <p style={{ color: C.dangerLight, fontSize: 12, margin: "0 0 10px", fontWeight: 600 }}>
                  Remover esta imagem?
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setConfirmarRem(null)}
                    style={{ flex: 1, padding: 9, borderRadius: 8, cursor: "pointer", fontWeight: 700,
                      fontSize: 12, background: C.tagBg, border: `1px solid ${C.border}`, color: C.textMuted }}>
                    Cancelar
                  </button>
                  <button onClick={() => remover(img.id)} disabled={salvando}
                    style={{ flex: 1, padding: 9, borderRadius: 8, cursor: "pointer", fontWeight: 800,
                      fontSize: 12, background: C.danger, border: "none", color: "#fff" }}>
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 10 }}>
                <img src={img.base64} alt={img.nome}
                  style={{ width: 72, height: 48, objectFit: "cover", borderRadius: 6, flexShrink: 0,
                    border: `1px solid ${C.border}` }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 600,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.nome}</div>
                  <div style={{ fontSize: 10, color: C.textDim, fontFamily: "monospace", marginTop: 2 }}>
                    {img.kb} KB · {img.w}×{img.h} · #{idx + 1}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => mover(idx, -1)} disabled={idx === 0 || salvando}
                    style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`,
                      background: C.tagBg, color: idx === 0 ? C.textDim : C.textMuted,
                      cursor: idx === 0 ? "default" : "pointer", fontSize: 14 }}>↑</button>
                  <button onClick={() => mover(idx, 1)} disabled={idx === imagens.length - 1 || salvando}
                    style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`,
                      background: C.tagBg, color: idx === imagens.length - 1 ? C.textDim : C.textMuted,
                      cursor: idx === imagens.length - 1 ? "default" : "pointer", fontSize: 14 }}>↓</button>
                  <button onClick={() => setConfirmarRem(img.id)}
                    style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.dangerLight}44`,
                      background: C.danger+"11", color: C.dangerLight, cursor: "pointer", fontSize: 14 }}>🗑</button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ── CarrosselViewer ───────────────────────────────────────────────────────
export function CarrosselViewer({ onClick }) {
  const [imagens, setImagens] = useState([]);
  const [idx, setIdx]         = useState(0);
  const [fade, setFade]       = useState(true);
  const [prevIdx, setPrevIdx] = useState(null);
  const timerRef              = useRef();

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(query(CARR_COL(), orderBy("ordem","asc")));
        const lista = [];
        snap.forEach(d => lista.push({ id: d.id, ...d.data() }));
        setImagens(prev => {
          if(JSON.stringify(prev.map(i=>i.id)) !== JSON.stringify(lista.map(i=>i.id))) setIdx(0);
          return lista;
        });
      } catch {}
    };
    load();
    const poll = setInterval(load, 30000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    if (imagens.length < 2) return;
    timerRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => { setPrevIdx(i); return (i + 1) % imagens.length; });
        setFade(true);
      }, 500);
    }, 9000);
    return () => clearInterval(timerRef.current);
  }, [imagens.length]);

  const navTo = (i) => {
    setFade(false);
    setTimeout(() => { setPrevIdx(idx); setIdx(i); setFade(true); }, 400);
    clearInterval(timerRef.current);
  };

  if (imagens.length === 0) {
    return (
      <div style={{
        width:"100%", height:"100%", minHeight:160,
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        gap:10, background:"rgba(255,255,255,0.02)",
        border:`1px dashed rgba(0,230,118,0.15)`, borderRadius:10, color:"#41597A",
      }}>
        <div style={{fontFamily:"monospace",fontSize:10,letterSpacing:"0.12em"}}>SEM IMAGENS</div>
        <div style={{fontSize:9,opacity:0.5}}>Admin → Carrossel</div>
      </div>
    );
  }

  const img = imagens[idx];
  const isVertical = img.h && img.w && (img.h / img.w) > 1.15;

  return (
    <div onClick={onClick} style={{
      position:"relative", width:"100%", height:"100%", minHeight:160,
      borderRadius:12, overflow:"hidden", cursor:onClick?"pointer":"default",
      background:"#010810",
    }}>
      <style>{`
        @keyframes carr-in{from{opacity:0;transform:scale(1.03)}to{opacity:1;transform:scale(1)}}
        @keyframes carr-ken{0%{transform:scale(1)}100%{transform:scale(1.06)}}
        @keyframes carr-sheen{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        .carr-img-active{animation:carr-in 0.55s ease forwards}
        .carr-ken{animation:carr-ken 9s ease forwards}
        .carr-sheen{animation:carr-sheen 24s ease-in-out infinite}
      `}</style>

      {/* BACKDROP — sempre presente, imagem desfocada com efeito duplex */}
      <img src={img.base64} alt="" style={{
        position:"absolute", inset:"-6%",
        width:"112%", height:"112%",
        objectFit:"cover",
        filter:"blur(24px) brightness(0.5) saturate(1.6)",
        opacity: fade ? 1 : 0,
        transition:"opacity 0.5s ease",
        pointerEvents:"none",
        zIndex:0,
      }}/>

      {/* sheen tecnologico animado — adiciona cor/luz (so aparece nas laterais da vertical) */}
      <div className="carr-sheen" style={{
        position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
        background:"linear-gradient(120deg,rgba(0,230,118,0.10) 0%,rgba(80,144,255,0.13) 35%,rgba(0,200,255,0.07) 60%,rgba(0,230,118,0.10) 100%)",
        backgroundSize:"220% 220%",
        mixBlendMode:"screen",
        opacity:0.65,
      }}/>

      {/* IMAGEM PRINCIPAL com ken burns suave */}
      <div style={{
        position:"absolute", inset:0, zIndex:2,
        display:"flex", alignItems:"center", justifyContent:"center",
        opacity: fade ? 1 : 0, transition:"opacity 0.5s ease",
      }}>
        <img
          key={idx}
          src={img.base64}
          alt={img.nome}
          className={fade ? (isVertical ? "carr-img-active" : "carr-img-active carr-ken") : ""}
          style={{
            width: isVertical ? "auto" : "100%",
            height: isVertical ? "100%" : "auto",
            maxWidth:"100%", maxHeight:"100%",
            objectFit: isVertical ? "contain" : "cover",
            display:"block",
          }}
        />
      </div>

      {/* vinheta — moldura radial (sempre) + laterais suaves na vertical */}
      <div style={{
        position:"absolute", inset:0, zIndex:3, pointerEvents:"none",
        background: isVertical
          ? "radial-gradient(ellipse 92% 96% at 50% 50%,transparent 60%,rgba(1,8,16,0.55) 100%),linear-gradient(90deg,rgba(1,8,16,0.42) 0%,transparent 14%,transparent 86%,rgba(1,8,16,0.42) 100%)"
          : "radial-gradient(ellipse 94% 96% at 50% 50%,transparent 64%,rgba(1,8,16,0.45) 100%)",
      }}/>

      {/* gradiente inferior */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:64, zIndex:4, pointerEvents:"none",
        background:"linear-gradient(to top,rgba(1,8,16,0.95) 0%,rgba(1,8,16,0.4) 60%,transparent 100%)",
      }}/>

      {/* linha neon topo */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:1, zIndex:5, pointerEvents:"none",
        background:"linear-gradient(90deg,transparent 0%,rgba(0,230,118,0.4) 50%,transparent 100%)",
      }}/>

      {/* NAVEGAÇÃO — setas laterais */}
      {imagens.length > 1 && (<>
        {[{dir:-1,side:"left"},{dir:1,side:"right"}].map(({dir,side})=>(
          <button key={side}
            onClick={e=>{e.stopPropagation();navTo((idx+imagens.length+dir)%imagens.length);}}
            style={{
              position:"absolute", top:"50%", [side]:10, transform:"translateY(-50%)",
              zIndex:6, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(8px)",
              border:"1px solid rgba(255,255,255,0.1)", borderRadius:8,
              width:28, height:28, cursor:"pointer",
              color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:700,
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all .2s",
            }}
          >{dir===-1?"‹":"›"}</button>
        ))}
      </>)}

      {/* dots minimalistas */}
      {imagens.length > 1 && (
        <div style={{
          position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)",
          display:"flex", gap:6, zIndex:6,
        }}>
          {imagens.map((_,i) => (
            <div key={i}
              onClick={e=>{e.stopPropagation();navTo(i);}}
              style={{
                width:i===idx?20:4, height:4, borderRadius:2,
                background:i===idx?"rgba(0,230,118,0.9)":"rgba(255,255,255,0.25)",
                cursor:"pointer", transition:"all .35s cubic-bezier(.4,0,.2,1)",
                boxShadow:i===idx?"0 0 8px rgba(0,230,118,0.7)":"none",
              }}/>
          ))}
        </div>
      )}

      {/* contador minimalista */}
      <div style={{
        position:"absolute", top:10, right:10, zIndex:6,
        fontFamily:"monospace", fontSize:9, fontWeight:700,
        color:"rgba(255,255,255,0.45)", letterSpacing:"0.1em",
      }}>
        {String(idx+1).padStart(2,"0")}/{String(imagens.length).padStart(2,"0")}
      </div>
    </div>
  );
}
