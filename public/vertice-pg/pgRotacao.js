// ─── pgRotacao.js — VÉRTICE PG · Rotação de letra (6x4) e detecção de deslocamento ─
// Reusa as MESMAS constantes do MVPSecagem (calcularLetra) para manter fonte única.
// A rotação normal é determinística: para qualquer data/hora, retorna a letra que
// DEVERIA estar no turno. Na PG a alocação real vem da PG_ESCALA; comparando as duas,
// marcamos "deslocado" quem está num horário que não é o da própria letra.

export const SEQUENCIA = ["E", "D", "A", "B", "C"]; // idêntico ao MVPSecagem
export const BASE_ROTACAO = new Date("2026-06-09T00:00:00");

// turno pelo horário: 0 = 00–08, 1 = 08–16, 2 = 16–24
export function turnoDoHorario(h) {
  return h < 8 ? 0 : h < 16 ? 1 : 2;
}

// versão PURA de calcularLetra: recebe a data/hora (Date) e devolve a letra da rotação
export function letraNoInstante(quando) {
  const dias = Math.floor((quando - BASE_ROTACAO) / 86400000);
  const bloco = Math.floor(dias / 2) % 5;
  const turno = turnoDoHorario(quando.getHours());
  const i = (((bloco - turno) % 5) + 5) % 5;
  return SEQUENCIA[i];
}

// conveniência: a partir de "AAAA-MM-DD" + "HH:MM"
export function letraNoTurno(dataISO, horaHHMM) {
  const [H, M] = horaHHMM.split(":").map(Number);
  return letraNoInstante(new Date(`${dataISO}T${String(H).padStart(2, "0")}:${String(M || 0).padStart(2, "0")}:00`));
}

// operador de letra X está deslocado se, naquele instante, a rotação não é a letra dele
export function estaDeslocado(letraOperador, dataISO, horaHHMM) {
  if (!letraOperador) return false; // ADM/HE externo: sem letra, não se aplica
  return letraNoTurno(dataISO, horaHHMM) !== letraOperador;
}
