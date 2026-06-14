// ─── admin.jsx — Painel do Desenvolvedor · Gestão de Usuários · Secagem H2 ────
// Arquivo isolado. O MVPSecagem.jsx importa { PainelAdmin }.
// Lê/escreve na coleção "usuarios_h2" (mesma do auth.jsx).
import { useState, useEffect } from "react";
import { db, doc, setDoc, getDoc, getDocs, deleteDoc } from "./firebase";
import { collection } from "firebase/firestore";

const UCOL = collection(db, "usuarios_h2");

const C = {
  bg:"#04111D", surface:"#071828", card:"#0A1929", cardHover:"#0E2847",
  accent:"#00E676", accentLight:"#00E676", accentDark:"#006B2E",
  blue:"#0E2847", blueLight:"#1A5CCC",
  warning:"#b87d00", warningLight:"#FFC107",
  danger:"#c0272d", dangerLight:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880", white:"#ffffff",
  border:"rgba(60,255,140,0.15)", tagBg:"rgba(255,255,255,0.04)",
};

const FUNCOES = {
  operador_area:   "Operador de Área",
  operador_painel: "Operador de Painel",
  supervisor:      "Supervisor",
  dev:             "Desenvolvedor",
};
const AREAS = { pu:"Parte Úmida", cortadeira:"Cortadeira", enfardamento:"Enfardamento", painel:"Painel" };

const inputStyle = { width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px", color:C.white, fontSize:14, outline:"none" };

async function hashPin(pin) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

export function PainelAdmin({ onVoltar }) {
  const [usuarios,setUsuarios]=useState([]);
  const [carregando,setCarregando]=useState(true);
  const [aba,setAba]=useState("pendentes"); // pendentes | ativos
  const [msg,setMsg]=useState("");
  const [editId,setEditId]=useState(null);     // matrícula em edição (aprovação)
  const [funcaoSel,setFuncaoSel]=useState("operador_area");
  const [resetId,setResetId]=useState(null);   // matrícula em reset de PIN
  const [novoPin,setNovoPin]=useState("");
  const [confirmarRemover,setConfirmarRemover]=useState(null);

  const carregar=async()=>{
    setCarregando(true);
    try{
      const snap=await getDocs(UCOL);
      const lista=[];
      snap.forEach(d=>lista.push({ id:d.id, ...d.data() }));
      lista.sort((a,b)=>(b.criadoEm||0)-(a.criadoEm||0));
      setUsuarios(lista);
    }catch(e){ setMsg("Falha ao carregar usuários."); }
    setCarregando(false);
  };
  useEffect(()=>{ carregar(); },[]);

  const flash=(t)=>{ setMsg(t); setTimeout(()=>setMsg(""),2500); };

  // Aprovar: define função + status ativo
  const aprovar=async(u)=>{
    try{
      await setDoc(doc(UCOL,u.id),{ ...u, funcao:funcaoSel, status:"ativo" });
      setEditId(null); flash(`${u.nomeCompleto} aprovado como ${FUNCOES[funcaoSel]}.`); carregar();
    }catch(e){ flash("Erro ao aprovar."); }
  };
  // Alterar função de quem já está ativo
  const mudarFuncao=async(u,novaFuncao)=>{
    try{
      await setDoc(doc(UCOL,u.id),{ ...u, funcao:novaFuncao });
      flash(`Função de ${u.nomeCompleto} alterada.`); carregar();
    }catch(e){ flash("Erro ao alterar função."); }
  };
  // Bloquear/desbloquear
  const alternarBloqueio=async(u)=>{
    const novo=u.status==="bloqueado"?"ativo":"bloqueado";
    try{
      await setDoc(doc(UCOL,u.id),{ ...u, status:novo });
      flash(`${u.nomeCompleto} ${novo==="bloqueado"?"bloqueado":"desbloqueado"}.`); carregar();
    }catch(e){ flash("Erro ao alterar status."); }
  };
  // Resetar PIN
  const resetarPin=async(u)=>{
    if(novoPin.length!==4){ flash("PIN deve ter 4 dígitos."); return; }
    try{
      const pinHash=await hashPin(novoPin);
      await setDoc(doc(UCOL,u.id),{ ...u, pinHash });
      setResetId(null); setNovoPin(""); flash(`PIN de ${u.nomeCompleto} redefinido.`); carregar();
    }catch(e){ flash("Erro ao redefinir PIN."); }
  };
  // Remover
  const remover=async(u)=>{
    try{
      await deleteDoc(doc(UCOL,u.id));
      setConfirmarRemover(null); flash(`${u.nomeCompleto} removido.`); carregar();
    }catch(e){ flash("Erro ao remover."); }
  };

  const pendentes=usuarios.filter(u=>u.status==="pendente");
  const ativos=usuarios.filter(u=>u.status!=="pendente");
  const lista=aba==="pendentes"?pendentes:ativos;

  return (
    <div style={{minHeight:"100vh",background:C.bg,padding:"18px 16px 80px"}}>
      {/* Cabeçalho */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <button onClick={onVoltar} style={{width:34,height:34,borderRadius:9,cursor:"pointer",border:`1px solid ${C.border}`,background:C.tagBg,color:C.accent,fontSize:16,fontWeight:800,padding:0}}>‹</button>
        <div>
          <div style={{color:C.white,fontWeight:800,fontSize:16}}>Painel do Desenvolvedor</div>
          <div style={{color:C.textDim,fontSize:11,fontFamily:"monospace"}}>Gestão de usuários · {usuarios.length} cadastrados</div>
        </div>
      </div>

      {msg&&<div style={{background:C.accentDark+"33",border:`1px solid ${C.accent}55`,borderRadius:9,padding:"10px 12px",marginBottom:12}}><p style={{color:C.accent,fontSize:12,margin:0,fontWeight:600}}>{msg}</p></div>}

      {/* Abas */}
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        <button onClick={()=>setAba("pendentes")} style={{flex:1,padding:"9px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:12,border:`2px solid ${aba==="pendentes"?C.warningLight:C.border}`,background:aba==="pendentes"?C.warning+"33":C.tagBg,color:aba==="pendentes"?C.warningLight:C.textMuted}}>
          Pendentes {pendentes.length>0&&<span style={{background:C.warningLight,color:"#000",borderRadius:10,padding:"1px 7px",fontSize:11,marginLeft:4}}>{pendentes.length}</span>}
        </button>
        <button onClick={()=>setAba("ativos")} style={{flex:1,padding:"9px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:12,border:`2px solid ${aba==="ativos"?C.accent:C.border}`,background:aba==="ativos"?C.accentDark:C.tagBg,color:aba==="ativos"?C.white:C.textMuted}}>
          Ativos ({ativos.length})
        </button>
      </div>

      {carregando?(
        <div style={{textAlign:"center",color:C.textMuted,padding:"40px 0",fontSize:13}}>Carregando...</div>
      ):lista.length===0?(
        <div style={{textAlign:"center",color:C.textDim,padding:"40px 0",fontSize:13}}>{aba==="pendentes"?"Nenhum cadastro pendente.":"Nenhum usuário ativo ainda."}</div>
      ):(
        lista.map(u=>(
          <div key={u.id} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${u.status==="pendente"?C.warningLight:u.status==="bloqueado"?C.dangerLight:C.accentLight}`,borderRadius:10,padding:14,marginBottom:10}}>
            {/* Info do usuário */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{minWidth:0}}>
                <div style={{color:C.white,fontWeight:700,fontSize:14}}>{u.nomeCompleto}</div>
                <div style={{color:C.textDim,fontSize:11,fontFamily:"monospace",marginTop:2}}>Mat. {u.matricula} · {AREAS[u.area]||u.area}</div>
                <div style={{color:C.textDim,fontSize:10,marginTop:1}}>{u.email}</div>
              </div>
              <span style={{flexShrink:0,fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:6,background:u.status==="pendente"?C.warning+"33":u.status==="bloqueado"?C.danger+"33":C.accentDark+"44",color:u.status==="pendente"?C.warningLight:u.status==="bloqueado"?C.dangerLight:C.accentLight,textTransform:"uppercase"}}>{u.status}</span>
            </div>

            {/* Função atual (ativos) */}
            {u.status!=="pendente"&&<div style={{color:C.blueLight,fontSize:11,fontWeight:700,marginBottom:10}}>{FUNCOES[u.funcao]||u.funcao}</div>}

            {/* AÇÕES — Pendente: aprovar com função */}
            {u.status==="pendente"&&(
              editId===u.id?(
                <div style={{background:C.surface,borderRadius:8,padding:10,marginTop:4}}>
                  <div style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",marginBottom:6}}>Definir função</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
                    {Object.entries(FUNCOES).map(([id,label])=>(
                      <button key={id} onClick={()=>setFuncaoSel(id)} style={{flex:"1 1 45%",padding:"7px 6px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:11,border:`1.5px solid ${funcaoSel===id?C.accent:C.border}`,background:funcaoSel===id?C.accentDark:C.tagBg,color:funcaoSel===id?C.white:C.textMuted}}>{label}</button>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setEditId(null)} style={{flex:1,padding:9,borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted}}>Cancelar</button>
                    <button onClick={()=>aprovar(u)} style={{flex:1,padding:9,borderRadius:8,cursor:"pointer",fontWeight:800,fontSize:12,background:C.accent,border:"none",color:"#fff"}}>✓ Aprovar</button>
                  </div>
                </div>
              ):(
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{setEditId(u.id);setFuncaoSel("operador_area");}} style={{flex:1,padding:9,borderRadius:8,cursor:"pointer",fontWeight:800,fontSize:12,background:C.accent,border:"none",color:"#fff"}}>Aprovar cadastro</button>
                  <button onClick={()=>setConfirmarRemover(u.id)} style={{padding:"9px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,background:C.danger+"22",border:`1px solid ${C.dangerLight}55`,color:C.dangerLight}}>Recusar</button>
                </div>
              )
            )}

            {/* AÇÕES — Ativo: mudar função, reset PIN, bloquear, remover */}
            {u.status!=="pendente"&&u.funcao!=="dev"&&(
              resetId===u.id?(
                <div style={{background:C.surface,borderRadius:8,padding:10}}>
                  <div style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",marginBottom:6}}>Novo PIN (4 dígitos)</div>
                  <input value={novoPin} onChange={e=>setNovoPin(e.target.value.replace(/\D/g,"").slice(0,4))} inputMode="numeric" type="password" placeholder="••••" style={{...inputStyle,letterSpacing:"0.3em",textAlign:"center",fontSize:17,marginBottom:8}}/>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>{setResetId(null);setNovoPin("");}} style={{flex:1,padding:9,borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted}}>Cancelar</button>
                    <button onClick={()=>resetarPin(u)} style={{flex:1,padding:9,borderRadius:8,cursor:"pointer",fontWeight:800,fontSize:12,background:C.blueLight,border:"none",color:"#fff"}}>Salvar PIN</button>
                  </div>
                </div>
              ):confirmarRemover===u.id?(
                <div style={{background:C.danger+"15",borderRadius:8,padding:10,border:`1px solid ${C.dangerLight}44`}}>
                  <p style={{color:C.dangerLight,fontSize:12,margin:"0 0 8px",fontWeight:600}}>Remover {u.nomeCompleto}? Não pode ser desfeito.</p>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setConfirmarRemover(null)} style={{flex:1,padding:9,borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted}}>Cancelar</button>
                    <button onClick={()=>remover(u)} style={{flex:1,padding:9,borderRadius:8,cursor:"pointer",fontWeight:800,fontSize:12,background:C.danger,border:"none",color:"#fff"}}>Remover</button>
                  </div>
                </div>
              ):(
                <div>
                  <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Alterar função</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
                    {Object.entries(FUNCOES).filter(([id])=>id!=="dev").map(([id,label])=>(
                      <button key={id} onClick={()=>mudarFuncao(u,id)} style={{flex:"1 1 30%",padding:"6px 4px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:10,border:`1.5px solid ${u.funcao===id?C.blueLight:C.border}`,background:u.funcao===id?C.blue:C.tagBg,color:u.funcao===id?C.white:C.textMuted}}>{label}</button>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <button onClick={()=>{setResetId(u.id);setNovoPin("");}} style={{flex:"1 1 auto",padding:9,borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,background:C.tagBg,border:`1px solid ${C.blueLight}55`,color:C.blueLight}}>🔑 Resetar PIN</button>
                    <button onClick={()=>alternarBloqueio(u)} style={{flex:"1 1 auto",padding:9,borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,background:C.tagBg,border:`1px solid ${C.warningLight}55`,color:C.warningLight}}>{u.status==="bloqueado"?"✓ Desbloquear":"⛔ Bloquear"}</button>
                    <button onClick={()=>setConfirmarRemover(u.id)} style={{flex:"1 1 auto",padding:9,borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,background:C.tagBg,border:`1px solid ${C.dangerLight}55`,color:C.dangerLight}}>🗑 Remover</button>
                  </div>
                </div>
              )
            )}
            {u.funcao==="dev"&&u.status!=="pendente"&&<div style={{color:C.textDim,fontSize:10,fontStyle:"italic"}}>Conta de desenvolvedor — protegida.</div>}
          </div>
        ))
      )}

      <button onClick={carregar} style={{width:"100%",marginTop:8,padding:11,borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12,background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted}}>↻ Atualizar lista</button>
    </div>
  );
}
