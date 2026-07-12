// ─── pgEquipe.js — VÉRTICE PG · Registro de time e resolução de nomes ─
// Fonte única de pessoal (espelho editável de pg_equipe_h2 no Firestore).
// Cruza os nomes livres da PG_ESCALA com letra / área / fábrica do registro,
// e usa a rotação 6x4 (pgRotacao) para marcar operador DESLOCADO na PG.
import { estaDeslocado, letraNoTurno, situacaoLetra } from "./pgRotacao";

export const PG_EQUIPE = [{"id": "op_adriano_garcia", "nome": "ADRIANO GARCIA", "letra": "A", "area": "painel", "fab": "H1", "tipo": "turnista"}, {"id": "op_fabiano", "nome": "FABIANO", "letra": "B", "area": "painel", "fab": "H1", "tipo": "turnista"}, {"id": "op_rafael_lemes", "nome": "RAFAEL LEMES", "letra": "C", "area": "painel", "fab": "H1", "tipo": "turnista"}, {"id": "op_roberto", "nome": "ROBERTO", "letra": "D", "area": "painel", "fab": "H1", "tipo": "turnista", "tags": ["facilitador_pg"]}, {"id": "op_rafael_bononi", "nome": "RAFAEL BONONI", "letra": "E", "area": "painel", "fab": "H1", "tipo": "turnista"}, {"id": "op_valeriano", "nome": "VALERIANO", "letra": "A", "area": "painel", "fab": "H2", "tipo": "turnista"}, {"id": "op_lindomar", "nome": "LINDOMAR", "letra": "B", "area": "painel", "fab": "H2", "tipo": "turnista"}, {"id": "op_josimar", "nome": "JOSIMAR", "letra": "C", "area": "painel", "fab": "H2", "tipo": "turnista"}, {"id": "op_juliano", "nome": "JULIANO", "letra": "D", "area": "painel", "fab": "H2", "tipo": "turnista"}, {"id": "op_claudecir", "nome": "CLAUDECIR", "letra": "E", "area": "painel", "fab": "H2", "tipo": "turnista"}, {"id": "op_julio_dos_santos", "nome": "JULIO DOS SANTOS", "letra": "C", "area": "painel", "fab": "H2", "tipo": "turnista", "ausencias": [{"tipo": "ferias", "inicio": "2026-07-16", "fim": "2026-08-15"}]}, {"id": "op_zarpel_o", "nome": "ZARPELÃO", "letra": "E", "area": "painel", "fab": "H2", "tipo": "turnista", "ausencias": [{"tipo": "ferias", "inicio": "2026-07-09", "fim": "2026-08-08"}]}, {"id": "op_andr_marques", "nome": "ANDRÉ MARQUES", "letra": "A", "area": "parte_umida", "fab": "H1", "tipo": "turnista"}, {"id": "op_eug_nio", "nome": "EUGÊNIO", "letra": "B", "area": "parte_umida", "fab": "H1", "tipo": "turnista"}, {"id": "op_erick", "nome": "ERICK", "letra": "C", "area": "parte_umida", "fab": "H1", "tipo": "turnista"}, {"id": "op_ivaldo", "nome": "IVALDO", "letra": "D", "area": "parte_umida", "fab": "H1", "tipo": "turnista"}, {"id": "op_gean", "nome": "GEAN", "letra": "E", "area": "parte_umida", "fab": "H1", "tipo": "turnista"}, {"id": "op_edinho", "nome": "EDINHO", "letra": "A", "area": "parte_umida", "fab": "H2", "tipo": "turnista"}, {"id": "op_percio", "nome": "PERCIO", "letra": "B", "area": "parte_umida", "fab": "H2", "tipo": "turnista"}, {"id": "op_fabricio", "nome": "FABRICIO", "letra": "C", "area": "parte_umida", "fab": "H2", "tipo": "turnista"}, {"id": "op_robert", "nome": "ROBERT", "letra": "D", "area": "parte_umida", "fab": "H2", "tipo": "turnista"}, {"id": "op_joel", "nome": "JOEL", "letra": "E", "area": "parte_umida", "fab": "H2", "tipo": "turnista", "tags": ["facilitador_pg"]}, {"id": "op_paulo_cesar", "nome": "PAULO CESAR", "letra": "A", "area": "secador_cortadeira", "fab": "H1", "tipo": "turnista"}, {"id": "op_fernando", "nome": "FERNANDO", "letra": "B", "area": "secador_cortadeira", "fab": "H1", "tipo": "turnista"}, {"id": "op_izailton", "nome": "IZAILTON", "letra": "C", "area": "secador_cortadeira", "fab": "H1", "tipo": "turnista"}, {"id": "op_ricardo", "nome": "RICARDO", "letra": "D", "area": "secador_cortadeira", "fab": "H1", "tipo": "turnista"}, {"id": "op_amanda", "nome": "AMANDA", "letra": "E", "area": "secador_cortadeira", "fab": "H1", "tipo": "turnista"}, {"id": "op_bocato", "nome": "BOCATO", "letra": "A", "area": "secador_cortadeira", "fab": "H2", "tipo": "turnista"}, {"id": "op_nataly", "nome": "NATALY", "letra": "B", "area": "secador_cortadeira", "fab": "H2", "tipo": "turnista"}, {"id": "op_anieli", "nome": "ANIELI", "letra": "C", "area": "secador_cortadeira", "fab": "H2", "tipo": "turnista", "tags": ["brigadista"]}, {"id": "op_ana_paula", "nome": "ANA PAULA", "letra": "D", "area": "secador_cortadeira", "fab": "H2", "tipo": "turnista"}, {"id": "op_douglas", "nome": "DOUGLAS", "letra": "E", "area": "secador_cortadeira", "fab": "H2", "tipo": "turnista", "tags": ["brigadista", "empilhadeira"]}, {"id": "op_luana", "nome": "LUANA", "letra": "D", "area": "secador_cortadeira", "fab": "H2", "tipo": "turnista", "ausencias": [{"tipo": "ferias", "inicio": "2026-07-11", "fim": "2026-08-10"}]}, {"id": "op_samuel", "nome": "SAMUEL", "letra": "A", "area": "enfardamento", "fab": "H1", "tipo": "turnista", "tags": ["empilhadeira"]}, {"id": "op_angelo", "nome": "ANGELO", "letra": "B", "area": "enfardamento", "fab": "H1", "tipo": "turnista", "tags": ["brigadista", "empilhadeira"]}, {"id": "op_f_bio_takeiti", "nome": "FÁBIO TAKEITI", "letra": "C", "area": "enfardamento", "fab": "H1", "tipo": "turnista"}, {"id": "op_fabinho", "nome": "FABINHO", "letra": "D", "area": "enfardamento", "fab": "H1", "tipo": "turnista"}, {"id": "op_dionata", "nome": "DIONATA", "letra": "E", "area": "enfardamento", "fab": "H1", "tipo": "turnista"}, {"id": "op_charles", "nome": "CHARLES", "letra": "A", "area": "enfardamento", "fab": "H1", "tipo": "turnista"}, {"id": "op_hugo", "nome": "HUGO", "letra": "B", "area": "enfardamento", "fab": "H1", "tipo": "turnista", "tags": ["empilhadeira"]}, {"id": "op_lucas_benette", "nome": "LUCAS BENETTE", "letra": "C", "area": "enfardamento", "fab": "H1", "tipo": "turnista"}, {"id": "op_claudemir", "nome": "CLAUDEMIR", "letra": "D", "area": "enfardamento", "fab": "H1", "tipo": "turnista", "tags": ["empilhadeira"]}, {"id": "op_jonas", "nome": "JONAS", "letra": "E", "area": "enfardamento", "fab": "H1", "tipo": "turnista"}, {"id": "op_gabriel", "nome": "GABRIEL", "letra": "A", "area": "enfardamento", "fab": "H1", "tipo": "turnista"}, {"id": "op_anderson", "nome": "ANDERSON", "letra": "B", "area": "enfardamento", "fab": "H1", "tipo": "turnista"}, {"id": "op_paulo_eleut_rio", "nome": "PAULO ELEUTÉRIO", "letra": "E", "area": "enfardamento", "fab": "H1", "tipo": "turnista", "tags": ["empilhadeira"]}, {"id": "op_igor", "nome": "IGOR", "letra": "D", "area": "enfardamento", "fab": "H1", "tipo": "turnista", "tags": ["empilhadeira"], "ausencias": [{"tipo": "ferias", "inicio": "2026-07-11", "fim": "2026-08-10"}]}, {"id": "op_rom_rio", "nome": "ROMÁRIO", "letra": "A", "area": "enfardamento", "fab": "H2", "tipo": "turnista"}, {"id": "op_ivan", "nome": "IVAN", "letra": "B", "area": "enfardamento", "fab": "H2", "tipo": "turnista", "tags": ["empilhadeira"]}, {"id": "op_luan", "nome": "LUAN", "letra": "C", "area": "enfardamento", "fab": "H2", "tipo": "turnista", "tags": ["empilhadeira"]}, {"id": "op_gabriela", "nome": "GABRIELA", "letra": "D", "area": "enfardamento", "fab": "H2", "tipo": "turnista", "tags": ["empilhadeira"]}, {"id": "op_jairo", "nome": "JAIRO", "letra": "E", "area": "enfardamento", "fab": "H2", "tipo": "turnista"}, {"id": "op_andr", "nome": "ANDRÉ AMORIM", "letra": "A", "area": "enfardamento", "fab": "H2", "tipo": "turnista", "tags": ["empilhadeira"]}, {"id": "op_karoline", "nome": "KAROLINE", "letra": "B", "area": "enfardamento", "fab": "H2", "tipo": "turnista", "tags": ["empilhadeira"]}, {"id": "op_ryan", "nome": "RYAN", "letra": "C", "area": "enfardamento", "fab": "H2", "tipo": "turnista"}, {"id": "op_tiago", "nome": "TIAGO", "letra": "D", "area": "enfardamento", "fab": "H2", "tipo": "turnista", "tags": ["empilhadeira"]}, {"id": "op_lucas", "nome": "LUCAS TENÓRIO", "letra": "E", "area": "enfardamento", "fab": "H2", "tipo": "turnista", "tags": ["empilhadeira"]}, {"id": "op_isabelly", "nome": "ISABELLY", "letra": "A", "area": "enfardamento", "fab": "H2", "tipo": "turnista"}, {"id": "op_willian", "nome": "WILLIAN", "letra": "B", "area": "enfardamento", "fab": "H2", "tipo": "turnista"}, {"id": "op_jorge", "nome": "JORGE", "letra": "C", "area": "enfardamento", "fab": "H2", "tipo": "turnista", "tags": ["empilhadeira"]}, {"id": "op_gustavo", "nome": "GUSTAVO", "letra": "D", "area": "enfardamento", "fab": "H2", "tipo": "turnista", "tags": ["empilhadeira"]}, {"id": "op_juliana", "nome": "JULIANA", "letra": "D", "area": "enfardamento", "fab": "H2", "tipo": "turnista"}, {"id": "op_renato", "nome": "RENATO", "letra": "E", "area": "enfardamento", "fab": "H2", "tipo": "turnista"}, {"id": "op_jabes", "nome": "JABES", "letra": "A", "area": "enfardamento", "fab": "H2", "tipo": "turnista", "ausencias": [{"tipo": "ferias", "inicio": "2026-07-13", "fim": "2026-08-12"}]}, {"id": "op_otavio", "nome": "OTAVIO", "letra": "A", "area": "enfardamento", "fab": "H2", "tipo": "turnista", "tags": ["empilhadeira"], "ausencias": [{"tipo": "ferias", "inicio": "2026-07-13", "fim": "2026-08-12"}]}, {"id": "op_luiz_rattmann", "nome": "LUIZ RATTMANN", "letra": null, "area": null, "fab": null, "tipo": "administrativo", "cargo": "Gerente"}, {"id": "op_diego_leite", "nome": "DIEGO LEITE", "letra": null, "area": null, "fab": null, "tipo": "administrativo", "cargo": "Consultor Industrial"}, {"id": "op_dioy_daldin", "nome": "DIOY DALDIN", "letra": null, "area": null, "fab": null, "tipo": "administrativo", "cargo": "Engenheiro de Produção"}, {"id": "op_wesley_dominici", "nome": "WESLEY DOMINICI", "letra": null, "area": null, "fab": null, "tipo": "administrativo", "cargo": "Consultor Industrial"}, {"id": "op_andr_silveira", "nome": "ANDRÉ SILVEIRA", "letra": null, "area": null, "fab": null, "tipo": "administrativo", "cargo": "Coordenador"}];

export const PG_APELIDOS = {"LIDOMAR": "LINDOMAR", "WESLEY R": "WESLEY RAMOS", "PAULO C": "PAULO CESAR", "GEAN": "GEAN CARLOS", "ANDRE M": "ANDRE MARQUES", "ADRIANO G": "ADRIANO GARCIA", "BONONI": "RAFAEL BONONI", "RAFAEL L": "RAFAEL LEMES", "THIAGO": "TIAGO", "ANIELE": "ANIELI", "ANDRE AM": "ANDRÉ AMORIM", "LUCAS T": "LUCAS TENÓRIO", "EDER": "EDINHO"};

const _norm = s => (s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/\s+/g," ").trim();
const _idx = (()=>{ const m={_f:{}}; for(const o of PG_EQUIPE){ const n=_norm(o.nome); m[n]=o; const f=n.split(" ")[0]; (m._f[f]=m._f[f]||[]).push(o);} return m; })();

export function resolverNome(nome){
  let n=_norm(nome); n=_norm(PG_APELIDOS[n]||n);
  if(_idx[n]) return _idx[n];
  const c=_idx._f[n.split(" ")[0]]||[];
  return c.length===1 ? c[0] : null;
}
export function anotarPessoa(pessoa, dataISO, horaHHMM){
  const [nome, fn=null, he=0] = pessoa;
  const op = resolverNome(nome);
  const situacao = op?.letra ? situacaoLetra(op.letra, dataISO, horaHHMM) : "externo";
  return { nome, fn, letra:op?.letra??null, area:op?.area??null, fab:op?.fab??null,
    resolvido:!!op, situacao,
    deslocado: situacao==="deslocado",              // inverteu/antecipou o horário
    he: situacao==="he_folga" || !!he };            // veio na folga, ou HE marcado no book
}
export function anotarDia(diaEscala){
  return { d:diaEscala.d, turnos: diaEscala.t.map(([hora,pessoas])=>({
    hora, letraRotacao: letraNoTurno(diaEscala.d,hora),
    pessoas: pessoas.map(p=>anotarPessoa(p,diaEscala.d,hora)) })) };
}

// ─── skillsDe — deriva função, lotação e treinamentos de um operador ─────────
// Usado pela FichaOperador (escalaTela). Deriva tudo dos campos já existentes
// no registro (area, fab, tags); não há cadastro individual de validade.
const _AREA_LABEL = {
  painel: "Operador de Painel",
  parte_umida: "Parte Úmida / Tancagem",
  secador_cortadeira: "Secador / Cortadeira",
  enfardamento: "Enfardamento",
};
const _TAG_TREINO = {
  empilhadeira: "Empilhadeira",
  brigadista: "Brigadista",
  facilitador_pg: "Facilitador PG",
  ponte: "Ponte Rolante",
};
// treinamentos-base por área (pré-requisitos assumidos em dia antes da PG)
const _AREA_TREINO = {
  parte_umida: ["NR-33", "NR-35"],
  secador_cortadeira: ["NR-33", "NR-35"],
  painel: [],
  enfardamento: [],
};
export function skillsDe(op){
  if(!op) return { funcao:"—", letra:null, lotacao:"—", operaAmbas:false, treinamentos:[] };
  const funcao = op.tipo === "administrativo"
    ? (op.cargo || "Administrativo")
    : (_AREA_LABEL[op.area] || op.area || "—");
  const base = _AREA_TREINO[op.area] || [];
  const dasTags = (op.tags || []).map(t => _TAG_TREINO[t]).filter(Boolean);
  const treinamentos = [...new Set([...base, ...dasTags])];
  return {
    funcao,
    letra: op.letra || null,
    lotacao: op.fab || "—",
    operaAmbas: false, // distinção H1/H2 mantida; sem sobreposição cadastrada
    treinamentos,
  };
}
