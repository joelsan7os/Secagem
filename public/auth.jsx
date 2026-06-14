// ─── auth.jsx — Cadastro, Login e Perfis de Acesso · Secagem H2 ──────────────
// Arquivo isolado. O MVPSecagem.jsx importa { TelaAuth, usePerfilAtivo }.
// Usuários ficam na coleção "usuarios_h2", indexados por matrícula.
// PIN guardado como hash SHA-256 (nunca em texto puro).
import { useState, useEffect } from "react";
import { db, doc, setDoc, getDoc } from "./firebase";
import { collection } from "firebase/firestore";

const UCOL = collection(db, "usuarios_h2");

// ─── Paleta (espelha a do app) ────────────────────────────────────────────────
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

// ─── Hash do PIN (SHA-256 nativo do navegador) ────────────────────────────────
async function hashPin(pin) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

// ─── Hook: lê o perfil salvo na sessão ────────────────────────────────────────
export function usePerfilAtivo() {
  const [perfil, setPerfil] = useState(()=>{
    try { return JSON.parse(localStorage.getItem("perfil_ativo_h2")); } catch { return null; }
  });
  const logout = ()=>{ localStorage.removeItem("perfil_ativo_h2"); setPerfil(null); };
  return { perfil, setPerfil, logout };
}

// ─── Tela principal de autenticação ───────────────────────────────────────────
export function TelaAuth({ onEntrar }) {
  const [modo, setModo] = useState("login"); // login | cadastro
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 18px"}}>
      <div style={{width:"100%",maxWidth:380}}>
        {/* Cabeçalho */}
        <div style={{textAlign:"center",marginBottom:26}}>
          <div style={{fontSize:13,letterSpacing:"0.22em",color:C.accent,fontWeight:800,fontFamily:"monospace",textTransform:"uppercase"}}>Secagem · H2</div>
          <div style={{color:C.textDim,fontSize:11,marginTop:4,fontFamily:"monospace"}}>Três Lagoas · M2 · M3</div>
        </div>
        {/* Abas */}
        <div style={{display:"flex",gap:6,marginBottom:18}}>
          {[{id:"login",l:"Entrar"},{id:"cadastro",l:"Primeiro acesso"}].map(t=>(
            <button key={t.id} onClick={()=>setModo(t.id)} style={{flex:1,padding:"9px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12,border:`2px solid ${modo===t.id?C.accent:C.border}`,background:modo===t.id?C.accentDark:C.tagBg,color:modo===t.id?C.white:C.textMuted}}>{t.l}</button>
          ))}
        </div>
        {modo==="login" ? <FormLogin onEntrar={onEntrar}/> : <FormCadastro onPronto={()=>setModo("login")}/>}
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
        <input value={matricula} onChange={e=>setMatricula(e.target.value.replace(/\D/g,""))} inputMode="numeric" placeholder="Ex: 242365" style={inputStyle}/>
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
        <input value={matricula} onChange={e=>setMatricula(e.target.value.replace(/\D/g,""))} inputMode="numeric" placeholder="Ex: 242365" style={inputStyle}/>
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

// ─── Componentes auxiliares ───────────────────────────────────────────────────
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
