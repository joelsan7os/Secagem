// =====================================================================
// VÉRTICE PG — Cronograma (ligação atividade → data)
// Camada intermediária entre a Biblioteca (molde atemporal) e a Escala
// (quem trabalha). Diz QUANDO cada atividade pontual acontece.
//
//   Biblioteca (molde)  →  Cronograma (quando)  →  Escala (quem)
//
// Registro editável no Firestore: pg_cronograma_h2/registro
//   formato: { itens: [{ atividadeId, data:"AAAA-MM-DD", hora?:"HH:MM" }] }
//
// O gerador sugere uma distribuição inicial a partir do período (datas de
// parada/retomada por máquina). Tudo é sobreponível: o sistema sugere, o
// usuário decide.
// =====================================================================
import { PG_BIBLIOTECA } from "./pgBiblioteca";

// --- helpers de data (ISO puro, sem fuso) ---------------------------
const addDias = (iso, n) => {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const diffDias = (a, b) =>
  Math.round((new Date(b + "T12:00") - new Date(a + "T12:00")) / 86400000);
const isISO = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

// envelope: menor início e maior término entre as máquinas do período
export function envelopePeriodo(periodo) {
  if (!periodo) return null;
  const inis = [periodo.MQ3?.ini, periodo.MQ2?.ini].filter(isISO).sort();
  const fims = [periodo.MQ3?.fim, periodo.MQ2?.fim].filter(isISO).sort();
  if (!inis.length || !fims.length) return null;
  return { ini: inis[0], fim: fims[fims.length - 1] };
}

// data-âncora de uma atividade, por fase + máquina:
//  PARADA   → início do período da máquina (M3 para antes de M2)
//  RETOMADA → término do período da máquina (recuando dos últimos dias)
//  EXECUCAO → miolo do envelope
// offsetFase distribui atividades da mesma fase/máquina em dias seguidos
function ancoraDaAtividade(ativ, periodo, env, offset) {
  const perMaq = ativ.maquina === "M2" ? periodo.MQ2
               : ativ.maquina === "M3" ? periodo.MQ3
               : null;
  if (ativ.fase === "PARADA") {
    const base = isISO(perMaq?.ini) ? perMaq.ini : env.ini;
    return addDias(base, offset);
  }
  if (ativ.fase === "RETOMADA") {
    const base = isISO(perMaq?.fim) ? perMaq.fim : env.fim;
    return addDias(base, -offset);
  }
  // EXECUCAO → meio do envelope
  const meio = Math.floor(diffDias(env.ini, env.fim) / 2);
  return addDias(env.ini, meio + offset);
}

// clampa uma data dentro do envelope
const clamp = (iso, env) =>
  iso < env.ini ? env.ini : iso > env.fim ? env.fim : iso;

// gera o cronograma inicial sugerido a partir do período
export function gerarCronograma(periodo) {
  const env = envelopePeriodo(periodo);
  if (!env) return [];
  const itens = [];
  // agrupa por fase+máquina para dar offsets crescentes dentro do grupo
  const grupos = {};
  PG_BIBLIOTECA.forEach(a => {
    const k = `${a.fase}|${a.maquina}`;
    (grupos[k] = grupos[k] || []).push(a);
  });
  Object.values(grupos).forEach(lista => {
    lista.forEach((a, i) => {
      // RETOMADA recua do fim: a última atividade do grupo ancora no último dia
      // e as anteriores recuam, preservando a ordem cronológica do array
      // (vestimenta → teste água → teste massa → passagem de ponta).
      const offset = a.fase === "RETOMADA" ? (lista.length - 1 - i) : i;
      const data = clamp(ancoraDaAtividade(a, periodo, env, offset), env);
      itens.push({ atividadeId: a.id, data });
    });
  });
  itens.sort((x, y) => (x.data < y.data ? -1 : x.data > y.data ? 1 : 0));
  return itens;
}

// --- consultas usadas pela UI ---------------------------------------
const _bibById = Object.fromEntries(PG_BIBLIOTECA.map(a => [a.id, a]));

// atividades agendadas para um dia (a partir de um cronograma já existente)
export function atividadesDoDia(cronograma, dataISO) {
  return (cronograma || [])
    .filter(it => it.data === dataISO)
    .map(it => ({ ...it, atividade: _bibById[it.atividadeId] || null }))
    .filter(it => it.atividade);
}

// ids de caixas de bloqueio exigidas num dia (dedup), a partir do cronograma
export function bloqueiosDoDia(cronograma, dataISO) {
  const set = new Set();
  atividadesDoDia(cronograma, dataISO).forEach(it =>
    (it.atividade.bloqueios || []).forEach(b => set.add(b))
  );
  return [...set];
}

// resumo: todas as caixas exigidas em toda a PG (para visão geral)
export function bloqueiosDaPG(cronograma) {
  const set = new Set();
  (cronograma || []).forEach(it =>
    (_bibById[it.atividadeId]?.bloqueios || []).forEach(b => set.add(b))
  );
  return [...set];
}
