import { useState, useRef } from "react";
import * as React from "react";

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
};

// ─── Equipamentos da Parte Úmida — Área Comum (31-xx) ────────────────────────
const equipamentosComum = [
  { id:"co01", tag:"31-20-0-25-01", nome:"Agitador Torre HD 1",            area:"Torre HD",      sub:"Comum" },
  { id:"co02", tag:"31-20-0-25-02", nome:"Agitador Torre HD 2",            area:"Torre HD",      sub:"Comum" },
  { id:"co03", tag:"31-20-0-25-03", nome:"Agitador Torre HD 3",            area:"Torre HD",      sub:"Comum" },
  { id:"co04", tag:"31-20-0-25-04", nome:"Agitador Torre HD 4",            area:"Torre HD",      sub:"Comum" },
  { id:"co05", tag:"31-20-0-30-01", nome:"Bomba Torre HD → Linha Fibras",  area:"Torre HD",      sub:"Comum" },
  { id:"co06", tag:"31-20-0-25-05", nome:"Agitador Torre de Quebras",      area:"Torre Quebras", sub:"Comum" },
  { id:"co07", tag:"31-20-0-30-04", nome:"Bomba Torre Quebras → Torre",    area:"Torre Quebras", sub:"Comum" },
  { id:"co08", tag:"31-20-0-30-07", nome:"Bomba Torre Água Branca → Diluição","area":"Torre Água Branca","sub":"Comum"},
  { id:"co09", tag:"31-20-HV-093",  nome:"Válvula WFT Make Up (Auto)",     area:"Torre Água Branca","sub":"Comum"},
  { id:"co10", tag:"31-20-0-30-13", nome:"Bomba Água Resfriamento",        area:"Utilidades",    sub:"Comum" },
  { id:"co11", tag:"31-00-0-30-01", nome:"Bomba Efluentes 01",             area:"Efluentes",     sub:"Comum" },
  { id:"co12", tag:"31-00-0-30-02", nome:"Bomba Efluentes 02",             area:"Efluentes",     sub:"Comum" },
  { id:"co13", tag:"31-00-0-30-03", nome:"Bomba Efluentes 03",             area:"Efluentes",     sub:"Comum" },
  { id:"co14", tag:"31-00-0-30-04", nome:"Bomba TQ Efluentes Sanitário 1", area:"Efluentes",     sub:"Comum" },
  { id:"co15", tag:"31-00-0-30-05", nome:"Bomba TQ Efluentes 2",           area:"Efluentes",     sub:"Comum" },
  { id:"co16", tag:"31-20-0-30-08", nome:"Bomba Saída Stand Pipe",         area:"Depuração",     sub:"Comum" },
  { id:"co17", tag:"31-20-LV-112A", nome:"Válvula Stand Pipe → 3º Est. L2",area:"Depuração",     sub:"Comum" },
  { id:"co18", tag:"31-20-LV-112B", nome:"Válvula Stand Pipe → 3º Est. L3",area:"Depuração",     sub:"Comum" },
].map(e => ({ ...e, status:"OP", notas:[] }));

// ─── Equipamentos M2 (32-21-xx) ───────────────────────────────────────────────
const equipamentosM2 = [
  // Acionamentos / Formação
  { id:"m2e01", tag:"32-21-0-10-13",  nome:"Acionamento Tela Superior",        area:"Formação",  sub:"M2" },
  { id:"m2e02", tag:"32-21-0-10-24",  nome:"Acionamento Tela Inferior",         area:"Formação",  sub:"M2" },
  { id:"m2e03", tag:"32-21-0-10-23",  nome:"Acionamento Rolo Couch",            area:"Formação",  sub:"M2" },
  { id:"m2e04", tag:"32-21-0-10-06",  nome:"Caixa de Vapor",                    area:"Formação",  sub:"M2" },
  { id:"m2e05", tag:"32-21-0-30-15",  nome:"Bomba 1 Pichasso",                  area:"Formação",  sub:"M2" },
  { id:"m2e06", tag:"32-21-0-30-16",  nome:"Bomba 2 Pichasso",                  area:"Formação",  sub:"M2" },
  // Prensas
  { id:"m2e07", tag:"32-21-0-10-28",  nome:"Acionamento Pick-up",               area:"Prensa",    sub:"M2" },
  { id:"m2e08", tag:"32-21-0-10-42",  nome:"Acionamento 2ª Prensa",             area:"Prensa",    sub:"M2" },
  { id:"m2e09", tag:"32-21-0-10-62A", nome:"Acionamento Prime Roll A",           area:"Prensa",    sub:"M2" },
  { id:"m2e10", tag:"32-21-0-10-62B", nome:"Acionamento Prime Roll B",           area:"Prensa",    sub:"M2" },
  { id:"m2e11", tag:"32-21-0-10-45",  nome:"Rolo Abridor após 2ª Prensa",        area:"Prensa",    sub:"M2" },
  { id:"m2e12", tag:"32-21-0-10-78",  nome:"Rolo Abridor após 3ª Prensa",        area:"Prensa",    sub:"M2" },
  // UH / Lubrificação
  { id:"m2e13", tag:"32-21-0-30-43",  nome:"Bomba UH Prensas Circulação",        area:"UH / Lub.", sub:"M2" },
  { id:"m2e14", tag:"32-21-0-30-44",  nome:"Bomba UH Prensas A",                 area:"UH / Lub.", sub:"M2" },
  { id:"m2e15", tag:"32-21-0-30-45",  nome:"Bomba UH Prensas B",                 area:"UH / Lub.", sub:"M2" },
  { id:"m2e16", tag:"32-21-0-30-46",  nome:"Bomba Lubrificação A",               area:"UH / Lub.", sub:"M2" },
  { id:"m2e17", tag:"32-21-0-30-47",  nome:"Bomba Lubrificação B",               area:"UH / Lub.", sub:"M2" },
  // Prime Press
  { id:"m2e18", tag:"32-21-0-30-39",  nome:"Bomba Alimentação Prime Press",      area:"Prime Press","sub":"M2" },
  { id:"m2e19", tag:"32-21-0-30-40",  nome:"Bomba Pressão Prime Press A",        area:"Prime Press","sub":"M2" },
  { id:"m2e20", tag:"32-21-0-30-41",  nome:"Bomba Pressão Prime Press B",        area:"Prime Press","sub":"M2" },
  { id:"m2e21", tag:"32-21-0-30-42",  nome:"Bomba Retorno Prime Press",          area:"Prime Press","sub":"M2" },
  { id:"m2e22", tag:"32-21-0-35-101A",nome:"Soprador 1 Prime Press",             area:"Prime Press","sub":"M2" },
  { id:"m2e23", tag:"32-21-0-35-101B",nome:"Soprador 2 Prime Press",             area:"Prime Press","sub":"M2" },
  // Vácuo / Extração
  { id:"m2e24", tag:"32-21-0-30-33",  nome:"Bomba de Vácuo 33",                  area:"Vácuo",     sub:"M2" },
  { id:"m2e25", tag:"32-21-0-30-35",  nome:"Bomba de Vácuo 35",                  area:"Vácuo",     sub:"M2" },
  { id:"m2e26", tag:"32-21-0-30-36",  nome:"Bomba de Vácuo 36",                  area:"Vácuo",     sub:"M2" },
  { id:"m2e27", tag:"32-21-0-30-37",  nome:"Bomba de Vácuo 37",                  area:"Vácuo",     sub:"M2" },
  { id:"m2e28", tag:"32-21-0-30-38",  nome:"Bomba de Vácuo 38",                  area:"Vácuo",     sub:"M2" },
  { id:"m2e29", tag:"32-21-0-30-26",  nome:"Bomba de Extração 26",               area:"Vácuo",     sub:"M2" },
  { id:"m2e30", tag:"32-21-0-30-28",  nome:"Bomba de Extração 28",               area:"Vácuo",     sub:"M2" },
  // Bombas de processo
  { id:"m2e31", tag:"32-21-0-30-06",  nome:"Bomba Tanque da Máquina",            area:"Bombas",    sub:"M2" },
  { id:"m2e32", tag:"32-21-0-30-07",  nome:"Bomba de Mistura",                   area:"Bombas",    sub:"M2" },
  { id:"m2e33", tag:"32-21-0-30-09",  nome:"Bomba Diluição Cx. Entrada",         area:"Bombas",    sub:"M2" },
  { id:"m2e34", tag:"32-21-0-30-11",  nome:"Bomba TQ Água Branca L2",            area:"Bombas",    sub:"M2" },
  { id:"m2e35", tag:"32-21-0-30-18",  nome:"Bomba 4 BAR",                        area:"Bombas",    sub:"M2" },
  { id:"m2e36", tag:"32-21-0-30-19",  nome:"Bomba 20 BAR",                       area:"Bombas",    sub:"M2" },
  { id:"m2e37", tag:"32-21-0-30-21",  nome:"Bomba 8 BAR",                        area:"Bombas",    sub:"M2" },
  { id:"m2e38", tag:"32-21-0-30-01",  nome:"Bomba Trocador de Calor",            area:"Bombas",    sub:"M2" },
  { id:"m2e39", tag:"32-21-0-30-03",  nome:"Bomba Torre Água → Pulper Úmido",    area:"Bombas",    sub:"M2" },
  { id:"m2e40", tag:"32-21-0-30-12",  nome:"Bomba Chuveiro Destacador",          area:"Bombas",    sub:"M2" },
  // Quebras / Pulper
  { id:"m2e41", tag:"32-21-0-10-71",  nome:"Transportador de Quebras",           area:"Quebras",      sub:"M2" },
  { id:"m2e42", tag:"32-21-0-25-03",  nome:"Agitador Pulper Úmido 03",           area:"Quebras",      sub:"M2" },
  { id:"m2e43", tag:"32-21-0-25-04",  nome:"Agitador Pulper Úmido 04",           area:"Quebras",      sub:"M2" },
  { id:"m2e44", tag:"32-21-0-30-13",  nome:"Bomba Pulper Úmido → Torre",         area:"Quebras",      sub:"M2" },
  { id:"m2e45", tag:"32-21-0-25-02",  nome:"Agitador TQ da Máquina",             area:"Quebras",      sub:"M2" },
  // Depuração
  { id:"m2e46", tag:"32-11-0-10-01",  nome:"Depurador 1º Estágio P1",            area:"Depuração",    sub:"M2" },
  { id:"m2e47", tag:"32-11-0-10-02",  nome:"Depurador 1º Estágio P2",            area:"Depuração",    sub:"M2" },
  { id:"m2e48", tag:"32-11-0-10-03",  nome:"Depurador 1º Estágio P3",            area:"Depuração",    sub:"M2" },
  { id:"m2e49", tag:"32-11-0-10-04",  nome:"Depurador 2º Estágio",               area:"Depuração",    sub:"M2" },
  { id:"m2e50", tag:"32-11-0-10-05",  nome:"Depurador 3º Estágio",               area:"Depuração",    sub:"M2" },
  { id:"m2e51", tag:"32-11-0-30-04",  nome:"Bomba TQ Depuração → Depuradores",   area:"Depuração",    sub:"M2" },
  { id:"m2e52", tag:"32-11-0-30-06",  nome:"Bomba Alimentação 2º Estágio",       area:"Depuração",    sub:"M2" },
  { id:"m2e53", tag:"32-11-0-30-07",  nome:"Bomba Alimentação 3º Estágio",       area:"Depuração",    sub:"M2" },
  // Cleaners / DOS
  { id:"m2e54", tag:"32-11-0-30-08",  nome:"Bomba Alimentação Cleaners 1º Est.", area:"Cleaners",     sub:"M2" },
  { id:"m2e55", tag:"32-11-0-30-09",  nome:"Bomba Alimentação Cleaners 2º Est.", area:"Cleaners",     sub:"M2" },
  { id:"m2e56", tag:"32-11-0-30-10",  nome:"Bomba Alimentação Cleaners 3º Est.", area:"Cleaners",     sub:"M2" },
  { id:"m2e57", tag:"32-11-0-30-11",  nome:"Bomba Alimentação Cleaners 4º Est.", area:"Cleaners",     sub:"M2" },
  { id:"m2e58", tag:"32-11-OV-037",   nome:"Válvula Geral Água Elutriação",       area:"Cleaners",     sub:"M2" },
  // Tanques
  { id:"m2e59", tag:"32-11-0-25-07",  nome:"Agitador TQ Depuração",              area:"Tanques",      sub:"M2" },
  { id:"m2e60", tag:"32-21-0-30-31",  nome:"Bomba Alimentação Micrascreen",      area:"Tanques",      sub:"M2" },
].map(e => ({ ...e, status:"OP", notas:[] }));

// ─── Equipamentos M3 (33-21-xx) ───────────────────────────────────────────────
const equipamentosM3 = [
  // Acionamentos / Formação
  { id:"m3e01", tag:"33-21-0-10-13",  nome:"Acionamento Tela Superior",         area:"Formação",  sub:"M3" },
  { id:"m3e02", tag:"33-21-0-10-24",  nome:"Acionamento Tela Inferior",          area:"Formação",  sub:"M3" },
  { id:"m3e03", tag:"33-21-10-23",    nome:"Rolo Tela Sucção (Couch)",           area:"Formação",  sub:"M3" },
  { id:"m3e04", tag:"33-21-0-10-06",  nome:"Caixa de Vapor",                     area:"Formação",  sub:"M3" },
  { id:"m3e05", tag:"33-21-0-30-15",  nome:"Bomba 1 Pichasso",                   area:"Formação",  sub:"M3" },
  { id:"m3e06", tag:"33-21-0-30-16",  nome:"Bomba 2 Pichasso",                   area:"Formação",  sub:"M3" },
  { id:"m3e07", tag:"33-21-0-10-183", nome:"Motor Movimento Pichasso",           area:"Formação",  sub:"M3" },
  // Prensas
  { id:"m3e08", tag:"33-21-0-10-28",  nome:"Acionamento Pick-up",                area:"Prensa",    sub:"M3" },
  { id:"m3e09", tag:"33-21-0-10-42",  nome:"Acionamento 2ª Prensa",              area:"Prensa",    sub:"M3" },
  { id:"m3e10", tag:"33-21-0-10-62A", nome:"Acionamento Prime Roll A",            area:"Prensa",    sub:"M3" },
  { id:"m3e11", tag:"33-21-0-10-62B", nome:"Acionamento Prime Roll B",            area:"Prensa",    sub:"M3" },
  { id:"m3e12", tag:"33-21-10-45",    nome:"Rolo Abridor 1",                      area:"Prensa",    sub:"M3" },
  { id:"m3e13", tag:"33-21-10-78",    nome:"Rolo Abridor 2",                      area:"Prensa",    sub:"M3" },
  // UH / Lubrificação
  { id:"m3e14", tag:"33-21-0-30-43",  nome:"Bomba UH Prensas Circulação",         area:"UH / Lub.", sub:"M3" },
  { id:"m3e15", tag:"33-21-0-30-44",  nome:"Bomba UH Prensas A",                  area:"UH / Lub.", sub:"M3" },
  { id:"m3e16", tag:"33-21-0-30-45",  nome:"Bomba UH Prensas B",                  area:"UH / Lub.", sub:"M3" },
  { id:"m3e17", tag:"33-21-0-30-46",  nome:"Bomba Lubrificação A",                area:"UH / Lub.", sub:"M3" },
  { id:"m3e18", tag:"33-21-0-30-47",  nome:"Bomba Lubrificação B",                area:"UH / Lub.", sub:"M3" },
  // Prime Press
  { id:"m3e19", tag:"33-21-0-30-39",  nome:"Bomba Alimentação Prime Press",       area:"Prime Press","sub":"M3" },
  { id:"m3e20", tag:"33-21-0-30-40",  nome:"Bomba Pressão Prime Press A",         area:"Prime Press","sub":"M3" },
  { id:"m3e21", tag:"33-21-0-30-41",  nome:"Bomba Pressão Prime Press B",         area:"Prime Press","sub":"M3" },
  { id:"m3e22", tag:"33-21-0-30-42",  nome:"Bomba Retorno Prime Press",           area:"Prime Press","sub":"M3" },
  { id:"m3e23", tag:"33-21-0-35-101A",nome:"Soprador 1 Prime Press",              area:"Prime Press","sub":"M3" },
  { id:"m3e24", tag:"33-21-0-35-101B",nome:"Soprador 2 Prime Press",              area:"Prime Press","sub":"M3" },
  // Vácuo / Extração
  { id:"m3e25", tag:"33-21-0-30-33",  nome:"Bomba de Vácuo 33",                   area:"Vácuo",     sub:"M3" },
  { id:"m3e26", tag:"33-21-0-30-35",  nome:"Bomba de Vácuo 35",                   area:"Vácuo",     sub:"M3" },
  { id:"m3e27", tag:"33-21-0-30-36",  nome:"Bomba de Vácuo 36",                   area:"Vácuo",     sub:"M3" },
  { id:"m3e28", tag:"33-21-0-30-37",  nome:"Bomba de Vácuo 37",                   area:"Vácuo",     sub:"M3" },
  { id:"m3e29", tag:"33-21-0-30-38",  nome:"Bomba de Vácuo 38",                   area:"Vácuo",     sub:"M3" },
  { id:"m3e30", tag:"33-21-0-30-26",  nome:"Bomba de Extração 26",                area:"Vácuo",     sub:"M3" },
  { id:"m3e31", tag:"33-21-0-30-27",  nome:"Bomba de Extração 27",                area:"Vácuo",     sub:"M3" },
  { id:"m3e32", tag:"33-21-0-30-28",  nome:"Bomba de Extração 28",                area:"Vácuo",     sub:"M3" },
  { id:"m3e33", tag:"33-21-0-30-29",  nome:"Bomba de Extração 29",                area:"Vácuo",     sub:"M3" },
  { id:"m3e34", tag:"33-21-0-30-30",  nome:"Bomba de Extração 30",                area:"Vácuo",     sub:"M3" },
  // Bombas de processo
  { id:"m3e35", tag:"33-21-0-30-06",  nome:"Bomba Tanque da Máquina",             area:"Bombas",    sub:"M3" },
  { id:"m3e36", tag:"33-21-0-30-07",  nome:"Bomba de Mistura",                    area:"Bombas",    sub:"M3" },
  { id:"m3e37", tag:"33-21-0-30-09",  nome:"Bomba Diluição Cx. Entrada",          area:"Bombas",    sub:"M3" },
  { id:"m3e38", tag:"33-21-0-30-11",  nome:"Bomba TQ Água Branca L3",             area:"Bombas",    sub:"M3" },
  { id:"m3e39", tag:"33-21-0-30-18",  nome:"Bomba 4 BAR Chuveiros",               area:"Bombas",    sub:"M3" },
  { id:"m3e40", tag:"33-21-0-30-21",  nome:"Bomba 8 BAR",                         area:"Bombas",    sub:"M3" },
  { id:"m3e41", tag:"33-21-0-30-01",  nome:"Bomba Trocador de Calor",             area:"Bombas",    sub:"M3" },
  { id:"m3e42", tag:"33-21-0-30-03",  nome:"Bomba Torre Água → Pulper Úmido",     area:"Bombas",    sub:"M3" },
  { id:"m3e43", tag:"33-21-0-30-12",  nome:"Bomba Chuveiro Destacador",           area:"Bombas",    sub:"M3" },
  { id:"m3e44", tag:"33-21-0-30-31",  nome:"Bomba Alimentação Micrascreen",       area:"Bombas",    sub:"M3" },
  // Quebras / Pulper
  { id:"m3e45", tag:"33-21-0-10-71",  nome:"Transportador de Quebras",            area:"Quebras",      sub:"M3" },
  { id:"m3e46", tag:"33-21-0-25-03",  nome:"Agitador Pulper Úmido 03",            area:"Quebras",      sub:"M3" },
  { id:"m3e47", tag:"33-21-0-25-04",  nome:"Agitador Pulper Úmido 04",            area:"Quebras",      sub:"M3" },
  { id:"m3e48", tag:"33-21-0-30-13",  nome:"Bomba Pulper Úmido → Torre",          area:"Quebras",      sub:"M3" },
  { id:"m3e49", tag:"33-21-0-25-02",  nome:"Agitador TQ da Máquina",              area:"Quebras",      sub:"M3" },
  // Depuração
  { id:"m3e50", tag:"33-11-0-10-01",  nome:"Depurador 1º Estágio P1",             area:"Depuração",    sub:"M3" },
  { id:"m3e51", tag:"33-11-0-10-02",  nome:"Depurador 1º Estágio P2",             area:"Depuração",    sub:"M3" },
  { id:"m3e52", tag:"33-11-0-10-03",  nome:"Depurador 1º Estágio P3",             area:"Depuração",    sub:"M3" },
  { id:"m3e53", tag:"33-11-0-10-04",  nome:"Depurador 2º Estágio",                area:"Depuração",    sub:"M3" },
  { id:"m3e54", tag:"33-11-0-10-05",  nome:"Depurador 3º Estágio",                area:"Depuração",    sub:"M3" },
  { id:"m3e55", tag:"33-11-0-30-04",  nome:"Bomba TQ Depuração → Depuradores",    area:"Depuração",    sub:"M3" },
  { id:"m3e56", tag:"33-11-0-30-06",  nome:"Bomba Alimentação 2º Estágio",        area:"Depuração",    sub:"M3" },
  { id:"m3e57", tag:"33-11-0-30-07",  nome:"Bomba Alimentação 3º Estágio",        area:"Depuração",    sub:"M3" },
  // Cleaners / DOS
  { id:"m3e58", tag:"33-11-0-30-08",  nome:"Bomba Alimentação Cleaners 1º Est.",  area:"Cleaners",     sub:"M3" },
  { id:"m3e59", tag:"33-11-0-30-09",  nome:"Bomba Alimentação Cleaners 2º Est.",  area:"Cleaners",     sub:"M3" },
  { id:"m3e60", tag:"33-11-0-30-10",  nome:"Bomba Alimentação Cleaners 3º Est.",  area:"Cleaners",     sub:"M3" },
  { id:"m3e61", tag:"33-11-0-30-11",  nome:"Bomba Alimentação Cleaners 4º Est.",  area:"Cleaners",     sub:"M3" },
  { id:"m3e62", tag:"33-11-OV-037",   nome:"Válvula Geral Água Elutriação",        area:"Cleaners",     sub:"M3" },
  // Tanques
  { id:"m3e63", tag:"33-11-0-25-07",  nome:"Agitador TQ Depuração",               area:"Tanques",      sub:"M3" },
  { id:"m3e64", tag:"33-21-0-30-31",  nome:"Bomba Alimentação Micrascreen",       area:"Tanques",      sub:"M3" },
  { id:"m3e65", tag:"33-21-0-30-18",  nome:"Bomba 4 BAR Chuveiros",               area:"Tanques",      sub:"M3" },
].map(e => ({ ...e, status:"OP", notas:[] }));

// ─── Check-lists (M2 e M3 com valores separados) ─────────────────────────────
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
const equipamentosCS_M2 = [
  { id:"m2001", tag:"32-30-0-45-004", nome:"Transp. Móvel L4 M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2002", tag:"32-23-0-10-03", nome:"Rolo guia M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2003", tag:"32-23-0-10-04", nome:"Facas circulares M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2004", tag:"32-23-0-10-05", nome:"Rolo Medidor M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2005", tag:"32-23-0-10-12", nome:"Rolos Conj Tração M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2006", tag:"32-23-0-10-15", nome:"Rolo de transferência M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2007", tag:"32-23-0-10-19", nome:"Rolo Kick-out M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2008", tag:"32-23-0-10-08", nome:"Facão M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2009", tag:"32-22-0-30-06", nome:"Bomba pichasso da Cortadeira (na área) M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2010", tag:"32-23-0-10-23A", nome:"Mesa de Garfo A M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2011", tag:"32-23-0-10-23B", nome:"Mesa de Garfo B M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2012", tag:"32-23-0-10-23", nome:"Mesa de Garfo C/D/E/F/G/H M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2013", tag:"32-23-0-45-01", nome:"Transp. Superior Vacuo M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2014", tag:"32-23-0-35-01", nome:"Ventilador vacuo M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2015", tag:"32-23-0-35-03", nome:"Ventilador Rampa de Rejeição M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2016", tag:"32-23-0-35-04", nome:"Ventilador Exaustão M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2017", tag:"32-23-0-10-22", nome:"Vibrador de folhas M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2018", tag:"32-23-0-50-01", nome:"Elevação do Layboy M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2019", tag:"32-23-0-45-04A", nome:"Transp. Layboy Corrente A M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2020", tag:"32-23-0-45-04B", nome:"Transp. Layboy Corrente B M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2021", tag:"32-23-HSS-014", nome:"Seccionadora Manutenção", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2022", tag:"32-23-HSS-015", nome:"Geral Cortadeira", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2023", tag:"32-23-HSS-016", nome:"Lay Boy - Fita Longa", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2024", tag:"32-30-0-45-001", nome:"Transp. Intermediário pequeno LA M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2025", tag:"32-30-0-45-002A", nome:"Transp. Giratório A LA M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2026", tag:"32-30-0-45-002B", nome:"Transp. Giratório B LA M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2027", tag:"32-30-0-45-003", nome:"Transp. Intermediário LA M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2028", tag:"32-30-0-45-051", nome:"Transp. Intermediário pequeno LC M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2029", tag:"32-30-0-45-052A", nome:"Transp. Giratório A LC M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2030", tag:"32-30-0-45-052B", nome:"Transp. Giratório B LC M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2031", tag:"32-30-0-45-053", nome:"Transp. Intermediário LC M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2032", tag:"32-30-0-45-054", nome:"Transp. Móvel L5 M2", area:"Cortadeira", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2033", tag:"32-22-0-10-41", nome:"Rolo de Tração (Pull roll) M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2034", tag:"32-22-0-10-19", nome:"Rolo direcionar (sistema de controle) M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2035", tag:"32-22-0-10-17", nome:"Acionamento da Fita do Secador M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2036", tag:"32-22-0-10-36", nome:"Rolo Direcionador Cortadeira M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2037", tag:"32-22-0-10-37", nome:"Rolo Guia da Saída do Secador M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2038", tag:"32-22-0-10-12", nome:"Passagem de Ponta Cortadeira (Esteira) M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2039", tag:"32-22-0-10-26", nome:"Rolo de Retorno Entrada M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2040", tag:"32-22-0-10-27", nome:"Rolo de Retorno Saída M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2041", tag:"32-22-0-10-21", nome:"Rolo Guia da Entrada do Secador M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2042", tag:"32-22-0-10-22", nome:"Rolo de Tensão Secador M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2043", tag:"91-33-0-64-06", nome:"Vantiladores de circulação G1 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2044", tag:"91-33-0-64-07", nome:"Vantiladores de circulação G2 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2045", tag:"91-33-0-64-08", nome:"Vantiladores de circulação G3 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2046", tag:"91-33-0-64-09", nome:"Vantiladores de circulação G4 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2047", tag:"32-22-0-35-331", nome:"Ventilador Resfriamento 1 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2048", tag:"32-22-0-35-332", nome:"Ventilador Resfriamento 2 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2049", tag:"32-22-0-35-333", nome:"Ventilador Resfriamento 3 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2050", tag:"32-22-0-35-325", nome:"Ventilador Suprimento 1 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2051", tag:"32-22-0-35-327", nome:"Ventilador Suprimento 2 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2052", tag:"32-22-0-35-329", nome:"Ventilador Suprimento 3 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2053", tag:"32-22-0-35-326", nome:"Ventilador Exaustão 1 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2054", tag:"32-22-0-35-328", nome:"Ventilador Exaustão 2 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2055", tag:"32-22-0-35-330", nome:"Ventilador Exaustão 3 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2056", tag:"32-21-0-30-08", nome:"Bomba Tq filtrado p/ Trocador de calor M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2057", tag:"32-22-0-30-01", nome:"Bomba do Tq Condensado 1 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2058", tag:"32-00-0-35-01", nome:"Ventilador exaustão 01 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2059", tag:"32-00-0-35-02", nome:"Ventilador exaustão 02 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2060", tag:"32-00-0-35-03", nome:"Ventilador exaustão 03 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2061", tag:"32-00-0-35-04", nome:"Ventilador exaustão 04 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2062", tag:"32-00-0-35-05", nome:"Ventilador exaustão 05 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2063", tag:"32-00-0-35-06", nome:"Ventilador exaustão 06 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2064", tag:"32-00-0-35-07", nome:"Ventilador exaustão 07 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2065", tag:"32-00-0-35-08", nome:"Ventilador exaustão 08 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2066", tag:"32-00-0-35-09", nome:"Ventilador exaustão 09 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2067", tag:"32-00-0-35-10", nome:"Ventilador exaustão 10 M2", area:"Secador", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
].map(e=>({...e}));

// ─── Equipamentos Cortadeira/Secador — M3 ─────────────────────────────────
const equipamentosCS_M3 = [
  { id:"m3001", tag:"33-22-0-10-12", nome:"Passagem de Ponta Cortadeira (Esteira) M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3002", tag:"33-22-0-10-19", nome:"Rolo direcionar (sistema de controle) M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3003", tag:"33-22-0-10-41", nome:"Rolo de Tração (Pull roll) M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3004", tag:"33-22-0-10-17", nome:"Acionamento da Fita do Secador M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3005", tag:"33-22-0-10-36", nome:"Rolo Direcionador Cortadeira M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3006", tag:"33-22-0-10-37", nome:"Rolo Guia da Saída do Secador M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3007", tag:"33-22-0-10-26", nome:"Rolo de Retorno Entrada M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3008", tag:"33-22-0-10-27", nome:"Rolo de Retorno Saída M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3009", tag:"33-22-0-10-21", nome:"Rolo Guia da Entrada do Secador M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3010", tag:"33-22-0-10-22", nome:"Rolo de Tensão Secador M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3011", tag:"91-43-0-64-06", nome:"Vantiladores de circulação G1 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3012", tag:"91-43-0-64-07", nome:"Vantiladores de circulação G2 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3013", tag:"91-43-0-64-08", nome:"Vantiladores de circulação G3 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3014", tag:"91-43-0-64-09", nome:"Vantiladores de circulação G4 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3015", tag:"33-22-0-35-331", nome:"Ventilador Resfriamento 1 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3016", tag:"33-22-0-35-332", nome:"Ventilador Resfriamento 2 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3017", tag:"33-22-0-35-333", nome:"Ventilador Resfriamento 3 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3018", tag:"33-22-0-35-325", nome:"Ventilador Suprimento 1 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3019", tag:"33-22-0-35-327", nome:"Ventilador Suprimento 2 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3020", tag:"33-22-0-35-329", nome:"Ventilador Suprimento 3 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3021", tag:"33-22-0-35-326", nome:"Ventilador Exaustão 1 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3022", tag:"33-22-0-35-328", nome:"Ventilador Exaustão 2 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3023", tag:"33-22-0-35-330", nome:"Ventilador Exaustão 3 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3024", tag:"33-21-0-30-08", nome:"Bomba Tq filtrado p/ Trocador de calor M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3025", tag:"33-22-0-30-01", nome:"Bomba do Tq Condensado 1 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3026", tag:"33-00-0-35-22", nome:"Venti. do Teto falso M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3027", tag:"33-00-0-35-01", nome:"Ventilador exaustão 01 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3028", tag:"33-00-0-35-02", nome:"Ventilador exaustão 02 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3029", tag:"33-00-0-35-03", nome:"Ventilador exaustão 03 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3030", tag:"33-00-0-35-04", nome:"Ventilador exaustão 04 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3031", tag:"33-00-0-35-05", nome:"Ventilador exaustão 05 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3032", tag:"33-00-0-35-06", nome:"Ventilador exaustão 06 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3033", tag:"33-00-0-35-07", nome:"Ventilador exaustão 07 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3034", tag:"33-00-0-35-08", nome:"Ventilador exaustão 08 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3035", tag:"33-00-0-35-09", nome:"Ventilador exaustão 09 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3036", tag:"33-00-0-35-10", nome:"Ventilador exaustão 10 M3", area:"Secador", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3037", tag:"33-22-0-30-06", nome:"Bomba pichasso da Cortadeira (na área) M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3038", tag:"33-23-0-10-03", nome:"Rolo guia M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3039", tag:"33-23-0-10-04", nome:"Facas circulares M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3040", tag:"33-23-0-10-05", nome:"Rolo Medidor M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3041", tag:"33-23-0-10-12", nome:"Rolos Conj Tração M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3042", tag:"33-23-0-10-15", nome:"Rolo de transferência M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3043", tag:"33-23-0-10-19", nome:"Rolo Kick-out M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3044", tag:"33-23-0-10-08", nome:"Facão M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3045", tag:"33-23-0-10-23A", nome:"Mesa de Garfo A M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3046", tag:"33-23-0-10-23B", nome:"Mesa de Garfo B M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3047", tag:"33-23-0-10-23", nome:"Mesa de Garfo C/D/E/F/G/H M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3048", tag:"33-23-0-45-01", nome:"Transp. Superior Vacuo M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3049", tag:"33-23-0-35-01", nome:"Ventilador vacuo M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3050", tag:"33-23-0-35-03", nome:"Ventilador Rampa de Rejeição M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3051", tag:"33-23-0-35-04", nome:"Ventilador Exaustão M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3052", tag:"33-23-0-10-22", nome:"Vibrador de folhas M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3053", tag:"33-23-0-50-01", nome:"Elevação do Layboy M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3054", tag:"33-23-0-45-04A", nome:"Transp. Layboy Corrente A M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3055", tag:"33-23-0-45-04B", nome:"Transp. Layboy Corrente B M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3056", tag:"33-30-0-45-001", nome:"Transp. Intermediário pequeno LA M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3057", tag:"33-30-0-45-002A", nome:"Transp. Giratório A LA M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3058", tag:"33-30-0-45-002B", nome:"Transp. Giratório B LA M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3059", tag:"33-30-0-45-003", nome:"Transp. Intermediário LA M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3060", tag:"33-30-0-45-004", nome:"Transp. Móvel L6 M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3061", tag:"33-30-0-45-051", nome:"Transp. Intermediário pequeno LC M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3062", tag:"33-30-0-45-052A", nome:"Transp. Giratório A LC M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3063", tag:"33-30-0-45-052B", nome:"Transp. Giratório B LC M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3064", tag:"33-30-0-45-053", nome:"Transp. Intermediário LC M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3065", tag:"33-30-0-45-054", nome:"Transp. Móvel L7 M3", area:"Cortadeira", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
].map(e=>({...e}));

// ─── Equipamentos Enfardamento — M2 (L4, L5) ──────────────────────────────
const equipamentosEnf_M2 = [
  { id:"m2001", tag:"32-30-0-45-009", nome:"Transp. fardos pulmão L4 (009)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2002", tag:"32-24-0-64-01", nome:"Seccionadora geral L4", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2003", tag:"32-30-0-45-005", nome:"Transp. fardos L4 (005)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2004", tag:"32-30-0-45-006", nome:"Transp. fardos L4 (006)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2005", tag:"32-30-0-45-007", nome:"Transp. fardos L4 (007)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2006", tag:"32-30-0-45-008", nome:"Transp. fardos L4 (008)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2007", tag:"32-30-0-45-010", nome:"Transp. fardos pulmão L4 (010)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2008", tag:"32-30-0-45-011", nome:"Transp. fardos pulmão L4 (011)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2009", tag:"32-30-0-45-012", nome:"Transp. fardos pulmão L4 (012)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2010", tag:"32-30-0-45-013", nome:"Transp. fardos pulmão L4 (013)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2011", tag:"32-30-0-45-014", nome:"Transp. fardos pulmão L4 (014)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2012", tag:"32-30-0-45-015", nome:"Transp. fardos pulmão L4 (015)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2013", tag:"32-30-0-45-016", nome:"Transp. fardos pulmão L4 (016)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2014", tag:"32-30-0-64-01.01", nome:"Geral transp. capas L4", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2015", tag:"32-24-0-10-020", nome:"Transp. móvel unit L4", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2016", tag:"32-00-106-API", nome:"Válvula geral de API L4", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2017", tag:"32-25-0-64-01", nome:"Seccionadora geral L5", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2018", tag:"32-30-0-45-055", nome:"Transp. fardos L5 (055)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2019", tag:"32-30-0-45-056", nome:"Transp. fardos L5 (056)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2020", tag:"32-30-0-45-057", nome:"Transp. fardos L5 (057)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2021", tag:"32-30-0-45-058", nome:"Transp. fardos L5 (058)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2022", tag:"32-30-0-45-059", nome:"Transp. fardos pulmão L5 (059)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2023", tag:"32-30-0-45-060", nome:"Transp. fardos pulmão L5 (060)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2024", tag:"32-30-0-45-061", nome:"Transp. fardos pulmão L5 (061)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2025", tag:"32-30-0-45-062", nome:"Transp. fardos pulmão L5 (062)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2026", tag:"32-30-0-45-063", nome:"Transp. fardos pulmão L5 (063)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2027", tag:"32-30-0-45-064", nome:"Transp. fardos pulmão L5 (064)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2028", tag:"32-30-0-45-065", nome:"Transp. fardos pulmão L5 (065)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2029", tag:"32-30-0-45-066", nome:"Transp. fardos pulmão L5 (066)", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2030", tag:"32-25-0-10-020", nome:"Transp. móvel unit L5", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m2031", tag:"32-00-107-API", nome:"Válvula geral de API L5", area:"Enfardamento", sub:"M2", status:"OP", notas:[], obsRotaHistorico:[] },
].map(e=>({...e}));

// ─── Equipamentos Enfardamento — M3 (L6, L7, L8) ──────────────────────────
const equipamentosEnf_M3 = [
  { id:"m3001", tag:"33-30-0-45-008", nome:"Transp. fardos L6 (008)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3002", tag:"33-26-0-64-01", nome:"Seccionadora geral L6", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3003", tag:"33-30-0-45-005", nome:"Transp. fardos L6 (005)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3004", tag:"33-30-0-45-006", nome:"Transp. fardos L6 (006)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3005", tag:"33-30-0-45-007", nome:"Transp. fardos L6 (007)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3006", tag:"33-30-0-45-009", nome:"Transp. fardos pulmão L6(009)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3007", tag:"33-30-0-45-010", nome:"Transp. fardos pulmão L6(010)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3008", tag:"33-30-0-45-011", nome:"Transp. fardos pulmão L6(011)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3009", tag:"33-30-0-45-012", nome:"Transp. fardos pulmão L6(012)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3010", tag:"33-30-0-45-013", nome:"Transp. fardos pulmão L6(013)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3011", tag:"33-30-0-45-014", nome:"Transp. fardos pulmão L6(014)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3012", tag:"33-30-0-45-015", nome:"Transp. fardos pulmão L6(015)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3013", tag:"33-30-0-45-016", nome:"Transp. fardos pulmão L6(016)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3014", tag:"33-30-0-64-01.01.", nome:"Geral transp. capas L6", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3015", tag:"33-26-0-10-020", nome:"Transp. móvel unit L6", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3016", tag:"33-00-107-API", nome:"Válvula geral de API L6", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3017", tag:"33-27-0-64-01", nome:"Seccionadora geral L7", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3018", tag:"33-30-0-45-055", nome:"Transp. fardos L7 (055)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3019", tag:"33-30-0-45-056", nome:"Transp. fardos L7 (056)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3020", tag:"33-30-0-45-057", nome:"Transp. fardos L7 (057)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3021", tag:"33-30-0-45-058", nome:"Transp. fardos L7 (058)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3022", tag:"33-30-0-45-059", nome:"Transp. fardos pulmão L7 (059)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3023", tag:"33-30-0-45-060", nome:"Transp. fardos pulmão L7 (060)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3024", tag:"33-30-0-45-061", nome:"Transp. fardos pulmão L7 (061)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3025", tag:"33-30-0-45-062", nome:"Transp. fardos pulmão L7 (062)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3026", tag:"33-30-0-45-063", nome:"Transp. fardos pulmão L7 (063)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3027", tag:"33-30-0-45-064", nome:"Transp. fardos pulmão L7 (064)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3028", tag:"33-30-0-45-065", nome:"Transp. fardos pulmão L7 (065)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3029", tag:"33-30-0-45-066", nome:"Transp. fardos pulmão L7 (066)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3030", tag:"33-30-0-64-01.01", nome:"Geral transp. capas L7", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3031", tag:"32-27-0-10-020", nome:"Transp. móvel unit L7", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3032", tag:"33-00-106-API", nome:"Válvula geral de API L7", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3033", tag:"33-30-0-45-069", nome:"Transp. Pulmão de capas", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3034", tag:"33-30-0-45-070", nome:"Transp. Pulmão de capas.", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3035", tag:"33-27-0-45-017", nome:"Transp. Alim. De capas", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3036", tag:"33-27-0-45-018", nome:"Transp. Alim. De capas.", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3037", tag:"33-28-0-64-01", nome:"Seccionadora geral L8", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3038", tag:"33-30-0-45-105", nome:"Transp. fardos L8 (105)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3039", tag:"33-30-0-45-106", nome:"Transp. fardos L8 (106)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3040", tag:"33-30-0-45-107", nome:"Transp. fardos L8 (107)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3041", tag:"33-30-0-45-108", nome:"Transp. fardos L8 (108)", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3042", tag:"33-00-110-API", nome:"Válvula geral de API L8.", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3043", tag:"33-30-0-45-119", nome:"Transportador Pulmão de Capas 119.", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
  { id:"m3044", tag:"33-30-0-45-120", nome:"Transportador Pulmão de Capas 120", area:"Enfardamento", sub:"M3", status:"OP", notas:[], obsRotaHistorico:[] },
].map(e=>({...e}));

// ─── Check-list Cortadeira/Secador — M2 ──────────────────────────────────────
// Validações ativas:
//  alertaMin    → valor < mínimo = alerta vermelho
//  alertaExato  → valor diferente do ref = NOK laranja
//  alertaWarn   → valor igual ao aviso = amarelo (lembrete)
//  faixas       → para faquinhas: [[min,max,label,cor], ...]
const checklistCortadeiraM2 = [
  // SECADOR ──────────────────────────────────────────────────────────────────
  { id:"cs2_01", secao:"Secador",    item:"Célula de carga",
    ref:"310",       unit:"N/m",    tipo:"valor",
    alertaWarn:280,  descWarn:"Valor de Passagem de Ponta — lembrar de voltar para 310 N/m" },
  { id:"cs2_02", secao:"Secador",    item:"Trocador de Calor 1",
    ref:"< 100", unit:"mbar",  tipo:"valor",
    alertaMax:100,descMax:"Trocador Sujo — verificar imediatamente", alertaTrocador:true },
  { id:"cs2_03", secao:"Secador",    item:"Trocador de Calor 2",
    ref:"< 100", unit:"mbar",  tipo:"valor",
    alertaMax:100,descMax:"Trocador Sujo — verificar imediatamente", alertaTrocador:true },
  { id:"cs2_04", secao:"Secador",    item:"Rolo Marginador",
    ref:"5",         unit:"—",      tipo:"valor" },
  { id:"cs2_05", secao:"Secador",    item:"Acúmulo de Fibras",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_06", secao:"Secador",    item:"Extrator de Folhas (Entrada/Saída)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_07", secao:"Secador",    item:"Água Sucção BBA Pichasso",
    ref:"≥ 0,35",    unit:"bar",    tipo:"valor",
    alertaMin:0.35,  descMin:"CRÍTICO — abaixo do mínimo permitido (0,35 bar)" },
  // CORTADEIRA ───────────────────────────────────────────────────────────────
  { id:"cs2_08", secao:"Cortadeira", item:"QCS (Gramatura/Teor Seco) Controle LIGADO",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_09", secao:"Cortadeira", item:"Verificar Controle de Peso (Contagem ou Peso)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs2_10", secao:"Cortadeira", item:"Peso Layboy",
    ref:"F:2959 / C:2600", unit:"kg", tipo:"duplo_valor" },
  { id:"cs2_11", secao:"Cortadeira", item:"Velocidade",
    ref:"≥150",       unit:"m/min",  tipo:"valor_direto", velMin:150 },
  { id:"cs2_12", secao:"Cortadeira", item:"Passe Faca Circulares",
    ref:"F:5 / C:5",    unit:"%",      tipo:"duplo_valor" },
  { id:"cs2_13", secao:"Cortadeira", item:"Rolo Medidor",
    ref:"0,35",      unit:"%",      tipo:"valor",
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
    ref:"> 86",      unit:"%",      tipo:"valor",
    alertaMin:87,    descMin:"ALERTA — nível igual ou abaixo de 86% (mínimo de segurança)" },
  { id:"cs2_21", secao:"Cortadeira", item:"Temperatura Óleo UH",
    ref:"28",        unit:"°C",     tipo:"valor" },
  { id:"cs2_22", secao:"Cortadeira", item:"Pressão Sistema Hidráulico",
    ref:"82",        unit:"bar",    tipo:"valor" },
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
    ref:"395",       unit:"mm",     tipo:"valor" },
  { id:"cs2_28", secao:"Layboy",     item:"Mesa Garfo (Espera)",
    ref:"495",       unit:"mm",     tipo:"valor" },
  { id:"cs2_29", secao:"Layboy",     item:"Mesa Garfo (Tomada)",
    ref:"330",       unit:"mm",     tipo:"valor" },
  { id:"cs2_30", secao:"Layboy",     item:"Acúmulo de Folhas",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  // FAQUINHAS — 11 facas ─────────────────────────────────────────────────────
  // Faixas: 1,5–2,5 = Normal 🟢 | 2,5–3,5 = Atenção 🟡 | 3,5–4,0 = Crítico 🔴
  { id:"cs2_31", secao:"Faquinhas",  item:"Pressão das Faquinhas (1 a 11)",
    ref:"1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5", unit:"bar", tipo:"faquinhas",
    refs:["1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5"],
    faixas:[[1.5,2.5,"Normal","green"],[2.5,3.5,"Atenção","yellow"],[3.5,4.0,"Crítico","red"]] },
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
    ref:"310",       unit:"N/m",    tipo:"valor",
    alertaWarn:280,  descWarn:"Valor de Passagem de Ponta — lembrar de voltar para 310 N/m" },
  { id:"cs3_02", secao:"Secador",    item:"Trocador de Calor 1",
    ref:"< 100", unit:"mbar",  tipo:"valor",
    alertaMax:100,descMax:"Trocador Sujo — verificar imediatamente", alertaTrocador:true },
  { id:"cs3_03", secao:"Secador",    item:"Trocador de Calor 2",
    ref:"< 100", unit:"mbar",  tipo:"valor",
    alertaMax:100,descMax:"Trocador Sujo — verificar imediatamente", alertaTrocador:true },
  { id:"cs3_04", secao:"Secador",    item:"Rolo Marginador",
    ref:"-8",        unit:"—",      tipo:"valor" },
  { id:"cs3_05", secao:"Secador",    item:"Acúmulo de Fibras",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_06", secao:"Secador",    item:"Extrator de Folhas (Entrada/Saída)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_07", secao:"Secador",    item:"Água Sucção BBA Pichasso",
    ref:"≥ 0,35",    unit:"bar",    tipo:"valor",
    alertaMin:0.35,  descMin:"CRÍTICO — abaixo do mínimo permitido (0,35 bar)" },
  // CORTADEIRA ───────────────────────────────────────────────────────────────
  { id:"cs3_08", secao:"Cortadeira", item:"QCS (Gramatura/Teor Seco) Controle LIGADO",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_09", secao:"Cortadeira", item:"Verificar Controle de Peso (Contagem ou Peso)",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  { id:"cs3_10", secao:"Cortadeira", item:"Peso Layboy",
    ref:"F:2898 / C:2800", unit:"kg", tipo:"duplo_valor" },
  { id:"cs3_11", secao:"Cortadeira", item:"Velocidade",
    ref:"≥150",       unit:"m/min",  tipo:"valor_direto", velMin:150 },
  { id:"cs3_12", secao:"Cortadeira", item:"Passe Faca Circulares",
    ref:"F:5 / C:5",    unit:"%",      tipo:"duplo_valor" },
  { id:"cs3_13", secao:"Cortadeira", item:"Rolo Medidor",
    ref:"0,35",      unit:"%",      tipo:"valor",
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
    ref:"> 86",      unit:"%",      tipo:"valor",
    alertaMin:87,    descMin:"ALERTA — nível igual ou abaixo de 86% (mínimo de segurança)" },
  { id:"cs3_21", secao:"Cortadeira", item:"Temperatura Óleo UH",
    ref:"28",        unit:"°C",     tipo:"valor" },
  { id:"cs3_22", secao:"Cortadeira", item:"Pressão Sistema Hidráulica",
    ref:"82",        unit:"bar",    tipo:"valor" },
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
    ref:"395",       unit:"mm",     tipo:"valor" },
  { id:"cs3_28", secao:"Layboy",     item:"Mesa Garfo (Espera)",
    ref:"450",       unit:"mm",     tipo:"valor" },
  { id:"cs3_29", secao:"Layboy",     item:"Mesa Garfo (Tomada)",
    ref:"330",       unit:"mm",     tipo:"valor" },
  { id:"cs3_30", secao:"Layboy",     item:"Acúmulo de Folhas",
    ref:"—",         unit:"ok/nok", tipo:"ok_nok" },
  // FAQUINHAS — 11 facas ─────────────────────────────────────────────────────
  { id:"cs3_31", secao:"Faquinhas",  item:"Pressão das Faquinhas (1 a 11)",
    ref:"1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5/1,5", unit:"bar", tipo:"faquinhas",
    refs:["1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5","1,5"],
    faixas:[[1.5,2.5,"Normal","green"],[2.5,3.5,"Atenção","yellow"],[3.5,4.0,"Crítico","red"]] },
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
  { id:"cortadeira",       label:"Rotina",              icon:"", desc:"Check-list operacional — Secador + Cortadeira + Layboy",porMaquina:true,  tipo:"padrao",   area:"cs",  getItems:(m)=>m==="M2"?checklistCortadeiraM2:checklistCortadeiraM3 },
  { id:"passagem_ponta_cs",label:"Passagem de Ponta",   icon:"", desc:"Check-list Parte Seca — antes da passagem de ponta",   porMaquina:true,  tipo:"padrao",   area:"cs",  passagem:true, getItems:()=>checklistPassagemPontaCS },
  { id:"rejeicao",         label:"Diagnóstico Rejeição",icon:"⚠️",desc:"Fluxo de diagnóstico — Faca circular / Facão / Transversal",porMaquina:false,tipo:"rejeicao",area:"cs",getItems:()=>[] },
  { id:"enf_qualidade",    label:"Check List Qualidade",icon:"", desc:"Qualidade do fardo — todas as linhas",                 porMaquina:false, tipo:"enf",      area:"enf", getItems:()=>checklistEnfardamento },
  { id:"rota_enf",         label:"Rota Enfardamento",   icon:"", desc:"Inspeção por turno — todos os equipamentos",           porMaquina:true,  tipo:"rota_enf", area:"enf", getItems:()=>checklistRotaEnfardamento },
];


// ─── Storage helpers (Firestore + localStorage offline-safe) ──────────────────
import { COL, doc, setDoc, getDoc, onSnapshot, deleteDoc } from "./firebase";
import { TelaAuth, usePerfilAtivo, FUNCOES, validarPin } from "./auth";
import { PainelAdmin } from "./admin";
import { CleanersTela, RelatorioCleaners, CLEANERS_TOTAL } from "./cleaners";

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
function BotaoFoto({ fotos=[], onAdd, onRemove, compact=false }) {
  const inputRef = React.useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onAdd(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleFile}/>
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
      {fotoAmpliada&&<div onClick={()=>setFotoAmpliada(null)} style={{position:"fixed",inset:0,background:"#000000dd",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}}><img src={fotoAmpliada} alt="amp" style={{maxWidth:"95vw",maxHeight:"90vh",borderRadius:12}}/></div>}
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

function Dashboard({ eqState, setTela, historico, areaAtiva, setAreaAtiva, ocorrencias, setOcorrencias, perfil }) {
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
      <div style={{marginBottom:20}}>
        <h2 style={{color:C.white,fontSize:19,fontWeight:800,margin:0}}>Secagem — H2</h2>
        <p style={{color:C.textMuted,fontSize:11,marginTop:2}}>M2 e M3 · Turno em andamento</p>
      </div>
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
            <span style={{color:cor||C.textDim,fontSize:9,fontWeight:900,letterSpacing:"0.1em"}}>{n}</span>
            <span style={{color:cor||C.text,fontSize:11,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase"}}>{t}</span>
            <div style={{flex:1,height:1,background:`linear-gradient(90deg,${(cor||C.border)}44,transparent)`}}/>
          </div>
        );
        return(
          <div style={{marginBottom:16}}>

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
            <div style={{background:C.card,border:`1px solid ${stArea.cor}33`,borderTop:`2px solid ${stArea.cor}`,borderRadius:12,padding:"13px 14px",marginBottom:10}}>
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
                  <div key={l} style={{background:C.tagBg,borderRadius:8,padding:"7px 4px",textAlign:"center"}}>
                    <div style={{color:c,fontWeight:900,fontSize:16,lineHeight:1}}>{v}</div>
                    <div style={{color:C.textDim,fontSize:8,textTransform:"uppercase",marginTop:3,letterSpacing:"0.03em"}}>{l}</div>
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
                  <div key={m} style={{background:afetada?`${ledCor}08`:C.card,border:`1.5px solid ${afetada?ledCor:cor+"33"}`,borderTop:`2px solid ${afetada?ledCor:cor}`,borderRadius:12,padding:"11px 12px",boxShadow:afetada?`0 0 8px ${ledCor}66,0 0 18px ${ledCor}33,inset 0 0 12px ${ledCor}11`:"none",animation:afetada&&mCor==="vermelho"?"trava-pulse 1.6s ease-in-out infinite":"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <span style={{color:afetada?ledCor:cor,fontWeight:900,fontSize:13,letterSpacing:"0.05em"}}>MÁQ. {m.replace("M","")}</span>
                      <div style={{width:9,height:9,borderRadius:"50%",background:afetada?(mCor==="vermelho"?C.danger:C.warning):d.ok?C.success:d.cr>0?C.danger:C.warning,boxShadow:`0 0 6px ${afetada?(mCor==="vermelho"?C.danger:C.warning):d.ok?C.success:d.cr>0?C.danger:C.warning}`}}/>
                    </div>
                    {[
                      {l:"Status",v:afetada?(mCor==="vermelho"?"Parada":"Interferência"):d.ok?"Normal":d.cr>0?"Crítico":"Atenção",c:afetada?ledCor:d.ok?C.accentLight:d.cr>0?C.dangerLight:C.warningLight},
                      {l:"Alertas",v:d.al,c:d.al>0?C.warningLight:C.text},
                      {l:"Críticos",v:d.cr,c:d.cr>0?C.dangerLight:C.text},
                      {l:"Checklists",v:`${d.cumpridas}/${d.totalAreas}`,c:d.cumpridas>=d.totalAreas?C.accentLight:C.warningLight,clickDetalhe:d.detalhes},
                    ].map(({l,v,c,clickDetalhe})=>(
                      <div key={l} onClick={()=>clickDetalhe&&setPopupChecks({maquina:m,detalhes:clickDetalhe})} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0",borderBottom:`1px solid ${C.border}22`,cursor:clickDetalhe?"pointer":"default"}}>
                        <span style={{color:C.textDim,fontSize:9,textTransform:"uppercase"}}>{l}</span>
                        <span style={{color:c,fontWeight:700,fontSize:11,display:"flex",alignItems:"center",gap:4}}>{v}{clickDetalhe&&<span style={{fontSize:11,opacity:0.6}}>›</span>}</span>
                      </div>
                    ))}
                  </div>
                  );
                })}
              </div>
            </div>

            {/* ── 03 CHECKLIST DO TURNO ── */}
            <div style={{marginBottom:10}}>
              <SecH n="03" t="Checklist do Turno"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                {checklistBar.map(seg=>(
                  <div key={seg.key} onClick={()=>setTela("checklist")} style={{background:seg.ok?`${C.accentLight}0d`:`${C.dangerLight}0d`,border:`1px solid ${seg.ok?C.accentLight+"44":C.dangerLight+"55"}`,borderTop:`2px solid ${seg.ok?C.accentLight:C.dangerLight}`,borderRadius:10,padding:"8px 8px 7px",cursor:"pointer",animation:seg.ok?"none":"trava-pulse 1.9s ease-in-out infinite"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <span style={{color:seg.ok?C.accentLight:C.dangerLight,fontSize:10,fontWeight:900,letterSpacing:"0.03em"}}>{seg.label}</span>
                      <span style={{color:seg.ok?C.accentLight:C.dangerLight,fontSize:10,fontWeight:800,fontFamily:"monospace"}}>{seg.feitos}/{seg.total}</span>
                    </div>
                    <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                      {seg.un.map(u=>(
                        <span key={u.id} style={{fontSize:8,fontWeight:800,fontFamily:"monospace",color:u.ok?"#04111D":C.dangerLight,background:u.ok?C.accentLight:"transparent",border:`1px solid ${u.ok?C.accentLight:C.dangerLight+"55"}`,borderRadius:4,padding:"1px 0",minWidth:17,textAlign:"center"}}>{u.id}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 04 PASSAGEM DE TURNO ── */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`2px solid #B388FF`,borderRadius:12,padding:"13px 14px",marginBottom:10}}>
              <SecH n="04" t="Passagem de Turno" cor="#B388FF"/>
              {herdados.length===0&&ultObs.length===0?(
                <div style={{color:C.textMuted,fontSize:11,fontStyle:"italic"}}>Sem pendências herdadas</div>
              ):(
                <>
                  {herdados.slice(0,3).map(c=>(
                    <div key={c.id} style={{display:"flex",alignItems:"flex-start",gap:7,padding:"4px 0"}}>
                      <span style={{color:"#B388FF",fontSize:10,flexShrink:0,marginTop:1}}>◷</span>
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

            {/* ── 05 CLEANERS (card clicável → tela isolada) ── */}
            {(()=>{
              const effCl=(m)=>{const fora=Object.keys(clD[m]||{}).length;return Math.round((CLEANERS_TOTAL-fora)/CLEANERS_TOTAL*100);};
              const e2=effCl("M2"),e3=effCl("M3"),eg=Math.round((e2+e3)/2);
              const corCl=v=>v>=90?C.accentLight:v>=70?C.warningLight:C.dangerLight;
              const foraM2=Object.keys(clD.M2||{}).length, foraM3=Object.keys(clD.M3||{}).length;
              const critico=eg<70;
              return (
                <div onClick={()=>setTela("cleaners")} style={{background:critico?`${C.dangerLight}0a`:C.card,border:`1px solid ${critico?C.dangerLight+"44":C.border}`,borderTop:`2px solid ${corCl(eg)}`,borderRadius:12,padding:"13px 14px",marginBottom:10,cursor:"pointer",animation:critico?"trava-pulse 1.8s ease-in-out infinite":"none",boxShadow:critico?`0 0 10px ${C.dangerLight}22`:"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <SecH n="05" t="Cleaners" cor={corCl(eg)}/>
                    <span style={{color:corCl(eg),fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>abrir <span style={{fontSize:13,opacity:0.7}}>›</span></span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    {/* Eficiência geral grande */}
                    <div style={{textAlign:"center",flexShrink:0}}>
                      <div style={{color:corCl(eg),fontSize:34,fontWeight:900,lineHeight:1,textShadow:`0 0 14px ${corCl(eg)}55`}}>{eg}%</div>
                      <div style={{color:C.textDim,fontSize:8,textTransform:"uppercase",marginTop:2,letterSpacing:"0.05em"}}>Eficiência</div>
                    </div>
                    {/* M2 e M3 */}
                    <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      {[{m:"M2",e:e2,fora:foraM2},{m:"M3",e:e3,fora:foraM3}].map(({m,e,fora})=>(
                        <div key={m} style={{background:C.tagBg,borderRadius:8,padding:"7px 8px",textAlign:"center"}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                            <span style={{color:C.textMuted,fontSize:10,fontWeight:700}}>{m}</span>
                            <span style={{color:corCl(e),fontSize:15,fontWeight:900}}>{e}%</span>
                          </div>
                          <div style={{color:C.textDim,fontSize:8,marginTop:2}}>{fora>0?`${fora} fora`:"tudo operando"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
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
            {critList.length>0&&(
              <div style={{background:C.card,border:`1px solid ${C.dangerLight}33`,borderTop:`2px solid ${C.dangerLight}`,borderRadius:12,padding:"13px 14px",marginBottom:10}}>
                <SecH n="06" t="Equipamentos Críticos" cor={C.dangerLight}/>
                {critList.map(e=>(
                  <div key={e.id} onClick={()=>setTela("equipamentos")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 8px",borderRadius:7,marginBottom:3,background:"rgba(255,82,82,0.06)",cursor:"pointer"}}>
                    <span style={{color:C.text,fontSize:11,fontWeight:600}}>{e.nome}</span>
                    <span style={{color:C.textDim,fontSize:9}}>{e.tag} · {e.sub}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        );
      })()}
      <h3 style={{color:C.text,fontSize:12,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>Acesso Rápido</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[{label:"📋 Check-list",tela:"checklist"},{label:"🔧 Equipamentos",tela:"equipamentos"},{label:"🗂 Justificar Rotas",tela:"rotas"},{label:"📖 Manual",tela:"manual"}].map(a=>(
          <button key={a.tela} onClick={()=>setTela(a.tela)} style={{background:"rgba(10,25,45,0.7)",border:`1px solid ${C.border}`,color:C.text,borderRadius:12,padding:"13px 14px",cursor:"pointer",fontSize:13,fontWeight:500,textAlign:"left",transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.background=C.card;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface;}}>{a.label}</button>
        ))}
      </div>

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
  const [salvo,setSalvo]=useState(false);
  const items=checklistEnfardamento;
  const secoes=items.reduce((acc,i)=>{if(!acc[i.secao])acc[i.secao]=[];acc[i.secao].push(i);return acc;},{});
  const setResp=(id,val)=>{setRespostas(p=>({...p,[id]:val}));setSalvo(false);};
  const respondidos=items.filter(i=>respostas[i.id]).length;
  const alertas=items.filter(i=>i.alertOpcoes?.includes(respostas[i.id])).length;
  const linhaInfo=LINHAS.find(l=>l.id===linha);
  const handleSalvar=()=>{
    const registro={id:Date.now(),tipoId:"enf_qualidade",tipoLabel:"Check List Qualidade",maquina:linhaInfo?.maquina||"M2",linha,turno,hora,letra,data:hoje,opPU:opArea,matricula:matriculaEnf,opPainel:opPainelLocal,noks:alertas,total:items.length,items:items.map(i=>({id:i.id,secao:i.secao,item:i.item,ref:i.ref,unit:i.unit,resp:respostas[i.id]||"",fotos:fotos[i.id]||[]})),obs};
    onSalvar(registro);setSalvo(true);
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
              <span style={{color:C.white,fontSize:11,fontWeight:700}}>{respondidos}/{items.length}</span>
            </span>
          </div>
          <div style={{background:C.tagBg,borderRadius:4,height:6,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:4,transition:"width .3s",width:`${(respondidos/items.length)*100}%`,background:alertas>0?C.dangerLight:respondidos===items.length?C.accentLight:C.accent}}/>
          </div>
        </div>
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
  const trocar=m=>{setMaquina(m);setValores(getLastValores(tipoId,m));setFotos({});setSalvo(false);};
  const trocarTipo=id=>{setTipoId(id);setValores(getLastValores(id,maquina));setFotos({});setSalvo(false);setSelectorAberto(false);};
  const items=tipo?tipo.getItems(maquina):[];
  const secoes=items.reduce((acc,i)=>{if(!acc[i.secao])acc[i.secao]=[];acc[i.secao].push(i);return acc;},{});
  const setVal=(id,v)=>{setValores(p=>({...p,[id]:v}));setSalvo(false);};
  const addFotoItem=(id,src)=>setFotos(p=>({...p,[id]:[...(p[id]||[]),src]}));
  const removeFotoItem=(id,idx)=>setFotos(p=>({...p,[id]:p[id].filter((_,i)=>i!==idx)}));
  const ehCortadeira = tipoId==="cortadeira";
  // Verifica se um item está preenchido (trata duplo_valor, valor_direto, faquinhas)
  const itemPreenchido=(i)=>{
    if(i.tipo==="faquinhas")return true; // grupo de conferência: já validado por padrão
    if(i.tipo==="duplo_valor"){
      const f=valores[i.id+"_f"], c=valores[i.id+"_c"];
      return f!==undefined&&f!==""&&c!==undefined&&c!==""; // só verde com os dois
    }
    const v=valores[i.id];
    if(v===undefined||v==="")return false;
    if((i.tipo==="valor_direto"||i.velMin!==undefined)&&v!=="ok"){ const n=parseFloat(String(v).replace(",",".")); return !isNaN(n)&&(i.velMin===undefined||n>=i.velMin); }
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
      ):tipo?.tipo==="enf"?(
        <EnfardamentoTela onSalvar={onSalvar} turno={turno} letra={letra} opPU={opPU} opPainel={opPainel} data={data}/>
      ):tipo?.tipo==="rejeicao"?(
        <RejeicaoTela onSalvar={onSalvar} turno={turno} letra={letra} opPU={opPU} opPainel={opPainel} data={data}/>
      ):tipo?.tipo==="wft"?(
        <WFTTela onSalvar={onSalvar} turno={turno} letra={letra} opPU={opPU} opPainel={opPainel} data={data}/>
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
                const nokColor=isCritico?C.dangerLight:isAtencao||isDesvio?C.warningLight:C.dangerLight;
                const borderColor=isNok||isAlert||isValNok?nokColor+"66":preen?C.accentLight+"33":C.border;
                const leftColor=isNok||isAlert||isValNok?nokColor:preen?C.accentLight:"transparent";
                return (
                  <div key={item.id} style={{background:C.card,borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"flex-start",gap:10,flexWrap:"wrap",border:`1px solid ${borderColor}`,borderLeft:`3px solid ${leftColor}`}}>
                    <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,background:isNok||isAlert||isValNok?(isCritico?C.danger:isAtencao?C.warning:C.danger):preen?C.success:C.tagBg,border:`2px solid ${isNok||isAlert||isValNok?nokColor:preen?C.accentLight:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:800,marginTop:2}}>
                      {isNok||isAlert||isValNok?"⚠":preen?"✓":i+1}
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

// ─── EquipamentosTela ─────────────────────────────────────────────────────────
function EquipamentosTela({ eqState, setEqState, areaAtiva, setAreaAtiva, historico, setTela }) {
  const getListasByArea=()=>{
    if(areaAtiva==="pu")return{sub1:"M2",lista1:eqState.m2,sub2:"M3",lista2:eqState.m3,sub3:"Comum",lista3:eqState.comum};
    if(areaAtiva==="cs")return{sub1:"M2",lista1:eqState.cs_m2,sub2:"M3",lista2:eqState.cs_m3,sub3:null,lista3:[]};
    if(areaAtiva==="enf")return{sub1:"M2",lista1:eqState.enf_m2,sub2:"M3",lista2:eqState.enf_m3,sub3:null,lista3:[]};
    return{sub1:"M2",lista1:[],sub2:"M3",lista2:[],sub3:null,lista3:[]};
  };
  const{sub1,lista1,sub2,lista2,sub3,lista3}=getListasByArea();
  const [filtroSub,setFiltroSub]=useState("M2");
  const [filtroArea,setFiltroArea]=useState("TODAS");
  const [filtroStatus,setFiltroStatus]=useState("TODOS");
  const [busca,setBusca]=useState("");
  const [selId,setSelId]=useState(null);
  const [modalEq,setModalEq]=useState(null);
  const [modalObs,setModalObs]=useState(null);
  const [subModulo,setSubModulo]=useState("lista");
  const [showNotasHist,setShowNotasHist]=useState(false);

  const listaAtualRaw=filtroSub==="Comum"?lista3:filtroSub==="M2"?lista1:lista2;
  const listaAtual=listaAtualRaw||[];
  const areas=["TODAS",...new Set(listaAtual.map(e=>e.area))];
  const filtrados=listaAtual.filter(eq=>{
    const mA=filtroArea==="TODAS"||eq.area===filtroArea;
    const mS=filtroStatus==="TODOS"||eq.status===filtroStatus;
    const mB=!busca||eq.nome.toLowerCase().includes(busca.toLowerCase())||eq.tag.toLowerCase().includes(busca.toLowerCase());
    return mA&&mS&&mB;
  });

  const getListKey=()=>{
    if(areaAtiva==="pu")return filtroSub==="M2"?"m2":filtroSub==="M3"?"m3":"comum";
    if(areaAtiva==="cs")return filtroSub==="M2"?"cs_m2":"cs_m3";
    if(areaAtiva==="enf")return filtroSub==="M2"?"enf_m2":"enf_m3";
    return "m2";
  };

  const salvarNotas=(eqId,novasNotas)=>{
    const key=getListKey();
    setEqState(p=>({...p,[key]:p[key].map(e=>e.id===eqId?{...e,notas:novasNotas,status:novasNotas.length>0&&e.status==="OP"?"ALERTA":e.status}:e)}));
    setModalEq(null);
  };
  const salvarObservacao=(eqId,{obs,fotos,status,data,hora})=>{
    const key=getListKey();
    const novaObs={id:Date.now(),obs,fotos,data,hora};
    setEqState(p=>({...p,[key]:p[key].map(e=>e.id===eqId?{...e,status,obsRota:obs,obsRotaFotos:fotos,obsRotaHistorico:[...(e.obsRotaHistorico||[]),novaObs]}:e)}));
    setModalObs(null);
  };
  const setStatus=(eqId,s)=>{const key=getListKey();setEqState(p=>({...p,[key]:p[key].map(e=>e.id===eqId?{...e,status:s}:e)}));};
  const dotColor2=(s)=>s==="OP"?C.accentLight:s==="ALERTA"?C.warningLight:C.dangerLight;
  const eq=selId?listaAtual.find(e=>e.id===selId):null;

  if(eq)return (
    <div>
      {modalEq&&<ModalNotas eq={modalEq} onClose={()=>setModalEq(null)} onSave={salvarNotas}/>}
      {modalObs&&<ModalObservacao eq={modalObs} onClose={()=>setModalObs(null)} onSave={salvarObservacao}/>}
      <button onClick={()=>setSelId(null)} style={{...btnSec,marginBottom:18}}>← Voltar</button>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:5}}>
              <span style={{background:C.tagBg,border:`1px solid ${subColor(eq.sub)}55`,color:subColor(eq.sub),borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800}}>{subLabel(eq.sub)}</span>
              <span style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:6,padding:"2px 8px",fontSize:10}}>{eq.area}</span>
            </div>
            <h3 style={{color:C.white,fontSize:16,fontWeight:800,margin:"0 0 3px"}}>{eq.nome}</h3>
            <code style={{color:C.textMuted,fontSize:12,letterSpacing:"0.05em"}}>{eq.tag}</code>
          </div>
          <Badge color={statusColor(eq.status)}>{eq.status}</Badge>
        </div>
        {eq.sub==="Comum"&&<div style={{background:"#1a0f0055",border:`1px solid ${C.warningLight}44`,borderRadius:8,padding:"10px 12px",marginBottom:16}}><p style={{color:C.warningLight,fontSize:12,margin:0,fontWeight:600}}>⚡ Equipamento de Área Comum — uma falha aqui impacta Máquina 2 e Máquina 3</p></div>}
        {/* Notas */}
        <div style={{background:C.surface,border:`1px solid ${eq.notas.length>0?C.warningLight+"44":C.border}`,borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span>🗒</span><span style={{color:C.text,fontWeight:700,fontSize:13}}>Notas de Manutenção</span>
              {eq.notas.length>0&&<span style={{background:"#2a180055",border:`1px solid ${C.warningLight}55`,color:C.warningLight,borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:800}}>{eq.notas.length}</span>}
            </div>
            <button onClick={()=>setModalEq(eq)} style={{...btnPrim,padding:"5px 12px",fontSize:11}}>🗒 Registrar Nota</button>
          </div>
          {eq.notas.length===0?<p style={{color:C.textDim,fontSize:12,margin:0}}>Nenhuma nota aberta.</p>:eq.notas.map((n,i)=>(<div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.warningLight}`,borderRadius:7,padding:"9px 12px",marginBottom:6}}><span style={{background:"#2a180055",border:`1px solid ${C.warningLight}55`,color:C.warningLight,borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:800,fontFamily:"monospace",display:"inline-block",marginBottom:4}}>{n.num||"S/Nº"}</span><p style={{color:C.text,fontSize:12,margin:0,lineHeight:1.5}}>{n.desc}</p></div>))}
        </div>
        {/* Status */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:12}}>
          <p style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",margin:"0 0 8px"}}>Status</p>
          <div style={{display:"flex",gap:7}}>
            {["OP","ALERTA","MANUTENÇÃO"].map(s=>(<button key={s} onClick={()=>setStatus(eq.id,s)} style={{flex:1,padding:"7px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:10,textTransform:"uppercase",background:eq.status===s?(s==="OP"?C.success:s==="ALERTA"?C.warning:C.danger):C.tagBg,border:`1px solid ${eq.status===s?(s==="OP"?C.accentLight:s==="ALERTA"?C.warningLight:C.dangerLight):C.border}`,color:eq.status===s?"#fff":C.textMuted}}>{s}</button>))}
          </div>
        </div>
        {/* Observações de Rota */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:14,marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span>📝</span><span style={{color:C.text,fontWeight:700,fontSize:13}}>Observações de Rota</span>
              {(eq.obsRotaHistorico||[]).length>0&&<span style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:700}}>{(eq.obsRotaHistorico||[]).length}</span>}
            </div>
            <button onClick={()=>setModalObs(eq)} style={{...btnPrim,padding:"5px 12px",fontSize:11}}>+ Registrar</button>
          </div>
          {!(eq.obsRotaHistorico||[]).length?<p style={{color:C.textDim,fontSize:12,margin:0}}>Nenhuma observação registrada.</p>:(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[...(eq.obsRotaHistorico||[])].reverse().map((o,i)=>(
                <div key={o.id||i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px"}}>
                  <span style={{color:C.textDim,fontSize:10}}>📅 {o.data?.split("-").reverse().join("/")} · {o.hora}</span>
                  {o.obs&&<p style={{color:C.text,fontSize:12,margin:"4px 0 6px",lineHeight:1.5}}>{o.obs}</p>}
                  {o.fotos?.length>0&&<ObsFotos fotos={o.fotos}/>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const todosAreaEq=areaAtiva==="pu"?[...eqState.comum,...eqState.m2,...eqState.m3]:areaAtiva==="cs"?[...eqState.cs_m2,...eqState.cs_m3]:[...eqState.enf_m2,...eqState.enf_m3];
  const totalEq=todosAreaEq.length;
  const qtdOP=todosAreaEq.filter(e=>e.status==="OP").length;
  const pctOP=totalEq>0?Math.round(qtdOP/totalEq*100):100;
  const corOp=pctOP>=90?C.accentLight:pctOP>=70?C.warningLight:C.dangerLight;
  const chamadosAbertos=(storageGet("chamados_h2")||[]).filter(c=>c.status==="aberto").length;
  if(subModulo==="chamados") return <ChamadosTela eqState={eqState} setEqState={setEqState} areaAtiva={areaAtiva} onVoltar={()=>setSubModulo("lista")}/>;
  if(subModulo==="cleaners") return <div><button onClick={()=>setSubModulo("lista")} style={{...btnSec,marginBottom:14}}>← Voltar</button><CleanersTela/></div>;
  return (
    <div>
      {modalEq&&<ModalNotas eq={modalEq} onClose={()=>setModalEq(null)} onSave={salvarNotas}/>}
      {modalObs&&<ModalObservacao eq={modalObs} onClose={()=>setModalObs(null)} onSave={salvarObservacao}/>}
      {/* ── FALHAS · Painel de Equipamentos ── */}
      {(()=>{
        const todosA=[...(lista1||[]),...(lista2||[]),...(lista3||[])];
        const falhas=todosA.filter(e=>e.status!=="OP");
        const nAl=falhas.filter(e=>e.status==="ALERTA").length;
        const nMn=falhas.filter(e=>e.status==="MANUTENÇÃO").length;
        const temCrit=nMn>0;
        return(
          <div style={{background:C.card,border:`1px solid ${falhas.length>0?C.dangerLight+"44":C.border}`,borderTop:`2px solid ${falhas.length>0?C.dangerLight:C.accentLight}`,borderRadius:12,padding:"10px 12px",marginBottom:10,boxShadow:temCrit?`0 0 10px ${C.dangerLight}22`:"none"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:falhas.length>0?8:4}}>
              <span style={{color:falhas.length>0?C.dangerLight:C.textDim,fontSize:9,fontFamily:"monospace",fontWeight:700,letterSpacing:"0.12em"}}>FALHAS</span>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                {[{v:nAl,l:"ALERTA",c:C.warningLight},{v:nMn,l:"MANUT",c:C.dangerLight}].map(({v,l,c})=>(
                  <span key={l} style={{display:"flex",alignItems:"center",gap:4}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:v>0?c:C.textDim,boxShadow:v>0?`0 0 5px ${c}`:"none",display:"inline-block"}}/>
                    <span style={{color:v>0?c:C.textDim,fontSize:11,fontWeight:900,fontFamily:"monospace"}}>{v}</span>
                    <span style={{color:C.textDim,fontSize:8,letterSpacing:"0.08em"}}>{l}</span>
                  </span>
                ))}
              </div>
            </div>
            {falhas.length===0?(
              <div style={{color:C.textDim,fontSize:10,fontFamily:"monospace",textAlign:"center",padding:"3px 0"}}>— todos os equipamentos operacionais —</div>
            ):(
              <div style={{maxHeight:156,overflowY:"auto",display:"flex",flexDirection:"column",gap:5}}>
                {[...falhas].sort((a,b)=>a.status==="MANUTENÇÃO"&&b.status!=="MANUTENÇÃO"?-1:1).map(eq=>(
                  <div key={eq.id} onClick={()=>setSelId(eq.id)} style={{display:"flex",alignItems:"center",gap:8,background:C.tagBg,border:`1px solid ${eq.status==="MANUTENÇÃO"?C.dangerLight+"33":C.warningLight+"33"}`,borderLeft:`3px solid ${eq.status==="MANUTENÇÃO"?C.dangerLight:C.warningLight}`,borderRadius:7,padding:"6px 8px",cursor:"pointer"}}>
                    <span style={{fontSize:12,flexShrink:0}}>{eq.status==="MANUTENÇÃO"?"🔧":"⚡"}</span>
                    <div style={{minWidth:0,flex:1}}>
                      <div style={{color:C.text,fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{eq.nome}</div>
                      <div style={{color:eq.status==="MANUTENÇÃO"?C.dangerLight:C.warningLight,fontSize:8.5,fontFamily:"monospace",fontWeight:700,letterSpacing:"0.05em",marginTop:1}}>{eq.status}{eq.notas.length>0?` · ${eq.notas.length} nota${eq.notas.length>1?"s":""}`:""}  </div>
                    </div>
                    <span style={{color:C.textDim,fontSize:13,flexShrink:0}}>›</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
      {/* ── Header + Chamados ── */}
      {(()=>{
        const chamA=(storageGet("chamados_h2")||[]).filter(c=>c.status==="aberto");
        const nIme=chamA.filter(c=>c.prazo==="Imediato").length;
        const nUrg=chamA.filter(c=>c.prazo==="Urgente").length;
        const nNor=chamA.length-nIme-nUrg;
        const grupos=[["M2",lista1],["M3",lista2],["Comum",lista3]].map(([sub,lst])=>({sub,n:(lst||[]).reduce((a,e)=>a+e.notas.length,0)}));
        const totalN=grupos.reduce((a,g)=>a+g.n,0);
        const corC=nIme>0?C.dangerLight:nUrg>0?"#FF8C00":chamA.length>0?"#5090FF":C.accentLight;
        return(
          <>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:6}}>
              <h2 style={{color:C.white,fontSize:17,fontWeight:900,margin:0,letterSpacing:"0.04em"}}>GESTÃO DE ATIVOS</h2>
              <span style={{color:C.textDim,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase"}}>· {AREAS.find(a=>a.id===areaAtiva)?.label||""}</span>
            </div>
            <button onClick={()=>setTela("dashboard")} style={{...btnSec,padding:"5px 12px",fontSize:11,marginBottom:8}}>← Início</button>
            <div style={{height:1,background:`linear-gradient(90deg,${C.accent}66,transparent)`,margin:"0 0 10px"}}/>
            <button onClick={()=>setSubModulo("chamados")} style={{width:"100%",background:C.card,border:`1.5px solid ${corC}44`,borderTop:`2px solid ${corC}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",textAlign:"left",marginBottom:14,animation:nIme>0?"trava-pulse 1.8s ease-in-out infinite":"none"}}
              onMouseEnter={e=>e.currentTarget.style.background=`${corC}0d`}
              onMouseLeave={e=>e.currentTarget.style.background=C.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <span style={{color:C.textDim,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"monospace"}}>Chamados & Notas</span>
                <span style={{color:C.textDim,fontSize:13}}>›</span>
              </div>
              <div style={{display:"flex",gap:16,alignItems:"flex-end"}}>
                <div>
                  <div style={{color:corC,fontWeight:900,fontSize:28,fontFamily:"monospace",lineHeight:1}}>{chamA.length}</div>
                  <div style={{color:C.textDim,fontSize:8,letterSpacing:"0.08em",marginTop:2}}>CHAMADOS</div>
                </div>
                {totalN>0&&<div>
                  <div style={{color:C.warningLight,fontWeight:900,fontSize:28,fontFamily:"monospace",lineHeight:1}}>{totalN}</div>
                  <div style={{color:C.textDim,fontSize:8,letterSpacing:"0.08em",marginTop:2}}>NOTAS</div>
                </div>}
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end"}}>
                  {nIme>0&&<span style={{background:`${C.dangerLight}22`,border:`1px solid ${C.dangerLight}55`,color:C.dangerLight,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:800,fontFamily:"monospace"}}>{nIme} IMEDIATO</span>}
                  {nUrg>0&&<span style={{background:"rgba(255,140,0,0.12)",border:"1px solid rgba(255,140,0,0.4)",color:"#FF8C00",borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:800,fontFamily:"monospace"}}>{nUrg} URGENTE</span>}
                  {nNor>0&&<span style={{background:"rgba(80,144,255,0.12)",border:"1px solid rgba(80,144,255,0.4)",color:"#5090FF",borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:800,fontFamily:"monospace"}}>{nNor} NORMAL</span>}
                  {chamA.length===0&&totalN===0&&<span style={{color:C.accentLight,fontSize:10,fontWeight:700}}>✓ sem pendências</span>}
                </div>
              </div>
            </button>
          </>
        );
      })()}
      {/* Cards operacionais por máquina */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <span style={{color:C.accentLight,fontSize:9,fontWeight:900,letterSpacing:"0.1em"}}>02</span>
        <span style={{color:C.accentLight,fontSize:11,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase"}}>Seleção de Área e Máquina</span>
        <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(0,230,118,0.27),transparent)"}}/>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        {[{id:"pu",l:"P. ÚMIDA"},{id:"cs",l:"CORTADEIRA"},{id:"enf",l:"ENFARD."}].map(a=>(
          <button key={a.id} onClick={()=>{setAreaAtiva(a.id);setFiltroSub("M2");setFiltroArea("TODAS");setFiltroStatus("TODOS");setBusca("");}}
            style={{flex:1,padding:"7px 4px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:10,letterSpacing:"0.05em",transition:"all .15s",
              background:areaAtiva===a.id?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,
              border:`2px solid ${areaAtiva===a.id?"rgba(255,255,255,0.55)":C.border}`,
              color:areaAtiva===a.id?"#fff":C.textMuted,
              boxShadow:areaAtiva===a.id?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4)":"none"}}>{a.l}</button>
        ))}
      </div>
      {(()=>{
        const chamA=(storageGet("chamados_h2")||[]).filter(c=>c.status==="aberto");
        const mkSel=(k,label,eqs,cor,glow)=>{
          const al=eqs.filter(e=>e.status!=="OP").length;
          const nts=eqs.reduce((a,e)=>a+e.notas.length,0);
          const cham=chamA.filter(c=>c.maquina===k).length;
          const ok=al===0&&nts===0&&cham===0;
          const ativo=filtroSub===k;
          return(
            <button key={k} onClick={()=>{setFiltroSub(k);setFiltroArea("TODAS");setFiltroStatus("TODOS");setBusca("");}}
              style={{flex:1,padding:"10px 6px",borderRadius:11,cursor:"pointer",transition:"all .15s",
                background:ativo?C.card:C.tagBg,border:`2px solid ${ativo?cor:C.border}`,
                boxShadow:ativo?`0 0 8px ${glow},0 0 20px ${glow.replace("0.6","0.3")}`:"none",
                display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:ok?C.success:al>0?C.warning:C.warningLight,boxShadow:`0 0 5px ${ok?C.success:C.warning}`}}/>
                <span style={{color:ativo?cor:C.textMuted,fontWeight:900,fontSize:13,letterSpacing:"0.04em"}}>{label}</span>
              </div>
              <div style={{display:"flex",gap:4,minHeight:16}}>
                {al>0&&<span style={{background:"rgba(255,193,7,0.15)",border:`1px solid ${C.warningLight}55`,color:C.warningLight,borderRadius:10,padding:"0 6px",fontSize:9,fontWeight:800}}>⚡{al}</span>}
                {nts>0&&<span style={{background:"rgba(255,82,82,0.12)",border:`1px solid ${C.dangerLight}44`,color:C.dangerLight,borderRadius:10,padding:"0 6px",fontSize:9,fontWeight:800}}>🗒{nts}</span>}
                {cham>0&&<span style={{background:"rgba(80,144,255,0.12)",border:"1px solid rgba(80,144,255,0.4)",color:"#5090FF",borderRadius:10,padding:"0 6px",fontSize:9,fontWeight:800}}>🔧{cham}</span>}
                {al===0&&nts===0&&cham===0&&<span style={{color:C.textDim,fontSize:9}}>{eqs.length} eq.</span>}
              </div>
            </button>
          );
        };
        return(
          <div style={{display:"flex",gap:7,marginBottom:14}}>
            {mkSel("M2","MÁQ. 2",[...eqState.m2,...eqState.cs_m2,...eqState.enf_m2],"#5090FF","rgba(80,144,255,0.6)")}
            {mkSel("M3","MÁQ. 3",[...eqState.m3,...eqState.cs_m3,...eqState.enf_m3],C.accentLight,"rgba(0,230,118,0.6)")}
            {areaAtiva==="pu"&&mkSel("Comum","⚡ COMUM",eqState.comum,C.warningLight,"rgba(255,193,7,0.6)")}
          </div>
        );
      })()}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <span style={{color:C.textMuted,fontSize:9,fontWeight:900,letterSpacing:"0.1em"}}>03</span>
        <span style={{color:C.text,fontSize:11,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase"}}>Ativos</span>
        <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.border},transparent)`}}/>
      </div>
      <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="🔍  Buscar nome ou TAG..." style={{...inputStyle,marginBottom:8}}/>
      <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4,marginBottom:12}}>
        {["TODOS","OP","ALERTA","MANUTENÇÃO"].map(s=>(<button key={s} onClick={()=>setFiltroStatus(s)} style={{padding:"4px 10px",borderRadius:20,cursor:"pointer",whiteSpace:"nowrap",fontSize:10,fontWeight:700,textTransform:"uppercase",background:filtroStatus===s?C.accent:C.tagBg,border:`1px solid ${filtroStatus===s?C.accent:C.border}`,color:filtroStatus===s?"#fff":C.textMuted}}>{s}</button>))}
        <div style={{width:1,background:C.border,margin:"0 3px"}}/>
        {areas.map(a=>(<button key={a} onClick={()=>setFiltroArea(a)} style={{padding:"4px 10px",borderRadius:20,cursor:"pointer",whiteSpace:"nowrap",fontSize:10,fontWeight:600,background:filtroArea===a?"#0d2810":C.tagBg,border:`1px solid ${filtroArea===a?C.accentLight:C.border}`,color:filtroArea===a?C.accentLight:C.textMuted}}>{a}</button>))}
      </div>
      <div style={{color:C.textDim,fontSize:11,marginBottom:8}}>{filtrados.length} equipamento{filtrados.length!==1?"s":""}</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {filtrados.length===0&&<div style={{textAlign:"center",color:C.textMuted,padding:"36px 0",fontSize:13}}>Nenhum resultado.</div>}
        {filtrados.map(eq=>(
          <div key={eq.id} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${dotColor2(eq.status)}`,borderRadius:10,padding:"11px 12px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:9,height:9,borderRadius:"50%",flexShrink:0,background:dotColor2(eq.status),boxShadow:`0 0 6px ${dotColor2(eq.status)}88`}}/>
            <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setSelId(eq.id)}>
              <div style={{color:C.text,fontWeight:600,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{eq.nome}</div>
              <div style={{display:"flex",gap:6,alignItems:"center",marginTop:3}}>
                <code style={{color:"#8FB8E8",fontSize:9.5,letterSpacing:"0.05em",background:"rgba(14,40,71,0.65)",border:"1px solid rgba(80,144,255,0.25)",borderRadius:4,padding:"1px 6px",fontWeight:700}}>{eq.tag}</code>
                <span style={{color:C.textDim,fontSize:10}}>{eq.area}</span>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
              {eq.notas.length>0&&<button onClick={()=>setModalEq(eq)} style={{background:"#2a080833",border:`1px solid ${C.dangerLight}55`,color:C.dangerLight,borderRadius:20,padding:"2px 7px",fontSize:10,fontWeight:800,cursor:"pointer"}}>🗒{eq.notas.length}</button>}
              {(eq.obsRotaHistorico||[]).length>0&&<button onClick={()=>setSelId(eq.id)} style={{background:"#0a2015",border:`1px solid ${C.accentLight}44`,color:C.accentLight,borderRadius:20,padding:"2px 7px",fontSize:10,fontWeight:800,cursor:"pointer"}}>📝{(eq.obsRotaHistorico||[]).length}</button>}
              <button onClick={e=>{e.stopPropagation();setModalObs(eq);}} style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:20,padding:"2px 8px",fontSize:10,cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accentLight;e.currentTarget.style.color=C.accentLight;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMuted;}}>📷</button>
              <Badge color={statusColor(eq.status)}>{eq.status}</Badge>
              <span style={{color:C.textDim,fontSize:15,cursor:"pointer"}} onClick={()=>setSelId(eq.id)}>›</span>
            </div>
          </div>
        ))}
      </div>
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

// ─── GraficoEficiencia — Eficiência de Lançamento por Letra ───────────────────
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
function HistoricoTela({ historico, areaAtiva }) {
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
  const reg=sel!=null?historico.find(h=>h.id===sel):null;

  if(reg){
    const noksItems=reg.items?.filter(i=>["nok","nao","atencao","critico","desvio"].includes(i.resp))||[];
    const secoes=[...new Set(reg.items?.map(i=>i.secao)||[])];
    return (
      <div>
        {fotoAmp&&<div onClick={()=>setFotoAmp(null)} style={{position:"fixed",inset:0,background:"#000000ee",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}}><img src={fotoAmp} alt="amp" style={{maxWidth:"95vw",maxHeight:"90vh",borderRadius:12}}/></div>}
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
        {[{id:"reg",l:"📋 REGISTROS"},{id:"ana",l:"📊 EFICIÊNCIA"},{id:"clean",l:"🌀 CLEANERS"}].map(a=>(
          <button key={a.id} onClick={()=>setAbaHist(a.id)} style={{flex:1,padding:"8px 6px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:10,letterSpacing:"0.03em",background:abaHist===a.id?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${abaHist===a.id?"rgba(255,255,255,0.55)":C.border}`,color:abaHist===a.id?"#fff":C.textMuted,boxShadow:abaHist===a.id?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4)":"none"}}>{a.l}</button>
        ))}
      </div>
      {abaHist==="ana"?(
        <div>
          <GraficoEficiencia historico={historico}/>
        </div>
      ):abaHist==="clean"?(
        <RelatorioCleaners/>
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
  const CHAVES_RESET=["historico_h2","ocorrencias_h2","eqstate_h2","chamados_h2","cleaners_h2","cleaners_estoque_h2","cleaners_hist_h2","justificativas_h2","notas_hist_h2"];
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

// ─── ChamadosTela ────────────────────────────────────────────────────────────
const PRAZOS=[{id:"Imediato",cor:C.dangerLight,desc:"No turno"},{id:"Urgente",cor:"#FF8C00",desc:"Até 24h"},{id:"Normal",cor:C.warningLight,desc:"Até 7 dias"},{id:"Programável",cor:"#5090FF",desc:"Até 30 dias"}];
const DISCIPLINAS=["Mecânica","Instrumentação","Automação","Elétrica","Operacional"];
const CONDICOES=["Em operação","Parada de máquina"];

function ChamadosTela({ eqState, setEqState, areaAtiva, onVoltar }) {
  const [subView,setSubView]=useState("lista");
  const [abaAtiva,setAbaAtiva]=useState("chamados");
  const [buscaTag,setBuscaTag]=useState("");
  const [showRegNota,setShowRegNota]=useState(false);
  const [regBusca,setRegBusca]=useState("");
  const [regEq,setRegEq]=useState(null);
  const [regNum,setRegNum]=useState("");
  const [regDesc,setRegDesc]=useState("");
  const [showHistN,setShowHistN]=useState(false);
  const [chamados,setChamados]=useState(()=>storageGet("chamados_h2")||[]);
  React.useEffect(()=>{cloudGet("chamados_h2").then(data=>{if(data&&Array.isArray(data))setChamados(data);});},[]);
  const [filtro,setFiltro]=useState("aberto");
  const [showChamadosHist,setShowChamadosHist]=useState(false);
  const [buscarEq,setBuscarEq]=useState("");
  const [eqSel,setEqSel]=useState(null);
  const [notaSAP,setNotaSAP]=useState("");
  const [descricao,setDescricao]=useState("");
  const [prazo,setPrazo]=useState("Normal");
  const [disciplina,setDisciplina]=useState("");
  const [condicao,setCondicao]=useState("");
  const [selId,setSelId]=useState(null);
  const [resolucao,setResolucao]=useState("");
  const [fotosAbertura,setFotosAbertura]=useState([]);
  const [fotosEncerramento,setFotosEncerramento]=useState([]);
  const comprimirFoto=(file)=>new Promise(res=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const MAX=800,ratio=Math.min(MAX/img.width,MAX/img.height,1);
        const cv=document.createElement("canvas");
        cv.width=img.width*ratio;cv.height=img.height*ratio;
        cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
        res(cv.toDataURL("image/jpeg",0.72));
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });

  const cfg=storageGet("op_config")||{};
  const getNow=()=>{const d=new Date();return{data:d.toISOString().slice(0,10),hora:`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`};};
  const todosEq=[...eqState.comum,...eqState.m2,...eqState.m3,...eqState.cs_m2,...eqState.cs_m3,...eqState.enf_m2,...eqState.enf_m3];
  const sugestoes=buscarEq.length>=3?todosEq.filter(e=>e.tag.toLowerCase().includes(buscarEq.toLowerCase())||e.nome.toLowerCase().includes(buscarEq.toLowerCase())).slice(0,6):[];
  const salvar=(novos)=>{setChamados(novos);storageSet("chamados_h2",novos);};
  const corP=(p)=>PRAZOS.find(x=>x.id===p)?.cor||C.textMuted;
  const fmtData=d=>{if(!d)return"—";const[y,m,day]=d.split("-");return`${day}/${m}/${y}`;};
  const filtrados=chamados.filter(c=>c.status===filtro).sort((a,b)=>b.id-a.id);
  const sel=selId?chamados.find(c=>c.id===selId):null;

  const abrirChamado=()=>{
    if(!eqSel||!descricao.trim()||!disciplina||!condicao)return;
    const{data,hora}=getNow();
    salvar([...chamados,{id:Date.now(),equipamentoId:eqSel.id,equipamentoNome:eqSel.nome,equipamentoTag:eqSel.tag,maquina:eqSel.sub,area:eqSel.area,notaSAP:notaSAP.trim(),descricao:descricao.trim(),prazo,disciplina,condicao,operador:cfg.nomeOperador||"",matricula:cfg.matricula||"",dataAbertura:data,horaAbertura:hora,status:"aberto",resolucao:"",dataEncerramento:"",horaEncerramento:"",fotosAbertura:[...fotosAbertura],fotosEncerramento:[]}]);
    setBuscarEq("");setEqSel(null);setNotaSAP("");setDescricao("");setPrazo("Normal");setDisciplina("");setCondicao("");setFotosAbertura([]);setSubView("lista");
  };

  const encerrar=(id)=>{
    const{data,hora}=getNow();
    salvar(chamados.map(c=>c.id===id?{...c,status:"encerrado",resolucao,dataEncerramento:data,horaEncerramento:hora,fotosEncerramento:[...fotosEncerramento]}:c));
    setResolucao("");setFotosEncerramento([]);setSelId(null);
  };

  if(sel)return(
    <div>
      <button onClick={()=>setSelId(null)} style={{...btnSec,marginBottom:16}}>← Voltar</button>
      <div style={{background:C.card,border:`1px solid ${corP(sel.prioridade)}44`,borderLeft:`3px solid ${corP(sel.prioridade)}`,borderRadius:12,padding:16,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>
              <span style={{background:`${corP(sel.prazo)}22`,border:`1px solid ${corP(sel.prazo)}55`,color:corP(sel.prazo),borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800}}>{sel.prazo||sel.prioridade}</span>
              {sel.disciplina&&<span style={{background:"rgba(14,40,71,0.9)",border:"1px solid rgba(26,92,204,0.4)",color:"#5090FF",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{sel.disciplina}</span>}
              {sel.condicao&&<span style={{background:sel.condicao==="Parada de máquina"?"rgba(42,8,8,0.9)":"rgba(0,40,20,0.9)",border:`1px solid ${sel.condicao==="Parada de máquina"?C.dangerLight:C.accentLight}44`,color:sel.condicao==="Parada de máquina"?C.dangerLight:C.accentLight,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{sel.condicao}</span>}
              <span style={{background:sel.status==="aberto"?"#2a080833":"#002810",border:`1px solid ${sel.status==="aberto"?C.dangerLight:C.accentLight}44`,color:sel.status==="aberto"?C.dangerLight:C.accentLight,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{sel.status==="aberto"?"🔴 Aberto":"✓ Encerrado"}</span>
            </div>
            <div style={{color:C.white,fontWeight:700,fontSize:14}}>{sel.equipamentoNome}</div>
            <code style={{color:C.textMuted,fontSize:11}}>{sel.equipamentoTag}</code>
          </div>
        </div>
        {sel.notaSAP&&<div style={{background:C.tagBg,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 10px",marginBottom:10}}><span style={{color:C.textDim,fontSize:10}}>SAP: </span><span style={{color:C.warningLight,fontWeight:700,fontSize:12}}>{sel.notaSAP}</span></div>}
        <p style={{color:C.text,fontSize:13,margin:"0 0 10px",lineHeight:1.5}}>{sel.descricao}</p>
        <div style={{display:"flex",gap:12,color:C.textMuted,fontSize:11}}>
          <span>📅 {fmtData(sel.dataAbertura)} {sel.horaAbertura}</span>
          <span>👤 {sel.operador||"—"}</span>
        </div>
        {sel.status==="encerrado"&&sel.resolucao&&<div style={{marginTop:10,background:"#002810",border:`1px solid ${C.accentLight}33`,borderRadius:8,padding:"8px 12px"}}><p style={{color:C.textDim,fontSize:10,margin:"0 0 3px",textTransform:"uppercase"}}>Resolução</p><p style={{color:C.accentLight,fontSize:12,margin:0}}>{sel.resolucao}</p><p style={{color:C.textMuted,fontSize:10,margin:"4px 0 0"}}>{fmtData(sel.dataEncerramento)} {sel.horaEncerramento}</p></div>}
        {(sel.fotosAbertura?.length>0||sel.fotosEncerramento?.length>0)&&(
          <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
            {sel.fotosAbertura?.length>0&&(
              <div>
                <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",marginBottom:6}}>Fotos da abertura</div>
                <div style={{display:"flex",gap:8}}>
                  {sel.fotosAbertura.map((f,i)=><img key={i} src={f} style={{width:90,height:90,objectFit:"cover",borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>window.open(f,"_blank")}/>)}
                </div>
              </div>
            )}
            {sel.fotosEncerramento?.length>0&&(
              <div>
                <div style={{color:C.textDim,fontSize:9,textTransform:"uppercase",marginBottom:6}}>Fotos do reparo</div>
                <div style={{display:"flex",gap:8}}>
                  {sel.fotosEncerramento.map((f,i)=><img key={i} src={f} style={{width:90,height:90,objectFit:"cover",borderRadius:8,border:`1px solid ${C.accentLight}33`,cursor:"pointer"}} onClick={()=>window.open(f,"_blank")}/>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {sel.status==="aberto"&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:14}}>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:7}}>Encerrar chamado — o que foi feito?</label>
          <textarea value={resolucao} onChange={e=>setResolucao(e.target.value)} rows={3} placeholder="Descreva a resolução..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit",marginBottom:10}}/>
          <div style={{marginBottom:10}}>
            <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:8}}>Foto do reparo <span style={{color:C.textDim,fontWeight:400,textTransform:"none"}}>(até 2 fotos)</span></label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {fotosEncerramento.map((f,i)=>(
                <div key={i} style={{position:"relative",width:72,height:72}}>
                  <img src={f} style={{width:72,height:72,objectFit:"cover",borderRadius:8,border:`1px solid ${C.border}`}}/>
                  <button onClick={()=>setFotosEncerramento(p=>p.filter((_,j)=>j!==i))} style={{position:"absolute",top:-6,right:-6,background:C.danger,border:"none",borderRadius:"50%",width:20,height:20,color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>✕</button>
                </div>
              ))}
              {fotosEncerramento.length<2&&(
                <label style={{width:72,height:72,borderRadius:8,border:`1.5px dashed ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:4,background:C.tagBg}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.accentLight}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={async e=>{if(e.target.files[0]){const b64=await comprimirFoto(e.target.files[0]);setFotosEncerramento(p=>[...p,b64]);}e.target.value="";}}/>
                  <span style={{fontSize:20}}>📷</span>
                  <span style={{color:C.textDim,fontSize:9}}>Foto</span>
                </label>
              )}
            </div>
          </div>
          <button onClick={()=>encerrar(sel.id)} disabled={!resolucao.trim()} style={{...btnPrim,width:"100%",opacity:!resolucao.trim()?0.4:1}}>✓ Encerrar Chamado</button>
        </div>
      )}
    </div>
  );

  if(subView==="novo")return(
    <div>
      <button onClick={()=>setSubView("lista")} style={{...btnSec,marginBottom:16}}>← Voltar</button>
      <h3 style={{color:C.white,fontSize:16,fontWeight:800,marginBottom:14}}>Novo Chamado</h3>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:5}}>Equipamento</label>
          <input value={eqSel?`${eqSel.tag} — ${eqSel.nome}`:buscarEq} onChange={e=>{setBuscarEq(e.target.value);setEqSel(null);}} placeholder="Digite TAG ou nome (mín. 3 letras)..." style={inputStyle}/>
          {sugestoes.length>0&&!eqSel&&(
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,marginTop:4,overflow:"hidden"}}>
              {sugestoes.map(eq=>(
                <button key={eq.id} onClick={()=>{setEqSel(eq);setBuscarEq("");}} style={{width:"100%",background:"none",border:"none",borderBottom:`1px solid ${C.border}`,padding:"10px 12px",textAlign:"left",cursor:"pointer",color:C.text}}>
                  <div style={{fontWeight:600,fontSize:12}}>{eq.nome}</div>
                  <div style={{display:"flex",gap:8,marginTop:2}}><code style={{color:C.textMuted,fontSize:10}}>{eq.tag}</code><span style={{color:C.textDim,fontSize:10}}>{eq.sub} · {eq.area}</span></div>
                </button>
              ))}
            </div>
          )}
          {eqSel&&<div style={{background:"#002810",border:`1px solid ${C.accentLight}33`,borderRadius:8,padding:"8px 12px",marginTop:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{color:C.accentLight,fontWeight:700,fontSize:12}}>{eqSel.nome}</div><code style={{color:C.textMuted,fontSize:10}}>{eqSel.tag}</code></div><button onClick={()=>{setEqSel(null);setBuscarEq("");}} style={{...btnSec,padding:"3px 8px",fontSize:11}}>✕</button></div>}
        </div>
        <div>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:5}}>Nota SAP (opcional)</label>
          <input value={notaSAP} onChange={e=>setNotaSAP(e.target.value)} placeholder="Ex: 1234567" style={inputStyle}/>
        </div>
        <div>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:6}}>Prazo</label>
          <div style={{display:"flex",gap:6}}>
            {PRAZOS.map(p=>(<button key={p.id} onClick={()=>setPrazo(p.id)} style={{flex:1,padding:"9px 2px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,background:prazo===p.id?`${p.cor}22`:C.tagBg,border:`1.5px solid ${prazo===p.id?p.cor:C.border}`,color:prazo===p.id?p.cor:C.textMuted,textAlign:"center"}}>{p.id}</button>))}
          </div>
        </div>
        <div>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:6}}>Disciplina</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {DISCIPLINAS.map(d=>(<button key={d} onClick={()=>setDisciplina(d)} style={{flex:1,padding:"7px 4px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,background:disciplina===d?"rgba(14,40,71,0.9)":C.tagBg,border:`1.5px solid ${disciplina===d?"#5090FF":C.border}`,color:disciplina===d?"#5090FF":C.textMuted}}>{d}</button>))}
          </div>
        </div>
        <div>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:6}}>Condição de execução</label>
          <div style={{display:"flex",gap:6}}>
            {CONDICOES.map(co=>(<button key={co} onClick={()=>setCondicao(co)} style={{flex:1,padding:"9px 6px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,background:condicao===co?(co==="Parada de máquina"?"rgba(42,8,8,0.9)":"rgba(0,40,20,0.9)"):C.tagBg,border:`1.5px solid ${condicao===co?(co==="Parada de máquina"?C.dangerLight:C.accentLight):C.border}`,color:condicao===co?(co==="Parada de máquina"?C.dangerLight:C.accentLight):C.textMuted}}>{co}</button>))}
          </div>
        </div>
        <div>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:5}}>Descrição do Problema</label>
          <textarea value={descricao} onChange={e=>setDescricao(e.target.value)} rows={3} placeholder="Descreva o problema observado..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/>
        </div>
        <div>
          <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:8}}>Evidência fotográfica <span style={{color:C.textDim,fontWeight:400,textTransform:"none"}}>(até 2 fotos)</span></label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {fotosAbertura.map((f,i)=>(
              <div key={i} style={{position:"relative",width:80,height:80}}>
                <img src={f} style={{width:80,height:80,objectFit:"cover",borderRadius:8,border:`1px solid ${C.border}`}}/>
                <button onClick={()=>setFotosAbertura(p=>p.filter((_,j)=>j!==i))} style={{position:"absolute",top:-6,right:-6,background:C.danger,border:"none",borderRadius:"50%",width:20,height:20,color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>✕</button>
              </div>
            ))}
            {fotosAbertura.length<2&&(
              <label style={{width:80,height:80,borderRadius:8,border:`1.5px dashed ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:4,background:C.tagBg,transition:"border-color .15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.accentLight}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={async e=>{if(e.target.files[0]){const b64=await comprimirFoto(e.target.files[0]);setFotosAbertura(p=>[...p,b64]);}e.target.value="";}}/>
                <span style={{fontSize:22}}>📷</span>
                <span style={{color:C.textDim,fontSize:9}}>Foto</span>
              </label>
            )}
          </div>
        </div>
        <button onClick={abrirChamado} disabled={!eqSel||!descricao.trim()||!disciplina||!condicao} style={{background:(!eqSel||!descricao.trim()||!disciplina||!condicao)?"rgba(80,144,255,0.08)":`linear-gradient(135deg,#1a4aaa,#2563eb)`,border:`1.5px solid ${(!eqSel||!descricao.trim()||!disciplina||!condicao)?"rgba(80,144,255,0.2)":"rgba(100,160,255,0.5)"}`,borderRadius:12,padding:"14px",width:"100%",cursor:(!eqSel||!descricao.trim()||!disciplina||!condicao)?"not-allowed":"pointer",color:(!eqSel||!descricao.trim()||!disciplina||!condicao)?C.textMuted:"#fff",fontSize:14,fontWeight:800,letterSpacing:"0.04em",boxShadow:(!eqSel||!descricao.trim()||!disciplina||!condicao)?"none":"0 0 16px rgba(80,144,255,0.4),0 4px 12px rgba(0,0,0,0.3)",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <span style={{fontSize:16}}>🔧</span> Abrir Chamado
        </button>
      </div>
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div><h3 style={{color:C.white,fontSize:16,fontWeight:800,margin:0}}>Chamados & Notas</h3></div>
        <div style={{display:"flex",gap:8}}><button onClick={onVoltar} style={{...btnSec,padding:"6px 12px",fontSize:12}}>← Voltar</button>{abaAtiva==="chamados"&&<button onClick={()=>setSubView("novo")} style={{...btnPrim,padding:"6px 14px",fontSize:12}}>+ Novo</button>}</div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[{id:"chamados",l:"🔧 Chamados"},{id:"notas",l:"🗒 Notas Registradas"}].map(a=>(
          <button key={a.id} onClick={()=>setAbaAtiva(a.id)} style={{flex:1,padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:11,background:abaAtiva===a.id?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${abaAtiva===a.id?"rgba(255,255,255,0.55)":C.border}`,color:abaAtiva===a.id?"#fff":C.textMuted,boxShadow:abaAtiva===a.id?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4)":"none"}}>{a.l}</button>
        ))}
      </div>
      {abaAtiva==="notas"?(()=>{
        const todosEq=[...((eqState?.m2)||[]),...((eqState?.m3)||[]),...((eqState?.comum)||[]),...((eqState?.cs_m2)||[]),...((eqState?.cs_m3)||[]),...((eqState?.enf_m2)||[]),...((eqState?.enf_m3)||[])];
        const cfg=storageGet("op_config")||{};
        const sugs=regBusca.length>=3?todosEq.filter(e=>e.tag.toLowerCase().includes(regBusca.toLowerCase())||e.nome.toLowerCase().includes(regBusca.toLowerCase())).slice(0,6):[];
        const notasHist=storageGet("notas_hist_h2")||[];
        const salvarNotaLocal=(eqId,novasNotas)=>{
          if(!setEqState)return;
          const keys=["m2","m3","comum","cs_m2","cs_m3","enf_m2","enf_m3"];
          setEqState(p=>{const np={...p};keys.forEach(k=>{if(np[k])np[k]=np[k].map(e=>e.id===eqId?{...e,notas:novasNotas,status:novasNotas.length>0&&e.status==="OP"?"ALERTA":e.status}:e);});return np;});
        };
        const registrar=()=>{
          if(!regEq||(!regNum.trim()&&!regDesc.trim()))return;
          const agora=new Date();
          const data=agora.toISOString().slice(0,10);
          const hora=`${String(agora.getHours()).padStart(2,"0")}:${String(agora.getMinutes()).padStart(2,"0")}`;
          const novasNotas=[...(regEq.notas||[]),{num:regNum.trim(),desc:regDesc.trim(),data,hora,responsavel:cfg.nomeOperador||""}];
          salvarNotaLocal(regEq.id,novasNotas);
          setRegEq(null);setRegBusca("");setRegNum("");setRegDesc("");setShowRegNota(false);
        };
        const encerrarN=(n,eq)=>{
          const agora=new Date();
          const dataEnc=agora.toISOString().slice(0,10);
          const horaEnc=`${String(agora.getHours()).padStart(2,"0")}:${String(agora.getMinutes()).padStart(2,"0")}`;
          const hist=storageGet("notas_hist_h2")||[];
          storageSet("notas_hist_h2",[...hist,{...n,eqNome:eq.nome,eqTag:eq.tag,sub:eq.sub,eqId:eq.id,dataEncerramento:dataEnc,horaEncerramento:horaEnc,encerradoPor:cfg.nomeOperador||""}]);
          salvarNotaLocal(eq.id,eq.notas.filter(x=>!(x.num===n.num&&x.desc===n.desc)));
        };
        const busqTagFilt=buscaTag.toLowerCase();
        const eqComNotas=todosEq.filter(e=>e.notas.length>0&&(!buscaTag||e.tag.toLowerCase().includes(busqTagFilt)||e.nome.toLowerCase().includes(busqTagFilt)));
        const totalN=eqComNotas.reduce((a,e)=>a+e.notas.length,0);
        return(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input value={buscaTag} onChange={e=>setBuscaTag(e.target.value)} placeholder="🔍 Buscar por TAG ou nome..." style={{...inputStyle,flex:1}}/>
              <button onClick={()=>setShowRegNota(v=>!v)} style={{...btnPrim,padding:"8px 12px",fontSize:11,whiteSpace:"nowrap"}}>+ Registrar</button>
            </div>
            {showRegNota&&(
              <div style={{background:C.card,border:`1px solid ${C.accentLight}33`,borderRadius:12,padding:14,marginBottom:14,display:"flex",flexDirection:"column",gap:10}}>
                <div>
                  <label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:5}}>Equipamento</label>
                  <input value={regEq?`${regEq.tag} — ${regEq.nome}`:regBusca} onChange={e=>{setRegBusca(e.target.value);setRegEq(null);}} placeholder="TAG ou nome (mín. 3 letras)..." style={inputStyle}/>
                  {sugs.length>0&&!regEq&&<div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,marginTop:4,overflow:"hidden"}}>{sugs.map(eq=>(<button key={eq.id} onClick={()=>{setRegEq(eq);setRegBusca("");}} style={{width:"100%",background:"none",border:"none",borderBottom:`1px solid ${C.border}`,padding:"10px 12px",textAlign:"left",cursor:"pointer",color:C.text}}><div style={{fontWeight:600,fontSize:12}}>{eq.nome}</div><div style={{display:"flex",gap:8,marginTop:2}}><code style={{color:C.textMuted,fontSize:10}}>{eq.tag}</code><span style={{color:C.textDim,fontSize:10}}>{eq.sub} · {eq.area}</span></div></button>))}</div>}
                  {regEq&&<div style={{background:"#002810",border:`1px solid ${C.accentLight}33`,borderRadius:8,padding:"8px 12px",marginTop:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{color:C.accentLight,fontWeight:700,fontSize:12}}>{regEq.nome}</div><code style={{color:C.textMuted,fontSize:10}}>{regEq.tag} · {regEq.sub} · {regEq.area}</code></div><button onClick={()=>{setRegEq(null);setRegBusca("");}} style={{...btnSec,padding:"3px 8px",fontSize:11}}>✕</button></div>}
                </div>
                <div><label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:5}}>Número da Nota SAP</label><input value={regNum} onChange={e=>setRegNum(e.target.value)} placeholder="Ex: MNT-2025-1234" style={inputStyle}/></div>
                <div><label style={{color:C.textMuted,fontSize:10,textTransform:"uppercase",display:"block",marginBottom:5}}>Descrição</label><textarea value={regDesc} onChange={e=>setRegDesc(e.target.value)} rows={2} placeholder="Descreva o problema..." style={{...inputStyle,resize:"vertical",fontFamily:"inherit"}}/></div>
                <div style={{background:C.tagBg,borderRadius:8,padding:"7px 10px",display:"flex",gap:16}}><span style={{color:C.textDim,fontSize:10}}>Responsável: <b style={{color:C.text}}>{cfg.nomeOperador||"—"}</b></span><span style={{color:C.textDim,fontSize:10}}>Data: <b style={{color:C.text}}>{new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}</b></span></div>
                <button disabled={!regEq||(!regNum.trim()&&!regDesc.trim())} onClick={registrar} style={{...btnPrim,opacity:!regEq||(!regNum.trim()&&!regDesc.trim())?0.4:1,padding:12}}>🗒 Registrar Nota</button>
              </div>
            )}
            {totalN===0&&!showHistN&&<div style={{textAlign:"center",color:C.textMuted,padding:"28px 0",fontSize:13}}>{buscaTag?"Nenhuma nota encontrada para este filtro.":"Nenhuma nota registrada."}</div>}
            {eqComNotas.map(eq=>(
              <div key={eq.id} style={{marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                  <code style={{color:"#8FB8E8",fontSize:9.5,background:"rgba(14,40,71,0.65)",border:"1px solid rgba(80,144,255,0.25)",borderRadius:4,padding:"1px 6px",fontWeight:700}}>{eq.tag}</code>
                  <span style={{color:C.text,fontSize:12,fontWeight:700}}>{eq.nome}</span>
                  <span style={{color:C.textDim,fontSize:9}}>{eq.sub} · {eq.area}</span>
                </div>
                {eq.notas.map((n,i)=>(
                  <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.warningLight}`,borderRadius:9,padding:"9px 12px",marginBottom:5}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                          <span style={{background:"#2a180055",border:`1px solid ${C.warningLight}55`,color:C.warningLight,borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:800,fontFamily:"monospace"}}>{n.num||"S/Nº"}</span>
                          {n.data&&<span style={{color:C.textDim,fontSize:9}}>📅 {n.data.split("-").reverse().slice(0,2).join("/")} {n.hora||""}</span>}
                          {n.responsavel&&<span style={{color:C.textDim,fontSize:9}}>👤 {n.responsavel}</span>}
                        </div>
                        {n.desc&&<div style={{color:C.textMuted,fontSize:11,lineHeight:1.4}}>{n.desc}</div>}
                      </div>
                      <button onClick={()=>encerrarN(n,eq)} style={{flexShrink:0,background:"rgba(0,230,118,0.1)",border:`1px solid ${C.accentLight}44`,color:C.accentLight,borderRadius:8,padding:"6px 10px",fontSize:10,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>✓ Encerrar</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={()=>setShowHistN(v=>!v)} style={{width:"100%",marginTop:4,background:C.tagBg,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",color:C.textMuted,fontWeight:700,fontSize:11}}>
              <span>📋 Histórico de Notas Encerradas ({notasHist.length})</span>
              <span>{showHistN?"▲":"▼"}</span>
            </button>
            {showHistN&&(
              <div style={{marginTop:8}}>
                {notasHist.length===0?<div style={{textAlign:"center",color:C.textMuted,padding:"16px 0",fontSize:12}}>Nenhuma nota encerrada ainda.</div>
                :[...notasHist].reverse().map((n,i)=>(
                  <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.accentLight}44`,borderRadius:9,padding:"9px 12px",marginBottom:5,opacity:.85}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                      <span style={{background:"rgba(0,230,118,0.08)",border:`1px solid ${C.accentLight}44`,color:C.accentLight,borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:800,fontFamily:"monospace"}}>{n.num||"S/Nº"}</span>
                      <span style={{color:C.textDim,fontSize:9,fontWeight:700}}>{n.sub} · {n.eqNome}</span>
                      <code style={{color:C.textDim,fontSize:9}}>{n.eqTag}</code>
                    </div>
                    {n.desc&&<div style={{color:C.textMuted,fontSize:11,lineHeight:1.4,marginBottom:4}}>{n.desc}</div>}
                    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                      {n.data&&<span style={{color:C.textDim,fontSize:9}}>📅 Aberta: {n.data.split("-").reverse().slice(0,2).join("/")} {n.hora||""}</span>}
                      <span style={{color:C.accentLight,fontSize:9}}>✓ Encerrada: {n.dataEncerramento?.split("-").reverse().slice(0,2).join("/")} {n.horaEncerramento}</span>
                      {n.encerradoPor&&<span style={{color:C.textDim,fontSize:9}}>👤 {n.encerradoPor}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })():(
      <>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[{id:"aberto",label:"Abertos"},{id:"encerrado",label:"Encerrados"}].map(f=>(<button key={f.id} onClick={()=>setFiltro(f.id)} style={{flex:1,padding:"8px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12,background:filtro===f.id?`linear-gradient(135deg,${C.blue},${C.blueLight})`:C.tagBg,border:`2px solid ${filtro===f.id?"rgba(255,255,255,0.55)":C.border}`,color:filtro===f.id?"#fff":C.textMuted,boxShadow:filtro===f.id?"0 0 8px rgba(80,144,255,0.7),0 0 20px rgba(80,144,255,0.4),0 0 40px rgba(80,144,255,0.2)":"none"}}>{f.label}</button>))}
      </div>
      {filtrados.length===0?(
        <div style={{background:C.card,border:`1px dashed ${C.border}`,borderRadius:12,padding:"36px 20px",textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:8}}>📋</div>
          <p style={{color:C.textMuted,fontSize:13,margin:0}}>Nenhum chamado {filtro}.</p>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {filtrados.map(ch=>(
            <div key={ch.id} onClick={()=>setSelId(ch.id)} style={{background:C.card,border:`1px solid ${corP(ch.prioridade)}33`,borderLeft:`3px solid ${corP(ch.prioridade)}`,borderRadius:11,padding:"12px 14px",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div style={{flex:1,marginRight:10}}>
                  <div style={{color:C.white,fontWeight:700,fontSize:13}}>{ch.equipamentoNome}</div>
                  <code style={{color:C.textMuted,fontSize:10}}>{ch.equipamentoTag}</code>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end",flexShrink:0}}>
                  <span style={{background:`${corP(ch.prazo||ch.prioridade)}22`,border:`1px solid ${corP(ch.prazo||ch.prioridade)}55`,color:corP(ch.prazo||ch.prioridade),borderRadius:6,padding:"2px 7px",fontSize:9,fontWeight:800}}>{ch.prazo||ch.prioridade}</span>
                  {ch.disciplina&&<span style={{color:"#5090FF",fontSize:9,fontWeight:700}}>{ch.disciplina}</span>}
                </div>
              </div>
              <p style={{color:C.textMuted,fontSize:11,margin:"0 0 6px",lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{ch.descricao}</p>
              <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                {ch.notaSAP&&<span style={{color:C.warningLight,fontSize:10,fontWeight:700}}>SAP: {ch.notaSAP}</span>}
                <span style={{color:C.textDim,fontSize:10}}>📅 {fmtData(ch.dataAbertura)} {ch.horaAbertura}</span>
                {ch.status==="encerrado"&&ch.dataEncerramento&&<span style={{color:C.accentLight,fontSize:10}}>✓ {fmtData(ch.dataEncerramento)} {ch.horaEncerramento}</span>}
                <span style={{color:C.textDim,fontSize:10}}>👤 {ch.operador||"—"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {filtro==="aberto"&&(
        <>
          <button onClick={()=>setShowChamadosHist(v=>!v)} style={{width:"100%",marginTop:10,background:C.tagBg,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",color:C.textMuted,fontWeight:700,fontSize:11}}>
            <span>📋 Histórico de Chamados Encerrados ({chamados.filter(c=>c.status==="encerrado").length})</span>
            <span>{showChamadosHist?"▲":"▼"}</span>
          </button>
          {showChamadosHist&&(
            <div style={{marginTop:8}}>
              {chamados.filter(c=>c.status==="encerrado").sort((a,b)=>b.id-a.id).length===0
                ?<div style={{textAlign:"center",color:C.textMuted,padding:"20px 0",fontSize:12}}>Nenhum chamado encerrado ainda.</div>
                :chamados.filter(c=>c.status==="encerrado").sort((a,b)=>b.id-a.id).map(ch=>(
                  <div key={ch.id} onClick={()=>setSelId(ch.id)} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.accentLight}44`,borderRadius:9,padding:"9px 12px",marginBottom:5,cursor:"pointer",opacity:.85}}>
                    <div style={{color:C.text,fontWeight:600,fontSize:12,marginBottom:3}}>{ch.equipamentoNome}</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      <code style={{color:C.textDim,fontSize:9}}>{ch.equipamentoTag}</code>
                      {ch.prazo&&<span style={{color:corP(ch.prazo),fontSize:9,fontWeight:700}}>{ch.prazo}</span>}
                    </div>
                    {ch.descricao&&<p style={{color:C.textMuted,fontSize:10,margin:"4px 0",lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{ch.descricao}</p>}
                    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:3}}>
                      <span style={{color:C.textDim,fontSize:9}}>📅 Aberto: {fmtData(ch.dataAbertura)} {ch.horaAbertura}</span>
                      {ch.dataEncerramento&&<span style={{color:C.accentLight,fontSize:9}}>✓ Encerrado: {fmtData(ch.dataEncerramento)} {ch.horaEncerramento}</span>}
                      <span style={{color:C.textDim,fontSize:9}}>👤 {ch.operador||"—"}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </>
      )}
    </>
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

  const justificar=(area,rotaId,maquina,motivo,outro)=>{
    const novas=[...justificativas.filter(j=>!(j.data===hoje&&j.turno===turno&&j.letra===letra&&j.rotaId===rotaId&&j.area===area&&j.maquina===(maquina||null))),
      {id:Date.now(),data:hoje,turno,letra,area,rotaId,maquina:maquina||null,motivo,outro,operador:cfg.nomeOperador||"",matricula:cfg.matricula||"",hora}];
    salvar(novas);
  };

  const justificarTodas=(area,motivo,outro)=>{
    const rotas=ROTAS_CONFIG[area].rotas;
    let novas=[...justificativas];
    rotas.forEach(r=>{
      if(getStatus(area,r.id,r.maquina)!=="feito"){
        novas=novas.filter(j=>!(j.data===hoje&&j.turno===turno&&j.letra===letra&&j.rotaId===r.id&&j.area===area&&j.maquina===(r.maquina||null)));
        novas.push({id:Date.now()+Math.random(),data:hoje,turno,letra,area,rotaId:r.id,maquina:r.maquina||null,motivo,outro,operador:cfg.nomeOperador||"",matricula:cfg.matricula||"",hora});
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
  const salvarChecklist=(registro)=>{const novo=[...historico,registro];setHistorico(novo);storageSet("historico_h2",novo);};
  const eqCarregado=useRef(false);
  React.useEffect(()=>{
    cloudGet("historico_h2").then(data=>{if(data&&Array.isArray(data)&&data.length>0)setHistorico(data);});
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
  const veHistorico = perfil && FUNCOES[perfil.funcao]?.veHistorico;
  const nav=[
    {id:"dashboard",label:"Início",icon:"⬡"},
    {id:"checklist",label:"Check-list",icon:"✓"},
    {id:"equipamentos",label:"Equipam.",icon:"⚙"},
    {id:"historico",label:"Histórico",icon:"📋"},
    {id:"configuracoes",label:"Config.",icon:"⚙️"},
  ].filter(n=>n.id!=="historico"||veHistorico);
  const renderTela=()=>{
    if(tela==="dashboard")return <Dashboard eqState={eqState} setTela={setTela} historico={historico} areaAtiva={areaAtiva} setAreaAtiva={setAreaAtiva} ocorrencias={ocorrencias} setOcorrencias={setOcorrencias} perfil={perfil}/>;
    if(tela==="checklist")return <ChecklistTela onSalvar={salvarChecklist} historico={historico} perfil={perfil}/>;
    if(tela==="equipamentos")return <EquipamentosTela eqState={eqState} setEqState={setEqState} areaAtiva={areaAtiva} setAreaAtiva={setAreaAtiva} historico={historico} setTela={setTela}/>;
    if(tela==="historico")return veHistorico?<HistoricoTela historico={historico} areaAtiva={areaAtiva}/>:<Dashboard eqState={eqState} setTela={setTela} historico={historico} areaAtiva={areaAtiva} setAreaAtiva={setAreaAtiva} ocorrencias={ocorrencias} setOcorrencias={setOcorrencias} perfil={perfil}/>;
    if(tela==="configuracoes")return <ConfiguracoesTela perfil={perfil} onLogout={logout} onAbrirAdmin={()=>setAdminAberto(true)}/>;
    if(tela==="rotas")return <RotasTela historico={historico} onVoltar={()=>setTela("dashboard")}/>;
    if(tela==="cleaners")return <div style={{padding:"16px 16px 80px"}}><button onClick={()=>setTela("dashboard")} style={{background:C.tagBg,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:9,padding:"9px 14px",cursor:"pointer",fontSize:12,fontWeight:700,marginBottom:14}}>← Início</button><CleanersTela/></div>;
  };
  if(!perfil) return <TelaAuth onEntrar={setPerfil}/>;
  if(adminAberto && perfil.funcao==="dev") return <PainelAdmin onVoltar={()=>setAdminAberto(false)}/>;
  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Segoe UI',system-ui,sans-serif",color:C.text}}>
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
        <div style={{backgroundImage:`linear-gradient(90deg,rgba(4,17,29,0.92) 35%,rgba(4,17,29,0.45) 100%),url(data:image/jpeg;base64,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)`,backgroundSize:"cover",backgroundPosition:"center top",padding:"0 16px",minHeight:69,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 4px 32px rgba(0,0,0,0.8),0 0 60px rgba(0,230,118,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <img src="data:image/png;base64,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" alt="Suzano" style={{height:51,width:"auto",flexShrink:0}}/>
            <div style={{borderLeft:"1px solid rgba(0,230,118,0.3)",paddingLeft:12}}>
              <div style={{fontSize:9,color:"#B5C6DA",letterSpacing:"0.22em",textTransform:"uppercase"}}>SECAGEM • H2</div>
              <div style={{fontSize:8,color:"#5A7A99",letterSpacing:"0.16em",textTransform:"uppercase",marginTop:2}}>Três Lagoas</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            {notasComum>0&&<button onClick={()=>setTela("equipamentos")} style={{background:"rgba(240,165,0,0.18)",border:`1px solid ${C.warningLight}`,color:C.warningLight,borderRadius:20,padding:"3px 9px",fontSize:10,fontWeight:800,cursor:"pointer"}}>⚡{notasComum}</button>}
            {totalNotas>0&&<button onClick={()=>setTela("equipamentos")} style={{background:"rgba(232,51,58,0.18)",border:`1px solid ${C.dangerLight}`,color:C.dangerLight,borderRadius:20,padding:"3px 9px",fontSize:10,fontWeight:800,cursor:"pointer"}}>🗒{totalNotas}</button>}
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
  );
}
