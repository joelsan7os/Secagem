// ─── auth.jsx — Cadastro, Login e Perfis de Acesso · Secagem H2 ──────────────
import { useState, useEffect, useRef } from "react";
import { db, COL, doc, setDoc, getDoc, onSnapshot } from "./firebase";
import { collection } from "firebase/firestore";

const UCOL = collection(db, "usuarios_h2");

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  bg:"#EEF2F6", surface:"#FFFFFF", card:"#FFFFFF", cardHover:"#F2F6FA",
  accent:"#00C766", accentLight:"#00975A", accentDark:"#006B2E",
  blue:"#1A5CCC", blueLight:"#1A5CCC",
  warning:"#B87D00", warningLight:"#B87D00",
  danger:"#C0272D", dangerLight:"#C0272D",
  text:"#0B1F30", textMuted:"#54687A", textDim:"#93A6B6", white:"#0B1F30",
  border:"rgba(11,31,48,0.12)", tagBg:"#EBF0F5",
};

const inputStyle = {
  width:"100%", background:C.surface, border:`1px solid ${C.border}`,
  borderRadius:8, padding:"11px 13px", color:C.white, fontSize:14, outline:"none",
};

// ─── Funções e áreas ──────────────────────────────────────────────────────────
export const FUNCOES = {
  operador_area:    { label:"Operador de Área",   veHistorico:false },
  operador_painel:  { label:"Operador de Painel", veHistorico:true  },
  supervisor:       { label:"Supervisor",         veHistorico:true  },
  dev:              { label:"Desenvolvedor",      veHistorico:true  },
};

const AREAS = [
  { id:"pu",           label:"Parte Úmida" },
  { id:"cortadeira",   label:"Cortadeira" },
  { id:"enfardamento", label:"Enfardamento" },
  { id:"painel",       label:"Painel" },
];

// ─── Hash do PIN ──────────────────────────────────────────────────────────────
async function hashPin(pin) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

export async function validarPin(matricula, pin) {
  try {
    const snap = await getDoc(doc(UCOL, String(matricula)));
    if(!snap.exists()) return false;
    const h = await hashPin(pin);
    return h === snap.data().pinHash;
  } catch { return false; }
}

export function usePerfilAtivo() {
  const [perfil, setPerfil] = useState(()=>{
    try { return JSON.parse(localStorage.getItem("perfil_ativo_h2")); } catch { return null; }
  });
  const logout = ()=>{ localStorage.removeItem("perfil_ativo_h2"); setPerfil(null); };
  return { perfil, setPerfil, logout };
}

// ─── Logo SVG Vértice ─────────────────────────────────────────────────────────
function LogoVertice({ animated }) {
  return (
    <svg viewBox="0 0 240 230" style={{width:"min(220px,58vw)",height:"auto",overflow:"visible"}} aria-label="Vértice">
      <defs>
        <linearGradient id="gA" gradientUnits="userSpaceOnUse" x1="120" y1="24" x2="28" y2="188"><stop offset="0" stopColor="#00E676"/><stop offset="1" stopColor="#00F0FF"/></linearGradient>
        <linearGradient id="gB" gradientUnits="userSpaceOnUse" x1="28" y1="188" x2="212" y2="188"><stop offset="0" stopColor="#00F0FF"/><stop offset="1" stopColor="#5090FF"/></linearGradient>
        <linearGradient id="gC" gradientUnits="userSpaceOnUse" x1="212" y1="188" x2="120" y2="24"><stop offset="0" stopColor="#5090FF"/><stop offset="1" stopColor="#00E676"/></linearGradient>
        <linearGradient id="fTop" gradientUnits="userSpaceOnUse" x1="120" y1="24" x2="120" y2="133"><stop offset="0" stopColor="#00E676" stopOpacity=".34"/><stop offset="1" stopColor="#00E676" stopOpacity=".04"/></linearGradient>
        <linearGradient id="fLeft" gradientUnits="userSpaceOnUse" x1="28" y1="188" x2="120" y2="110"><stop offset="0" stopColor="#00F0FF" stopOpacity=".30"/><stop offset="1" stopColor="#00F0FF" stopOpacity=".03"/></linearGradient>
        <linearGradient id="fRight" gradientUnits="userSpaceOnUse" x1="212" y1="188" x2="120" y2="110"><stop offset="0" stopColor="#5090FF" stopOpacity=".32"/><stop offset="1" stopColor="#5090FF" stopOpacity=".03"/></linearGradient>
        <radialGradient id="rGlow" cx="120" cy="133" r="70" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#00F0FF" stopOpacity=".22"/><stop offset="100%" stopColor="#5090FF" stopOpacity="0"/></radialGradient>
        <radialGradient id="sweepG"><stop offset="0%" stopColor="#00F0FF" stopOpacity=".16"/><stop offset="100%" stopColor="#00F0FF" stopOpacity="0"/></radialGradient>
        <path id="vxP1" d="M120,24 L120,133"/><path id="vxP2" d="M28,188 L120,133"/><path id="vxP3" d="M212,188 L120,133"/>
      </defs>

      <style>{`
        .vx-edge,.vx-inl{fill:none;stroke-linecap:round;pathLength:1;stroke-dasharray:1;stroke-dashoffset:1}
        .vx-edge{stroke-width:3.4}
        .vx-inl{stroke-width:1.4;opacity:.75}
        .vx-fill,.vx-ring,.vx-bevel{opacity:0}
        .vx-dot{opacity:0;transform-box:fill-box;transform-origin:center}
        .vx-core{opacity:0;transform-box:fill-box;transform-origin:center;filter:drop-shadow(0 0 6px #fff) drop-shadow(0 0 14px #00E676)}
        @keyframes vxDraw{to{stroke-dashoffset:0}}
        @keyframes vxPop{0%{opacity:0;transform:scale(.2)}60%{opacity:1;transform:scale(1.45)}100%{opacity:1;transform:scale(1)}}
        @keyframes vxFadeIn{to{opacity:1}}
        @keyframes vxCorePulse{0%,100%{opacity:.65;transform:scale(1)}50%{opacity:1;transform:scale(1.55)}}
        .vx-go .vx-fill{animation:vxFadeIn .8s ease .15s forwards}
        .vx-go .vx-e1{animation:vxDraw .55s ease .15s forwards}
        .vx-go .vx-e2{animation:vxDraw .55s ease .35s forwards}
        .vx-go .vx-e3{animation:vxDraw .55s ease .55s forwards}
        .vx-go .vx-bevel{animation:vxFadeIn .6s ease .8s forwards}
        .vx-go .vx-n1{animation:vxDraw .5s ease .95s forwards}
        .vx-go .vx-n2{animation:vxDraw .5s ease 1.1s forwards}
        .vx-go .vx-n3{animation:vxDraw .5s ease 1.25s forwards}
        .vx-go .vx-ring{animation:vxFadeIn .5s ease 1.0s forwards}
        .vx-go .vx-va{animation:vxPop .5s ease 1.0s forwards}
        .vx-go .vx-vp{animation:vxPop .5s ease 1.2s forwards}
        .vx-go .vx-vg{animation:vxPop .5s ease 1.4s forwards}
        .vx-go .vx-core{animation:vxFadeIn .3s ease 1.55s forwards,vxCorePulse 2.4s ease 1.85s infinite}
      `}</style>

      <g className={animated ? "vx-go" : ""}>
        {/* sweep de radar */}
        <g>
          <path d="M120,133 L120,29 A104,104 0 0 1 196,65 Z" fill="url(#sweepG)" opacity=".5"/>
          <animateTransform attributeName="transform" type="rotate" from="0 120 133" to="360 120 133" dur="10s" repeatCount="indefinite"/>
        </g>

        <circle cx="120" cy="133" r="70" fill="url(#rGlow)" className="vx-fill"/>

        {/* faces facetadas */}
        <polygon points="120,24 28,188 120,133" fill="url(#fLeft)" className="vx-fill"/>
        <polygon points="120,24 212,188 120,133" fill="url(#fTop)" className="vx-fill"/>
        <polygon points="28,188 212,188 120,133" fill="url(#fRight)" className="vx-fill"/>

        {/* sinais captados: ponto espalhado -> vértice mais próximo */}
        <g>
          <circle r="2.3" fill="#00E676" opacity="0" style={{filter:"drop-shadow(0 0 4px #00E676)"}}>
            <animateMotion dur="9s" begin="2.0s" repeatCount="indefinite" calcMode="spline" path="M120,-16 L120,24" keyPoints="0;0;1;1" keyTimes="0;0.6;0.85;1" keySplines="0 0 1 1;0.4 0 0.6 1;0 0 1 1"/>
            <animate attributeName="opacity" dur="9s" begin="2.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.80;0.85;1" values="0;0;0.9;0.9;0;0"/>
          </circle>
          <circle cx="120" cy="-16" r="1" fill="none" stroke="#00E676" strokeWidth="1" opacity="0">
            <animate attributeName="r" dur="9s" begin="2.0s" repeatCount="indefinite" keyTimes="0;0.57;0.66;1" values="1;1;8;8"/>
            <animate attributeName="opacity" dur="9s" begin="2.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.70;1" values="0;0;0.7;0;0"/>
          </circle>
        </g>
        <g>
          <circle r="2.3" fill="#00E676" opacity="0" style={{filter:"drop-shadow(0 0 4px #00E676)"}}>
            <animateMotion dur="9s" begin="3.0s" repeatCount="indefinite" calcMode="spline" path="M54,46 L120,24" keyPoints="0;0;1;1" keyTimes="0;0.6;0.85;1" keySplines="0 0 1 1;0.4 0 0.6 1;0 0 1 1"/>
            <animate attributeName="opacity" dur="9s" begin="3.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.80;0.85;1" values="0;0;0.9;0.9;0;0"/>
          </circle>
          <circle cx="54" cy="46" r="1" fill="none" stroke="#00E676" strokeWidth="1" opacity="0">
            <animate attributeName="r" dur="9s" begin="3.0s" repeatCount="indefinite" keyTimes="0;0.57;0.66;1" values="1;1;8;8"/>
            <animate attributeName="opacity" dur="9s" begin="3.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.70;1" values="0;0;0.7;0;0"/>
          </circle>
        </g>
        <g>
          <circle r="2.3" fill="#00E676" opacity="0" style={{filter:"drop-shadow(0 0 4px #00E676)"}}>
            <animateMotion dur="9s" begin="4.0s" repeatCount="indefinite" calcMode="spline" path="M188,52 L120,24" keyPoints="0;0;1;1" keyTimes="0;0.6;0.85;1" keySplines="0 0 1 1;0.4 0 0.6 1;0 0 1 1"/>
            <animate attributeName="opacity" dur="9s" begin="4.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.80;0.85;1" values="0;0;0.9;0.9;0;0"/>
          </circle>
          <circle cx="188" cy="52" r="1" fill="none" stroke="#00E676" strokeWidth="1" opacity="0">
            <animate attributeName="r" dur="9s" begin="4.0s" repeatCount="indefinite" keyTimes="0;0.57;0.66;1" values="1;1;8;8"/>
            <animate attributeName="opacity" dur="9s" begin="4.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.70;1" values="0;0;0.7;0;0"/>
          </circle>
        </g>
        <g>
          <circle r="2.3" fill="#00F0FF" opacity="0" style={{filter:"drop-shadow(0 0 4px #00F0FF)"}}>
            <animateMotion dur="9s" begin="5.0s" repeatCount="indefinite" calcMode="spline" path="M-14,150 L28,188" keyPoints="0;0;1;1" keyTimes="0;0.6;0.85;1" keySplines="0 0 1 1;0.4 0 0.6 1;0 0 1 1"/>
            <animate attributeName="opacity" dur="9s" begin="5.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.80;0.85;1" values="0;0;0.9;0.9;0;0"/>
          </circle>
          <circle cx="-14" cy="150" r="1" fill="none" stroke="#00F0FF" strokeWidth="1" opacity="0">
            <animate attributeName="r" dur="9s" begin="5.0s" repeatCount="indefinite" keyTimes="0;0.57;0.66;1" values="1;1;8;8"/>
            <animate attributeName="opacity" dur="9s" begin="5.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.70;1" values="0;0;0.7;0;0"/>
          </circle>
        </g>
        <g>
          <circle r="2.3" fill="#00F0FF" opacity="0" style={{filter:"drop-shadow(0 0 4px #00F0FF)"}}>
            <animateMotion dur="9s" begin="6.0s" repeatCount="indefinite" calcMode="spline" path="M44,228 L28,188" keyPoints="0;0;1;1" keyTimes="0;0.6;0.85;1" keySplines="0 0 1 1;0.4 0 0.6 1;0 0 1 1"/>
            <animate attributeName="opacity" dur="9s" begin="6.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.80;0.85;1" values="0;0;0.9;0.9;0;0"/>
          </circle>
          <circle cx="44" cy="228" r="1" fill="none" stroke="#00F0FF" strokeWidth="1" opacity="0">
            <animate attributeName="r" dur="9s" begin="6.0s" repeatCount="indefinite" keyTimes="0;0.57;0.66;1" values="1;1;8;8"/>
            <animate attributeName="opacity" dur="9s" begin="6.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.70;1" values="0;0;0.7;0;0"/>
          </circle>
        </g>
        <g>
          <circle r="2.3" fill="#00F0FF" opacity="0" style={{filter:"drop-shadow(0 0 4px #00F0FF)"}}>
            <animateMotion dur="9s" begin="7.0s" repeatCount="indefinite" calcMode="spline" path="M8,108 L28,188" keyPoints="0;0;1;1" keyTimes="0;0.6;0.85;1" keySplines="0 0 1 1;0.4 0 0.6 1;0 0 1 1"/>
            <animate attributeName="opacity" dur="9s" begin="7.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.80;0.85;1" values="0;0;0.9;0.9;0;0"/>
          </circle>
          <circle cx="8" cy="108" r="1" fill="none" stroke="#00F0FF" strokeWidth="1" opacity="0">
            <animate attributeName="r" dur="9s" begin="7.0s" repeatCount="indefinite" keyTimes="0;0.57;0.66;1" values="1;1;8;8"/>
            <animate attributeName="opacity" dur="9s" begin="7.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.70;1" values="0;0;0.7;0;0"/>
          </circle>
        </g>
        <g>
          <circle r="2.3" fill="#5090FF" opacity="0" style={{filter:"drop-shadow(0 0 4px #5090FF)"}}>
            <animateMotion dur="9s" begin="8.0s" repeatCount="indefinite" calcMode="spline" path="M254,150 L212,188" keyPoints="0;0;1;1" keyTimes="0;0.6;0.85;1" keySplines="0 0 1 1;0.4 0 0.6 1;0 0 1 1"/>
            <animate attributeName="opacity" dur="9s" begin="8.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.80;0.85;1" values="0;0;0.9;0.9;0;0"/>
          </circle>
          <circle cx="254" cy="150" r="1" fill="none" stroke="#5090FF" strokeWidth="1" opacity="0">
            <animate attributeName="r" dur="9s" begin="8.0s" repeatCount="indefinite" keyTimes="0;0.57;0.66;1" values="1;1;8;8"/>
            <animate attributeName="opacity" dur="9s" begin="8.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.70;1" values="0;0;0.7;0;0"/>
          </circle>
        </g>
        <g>
          <circle r="2.3" fill="#5090FF" opacity="0" style={{filter:"drop-shadow(0 0 4px #5090FF)"}}>
            <animateMotion dur="9s" begin="9.0s" repeatCount="indefinite" calcMode="spline" path="M192,230 L212,188" keyPoints="0;0;1;1" keyTimes="0;0.6;0.85;1" keySplines="0 0 1 1;0.4 0 0.6 1;0 0 1 1"/>
            <animate attributeName="opacity" dur="9s" begin="9.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.80;0.85;1" values="0;0;0.9;0.9;0;0"/>
          </circle>
          <circle cx="192" cy="230" r="1" fill="none" stroke="#5090FF" strokeWidth="1" opacity="0">
            <animate attributeName="r" dur="9s" begin="9.0s" repeatCount="indefinite" keyTimes="0;0.57;0.66;1" values="1;1;8;8"/>
            <animate attributeName="opacity" dur="9s" begin="9.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.70;1" values="0;0;0.7;0;0"/>
          </circle>
        </g>
        <g>
          <circle r="2.3" fill="#5090FF" opacity="0" style={{filter:"drop-shadow(0 0 4px #5090FF)"}}>
            <animateMotion dur="9s" begin="10.0s" repeatCount="indefinite" calcMode="spline" path="M236,106 L212,188" keyPoints="0;0;1;1" keyTimes="0;0.6;0.85;1" keySplines="0 0 1 1;0.4 0 0.6 1;0 0 1 1"/>
            <animate attributeName="opacity" dur="9s" begin="10.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.80;0.85;1" values="0;0;0.9;0.9;0;0"/>
          </circle>
          <circle cx="236" cy="106" r="1" fill="none" stroke="#5090FF" strokeWidth="1" opacity="0">
            <animate attributeName="r" dur="9s" begin="10.0s" repeatCount="indefinite" keyTimes="0;0.57;0.66;1" values="1;1;8;8"/>
            <animate attributeName="opacity" dur="9s" begin="10.0s" repeatCount="indefinite" keyTimes="0;0.57;0.62;0.70;1" values="0;0;0.7;0;0"/>
          </circle>
        </g>

        {/* pulsos viajantes vértice -> centro */}
        <circle r="4.5" fill="#00E676" style={{filter:"drop-shadow(0 0 5px #00E676)"}}>
          <animateMotion dur="3s" begin="2s" repeatCount="indefinite"><mpath href="#vxP1"/></animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.85;1" dur="3s" begin="2s" repeatCount="indefinite"/>
        </circle>
        <circle r="4.5" fill="#00F0FF" style={{filter:"drop-shadow(0 0 5px #00F0FF)"}}>
          <animateMotion dur="3s" begin="3s" repeatCount="indefinite"><mpath href="#vxP2"/></animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.85;1" dur="3s" begin="3s" repeatCount="indefinite"/>
        </circle>
        <circle r="4.5" fill="#5090FF" style={{filter:"drop-shadow(0 0 5px #5090FF)"}}>
          <animateMotion dur="3s" begin="4s" repeatCount="indefinite"><mpath href="#vxP3"/></animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.85;1" dur="3s" begin="4s" repeatCount="indefinite"/>
        </circle>

        {/* arestas */}
        <line className="vx-edge vx-e1" x1="120" y1="24" x2="28" y2="188" stroke="url(#gA)"/>
        <line className="vx-edge vx-e2" x1="28" y1="188" x2="212" y2="188" stroke="url(#gB)"/>
        <line className="vx-edge vx-e3" x1="212" y1="188" x2="120" y2="24" stroke="url(#gC)"/>

        {/* aresta biselada interna */}
        <polygon className="vx-bevel" points="120,33 39,182 201,182" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="1"/>

        {/* nervuras internas */}
        <line className="vx-inl vx-n1" x1="120" y1="24"  x2="120" y2="133" stroke="#00E676"/>
        <line className="vx-inl vx-n2" x1="28"  y1="188" x2="120" y2="133" stroke="#00F0FF"/>
        <line className="vx-inl vx-n3" x1="212" y1="188" x2="120" y2="133" stroke="#5090FF"/>

        {/* núcleo reator + ripple de radar */}
        <circle cx="120" cy="133" fill="none" stroke="#fff" strokeWidth="1.2">
          <animate attributeName="r" values="5;26" keyTimes="0;1" dur="3s" begin="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".5;0" keyTimes="0;1" dur="3s" begin="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="120" cy="133" fill="none" stroke="#00F0FF" strokeWidth="1">
          <animate attributeName="r" values="5;34" keyTimes="0;1" dur="3s" begin="3.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".32;0" keyTimes="0;1" dur="3s" begin="3.5s" repeatCount="indefinite"/>
        </circle>
        <circle className="vx-ring" cx="120" cy="133" r="8" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1"/>
        <circle className="vx-core" cx="120" cy="133" r="4.5" fill="#fff"/>

        {/* vértices como nós (anel + ponto) */}
        <circle className="vx-ring" cx="120" cy="24"  r="9" fill="none" stroke="#00E676" strokeWidth="1.4" opacity=".55"/>
        <circle className="vx-ring" cx="28"  cy="188" r="9" fill="none" stroke="#00F0FF" strokeWidth="1.4" opacity=".55"/>
        <circle className="vx-ring" cx="212" cy="188" r="9" fill="none" stroke="#5090FF" strokeWidth="1.4" opacity=".55"/>
        <circle className="vx-dot vx-va" cx="120" cy="24"  r="5.5" fill="#00E676" style={{filter:"drop-shadow(0 0 5px #00E676)"}}/>
        <circle className="vx-dot vx-vp" cx="28"  cy="188" r="5.5" fill="#00F0FF" style={{filter:"drop-shadow(0 0 5px #00F0FF)"}}/>
        <circle className="vx-dot vx-vg" cx="212" cy="188" r="5.5" fill="#5090FF" style={{filter:"drop-shadow(0 0 5px #5090FF)"}}/>
      </g>
    </svg>
  );
}

// ─── Tela principal de autenticação ───────────────────────────────────────────
export function TelaAuth({ onEntrar }) {
  const [modo, setModo] = useState("login");
  const [destino, setDestino] = useState("operacao");
  const [animated, setAnimated] = useState(false);

  // semáforo em tempo real
  const [semaforo, setSemaforo] = useState(null);
  useEffect(()=>{
    const unsub = onSnapshot(doc(COL,"ocorrencias_h2"), (snap)=>{
      setSemaforo(snap.exists()? snap.data().val : null);
    }, ()=>{});
    return ()=>unsub();
  },[]);

  const corLed = (()=>{
    const niveis = [semaforo?.M2, semaforo?.M3].map(o=>{
      const n = o?.cor || o?.nivel;
      return n==="vermelho"?2 : n==="amarelo"?1 : 0;
    });
    const pior = Math.max(0, ...niveis);
    return pior===2 ? "#FF5252" : pior===1 ? "#FFC107" : C.accent;
  })();

  // dispara animação logo após montar
  useEffect(()=>{ const t = setTimeout(()=>setAnimated(true), 80); return ()=>clearTimeout(t); },[]);

  return (
    <div style={{
      minHeight:"100vh", background:
        "radial-gradient(80% 60% at 50% 0%,#FFFFFF,#F1F5F8 60%,#E7EDF2)",
      display:"flex", flexDirection:"column", alignItems:"center",
      overflowY:"auto", position:"relative",
    }}>
      <style>{`
        @keyframes ledPulseAuth{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes vxRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .vx-rise{animation:vxRise .7s cubic-bezier(.2,.7,.2,1) forwards}
        .vx-wordmark-anim{opacity:0;animation:vxRise .7s cubic-bezier(.2,.7,.2,1) 1.7s forwards}
        .vx-tagline-anim{opacity:0;animation:vxRise .6s ease 2.0s forwards}
        .vx-auth-anim{opacity:0;animation:vxRise .6s ease 2.55s forwards}
      `}</style>

      {/* Grid blueprint de fundo */}
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:"linear-gradient(rgba(0,150,90,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,120,180,.05) 1px,transparent 1px)",
        backgroundSize:"34px 34px",
        WebkitMaskImage:"radial-gradient(ellipse 80% 70% at 50% 38%,#000 36%,transparent 100%)",
        maskImage:"radial-gradient(ellipse 80% 70% at 50% 38%,#000 36%,transparent 100%)",
      }}/>

      {/* Cantos HUD */}
      {[
        {top:14,left:14,borderTop:`2px solid ${C.accent}`,borderLeft:`2px solid ${C.accent}`},
        {top:14,right:14,borderTop:`2px solid ${C.accent}`,borderRight:`2px solid ${C.accent}`},
        {bottom:14,left:14,borderBottom:`2px solid ${C.accent}`,borderLeft:`2px solid ${C.accent}`},
        {bottom:14,right:14,borderBottom:`2px solid ${C.accent}`,borderRight:`2px solid ${C.accent}`},
      ].map((s,i)=>(
        <div key={i} style={{
          position:"fixed",width:18,height:18,pointerEvents:"none",zIndex:2,opacity:.7,
          filter:`drop-shadow(0 0 3px ${C.accent})`,...s,
        }}/>
      ))}

      {/* Linha LED semáforo — topo */}
      <div style={{
        position:"fixed", top:0, left:0, right:0, height:3, zIndex:10,
        background:`linear-gradient(90deg,transparent 0%,${corLed} 50%,transparent 100%)`,
        boxShadow:`0 0 16px 2px ${corLed}, 0 0 40px 4px ${corLed}88`,
        animation:"ledPulseAuth 2s ease-in-out infinite",
      }}/>

      {/* Conteúdo centralizado */}
      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",width:"100%",maxWidth:420,padding:"52px 24px 40px"}}>

        {/* Logo */}
        <LogoVertice animated={animated}/>

        {/* Wordmark */}
        <div className="vx-wordmark-anim" style={{
          fontFamily:"system-ui,sans-serif", fontWeight:800, fontSize:30,
          color:"#0B1F30", letterSpacing:".42em", paddingLeft:".42em",
          textShadow:"0 1px 1px rgba(0,199,102,.20)",
          marginTop:14,
        }}>VÉRTICE</div>

        <div className="vx-tagline-anim" style={{marginTop:10,fontSize:13,color:"#54687A",letterSpacing:".04em"}}>
          Antecipe. Decida. Execute.
        </div>

        {/* Formulários */}
        <div className="vx-auth-anim" style={{width:"100%",marginTop:32}}>
          {/* Destino */}
          {modo==="login" && (
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:"monospace",fontSize:9.5,color:"#5E7A99",letterSpacing:".22em",marginBottom:7,textAlign:"center"}}>DESTINO</div>
              <div style={{display:"flex",gap:8}}>
                {[{id:"operacao",l:"Operação",cor:C.accent},{id:"pg",l:"PG · Parada Geral",cor:"#5090FF"}].map(d=>(
                  <button key={d.id} onClick={()=>setDestino(d.id)} style={{
                    flex:1, padding:"9px", borderRadius:10, cursor:"pointer",
                    fontWeight:700, fontSize:12.5,
                    border:`2px solid ${destino===d.id?d.cor:C.border}`,
                    background:destino===d.id?`${d.cor}1f`:"rgba(255,255,255,.02)",
                    color:destino===d.id?C.white:C.textMuted,
                    boxShadow:destino===d.id?`0 0 12px ${d.cor}44`:"none",
                    transition:"all .15s",
                  }}>{d.l}</button>
                ))}
              </div>
            </div>
          )}

          {/* Abas */}
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {[{id:"login",l:"Entrar"},{id:"cadastro",l:"Primeiro acesso"}].map(t=>(
              <button key={t.id} onClick={()=>setModo(t.id)} style={{
                flex:1, padding:"11px", borderRadius:11, cursor:"pointer",
                fontWeight:700, fontSize:13,
                border:`2px solid ${modo===t.id?C.accent:C.border}`,
                background:modo===t.id?`linear-gradient(135deg,${C.accentDark},rgba(0,230,118,.12))`:"rgba(255,255,255,.02)",
                color:modo===t.id?C.white:C.textMuted,
                boxShadow:modo===t.id?`0 0 12px ${C.accent}44`:"none",
                transition:"all .15s",
              }}>{t.l}</button>
            ))}
          </div>

          {/* Card glassmorphism */}
          <div style={{
            background:"rgba(10,25,41,0.55)", backdropFilter:"blur(12px)",
            WebkitBackdropFilter:"blur(12px)", border:`1px solid ${C.border}`,
            borderRadius:16, padding:22, boxShadow:"0 8px 32px rgba(0,0,0,.4)",
          }}>
            {modo==="login" ? <FormLogin onEntrar={onEntrar} destino={destino}/> : <FormCadastro onPronto={()=>setModo("login")}/>}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Formulário de Login ──────────────────────────────────────────────────────
function FormLogin({ onEntrar, destino }) {
  const [matricula, setMatricula] = useState("");
  const [pin, setPin] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const entrar = async ()=>{
    setErro("");
    if(!matricula.trim()||pin.length!==4){ setErro("Informe matrícula e PIN de 4 dígitos."); return; }
    setCarregando(true);
    try {
      const snap = await getDoc(doc(UCOL, matricula.trim()));
      if(!snap.exists()){ setErro("Matrícula não cadastrada."); setCarregando(false); return; }
      const u = snap.data();
      if(u.status==="pendente"){ setErro("Cadastro em análise. Aguarde a liberação do administrador."); setCarregando(false); return; }
      if(u.status==="bloqueado"){ setErro("Acesso bloqueado. Procure o administrador."); setCarregando(false); return; }
      const h = await hashPin(pin);
      if(h!==u.pinHash){ setErro("PIN incorreto."); setCarregando(false); return; }
      const perfil = { matricula:matricula.trim(), nome:u.nomeCompleto, area:u.area, funcao:u.funcao };
      localStorage.setItem("perfil_ativo_h2", JSON.stringify(perfil));
      localStorage.setItem("vertice_modo", destino==="pg" ? "pg" : "operacao");
      if(destino==="pg"){ location.reload(); return; }
      onEntrar(perfil);
    } catch(e) {
      setErro("Falha de conexão. Tente novamente.");
      setCarregando(false);
    }
  };

  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
      <Campo label="Matrícula">
        <input value={matricula} onChange={e=>setMatricula(e.target.value.replace(/\D/g,""))} inputMode="numeric" placeholder="Ex: 000000" style={inputStyle}/>
      </Campo>
      <Campo label="PIN (4 dígitos)">
        <input value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,4))} inputMode="numeric" type="password" placeholder="••••" style={{...inputStyle,letterSpacing:"0.3em",fontSize:18}}/>
      </Campo>
      {erro && <MsgErro>{erro}</MsgErro>}
      <button onClick={entrar} disabled={carregando} style={btnPrimario(carregando)}>{carregando?"Entrando...":"Entrar"}</button>
    </div>
  );
}

// ─── Formulário de Cadastro ───────────────────────────────────────────────────
function FormCadastro({ onPronto }) {
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("pu");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const cadastrar = async ()=>{
    setErro("");
    if(!nome.trim()){ setErro("Informe o nome completo."); return; }
    if(!matricula.trim()){ setErro("Informe a matrícula."); return; }
    if(!email.trim()||!email.includes("@")){ setErro("Informe um e-mail válido."); return; }
    if(pin.length!==4){ setErro("O PIN deve ter 4 dígitos."); return; }
    if(pin!==pin2){ setErro("Os PINs não coincidem."); return; }
    setCarregando(true);
    try {
      const ref = doc(UCOL, matricula.trim());
      const existe = await getDoc(ref);
      if(existe.exists()){ setErro("Esta matrícula já tem cadastro."); setCarregando(false); return; }
      const pinHash = await hashPin(pin);
      await setDoc(ref, {
        nomeCompleto:nome.trim(), matricula:matricula.trim(), email:email.trim(),
        area, funcao:"operador_area", pinHash, status:"pendente", criadoEm:Date.now(),
      });
      setOk(true);
    } catch(e) {
      setErro("Falha ao enviar cadastro. Tente novamente.");
    }
    setCarregando(false);
  };

  if(ok) return (
    <div style={{background:C.card,border:`1px solid ${C.accent}55`,borderRadius:14,padding:24,textAlign:"center"}}>
      <div style={{fontSize:34,marginBottom:8}}>✅</div>
      <p style={{color:C.accent,fontWeight:800,fontSize:15,margin:"0 0 6px"}}>Cadastro enviado!</p>
      <p style={{color:C.textMuted,fontSize:12,lineHeight:1.5,margin:"0 0 16px"}}>Seu acesso está em análise. Assim que o administrador liberar, você poderá entrar com sua matrícula e PIN.</p>
      <button onClick={onPronto} style={btnPrimario(false)}>Voltar para Entrar</button>
    </div>
  );

  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
      <Campo label="Nome completo">
        <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Seu nome" style={inputStyle}/>
      </Campo>
      <Campo label="Matrícula">
        <input value={matricula} onChange={e=>setMatricula(e.target.value.replace(/\D/g,""))} inputMode="numeric" placeholder="Ex: 000000" style={inputStyle}/>
      </Campo>
      <Campo label="E-mail corporativo">
        <input value={email} onChange={e=>setEmail(e.target.value)} inputMode="email" placeholder="nome@suzano.com.br" style={inputStyle}/>
      </Campo>
      <Campo label="Área">
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {AREAS.map(a=>(
            <button key={a.id} onClick={()=>setArea(a.id)} style={{flex:"1 1 45%",padding:"9px 6px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,border:`2px solid ${area===a.id?"rgba(0,199,102,0.55)":C.border}`,background:area===a.id?"linear-gradient(135deg, rgba(255,255,255,0.96), rgba(0,199,102,0.12))":C.tagBg,color:area===a.id?"#00975A":C.textMuted}}>{a.label}</button>
          ))}
        </div>
      </Campo>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Campo label="PIN (4 díg.)">
          <input value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,4))} inputMode="numeric" type="password" placeholder="••••" style={{...inputStyle,letterSpacing:"0.2em"}}/>
        </Campo>
        <Campo label="Repetir PIN">
          <input value={pin2} onChange={e=>setPin2(e.target.value.replace(/\D/g,"").slice(0,4))} inputMode="numeric" type="password" placeholder="••••" style={{...inputStyle,letterSpacing:"0.2em"}}/>
        </Campo>
      </div>
      <p style={{color:C.textDim,fontSize:10,lineHeight:1.4,margin:"2px 0 12px"}}>Sua função de acesso é definida pelo administrador na liberação do cadastro.</p>
      {erro && <MsgErro>{erro}</MsgErro>}
      <button onClick={cadastrar} disabled={carregando} style={btnPrimario(carregando)}>{carregando?"Enviando...":"Enviar cadastro"}</button>
    </div>
  );
}

// ─── Auxiliares ───────────────────────────────────────────────────────────────
function Campo({ label, children }) {
  return (
    <div style={{marginBottom:13}}>
      <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:6}}>{label}</label>
      {children}
    </div>
  );
}
function MsgErro({ children }) {
  return <div style={{background:"#2a0808",border:`1px solid ${C.dangerLight}44`,borderRadius:8,padding:"9px 12px",marginBottom:12}}><p style={{color:C.dangerLight,fontSize:12,margin:0,lineHeight:1.4}}>{children}</p></div>;
}
function btnPrimario(carregando) {
  return { width:"100%", padding:13, border:"none", borderRadius:10, color:"#fff", fontSize:14, fontWeight:800, background:carregando?C.accentDark:C.accent, cursor:carregando?"wait":"pointer", marginTop:4 };
}
