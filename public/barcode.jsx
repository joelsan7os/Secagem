// ─── barcode.jsx — Validação de Código de Barras · Secagem H2 ────────────────
// Checklist de enfardamento: valida 8 fardos (Lado A + Lado B) por unidade.
// Regra: A ≥ 2 E B ≥ 2 → APROVADO; senão → AVARIA DE IMPRESSÃO.
// Leitura via câmera (html5-qrcode). Grava histórico no Firebase.
import * as React from "react";
import { COL, doc, setDoc, getDoc } from "./firebase";

// ── Paleta (espelha app) ──────────────────────────────────────────────────────
const C = {
  bg:"#04111D", surface:"#071828", card:"#0A1929", cardHover:"#0E2847",
  accent:"#00E676", accentLight:"#00E676", accentDark:"#006B2E",
  blue:"#0E2847", blueLight:"#1A5CCC",
  warning:"#b87d00", warningLight:"#FFC107",
  danger:"#c0272d", dangerLight:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880", white:"#ffffff",
  border:"rgba(60,255,140,0.15)", tagBg:"rgba(255,255,255,0.04)", success:"#00E676",
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

// ── Decodificador do código de barras Suzano ─────────────────────────────────
// Formato: E0620Q525004
//  [0]     = letra ano (E=2026, F=2027...)
//  [1..2]  = mês (01–12)
//  [3..4]  = dia (01–31)
//  [5]     = máquina (P=Máq1, Q=Máq2, R=Máq3)
//  [6]     = linha (4=L4, 5=L5, 6=L6, 7=L7, 8=L8)
//  [7..8]  = lote (01–99)
//  [9..11] = unidade (001–999)
const ANO_MAP = { E: 2026, F: 2027, G: 2028, H: 2029 };
const MAQ_MAP = { P: "Máq 1", Q: "Máq 2", R: "Máq 3" };

function decodificar(raw) {
  if (!raw || raw.length < 12) return null;
  const r = raw.trim().toUpperCase();
  const ano  = ANO_MAP[r[0]] || r[0];
  const mes  = r.slice(1, 3);
  const dia  = r.slice(3, 5);
  const maq  = MAQ_MAP[r[5]] || r[5];
  const linha = "L" + r[6];
  const lote  = r.slice(7, 9).replace(/^0+/, "") || "0";
  const unid  = r.slice(9, 12);
  return { raw: r, ano, mes, dia, maq, linha, lote, unidade: unid };
}

// ── Helpers de data/hora/turno ────────────────────────────────────────────────
const hoje = () => new Date().toISOString().slice(0, 10);
const horaAtual = () => new Date().toTimeString().slice(0, 5);
const getAutoTurno = () => {
  const h = new Date().getHours();
  if (h >= 0 && h < 8) return "00x08";
  if (h >= 8 && h < 16) return "08x16";
  return "16x24";
};
const calcularLetra = () => {
  const S = ["E","D","A","B","C"];
  const BASE = new Date("2026-06-09T00:00:00");
  const a = new Date();
  const dias = Math.floor((a - BASE) / (1000 * 60 * 60 * 24));
  const bloco = Math.floor(dias / 2) % 5;
  const h = a.getHours();
  const t = h < 8 ? 0 : h < 16 ? 1 : 2;
  return S[((bloco - t) % 5 + 5) % 5];
};

// ── Estado inicial dos fardos ─────────────────────────────────────────────────
const initialFardos = () => ({
  A: [null, null, null, null], // null = não lido
  B: [null, null, null, null],
});

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal: BarcodeModal
// Props:
//   linha     — "L4"|"L5"|...|"L8"
//   onFechar  — callback ao fechar
// ─────────────────────────────────────────────────────────────────────────────
export function BarcodeModal({ linha, onFechar }) {
  const cfg = storageGet("op_config") || {};
  const operador = cfg.nomeOperador || "";

  // Estado dos fardos: { A:[cod|null x4], B:[cod|null x4] }
  const [fardos, setFardos] = React.useState(initialFardos);
  // Leitor ativo: null | { lado:"A"|"B", idx:0..3 }
  const [lendo, setLendo] = React.useState(null);
  // Código decodificado do 1º scan (preenche header automaticamente)
  const [meta, setMeta] = React.useState(null);
  // Mensagem de erro de scan
  const [erroScan, setErroScan] = React.useState("");
  // Estado de salvamento
  const [salvo, setSalvo] = React.useState(false);
  const [salvando, setSalvando] = React.useState(false);
  // Histórico carregado
  const [hist, setHist] = React.useState([]);
  const [abaAtiva, setAbaAtiva] = React.useState("validar"); // "validar" | "historico"

  // Ref para instância do scanner
  const scannerRef = React.useRef(null);
  const scannerDivId = "barcode-scanner-div";

  // Carregar histórico do Firebase ao abrir
  React.useEffect(() => {
    cloudGet("barcode_hist_h2").then(d => { if (d) setHist(d); });
  }, []);

  // ── Contagens e resultado ───────────────────────────────────────────────────
  const contA = fardos.A.filter(Boolean).length;
  const contB = fardos.B.filter(Boolean).length;
  const aprovado = contA >= 2 && contB >= 2;
  const temAlgum = contA > 0 || contB > 0;
  const podeSalvar = temAlgum && !salvo;

  // ── Iniciar câmera ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!lendo) {
      // Parar scanner se estiver rodando
      if (scannerRef.current) {
        try { scannerRef.current.stop().catch(() => {}); } catch {}
        scannerRef.current = null;
      }
      return;
    }

    setErroScan("");

    // Carrega html5-qrcode dinamicamente (não é dependência do projeto)
    const scriptId = "html5qrcode-script";
    const iniciar = () => {
      if (!window.Html5Qrcode) {
        setErroScan("Biblioteca de câmera não carregou. Tente novamente.");
        setLendo(null);
        return;
      }
      try {
        const scanner = new window.Html5Qrcode(scannerDivId);
        scannerRef.current = scanner;
        scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 100 } },
          (decodedText) => {
            // Sucesso — para câmera e processa
            scanner.stop().catch(() => {});
            scannerRef.current = null;
            handleScanSuccess(decodedText, lendo.lado, lendo.idx);
          },
          () => {} // erros de frame: ignorar
        ).catch(err => {
          setErroScan("Câmera bloqueada ou indisponível. Verifique as permissões.");
          setLendo(null);
        });
      } catch {
        setErroScan("Erro ao iniciar câmera.");
        setLendo(null);
      }
    };

    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js";
      s.onload = iniciar;
      s.onerror = () => { setErroScan("Falha ao carregar leitor de câmera."); setLendo(null); };
      document.head.appendChild(s);
    } else {
      iniciar();
    }

    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop().catch(() => {}); } catch {}
        scannerRef.current = null;
      }
    };
  }, [lendo]);

  // ── Processar scan bem-sucedido ─────────────────────────────────────────────
  function handleScanSuccess(raw, lado, idx) {
    const dec = decodificar(raw);
    if (!dec) {
      setErroScan(`Código inválido: ${raw}`);
      setLendo(null);
      return;
    }
    // Preenche meta do primeiro scan
    if (!meta) setMeta(dec);
    // Grava fardo
    setFardos(prev => {
      const novo = { A: [...prev.A], B: [...prev.B] };
      novo[lado][idx] = dec.raw;
      return novo;
    });
    setSalvo(false);
    setLendo(null);
  }

  // ── Remover fardo (re-ler) ──────────────────────────────────────────────────
  function removerFardo(lado, idx) {
    setFardos(prev => {
      const novo = { A: [...prev.A], B: [...prev.B] };
      novo[lado][idx] = null;
      return novo;
    });
    setSalvo(false);
  }

  // ── Salvar no Firebase ──────────────────────────────────────────────────────
  async function handleSalvar() {
    setSalvando(true);
    const registro = {
      id: Date.now(),
      data: hoje(),
      hora: horaAtual(),
      turno: getAutoTurno(),
      letra: calcularLetra(),
      operador,
      linha,
      lote: meta?.lote || "",
      unidade: meta?.unidade || "",
      maquina: meta?.maq || "",
      fardos: {
        A: fardos.A,
        B: fardos.B,
        contA,
        contB,
      },
      resultado: aprovado ? "APROVADO" : "AVARIA DE IMPRESSÃO",
    };
    const novoHist = [registro, ...hist].slice(0, 200);
    storageSet("barcode_hist_h2", novoHist);
    setHist(novoHist);
    setSalvo(true);
    setSalvando(false);
  }

  // ── Reset para nova validação ───────────────────────────────────────────────
  function handleNova() {
    setFardos(initialFardos());
    setMeta(null);
    setSalvo(false);
    setErroScan("");
  }

  // ── Render fardo individual ─────────────────────────────────────────────────
  function FardoBtn({ lado, idx }) {
    const cod = fardos[lado][idx];
    const ativo = lendo?.lado === lado && lendo?.idx === idx;
    const lido = Boolean(cod);
    const cor = lido ? C.accentLight : C.dangerLight;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{
          width: 58, height: 72, borderRadius: 8,
          background: lido ? "rgba(0,230,118,0.12)" : "rgba(255,82,82,0.10)",
          border: `2px solid ${ativo ? C.warningLight : cor}`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: "pointer", position: "relative",
          boxShadow: ativo ? `0 0 12px ${C.warningLight}88` : lido ? `0 0 8px ${C.accentLight}44` : "none",
          transition: "all .2s",
        }}
          onClick={() => lido ? removerFardo(lado, idx) : setLendo({ lado, idx })}
        >
          <span style={{ fontSize: 20 }}>{lido ? "✅" : ativo ? "📷" : "▢"}</span>
          <span style={{ fontSize: 8, color: C.textDim, marginTop: 2, fontFamily: "monospace" }}>F{idx + 1}</span>
          {lido && (
            <div style={{
              position: "absolute", top: -6, right: -6, width: 16, height: 16,
              borderRadius: "50%", background: C.danger, border: "none",
              color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>×</div>
          )}
        </div>
        {lido && (
          <span style={{ fontSize: 7, color: C.textDim, fontFamily: "monospace", maxWidth: 58, wordBreak: "break-all", textAlign: "center" }}>
            {cod.slice(-6)}
          </span>
        )}
      </div>
    );
  }

  // ── Histórico filtrado por linha ────────────────────────────────────────────
  const histLinha = hist.filter(h => h.linha === linha).slice(0, 20);

  // ── RENDER PRINCIPAL ────────────────────────────────────────────────────────
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(4,17,29,0.97)",
      display: "flex", flexDirection: "column",
      fontFamily: "system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px",
        borderBottom: `1px solid ${C.border}`,
        background: C.surface,
      }}>
        <div>
          <div style={{ color: C.accentLight, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            📦 Validação de Fardos
          </div>
          <div style={{ color: C.textMuted, fontSize: 13, fontWeight: 600, marginTop: 2 }}>
            Linha {linha} {meta ? `· Lote ${meta.lote} · Un. ${meta.unidade}` : ""}
          </div>
        </div>
        <button onClick={onFechar} style={{
          background: "rgba(255,82,82,0.15)", border: `1px solid ${C.dangerLight}44`,
          borderRadius: 8, color: C.dangerLight, fontSize: 18, width: 36, height: 36,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>
      </div>

      {/* Abas */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        {[["validar", "📷 Validar"], ["historico", "📋 Histórico"]].map(([id, label]) => (
          <button key={id} onClick={() => setAbaAtiva(id)} style={{
            flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
            background: "transparent", fontWeight: abaAtiva === id ? 800 : 400,
            color: abaAtiva === id ? C.accentLight : C.textMuted, fontSize: 12,
            borderBottom: abaAtiva === id ? `2px solid ${C.accentLight}` : "2px solid transparent",
            transition: "all .15s",
          }}>{label}</button>
        ))}
      </div>

      {/* Conteúdo com scroll */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>

        {/* ── ABA VALIDAR ── */}
        {abaAtiva === "validar" && (
          <div>
            {/* Resultado */}
            {temAlgum && (
              <div style={{
                borderRadius: 10, padding: "10px 14px", marginBottom: 14,
                background: aprovado ? "rgba(0,230,118,0.10)" : "rgba(255,82,82,0.12)",
                border: `2px solid ${aprovado ? C.accentLight : C.dangerLight}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ color: aprovado ? C.accentLight : C.dangerLight, fontWeight: 800, fontSize: 13 }}>
                    {aprovado ? "✅ APROVADO" : "⚠️ AVARIA DE IMPRESSÃO"}
                  </div>
                  <div style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>
                    Lado A: {contA}/4 · Lado B: {contB}/4 · mín. 2 cada lado
                  </div>
                </div>
                <div style={{ fontSize: 28 }}>{aprovado ? "✅" : "🚨"}</div>
              </div>
            )}

            {/* Scanner ativo */}
            {lendo && (
              <div style={{
                borderRadius: 10, overflow: "hidden", marginBottom: 14,
                border: `2px solid ${C.warningLight}`,
                background: "#000",
              }}>
                <div style={{ padding: "8px 12px", background: "rgba(255,193,7,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: C.warningLight, fontSize: 11, fontWeight: 700 }}>
                    📷 Lendo Lado {lendo.lado} · Fardo {lendo.idx + 1}
                  </span>
                  <button onClick={() => { setLendo(null); setErroScan(""); }} style={{
                    background: "transparent", border: "none", color: C.dangerLight, fontSize: 16, cursor: "pointer",
                  }}>✕</button>
                </div>
                <div id={scannerDivId} style={{ width: "100%", minHeight: 200 }} />
              </div>
            )}

            {erroScan && (
              <div style={{ background: "rgba(255,82,82,0.1)", border: `1px solid ${C.dangerLight}44`, borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
                <span style={{ color: C.dangerLight, fontSize: 11 }}>⚠ {erroScan}</span>
              </div>
            )}

            {/* Lados A e B */}
            {["A", "B"].map(lado => (
              <div key={lado} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderTop: `2px solid ${(lado === "A" ? contA : contB) >= 2 ? C.accentLight : C.dangerLight}`,
                borderRadius: 10, padding: "12px 14px", marginBottom: 12,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ color: C.text, fontWeight: 800, fontSize: 13 }}>
                    Lado {lado}
                  </span>
                  <span style={{
                    color: (lado === "A" ? contA : contB) >= 2 ? C.accentLight : C.dangerLight,
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {lado === "A" ? contA : contB}/4 lidos
                    {(lado === "A" ? contA : contB) >= 2 ? " ✓" : " (mín. 2)"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "space-around" }}>
                  {[0, 1, 2, 3].map(idx => (
                    <FardoBtn key={idx} lado={lado} idx={idx} />
                  ))}
                </div>
                <div style={{ marginTop: 8, color: C.textDim, fontSize: 9, textAlign: "center" }}>
                  Toque no fardo para ler · Toque no ✕ para remover
                </div>
              </div>
            ))}

            {/* Meta info do código */}
            {meta && (
              <div style={{
                background: C.tagBg, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "10px 12px", marginBottom: 14,
              }}>
                <div style={{ color: C.textMuted, fontSize: 9, textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.1em" }}>
                  Código detectado
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                  {[
                    ["Código", meta.raw],
                    ["Ano", meta.ano],
                    ["Data", `${meta.dia}/${meta.mes}`],
                    ["Máquina", meta.maq],
                    ["Linha", meta.linha],
                    ["Lote", meta.lote],
                    ["Unidade", meta.unidade],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ color: C.textDim, fontSize: 8, textTransform: "uppercase" }}>{l}</span>
                      <span style={{ color: C.text, fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botões */}
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button onClick={handleNova} style={{
                flex: 1, padding: 11, borderRadius: 9, cursor: "pointer",
                background: C.tagBg, border: `1px solid ${C.border}`,
                color: C.textMuted, fontSize: 12, fontWeight: 700,
              }}>🔄 Nova Validação</button>
              <button
                onClick={handleSalvar}
                disabled={!podeSalvar || salvando}
                style={{
                  flex: 2, padding: 11, borderRadius: 9, cursor: podeSalvar && !salvando ? "pointer" : "not-allowed",
                  border: "none", fontSize: 13, fontWeight: 700, color: "#fff", transition: "background .3s",
                  background: salvo
                    ? C.accentDark
                    : !temAlgum
                      ? C.textDim
                      : aprovado ? C.accent : C.danger,
                }}>
                {salvando ? "Salvando..." : salvo ? "✓ Salvo!" : aprovado ? "✓ Salvar — Aprovado" : "⚠ Salvar — Avaria"}
              </button>
            </div>
            {operador && (
              <div style={{ color: C.textDim, fontSize: 9, textAlign: "center" }}>
                Operador: {operador} · {getAutoTurno()} · Letra {calcularLetra()}
              </div>
            )}
          </div>
        )}

        {/* ── ABA HISTÓRICO ── */}
        {abaAtiva === "historico" && (
          <div>
            <div style={{ color: C.textMuted, fontSize: 10, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Últimas validações — {linha}
            </div>
            {histLinha.length === 0 ? (
              <div style={{ color: C.textDim, fontSize: 12, textAlign: "center", padding: 32 }}>
                Nenhum registro para {linha} ainda.
              </div>
            ) : (
              histLinha.map(r => (
                <div key={r.id} style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderLeft: `3px solid ${r.resultado === "APROVADO" ? C.accentLight : C.dangerLight}`,
                  borderRadius: 9, padding: "10px 12px", marginBottom: 8,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span style={{
                        color: r.resultado === "APROVADO" ? C.accentLight : C.dangerLight,
                        fontSize: 11, fontWeight: 800,
                      }}>
                        {r.resultado === "APROVADO" ? "✅" : "⚠️"} {r.resultado}
                      </span>
                      {r.lote && (
                        <span style={{ color: C.textDim, fontSize: 9, marginLeft: 8, fontFamily: "monospace" }}>
                          Lote {r.lote} · Un. {r.unidade}
                        </span>
                      )}
                    </div>
                    <span style={{ color: C.textDim, fontSize: 9, fontFamily: "monospace" }}>
                      {r.data?.split("-").reverse().join("/")} {r.hora}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 5 }}>
                    <span style={{ color: C.textMuted, fontSize: 10 }}>A: {r.fardos?.contA ?? "—"}/4</span>
                    <span style={{ color: C.textMuted, fontSize: 10 }}>B: {r.fardos?.contB ?? "—"}/4</span>
                    {r.operador && <span style={{ color: C.textDim, fontSize: 9 }}>👤 {r.operador}</span>}
                    <span style={{ color: C.textDim, fontSize: 9 }}>🔤 {r.letra}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
