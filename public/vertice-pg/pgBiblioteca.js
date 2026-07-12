// =====================================================================
// VÉRTICE PG — Biblioteca de Atividades
// Fonte: Book Operacional PG 2025 (07/01–17/01) e PG 2026 (16/04–03/05)
// Tempos (duracaoHoras) e equipes (minOperadores) inferidos das escalas
// de turno reais dos dois books. Onde os anos divergem, o valor sugerido
// segue o book mais recente (2026) e a divergência fica em `evidencia`.
// TODOS os valores são sugestão inicial — ajustáveis pelo usuário.
// Espelho editável futuro no Firestore: pg_biblioteca_h2/registro
// =====================================================================

export const PG_FASES = ["PARADA", "EXECUCAO", "RETOMADA"];

export const PG_LIB_AREAS = [
  "PARTE_UMIDA",
  "TANCAGEM",
  "SECADOR",
  "CORTADEIRA",
  "ENFARDAMENTO",
  "BLOQUEIO",
  "PAINEL",
  "GERAL",
];

// ---------------------------------------------------------------------
// POSTOS DE TURNO — cobertura contínua durante toda a PG.
// A geração automática de escala usa estes postos para puxar operadores
// da letra do dia (rotação) e preencher nomes automaticamente.
// sugestaoPorTurno: quantidade típica observada nas escalas reais,
// por horário de entrada ("00" = 00:00, "08" = 08:00, "16" = 16:00).
// ---------------------------------------------------------------------
export const PG_POSTOS = [
  {
    id: "painel",
    nome: "Operador de Painel",
    area: "PAINEL",
    maquina: "COMUM",
    sugestaoPorTurno: { "00": 1, "08": 1, "16": 1 },
    obs: "Sempre 1 por turno. Registra ocorrências no PGR+ e coordena transporte/manobras.",
  },
  {
    id: "pu_tanc",
    nome: "Parte Úmida / Tancagem",
    area: "PARTE_UMIDA",
    maquina: "COMUM",
    sugestaoPorTurno: { "00": 1, "08": 2, "16": 2 },
    obs: "Manhã costuma receber +1 HE para liberações (lib PU/tanc).",
  },
  {
    id: "cortadeira",
    nome: "Cortadeira / Secador",
    area: "CORTADEIRA",
    maquina: "COMUM",
    sugestaoPorTurno: { "00": 0, "08": 2, "16": 1 },
    obs: "Liberações de LT da cortadeira e secador centralizadas neste posto.",
  },
  {
    id: "enf_org",
    nome: "Enfardamento / Organização da área",
    area: "ENFARDAMENTO",
    maquina: "COMUM",
    sugestaoPorTurno: { "00": 0, "08": 4, "16": 3 },
    obs: "Inclui liberação de enfardamento e limpeza/organização das linhas.",
  },
  {
    id: "bloqueio",
    nome: "Bloqueio (caixinhas)",
    area: "BLOQUEIO",
    maquina: "COMUM",
    sugestaoPorTurno: { "00": 0, "08": 2, "16": 1 },
    obs: "Liderado pelo responsável de bloqueio; madrugada só em dias de parada de máquina.",
  },
];

// ---------------------------------------------------------------------
// ATIVIDADES PONTUAIS — janela e equipe próprias (normalmente com HE).
// Campos:
//   duracaoHoras   número | null (null = sem janela fixa nos books)
//   minOperadores  mínimo sugerido, inferido do que foi realmente escalado
//   bloqueios      [] pronto para receber ids de caixas/cartões da
//                  Sala de Bloqueio (pgBloqueioData) — fase 2
//   skills         treinamentos sugeridos (compatível com skillsDe)
//   restricao      premissa/restrição operacional relevante
//   evidencia      dado bruto dos dois books que sustenta a sugestão
// ---------------------------------------------------------------------
export const PG_BIBLIOTECA = [
  // ===================== FASE: PARADA — MÁQUINA 3 =====================
  {
    id: "pre_parada_m3",
    nome: "Pré-parada da Máquina 3 (diluição pulpers e torre de quebras)",
    area: "PARTE_UMIDA",
    maquina: "M3",
    fase: "PARADA",
    duracaoHoras: 0.5,
    minOperadores: 2,
    bloqueios: [],
    skills: [],
    restricao: "Iniciar 30 min antes da parada. Nível da torre de quebras máx 5%.",
    evidencia: {
      pg2025: "Parada prevista 07/01 18:30",
      pg2026: "Parada prevista 16/04 18:30",
    },
  },
  {
    id: "parada_folhas_m3",
    nome: "Parada da Máquina 3 + retirada de folhas do secador",
    area: "SECADOR",
    maquina: "M3",
    fase: "PARADA",
    duracaoHoras: 2,
    minOperadores: 2,
    bloqueios: [],
    skills: [],
    restricao: null,
    evidencia: {
      pg2025: "Otávio HE + Ryan HE (retirar folhas)",
      pg2026: "Andre Am HE + Gustavo (retirar folhas)",
    },
  },
  {
    id: "lavagem_pu_m3",
    nome: "Lavagem da parte úmida M3 (antes da liberação para manutenção)",
    area: "PARTE_UMIDA",
    maquina: "M3",
    fase: "PARADA",
    duracaoHoras: null,
    minOperadores: 3,
    bloqueios: [],
    skills: [],
    restricao: "Concluir antes de liberar a máquina para manutenção.",
    evidencia: {
      pg2025: "Escopo 4.2",
      pg2026: "Escopo 4.2",
    },
  },
  {
    id: "bloqueios_m3",
    nome: "Bloqueios pós-parada da Máquina 3",
    area: "BLOQUEIO",
    maquina: "M3",
    fase: "PARADA",
    duracaoHoras: 5,
    minOperadores: 2,
    bloqueios: [],
    skills: [],
    restricao: "Rolo de tração e acionamento da fita de passagem ficam desbloqueados quando houver troca de fita.",
    evidencia: {
      pg2025: "21:30 até 02:30 (5h)",
      pg2026: "21:30 até 02:30 (5h)",
    },
  },
  {
    id: "remocao_vestimentas_m3",
    nome: "Remoção das vestimentas da Máquina 3",
    area: "PARTE_UMIDA",
    maquina: "M3",
    fase: "PARADA",
    duracaoHoras: 4,
    minOperadores: 4,
    bloqueios: [],
    skills: [],
    restricao: "Se possível, painel solicita caçamba roll on no vão da ponte para descarte.",
    evidencia: {
      pg2025: "21:30 até 03:30 (6h)",
      pg2026: "23:30 até 03:30 (4h)",
    },
  },
  {
    id: "drenagens_tanques_m3",
    nome: "Drenagens dos tanques da Máquina 3 (filtrado, água branca, morna, aceite, massas)",
    area: "TANCAGEM",
    maquina: "M3",
    fase: "PARADA",
    duracaoHoras: 3,
    minOperadores: 2,
    bloqueios: [],
    skills: [],
    restricao: "Tancagem toda isolada e sinalizada com CERQUITE antes de iniciar.",
    evidencia: {
      pg2025: "07/01 18:30–22:00 (janela ~3.5h)",
      pg2026: "16/04 19:30–23:30 (janela ~3h, Wesley/Roberto)",
    },
  },

  // ===================== FASE: PARADA — MÁQUINA 2 =====================
  {
    id: "pre_parada_m2",
    nome: "Pré-parada da Máquina 2 (diluição pulpers e torre de quebras)",
    area: "PARTE_UMIDA",
    maquina: "M2",
    fase: "PARADA",
    duracaoHoras: 0.5,
    minOperadores: 2,
    bloqueios: [],
    skills: [],
    restricao: "Iniciar 30 min antes da parada. Nível da torre de quebras máx 5%.",
    evidencia: {
      pg2025: "Parada prevista 09/01 11:30",
      pg2026: "Parada prevista 18/04 11:30",
    },
  },
  {
    id: "parada_folhas_m2",
    nome: "Parada da Máquina 2 + retirada de folhas do secador",
    area: "SECADOR",
    maquina: "M2",
    fase: "PARADA",
    duracaoHoras: 2,
    minOperadores: 2,
    bloqueios: [],
    skills: [],
    restricao: null,
    evidencia: {
      pg2025: "Ivan HE + Julio + Luan (3)",
      pg2026: "Willian + Ivan (2)",
    },
  },
  {
    id: "lavagem_pu_m2",
    nome: "Lavagem da parte úmida M2 (antes da liberação para manutenção)",
    area: "PARTE_UMIDA",
    maquina: "M2",
    fase: "PARADA",
    duracaoHoras: null,
    minOperadores: 3,
    bloqueios: [],
    skills: [],
    restricao: "Concluir antes de liberar a máquina para manutenção.",
    evidencia: {
      pg2025: "Escopo 4.4",
      pg2026: "Escopo 4.4",
    },
  },
  {
    id: "bloqueios_m2",
    nome: "Bloqueios pós-parada da Máquina 2",
    area: "BLOQUEIO",
    maquina: "M2",
    fase: "PARADA",
    duracaoHoras: 4,
    minOperadores: 2,
    bloqueios: [],
    skills: [],
    restricao: null,
    evidencia: {
      pg2025: "14:30 às 18:30 (4h)",
      pg2026: "14:30 às 18:30 (4h)",
    },
  },
  {
    id: "remocao_vestimentas_m2",
    nome: "Remoção das vestimentas da Máquina 2",
    area: "PARTE_UMIDA",
    maquina: "M2",
    fase: "PARADA",
    duracaoHoras: 4,
    minOperadores: 4,
    bloqueios: [],
    skills: [],
    restricao: null,
    evidencia: {
      pg2025: "15:30 às 19:30 (4h) — sem remover feltros da 3ª prensa",
      pg2026: "15:30 às 19:30 (4h)",
    },
  },
  {
    id: "transferencia_massa_14000",
    nome: "Transferência de massa da Torre 14000 m³ para a Mq1",
    area: "TANCAGEM",
    maquina: "COMUM",
    fase: "PARADA",
    duracaoHoras: 12,
    minOperadores: 1,
    bloqueios: [],
    skills: [],
    restricao: "Operação contínua via painel, inicia na parada da M2.",
    evidencia: {
      pg2025: "09/01 12:00 às 24:00 (12h)",
      pg2026: "18/04 12:00 às 24:00 (12h)",
    },
  },
  {
    id: "drenagem_torre_14000",
    nome: "Drenagem da Torre de massa branca 14000 m³",
    area: "TANCAGEM",
    maquina: "COMUM",
    fase: "PARADA",
    duracaoHoras: 2,
    minOperadores: 1,
    bloqueios: [],
    skills: [],
    restricao: "Após a transferência de massa. Drenagem via branqueamento.",
    evidencia: {
      pg2025: "10/01 00:00–02:00 (Adriano G)",
      pg2026: "19/04 00:00–02:00 (Bononi até 02:00)",
    },
  },
  {
    id: "drenagem_torre_agua_branca",
    nome: "Drenagem da Torre de Água Branca comum 2 e 3",
    area: "TANCAGEM",
    maquina: "COMUM",
    fase: "PARADA",
    duracaoHoras: 4,
    minOperadores: 2,
    bloqueios: [],
    skills: [],
    restricao: "Utilizar WBR da Ma1 ou WFT para diluição.",
    evidencia: {
      pg2025: "09/01 22:00 até 10/01 06:00 (8h)",
      pg2026: "19/04 02:00–06:00 (4h, Wesley/Roberto)",
    },
  },
  {
    id: "drenagem_torre_quebras",
    nome: "Drenagem da Torre de Quebras comum 2 e 3",
    area: "TANCAGEM",
    maquina: "COMUM",
    fase: "PARADA",
    duracaoHoras: 2,
    minOperadores: 2,
    bloqueios: [],
    skills: [],
    restricao: "Massa a 4%.",
    evidencia: {
      pg2025: "09/01 12:00–14:00 (2h)",
      pg2026: "18/04 12:00–14:00 (2h)",
    },
  },
  {
    id: "drenagens_tanques_m2",
    nome: "Drenagens dos tanques da Máquina 2 (filtrado, água branca, morna, aceite, massas)",
    area: "TANCAGEM",
    maquina: "M2",
    fase: "PARADA",
    duracaoHoras: 3.5,
    minOperadores: 2,
    bloqueios: [],
    skills: [],
    restricao: "Tancagem toda isolada e sinalizada com CERQUITE antes de iniciar.",
    evidencia: {
      pg2025: "09/01 12:00–17:30 (janela)",
      pg2026: "18/04 12:00–15:30 (janela, Wesley/Roberto)",
    },
  },

  // ========================= FASE: EXECUÇÃO ==========================
  {
    id: "lavagem_tanques_torres",
    nome: "Lavagem de tanques e torres (antes da parada fria)",
    area: "TANCAGEM",
    maquina: "COMUM",
    fase: "EXECUCAO",
    duracaoHoras: null,
    minOperadores: 2,
    bloqueios: [],
    skills: ["NR-33"],
    restricao: "Concluir ANTES do início da parada fria (sem WFT e sem bombear efluentes).",
    evidencia: {
      pg2025: "Concluir até 10/01 02:30 (parada fria de 104h)",
      pg2026: "Concluir até 19/04 01:00 (parada fria de ~300h)",
    },
  },
  {
    id: "troca_fita_secador",
    nome: "Troca da fita de passagem de ponta do secador",
    area: "SECADOR",
    maquina: "M3",
    fase: "EXECUCAO",
    duracaoHoras: 16,
    minOperadores: 4,
    bloqueios: [],
    skills: [],
    restricao: "Rolo de tração e acionamento da fita ficam desbloqueados. Máquina varia por PG (2025: M3; 2026: M2).",
    evidencia: {
      pg2025: "Secador 3, dias 10 e 11/01, ~3 dedicados + turno",
      pg2026: "Secador 2, dias 22 e 23/04: 7 nomeados no 1º dia, 4 no 2º",
    },
  },
  {
    id: "checklists_areas",
    nome: "Check lists de repartida de todas as áreas",
    area: "GERAL",
    maquina: "COMUM",
    fase: "EXECUCAO",
    duracaoHoras: 16,
    minOperadores: 6,
    bloqueios: [],
    skills: [],
    restricao: "Um responsável por área (PU/tanc, cortadeira, secador, enfardamento). 2 dias nos dois books.",
    evidencia: {
      pg2025: "13 e 14/01",
      pg2026: "24 e 25/04",
    },
  },

  // ==================== FASE: RETOMADA — MÁQUINA 3 ====================
  {
    id: "instalacao_vestimentas_m3",
    nome: "Instalação das vestimentas da Máquina 3",
    area: "PARTE_UMIDA",
    maquina: "M3",
    fase: "RETOMADA",
    duracaoHoras: 10,
    minOperadores: 4,
    bloqueios: [],
    skills: [],
    restricao: "Manta da shoe press instalada pela CBTI em paralelo (acompanhamento da operação).",
    evidencia: {
      pg2025: "15/01 05:30–15:30 (10h), 4 HE: Wesley D, Zarpelão, Bocato, Julio C",
      pg2026: "26/04 14:30 até 27/04 00:30 (10h), 5 HE: Erick, Anieli, Izailton, Romário, Ryan",
    },
  },
  {
    id: "teste_agua_m3",
    nome: "Teste com água na Máquina 3",
    area: "PARTE_UMIDA",
    maquina: "M3",
    fase: "RETOMADA",
    duracaoHoras: 1,
    minOperadores: 3,
    bloqueios: [],
    skills: [],
    restricao: "No retorno, não usar WFT para encher a torre de WBR — transferir WBR do H1 para o H2.",
    evidencia: {
      pg2025: "15/01 22:00–23:00",
      pg2026: "27/04 07:00–08:00",
    },
  },
  {
    id: "teste_massa_m3",
    nome: "Teste com massa na Máquina 3",
    area: "PARTE_UMIDA",
    maquina: "M3",
    fase: "RETOMADA",
    duracaoHoras: 1,
    minOperadores: 3,
    bloqueios: [],
    skills: [],
    restricao: null,
    evidencia: {
      pg2025: "15/01 23:00",
      pg2026: "02/05 07:30–08:30",
    },
  },
  {
    id: "passagem_ponta_m3",
    nome: "Passagem de ponta no secador da Máquina 3",
    area: "SECADOR",
    maquina: "M3",
    fase: "RETOMADA",
    duracaoHoras: 1.5,
    minOperadores: 4,
    bloqueios: [],
    skills: [],
    restricao: "Cortadeira 3 produz na sequência.",
    evidencia: {
      pg2025: "16/01 00:30–02:00 (1.5h)",
      pg2026: "02/05 09:00–10:30 (1.5h), turno reforçado com 4 HE",
    },
  },

  // ==================== FASE: RETOMADA — MÁQUINA 2 ====================
  {
    id: "instalacao_vestimentas_m2",
    nome: "Instalação das vestimentas da Máquina 2",
    area: "PARTE_UMIDA",
    maquina: "M2",
    fase: "RETOMADA",
    duracaoHoras: 10,
    minOperadores: 4,
    bloqueios: [],
    skills: [],
    restricao: "Manta da shoe press instalada pela CBTI em paralelo (acompanhamento da operação).",
    evidencia: {
      pg2025: "17/01 00:30–15:30 (15h)",
      pg2026: "27/04 08:30–18:30 (10h), 2 HE dedicados (Zarpelão, Claudecir) + turno",
    },
  },
  {
    id: "teste_agua_m2",
    nome: "Teste com água na Máquina 2",
    area: "PARTE_UMIDA",
    maquina: "M2",
    fase: "RETOMADA",
    duracaoHoras: 1,
    minOperadores: 3,
    bloqueios: [],
    skills: [],
    restricao: null,
    evidencia: {
      pg2025: "17/01 17:00–18:00",
      pg2026: "28/04 01:00–02:00",
    },
  },
  {
    id: "teste_massa_m2",
    nome: "Teste com massa na Máquina 2",
    area: "PARTE_UMIDA",
    maquina: "M2",
    fase: "RETOMADA",
    duracaoHoras: 1,
    minOperadores: 3,
    bloqueios: [],
    skills: [],
    restricao: null,
    evidencia: {
      pg2025: "17/01 18:00",
      pg2026: "03/05 13:30–14:30",
    },
  },
  {
    id: "passagem_ponta_m2",
    nome: "Passagem de ponta no secador da Máquina 2",
    area: "SECADOR",
    maquina: "M2",
    fase: "RETOMADA",
    duracaoHoras: 1.5,
    minOperadores: 4,
    bloqueios: [],
    skills: [],
    restricao: "Cortadeira 2 produz na sequência.",
    evidencia: {
      pg2025: "17/01 19:30–21:00 (1.5h)",
      pg2026: "03/05 15:00–16:30 (1.5h)",
    },
  },
];

// ---------------------------------------------------------------------
// ATIVIDADES DIÁRIAS POR ÁREA — seções 10.1.x do book (versão 2026,
// idênticas em estrutura nos dois anos; troca vs inspeção de itens como
// manta/placas varia conforme o escopo de cada PG).
// Executadas pelos POSTOS ao longo da execução; sem janela fixa.
// ---------------------------------------------------------------------
export const PG_ATIV_DIARIAS = [
  {
    id: "tancagem_m2",
    nome: "Atividades na Tancagem da Máquina 2",
    area: "TANCAGEM",
    maquina: "M2",
    postoId: "pu_tanc",
    skills: ["NR-33"],
    subAtividades: [
      "Drenagem, limpeza e inspeção do Tanque de Efluentes",
      "Drenagem, limpeza e inspeção da Torre 14000 m³",
      "Drenagem, limpeza e inspeção da Torre de Água Branca",
      "Drenagem, limpeza e inspeção da Torre de Quebras",
      "Drenagem, limpeza e inspeção do Tanque da Máquina",
      "Drenagem, limpeza e inspeção do Tanque da Depuração",
      "Drenagem, limpeza e inspeção do Tanque de Escorva",
      "Drenagem, limpeza e inspeção do Pulper Úmido",
      "Drenagem do tq de aceite e de diluição dos cleaners",
      "Drenagem, limpeza e inspeção dos separadores e tq de água morna",
      "Liberar e acompanhar os trabalhos de manutenção",
      "Realizar check list da área",
    ],
  },
  {
    id: "maquina_m2",
    nome: "Atividades na Máquina 2 (parte úmida)",
    area: "PARTE_UMIDA",
    maquina: "M2",
    postoId: "pu_tanc",
    skills: [],
    subAtividades: [
      "Limpeza geral das estruturas da máquina",
      "Troca da manta da Shoe Press",
      "Retirada das vestimentas da máquina",
      "Limpeza e inspeção das válvulas de diluição da Caixa de Entrada",
      "Limpeza e inspeção da calha da mesa formadora",
      "Troca do lábio da Caixa de Entrada",
      "Inspeção das placas desaguadoras",
      "Troca das réguas de formato",
      "Inspeção das réguas de cerâmica",
      "Inspeção dos guias das réguas de cerâmica",
      "Troca das réguas das caixas seca feltro",
      "Instalação das vestimentas da máquina",
      "Limpeza do ventilador do teto falso",
      "Limpeza dos ventiladores de conforto da parte úmida",
      "Limpeza da área e ventiladores de exaustão da parte úmida",
      "Liberar e acompanhar os trabalhos de manutenção",
      "Realizar check list da área",
      "Coleta de amostras de Pitch para laboratório",
    ],
  },
  {
    id: "secador_m2",
    nome: "Atividades no Secador da Máquina 2",
    area: "SECADOR",
    maquina: "M2",
    postoId: "cortadeira",
    skills: [],
    subAtividades: [
      "Limpeza imediata após parada do secador",
      "Inspeção da fita de passagem",
      "Retirada das telas dos radiadores (ISOCAP)",
      "Limpeza nas estruturas externas do secador (ISOCAP)",
      "Limpeza interna do secador (ISOCAP)",
      "Limpeza dos radiadores do secador (ISOCAP)",
      "Troca e limpeza dos trocadores de calor externos (ISOCAP)",
      "Limpeza dos ventiladores de resfriamento (ISOCAP)",
      "Liberar e acompanhar os trabalhos de manutenção",
      "Realizar check list da área",
    ],
  },
  {
    id: "cortadeira_m2",
    nome: "Atividades na Cortadeira da Máquina 2",
    area: "CORTADEIRA",
    maquina: "M2",
    postoId: "cortadeira",
    skills: [],
    subAtividades: [
      "Limpeza geral com ar na cortadeira",
      "Limpeza da rampa de rejeito da cortadeira",
      "Limpeza na estrutura do QCS e tampas laterais do Pulper Seco",
      "Drenagem e limpeza do Pulper Seco",
      "Limpeza do duto do Pulper Seco",
      "Limpeza do poço do porão do Pulper Seco",
      "Limpeza do ventilador de ar de conforto da cortadeira",
      "Limpeza do exaustor do Pulper da cortadeira",
      "Liberar e acompanhar os trabalhos de manutenção",
      "Realizar check list da área",
    ],
  },
  {
    id: "tancagem_m3",
    nome: "Atividades na Tancagem da Máquina 3",
    area: "TANCAGEM",
    maquina: "M3",
    postoId: "pu_tanc",
    skills: ["NR-33"],
    subAtividades: [
      "Drenagem, limpeza e inspeção do Tanque da Máquina",
      "Drenagem, limpeza e inspeção do Tanque da Depuração",
      "Drenagem, limpeza e inspeção do Tanque de Escorva",
      "Drenagem, limpeza e inspeção do Pulper Úmido",
      "Drenagem, limpeza e inspeção dos separadores e tq de água morna",
      "Drenagem do tq de aceite e de diluição dos cleaners",
      "Liberar e acompanhar os trabalhos de manutenção",
      "Realizar check list da área",
      "Coleta de amostras de Pitch para laboratório",
    ],
  },
  {
    id: "maquina_m3",
    nome: "Atividades na Máquina 3 (parte úmida)",
    area: "PARTE_UMIDA",
    maquina: "M3",
    postoId: "pu_tanc",
    skills: [],
    subAtividades: [
      "Limpeza geral das estruturas da máquina",
      "Retirada das vestimentas da máquina",
      "Abertura da Caixa de Entrada",
      "Limpeza e inspeção das válvulas de diluição da Caixa de Entrada",
      "Limpeza e inspeção da calha da mesa formadora",
      "Troca do lábio da Caixa de Entrada",
      "Troca das placas desaguadoras",
      "Inspeção das réguas de formato",
      "Inspeção das réguas de cerâmica",
      "Inspeção dos guias das réguas de cerâmica",
      "Inspeção das réguas das caixas seca feltro",
      "Instalação das vestimentas da máquina",
      "Limpeza do ventilador do teto falso",
      "Limpeza dos ventiladores de conforto da parte úmida",
      "Limpeza da área e ventiladores de exaustão da parte úmida",
      "Liberar e acompanhar os trabalhos de manutenção",
      "Realizar check list da área",
    ],
  },
  {
    id: "secador_m3",
    nome: "Atividades no Secador da Máquina 3",
    area: "SECADOR",
    maquina: "M3",
    postoId: "cortadeira",
    skills: [],
    subAtividades: [
      "Limpeza imediata após parada do secador",
      "Troca da fita de ponta e inspeções nos periféricos",
      "Retirada das telas dos radiadores",
      "Limpeza nas estruturas externas do secador",
      "Limpeza interna do secador",
      "Limpeza dos radiadores do secador",
      "Inspeção e limpeza dos trocadores de calor externos",
      "Limpeza dos ventiladores de resfriamento",
      "Liberar e acompanhar os trabalhos de manutenção",
      "Realizar check list da área",
    ],
  },
  {
    id: "cortadeira_m3",
    nome: "Atividades na Cortadeira da Máquina 3",
    area: "CORTADEIRA",
    maquina: "M3",
    postoId: "cortadeira",
    skills: [],
    subAtividades: [
      "Limpeza geral com ar na cortadeira",
      "Limpeza da rampa de rejeito da cortadeira",
      "Limpeza na estrutura do QCS e tampas laterais do Pulper Seco",
      "Drenagem e limpeza do Pulper Seco",
      "Limpeza do duto do Pulper Seco",
      "Limpeza do poço do porão do Pulper Seco",
      "Limpeza do ventilador de ar de conforto da cortadeira",
      "Limpeza do exaustor do Pulper da cortadeira",
      "Liberar e acompanhar os trabalhos de manutenção",
      "Realizar check list da área",
    ],
  },
  {
    id: "enfardamento",
    nome: "Atividades no Enfardamento",
    area: "ENFARDAMENTO",
    maquina: "COMUM",
    postoId: "enf_org",
    skills: [],
    subAtividades: [
      "Cobrir com lona plástica os fardos que serão usados para testes",
      "Limpeza geral dos transportadores",
      "Limpeza das prensas de fardos, encapadeiras, dobradeiras, empilhadores e unitizadoras",
      "Liberar e acompanhar os trabalhos de manutenção",
      "Realizar check list da área",
    ],
  },
];

// ---------------------------------------------------------------------
// Helpers puros
// ---------------------------------------------------------------------
export function bibliotecaPorFase(fase) {
  return PG_BIBLIOTECA.filter((a) => a.fase === fase);
}

export function bibliotecaPorMaquina(maq) {
  return PG_BIBLIOTECA.filter((a) => a.maquina === maq || a.maquina === "COMUM");
}

export function resumoBiblioteca() {
  const total = PG_BIBLIOTECA.length;
  const comJanela = PG_BIBLIOTECA.filter((a) => a.duracaoHoras != null).length;
  const horas = PG_BIBLIOTECA.reduce((s, a) => s + (a.duracaoHoras || 0), 0);
  return { total, comJanela, horasSomadas: horas, diarias: PG_ATIV_DIARIAS.length, postos: PG_POSTOS.length };
}
