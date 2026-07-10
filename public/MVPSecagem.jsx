import { useState, useRef } from "react";
import * as React from "react";
import { EquipamentosTela, equipamentosComum, equipamentosM2, equipamentosM3, equipamentosCS_M2, equipamentosCS_M3, equipamentosEnf_M2, equipamentosEnf_M3 } from "./equipamentos";

// ─── Paleta Suzano Oficial ────────────────────────────────────────────────────
const C = {
  bg:           "#04111D",
  surface:      "#071828",
  card:         "#0A1929",
  cardHover:    "#0E2847",
  border:       "rgba(60,255,140,0.15)",
  borderLight:  "rgba(60,255,140,0.3)",
  accent:       "#00E676",
  accentHover:  "#52FF9C",
  accentDark:   "#006B2E",
  accentLight:  "#00E676",
  blue:         "#0E2847",
  blueLight:    "#1A5CCC",
  blueDark:     "#020C16",
  success:      "#00E676",
  successLight: "#52FF9C",
  warning:      "#b87d00",
  warningLight: "#FFC107",
  danger:       "#c0272d",
  dangerLight:  "#FF5252",
  text:         "#FFFFFF",
  textMuted:    "#B5C6DA",
  textDim:      "#3A5880",
  white:        "#ffffff",
  tagBg:        "rgba(10,25,45,0.9)",
  bgDeep:       "#03100A",
  cardGrad:     "linear-gradient(180deg, rgba(18,34,27,0.92), rgba(8,20,14,0.96))",
  cardBorder:   "rgba(0,230,118,0.14)",
  heroGrad:     "linear-gradient(150deg,#00C766,#00A555 55%,#00863f)",
  waveColor:    "#00E676",
};

// ─── Primitivos visuais (layout flutuante VÉRTICE) ──────────────────────────
const cardStyle = {
  position:"relative", borderRadius:20, overflow:"hidden", isolation:"isolate",
  background:"rgba(10,24,18,0.42)",
  backgroundImage:"linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 20%, transparent 44%),radial-gradient(120px 120px at 0% 0%, rgba(210,255,235,0.14), transparent 70%)",
  backdropFilter:"blur(22px) saturate(1.4)", WebkitBackdropFilter:"blur(22px) saturate(1.4)",
  border:"1px solid rgba(255,255,255,0.12)",
  boxShadow:"inset 0 1px 0 rgba(255,255,255,0.30),inset 0 0 30px rgba(255,255,255,0.03),0 10px 30px -10px rgba(0,0,0,0.7)",
};
const glassMini = {
  position:"relative", overflow:"hidden",
  background:"rgba(255,255,255,0.05)",
  backgroundImage:"linear-gradient(135deg, rgba(255,255,255,0.10), transparent 50%)",
  border:"1px solid rgba(255,255,255,0.08)",
  boxShadow:"inset 0 1px 0 rgba(255,255,255,0.14)",
};
function Waves() {
  return (
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:0,pointerEvents:"none",opacity:0.65}} preserveAspectRatio="none" viewBox="0 0 452 1400" aria-hidden="true">
      <defs><linearGradient id="vxwave" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#00E676" stopOpacity="0"/>
        <stop offset="0.5" stopColor="#00E676" stopOpacity="0.30"/>
        <stop offset="1" stopColor="#00F0FF" stopOpacity="0"/>
      </linearGradient></defs>
      <path d="M-40,180 C120,120 220,300 452,150" fill="none" stroke="url(#vxwave)" strokeWidth="2"/>
      <path d="M-40,240 C140,200 260,360 500,220" fill="none" stroke="url(#vxwave)" strokeWidth="1.4"/>
      <path d="M-40,560 C120,620 300,440 520,600" fill="none" stroke="url(#vxwave)" strokeWidth="2"/>
      <path d="M-40,620 C160,680 320,500 520,660" fill="none" stroke="url(#vxwave)" strokeWidth="1.4"/>
      <path d="M-40,980 C120,1040 300,860 520,1020" fill="none" stroke="url(#vxwave)" strokeWidth="2"/>
      <path d="M-40,1040 C160,1100 320,920 520,1080" fill="none" stroke="url(#vxwave)" strokeWidth="1.4"/>
    </svg>
  );
}
function Connector() {
  return (
    <div style={{display:"flex",justifyContent:"center",margin:"-2px 0"}}>
      <svg width="40" height="22" viewBox="0 0 40 22" style={{overflow:"visible"}} aria-hidden="true">
        <path d="M20,0 L20,22" stroke="#00E676" strokeWidth="1" strokeDasharray="2 3" opacity="0.5"/>
        <circle cx="20" cy="0" r="2" fill="#00E676"/>
        <circle cx="20" cy="22" r="2" fill="#00E676"/>
      </svg>
    </div>
  );
}
function SecTag({ t }) {
  return <span style={{fontFamily:"monospace",width:30,height:30,borderRadius:9,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:C.accentLight,background:"rgba(0,230,118,0.08)",border:"1px solid rgba(0,230,118,0.2)"}}>{t}</span>;
}


// ─── Checklists e Catálogo ──────────────────────────────────────────────────
const checklistM2 = [
  { id:"m2c1",  secao:"Pichasso", item:"Nível do tanque do Pichasso",                           ref:"—",             unit:"ok/ñok",  tipo:"ok_nok"  },
  { id:"m2c2",  secao:"Pichasso", item:"Funcionamento da bomba do Pichasso",                    ref:"—",             unit:"ok/ñok",  tipo:"ok_nok"  },
  { id:"m2c3",  secao:"Pichasso", item:"Posição Pichasso L.C — está sujando?",                  ref:"5 e 4",         unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c4",  secao:"Pichasso", item:"Posição Pichasso L.A — está sujando?",                  ref:"5,3 e 5,5",     unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c5",  secao:"Telas",    item:"Tela superior – tensão, marcas, desgaste, posic.",      ref:"7,5",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m2c6",  secao:"Telas",    item:"Chuveiro tela superior está oscilando?",                ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c7",  secao:"Telas",    item:"Tela inferior – tensão, marcas, desgaste, posic.",      ref:"7,0",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m2c8",  secao:"Telas",    item:"Chuveiro tela inferior está oscilando?",                ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c9",  secao:"Feltros",  item:"Feltro pickup – tensão, marcas, desgaste, posic.",      ref:"3,2",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m2c10", secao:"Feltros",  item:"Feltro pickup – chuveiro leque com bico entupido?",     ref:"2,5 bar",       unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c11", secao:"Feltros",  item:"Feltro pickup – chuveiro oscilante entupido?",          ref:"12,5 bar",      unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c12", secao:"Feltros",  item:"Feltro 2ª prensa – tensão, marcas, desgaste, posic.",   ref:"3,5",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m2c13", secao:"Feltros",  item:"Feltro 2ª prensa – chuveiro leque entupido?",           ref:"2,5 bar",       unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c14", secao:"Feltros",  item:"Feltro 2ª prensa – chuveiro oscilante entupido?",       ref:"12,5 bar",      unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c15", secao:"Feltros",  item:"Feltro 3ª prensa Sup – tensão, marcas, desgaste.",      ref:"—",             unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m2c16", secao:"Feltros",  item:"Feltro 3ª prensa Sup – chuveiro leque entupido?",       ref:"2,5 bar",       unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c17", secao:"Feltros",  item:"Feltro 3ª prensa Sup – chuveiro oscilante entupido?",   ref:"12,5 bar",      unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c18", secao:"Feltros",  item:"Feltro 3ª prensa Inf – tensão, marcas, desgaste.",      ref:"3,5",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m2c19", secao:"Feltros",  item:"Feltro 3ª prensa Inf – chuveiro leque entupido?",       ref:"2,5 bar",       unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c20", secao:"Feltros",  item:"Feltro 3ª prensa Inf – chuveiro oscilante entupido?",   ref:"12,5 bar",      unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c21", secao:"Prensas",  item:"Pressão WED ZONE – zonas 1 a 5",                        ref:"2/1,5/1/1,5/2", unit:"ok/ñok",  tipo:"ok_nok"  },
  { id:"m2c22", secao:"Prensas",  item:"Pressão régua vedação COUCH",                           ref:"0,85 e 0,5",    unit:"bar",     tipo:"valor"   },
  { id:"m2c23", secao:"Prensas",  item:"Pressão régua vedação PICK UP",                         ref:"0,75 e 0,75",   unit:"bar",     tipo:"valor"   },
  { id:"m2c24", secao:"Prensas",  item:"Vazão água rolo COUCH",                                 ref:"—",             unit:"m³/h",    tipo:"valor"   },
  { id:"m2c25", secao:"Prensas",  item:"Vazão água rolo PICK UP",                               ref:"—",             unit:"m³/h",    tipo:"valor"   },
  { id:"m2c26", secao:"Prensas",  item:"Pressão Lump Breaker",                                  ref:"25",            unit:"kN/m",    tipo:"valor"   },
  { id:"m2c27", secao:"Prensas",  item:"Pressão 1ª prensa",                                     ref:"55",            unit:"kN/m",    tipo:"valor"   },
  { id:"m2c28", secao:"Prensas",  item:"Pressão 2ª prensa",                                     ref:"151",           unit:"kN/m",    tipo:"valor"   },
  { id:"m2c29", secao:"Prensas",  item:"Pressão 3ª prensa",                                     ref:"1200",          unit:"kN/m",    tipo:"valor"   },
  { id:"m2c30", secao:"Rolos",    item:"Passe Rolo curvo após 2ª Prensa (32-21-0-10-45)",        ref:"1",             unit:"%",       tipo:"valor"   },
  { id:"m2c31", secao:"Rolos",    item:"Passe PRIME PRESS",                                     ref:"1,6",           unit:"%",       tipo:"valor"   },
  { id:"m2c32", secao:"Rolos",    item:"Passe Rolo curvo após 3ª Prensa (32-21-0-10-78)",        ref:"0,2",           unit:"%",       tipo:"valor"   },
  { id:"m2c33", secao:"Telas",    item:"Chuveiro leque tela superior entupido?",                ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c34", secao:"Telas",    item:"Chuveiro leque tela inferior entupido?",                ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c35", secao:"Feltros",  item:"Feltro pickup – chuveiro químico entupido?",            ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c36", secao:"Feltros",  item:"Feltro 2ª prensa – chuveiro químico entupido?",         ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c37", secao:"Feltros",  item:"Feltro 3ª prensa Sup – chuveiro químico entupido?",     ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m2c38", secao:"Feltros",  item:"Feltro 3ª prensa Inf – chuveiro químico entupido?",     ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
];
const checklistM3 = [
  { id:"m3c1",  secao:"Pichasso", item:"Nível do tanque do Pichasso",                           ref:"—",             unit:"ok/ñok",  tipo:"ok_nok"  },
  { id:"m3c2",  secao:"Pichasso", item:"Funcionamento da bomba do Pichasso",                    ref:"—",             unit:"ok/ñok",  tipo:"ok_nok"  },
  { id:"m3c3",  secao:"Pichasso", item:"Posição Pichasso L.C — está sujando?",                  ref:"5 e 4,9",       unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c4",  secao:"Pichasso", item:"Posição Pichasso L.A — está sujando?",                  ref:"5,1 e 6,5",     unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c5",  secao:"Telas",    item:"Tela superior – tensão, marcas, desgaste, posic.",      ref:"6,5",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m3c6",  secao:"Telas",    item:"Chuveiro tela superior está oscilando?",                ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c7",  secao:"Telas",    item:"Tela inferior – tensão, marcas, desgaste, posic.",      ref:"6,8",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m3c8",  secao:"Telas",    item:"Chuveiro tela inferior está oscilando?",                ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c9",  secao:"Feltros",  item:"Feltro pickup – tensão, marcas, desgaste, posic.",      ref:"3,8",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m3c10", secao:"Feltros",  item:"Feltro pickup – chuveiro leque com bico entupido?",     ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c11", secao:"Feltros",  item:"Feltro pickup – chuveiro oscilante entupido?",          ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c12", secao:"Feltros",  item:"Feltro 2ª prensa – tensão, marcas, desgaste, posic.",   ref:"3,6",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m3c13", secao:"Feltros",  item:"Feltro 2ª prensa – chuveiro leque entupido?",           ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c14", secao:"Feltros",  item:"Feltro 2ª prensa – chuveiro oscilante entupido?",       ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c15", secao:"Feltros",  item:"Feltro 3ª prensa Sup – tensão, marcas, desgaste.",      ref:"4,3",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m3c16", secao:"Feltros",  item:"Feltro 3ª prensa Sup – chuveiro leque entupido?",       ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c17", secao:"Feltros",  item:"Feltro 3ª prensa Sup – chuveiro oscilante entupido?",   ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c18", secao:"Feltros",  item:"Feltro 3ª prensa Inf – tensão, marcas, desgaste.",      ref:"4,7",           unit:"kN/m",    tipo:"ok_nok"  },
  { id:"m3c19", secao:"Feltros",  item:"Feltro 3ª prensa Inf – chuveiro leque entupido?",       ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c20", secao:"Feltros",  item:"Feltro 3ª prensa Inf – chuveiro oscilante entupido?",   ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c21", secao:"Prensas",  item:"Pressão WED ZONE – zonas 1 a 5",                        ref:"2/1,5/1/1,5/2", unit:"ok/ñok",  tipo:"ok_nok"  },
  { id:"m3c22", secao:"Prensas",  item:"Pressão régua vedação COUCH",                           ref:"0,9 e 0,7",     unit:"bar",     tipo:"valor"   },
  { id:"m3c23", secao:"Prensas",  item:"Pressão régua vedação PICK UP",                         ref:"0,75 e 0,7",    unit:"bar",     tipo:"valor"   },
  { id:"m3c24", secao:"Prensas",  item:"Vazão água rolo COUCH",                                 ref:"—",             unit:"m³/h",    tipo:"valor"   },
  { id:"m3c25", secao:"Prensas",  item:"Vazão água rolo PICK UP",                               ref:"—",             unit:"m³/h",    tipo:"valor"   },
  { id:"m3c26", secao:"Prensas",  item:"Pressão Lump Breaker",                                  ref:"25",            unit:"kN/m",    tipo:"valor"   },
  { id:"m3c27", secao:"Prensas",  item:"Pressão 1ª prensa",                                     ref:"55",            unit:"kN/m",    tipo:"valor"   },
  { id:"m3c28", secao:"Prensas",  item:"Pressão 2ª prensa",                                     ref:"150",           unit:"kN/m",    tipo:"valor"   },
  { id:"m3c29", secao:"Prensas",  item:"Pressão 3ª prensa",                                     ref:"1200",          unit:"kN/m",    tipo:"valor"   },
  { id:"m3c30", secao:"Rolos",    item:"Passe Rolo curvo após 2ª Prensa (33-21-0-10-45)",        ref:"1",             unit:"%",       tipo:"valor"   },
  { id:"m3c31", secao:"Rolos",    item:"Passe PRIME PRESS",                                     ref:"1,6",           unit:"%",       tipo:"valor"   },
  { id:"m3c32", secao:"Rolos",    item:"Passe Rolo curvo após 3ª Prensa (33-21-0-10-78)",        ref:"0,2",           unit:"%",       tipo:"valor"   },
  { id:"m3c33", secao:"Telas",    item:"Chuveiro leque tela superior entupido?",                ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c34", secao:"Telas",    item:"Chuveiro leque tela inferior entupido?",                ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c35", secao:"Feltros",  item:"Feltro pickup – chuveiro químico entupido?",            ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c36", secao:"Feltros",  item:"Feltro 2ª prensa – chuveiro químico entupido?",         ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c37", secao:"Feltros",  item:"Feltro 3ª prensa Sup – chuveiro químico entupido?",     ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
  { id:"m3c38", secao:"Feltros",  item:"Feltro 3ª prensa Inf – chuveiro químico entupido?",     ref:"—",             unit:"ok/ñok", tipo:"ok_nok" },
];

// ─── Check-list Passagem de Ponta (igual M2 e M3 — mesmo formulário) ─────────
const checklistPassagemPonta = [
  // ── Operação Parte Úmida ──────────────────────────────────────────────────
  { id:"pp01", secao:"P. Úmida",    item:"1ª checagem — movimento do pichasso — verificar corrente",          ref:"—",         unit:"ok/ñok",  tipo:"ok_nok" },
  { id:"pp02", secao:"P. Úmida",    item:"Verificar acúmulo de massa nas estruturas do pichasso e caixa de vapor", ref:"—",    unit:"ok/ñok",  tipo:"ok_nok" },
  { id:"pp03", secao:"P. Úmida",    item:"Velocidade da máquina",                                             ref:"150",       unit:"m/min",   tipo:"valor"  },
  { id:"pp04", secao:"P. Úmida",    item:"Ratio de ajuste da gramatura",                                      ref:"1,0000",    unit:"—",       tipo:"valor"  },
  { id:"pp05", secao:"P. Úmida",    item:"Relação de dosagem de quebras",                                     ref:"80%",       unit:"%",       tipo:"valor"  },
  { id:"pp06", secao:"P. Úmida",    item:"Relação de dosagem de massa da torre HD",                           ref:"20%",       unit:"%",       tipo:"valor"  },
  { id:"pp07", secao:"P. Úmida",    item:"Bombas de vácuo (MODO E1 LIGADAS)",                                 ref:"—",         unit:"ok/ñok",  tipo:"ok_nok" },
  { id:"pp08", secao:"P. Úmida",    item:"Fluxo de massa para caixa de entrada (consist. E1 - pop-up W4)",    ref:"±2950",     unit:"m³/h",    tipo:"valor"  },
  { id:"pp09", secao:"P. Úmida",    item:"Consistência tanque da máquina (consist. E1 - pop-up W4)",          ref:"3,30%",     unit:"%",       tipo:"valor"  },
  { id:"pp10", secao:"P. Úmida",    item:"Wedge Zone (FECHADA COM CARGA)",                                    ref:"—",         unit:"ok/ñok",  tipo:"ok_nok" },
  { id:"pp11", secao:"P. Úmida",    item:"Pressão do Lumpbreaker",                                            ref:"30",        unit:"kN/m",    tipo:"valor"  },
  { id:"pp12", secao:"P. Úmida",    item:"Pressão da 1ª prensa",                                              ref:"45",        unit:"kN/m",    tipo:"valor"  },
  { id:"pp13", secao:"P. Úmida",    item:"Pressão da 2ª prensa",                                              ref:"170",       unit:"kN/m",    tipo:"valor"  },
  { id:"pp14", secao:"P. Úmida",    item:"Folha acompanhando feltro pick up",                                 ref:"—",         unit:"sim/não", tipo:"sim_nao"},
  { id:"pp15", secao:"P. Úmida",    item:"Pressão da shoe press",                                             ref:"1150",      unit:"kN/m",    tipo:"valor"  },
  { id:"pp16", secao:"P. Úmida",    item:"Caixa de vapor (ABAIXADA e VAPOR LIGADO)",                          ref:"—",         unit:"ok/ñok",  tipo:"ok_nok" },
  { id:"pp17", secao:"P. Úmida",    item:"Ajuste do perfil de gramatura MODO PASSAGEM DE PONTA (SDCD)",       ref:"—",         unit:"ok/ñok",  tipo:"ok_nok" },
  { id:"pp18", secao:"P. Úmida",    item:"Válvula de recirculação da caixa de entrada ajustada para fase inicial", ref:"20%",  unit:"%",       tipo:"valor"  },
  { id:"pp19", secao:"P. Úmida",    item:"Chapinha fim de curso do pichasso móvel LA alinhada com pichasso fixo", ref:"—",     unit:"ok/ñok",  tipo:"ok_nok" },
];

// ─── Check-list Passagem de Ponta — Parte Seca/Cortadeira ────────────────────
// (Os itens abaixo foram movidos do checklist de Passagem de Ponta da P.Úmida)
const checklistPassagemPontaCS = [
  { id:"ppcs01", secao:"P. Seca", item:"Todas caixas sopradoras do secador (ABAIXADAS)",                    ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs02", secao:"P. Seca", item:"Setpoint do sensor Slack (MODO AUTO)",                              ref:"19%",  unit:"%",      tipo:"valor"  },
  { id:"ppcs03", secao:"P. Seca", item:"Setpoint do sensor Slack (INDICAÇÃO SEM FOLHA)",                    ref:"100%", unit:"%",      tipo:"valor"  },
  { id:"ppcs04", secao:"P. Seca", item:"Set point da célula de carga antes passagem de ponta",              ref:"280",  unit:"KN/m",   tipo:"valor"  },
  { id:"ppcs05", secao:"P. Seca", item:"Cabo de aço da fita de passagem de ponta folgado",                  ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs06", secao:"P. Seca", item:"Pressão do rolo de tração (MODO PASSAGEM DE PONTA)",                ref:"0,6",  unit:"KN/m",   tipo:"valor"  },
  { id:"ppcs07", secao:"P. Seca", item:"Rolo direcionador na posição central e testado",                    ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs08", secao:"P. Seca", item:"Posicionamento dos operadores nas passarelas do secador",           ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs09", secao:"P. Seca", item:"Verificado estrutura atrás do rolo tração — sem pedaços de celulose",ref:"—",   unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs10", secao:"P. Seca", item:"Controle de carga do tração em MODO PASSAGEM DE PONTA",             ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs11", secao:"P. Seca", item:"Cortadeira em operação",                                            ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs12", secao:"P. Seca", item:"Sistema de passagem ponta antes secador testado",                   ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs13", secao:"P. Seca", item:"Medição dos rolos retornos",                                        ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs14", secao:"P. Seca", item:"Todas as grades entre decks bem fixadas",                           ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs15", secao:"P. Seca", item:"Limpeza e inspeção do secador concluída",                           ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
  { id:"ppcs16", secao:"P. Seca", item:"Pulper seco ligado e testado",                                      ref:"—",    unit:"ok/ñok", tipo:"ok_nok" },
];

// ─── Check-list PP / Quebra de Máquina — Parte Úmida ─────────────────────────
const checklistQuebraMaquina = [
  // VERIFICAR TRAVAS ────────────────────────────────────────────────────────
  { id:"qm01", secao:"Verificar Travas", item:"Lumpbreaker",           ref:"—", unit:"ok/nok", tipo:"ok_nok", trava:true },
  { id:"qm02", secao:"Verificar Travas", item:"3ª Prensa Inferior",    ref:"—", unit:"ok/nok", tipo:"ok_nok", trava:true },
  { id:"qm03", secao:"Verificar Travas", item:"Caixa de Vapor",        ref:"—", unit:"ok/nok", tipo:"ok_nok", trava:true },
  // TESTES DE ATUAÇÃO ───────────────────────────────────────────────────────
  { id:"qm04", secao:"Testes de Atuação", item:"Apalpador Tela Superior",               ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm05", secao:"Testes de Atuação", item:"Apalpador Tela Inferior",               ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm06", secao:"Testes de Atuação", item:"Apalpador Feltro Pick Up",              ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm07", secao:"Testes de Atuação", item:"Apalpador Feltro 2ª Prensa",            ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm08", secao:"Testes de Atuação", item:"Apalpador Feltro 3ª Prensa Superior",   ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm09", secao:"Testes de Atuação", item:"Apalpador Feltro 3ª Prensa Inferior",   ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm10", secao:"Testes de Atuação", item:"Esticador Feltro Pick Up",              ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm11", secao:"Testes de Atuação", item:"Esticador Feltro 2ª Prensa",            ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm12", secao:"Testes de Atuação", item:"Esticador Feltro 3ª Prensa Superior",   ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm13", secao:"Testes de Atuação", item:"Esticador Feltro 3ª Prensa Inferior",   ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  // INSPEÇÕES ───────────────────────────────────────────────────────────────
  { id:"qm14", secao:"Inspeções", item:"Raspas dos Rolos",                  ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm15", secao:"Inspeções", item:"Emenda Feltro Pick Up",             ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm16", secao:"Inspeções", item:"Emenda Feltro 2ª Prensa",           ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm17", secao:"Inspeções", item:"Emenda Feltro 3ª Prensa Superior",  ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm18", secao:"Inspeções", item:"Emenda Feltro 3ª Prensa Inferior",  ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm19", secao:"Inspeções", item:"Manta Shoe Press",                  ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm20", secao:"Inspeções", item:"Caixa de Vapor",                    ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  // LIMPEZAS ────────────────────────────────────────────────────────────────
  { id:"qm21", secao:"Limpezas", item:"Chuveiros da Máquina",   ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm22", secao:"Limpezas", item:"Filtros dos Pichassos",  ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm23", secao:"Limpezas", item:"Bicos dos Pichassos",    ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm24", secao:"Limpezas", item:"Estruturas",             ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm25", secao:"Limpezas", item:"Calhas",                 ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  { id:"qm26", secao:"Limpezas", item:"Raspas",                 ref:"—", unit:"ok/nok", tipo:"ok_nok" },
  // MEDIÇÕES ────────────────────────────────────────────────────────────────
  { id:"qm27", secao:"Medições", item:"GAP Wedge Zone",
    ref:"4–5", unit:"mm", tipo:"valor",
    alertaMin:4, alertaMax:5,
    descMin:"Abaixo de 4 mm — fora da faixa",
    descMax:"Acima de 5 mm — fora da faixa" },
];

// ─── Ritmo das Máquinas — Consumo específico de Vapor (por máquina) ───────────
const RITMO_VAPOR_PROCESSO = [
  { id:"rvp1", item:"Verificar relação entre pH branqueamento x secagem — se houver diferença considerável, verificar instrumentos (secagem e branqueamento) e ajustar set point conforme necessidade.", acao:"Verificar instrumentos e ajustar set point." },
  { id:"rvp2", item:"Verificar comportamento (trend) do pH branqueamento — se permanece estável ou com variações; se estiver instável, acionar operador de branqueamento e solicitar ação.", acao:"Acionar operador de branqueamento e solicitar ação." },
  { id:"rvp3", item:"Verificar pH da água e do produto final — se houver recurso para reduzir, alinhar com a coordenação de fábrica e realizar ajuste para baixar resultado do produto final.", acao:"Alinhar com coordenação e ajustar produto final." },
  { id:"rvp4", item:"Verificar possibilidade de alimentar pelo meio da torre HD (H2).", acao:"Avaliar e alimentar pela torre HD se possível." },
  { id:"rvp5", item:"Verificar rampa de vácuo da mesa e ajustar caso esteja fora do padrão (rampa crescente).", acao:"Ajustar rampa de vácuo para padrão crescente." },
];
const RITMO_VAPOR_EQUIPAMENTOS = [
  { id:"rve1", item:"Verificar tela da lateral por onde é captado o ar do prédio — caso esteja sujo, realizar limpeza.", acao:"Realizar limpeza da tela lateral." },
  { id:"rve2", item:"Verificar as telas dos secadores — caso esteja suja, realizar limpeza (operação ou limpidez).", acao:"Realizar limpeza das telas dos secadores." },
  { id:"rve3", item:"Verificar pressão de vapor para secador — se estiver baixa, alinhar com coordenação de fábrica se há possibilidade de aumentar.", acao:"Alinhar com coordenação para aumentar pressão." },
  { id:"rve4", item:"Verificar se a pressão de vapor para secador permanece estável — caso não, ligar para operador do turbo gerador e verificar como normalizar.", acao:"Acionar operador do turbo gerador." },
  { id:"rve5", item:"Verificar medidor de pressão interna do secador — pode estar indicando valor errado e balanço de ar estar operando desregulado — acionar instrumentação e checar.", acao:"Acionar instrumentação e checar medidor." },
  { id:"rve6", item:"Verificar se há portas abertas no secador — fechar todas caso haja.", acao:"Fechar todas as portas do secador." },
  { id:"rve7", item:"Verificar as correias dos ventiladores exaustão e suprimento (se caiu alguma, se está patinando) — caso haja algum desses problemas, mapear e/ou passar antiderrapante nas correias.", acao:"Mapear/passar antiderrapante nas correias." },
  { id:"rve8", item:"Conferir aberturas das válvulas de controle de vapor p/ secador entre SDCD e campo.", acao:"Conferir aberturas SDCD x campo." },
];

// ─── WFT — dados do fluxo de diagnóstico (H2 = M2 + M3, meta 315 m³/h) ───────
// Estrutura: cada "passo" tem uma pergunta ou verificação com ação associada
const WFT_META_H2 = 315; // m³/h

const WFT_VERIFICACOES_SEM_REJEICAO = [
  { id:"wv1",  item:"Existe algum tanque transbordando?",                                     acao:"Verificar no SDCD e em campo — se houver, avaliar problema e corrigir." },
  { id:"wv2",  item:"Existe algum dreno aberto?",                                             acao:"Verificar todos os tanques e fechar caso haja dreno aberto." },
  { id:"wv3",  item:"Pressão dos chuveiros de baixa pressão estão em 2,5 bar?",               acao:"Caso esteja com pressão elevada, ajustar imediatamente." },
  { id:"wv4",  item:"Pressão do chuveiro de alta está maior que 13 bar?",                     acao:"Caso esteja, realizar ajuste imediatamente." },
  { id:"wv5",  item:"Válvula manual de WBR do tanque água morna para trocador ar/água aberta?",acao:"Verificar em campo e ajustar e voltar para posição." },
  { id:"wv6",  item:"Há mangueiras abertas nas laterais da máquina?",                         acao:"Verificar em campo — priorizar fechamento caso não seja crítico por acúmulo de massa." },
  { id:"wv7",  item:"Há mangueiras de limpeza abertas na área para limpeza do piso?",         acao:"Verificar em campo e fechar imediatamente caso já não seja mais necessária para limpeza." },
  { id:"wv8",  item:"Mangueiras de campo com água morna e não de WFT?",                       acao:"Verificar em campo e fechar imediatamente." },
  { id:"wv9",  item:"Pressão do chuveiro de alta e baixa está maior que 2,5 bar / 13 bar?",   acao:"Caso esteja, realizar a limpeza imediatamente." },
  { id:"wv10", item:"Peneira micra screen está suja?",                                         acao:"Pressão do chuveiro de limpeza está maior que 2,5 bar — realizar ajuste imediatamente." },
];

// ─── Catálogo de tipos de Check-list ─────────────────────────────────────────

// ─── Equipamentos Cortadeira/Secador — M2 ─────────────────────────────────
const checklistCortadeiraM2 = [
  // SECADOR ──────────────────────────────────────────────────────────────────
  { id:"cs2_01", secao:"Secador",    item:"Célula de carga",
    ref:"310", unit:"N/m", tipo:"valor_stepper", step:1,
    faixas:[{min:300,max:315,cor:"green"},{min:280,max:300,cor:"yellow"},{min:315,max:320,cor:"yellow"}],
    alertaWarn:280, descWarn:"Valor de Passagem de Ponta — lembrar de voltar para 310 N/m" },
  { id:"cs2_02", secao:"Secador",    item:"Trocador de Calor 1",
    ref:"< 100", unit:"mbar", tipo:"valor_stepper", step:1,
    faixas:[{max:100,cor:"green"},{min:100,cor:"red"}],
    alertaMax:100,descMax:"Trocador Sujo — verificar imediatamente", alertaTrocador:true },
  { id:"cs2_03", secao:"Secador",    item:"Trocador de Calor 2",
    ref:"< 100", unit:"mbar", tipo:"valor_stepper", step:1,
    faixas:[{max:100,cor:"green"},{min:100,cor:"red"}],
    alertaMax:100,descMax:"Trocador Sujo — verificar imediatamente", alertaTrocador:true },
  { id:"cs2_04", secao:"Secador",    item:"Rolo Marginador",
    ref:"0,35", unit:"—", tipo:"valor_stepper", step:0.01,
    alertaExato:"0,35", descExato:"Padrão fixo — NOK se diferente de 0,35" },
  { id:"cs2_05", secao:"Secador",    item:"Acúmulo de Fibras",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_06", secao:"Secador",    item:"Extrator de Folhas (Entrada/Saída)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_07", secao:"Secador",    item:"Água Sucção BBA Pichasso",
    ref:"≥ 0,35", unit:"bar", tipo:"valor_stepper", step:0.01,
    faixas:[{min:0.35,cor:"green"},{max:0.35,cor:"red"}],
    alertaMin:0.35, descMin:"CRÍTICO — abaixo do mínimo permitido (0,35 bar)" },
  // CORTADEIRA ───────────────────────────────────────────────────────────────
  { id:"cs2_08", secao:"Cortadeira", item:"QCS (Gramatura/Teor Seco) Controle LIGADO",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_09", secao:"Cortadeira", item:"Verificar Controle de Peso (Contagem ou Peso)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_10", secao:"Cortadeira", item:"Peso Layboy",
    ref:"F:2959 / C:2600", unit:"kg", tipo:"duplo_valor" },
  { id:"cs2_11", secao:"Cortadeira", item:"Velocidade",
    ref:"≥150", unit:"m/min", tipo:"valor_stepper", step:1, velMin:150,
    faixas:[{min:150,cor:"green"},{max:150,cor:"red"}] },
  { id:"cs2_12", secao:"Cortadeira", item:"Passe Faca Circulares",
    ref:"F:5 / C:5",    unit:"%",      tipo:"duplo_valor" },
  { id:"cs2_13", secao:"Cortadeira", item:"Rolo Medidor",
    ref:"0,35", unit:"%", tipo:"valor_stepper", step:0.1,
    alertaExato:"0,35", descExato:"Padrão fixo — NOK se diferente de 0,35%" },
  { id:"cs2_14", secao:"Cortadeira", item:"Pinch Roll",
    ref:"F:0,3",     unit:"N/mm",   tipo:"duplo_valor" },
  { id:"cs2_15", secao:"Cortadeira", item:"Rolos de Tração",
    ref:"F:10 / C:10",    unit:"%",      tipo:"duplo_valor" },
  { id:"cs2_16", secao:"Cortadeira", item:"Faca Voadora Capa",
    ref:"3,8",       unit:"%",      tipo:"valor",
    alertaExato:"3,8",  descExato:"Padrão fixo — NOK se diferente de 3,8%" },
  { id:"cs2_17", secao:"Cortadeira", item:"Faca Voadora Fardo",
    ref:"0,7",       unit:"%",      tipo:"valor",
    alertaExato:"0,7",  descExato:"Padrão fixo — NOK se diferente de 0,7%" },
  { id:"cs2_18", secao:"Cortadeira", item:"Sobreposição",
    ref:"F:15 / C:15", unit:"%",      tipo:"duplo_valor" },
  { id:"cs2_19", secao:"Cortadeira", item:"Kickout",
    ref:"F:6 / C:8",      unit:"%",      tipo:"duplo_valor" },
  { id:"cs2_20", secao:"Cortadeira", item:"Nível Reservatório UH",
    ref:"> 86", unit:"%", tipo:"valor_stepper", step:1,
    alertaMin:87, descMin:"ALERTA — nível igual ou abaixo de 86% (mínimo de segurança)" },
  { id:"cs2_21", secao:"Cortadeira", item:"Temperatura Óleo UH",
    ref:"28", unit:"°C", tipo:"valor_stepper", step:1 },
  { id:"cs2_22", secao:"Cortadeira", item:"Pressão Sistema Hidráulico",
    ref:"82", unit:"bar", tipo:"valor_stepper", step:1 },
  { id:"cs2_23", secao:"Cortadeira", item:"Vazamentos/Limpeza (Hid./Lubrif./Pneum.)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_24", secao:"Cortadeira", item:"Qualidade Corte (Facão/Faquinhas)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_25", secao:"Cortadeira", item:"Caixas Formação (Alinhamento/Fixação)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_26", secao:"Cortadeira", item:"Garfos (Funcionamento/Guias/Alinhamento)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  // LAYBOY ───────────────────────────────────────────────────────────────────
  { id:"cs2_27", secao:"Layboy",     item:"Pegar Folhas",
    ref:"395", unit:"mm", tipo:"valor_stepper", step:1 },
  { id:"cs2_28", secao:"Layboy",     item:"Mesa Garfo (Espera)",
    ref:"495", unit:"mm", tipo:"valor_stepper", step:1 },
  { id:"cs2_29", secao:"Layboy",     item:"Mesa Garfo (Tomada)",
    ref:"330", unit:"mm", tipo:"valor_stepper", step:1 },
  { id:"cs2_30", secao:"Layboy",     item:"Acúmulo de Folhas",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  // FAQUINHAS — 11 facas ─────────────────────────────────────────────────────
  // Faixas: 1,5–2,5 = Normal 🟢 | 2,5–3,5 = Atenção 🟡 | 3,5–4,0 = Crítico 🔴
  { id:"cs2_31", secao:"Faquinhas",  item:"Pressão das Faquinhas (1 a 11)",
    ref:"1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5", unit:"bar", tipo:"faquinhas",
    refs:["1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5"],
    faixas:[[1.5,2.5,"Normal","green"],[2.5,3.5,"Atenção","yellow"],[3.5,4.0,"Crítico","red"]] },
  { id:"cs2_34", secao:"Faquinhas",  item:"Criticidade do Corte do Facão por Fardo (1 a 12)",
    ref:"OK", unit:"nível", tipo:"facao_fardos", fardos:12 },
  // EXTRA ────────────────────────────────────────────────────────────────────
  { id:"cs2_32", secao:"Extra",      item:"Atuadores reparados disponíveis na área",
    ref:"—",         unit:"qtde",   tipo:"valor" },
  { id:"cs2_33", secao:"Extra",      item:"Produto Limpa Lente",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
];

// ─── Check-list Cortadeira/Secador — M3 ──────────────────────────────────────
const checklistCortadeiraM3 = [
  // SECADOR ──────────────────────────────────────────────────────────────────
  { id:"cs3_01", secao:"Secador",    item:"Célula de carga",
    ref:"310", unit:"N/m", tipo:"valor_stepper", step:1,
    faixas:[{min:300,max:315,cor:"green"},{min:280,max:300,cor:"yellow"},{min:315,max:320,cor:"yellow"}],
    alertaWarn:280, descWarn:"Valor de Passagem de Ponta — lembrar de voltar para 310 N/m" },
  { id:"cs3_02", secao:"Secador",    item:"Trocador de Calor 1",
    ref:"< 100", unit:"mbar", tipo:"valor_stepper", step:1,
    faixas:[{max:100,cor:"green"},{min:100,cor:"red"}],
    alertaMax:100,descMax:"Trocador Sujo — verificar imediatamente", alertaTrocador:true },
  { id:"cs3_03", secao:"Secador",    item:"Trocador de Calor 2",
    ref:"< 100", unit:"mbar", tipo:"valor_stepper", step:1,
    faixas:[{max:100,cor:"green"},{min:100,cor:"red"}],
    alertaMax:100,descMax:"Trocador Sujo — verificar imediatamente", alertaTrocador:true },
  { id:"cs3_04", secao:"Secador",    item:"Rolo Marginador",
    ref:"0,35", unit:"—", tipo:"valor_stepper", step:0.01,
    alertaExato:"0,35", descExato:"Padrão fixo — NOK se diferente de 0,35" },
  { id:"cs3_05", secao:"Secador",    item:"Acúmulo de Fibras",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_06", secao:"Secador",    item:"Extrator de Folhas (Entrada/Saída)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_07", secao:"Secador",    item:"Água Sucção BBA Pichasso",
    ref:"≥ 0,35", unit:"bar", tipo:"valor_stepper", step:0.01,
    faixas:[{min:0.35,cor:"green"},{max:0.35,cor:"red"}],
    alertaMin:0.35, descMin:"CRÍTICO — abaixo do mínimo permitido (0,35 bar)" },
  // CORTADEIRA ───────────────────────────────────────────────────────────────
  { id:"cs3_08", secao:"Cortadeira", item:"QCS (Gramatura/Teor Seco) Controle LIGADO",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_09", secao:"Cortadeira", item:"Verificar Controle de Peso (Contagem ou Peso)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_10", secao:"Cortadeira", item:"Peso Layboy",
    ref:"F:2898 / C:2800", unit:"kg", tipo:"duplo_valor" },
  { id:"cs3_11", secao:"Cortadeira", item:"Velocidade",
    ref:"≥150", unit:"m/min", tipo:"valor_stepper", step:1, velMin:150,
    faixas:[{min:150,cor:"green"},{max:150,cor:"red"}] },
  { id:"cs3_12", secao:"Cortadeira", item:"Passe Faca Circulares",
    ref:"F:5 / C:5",    unit:"%",      tipo:"duplo_valor" },
  { id:"cs3_13", secao:"Cortadeira", item:"Rolo Medidor",
    ref:"0,35", unit:"%", tipo:"valor_stepper", step:0.1,
    alertaExato:"0,35", descExato:"Padrão fixo — NOK se diferente de 0,35%" },
  { id:"cs3_14", secao:"Cortadeira", item:"Pinch Roll",
    ref:"F:0,2 / C:0,00", unit:"kN/m",  tipo:"duplo_valor" },
  { id:"cs3_15", secao:"Cortadeira", item:"Rolos de Tração",
    ref:"F:11 / C:10",    unit:"%",      tipo:"duplo_valor" },
  { id:"cs3_16", secao:"Cortadeira", item:"Faca Voadora Capa",
    ref:"3,8",       unit:"%",      tipo:"valor",
    alertaExato:"3,8",  descExato:"Padrão fixo — NOK se diferente de 3,8%" },
  { id:"cs3_17", secao:"Cortadeira", item:"Faca Voadora Fardo",
    ref:"0,7",       unit:"%",      tipo:"valor",
    alertaExato:"0,7",  descExato:"Padrão fixo — NOK se diferente de 0,7%" },
  { id:"cs3_18", secao:"Cortadeira", item:"Sobreposição",
    ref:"F:17 / C:17", unit:"%",      tipo:"duplo_valor" },
  { id:"cs3_19", secao:"Cortadeira", item:"Kickout",
    ref:"F:8 / C:5",      unit:"%",      tipo:"duplo_valor" },
  { id:"cs3_20", secao:"Cortadeira", item:"Nível Reservatório UH",
    ref:"> 86", unit:"%", tipo:"valor_stepper", step:1,
    alertaMin:87, descMin:"ALERTA — nível igual ou abaixo de 86% (mínimo de segurança)" },
  { id:"cs3_21", secao:"Cortadeira", item:"Temperatura Óleo UH",
    ref:"28", unit:"°C", tipo:"valor_stepper", step:1 },
  { id:"cs3_22", secao:"Cortadeira", item:"Pressão Sistema Hidráulica",
    ref:"82", unit:"bar", tipo:"valor_stepper", step:1 },
  { id:"cs3_23", secao:"Cortadeira", item:"Vazamentos/Limpeza (Hid./Lubrif./Pneum.)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_24", secao:"Cortadeira", item:"Qualidade Corte (Facão/Faquinhas)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_25", secao:"Cortadeira", item:"Caixas Formação (Alinhamento/Fixação)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_26", secao:"Cortadeira", item:"Garfos (Funcionamento/Guias/Alinhamento)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  // LAYBOY ───────────────────────────────────────────────────────────────────
  { id:"cs3_27", secao:"Layboy",     item:"Pegar Folhas",
    ref:"395", unit:"mm", tipo:"valor_stepper", step:1 },
  { id:"cs3_28", secao:"Layboy",     item:"Mesa Garfo (Espera)",
    ref:"450", unit:"mm", tipo:"valor_stepper", step:1 },
  { id:"cs3_29", secao:"Layboy",     item:"Mesa Garfo (Tomada)",
    ref:"330", unit:"mm", tipo:"valor_stepper", step:1 },
  { id:"cs3_30", secao:"Layboy",     item:"Acúmulo de Folhas",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  // FAQUINHAS — 11 facas ─────────────────────────────────────────────────────
  { id:"cs3_31", secao:"Faquinhas",  item:"Pressão das Faquinhas (1 a 11)",
    ref:"1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5", unit:"bar", tipo:"faquinhas",
    refs:["1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5"],
    faixas:[[1.5,2.5,"Normal","green"],[2.5,3.5,"Atenção","yellow"],[3.5,4.0,"Crítico","red"]] },
  { id:"cs3_34", secao:"Faquinhas",  item:"Criticidade do Corte do Facão por Fardo (1 a 12)",
    ref:"OK", unit:"nível", tipo:"facao_fardos", fardos:12 },
  // EXTRA ────────────────────────────────────────────────────────────────────
  { id:"cs3_32", secao:"Extra",      item:"Atuadores reparados disponíveis na área",
    ref:"—",         unit:"qtde",   tipo:"valor" },
  { id:"cs3_33", secao:"Extra",      item:"Produto Limpa Lente",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
];


// ─── Check-list Enfardamento — Qualidade (itens 8–14) ────────────────────────
const checklistEnfardamento = [
  { id:"enf_08", secao:"Qualidade", item:"Fardo está com marca de corrente?",
    ref:"Não", unit:"", tipo:"opcoes",
    instrucao:"Verificar na mesa giro 1 — Pare a mesa com fardo levantado. Abaixe e verifique visualmente sem adentrar a grade de proteção.",
    opcoes:["Não","Um pouco","Sim - Parar a linha e verificar"],
    alertOpcoes:["Sim - Parar a linha e verificar","Um pouco"] },
  { id:"enf_09", secao:"Qualidade", item:"Como está a tensão dos arames do fardo (2,18 mm)?",
    ref:"Tensionado", unit:"", tipo:"opcoes",
    opcoes:["Está tensionado","Está folgado"], alertOpcoes:["Está folgado"] },
  { id:"enf_10", secao:"Qualidade", item:"Como está a qualidade de impressão (logo/código de barras) no fardo?",
    ref:"Bom", unit:"", tipo:"opcoes",
    opcoes:["Bom","Regular","Ruim - Ação: Realizar ajuste/instrumentação"],
    alertOpcoes:["Ruim - Ação: Realizar ajuste/instrumentação","Regular"] },
  { id:"enf_11", secao:"Qualidade", item:"O arame 3mm está distante 15cm do arame 2,18mm?",
    ref:"Sim", unit:"", tipo:"opcoes",
    opcoes:["Sim","Não? Realizei o ajuste"], alertOpcoes:[] },
  { id:"enf_12", secao:"Qualidade", item:"A unit está com marca de corrente na parte inferior?",
    ref:"Não", unit:"", tipo:"opcoes",
    opcoes:["Não","Um pouco","Sim - Parar linha e verificar"],
    alertOpcoes:["Sim - Parar linha e verificar","Um pouco"] },
  { id:"enf_14", secao:"Altura Unit", item:"Qual a altura da Unit (metros) [H2]? [Medir com régua]",
    ref:"1,90 m - Target", unit:"m", tipo:"opcoes",
    opcoes:["1,85 m","1,86 m","1,87 m","1,88 m - Dentro da tolerância","1,89 m - Dentro da tolerância","1,90 m - Target","1,91 m - Dentro da tolerância","1,92 m - Dentro da tolerância","1,93 m","1,94 m"],
    alertOpcoes:["1,85 m","1,86 m","1,87 m","1,93 m","1,94 m"] },
];

// ─── Check-list Rota Enfardamento ────────────────────────────────────────────
const checklistRotaEnfardamento = [
  {id:"re01",secao:"Balança",           item:"Balança zerada e calibrada",            ref:"—",   unit:"sim/não",tipo:"sim_nao"},
  {id:"re02",secao:"Mesas Giratórias",  item:"Entregando fardo bem alinhado",         ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re03",secao:"Prensa",            item:"Temperatura UH Prensa",                 ref:"<55", unit:"°C",     tipo:"temp"},
  {id:"re04",secao:"Prensa",            item:"Nível reservatório UH",                 ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re05",secao:"Prensa",            item:"Esteira em bom estado",                 ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re06",secao:"Prensa",            item:"Bombas operando normalmente",            ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re07",secao:"Alinhador",         item:"Hastes em perfeito estado",             ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re08",secao:"Alinhador",         item:"Alinhando corretamente",                ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re09",secao:"Encapadeira",       item:"Offset correto",                        ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re10",secao:"Encapadeira",       item:"Status geral",                          ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re11",secao:"Encapadeira",       item:"Vazamentos",                            ref:"Não", unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re12",secao:"Amarradeira",       item:"Reservatório de óleo",                  ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re13",secao:"Amarradeira",       item:"Rodando sem trava",                     ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re14",secao:"Amarradeira",       item:"Travas das caloiras travadas",          ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re15",secao:"Amarradeira",       item:"Limpeza cabeçote de torção realizada",  ref:"—",   unit:"sim/não",tipo:"sim_nao"},
  {id:"re16",secao:"Dobradeira",        item:"Molas em ok",                           ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re17",secao:"Dobradeira",        item:"Sem vazamento de ar",                   ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re18",secao:"Dobradeira",        item:"Dobragem adequada",                     ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re19",secao:"Impressora",        item:"Qualidade de impressão do logo",        ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re20",secao:"Impressora",        item:"Código de barras legível",              ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re21",secao:"Impressora",        item:"Data de produção correta",              ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re22",secao:"Impressora",        item:"Arame não está sobre a impressão",      ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re23",secao:"Impressora",        item:"Tinta reserva disponível (mín. 1)",     ref:"Sim", unit:"sim/não",tipo:"sim_nao"},
  {id:"re24",secao:"Empilhador",        item:"Status geral",                          ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re25",secao:"Unitizadora",       item:"Reservatório de óleo",                  ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re26",secao:"Unitizadora",       item:"Temperatura UH Unitizadora",            ref:"<55", unit:"°C",     tipo:"temp"},
  {id:"re27",secao:"Unitizadora",       item:"Rodando sem trava",                     ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re28",secao:"Unitizadora",       item:"Travas das caloiras travadas",          ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true},
  {id:"re29",secao:"Unitizadora",       item:"Limpeza cabeçote de torção realizada",  ref:"—",   unit:"sim/não",tipo:"sim_nao"},
  {id:"re30",secao:"Transp. de Unit",   item:"Transportadores operando normalmente",  ref:"—",   unit:"ok/nok", tipo:"ok_nok",nokObs:true,nokGrav:true},
];

const LINHAS = [
  { id:"L4", label:"Linha 4", maquina:"M2" },
  { id:"L5", label:"Linha 5", maquina:"M2" },
  { id:"L6", label:"Linha 6", maquina:"M3" },
  { id:"L7", label:"Linha 7", maquina:"M3" },
  { id:"L8", label:"Linha 8", maquina:"M3" },
];

// ─── Check-list Rotina H2 — Amarradeiras / Unitizadora (por linha) ───────────
const checklistRotinaH2 = [
  { id:"rh2_01", item:"Realizar limpeza do cabeçote - 1ª Amarradeira" },
  { id:"rh2_02", item:"Completar óleo da 1ª Amarradeira" },
  { id:"rh2_03", item:"Realizar limpeza do cabeçote - 2ª Amarradeira" },
  { id:"rh2_04", item:"Completar óleo da 2ª Amarradeira" },
  { id:"rh2_05", item:"Testar Translado - Carro móvel da Unit" },
  { id:"rh2_06", item:"Realizar limpeza do cabeçote da Unitizadora" },
  { id:"rh2_07", item:"Completar óleo da Unitizadora" },
];

const AREAS = [
  { id:"pu",  label:"Parte Úmida",           icon:"", desc:"Formação, prensas, feltros, vácuo"      },
  { id:"cs",  label:"Parte Seca/Cortadeira", icon:"", desc:"Secador, cortadeira, layboy, faquinhas" },
  { id:"enf", label:"Enfardamento",           icon:"", desc:"Enfardamento L4/L5 e L6/L7/L8"         },
];

const CATALOGO = [
  { id:"rotina",           label:"Rotina",              icon:"", desc:"Verificação por turno — Parte Úmida",                  porMaquina:true,  tipo:"padrao",   area:"pu",  getItems:(m)=>m==="M2"?checklistM2:checklistM3 },
  { id:"passagem_ponta",   label:"Passagem de Ponta",   icon:"", desc:"Check-list M2 e M3 — antes da passagem",               porMaquina:true,  tipo:"padrao",   area:"pu",  passagem:true, getItems:()=>checklistPassagemPonta },
  { id:"quebra_pu",        label:"PP / Quebra de Máq.", icon:"", desc:"Segurança, testes, inspeções e limpezas pós-quebra",    porMaquina:true,  tipo:"padrao",   area:"pu",  getItems:()=>checklistQuebraMaquina },
  { id:"wft",              label:"Consumo WFT",         icon:"", desc:"Diagnóstico de consumo de água — Meta H2: 315 m³/h",   porMaquina:false, tipo:"wft",      area:"pu",  getItems:()=>[] },
  { id:"ritmo_vapor",      label:"Consumo de Vapor",    icon:"", desc:"Ritmo das Máquinas — Processo + Equipamentos",       porMaquina:true,  tipo:"ritmo_vapor", area:"pu", getItems:()=>[] },
  { id:"cortadeira",       label:"Rotina",              icon:"", desc:"Check-list operacional — Secador + Cortadeira + Layboy",porMaquina:true,  tipo:"padrao",   area:"cs",  getItems:(m)=>m==="M2"?checklistCortadeiraM2:checklistCortadeiraM3 },
  { id:"passagem_ponta_cs",label:"Passagem de Ponta",   icon:"", desc:"Check-list Parte Seca — antes da passagem de ponta",   porMaquina:true,  tipo:"padrao",   area:"cs",  passagem:true, getItems:()=>checklistPassagemPontaCS },
  { id:"rejeicao",         label:"Diagnóstico Rejeição",icon:"⚠️",desc:"Fluxo de diagnóstico — Faca circular / Facão / Transversal",porMaquina:false,tipo:"rejeicao",area:"cs",getItems:()=>[] },
  { id:"enf_qualidade",    label:"Check List Qualidade",icon:"", desc:"Qualidade do fardo — todas as linhas",                 porMaquina:false, tipo:"enf",      area:"enf", getItems:()=>checklistEnfardamento },
  { id:"rota_enf",         label:"Rota Enfardamento",   icon:"", desc:"Inspeção por turno — todos os equipamentos",           porMaquina:true,  tipo:"rota_enf", area:"enf", getItems:()=>checklistRotaEnfardamento },
  { id:"rotina_h2",        label:"Check List Rotina H2",icon:"", desc:"Amarradeiras e Unitizadora — 00h/08h/16h — L4 a L8",   porMaquina:false, tipo:"rotina_h2",area:"enf", getItems:()=>checklistRotinaH2 },
  { id:"barcode_enf",      label:"Validação de Fardos", icon:"📦", desc:"Leitura de código de barras — Lado A / Lado B",        porMaquina:false, tipo:"barcode_enf",area:"enf", getItems:()=>[] },
  { id:"avaria_enf",       label:"Inspecao de Avarias", icon:"", desc:"Registro de avarias por unit — capa, arame, impressao", porMaquina:false, tipo:"avaria_enf", area:"enf", getItems:()=>[] },
];



// ─── Storage helpers (Firestore + localStorage offline-safe) ──────────────────
import { COL, doc, setDoc, getDoc, onSnapshot, deleteDoc } from "./firebase";
import { TelaAuth, usePerfilAtivo, FUNCOES, validarPin } from "./auth";
import { PainelAdmin } from "./admin";
import { CleanersTela, RelatorioCleaners, CLEANERS_TOTAL } from "./cleaners";
import { ChuveirosTela, eficienciaMes, sugestaoTurno, IconeChuveiro, corChuveiro, ModalRegistroChuveiro, estatisticasChuveiros } from "./chuveiros";
import { BarcodeModal } from "./barcode";
import { AvariasTela, AvariasAnalytics } from "./avarias";
import { MuralOportunidades } from "./pendencias";
// Dashboard TV carregado de forma tolerante: se o arquivo ainda não existir no
// repo, o app NÃO quebra — o modo dashboard apenas fica indisponível até subir.
const DashboardTV = React.lazy(() =>
  import("./Dashboard").catch(() => ({
    default: ({ setModoVisao }) => (
      <div style={{background:"#04111D",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,color:"#B5C6DA",fontFamily:"'Segoe UI',system-ui,sans-serif",padding:24,textAlign:"center"}}>
        <div style={{fontSize:40}}>🖥️</div>
        <div style={{color:"#fff",fontWeight:800,fontSize:16}}>Dashboard ainda não publicado</div>
        <div style={{fontSize:13,maxWidth:340,lineHeight:1.5}}>O arquivo Dashboard.jsx precisa ser enviado ao repositório. Assim que subir, este modo passa a funcionar.</div>
        <button onClick={()=>setModoVisao("app")} style={{background:"rgba(80,144,255,0.12)",border:"1px solid #1A5CCC55",color:"#1A5CCC",borderRadius:9,padding:"10px 18px",cursor:"pointer",fontSize:13,fontWeight:800}}>← Voltar ao App</button>
      </div>
    ),
  }))
);

// Leitura imediata do aparelho (não trava a tela esperando a nuvem)
const storageGet = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };

// Grava no aparelho na hora e envia para a nuvem (sobe sozinho quando online)
const storageSet = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  try { setDoc(doc(COL, key), { val, ts: Date.now() }); } catch {}
};

// Puxa a versão da nuvem (use ao abrir o app, p/ trazer dados de outro aparelho)
const cloudGet = async (key) => {
  try {
    const snap = await getDoc(doc(COL, key));
    if (snap.exists()) {
      const data = snap.data().val;
      try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
      return data;
    }
  } catch {}
  return storageGet(key);
};


// --- Desidrata/reidrata fotos: salva fotos em doc separado fotos_<id> ---
// Mantem historico_h2 leve (abaixo do limite de 1MB do Firestore).
const ehFotoBase64 = (s) => typeof s==="string" && s.startsWith("data:image");

// Extrai todas as fotos de um registro, substituindo por marcadores. Retorna {fotos, limpo}.
const extrairFotos = (registro) => {
  const fotos = {};
  let contador = 0;
  const subst = (arr) => arr.map((src)=>{
    if(ehFotoBase64(src)){ const ref="f"+(contador++); fotos[ref]=src; return "@@"+ref; }
    return src;
  });
  const limpo = JSON.parse(JSON.stringify(registro));
  if(Array.isArray(limpo.items)) limpo.items.forEach(it=>{ if(Array.isArray(it.fotos)) it.fotos=subst(it.fotos); });
  if(limpo.unit&&Array.isArray(limpo.unit.foto)) limpo.unit.foto=subst(limpo.unit.foto);
  if(Array.isArray(limpo.fotos)) limpo.fotos=subst(limpo.fotos);
  if(limpo.fotos&&typeof limpo.fotos==="object"&&!Array.isArray(limpo.fotos)){
    Object.keys(limpo.fotos).forEach(k=>{ if(Array.isArray(limpo.fotos[k])) limpo.fotos[k]=subst(limpo.fotos[k]); });
  }
  return { fotos, limpo, temFotos: contador>0 };
};

// Reidrata um registro: troca marcadores @@fN pelas fotos do mapa.
const reidratarRegistro = (registro, fotosMap) => {
  if(!fotosMap) return registro;
  const rest = (arr) => arr.map(s=> (typeof s==="string"&&s.startsWith("@@")) ? (fotosMap[s.slice(2)]||s) : s);
  const r = JSON.parse(JSON.stringify(registro));
  if(Array.isArray(r.items)) r.items.forEach(it=>{ if(Array.isArray(it.fotos)) it.fotos=rest(it.fotos); });
  if(r.unit&&Array.isArray(r.unit.foto)) r.unit.foto=rest(r.unit.foto);
  if(Array.isArray(r.fotos)) r.fotos=rest(r.fotos);
  if(r.fotos&&typeof r.fotos==="object"&&!Array.isArray(r.fotos)){
    Object.keys(r.fotos).forEach(k=>{ if(Array.isArray(r.fotos[k])) r.fotos[k]=rest(r.fotos[k]); });
  }
  return r;
};

// Verifica se um registro tem marcadores de foto (precisa reidratar).
const temMarcadores = (registro) => {
  const check = (arr)=>Array.isArray(arr)&&arr.some(s=>typeof s==="string"&&s.startsWith("@@"));
  if(Array.isArray(registro.items)&&registro.items.some(it=>check(it.fotos))) return true;
  if(registro.unit&&check(registro.unit.foto)) return true;
  if(check(registro.fotos)) return true;
  if(registro.fotos&&typeof registro.fotos==="object"&&!Array.isArray(registro.fotos)&&Object.values(registro.fotos).some(check)) return true;
  return false;
};

// ─── Escala Operacional — estrutura preparada para implementação futura ───────
// Formato: [{ data:"2025-01-01", turno:"00x08", letra:"A" }, ...]
const ESCALA_OPERACIONAL = []; // Cadastrar futuramente

const ocMaisCritica = (ocs) => {
  const vals=Object.values(ocs||{}).filter(Boolean);
  return vals.find(o=>(o.nivel||o.cor)==="vermelho")||vals.find(o=>(o.nivel||o.cor)==="amarelo")||null;
};
const getAutoTurno = () => {
  const h = new Date().getHours();
  if (h >= 0 && h < 8)  return "00x08";
  if (h >= 8 && h < 16) return "08x16";
  return "16x24";
};

const calcularLetra = () => {
  const SEQUENCIA = ["E","D","A","B","C"];
  const BASE = new Date("2026-06-09T00:00:00");
  const agora = new Date();
  const diasPassados = Math.floor((agora - BASE) / (1000*60*60*24));
  const blocoAtual = Math.floor(diasPassados / 2) % 5;
  const h = agora.getHours();
  const turno = h < 8 ? 0 : h < 16 ? 1 : 2;
  const indice = ((blocoAtual - turno) % 5 + 5) % 5;
  return SEQUENCIA[indice];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusColor = (s) => s==="OP"?"green":s==="ALERTA"?"yellow":"red";
const dotColor    = (s) => s==="OP"?C.accentLight:s==="ALERTA"?C.warningLight:C.dangerLight;
const subColor    = (s) => s==="Comum"?C.warningLight:s==="M2"?C.blueLight:C.accentLight;
const subLabel    = (s) => s==="Comum"?"⚡ COMUM":s;
const iconArea    = {"Formação":"🔲","Prensa":"⚙","UH / Lub.":"🛢","Prime Press":"💨","Vácuo":"〇","Bombas":"💧","Quebras":"♻","Torre HD":"🏗","Torre Quebras":"🏗","Torre Água Branca":"🏗","Efluentes":"🚰","Utilidades":"🔧","Cortadeira":"✂️","Secador":"🔥","Enfardamento":"📦"};
const iconSecao   = {Pichasso:"💧",Telas:"🔲",Feltros:"🟫",Prensas:"⚙",Rolos:"🔄","P. Úmida":"💧","P. Seca":"🔹",Layboy:"📦",Faquinhas:"🔪",Extra:"📝"};

const Badge = ({ children, color }) => {
  const map = {
    green: ["#002A10","#006830","#00C855"],
    yellow:["#2A1800","#8A5000","#F0A500"],
    red:   ["#2A0808","#8A1818","#E83030"],
    blue:  ["#001838","#003DA5","#5090FF"],
  };
  const [bg,bd,tx] = map[color]||map.blue;
  return <span style={{background:bg,border:`1px solid ${bd}`,color:tx,padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:800,letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{children}</span>;
};

const inputStyle = {background:C.tagBg,border:`1px solid ${C.border}`,color:C.text,borderRadius:8,padding:"8px 12px",fontSize:13,width:"100%",boxSizing:"border-box"};
const btnPrim={background:C.accent,border:"none",color:"#fff",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:700};
const btnSec ={background:C.surface,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:8,padding:"8px 14px",cursor:"pointer",fontSize:13};
const btnIcon={background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:13};

// ─── BotaoFoto ────────────────────────────────────────────────────────────────
// ─── comprimirFoto ───────────────────────────────
function comprimirFoto(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1280;
      let w = img.width, h = img.height;
      const ratio = Math.min(MAX/w, MAX/h, 1);
      w = Math.round(w*ratio); h = Math.round(h*ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Falha")); };
    img.src = url;
  });
}

function BotaoFoto({ fotos=[], onAdd, onRemove, compact=false }) {
  const inputRef = React.useRef();
  const handleFile = async (e) => {
    const files = Array.from(e.target.files||[]);
    if (!files.length) return;
    e.target.value = "";
    for (const file of files) {
      try { const b64 = await comprimirFoto(file); onAdd(b64); }
      catch { const rd = new FileReader(); rd.onload = ev => onAdd(ev.target.result); rd.readAsDataURL(file); }
    }
  };
  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handleFile}/>
      {fotos.length>0&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
          {fotos.map((src,i)=>(
            <div key={i} style={{position:"relative"}}>
              <img src={src} alt={`foto-${i}`} style={{width:compact?48:72,height:compact?48:72,objectFit:"cover",borderRadius:8,border:`2px solid ${C.accentLight}55`}}/>
              {onRemove&&<button onClick={()=>onRemove(i)} style={{position:"absolute",top:-5,right:-5,background:C.danger,border:"none",color:"#fff",width:28,height:28,borderRadius:"50%",fontSize:10,cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>}
            </div>
          ))}
        </div>
      )}
      <button onClick={()=>inputRef.current.click()} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,background:fotos.length>0?"#0a2015":C.tagBg,border:`1px solid ${fotos.length>0?C.accentLight+"55":C.border}`,color:fotos.length>0?C.accentLight:C.textMuted,borderRadius:8,padding:compact?"4px 8px":"7px 12px",cursor:"pointer",fontSize:compact?14:16,transition:"all .15s",position:"relative"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accentLight;e.currentTarget.style.color=C.accentLight;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=fotos.length>0?C.accentLight+"55":C.border;e.currentTarget.style.color=fotos.length>0?C.accentLight:C.textMuted;}}>
        📷
        {fotos.length>0&&<span style={{background:C.accent,color:"#fff",borderRadius:"50%",width:14,height:14,fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",position:"absolute",top:-5,right:-5}}>{fotos.length}</span>}
      </button>
    </div>
  );
}

// ─── ObsFotos ─────────────────────────────────────────────────────────────────
function ObsFotos({ fotos }) {
  const [ampliada, setAmpliada] = useState(null);
  return (
    <>
      {ampliada&&<div onClick={()=>setAmpliada(null)} style={{position:"fixed",inset:0,background:"#000000ee",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}}><img src={ampliada} alt="amp" style={{maxWidth:"95vw",maxHeight:"90vh",borderRadius:12}}/></div>}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {fotos.map((src,i)=>(
          <img key={i} src={src} alt={`f-${i}`} onClick={()=>setAmpliada(src)}
            style={{width:68,height:68,objectFit:"cover",borderRadius:9,border:`2px solid ${C.accentLight}44`,cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.06)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
        ))}
      </div>
    </>
  );
}

// ─── ModalObservacao ──────────────────────────────────────────────────────────
function ModalObservacao({ eq, onClose, onSave }) {
  const now=new Date();
  const horaAtual=now.toTimeString().slice(0,5);
  const dataAtual=now.toISOString().slice(0,10);
  const [obs,setObs]=useState(eq.obsRota||"");
  const [fotos,setFotos]=useState(eq.obsRotaFotos||[]);
  const [status,setStatus]=useState(eq.status);
  const [hora,setHora]=useState(horaAtual);
  const [fotoAmpliada,setFotoAmpliada]=useState(null);
  const addFoto=(src)=>setFotos(p=>[...p,src]);
  const removeFoto=(i)=>setFotos(p=>p.filter((_,j)=>j!==i));
  return (
    <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      {fotoAmpliada&&<div style={{position:"fixed",inset:0,background:"#000000dd",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setFotoAmpliada(null)}><img src={fotoAmpliada} alt="amp" style={{maxWidth:"95vw",maxHeight:"90vh",borderRadius:12}} onClick={e=>e.stopPropagation()}/><button onClick={()=>setFotoAmpliada(null)} style={{position:"absolute",top:16,right:16,width:40,height:40,borderRadius:"50%",background:"rgba(0,0,0,0.8)",border:"2px solid rgba(255,255,255,0.4)",color:"#fff",fontSize:22,cursor:"pointer",fontWeight:900,lineHeight:1,zIndex:301}}>×</button></div>}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"18px 18px 0 0",padding:22,width:"100%",maxWidth:600,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <p style={{color:C.textMuted,fontSize:10,margin:"0 0 3px",textTransform:"uppercase"}}>Observação de Rota</p>
            <h3 style={{color:C.white,fontSize:15,fontWeight:800,margin:"0 0 2px"}}>{eq.nome}</h3>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <code style={{color:C.textMuted,fontSize:10}}>{eq.tag}</code>
              <span style={{color:C.textDim,fontSize:10}}>· {eq.area}</span>
            </div>
          </div>
          <button onClick={onClose} style={{...btnSec,padding:"5px 11px"}}>✕</button>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:C.textMuted,fontSize:11}}>📅 {dataAtual.split("-").reverse().join("/")}</span>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{color:C.textMuted,fontSize:11}}>⏱</span>
            <input type="time" value={hora} onChange={e=>setHora(e.target.value)} style={{...inputStyle,width:90,padding:"3px 8px",fontSize:11}}/>
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:6}}>Status do equipamento</label>
          <div style={{display:"flex",gap:7}}>
            {["OP","ALERTA","MANUTENÇÃO"].map(s=>(
              <button key={s} onClick={()=>setStatus(s)} style={{flex:1,padding:"7px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:10,textTransform:"uppercase",background:status===s?(s==="OP"?C.success:s==="ALERTA"?C.warning:C.danger):C.tagBg,border:`1px solid ${status===s?(s==="OP"?C.accentLight:s==="ALERTA"?C.warningLight:C.dangerLight):C.border}`,color:status===s?"#fff":C.textMuted}}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:6}}>Descrição</label>
          <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={3} placeholder="Descreva o que observou durante a rota..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/>
        </div>
        <div style={{marginBottom:18}}>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:8}}>Fotos ({fotos.length})</label>
          {fotos.length>0&&(
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
              {fotos.map((src,i)=>(
                <div key={i} style={{position:"relative"}}>
                  <img src={src} alt={`obs-${i}`} onClick={()=>setFotoAmpliada(src)} style={{width:80,height:80,objectFit:"cover",borderRadius:10,border:`2px solid ${C.accentLight}55`,cursor:"pointer"}}/>
                  <button onClick={()=>removeFoto(i)} style={{position:"absolute",top:-6,right:-6,background:C.danger,border:"none",color:"#fff",width:20,height:20,borderRadius:"50%",fontSize:10,cursor:"pointer",fontWeight:700}}>✕</button>
                </div>
              ))}
            </div>
          )}
          <BotaoFoto fotos={[]} onAdd={addFoto}/>
        </div>
        <button onClick={()=>onSave(eq.id,{obs,fotos,status,data:dataAtual,hora})} style={{...btnPrim,width:"100%",padding:13}}>✓ Salvar Observação</button>
      </div>
    </div>
  );
}

// ─── ModalNotas ───────────────────────────────────────────────────────────────
function ModalNotas({ eq, onClose, onSave }) {
  const [notas,setNotas]=useState(eq.notas.map((n,i)=>({...n,_id:i})));
  const [novaNum,setNovaNum]=useState("");
  const [novaDesc,setNovaDesc]=useState("");
  const [editando,setEditando]=useState(null);
  const addNota=()=>{if(!novaNum.trim()&&!novaDesc.trim())return;setNotas(p=>[...p,{_id:Date.now(),num:novaNum.trim(),desc:novaDesc.trim()}]);setNovaNum("");setNovaDesc("");};
  const del=(id)=>setNotas(p=>p.filter(n=>n._id!==id));
  const upd=(id,f,v)=>setNotas(p=>p.map(n=>n._id===id?{...n,[f]:v}:n));
  return (
    <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"18px 18px 0 0",padding:24,width:"100%",maxWidth:600,maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.accentLight,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800,fontFamily:"monospace"}}>{eq.sub}</span>
              {eq.sub==="Comum"&&<span style={{background:"#2a180088",border:`1px solid ${C.warningLight}55`,color:C.warningLight,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800}}>⚡ IMPACTA M2 E M3</span>}
            </div>
            <h3 style={{color:C.text,fontSize:15,fontWeight:800,margin:"0 0 2px"}}>{eq.nome}</h3>
            <code style={{color:C.textMuted,fontSize:11}}>{eq.tag}</code>
          </div>
          <button onClick={onClose} style={{...btnSec,padding:"5px 11px"}}>✕</button>
        </div>
        {notas.length===0
          ?<div style={{background:C.card,border:`1px dashed ${C.border}`,borderRadius:10,padding:20,textAlign:"center",color:C.textMuted,fontSize:13,marginBottom:18}}>Nenhuma nota aberta.</div>
          :<div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
            {notas.map(nota=>(
              <div key={nota._id} style={{background:C.card,border:`1px solid ${editando===nota._id?C.accent:C.border}`,borderLeft:`3px solid ${C.warningLight}`,borderRadius:10,padding:"12px 14px"}}>
                {editando===nota._id?(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <input value={nota.num} onChange={e=>upd(nota._id,"num",e.target.value)} placeholder="Número da nota" style={inputStyle}/>
                    <textarea value={nota.desc} onChange={e=>upd(nota._id,"desc",e.target.value)} rows={2} style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/>
                    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                      <button onClick={()=>setEditando(null)} style={btnSec}>Cancelar</button>
                      <button onClick={()=>setEditando(null)} style={btnPrim}>Salvar</button>
                    </div>
                  </div>
                ):(
                  <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <span style={{background:"#2a180055",border:`1px solid ${C.warningLight}55`,color:C.warningLight,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800,fontFamily:"monospace",display:"inline-block",marginBottom:5}}>{nota.num||"S/Nº"}</span>
                      <p style={{color:C.text,fontSize:13,margin:0,lineHeight:1.5}}>{nota.desc||"—"}</p>
                    </div>
                    <div style={{display:"flex",gap:5,flexShrink:0}}>
                      <button onClick={()=>setEditando(nota._id)} style={btnIcon}>✏</button>
                      <button onClick={()=>del(nota._id)} style={{...btnIcon,color:C.dangerLight}}>🗑</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        }
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:16}}>
          <p style={{color:C.textMuted,fontSize:11,textTransform:"uppercase",margin:"0 0 10px"}}>+ Nova Nota</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <input value={novaNum} onChange={e=>setNovaNum(e.target.value)} placeholder="Número da nota (ex: MNT-2025-1234)" style={inputStyle}/>
            <textarea value={novaDesc} onChange={e=>setNovaDesc(e.target.value)} rows={2} placeholder="Descreva o problema..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/>
            <button onClick={addNota} disabled={!novaNum.trim()&&!novaDesc.trim()} style={{...btnPrim,opacity:(!novaNum.trim()&&!novaDesc.trim())?0.4:1}}>Adicionar</button>
          </div>
        </div>
        <button onClick={()=>onSave(eq.id,notas.map(({_id,...r})=>r))} style={{...btnPrim,width:"100%",padding:13}}>✓ Confirmar e Fechar</button>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
const MOTIVOS_OC={
  amarelo:["Risco de vazamento","Transbordo","Quebra de folha","Outro"],
  vermelho:["Parada de máquina","Risco de vazamento","Queda de material","Projeção de produtos químicos","Trip na caldeira","Outro"],
};

function Dashboard({ eqState, setTela, historico, areaAtiva, setAreaAtiva, ocorrencias, setOcorrencias, perfil, modalChuveiroHome, setModalChuveiroHome }) {
  const [recon,setRecon]=useState(()=>storageGet("reconhecimentos_h2")||{});
  React.useEffect(()=>{
    const unsub=onSnapshot(doc(COL,"reconhecimentos_h2"),(snap)=>{
      if(snap.exists()){const v=snap.data().val;if(v){setRecon(v);try{localStorage.setItem("reconhecimentos_h2",JSON.stringify(v));}catch{}}}
    });
    return ()=>unsub();
  },[]);
  const reconhecer=(chave,txt)=>{
    const novo={...recon,[chave]:{txt,por:perfil?.nome||"—",matricula:perfil?.matricula||"—",em:new Date().toISOString()}};
    setRecon(novo);
    storageSet("reconhecimentos_h2",novo);
  };
  const [showForm,setShowForm]=useState(false);
  const [popupChecks,setPopupChecks]=useState(null); // {maquina, detalhes:[{area,label,status}]}
  const [corOc,setCorOc]=useState(null);
  const [motivoSel,setMotivoSel]=useState(null);
  const [outroText,setOutroText]=useState("");
  const ocAtiva=ocMaisCritica(ocorrencias);
  const [showOport,setShowOport]=useState(false);
  const chamadosParada=(storageGet("chamados_h2")||[]).filter(ch=>ch.status==="aberto"&&ch.condicao==="Parada de máquina");
  const PRAZO_ORDER=["Imediato","Urgente","Normal","Programável"];
  const oportunidades=[...chamadosParada].sort((a,b)=>PRAZO_ORDER.indexOf(a.prazo||"Normal")-PRAZO_ORDER.indexOf(b.prazo||"Normal"));
  React.useEffect(()=>{
    if(!oportunidades.length)return;
    const t=setInterval(()=>setShowOport(p=>!p),2000);
    return()=>clearInterval(t);
  },[oportunidades.length]);
  const todosArea = areaAtiva==="pu"
    ? [...eqState.comum,...eqState.m2,...eqState.m3]
    : areaAtiva==="cs"
    ? [...eqState.cs_m2,...eqState.cs_m3]
    : [...eqState.enf_m2,...eqState.enf_m3];
  const todos=todosArea, alertas=todos.filter(e=>e.status!=="OP");
  const totalNotas=todos.reduce((a,e)=>a+e.notas.length,0);
  const notasComum=areaAtiva==="pu"?eqState.comum.reduce((a,e)=>a+e.notas.length,0):0;
  const ultimoReg=historico.length>0?historico[historico.length-1]:null;
  const fmtData=d=>{if(!d)return"—";const[y,m,day]=d.split("-");return`${day}/${m}/${y}`;};

  const hoje = new Date().toISOString().slice(0,10);
  const areaDoTipo = id => CATALOGO.find(c=>c.id===id)?.area||"pu";
  const lancamentosHoje = historico.filter(h =>
    h.data === hoje && areaDoTipo(h.tipoId) === areaAtiva
  );
  const totalHoje = lancamentosHoje.length;
  const semAlertaHoje = lancamentosHoje.filter(h=>h.noks===0).length;
  const conformidade = totalHoje > 0 ? Math.round(semAlertaHoje/totalHoje*100) : null;
  const corConf = conformidade===null ? C.textMuted : conformidade>=80 ? C.accentLight : conformidade>=50 ? C.warningLight : C.dangerLight;

  const Card=({label,value,sub,color,onClick,warn})=>(
    <div onClick={onClick} style={{background:C.card,border:`1px solid ${warn?C.warningLight+"55":C.border}`,borderRadius:12,padding:"16px 18px",cursor:onClick?"pointer":"default",transition:"border-color .2s"}}
      onMouseEnter={e=>onClick&&(e.currentTarget.style.borderColor=C.accent)}
      onMouseLeave={e=>e.currentTarget.style.borderColor=warn?C.warningLight+"55":C.border}>
      <div style={{color:C.textMuted,fontSize:11,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>{label}</div>
      <div style={{color,fontSize:30,fontWeight:800,lineHeight:1}}>{value}</div>
      <div style={{color:C.textMuted,fontSize:11,marginTop:4}}>{sub}</div>
    </div>
  );

  return (
    <div>
      {notasComum>0&&(
        <div style={{background:"#1a0f0088",border:`2px solid ${C.warningLight}`,borderRadius:12,padding:"12px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>⚡</span>
          <div>
            <div style={{color:C.warningLight,fontWeight:800,fontSize:13}}>Alerta em equipamento de Área Comum</div>
            <div style={{color:C.textMuted,fontSize:12,marginTop:2}}>{notasComum} nota{notasComum>1?"s":""} — impacta M2 e M3</div>
          </div>
        </div>
      )}
      {(()=>{
        /* ════ CENTRO DE OPERAÇÃO 4.0 ════ */
        const agora=new Date();
        const hoje=agora.toISOString().slice(0,10);
        const turnoAtual=getAutoTurno();
        const letraAtual=calcularLetra();
        const chamados=(storageGet("chamados_h2")||[]);
        const chamAbertos=chamados.filter(c=>c.status==="aberto");
        const todosEq=[...eqState.comum,...eqState.m2,...eqState.m3,...eqState.cs_m2,...eqState.cs_m3,...eqState.enf_m2,...eqState.enf_m3];
        const eqAlerta=todosEq.filter(e=>e.status==="ALERTA");
        const eqCritico=todosEq.filter(e=>e.status==="MANUTENÇÃO");
        const checkHoje=historico.filter(h=>h.data===hoje);
        const rotasHoje=checkHoje.filter(h=>["rotina","cortadeira","rota_enf"].includes(h.tipoId));
        const totalNoks=checkHoje.reduce((a,h)=>a+(h.noks||0),0);
        const semNok=checkHoje.filter(h=>h.noks===0).length;
        const conf=checkHoje.length>0?Math.round(semNok/checkHoje.length*100):null;
        const corConfV=conf===null?C.textMuted:conf>=80?C.accentLight:conf>=50?C.warningLight:C.dangerLight;
        /* status da área via ocorrências — pega a mais crítica */
        const oc=ocMaisCritica(ocorrencias);
        const ocCor=oc?.nivel||oc?.cor;
        const ocM2=ocorrencias?.M2, ocM3=ocorrencias?.M3;
        const stArea=ocCor==="vermelho"?{label:"PROCESSO PARADO",cor:C.dangerLight,anim:"trava-pulse",dot:C.danger}
          :ocCor==="amarelo"?{label:"COM INTERFERÊNCIAS",cor:C.warningLight,anim:null,dot:C.warning}
          :{label:"OPERANDO NORMALMENTE",cor:C.accentLight,anim:"verde-pulse",dot:C.success};
        /* trocador sujo */
        const TROC_IDS=["cs2_02","cs2_03","cs3_02","cs3_03"];
        const trocadorSujo=checkHoje.some(reg=>reg.items?.some(it=>TROC_IDS.includes(it.id)&&(parseFloat((it.resp||"").replace(",","."))||0)>100));
        /* máquinas */
        const LINS_M2=["L4","L5"],LINS_M3=["L6","L7","L8"];
        const isMaq=(h,m)=>h.linha?(m==="M2"?LINS_M2.includes(h.linha):LINS_M3.includes(h.linha)):(h.maquina===m||h.maquina==="M2/M3");
        const justifs=(()=>{ try{ return JSON.parse(localStorage.getItem("justificativas_h2"))||[]; }catch{ return []; } })();
        const checkTurno=checkHoje.filter(h=>turnoDoHorario(h.hora)===turnoDoHorario(`${String(agora.getHours()).padStart(2,"0")}:00`));
        const maqData=(m,eqs)=>{
          const al=eqs.filter(e=>e.status==="ALERTA").length;
          const cr=eqs.filter(e=>e.status==="MANUTENÇÃO").length;
          const rotas=rotasHoje.filter(h=>isMaq(h,m));
          const ultR=rotas.length>0?[...rotas].sort((a,b)=>b.id-a.id)[0].hora:"—";
          // Contador X/3: P.Úmida(rotina), Cortadeira(cortadeira), Enfardamento(enf_qualidade)
          const areasCheck=[{area:"pu",tipo:"rotina",label:"P. Úmida"},{area:"cs",tipo:"cortadeira",label:"Cortadeira"},{area:"enf",tipo:"enf_qualidade",label:"Enfardamento"}];
          let cumpridas=0;
          const detalhes=[];
          areasCheck.forEach(({area,tipo,label})=>{
            const lancou=checkTurno.some(h=>h.tipoId===tipo&&isMaq(h,m));
            const justificou=justifs.some(j=>j.data===hoje&&j.turno===turnoAtual&&j.area===area&&(j.maquina===m||j.maquina===null||!j.maquina));
            if(lancou||justificou) cumpridas++;
            detalhes.push({area,label,status:lancou?"lancou":justificou?"justificou":"pendente"});
          });
          return{al,cr,ultR,ok:al===0&&cr===0,cumpridas,totalAreas:3,detalhes};
        };
        const m2d=maqData("M2",[...eqState.m2,...eqState.cs_m2,...eqState.enf_m2]);
        const m3d=maqData("M3",[...eqState.m3,...eqState.cs_m3,...eqState.enf_m3]);
        /* requer atenção — lista priorizada */
        const atencao=[];
        if(trocadorSujo)atencao.push({chave:"trocador",nivel:0,cor:C.dangerLight,icone:"🔥",txt:"TROCADOR DE CALOR SUJO — verificar imediatamente",blink:true,destino:"equipamentos"});
        {const parseAlt=r=>{const m=(r||"").match(/(\d),(\d{2})/);return m?parseFloat(`${m[1]}.${m[2]}`):null;};
        const ultAlt={};[...historico].sort((a,b)=>b.id-a.id).filter(h=>h.tipoId==="enf_qualidade").forEach(r=>{const ln=r.linha||r.maquina;if(!ultAlt[ln]){const it=r.items?.find(i=>i.id==="enf_14");const v=it?parseAlt(it.resp):null;if(v!==null)ultAlt[ln]=v;}});
        ["L4","L5","L6","L7","L8"].forEach(ln=>{const v=ultAlt[ln];if(v===null||v===undefined)return;const verde=v>=1.89&&v<=1.91;const amarelo=!verde&&v>=1.88&&v<=1.92;const vermelho=v<1.88||v>1.92;if(verde)return;const cor=amarelo?C.warningLight:C.dangerLight;const nivel=amarelo?4:0;atencao.push({chave:"alt:"+ln,nivel,cor,icone:"📏",txt:`Altura Unit ${ln}: ${v.toFixed(2).replace(".",",")} m — ${amarelo?"limite de tolerância":"FORA DA FAIXA"}`,destino:null});});}
        const clD=storageGet("cleaners_h2")||{M2:{},M3:{}};
        // Cleaners não entra no top 3 — já tem card dedicado na home
        chamAbertos.filter(c=>c.prazo==="Imediato").forEach(c=>atencao.push({chave:"cham:"+c.id,nivel:1,cor:C.dangerLight,icone:"⛔",txt:`${c.equipamentoNome} — ${c.descricao||"chamado imediato"}`,destino:"equipamentos"}));
        chamAbertos.filter(c=>c.prazo==="Urgente").forEach(c=>atencao.push({chave:"cham:"+c.id,nivel:2,cor:"#FF8C00",icone:"⚠",txt:`${c.equipamentoNome} — ${c.descricao||"chamado urgente"}`,destino:"equipamentos"}));
        eqCritico.forEach(e=>atencao.push({chave:"eq:"+e.id,nivel:3,cor:C.dangerLight,icone:"🔧",txt:`${e.nome} — em manutenção`,destino:"equipamentos"}));
        eqAlerta.slice(0,3).forEach(e=>atencao.push({chave:"eqa:"+e.id,nivel:4,cor:C.warningLight,icone:"⚡",txt:`${e.nome} — em alerta${e.notas.length>0?` · ${e.notas.length} nota${e.notas.length>1?"s":""}`:""}`,destino:"equipamentos"}));
        const atencaoTop=atencao.sort((a,b)=>a.nivel-b.nivel).slice(0,3);
        /* passagem de turno */
        const herdados=chamAbertos.filter(c=>c.dataAbertura<hoje);
        const ultObs=[...historico].reverse().filter(h=>h.obs&&h.obs.trim()).slice(0,2);
        /* equipamentos críticos lista */
        const critList=eqCritico.slice(0,4);
        /* ── Barra de Checklist do Turno: PU e Cortadeira por máquina (M2+M3); Enfardamento por linha (L4..L8) ── */
        const isMaqM=(h,m)=>h.maquina===m||h.maquina==="M2/M3";
        const chkAreaMaq=(tipo,area,m)=>checkTurno.some(h=>h.tipoId===tipo&&isMaqM(h,m))||justifs.some(j=>j.data===hoje&&j.turno===turnoAtual&&j.area===area&&(j.maquina===m||!j.maquina));
        const enfLinhaOk=(L)=>{const m=LINS_M2.includes(L)?"M2":"M3";return checkTurno.some(h=>h.tipoId==="enf_qualidade"&&h.linha===L)||justifs.some(j=>j.data===hoje&&j.turno===turnoAtual&&j.area==="enf"&&(j.linha===L||j.maquina===m||(!j.maquina&&!j.linha)));};
        const mkSeg=(key,label,un)=>({key,label,un,feitos:un.filter(x=>x.ok).length,total:un.length,ok:un.every(x=>x.ok)});
        const checklistBar=[
          mkSeg("pu","P. Úmida",[{id:"M2",ok:chkAreaMaq("rotina","pu","M2")},{id:"M3",ok:chkAreaMaq("rotina","pu","M3")}]),
          mkSeg("cs","Cortadeira",[{id:"M2",ok:chkAreaMaq("cortadeira","cs","M2")},{id:"M3",ok:chkAreaMaq("cortadeira","cs","M3")}]),
          mkSeg("enf","Enfard.",["L4","L5","L6","L7","L8"].map(L=>({id:L,ok:enfLinhaOk(L)}))),
        ];
        const SecH=({n,t,cor})=>(
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{color:cor||C.text,fontSize:11,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase"}}>{t}</span>
            <div style={{flex:1,height:1,background:`linear-gradient(90deg,${(cor||C.border)}44,transparent)`}}/>
          </div>
        );
        return(
          <div style={{position:"relative",marginBottom:16,padding:"2px 0",
            background:"radial-gradient(38% 20% at 8% -2%, rgba(220,255,238,0.30), transparent 60%),radial-gradient(65% 32% at 10% 0%, rgba(0,230,118,0.34), transparent 62%),radial-gradient(70% 40% at 92% 42%, rgba(0,220,140,0.16), transparent 60%),radial-gradient(80% 60% at 50% 108%, rgba(0,200,120,0.14), transparent 60%),linear-gradient(180deg,#062018 0%,#04140E 55%,#03100A 100%)"}}>
            <Waves/>
            <div style={{position:"relative",zIndex:1}}>

            {/* ── 00 PAINEL DE ALARMES · SDCD ── */}
            {(()=>{
              const vivos=[...atencao].filter(a=>!recon[a.chave]).sort((a,b)=>a.nivel-b.nivel);
              const temCrit=vivos.some(a=>a.nivel<=3);
              return(
              <div style={{background:C.card,border:`1px solid ${vivos.length>0?C.dangerLight+"44":C.border}`,borderTop:`2px solid ${vivos.length>0?C.dangerLight:C.accentLight}`,borderRadius:12,padding:"10px 12px",marginBottom:10,boxShadow:temCrit?`0 0 10px ${C.dangerLight}22`:"none"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:vivos.length>0?8:0}}>
                  <span style={{color:vivos.length>0?C.dangerLight:C.textDim,fontSize:9,fontFamily:"monospace",fontWeight:700,letterSpacing:"0.12em"}}>ALARMES</span>
                  <div style={{minWidth:28,textAlign:"center",background:vivos.length>0?C.danger:C.tagBg,color:vivos.length>0?"#fff":C.textDim,fontFamily:"monospace",fontWeight:900,fontSize:13,borderRadius:5,padding:"1px 7px",animation:temCrit?"trava-pulse 1.6s ease-in-out infinite":"none"}}>{vivos.length}</div>
                </div>
                {vivos.length===0?(
                  <div style={{color:C.textDim,fontSize:10,fontFamily:"monospace",textAlign:"center",padding:"3px 0"}}>— sem alarmes ativos —</div>
                ):(
                  <div style={{maxHeight:168,overflowY:"auto",display:"flex",flexDirection:"column",gap:5}}>
                    {vivos.map((a,i)=>{
                      const tag=a.nivel===0?"TROCADOR":a.nivel===1?"IMEDIATO":a.nivel===2?"URGENTE":a.nivel===3?"MANUTENÇÃO":"ALERTA";
                      return(
                      <div key={a.chave||i} style={{display:"flex",alignItems:"center",gap:8,background:C.tagBg,border:`1px solid ${a.cor}33`,borderLeft:`3px solid ${a.cor}`,borderRadius:7,padding:"6px 8px"}}>
                        <span style={{fontSize:13,lineHeight:1.2,flexShrink:0}}>{a.icone}</span>
                        <div onClick={()=>a.destino&&setTela(a.destino)} style={{minWidth:0,flex:1,cursor:a.destino?"pointer":"default"}}>
                          <div style={{color:C.text,fontSize:11,fontWeight:600,lineHeight:1.25,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.txt}</div>
                          <div style={{color:a.cor,fontSize:8.5,fontFamily:"monospace",fontWeight:700,letterSpacing:"0.05em",marginTop:1}}>{tag}</div>
                        </div>
                        <button onClick={(e)=>{e.stopPropagation();reconhecer(a.chave,a.txt);}} style={{flexShrink:0,width:26,height:26,borderRadius:6,border:`1px solid ${a.cor}55`,background:`${a.cor}11`,color:a.cor,fontSize:13,fontWeight:900,lineHeight:1,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                      </div>);
                    })}
                  </div>
                )}
              </div>);
            })()}

            {/* ── 01 STATUS OPERACIONAL ── */}
            <div style={{...cardStyle,padding:"14px 16px",marginBottom:10}}>
              <SecH n="01" t="Status Operacional" cor={stArea.cor}/>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:12,height:12,borderRadius:"50%",background:stArea.dot,boxShadow:`0 0 8px ${stArea.dot},0 0 18px ${stArea.dot}88`,animation:stArea.anim?`${stArea.anim} 1.6s ease-in-out infinite`:"none",flexShrink:0}}/>
                <span style={{color:stArea.cor,fontWeight:900,fontSize:15,letterSpacing:"0.05em"}}>{stArea.label}</span>
                {oc?.motivo&&<span style={{color:C.textDim,fontSize:10}}>· {oc.motivo}{oc.maquina&&oc.maquina!=="Ambas"?` · ${oc.maquina}`:""}</span>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
                {[
                  {l:"Turno",v:turnoAtual,c:"#5090FF"},
                  {l:"Letra",v:letraAtual,c:C.accentLight},
                  {l:"Pendências",v:chamAbertos.length,c:chamAbertos.length>0?C.warningLight:C.accentLight},
                  {l:"Em Alerta",v:eqAlerta.length,c:eqAlerta.length>0?C.warningLight:C.accentLight},
                  {l:"Críticos",v:eqCritico.length,c:eqCritico.length>0?C.dangerLight:C.accentLight},
                ].map(({l,v,c})=>(
                  <div key={l} style={{...glassMini,borderRadius:12,padding:"10px 4px",textAlign:"center"}}>
                    <div style={{color:c,fontWeight:800,fontSize:17,lineHeight:1,fontFamily:"monospace"}}>{v}</div>
                    <div style={{color:C.textDim,fontSize:8,textTransform:"uppercase",marginTop:5,letterSpacing:"0.06em"}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 02 SAÚDE DAS MÁQUINAS ── */}
            <div style={{marginBottom:10}}>
              <SecH n="02" t="Saúde das Máquinas"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{m:"M2",d:m2d,cor:"#5090FF",ocm:ocM2},{m:"M3",d:m3d,cor:C.accentLight,ocm:ocM3}].map(({m,d,cor,ocm})=>{
                  const mCor=ocm?.nivel||ocm?.cor;
                  const afetada=mCor==="vermelho"||mCor==="amarelo";
                  const ledCor=mCor==="vermelho"?C.dangerLight:C.warningLight;
                  return(
                  <div key={m} style={afetada?{background:`${ledCor}08`,border:`1.5px solid ${ledCor}`,borderRadius:14,padding:"12px 13px",boxShadow:`0 0 8px ${ledCor}66,0 0 18px ${ledCor}33,inset 0 0 12px ${ledCor}11`,animation:mCor==="vermelho"?"trava-pulse 1.6s ease-in-out infinite":"none"}:{...cardStyle,borderRadius:14,padding:"12px 13px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <span style={{color:afetada?ledCor:C.text,fontWeight:900,fontSize:14,letterSpacing:"0.05em"}}>MÁQ. {m.replace("M","")}</span>
                      <div style={{width:9,height:9,borderRadius:"50%",background:afetada?(mCor==="vermelho"?C.danger:C.warning):d.ok?C.success:d.cr>0?C.danger:C.warning,boxShadow:`0 0 6px ${afetada?(mCor==="vermelho"?C.danger:C.warning):d.ok?C.success:d.cr>0?C.danger:C.warning}`}}/>
                    </div>
                    {[
                      {l:"Status",v:afetada?(mCor==="vermelho"?"Parada":"Interferência"):d.ok?"Normal":d.cr>0?"Crítico":"Atenção",c:afetada?ledCor:d.ok?C.accentLight:d.cr>0?C.dangerLight:C.warningLight},
                      {l:"Alertas",v:d.al,c:d.al>0?C.warningLight:C.text},
                      {l:"Críticos",v:d.cr,c:d.cr>0?C.dangerLight:C.text},
                    ].map(({l,v,c,clickDetalhe})=>(
                      <div key={l} onClick={()=>clickDetalhe&&setPopupChecks({maquina:m,detalhes:clickDetalhe})} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:l!=="Críticos"?"1px solid rgba(0,230,118,0.08)":"none",cursor:clickDetalhe?"pointer":"default"}}>
                        <span style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.04em"}}>{l}</span>
                        {l==="Status"?(
                          <span style={{fontFamily:"monospace",fontSize:9,fontWeight:700,color:c,padding:"3px 9px",borderRadius:999,background:`${c}14`,border:`1px solid ${c}40`,letterSpacing:"0.04em"}}>{String(v).toUpperCase()}</span>
                        ):(
                          <span style={{color:c,fontWeight:700,fontSize:12,fontFamily:"monospace",display:"flex",alignItems:"center",gap:4}}>{v}{clickDetalhe&&<span style={{fontSize:11,opacity:0.6}}>›</span>}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  );
                })}
              </div>
            </div>

            {/* ── 03 CHECKLIST DO TURNO ── */}
            <div style={{...cardStyle,padding:"14px 16px",marginBottom:10}}>
              <SecH n="03" t="Checklist do Turno"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {checklistBar.map(seg=>{
                  const cor=seg.ok?C.accentLight:C.warningLight;
                  return(
                  <div key={seg.key} onClick={()=>setTela("checklist")} style={{...glassMini,borderRadius:12,padding:"10px 10px 9px",cursor:"pointer"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <span style={{color:C.text,fontSize:11,fontWeight:800,letterSpacing:"0.02em"}}>{seg.label}</span>
                      <span style={{color:cor,fontSize:11,fontWeight:800,fontFamily:"monospace"}}>{seg.feitos}/{seg.total}</span>
                    </div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {seg.un.map(u=>(
                        <span key={u.id} style={{fontSize:8,fontWeight:800,fontFamily:"monospace",color:u.ok?"#04111D":C.textDim,background:u.ok?C.accentLight:"rgba(255,255,255,0.05)",border:`1px solid ${u.ok?C.accentLight:"rgba(255,255,255,0.10)"}`,borderRadius:5,padding:"1px 0",minWidth:18,textAlign:"center"}}>{u.id}</span>
                      ))}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* ── 04 PASSAGEM DE TURNO ── */}
            <div style={{...cardStyle,padding:"14px 16px",marginBottom:10}}>
              <SecH n="04" t="Passagem de Turno"/>
              {herdados.length===0&&ultObs.length===0?(
                <div style={{color:C.textMuted,fontSize:11,fontStyle:"italic"}}>Sem pendências herdadas</div>
              ):(
                <>
                  {herdados.slice(0,3).map(c=>(
                    <div key={c.id} style={{display:"flex",alignItems:"flex-start",gap:7,padding:"4px 0"}}>
                      <span style={{color:C.accentLight,fontSize:10,flexShrink:0,marginTop:1}}>◷</span>
                      <span style={{color:C.text,fontSize:11,lineHeight:1.4}}>{c.equipamentoNome} <span style={{color:C.textDim,fontSize:9}}>· desde {c.dataAbertura?.split("-").reverse().slice(0,2).join("/")}</span></span>
                    </div>
                  ))}
                  {ultObs.map((h,i)=>(
                    <div key={i} style={{marginTop:6,background:C.tagBg,borderRadius:7,padding:"6px 9px"}}>
                      <div style={{color:C.textDim,fontSize:8,textTransform:"uppercase",marginBottom:2}}>{h.tipoLabel||"Registro"} · {h.maquina||""} · {h.hora||""}</div>
                      <div style={{color:C.textMuted,fontSize:10,lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{h.obs}</div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* ── 05 CLEANERS ── */}
            {(()=>{
              const histCl=storageGet("cleaners_hist_h2")||[];
              const sedimAll=storageGet("cleaners_sedim_h2")||[];
              const effCl=(m)=>{const fora=Object.keys(clD[m]||{}).length;return Math.round((CLEANERS_TOTAL-fora)/CLEANERS_TOTAL*100);};
              const e2=effCl("M2"),e3=effCl("M3"),eg=Math.round((e2+e3)/2);
              const corCl=v=>v>=90?C.accentLight:v>=70?C.warningLight:C.dangerLight;
              const corEg=corCl(eg);
              const totalBoth=CLEANERS_TOTAL*2;
              const foraTotal=Object.keys(clD.M2||{}).length+Object.keys(clD.M3||{}).length;
              const nOpTotal=totalBoth-foraTotal;
              // 30 pontos: 7 dias × 3 turnos + bezier
              const spBounds=[];
              for(let day=0;day<7;day++){const d=new Date();d.setDate(d.getDate()-6+day);const ds=d.toISOString().slice(0,10);for(const h of[8,16,24]){const nd=h===24;const bd=nd?new Date(d.getTime()+86400000).toISOString().slice(0,10):ds;const bh=nd?"00:00":String(h).padStart(2,"0")+":00";spBounds.push({ts:bd+"T"+bh,ds});}}
              const sortedSp=[...histCl].sort((a,b)=>(a.data+(a.hora||"00:00")).localeCompare(b.data+(b.hora||"00:00")));
              const snapSp={M2:{},M3:{}};let spIdx=0;
              const spVals=spBounds.map(({ts})=>{while(spIdx<sortedSp.length){const ev=sortedSp[spIdx];const evTs=ev.data+"T"+(ev.hora||"00:00");if(evTs>ts)break;if(ev.maquina&&snapSp[ev.maquina]){if(ev.status==="REMOVIDA")snapSp[ev.maquina][ev.garrafa]=1;else delete snapSp[ev.maquina][ev.garrafa];}spIdx++;}const fora=Object.keys(snapSp.M2||{}).length+Object.keys(snapSp.M3||{}).length;return Math.round((totalBoth-fora)/totalBoth*100);});
              const delta=spVals[spVals.length-1]-spVals[0];
              const deltaStr=delta>0?`↗ +${delta}%`:delta<0?`↘ ${delta}%`:"→ estável";
              const deltaCol=delta>0?C.accentLight:delta<0?C.warningLight:C.textDim;
              // gauge geral
              const r=38,circ=2*Math.PI*r,fillOp=circ*(nOpTotal/totalBoth),fillFora=circ*(foraTotal/totalBoth);
              // split chart bezier
              const SW=260,H_SPLIT=72;
              const HU=Math.round(H_SPLIT*0.43),HG=Math.round(H_SPLIT*0.14),HL=H_SPLIT-HU-HG;
              const divY=HU+HG/2;
              const smn=Math.max(0,Math.min(...spVals)-8),smx=Math.min(100,Math.max(...spVals)+8),srng=smx-smn||1;
              const xOf=(i)=>(i/(spBounds.length-1))*SW;
              const yEf=(v)=>HU-((v-smn)/srng)*HU;
              const sdVals=spBounds.map(({ts})=>{const recs=sedimAll.filter(s=>s.data+"T"+(s.hora||"00:00")<=ts);return recs.length>0?recs[recs.length-1].valor:null;});
              const sdMax=Math.max(300,...sdVals.filter(v=>v!==null))+30;
              const ySd=(v)=>HU+HG+(v/sdMax)*HL;
              const bPath=(pts)=>{if(pts.length<2)return"";const p=pts.map(s=>{const[x,y]=s.split(",").map(Number);return{x,y};});let d=`M${p[0].x},${p[0].y}`;for(let i=1;i<p.length;i++){const c=(p[i-1].x+p[i].x)/2;d+=` C${c},${p[i-1].y} ${c},${p[i].y} ${p[i].x},${p[i].y}`;}return d;};
              const efPtsArr=spVals.map((v,i)=>`${xOf(i)},${yEf(v)}`);
              const efLinePath=bPath(efPtsArr);
              const efAreaPath=efLinePath+` L${SW},${HU} L0,${HU} Z`;
              const hasSd=sdVals.some(v=>v!==null);
              const firstSdVal=sdVals.find(v=>v!==null);
              const sdValsFilled=firstSdVal!=null?sdVals.map((v,i)=>v!==null?v:(i<sdVals.findIndex(x=>x!==null)?firstSdVal:null)):sdVals;
              const sdPtsArr=sdValsFilled.map((v,i)=>v!==null?`${xOf(i)},${ySd(v)}`:null).filter(Boolean);
              const sdLinePath=bPath(sdPtsArr);
              // último sedim
              const lastSedim=sedimAll.length>0?sedimAll[sedimAll.length-1]:null;
              const corSedim=lastSedim?(lastSedim.valor<150?C.accentLight:lastSedim.valor<=250?C.warningLight:C.dangerLight):null;
              return(
                <div onClick={()=>setTela("cleaners")} style={{...cardStyle,padding:"14px 16px 12px",marginBottom:10,cursor:"pointer"}}>
                  {/* header */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{color:C.white,fontSize:13,fontWeight:900,letterSpacing:"0.06em"}}>CLEANERS</span>
                      {lastSedim&&<span style={{background:`${corSedim}22`,border:`1px solid ${corSedim}55`,color:corSedim,borderRadius:20,padding:"1px 7px",fontSize:8,fontFamily:"monospace",fontWeight:800}}>Sedim {lastSedim.valor} mL/L</span>}
                    </div>
                    <span style={{color:corEg,fontSize:11,fontWeight:700,letterSpacing:"0.04em"}}>abrir ›</span>
                  </div>
                  {/* gauge + metrics */}
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
                    <svg width={90} height={90} viewBox="0 0 100 100" style={{flexShrink:0}}>
                      <defs><filter id="glow-cl"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
                      <circle cx="50" cy="50" r={r} fill="none" stroke={C.accentLight} strokeWidth="10" strokeDasharray={`${fillOp} ${circ}`} strokeLinecap="butt" strokeDashoffset={circ*0.25} filter="url(#glow-cl)" style={{transition:"stroke-dasharray .8s"}}/>
                      {foraTotal>0&&<circle cx="50" cy="50" r={r} fill="none" stroke={C.warningLight} strokeWidth="10" strokeDasharray={`${fillFora} ${circ}`} strokeLinecap="butt" strokeDashoffset={circ*0.25-fillOp} style={{filter:`drop-shadow(0 0 4px ${C.warningLight})`,transition:"stroke-dasharray .8s"}}/>}
                      <circle cx="50" cy="50" r="26" fill={`${corEg}11`}/>
                      <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="900" fill={corEg} fontFamily="monospace">{eg}</text>
                      <text x="50" y="57" textAnchor="middle" fontSize="8" fill={C.textDim} letterSpacing="1">%</text>
                    </svg>
                    <div style={{flex:1}}>
                      <div style={{color:corEg,fontWeight:900,fontSize:26,fontFamily:"monospace",lineHeight:1,marginBottom:2}}>{nOpTotal}<span style={{color:C.textDim,fontSize:13,fontWeight:400}}>/{totalBoth}</span></div>
                      <div style={{color:C.textDim,fontSize:9,letterSpacing:"0.08em",marginBottom:6}}>GARRAFAS OP</div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        {foraTotal>0&&<span style={{color:C.warningLight,fontFamily:"monospace",fontWeight:800,fontSize:12}}>{foraTotal}↓</span>}
                        <span style={{color:deltaCol,fontSize:10,fontWeight:700,fontFamily:"monospace"}}>{deltaStr}</span>
                      </div>
                    </div>
                  </div>
                  {/* rodapé: movimentações 10d */}
                  {(()=>{
                    const d10=new Date();d10.setDate(d10.getDate()-10);const d10s=d10.toISOString().slice(0,10);
                    const mov=(storageGet("cleaners_hist_h2")||[]).filter(h=>h.status==="REMOVIDA"&&h.data>=d10s).length;
                    const ret=(storageGet("cleaners_hist_h2")||[]).filter(h=>h.status==="OPERANDO"&&h.data>=d10s).length;
                    return(
                      <div style={{display:"flex",gap:6,marginTop:2}}>
                        <div style={{flex:1,background:C.tagBg,borderRadius:8,padding:"6px 10px",display:"flex",alignItems:"center",gap:8}}>
                          <span style={{color:C.warningLight,fontFamily:"monospace",fontWeight:900,fontSize:18,lineHeight:1}}>{mov}</span>
                          <span style={{color:C.textDim,fontSize:8,letterSpacing:"0.06em",lineHeight:1.3}}>retiradas<br/>10 dias</span>
                        </div>
                        <div style={{flex:1,background:C.tagBg,borderRadius:8,padding:"6px 10px",display:"flex",alignItems:"center",gap:8}}>
                          <span style={{color:C.accentLight,fontFamily:"monospace",fontWeight:900,fontSize:18,lineHeight:1}}>{ret}</span>
                          <span style={{color:C.textDim,fontSize:8,letterSpacing:"0.06em",lineHeight:1.3}}>retornos<br/>10 dias</span>
                        </div>
                        <div style={{flex:1,background:C.tagBg,borderRadius:8,padding:"6px 10px",display:"flex",alignItems:"center",gap:8}}>
                          <span style={{color:foraTotal>0?C.warningLight:C.accentLight,fontFamily:"monospace",fontWeight:900,fontSize:18,lineHeight:1}}>{foraTotal}</span>
                          <span style={{color:C.textDim,fontSize:8,letterSpacing:"0.06em",lineHeight:1.3}}>fora<br/>agora</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
            {/* ── EFICIÊNCIA DE LIMPEZA (chuveiros) ── */}
            {(()=>{
              const effM2=eficienciaMes("M2");
              const effM3=eficienciaMes("M3");
              const corPct=(p)=>p<60?C.dangerLight:p<80?C.warningLight:C.accentLight;
              const Gauge=({label,pct})=>{
                const r=32,circ=2*Math.PI*r;
                const cor=corPct(pct);
                const fill=Math.min(pct,100)/100*circ;
                return(
                  <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <svg width={82} height={82} viewBox="0 0 82 82">
                      <circle cx="41" cy="41" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
                      <circle cx="41" cy="41" r={r} fill="none" stroke={cor} strokeWidth="8" strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" transform="rotate(-90 41 41)" style={{filter:`drop-shadow(0 0 5px ${cor}aa)`,transition:"stroke-dasharray .8s"}}/>
                      <text x="41" y="38" textAnchor="middle" fontSize="16" fontWeight="900" fill={cor} fontFamily="monospace">{pct}</text>
                      <text x="41" y="50" textAnchor="middle" fontSize="8" fill={C.textDim}>%</text>
                    </svg>
                    <span style={{color:C.textMuted,fontSize:10,fontWeight:800,letterSpacing:"0.05em"}}>{label}</span>
                  </div>
                );
              };
              return(
                <div onClick={()=>setTela("chuveiros")} style={{background:`linear-gradient(135deg,${C.card},${C.blueLight}08)`,border:`1px solid ${C.blueLight}44`,borderTop:`3px solid ${C.blueLight}`,borderRadius:14,padding:"14px 14px 12px",marginBottom:10,cursor:"pointer",boxShadow:`0 4px 24px ${C.blueLight}15`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{color:C.white,fontSize:13,fontWeight:900,letterSpacing:"0.06em"}}>EFICIÊNCIA DE LIMPEZA</span>
                    </div>
                    <span style={{color:C.blueLight,fontSize:11,fontWeight:700,letterSpacing:"0.04em"}}>abrir ›</span>
                  </div>
                  <div style={{display:"flex",gap:10,marginBottom:14}}>
                    <Gauge label="M2" pct={effM2.pct}/>
                    <Gauge label="M3" pct={effM3.pct}/>
                  </div>
                  {(()=>{
                    const sM2=sugestaoTurno("M2"), sM3=sugestaoTurno("M3");
                    const linhas=[
                      ...sM2.itens.map(it=>({...it,maq:"M2",cor:C.accentLight})),
                      ...sM3.itens.map(it=>({...it,maq:"M3",cor:C.blueLight})),
                    ];
                    if(!linhas.length)return null;
                    const top4=linhas.slice(0,4);
                    return(
                      <>
                      <div style={{display:"flex",alignItems:"center",gap:8,margin:"2px 0 12px"}}>
                        <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${C.blueLight}66,transparent)`}}/>
                        <span style={{color:C.textDim,fontSize:8,fontWeight:900,letterSpacing:"0.12em",textTransform:"uppercase"}}>Sugestão do turno</span>
                        <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${C.blueLight}66,transparent)`}}/>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:5}}>
                        {top4.map(it=>{
                          const cor=corChuveiro(it,C);
                          return(
                          <div key={it.maq+it.id} onClick={e=>{e.stopPropagation();setModalChuveiroHome({maq:it.maq,id:it.id});}}
                            style={{display:"flex",alignItems:"center",gap:8,background:C.tagBg,border:`1px solid ${it.cor}44`,borderLeft:`3px solid ${cor}`,borderRadius:8,padding:"6px 10px",cursor:"pointer"}}>
                            <IconeChuveiro cor={cor} tipo={it.tipo} size={22}/>
                            <span style={{color:it.cor,fontSize:9,fontWeight:900,fontFamily:"monospace"}}>{it.maq}</span>
                            <span style={{color:C.text,fontSize:11,fontWeight:700,flex:1}}>{it.label}</span>
                            {it.entupido&&<span style={{color:C.dangerLight,fontSize:8,fontWeight:900}}>ENTUPIDO</span>}
                          </div>
                          );
                        })}
                      </div>
                      </>
                    );
                  })()}
                </div>
              );
            })()}

            {/* ── 05b ALTURAS UNITS ── */}
            {(()=>{
              const parseAlt=resp=>{const m=(resp||"").match(/(\d),(\d{2})/);return m?parseFloat(`${m[1]}.${m[2]}`):null;};
              const LINHAS=["L4","L5","L6","L7","L8"];
              const ultimaPorLinha={};
              [...historico].sort((a,b)=>b.id-a.id).filter(h=>h.tipoId==="enf_qualidade").forEach(r=>{
                const linha=r.linha||r.maquina;
                if(!ultimaPorLinha[linha]){const it=r.items?.find(i=>i.id==="enf_14");const v=it?parseAlt(it.resp):null;if(v!==null)ultimaPorLinha[linha]=v;}
              });
              const meds=LINHAS.map(l=>({linha:l,v:ultimaPorLinha[l]||1.90}));
              const med=meds.reduce((a,m)=>a+m.v,0)/meds.length;
              const cor=v=>v>=1.88&&v<=1.92?C.accentLight:Math.abs(v-1.90)<=0.04?C.warningLight:C.dangerLight;
              return(
                <div style={{background:C.card,border:`1px solid ${cor(med)}44`,borderTop:`2px solid ${cor(med)}`,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{color:cor(med),fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em"}}>◉ Altura Units · Enf.</span>
                  </div>
                  <div style={{display:"flex",alignItems:"flex-end",gap:4,height:44,borderBottom:`1px solid ${C.border}33`,position:"relative"}}>
                    <div style={{position:"absolute",left:0,right:0,bottom:`${((1.90-1.84)/0.11)*100}%`,height:1,borderTop:`1px dashed ${C.accentLight}44`}}/>
                    {meds.map((m,i)=>{const pct=Math.max(8,Math.min(100,((m.v-1.84)/0.11)*100));return(
                      <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                        <span style={{color:cor(m.v),fontSize:7,fontFamily:"monospace",fontWeight:800}}>{m.v.toFixed(2).replace(".",",")}</span>
                        <div style={{width:"70%",height:`${pct*0.44}px`,background:`linear-gradient(180deg,${cor(m.v)},${cor(m.v)}66)`,borderRadius:"3px 3px 0 0",boxShadow:`0 0 4px ${cor(m.v)}44`}}/>
                        <span style={{color:C.textDim,fontSize:7}}>{m.linha}</span>
                      </div>
                    );})}
                  </div>
                  <div style={{color:C.textDim,fontSize:8,marginTop:4}}>target 1,90 · tolerância 1,88–1,92 · último lançamento por linha</div>
                </div>
              );
            })()}
            {/* Avarias removidas daqui - ver analytics no histórico */}

            </div>
          </div>
        );
      })()}
      <h3 style={{color:C.text,fontSize:12,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>Acesso Rápido</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[{label:"📋 Check-list",tela:"checklist"},{label:"🔧 Equipamentos",tela:"equipamentos"},{label:"🎯 Mural de Oportunidades",tela:"mural"},{label:"🗂 Justificar Rotas",tela:"rotas"},{label:"📖 Manual",tela:"manual"}].map(a=>(
          <button key={a.tela} onClick={()=>setTela(a.tela)} style={{background:"rgba(10,25,45,0.7)",border:`1px solid ${C.border}`,color:C.text,borderRadius:12,padding:"13px 14px",cursor:"pointer",fontSize:13,fontWeight:500,textAlign:"left",transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.background=C.card;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface;}}>{a.label}</button>
        ))}
      </div>

      {/* Registro rápido de chuveiro direto da Home */}
      {modalChuveiroHome&&(
        <ModalRegistroChuveiro maq={modalChuveiroHome.maq} chuveiroId={modalChuveiroHome.id}
          onClose={()=>setModalChuveiroHome(null)}
          onSalvo={()=>setModalChuveiroHome(null)}/>
      )}

      {/* Popup detalhe dos Checklists do turno (X/3) */}
      {popupChecks&&(
        <div onClick={()=>setPopupChecks(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20,maxWidth:340,width:"100%",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{color:C.white,fontWeight:800,fontSize:15}}>Checklists do Turno · {popupChecks.maquina}</span>
              <button onClick={()=>setPopupChecks(null)} style={{background:"none",border:"none",color:C.textMuted,fontSize:20,cursor:"pointer",padding:0,lineHeight:1}}>×</button>
            </div>
            {popupChecks.detalhes.map(d=>{
              const cfg=d.status==="lancou"?{ic:"✓",cor:C.accentLight,txt:"Lançado"}:d.status==="justificou"?{ic:"✓",cor:"#5090FF",txt:"Justificado"}:{ic:"✗",cor:C.dangerLight,txt:"Pendente"};
              return (
                <div key={d.area} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 12px",borderRadius:9,marginBottom:7,background:`${cfg.cor}12`,border:`1px solid ${cfg.cor}33`}}>
                  <span style={{color:C.white,fontSize:13,fontWeight:600}}>{d.label}</span>
                  <span style={{color:cfg.cor,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:5}}>{cfg.ic} {cfg.txt}</span>
                </div>
              );
            })}
            <button onClick={()=>{setPopupChecks(null);setTela("checklist");}} style={{width:"100%",marginTop:8,padding:12,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:13,background:C.accent,border:"none",color:"#fff"}}>Ir para Check-list</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BarcodeSeletorTela ───────────────────────────────────────────────────────
function BarcodeSeletorTela() {
  const [linha,setLinha]=React.useState("L4");
  const [aberto,setAberto]=React.useState(false);
  const linhas=["L4","L5","L6","L7","L8"];
  const maqDaLinha=(l)=>["L4","L5"].includes(l)?"M2":"M3";
  return (
    <div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid #00E676`,borderRadius:12,padding:16,marginBottom:14}}>
        <div style={{color:"#B5C6DA",fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Selecione a Linha</div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {linhas.map(l=>{
            const ativo=linha===l;const maq=maqDaLinha(l);
            return(
              <button key={l} onClick={()=>setLinha(l)} style={{flex:1,padding:"10px 4px",borderRadius:10,cursor:"pointer",border:`2px solid ${ativo?"rgba(255,255,255,0.55)":"rgba(60,255,140,0.15)"}`,background:ativo?"#0E2847":"rgba(255,255,255,0.04)",color:ativo?"#fff":"#B5C6DA",fontWeight:ativo?800:500,fontSize:13,transition:"all .15s",boxShadow:ativo?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4)":"none"}}>
                {l}<div style={{fontSize:8,opacity:.6,marginTop:2,fontWeight:400}}>{maq}</div>
              </button>
            );
          })}
        </div>
        <button onClick={()=>setAberto(true)} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#006B2E,#00E676)",color:"#fff",fontSize:15,fontWeight:800,letterSpacing:"0.05em",boxShadow:"0 0 16px rgba(0,230,118,0.4)"}}>
          📷 Iniciar Validação — {linha}
        </button>
      </div>
      {aberto&&<BarcodeModal linha={linha} onFechar={()=>setAberto(false)}/>}
    </div>
  );
}

// ─── UnitBarcodeInput — lote/unidade com leitor inline ───────────────────────
function UnitBarcodeInput({ lote, setLote, unidade, setUnidade, unitFoto, setUnitFoto, setSalvo, onParsed }) {
  const [lendo, setLendo]     = useState(false);
  const [erro, setErro]       = useState("");
  const [lido, setLido]       = useState("");
  const scanRef               = useRef(null);
  const readerRef             = useRef(null);

  const parseCodigo = (codigo) => {
    // 0:ano 1-2:mes 3-4:dia 5:maq 6:linha 7-8:lote 9-11:unidade
    if(!codigo || codigo.length < 12) return null;
    return {
      ano: codigo.slice(0,1),
      mes: codigo.slice(1,3),
      dia: codigo.slice(3,5),
      maquinaLetra: codigo.slice(5,6),
      linhaNum: codigo.slice(6,7),
      lote: codigo.slice(7,9),
      unidade: codigo.slice(9,12),
      codigoCompleto: codigo,
    };
  };

  const iniciarScan = () => {
    setErro(""); setLido(""); setLendo(true);
  };

  React.useEffect(() => {
    if(!lendo) return;
    let html5QrCode;
    const carregarEIniciar = async () => {
      try {
        if(!window.Html5Qrcode) {
          await new Promise((res, rej) => {
            const s = document.createElement("script");
            s.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
            s.onload = res; s.onerror = rej;
            document.head.appendChild(s);
          });
        }
        html5QrCode = new window.Html5Qrcode("unit-barcode-reader");
        readerRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 320, height: 140 } },
          (decoded) => {
            const parsed = parseCodigo(decoded.trim());
            if(parsed) {
              setLote(parsed.lote);
              setUnidade(parsed.unidade);
              setSalvo(false);
              setLido(decoded.trim());
              if(onParsed) onParsed(parsed);
            } else {
              setErro("Código inválido: " + decoded.trim());
            }
            html5QrCode.stop().catch(()=>{});
            readerRef.current = null;
            setLendo(false);
          },
          () => {}
        );
      } catch(e) {
        setErro("Erro ao iniciar câmera: " + e.message);
        setLendo(false);
      }
    };
    carregarEIniciar();
    return () => {
      if(readerRef.current) { readerRef.current.stop().catch(()=>{}); readerRef.current = null; }
    };
  }, [lendo]);

  const fechar = () => {
    if(readerRef.current) { readerRef.current.stop().catch(()=>{}); readerRef.current = null; }
    setLendo(false); setErro("");
  };

  return (
    <div>
      <div style={{display:"flex",gap:8,alignItems:"flex-end",marginBottom:8}}>
        <div style={{flex:1}}>
          <label style={{color:C.textDim,fontSize:9,textTransform:"uppercase",display:"block",marginBottom:3,letterSpacing:"0.08em"}}>Lote</label>
          <input value={lote} onChange={e=>setLote(e.target.value)} placeholder="ex: 20"
            style={{...inputStyle,fontSize:13,padding:"7px 10px",fontFamily:"monospace"}}/>
        </div>
        <div style={{flex:1}}>
          <label style={{color:C.textDim,fontSize:9,textTransform:"uppercase",display:"block",marginBottom:3,letterSpacing:"0.08em"}}>Unidade</label>
          <input value={unidade} onChange={e=>setUnidade(e.target.value)} placeholder="ex: 011"
            style={{...inputStyle,fontSize:13,padding:"7px 10px",fontFamily:"monospace"}}/>
        </div>
        {/* Botão barcode */}
        <button onClick={lendo?fechar:iniciarScan}
          style={{flexShrink:0,width:42,height:38,borderRadius:8,cursor:"pointer",fontSize:17,
            border:`1px solid ${lendo?C.accentLight+"99":C.border}`,
            background:lendo?C.accentDark:C.surface,
            boxShadow:lendo?`0 0 8px ${C.accentLight}44`:"none"}}>
          {lendo?"✕":"▦"}
        </button>
        {/* Foto */}
        <label style={{flexShrink:0,width:42,height:38,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18}}>
          📷
          <input type="file" accept="image/*" multiple style={{display:"none"}}
            onChange={e=>{const files=Array.from(e.target.files||[]);e.target.value="";files.forEach(f=>{comprimirFoto(f).then(b64=>{setUnitFoto(p=>[...p,b64]);setSalvo(false);}).catch(()=>{const rd=new FileReader();rd.onload=()=>{setUnitFoto(p=>[...p,rd.result]);setSalvo(false);};rd.readAsDataURL(f);});});}}/>
        </label>
      </div>

      {/* Viewfinder */}
      {lendo&&(
        <div style={{marginBottom:8}}>
          <div id="unit-barcode-reader" ref={scanRef}
            style={{width:"100%",borderRadius:10,overflow:"hidden",border:`1px solid ${C.accentLight}44`}}/>
          <div style={{color:C.textDim,fontSize:10,textAlign:"center",marginTop:4}}>Aponte para o código de barras da unit</div>
        </div>
      )}

      {lido&&!lendo&&(
        <div style={{background:C.accentDark,border:`1px solid ${C.accentLight}44`,borderRadius:8,padding:"6px 10px",marginBottom:6,display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:C.accentLight,fontSize:11,fontWeight:700}}>✓ Lido:</span>
          <span style={{color:C.text,fontFamily:"monospace",fontSize:11}}>{lido}</span>
        </div>
      )}
      {erro&&(
        <div style={{background:"#2a080833",border:`1px solid ${C.dangerLight}44`,borderRadius:8,padding:"6px 10px",marginBottom:6}}>
          <span style={{color:C.dangerLight,fontSize:11}}>{erro}</span>
        </div>
      )}

      {unitFoto.length>0&&(
        <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
          {unitFoto.map((src,i)=>(
            <div key={i} style={{position:"relative"}}>
              <img src={src} style={{width:48,height:48,objectFit:"cover",borderRadius:6,border:`1px solid ${C.border}`}}/>
              <button onClick={()=>setUnitFoto(p=>p.filter((_,x)=>x!==i))}
                style={{position:"absolute",top:-6,right:-6,width:18,height:18,borderRadius:"50%",background:C.danger,border:"none",color:"#fff",fontSize:11,cursor:"pointer",lineHeight:1}}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── EnfardamentoTela ────────────────────────────────────────────────────────
function EnfardamentoTela({ onSalvar, turno, letra:letraProp, opPU, opPainel, data }) {
  const agora=new Date();
  const horaAtual=`${String(agora.getHours()).padStart(2,"0")}:${String(agora.getMinutes()).padStart(2,"0")}`;
  const hoje=new Date().toISOString().slice(0,10);
  const letra=calcularLetra();
  const [maquina,setMaquina]=useState("M2");
  const linhasFiltradas=LINHAS.filter(l=>maquina==="M2"?["L4","L5"].includes(l.id):["L6","L7","L8"].includes(l.id));
  const [linha,setLinha]=useState("L4");
  const [hora,setHora]=useState(horaAtual);
  const [opArea,setOpArea]=useState(()=>storageGet("op_config")?.nomeOperador||opPU||"");
  const [opPainelLocal,setOpPainelLocal]=useState(()=>storageGet("op_config")?.operadorPainel||opPainel||"");
  const matriculaEnf=storageGet("op_config")?.matricula||"";
  const [respostas,setRespostas]=useState({});
  const [fotos,setFotos]=useState({});
  const addFotoEnf=(id,src)=>{setFotos(p=>({...p,[id]:[...(p[id]||[]),src]}));setSalvo(false);};
  const remFotoEnf=(id,idx)=>{setFotos(p=>({...p,[id]:(p[id]||[]).filter((_,i)=>i!==idx)}));setSalvo(false);};
  const [obs,setObs]=useState("");
  const [lote,setLote]=useState("");
  const [unidade,setUnidade]=useState("");
  const [unitFoto,setUnitFoto]=useState([]);
  const [unitBarcode,setUnitBarcode]=useState(null);
  const [salvo,setSalvo]=useState(false);
  const items=checklistEnfardamento;
  const secoes=items.reduce((acc,i)=>{if(!acc[i.secao])acc[i.secao]=[];acc[i.secao].push(i);return acc;},{});
  const setResp=(id,val)=>{setRespostas(p=>({...p,[id]:val}));setSalvo(false);};
  const unitOk=lote.trim()!==""&&unidade.trim()!=="";
  const respondidos=items.filter(i=>respostas[i.id]).length+(unitOk?1:0);
  const totalItens=items.length+1;
  const alertas=items.filter(i=>i.alertOpcoes?.includes(respostas[i.id])).length;
  const linhaInfo=LINHAS.find(l=>l.id===linha);
  const handleSalvar=()=>{
    const registro={id:Date.now(),tipoId:"enf_qualidade",tipoLabel:"Check List Qualidade",maquina:linhaInfo?.maquina||"M2",linha,turno,hora,letra,data:hoje,opPU:opArea,matricula:matriculaEnf,opPainel:opPainelLocal,noks:alertas,total:items.length,unit:{lote,unidade,foto:unitFoto,barcode:unitBarcode},items:items.map(i=>({id:i.id,secao:i.secao,item:i.item,ref:i.ref,unit:i.unit,resp:respostas[i.id]||"",fotos:fotos[i.id]||[]})),obs};
    onSalvar(registro);
    setSalvo(true);
    setLote("");setUnidade("");setUnitFoto([]);setUnitBarcode(null);setRespostas({});setFotos({});setObs("");
  };
  return (
    <div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:14}}>
        {/* Seletor M2/M3 */}
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          {["M2","M3"].map(m=>(
            <button key={m} onClick={()=>{setMaquina(m);setLinha(m==="M2"?"L4":"L6");setRespostas({});setSalvo(false);}}
              style={{flex:1,padding:"7px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:13,transition:"all .15s",
                background:maquina===m?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${maquina===m?"rgba(255,255,255,0.55)":C.border}`,
                color:maquina===m?"#fff":C.textMuted,
                boxShadow:maquina===m?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4),0 0 40px rgba(80,144,255,0.2)":"none"}}>
              M{m.replace("M","")}<span style={{fontSize:9,fontWeight:400,opacity:.7,marginLeft:4}}>{m==="M2"?"L4·L5":"L6·L7·L8"}</span>
            </button>
          ))}
        </div>
        {/* Chips automáticos */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-around",background:"rgba(4,17,29,0.88)",border:"1px solid rgba(80,144,255,0.18)",borderRadius:10,padding:"7px 12px",marginBottom:12,boxShadow:"inset 0 0 20px rgba(0,0,0,0.45),0 0 8px rgba(80,144,255,0.07)"}}>
          {[
            {label:"TURNO", value:getAutoTurno(), bg:"rgba(14,40,71,0.9)",  border:"rgba(26,92,204,0.4)",  color:"#5090FF"},
            {label:"LETRA", value:letra,           bg:"rgba(0,40,20,0.9)",   border:"rgba(0,230,118,0.35)", color:"#00E676"},
            {label:"HORA",  value:hora,             bg:"rgba(20,30,45,0.9)", border:"rgba(255,255,255,0.12)", color:"#B5C6DA"},
          ].map(({label,value,bg,border,color},idx,arr)=>(
            <React.Fragment key={label}>
              <div style={{textAlign:"center",flex:1}}>
                <div style={{color:"rgba(255,255,255,0.22)",fontSize:7,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"monospace",marginBottom:2}}>{label}</div>
                <div style={{color,fontSize:15,fontWeight:900,letterSpacing:"0.05em",fontFamily:"monospace",whiteSpace:"nowrap"}}>{value}</div>
              </div>
              {idx<arr.length-1&&<div style={{width:1,height:26,background:"rgba(80,144,255,0.2)",flexShrink:0,margin:"0 6px"}}/>}
            </React.Fragment>
          ))}
        </div>
        {/* Seletor de linha filtrado */}
        <div style={{marginBottom:12}}>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:6}}>Linha</label>
          <div style={{display:"flex",gap:6}}>
            {linhasFiltradas.map(l=>{
              const ativo=linha===l.id;
              return <button key={l.id} onClick={()=>{setLinha(l.id);setRespostas({});setSalvo(false);}} style={{flex:1,padding:"7px 4px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:13,transition:"all .15s",background:ativo?C.blue:C.tagBg,border:`2px solid ${ativo?"rgba(255,255,255,0.55)":C.border}`,color:ativo?"#fff":C.textMuted,boxShadow:ativo?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4),0 0 40px rgba(80,144,255,0.2)":"none"}}>
                {l.id}
              </button>;
            })}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div>
            <label style={{color:C.textDim,fontSize:9,textTransform:"uppercase",display:"block",marginBottom:3,letterSpacing:"0.08em"}}>Operador</label>
            <input value={opArea||""} onChange={e=>setOpArea(e.target.value)} placeholder="Nome..." style={{...inputStyle,fontSize:12,padding:"6px 10px"}}/>
          </div>
          <div>
            <label style={{color:C.textDim,fontSize:9,textTransform:"uppercase",display:"block",marginBottom:3,letterSpacing:"0.08em"}}>Op. Painel</label>
            <input value={opPainelLocal||""} onChange={e=>setOpPainelLocal(e.target.value)} placeholder="Nome..." style={{...inputStyle,fontSize:12,padding:"6px 10px"}}/>
          </div>
        </div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{color:C.textMuted,fontSize:10,textTransform:"uppercase"}}>Progresso</span>
            <span style={{display:"flex",gap:10,alignItems:"center"}}>
              {alertas>0&&<span style={{color:C.dangerLight,fontSize:10,fontWeight:700}}>⚠ {alertas} alerta{alertas>1?"s":""}</span>}
              <span style={{color:C.white,fontSize:11,fontWeight:700}}>{respondidos}/{totalItens}</span>
            </span>
          </div>
          <div style={{background:C.tagBg,borderRadius:4,height:6,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:4,transition:"width .3s",width:`${(respondidos/totalItens)*100}%`,background:alertas>0?C.dangerLight:respondidos===totalItens?C.accentLight:C.accent}}/>
          </div>
        </div>
      </div>
        {/* ── UNIT INSPECIONADA ── */}
        <div style={{background:C.tagBg,border:`1px solid ${unitOk?C.accentLight+"66":C.accentLight+"33"}`,borderTop:`2px solid ${unitOk?C.accentLight:C.warningLight}`,borderRadius:10,padding:"11px 12px",marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{color:unitOk?C.accentLight:C.warningLight,fontSize:10,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase"}}>📦 Unit Inspecionada</span>
            <span style={{color:unitOk?C.accentLight:C.textDim,fontSize:12,fontWeight:900}}>{unitOk?"✓":"○"}</span>
          </div>
          {/* dados automáticos */}
          <div style={{display:"flex",flexWrap:"wrap",gap:"4px 14px",marginBottom:10}}>
            {[["Ano",String(new Date().getFullYear())],["Mês",String(new Date().getMonth()+1).padStart(2,"0")],["Dia",String(new Date().getDate()).padStart(2,"0")],["Máq",linhaInfo?.maquina||maquina],["Linha",linha],["Hora",hora]].map(([l,v])=>(
              <div key={l} style={{display:"flex",alignItems:"baseline",gap:4}}>
                <span style={{color:C.textDim,fontSize:8,letterSpacing:"0.06em",textTransform:"uppercase"}}>{l}</span>
                <span style={{color:C.text,fontSize:11,fontWeight:700,fontFamily:"monospace"}}>{v}</span>
              </div>
            ))}
          </div>
          <UnitBarcodeInput lote={lote} setLote={v=>{setLote(v);setSalvo(false);}} unidade={unidade} setUnidade={v=>{setUnidade(v);setSalvo(false);}} unitFoto={unitFoto} setUnitFoto={setUnitFoto} setSalvo={setSalvo} onParsed={p=>setUnitBarcode(p)}/>
        </div>
      {Object.entries(secoes).map(([secao,itensDaSecao])=>(
        <div key={secao} style={{marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:7,padding:"0 2px"}}>
            <span style={{color:C.text,fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{secao==="Qualidade"?"📦 Qualidade do Fardo":secao==="Altura Unit"?"📏 Altura da Unit":secao}</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {itensDaSecao.map((item,idx)=>{
              const resp=respostas[item.id];
              const isAlerta=item.alertOpcoes?.includes(resp);
              const isOk=resp&&!isAlerta;
              return (
                <div key={item.id} style={{background:C.card,borderRadius:10,padding:"12px 14px",border:`1px solid ${isAlerta?C.dangerLight+"66":isOk?C.accentLight+"33":C.border}`,borderLeft:`3px solid ${isAlerta?C.dangerLight:isOk?C.accentLight:"transparent"}`}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:item.instrucao?6:10}}>
                    <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,background:isAlerta?C.danger:isOk?C.success:C.tagBg,border:`2px solid ${isAlerta?C.dangerLight:isOk?C.accentLight:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:800}}>{isAlerta?"⚠":isOk?"✓":idx+1}</div>
                    <p style={{color:C.white,fontSize:13,fontWeight:500,margin:0,lineHeight:1.4,flex:1}}>{item.item}</p>
                  </div>
                  {item.instrucao&&<p style={{color:C.textMuted,fontSize:11,margin:"0 0 10px 30px",lineHeight:1.4,fontStyle:"italic"}}>{item.instrucao}</p>}
                  <div style={{display:"flex",flexDirection:"column",gap:6,paddingLeft:30}}>
                    {item.opcoes?.map(op=>{
                      const ativo=resp===op;
                      const isAlert=item.alertOpcoes?.includes(op);
                      const isTarget=item.ref===op;
                      return (
                        <button key={op} onClick={()=>setResp(item.id,ativo?undefined:op)} style={{padding:"9px 14px",borderRadius:9,cursor:"pointer",textAlign:"left",fontWeight:ativo?700:400,fontSize:12,transition:"all .15s",background:ativo?(isAlert?C.danger:C.success):C.tagBg,border:`1.5px solid ${ativo?(isAlert?C.dangerLight:C.accentLight):isTarget?"#F0A50055":C.border}`,color:ativo?"#fff":isAlert?C.dangerLight:isTarget?C.warningLight:C.textMuted,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <span>{op}</span>
                          {isTarget&&!ativo&&<span style={{fontSize:9,color:C.warningLight,fontWeight:700}}>TARGET</span>}
                          {ativo&&<span style={{fontSize:14}}>{isAlert?"⚠":"✓"}</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10,marginLeft:30}}>
                    <BotaoFoto compact fotos={fotos[item.id]||[]} onAdd={src=>addFotoEnf(item.id,src)} onRemove={idx=>remFotoEnf(item.id,idx)}/>
                    {(fotos[item.id]||[]).length>0&&<span style={{color:C.accentLight,fontSize:10,fontWeight:700}}>📷 {(fotos[item.id]||[]).length}</span>}
                  </div>
                  {isAlerta&&<div style={{marginTop:10,background:"#2A080833",border:`1px solid ${C.dangerLight}44`,borderRadius:8,padding:"8px 12px",marginLeft:30}}><p style={{color:C.dangerLight,fontSize:11,fontWeight:700,margin:0}}>⚠ Ação necessária — verifique e registre nas observações</p></div>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:14,marginBottom:14}}>
        <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:7}}>Observações / Ações tomadas</label>
        <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={2} placeholder="Desvios encontrados, ações realizadas..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/>
      </div>
      <button onClick={handleSalvar} disabled={salvo} style={{width:"100%",padding:13,border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,background:salvo?C.accentDark:respondidos===items.length?(alertas>0?C.warning:C.accent):C.textDim,cursor:salvo||respondidos<items.length?"not-allowed":"pointer",transition:"background .3s"}}>
        {salvo?"✓ Salvo no Histórico!":respondidos===items.length?(alertas>0?`⚠ Salvar com ${alertas} alerta${alertas>1?"s":""}`:
          `✓ Salvar — ${linha} / ${hora}`):`Responda todos os itens (${items.length-respondidos} restantes)`}
      </button>
    </div>
  );
}

// ─── Rejeição ────────────────────────────────────────────────────────────────
const REJEICAO_TIPOS = {
  longitudinal: { titulo:"1 — Longitudinal (Faca Circular)", cor:"#C07800", corLight:"#F0A500",
    acoes:["Verifique se houve variação de teor seco ou gramatura, ou se o processo está estável.",
      "Verifique se está muito úmida a folha na região do corte — peça para Op. Painel verificar no QCS e secar mais a região.",
      "Verifique se é possível aumentar o passe da faca circular.",
      "Verifique se há recurso para aumentar pressão de ar — respeite o limite máximo.",
      "Ajuste bico de pato ou roda calçadora para auxiliar no encanoamento da folha ao entrar na caixa.",
      "Após essas ações, se não parar as rejeições, registrar condição e comunicar gestão para planejar parada da cortadeira e ajustar."] },
  transversal_pontual: { titulo:"2 — Falha Corte Transversal Pontual", cor:"#003DA5", corLight:"#4080FF",
    acoes:["Verifique se houve variação de teor seco ou gramatura, ou se o processo está estável.",
      "Verificar se está subindo folha atrás do Pinch Roll.",
      "Verifique no QCS se está com gramatura baixa nessa posição — se sim, aumentar.",
      "Verifique se está com teor seco maior nessa posição — se sim, deixar mais úmido.",
      "Verificar passe da fita curta/conjunto tração, aumentar e acompanhar resultado.",
      "Verificar se está faltando fitas/danificadas.",
      "Verificar se polia da fita longa está travada/quebrada/desalinhada/fole vazando.",
      "Verificar rodas calçadoras travadas/desgaste excessivo/solta/mal posicionada na seção de destacamento.",
      "Verifique se vibrador de folhas está desacoplado/danificado.",
      "Após essas ações, se não parar as rejeições, registrar condição e comunicar gestão para planejar parada da cortadeira e ajustar."] },
  transversal_varias: { titulo:"3 — Falha Corte Transversal em Várias Caixas", cor:"#009A44", corLight:"#00C855",
    acoes:["Verifique se houve variação de teor seco ou gramatura, ou se o processo está estável.",
      "Verificar se está subindo folha atrás do Pinch Roll.",
      "Verifique no QCS se está com gramatura mais baixa — se sim, aumentar.",
      "Verifique se está com teor seco mais alto — se sim, deixar mais úmido.",
      "Verificar passe da fita curta/conjunto tração, aumentar para ajudar no destacamento, e acompanhar resultado.",
      "Verificar se está faltando fitas/danificadas.",
      "Verificar se polia da fita longa está travada/quebrada/desalinhada/fole vazando.",
      "Verificar rodas calçadoras travadas/desgaste excessivo/solta/mal posicionada na seção de destacamento.",
      "Verifique se vibrador de folhas está desacoplado/danificado.",
      "Após essas ações, se não parar as rejeições, registrar condição e comunicar gestão para planejar parada da cortadeira e ajustar."] },
};

function RejeicaoTela({ onSalvar, turno, letra, opPU, opPainel, data }) {
  const [maquina,setMaquina]=useState("M2");
  const [facaCircular,setFacaCircular]=useState(null);
  const [facaoRuim,setFacaoRuim]=useState(null);
  const [pontual,setPontual]=useState(null);
  const [feito,setFeito]=useState({});
  const [obs,setObs]=useState("");
  const [fotos,setFotos]=useState([]);
  const [salvo,setSalvo]=useState(false);
  const tipoFalha=facaCircular===true?"longitudinal":facaCircular===false&&facaoRuim===true&&pontual===true?"transversal_pontual":facaCircular===false&&facaoRuim===true&&pontual===false?"transversal_varias":null;
  const tipo=tipoFalha?REJEICAO_TIPOS[tipoFalha]:null;
  const feitosCount=tipo?tipo.acoes.filter((_,i)=>feito[tipoFalha+"_"+i]).length:0;
  const reset=()=>{setFacaCircular(null);setFacaoRuim(null);setPontual(null);setFeito({});setSalvo(false);};
  const handleSalvar=()=>{
    const registro={id:Date.now(),tipoId:"rejeicao",tipoLabel:"Rejeição Cortadeira",maquina,turno,letra,data,opPU,opPainel,tipoFalha,obs,fotos,noks:tipo?tipo.acoes.length-feitosCount:0,total:tipo?tipo.acoes.length:0,items:tipo?tipo.acoes.map((a,i)=>({id:"rej_"+i,secao:"Rejeição",item:a,ref:"—",unit:"ok/nok",resp:feito[tipoFalha+"_"+i]?"ok":"nao",fotos:[]})):[]};
    onSalvar(registro);setSalvo(true);
  };
  const BtnD=({label,onClick,ativo,cor})=>(<button onClick={onClick} style={{flex:1,padding:"10px 8px",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:12,transition:"all .15s",background:ativo?cor||C.accent:C.tagBg,border:`2px solid ${ativo?cor||C.accent:C.border}`,color:ativo?"#fff":C.textMuted}}>{label}</button>);
  return (
    <div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:14}}>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {["M2","M3"].map(m=>(<button key={m} onClick={()=>setMaquina(m)} style={{flex:1,padding:"7px",borderRadius:8,cursor:"pointer",fontWeight:800,fontSize:13,background:maquina===m?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${maquina===m?"rgba(255,255,255,0.55)":C.border}`,color:maquina===m?"#fff":C.textMuted,boxShadow:maquina===m?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4),0 0 40px rgba(80,144,255,0.2)":"none"}}>Máquina {m.replace("M","")}</button>))}
        </div>
        <div style={{background:`linear-gradient(135deg,${C.blue}88,${C.blueDark})`,border:`1px solid ${C.blueLight}55`,borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22,flexShrink:0}}>🚶</span>
          <p style={{color:C.white,fontSize:13,fontWeight:600,margin:0,lineHeight:1.4}}>Vá até o fardo e identifique se é falha no corte</p>
        </div>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:10}}>
        <p style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",margin:"0 0 8px",letterSpacing:"0.07em"}}>Pergunta 1</p>
        <p style={{color:C.white,fontWeight:700,fontSize:14,margin:"0 0 12px"}}>Corte da <span style={{color:C.warningLight}}>faca circular</span> está ruim?</p>
        <div style={{display:"flex",gap:8}}>
          <BtnD label="✓ SIM — Faca circular" ativo={facaCircular===true} cor={C.warningLight} onClick={()=>{setFacaCircular(true);setFacaoRuim(null);setPontual(null);setFeito({});setSalvo(false);}}/>
          <BtnD label="✗ NÃO" ativo={facaCircular===false} cor={C.blueLight} onClick={()=>{setFacaCircular(false);setFacaoRuim(null);setPontual(null);setFeito({});setSalvo(false);}}/>
        </div>
      </div>
      {facaCircular===false&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:10}}>
          <p style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",margin:"0 0 8px",letterSpacing:"0.07em"}}>Pergunta 2</p>
          <p style={{color:C.white,fontWeight:700,fontSize:14,margin:"0 0 12px"}}>Corte do <span style={{color:C.accentLight}}>facão</span> está ruim?</p>
          <div style={{display:"flex",gap:8}}>
            <BtnD label="✓ SIM — Facão" ativo={facaoRuim===true} cor={C.accent} onClick={()=>{setFacaoRuim(true);setPontual(null);setFeito({});setSalvo(false);}}/>
            <BtnD label="✗ NÃO" ativo={facaoRuim===false} cor={C.blueLight} onClick={()=>{setFacaoRuim(false);setPontual(null);setFeito({});setSalvo(false);}}/>
          </div>
          {facaoRuim===false&&<div style={{marginTop:12,background:C.tagBg,borderRadius:8,padding:"10px 14px"}}><p style={{color:C.textMuted,fontSize:12,margin:0}}>ℹ️ Nenhuma falha de corte identificada.</p></div>}
        </div>
      )}
      {facaCircular===false&&facaoRuim===true&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:10}}>
          <p style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",margin:"0 0 8px",letterSpacing:"0.07em"}}>Pergunta 3 — Identifique a abrangência</p>
          <p style={{color:C.white,fontWeight:700,fontSize:14,margin:"0 0 12px"}}>A falha é <span style={{color:C.blueLight}}>pontual</span>?</p>
          <div style={{display:"flex",gap:8}}>
            <BtnD label="✓ SIM — Pontual" ativo={pontual===true} cor={C.blueLight} onClick={()=>{setPontual(true);setFeito({});setSalvo(false);}}/>
            <BtnD label="✗ NÃO — Várias caixas" ativo={pontual===false} cor={C.accent} onClick={()=>{setPontual(false);setFeito({});setSalvo(false);}}/>
          </div>
        </div>
      )}
      {tipo&&(
        <>
          <div style={{background:`linear-gradient(135deg,${tipo.cor}44,${tipo.cor}22)`,border:`2px solid ${tipo.cor}`,borderRadius:12,padding:"12px 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <p style={{color:tipo.corLight,fontWeight:900,fontSize:14,margin:0}}>{tipo.titulo}</p>
              <p style={{color:C.textMuted,fontSize:11,margin:"3px 0 0"}}>{feitosCount}/{tipo.acoes.length} ações verificadas</p>
            </div>
            <button onClick={reset} style={{...btnSec,fontSize:11,padding:"5px 10px"}}>↩ Reiniciar</button>
          </div>
          <div style={{background:C.tagBg,borderRadius:4,height:5,marginBottom:12,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:4,transition:"width .3s",width:`${(feitosCount/tipo.acoes.length)*100}%`,background:feitosCount===tipo.acoes.length?C.accentLight:tipo.corLight}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
            {tipo.acoes.map((acao,i)=>{
              const key=tipoFalha+"_"+i;
              const done=!!feito[key];
              const isLast=i===tipo.acoes.length-1;
              return (
                <div key={i} onClick={()=>setFeito(p=>({...p,[key]:!done}))} style={{background:C.card,border:`1px solid ${done?C.accentLight+"55":isLast?C.dangerLight+"44":C.border}`,borderLeft:`3px solid ${done?C.accentLight:isLast?C.dangerLight:tipo.cor}`,borderRadius:10,padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:12,opacity:done?0.75:1,transition:"all .15s"}}>
                  <div style={{width:22,height:22,borderRadius:6,flexShrink:0,marginTop:1,background:done?C.accent:C.tagBg,border:`2px solid ${done?C.accentLight:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:900}}>{done?"✓":i+1}</div>
                  <div style={{flex:1}}>
                    <p style={{color:done?C.textMuted:C.white,fontSize:12,margin:0,lineHeight:1.5,textDecoration:done?"line-through":"none"}}>{acao}</p>
                    {isLast&&!done&&<div style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:5,background:"#2A080833",border:`1px solid ${C.dangerLight}55`,borderRadius:6,padding:"2px 8px"}}><span style={{color:C.dangerLight,fontSize:10,fontWeight:700}}>⚠ Escalar para gestão</span></div>}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:14,marginBottom:14}}>
            <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:8}}>Fotos da ocorrência</label>
            {fotos.length>0&&(<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{fotos.map((src,i)=>(<div key={i} style={{position:"relative"}}><img src={src} alt="" style={{width:68,height:68,objectFit:"cover",borderRadius:8,border:`2px solid ${tipo.cor}55`}}/><button onClick={()=>setFotos(p=>p.filter((_,j)=>j!==i))} style={{position:"absolute",top:-5,right:-5,background:C.danger,border:"none",color:"#fff",width:28,height:28,borderRadius:"50%",fontSize:9,cursor:"pointer",fontWeight:800}}>✕</button></div>))}</div>)}
            <BotaoFoto fotos={[]} onAdd={src=>setFotos(p=>[...p,src])}/>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:14,marginBottom:14}}>
            <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:7}}>Observações da ocorrência</label>
            <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={2} placeholder="Descreva detalhes relevantes..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/>
          </div>
          <button onClick={handleSalvar} disabled={salvo} style={{width:"100%",padding:13,border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,background:salvo?C.accentDark:feitosCount===tipo.acoes.length?C.accent:C.blue,cursor:salvo?"not-allowed":"pointer",transition:"background .3s"}}>
            {salvo?"✓ Registrado no Histórico!":feitosCount===tipo.acoes.length?"✓ Salvar — Todas as ações verificadas":`Salvar (${feitosCount}/${tipo.acoes.length} ações feitas)`}
          </button>
        </>
      )}
    </div>
  );
}


function WFTTela({ onSalvar, turno, letra, opPU:opPUProp, opPainel:opPainelProp, data }) {
  const [maquina,setMaquina]=useState("M2");
  const [opPU,setOpPU]=useState(opPUProp||"");
  const [opPainel,setOpPainel]=useState(opPainelProp||"");
  const [consumoAtual,setConsumoAtual]=useState("");
  const [temRejeicao,setTemRejeicao]=useState(null);
  const [respostas,setRespostas]=useState({});
  const [fotos,setFotos]=useState({});
  const [obs,setObs]=useState("");
  const [salvo,setSalvo]=useState(false);
  const setResp=(id,v)=>setRespostas(p=>({...p,[id]:v}));
  const addFoto=(id,src)=>setFotos(p=>({...p,[id]:[...(p[id]||[]),src]}));
  const remFoto=(id,i)=>setFotos(p=>({...p,[id]:p[id].filter((_,j)=>j!==i)}));
  const consumoNum=parseFloat(consumoAtual.replace(",","."))||0;
  const acima=consumoNum>WFT_META_H2;
  const totalVerif=WFT_VERIFICACOES_SEM_REJEICAO.length;
  const respondidas=WFT_VERIFICACOES_SEM_REJEICAO.filter(v=>respostas[v.id]).length;
  const handleSalvar=()=>{
    const registro={id:Date.now(),tipoId:"wft",tipoLabel:"Consumo WFT",maquina,turno,letra,data,opPU,opPainel,consumoAtual:consumoNum,metaH2:WFT_META_H2,acima,temRejeicao,respostas:{...respostas},fotos:{...fotos},obs,noks:0,total:totalVerif,items:WFT_VERIFICACOES_SEM_REJEICAO.map(v=>({id:v.id,secao:"WFT",item:v.item,ref:"—",unit:"sim/não",resp:respostas[v.id]||"",fotos:fotos[v.id]||[]}))};
    onSalvar(registro);setSalvo(true);
  };
  const corMeta=acima?C.dangerLight:C.accentLight;
  const bgMeta=acima?"#2a080833":"#00280f";
  return (
    <div>
      {/* Cabeçalho igual ao checklist de rotina */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginBottom:12}}>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {["M2","M3"].map(m=>(
            <button key={m} onClick={()=>setMaquina(m)} style={{flex:1,padding:"9px",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,transition:"all .15s",background:maquina===m?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${maquina===m?"rgba(255,255,255,0.55)":C.border}`,color:maquina===m?"#fff":C.textMuted,boxShadow:maquina===m?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4),0 0 40px rgba(80,144,255,0.2)":"none"}}>
              Máquina {m.replace("M","")}<div style={{fontSize:10,fontWeight:400,opacity:.8,marginTop:1}}>{m==="M2"?"32-xx":"33-xx"}</div>
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-around",background:"rgba(4,17,29,0.88)",border:"1px solid rgba(80,144,255,0.18)",borderRadius:10,padding:"7px 12px",marginBottom:12,boxShadow:"inset 0 0 20px rgba(0,0,0,0.45),0 0 8px rgba(80,144,255,0.07)"}}>
          {[
            {label:"TURNO",value:turno,bg:"rgba(14,40,71,0.9)",border:"rgba(26,92,204,0.4)",color:"#5090FF"},
            {label:"LETRA",value:letra,bg:"rgba(0,40,20,0.9)",border:"rgba(0,230,118,0.35)",color:"#00E676"},
            {label:"DATA", value:data.split("-").reverse().join("/"),bg:"rgba(20,30,45,0.9)",border:"rgba(255,255,255,0.12)",color:"#B5C6DA"},
            {label:"HORA", value:(()=>{const a=new Date();return`${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`})(),bg:"rgba(20,30,45,0.9)",border:"rgba(255,255,255,0.12)",color:C.text},
          ].map(({label,value,bg,border,color},idx,arr)=>(
            <React.Fragment key={label}>
              <div style={{textAlign:"center",flex:1}}>
                <div style={{color:"rgba(255,255,255,0.22)",fontSize:7,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"monospace",marginBottom:2}}>{label}</div>
                <div style={{color,fontSize:15,fontWeight:900,letterSpacing:"0.05em",fontFamily:"monospace",whiteSpace:"nowrap"}}>{value}</div>
              </div>
              {idx<arr.length-1&&<div style={{width:1,height:26,background:"rgba(80,144,255,0.2)",flexShrink:0,margin:"0 6px"}}/>}
            </React.Fragment>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div>
            <label style={{color:C.textDim,fontSize:9,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>Operador</label>
            <input value={opPU} onChange={e=>setOpPU(e.target.value)} placeholder="Nome..." style={{...inputStyle,fontSize:12,padding:"6px 10px"}}/>
          </div>
          <div>
            <label style={{color:C.textDim,fontSize:9,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>Op. Painel</label>
            <input value={opPainel} onChange={e=>setOpPainel(e.target.value)} placeholder="Nome..." style={{...inputStyle,fontSize:12,padding:"6px 10px"}}/>
          </div>
        </div>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>Meta H2 (M2+M3)</div>
            <div style={{color:C.accentLight,fontSize:22,fontWeight:800}}>{WFT_META_H2} m³/h</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",marginBottom:3}}>Consumo atual</div>
            <input value={consumoAtual} onChange={e=>{setConsumoAtual(e.target.value);setTemRejeicao(null);setRespostas({});}} placeholder="ex: 320" style={{...inputStyle,width:110,textAlign:"center",fontSize:18,fontWeight:800,borderColor:consumoAtual?(acima?C.dangerLight:C.accentLight):C.border,color:consumoAtual?corMeta:C.textMuted}}/>
            <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>m³/h</div>
          </div>
        </div>
        {consumoAtual&&(
          <div style={{marginBottom:14}}>
            <div style={{background:C.tagBg,borderRadius:6,height:10,overflow:"hidden",position:"relative"}}>
              <div style={{height:"100%",borderRadius:6,transition:"width .4s",width:`${Math.min((consumoNum/WFT_META_H2)*100,120)}%`,background:acima?`linear-gradient(90deg,${C.accentLight},${C.dangerLight})`:C.accentLight}}/>
            </div>
            <div style={{marginTop:8,textAlign:"center"}}>
              <span style={{background:bgMeta,border:`1px solid ${corMeta}55`,color:corMeta,borderRadius:20,padding:"4px 16px",fontSize:12,fontWeight:800}}>
                {acima?`⚠ ${(consumoNum-WFT_META_H2).toFixed(0)} m³/h ACIMA da meta`:`✓ ${(WFT_META_H2-consumoNum).toFixed(0)} m³/h abaixo da meta`}
              </span>
            </div>
          </div>
        )}
      </div>
      {consumoAtual&&(
        <>
          {acima?(
            <div style={{background:"#2a080822",border:`1px solid ${C.dangerLight}44`,borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <span style={{fontSize:20}}>⚠️</span>
                <span style={{color:C.dangerLight,fontWeight:800,fontSize:14}}>Consumo acima da meta — Iniciar diagnóstico</span>
              </div>
              <p style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:10}}>Há rejeições constantes no momento?</p>
              <div style={{display:"flex",gap:8,marginBottom:temRejeicao!==null?16:0}}>
                {[{v:true,label:"🔴 Sim — há rejeições"},{v:false,label:"🟢 Não há rejeições"}].map(op=>(
                  <button key={String(op.v)} onClick={()=>setTemRejeicao(op.v)} style={{flex:1,padding:"10px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:12,background:temRejeicao===op.v?(op.v?C.danger:C.success):C.tagBg,border:`2px solid ${temRejeicao===op.v?(op.v?C.dangerLight:C.accentLight):C.border}`,color:temRejeicao===op.v?"#fff":C.textMuted}}>{op.label}</button>
                ))}
              </div>
              {temRejeicao===true&&(
                <div style={{background:C.card,border:`1px solid ${C.dangerLight}44`,borderRadius:10,padding:14,marginTop:4}}>
                  <p style={{color:C.dangerLight,fontWeight:800,fontSize:12,margin:"0 0 10px",textTransform:"uppercase"}}>🔴 Ações — Consumo Alto com Rejeições</p>
                  {[{n:"1",texto:"Make up aberto para controlar nível torre WBR?",acao:"Reduzir água para branqueamento de forma antecipada e gradativa."},{n:"2",texto:"Avaliar condições de qualidade e realizar transferência de água do H1 para H2.",acao:"Avaliar nível da torre de WBR do H1."}].map(a=>(
                    <div key={a.n} style={{borderBottom:`1px solid ${C.border}`,paddingBottom:10,marginBottom:10}}>
                      <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                        <span style={{background:C.danger,color:"#fff",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0,marginTop:1}}>{a.n}</span>
                        <div><p style={{color:C.text,fontSize:12,margin:"0 0 4px",fontWeight:600}}>{a.texto}</p><p style={{color:C.warningLight,fontSize:11,margin:0}}>→ {a.acao}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {temRejeicao===false&&<VerificacoesWFT respostas={respostas} setResp={setResp} fotos={fotos} addFoto={addFoto} remFoto={remFoto}/>}
            </div>
          ):(
            <div style={{background:"#00280f",border:`1px solid ${C.accentLight}44`,borderRadius:12,padding:16,marginBottom:14,textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:6}}>✅</div>
              <p style={{color:C.accentLight,fontWeight:800,fontSize:15,margin:"0 0 4px"}}>Consumo dentro da meta!</p>
              <p style={{color:C.textMuted,fontSize:12,margin:0}}>{WFT_META_H2} m³/h H2 · Atual: {consumoNum} m³/h</p>
            </div>
          )}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:14,marginBottom:14}}>
            <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:7}}>Observações</label>
            <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={2} placeholder="Anotações adicionais..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/>
          </div>
          <button onClick={handleSalvar} disabled={salvo} style={{width:"100%",padding:13,border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,background:salvo?C.accentDark:C.success,cursor:salvo?"not-allowed":"pointer",transition:"background .3s"}}>
            {salvo?"✓ Salvo no Histórico!":"✓ Registrar no Histórico"}
          </button>
        </>
      )}
    </div>
  );
}

function VerificacoesWFT({ respostas, setResp, fotos, addFoto, remFoto }) {
  return (
    <div style={{marginTop:14}}>
      <p style={{color:C.accentLight,fontWeight:700,fontSize:12,margin:"0 0 10px",textTransform:"uppercase",letterSpacing:"0.05em"}}>🟢 Verificações de campo — Consumo Alto Sem Rejeições</p>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {WFT_VERIFICACOES_SEM_REJEICAO.map((v,i)=>{
          const resp=respostas[v.id];
          const isProblema=resp==="sim";
          return (
            <div key={v.id} style={{background:C.surface,borderRadius:10,padding:"12px 14px",border:`1px solid ${isProblema?C.dangerLight+"66":resp==="nao"?C.accentLight+"33":C.border}`,borderLeft:`3px solid ${isProblema?C.dangerLight:resp==="nao"?C.accentLight:"transparent"}`}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:isProblema?10:0}}>
                <span style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:6,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0}}>{i+1}</span>
                <div style={{flex:1}}>
                  <p style={{color:C.text,fontSize:12,margin:"0 0 8px",lineHeight:1.4}}>{v.item}</p>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {[{v:"sim",label:"SIM"},{v:"nao",label:"NÃO"}].map(op=>(
                      <button key={op.v} onClick={()=>setResp(v.id,op.v)} style={{padding:"4px 12px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:700,border:resp===op.v?"none":`1px solid ${C.border}`,background:resp===op.v?(op.v==="sim"?C.danger:C.success):C.tagBg,color:resp===op.v?"#fff":C.textMuted}}>{op.label}</button>
                    ))}
                    <BotaoFoto compact fotos={fotos[v.id]||[]} onAdd={src=>addFoto(v.id,src)} onRemove={idx=>remFoto(v.id,idx)}/>
                  </div>
                </div>
              </div>
              {isProblema&&(<div style={{background:"#2a0808",border:`1px solid ${C.dangerLight}44`,borderRadius:8,padding:"10px 12px",marginTop:4}}><p style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",margin:"0 0 4px"}}>Ação</p><p style={{color:C.warningLight,fontSize:12,margin:0,lineHeight:1.5}}>→ {v.acao}</p></div>)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── RitmoVaporTela — Consumo específico de Vapor (por máquina) ───────────────
function RitmoVaporTela({ onSalvar, turno, letra, opPU:opPUProp, opPainel:opPainelProp, data }) {
  const [maquina,setMaquina]=useState("M2");
  const [opPU,setOpPU]=useState(opPUProp||"");
  const [opPainel,setOpPainel]=useState(opPainelProp||"");
  const [respostas,setRespostas]=useState({});
  const [fotos,setFotos]=useState({});
  const [obs,setObs]=useState("");
  const [salvo,setSalvo]=useState(false);
  const setResp=(id,v)=>setRespostas(p=>({...p,[id]:v}));
  const addFoto=(id,src)=>setFotos(p=>({...p,[id]:[...(p[id]||[]),src]}));
  const remFoto=(id,i)=>setFotos(p=>({...p,[id]:p[id].filter((_,j)=>j!==i)}));
  const trocar=(m)=>{setMaquina(m);setRespostas({});setFotos({});setObs("");setSalvo(false);};
  const TODOS=[...RITMO_VAPOR_PROCESSO,...RITMO_VAPOR_EQUIPAMENTOS];
  const respondidas=TODOS.filter(v=>respostas[v.id]).length;
  const noks=TODOS.filter(v=>respostas[v.id]==="sim").length;
  const handleSalvar=()=>{
    const registro={id:Date.now(),tipoId:"ritmo_vapor",tipoLabel:"Consumo de Vapor",maquina,turno,letra,data,opPU,opPainel,respostas:{...respostas},fotos:{...fotos},obs,noks,total:TODOS.length,
      items:TODOS.map(v=>({id:v.id,secao:RITMO_VAPOR_PROCESSO.some(p=>p.id===v.id)?"Processo":"Equipamentos",item:v.item,ref:"—",unit:"sim/não",resp:respostas[v.id]||"",fotos:fotos[v.id]||[]}))};
    onSalvar(registro);setSalvo(true);
  };
  const Grupo=({titulo,num,itens})=>(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.blueLight}`,borderRadius:12,padding:16,marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <span style={{color:C.textDim,fontSize:11,fontFamily:"monospace",fontWeight:900}}>{num}</span>
        <span style={{color:C.white,fontWeight:800,fontSize:13,letterSpacing:"0.03em"}}>{titulo}</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {itens.map((v,i)=>{
          const resp=respostas[v.id];
          const isProblema=resp==="sim";
          return(
            <div key={v.id} style={{background:C.surface,borderRadius:10,padding:"12px 14px",border:`1px solid ${isProblema?C.dangerLight+"66":resp==="nao"?C.accentLight+"33":C.border}`,borderLeft:`3px solid ${isProblema?C.dangerLight:resp==="nao"?C.accentLight:"transparent"}`}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:isProblema?10:0}}>
                <span style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:6,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0}}>{i+1}</span>
                <div style={{flex:1}}>
                  <p style={{color:C.text,fontSize:12,margin:"0 0 8px",lineHeight:1.4}}>{v.item}</p>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {[{v:"nao",label:"OK"},{v:"sim",label:"NÃO OK"}].map(op=>(
                      <button key={op.v} onClick={()=>setResp(v.id,op.v)} style={{padding:"4px 12px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:700,border:resp===op.v?"none":`1px solid ${C.border}`,background:resp===op.v?(op.v==="sim"?C.danger:C.success):C.tagBg,color:resp===op.v?"#fff":C.textMuted}}>{op.label}</button>
                    ))}
                    <BotaoFoto compact fotos={fotos[v.id]||[]} onAdd={src=>addFoto(v.id,src)} onRemove={idx=>remFoto(v.id,idx)}/>
                  </div>
                </div>
              </div>
              {isProblema&&(<div style={{background:"#2a0808",border:`1px solid ${C.dangerLight}44`,borderRadius:8,padding:"10px 12px",marginTop:4}}><p style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",margin:"0 0 4px"}}>Ação</p><p style={{color:C.warningLight,fontSize:12,margin:0,lineHeight:1.5}}>→ {v.acao}</p></div>)}
            </div>
          );
        })}
      </div>
    </div>
  );
  return(
    <div>
      {/* Cabeçalho padrão */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginBottom:12}}>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {["M2","M3"].map(m=>(
            <button key={m} onClick={()=>trocar(m)} style={{flex:1,padding:"9px",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,transition:"all .15s",background:maquina===m?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${maquina===m?"rgba(255,255,255,0.55)":C.border}`,color:maquina===m?"#fff":C.textMuted,boxShadow:maquina===m?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4)":"none"}}>
              Máquina {m.replace("M","")}<div style={{fontSize:10,fontWeight:400,opacity:.8,marginTop:1}}>{m==="M2"?"32-xx":"33-xx"}</div>
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-around",background:"rgba(4,17,29,0.88)",border:"1px solid rgba(80,144,255,0.18)",borderRadius:10,padding:"7px 12px",marginBottom:12}}>
          {[
            {label:"TURNO",value:turno,color:"#5090FF"},
            {label:"LETRA",value:letra,color:"#00E676"},
            {label:"DATA",value:data.split("-").reverse().join("/"),color:"#B5C6DA"},
            {label:"HORA",value:(()=>{const a=new Date();return`${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`})(),color:C.text},
          ].map(({label,value,color},idx,arr)=>(
            <React.Fragment key={label}>
              <div style={{textAlign:"center",flex:1}}>
                <div style={{color:"rgba(255,255,255,0.22)",fontSize:7,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"monospace",marginBottom:2}}>{label}</div>
                <div style={{color,fontSize:15,fontWeight:900,letterSpacing:"0.05em",fontFamily:"monospace",whiteSpace:"nowrap"}}>{value}</div>
              </div>
              {idx<arr.length-1&&<div style={{width:1,height:26,background:"rgba(80,144,255,0.2)",flexShrink:0,margin:"0 6px"}}/>}
            </React.Fragment>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div>
            <label style={{color:C.textDim,fontSize:9,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>Operador</label>
            <input value={opPU} onChange={e=>setOpPU(e.target.value)} placeholder="Nome..." style={{...inputStyle,fontSize:12,padding:"6px 10px"}}/>
          </div>
          <div>
            <label style={{color:C.textDim,fontSize:9,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>Op. Painel</label>
            <input value={opPainel} onChange={e=>setOpPainel(e.target.value)} placeholder="Nome..." style={{...inputStyle,fontSize:12,padding:"6px 10px"}}/>
          </div>
        </div>
      </div>

      <div style={{background:"rgba(80,144,255,0.06)",border:`1px solid ${C.blueLight}33`,borderRadius:10,padding:"10px 14px",marginBottom:14}}>
        <p style={{color:C.textMuted,fontSize:11,margin:0,lineHeight:1.5}}>Ritmo das Máquinas limitado em função do consumo específico de vapor. Verifique os itens de processo e a condição dos secadores.</p>
      </div>

      <Grupo titulo="Verificou itens do processo?" num="01" itens={RITMO_VAPOR_PROCESSO}/>
      <Grupo titulo="Qual a condição dos secadores?" num="02" itens={RITMO_VAPOR_EQUIPAMENTOS}/>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:14,marginBottom:14}}>
        <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:7}}>Observações</label>
        <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={3} placeholder="Anotações gerais..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <div style={{flex:1,color:C.textDim,fontSize:11}}>{respondidas}/{TODOS.length} verificados{noks>0&&<span style={{color:C.dangerLight,fontWeight:800}}> · {noks} NÃO OK</span>}</div>
        <button onClick={handleSalvar} disabled={salvo} style={{padding:"13px 28px",borderRadius:12,cursor:salvo?"default":"pointer",fontWeight:800,fontSize:14,border:"none",background:salvo?C.tagBg:`linear-gradient(135deg,${C.accentDark},${C.accent})`,color:salvo?C.textMuted:"#fff",boxShadow:salvo?"none":`0 0 16px ${C.accentLight}44`}}>
          {salvo?"✓ Salvo":"Salvar Checklist"}
        </button>
      </div>
    </div>
  );
}

// ─── ChecklistTela ────────────────────────────────────────────────────────────
function ChecklistTela({ onSalvar, historico=[], perfil }) {
  const hoje=new Date().toISOString().slice(0,10);
  const [areaFiltro,setAreaFiltro]=useState(()=>{const a=storageGet("op_config")?.area;return a||"pu";});
  const [tipoId,setTipoId]=useState(()=>{const a=storageGet("op_config")?.area||"pu";return CATALOGO.find(c=>c.area===a)?.id||"rotina";});
  const [selectorAberto,setSelectorAberto]=useState(false);
  const ehDev=perfil?.funcao==="dev";
  const catalogo_area=CATALOGO.filter(c=>c.area===areaFiltro).filter(c=>c.id!=="rota_enf"||ehDev);
  const tipo=CATALOGO.find(c=>c.id===tipoId)||catalogo_area[0];
  const [maquina,setMaquina]=useState("M2");
  const turno=getAutoTurno();
  const letra=calcularLetra();
  const [opPU,setOpPU]=useState(()=>storageGet("op_config")?.nomeOperador||"");
  const [opPainel,setOpPainel]=useState(()=>storageGet("op_config")?.operadorPainel||"");
  const matricula=storageGet("op_config")?.matricula||"";
  const [data,setData]=useState(hoje);
  const [valores,setValores]=useState({});
  const [fotos,setFotos]=useState({});
  const [obs,setObs]=useState("");
  const [nokAlerta,setNokAlerta]=useState(null);
  const [nokGravidade,setNokGravidade]=useState(null);
  const [nokObs,setNokObs]=useState("");
  const [obsNok,setObsNok]=useState({});
  const [passagemNokAberto,setPassagemNokAberto]=useState(null);
  const [passagemNokTemp,setPassagemNokTemp]=useState({valor:"",obs:""});
  const [passagemNokDados,setPassagemNokDados]=useState({});
  const [valorObsModal,setValorObsModal]=useState(null);
  const [valorObsTexto,setValorObsTexto]=useState("");
  const [editandoValor,setEditandoValor]=useState(null);
  const [salvo,setSalvo]=useState(false);
  const [verificados,setVerificados]=useState(new Set());
  React.useEffect(()=>{
    const v=getLastValores(tipoId,maquina);
    if(Object.keys(v).length>0) setValores(v);
  },[tipoId,maquina]);

  const getStepRange=(refStr)=>{
    const n=parseFloat((refStr||"0").replace(",",".").match(/[\d.]+/)?.[0]||"1");
    if(isNaN(n)||n===0)return{step:0.1,min:0,max:10};
    if(n<=5)  return{step:0.1,min:0,max:parseFloat((n*3).toFixed(1))};
    if(n<=30) return{step:0.5,min:0,max:Math.round(n*2)};
    if(n<=200)return{step:1,  min:0,max:Math.round(n*1.8)};
    if(n<=1500)return{step:10, min:0,max:Math.round(n*1.5)};
    return{step:50,min:0,max:Math.round(n*1.5)};
  };
  const parseRefNum=(refStr)=>{
    const n=parseFloat((refStr||"0").replace(",",".").match(/[\d.]+/)?.[0]||"0");
    return isNaN(n)?0:n;
  };
  const getLastValores=(tid,maq)=>{
    const entry=[...historico]
      .filter(h=>h.tipoId===tid&&(h.maquina===maq||h.maquina==="M2/M3"))
      .sort((a,b)=>b.id-a.id)[0];
    if(!entry)return{};
    // Prioriza o objeto valores completo (inclui duplo_valor _f/_c); fallback p/ items
    if(entry.valores&&typeof entry.valores==="object"){
      const out={};
      Object.entries(entry.valores).forEach(([k,v])=>{if(v&&v!=="ok"&&v!=="nok"&&v!=="sim"&&v!=="nao")out[k]=v;});
      return out;
    }
    if(!entry.items)return{};
    return entry.items.reduce((acc,i)=>{if(i.resp&&i.resp!=="ok"&&i.resp!=="nok"&&i.resp!=="sim"&&i.resp!=="nao")acc[i.id]=i.resp;return acc;},{});
  };
  const isItemNok=(item,val)=>{
    if(!val)return false;
    if(item.tipo==="sim_nao"){const ok=item.respostaOk||"sim";return val!==ok;}
    return["nok","atencao","critico","desvio"].includes(val);
  };
  const trocar=m=>{setMaquina(m);setValores(getLastValores(tipoId,m));setFotos({});setSalvo(false);setVerificados(new Set());};
  const trocarTipo=id=>{setTipoId(id);setValores(getLastValores(id,maquina));setFotos({});setSalvo(false);setSelectorAberto(false);setVerificados(new Set());};
  const items=tipo?tipo.getItems(maquina):[];
  const secoes=items.reduce((acc,i)=>{if(!acc[i.secao])acc[i.secao]=[];acc[i.secao].push(i);return acc;},{});
  const setVal=(id,v)=>{setValores(p=>({...p,[id]:v}));setSalvo(false);};
  const addFotoItem=(id,src)=>setFotos(p=>({...p,[id]:[...(p[id]||[]),src]}));
  const removeFotoItem=(id,idx)=>setFotos(p=>({...p,[id]:p[id].filter((_,i)=>i!==idx)}));
  const ehCortadeira = tipoId==="cortadeira";
  // Verifica se um item está preenchido (trata duplo_valor, valor_direto, faquinhas)
  const itemPreenchido=(i)=>{
    if(i.tipo==="faquinhas")return true; // grupo de conferência: já validado por padrão
    if(i.tipo==="facao_fardos")return true; // grupo de conferência por fardo
    if(i.tipo==="duplo_valor"){
      const f=valores[i.id+"_f"], c=valores[i.id+"_c"];
      return f!==undefined&&f!==""&&c!==undefined&&c!==""; // só verde com os dois
    }
    const v=valores[i.id];
    if(v===undefined||v==="")return false;
    if((i.tipo==="valor_direto"||i.velMin!==undefined)&&v!=="ok"){ const n=parseFloat(String(v).replace(",",".")); return !isNaN(n)&&(i.velMin===undefined||n>=i.velMin); }
    if(i.tipo==="valor_stepper"){ return verificados.has(i.id); }
    return true;
  };
  const preenchidos=items.filter(itemPreenchido).length;
  const noks=items.filter(i=>isItemNok(i,valores[i.id])).length;
  const total=items.length;
  const totalFotos=Object.values(fotos).reduce((a,f)=>a+f.length,0);

  // Valida campo de valor contra alertaMin/alertaExato/velMin
  const getValorStatus=(item)=>{
    const v=valores[item.id];
    if(!v||v==="")return null;
    if(v==="ok")return "ok"; // apertou OK = está no padrão = verde
    const num=parseFloat(v.replace(",","."));
    if(item.velMin!==undefined&&!isNaN(num))return num>=item.velMin?"ok":null; // ≥min=verde, abaixo=não preenchido
    if(item.alertaMin!==undefined&&!isNaN(num)&&num<item.alertaMin)return"alert";
    if(item.alertaMax!==undefined&&!isNaN(num)&&num>item.alertaMax)return"alert";
    if(item.alertaExato!==undefined&&v.replace(",",".")!==item.alertaExato.replace(",","."))return"nok";
    return"ok";
  };

  // Faixa das faquinhas
  const getFaixaStatus=(val,faixas)=>{
    if(!val||!faixas)return null;
    const n=parseFloat(val.replace(",","."));
    if(isNaN(n))return null;
    if(n>=3.5)return"critico";
    if(n>=2.5)return"atencao";
    if(n>=1.5)return"normal";
    return"fora";
  };
  const corFaixa=(st)=>st==="normal"?C.accentLight:st==="atencao"?C.warningLight:st==="critico"?C.dangerLight:C.textDim;

  const handleFinalizar=()=>{
    if(preenchidos<total)return;
    const registro={id:Date.now(),tipoId:tipoId||"rotina",tipoLabel:tipo?.label||"",maquina:tipo?.porMaquina?maquina:"M2/M3",turno,letra,data,opPU,matricula,opPainel,obs,noks,total,valores:{...valores},fotos:{...fotos},items:items.map(i=>({id:i.id,secao:i.secao,item:i.item,ref:i.ref,unit:i.unit,resp:valores[i.id]||"",obs:passagemNokDados[i.id]?.obs||obsNok[i.id]||"",valorPassagem:passagemNokDados[i.id]?.valor||"",fotos:(fotos[i.id]||[])}))};
    onSalvar(registro);setSalvo(true);
  };

  const Btn=({id,opcao,label,isOk})=>{
    const ativo=valores[id]===opcao;
    return <button onClick={()=>setVal(id,ativo?undefined:opcao)} style={{padding:"5px 11px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s",border:ativo?"none":`1px solid ${C.border}`,background:ativo?(isOk?C.success:C.danger):C.tagBg,color:ativo?"#fff":C.textMuted}}>{label}</button>;
  };

  return (
    <div>
      {valorObsModal&&(
        <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{background:C.surface,border:`1px solid ${C.warningLight}44`,borderRadius:"18px 18px 0 0",padding:24,width:"100%",maxWidth:600}}>
            <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"flex-start"}}>
              <span style={{fontSize:20}}>📝</span>
              <div>
                <p style={{color:C.warningLight,fontWeight:800,fontSize:13,margin:"0 0 3px"}}>Deseja adicionar observação?</p>
                <p style={{color:C.text,fontSize:12,margin:0}}>{valorObsModal.item} — valor: <span style={{color:C.warningLight,fontWeight:700}}>{valores[valorObsModal.id]} {valorObsModal.unit}</span></p>
              </div>
            </div>
            <textarea value={valorObsTexto} onChange={e=>setValorObsTexto(e.target.value)} rows={3}
              placeholder="Observação opcional..."
              style={{...inputStyle,resize:"vertical",fontFamily:"inherit",marginBottom:14,borderColor:C.warningLight+"44"}}/>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setValorObsModal(null);setValorObsTexto("");}}
                style={{flex:1,padding:12,borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:13,background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted}}>
                OK — sem observação
              </button>
              <button onClick={()=>{
                setObsNok(p=>({...p,[valorObsModal.id]:valorObsTexto}));
                setValorObsModal(null);setValorObsTexto("");
              }} style={{flex:1,padding:12,borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:13,background:C.warning,border:"none",color:"#fff"}}>
                💬 Salvar observação
              </button>
            </div>
          </div>
        </div>
      )}
      {nokAlerta&&(
        <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{background:C.surface,border:`1px solid ${nokGravidade==="critico"?C.dangerLight:nokGravidade==="atencao"?C.warningLight:C.dangerLight}66`,borderRadius:"18px 18px 0 0",padding:24,width:"100%",maxWidth:600}}>
            <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"flex-start"}}>
              <span style={{fontSize:22}}>{nokGravidade==="critico"?"🔴":nokGravidade==="atencao"?"🟡":"⚠️"}</span>
              <div>
                <p style={{color:nokGravidade==="critico"?C.dangerLight:nokGravidade==="atencao"?C.warningLight:C.dangerLight,fontWeight:800,fontSize:14,margin:"0 0 3px"}}>
                  {nokGravidade===null?"Qual a gravidade?":nokGravidade==="critico"?"Crítico — risco para a máquina":"Ponto de Atenção"}
                </p>
                <p style={{color:C.text,fontSize:13,margin:0}}>{nokAlerta.item}</p>
              </div>
            </div>
            {nokGravidade===null?(
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>{setVal(nokAlerta.id,"atencao");setNokGravidade("atencao");}} style={{flex:1,padding:13,borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:13,background:C.warning,border:"none",color:"#fff"}}>⚠ Atenção</button>
                <button onClick={()=>{setVal(nokAlerta.id,"critico");setNokGravidade("critico");}} style={{flex:1,padding:13,borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:13,background:C.danger,border:"none",color:"#fff"}}>🔴 Crítico</button>
              </div>
            ):(
              <>
                <textarea value={nokObs} onChange={e=>setNokObs(e.target.value)} rows={3}
                  placeholder="Descreva o que observou..."
                  style={{...inputStyle,resize:"vertical",fontFamily:"inherit",marginBottom:14,
                    borderColor:nokGravidade==="critico"?C.dangerLight+"66":C.warningLight+"66"}}/>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>{
                    setObsNok(p=>({...p,[nokAlerta.id]:nokObs}));
                    setNokAlerta(null);setNokGravidade(null);setNokObs("");
                  }} style={{...btnSec,flex:1}}>Salvar</button>
                  <button onClick={()=>{
                    setObsNok(p=>({...p,[nokAlerta.id]:nokObs}));
                    setNokAlerta(null);setNokGravidade(null);setNokObs("");
                  }} style={{...btnPrim,flex:1,background:nokGravidade==="critico"?C.danger:C.warning}}>🗒 Salvar + Abrir Nota</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <h2 style={{color:C.white,fontSize:19,fontWeight:800,marginBottom:4}}>Check-list</h2>
      <p style={{color:C.textMuted,fontSize:12,marginBottom:12}}>Selecione a área e o tipo de verificação</p>

      {/* Seletor de área */}
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {AREAS.filter(a=>!a.disabled).map(a=>(
          <button key={a.id} onClick={()=>{setAreaFiltro(a.id);const primeiro=CATALOGO.find(c=>c.area===a.id);if(primeiro)setTipoId(primeiro.id);setValores({});setFotos({});setSalvo(false);}} style={{flex:1,padding:"8px 6px",borderRadius:10,cursor:"pointer",background:areaFiltro===a.id?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${areaFiltro===a.id?"rgba(255,255,255,0.55)":C.border}`,color:areaFiltro===a.id?C.white:C.textMuted,fontWeight:700,fontSize:11,textAlign:"center",boxShadow:areaFiltro===a.id?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4),0 0 40px rgba(80,144,255,0.2)":"none"}}>
            <div style={{fontSize:9,marginTop:2}}>{a.label}</div>
          </button>
        ))}
      </div>

      {/* Seletor de tipo */}
      <div style={{marginBottom:14,position:"relative"}}>
        <button onClick={()=>setSelectorAberto(p=>!p)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:C.card,border:`2px solid ${C.accentLight}55`,borderRadius:12,padding:"12px 16px",cursor:"pointer",transition:"border-color .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.accentLight} onMouseLeave={e=>e.currentTarget.style.borderColor=C.accentLight+"55"}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{textAlign:"left"}}>
              <div style={{color:C.white,fontWeight:800,fontSize:14}}>{tipo?.label}</div>
              <div style={{color:C.textMuted,fontSize:11,marginTop:1}}>{tipo?.desc}</div>
            </div>
          </div>
          <span style={{color:C.textMuted,fontSize:18,transform:selectorAberto?"rotate(180deg)":"none",transition:"transform .2s"}}>⌄</span>
        </button>
        {selectorAberto&&(
          <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,zIndex:50,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",boxShadow:"0 8px 24px #00000066"}}>
            {catalogo_area.map(c=>(
              <button key={c.id} onClick={()=>trocarTipo(c.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"13px 16px",background:tipoId===c.id?C.card:"transparent",border:"none",borderBottom:`1px solid ${C.border}`,cursor:"pointer",textAlign:"left",borderLeft:`3px solid ${tipoId===c.id?C.accent:"transparent"}`}}>
                <div>
                  <div style={{color:tipoId===c.id?C.white:C.text,fontWeight:700,fontSize:13}}>{c.label}</div>
                  <div style={{color:C.textMuted,fontSize:11,marginTop:1}}>{c.desc}</div>
                </div>
                {tipoId===c.id&&<span style={{marginLeft:"auto",color:C.accentLight,fontSize:16}}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Branch: ENF / Rejeição / WFT / padrão */}
      {tipo?.tipo==="rota_enf"?(
        <RotaEnfardamentoTela onSalvar={onSalvar} maquina={maquina} turno={turno} letra={letra} opPU={opPU} opPainel={opPainel} data={data}/>
      ):tipo?.tipo==="rotina_h2"?(
        <RotinaH2Tela onSalvar={onSalvar} opPU={opPU} opPainel={opPainel} data={data}/>
      ):tipo?.tipo==="enf"?(
        <EnfardamentoTela onSalvar={onSalvar} turno={turno} letra={letra} opPU={opPU} opPainel={opPainel} data={data}/>
      ):tipo?.tipo==="barcode_enf"?(
        <BarcodeSeletorTela/>
      ):tipo?.tipo==="avaria_enf"?(
        <AvariasTela onSalvar={onSalvar} turno={turno} letra={letra} opPU={opPU} opPainel={opPainel} data={data}/>
      ):tipo?.tipo==="rejeicao"?(
        <RejeicaoTela onSalvar={onSalvar} turno={turno} letra={letra} opPU={opPU} opPainel={opPainel} data={data}/>
      ):tipo?.tipo==="wft"?(
        <WFTTela onSalvar={onSalvar} turno={turno} letra={letra} opPU={opPU} opPainel={opPainel} data={data}/>
      ):tipo?.tipo==="ritmo_vapor"?(
        <RitmoVaporTela onSalvar={onSalvar} turno={turno} letra={letra} opPU={opPU} opPainel={opPainel} data={data}/>
      ):(
      <>{/* Formulário padrão */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginBottom:16}}>
        {tipo?.porMaquina&&(
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {["M2","M3"].map(m=>(
              <button key={m} onClick={()=>trocar(m)} style={{flex:1,padding:"9px",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,transition:"all .15s",background:maquina===m?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${maquina===m?"rgba(255,255,255,0.55)":C.border}`,color:maquina===m?"#fff":C.textMuted,boxShadow:maquina===m?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4),0 0 40px rgba(80,144,255,0.2)":"none"}}>
                Máquina {m.replace("M","")}<div style={{fontSize:10,fontWeight:400,opacity:.8,marginTop:1}}>{m==="M2"?"32-xx":"33-xx"}</div>
              </button>
            ))}
          </div>
        )}
        {/* Zona 1 — Sistema (automático) */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-around",background:"rgba(4,17,29,0.88)",border:"1px solid rgba(80,144,255,0.18)",borderRadius:10,padding:"7px 12px",marginBottom:12,boxShadow:"inset 0 0 20px rgba(0,0,0,0.45),0 0 8px rgba(80,144,255,0.07)"}}>
          {[
            {label:"TURNO", value:turno,  bg:"rgba(14,40,71,0.9)",  border:"rgba(26,92,204,0.4)",  color:"#5090FF"},
            {label:"LETRA", value:letra,  bg:"rgba(0,40,20,0.9)",   border:"rgba(0,230,118,0.35)", color:"#00E676"},
            {label:"DATA",  value:data.split("-").reverse().join("/"), bg:"rgba(20,30,45,0.9)", border:"rgba(255,255,255,0.12)", color:"#B5C6DA"},
            {label:"HORA",  value:(()=>{const a=new Date();return`${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`})(), bg:"rgba(20,30,45,0.9)", border:"rgba(255,255,255,0.12)", color:C.text},
          ].map(({label,value,bg,border,color},idx,arr)=>(
            <React.Fragment key={label}>
              <div style={{textAlign:"center",flex:1}}>
                <div style={{color:"rgba(255,255,255,0.22)",fontSize:7,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"monospace",marginBottom:2}}>{label}</div>
                <div style={{color,fontSize:15,fontWeight:900,letterSpacing:"0.05em",fontFamily:"monospace",whiteSpace:"nowrap"}}>{value}</div>
              </div>
              {idx<arr.length-1&&<div style={{width:1,height:26,background:"rgba(80,144,255,0.2)",flexShrink:0,margin:"0 6px"}}/>}
            </React.Fragment>
          ))}
        </div>
        {/* Zona 2 — Operador (editável) */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          <div>
            <label style={{color:C.textDim,fontSize:9,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>Operador</label>
            <input value={opPU} onChange={e=>setOpPU(e.target.value)} placeholder="Nome..." style={{...inputStyle,fontSize:12,padding:"6px 10px"}}/>
          </div>
          <div>
            <label style={{color:C.textDim,fontSize:9,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>Op. Painel</label>
            <input value={opPainel} onChange={e=>setOpPainel(e.target.value)} placeholder="Nome..." style={{...inputStyle,fontSize:12,padding:"6px 10px"}}/>
          </div>
        </div>
        {/* Progresso */}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{color:C.textMuted,fontSize:10,textTransform:"uppercase"}}>Progresso</span>
            <span style={{display:"flex",gap:10,alignItems:"center"}}>
              {noks>0&&<span style={{color:C.dangerLight,fontSize:10,fontWeight:700}}>⚠ {noks} não conforme{noks>1?"s":""}</span>}
              {totalFotos>0&&<span style={{color:C.accentLight,fontSize:10,fontWeight:700}}>📷 {totalFotos}</span>}
              <span style={{color:C.text,fontSize:11,fontWeight:700}}>{preenchidos}/{total}</span>
            </span>
          </div>
          <div style={{background:C.tagBg,borderRadius:4,height:6,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(preenchidos/total)*100}%`,background:noks>0?C.dangerLight:preenchidos===total?C.accentLight:C.accent,borderRadius:4,transition:"width .3s"}}/>
          </div>
        </div>
      </div>

      {/* Itens */}
      {Object.entries(secoes).map(([secao,itensDaSecao])=>{
        const sNoks=itensDaSecao.filter(i=>isItemNok(i,valores[i.id])).length;
        const sPreen=itensDaSecao.filter(i=>valores[i.id]!==undefined&&valores[i.id]!=="").length;
        return (
          <div key={secao} style={{marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6,padding:"0 2px"}}>
              <span style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:13}}>{iconSecao[secao]||"🔹"}</span>
                <span style={{color:C.text,fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{secao}</span>
              </span>
              <span style={{display:"flex",gap:8,alignItems:"center"}}>
                {sNoks>0&&<span style={{color:C.dangerLight,fontSize:10,fontWeight:700}}>⚠{sNoks}</span>}
                <span style={{color:C.textDim,fontSize:10}}>{sPreen}/{itensDaSecao.length}</span>
              </span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {itensDaSecao.map((item,i)=>{
                const preen=itemPreenchido(item);
                const isNok=isItemNok(item,valores[item.id]);
                const isCritico=valores[item.id]==="critico";
                const isAtencao=valores[item.id]==="atencao";
                const isDesvio=valores[item.id]==="desvio";
                const valStatus=item.tipo==="valor"?getValorStatus(item):null;
                const isAlert=valStatus==="alert";
                const isValNok=valStatus==="nok";
                // cor para valor_stepper
                const rawVS=valores[item.id]||"";
                const isVerif=verificados.has(item.id);
                const stepperCor=(()=>{
                  if(item.tipo!=="valor_stepper") return null;
                  if(!isVerif) return null; // nao verificado = sem cor
                  if(!item.faixas) return "green"; // sem regra = verde
                  const numV=parseFloat(String(rawVS).replace(",","."));
                  if(isNaN(numV)) return "green"; // verificado sem valor digitado = verde
                  for(const f of item.faixas){const okMin=f.min===undefined||numV>=f.min;const okMax=f.max===undefined||numV<f.max;if(okMin&&okMax)return f.cor;}
                  return "red";
                })();
                const stepperExatoNok=item.tipo==="valor_stepper"&&item.alertaExato&&isVerif&&rawVS&&
                  parseFloat(String(rawVS).replace(",",".")).toFixed(2)!==parseFloat(String(item.alertaExato).replace(",",".")).toFixed(2);
                const stepperNok=stepperCor==="red"||!!stepperExatoNok;
                const stepperWarn=stepperCor==="yellow";
                const nokColor=isCritico?C.dangerLight:isAtencao||isDesvio||stepperWarn?C.warningLight:C.dangerLight;
                const borderColor=isNok||isAlert||isValNok?nokColor+"66":preen?C.accentLight+"33":C.border;
                const leftColor=isNok||isAlert||isValNok?nokColor:preen?C.accentLight:"transparent";
                return (
                  <div key={item.id}
                    onClick={item.tipo==="valor_stepper"?()=>{
                      setVerificados(prev=>{
                        const s=new Set(prev);
                        if(s.has(item.id)) s.delete(item.id); else s.add(item.id);
                        return s;
                      });
                    }:undefined}
                    style={{background:C.card,borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"flex-start",gap:10,flexWrap:"wrap",border:`1px solid ${borderColor}`,borderLeft:`3px solid ${leftColor}`,cursor:item.tipo==="valor_stepper"?"pointer":"default"}}>
                    <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,background:isNok||isAlert||isValNok||stepperNok?(isCritico?C.danger:isAtencao?C.warning:C.danger):stepperWarn?C.warning:preen?C.success:C.tagBg,border:`2px solid ${isNok||isAlert||isValNok||stepperNok||stepperWarn?nokColor:preen?C.accentLight:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:800,marginTop:2}}>
                      {isNok||isAlert||isValNok||stepperNok||stepperWarn?"⚠":preen?"✓":i+1}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:C.white,fontSize:12,fontWeight:500,lineHeight:1.3,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                        <span>{item.item}</span>
                        {item.trava&&(
                          <div style={{width:10,height:10,borderRadius:"50%",flexShrink:0,
                            background:valores[item.id]==="ok"?C.accentLight:C.dangerLight,
                          }} className={valores[item.id]==="ok"?"":"trava-pulse"}/>
                        )}
                      </div>
                      {item.ref!=="—"&&<div style={{color:C.textMuted,fontSize:10,marginTop:1}}>Ref: <span style={{color:C.warningLight,fontWeight:700}}>{item.ref}</span><span style={{color:C.textDim}}> · {item.unit}</span></div>}
                      {item.hint&&<div style={{color:C.textDim,fontSize:10,marginTop:3,lineHeight:1.3,fontStyle:"italic"}}>{item.hint}</div>}
                      {(isAlert||isValNok)&&valores[item.id]&&<div style={{marginTop:4,background:"#2a080833",border:`1px solid ${C.dangerLight}44`,borderRadius:6,padding:"3px 8px",display:"inline-flex"}}><span style={{color:C.dangerLight,fontSize:10,fontWeight:700}}>{isAlert?"🔴 Abaixo do mínimo!":"⚠ Valor fora do padrão"}</span></div>}
                      {/* Faquinhas rendering com cor por faixa */}
                      {item.tipo==="faquinhas"&&(
                        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
                          {(item.refs||[]).map((ref,fi)=>{
                            const key=item.id+"_"+fi;
                            const refNum=parseRefNum(ref)||1.5;
                            const {step,min,max}=getStepRange(ref||"1.5");
                            const dec=step<1?1:0;
                            const rawVal=valores[key]||"";
                            const numVal=parseFloat((rawVal||"").replace(",","."))||refNum;
                            const st=getFaixaStatus(rawVal||ref,item.faixas);
                            const cor=corFaixa(st);
                            const adj=(d)=>{
                              const n=Math.min(max,Math.max(min,parseFloat((numVal+d).toFixed(dec))));
                              setValores(p=>({...p,[key]:n.toString().replace(".",",")}));setSalvo(false);
                            };
                            return(
                              <div key={fi} style={{textAlign:"center"}}>
                                <div style={{color:C.textMuted,fontSize:8,marginBottom:2}}>{fi+1}</div>
                                <div style={{display:"flex",alignItems:"center",gap:2}}>
                                  <button onClick={()=>adj(-step)} style={{width:22,height:22,borderRadius:5,border:`1px solid ${C.border}`,background:C.tagBg,color:C.text,fontSize:14,fontWeight:700,cursor:"pointer",lineHeight:1,padding:0}}>−</button>
                                  {editandoValor===key?(
                                    <input autoFocus type="text" inputMode="decimal"
                                      value={rawVal||refNum.toFixed(dec)}
                                      onChange={e=>{setValores(p=>({...p,[key]:e.target.value}));setSalvo(false);}}
                                      onBlur={()=>setEditandoValor(null)}
                                      onKeyDown={e=>{if(e.key==="Enter")setEditandoValor(null);}}
                                      style={{...inputStyle,width:44,textAlign:"center",padding:"2px 3px",fontSize:11,fontWeight:800,borderColor:st?cor+"88":C.warningLight+"66",color:st?cor:C.warningLight}}/>
                                  ):(
                                    <div onClick={()=>setEditandoValor(key)} style={{background:C.tagBg,border:`1px solid ${st?cor+"88":C.border}`,borderRadius:6,padding:"2px 4px",minWidth:34,textAlign:"center",cursor:"pointer"}}>
                                      <div style={{color:st?cor:C.text,fontSize:10,fontWeight:800}}>{rawVal||refNum.toFixed(dec)}</div>
                                    </div>
                                  )}
                                  <button onClick={()=>adj(+step)} style={{width:22,height:22,borderRadius:5,border:`1px solid ${C.border}`,background:C.tagBg,color:C.text,fontSize:14,fontWeight:700,cursor:"pointer",lineHeight:1,padding:0}}>+</button>
                                </div>
                                <div style={{fontSize:7,color:cor||C.textDim,marginTop:1,fontWeight:700}}>{st==="normal"?"N":st==="atencao"?"A":st==="critico"?"C":ref}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {/* Facão por fardo: grade de níveis OK/Baixo/Médio/Alto */}
                      {item.tipo==="facao_fardos"&&(
                        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                          {Array.from({length:item.fardos||12}).map((_,fi)=>{
                            const key=item.id+"_"+fi;
                            const val=valores[key]||"";
                            const NIVEIS=[
                              {id:"ok",label:"OK",cor:"#00E676"},
                              {id:"baixo",label:"Crit. Baixa",cor:"#FFC107"},
                              {id:"medio",label:"Crit. Média",cor:"#FF8C00"},
                              {id:"alto",label:"Crit. Alta",cor:"#FF5252"},
                            ];
                            const atual=NIVEIS.find(n=>n.id===val);
                            return(
                              <div key={fi} style={{textAlign:"center",background:C.tagBg,border:`1px solid ${atual?atual.cor+"66":C.border}`,borderRadius:8,padding:"6px 7px"}}>
                                <div style={{color:atual?atual.cor:C.textMuted,fontSize:9,fontWeight:800,marginBottom:4}}>Fardo {fi+1}</div>
                                <div style={{display:"flex",gap:3}}>
                                  {NIVEIS.map(n=>{
                                    const ativo=val===n.id;
                                    return(
                                      <button key={n.id} onClick={()=>{setValores(p=>({...p,[key]:ativo?"":n.id}));setSalvo(false);}}
                                        style={{width:24,height:22,borderRadius:5,cursor:"pointer",fontSize:8,fontWeight:800,lineHeight:1,padding:0,
                                          background:ativo?n.cor:C.surface,border:`1px solid ${ativo?n.cor:C.border}`,
                                          color:ativo?"#fff":n.cor,transition:"all .12s"}}>
                                        {n.label.slice(0,1)}
                                      </button>
                                    );
                                  })}
                                </div>
                                {atual&&<div style={{fontSize:7,color:atual.cor,marginTop:3,fontWeight:700}}>{atual.label}</div>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {/* Controles */}
                    <div style={{display:"flex",gap:4,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end",marginTop:2}}>
                      {item.tipo==="ok_nok"&&(
                      <>
                        <Btn id={item.id} opcao="ok" label="OK" isOk={true}/>
                        {tipo?.passagem?(
                          <button onClick={()=>setVal(item.id,valores[item.id]==="desvio"?undefined:"desvio")}
                            style={{padding:"5px 11px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s",
                              border:isDesvio?"none":`1px solid ${C.border}`,
                              background:isDesvio?C.warning:C.tagBg,
                              color:isDesvio?"#fff":C.textMuted}}>NOK</button>
                        ):(
                          <button onClick={()=>{
                            const v=valores[item.id];
                            if(v==="atencao"||v==="critico"){setVal(item.id,undefined);}
                            else{setNokAlerta(item);setNokGravidade(null);}
                          }} style={{padding:"5px 11px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s",
                            border:isNok?"none":`1px solid ${C.border}`,
                            background:isCritico?C.danger:isAtencao?C.warning:C.tagBg,
                            color:isNok?"#fff":C.textMuted}}>NOK</button>
                        )}
                      </>
                    )}
                      {item.tipo==="sim_nao"&&<><Btn id={item.id} opcao="sim" label="SIM" isOk={item.respostaOk==="nao"?false:true}/><Btn id={item.id} opcao="nao" label="NÃO" isOk={item.respostaOk==="nao"?true:false}/></>}
                      {item.tipo==="valor"&&(tipo?.passagem?(
                      <>
                        <button onClick={()=>{setVal(item.id,"ok");setPassagemNokDados(p=>{const n={...p};delete n[item.id];return n;});setPassagemNokAberto(null);}}
                          style={{padding:"5px 11px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s",
                            border:valores[item.id]==="ok"?"none":`1px solid ${C.border}`,
                            background:valores[item.id]==="ok"?C.success:C.tagBg,
                            color:valores[item.id]==="ok"?"#fff":C.textMuted}}>OK</button>
                        {passagemNokAberto===item.id||isDesvio?(
                          <input autoFocus={passagemNokAberto===item.id}
                            placeholder="valor..."
                            value={passagemNokDados[item.id]?.valor||""}
                            onChange={e=>setPassagemNokDados(p=>({...p,[item.id]:{...(p[item.id]||{}),valor:e.target.value}}))}
                            onBlur={()=>{setVal(item.id,"desvio");setPassagemNokAberto(null);}}
                            onKeyDown={e=>{if(e.key==="Enter"){setVal(item.id,"desvio");setPassagemNokAberto(null);}}}
                            style={{...inputStyle,width:68,textAlign:"center",padding:"4px 6px",fontSize:11,
                              borderColor:C.warningLight+"66",
                              color:isDesvio&&passagemNokDados[item.id]?.valor?C.warningLight:C.text}}/>
                        ):(
                          <button onClick={()=>setPassagemNokAberto(item.id)}
                            style={{padding:"5px 11px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s",
                              border:`1px solid ${C.border}`,background:C.tagBg,color:C.textMuted}}>NOK</button>
                        )}
                      </>
                    ):<>
                        <button onClick={()=>{setVal(item.id,"ok");setPassagemNokAberto(null);}}
                          style={{padding:"5px 11px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s",
                            border:valores[item.id]==="ok"?"none":`1px solid ${C.border}`,
                            background:valores[item.id]==="ok"?C.success:C.tagBg,
                            color:valores[item.id]==="ok"?"#fff":C.textMuted}}>OK</button>
                        {(passagemNokAberto===item.id||(valores[item.id]&&valores[item.id]!=="ok"))?(()=>{
                          const{step,min,max}=getStepRange(item.ref);
                          const dec=step<1?1:0;
                          const rawVal=valores[item.id]&&valores[item.id]!=="ok"?valores[item.id]:"";
                          const numVal=parseFloat((rawVal||"").replace(",","."))||parseRefNum(item.ref);
                          const adj=(d)=>{
                            const n=Math.min(max,Math.max(min,parseFloat((numVal+d).toFixed(dec))));
                            const s=n.toString().replace(".",",");
                            setVal(item.id,s);
                          };
                          const confirmar=()=>{
                            setPassagemNokAberto(null);
                            if(valores[item.id]&&valores[item.id]!=="ok"){
                              setValorObsModal(item);setValorObsTexto(obsNok[item.id]||"");
                            }
                          };
                          return(
                            <div style={{display:"flex",alignItems:"center",gap:3}}>
                              <button onClick={()=>adj(-step)} style={{width:30,height:30,borderRadius:7,border:`1px solid ${C.border}`,background:C.tagBg,color:C.text,fontSize:18,fontWeight:700,cursor:"pointer",lineHeight:1}}>−</button>
                              {editandoValor===item.id?(
                                <input autoFocus type="text" inputMode="decimal"
                                  value={rawVal||numVal.toFixed(dec)}
                                  onChange={e=>setVal(item.id,e.target.value)}
                                  onBlur={()=>{setEditandoValor(null);confirmar();}}
                                  onKeyDown={e=>{if(e.key==="Enter"){setEditandoValor(null);confirmar();}}}
                                  style={{...inputStyle,width:60,textAlign:"center",padding:"3px 6px",fontSize:13,fontWeight:800,borderColor:C.warningLight+"88",color:C.warningLight}}/>
                              ):(
                                <button onClick={()=>setEditandoValor(item.id)} style={{background:C.tagBg,border:`1px solid ${C.warningLight}66`,borderRadius:7,padding:"3px 8px",minWidth:52,textAlign:"center",cursor:"pointer"}}>
                                  <div style={{color:C.warningLight,fontSize:12,fontWeight:900}}>{rawVal||numVal.toFixed(dec)}</div>
                                  <div style={{color:C.textDim,fontSize:8}}>{item.unit}</div>
                                </button>
                              )}
                              <button onClick={()=>adj(+step)} style={{width:30,height:30,borderRadius:7,border:`1px solid ${C.border}`,background:C.tagBg,color:C.text,fontSize:18,fontWeight:700,cursor:"pointer",lineHeight:1}}>+</button>
                            </div>
                          );
                        })():(
                          <button onClick={()=>{
                            const def=getLastValores(tipoId,maquina)[item.id]||parseRefNum(item.ref).toFixed(getStepRange(item.ref).step<1?1:0).replace(".",",");
                            setVal(item.id,def||"");
                            setPassagemNokAberto(item.id);
                          }} style={{padding:"5px 11px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s",border:`1px solid ${C.border}`,background:C.tagBg,color:C.textMuted}}>NOK</button>
                        )}
                      </>)}
                      {item.tipo==="valor_direto"&&(()=>{
                        const v=valores[item.id]||"";
                        const n=parseFloat(String(v).replace(",","."));
                        const okVerde=!isNaN(n)&&(item.velMin===undefined||n>=item.velMin);
                        return (
                          <div style={{display:"flex",alignItems:"center",gap:4}}>
                            <input inputMode="decimal" placeholder={item.ref}
                              value={v} onChange={e=>setVal(item.id,e.target.value)}
                              style={{...inputStyle,width:72,textAlign:"center",padding:"5px 6px",fontSize:13,fontWeight:800,
                                borderColor:okVerde?C.accentLight+"88":v?C.warningLight+"66":C.border,
                                color:okVerde?C.accentLight:v?C.warningLight:C.text}}/>
                            <span style={{color:C.textDim,fontSize:10}}>{item.unit}</span>
                          </div>
                        );
                      })()}
                      {item.tipo==="valor_stepper"&&(()=>{
                        const step=item.step||1;
                        const dec=step<1?(step<0.05?2:1):0;
                        const rawV=valores[item.id]||"";
                        const numV=parseFloat(String(rawV).replace(",","."));
                        const refN=parseRefNum(item.ref);
                        const stepperDefault=item.ref&&String(item.ref).includes("<")?0:refN;
                        const displayN=isNaN(numV)?stepperDefault:numV;
                        // calcular cor pelas faixas
                        const getCor=()=>{
                          if(!rawV||isNaN(numV)) return null;
                          if(!item.faixas) return "green";
                          for(const f of item.faixas){
                            const okMin=f.min===undefined||numV>=f.min;
                            const okMax=f.max===undefined||numV<f.max;
                            if(okMin&&okMax) return f.cor;
                          }
                          return "red";
                        };
                        const cor=getCor();
                        const borderCol=cor==="green"?C.accentLight+"88":cor==="yellow"?C.warningLight+"88":cor==="red"?C.dangerLight+"88":C.border;
                        const textCol=cor==="green"?C.accentLight:cor==="yellow"?C.warningLight:cor==="red"?C.dangerLight:C.text;
                        const adj=(d)=>{
                          const cur=isNaN(numV)?refN:numV;
                          const next=parseFloat((cur+d).toFixed(dec));
                          setVal(item.id,String(next).replace(".",","));
                        };
                        return(
                          <div onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",gap:4}}>
                            <button onClick={()=>adj(-step)} style={{width:30,height:30,borderRadius:7,border:`1px solid ${C.border}`,background:C.tagBg,color:C.text,fontSize:18,fontWeight:700,cursor:"pointer",lineHeight:1}}>-</button>
                            {editandoValor===item.id?(
                              <input autoFocus type="text" inputMode="decimal"
                                value={rawV||displayN.toFixed(dec)}
                                onChange={e=>setVal(item.id,e.target.value)}
                                onFocus={e=>{e.target.select();if(!rawV){setVal(item.id,"");}}}
                                onBlur={()=>setEditandoValor(null)}
                                onKeyDown={e=>{if(e.key==="Enter")setEditandoValor(null);}}
                                style={{...inputStyle,width:64,textAlign:"center",padding:"3px 6px",fontSize:14,fontWeight:800,borderColor:borderCol,color:textCol}}/>
                            ):(
                              <button onClick={()=>{if(!rawV)setVal(item.id,"");setEditandoValor(item.id);}}
                                style={{background:C.tagBg,border:`2px solid ${borderCol}`,borderRadius:7,padding:"3px 10px",
                                  minWidth:64,textAlign:"center",cursor:"pointer",
                                  boxShadow:cor?`0 0 8px ${textCol}44`:"none"}}>
                                <div style={{color:textCol,fontSize:14,fontWeight:900}}>{rawV||displayN.toFixed(dec)}</div>
                                <div style={{color:C.textDim,fontSize:8}}>{item.unit}</div>
                              </button>
                            )}
                            <button onClick={()=>adj(+step)} style={{width:30,height:30,borderRadius:7,border:`1px solid ${C.border}`,background:C.tagBg,color:C.text,fontSize:18,fontWeight:700,cursor:"pointer",lineHeight:1}}>+</button>
                          </div>
                        );
                      })()}
                      {item.tipo==="duplo_valor"&&(
                        <div style={{display:"flex",gap:4,alignItems:"center"}}>
                          <div style={{textAlign:"center"}}>
                            <div style={{color:C.textMuted,fontSize:8,marginBottom:2}}>F</div>
                            <input placeholder="F" value={valores[item.id+"_f"]||""} onChange={e=>setVal(item.id+"_f",e.target.value)} style={{...inputStyle,width:52,textAlign:"center",padding:"4px 4px",fontSize:11}}/>
                          </div>
                          <div style={{textAlign:"center"}}>
                            <div style={{color:C.textMuted,fontSize:8,marginBottom:2}}>C</div>
                            <input placeholder="C" value={valores[item.id+"_c"]||""} onChange={e=>setVal(item.id+"_c",e.target.value)} style={{...inputStyle,width:52,textAlign:"center",padding:"4px 4px",fontSize:11}}/>
                          </div>
                        </div>
                      )}
                      {item.tipo!=="faquinhas"&&<BotaoFoto compact fotos={fotos[item.id]||[]} onAdd={src=>addFotoItem(item.id,src)} onRemove={idx=>removeFotoItem(item.id,idx)}/>}
                    </div>

                    {tipo?.passagem&&isDesvio&&passagemNokDados[item.id]&&passagemNokAberto!==item.id&&(
                      <div style={{width:"100%",marginTop:6,background:"#2a180033",border:`1px solid ${C.warningLight}44`,borderRadius:7,padding:"6px 10px"}}>
                        <span style={{color:C.warningLight,fontSize:11,fontWeight:700}}>Valor: {passagemNokDados[item.id].valor}</span>
                        {passagemNokDados[item.id].obs&&<p style={{color:C.textMuted,fontSize:10,margin:"2px 0 0",fontStyle:"italic"}}>"{passagemNokDados[item.id].obs}"</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {noks>0&&(
        <div style={{background:"#2a080833",border:`1px solid ${C.dangerLight}55`,borderRadius:10,padding:"12px 14px",marginBottom:14}}>
          <p style={{color:C.dangerLight,fontWeight:700,fontSize:12,margin:"0 0 6px"}}>⚠ {noks} item{noks>1?"s":""} não conforme{noks>1?"s":""}</p>
          {items.filter(i=>isItemNok(i,valores[i.id])).map(i=>(<div key={i.id} style={{color:C.textMuted,fontSize:11,marginBottom:2}}>· {i.secao} — {i.item}</div>))}
        </div>
      )}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:14,marginBottom:14}}>
        <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:8}}>Observações do Turno</label>
        <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={3} placeholder="Anomalias, ocorrências..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/>
      </div>
      <button onClick={handleFinalizar} style={{width:"100%",padding:13,border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,background:salvo?C.accentDark:preenchidos===total?(noks>0?C.warning:C.success):C.textDim,cursor:preenchidos===total&&!salvo?"pointer":"not-allowed",transition:"background .3s"}}>
        {salvo?"✓ Check-list salvo no Histórico!":preenchidos===total?(noks>0?`⚠ Finalizar com ${noks} não conforme${noks>1?"s":""}`:
          "✓ Finalizar e Salvar"):`Preencha todos os itens (${total-preenchidos} restantes)`}
      </button>
      </>)}
    </div>
  );
}

// ─── ManualTela ───────────────────────────────────────────────────────────────
function ManualTela() {
  const [aberta,setAberta]=useState(null);
  const secoes=[
    {id:"s1",titulo:"Caixa de Entrada",subs:["Localização","Componentes principais","Função básica"]},
    {id:"s2",titulo:"Formador de Tela Dupla (TWF)",subs:["Localização","Componentes principais","Função básica"]},
    {id:"s3",titulo:"Caixa Sopradora & Sucção Plana",subs:["Localização","Componentes","Função básica"]},
    {id:"s4",titulo:"Pichasso Móvel e Fixo",subs:["Localização","Função básica"]},
    {id:"s5",titulo:"Caixa de Vácuo",subs:["Localização","Componentes","Função básica"]},
    {id:"s6",titulo:"Rolo Abridor da Folha",subs:["Localização","Função básica"]},
    {id:"s7",titulo:"Condicionamento de Telas e Feltros",subs:["Localização","Componentes","Função básica"]},
    {id:"s8",titulo:"Troca de Telas & Feltros",subs:["Procedimento geral","Instalação de feltros"]},
    {id:"s9",titulo:"Seção de Prensa (Combipress)",subs:["Localização","Componentes","Função básica"]},
    {id:"s10",titulo:"Processamento de Quebras",subs:["Transportador de quebras","Desagregador"]},
  ];
  return (
    <div>
      <h2 style={{color:C.white,fontSize:19,fontWeight:800,marginBottom:4}}>Manual de Operação</h2>
      <p style={{color:C.textMuted,fontSize:12,marginBottom:16}}>Parte Úmida — Treinamento Andritz / Suzano</p>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {secoes.map((s,i)=>(
          <div key={s.id} style={{background:C.card,border:`1px solid ${aberta===s.id?C.accent:C.border}`,borderRadius:11,overflow:"hidden",transition:"border-color .15s"}}>
            <button onClick={()=>setAberta(aberta===s.id?null:s.id)} style={{width:"100%",background:"none",border:"none",padding:"12px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",color:C.text,textAlign:"left"}}>
              <span style={{width:24,height:24,borderRadius:6,background:C.tagBg,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:C.accent,flexShrink:0}}>{i+1}</span>
              <span style={{flex:1,fontWeight:600,fontSize:13}}>{s.titulo}</span>
              <span style={{color:C.textMuted,fontSize:16,transition:"transform .2s",transform:aberta===s.id?"rotate(90deg)":"none"}}>›</span>
            </button>
            {aberta===s.id&&(
              <div style={{padding:"0 14px 12px 48px",borderTop:`1px solid ${C.border}`}}>
                {s.subs.map((st,j)=>(
                  <div key={j} style={{padding:"8px 0",borderBottom:j<s.subs.length-1?`1px solid ${C.border}`:"none",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{color:C.textMuted,fontSize:12}}>{st}</span>
                    <button style={{background:"none",border:`1px solid ${C.border}`,color:C.accent,borderRadius:5,padding:"3px 10px",cursor:"pointer",fontSize:11}}>Ver →</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cálculo de Eficiência de Lançamento ──────────────────────────────────────
// Mede: turnos em que a letra LANÇOU ÷ turnos em que ela DEVERIA lançar.
// Baseado na escala (calcularLetra). Denominador = turnos escalados desde a BASE.
// Áreas: PU (rotina), CS (cortadeira), ENF (rota_enf + enf_qualidade×2 peso).
function letraDoTurno(dataObj, turnoIdx) {
  // Replica calcularLetra() para uma data/turno arbitrário
  const SEQUENCIA = ["E","D","A","B","C"];
  const BASE = new Date("2026-06-09T00:00:00");
  const diasPassados = Math.floor((dataObj - BASE) / (1000*60*60*24));
  const blocoAtual = ((Math.floor(diasPassados / 2) % 5) + 5) % 5;
  const indice = ((blocoAtual - turnoIdx) % 5 + 5) % 5;
  return SEQUENCIA[indice];
}
function turnoDoHorario(hhmm) {
  // "HH:MM" -> 0,1,2
  const h = parseInt((hhmm||"00:00").split(":")[0],10);
  return h < 8 ? 0 : h < 16 ? 1 : 2;
}
function calcularEficiencia(historico, mesAno, filtroMaq) {
  // mesAno: "2026-06". filtroMaq: "ambas" | "M2" | "M3" (default "ambas").
  const maqF = filtroMaq || "ambas";
  const BASE = new Date("2026-06-09T00:00:00");
  const agora = new Date();
  const letras = ["A","B","C","D","E"];
  const [anoF, mesF] = (mesAno || `${agora.getFullYear()}-${String(agora.getMonth()+1).padStart(2,"0")}`).split("-").map(Number);
  const inicioMes = new Date(anoF, mesF-1, 1, 0,0,0);
  const fimMes = new Date(anoF, mesF, 1, 0,0,0);
  const limiteSup = agora < fimMes ? agora : fimMes;
  // Esperado por turno, por máquina (conforme a tabela):
  //   PU rotina: M2=1, M3=1   |   CS cortadeira: M2=1, M3=1
  //   ENF qualidade: M2=4 (L4,L5 ×2), M3=6 (L6,L7,L8 ×2)
  const AREAS = {
    pu:  { label:"P. Úmida",     tipos:["rotina"],     esp:{M2:1, M3:1} },
    cs:  { label:"Cortadeira",   tipos:["cortadeira"], esp:{M2:1, M3:1} },
    enf: { label:"Enfardamento", tipos:["enf_qualidade"], esp:{M2:4, M3:6} },
  };
  // Quais máquinas somar conforme o filtro
  const maquinas = maqF==="ambas" ? ["M2","M3"] : [maqF];
  // Linhas → máquina (pra identificar lançamentos do enfardamento por linha)
  const LINHAS_M2=["L4","L5"], LINHAS_M3=["L6","L7","L8"];
  const maquinaDoLancamento=(h)=>{
    if(h.linha) return LINHAS_M2.includes(h.linha)?"M2":LINHAS_M3.includes(h.linha)?"M3":null;
    if(h.maquina==="M2"||h.maquina==="M3") return h.maquina;
    return null;
  };

  const cont = {};
  letras.forEach(l=>{ cont[l]={lancamentos:0}; Object.keys(AREAS).forEach(a=>{ cont[l][a]={esperado:0,feito:0}; }); });

  // 1) Denominador: turnos escalados no mês × esperado por máquina (filtrado)
  const umDia = 1000*60*60*24;
  let cursor = inicioMes < BASE ? new Date(BASE) : new Date(inicioMes);
  cursor.setHours(0,0,0,0);
  for(; cursor < limiteSup; cursor = new Date(cursor.getTime()+umDia)){
    for(let t=0; t<3; t++){
      const inicioTurno = new Date(cursor); inicioTurno.setHours(t*8,0,0,0);
      if(inicioTurno < BASE) continue;
      if(inicioTurno >= limiteSup) continue;
      if(inicioTurno < inicioMes) continue;
      const letra = letraDoTurno(cursor, t);
      if(!cont[letra]) continue;
      Object.entries(AREAS).forEach(([a,def])=>{
        maquinas.forEach(m=>{ cont[letra][a].esperado += (def.esp[m]||0); });
      });
    }
  }
  // 2) Numerador: lançamentos do mês, filtrados por máquina
  historico.forEach(h=>{
    if(!h.letra || !h.data || !cont[h.letra]) return;
    const [hy,hm] = h.data.split("-").map(Number);
    if(hy!==anoF || hm!==mesF) return;
    const maqL = maquinaDoLancamento(h);
    if(maqF!=="ambas" && maqL!==maqF) return; // fora da máquina filtrada
    // Acha a área do tipo lançado
    for(const [a,def] of Object.entries(AREAS)){
      if(def.tipos.includes(h.tipoId)){
        // Enfardamento qualidade conta peso 2 por lançamento (lançado 2× por linha)
        const peso = h.tipoId==="enf_qualidade" ? 2 : 1;
        cont[h.letra][a].feito += peso;
        cont[h.letra].lancamentos += 1;
        break;
      }
    }
  });
  // 3) Percentuais (cap 100%)
  const pct = (feito,esp)=> esp>0 ? Math.min(100, Math.round(feito/esp*100)) : null;
  const resultado = letras.map(l=>{
    const areas = {};
    let somaFeito=0, somaEsp=0;
    Object.keys(AREAS).forEach(a=>{
      const {esperado,feito}=cont[l][a];
      areas[a]=pct(feito,esperado);
      somaFeito+=feito; somaEsp+=esperado;
    });
    return { letra:l, geral:pct(somaFeito,somaEsp), areas, lancamentos:cont[l].lancamentos };
  });
  return { resultado, AREAS };
}

// ─── GraficoLetras ───────────────────────────────────────────────────────────
function GraficoLetrasAntigo({ historico }) {
  const letras=["A","B","C","D","E"];
  const dadosRaw=letras.map(l=>{
    const todos=historico.filter(h=>h.letra===l);
    const semNok=todos.filter(h=>h.noks===0).length;
    const efic=todos.length>0?Math.round(semNok/todos.length*100):null;
    return{letra:l,total:todos.length,semNok,comNok:todos.length-semNok,efic};
  });
  const maxVal=Math.max(...dadosRaw.map(d=>d.total),1);
  const corEfic=(e)=>e===null?C.textDim:e>=80?C.accentLight:e>=50?C.warningLight:C.dangerLight;
  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <span style={{color:C.white,fontWeight:800,fontSize:13}}>Lançamentos e Eficiência por Letra</span>
        <div style={{display:"flex",gap:10}}>
          {[[C.accentLight,"≥80%"],[C.warningLight,"50-79%"],[C.dangerLight,"<50%"]].map(([clr,lbl])=>(
            <div key={lbl} style={{display:"flex",alignItems:"center",gap:3}}>
              <div style={{width:8,height:8,borderRadius:2,background:clr}}/><span style={{color:C.textMuted,fontSize:9}}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"flex-end",height:90}}>
        {dadosRaw.map(d=>{
          const barH=d.total===0?4:Math.max(12,Math.round((d.total/maxVal)*74));
          const cor=corEfic(d.efic);
          return (
            <div key={d.letra} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{textAlign:"center",minHeight:28}}>
                {d.total>0&&<><div style={{color:C.white,fontSize:12,fontWeight:800,lineHeight:1}}>{d.total}</div><div style={{color:cor,fontSize:9,fontWeight:700,marginTop:1}}>{d.efic!==null?`${d.efic}%`:"—"}</div></>}
              </div>
              <div style={{width:"100%",height:barH,borderRadius:"5px 5px 0 0",background:d.total===0?C.tagBg:`linear-gradient(180deg,${cor} 0%,${cor}bb 100%)`,border:d.total>0?`1px solid ${cor}66`:`1px solid ${C.border}`,boxShadow:d.total>0?`0 0 8px ${cor}33`:"none",transition:"height .4s ease"}}/>
              <div style={{width:28,height:28,borderRadius:8,background:d.total>0?C.blue:C.tagBg,display:"flex",alignItems:"center",justifyContent:"center",color:d.total>0?"#fff":C.textDim,fontSize:13,fontWeight:800}}>{d.letra}</div>
            </div>
          );
        })}
      </div>
      <div style={{height:1,background:C.border,margin:"0 0 8px"}}/>
      <div style={{color:C.textDim,fontSize:10,textAlign:"center"}}>Total de check-lists salvos no dispositivo</div>
    </div>
  );
}

// ─── GraficoEficienciaLimpeza — módulo de eficiência de chuveiros ─────────────
function GraficoEficienciaLimpeza(){
  const [maqF,setMaqF]=useState("todas");
  const [letraF,setLetraF]=useState("todas");
  const stats=React.useMemo(()=>estatisticasChuveiros({maq:maqF,letra:letraF}),[maqF,letraF]);
  const corEfic=(p)=>p>=80?C.accentLight:p>=60?C.warningLight:C.dangerLight;
  const maxLetra=Math.max(1,...Object.values(stats.porLetra));

  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.accentLight}`,borderRadius:14,padding:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        <IconeChuveiro cor={C.accentLight} tipo="leque" size={22}/>
        <span style={{color:C.white,fontWeight:800,fontSize:14,letterSpacing:"0.02em"}}>Eficiência de Limpeza</span>
      </div>
      <div style={{color:C.textDim,fontSize:10,marginBottom:14}}>Escovações do mês por letra, operador e máquina — cruzando com a eficiência de cada linha.</div>

      {/* eficiência por máquina (gauges) */}
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        {[["M2",stats.eficM2],["M3",stats.eficM3]].map(([m,pct])=>(
          <div key={m} style={{flex:1,background:C.tagBg,border:`1px solid ${corEfic(pct)}44`,borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
            <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.08em"}}>{m}</div>
            <div style={{color:corEfic(pct),fontWeight:900,fontSize:24,fontFamily:"monospace",textShadow:`0 0 10px ${corEfic(pct)}55`}}>{pct}%</div>
            <div style={{color:C.textDim,fontSize:8}}>{stats.porMaquina[m]||0} escovas</div>
          </div>
        ))}
      </div>

      {/* filtro máquina */}
      <div style={{display:"flex",gap:5,marginBottom:8}}>
        {[{id:"todas",l:"Ambas"},{id:"M2",l:"Máq. 2"},{id:"M3",l:"Máq. 3"}].map(o=>(
          <button key={o.id} onClick={()=>setMaqF(o.id)} style={{flex:1,padding:"7px 4px",borderRadius:8,cursor:"pointer",fontWeight:800,fontSize:11,border:`1.5px solid ${maqF===o.id?C.blueLight:C.border}`,background:maqF===o.id?C.blue:C.tagBg,color:maqF===o.id?"#fff":C.textMuted}}>{o.l}</button>
        ))}
      </div>
      {/* filtro letra */}
      <div style={{display:"flex",gap:5,marginBottom:16}}>
        {[{id:"todas",l:"Todas"},{id:"A",l:"A"},{id:"B",l:"B"},{id:"C",l:"C"},{id:"D",l:"D"},{id:"E",l:"E"}].map(l=>(
          <button key={l.id} onClick={()=>setLetraF(l.id)} style={{flex:1,padding:"6px 4px",borderRadius:8,cursor:"pointer",fontWeight:800,fontSize:11,border:`1.5px solid ${letraF===l.id?C.accent:C.border}`,background:letraF===l.id?C.accentDark:C.tagBg,color:letraF===l.id?C.white:C.textMuted}}>{l.l}</button>
        ))}
      </div>

      {/* barras por letra (quem lança mais) */}
      <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Escovações por letra</div>
      <div style={{display:"flex",gap:10,alignItems:"flex-end",height:120,marginBottom:8}}>
        {Object.entries(stats.porLetra).map(([L,n])=>{
          const barH=n===0?3:Math.max(6,Math.round((n/maxLetra)*120));
          return(
            <div key={L} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
              {n>0&&<div style={{color:C.accentLight,fontSize:13,fontWeight:900,marginBottom:4}}>{n}</div>}
              <div style={{width:"70%",maxWidth:42,height:barH,borderRadius:"6px 6px 0 0",background:n===0?C.tagBg:`linear-gradient(180deg,${C.accentLight},${C.accentLight}88)`,border:`1px solid ${n===0?C.border:C.accentLight}`,boxShadow:n>0?`0 0 10px ${C.accentLight}44`:"none",transition:"height .5s"}}/>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        {Object.keys(stats.porLetra).map(L=>(
          <div key={L} style={{flex:1,display:"flex",justifyContent:"center"}}>
            <div style={{width:30,height:30,borderRadius:9,background:C.tagBg,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:C.textMuted,fontSize:14,fontWeight:900}}>{L}</div>
          </div>
        ))}
      </div>

      {/* ranking operadores */}
      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
        <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Operadores que mais escovaram</div>
        {stats.rankOperadores.length===0?(
          <div style={{color:C.textDim,fontSize:11,textAlign:"center",padding:"14px 0"}}>Nenhuma escovação no mês com esses filtros.</div>
        ):stats.rankOperadores.slice(0,8).map((r,i)=>(
          <div key={r.operador} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<stats.rankOperadores.length-1?`1px solid ${C.border}`:"none"}}>
            <span style={{color:i===0?C.warningLight:C.textDim,fontWeight:900,fontSize:13,width:22,fontFamily:"monospace"}}>{i===0?"🥇":`${i+1}º`}</span>
            <span style={{flex:1,color:C.text,fontWeight:700,fontSize:12}}>{r.operador}</span>
            <span style={{color:C.accentLight,fontWeight:900,fontSize:15,fontFamily:"monospace"}}>{r.total}</span>
          </div>
        ))}
        <div style={{color:C.textDim,fontSize:10,textAlign:"right",marginTop:8}}>Total: <span style={{color:C.textMuted,fontWeight:700}}>{stats.total}</span> escovações</div>
      </div>

      {/* justificativas de não-limpeza */}
      {stats.totalJustif>0&&(
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em"}}>Justificativas de não-limpeza</span>
            <span style={{color:C.warningLight,fontWeight:900,fontSize:15,fontFamily:"monospace"}}>{stats.totalJustif}</span>
          </div>
          {Object.entries(stats.porMotivo).sort((a,b)=>b[1]-a[1]).map(([motivo,n])=>(
            <div key={motivo} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:C.warningLight,flexShrink:0}}/>
              <span style={{flex:1,color:C.textMuted,fontSize:11}}>{motivo}</span>
              <span style={{color:C.warningLight,fontWeight:800,fontSize:12,fontFamily:"monospace"}}>{n}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── EficienciaHub — seletor de módulos de eficiência (extensível) ────────────
const MODULOS_EFICIENCIA=[
  { id:"checklist", label:"Checklist", Comp:({historico})=><GraficoEficiencia historico={historico}/> },
  { id:"chuveiros", label:"Chuveiros", Comp:()=><GraficoEficienciaLimpeza/> },
  // futuros módulos entram aqui: { id:"...", label:"...", Comp:()=><.../> }
];
function EficienciaHub({ historico }){
  const [mod,setMod]=useState("checklist");
  const Atual=MODULOS_EFICIENCIA.find(m=>m.id===mod)?.Comp||(()=>null);
  return(
    <div>
      <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto"}}>
        {MODULOS_EFICIENCIA.map(m=>(
          <button key={m.id} onClick={()=>setMod(m.id)} style={{flexShrink:0,padding:"8px 16px",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:11,letterSpacing:"0.05em",transition:"all .2s",
            background:mod===m.id?`linear-gradient(135deg,${C.accentDark},${C.card})`:C.tagBg,border:`1.5px solid ${mod===m.id?C.accentLight:C.border}`,color:mod===m.id?C.accentLight:C.textMuted,
            boxShadow:mod===m.id?`0 0 12px ${C.accentLight}22`:"none"}}>
            {m.label}
          </button>
        ))}
      </div>
      <Atual historico={historico}/>
    </div>
  );
}


function GraficoEficiencia({ historico }) {
  const MESES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const hoje=new Date();
  const [visao,setVisao]=useState("geral"); // geral | pu | cs | enf
  const [maqFiltro,setMaqFiltro]=useState("ambas"); // ambas | M2 | M3
  const [letraFiltro,setLetraFiltro]=useState("todas"); // todas | A..E
  const [ano,setAno]=useState(hoje.getFullYear());
  const [mes,setMes]=useState(hoje.getMonth()); // 0-11
  const mesAno=`${ano}-${String(mes+1).padStart(2,"0")}`;
  const { resultado, AREAS } = calcularEficiencia(historico, mesAno, maqFiltro);
  const corEfic=(e)=>e===null?C.textDim:e>=80?C.accentLight:e>=50?C.warningLight:C.dangerLight;
  const opcoes=[{id:"geral",label:"Todos"},...Object.entries(AREAS).map(([id,d])=>({id,label:d.label}))];
  const valorDe=(r)=> visao==="geral" ? r.geral : r.areas[visao];
  const dadosTodos=resultado.map(r=>({letra:r.letra, efic:valorDe(r), lanc:r.lancamentos}));
  const dados=letraFiltro==="todas"?dadosTodos:dadosTodos.filter(d=>d.letra===letraFiltro);
  const algumDado=dados.some(d=>d.efic!==null);
  const totalLanc=dados.reduce((s,d)=>s+d.lanc,0);
  // Navegação de mês
  const mesAnterior=()=>{ if(mes===0){setMes(11);setAno(ano-1);}else setMes(mes-1); };
  const mesProximo=()=>{
    const ehMesAtual = ano===hoje.getFullYear() && mes===hoje.getMonth();
    if(ehMesAtual) return; // não avança pro futuro
    if(mes===11){setMes(0);setAno(ano+1);}else setMes(mes+1);
  };
  const ehMesAtual = ano===hoje.getFullYear() && mes===hoje.getMonth();

  return (
    <div style={{background:`linear-gradient(160deg,${C.card} 0%,${C.surface} 100%)`,border:`1px solid ${C.border}`,borderRadius:14,padding:18,marginBottom:16,boxShadow:"0 4px 24px rgba(0,0,0,0.35)"}}>
      {/* Linha colorida no topo */}
      <div style={{height:3,background:`linear-gradient(90deg,${C.accent},${C.blueLight},${C.accent})`,borderRadius:3,marginBottom:14,boxShadow:`0 0 8px ${C.accent}66`}}/>
      {/* Título + navegação de mês */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <span style={{fontSize:15}}>📊</span>
          <span style={{color:C.white,fontWeight:800,fontSize:14,letterSpacing:"0.02em"}}>Eficiência de Lançamento</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={mesAnterior} style={{width:26,height:26,borderRadius:7,cursor:"pointer",border:`1px solid ${C.border}`,background:C.tagBg,color:C.accent,fontSize:14,fontWeight:800,lineHeight:1,padding:0}}>‹</button>
          <span style={{color:C.white,fontSize:12,fontWeight:700,fontFamily:"monospace",minWidth:96,textAlign:"center"}}>{MESES[mes]} {ano}</span>
          <button onClick={mesProximo} disabled={ehMesAtual} style={{width:26,height:26,borderRadius:7,cursor:ehMesAtual?"not-allowed":"pointer",border:`1px solid ${C.border}`,background:C.tagBg,color:ehMesAtual?C.textDim:C.accent,fontSize:14,fontWeight:800,lineHeight:1,padding:0,opacity:ehMesAtual?0.4:1}}>›</button>
        </div>
      </div>
      <p style={{color:C.textDim,fontSize:10,margin:"0 0 14px",lineHeight:1.4}}>Turnos lançados ÷ turnos escalados no mês. Cada letra avaliada só pelos turnos dela.</p>

      {/* Seletor de área */}
      <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
        {opcoes.map(o=>(
          <button key={o.id} onClick={()=>setVisao(o.id)} style={{flex:"1 1 auto",padding:"7px 10px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,border:`1.5px solid ${visao===o.id?C.accent:C.border}`,background:visao===o.id?`linear-gradient(135deg,${C.accentDark},${C.accent}44)`:C.tagBg,color:visao===o.id?C.white:C.textMuted,whiteSpace:"nowrap",transition:"all .15s"}}>{o.label}</button>
        ))}
      </div>
      {/* Seletor de máquina */}
      <div style={{display:"flex",gap:5,marginBottom:8}}>
        {[{id:"ambas",l:"Ambas"},{id:"M2",l:"Máq. 2"},{id:"M3",l:"Máq. 3"}].map(m=>(
          <button key={m.id} onClick={()=>setMaqFiltro(m.id)} style={{flex:1,padding:"6px 8px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,border:`1.5px solid ${maqFiltro===m.id?C.blueLight:C.border}`,background:maqFiltro===m.id?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,color:maqFiltro===m.id?C.white:C.textMuted,transition:"all .15s"}}>{m.l}</button>
        ))}
      </div>
      {/* Seletor de letra */}
      <div style={{display:"flex",gap:5,marginBottom:16}}>
        {[{id:"todas",l:"Todas"},{id:"A",l:"A"},{id:"B",l:"B"},{id:"C",l:"C"},{id:"D",l:"D"},{id:"E",l:"E"}].map(l=>(
          <button key={l.id} onClick={()=>setLetraFiltro(l.id)} style={{flex:1,padding:"6px 4px",borderRadius:8,cursor:"pointer",fontWeight:800,fontSize:11,border:`1.5px solid ${letraFiltro===l.id?C.accent:C.border}`,background:letraFiltro===l.id?C.accentDark:C.tagBg,color:letraFiltro===l.id?C.white:C.textMuted,transition:"all .15s"}}>{l.l}</button>
        ))}
      </div>

      {/* Gráfico de barras */}
      <div style={{position:"relative",paddingLeft:30,marginBottom:8}}>
        {/* Linhas de grade horizontais com rótulos */}
        {[100,75,50,25,0].map(g=>(
          <div key={g} style={{position:"absolute",left:0,right:0,top:`${(100-g)/100*170}px`,height:1,background:g===0?C.border:"rgba(255,255,255,0.04)",display:"flex",alignItems:"center"}}>
            <span style={{position:"absolute",left:0,transform:"translateY(-50%)",color:C.textDim,fontSize:8,fontFamily:"monospace",width:26,textAlign:"right"}}>{g}%</span>
          </div>
        ))}
        {/* Barras */}
        <div style={{display:"flex",gap:10,alignItems:"flex-end",height:170,position:"relative"}}>
          {dados.map(d=>{
            const barH=d.efic===null?3:Math.max(6,Math.round((d.efic/100)*170));
            const cor=corEfic(d.efic);
            return (
              <div key={d.letra} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
                {d.efic!==null&&<div style={{color:cor,fontSize:14,fontWeight:900,lineHeight:1,marginBottom:5,textShadow:`0 0 8px ${cor}55`}}>{d.efic}%</div>}
                <div style={{width:"72%",maxWidth:46,height:barH,borderRadius:"6px 6px 0 0",background:d.efic===null?C.tagBg:`linear-gradient(180deg,${cor} 0%,${cor}cc 60%,${cor}88 100%)`,border:d.efic!==null?`1px solid ${cor}`:`1px solid ${C.border}`,boxShadow:d.efic!==null?`0 0 12px ${cor}44,inset 0 1px 2px rgba(255,255,255,0.3)`:"none",transition:"height .5s cubic-bezier(.4,0,.2,1)"}}/>
              </div>
            );
          })}
        </div>
      </div>
      {/* Letras embaixo das barras */}
      <div style={{display:"flex",gap:10,paddingLeft:30,marginBottom:14}}>
        {dados.map(d=>(
          <div key={d.letra} style={{flex:1,display:"flex",justifyContent:"center"}}>
            <div style={{width:32,height:32,borderRadius:9,background:d.efic!==null?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,display:"flex",alignItems:"center",justifyContent:"center",color:d.efic!==null?"#fff":C.textDim,fontSize:15,fontWeight:900,boxShadow:d.efic!==null?`0 2px 8px ${C.blueLight}44`:"none"}}>{d.letra}</div>
          </div>
        ))}
      </div>

      {/* Legenda de cor */}
      <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:14}}>
        {[[C.accentLight,"≥80%"],[C.warningLight,"50-79%"],[C.dangerLight,"<50%"]].map(([clr,lbl])=>(
          <div key={lbl} style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:9,height:9,borderRadius:2,background:clr,boxShadow:`0 0 4px ${clr}88`}}/><span style={{color:C.textMuted,fontSize:9}}>{lbl}</span>
          </div>
        ))}
      </div>

      {/* Lista de lançamentos por letra */}
      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
        <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Lançamentos no mês {visao!=="geral"?`· ${AREAS[visao].label}`:""}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {dados.map(d=>(
            <div key={d.letra} style={{flex:"1 1 auto",display:"flex",alignItems:"center",gap:6,background:C.tagBg,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 10px",minWidth:72}}>
              <span style={{color:C.white,fontWeight:800,fontSize:13}}>{d.letra}</span>
              <span style={{color:C.accent,fontWeight:700,fontSize:13,fontFamily:"monospace"}}>{d.lanc}</span>
            </div>
          ))}
        </div>
        <div style={{color:C.textDim,fontSize:10,textAlign:"right",marginTop:8}}>Total: <span style={{color:C.textMuted,fontWeight:700}}>{totalLanc}</span> lançamentos</div>
      </div>

      {!algumDado&&<p style={{color:C.textDim,fontSize:11,textAlign:"center",marginTop:12}}>Sem lançamentos em {MESES[mes]} {ano}.</p>}
    </div>
  );
}

// ─── RotinaH2Tela — Amarradeiras/Unitizadora, por linha (histórico individual) ──
function RotinaH2Tela({ onSalvar, opPU, opPainel, data }) {
  const agora=new Date();
  const horaAtual=`${String(agora.getHours()).padStart(2,"0")}:${String(agora.getMinutes()).padStart(2,"0")}`;
  const hoje=data||new Date().toISOString().slice(0,10);
  const letra=calcularLetra();
  const [maquina,setMaquina]=useState("M2");
  const linhasFiltradas=LINHAS.filter(l=>maquina==="M2"?["L4","L5"].includes(l.id):["L6","L7","L8"].includes(l.id));
  const [linha,setLinha]=useState("L4");
  const [hora,setHora]=useState(horaAtual);
  const [opArea,setOpArea]=useState(()=>storageGet("op_config")?.nomeOperador||opPU||"");
  const [opPainelLocal,setOpPainelLocal]=useState(()=>storageGet("op_config")?.operadorPainel||opPainel||"");
  const matricula=storageGet("op_config")?.matricula||"";
  const [respostas,setRespostas]=useState({});
  const [fotos,setFotos]=useState({});
  const addFoto=(id,src)=>{setFotos(p=>({...p,[id]:[...(p[id]||[]),src]}));setSalvo(false);};
  const remFoto=(id,idx)=>{setFotos(p=>({...p,[id]:(p[id]||[]).filter((_,i)=>i!==idx)}));setSalvo(false);};
  const [obs,setObs]=useState("");
  const [salvo,setSalvo]=useState(false);
  const items=checklistRotinaH2;
  const linhaInfo=LINHAS.find(l=>l.id===linha);

  const setResp=(id,val)=>{setRespostas(p=>({...p,[id]:val}));setSalvo(false);};
  const respondidos=items.filter(i=>respostas[i.id]).length;
  const noks=items.filter(i=>respostas[i.id]==="nok").length;

  const handleSalvar=()=>{
    const registro={
      id:Date.now(), tipoId:"rotina_h2", tipoLabel:"Check List Rotina H2",
      maquina:linhaInfo?.maquina||maquina, linha, turno:getAutoTurno(), hora, letra, data:hoje,
      opPU:opArea, matricula, opPainel:opPainelLocal, noks, total:items.length, obs,
      items:items.map(i=>({id:i.id,item:i.item,resp:respostas[i.id]||"",fotos:fotos[i.id]||[]})),
    };
    onSalvar(registro);
    setSalvo(true);
    setRespostas({}); setFotos({}); setObs("");
  };

  return (
    <div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:14}}>
        {/* Seletor M2/M3 */}
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          {["M2","M3"].map(m=>(
            <button key={m} onClick={()=>{setMaquina(m);setLinha(m==="M2"?"L4":"L6");setRespostas({});setSalvo(false);}}
              style={{flex:1,padding:"7px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:13,transition:"all .15s",
                background:maquina===m?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${maquina===m?"rgba(255,255,255,0.55)":C.border}`,
                color:maquina===m?"#fff":C.textMuted,
                boxShadow:maquina===m?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4),0 0 40px rgba(80,144,255,0.2)":"none"}}>
              M{m.replace("M","")}<span style={{fontSize:9,fontWeight:400,opacity:.7,marginLeft:4}}>{m==="M2"?"L4·L5":"L6·L7·L8"}</span>
            </button>
          ))}
        </div>
        {/* Chips automáticos */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-around",background:"rgba(4,17,29,0.88)",border:"1px solid rgba(80,144,255,0.18)",borderRadius:10,padding:"7px 12px",marginBottom:12,boxShadow:"inset 0 0 20px rgba(0,0,0,0.45),0 0 8px rgba(80,144,255,0.07)"}}>
          {[
            {label:"TURNO", value:getAutoTurno(), bg:"rgba(14,40,71,0.9)",  border:"rgba(26,92,204,0.4)",  color:"#5090FF"},
            {label:"LETRA", value:letra,           bg:"rgba(0,40,20,0.9)",   border:"rgba(0,230,118,0.35)", color:"#00E676"},
            {label:"HORA",  value:hora,             bg:"rgba(20,30,45,0.9)", border:"rgba(255,255,255,0.12)", color:"#B5C6DA"},
          ].map(({label,value,bg,border,color},idx,arr)=>(
            <React.Fragment key={label}>
              <div style={{textAlign:"center",flex:1}}>
                <div style={{color:"rgba(255,255,255,0.22)",fontSize:7,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"monospace",marginBottom:2}}>{label}</div>
                <div style={{color,fontSize:15,fontWeight:900,letterSpacing:"0.05em",fontFamily:"monospace",whiteSpace:"nowrap"}}>{value}</div>
              </div>
              {idx<arr.length-1&&<div style={{width:1,height:26,background:"rgba(80,144,255,0.2)",flexShrink:0,margin:"0 6px"}}/>}
            </React.Fragment>
          ))}
        </div>
        {/* Seletor de linha filtrado */}
        <div style={{marginBottom:12}}>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:6}}>Linha</label>
          <div style={{display:"flex",gap:6}}>
            {linhasFiltradas.map(l=>{
              const ativo=linha===l.id;
              return <button key={l.id} onClick={()=>{setLinha(l.id);setRespostas({});setSalvo(false);}} style={{flex:1,padding:"7px 4px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:13,transition:"all .15s",background:ativo?C.blue:C.tagBg,border:`2px solid ${ativo?"rgba(255,255,255,0.55)":C.border}`,color:ativo?"#fff":C.textMuted,boxShadow:ativo?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4),0 0 40px rgba(80,144,255,0.2)":"none"}}>
                {l.id}
              </button>;
            })}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div>
            <label style={{color:C.textDim,fontSize:9,textTransform:"uppercase",display:"block",marginBottom:3,letterSpacing:"0.08em"}}>Operador</label>
            <input value={opArea||""} onChange={e=>setOpArea(e.target.value)} placeholder="Nome..." style={{...inputStyle,fontSize:12,padding:"6px 10px"}}/>
          </div>
          <div>
            <label style={{color:C.textDim,fontSize:9,textTransform:"uppercase",display:"block",marginBottom:3,letterSpacing:"0.08em"}}>Op. Painel</label>
            <input value={opPainelLocal||""} onChange={e=>setOpPainelLocal(e.target.value)} placeholder="Nome..." style={{...inputStyle,fontSize:12,padding:"6px 10px"}}/>
          </div>
        </div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{color:C.textMuted,fontSize:10,textTransform:"uppercase"}}>Progresso</span>
            <span style={{display:"flex",gap:10,alignItems:"center"}}>
              {noks>0&&<span style={{color:C.dangerLight,fontSize:10,fontWeight:700}}>⚠ {noks} NÃO OK</span>}
              <span style={{color:C.white,fontSize:11,fontWeight:700}}>{respondidos}/{items.length}</span>
            </span>
          </div>
          <div style={{background:C.tagBg,borderRadius:4,height:6,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:4,transition:"width .3s",width:`${(respondidos/items.length)*100}%`,background:noks>0?C.dangerLight:respondidos===items.length?C.accentLight:C.accent}}/>
          </div>
        </div>
      </div>

      <div style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:7,padding:"0 2px"}}>
          <span style={{color:C.text,fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>🛢 Amarradeiras / Unitizadora</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {items.map((item,idx)=>{
            const r=respostas[item.id];
            const isNok=r==="nok";
            const preen=!!r;
            const corBorda=isNok?C.dangerLight+"66":preen?C.accentLight+"33":C.border;
            const corLeft=isNok?C.dangerLight:preen?C.accentLight:"transparent";
            return (
              <div key={item.id} style={{background:C.card,borderRadius:10,padding:"11px 14px",border:`1px solid ${corBorda}`,borderLeft:`3px solid ${corLeft}`}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,background:isNok?C.danger:preen?C.success:C.tagBg,border:`2px solid ${isNok?C.dangerLight:preen?C.accentLight:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:800,marginTop:2}}>
                    {isNok?"⚠":preen?"✓":idx+1}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{color:C.white,fontSize:12,fontWeight:500,lineHeight:1.3}}>{item.item}</div>
                  </div>
                  <div style={{display:"flex",gap:4,flexShrink:0}}>
                    <button onClick={()=>setResp(item.id,"ok")} style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${r==="ok"?C.accentLight:C.border}`,background:r==="ok"?C.success:C.tagBg,color:"#fff",fontWeight:800,fontSize:10,cursor:"pointer"}}>OK</button>
                    <button onClick={()=>setResp(item.id,"nok")} style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${r==="nok"?C.dangerLight:C.border}`,background:r==="nok"?C.danger:C.tagBg,color:"#fff",fontWeight:800,fontSize:10,cursor:"pointer"}}>NOK</button>
                    <BotaoFoto compact fotos={fotos[item.id]||[]} onAdd={src=>addFoto(item.id,src)} onRemove={idx=>remFoto(item.id,idx)}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:14}}>
        <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:6}}>Observações</label>
        <textarea value={obs} onChange={e=>setObs(e.target.value)} placeholder="Observações..." rows={3} style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/>
      </div>

      <button onClick={handleSalvar} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",cursor:"pointer",fontWeight:800,fontSize:14,background:salvo?C.success:C.accent,color:"#04111D",boxShadow:"0 4px 14px rgba(0,230,118,0.3)"}}>
        {salvo?"✓ Registrado":"Salvar Check List"}
      </button>
    </div>
  );
}

function RotaEnfardamentoTela({ onSalvar }) {
  const agora=new Date();
  const horaAtual=`${String(agora.getHours()).padStart(2,"0")}:${String(agora.getMinutes()).padStart(2,"0")}`;
  const hoje=new Date().toISOString().slice(0,10);
  const items=checklistRotaEnfardamento;
  const secoes=items.reduce((acc,i)=>{if(!acc[i.secao])acc[i.secao]=[];acc[i.secao].push(i);return acc;},{});
  const [linha,setLinha]=useState("L4");
  const [hora,setHora]=useState(horaAtual);
  const letra=calcularLetra();
  const [opArea,setOpArea]=useState(()=>storageGet("op_config")?.nomeOperador||"");
  const [opPainel,setOpPainel]=useState(()=>storageGet("op_config")?.operadorPainel||"");
  const matriculaRota=storageGet("op_config")?.matricula||"";
  const [resp,setResp]=useState({});
  const [obsMap,setObsMap]=useState({});
  const [obsTemp,setObsTemp]=useState("");
  const [obsAberto,setObsAberto]=useState(null);
  const [gravMap,setGravMap]=useState({});
  const [tempMap,setTempMap]=useState({});
  const [salvo,setSalvo]=useState(false);

  const getTempSt=(val)=>{const n=parseFloat((val||"").replace(",","."));if(isNaN(n)||!val)return null;if(n>=65)return"critico";if(n>=55)return"atencao";return"normal";};
  const corTemp=(st)=>st==="critico"?C.dangerLight:st==="atencao"?C.warningLight:st==="normal"?C.accentLight:C.textDim;
  const respondidos=items.filter(i=>!!resp[i.id]||(i.tipo==="temp"&&!!tempMap[i.id])).length;
  const noks=items.filter(i=>resp[i.id]==="nok").length+items.filter(i=>i.tipo==="temp"&&getTempSt(tempMap[i.id])==="critico").length;
  const confirmarObs=(id)=>{setObsMap(p=>({...p,[id]:obsTemp}));setObsAberto(null);setObsTemp("");};

  const handleSalvar=()=>{
    const linhaInfo=LINHAS.find(l=>l.id===linha);
    const registro={id:Date.now(),tipoId:"rota_enf",tipoLabel:"Rota Enfardamento",maquina:linhaInfo?.maquina||"M2",linha,hora,letra,data:hoje,opPU:opArea,matricula:matriculaRota,opPainel,noks,total:items.length,
      items:items.map(i=>({id:i.id,secao:i.secao,item:i.item,resp:i.tipo==="temp"?tempMap[i.id]||"":resp[i.id]||"",obs:obsMap[i.id]||"",gravidade:gravMap[i.id]||"",fotos:[]}))};
    onSalvar(registro);setSalvo(true);
  };

  return (
    <div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:14}}>
        <div style={{marginBottom:12}}>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:6}}>Linha</label>
          <div style={{display:"flex",gap:6}}>
            {LINHAS.map(l=>{const ativo=linha===l.id;return(
              <button key={l.id} onClick={()=>{setLinha(l.id);setResp({});setObsMap({});setTempMap({});setSalvo(false);}} style={{flex:1,padding:"7px 4px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:13,transition:"all .15s",background:ativo?C.blue:C.tagBg,border:`2px solid ${ativo?"rgba(255,255,255,0.55)":C.border}`,color:ativo?"#fff":C.textMuted,boxShadow:ativo?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4),0 0 40px rgba(80,144,255,0.2)":"none"}}>
                {l.id}<div style={{fontSize:8,fontWeight:400,opacity:.8,marginTop:1}}>{l.maquina}</div>
              </button>);})}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div>
            <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:4}}>Hora</label>
            <input type="time" value={hora} onChange={e=>setHora(e.target.value)} style={inputStyle}/>
          </div>
          <div>
            <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:4}}>Letra</label>
            <div style={{display:"flex",gap:5}}>
              <div style={{background:C.blue,border:`2px solid ${C.accentLight}`,borderRadius:8,padding:"6px 0",textAlign:"center",fontWeight:900,fontSize:20,color:C.accentLight,letterSpacing:"0.1em",boxShadow:"0 0 10px rgba(0,230,118,0.5),0 0 30px rgba(0,230,118,0.3)"}}>{letra}</div>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div>
            <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:4}}>Op. Área</label>
            <input value={opArea} onChange={e=>setOpArea(e.target.value)} placeholder="Nome..." style={inputStyle}/>
          </div>
          <div>
            <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:4}}>Op. Painel</label>
            <input value={opPainel} onChange={e=>setOpPainel(e.target.value)} placeholder="Nome..." style={inputStyle}/>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{color:C.textMuted,fontSize:10,textTransform:"uppercase"}}>Progresso</span>
          <span style={{display:"flex",gap:10,alignItems:"center"}}>
            {noks>0&&<span style={{color:C.dangerLight,fontSize:10,fontWeight:700}}>⚠ {noks} alerta{noks>1?"s":""}</span>}
            <span style={{color:C.white,fontSize:11,fontWeight:700}}>{respondidos}/{items.length}</span>
          </span>
        </div>
        <div style={{background:C.tagBg,borderRadius:4,height:6,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:4,transition:"width .3s",width:`${(respondidos/items.length)*100}%`,background:noks>0?C.dangerLight:respondidos===items.length?C.accentLight:C.accent}}/>
        </div>
      </div>
      {Object.entries(secoes).map(([secao,itensDaSecao])=>(
        <div key={secao} style={{marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:7,padding:"0 2px"}}>
            <span style={{fontSize:13}}>{iconSecao[secao]||"🔹"}</span>
            <span style={{color:C.text,fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{secao}</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {itensDaSecao.map((item,idx)=>{
              const r=resp[item.id];
              const isNok=r==="nok";
              const tempSt=item.tipo==="temp"?getTempSt(tempMap[item.id]):null;
              const preen=!!r||(item.tipo==="temp"&&!!tempMap[item.id]);
              const corBorda=isNok||tempSt==="critico"?C.dangerLight+"66":tempSt==="atencao"?C.warningLight+"66":preen?C.accentLight+"33":C.border;
              const corLeft=isNok||tempSt==="critico"?C.dangerLight:tempSt==="atencao"?C.warningLight:preen?C.accentLight:"transparent";
              return (
                <div key={item.id} style={{background:C.card,borderRadius:10,padding:"11px 14px",border:`1px solid ${corBorda}`,borderLeft:`3px solid ${corLeft}`}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,background:isNok||tempSt==="critico"?C.danger:tempSt==="atencao"?C.warning:preen?C.success:C.tagBg,border:`2px solid ${isNok||tempSt==="critico"?C.dangerLight:tempSt==="atencao"?C.warningLight:preen?C.accentLight:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:800,marginTop:2}}>
                      {isNok||tempSt==="critico"?"⚠":tempSt==="atencao"?"!":preen?"✓":idx+1}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:C.white,fontSize:12,fontWeight:500,lineHeight:1.3}}>{item.item}</div>
                      {item.ref!=="—"&&<div style={{color:C.textMuted,fontSize:10,marginTop:1}}>Ref: <span style={{color:C.warningLight,fontWeight:700}}>{item.ref}</span><span style={{color:C.textDim}}> · {item.unit}</span></div>}
                    </div>
                    <div style={{display:"flex",gap:4,flexShrink:0}}>
                      {item.tipo==="sim_nao"&&(
                        <>
                          <button onClick={()=>setResp(p=>({...p,[item.id]:r==="sim"?undefined:"sim"}))} style={{padding:"5px 11px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",border:r==="sim"?"none":`1px solid ${C.border}`,background:r==="sim"?C.success:C.tagBg,color:r==="sim"?"#fff":C.textMuted}}>SIM</button>
                          <button onClick={()=>setResp(p=>({...p,[item.id]:r==="nao"?undefined:"nao"}))} style={{padding:"5px 11px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",border:r==="nao"?"none":`1px solid ${C.border}`,background:r==="nao"?C.danger:C.tagBg,color:r==="nao"?"#fff":C.textMuted}}>NÃO</button>
                        </>
                      )}
                      {item.tipo==="ok_nok"&&(
                        <>
                          <button onClick={()=>{setResp(p=>({...p,[item.id]:"ok"}));if(obsAberto===item.id)setObsAberto(null);}} style={{padding:"5px 11px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s",border:r==="ok"?"none":`1px solid ${C.border}`,background:r==="ok"?C.success:C.tagBg,color:r==="ok"?"#fff":C.textMuted}}>OK</button>
                          <button onClick={()=>{if(isNok){setResp(p=>({...p,[item.id]:undefined}));setObsAberto(null);}else{setResp(p=>({...p,[item.id]:"nok"}));setObsAberto(item.id);setObsTemp(obsMap[item.id]||"");}}} style={{padding:"5px 11px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s",border:isNok?"none":`1px solid ${C.border}`,background:isNok?C.warning:C.tagBg,color:isNok?"#fff":C.textMuted}}>NOK</button>
                        </>
                      )}
                      {item.tipo==="temp"&&(
                        <div style={{display:"flex",gap:4}}>
                          <button onClick={()=>{setResp(p=>({...p,[item.id]:r==="ok"?undefined:"ok"}));if(obsAberto===item.id)setObsAberto(null);}} style={{padding:"5px 11px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",border:r==="ok"?"none":`1px solid ${C.border}`,background:r==="ok"?C.success:C.tagBg,color:r==="ok"?"#fff":C.textMuted}}>OK</button>
                          <button onClick={()=>{if(r==="nok"){setResp(p=>({...p,[item.id]:undefined}));setObsAberto(null);setTempMap(p=>{const n={...p};delete n[item.id];return n;});}else{setResp(p=>({...p,[item.id]:"nok"}));setObsAberto(item.id);setObsTemp(obsMap[item.id]||"");}}} style={{padding:"5px 11px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",border:r==="nok"?"none":`1px solid ${C.border}`,background:r==="nok"?C.warning:C.tagBg,color:r==="nok"?"#fff":C.textMuted}}>NOK</button>
                        </div>
                      )}
                    </div>
                  </div>
                  {isNok&&obsAberto===item.id&&(
                    <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
                      {item.nokGrav&&(
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>setGravMap(p=>({...p,[item.id]:"atencao"}))} style={{flex:1,padding:"5px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:11,background:gravMap[item.id]==="atencao"?C.warning:C.tagBg,border:`1px solid ${gravMap[item.id]==="atencao"?C.warningLight:C.border}`,color:gravMap[item.id]==="atencao"?"#fff":C.textMuted}}>⚠ Atenção</button>
                          <button onClick={()=>setGravMap(p=>({...p,[item.id]:"critico"}))} style={{flex:1,padding:"5px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:11,background:gravMap[item.id]==="critico"?C.danger:C.tagBg,border:`1px solid ${gravMap[item.id]==="critico"?C.dangerLight:C.border}`,color:gravMap[item.id]==="critico"?"#fff":C.textMuted}}>🔴 Crítico</button>
                        </div>
                      )}
                      {item.tipo==="temp"&&(
                        <div style={{textAlign:"center"}}>
                          <input value={tempMap[item.id]||""} onChange={e=>setTempMap(p=>({...p,[item.id]:e.target.value}))} placeholder="Temperatura °C"
                            style={{...inputStyle,borderColor:getTempSt(tempMap[item.id])?corTemp(getTempSt(tempMap[item.id]))+"88":C.warningLight+"66",color:getTempSt(tempMap[item.id])?corTemp(getTempSt(tempMap[item.id])):C.text}}/>
                          {getTempSt(tempMap[item.id])&&<div style={{fontSize:10,color:corTemp(getTempSt(tempMap[item.id])),marginTop:4,fontWeight:700}}>{getTempSt(tempMap[item.id])==="normal"?"✓ Dentro do limite":getTempSt(tempMap[item.id])==="atencao"?"⚠ Atenção — próximo do limite":"🔴 CRÍTICO — risco de intertravamento"}</div>}
                        </div>
                      )}
                      <textarea value={obsTemp} onChange={e=>setObsTemp(e.target.value)} rows={2}
                        placeholder="Descreva o que observou..."
                        style={{...inputStyle,resize:"vertical",fontFamily:"inherit",borderColor:C.warningLight+"66"}}/>
                      <button onClick={()=>confirmarObs(item.id)} style={{...btnPrim,background:C.warning}}>Confirmar</button>
                    </div>
                  )}
                  {isNok&&obsAberto!==item.id&&obsMap[item.id]&&(
                    <div style={{marginTop:6,background:"#2a180033",border:`1px solid ${C.warningLight}44`,borderRadius:7,padding:"5px 10px"}}>
                      {gravMap[item.id]==="critico"&&<span style={{color:C.dangerLight,fontSize:10,fontWeight:700,marginRight:6}}>🔴 Crítico</span>}
                      {gravMap[item.id]==="atencao"&&<span style={{color:C.warningLight,fontSize:10,fontWeight:700,marginRight:6}}>⚠ Atenção</span>}
                      <p style={{color:C.textMuted,fontSize:10,margin:0,fontStyle:"italic"}}>"{obsMap[item.id]}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <button onClick={handleSalvar} disabled={salvo} style={{width:"100%",padding:13,border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,background:salvo?C.accentDark:respondidos===items.length?(noks>0?C.warning:C.accent):C.textDim,cursor:respondidos===items.length&&!salvo?"pointer":"not-allowed",transition:"background .3s"}}>
        {salvo?"✓ Salvo no Histórico!":respondidos===items.length?(noks>0?`⚠ Salvar com ${noks} alerta${noks>1?"s":""}`:
          "✓ Finalizar e Salvar"):`Preencha todos os itens (${items.length-respondidos} restantes)`}
      </button>
    </div>
  );
}

// ─── HistoricoTela ────────────────────────────────────────────────────────────
// ─── RelatorioCleaners — relatórios por turno no Histórico ────────────────────
function HistoricoTela({ historico, areaAtiva, perfil }) {
  const [abaHist,setAbaHist]=useState("reg");
  const [buscaData,setBuscaData]=useState("");
  const [filtroMaq,setFiltroMaq]=useState("M2");
  const [filtroArea,setFiltroArea]=useState(areaAtiva||"pu");
  const [filtroTipo,setFiltroTipo]=useState("TODOS");
  const [sel,setSel]=useState(null);
  const fmtData=d=>{if(!d)return"—";const[y,m,day]=d.split("-");return`${day}/${m}/${y}`;};
  const LINHAS_M2=["L4","L5"],LINHAS_M3=["L6","L7","L8"];
  const areaDoTipo=id=>CATALOGO.find(c=>c.id===id)?.area||"pu";
  const porMaquina=historico.filter(h=>{
    if(h.linha)return filtroMaq==="M2"?LINHAS_M2.includes(h.linha):LINHAS_M3.includes(h.linha);
    if(h.maquina==="M2/M3")return true;
    return h.maquina===filtroMaq;
  });
  const porArea=porMaquina.filter(h=>areaDoTipo(h.tipoId)===filtroArea);
  const tiposDisponiveis=[{id:"TODOS",label:"Todos os check-lists"},...CATALOGO.filter(c=>c.area===filtroArea).map(c=>({id:c.id,label:c.label})).filter((v,i,a)=>a.findIndex(x=>x.id===v.id)===i)];
  const filtrados=(filtroTipo==="TODOS"?porArea:porArea.filter(h=>h.tipoId===filtroTipo)).filter(h=>!buscaData||h.data===buscaData).sort((a,b)=>b.id-a.id);
  const AREAS_HIST=[{id:"pu",label:"Parte Úmida"},{id:"cs",label:"P. Seca/Cortad."},{id:"enf",label:"Enfardamento"}];
  const [fotoAmp,setFotoAmp]=useState(null);
  const [fotosCarregadas,setFotosCarregadas]=useState({}); // {regId: fotosMap}
  const regBase=sel!=null?historico.find(h=>h.id===sel):null;
  // Reidrata fotos sob demanda ao abrir um registro com marcadores
  React.useEffect(()=>{
    if(regBase&&temMarcadores(regBase)&&!fotosCarregadas[regBase.id]){
      cloudGet("fotos_"+regBase.id).then(fmap=>{
        if(fmap) setFotosCarregadas(prev=>({...prev,[regBase.id]:fmap}));
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[sel]);
  const reg=regBase?(temMarcadores(regBase)?reidratarRegistro(regBase,fotosCarregadas[regBase.id]):regBase):null;

  if(reg){
    const noksItems=reg.items?.filter(i=>["nok","nao","atencao","critico","desvio"].includes(i.resp))||[];
    const secoes=[...new Set(reg.items?.map(i=>i.secao)||[])];
    return (
      <div>
        {fotoAmp&&<div style={{position:"fixed",inset:0,background:"#000000ee",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setFotoAmp(null)}><img src={fotoAmp} alt="amp" style={{maxWidth:"95vw",maxHeight:"90vh",borderRadius:12}} onClick={e=>e.stopPropagation()}/><button onClick={()=>setFotoAmp(null)} style={{position:"absolute",top:16,right:16,width:40,height:40,borderRadius:"50%",background:"rgba(0,0,0,0.8)",border:"2px solid rgba(255,255,255,0.4)",color:"#fff",fontSize:22,cursor:"pointer",fontWeight:900,lineHeight:1,zIndex:301}}>×</button></div>}
        <button onClick={()=>setSel(null)} style={{...btnSec,marginBottom:14}}>← Voltar</button>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                <span style={{background:C.blue,color:"#fff",borderRadius:6,padding:"2px 9px",fontSize:10,fontWeight:800}}>{reg.linha||`M${reg.maquina?.replace("M","")}`}</span>
                <span style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:6,padding:"2px 9px",fontSize:10}}>{reg.turno}</span>
                {reg.letra&&<span style={{background:C.accent,color:"#fff",borderRadius:6,padding:"2px 9px",fontSize:10,fontWeight:800}}>{reg.letra}</span>}
                {reg.hora&&<span style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:6,padding:"2px 9px",fontSize:10}}>{reg.hora}</span>}
                <span style={{background:C.tagBg,border:`1px solid ${C.accentLight}33`,color:C.accentLight,borderRadius:6,padding:"2px 9px",fontSize:10,fontWeight:600}}>{reg.tipoLabel}</span>
              </div>
              <div style={{color:C.white,fontWeight:800,fontSize:16}}>{fmtData(reg.data)}</div>
            </div>
            {reg.noks>0?<span style={{background:"#2a080833",border:`1px solid ${C.dangerLight}55`,color:C.dangerLight,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:800}}>⚠ {reg.noks} alerta{reg.noks>1?"s":""}</span>:<span style={{background:"#002810",border:`1px solid ${C.accentLight}55`,color:C.accentLight,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:800}}>✓ OK</span>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["Op. Parte Úmida",reg.opPU||"—"],["Op. Painel",reg.opPainel||"—"]].map(([lbl,val])=>(<div key={lbl} style={{background:C.surface,borderRadius:8,padding:"7px 10px"}}><div style={{color:C.textMuted,fontSize:9,textTransform:"uppercase",marginBottom:1}}>{lbl}</div><div style={{color:C.text,fontSize:12,fontWeight:600}}>{val}</div></div>))}
          </div>
        </div>
        {noksItems.length>0&&(
          <div style={{background:"#2a080822",border:`1px solid ${C.dangerLight}44`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <p style={{color:C.dangerLight,fontWeight:800,fontSize:12,margin:"0 0 8px",textTransform:"uppercase"}}>⚠ Itens Não Conformes / Alertas</p>
            {noksItems.map((i,idx)=>(
              <div key={idx} style={{padding:"6px 0",borderBottom:idx<noksItems.length-1?`1px solid ${C.border}`:"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div><span style={{color:C.textMuted,fontSize:10,marginRight:6}}>{i.secao}</span><span style={{color:C.text,fontSize:12}}>{i.item}</span>{i.resp&&!["nok","nao"].includes(i.resp)&&<span style={{color:C.dangerLight,fontSize:11,marginLeft:6,fontWeight:700}}>→ {i.resp}</span>}</div>
                  <span style={{color:i.resp==="critico"?C.dangerLight:i.resp==="atencao"?C.warningLight:C.dangerLight,borderRadius:6,padding:"1px 7px",fontSize:10,fontWeight:800,flexShrink:0,marginLeft:8,background:"#2a080833",border:`1px solid ${i.resp==="atencao"?C.warningLight:C.dangerLight}44`}}>{i.resp==="critico"?"🔴 Crítico":i.resp==="atencao"?"⚠ Atenção":i.resp==="desvio"?"🟡 Desvio":"⚠"}</span>
                </div>
                {i.valorPassagem&&<p style={{color:C.warningLight,fontSize:11,margin:"4px 0 0",fontWeight:700}}>Valor utilizado: {i.valorPassagem}</p>}{i.obs&&<p style={{color:C.textMuted,fontSize:11,margin:"2px 0 0",fontStyle:"italic",lineHeight:1.4}}>"{i.obs}"</p>}
                {i.fotos?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>{i.fotos.map((src,fi)=>(<img key={fi} src={src} alt="" onClick={()=>setFotoAmp(src)} style={{width:60,height:60,objectFit:"cover",borderRadius:7,border:`2px solid ${C.dangerLight}55`,cursor:"pointer"}}/>))}</div>}
              </div>
            ))}
          </div>
        )}
        {secoes.map(secao=>{
          const its=reg.items?.filter(i=>i.secao===secao)||[];
          return (
            <div key={secao} style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6,padding:"0 2px"}}><span style={{color:C.text,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>{secao}</span></div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {its.map((item,i)=>{
                  const isNok=item.resp==="nok"||item.resp==="nao",isOk=item.resp==="ok"||item.resp==="sim";
                  return (
                    <div key={i} style={{background:C.card,borderRadius:8,padding:"8px 12px",border:`1px solid ${isNok?C.dangerLight+"44":C.border}`,borderLeft:`3px solid ${isNok?C.dangerLight:isOk?C.accentLight:"transparent"}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:item.fotos?.length?6:0}}>
                        <span style={{color:isNok?C.text:C.textMuted,fontSize:12,flex:1,marginRight:10}}>{item.item}</span>
                        <span style={{fontSize:11,fontWeight:700,color:isNok?C.dangerLight:isOk?C.accentLight:C.warningLight,background:isNok?"#2a080833":isOk?"#00280f":C.tagBg,border:`1px solid ${isNok?C.dangerLight+"44":isOk?C.accentLight+"44":C.border}`,borderRadius:6,padding:"1px 8px",whiteSpace:"nowrap"}}>{item.resp||"—"}</span>
                      </div>
                      {item.fotos?.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{item.fotos.map((src,fi)=>(<img key={fi} src={src} alt="" onClick={()=>setFotoAmp(src)} style={{width:52,height:52,objectFit:"cover",borderRadius:7,border:`2px solid ${isNok?C.dangerLight:C.accentLight}55`,cursor:"pointer"}}/>))}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {reg.tipoId==="enf_qualidade"&&reg.unit&&(
          <div style={{background:C.card,border:`1px solid ${C.accentLight}33`,borderTop:`2px solid ${C.accentLight}`,borderRadius:10,padding:"12px 14px",marginBottom:10}}>
            <p style={{color:C.accentLight,fontSize:10,textTransform:"uppercase",fontWeight:800,margin:"0 0 8px",letterSpacing:"0.08em"}}>📦 Unit Inspecionada</p>
            <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:reg.unit.foto?.length>0?10:0}}>
              {reg.unit.lote&&<div><span style={{color:C.textDim,fontSize:9,textTransform:"uppercase"}}>Lote </span><span style={{color:C.text,fontFamily:"monospace",fontWeight:700,fontSize:13}}>{reg.unit.lote}</span></div>}
              {reg.unit.unidade&&<div><span style={{color:C.textDim,fontSize:9,textTransform:"uppercase"}}>Unidade </span><span style={{color:C.text,fontFamily:"monospace",fontWeight:700,fontSize:13}}>{reg.unit.unidade}</span></div>}
            </div>
            {reg.unit.foto?.length>0&&(
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {reg.unit.foto.map((src,fi)=>(
                  <img key={fi} src={src} alt="" onClick={()=>setFotoAmp(src)}
                    style={{width:64,height:64,objectFit:"cover",borderRadius:8,border:`2px solid ${C.accentLight}44`,cursor:"pointer"}}/>
                ))}
              </div>
            )}
          </div>
        )}
        {reg.obs&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px"}}><p style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",margin:"0 0 5px"}}>Observações</p><p style={{color:C.text,fontSize:13,margin:0,lineHeight:1.6}}>{reg.obs}</p></div>}
      </div>
    );
  }

  return (
    <div>
      <div style={{display:"flex",alignItems:"baseline",gap:8}}>
        <h2 style={{color:C.white,fontSize:17,fontWeight:900,margin:0,letterSpacing:"0.04em"}}>HISTÓRICO OPERACIONAL</h2>
        <span style={{color:C.textDim,fontSize:10,fontFamily:"monospace"}}>{historico.length} reg.</span>
      </div>
      <div style={{height:1,background:`linear-gradient(90deg,${C.accent}66,transparent)`,margin:"8px 0 12px"}}/>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[{id:"reg",l:"REGISTROS"},{id:"ana",l:"EFICIENCIA"},{id:"avarias",l:"AVARIAS"}].map(a=>(
          <button key={a.id} onClick={()=>setAbaHist(a.id)} style={{flex:1,padding:"8px 6px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:10,letterSpacing:"0.03em",background:abaHist===a.id?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${abaHist===a.id?"rgba(255,255,255,0.55)":C.border}`,color:abaHist===a.id?"#fff":C.textMuted,boxShadow:abaHist===a.id?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4)":"none"}}>{a.l}</button>
        ))}
      </div>
      {abaHist==="ana"?(
        <div>
          <EficienciaHub historico={historico}/>
        </div>
      ):abaHist==="avarias"?(
        <AvariasAnalytics avariasData={storageGet("avarias_h2")||[]} perfil={perfil}/>
      ):(
      <>
      {(()=>{
        /* ── Últimos Lançamentos ── */
        const ult=[...historico].sort((a,b)=>b.id-a.id).slice(0,5);
        if(ult.length===0)return null;
        return(
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`2px solid #5090FF`,borderRadius:12,padding:"12px 14px",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{color:"#5090FF",fontSize:11,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase"}}>⏱ Últimos Lançamentos</span>
              <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(80,144,255,0.27),transparent)"}}/>
            </div>
            {ult.map(h=>(
              <div key={h.id} onClick={()=>setSel(h.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 8px",borderRadius:7,marginBottom:3,background:C.tagBg,cursor:"pointer"}}>
                <div style={{display:"flex",gap:8,alignItems:"center",minWidth:0}}>
                  <span style={{width:7,height:7,borderRadius:"50%",flexShrink:0,background:h.noks>0?C.warningLight:C.accentLight,boxShadow:`0 0 4px ${h.noks>0?C.warningLight:C.accentLight}`}}/>
                  <span style={{color:C.text,fontSize:11,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.tipoLabel}</span>
                  <span style={{color:"#5090FF",fontSize:9,fontWeight:800,flexShrink:0}}>{h.linha||h.maquina}</span>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                  {h.noks>0&&<span style={{color:C.warningLight,fontSize:9,fontWeight:800}}>⚠{h.noks}</span>}
                  <span style={{color:C.textDim,fontSize:9,fontFamily:"monospace"}}>{h.hora||""}</span>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      <div style={{marginBottom:10}}>
        <label style={{color:C.textDim,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:5}}>📅 Buscar por data</label>
        <div style={{display:"flex",gap:6}}>
          <input type="date" value={buscaData} onChange={e=>setBuscaData(e.target.value)} style={{...inputStyle,flex:1,colorScheme:"dark",color:buscaData?C.accentLight:C.textMuted,fontWeight:buscaData?700:400,borderColor:buscaData?C.accentLight:C.border,fontFamily:"monospace",fontSize:14,cursor:"pointer"}}/>
          {buscaData&&<button onClick={()=>setBuscaData("")} style={{padding:"0 16px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,background:C.danger+"22",border:`1px solid ${C.dangerLight}55`,color:C.dangerLight,whiteSpace:"nowrap"}}>✕ Limpar</button>}
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        {["M2","M3"].map(m=>(<button key={m} onClick={()=>{setFiltroMaq(m);setFiltroTipo("TODOS");}} style={{flex:1,padding:"10px",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,background:filtroMaq===m?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${filtroMaq===m?"rgba(255,255,255,0.55)":C.border}`,color:filtroMaq===m?"#fff":C.textMuted,boxShadow:filtroMaq===m?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4),0 0 40px rgba(80,144,255,0.2)":"none"}}>Máquina {m.replace("M","")}<div style={{fontSize:9,fontWeight:400,marginTop:2,opacity:.7}}>{m==="M2"?"L4 · L5":"L6 · L7 · L8"}</div></button>))}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        {AREAS_HIST.map(a=>(<button key={a.id} onClick={()=>{setFiltroArea(a.id);setFiltroTipo("TODOS");}} style={{flex:1,padding:"8px 6px",borderRadius:9,cursor:"pointer",background:filtroArea===a.id?C.card:C.tagBg,border:`2px solid ${filtroArea===a.id?C.accentLight:C.border}`,color:filtroArea===a.id?C.accentLight:C.textMuted,fontWeight:700,fontSize:10,textAlign:"center",boxShadow:filtroArea===a.id?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4),0 0 40px rgba(80,144,255,0.2)":"none"}}>{a.label}</button>))}
      </div>
      <div style={{marginBottom:14}}>
        <select value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)} style={{...inputStyle,fontWeight:filtroTipo==="TODOS"?400:700,color:filtroTipo==="TODOS"?C.textMuted:C.accentLight,borderColor:filtroTipo==="TODOS"?C.border:C.accentLight}}>
          {tiposDisponiveis.map(t=>(<option key={t.id} value={t.id}>{t.label}</option>))}
        </select>
      </div>
      <div style={{color:C.textDim,fontSize:11,marginBottom:8}}>{filtrados.length} registro{filtrados.length!==1?"s":""}</div>
      {filtrados.length===0?(
        <div style={{background:C.card,border:`1px dashed ${C.border}`,borderRadius:12,padding:"36px 20px",textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:8}}>📋</div>
          <p style={{color:C.textMuted,fontSize:13,margin:0}}>{historico.length===0?"Nenhum check-list salvo ainda.":"Nenhum resultado para os filtros selecionados."}</p>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {filtrados.map(h=>(
            <div key={h.id} onClick={()=>setSel(h.id)} style={{background:C.card,border:`1px solid ${h.noks>0?C.dangerLight+"44":C.border}`,borderLeft:`3px solid ${h.noks>0?C.dangerLight:C.accentLight}`,borderRadius:11,padding:"13px 14px",cursor:"pointer",transition:"border-color .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent} onMouseLeave={e=>e.currentTarget.style.borderColor=h.noks>0?C.dangerLight+"44":C.border}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{background:C.blue,color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800}}>{h.linha||`M${h.maquina?.replace("M","")}`}</span>
                  <span style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:6,padding:"2px 8px",fontSize:10}}>{h.turno}</span>
                  {h.letra&&<span style={{background:C.accent,color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800}}>{h.letra}</span>}
                  {h.hora&&<span style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:6,padding:"2px 8px",fontSize:9}}>{h.hora}</span>}
                </div>
                {h.noks>0?<span style={{color:C.dangerLight,fontSize:11,fontWeight:800,flexShrink:0}}>⚠ {h.noks}</span>:<span style={{color:C.accentLight,fontSize:11,fontWeight:800,flexShrink:0}}>✓</span>}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <span style={{color:C.white,fontWeight:700,fontSize:13,marginRight:8}}>{fmtData(h.data)}</span>
                  <span style={{background:C.tagBg,border:`1px solid ${C.accentLight}33`,color:C.accentLight,borderRadius:6,padding:"1px 7px",fontSize:9,fontWeight:600}}>{h.tipoLabel}</span>
                </div>
                <span style={{color:C.textDim,fontSize:15}}>›</span>
              </div>
              {(h.opPU||h.opPainel)&&<div style={{display:"flex",gap:12,marginTop:6}}>{h.opPU&&<span style={{color:C.textMuted,fontSize:10}}>P.Ú.: {h.opPU}</span>}{h.opPainel&&<span style={{color:C.textMuted,fontSize:10}}>Painel: {h.opPainel}</span>}</div>}
              <div style={{background:C.tagBg,borderRadius:3,height:3,marginTop:8,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,width:`${h.total>0?(h.total-h.noks)/h.total*100:100}%`,background:h.noks>0?C.dangerLight:C.accentLight}}/></div>
            </div>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}

// ─── ConfiguracoesTela ───────────────────────────────────────────────────────
function ConfiguracoesTela({ perfil, onLogout, onAbrirAdmin }) {
  const [cfg,setCfg]=useState(()=>storageGet('op_config')||{});
  const [salvo,setSalvo]=useState(false);
  const set=(k,v)=>{setCfg(p=>({...p,[k]:v}));setSalvo(false);};
  const salvar=()=>{storageSet('op_config',cfg);setSalvo(true);setTimeout(()=>setSalvo(false),2500);};
  const ehDev=perfil?.funcao==="dev";
  const [resetAberto,setResetAberto]=useState(false);
  const [resetPin,setResetPin]=useState("");
  const [resetErro,setResetErro]=useState("");
  const [resetando,setResetando]=useState(false);
  const [resetOk,setResetOk]=useState(false);
  const CHAVES_RESET=["historico_h2","ocorrencias_h2","eqstate_h2","chamados_h2","cleaners_h2","cleaners_estoque_h2","cleaners_hist_h2","justificativas_h2","notas_hist_h2","cleaners_sedim_h2","pendencias_h2","reconhecimentos_h2","comp_em_h2","chuveiros_h2","facas_h2","facao_h2"];
  const executarReset=async()=>{
    setResetErro("");
    if(resetPin.length!==4){setResetErro("Digite seu PIN de 4 dígitos.");return;}
    setResetando(true);
    const ok=await validarPin(perfil.matricula,resetPin);
    if(!ok){setResetErro("PIN incorreto. Reset cancelado.");setResetando(false);return;}
    // Apaga local + nuvem
    for(const k of CHAVES_RESET){
      try{localStorage.removeItem(k);}catch{}
      try{await deleteDoc(doc(COL,k));}catch{}
    }
    // Limpa chaves de cota travada dos chuveiros (prefixo dinâmico "cota_")
    try{
      Object.keys(localStorage).filter(k=>k.startsWith("cota_")).forEach(k=>localStorage.removeItem(k));
    }catch{}
    try{await setDoc(doc(COL,"app_control"),{reset_ts:new Date().toISOString(),by:perfil?.matricula||"—"});}catch{}
    setResetando(false);setResetOk(true);
    setTimeout(()=>{try{location.reload();}catch{}},1500);
  };
  const AREAS_CFG=[{id:"pu",label:"Parte Úmida"},{id:"cs",label:"Parte Seca / Cortadeira"},{id:"enf",label:"Enfardamento"}];
  return (
    <div>
      <h2 style={{color:C.white,fontSize:19,fontWeight:800,marginBottom:4}}>⚙️ Configurações</h2>
      <p style={{color:C.textMuted,fontSize:12,marginBottom:18}}>Preencha uma vez — os checklists serão preenchidos automaticamente.</p>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:22}}>
        {[{key:"nomeOperador",label:"Nome do Operador",placeholder:"Seu nome completo"},
          {key:"matricula",label:"Matrícula",placeholder:"Ex: 12345"},
          {key:"operadorPainel",label:"Operador de Painel",placeholder:"Nome do operador de painel"},
        ].map(campo=>(
          <div key={campo.key}>
            <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:5}}>{campo.label}</label>
            <input value={cfg[campo.key]||""} onChange={e=>set(campo.key,e.target.value)}
              placeholder={campo.placeholder} style={{...inputStyle}}/>
          </div>
        ))}
        <div>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:6}}>Área</label>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {AREAS_CFG.map(a=>(
              <button key={a.id} onClick={()=>set("area",a.id)}
                style={{padding:"10px 14px",borderRadius:9,cursor:"pointer",fontWeight:cfg.area===a.id?700:400,fontSize:13,textAlign:"left",
                  background:cfg.area===a.id?C.blue:C.tagBg,
                  border:`2px solid ${cfg.area===a.id?C.accentLight:C.border}`,
                  color:cfg.area===a.id?"#fff":C.textMuted,
                  boxShadow:cfg.area===a.id?"0 0 10px rgba(0,230,118,0.5),0 0 30px rgba(0,230,118,0.3)":"none"}}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button onClick={salvar} style={{...btnPrim,width:"100%",padding:13,fontSize:14,
        background:salvo?C.accentDark:C.accent,
        boxShadow:salvo?"none":"0 0 10px rgba(0,230,118,0.5),0 0 30px rgba(0,230,118,0.3)"}}>
        {salvo?"✓ Configuração salva!":"Salvar Configurações"}
      </button>
      {perfil&&(
        <div style={{marginTop:24,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16}}>
          <div style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Sessão ativa</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
            <span style={{color:C.white,fontSize:14,fontWeight:700}}>{perfil.nome}</span>
            <span style={{color:C.accent,fontSize:11,fontWeight:700,fontFamily:"monospace"}}>{perfil.matricula}</span>
          </div>
          <div style={{color:C.textDim,fontSize:11,marginBottom:14}}>{FUNCOES[perfil.funcao]?.label||perfil.funcao}</div>
          <button onClick={onLogout} style={{width:"100%",padding:11,borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:13,background:C.tagBg,border:`1px solid ${C.dangerLight}55`,color:C.dangerLight}}>Sair da conta</button>
        </div>
      )}

      {ehDev&&(
        <div style={{marginTop:16,background:C.card,border:`1px solid ${C.dangerLight}33`,borderRadius:12,padding:16}}>
          <div style={{color:C.dangerLight,fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6,fontWeight:800}}>⚠ Zona do desenvolvedor</div>
          <button onClick={onAbrirAdmin} style={{width:"100%",padding:12,borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:13,background:`linear-gradient(135deg,${C.blue},${C.blueLight})`,border:"none",color:"#fff",marginBottom:14,boxShadow:`0 2px 10px ${C.blueLight}44`}}>👥 Abrir Painel de Usuários</button>
          <p style={{color:C.textMuted,fontSize:11,lineHeight:1.5,margin:"0 0 12px"}}>Apaga todos os dados operacionais (histórico, semáforo, equipamentos, chamados, cleaners, justificativas) do dispositivo e da nuvem. Logins e automação são mantidos. Não pode ser desfeito.</p>
          {!resetAberto?(
            <button onClick={()=>setResetAberto(true)} style={{width:"100%",padding:11,borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:13,background:C.danger+"22",border:`1px solid ${C.dangerLight}55`,color:C.dangerLight}}>🗑 Resetar dados operacionais</button>
          ):resetOk?(
            <div style={{textAlign:"center",padding:"8px 0"}}>
              <div style={{fontSize:28,marginBottom:4}}>✅</div>
              <p style={{color:C.accent,fontWeight:800,fontSize:13,margin:0}}>Dados apagados! Recarregando...</p>
            </div>
          ):(
            <div>
              <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:6}}>Confirme com seu PIN</label>
              <input value={resetPin} onChange={e=>setResetPin(e.target.value.replace(/\D/g,"").slice(0,4))} inputMode="numeric" type="password" placeholder="••••" style={{...inputStyle,letterSpacing:"0.3em",fontSize:18,textAlign:"center",marginBottom:10}}/>
              {resetErro&&<p style={{color:C.dangerLight,fontSize:12,margin:"0 0 10px"}}>{resetErro}</p>}
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setResetAberto(false);setResetPin("");setResetErro("");}} disabled={resetando} style={{flex:1,padding:11,borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:13,background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted}}>Cancelar</button>
                <button onClick={executarReset} disabled={resetando} style={{flex:1,padding:11,borderRadius:9,cursor:resetando?"wait":"pointer",fontWeight:800,fontSize:13,background:C.danger,border:"none",color:"#fff",opacity:resetando?0.6:1}}>{resetando?"Apagando...":"Confirmar reset"}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const ROTAS_CONFIG = {
  pu:  { label:"Parte Úmida",
    rotas:[{id:"rotina",label:"Rotina PU — M2",maquina:"M2"},{id:"rotina",label:"Rotina PU — M3",maquina:"M3"}],
    motivos:["Máquina quebrada","Variação grande no processo","Falta de operador","Outro"] },
  cs:  { label:"Cortadeira / P. Seca",
    rotas:[{id:"cortadeira",label:"Rotina Cortadeira — M2",maquina:"M2"},{id:"cortadeira",label:"Rotina Cortadeira — M3",maquina:"M3"}],
    motivos:["PP da cortadeira","PP de linha","Quebra de folha","Parada de máquina","Variação grande no processo","Outro"] },
  enf: { label:"Enfardamento",
    rotas:[{id:"enf_qualidade",label:"Check List Qualidade — M2",maquina:"M2"},{id:"enf_qualidade",label:"Check List Qualidade — M3",maquina:"M3"},{id:"rota_enf",label:"Rota Enfardamento — M2",maquina:"M2"},{id:"rota_enf",label:"Rota Enfardamento — M3",maquina:"M3"}],
    motivos:["PP de linha","Quebra na máquina","Variação grande no processo","Falta de operador","Outro"] },
};

function RotasTela({ historico, onVoltar }) {
  const hoje=new Date().toISOString().slice(0,10);
  const turno=getAutoTurno();
  const letra=calcularLetra();
  const [justificativas,setJustificativas]=useState(()=>storageGet("justificativas_h2")||[]);
  React.useEffect(()=>{cloudGet("justificativas_h2").then(data=>{if(data&&Array.isArray(data))setJustificativas(data);});},[]);
  const [areaAtiva,setAreaAtiva]=useState("pu");
  const [modalAberto,setModalAberto]=useState(null); // {rotaId, area, todas}
  const [motivoSel,setMotivoSel]=useState("");
  const [outroText,setOutroText]=useState("");
  const cfg=storageGet("op_config")||{};
  const agora=new Date();
  const hora=`${String(agora.getHours()).padStart(2,"0")}:${String(agora.getMinutes()).padStart(2,"0")}`;

  const salvar=(novas)=>{setJustificativas(novas);storageSet("justificativas_h2",novas);};

  const getStatus=(area,rotaId,maquina)=>{
    const feito=historico.some(h=>h.data===hoje&&h.tipoId===rotaId&&(!maquina||h.maquina===maquina));
    if(feito) return "feito";
    const just=justificativas.find(j=>j.data===hoje&&j.turno===turno&&j.letra===letra&&j.rotaId===rotaId&&j.area===area&&j.maquina===(maquina||null));
    if(just) return "justificado";
    return "nao_feito";
  };

  const pushHistJust=(area,rotaId,maquina,motivo,outro,label)=>{
    try{
      const hist=storageGet("historico_h2")||[];
      const reg={id:Date.now()+Math.floor(Math.random()*1000),tipoId:"justificativa",tipoLabel:"Justificativa",rotaRef:rotaId,rotaLabel:label||rotaId,area,maquina:maquina||null,linha:null,turno,letra,hora,data:hoje,motivo,outro:outro||"",operador:cfg.nomeOperador||"",matricula:cfg.matricula||"",noks:0,total:0,justificativa:true};
      storageSet("historico_h2",[...hist,reg]);
    }catch{}
  };
  const justificar=(area,rotaId,maquina,motivo,outro)=>{
    const novas=[...justificativas.filter(j=>!(j.data===hoje&&j.turno===turno&&j.letra===letra&&j.rotaId===rotaId&&j.area===area&&j.maquina===(maquina||null))),
      {id:Date.now(),data:hoje,turno,letra,area,rotaId,maquina:maquina||null,motivo,outro,operador:cfg.nomeOperador||"",matricula:cfg.matricula||"",hora}];
    salvar(novas);
    const lbl=(ROTAS_CONFIG[area]?.rotas||[]).find(r=>r.id===rotaId&&r.maquina===(maquina||r.maquina))?.label;
    pushHistJust(area,rotaId,maquina,motivo,outro,lbl);
  };

  const justificarTodas=(area,motivo,outro)=>{
    const rotas=ROTAS_CONFIG[area].rotas;
    let novas=[...justificativas];
    rotas.forEach(r=>{
      if(getStatus(area,r.id,r.maquina)!=="feito"){
        novas=novas.filter(j=>!(j.data===hoje&&j.turno===turno&&j.letra===letra&&j.rotaId===r.id&&j.area===area&&j.maquina===(r.maquina||null)));
        novas.push({id:Date.now()+Math.random(),data:hoje,turno,letra,area,rotaId:r.id,maquina:r.maquina||null,motivo,outro,operador:cfg.nomeOperador||"",matricula:cfg.matricula||"",hora});
        pushHistJust(area,r.id,r.maquina,motivo,outro,r.label);
      }
    });
    salvar(novas);
  };

  const confirmar=()=>{
    const m=motivoSel==="Outro"?outroText:motivoSel;
    if(!m.trim())return;
    if(modalAberto.todas) justificarTodas(modalAberto.area,motivoSel,outroText);
    else justificar(modalAberto.area,modalAberto.rotaId,modalAberto.maquina,motivoSel,outroText);
    setModalAberto(null);setMotivoSel("");setOutroText("");
  };

  const corStatus=(s)=>s==="feito"?C.accentLight:s==="justificado"?C.warningLight:C.dangerLight;
  const bgStatus=(s)=>s==="feito"?"rgba(0,40,20,0.9)":s==="justificado"?"rgba(42,28,0,0.9)":"rgba(42,8,8,0.9)";
  const labelStatus=(s)=>s==="feito"?"FEITO":s==="justificado"?"JUSTIF.":"NÃO FEITO";
  const areaConfig=ROTAS_CONFIG[areaAtiva];
  const pendentes=areaConfig.rotas.filter(r=>getStatus(areaAtiva,r.id,r.maquina)==="nao_feito").length;

  return(
    <div>
      {modalAberto&&(
        <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"18px 18px 0 0",padding:24,width:"100%",maxWidth:600}}>
            <h3 style={{color:C.white,fontSize:15,fontWeight:800,margin:"0 0 4px"}}>{modalAberto.todas?"Justificar todas as rotas":"Justificar rota"}</h3>
            <p style={{color:C.textMuted,fontSize:12,marginBottom:14}}>{modalAberto.todas?`${areaConfig.label} — ${pendentes} pendente${pendentes!==1?"s":""}`:modalAberto.label}</p>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
              {areaConfig.motivos.map(m=>(
                <button key={m} onClick={()=>setMotivoSel(m)} style={{padding:"9px 12px",borderRadius:8,cursor:"pointer",fontWeight:motivoSel===m?700:400,fontSize:12,textAlign:"left",background:motivoSel===m?"rgba(176,125,0,0.2)":C.tagBg,border:`1px solid ${motivoSel===m?C.warningLight:C.border}`,color:motivoSel===m?C.warningLight:C.textMuted}}>{m}</button>
              ))}
            </div>
            {motivoSel==="Outro"&&<textarea value={outroText} onChange={e=>setOutroText(e.target.value)} rows={2} placeholder="Descreva o motivo..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit",marginBottom:14}}/>}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setModalAberto(null);setMotivoSel("");setOutroText("");}} style={{...btnSec,flex:1}}>Cancelar</button>
              <button onClick={confirmar} disabled={!motivoSel||(motivoSel==="Outro"&&!outroText.trim())} style={{...btnPrim,flex:1,background:C.warning,opacity:!motivoSel||(motivoSel==="Outro"&&!outroText.trim())?0.4:1}}>📋 Justificar</button>
            </div>
          </div>
        </div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <h2 style={{color:C.white,fontSize:19,fontWeight:800,margin:0}}>Rotas do Turno</h2>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            {[{label:"TURNO",value:turno,color:"#5090FF"},{label:"LETRA",value:letra,color:"#00E676"}].map(({label,value,color})=>(
              <div key={label} style={{background:"rgba(10,25,45,0.9)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,padding:"3px 10px",display:"flex",gap:6,alignItems:"center"}}>
                <span style={{color:"rgba(255,255,255,0.3)",fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase"}}>{label}</span>
                <span style={{color,fontSize:12,fontWeight:700}}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onVoltar} style={{...btnSec,padding:"6px 12px",fontSize:12}}>← Voltar</button>
      </div>
      {/* Seletor de área */}
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {Object.entries(ROTAS_CONFIG).map(([id,cfg])=>{
          const tot=cfg.rotas.length;
          const feitos=cfg.rotas.filter(r=>getStatus(id,r.id,r.maquina)==="feito").length;
          const justs=cfg.rotas.filter(r=>getStatus(id,r.id,r.maquina)==="justificado").length;
          const pend=tot-feitos-justs;
          return(
            <button key={id} onClick={()=>setAreaAtiva(id)} style={{flex:1,padding:"8px 6px",borderRadius:10,cursor:"pointer",background:areaAtiva===id?C.blue:C.tagBg,border:`2px solid ${areaAtiva===id?C.accentLight:C.border}`,color:areaAtiva===id?"#fff":C.textMuted,fontWeight:700,fontSize:10,textAlign:"center",boxShadow:areaAtiva===id?"0 0 10px rgba(0,230,118,0.5),0 0 30px rgba(0,230,118,0.3)":"none"}}>
              <div style={{fontSize:9,marginBottom:4}}>{cfg.label}</div>
              <div style={{background:"rgba(255,255,255,0.08)",borderRadius:2,height:3,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:2,background:pend===0?C.accentLight:justs>0?C.warningLight:C.dangerLight,width:`${Math.round((feitos+justs)/tot*100)}%`,transition:"width .3s"}}/>
              </div>
              <div style={{fontSize:8,marginTop:3,color:"rgba(255,255,255,0.4)"}}>{feitos}/{tot} concluídas</div>
            </button>
          );
        })}
      </div>
      {/* Lista de rotas */}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
        {ROTAS_CONFIG[areaAtiva].rotas.map((rota,ri)=>{
          const st=getStatus(areaAtiva,rota.id,rota.maquina);
          const just=justificativas.find(j=>j.data===hoje&&j.turno===turno&&j.letra===letra&&j.rotaId===rota.id&&j.area===areaAtiva&&j.maquina===(rota.maquina||null));
          const cor=st==="feito"?C.accentLight:st==="justificado"?C.warningLight:C.dangerLight;
          const bg=st==="feito"?"rgba(0,50,25,0.6)":st==="justificado"?"rgba(50,35,0,0.6)":"rgba(50,10,10,0.4)";
          const label=st==="feito"?"FEITO":st==="justificado"?"JUSTIFICADO":"NÃO FEITO";
          return(
            <div key={`rota_${areaAtiva}_${ri}`} style={{background:bg,border:`1px solid ${cor}44`,borderLeft:`3px solid ${cor}`,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,boxShadow:st==="feito"?`0 0 12px ${cor}22`:"none"}} className={st==="nao_feito"?"trava-pulse":""}>
              <div style={{width:18,height:18,borderRadius:"50%",flexShrink:0,background:st==="feito"?C.success:st==="justificado"?C.warning:C.danger,border:`2px solid ${cor}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:800}}>
                {st==="feito"?"✓":st==="justificado"?"J":"✕"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:C.white,fontWeight:600,fontSize:13}}>{rota.label}</div>
                {just&&<div style={{color:C.warningLight,fontSize:10,marginTop:2,fontStyle:"italic"}}>{just.motivo==="Outro"?just.outro:just.motivo}</div>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <span style={{color:cor,fontSize:9,fontWeight:800,letterSpacing:"0.08em"}}>{label}</span>
                {st!=="feito"&&(
                  <button onClick={()=>setModalAberto({rotaId:rota.id,area:areaAtiva,label:rota.label,maquina:rota.maquina,todas:false})}
                    style={{background:"rgba(10,25,45,0.9)",border:`1px solid rgba(255,255,255,0.1)`,color:C.textMuted,borderRadius:6,padding:"4px 9px",cursor:"pointer",fontSize:9,letterSpacing:"0.06em"}}>JUST.</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {pendentes>0&&(
        <button onClick={()=>setModalAberto({area:areaAtiva,todas:true})}
          style={{background:"rgba(42,28,0,0.9)",border:`1px solid ${C.warningLight}55`,color:C.warningLight,borderRadius:10,padding:"12px",cursor:"pointer",fontWeight:700,fontSize:12,letterSpacing:"0.08em",width:"100%"}}>
          JUSTIFICAR TODAS AS ROTAS · {pendentes} PENDENTE{pendentes!==1?"S":""}
        </button>
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { perfil, setPerfil, logout } = usePerfilAtivo();
  const [adminAberto,setAdminAberto]=useState(false);
  const [tela,setTela]=useState("dashboard");
  const [chuveiroAlvo,setChuveiroAlvo]=useState(null); // {maq,id} para abrir direto
  const [modalChuveiroHome,setModalChuveiroHome]=useState(null); // {maq,id} registro rápido sem sair da Home
  const [modoVisao,setModoVisao]=useState("app"); // "app" | "dashboard"
  const [historico,setHistorico]=useState(()=>storageGet("historico_h2")||[]);
  const [areaAtiva,setAreaAtiva]=useState("pu");
  const [ocorrencias,setOcorrencias]=useState({M2:null,M3:null});
  const [modalSinal,setModalSinal]=useState(false);
  const [modalCor,setModalCor]=useState(null);
  const [modalMotivo,setModalMotivo]=useState("");
  const [modalOutro,setModalOutro]=useState("");
  const [modalMaq,setModalMaq]=useState("Ambas");
  const [eqState,setEqState]=useState({
    comum:equipamentosComum,m2:equipamentosM2,m3:equipamentosM3,
    cs_m2:equipamentosCS_M2,cs_m3:equipamentosCS_M3,
    enf_m2:equipamentosEnf_M2,enf_m3:equipamentosEnf_M3,
  });
  const todos=[...eqState.comum,...eqState.m2,...eqState.m3,...eqState.cs_m2,...eqState.cs_m3,...eqState.enf_m2,...eqState.enf_m3];
  const totalNotas=todos.reduce((a,e)=>a+e.notas.length,0);
  const notasComum=eqState.comum.reduce((a,e)=>a+e.notas.length,0);
  const salvouNaSessao=useRef(false);
  const salvarChecklist=async(registro)=>{
    salvouNaSessao.current=true;
    // Mantem registro completo (com fotos) no state e localStorage para uso imediato
    const novo=[...historico,registro];
    setHistorico(novo);
    try{localStorage.setItem("historico_h2",JSON.stringify(novo));}catch{}
    // Para o Firestore: separa fotos em doc proprio e salva historico leve
    try{
      const {fotos,limpo,temFotos}=extrairFotos(registro);
      if(temFotos){ await setDoc(doc(COL,"fotos_"+registro.id),{val:fotos,ts:Date.now()}); }
      // Desidrata TODOS os registros; migra fotos de registros antigos ainda nao migrados
      const historicoLeve=[];
      for(const r of novo){
        if(r.id===registro.id){ historicoLeve.push(limpo); continue; }
        if(temMarcadores(r)){ historicoLeve.push(r); continue; } // ja desidratado
        const ex=extrairFotos(r);
        if(ex.temFotos){ try{ await setDoc(doc(COL,"fotos_"+r.id),{val:ex.fotos,ts:Date.now()}); }catch{} }
        historicoLeve.push(ex.limpo);
      }
      await setDoc(doc(COL,"historico_h2"),{val:historicoLeve,ts:Date.now()});
    }catch(e){console.error("Firestore erro historico:",e);}
  };
  const eqCarregado=useRef(false);
  React.useEffect(()=>{
    cloudGet("historico_h2").then(data=>{
      if(!salvouNaSessao.current&&data&&Array.isArray(data)){
        setHistorico(prev=>{
          if(!data.length) return prev;
          if(!prev.length) return data;
          const ids=new Set(prev.map(r=>r.id));
          const extras=data.filter(r=>!ids.has(r.id));
          if(extras.length===0) return prev.length>=data.length?prev:data;
          const merged=[...prev,...extras].sort((a,b)=>a.id-b.id);
          localStorage.setItem("historico_h2",JSON.stringify(merged));
          setDoc(doc(COL,"historico_h2"),{val:merged,ts:Date.now()}).catch(()=>{});
          return merged;
        });
      }
    });
    cloudGet("eqstate_h2").then(data=>{if(data&&data.comum)setEqState(data);eqCarregado.current=true;});
  },[]);
  React.useEffect(()=>{
    if(!eqCarregado.current)return;
    storageSet("eqstate_h2",eqState);
  },[eqState]);
  React.useEffect(()=>{
    const unsub=onSnapshot(doc(COL,"ocorrencias_h2"),(snap)=>{
      if(snap.exists()){const d=snap.data().val;if(d)setOcorrencias(d);}
    });
    return ()=>unsub();
  },[]);
  React.useEffect(()=>{
    const CHAVES_ALL=["historico_h2","ocorrencias_h2","eqstate_h2","chamados_h2","cleaners_h2","cleaners_estoque_h2","cleaners_hist_h2","justificativas_h2","notas_hist_h2","cleaners_sedim_h2","pendencias_h2","reconhecimentos_h2","comp_em_h2","chuveiros_h2","facas_h2","facao_h2"];
    const unsub=onSnapshot(doc(COL,"app_control"),(snap)=>{
      if(!snap.exists())return;
      const {reset_ts}=snap.data();
      const local_ts=localStorage.getItem("last_reset_ts");
      if(reset_ts&&reset_ts!==local_ts){
        CHAVES_ALL.forEach(k=>{try{localStorage.removeItem(k);}catch{}});
        localStorage.setItem("last_reset_ts",reset_ts);
        try{location.reload();}catch{}
      }
    });
    return ()=>unsub();
  },[]);
  const veHistorico = perfil && FUNCOES[perfil.funcao]?.veHistorico;
  const nav=[
    {id:"dashboard",label:"Início",icon:"⬡"},
    {id:"checklist",label:"Check-list",icon:"✓"},
    {id:"equipamentos",label:"Equipam.",icon:"⚙"},
    {id:"historico",label:"Histórico",icon:"📋"},
    {id:"configuracoes",label:"Config.",icon:"⚙️"},
  ].filter(n=>n.id!=="historico"||veHistorico);
  const renderTela=()=>{
    if(tela==="dashboard")return <Dashboard eqState={eqState} setTela={setTela} historico={historico} areaAtiva={areaAtiva} setAreaAtiva={setAreaAtiva} ocorrencias={ocorrencias} setOcorrencias={setOcorrencias} perfil={perfil} modalChuveiroHome={modalChuveiroHome} setModalChuveiroHome={setModalChuveiroHome}/>;
    if(tela==="checklist")return <ChecklistTela onSalvar={salvarChecklist} historico={historico} perfil={perfil}/>;
    if(tela==="equipamentos")return <EquipamentosTela eqState={eqState} setEqState={setEqState} areaAtiva={areaAtiva} setAreaAtiva={setAreaAtiva} historico={historico} setTela={setTela}/>;
    if(tela==="historico")return veHistorico?<HistoricoTela historico={historico} areaAtiva={areaAtiva} perfil={perfil}/>:<Dashboard eqState={eqState} setTela={setTela} historico={historico} areaAtiva={areaAtiva} setAreaAtiva={setAreaAtiva} ocorrencias={ocorrencias} setOcorrencias={setOcorrencias} perfil={perfil} modalChuveiroHome={modalChuveiroHome} setModalChuveiroHome={setModalChuveiroHome}/>;
    if(tela==="configuracoes")return <ConfiguracoesTela perfil={perfil} onLogout={logout} onAbrirAdmin={()=>setAdminAberto(true)}/>;
    if(tela==="rotas")return <RotasTela historico={historico} onVoltar={()=>setTela("dashboard")}/>;
    if(tela==="mural")return <MuralOportunidades eqState={eqState} onVoltar={()=>setTela("dashboard")}/>;
    if(tela==="cleaners")return <div style={{padding:"16px 16px 80px"}}><button onClick={()=>setTela("dashboard")} style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:9,padding:"9px 14px",cursor:"pointer",fontSize:12,fontWeight:700,marginBottom:14}}>← Início</button><CleanersTela eqState={eqState}/></div>;
    if(tela==="chuveiros")return <div style={{padding:"16px 16px 80px"}}><button onClick={()=>{setTela("dashboard");setChuveiroAlvo(null);}} style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:9,padding:"9px 14px",cursor:"pointer",fontSize:12,fontWeight:700,marginBottom:14}}>← Início</button><ChuveirosTela maquina={chuveiroAlvo?.maq||"M2"} abrirDireto={chuveiroAlvo}/></div>;
  };
  if(!perfil) return <TelaAuth onEntrar={setPerfil}/>;
  if(adminAberto && perfil.funcao==="dev") return <PainelAdmin onVoltar={()=>setAdminAberto(false)}/>;
  if(modoVisao==="dashboard") return <React.Suspense fallback={<div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:C.accentLight,fontFamily:"monospace",fontSize:14}}>Carregando dashboard…</div>}><DashboardTV setTela={(t)=>{setModoVisao("app");setTela(t);}} setModoVisao={setModoVisao}/></React.Suspense>;
  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Segoe UI',system-ui,sans-serif",color:C.text}}>
      <div style={{maxWidth:860,margin:"0 auto",position:"relative"}}>
      <style>{`
        @keyframes trava-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(232,51,58,0.8); }
          70%  { box-shadow: 0 0 0 7px rgba(232,51,58,0); }
          100% { box-shadow: 0 0 0 0 rgba(232,51,58,0); }
        }
        .trava-pulse { animation: trava-pulse 1.4s infinite; }
        @keyframes verde-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.8); }
          70%  { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        .verde-pulse { animation: verde-pulse 2s infinite; }
        @keyframes led-pulse {
          0%,100% { opacity:1; box-shadow: 0 0 6px #00E676, 0 0 12px #00E67688; }
          50%     { opacity:0.55; box-shadow: 0 0 3px #00E676, 0 0 6px #00E67644; }
        }
        .led-line { animation: led-pulse 2.5s ease-in-out infinite; }
        @keyframes led-pulse-yellow {
          0%,100% { opacity:1; box-shadow: 0 0 6px #FFC107, 0 0 12px #FFC10788; }
          50%     { opacity:0.55; box-shadow: 0 0 3px #FFC107, 0 0 6px #FFC10744; }
        }
        .led-line-yellow { animation: led-pulse-yellow 2.5s ease-in-out infinite; }
        @keyframes led-pulse-red {
          0%,100% { opacity:1; box-shadow: 0 0 6px #FF5252, 0 0 12px #FF525288; }
          50%     { opacity:0.55; box-shadow: 0 0 3px #FF5252, 0 0 6px #FF525244; }
        }
        .led-line-red { animation: led-pulse-red 1.4s ease-in-out infinite; }
      `}</style>
      {/* Header */}
      <div style={{position:"sticky",top:0,zIndex:100}}>
        <div style={{position:"relative",overflow:"hidden",background:"linear-gradient(180deg,rgba(8,28,45,0.96),rgba(4,17,29,0.90))",borderBottom:"1px solid rgba(0,230,118,0.28)",boxShadow:"0 6px 22px rgba(0,0,0,0.5),0 1px 0 rgba(0,230,118,0.12)",padding:"11px 16px",minHeight:69,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:9,position:"relative",zIndex:1}}>
            <svg viewBox="0 0 32 28" style={{width:32,height:28,flexShrink:0,overflow:"visible"}}>
              <defs>
                <linearGradient id="vtxA" gradientUnits="userSpaceOnUse" x1="16" y1="3" x2="3" y2="25"><stop offset="0" stopColor="#00E676"/><stop offset="1" stopColor="#00F0FF"/></linearGradient>
                <linearGradient id="vtxB" gradientUnits="userSpaceOnUse" x1="3" y1="25" x2="29" y2="25"><stop offset="0" stopColor="#00F0FF"/><stop offset="1" stopColor="#5090FF"/></linearGradient>
                <linearGradient id="vtxC" gradientUnits="userSpaceOnUse" x1="29" y1="25" x2="16" y2="3"><stop offset="0" stopColor="#5090FF"/><stop offset="1" stopColor="#00E676"/></linearGradient>
                <linearGradient id="vtxfT" gradientUnits="userSpaceOnUse" x1="16" y1="3" x2="16" y2="17"><stop offset="0" stopColor="#00E676" stopOpacity="0.40"/><stop offset="1" stopColor="#00E676" stopOpacity="0.05"/></linearGradient>
                <linearGradient id="vtxfL" gradientUnits="userSpaceOnUse" x1="3" y1="25" x2="14" y2="15"><stop offset="0" stopColor="#00F0FF" stopOpacity="0.34"/><stop offset="1" stopColor="#00F0FF" stopOpacity="0.04"/></linearGradient>
                <linearGradient id="vtxfR" gradientUnits="userSpaceOnUse" x1="29" y1="25" x2="18" y2="15"><stop offset="0" stopColor="#5090FF" stopOpacity="0.36"/><stop offset="1" stopColor="#5090FF" stopOpacity="0.04"/></linearGradient>
              </defs>
              <polygon points="16,3 3,25 16,17" fill="url(#vtxfL)"/>
              <polygon points="16,3 29,25 16,17" fill="url(#vtxfT)"/>
              <polygon points="3,25 29,25 16,17" fill="url(#vtxfR)"/>
              <line x1="16" y1="3" x2="3" y2="25" stroke="url(#vtxA)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              <line x1="3" y1="25" x2="29" y2="25" stroke="url(#vtxB)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              <line x1="29" y1="25" x2="16" y2="3" stroke="url(#vtxC)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              <line x1="16" y1="3" x2="16" y2="17" stroke="#00E676" strokeWidth="0.8" opacity="0.6"/>
              <line x1="3" y1="25" x2="16" y2="17" stroke="#00F0FF" strokeWidth="0.8" opacity="0.6"/>
              <line x1="29" y1="25" x2="16" y2="17" stroke="#5090FF" strokeWidth="0.8" opacity="0.6"/>
              <circle cx="16" cy="3" r="2.3" fill="#00E676" style={{filter:"drop-shadow(0 0 2px #00E676)"}}/>
              <circle cx="3" cy="25" r="2.3" fill="#00F0FF" style={{filter:"drop-shadow(0 0 2px #00F0FF)"}}/>
              <circle cx="29" cy="25" r="2.3" fill="#5090FF" style={{filter:"drop-shadow(0 0 2px #5090FF)"}}/>
              <circle cx="16" cy="17" r="2" fill="#fff" style={{filter:"drop-shadow(0 0 3px #fff)"}}>
                <animate attributeName="opacity" values="0.55;1;0.55" dur="2.4s" repeatCount="indefinite"/>
                <animate attributeName="r" values="2;2.9;2" dur="2.4s" repeatCount="indefinite"/>
              </circle>
            </svg>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:800,fontSize:15,color:"#FFFFFF",letterSpacing:"0.28em",paddingLeft:"0.28em",lineHeight:1,textShadow:"0 0 12px rgba(0,230,118,0.5)"}}>VÉRTICE</div>
              <div style={{fontFamily:"ui-monospace,Menlo,Consolas,monospace",fontSize:8,color:"#5E7A99",letterSpacing:"0.22em",marginTop:3,whiteSpace:"nowrap"}}>DECIDA MELHOR</div>
            </div>
          </div>
          {/* Camada de radar: sinais cruzam o header e convergem no núcleo do logo */}
          <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:2,overflow:"visible"}}>
            <g>
              <circle r="1.8" fill="#00E676" opacity="0" style={{filter:"drop-shadow(0 0 3px #00E676)"}}>
                <animateMotion dur="7s" begin="0.0s" repeatCount="indefinite" calcMode="spline" path="M360,12 L32,37" keyPoints="0;0;1;1" keyTimes="0;0.5;0.92;1" keySplines="0 0 1 1;0.45 0 0.55 1;0 0 1 1"/>
                <animate attributeName="opacity" dur="7s" begin="0.0s" repeatCount="indefinite" keyTimes="0;0.47;0.52;0.88;0.92;1" values="0;0;0.85;0.85;0;0"/>
              </circle>
              <circle cx="360" cy="12" r="1" fill="none" stroke="#00E676" strokeWidth="0.8" opacity="0">
                <animate attributeName="r" dur="7s" begin="0.0s" repeatCount="indefinite" keyTimes="0;0.47;0.56;1" values="1;1;6;6"/>
                <animate attributeName="opacity" dur="7s" begin="0.0s" repeatCount="indefinite" keyTimes="0;0.47;0.52;0.6;1" values="0;0;0.7;0;0"/>
              </circle>
            </g>
            <g>
              <circle r="1.8" fill="#00F0FF" opacity="0" style={{filter:"drop-shadow(0 0 3px #00F0FF)"}}>
                <animateMotion dur="7s" begin="1.167s" repeatCount="indefinite" calcMode="spline" path="M300,31 L32,37" keyPoints="0;0;1;1" keyTimes="0;0.5;0.92;1" keySplines="0 0 1 1;0.45 0 0.55 1;0 0 1 1"/>
                <animate attributeName="opacity" dur="7s" begin="1.167s" repeatCount="indefinite" keyTimes="0;0.47;0.52;0.88;0.92;1" values="0;0;0.85;0.85;0;0"/>
              </circle>
              <circle cx="300" cy="31" r="1" fill="none" stroke="#00F0FF" strokeWidth="0.8" opacity="0">
                <animate attributeName="r" dur="7s" begin="1.167s" repeatCount="indefinite" keyTimes="0;0.47;0.56;1" values="1;1;6;6"/>
                <animate attributeName="opacity" dur="7s" begin="1.167s" repeatCount="indefinite" keyTimes="0;0.47;0.52;0.6;1" values="0;0;0.7;0;0"/>
              </circle>
            </g>
            <g>
              <circle r="1.8" fill="#5090FF" opacity="0" style={{filter:"drop-shadow(0 0 3px #5090FF)"}}>
                <animateMotion dur="7s" begin="2.333s" repeatCount="indefinite" calcMode="spline" path="M250,17 L32,37" keyPoints="0;0;1;1" keyTimes="0;0.5;0.92;1" keySplines="0 0 1 1;0.45 0 0.55 1;0 0 1 1"/>
                <animate attributeName="opacity" dur="7s" begin="2.333s" repeatCount="indefinite" keyTimes="0;0.47;0.52;0.88;0.92;1" values="0;0;0.85;0.85;0;0"/>
              </circle>
              <circle cx="250" cy="17" r="1" fill="none" stroke="#5090FF" strokeWidth="0.8" opacity="0">
                <animate attributeName="r" dur="7s" begin="2.333s" repeatCount="indefinite" keyTimes="0;0.47;0.56;1" values="1;1;6;6"/>
                <animate attributeName="opacity" dur="7s" begin="2.333s" repeatCount="indefinite" keyTimes="0;0.47;0.52;0.6;1" values="0;0;0.7;0;0"/>
              </circle>
            </g>
            <g>
              <circle r="1.8" fill="#00E676" opacity="0" style={{filter:"drop-shadow(0 0 3px #00E676)"}}>
                <animateMotion dur="7s" begin="3.5s" repeatCount="indefinite" calcMode="spline" path="M330,41 L32,37" keyPoints="0;0;1;1" keyTimes="0;0.5;0.92;1" keySplines="0 0 1 1;0.45 0 0.55 1;0 0 1 1"/>
                <animate attributeName="opacity" dur="7s" begin="3.5s" repeatCount="indefinite" keyTimes="0;0.47;0.52;0.88;0.92;1" values="0;0;0.85;0.85;0;0"/>
              </circle>
              <circle cx="330" cy="41" r="1" fill="none" stroke="#00E676" strokeWidth="0.8" opacity="0">
                <animate attributeName="r" dur="7s" begin="3.5s" repeatCount="indefinite" keyTimes="0;0.47;0.56;1" values="1;1;6;6"/>
                <animate attributeName="opacity" dur="7s" begin="3.5s" repeatCount="indefinite" keyTimes="0;0.47;0.52;0.6;1" values="0;0;0.7;0;0"/>
              </circle>
            </g>
            <g>
              <circle r="1.8" fill="#00F0FF" opacity="0" style={{filter:"drop-shadow(0 0 3px #00F0FF)"}}>
                <animateMotion dur="7s" begin="4.667s" repeatCount="indefinite" calcMode="spline" path="M205,24 L32,37" keyPoints="0;0;1;1" keyTimes="0;0.5;0.92;1" keySplines="0 0 1 1;0.45 0 0.55 1;0 0 1 1"/>
                <animate attributeName="opacity" dur="7s" begin="4.667s" repeatCount="indefinite" keyTimes="0;0.47;0.52;0.88;0.92;1" values="0;0;0.85;0.85;0;0"/>
              </circle>
              <circle cx="205" cy="24" r="1" fill="none" stroke="#00F0FF" strokeWidth="0.8" opacity="0">
                <animate attributeName="r" dur="7s" begin="4.667s" repeatCount="indefinite" keyTimes="0;0.47;0.56;1" values="1;1;6;6"/>
                <animate attributeName="opacity" dur="7s" begin="4.667s" repeatCount="indefinite" keyTimes="0;0.47;0.52;0.6;1" values="0;0;0.7;0;0"/>
              </circle>
            </g>
            <g>
              <circle r="1.8" fill="#5090FF" opacity="0" style={{filter:"drop-shadow(0 0 3px #5090FF)"}}>
                <animateMotion dur="7s" begin="5.833s" repeatCount="indefinite" calcMode="spline" path="M372,34 L32,37" keyPoints="0;0;1;1" keyTimes="0;0.5;0.92;1" keySplines="0 0 1 1;0.45 0 0.55 1;0 0 1 1"/>
                <animate attributeName="opacity" dur="7s" begin="5.833s" repeatCount="indefinite" keyTimes="0;0.47;0.52;0.88;0.92;1" values="0;0;0.85;0.85;0;0"/>
              </circle>
              <circle cx="372" cy="34" r="1" fill="none" stroke="#5090FF" strokeWidth="0.8" opacity="0">
                <animate attributeName="r" dur="7s" begin="5.833s" repeatCount="indefinite" keyTimes="0;0.47;0.56;1" values="1;1;6;6"/>
                <animate attributeName="opacity" dur="7s" begin="5.833s" repeatCount="indefinite" keyTimes="0;0.47;0.52;0.6;1" values="0;0;0.7;0;0"/>
              </circle>
            </g>
            <circle cx="32" cy="37" fill="none" stroke="#fff" strokeWidth="1">
              <animate attributeName="r" values="3;13" dur="3s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.45;0" dur="3s" repeatCount="indefinite"/>
            </circle>
          </svg>
          <div style={{display:"flex",alignItems:"center",gap:7,position:"relative",zIndex:3}}>
            {notasComum>0&&<button onClick={()=>setTela("equipamentos")} style={{background:"rgba(240,165,0,0.18)",border:`1px solid ${C.warningLight}`,color:C.warningLight,borderRadius:20,padding:"3px 9px",fontSize:10,fontWeight:800,cursor:"pointer"}}>⚡{notasComum}</button>}
            {totalNotas>0&&<button onClick={()=>setTela("equipamentos")} style={{background:"rgba(232,51,58,0.18)",border:`1px solid ${C.dangerLight}`,color:C.dangerLight,borderRadius:20,padding:"3px 9px",fontSize:10,fontWeight:800,cursor:"pointer"}}>🗒{totalNotas}</button>}
            <button onClick={()=>setModoVisao("dashboard")} style={{background:"rgba(80,144,255,0.12)",border:`1px solid ${C.blueLight}55`,color:C.blueLight,borderRadius:20,padding:"3px 9px",fontSize:10,fontWeight:800,cursor:"pointer"}}>🖥️</button>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <button onClick={()=>setModalSinal(true)} style={{background:"none",border:"none",cursor:"pointer",padding:"2px 4px",display:"flex",alignItems:"center",gap:4}}>
                {(()=>{const oc=ocMaisCritica(ocorrencias);const cor=oc?.cor==="vermelho"?C.dangerLight:oc?.cor==="amarelo"?C.warningLight:C.accentLight;return <span style={{fontSize:18,filter:`drop-shadow(0 0 4px ${cor})`}}>🚦</span>;})()}
              </button>
            </div>
          </div>
        </div>
        {(()=>{const oc=ocMaisCritica(ocorrencias);const cor=oc?.cor==="vermelho"?"#FF5252":oc?.cor==="amarelo"?"#FFC107":"#00E676";const c2=oc?.cor==="vermelho"?"#FF8A80":oc?.cor==="amarelo"?"#FFD54F":"#52FF9C";const cls=oc?.cor==="vermelho"?"led-line-red":oc?.cor==="amarelo"?"led-line-yellow":"led-line";return <div style={{height:3,background:`linear-gradient(90deg,transparent,${cor},${c2},${cor},transparent)`,transition:"background 0.8s"}} className={cls}/>;})()}
      </div>
      <div style={{padding:"20px 16px 100px"}}>{renderTela()}</div>
      {/* Nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(4,17,29,0.92)",backdropFilter:"blur(25px)",WebkitBackdropFilter:"blur(25px)",borderTop:"1px solid rgba(0,230,118,0.2)",display:"flex",padding:"8px 0 16px",boxShadow:"0 -4px 40px rgba(0,0,0,0.7)"}}>
        {nav.map(n=>{
          const ativo=tela===n.id;
          return (
            <button key={n.id} onClick={()=>setTela(n.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"3px 0"}}>
              <span style={{fontSize:17,lineHeight:1,opacity:ativo?1:0.38,transition:"opacity .15s"}}>{n.icon}</span>
              <span style={{fontSize:9,fontWeight:ativo?800:400,color:ativo?"#00E676":"rgba(255,255,255,0.38)",letterSpacing:"0.05em",textTransform:"uppercase"}}>{n.label}</span>
              {ativo&&<div style={{width:18,height:2.5,background:"#00E676",borderRadius:2,marginTop:1,boxShadow:"0 0 6px #009A4488"}}/>}
            </button>
          );
        })}
      </div>
      {modalSinal&&(
        <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>{setModalSinal(false);setModalCor(null);setModalMotivo("");setModalOutro("");}}>
          <div style={{background:C.surface,border:`1px solid ${modalCor==="vermelho"?C.dangerLight:modalCor==="amarelo"?C.warningLight:C.accentLight}66`,borderRadius:"18px 18px 0 0",padding:24,width:"100%",maxWidth:600}} onClick={e=>e.stopPropagation()}>
            <div style={{color:C.white,fontWeight:800,fontSize:15,marginBottom:4}}>🚦 Estado Operacional</div>
            <div style={{color:C.textMuted,fontSize:12,marginBottom:16}}>Sinaliza o impacto real no processo de produção</div>
            {!modalCor?(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <button onClick={()=>setModalCor("verde")} style={{padding:"12px 16px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,background:"rgba(0,40,20,0.6)",border:`1.5px solid ${C.accentLight}`,color:C.accentLight,textAlign:"left"}}>🟢 Normal — Operação sem impactos</button>
                <button onClick={()=>setModalCor("amarelo")} style={{padding:"12px 16px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,background:"rgba(42,28,0,0.6)",border:`1.5px solid ${C.warningLight}`,color:C.warningLight,textAlign:"left"}}>🟡 Atenção — Com interferências no processo</button>
                <button onClick={()=>setModalCor("vermelho")} style={{padding:"12px 16px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,background:"rgba(42,8,8,0.6)",border:`1.5px solid ${C.dangerLight}`,color:C.dangerLight,textAlign:"left"}}>🔴 Crítico — Impacto real na produção</button>
              </div>
            ):(
              <>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <button onClick={()=>{setModalCor(null);setModalMotivo("");setModalOutro("");}} style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:8,padding:"4px 10px",fontSize:12,cursor:"pointer"}}>←</button>
                  <span style={{color:modalCor==="vermelho"?C.dangerLight:modalCor==="amarelo"?C.warningLight:C.accentLight,fontWeight:700,fontSize:13}}>{modalCor==="verde"?"🟢 Normal":modalCor==="amarelo"?"🟡 Atenção":"🔴 Crítico"}</span>
                </div>
                {modalCor==="verde"?(
                  <>
                    <div style={{marginBottom:12}}>
                      <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Máquina que retornou ao normal</div>
                      <div style={{display:"flex",gap:6}}>
                        {["M2","M3","Ambas"].map(m=>(
                          <button key={m} onClick={()=>setModalMaq(m)} style={{flex:1,padding:"8px",borderRadius:8,cursor:"pointer",fontWeight:800,fontSize:12,background:modalMaq===m?C.success:C.tagBg,border:`1.5px solid ${modalMaq===m?C.accentLight:C.border}`,color:modalMaq===m?"#fff":C.textMuted,transition:"all .15s"}}>{m}</button>
                        ))}
                      </div>
                    </div>
                    <button onClick={()=>{const novo=modalMaq==="Ambas"?{M2:null,M3:null}:{...ocorrencias,[modalMaq]:null};setOcorrencias(novo);storageSet("ocorrencias_h2",novo);setModalSinal(false);setModalCor(null);setModalMaq("Ambas");}} style={{width:"100%",padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,background:C.success,border:"none",color:"#fff"}}>✓ Confirmar — Operação Normal</button>
                  </>
                ):(
                  <>
                    <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
                      {MOTIVOS_OC[modalCor]?.map(m=>(
                        <button key={m} onClick={()=>setModalMotivo(m===modalMotivo?"":m)} style={{padding:"9px 12px",borderRadius:8,cursor:"pointer",fontWeight:modalMotivo===m?700:400,fontSize:12,textAlign:"left",background:modalMotivo===m?`rgba(${modalCor==="amarelo"?"176,125,0":"192,39,45"},0.2)`:C.tagBg,border:`1px solid ${modalMotivo===m?(modalCor==="amarelo"?C.warningLight:C.dangerLight):C.border}`,color:modalMotivo===m?(modalCor==="amarelo"?C.warningLight:C.dangerLight):C.textMuted}}>{m}</button>
                      ))}
                    </div>
                    {modalMotivo==="Outro"&&<input value={modalOutro} onChange={e=>setModalOutro(e.target.value)} placeholder="Descreva o motivo..." style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.white,fontSize:13,marginBottom:12,boxSizing:"border-box"}}/>}
                    <div style={{marginBottom:12}}>
                      <div style={{color:C.textDim,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Máquina afetada</div>
                      <div style={{display:"flex",gap:6}}>
                        {["M2","M3","Ambas"].map(m=>(
                          <button key={m} onClick={()=>setModalMaq(m)} style={{flex:1,padding:"8px",borderRadius:8,cursor:"pointer",fontWeight:800,fontSize:12,background:modalMaq===m?(modalCor==="amarelo"?C.warning:C.danger):C.tagBg,border:`1.5px solid ${modalMaq===m?(modalCor==="amarelo"?C.warningLight:C.dangerLight):C.border}`,color:modalMaq===m?"#fff":C.textMuted,transition:"all .15s"}}>{m}</button>
                        ))}
                      </div>
                    </div>
                    <button disabled={!modalMotivo||(modalMotivo==="Outro"&&!modalOutro.trim())} onClick={()=>{const agora=new Date();const h=`${String(agora.getHours()).padStart(2,"0")}:${String(agora.getMinutes()).padStart(2,"0")}`;const val={cor:modalCor,nivel:modalCor,motivo:modalMotivo,outro:modalOutro,hora:h,maquina:modalMaq};const novo=modalMaq==="Ambas"?{M2:val,M3:val}:{...ocorrencias,[modalMaq]:val};setOcorrencias(novo);storageSet("ocorrencias_h2",novo);setModalSinal(false);setModalCor(null);setModalMotivo("");setModalOutro("");setModalMaq("Ambas");}} style={{width:"100%",padding:13,borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14,background:modalCor==="amarelo"?C.warning:C.danger,border:"none",color:"#fff",opacity:!modalMotivo||(modalMotivo==="Outro"&&!modalOutro.trim())?0.4:1}}>Confirmar ocorrência</button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
