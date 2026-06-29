// ─── auth.jsx — Cadastro, Login e Perfis de Acesso · Secagem H2 ──────────────
import { useState, useEffect, useRef } from "react";
import { db, COL, doc, setDoc, getDoc, onSnapshot } from "./firebase";
import { collection } from "firebase/firestore";

const UCOL = collection(db, "usuarios_h2");

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  bg:"#04111D", surface:"#071828", card:"#0A1929", cardHover:"#0E2847",
  accent:"#00E676", accentLight:"#00E676", accentDark:"#006B2E",
  blue:"#0E2847", blueLight:"#1A5CCC",
  warning:"#b87d00", warningLight:"#FFC107",
  danger:"#c0272d", dangerLight:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880", white:"#ffffff",
  border:"rgba(60,255,140,0.15)", tagBg:"rgba(255,255,255,0.04)",
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
    <svg viewBox="0 0 240 216" style={{width:"min(220px,58vw)",height:"auto",overflow:"visible"}} aria-label="Vértice">
      <defs>
        <linearGradient id="gA" gradientUnits="userSpaceOnUse" x1="120" y1="24" x2="28" y2="188">
          <stop offset="0" stopColor="#00E676"/><stop offset="1" stopColor="#00F0FF"/>
        </linearGradient>
        <linearGradient id="gB" gradientUnits="userSpaceOnUse" x1="28" y1="188" x2="212" y2="188">
          <stop offset="0" stopColor="#00F0FF"/><stop offset="1" stopColor="#5090FF"/>
        </linearGradient>
        <linearGradient id="gC" gradientUnits="userSpaceOnUse" x1="212" y1="188" x2="120" y2="24">
          <stop offset="0" stopColor="#5090FF"/><stop offset="1" stopColor="#00E676"/>
        </linearGradient>
        <radialGradient id="gFill" cx="120" cy="133" r="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor="#00E676" stopOpacity=".13"/>
          <stop offset="45%" stopColor="#00F0FF" stopOpacity=".05"/>
          <stop offset="100%" stopColor="#5090FF" stopOpacity="0"/>
        </radialGradient>
      </defs>

      <style>{`
        .vx-edge,.vx-inl{fill:none;stroke-linecap:round;pathLength:1;stroke-dasharray:1;stroke-dashoffset:1}
        .vx-edge{stroke-width:2.4}
        .vx-inl{stroke-width:1.4;opacity:.9}
        .vx-dot{opacity:0;transform-box:fill-box;transform-origin:center}
        .vx-core{opacity:0;transform-box:fill-box;transform-origin:center;filter:drop-shadow(0 0 6px #fff) drop-shadow(0 0 12px #00E676)}
        .vx-fill{opacity:0;transition:opacity .6s}
        @keyframes vxDraw{to{stroke-dashoffset:0}}
        @keyframes vxPop{0%{opacity:0;transform:scale(.2)}60%{opacity:1;transform:scale(1.45)}100%{opacity:1;transform:scale(1)}}
        @keyframes vxFadeIn{to{opacity:1}}
        @keyframes vxCorePulse{0%,100%{opacity:.65;transform:scale(1)}50%{opacity:1;transform:scale(1.55)}}
        .vx-go .vx-e1{animation:vxDraw .55s ease .15s forwards}
        .vx-go .vx-e2{animation:vxDraw .55s ease .35s forwards}
        .vx-go .vx-e3{animation:vxDraw .55s ease .55s forwards}
        .vx-go .vx-n1{animation:vxDraw .5s ease .95s forwards}
        .vx-go .vx-n2{animation:vxDraw .5s ease 1.1s forwards}
        .vx-go .vx-n3{animation:vxDraw .5s ease 1.25s forwards}
        .vx-go .vx-va{animation:vxPop .5s ease 1.0s forwards}
        .vx-go .vx-vp{animation:vxPop .5s ease 1.2s forwards}
        .vx-go .vx-vg{animation:vxPop .5s ease 1.4s forwards}
        .vx-go .vx-core{animation:vxFadeIn .3s ease 1.55s forwards,vxCorePulse 2.4s ease 1.85s infinite}
        .vx-go .vx-fill{animation:vxFadeIn .8s ease 1.6s forwards}
      `}</style>

      <g className={animated ? "vx-go" : ""}>
        <polygon points="120,24 28,188 212,188" fill="url(#gFill)" className="vx-fill"/>
        {/* pulsos viajantes */}
        <circle r="4.5" fill="#00E676" style={{filter:"drop-shadow(0 0 5px #00E676)"}}>
          <animateMotion dur="1.8s" begin="2.1s" repeatCount="indefinite"><mpath href="#vxP1"/></animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.85;1" dur="1.8s" begin="2.1s" repeatCount="indefinite"/>
        </circle>
        <circle r="4.5" fill="#00F0FF" style={{filter:"drop-shadow(0 0 5px #00F0FF)"}}>
          <animateMotion dur="1.8s" begin="2.7s" repeatCount="indefinite"><mpath href="#vxP2"/></animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.85;1" dur="1.8s" begin="2.7s" repeatCount="indefinite"/>
        </circle>
        <circle r="4.5" fill="#5090FF" style={{filter:"drop-shadow(0 0 5px #5090FF)"}}>
          <animateMotion dur="1.8s" begin="3.3s" repeatCount="indefinite"><mpath href="#vxP3"/></animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.85;1" dur="1.8s" begin="3.3s" repeatCount="indefinite"/>
        </circle>
        <defs>
          <path id="vxP1" d="M120,24 L120,133"/>
          <path id="vxP2" d="M28,188 L120,133"/>
          <path id="vxP3" d="M212,188 L120,133"/>
        </defs>
        {/* arestas */}
        <line className="vx-edge vx-e1" x1="120" y1="24" x2="28" y2="188" stroke="url(#gA)"/>
        <line className="vx-edge vx-e2" x1="28" y1="188" x2="212" y2="188" stroke="url(#gB)"/>
        <line className="vx-edge vx-e3" x1="212" y1="188" x2="120" y2="24" stroke="url(#gC)"/>
        {/* linhas internas */}
        <line className="vx-inl vx-n1" x1="120" y1="24"  x2="120" y2="133" stroke="#00E676"/>
        <line className="vx-inl vx-n2" x1="28"  y1="188" x2="120" y2="133" stroke="#00F0FF"/>
        <line className="vx-inl vx-n3" x1="212" y1="188" x2="120" y2="133" stroke="#5090FF"/>
        {/* núcleo */}
        <circle className="vx-core" cx="120" cy="133" r="4" fill="#fff"/>
        {/* vértices */}
        <circle className="vx-dot vx-va" cx="120" cy="24"  r="5.5" fill="#00E676"/>
        <circle className="vx-dot vx-vp" cx="28"  cy="188" r="5.5" fill="#00F0FF"/>
        <circle className="vx-dot vx-vg" cx="212" cy="188" r="5.5" fill="#5090FF"/>
      </g>
    </svg>
  );
}

// ─── Tela principal de autenticação ───────────────────────────────────────────
export function TelaAuth({ onEntrar }) {
  const [modo, setModo] = useState("login");
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
        "radial-gradient(80% 60% at 50% 0%,#0a1622,#04080e 70%,#01040a)",
      display:"flex", flexDirection:"column", alignItems:"center",
      overflowY:"auto", position:"relative",
    }}>
      <style>{`
        @keyframes ledPulseAuth{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes vxRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .vx-rise{animation:vxRise .7s cubic-bezier(.2,.7,.2,1) forwards}
        .vx-wordmark-anim{opacity:0;animation:vxRise .7s cubic-bezier(.2,.7,.2,1) 1.7s forwards}
        .vx-tagline-anim{opacity:0;animation:vxRise .6s ease 2.0s forwards}
        .vx-ctx-anim{opacity:0;animation:vxRise .6s ease 2.2s forwards}
        .vx-auth-anim{opacity:0;animation:vxRise .6s ease 2.55s forwards}
      `}</style>

      {/* Grid blueprint de fundo */}
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:"linear-gradient(rgba(0,230,118,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,255,.04) 1px,transparent 1px)",
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
          color:"#fff", letterSpacing:".42em", paddingLeft:".42em",
          textShadow:"0 0 18px rgba(0,230,118,.45),0 0 2px rgba(0,230,118,.6)",
          marginTop:14,
        }}>VÉRTICE</div>

        <div className="vx-tagline-anim" style={{marginTop:10,fontSize:13,color:"#C8DCEE",letterSpacing:".04em"}}>
          Três visões. Uma operação.
        </div>

        <div className="vx-ctx-anim" style={{
          marginTop:8, display:"flex", alignItems:"center", gap:9,
          fontFamily:"monospace", fontSize:9.5, color:"#5E7A99", letterSpacing:".22em",
        }}>
          <span style={{display:"block",width:26,height:1,background:"linear-gradient(90deg,transparent,#5E7A99)"}}/>
          SECAGEM H2 · SUZANO
          <span style={{display:"block",width:26,height:1,background:"linear-gradient(90deg,#5E7A99,transparent)"}}/>
        </div>

        {/* Formulários */}
        <div className="vx-auth-anim" style={{width:"100%",marginTop:32}}>
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
            {modo==="login" ? <FormLogin onEntrar={onEntrar}/> : <FormCadastro onPronto={()=>setModo("login")}/>}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Formulário de Login ──────────────────────────────────────────────────────
function FormLogin({ onEntrar }) {
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
            <button key={a.id} onClick={()=>setArea(a.id)} style={{flex:"1 1 45%",padding:"9px 6px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,border:`2px solid ${area===a.id?C.blueLight:C.border}`,background:area===a.id?C.blue:C.tagBg,color:area===a.id?C.white:C.textMuted}}>{a.label}</button>
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
