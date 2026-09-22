import { describe, expect, it } from 'vitest';
import {
  ALTURA_CANVAS,
  BATIDAS_PARA_AJUDA,
  CAPACIDADE_TANQUE,
  CARRO,
  CONSUMO_POR_SEGUNDO,
  CORES_DOS_RIVAIS,
  DT_MAXIMO,
  DURACAO_FREADA_FINAL,
  DURACAO_LENTIDAO,
  DURACAO_RETOMADA,
  DURACAO_SAIDA,
  ESPERA_APOS_POSTO_PERDIDO,
  ESPERA_LINHA_DE_CHEGADA,
  ESPERA_POSTO_RESERVA,
  FATOR_LENTIDAO,
  FATOR_RESERVA,
  FATOR_RIVAL,
  FATOR_RIVAL_AJUDA,
  JANELA_DA_SETA,
  LARGURA_CANVAS,
  LIMIAR_POSTO,
  LIMIAR_POUCA_GASOLINA,
  MARCOS,
  MARGEM_COLISAO,
  MARGEM_DA_PISTA,
  META_ULTRAPASSAGENS,
  NIVEIS,
  POSTOS_PERDIDOS_PARA_AJUDA,
  PRIMEIRO_RIVAL_APOS,
  RIVAIS_COM_AJUDA,
  RIVAIS_DE_AQUECIMENTO,
  VELOCIDADE_LATERAL,
  Y_LIBERA_NOVO_RIVAL,
  Y_NASCIMENTO_POSTO,
  Y_NASCIMENTO_RIVAL,
  Y_REMOVE_A_FRENTE,
  avancarCorrida,
  consumirGasolina,
  criarCorrida,
  faixaParaPosto,
  faixaSugerida,
  nivelDaCorrida,
  resumoDaCorrida,
  sortearFaixasDosRivais,
  velocidadeDoJogador,
} from '../rael/grande-premio/jogo.js';
import { centroDaFaixa, faixaDoCarro, retangulosSeSobrepoem } from '../rael/corrida-do-rael/jogo.js';

// -----------------------------------------------------------------------------
// Auxiliares de teste
// -----------------------------------------------------------------------------

/** Sorteador determinístico (LCG), independente de Math.random. */
function criarSorteador(sementeInicial = 123456789) {
  let semente = sementeInicial >>> 0;
  return function sortear() {
    semente = (semente * 1664525 + 1013904223) % 4294967296;
    return semente / 4294967296;
  };
}

const sempreZero = () => 0;
const quaseUm = () => 0.999999;
const DT = 0.05;

const TIPOS_VALIDOS = new Set([
  'rival-apareceu', 'ultrapassou', 'marco', 'bateu', 'ajuda-desvio', 'posto-apareceu',
  'abasteceu', 'posto-perdido', 'pouca-gasolina', 'reserva', 'meta', 'bandeirada',
]);

/** Corrida sem nascimentos automáticos, para montar cenários à mão. */
function corridaCalma(faixas = 3) {
  const estado = criarCorrida({ faixas });
  estado.tempoAteProximoRival = 1e9;
  estado.rivaisNascidos = 10;
  return estado;
}

function faixaAtual(estado) {
  return faixaDoCarro(estado.carro.x, estado.carro.w, estado.geometria);
}

/** Acrescenta um rival parado na faixa pedida, com a velocidade normal do aquecimento. */
function porRival(estado, { faixa, y, velocidade = NIVEIS[0].cruzeiro * FATOR_RIVAL, ...extra }) {
  const rival = {
    id: estado.proximoId++,
    faixa,
    x: centroDaFaixa(faixa, estado.geometria) - CARRO.w / 2,
    y,
    w: CARRO.w,
    h: CARRO.h,
    velocidade,
    cor: CORES_DOS_RIVAIS[0],
    contado: false,
    saindo: false,
    alfa: 1,
    comAjuda: false,
    ...extra,
  };
  estado.rivais.push(rival);
  return rival;
}

function porPosto(estado, { faixa, y }) {
  const w = 64;
  const h = 72;
  estado.posto = {
    faixa, x: centroDaFaixa(faixa, estado.geometria) - w / 2, y, w, h, ajuda: false,
  };
  return estado.posto;
}

function passos(estado, n, { direcao = 0, sortear = sempreZero, dt = DT } = {}) {
  const eventos = [];
  for (let i = 0; i < n; i++) eventos.push(...avancarCorrida(estado, { dt, direcao }, { sortear }));
  return eventos;
}

function passosAte(estado, condicao, { limite = 20000, direcao = 0, sortear = sempreZero } = {}) {
  const eventos = [];
  for (let i = 0; i < limite; i++) {
    const doPasso = avancarCorrida(estado, { dt: DT, direcao }, { sortear });
    eventos.push(...doPasso);
    if (condicao(doPasso, estado)) return { eventos, passos: i + 1 };
  }
  throw new Error('condição não alcançada');
}

function doTipo(eventos, tipo) {
  return eventos.filter((e) => e.tipo === tipo);
}

// Bots --------------------------------------------------------------------------

const botParado = () => () => 0;

/** Segue a seta verde; sem seta, vai até o posto; senão fica onde está. */
function botDesviador() {
  let alvo = null;
  return (estado) => {
    const sugestao = faixaSugerida(estado);
    if (sugestao !== null) alvo = sugestao;
    else if (alvo === null && estado.posto) alvo = estado.posto.faixa;
    if (alvo === null) return 0;
    const alvoX = centroDaFaixa(alvo, estado.geometria) - estado.carro.w / 2;
    const diferenca = alvoX - estado.carro.x;
    if (Math.abs(diferenca) <= 8) {
      alvo = null;
      return 0;
    }
    return Math.sign(diferenca);
  };
}

/** Corre até a bandeirada (+2 s), checando as invariantes S2 e S4 a cada passo. */
function simular({ faixas, sortear, bot, limite = 720 }) {
  const estado = criarCorrida({ faixas });
  const violacoes = [];
  const violar = (texto) => { if (violacoes.length < 5) violacoes.push(`t=${estado.tempo.toFixed(2)} ${texto}`); };
  let bandeiradas = 0;
  let tempoDaBandeirada = null;
  let passosDepois = 0;

  while (estado.tempo < limite && passosDepois < 40) {
    const antes = estado.ultrapassagens;
    const eventos = avancarCorrida(estado, { dt: DT, direcao: bot(estado) }, { sortear });

    if (!(estado.gasolina >= 0 && estado.gasolina <= CAPACIDADE_TANQUE)) violar(`gasolina ${estado.gasolina}`);
    if (estado.ultrapassagens < antes) violar('contador diminuiu');
    if (estado.ultrapassagens > META_ULTRAPASSAGENS) violar('passou de 30');
    const { inicio, fim } = estado.geometria;
    if (estado.carro.x < inicio - 1e-9 || estado.carro.x > fim - estado.carro.w + 1e-9) violar('carro fora da pista');
    for (const e of eventos) {
      if (!TIPOS_VALIDOS.has(e.tipo)) violar(`evento ${e.tipo}`);
      if (e.tipo === 'rival-apareceu') {
        const distintas = new Set(e.faixas);
        if (e.faixas.length >= estado.faixas || distintas.size !== e.faixas.length
          || e.faixas.some((f) => !Number.isInteger(f) || f < 0 || f >= estado.faixas)) {
          violar(`nascimento ${JSON.stringify(e.faixas)}`);
        }
      }
      if (e.tipo === 'bandeirada') {
        bandeiradas++;
        tempoDaBandeirada = estado.tempo;
      }
    }

    const ativos = estado.rivais.filter((r) => !r.saindo);
    if (estado.posto && ativos.some((r) => retangulosSeSobrepoem(estado.posto, r, 0))) violar('posto sobre rival');
    for (let i = 0; i < ativos.length; i++) {
      for (let j = i + 1; j < ativos.length; j++) {
        if (retangulosSeSobrepoem(ativos[i], ativos[j], 0)) violar('rivais sobrepostos');
      }
    }

    if (tempoDaBandeirada !== null) passosDepois++;
  }

  return { tempo: tempoDaBandeirada, batidas: estado.batidas, bandeiradas, violacoes };
}

const SEMENTES = Array.from({ length: 60 }, (_, i) => 1000 + i * 7919);
const memoria = {};

function rodadas(faixas, nomeDoBot) {
  const chave = `${faixas}-${nomeDoBot}`;
  if (!memoria[chave]) {
    memoria[chave] = SEMENTES.map((semente) => simular({
      faixas,
      sortear: criarSorteador(semente),
      bot: nomeDoBot === 'parado' ? botParado() : botDesviador(),
    }));
  }
  return memoria[chave];
}

// -----------------------------------------------------------------------------
// Constantes
// -----------------------------------------------------------------------------

describe('Grande Prêmio — constantes', () => {
  it('tem os valores da seção 3.4', () => {
    expect([LARGURA_CANVAS, ALTURA_CANVAS, MARGEM_DA_PISTA]).toEqual([400, 700, 36]);
    expect(CARRO).toEqual({ w: 44, h: 64, y: 580 });
    expect(VELOCIDADE_LATERAL).toBe(300);
    expect(META_ULTRAPASSAGENS).toBe(30);
    expect(MARCOS).toEqual([5, 10, 15, 20, 25, 28, 29]);
    expect(MARGEM_COLISAO).toBe(6);
    expect([FATOR_RIVAL, FATOR_RIVAL_AJUDA, RIVAIS_COM_AJUDA, BATIDAS_PARA_AJUDA]).toEqual([0.45, 0.6, 3, 2]);
    expect([DURACAO_LENTIDAO, FATOR_LENTIDAO, DURACAO_RETOMADA]).toEqual([2.0, 0.35, 0.6]);
    expect([CAPACIDADE_TANQUE, CONSUMO_POR_SEGUNDO, LIMIAR_POSTO, LIMIAR_POUCA_GASOLINA]).toEqual([100, 2.0, 50, 25]);
    expect([FATOR_RESERVA, ESPERA_APOS_POSTO_PERDIDO, ESPERA_POSTO_RESERVA, POSTOS_PERDIDOS_PARA_AJUDA]).toEqual([0.4, 4.0, 1.5, 2]);
    expect([Y_NASCIMENTO_RIVAL, Y_NASCIMENTO_POSTO, Y_LIBERA_NOVO_RIVAL, Y_REMOVE_A_FRENTE]).toEqual([-70, -80, 160, -400]);
    expect([DURACAO_SAIDA, PRIMEIRO_RIVAL_APOS, ESPERA_LINHA_DE_CHEGADA, DURACAO_FREADA_FINAL]).toEqual([0.5, 1.5, 1.0, 1.5]);
    expect([DT_MAXIMO, JANELA_DA_SETA, RIVAIS_DE_AQUECIMENTO]).toEqual([0.05, 300, 3]);
  });

  it('NIVEIS segue a tabela 2.7 e está congelado', () => {
    expect(NIVEIS.map((n) => [n.nome, n.ate, n.cruzeiro, [...n.intervalo], n.chanceDupla])).toEqual([
      ['aquecimento', 2, 190, [3.6, 3.6], 0],
      ['nivel-1', 9, 220, [3.0, 3.6], 0],
      ['nivel-2', 19, 255, [2.5, 3.1], 0.2],
      ['nivel-3', 29, 295, [2.1, 2.7], 0.3],
    ]);
    expect(Object.isFrozen(NIVEIS)).toBe(true);
    for (const nivel of NIVEIS) expect(Object.isFrozen(nivel)).toBe(true);
  });

  it('cores dos rivais nunca são azuis', () => {
    expect(CORES_DOS_RIVAIS).toEqual(['#ef4444', '#eab308', '#22c55e', '#a855f7', '#f97316']);
    for (const azul of ['#3b82f6', '#2563eb', '#0f5aa8']) expect(CORES_DOS_RIVAIS).not.toContain(azul);
  });

  it('CARRO, MARCOS e CORES_DOS_RIVAIS estão congelados', () => {
    expect(Object.isFrozen(CARRO)).toBe(true);
    expect(Object.isFrozen(MARCOS)).toBe(true);
    expect(Object.isFrozen(CORES_DOS_RIVAIS)).toBe(true);
  });
});

// -----------------------------------------------------------------------------
// nivelDaCorrida
// -----------------------------------------------------------------------------

describe('Grande Prêmio — nivelDaCorrida', () => {
  it('troca de nível nos limites da tabela', () => {
    const nomes = [0, 2, 3, 9, 10, 19, 20, 29].map((n) => nivelDaCorrida(n).nome);
    expect(nomes).toEqual(['aquecimento', 'aquecimento', 'nivel-1', 'nivel-1', 'nivel-2', 'nivel-2', 'nivel-3', 'nivel-3']);
  });

  it('30 ou mais continua no nível 3', () => {
    expect(nivelDaCorrida(30).nome).toBe('nivel-3');
    expect(nivelDaCorrida(100).cruzeiro).toBe(295);
  });

  it('entrada inválida ou negativa vira aquecimento', () => {
    for (const valor of [-1, Number.NaN, '15', undefined, null, Infinity]) {
      expect(nivelDaCorrida(valor).nome).toBe('aquecimento');
    }
  });
});

// -----------------------------------------------------------------------------
// velocidadeDoJogador
// -----------------------------------------------------------------------------

describe('Grande Prêmio — velocidadeDoJogador', () => {
  it('sem batida anda no cruzeiro', () => {
    expect(velocidadeDoJogador({ cruzeiro: 220 })).toBe(220);
    expect(velocidadeDoJogador({ cruzeiro: 220, tempoDesdeBatida: null })).toBe(220);
  });

  it('logo após a batida cai para 35% até 2 s', () => {
    expect(velocidadeDoJogador({ cruzeiro: 200, tempoDesdeBatida: 0 })).toBeCloseTo(70);
    expect(velocidadeDoJogador({ cruzeiro: 200, tempoDesdeBatida: 1.99 })).toBeCloseTo(70);
  });

  it('retoma linearmente: 2,3 s ≈ 0,675×', () => {
    expect(velocidadeDoJogador({ cruzeiro: 200, tempoDesdeBatida: 2.3 })).toBeCloseTo(135);
  });

  it('em 2,6 s volta a 1×', () => {
    expect(velocidadeDoJogador({ cruzeiro: 200, tempoDesdeBatida: 2.6 })).toBeCloseTo(200);
  });

  it('reserva limita a 40% e vale o menor limite com batida', () => {
    expect(velocidadeDoJogador({ cruzeiro: 200, reserva: true })).toBeCloseTo(80);
    expect(velocidadeDoJogador({ cruzeiro: 200, reserva: true, tempoDesdeBatida: 0.5 })).toBeCloseTo(70);
    expect(velocidadeDoJogador({ cruzeiro: 200, reserva: true, tempoDesdeBatida: 2.5 })).toBeCloseTo(80);
  });

  it('entradas inválidas nunca produzem NaN', () => {
    for (const cruzeiro of [Number.NaN, -5, 'x', undefined, Infinity]) {
      for (const tempoDesdeBatida of [Number.NaN, -1, 'x', undefined, null]) {
        const v = velocidadeDoJogador({ cruzeiro, tempoDesdeBatida, reserva: 'sim' });
        expect(Number.isFinite(v)).toBe(true);
        expect(v).toBeGreaterThan(0);
      }
    }
  });
});

// -----------------------------------------------------------------------------
// consumirGasolina
// -----------------------------------------------------------------------------

describe('Grande Prêmio — consumirGasolina', () => {
  it('consome 2 por segundo', () => {
    expect(consumirGasolina({ nivel: 100, dt: 1 })).toBeCloseTo(98);
    expect(consumirGasolina({ nivel: 50, dt: 0.5, taxa: 4 })).toBeCloseTo(48);
  });

  it('para em 0', () => {
    expect(consumirGasolina({ nivel: 1, dt: 10 })).toBe(0);
    expect(consumirGasolina({ nivel: -20, dt: 0.1 })).toBe(0);
  });

  it('nunca passa de 100', () => {
    expect(consumirGasolina({ nivel: 500, dt: 0 })).toBe(100);
    expect(consumirGasolina({ nivel: 100, dt: 0.05, taxa: -3 })).toBeLessThanOrEqual(100);
  });

  it('dt negativo ou NaN vale 0', () => {
    expect(consumirGasolina({ nivel: 70, dt: -1 })).toBe(70);
    expect(consumirGasolina({ nivel: 70, dt: Number.NaN })).toBe(70);
    expect(Number.isFinite(consumirGasolina({ nivel: Number.NaN, dt: Number.NaN }))).toBe(true);
  });
});

// -----------------------------------------------------------------------------
// sortearFaixasDosRivais
// -----------------------------------------------------------------------------

describe('Grande Prêmio — sortearFaixasDosRivais', () => {
  it('com 2 faixas sempre sai 1 rival', () => {
    const sortear = criarSorteador(7);
    for (let i = 0; i < 200; i++) {
      expect(sortearFaixasDosRivais({ faixas: 2, chanceDupla: 1, sortear })).toHaveLength(1);
    }
  });

  it('dupla só com chance e 3 ou mais faixas', () => {
    expect(sortearFaixasDosRivais({ faixas: 3, chanceDupla: 0, sortear: sempreZero })).toHaveLength(1);
    expect(sortearFaixasDosRivais({ faixas: 3, chanceDupla: 0.3, sortear: sempreZero })).toHaveLength(2);
    expect(sortearFaixasDosRivais({ faixas: 4, chanceDupla: 0.3, sortear: quaseUm })).toHaveLength(1);
    expect(sortearFaixasDosRivais({ faixas: 2, chanceDupla: 0.3, sortear: sempreZero })).toHaveLength(1);
  });

  it('nunca ocupa todas as faixas e devolve índices válidos, distintos e ordenados', () => {
    for (const faixas of [2, 3, 4]) {
      const sortear = criarSorteador(faixas * 31);
      let historico = [];
      for (let i = 0; i < 500; i++) {
        const nascimento = sortearFaixasDosRivais({ faixas, chanceDupla: 1, historico, sortear });
        expect(nascimento.length).toBeLessThan(faixas);
        expect(new Set(nascimento).size).toBe(nascimento.length);
        expect([...nascimento].sort((a, b) => a - b)).toEqual(nascimento);
        for (const f of nascimento) {
          expect(Number.isInteger(f)).toBe(true);
          expect(f).toBeGreaterThanOrEqual(0);
          expect(f).toBeLessThan(faixas);
        }
        historico = [...historico, nascimento].slice(-2);
      }
    }
  });

  it('forcarFaixa tem prioridade e gera rival único', () => {
    expect(sortearFaixasDosRivais({ faixas: 4, chanceDupla: 1, sortear: sempreZero, forcarFaixa: 2 })).toEqual([2]);
    expect(sortearFaixasDosRivais({
      faixas: 3, chanceDupla: 0, sortear: sempreZero, forcarFaixa: 1, historico: [[1], [1]],
    })).toEqual([1]);
  });

  it('com sorteador adversário nenhuma faixa aparece 3 vezes seguidas (500 nascimentos)', () => {
    for (const faixas of [2, 3, 4]) {
      for (const sortear of [sempreZero, quaseUm]) {
        for (const chanceDupla of [0, 0.3]) {
          const lista = [];
          for (let i = 0; i < 500; i++) {
            lista.push(sortearFaixasDosRivais({ faixas, chanceDupla, historico: lista.slice(-2), sortear }));
          }
          for (let i = 2; i < lista.length; i++) {
            for (const f of lista[i]) {
              expect(lista[i - 1].includes(f) && lista[i - 2].includes(f)).toBe(false);
            }
          }
        }
      }
    }
  });

  it('é determinístico para a mesma semente', () => {
    const gerar = () => {
      const sortear = criarSorteador(99);
      const lista = [];
      for (let i = 0; i < 50; i++) {
        lista.push(sortearFaixasDosRivais({ faixas: 4, chanceDupla: 0.3, historico: lista.slice(-2), sortear }));
      }
      return lista;
    };
    expect(gerar()).toEqual(gerar());
  });

  it('sorteador que devolve lixo não quebra o resultado', () => {
    const nascimento = sortearFaixasDosRivais({ faixas: 3, chanceDupla: 0.3, sortear: () => Number.NaN });
    expect(nascimento.every((f) => Number.isInteger(f) && f >= 0 && f < 3)).toBe(true);
  });
});

// -----------------------------------------------------------------------------
// faixaParaPosto
// -----------------------------------------------------------------------------

describe('Grande Prêmio — faixaParaPosto', () => {
  it('devolve a faixa preferida quando está livre', () => {
    const estado = corridaCalma(3);
    porRival(estado, { faixa: 0, y: 200 });
    expect(faixaParaPosto({ estado, preferirFaixa: 1, sortear: sempreZero })).toBe(1);
  });

  it('preferida ocupada → a livre mais próxima (empate → a menor)', () => {
    const estado = corridaCalma(4);
    porRival(estado, { faixa: 1, y: 300 });
    expect(faixaParaPosto({ estado, preferirFaixa: 1, sortear: quaseUm })).toBe(0);
    porRival(estado, { faixa: 0, y: 100 });
    expect(faixaParaPosto({ estado, preferirFaixa: 1, sortear: sempreZero })).toBe(2);
  });

  it('rival saindo não bloqueia', () => {
    const estado = corridaCalma(3);
    porRival(estado, { faixa: 1, y: 300, saindo: true });
    expect(faixaParaPosto({ estado, preferirFaixa: 1, sortear: sempreZero })).toBe(1);
  });

  it('rival acima do nascimento e rival que já passou do carro não bloqueiam', () => {
    const estado = corridaCalma(3);
    porRival(estado, { faixa: 1, y: -250 });
    porRival(estado, { faixa: 1, y: CARRO.y + 40 });
    expect(faixaParaPosto({ estado, preferirFaixa: 1, sortear: sempreZero })).toBe(1);
  });

  it('todas ocupadas → null; sem preferência sorteia entre as livres', () => {
    const estado = corridaCalma(3);
    porRival(estado, { faixa: 0, y: 0 });
    porRival(estado, { faixa: 2, y: 300 });
    expect(faixaParaPosto({ estado, sortear: sempreZero })).toBe(1);
    expect(faixaParaPosto({ estado, sortear: quaseUm })).toBe(1);
    porRival(estado, { faixa: 1, y: Y_NASCIMENTO_POSTO });
    expect(faixaParaPosto({ estado, preferirFaixa: 1, sortear: sempreZero })).toBeNull();
  });
});

// -----------------------------------------------------------------------------
// faixaSugerida
// -----------------------------------------------------------------------------

describe('Grande Prêmio — faixaSugerida', () => {
  it('sem rival na faixa do jogador → null', () => {
    const estado = corridaCalma(3);
    expect(faixaSugerida(estado)).toBeNull();
    porRival(estado, { faixa: 0, y: 400 });
    expect(faixaSugerida(estado)).toBeNull();
  });

  it('rival fora da janela → null (longe, já passou ou saindo)', () => {
    const estado = corridaCalma(3);
    porRival(estado, { faixa: 1, y: CARRO.y - JANELA_DA_SETA - CARRO.h - 10 });
    porRival(estado, { faixa: 1, y: 400, saindo: true });
    expect(faixaSugerida(estado)).toBeNull();
  });

  it('rival na janela → faixa livre mais próxima', () => {
    const estado = corridaCalma(4);
    // jogador na faixa 1; faixa 0 ocupada → 2
    porRival(estado, { faixa: 1, y: 400 });
    porRival(estado, { faixa: 0, y: 350 });
    expect(faixaSugerida(estado)).toBe(2);
    porRival(estado, { faixa: 2, y: 450 });
    expect(faixaSugerida(estado)).toBe(3);
    porRival(estado, { faixa: 3, y: 300 });
    expect(faixaSugerida(estado)).toBeNull();
  });

  it('empate → a faixa mais perto do centro da pista', () => {
    const estado = corridaCalma(4);
    // jogador na faixa 1 de 4: faixas 0 e 2 empatam; 2 fica mais perto do centro (1,5)
    porRival(estado, { faixa: 1, y: 400 });
    expect(faixaSugerida(estado)).toBe(2);
  });
});

// -----------------------------------------------------------------------------
// criarCorrida
// -----------------------------------------------------------------------------

describe('Grande Prêmio — criarCorrida', () => {
  it('tem todos os campos da seção 3.5 com os valores iniciais', () => {
    const e = criarCorrida();
    expect(e).toMatchObject({
      fase: 'correndo',
      faixas: 3,
      tempo: 0,
      distancia: 0,
      velocidade: 190,
      carro: { x: 178, y: 580, w: 44, h: 64 },
      ultrapassagens: 0,
      abastecimentos: 0,
      batidas: 0,
      batidasSeguidas: 0,
      tempoDesdeBatida: null,
      rivaisComAjuda: 0,
      rivaisNascidos: 0,
      historicoDeFaixas: [],
      tempoAteProximoRival: 1.5,
      rivais: [],
      gasolina: 100,
      avisouPoucaGasolina: false,
      reserva: false,
      posto: null,
      postosPerdidosSeguidos: 0,
      tempoAteProximoPosto: 0,
      tempoAteLinha: null,
      linhaDeChegada: null,
      tempoDeFreada: 0,
      proximoId: 1,
    });
    expect(e.geometria).toMatchObject({ inicio: 36, fim: 364, largura: 400, faixas: 3 });
    expect(e.geometria.larguraFaixa).toBeCloseTo(109.33, 2);
  });

  it('centraliza o carro na faixa floor((faixas - 1) / 2)', () => {
    for (const [faixas, faixaInicial] of [[2, 0], [3, 1], [4, 1]]) {
      const e = criarCorrida({ faixas });
      expect(faixaAtual(e)).toBe(faixaInicial);
      expect(e.carro.x + e.carro.w / 2).toBeCloseTo(centroDaFaixa(faixaInicial, e.geometria));
    }
  });

  it('sobrevive a JSON sem perda', () => {
    const e = criarCorrida({ faixas: 4 });
    expect(JSON.parse(JSON.stringify(e))).toEqual(e);
    passos(e, 200, { sortear: criarSorteador(3) });
    expect(JSON.parse(JSON.stringify(e))).toEqual(e);
  });

  it('aceita 2, 3 e 4 faixas', () => {
    for (const faixas of [2, 3, 4]) {
      const e = criarCorrida({ faixas });
      expect(e.faixas).toBe(faixas);
      expect(e.geometria.faixas).toBe(faixas);
    }
  });

  it('faixas inválidas viram 3', () => {
    for (const faixas of [1, 5, 'x', Number.NaN, null]) expect(criarCorrida({ faixas }).faixas).toBe(3);
    expect(criarCorrida().faixas).toBe(3);
  });
});

// -----------------------------------------------------------------------------
// avancarCorrida — ultrapassagem
// -----------------------------------------------------------------------------

describe('Grande Prêmio — avancarCorrida: ultrapassagem', () => {
  it('conta quando o rival fica todo abaixo do carro, uma única vez', () => {
    const e = corridaCalma(3);
    const rival = porRival(e, { faixa: 0, y: 500 });
    const eventos = [];
    while (rival.y <= CARRO.y + CARRO.h) {
      expect(e.ultrapassagens).toBe(0);
      eventos.push(...passos(e, 1));
    }
    expect(e.ultrapassagens).toBe(1);
    eventos.push(...passos(e, 100));
    expect(e.ultrapassagens).toBe(1);
    expect(doTipo(eventos, 'ultrapassou')).toEqual([{ tipo: 'ultrapassou', total: 1 }]);
  });

  it('emite um único ultrapassou por rival, mesmo com muitos passos', () => {
    const e = corridaCalma(3);
    porRival(e, { faixa: 0, y: 300 });
    porRival(e, { faixa: 2, y: 100 });
    const eventos = passos(e, 400);
    expect(doTipo(eventos, 'ultrapassou').map((ev) => ev.total)).toEqual([1, 2]);
  });

  it('marcos 5…29 saem uma vez cada, depois do ultrapassou', () => {
    const e = corridaCalma(3);
    const eventos = [];
    for (let i = 0; i < 29; i++) {
      porRival(e, { faixa: 0, y: CARRO.y + CARRO.h + 0.5 });
      eventos.push(...passos(e, 1));
    }
    expect(e.ultrapassagens).toBe(29);
    const marcos = doTipo(eventos, 'marco').map((ev) => ev.total);
    expect(marcos).toEqual([5, 10, 15, 20, 25, 28, 29]);
    const i = eventos.findIndex((ev) => ev.tipo === 'marco' && ev.total === 5);
    expect(eventos[i - 1]).toEqual({ tipo: 'ultrapassou', total: 5 });
  });

  it('dupla lado a lado conta 2', () => {
    const e = corridaCalma(3);
    porRival(e, { faixa: 0, y: 600 });
    porRival(e, { faixa: 2, y: 600 });
    const eventos = passos(e, 20);
    expect(doTipo(eventos, 'ultrapassou').map((ev) => ev.total)).toEqual([1, 2]);
    expect(e.ultrapassagens).toBe(2);
  });
});

// -----------------------------------------------------------------------------
// avancarCorrida — batida
// -----------------------------------------------------------------------------

describe('Grande Prêmio — avancarCorrida: batida', () => {
  it('emite bateu com primeira = true só na primeira', () => {
    const e = corridaCalma(3);
    const r1 = porRival(e, { faixa: 1, y: 540 });
    const eventos = passos(e, 1);
    expect(doTipo(eventos, 'bateu')).toEqual([{ tipo: 'bateu', rivalId: r1.id, primeira: true }]);
    passos(e, 60);
    porRival(e, { faixa: 1, y: 540 });
    expect(doTipo(passos(e, 1), 'bateu')[0].primeira).toBe(false);
  });

  it('deixa o carro a 35% do cruzeiro e volta a 100% depois de 2,6 s', () => {
    const e = corridaCalma(3);
    porRival(e, { faixa: 1, y: 540 });
    passos(e, 1);
    expect(e.velocidade).toBeCloseTo(190);
    passos(e, 1);
    expect(e.velocidade).toBeCloseTo(190 * 0.35);
    passos(e, 38);
    expect(e.velocidade).toBeCloseTo(190 * 0.35);
    passos(e, 14);
    expect(e.tempoDesdeBatida).toBeNull();
    expect(e.velocidade).toBeCloseTo(190);
  });

  it('fica imune por 2,6 s: nenhuma segunda batida', () => {
    const e = corridaCalma(3);
    porRival(e, { faixa: 1, y: 540 });
    passos(e, 1);
    const eventos = [];
    for (let i = 0; i < 50; i++) {
      porRival(e, { faixa: 1, y: 560, velocidade: e.velocidade });
      eventos.push(...passos(e, 1));
      e.rivais = e.rivais.filter((r) => r.saindo);
    }
    expect(doTipo(eventos, 'bateu')).toHaveLength(0);
    expect(e.batidas).toBe(1);
  });

  it('rival batido sai em 0,5 s e nunca conta', () => {
    const e = corridaCalma(3);
    const r = porRival(e, { faixa: 1, y: 540 });
    passos(e, 1);
    expect(r.saindo).toBe(true);
    passos(e, Math.ceil(DURACAO_SAIDA / DT));
    expect(e.rivais.find((x) => x.id === r.id)).toBeUndefined();
    const eventos = passos(e, 200);
    expect(doTipo(eventos, 'ultrapassou')).toHaveLength(0);
    expect(e.ultrapassagens).toBe(0);
  });

  it('congela o relógio de nascimento durante a lentidão', () => {
    const e = corridaCalma(3);
    e.tempoAteProximoRival = 1.0;
    porRival(e, { faixa: 1, y: 540 });
    const eventos = passos(e, 50);
    expect(e.tempoAteProximoRival).toBe(1.0);
    expect(doTipo(eventos, 'rival-apareceu')).toHaveLength(0);
    passos(e, 5);
    expect(e.tempoAteProximoRival).toBeLessThan(1.0);
  });

  it('a 2.ª batida seguida emite ajuda-desvio e liga 3 rivais com ajuda', () => {
    const e = corridaCalma(3);
    porRival(e, { faixa: 1, y: 540 });
    const primeira = passos(e, 60);
    expect(doTipo(primeira, 'ajuda-desvio')).toHaveLength(0);
    porRival(e, { faixa: 1, y: 540 });
    const segunda = passos(e, 1);
    expect(segunda.map((ev) => ev.tipo)).toEqual(['bateu', 'ajuda-desvio']);
    expect(e.rivaisComAjuda).toBe(RIVAIS_COM_AJUDA);
  });

  it('uma ultrapassagem zera as batidas seguidas', () => {
    const e = corridaCalma(3);
    porRival(e, { faixa: 1, y: 540 });
    passos(e, 60);
    expect(e.batidasSeguidas).toBe(1);
    porRival(e, { faixa: 0, y: CARRO.y + CARRO.h + 0.5 });
    passos(e, 1);
    expect(e.batidasSeguidas).toBe(0);
    porRival(e, { faixa: 1, y: 540 });
    expect(doTipo(passos(e, 1), 'ajuda-desvio')).toHaveLength(0);
    expect(e.batidasSeguidas).toBe(1);
  });

  it('os 3 rivais seguintes à ajuda nascem a 0,60× e o 4.º volta a 0,45×', () => {
    const e = criarCorrida({ faixas: 3 });
    e.rivaisNascidos = 10;
    e.rivaisComAjuda = RIVAIS_COM_AJUDA;
    e.tempoAteProximoRival = 0;
    const fatores = [];
    const { eventos } = passosAte(e, (evs, est) => {
      if (evs.some((ev) => ev.tipo === 'rival-apareceu')) {
        const novo = est.rivais[est.rivais.length - 1];
        fatores.push([novo.comAjuda, novo.velocidade / nivelDaCorrida(est.ultrapassagens).cruzeiro]);
      }
      return est.rivaisNascidos >= 14;
    }, { sortear: quaseUm });
    expect(doTipo(eventos, 'rival-apareceu')).toHaveLength(4);
    expect(fatores.map(([ajuda]) => ajuda)).toEqual([true, true, true, false]);
    fatores.forEach(([, fator], i) => expect(fator).toBeCloseTo(i < 3 ? FATOR_RIVAL_AJUDA : FATOR_RIVAL));
    expect(e.rivaisComAjuda).toBe(0);
  });

  it('rival de ajuda nasce a 0,60× do cruzeiro', () => {
    const e = corridaCalma(3);
    e.rivaisComAjuda = 3;
    e.tempoAteProximoRival = 0;
    passos(e, 1, { sortear: quaseUm });
    expect(e.rivais).toHaveLength(1);
    expect(e.rivais[0].comAjuda).toBe(true);
    expect(e.rivais[0].velocidade).toBeCloseTo(190 * FATOR_RIVAL_AJUDA);
    expect(e.rivaisComAjuda).toBe(2);
  });

  it('rival normal não nasce enquanto houver rival de ajuda na pista', () => {
    const e = corridaCalma(3);
    const ajuda = porRival(e, { faixa: 2, y: 300, comAjuda: true, velocidade: 190 * FATOR_RIVAL_AJUDA });
    e.tempoAteProximoRival = 0;
    expect(doTipo(passos(e, 5), 'rival-apareceu')).toHaveLength(0);
    expect(e.tempoAteProximoRival).toBe(0);
    ajuda.contado = true;
    ajuda.y = CARRO.y + CARRO.h + 1;
    expect(doTipo(passos(e, 1), 'rival-apareceu')).toHaveLength(1);
  });
});

// -----------------------------------------------------------------------------
// avancarCorrida — gasolina
// -----------------------------------------------------------------------------

describe('Grande Prêmio — avancarCorrida: gasolina', () => {
  it('consome 2 por segundo de corrida', () => {
    const e = corridaCalma(3);
    passos(e, 20);
    expect(e.gasolina).toBeCloseTo(98);
    passos(e, 200);
    expect(e.gasolina).toBeCloseTo(78);
  });

  it('pouca-gasolina sai uma vez por tanque', () => {
    const e = corridaCalma(3);
    e.gasolina = LIMIAR_POUCA_GASOLINA + 0.05;
    const eventos = passos(e, 100);
    expect(doTipo(eventos, 'pouca-gasolina')).toHaveLength(1);
    porPosto(e, { faixa: 1, y: CARRO.y });
    expect(doTipo(passos(e, 1), 'abasteceu')).toHaveLength(1);
    e.gasolina = LIMIAR_POUCA_GASOLINA + 0.05;
    expect(doTipo(passos(e, 10), 'pouca-gasolina')).toHaveLength(1);
  });

  it('ao zerar entra na reserva: rivais saem, carro a 40% e nenhum rival nasce', () => {
    const e = criarCorrida({ faixas: 3 });
    e.gasolina = 0.05;
    e.avisouPoucaGasolina = true;
    porRival(e, { faixa: 0, y: 200 });
    porRival(e, { faixa: 2, y: 400 });
    const eventos = passos(e, 1);
    expect(doTipo(eventos, 'reserva')).toHaveLength(1);
    expect(e.reserva).toBe(true);
    expect(e.gasolina).toBe(0);
    expect(e.rivais.every((r) => r.saindo)).toBe(true);
    expect(e.velocidade).toBeCloseTo(190 * FATOR_RESERVA);
    // o posto de reserva leva ~8 s para chegar ao carro; em 5 s ainda não abasteceu
    const depois = passos(e, 100);
    expect(e.reserva).toBe(true);
    expect(doTipo(depois, 'rival-apareceu')).toHaveLength(0);
    expect(doTipo(depois, 'reserva')).toHaveLength(0);
  });

  it('na reserva o posto aparece na faixa do jogador após 1,5 s', () => {
    const e = corridaCalma(4);
    e.gasolina = 0.05;
    passos(e, 1);
    const { eventos, passos: n } = passosAte(e, (evs) => evs.some((ev) => ev.tipo === 'posto-apareceu'), { sortear: quaseUm });
    // o relógio já desconta o passo em que a reserva começou
    expect((n + 1) * DT).toBeCloseTo(ESPERA_POSTO_RESERVA, 5);
    const [posto] = doTipo(eventos, 'posto-apareceu');
    expect(posto).toMatchObject({ faixa: faixaAtual(e), ajuda: true, primeiro: true });
  });

  it('abasteceu enche o tanque e tira da reserva', () => {
    const e = corridaCalma(3);
    e.gasolina = 0.05;
    passos(e, 1);
    expect(e.reserva).toBe(true);
    porPosto(e, { faixa: 1, y: CARRO.y - 10 });
    const eventos = passos(e, 1);
    expect(doTipo(eventos, 'abasteceu')).toEqual([{ tipo: 'abasteceu', total: 1 }]);
    expect(e.gasolina).toBe(100);
    expect(e.reserva).toBe(false);
    expect(e.posto).toBeNull();
    expect(e.postosPerdidosSeguidos).toBe(0);
    expect(e.velocidade).toBeCloseTo(190 * FATOR_RESERVA);
    passos(e, 1);
    expect(e.velocidade).toBeCloseTo(190);
  });

  it('posto perdido → novo posto 4 s depois', () => {
    const e = corridaCalma(3);
    e.gasolina = 45;
    porPosto(e, { faixa: 0, y: ALTURA_CANVAS - 1 });
    const eventos = passos(e, 1);
    expect(doTipo(eventos, 'posto-perdido')).toHaveLength(1);
    expect(e.postosPerdidosSeguidos).toBe(1);
    const { passos: n } = passosAte(e, (evs) => evs.some((ev) => ev.tipo === 'posto-apareceu'));
    // o relógio já desconta o passo em que o posto foi perdido
    expect((n + 1) * DT).toBeCloseTo(ESPERA_APOS_POSTO_PERDIDO, 5);
  });

  it('depois de 2 postos perdidos o próximo nasce na faixa do jogador', () => {
    for (const sortear of [sempreZero, quaseUm]) {
      const e = corridaCalma(4);
      e.gasolina = 45;
      e.postosPerdidosSeguidos = POSTOS_PERDIDOS_PARA_AJUDA;
      const eventos = passos(e, 1, { sortear });
      expect(doTipo(eventos, 'posto-apareceu')).toEqual([
        { tipo: 'posto-apareceu', faixa: faixaAtual(e), ajuda: true, primeiro: true },
      ]);
      expect(e.posto.ajuda).toBe(true);
    }
  });

  it('o primeiro posto aparece quando a gasolina chega à metade', () => {
    const e = corridaCalma(3);
    e.gasolina = LIMIAR_POSTO + 0.05;
    expect(doTipo(passos(e, 1), 'posto-apareceu')).toHaveLength(1);
    expect(e.posto.y).toBe(Y_NASCIMENTO_POSTO);
  });
});

// -----------------------------------------------------------------------------
// avancarCorrida — aquecimento
// -----------------------------------------------------------------------------

describe('Grande Prêmio — avancarCorrida: aquecimento', () => {
  it('o 1.º rival nasce na faixa do jogador após 1,5 s', () => {
    for (const faixas of [2, 3, 4]) {
      for (const sortear of [sempreZero, quaseUm, criarSorteador(5)]) {
        const e = criarCorrida({ faixas });
        const { eventos, passos: n } = passosAte(e, (evs) => evs.some((ev) => ev.tipo === 'rival-apareceu'), { sortear });
        expect(n * DT).toBeCloseTo(PRIMEIRO_RIVAL_APOS, 5);
        expect(doTipo(eventos, 'rival-apareceu')[0]).toEqual({
          tipo: 'rival-apareceu', faixas: [faixaAtual(e)], numero: 1, aquecimento: true,
        });
      }
    }
  });

  it('os 3 primeiros rivais vêm sozinhos, no cruzeiro 190', () => {
    const e = criarCorrida({ faixas: 4 });
    const velocidades = {};
    const nascimentos = [];
    passosAte(e, (evs, est) => {
      for (const r of est.rivais) velocidades[r.id] = r.velocidade;
      nascimentos.push(...doTipo(evs, 'rival-apareceu'));
      return nascimentos.length >= 4;
    }, { sortear: sempreZero });
    expect(nascimentos.slice(0, 3).map((n) => [n.faixas.length, n.aquecimento])).toEqual([[1, true], [1, true], [1, true]]);
    expect(nascimentos[3].aquecimento).toBe(false);
    for (const id of [1, 2, 3]) expect(velocidades[id]).toBeCloseTo(190 * FATOR_RIVAL);
  });
});

// -----------------------------------------------------------------------------
// avancarCorrida — chegada
// -----------------------------------------------------------------------------

function corridaNaMeta() {
  const e = criarCorrida({ faixas: 3 });
  e.ultrapassagens = 29;
  e.rivaisNascidos = 40;
  e.tempoAteProximoRival = 0.1;
  e.gasolina = 40;
  porRival(e, { faixa: 0, y: CARRO.y + CARRO.h + 0.5, velocidade: 295 * FATOR_RIVAL });
  porRival(e, { faixa: 2, y: 200, velocidade: 295 * FATOR_RIVAL });
  porPosto(e, { faixa: 2, y: -20 });
  return e;
}

describe('Grande Prêmio — avancarCorrida: chegada', () => {
  it('30 → meta: fase chegada, rivais saindo e posto some', () => {
    const e = corridaNaMeta();
    const eventos = passos(e, 1);
    expect(eventos.map((ev) => ev.tipo)).toEqual(['ultrapassou', 'meta']);
    expect(e.ultrapassagens).toBe(30);
    expect(e.fase).toBe('chegada');
    expect(e.rivais.every((r) => r.saindo)).toBe(true);
    expect(e.posto).toBeNull();
  });

  it('na chegada nada nasce e a gasolina congela', () => {
    const e = corridaNaMeta();
    passos(e, 1);
    const gasolina = e.gasolina;
    const eventos = passos(e, 18);
    expect(eventos).toEqual([]);
    expect(e.gasolina).toBe(gasolina);
    expect(e.rivais.every((r) => r.saindo)).toBe(true);
    expect(e.posto).toBeNull();
  });

  it('a linha de chegada aparece 1 s depois da meta, em y = -40', () => {
    const e = corridaNaMeta();
    passos(e, 1);
    passos(e, 19);
    expect(e.linhaDeChegada).toBeNull();
    passos(e, 1);
    expect(e.linhaDeChegada).toEqual({ y: -40 });
  });

  it('bandeirada sai uma única vez quando a linha alcança o carro', () => {
    const e = corridaNaMeta();
    const { eventos } = passosAte(e, (_, est) => est.fase === 'fim');
    expect(doTipo(eventos, 'bandeirada')).toHaveLength(1);
    expect(e.linhaDeChegada.y).toBeGreaterThanOrEqual(CARRO.y);
    expect(passos(e, 200)).toEqual([]);
    expect(resumoDaCorrida(e)).toEqual({ ultrapassagens: 30, abastecimentos: 0, terminou: true });
  });

  it('na fase fim ignora direção, freia até 0 em 1,5 s e não emite eventos', () => {
    const e = corridaNaMeta();
    passosAte(e, (_, est) => est.fase === 'fim');
    const x = e.carro.x;
    const inicial = e.velocidade;
    let anterior = inicial;
    const eventos = [];
    for (let i = 0; i < 30; i++) {
      eventos.push(...avancarCorrida(e, { dt: DT, direcao: i % 2 ? 1 : -1 }, { sortear: sempreZero }));
      expect(e.velocidade).toBeLessThanOrEqual(anterior);
      anterior = e.velocidade;
      if (i === 14) expect(e.velocidade).toBeCloseTo(inicial / 2, 5);
    }
    expect(e.velocidade).toBe(0);
    expect(e.carro.x).toBe(x);
    expect(eventos).toEqual([]);
  });
});

// -----------------------------------------------------------------------------
// avancarCorrida — robustez
// -----------------------------------------------------------------------------

describe('Grande Prêmio — avancarCorrida: robustez', () => {
  it('dt = 10 age como 0,05', () => {
    const a = criarCorrida();
    const b = criarCorrida();
    for (let i = 0; i < 100; i++) {
      avancarCorrida(a, { dt: 10, direcao: 1 }, { sortear: criarSorteador(i) });
      avancarCorrida(b, { dt: 0.05, direcao: 1 }, { sortear: criarSorteador(i) });
    }
    expect(a).toEqual(b);
  });

  it('dt negativo ou NaN vale 0', () => {
    const e = criarCorrida();
    const antes = JSON.stringify(e);
    for (const dt of [-1, Number.NaN, undefined, 'x']) {
      expect(avancarCorrida(e, { dt, direcao: 1 }, { sortear: sempreZero })).toEqual([]);
    }
    expect(JSON.stringify(e)).toBe(antes);
  });

  it('direção é normalizada para -1, 0 ou 1', () => {
    const a = criarCorrida();
    const b = criarCorrida();
    avancarCorrida(a, { dt: DT, direcao: 5 }, { sortear: sempreZero });
    avancarCorrida(b, { dt: DT, direcao: 1 }, { sortear: sempreZero });
    expect(a.carro.x).toBe(b.carro.x);
    expect(a.carro.x - 178).toBeCloseTo(VELOCIDADE_LATERAL * DT);
    const c = criarCorrida();
    avancarCorrida(c, { dt: DT, direcao: Number.NaN }, { sortear: sempreZero });
    expect(c.carro.x).toBe(178);
  });

  it('o carro nunca sai da pista', () => {
    for (const faixas of [2, 3, 4]) {
      const e = corridaCalma(faixas);
      passos(e, 100, { direcao: -1 });
      expect(e.carro.x).toBe(e.geometria.inicio);
      passos(e, 100, { direcao: 1 });
      expect(e.carro.x).toBe(e.geometria.fim - e.carro.w);
    }
  });
});

// -----------------------------------------------------------------------------
// Simulações
// -----------------------------------------------------------------------------

describe('Grande Prêmio — simulações', () => {
  it('S1: o bot parado sempre chega à bandeirada em até 12 min (60 sementes × 2, 3 e 4 faixas)', () => {
    for (const faixas of [2, 3, 4]) {
      for (const r of rodadas(faixas, 'parado')) {
        expect(r.tempo).not.toBeNull();
        expect(r.tempo).toBeLessThanOrEqual(720);
      }
    }
  });

  it('S1: o bot parado termina também com os sorteadores adversários', () => {
    for (const faixas of [2, 3, 4]) {
      for (const sortear of [sempreZero, quaseUm]) {
        const r = simular({ faixas, sortear, bot: botParado() });
        expect(r.tempo).not.toBeNull();
        expect(r.tempo).toBeLessThanOrEqual(720);
        expect(r.violacoes).toEqual([]);
        expect(r.bandeiradas).toBe(1);
      }
    }
  });

  it('S2 e S4: invariantes valem em todo passo, e a bandeirada sai exatamente uma vez', () => {
    for (const faixas of [2, 3, 4]) {
      for (const bot of ['parado', 'desviador']) {
        for (const r of rodadas(faixas, bot)) {
          expect(r.violacoes).toEqual([]);
          expect(r.bandeiradas).toBe(1);
        }
      }
    }
  });

  it('S3: desviar compensa (mais rápido em ≥ 90% das sementes e menos batidas)', () => {
    for (const faixas of [2, 3, 4]) {
      const parado = rodadas(faixas, 'parado');
      const desviador = rodadas(faixas, 'desviador');
      const maisRapido = desviador.filter((r, i) => r.tempo < parado[i].tempo).length;
      expect(maisRapido / SEMENTES.length).toBeGreaterThanOrEqual(0.9);
      const soma = (lista) => lista.reduce((t, r) => t + r.batidas, 0);
      expect(soma(desviador)).toBeLessThan(soma(parado));
    }
  });

  it('S5: com 3 faixas o desviador leva em média entre 60 s e 240 s', () => {
    const tempos = rodadas(3, 'desviador').map((r) => r.tempo);
    const media = tempos.reduce((a, b) => a + b, 0) / tempos.length;
    expect(media).toBeGreaterThanOrEqual(60);
    expect(media).toBeLessThanOrEqual(240);
  });
});
