// ─── carrossel.jsx — Gestão e exibição de imagens · Secagem H2 ────────────
// PainelCarrossel: upload, preview, remover, reordenar (só dev, via admin.jsx)
// CarrosselViewer: slideshow pro Dashboard
import { useState, useEffect, useRef, useCallback } from "react";
import { COL, doc, onSnapshot, setDoc } from "./firebase";

const C = {
  bg:"#04111D", surface:"#071828", card:"#0A1929", cardHover:"#0E2847",
  accent:"#00E676", accentDark:"#006B2E",
  blue:"#0E2847", blueLight:"#1A5CCC",
  danger:"#c0272d", dangerLight:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880",
  border:"rgba(60,255,140,0.15)", tagBg:"rgba(255,255,255,0.04)",
  warningLight:"#FFC107",
};

const COL_KEY = "carrossel_h2";
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

// ── Salvar lista no Firestore ─────────────────────────────────────────────
async function salvarLista(lista) {
  await setDoc(doc(COL, COL_KEY), { val: lista, ts: Date.now() });
}

// ── PainelCarrossel ───────────────────────────────────────────────────────
export function PainelCarrossel() {
  const [imagens, setImagens]     = useState([]);
  const [preview, setPreview]     = useState(null); // { base64, kb, w, h, nome }
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando]   = useState(false);
  const [msg, setMsg]             = useState("");
  const [confirmarRem, setConfirmarRem] = useState(null);
  const inputRef = useRef();

  const flash = (t, ok=true) => { setMsg({ texto: t, ok }); setTimeout(() => setMsg(""), 3000); };

  useEffect(() => {
    const unsub = onSnapshot(doc(COL, COL_KEY), s => {
      setImagens(s.exists() && Array.isArray(s.data().val) ? s.data().val : []);
      setCarregando(false);
    });
    return () => unsub();
  }, []);

  // ── Selecionar arquivo ──
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

  // ── Confirmar upload ──
  const confirmarUpload = async () => {
    if (!preview) return;
    setSalvando(true);
    try {
      const nova = {
        id: Date.now().toString(),
        base64: preview.base64,
        nome: preview.nome,
        kb: preview.kb,
        w: preview.w,
        h: preview.h,
        adicionadaEm: new Date().toISOString(),
      };
      const novaLista = [...imagens, nova];
      await salvarLista(novaLista);
      setPreview(null);
      flash(`Imagem adicionada (${preview.kb} KB).`);
    } catch { flash("Erro ao salvar.", false); }
    setSalvando(false);
  };

  // ── Remover ──
  const remover = async (id) => {
    setSalvando(true);
    try {
      await salvarLista(imagens.filter(i => i.id !== id));
      setConfirmarRem(null);
      flash("Imagem removida.");
    } catch { flash("Erro ao remover.", false); }
    setSalvando(false);
  };

  // ── Mover (reordenar) ──
  const mover = async (idx, dir) => {
    const nova = [...imagens];
    const alvo = idx + dir;
    if (alvo < 0 || alvo >= nova.length) return;
    [nova[idx], nova[alvo]] = [nova[alvo], nova[idx]];
    setSalvando(true);
    try { await salvarLista(nova); } catch { flash("Erro ao reordenar.", false); }
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
          style={{ display: "none" }} capture="environment"/>
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
  const timerRef              = useRef();

  useEffect(() => {
    const unsub = onSnapshot(doc(COL, COL_KEY), s => {
      setImagens(s.exists() && Array.isArray(s.data().val) ? s.data().val : []);
      setIdx(0);
    });
    return () => unsub();
  }, []);

  // Auto-avanço a cada 8s
  useEffect(() => {
    if (imagens.length < 2) return;
    timerRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % imagens.length);
        setFade(true);
      }, 400);
    }, 8000);
    return () => clearInterval(timerRef.current);
  }, [imagens.length]);

  // Sem imagens — placeholder
  if (imagens.length === 0) {
    return (
      <div onClick={onClick} style={{
        width: "100%", height: "100%", minHeight: 160,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 10, cursor: onClick ? "pointer" : "default",
        background: "rgba(255,255,255,0.02)", border: `1px dashed ${C.border}`,
        borderRadius: 10, color: C.textDim,
      }}>
        <span style={{ fontSize: 32 }}>🖼️</span>
        <span style={{ fontSize: 11, letterSpacing: "0.06em" }}>Sem imagens no carrossel</span>
        <span style={{ fontSize: 10, color: C.textDim, opacity: 0.6 }}>Adicione via Painel Admin → Carrossel</span>
      </div>
    );
  }

  const img = imagens[idx];

  return (
    <div onClick={onClick} style={{
      position: "relative", width: "100%", height: "100%", minHeight: 160,
      borderRadius: 10, overflow: "hidden", cursor: onClick ? "pointer" : "default",
      background: "#000",
    }}>
      <style>{`
        @keyframes carr-fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Imagem */}
      <img src={img.base64} alt={img.nome}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          opacity: fade ? 1 : 0,
          transition: "opacity 0.4s ease",
          display: "block",
        }}/>

      {/* Overlay gradiente bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 48,
        background: "linear-gradient(to top, rgba(4,17,29,0.85), transparent)",
        pointerEvents: "none",
      }}/>

      {/* Dots indicadores */}
      {imagens.length > 1 && (
        <div style={{
          position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 5,
        }}>
          {imagens.map((_, i) => (
            <div key={i} onClick={(e) => { e.stopPropagation(); setFade(false); setTimeout(() => { setIdx(i); setFade(true); }, 300); }}
              style={{
                width: i === idx ? 16 : 5, height: 5, borderRadius: 3,
                background: i === idx ? C.accent : "rgba(255,255,255,0.3)",
                cursor: "pointer", transition: "all .3s",
                boxShadow: i === idx ? `0 0 6px ${C.accent}` : "none",
              }}/>
          ))}
        </div>
      )}

      {/* Contador */}
      <div style={{
        position: "absolute", top: 8, right: 8,
        background: "rgba(4,17,29,0.7)", borderRadius: 20,
        padding: "2px 8px", fontSize: 10, color: C.textMuted,
        fontFamily: "monospace", fontWeight: 700,
      }}>
        {idx + 1}/{imagens.length}
      </div>
    </div>
  );
}
