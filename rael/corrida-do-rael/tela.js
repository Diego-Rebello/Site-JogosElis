/**
 * Corrida do Rael — Renderização, entrada e loop do jogo.
 * Derivado de cálculos e rotinas de Canvas do Pixel Racer sob licença MIT.
 * Cópia da licença em LICENSE-pixel-racer.txt.
 */

import { montarCabecalho } from '../../shared/cabecalho.js';
import { definirPreferencia, preparar } from '../../shared/fala.js';
import { obterConfiguracoes } from '../../shared/descobertas.js';
import {
  ALTURA_CANVAS,
  LARGURA_CANVAS,
  QUANTIDADE_DE_TRECHOS,
  VELOCIDADE_DA_PISTA,
  VELOCIDADE_DO_CARRO,
  centroDaFaixa,
  geometriaDaPista,
  montarTrechos,
  moverCarro,
  quantidadeDeFaixas,
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

const btnEsquerda = $('esquerda');
const btnDireita = $('direita');
const btnComecar = $('comecar');
const btnDemoContinuar = $('demonstracao-continuar');
const elementoInstrucao = $('instrucao');
const elementoRetorno = $('retorno');

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
};

// Trechos e encontro atual
let trechos = [];
let indiceTrecho = 0;
let encontroAtual = null;
let deslocamentoPista = 0;

// Estado de entrada
const teclas = new Set();
let btnEsquerdaAtivo = false;
let btnDireitaAtivo = false;
let canvasToqueLado = 0;

// Controle de tempo e animação
let lastTime = 0;

function mostrarTela(nome) {
  Object.entries(telas).forEach(([chave, el]) => {
    if (el) {
      el.hidden = chave !== nome;
    }
  });
}

/**
 * Cria o encontro (posto e óleo) para o trecho fornecido.
 *
 * @param {{ id: string, postoFaixa: number, oleoFaixa: number }} trecho
 * @param {ReturnType<typeof geometriaDaPista>} geom
 */
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

/**
 * Inicia a rodada configurando faixas, trechos e estado do carro.
 */
function iniciarRodada() {
  configuracoes = obterConfiguracoes();
  faixasConfiguradas = quantidadeDeFaixas(configuracoes.alternativas);
  geometria = geometriaDaPista({ faixas: faixasConfiguradas });

  trechos = montarTrechos({ faixas: faixasConfiguradas, quantidade: QUANTIDADE_DE_TRECHOS });
  indiceTrecho = 0;
  encontroAtual = trechos.length > 0 ? criarEncontro(trechos[0], geometria) : null;

  carro.x = 200 - carro.w / 2;
  carro.y = 580;
  carro.angulo = 0;
  deslocamentoPista = 0;

  faseAtual = FASES.JOGANDO;
  mostrarTela('brincadeira');

  if (elementoInstrucao) {
    elementoInstrucao.textContent = 'Leve o carrinho até o posto.';
  }
  if (elementoRetorno) {
    elementoRetorno.textContent = '';
  }
}

/**
 * Zera todas as entradas ativas para evitar movimento residual.
 */
function zerarEntradas() {
  teclas.clear();
  btnEsquerdaAtivo = false;
  btnDireitaAtivo = false;
  canvasToqueLado = 0;
}

/**
 * Calcula a direção horizontal combinada de todas as fontes de entrada.
 * Retorna -1 (esquerda), 1 (direita) ou 0 (parado / cancelamento).
 */
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
// Registro único de ouvintes de eventos (Seção 6, requisito 10)
// -----------------------------------------------------------------------------

if (btnComecar) {
  btnComecar.addEventListener('click', async () => {
    await preparar();
    iniciarRodada();
  });
}

if (btnDemoContinuar) {
  btnDemoContinuar.addEventListener('click', () => {
    iniciarRodada();
  });
}

// Botões direcionais visíveis
if (btnEsquerda) {
  btnEsquerda.addEventListener('pointerdown', () => {
    btnEsquerdaAtivo = true;
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
    btnDireitaAtivo = true;
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

// Cancelamento global
window.addEventListener('blur', zerarEntradas);
window.addEventListener('pointercancel', zerarEntradas);

document.addEventListener('visibilitychange', () => {
  zerarEntradas();
  lastTime = 0;
});

// -----------------------------------------------------------------------------
// Rotinas de desenho em Canvas 2D
// -----------------------------------------------------------------------------

function desenharPista() {
  const { inicio, fim, larguraFaixa, faixas } = geometria;

  // Fundo com grama nas margens
  ctx.fillStyle = '#1e7b34';
  ctx.fillRect(0, 0, LARGURA_CANVAS, ALTURA_CANVAS);

  // Superfície de asfalto dirigível
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(inicio, 0, fim - inicio, ALTURA_CANVAS);

  // Linhas brancas de acostamento
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(inicio - 4, 0, 4, ALTURA_CANVAS);
  ctx.fillRect(fim, 0, 4, ALTURA_CANVAS);

  // Divisórias tracejadas entre as faixas
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
 * @param {{ x: number, y: number, w: number, h: number, angulo?: number }} c
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
  if (faseAtual === FASES.DEMO || faseAtual === FASES.JOGANDO) {
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

    if (encontroAtual) {
      encontroAtual.y += VELOCIDADE_DA_PISTA * dt;
      encontroAtual.posto.y = Math.round(encontroAtual.y);
      encontroAtual.oleo.y = Math.round(encontroAtual.y + (encontroAtual.posto.h - encontroAtual.oleo.h) / 2);

      // Ao ultrapassar a tela, prepara o próximo trecho
      if (encontroAtual.y > ALTURA_CANVAS + 60) {
        indiceTrecho = (indiceTrecho + 1) % trechos.length;
        encontroAtual = criarEncontro(trechos[indiceTrecho], geometria);
      }
    }
  }
}

function renderizar() {
  ctx.clearRect(0, 0, LARGURA_CANVAS, ALTURA_CANVAS);

  // 1. Fundo, pista e divisórias
  desenharPista();

  // 2. Elementos do encontro (posto e óleo)
  if (encontroAtual && (faseAtual === FASES.DEMO || faseAtual === FASES.JOGANDO)) {
    desenharPosto(encontroAtual.posto);
    desenharOleo(encontroAtual.oleo);
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
