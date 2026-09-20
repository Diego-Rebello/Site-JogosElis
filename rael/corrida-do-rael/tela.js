/**
 * Corrida do Rael — Renderização, entrada, fala e fluxo da rodada.
 * Derivado de cálculos e rotinas de Canvas do Pixel Racer sob licença MIT.
 * Cópia da licença em LICENSE-pixel-racer.txt.
 */

import { montarCabecalho } from '../../shared/cabecalho.js';
import { tocar } from '../../shared/sons.js';
import {
  definirPreferencia,
  falarSequencia,
  modoAcompanhado,
  parar,
  preparar,
  repetir as repetirFala,
} from '../../shared/fala.js';
import { obterConfiguracoes } from '../../shared/descobertas.js';
import { criarSessao } from '../../shared/rodada.js';
import {
  ALTURA_CANVAS,
  LARGURA_CANVAS,
  QUANTIDADE_DE_TRECHOS,
  VELOCIDADE_DA_PISTA,
  VELOCIDADE_DO_CARRO,
  centroDaFaixa,
  faixaDoCarro,
  geometriaDaPista,
  montarTrechos,
  moverCarro,
  progressoDoTanque,
  quantidadeDeFaixas,
  resultadoDoEncontro,
  retangulosSeSobrepoem,
} from './jogo.js';

export const FASES = Object.freeze({
  CONVITE: 'convite',
  PREPARANDO: 'preparando',
  DEMO: 'demo',
  JOGANDO: 'jogando',
  RETORNO: 'retorno',
  AJUDA: 'ajuda',
  FIM: 'fim',
});

montarCabecalho('Corrida do Rael');

const $ = id => document.getElementById(id);

const telas = {
  convite: $('tela-convite'),
  demonstracao: $('tela-demonstracao'),
  brincadeira: $('tela-brincadeira'),
  fim: $('tela-fim'),
};

const canvas = /** @type {HTMLCanvasElement} */ ($('pista'));
const ctx = canvas.getContext('2d');

const btnEsquerda = /** @type {HTMLButtonElement} */ ($('esquerda'));
const btnDireita = /** @type {HTMLButtonElement} */ ($('direita'));
const btnComecar = $('comecar');
const btnDemoContinuar = $('demonstracao-continuar');
const btnRepetir = $('repetir');
const btnDeNovo = $('de-novo');
const elementoInstrucao = $('instrucao');
const elementoRetorno = $('retorno');
const elementoRoteiro = $('roteiro');
const elementoRoteiroFala = $('roteiro-fala');
const elTanque = $('tanque');
const elTanqueFim = $('tanque-fim');
const textoFim = $('texto-fim');

let faseAtual = FASES.CONVITE;

// Configuração e geometria da pista
let configuracoes = obterConfiguracoes();
definirPreferencia(configuracoes.voz);
let faixasConfiguradas = quantidadeDeFaixas(configuracoes.alternativas);
let geometria = geometriaDaPista({ faixas: faixasConfiguradas });

// Estado do jogador
const carro = {
  x: 200 - 22,
  y: 580,
  w: 44,
  h: 64,
  angulo: 0,
  realceContorno: false,
};

// Sessão e trechos
let sessao = null;
let trechos = [];
let trechoAtual = null;
let encontroAtual = null;
let deslocamentoPista = 0;
let faixaDestaque = null;

// Animações especiais
let animacaoRodopio = null;
let animacaoAjuda = null;

// Controle de tempo, timers centrais e fala
const timers = new Set();
let geracaoDaRodada = 0;
let ultimaFalaTexto = '';
let lastTime = 0;

// Estado de entrada
const teclas = new Set();
let btnEsquerdaAtivo = false;
let btnDireitaAtivo = false;
let canvasToqueLado = 0;

// -----------------------------------------------------------------------------
// Inicialização do indicador do Tanque no DOM (Seção 6, requisito 14)
// -----------------------------------------------------------------------------

if (elTanque) {
  elTanque.innerHTML = Array.from({ length: QUANTIDADE_DE_TRECHOS }, () =>
    '<div class="tanque-segmento"></div>',
  ).join('');
  elTanque.setAttribute('aria-label', 'Tanque: 0 de 6 abastecimentos');
}

function atualizarTanque(concluidos) {
  const seguros = progressoDoTanque(concluidos, QUANTIDADE_DE_TRECHOS);
  if (elTanque) {
    const segmentos = elTanque.querySelectorAll('.tanque-segmento');
    segmentos.forEach((seg, i) => {
      seg.classList.toggle('tanque-segmento--cheio', i < seguros);
    });
    elTanque.setAttribute('aria-label', `Tanque: ${seguros} de ${QUANTIDADE_DE_TRECHOS} abastecimentos`);
  }
}

// -----------------------------------------------------------------------------
// Gerenciador de Timers Centrais (Seção 2.6)
// -----------------------------------------------------------------------------

function agendar(callback, delayMs) {
  const timer = setTimeout(() => {
    timers.delete(timer);
    callback();
  }, delayMs);
  timers.add(timer);
  return timer;
}

function cancelarTimers() {
  timers.forEach(t => clearTimeout(t));
  timers.clear();
}

function prefereMovimentoReduzido() {
  return typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function mostrarTela(nome) {
  Object.entries(telas).forEach(([chave, el]) => {
    if (el) {
      el.hidden = chave !== nome;
    }
  });
}

// -----------------------------------------------------------------------------
// Fala e Acessibilidade (Seção 2.6 e 2.8)
// -----------------------------------------------------------------------------

async function falarTexto(texto, { textoVisual, aoComecar } = {}) {
  parar();
  const minhaGeracao = geracaoDaRodada;
  ultimaFalaTexto = texto;

  if (elementoRoteiroFala) {
    elementoRoteiroFala.textContent = textoVisual || texto;
  }
  if (elementoRoteiro) {
    elementoRoteiro.hidden = !modoAcompanhado();
  }

  const res = await falarSequencia([{ texto }], { aoComecar });
  if (minhaGeracao !== geracaoDaRodada) return 'cancelado';
  return res[0] || 'sem-fala';
}

// -----------------------------------------------------------------------------
// Controle de Entrada Unificada (Seção 2.2)
// -----------------------------------------------------------------------------

function zerarEntradas() {
  teclas.clear();
  btnEsquerdaAtivo = false;
  btnDireitaAtivo = false;
  canvasToqueLado = 0;
}

function atualizarEstadoControles(habilitado) {
  if (btnEsquerda) {
    btnEsquerda.disabled = !habilitado;
    btnEsquerda.setAttribute('aria-disabled', String(!habilitado));
  }
  if (btnDireita) {
    btnDireita.disabled = !habilitado;
    btnDireita.setAttribute('aria-disabled', String(!habilitado));
  }
  if (!habilitado) {
    zerarEntradas();
  }
}

function obterDirecaoDeEntrada() {
  if (faseAtual !== FASES.DEMO && faseAtual !== FASES.JOGANDO) {
    return 0;
  }

  let dir = 0;
  if (teclas.has('arrowleft') || teclas.has('a') || btnEsquerdaAtivo) {
    dir -= 1;
  }
  if (teclas.has('arrowright') || teclas.has('d') || btnDireitaAtivo) {
    dir += 1;
  }
  dir += canvasToqueLado;

  if (dir < 0) return -1;
  if (dir > 0) return 1;
  return 0;
}

// -----------------------------------------------------------------------------
// Criação de Encontro
// -----------------------------------------------------------------------------

function criarEncontro(trecho, geom) {
  const wPosto = Math.min(64, Math.floor(geom.larguraFaixa * 0.68));
  const hPosto = Math.min(72, Math.floor(wPosto * 1.2));
  const xPostoCentro = centroDaFaixa(trecho.postoFaixa, geom);
  const xPosto = Math.round(xPostoCentro - wPosto / 2);

  const wOleo = Math.min(68, Math.floor(geom.larguraFaixa * 0.70));
  const hOleo = Math.min(30, Math.floor(wOleo * 0.45));
  const xOleoCentro = centroDaFaixa(trecho.oleoFaixa, geom);
  const xOleo = Math.round(xOleoCentro - wOleo / 2);

  const yInicial = -90;

  return {
    trechoId: trecho.id,
    y: yInicial,
    posto: { x: xPosto, y: yInicial, w: wPosto, h: hPosto },
    oleo: { x: xOleo, y: yInicial + (hPosto - hOleo) / 2, w: wOleo, h: hOleo },
    resolvido: false,
  };
}

// -----------------------------------------------------------------------------
// Demonstração Inicial (Seção 6, requisito 2 e 10)
// Ordem: CONVITE -> PREPARANDO -> DEMO -> JOGANDO
// -----------------------------------------------------------------------------

async function iniciarDemonstracao() {
  faseAtual = FASES.PREPARANDO;
  cancelarTimers();
  parar();
  geracaoDaRodada += 1;

  configuracoes = obterConfiguracoes();
  definirPreferencia(configuracoes.voz);
  faixasConfiguradas = quantidadeDeFaixas(configuracoes.alternativas);
  geometria = geometriaDaPista({ faixas: faixasConfiguradas });

  await preparar();

  faseAtual = FASES.DEMO;
  mostrarTela('brincadeira');
  atualizarTanque(0);

  carro.x = 200 - carro.w / 2;
  carro.y = 580;
  carro.angulo = 0;
  carro.realceContorno = false;
  zerarEntradas();
  atualizarEstadoControles(true);

  // Na demonstração: posto na faixa adjacente, sem poça de óleo
  const faixaCentro = faixaDoCarro(carro.x, carro.w, geometria);
  const faixaDemo = (faixaCentro + 1 < geometria.faixas) ? faixaCentro + 1 : Math.max(0, faixaCentro - 1);
  faixaDestaque = faixaDemo;

  const wPosto = Math.min(64, Math.floor(geometria.larguraFaixa * 0.68));
  const hPosto = Math.min(72, Math.floor(wPosto * 1.2));
  const xPostoCentro = centroDaFaixa(faixaDemo, geometria);
  const xPosto = Math.round(xPostoCentro - wPosto / 2);
  const yInicial = -90;

  encontroAtual = {
    trechoId: 'demo',
    y: yInicial,
    posto: { x: xPosto, y: yInicial, w: wPosto, h: hPosto },
    oleo: null,
    resolvido: false,
  };

  if (elementoInstrucao) {
    elementoInstrucao.textContent = 'Use as setas. Leve o carrinho até o posto.';
  }
  if (elementoRetorno) {
    elementoRetorno.textContent = '';
  }

  falarTexto('Use as setas. Leve o carrinho até o posto.');
}

// -----------------------------------------------------------------------------
// Início da Rodada de 6 Trechos (FASES.JOGANDO)
// -----------------------------------------------------------------------------

function iniciarRodadaPrincipal() {
  faseAtual = FASES.JOGANDO;
  faixaDestaque = null;
  atualizarTanque(0);

  trechos = montarTrechos({ faixas: faixasConfiguradas, quantidade: QUANTIDADE_DE_TRECHOS });
  sessao = criarSessao({ desafios: trechos, tentativasAteDemonstrar: 2 });

  carro.x = 200 - carro.w / 2;
  carro.y = 580;
  carro.angulo = 0;
  carro.realceContorno = false;
  zerarEntradas();
  atualizarEstadoControles(true);

  if (elementoInstrucao) {
    elementoInstrucao.textContent = 'Leve o carrinho até o posto.';
  }
  if (elementoRetorno) {
    elementoRetorno.textContent = '';
  }

  falarTexto('Agora é sua vez. Vá até o posto!', {
    textoVisual: 'Leve o carrinho até o posto.',
  });

  const estadoSessao = sessao.estado();
  trechoAtual = estadoSessao.desafio;
  encontroAtual = criarEncontro(trechoAtual, geometria);
}

// -----------------------------------------------------------------------------
// Tratamento dos Resultados (Seção 6, requisitos 3, 4, 9)
// -----------------------------------------------------------------------------

async function tratarResultado(resultado) {
  if (resultado === 'posto') {
    faseAtual = FASES.RETORNO;
    atualizarEstadoControles(false);
    tocar('acerto');

    sessao.responder('posto');
    const concluidos = sessao.estado().indice + 1;
    atualizarTanque(concluidos);

    if (elementoRetorno) {
      elementoRetorno.textContent = 'Abasteceu!';
    }

    await falarTexto('Abasteceu!');

    agendar(() => {
      sessao.avancar();
      const novoEstado = sessao.estado();
      if (novoEstado.fase === 'fim') {
        finalizarRodada();
      } else {
        prepararProximoTrecho();
      }
    }, 900);
  } else if (resultado === 'oleo') {
    tocar('clique');
    const resp = sessao.responder('oleo');

    if (resp.fase === 'demonstrando') {
      // 2ª tentativa sem posto -> Dispara ajuda guiada
      iniciarAjuda();
    } else {
      // 1ª tentativa sem posto -> Rodopio e repete o mesmo trecho
      faseAtual = FASES.RETORNO;
      atualizarEstadoControles(false);

      if (elementoRetorno) {
        elementoRetorno.textContent = 'O carrinho rodopiou! Vamos de novo!';
      }
      falarTexto('O carrinho rodopiou! Vamos de novo!');

      executarRodopio(() => {
        reiniciarMesmoTrecho();
      });
    }
  } else if (resultado === 'passou') {
    tocar('clique');
    const resp = sessao.responder('passou');

    if (resp.fase === 'demonstrando') {
      // 2ª tentativa sem posto -> Dispara ajuda guiada
      iniciarAjuda();
    } else {
      // 1ª tentativa sem posto -> Repete o mesmo trecho (sem rodopio)
      faseAtual = FASES.RETORNO;
      atualizarEstadoControles(false);

      if (elementoRetorno) {
        elementoRetorno.textContent = 'O posto ficou ali. Vamos de novo!';
      }

      falarTexto('O posto ficou ali. Vamos de novo!').then(() => {
        agendar(() => {
          reiniciarMesmoTrecho();
        }, 500);
      });
    }
  }
}

function executarRodopio(aoTerminar) {
  const reduzido = prefereMovimentoReduzido();
  const duracao = 700;
  const t0 = performance.now();

  animacaoRodopio = {
    t0,
    duracao,
    reduzido,
    aoTerminar,
  };
}

function reiniciarMesmoTrecho() {
  if (!trechoAtual) return;
  // Mesmas faixas preservadas para o mesmo trecho
  encontroAtual = criarEncontro(trechoAtual, geometria);
  encontroAtual.resolvido = false;

  carro.angulo = 0;
  carro.realceContorno = false;

  if (elementoInstrucao) {
    elementoInstrucao.textContent = 'Leve o carrinho até o posto.';
  }
  if (elementoRetorno) {
    elementoRetorno.textContent = '';
  }

  faseAtual = FASES.JOGANDO;
  atualizarEstadoControles(true);
}

async function iniciarAjuda() {
  faseAtual = FASES.AJUDA;
  atualizarEstadoControles(false);

  if (elementoInstrucao) {
    elementoInstrucao.textContent = 'Olhe o caminho brilhando. O carrinho vai até o posto.';
  }
  if (elementoRetorno) {
    elementoRetorno.textContent = '';
  }

  falarTexto('Olhe o caminho brilhando. O carrinho vai até o posto.');

  // Faixa correta brilha por pelo menos 900 ms
  faixaDestaque = trechoAtual.postoFaixa;
  const alvoX = Math.round(centroDaFaixa(trechoAtual.postoFaixa, geometria) - carro.w / 2);

  // Remove óleo para não atrapalhar a condução assistida
  if (encontroAtual) {
    encontroAtual.oleo = null;
    encontroAtual.resolvido = false;
  }

  // 1. Destaque prévio por pelo menos 900 ms (critério A4.7)
  await new Promise(resolve => agendar(resolve, 950));

  // 2. Condução suave do carro a <= 140 px/s
  animacaoAjuda = {
    alvoX,
    velocidade: 120,
    concluido: false,
  };
}

async function concluirAjuda() {
  tocar('acerto');
  faseAtual = FASES.RETORNO;
  animacaoAjuda = null;

  // Conclusão com ajuda incrementa o tanque (+1)
  const concluidos = sessao.estado().indice + 1;
  atualizarTanque(concluidos);

  if (elementoRetorno) {
    elementoRetorno.textContent = 'Abasteceu!';
  }

  await falarTexto('Abasteceu!');

  agendar(() => {
    faixaDestaque = null;
    sessao.avancar();
    const novoEstado = sessao.estado();
    if (novoEstado.fase === 'fim') {
      finalizarRodada();
    } else {
      prepararProximoTrecho();
    }
  }, 900);
}

function prepararProximoTrecho() {
  const estadoSessao = sessao.estado();
  trechoAtual = estadoSessao.desafio;
  encontroAtual = criarEncontro(trechoAtual, geometria);
  faixaDestaque = null;

  carro.angulo = 0;
  carro.realceContorno = false;

  if (elementoInstrucao) {
    elementoInstrucao.textContent = 'Leve o carrinho até o posto.';
  }
  if (elementoRetorno) {
    elementoRetorno.textContent = '';
  }

  faseAtual = FASES.JOGANDO;
  atualizarEstadoControles(true);
}

function finalizarRodada() {
  faseAtual = FASES.FIM;
  atualizarEstadoControles(false);
  faixaDestaque = null;

  mostrarTela('fim');

  if (elTanqueFim) {
    elTanqueFim.innerHTML = Array.from({ length: QUANTIDADE_DE_TRECHOS }, () =>
      '<div class="tanque-segmento tanque-segmento--cheio"></div>',
    ).join('');
    elTanqueFim.setAttribute('aria-label', 'Tanque cheio: 6 de 6 abastecimentos');
  }

  if (textoFim) {
    const nome = configuracoes.nome ? configuracoes.nome.trim().split(/\s+/)[0] : 'piloto';
    textoFim.textContent = `Tanque cheio! Muito bem, ${nome}!`;
  }
}

// -----------------------------------------------------------------------------
// Registro único de ouvintes de eventos (Seção 6, requisito 10)
// -----------------------------------------------------------------------------

if (btnComecar) {
  btnComecar.addEventListener('click', () => {
    if (faseAtual === FASES.CONVITE) {
      iniciarDemonstracao();
    }
  });
}

if (btnDemoContinuar) {
  btnDemoContinuar.addEventListener('click', () => {
    iniciarRodadaPrincipal();
  });
}

if (btnRepetir) {
  btnRepetir.addEventListener('click', () => {
    if (ultimaFalaTexto) {
      if (elementoRoteiroFala) {
        elementoRoteiroFala.textContent = ultimaFalaTexto;
      }
      if (elementoRoteiro) {
        elementoRoteiro.hidden = !modoAcompanhado();
      }
      repetirFala();
    }
  });
}

if (btnDeNovo) {
  btnDeNovo.addEventListener('click', () => {
    iniciarDemonstracao();
  });
}

// Botões direcionais visíveis
if (btnEsquerda) {
  btnEsquerda.addEventListener('pointerdown', () => {
    if (faseAtual === FASES.DEMO || faseAtual === FASES.JOGANDO) {
      btnEsquerdaAtivo = true;
    }
  });
  btnEsquerda.addEventListener('pointerup', () => {
    btnEsquerdaAtivo = false;
  });
  btnEsquerda.addEventListener('pointercancel', () => {
    btnEsquerdaAtivo = false;
  });
}

if (btnDireita) {
  btnDireita.addEventListener('pointerdown', () => {
    if (faseAtual === FASES.DEMO || faseAtual === FASES.JOGANDO) {
      btnDireitaAtivo = true;
    }
  });
  btnDireita.addEventListener('pointerup', () => {
    btnDireitaAtivo = false;
  });
  btnDireita.addEventListener('pointercancel', () => {
    btnDireitaAtivo = false;
  });
}

// Toque direto no Canvas (metade esquerda / direita) com coordenadas lógicas
function atualizarToqueCanvas(clientX) {
  const rect = canvas.getBoundingClientRect();
  const midX = rect.left + rect.width / 2;
  canvasToqueLado = clientX < midX ? -1 : 1;
}

canvas.addEventListener('pointerdown', (e) => {
  if (faseAtual === FASES.DEMO || faseAtual === FASES.JOGANDO) {
    atualizarToqueCanvas(e.clientX);
  }
});

canvas.addEventListener('pointermove', (e) => {
  if (canvasToqueLado !== 0) {
    atualizarToqueCanvas(e.clientX);
  }
});

canvas.addEventListener('pointerup', () => {
  canvasToqueLado = 0;
});

canvas.addEventListener('pointercancel', () => {
  canvasToqueLado = 0;
});

// Teclado (setas e A/D)
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === 'arrowleft' || k === 'arrowright' || k === 'a' || k === 'd') {
    if (faseAtual === FASES.DEMO || faseAtual === FASES.JOGANDO) {
      e.preventDefault();
    }
    teclas.add(k);
  }
});

window.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  teclas.delete(k);
});

// Cancelamento global e limpeza
window.addEventListener('blur', zerarEntradas);
window.addEventListener('pointercancel', zerarEntradas);

document.addEventListener('visibilitychange', () => {
  zerarEntradas();
  lastTime = 0;
});

window.addEventListener('pagehide', () => {
  cancelarTimers();
  parar();
});

// -----------------------------------------------------------------------------
// Rotinas de desenho em Canvas 2D
// -----------------------------------------------------------------------------

function desenharPista() {
  const { inicio, fim, larguraFaixa, faixas } = geometria;

  // 1. Fundo com grama nas margens
  ctx.fillStyle = '#1e7b34';
  ctx.fillRect(0, 0, LARGURA_CANVAS, ALTURA_CANVAS);

  // 2. Superfície de asfalto dirigível
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(inicio, 0, fim - inicio, ALTURA_CANVAS);

  // Destaque visual da faixa (demonstração ou ajuda)
  if (faixaDestaque !== null && faixaDestaque >= 0 && faixaDestaque < faixas) {
    const xFaixa = inicio + faixaDestaque * larguraFaixa;
    ctx.save();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.fillRect(xFaixa, 0, larguraFaixa, ALTURA_CANVAS);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(xFaixa + 2, 0, larguraFaixa - 4, ALTURA_CANVAS);
    ctx.restore();
  }

  // 3. Linhas brancas de acostamento
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(inicio - 4, 0, 4, ALTURA_CANVAS);
  ctx.fillRect(fim, 0, 4, ALTURA_CANVAS);

  // 4. Divisórias tracejadas entre as faixas
  const dashHeight = 40;
  const gapHeight = 40;
  const dashCycle = dashHeight + gapHeight;

  ctx.fillStyle = '#ffffff';
  for (let i = 1; i < faixas; i++) {
    const xDivisoria = inicio + i * larguraFaixa;
    for (let y = -dashCycle; y < ALTURA_CANVAS + dashCycle; y += dashCycle) {
      const drawY = y + deslocamentoPista;
      if (drawY + dashHeight > 0 && drawY < ALTURA_CANVAS) {
        ctx.fillRect(xDivisoria - 2, drawY, 4, dashHeight);
      }
    }
  }
}

/**
 * Desenha o posto de gasolina (base, bomba, visor e mangueira).
 *
 * @param {{ x: number, y: number, w: number, h: number }} posto
 */
function desenharPosto(posto) {
  ctx.save();

  // Faixa verde de aproximação no chão da pista
  ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
  ctx.fillRect(posto.x - 4, posto.y + posto.h - 8, posto.w + 8, 14);

  // Base da bomba
  ctx.fillStyle = '#166534';
  ctx.fillRect(posto.x + 2, posto.y + posto.h - 12, posto.w - 4, 12);

  // Corpo da bomba (amarelo)
  ctx.fillStyle = '#facc15';
  ctx.fillRect(posto.x + 6, posto.y + 12, posto.w - 12, posto.h - 24);

  // Teto da bomba (verde)
  ctx.fillStyle = '#15803d';
  ctx.fillRect(posto.x + 4, posto.y + 4, posto.w - 8, 10);

  // Visor digital
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(posto.x + 12, posto.y + 18, posto.w - 24, 16);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(posto.x + 16, posto.y + 22, posto.w - 32, 8);

  // Mangueira lateral com bico injetor
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(posto.x + posto.w - 6, posto.y + 24);
  ctx.bezierCurveTo(
    posto.x + posto.w + 6,
    posto.y + 36,
    posto.x + posto.w + 6,
    posto.y + 48,
    posto.x + posto.w - 4,
    posto.y + 54,
  );
  ctx.stroke();

  // Bico
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(posto.x + posto.w - 5, posto.y + 48, 5, 8);

  ctx.restore();
}

/**
 * Desenha a poça de óleo (elipse escura, reflexo e pequenas gotas).
 *
 * @param {{ x: number, y: number, w: number, h: number }} oleo
 */
function desenharOleo(oleo) {
  ctx.save();

  const cx = oleo.x + oleo.w / 2;
  const cy = oleo.y + oleo.h / 2;

  // Poça principal escura
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.ellipse(cx, cy, oleo.w / 2, oleo.h / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Brilho azulado na superfície
  ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.beginPath();
  ctx.ellipse(cx - 3, cy - 2, oleo.w / 3.2, oleo.h / 3.5, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Gotas adicionais próximas
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.arc(oleo.x - 4, cy + 2, 3, 0, Math.PI * 2);
  ctx.arc(oleo.x + oleo.w + 4, cy - 2, 2.5, 0, Math.PI * 2);
  ctx.arc(cx + 8, oleo.y + oleo.h + 3, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Desenha o carro do Rael com cores, vidros, faróis e rodas.
 *
 * @param {{ x: number, y: number, w: number, h: number, angulo?: number, realceContorno?: boolean }} c
 */
function desenharCarro(c) {
  ctx.save();

  if (c.angulo && c.angulo !== 0) {
    const cx = c.x + c.w / 2;
    const cy = c.y + c.h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(c.angulo);
    ctx.translate(-cx, -cy);
  }

  // Realce de contorno para movimento reduzido / retorno
  if (c.realceContorno) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(c.x - 2, c.y - 2, c.w + 4, c.h + 4);
  }

  // Chassi azul do Rael
  ctx.fillStyle = '#0f5aa8';
  ctx.fillRect(c.x + 4, c.y, c.w - 8, c.h);

  // Faixas esportivas azuis claras
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(c.x + 8, c.y + 2, 3, c.h - 4);
  ctx.fillRect(c.x + c.w - 11, c.y + 2, 3, c.h - 4);

  // Cabine
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(c.x + 7, c.y + 12, c.w - 14, c.h - 26);

  // Pára-brisa dianteiro
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(c.x + 9, c.y + 16, c.w - 18, 9);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillRect(c.x + 12, c.y + 18, 6, 5);

  // Vidro traseiro
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(c.x + 10, c.y + c.h - 22, c.w - 20, 6);

  // 4 Rodas pretas nas extremidades
  ctx.fillStyle = '#09090b';
  ctx.fillRect(c.x, c.y + 8, 4, 12);
  ctx.fillRect(c.x + c.w - 4, c.y + 8, 4, 12);
  ctx.fillRect(c.x, c.y + c.h - 20, 4, 12);
  ctx.fillRect(c.x + c.w - 4, c.y + c.h - 20, 4, 12);

  // Faróis dianteiros amarelos
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(c.x + 5, c.y + 2, 6, 4);
  ctx.fillRect(c.x + c.w - 11, c.y + 2, 6, 4);

  // Lanternas traseiras vermelhas
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(c.x + 6, c.y + c.h - 3, 5, 3);
  ctx.fillRect(c.x + c.w - 11, c.y + c.h - 3, 5, 3);

  ctx.restore();
}

// -----------------------------------------------------------------------------
// Loop do Jogo (Seção 6, requisitos 7 e 11)
// -----------------------------------------------------------------------------

function atualizar(dt) {
  // 1. Atualização da animação de rodopio (quando ativa)
  if (animacaoRodopio) {
    const decorrido = performance.now() - animacaoRodopio.t0;
    const progresso = Math.min(1, decorrido / animacaoRodopio.duracao);

    if (animacaoRodopio.reduzido) {
      carro.angulo = 0;
      carro.realceContorno = true;
    } else {
      carro.angulo = progresso * Math.PI * 2;
      carro.realceContorno = false;
    }

    if (progresso >= 1) {
      carro.angulo = 0;
      carro.realceContorno = false;
      const cb = animacaoRodopio.aoTerminar;
      animacaoRodopio = null;
      cb?.();
    }
  }

  // 2. Atualização em DEMO
  if (faseAtual === FASES.DEMO) {
    const dir = obterDirecaoDeEntrada();
    if (dir !== 0) {
      carro.x = moverCarro({
        x: carro.x,
        direcao: dir,
        velocidade: VELOCIDADE_DO_CARRO,
        dt,
        inicio: geometria.inicio,
        fim: geometria.fim,
        largura: carro.w,
      });
    } else if (faixaDestaque !== null && encontroAtual && encontroAtual.y > 100) {
      // Guia suavemente para a faixa do posto se nenhuma tecla estiver pressionada
      const centroAlvo = centroDaFaixa(faixaDestaque, geometria) - carro.w / 2;
      const diff = centroAlvo - carro.x;
      if (Math.abs(diff) > 2) {
        carro.x += Math.sign(diff) * Math.min(Math.abs(diff), 120 * dt);
      }
    }

    deslocamentoPista = (deslocamentoPista + VELOCIDADE_DA_PISTA * dt) % 80;

    if (encontroAtual && !encontroAtual.resolvido) {
      encontroAtual.y += VELOCIDADE_DA_PISTA * dt;
      encontroAtual.posto.y = Math.round(encontroAtual.y);

      if (retangulosSeSobrepoem(carro, encontroAtual.posto, 4)) {
        encontroAtual.resolvido = true;
        tocar('acerto');
        if (elementoRetorno) {
          elementoRetorno.textContent = 'Muito bem!';
        }
        agendar(() => {
          iniciarRodadaPrincipal();
        }, 900);
      } else if (encontroAtual.posto.y > carro.y + carro.h) {
        // Se ultrapassou na demo, reinicia o posto no topo
        encontroAtual.y = -90;
        encontroAtual.posto.y = -90;
      }
    }
  }

  // 3. Atualização em JOGANDO
  if (faseAtual === FASES.JOGANDO) {
    const dir = obterDirecaoDeEntrada();
    carro.x = moverCarro({
      x: carro.x,
      direcao: dir,
      velocidade: VELOCIDADE_DO_CARRO,
      dt,
      inicio: geometria.inicio,
      fim: geometria.fim,
      largura: carro.w,
    });

    deslocamentoPista = (deslocamentoPista + VELOCIDADE_DA_PISTA * dt) % 80;

    if (encontroAtual && !encontroAtual.resolvido) {
      encontroAtual.y += VELOCIDADE_DA_PISTA * dt;
      encontroAtual.posto.y = Math.round(encontroAtual.y);
      if (encontroAtual.oleo) {
        encontroAtual.oleo.y = Math.round(encontroAtual.y + (encontroAtual.posto.h - encontroAtual.oleo.h) / 2);
      }

      const oleoPassou = encontroAtual.oleo ? (encontroAtual.oleo.y > carro.y + carro.h) : true;
      const postoPassou = encontroAtual.posto.y > carro.y + carro.h;
      const itensPassaram = postoPassou && oleoPassou;

      const resultado = resultadoDoEncontro({
        carro,
        posto: encontroAtual.posto,
        oleo: encontroAtual.oleo,
        itensPassaram,
      });

      if (resultado !== null) {
        encontroAtual.resolvido = true;
        tratarResultado(resultado);
      }
    }
  }

  // 4. Atualização em AJUDA (movimento assistido a <= 140 px/s)
  if (faseAtual === FASES.AJUDA) {
    deslocamentoPista = (deslocamentoPista + VELOCIDADE_DA_PISTA * dt) % 80;

    if (animacaoAjuda && !animacaoAjuda.concluido) {
      const diff = animacaoAjuda.alvoX - carro.x;
      if (Math.abs(diff) > 1) {
        const passo = Math.sign(diff) * Math.min(Math.abs(diff), animacaoAjuda.velocidade * dt);
        carro.x += passo;
      } else {
        carro.x = animacaoAjuda.alvoX;
        animacaoAjuda.concluido = true;

        if (encontroAtual) {
          encontroAtual.y = -90;
          encontroAtual.posto.y = -90;
          encontroAtual.posto.x = Math.round(centroDaFaixa(trechoAtual.postoFaixa, geometria) - encontroAtual.posto.w / 2);
          encontroAtual.oleo = null;
          encontroAtual.resolvido = false;
        }
      }
    } else if (animacaoAjuda && animacaoAjuda.concluido && encontroAtual && !encontroAtual.resolvido) {
      encontroAtual.y += VELOCIDADE_DA_PISTA * dt;
      encontroAtual.posto.y = Math.round(encontroAtual.y);

      if (retangulosSeSobrepoem(carro, encontroAtual.posto, 4)) {
        encontroAtual.resolvido = true;
        concluirAjuda();
      }
    }
  }
}

function renderizar() {
  ctx.clearRect(0, 0, LARGURA_CANVAS, ALTURA_CANVAS);

  // 1. Fundo, pista, destaque de faixa e divisórias
  desenharPista();

  // 2. Elementos do encontro (posto e óleo)
  if (encontroAtual && (faseAtual === FASES.DEMO || faseAtual === FASES.JOGANDO || faseAtual === FASES.AJUDA || faseAtual === FASES.RETORNO)) {
    if (encontroAtual.posto) {
      desenharPosto(encontroAtual.posto);
    }
    if (encontroAtual.oleo) {
      desenharOleo(encontroAtual.oleo);
    }
  }

  // 3. Carro do jogador
  desenharCarro(carro);
}

function loopDoJogo(timestamp) {
  if (lastTime === 0) {
    lastTime = timestamp;
  }
  let dt = (timestamp - lastTime) / 1000;
  if (dt > 0.05) dt = 0.05;
  lastTime = timestamp;

  atualizar(dt);
  renderizar();

  requestAnimationFrame(loopDoJogo);
}

// Inicia o único RAF do ciclo de vida da página
requestAnimationFrame(loopDoJogo);

// Helpers públicos para teste/inspeção de conformidade
export function obterFaseAtual() {
  return faseAtual;
}

export function obterSessao() {
  return sessao;
}

export function obterCarro() {
  return { ...carro };
}

export function obterEncontroAtual() {
  return encontroAtual ? { ...encontroAtual } : null;
}
