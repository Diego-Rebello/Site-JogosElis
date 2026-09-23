/**
 * Grande Prêmio do Rael — motor puro da corrida.
 * Derivado de Pixel Racer (https://github.com/Elomami1976/pixel-racer).
 * Copyright (c) 2026 Tarek Elomami — licença MIT. Cópia em LICENSE-pixel-racer.txt.
 *
 * Sem DOM, Canvas, armazenamento, áudio, fala ou relógio: o tempo entra por `dt`
 * e o sorteio por `sortear` injetado pela tela (ou pelo teste).
 */
import {
  quantidadeDeFaixas, geometriaDaPista, centroDaFaixa, faixaDoCarro,
  moverCarro, retangulosSeSobrepoem,
} from '../corrida-do-rael/jogo.js';

export const LARGURA_CANVAS = 400;
export const ALTURA_CANVAS = 700;
export const MARGEM_DA_PISTA = 36;
export const CARRO = Object.freeze({ w: 44, h: 64, y: 580 });
export const VELOCIDADE_LATERAL = 300;
export const META_ULTRAPASSAGENS = 30;
export const MARCOS = Object.freeze([5, 10, 15, 20, 25, 28, 29]);
export const MARGEM_COLISAO = 6;
export const FATOR_RIVAL = 0.45;
export const FATOR_RIVAL_AJUDA = 0.6;
export const RIVAIS_COM_AJUDA = 3;
export const BATIDAS_PARA_AJUDA = 2;
export const DURACAO_LENTIDAO = 2.0;
export const FATOR_LENTIDAO = 0.35;
export const DURACAO_RETOMADA = 0.6;
export const CAPACIDADE_TANQUE = 100;
export const CONSUMO_POR_SEGUNDO = 2.0;
export const LIMIAR_POSTO = 50;
export const LIMIAR_POUCA_GASOLINA = 25;
export const FATOR_RESERVA = 0.4;
export const ESPERA_APOS_POSTO_PERDIDO = 4.0;
export const ESPERA_POSTO_RESERVA = 1.5;
export const POSTOS_PERDIDOS_PARA_AJUDA = 2;
export const Y_NASCIMENTO_RIVAL = -70;
export const Y_NASCIMENTO_POSTO = -80;
export const Y_LIBERA_NOVO_RIVAL = 160;
export const Y_REMOVE_A_FRENTE = -400;
export const DURACAO_SAIDA = 0.5;
export const PRIMEIRO_RIVAL_APOS = 1.5;
export const ESPERA_LINHA_DE_CHEGADA = 1.0;
export const DURACAO_FREADA_FINAL = 1.5;
export const DT_MAXIMO = 0.05;
export const JANELA_DA_SETA = 300;
export const RIVAIS_DE_AQUECIMENTO = 3;
export const CORES_DOS_RIVAIS = Object.freeze(['#ef4444', '#eab308', '#22c55e', '#a855f7', '#f97316']);

// -----------------------------------------------------------------------------
// Dificuldade (opcional, usada pela Corrida 3D). 'facil' é o padrão e mantém o
// Grande Prêmio idêntico: mesmos números e mesma sequência de sorteios.
// -----------------------------------------------------------------------------

/** Rival com pisca-pisca: sinaliza, espera e então muda para a faixa vizinha. */
export const DURACAO_SINAL_TROCA = 0.6;
/** Tempo para cruzar uma faixa, qualquer que seja a largura (2, 3 ou 4 faixas). */
export const DURACAO_TROCA = 0.6;
/**
 * A troca começa com a frente do rival neste intervalo de y, logo depois de nascer.
 * No pior caso (2 faixas, difícil, nível 3) ela termina com a traseira do rival
 * ~240 px à frente do carro: mais de 1,2 s para reagir.
 */
export const GATILHO_TROCA = Object.freeze([-40, 40]);
/** Folga longitudinal exigida na faixa de destino, além do comprimento do carro. */
export const FOLGA_TROCA = 60;

/** Mancha de óleo: escorrega o carro para a faixa vizinha, sem batida nem lentidão. */
export const Y_NASCIMENTO_OLEO = -60;
export const ALTURA_OLEO = 34;
export const MARGEM_OLEO = 6;
export const INTERVALO_OLEO = Object.freeze([7, 11]);
/** Controles ignorados enquanto o carro escorrega até o centro da faixa vizinha. */
export const DURACAO_DERRAPAGEM = 0.6;
/** Óleo só nasce quando todos os rivais ativos já passaram desta linha. */
export const Y_LIBERA_OLEO = 250;

export const DIFICULDADES = Object.freeze({
  facil: Object.freeze({ nome: 'facil', fatorCruzeiro: 1, fatorIntervalo: 1, duplaExtra: 0, chanceTroca: 0, oleo: false }),
  medio: Object.freeze({ nome: 'medio', fatorCruzeiro: 1.12, fatorIntervalo: 0.85, duplaExtra: 0.1, chanceTroca: 0, oleo: false }),
  dificil: Object.freeze({ nome: 'dificil', fatorCruzeiro: 1.2, fatorIntervalo: 0.8, duplaExtra: 0.15, chanceTroca: 0.35, oleo: true }),
});

/** Tabela da seção 2.7, congelada. */
export const NIVEIS = Object.freeze([
  Object.freeze({ nome: 'aquecimento', ate: 2, cruzeiro: 190, intervalo: Object.freeze([3.6, 3.6]), chanceDupla: 0 }),
  Object.freeze({ nome: 'nivel-1', ate: 9, cruzeiro: 220, intervalo: Object.freeze([3.0, 3.6]), chanceDupla: 0 }),
  Object.freeze({ nome: 'nivel-2', ate: 19, cruzeiro: 255, intervalo: Object.freeze([2.5, 3.1]), chanceDupla: 0.2 }),
  Object.freeze({ nome: 'nivel-3', ate: 29, cruzeiro: 295, intervalo: Object.freeze([2.1, 2.7]), chanceDupla: 0.3 }),
]);

/** Folga para relógios acumulados em passos de 0,05 s (erro de ponto flutuante). */
const EPSILON = 1e-9;

// -----------------------------------------------------------------------------
// Auxiliares internos
// -----------------------------------------------------------------------------

function limitar(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
}

/** Chama o sorteador injetado e garante um número em [0, 1). */
function sortearSeguro(sortear) {
  const valor = typeof sortear === 'function' ? Number(sortear()) : 0;
  if (!Number.isFinite(valor)) return 0;
  return limitar(valor, 0, 0.999999999);
}

function escolher(lista, sortear) {
  return lista[Math.floor(sortearSeguro(sortear) * lista.length)];
}

/** Mesmo tamanho do posto da Corrida do Rael, proporcional à faixa. */
function dimensoesDoPosto(geometria) {
  const w = Math.min(64, Math.floor(geometria.larguraFaixa * 0.68));
  const h = Math.min(72, Math.floor(w * 1.2));
  return { w, h };
}

function faixaDoJogador(estado) {
  return faixaDoCarro(estado.carro.x, estado.carro.w, estado.geometria);
}

function rivalAtivo(rival) {
  return !rival.saindo && !rival.contado;
}

function marcarTodosSaindo(estado) {
  for (const rival of estado.rivais) rival.saindo = true;
}

function dificuldadeDe(estado) {
  return DIFICULDADES[estado.dificuldade] ?? DIFICULDADES.facil;
}

/** Nível da tabela com os fatores da dificuldade; no fácil é o próprio objeto congelado. */
function nivelAjustado(estado) {
  const base = nivelDaCorrida(estado.ultrapassagens);
  const dificuldade = dificuldadeDe(estado);
  if (dificuldade === DIFICULDADES.facil) return base;
  return {
    ...base,
    cruzeiro: base.cruzeiro * dificuldade.fatorCruzeiro,
    intervalo: base.intervalo.map((segundos) => segundos * dificuldade.fatorIntervalo),
    // O aquecimento continua com rivais sozinhos.
    chanceDupla: base === NIVEIS[0] ? 0 : base.chanceDupla + dificuldade.duplaExtra,
  };
}

/** Durante uma troca o rival ocupa as duas faixas; depois, só a nova. */
function ocupaFaixa(rival, faixa) {
  return rival.faixa === faixa || rival.faixaAnterior === faixa;
}

function sortearIntervalo(nivel, sortear) {
  const [minimo, maximo] = nivel.intervalo;
  if (maximo <= minimo) return minimo;
  return minimo + sortearSeguro(sortear) * (maximo - minimo);
}

// -----------------------------------------------------------------------------
// Funções puras públicas
// -----------------------------------------------------------------------------

/** Nível pelo número de ultrapassagens; inválido/negativo → aquecimento; ≥ 29 → nível 3. */
export function nivelDaCorrida(ultrapassagens) {
  const n = (typeof ultrapassagens === 'number' && Number.isFinite(ultrapassagens) && ultrapassagens > 0)
    ? ultrapassagens
    : 0;
  for (const nivel of NIVEIS) {
    if (n <= nivel.ate) return nivel;
  }
  return NIVEIS[NIVEIS.length - 1];
}

/**
 * Velocidade atual do jogador (px/s).
 * - tempoDesdeBatida < 2,0 → cruzeiro × 0,35
 * - 2,0 ≤ t < 2,6 → interpolação linear de 0,35 a 1,0
 * - reserva → no máximo cruzeiro × 0,40 (vale o menor dos dois limites)
 * Entradas inválidas nunca produzem NaN; sem batida, usar tempoDesdeBatida = null.
 */
export function velocidadeDoJogador({ cruzeiro, tempoDesdeBatida = null, reserva = false }) {
  const base = (Number.isFinite(cruzeiro) && cruzeiro > 0) ? cruzeiro : NIVEIS[0].cruzeiro;
  let fator = 1;
  if (typeof tempoDesdeBatida === 'number' && Number.isFinite(tempoDesdeBatida) && tempoDesdeBatida >= 0) {
    if (tempoDesdeBatida < DURACAO_LENTIDAO) {
      fator = FATOR_LENTIDAO;
    } else if (tempoDesdeBatida < DURACAO_LENTIDAO + DURACAO_RETOMADA) {
      const progresso = (tempoDesdeBatida - DURACAO_LENTIDAO) / DURACAO_RETOMADA;
      fator = FATOR_LENTIDAO + (1 - FATOR_LENTIDAO) * progresso;
    }
  }
  if (reserva === true) fator = Math.min(fator, FATOR_RESERVA);
  return base * fator;
}

/** Gasolina após dt; resultado sempre entre 0 e 100; dt inválido/negativo = 0. */
export function consumirGasolina({ nivel, dt, taxa = CONSUMO_POR_SEGUNDO }) {
  const atual = Number.isFinite(nivel) ? limitar(nivel, 0, CAPACIDADE_TANQUE) : 0;
  const passo = (Number.isFinite(dt) && dt > 0) ? dt : 0;
  const consumo = (Number.isFinite(taxa) && taxa >= 0) ? taxa : CONSUMO_POR_SEGUNDO;
  return limitar(atual - consumo * passo, 0, CAPACIDADE_TANQUE);
}

/**
 * Faixas do próximo nascimento: array de 1 ou 2 índices distintos, ordenados.
 * - 2 faixas: sempre 1 rival
 * - nunca ocupa todas as faixas
 * - dupla só se sortear() < chanceDupla e faixas >= 3
 * - nenhuma faixa aparece em 3 nascimentos seguidos (historico = últimos nascimentos)
 * - `forcarFaixa` (aquecimento, 1.º rival) tem prioridade e gera rival único
 */
export function sortearFaixasDosRivais({ faixas, chanceDupla, historico = [], sortear, forcarFaixa = null }) {
  const total = quantidadeDeFaixas(faixas);

  if (Number.isInteger(forcarFaixa) && forcarFaixa >= 0 && forcarFaixa < total) {
    return [forcarFaixa];
  }

  const todas = Array.from({ length: total }, (_, i) => i);
  const recentes = Array.isArray(historico) ? historico.slice(-2) : [];
  let candidatas = todas;
  if (recentes.length === 2) {
    const [penultimo, ultimo] = recentes.map((n) => (Array.isArray(n) ? n : []));
    candidatas = todas.filter((f) => !(penultimo.includes(f) && ultimo.includes(f)));
    if (candidatas.length === 0) candidatas = todas;
  }

  const chance = Number.isFinite(chanceDupla) ? chanceDupla : 0;
  const dupla = total >= 3 && candidatas.length >= 2 && sortearSeguro(sortear) < chance;

  const primeira = escolher(candidatas, sortear);
  if (!dupla) return [primeira];

  const restantes = candidatas.filter((f) => f !== primeira);
  const segunda = escolher(restantes, sortear);
  return [primeira, segunda].sort((a, b) => a - b);
}

/**
 * Faixa para um posto: só faixas sem rival (não saindo) com Y_NASCIMENTO_POSTO <= y <= carro.y.
 * Com `preferirFaixa`, devolve essa faixa se livre, senão a livre mais próxima dela
 * (empate → a menor). Sem preferência, sorteia entre as livres. Nenhuma livre → null.
 *
 * Um rival cuja borda de baixo ainda passa de Y_NASCIMENTO_POSTO também bloqueia: o posto
 * nasceria encostado nele.
 */
export function faixaParaPosto({ estado, preferirFaixa = null, sortear }) {
  const total = estado.faixas;
  const ocupadas = new Array(total).fill(false);
  for (const rival of estado.rivais) {
    if (rival.saindo) continue;
    if (rival.y + rival.h > Y_NASCIMENTO_POSTO && rival.y <= estado.carro.y) {
      ocupadas[rival.faixa] = true;
      if (Number.isInteger(rival.faixaAnterior)) ocupadas[rival.faixaAnterior] = true;
    }
  }
  // Posto e óleo nunca dividem a faixa: chegar ao posto não pode exigir escorregar.
  if (estado.oleo) ocupadas[estado.oleo.faixa] = true;
  const livres = [];
  for (let f = 0; f < total; f++) if (!ocupadas[f]) livres.push(f);
  if (livres.length === 0) return null;

  if (Number.isInteger(preferirFaixa) && preferirFaixa >= 0 && preferirFaixa < total) {
    let melhor = livres[0];
    for (const f of livres) {
      if (Math.abs(f - preferirFaixa) < Math.abs(melhor - preferirFaixa)) melhor = f;
    }
    return melhor;
  }
  return escolher(livres, sortear);
}

/**
 * Faixa sugerida pela seta verde, ou null. Só sugere se houver rival (não saindo) na faixa do
 * jogador com a borda de baixo entre carro.y - JANELA_DA_SETA e carro.y.
 *
 * Uma faixa candidata está livre quando nenhum rival ativo ocupa a janela à frente nem
 * está ao lado do carro.
 */
export function faixaSugerida(estado) {
  const { carro } = estado;
  const faixaAtual = faixaDoJogador(estado);
  const topoDaJanela = carro.y - JANELA_DA_SETA;

  const ameaca = estado.rivais.some((r) => rivalAtivo(r)
    && ocupaFaixa(r, faixaAtual)
    && r.y + r.h >= topoDaJanela
    && r.y + r.h <= carro.y);
  if (!ameaca) return null;

  const ocupadas = new Array(estado.faixas).fill(false);
  for (const r of estado.rivais) {
    if (!rivalAtivo(r)) continue;
    if (r.y + r.h >= topoDaJanela && r.y < carro.y + carro.h) {
      ocupadas[r.faixa] = true;
      if (Number.isInteger(r.faixaAnterior)) ocupadas[r.faixaAnterior] = true;
      // Quem está sinalizando vai ocupar a faixa de destino: a seta não aponta para lá.
      if (r.troca && r.troca.fase === 'sinalizando') ocupadas[r.troca.para] = true;
    }
  }
  if (estado.oleo && !estado.oleo.usado && estado.oleo.y + estado.oleo.h >= topoDaJanela
    && estado.oleo.y < carro.y + carro.h) ocupadas[estado.oleo.faixa] = true;

  const centro = (estado.faixas - 1) / 2;
  let melhor = null;
  for (let f = 0; f < estado.faixas; f++) {
    if (f === faixaAtual || ocupadas[f]) continue;
    if (melhor === null) { melhor = f; continue; }
    const distancia = Math.abs(f - faixaAtual);
    const distanciaMelhor = Math.abs(melhor - faixaAtual);
    if (distancia < distanciaMelhor
      || (distancia === distanciaMelhor && Math.abs(f - centro) < Math.abs(melhor - centro))) {
      melhor = f;
    }
  }
  return melhor;
}

/** Estado inicial (seção 3.5). Carro centralizado na faixa floor((faixas - 1) / 2). */
export function criarCorrida({ faixas = 3, dificuldade = 'facil' } = {}) {
  const total = quantidadeDeFaixas(faixas);
  const geometria = geometriaDaPista({ largura: LARGURA_CANVAS, margem: MARGEM_DA_PISTA, faixas: total });
  const faixaInicial = Math.floor((total - 1) / 2);

  return {
    fase: 'correndo',
    faixas: total,
    geometria,
    tempo: 0,
    distancia: 0,
    velocidade: NIVEIS[0].cruzeiro,
    carro: {
      x: centroDaFaixa(faixaInicial, geometria) - CARRO.w / 2,
      y: CARRO.y,
      w: CARRO.w,
      h: CARRO.h,
    },
    ultrapassagens: 0,
    abastecimentos: 0,
    batidas: 0,
    batidasSeguidas: 0,
    tempoDesdeBatida: null,
    rivaisComAjuda: 0,
    rivaisNascidos: 0,
    historicoDeFaixas: [],
    tempoAteProximoRival: PRIMEIRO_RIVAL_APOS,
    rivais: [],
    gasolina: CAPACIDADE_TANQUE,
    avisouPoucaGasolina: false,
    reserva: false,
    posto: null,
    postosNascidos: 0,
    postosPerdidosSeguidos: 0,
    tempoAteProximoPosto: 0,
    tempoAteLinha: null,
    linhaDeChegada: null,
    tempoDeFreada: 0,
    proximoId: 1,
    dificuldade: Object.hasOwn(DIFICULDADES, dificuldade) ? dificuldade : 'facil',
    oleo: null,
    oleosNascidos: 0,
    tempoAteProximoOleo: INTERVALO_OLEO[0],
    derrapagem: null,
    derrapagens: 0,
  };
}

// -----------------------------------------------------------------------------
// Passo da simulação
// -----------------------------------------------------------------------------

function rolarObjetos(estado, dt) {
  const v = estado.velocidade;
  estado.distancia += v * dt;
  for (const rival of estado.rivais) {
    rival.y += (v - rival.velocidade) * dt;
    if (rival.saindo) {
      rival.alfa -= dt / DURACAO_SAIDA;
      if (rival.alfa <= EPSILON) rival.alfa = 0;
    }
  }
  if (estado.posto) estado.posto.y += v * dt;
  if (estado.oleo) estado.oleo.y += v * dt;
  if (estado.linhaDeChegada) estado.linhaDeChegada.y += v * dt;
}

function removerRivaisForaDaPista(estado) {
  estado.rivais = estado.rivais.filter((r) => r.y <= ALTURA_CANVAS + 20
    && r.alfa > 0
    && r.y >= Y_REMOVE_A_FRENTE);
}

function espacoLivreParaRival(estado, nascimentoNormal) {
  if (estado.rivais.some((r) => r.y < Y_LIBERA_NOVO_RIVAL)) return false;
  // Rival de ajuda desce mais devagar: um normal nascido atrás o alcançaria.
  if (nascimentoNormal && estado.rivais.some((r) => r.comAjuda && rivalAtivo(r))) return false;
  // Posto recém-nascido ainda cobre a fileira onde o rival apareceria.
  if (estado.posto && estado.posto.y < Y_NASCIMENTO_RIVAL + CARRO.h) return false;
  // Óleo e rival na mesma fileira poderiam fechar todas as faixas.
  if (estado.oleo && estado.oleo.y < Y_LIBERA_NOVO_RIVAL) return false;
  return true;
}

function nascerRivais(estado, cruzeiro, sortear, eventos) {
  const comAjuda = estado.rivaisComAjuda > 0;
  if (!espacoLivreParaRival(estado, !comAjuda)) {
    estado.tempoAteProximoRival = 0;
    return;
  }

  const nivel = nivelAjustado(estado);
  const faixas = sortearFaixasDosRivais({
    faixas: estado.faixas,
    chanceDupla: nivel.chanceDupla,
    historico: estado.historicoDeFaixas,
    sortear,
    forcarFaixa: estado.rivaisNascidos === 0 ? faixaDoJogador(estado) : null,
  });

  const velocidade = cruzeiro * (comAjuda ? FATOR_RIVAL_AJUDA : FATOR_RIVAL);
  for (const faixa of faixas) {
    estado.rivais.push({
      id: estado.proximoId++,
      faixa,
      x: centroDaFaixa(faixa, estado.geometria) - CARRO.w / 2,
      y: Y_NASCIMENTO_RIVAL,
      w: CARRO.w,
      h: CARRO.h,
      velocidade,
      cor: escolher(CORES_DOS_RIVAIS, sortear),
      contado: false,
      saindo: false,
      alfa: 1,
      comAjuda,
    });
    estado.rivaisNascidos++;
  }
  if (comAjuda) estado.rivaisComAjuda--;
  sortearTroca(estado, faixas, comAjuda, sortear);

  estado.historicoDeFaixas = [...estado.historicoDeFaixas, faixas].slice(-2);
  estado.tempoAteProximoRival = sortearIntervalo(nivel, sortear);
  eventos.push({
    tipo: 'rival-apareceu',
    faixas,
    numero: estado.rivaisNascidos,
    aquecimento: estado.rivaisNascidos <= RIVAIS_DE_AQUECIMENTO,
  });
}

/**
 * Difícil: um rival sozinho (nunca dupla ou ajuda) pode ganhar uma troca para a faixa
 * vizinha, já desde o aquecimento. Só sorteia quando a dificuldade tem troca, para o
 * fácil manter a mesma sequência de sorteios.
 */
function sortearTroca(estado, faixas, comAjuda, sortear) {
  const { chanceTroca } = dificuldadeDe(estado);
  if (!(chanceTroca > 0) || faixas.length !== 1 || comAjuda) return;
  if (sortearSeguro(sortear) >= chanceTroca) return;
  const rival = estado.rivais[estado.rivais.length - 1];
  const vizinhas = [rival.faixa - 1, rival.faixa + 1].filter((f) => f >= 0 && f < estado.faixas);
  const [minimo, maximo] = GATILHO_TROCA;
  rival.troca = {
    para: escolher(vizinhas, sortear),
    gatilho: minimo + sortearSeguro(sortear) * (maximo - minimo),
    fase: 'aguardando',
    tempo: 0,
  };
}

/** A faixa de destino precisa estar livre de rival, posto e óleo perto da fileira do rival. */
function trocaLivre(estado, rival) {
  const { para } = rival.troca;
  const perto = (y, h) => y < rival.y + rival.h + FOLGA_TROCA && y + h > rival.y - FOLGA_TROCA;
  if (estado.rivais.some((r) => r !== rival && !r.saindo && ocupaFaixa(r, para) && perto(r.y, r.h))) return false;
  if (estado.posto && estado.posto.faixa === para && perto(estado.posto.y, estado.posto.h)) return false;
  if (estado.oleo && estado.oleo.faixa === para && perto(estado.oleo.y, estado.oleo.h)) return false;
  return true;
}

/** Pisca-pisca, espera e deslocamento lateral até o centro da faixa vizinha. */
function avancarTrocas(estado, passo, eventos) {
  for (const rival of estado.rivais) {
    const { troca } = rival;
    if (!troca || ['feita', 'cancelada', 'interrompida'].includes(troca.fase)) continue;
    // Reserva, meta, batida ou ultrapassagem: o rival para onde está e deixa de sinalizar.
    if (!rivalAtivo(rival)) {
      troca.fase = troca.fase === 'mudando' ? 'interrompida' : 'cancelada';
      continue;
    }
    if (troca.fase === 'aguardando') {
      if (rival.y < troca.gatilho) continue;
      if (!trocaLivre(estado, rival)) { troca.fase = 'cancelada'; continue; }
      troca.fase = 'sinalizando';
      troca.tempo = 0;
      eventos.push({ tipo: 'rival-sinalizou', rivalId: rival.id, de: rival.faixa, para: troca.para });
      continue;
    }
    if (troca.fase === 'sinalizando') {
      troca.tempo += passo;
      if (troca.tempo < DURACAO_SINAL_TROCA - EPSILON) continue;
      if (!trocaLivre(estado, rival)) { troca.fase = 'cancelada'; continue; }
      troca.fase = 'mudando';
      rival.faixaAnterior = rival.faixa;
      rival.faixa = troca.para;
      eventos.push({ tipo: 'rival-mudou-faixa', rivalId: rival.id, de: rival.faixaAnterior, para: troca.para });
    }
    const alvo = centroDaFaixa(troca.para, estado.geometria) - rival.w / 2;
    const deslocamento = estado.geometria.larguraFaixa / DURACAO_TROCA * passo;
    if (Math.abs(alvo - rival.x) <= deslocamento + EPSILON) {
      rival.x = alvo;
      troca.fase = 'feita';
      delete rival.faixaAnterior;
    } else {
      rival.x += Math.sign(alvo - rival.x) * deslocamento;
    }
  }
}

function dimensoesDoOleo(geometria) {
  return { w: Math.min(56, Math.floor(geometria.larguraFaixa * 0.62)), h: ALTURA_OLEO };
}

/** Difícil: uma mancha por vez, depois do aquecimento, numa faixa sem posto nem rival perto. */
function nascerOleo(estado, sortear, eventos) {
  const esperar = () => { estado.tempoAteProximoOleo = 0.5; };
  if (estado.rivais.some((r) => rivalAtivo(r) && r.y < Y_LIBERA_OLEO)) { esperar(); return; }
  const livres = [];
  for (let f = 0; f < estado.faixas; f++) {
    if (estado.posto && estado.posto.faixa === f) continue;
    livres.push(f);
  }
  if (livres.length === 0) { esperar(); return; }
  const faixa = escolher(livres, sortear);
  const { w, h } = dimensoesDoOleo(estado.geometria);
  estado.oleo = {
    faixa,
    x: centroDaFaixa(faixa, estado.geometria) - w / 2,
    y: Y_NASCIMENTO_OLEO,
    w,
    h,
    usado: false,
  };
  const primeiro = estado.oleosNascidos === 0;
  estado.oleosNascidos++;
  const [minimo, maximo] = INTERVALO_OLEO;
  estado.tempoAteProximoOleo = minimo + sortearSeguro(sortear) * (maximo - minimo);
  eventos.push({ tipo: 'oleo-apareceu', faixa, primeiro });
}

/**
 * Derrapagem: o carro escorrega até o centro de uma faixa vizinha sem rival ao lado.
 * Terminar no centro de uma faixa garante que o posto continue alcançável sem tocar.
 * Sem vizinha segura, o carro só fica sem controle no lugar (lado 0).
 */
function criarDerrapagem(estado, sortear) {
  const { carro, geometria } = estado;
  const atual = faixaDoJogador(estado);
  const seguros = [-1, 1].filter((lado) => {
    const faixa = atual + lado;
    if (faixa < 0 || faixa >= estado.faixas) return false;
    const x = centroDaFaixa(faixa, geometria) - carro.w / 2;
    const destino = { x, y: carro.y - 80, w: carro.w, h: carro.h + 160 };
    return !estado.rivais.some((r) => rivalAtivo(r) && retangulosSeSobrepoem(destino, r, 0));
  });
  const lado = seguros.length === 0 ? 0 : seguros.length === 1 ? seguros[0] : escolher(seguros, sortear);
  const alvoX = lado === 0 ? carro.x : centroDaFaixa(atual + lado, geometria) - carro.w / 2;
  return { tempo: 0, lado, alvoX };
}

function nascerPosto(estado, sortear, eventos) {
  const precisaAjuda = estado.reserva || estado.postosPerdidosSeguidos >= POSTOS_PERDIDOS_PARA_AJUDA;
  const preferir = precisaAjuda ? faixaDoJogador(estado) : null;
  const faixa = faixaParaPosto({ estado, preferirFaixa: preferir, sortear });
  if (faixa === null) {
    estado.tempoAteProximoPosto = 0.5;
    return;
  }

  const { w, h } = dimensoesDoPosto(estado.geometria);
  estado.posto = {
    faixa,
    x: centroDaFaixa(faixa, estado.geometria) - w / 2,
    y: Y_NASCIMENTO_POSTO,
    w,
    h,
    ajuda: preferir !== null,
  };
  const primeiro = estado.postosNascidos === 0;
  estado.postosNascidos++;
  eventos.push({ tipo: 'posto-apareceu', faixa, ajuda: preferir !== null, primeiro });
}

/**
 * Avança a simulação. MUTA `estado` e devolve a lista de eventos do passo (seção 3.6).
 * `direcao` é normalizada para -1, 0 ou 1; `dt` é limitado a [0, DT_MAXIMO].
 */
export function avancarCorrida(estado, { dt, direcao = 0 }, { sortear }) {
  /** @type {Array<Record<string, unknown>>} */
  const eventos = [];
  const passo = (Number.isFinite(dt) && dt > 0) ? Math.min(dt, DT_MAXIMO) : 0;

  // 1. Freada final: sem eventos, sem direção.
  if (estado.fase === 'fim') {
    estado.tempoDeFreada += passo;
    const base = velocidadeDoJogador({
      cruzeiro: nivelAjustado(estado).cruzeiro,
      tempoDesdeBatida: estado.tempoDesdeBatida,
      reserva: estado.reserva,
    });
    const restante = estado.tempoDeFreada >= DURACAO_FREADA_FINAL - EPSILON
      ? 0
      : 1 - estado.tempoDeFreada / DURACAO_FREADA_FINAL;
    estado.velocidade = base * restante;
    rolarObjetos(estado, passo);
    removerRivaisForaDaPista(estado);
    return eventos;
  }

  // 2. Tempo e imunidade.
  const faseInicial = estado.fase;
  let dir = 0;
  if (direcao > 0) dir = 1;
  else if (direcao < 0) dir = -1;
  estado.tempo += passo;
  if (estado.tempoDesdeBatida !== null) {
    estado.tempoDesdeBatida += passo;
    if (estado.tempoDesdeBatida >= DURACAO_LENTIDAO + DURACAO_RETOMADA - EPSILON) {
      estado.tempoDesdeBatida = null;
    }
  }

  // 3. Gasolina.
  if (estado.fase === 'correndo' && !estado.reserva) {
    estado.gasolina = consumirGasolina({ nivel: estado.gasolina, dt: passo });
    if (!estado.avisouPoucaGasolina && estado.gasolina <= LIMIAR_POUCA_GASOLINA) {
      estado.avisouPoucaGasolina = true;
      eventos.push({ tipo: 'pouca-gasolina' });
    }
    if (estado.gasolina <= 0) {
      estado.reserva = true;
      marcarTodosSaindo(estado);
      estado.tempoAteProximoPosto = ESPERA_POSTO_RESERVA;
      eventos.push({ tipo: 'reserva' });
    }
  }

  // 4. Velocidade.
  const cruzeiro = nivelAjustado(estado).cruzeiro;
  estado.velocidade = velocidadeDoJogador({
    cruzeiro,
    tempoDesdeBatida: estado.tempoDesdeBatida,
    reserva: estado.reserva,
  });

  // 5. Direção. Na derrapagem o carro escorrega de lado e a entrada é ignorada.
  const { carro, geometria } = estado;
  if (estado.derrapagem) {
    const derrapagem = estado.derrapagem;
    const deslocamento = geometria.larguraFaixa / DURACAO_DERRAPAGEM * passo;
    const falta = derrapagem.alvoX - carro.x;
    carro.x = Math.abs(falta) <= deslocamento ? derrapagem.alvoX : carro.x + Math.sign(falta) * deslocamento;
    derrapagem.tempo += passo;
    if (derrapagem.tempo >= DURACAO_DERRAPAGEM - EPSILON) estado.derrapagem = null;
  } else {
    carro.x = moverCarro({
      x: carro.x,
      direcao: dir,
      velocidade: VELOCIDADE_LATERAL,
      dt: passo,
      inicio: geometria.inicio,
      fim: geometria.fim,
      largura: carro.w,
    });
  }

  // 6. Rolagem e trocas de faixa dos rivais (só existem no difícil).
  rolarObjetos(estado, passo);
  avancarTrocas(estado, passo, eventos);

  // 7. Batida.
  if (estado.fase === 'correndo' && estado.tempoDesdeBatida === null) {
    const batido = estado.rivais.find((r) => rivalAtivo(r) && retangulosSeSobrepoem(carro, r, MARGEM_COLISAO));
    if (batido) {
      batido.saindo = true;
      estado.batidas++;
      estado.batidasSeguidas++;
      estado.tempoDesdeBatida = 0;
      eventos.push({ tipo: 'bateu', rivalId: batido.id, primeira: estado.batidas === 1 });
      if (estado.batidasSeguidas === BATIDAS_PARA_AJUDA) {
        estado.rivaisComAjuda = RIVAIS_COM_AJUDA;
        eventos.push({ tipo: 'ajuda-desvio' });
      }
    }
  }

  // 7b. Óleo: uma derrapagem por mancha, sem batida nem lentidão.
  if (estado.fase === 'correndo' && estado.oleo && !estado.oleo.usado && !estado.derrapagem
    && retangulosSeSobrepoem(carro, estado.oleo, MARGEM_OLEO)) {
    estado.oleo.usado = true;
    estado.derrapagens++;
    estado.derrapagem = criarDerrapagem(estado, sortear);
    eventos.push({ tipo: 'derrapou', lado: estado.derrapagem.lado, primeira: estado.derrapagens === 1 });
  }

  // 8. Posto.
  if (estado.fase === 'correndo' && estado.posto && retangulosSeSobrepoem(carro, estado.posto, 4)) {
    estado.gasolina = CAPACIDADE_TANQUE;
    estado.reserva = false;
    estado.avisouPoucaGasolina = false;
    estado.abastecimentos++;
    estado.postosPerdidosSeguidos = 0;
    estado.posto = null;
    estado.tempoAteProximoPosto = 0;
    eventos.push({ tipo: 'abasteceu', total: estado.abastecimentos });
  }

  // 9. Ultrapassagens.
  if (estado.fase === 'correndo') {
    for (const rival of estado.rivais) {
      if (!rivalAtivo(rival) || rival.y <= carro.y + carro.h) continue;
      rival.contado = true;
      estado.ultrapassagens++;
      estado.batidasSeguidas = 0;
      const total = estado.ultrapassagens;
      eventos.push({ tipo: 'ultrapassou', total });
      if (MARCOS.includes(total)) eventos.push({ tipo: 'marco', total });
      if (total === META_ULTRAPASSAGENS) {
        estado.fase = 'chegada';
        marcarTodosSaindo(estado);
        estado.posto = null;
        estado.oleo = null;
        estado.tempoAteLinha = ESPERA_LINHA_DE_CHEGADA;
        eventos.push({ tipo: 'meta' });
        break;
      }
    }
  }

  // 10. Limpeza.
  removerRivaisForaDaPista(estado);
  if (estado.posto && estado.posto.y > ALTURA_CANVAS) {
    estado.posto = null;
    estado.postosPerdidosSeguidos++;
    estado.tempoAteProximoPosto = estado.reserva ? ESPERA_POSTO_RESERVA : ESPERA_APOS_POSTO_PERDIDO;
    eventos.push({ tipo: 'posto-perdido' });
  }
  if (estado.oleo && estado.oleo.y > ALTURA_CANVAS) estado.oleo = null;

  // 11. Nascimento de rival.
  if (estado.fase === 'correndo' && !estado.reserva && estado.tempoDesdeBatida === null) {
    estado.tempoAteProximoRival -= passo;
    if (estado.tempoAteProximoRival <= EPSILON) nascerRivais(estado, cruzeiro, sortear, eventos);
  }

  // 12. Nascimento de posto.
  if (estado.fase === 'correndo' && !estado.posto && (estado.reserva || estado.gasolina <= LIMIAR_POSTO)) {
    estado.tempoAteProximoPosto -= passo;
    if (estado.tempoAteProximoPosto <= EPSILON) nascerPosto(estado, sortear, eventos);
  }

  // 12b. Nascimento de óleo (difícil, depois do aquecimento, fora da reserva).
  if (estado.fase === 'correndo' && dificuldadeDe(estado).oleo && !estado.reserva && !estado.oleo
    && estado.ultrapassagens >= RIVAIS_DE_AQUECIMENTO) {
    estado.tempoAteProximoOleo -= passo;
    if (estado.tempoAteProximoOleo <= EPSILON) nascerOleo(estado, sortear, eventos);
  }

  // 13. Chegada (o relógio da linha começa no passo seguinte ao da meta).
  if (faseInicial === 'chegada') {
    if (!estado.linhaDeChegada) {
      estado.tempoAteLinha -= passo;
      if (estado.tempoAteLinha <= EPSILON) {
        estado.tempoAteLinha = 0;
        estado.linhaDeChegada = { y: -40 };
      }
    }
    if (estado.linhaDeChegada && estado.linhaDeChegada.y >= carro.y) {
      estado.fase = 'fim';
      estado.tempoDeFreada = 0;
      eventos.push({ tipo: 'bandeirada' });
    }
  }

  return eventos;
}

/** { ultrapassagens, abastecimentos, terminou } — sem batidas (G05). */
export function resumoDaCorrida(estado) {
  return {
    ultrapassagens: estado.ultrapassagens,
    abastecimentos: estado.abastecimentos,
    terminou: estado.fase === 'fim',
  };
}
