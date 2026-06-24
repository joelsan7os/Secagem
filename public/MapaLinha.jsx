// ─── MapaLinha.jsx — Mapa 3D da Linha de Secagem H2 · Dashboard TV ───────────
// Imagem real da fábrica + overlay neon + badges de status ao vivo
// fabrica_img.js contém o base64 da imagem (arquivo separado)
import * as React from "react";
import { FABRICA_B64 } from "./fabrica_img";

const C = {
  bg:"#04111D", card:"#0A1929",
  accent:"#00E676",
  warning:"#FFC107", danger:"#FF5252",
  text:"#FFFFFF", textMuted:"#B5C6DA", textDim:"#3A5880",
  border:"rgba(60,255,140,0.15)",
};

// Posições das áreas sobre a imagem (% left/top do container)
const AREAS = [
  { id:"pu",    label:"P. UMIDA",      dotX:29, dotY:38, badgeX:24, badgeY:58, cor:"#00E676" },
  { id:"clean", label:"CLEANERS",      dotX:43, dotY:22, badgeX:40, badgeY:42, cor:"#00F0FF" },
  { id:"cs",    label:"SEC / CORT",    dotX:59, dotY:38, badgeX:56, badgeY:58, cor:"#5090FF" },
  { id:"enf",   label:"ENFARDAMENTO",  dotX:76, dotY:24, badgeX:73, badgeY:44, cor:"#C77DFF" },
];

function areaParaJanela(area) {
  const a=(area||"").toLowerCase();
  if(a==="cortadeira"||a==="cs"||a==="secador") return "cs";
  if(a==="enfardamento"||a==="enf") return "enf";
  if(a==="cleaners") return "clean";
  return "pu";
}

function getStatus(id, ocorrencias, pendencias, chamados) {
  const pend = Array.isArray(pendencias)?pendencias:[];
  const cham = Array.isArray(chamados)?chamados.filter(c=>c.status==="aberto"):[];
  const nCrit = pend.filter(p=>(p.janela||areaParaJanela(p.area))===id&&(p.prazo==="Imediato"||p.prazo==="Urgente")).length
    + cham.filter(c=>areaParaJanela(c.area)===id&&(c.prazo==="Imediato"||c.prazo==="Urgente")).length;
  const nPend = pend.filter(p=>(p.janela||areaParaJanela(p.area))===id).length
    + cham.filter(c=>areaParaJanela(c.area)===id).length;
  const mq = id==="pu"?"M2":id==="cs"?"M3":null;
  if(mq&&ocorrencias?.[mq]?.cor==="vermelho") return {cor:"#FF5252",label:"CRITICO",pulse:true};
  if(nCrit>0) return {cor:"#FF5252",label:"CRITICO",pulse:true};
  if(mq&&ocorrencias?.[mq]?.cor==="amarelo") return {cor:"#FFC107",label:"ATENCAO",pulse:false};
  if(nPend>0) return {cor:"#FFC107",label:"ATENCAO",pulse:false};
  return {cor:"#00E676",label:"OK",pulse:false};
}

export function MapaLinha({ ocorrencias, pendenciasData, chamadosData, setTela }) {
  const [hover, setHover] = React.useState(null);

  const statuses = React.useMemo(()=>{
    const s={};
    AREAS.forEach(a=>{ s[a.id]=getStatus(a.id,ocorrencias,pendenciasData,chamadosData); });
    return s;
  },[ocorrencias,pendenciasData,chamadosData]);

  return (
    <div
      onClick={()=>setTela&&setTela("equipamentos")}
      style={{
        position:"relative", width:"100%", height:"100%", minHeight:180,
        borderRadius:12, overflow:"hidden", cursor:"pointer",
        background:"#020D18", border:`1px solid ${C.border}`,
      }}
    >
      <style>{`
        @keyframes ml-neon-pulse{0%,100%{opacity:1;transform:translate(-50%,-50%) scale(1);}50%{opacity:.35;transform:translate(-50%,-50%) scale(.8);}}
        @keyframes ml-ring{0%{transform:translate(-50%,-50%) scale(1);opacity:.9;}100%{transform:translate(-50%,-50%) scale(2.8);opacity:0;}}
        @keyframes ml-scan{0%{top:-2px;opacity:.7;}100%{top:100%;opacity:0;}}
        @keyframes ml-badge-glow{0%,100%{box-shadow:0 0 10px var(--bc)44;}50%{box-shadow:0 0 18px var(--bc)88, 0 0 32px var(--bc)33;}}
      `}</style>

      {/* Imagem da fábrica */}
      <img src={FABRICA_B64} alt="Linha Secagem H2"
        style={{position:"absolute",inset:0,width:"100%",height:"100%",
          objectFit:"cover",objectPosition:"center 30%",display:"block"}}/>

      {/* Overlay escuro principal */}
      <div style={{position:"absolute",inset:0,
        background:"linear-gradient(130deg,rgba(2,13,24,.88) 0%,rgba(4,17,29,.6) 50%,rgba(2,13,24,.84) 100%)"}}/>

      {/* Tint neon verde sutil */}
      <div style={{position:"absolute",inset:0,
        background:"radial-gradient(ellipse at 50% 55%,rgba(0,230,118,.07) 0%,rgba(80,144,255,.04) 45%,transparent 70%)",
        mixBlendMode:"screen",pointerEvents:"none"}}/>

      {/* Grid blueprint */}
      <div style={{position:"absolute",inset:0,
        backgroundImage:"linear-gradient(rgba(0,230,118,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,.035) 1px,transparent 1px)",
        backgroundSize:"36px 36px",pointerEvents:"none"}}/>

      {/* Linha de scan */}
      <div style={{position:"absolute",left:0,right:0,height:1,
        background:"linear-gradient(90deg,transparent 0%,rgba(0,240,255,.5) 50%,transparent 100%)",
        animation:"ml-scan 5s linear infinite",pointerEvents:"none"}}/>

      {/* SVG: linhas de conexão + pontos neon */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",overflow:"visible",pointerEvents:"none"}}>
        {/* Linhas entre áreas */}
        {AREAS.slice(0,-1).map((a,i)=>{
          const b=AREAS[i+1];
          const st=statuses[a.id];
          return(
            <line key={i}
              x1={`${a.dotX}%`} y1={`${a.dotY}%`}
              x2={`${b.dotX}%`} y2={`${b.dotY}%`}
              stroke={st.cor} strokeWidth="1"
              strokeDasharray="5,5" opacity=".3"/>
          );
        })}
        {/* Linhas verticais ponto→badge */}
        {AREAS.map(a=>{
          const st=statuses[a.id];
          return(
            <line key={a.id}
              x1={`${a.dotX}%`} y1={`${a.dotY}%`}
              x2={`${a.badgeX+4}%`} y2={`${a.badgeY}%`}
              stroke={st.cor} strokeWidth=".8" opacity=".4"/>
          );
        })}
      </svg>

      {/* Pontos neon + rings + badges */}
      {AREAS.map(area=>{
        const st=statuses[area.id];
        const isHov=hover===area.id;
        return(
          <React.Fragment key={area.id}>
            {/* Ring de alerta (crítico) */}
            {st.pulse&&(
              <div style={{
                position:"absolute",
                left:`${area.dotX}%`,top:`${area.dotY}%`,
                transform:"translate(-50%,-50%)",
                width:18,height:18,borderRadius:"50%",
                border:`1.5px solid ${st.cor}`,
                animation:"ml-ring 1.5s ease-out infinite",
                pointerEvents:"none",
              }}/>
            )}
            {/* Ponto neon */}
            <div style={{
              position:"absolute",
              left:`${area.dotX}%`,top:`${area.dotY}%`,
              transform:"translate(-50%,-50%)",
              width:10,height:10,borderRadius:"50%",
              background:st.cor,
              boxShadow:`0 0 6px ${st.cor},0 0 16px ${st.cor}88,0 0 32px ${st.cor}44`,
              animation:st.pulse?"ml-neon-pulse 1.4s ease-in-out infinite":"none",
              zIndex:3,pointerEvents:"none",
            }}/>
            {/* Badge */}
            <div
              onMouseEnter={e=>{e.stopPropagation();setHover(area.id);}}
              onMouseLeave={()=>setHover(null)}
              onClick={e=>{e.stopPropagation();setTela&&setTela("equipamentos");}}
              style={{
                position:"absolute",
                left:`${area.badgeX}%`,top:`${area.badgeY}%`,
                transform:"translateY(-50%)",
                background:isHov?"rgba(4,17,29,.97)":"rgba(4,17,29,.85)",
                border:`1px solid ${st.cor}${isHov?"cc":"66"}`,
                borderRadius:7,
                padding:"5px 9px",
                backdropFilter:"blur(10px)",
                boxShadow:`0 0 12px ${st.cor}33${isHov?`,0 0 24px ${st.cor}44`:""}`,
                transition:"all .2s",
                zIndex:4,pointerEvents:"all",cursor:"pointer",
                minWidth:72,
                "--bc":st.cor,
              }}
            >
              <div style={{fontSize:7,fontWeight:800,letterSpacing:"0.14em",color:C.textDim,marginBottom:2,textTransform:"uppercase"}}>{area.label}</div>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:st.cor,
                  boxShadow:`0 0 5px ${st.cor}`,flexShrink:0}}/>
                <span style={{fontSize:9,fontWeight:900,color:st.cor,letterSpacing:"0.06em"}}>{st.label}</span>
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Header */}
      <div style={{position:"absolute",top:0,left:0,right:0,padding:"7px 12px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        background:"linear-gradient(to bottom,rgba(2,13,24,.92),transparent)",
        pointerEvents:"none",zIndex:5}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:C.accent,
            boxShadow:`0 0 8px ${C.accent}`,animation:"ml-neon-pulse 2.5s ease-in-out infinite"}}/>
          <span style={{fontSize:9,fontWeight:800,color:C.textMuted,letterSpacing:"0.18em",textTransform:"uppercase"}}>
            MAPA DA LINHA · AO VIVO
          </span>
        </div>
        <span style={{fontSize:8,color:C.textDim,letterSpacing:"0.08em"}}>SECAGEM H2</span>
      </div>

      {/* Footer legenda */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"5px 12px",
        display:"flex",alignItems:"center",justifyContent:"flex-end",gap:10,
        background:"linear-gradient(to top,rgba(2,13,24,.88),transparent)",
        pointerEvents:"none",zIndex:5}}>
        {[{l:"OK",c:"#00E676"},{l:"ATENCAO",c:"#FFC107"},{l:"CRITICO",c:"#FF5252"}].map(({l,c})=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:3}}>
            <div style={{width:4,height:4,borderRadius:"50%",background:c,boxShadow:`0 0 4px ${c}`}}/>
            <span style={{fontSize:7,color:C.textDim,letterSpacing:"0.06em"}}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
