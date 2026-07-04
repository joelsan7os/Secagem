// ─── pgBook.js — VÉRTICE PG · Planejamento (Book Operacional PG 2026) ─────────
// Fonte: BOOK OPERACIONAL H2 2026, seções 2, 4, 5, 6, 7 e 9.

export const PG_PERIODO = {
  MQ3: { ini:"16/04", fim:"02/05", parada:"16/04/2026 · 18:30" },
  MQ2: { ini:"18/04", fim:"03/05", parada:"18/04/2026 · 11:30" },
};

export const PG_FACILITADORES = [
  ["Facilitador Geral","Roberto Gandini"],
  ["Tanques e Depuração","—"],
  ["Parte Úmida","Eugenio"],
  ["Secador","Joel"],
  ["Cortadeira","Joel"],
  ["Linhas de Enfardamento","Gabriela / Otavio"],
  ["Organização e Limpeza","Ivan"],
];

export const PG_LTS = [
  ["LT · Linhas de Enfardamento","Jabes / Gustavo"],
  ["LT · Cortadeira e Secador","Bocato"],
  ["LT · Parte Úmida","Eugenio"],
  ["LT · Tancagem e Depuração","Bononi"],
  ["Bloqueio Elétrico/Mecânico","Dioy · apoio: Fabiano, Douglas, Thiago, Anieli e Gabriela"],
];

export const PG_PREMISSAS = {
  MQ3: {
    pre: [
      "Parada prevista para 16/04/2026 às 18:30h",
      "Iniciar 30 min antes a diluição dos pulpers e da torre de quebras",
      "Nível de polpa na torre de quebras no máximo 5%",
      "Forçar nível da torre de quebras",
      "Diluir o fundo da torre com água enviada pelo pulper seco",
      "Zerar até cavitar a bomba da torre de quebras",
    ],
    parada: [
      "Cumprir procedimento de parada da máquina",
      "Executar todos os bloqueios pedidos após a parada dos equipamentos",
      "Lavagem da parte úmida antes da liberação para manutenção",
      "Retirar (cortar) telas, feltros 2ª prensa, pick-up e terceiras — fita do secador NÃO será trocada",
      "Parar todos os equipamentos elétricos",
      "Drenar os tanques conforme cronograma de drenagem",
      "Drenar e bloquear linhas de vapor e condensado",
      "Bloquear válvula geral de vapor e by-pass",
      "Correntes só em válvulas de limite de bateria; nas demais, cartão de bloqueio",
    ],
  },
  MQ2: {
    pre: [
      "Parada prevista para 18/04/2026 às 11:30h",
      "Iniciar 30 min antes a diluição dos pulpers e da torre de quebras",
      "Nível de polpa na torre de quebras no máximo 5%",
      "Forçar nível da torre de quebras",
      "Diluir o fundo da torre com água enviada pelo pulper seco",
      "Zerar até cavitar a bomba da torre de quebras",
    ],
    parada: [
      "Cumprir procedimento de parada da máquina",
      "Executar todos os bloqueios pedidos após a parada dos equipamentos",
      "Lavagem da parte úmida antes da liberação para manutenção",
      "Retirar telas, feltros 2ª prensa, pick-up, casal da 3ª prensa e manta da shoe press — fita de passagem do secador SERÁ trocada",
      "Parar todos os equipamentos elétricos",
      "Drenar os tanques conforme cronograma de drenagem",
      "Drenar e bloquear linhas de vapor e condensado",
      "Bloquear válvula geral de vapor e by-pass",
      "Correntes só em válvulas de limite de bateria; nas demais, cartão de bloqueio",
    ],
  },
};

export const PG_MATERIAIS = [
  "600 cartões de bloqueio","10 blocos de LT","04 lanternas para inspeção",
  "01 rolo de 200 m de corrente plástica (isolamento)","01 rolo de 200 m de corda de seda (guiar feltros)",
  "12 rolos de panos para limpeza","20 pares de luvas PVC","50 macacões tyvek","01 galão de 20 l de desengraxante",
];

export const PG_MAT_SEGURANCA = [
  "50 máscaras descartáveis de pó","04 cintos de segurança (limpeza geral)","04 pares de botas PVC",
  "08 lances de mangueira de incêndio (limpeza de tanques)","Linhas de vida para as máquinas (comprar antecipado)",
];

export const PG_RADIOS = [
  "01 rádio · facilitador geral","06 rádios · facilitadores","01 rádio · líder de bloqueios","10 rádios · líderes de atividades",
];

export const PG_INSPECAO_TANQUES = [
  "Mesa formadora (MQ2 e MQ3)","Calha da mesa formadora (MQ2 e MQ3)","Tanque de filtrado (MQ2 e MQ3)",
  "Tanque de água branca (MQ2 e MQ3)","Torre de água branca","Torre de quebras",
  "Tanque da depuração (MQ2 e MQ3)","Tanque da máquina (MQ2 e MQ3)","Tanque pulper seco da cortadeira (MQ2 e MQ3)",
  "Tanque pulper úmido (MQ2 e MQ3)","Tanque de água morna (MQ2 e MQ3)","Tanque de escorva (MQ2 e MQ3)",
];

export const PG_LIMPEZA = [
  "Limpeza imediata após a parada da máquina","Limpeza dos tanques","Acionamentos dos motores da parte úmida",
  "Acompanhamento do caminhão de auto vácuo","Limpeza de canaletas","Estrutura da máquina",
  "Limpeza com ar na cortadeira","Limpeza geral de toda a área",
  "Principais equipamentos das linhas: prensa, encapadeira, dobradeira, empilhador e unitizadora",
];
