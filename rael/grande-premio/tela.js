/**
 * Grande Prêmio do Rael — tela, Canvas, entrada e fluxo da corrida.
 * Derivado de Pixel Racer (https://github.com/Elomami1976/pixel-racer).
 * Copyright (c) 2026 Tarek Elomami — licença MIT. Cópia em LICENSE-pixel-racer.txt.
 *
 * Etapa 3 do PLANO-GRANDE-PREMIO-DO-RAEL.md: pista, rivais, posto, controles, loop e
 * batida. Os eventos do motor só tocam som; largada, narrador, ajudas, pausa e a
 * bandeirada completa entram nas etapas seguintes.
 */

import { montarCabecalho } from '../../shared/cabecalho.js';
import { tocar } from '../../shared/sons.js';
import { definirPreferencia, parar, preparar } from '../../shared/fala.js';
import { obterConfiguracoes } from '../../shared/descobertas.js';
import { quantidadeDeFaixas } from '../corrida-do-rael/jogo.js';

import {
  ALTURA_CANVAS,
  CAPACIDADE_TANQUE,
  DT_MAXIMO,
  DURACAO_LENTIDAO,
  LARGURA_CANVAS,
  LIMIAR_POSTO,
  LIMIAR_POUCA_GASOLINA,
  META_ULTRAPASSAGENS,
  avancarCorrida,
  criarCorrida,
} from './jogo.js';

export const FASES = Object.freeze({
  CONVITE: 'convite',
  LARGADA: 'largada',
  CORRIDA: 'corrida',
  PAUSA: 'pausa',
  BANDEIRADA: 'bandeirada',
  FIM: 'fim',
});

/** Sorteio da corrida, injetado no motor (seção 3.7). */
const sortear = Math.random;

const COR_DO_JOGADOR = '#0f5aa8';
const DURACAO_TREMIDA = 0.4;
const AMPLITUDE_TREMIDA = 4;
const PERIODO_PISCA = 0.5;           // 2 Hz: meio período translúcido, meio opaco
const DURACAO_MAIS_UM = 0.8;
const INTERVALO_FUMACA = 0.08;
const DURACAO_FUMACA = 0.6;

montarCabecalho('Grande Prêmio do Rael');

const $ = id => document.getElementById(id);

const telas = {
  convite: $('tela-convite'),
  corrida: $('tela-corrida'),
  fim: $('tela-fim'),
};

const canvas = /** @type {HTMLCanvasElement} */ ($('pista'));
const ctx = canvas.getContext('2d');

const btnComecar = /** @type {HTMLButtonElement} */ ($('comecar'));
const btnEsquerda = /** @type {HTMLButtonElement} */ ($('esquerda'));
const btnDireita = /** @type {HTMLButtonElement} */ ($('direita'));
const btnDeNovo = /** @type {HTMLButtonElement} */ ($('de-novo'));
const avisoVoz = $('aviso-voz');
const elUltrapassagens = $('ultrapassagens');
const elBarraUltrapassagens = $('barra-ultrapassagens');
const elContador = $('contador');
const elGasolina = $('gasolina');
const elBarraGasolina = $('barra-gasolina');

let faseDaTela = FASES.CONVITE;
let configuracoes = obterConfiguracoes();
definirPreferencia(configuracoes.voz);

/** Estado do motor. Antes da primeira corrida serve só para desenhar a pista parada. */
let estado = criarCorrida({ faixas: quantidadeDeFaixas(configuracoes.alternativas) });

// Efeitos decorativos da tela (não entram no motor).
let relogioDaTela = 0;
let inicioDaTremida = null;
let ultimaFumaca = 0;
/** @type {Array<{ x: number, y: number, idade: number, lado: number }>} */
let fumacas = [];
/** @type {Array<{ x: number, y: number, idade: number }>} */
let maisUns = [];
let categoriaDaGasolina = '';

// Controle de tempo e timers centrais
const timers = new Set();
let geracaoDaCorrida = 0;
let ultimoTempo = 0;

// Estado de entrada
const teclas = new Set();
const direcoesPorPonteiro = new Map();

// -----------------------------------------------------------------------------
// Timers centrais e utilidades
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
    if (el) el.hidden = chave !== nome;
  });
}

// -----------------------------------------------------------------------------
// Painel: ultrapassagens e gasolina (seção 2.14)
// -----------------------------------------------------------------------------

function atualizarUltrapassagens(total) {
  const n = Math.max(0, Math.min(META_ULTRAPASSAGENS, total));
  if (elBarraUltrapassagens) {
    elBarraUltrapassagens.style.width = `${(n / META_ULTRAPASSAGENS) * 100}%`;
  }
  if (elContador) elContador.textContent = `${n}/${META_ULTRAPASSAGENS}`;
  if (elUltrapassagens) {
    elUltrapassagens.setAttribute('aria-valuenow', String(n));
    elUltrapassagens.setAttribute('aria-label', `Carros ultrapassados: ${n} de ${META_ULTRAPASSAGENS}`);
  }
}

const CATEGORIAS_DA_GASOLINA = Object.freeze({
  cheia: { rotulo: 'Gasolina cheia', classe: '' },
  metade: { rotulo: 'Gasolina pela metade', classe: 'medidor__barra--metade' },
  pouca: { rotulo: 'Pouca gasolina', classe: 'medidor__barra--pouca' },
  sem: { rotulo: 'Sem gasolina', classe: 'medidor__barra--pouca' },
});

function categoriaDe(nivel, reserva) {
  if (reserva || nivel <= 0) return 'sem';
  if (nivel < LIMIAR_POUCA_GASOLINA) return 'pouca';
  if (nivel <= LIMIAR_POSTO) return 'metade';
  return 'cheia';
}

/** Largura a cada quadro; nome acessível e cor só quando a categoria muda. */
function atualizarGasolina(nivel, reserva = false) {
  const porcentagem = Math.max(0, Math.min(CAPACIDADE_TANQUE, nivel)) / CAPACIDADE_TANQUE * 100;
  if (elBarraGasolina) elBarraGasolina.style.width = `${porcentagem}%`;

  const categoria = categoriaDe(nivel, reserva);
  if (categoria === categoriaDaGasolina) return;
  categoriaDaGasolina = categoria;

  const { rotulo, classe } = CATEGORIAS_DA_GASOLINA[categoria];
  if (elGasolina) {
    elGasolina.setAttribute('aria-label', rotulo);
    elGasolina.setAttribute('aria-valuenow', String(Math.round(porcentagem)));
  }
  if (elBarraGasolina) {
    elBarraGasolina.classList.remove('medidor__barra--metade', 'medidor__barra--pouca');
    if (classe) elBarraGasolina.classList.add(classe);
  }
}

// -----------------------------------------------------------------------------
// Controle de entrada unificada (copiado da Corrida do Rael)
// -----------------------------------------------------------------------------

function zerarEntradas() {
  teclas.clear();
  direcoesPorPonteiro.clear();
}

function atualizarEstadoControles(habilitado) {
  for (const botao of [btnEsquerda, btnDireita]) {
    if (!botao) continue;
    botao.disabled = !habilitado;
    botao.setAttribute('aria-disabled', String(!habilitado));
  }
  if (!habilitado) zerarEntradas();
}

function entradaEstaAtiva() {
  return faseDaTela === FASES.CORRIDA;
}

function obterDirecaoDeEntrada() {
  if (!entradaEstaAtiva()) return 0;

  let dir = 0;
  if (teclas.has('arrowleft') || teclas.has('a')) dir -= 1;
  if (teclas.has('arrowright') || teclas.has('d')) dir += 1;
  for (const direcao of direcoesPorPonteiro.values()) dir += direcao;

  if (dir < 0) return -1;
  if (dir > 0) return 1;
  return 0;
}

function capturarDirecao(elemento, evento, direcao) {
  if (!entradaEstaAtiva()) return;
  evento.preventDefault();
  direcoesPorPonteiro.set(evento.pointerId, direcao);
  try {
    elemento.setPointerCapture?.(evento.pointerId);
  } catch {
    // O pointerup global ainda garante a limpeza em navegadores sem captura.
  }
}

function soltarDirecao(evento) {
  direcoesPorPonteiro.delete(evento.pointerId);
}

function ligarBotaoDirecional(botao, direcao) {
  if (!botao) return;
  botao.addEventListener('pointerdown', evento => capturarDirecao(botao, evento, direcao));
  botao.addEventListener('pointerup', soltarDirecao);
  botao.addEventListener('pointercancel', soltarDirecao);
  botao.addEventListener('lostpointercapture', soltarDirecao);
}

// Toque direto no Canvas (metade esquerda / direita)
function atualizarToqueCanvas(pointerId, clientX) {
  const rect = canvas.getBoundingClientRect();
  const meio = rect.left + rect.width / 2;
  direcoesPorPonteiro.set(pointerId, clientX < meio ? -1 : 1);
}

// -----------------------------------------------------------------------------
// Fluxo da corrida
// -----------------------------------------------------------------------------

function iniciarCorrida() {
  cancelarTimers();
  parar();
  geracaoDaCorrida += 1;

  // A quantidade de faixas é lida uma vez por corrida.
  configuracoes = obterConfiguracoes();
  definirPreferencia(configuracoes.voz);
  estado = criarCorrida({ faixas: quantidadeDeFaixas(configuracoes.alternativas) });

  relogioDaTela = 0;
  inicioDaTremida = null;
  ultimaFumaca = 0;
  fumacas = [];
  maisUns = [];
  categoriaDaGasolina = '';
  atualizarUltrapassagens(0);
  atualizarGasolina(estado.gasolina, estado.reserva);

  ultimoTempo = 0;
  zerarEntradas();
  mostrarTela('corrida');
  // Etapa 3: a corrida começa direto no toque; o semáforo entra na Etapa 4.
  faseDaTela = FASES.CORRIDA;
  atualizarEstadoControles(true);
}

/** Bandeirada provisória da Etapa 3: só troca para a tela final, sem registrar nada. */
function terminarCorrida() {
  faseDaTela = FASES.FIM;
  atualizarEstadoControles(false);
  mostrarTela('fim');
  if (btnDeNovo) {
    btnDeNovo.disabled = false;
    btnDeNovo.focus();
  }
}

function tratarEvento(evento) {
  switch (evento.tipo) {
    case 'ultrapassou':
      tocar('clique');
      atualizarUltrapassagens(evento.total);
      maisUns.push({
        x: estado.carro.x + estado.carro.w / 2,
        y: estado.carro.y - 8,
        idade: 0,
      });
      break;
    case 'bateu':
      tocar('erro');
      inicioDaTremida = relogioDaTela;
      ultimaFumaca = relogioDaTela - INTERVALO_FUMACA;
      break;
    case 'abasteceu':
      tocar('acerto');
      break;
    case 'bandeirada':
      terminarCorrida();
      break;
    default:
      // Falas e ajudas destes eventos entram na Etapa 4.
      break;
  }
}

// -----------------------------------------------------------------------------
// Registro único de ouvintes
// -----------------------------------------------------------------------------

btnComecar.addEventListener('click', async () => {
  if (faseDaTela !== FASES.CONVITE || btnComecar.disabled) return;
  tocar('clique');
  btnComecar.disabled = true;

  // Preparar a fala no toque é exigência do iOS.
  const diagnostico = await preparar();
  if (!diagnostico.sinteseDisponivel && !diagnostico.mudo && configuracoes.voz !== 'sem-fala') {
    if (avisoVoz) {
      avisoVoz.textContent = 'Um adulto pode ler as frases da tela.';
      avisoVoz.hidden = false;
    }
  }

  if (faseDaTela === FASES.CONVITE) iniciarCorrida();
  btnComecar.disabled = false;
});

if (btnDeNovo) {
  btnDeNovo.addEventListener('click', () => {
    if (faseDaTela !== FASES.FIM || btnDeNovo.disabled) return;
    btnDeNovo.disabled = true;
    iniciarCorrida();
  });
}

ligarBotaoDirecional(btnEsquerda, -1);
ligarBotaoDirecional(btnDireita, 1);

canvas.addEventListener('pointerdown', (e) => {
  if (!entradaEstaAtiva()) return;
  e.preventDefault();
  atualizarToqueCanvas(e.pointerId, e.clientX);
  try {
    canvas.setPointerCapture?.(e.pointerId);
  } catch {
    // O pointerup global ainda garante a limpeza em navegadores sem captura.
  }
});

canvas.addEventListener('pointermove', (e) => {
  if (direcoesPorPonteiro.has(e.pointerId)) {
    atualizarToqueCanvas(e.pointerId, e.clientX);
  }
});

canvas.addEventListener('pointerup', soltarDirecao);
canvas.addEventListener('pointercancel', soltarDirecao);
canvas.addEventListener('lostpointercapture', soltarDirecao);

function alvoUsaTecladoNativo(alvo) {
  return alvo instanceof Element && Boolean(alvo.closest('button, a, input, select, textarea'));
}

/** Espaço/Enter iniciam somente fora da corrida (convite e fim). */
function acionarAtalhoPrincipal() {
  if (faseDaTela === FASES.CONVITE && !btnComecar.disabled) {
    btnComecar.click();
    return true;
  }
  if (faseDaTela === FASES.FIM && btnDeNovo && !btnDeNovo.disabled) {
    btnDeNovo.click();
    return true;
  }
  return false;
}

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  const ehEspaco = e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar';
  if (ehEspaco || k === 'enter') {
    if (!e.repeat && !alvoUsaTecladoNativo(e.target) && acionarAtalhoPrincipal()) {
      e.preventDefault();
    }
    return;
  }

  if (k === 'arrowleft' || k === 'arrowright' || k === 'a' || k === 'd') {
    if (entradaEstaAtiva()) {
      e.preventDefault();
      teclas.add(k);
    }
  }
});

window.addEventListener('keyup', (e) => {
  teclas.delete(e.key.toLowerCase());
});

// Cancelamento global e limpeza
window.addEventListener('blur', zerarEntradas);
window.addEventListener('pointerup', soltarDirecao);
window.addEventListener('pointercancel', soltarDirecao);

document.addEventListener('visibilitychange', () => {
  zerarEntradas();
  ultimoTempo = 0;
});

window.addEventListener('pagehide', () => {
  cancelarTimers();
  parar();
});

// -----------------------------------------------------------------------------
// Rotinas de desenho em Canvas 2D
// -----------------------------------------------------------------------------

/** desenharPista da Corrida do Rael, com a rolagem vinda do motor e zebras nas bordas. */
function desenharPista() {
  const { inicio, fim, larguraFaixa, faixas } = estado.geometria;
  const deslocamento = estado.distancia % 80;

  // 1. Grama nas margens
  ctx.fillStyle = '#1e7b34';
  ctx.fillRect(0, 0, LARGURA_CANVAS, ALTURA_CANVAS);

  // 2. Asfalto dirigível
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(inicio, 0, fim - inicio, ALTURA_CANVAS);

  // 3. Zebras vermelho/branco por fora das linhas de acostamento, rolando com a pista
  const bloco = 20;
  const larguraZebra = 12;
  for (let y = -bloco * 2; y < ALTURA_CANVAS + bloco * 2; y += bloco) {
    const yDesenho = y + (estado.distancia % (bloco * 2));
    const indice = Math.round((y + bloco * 2) / bloco);
    ctx.fillStyle = indice % 2 === 0 ? '#dc2626' : '#ffffff';
    ctx.fillRect(inicio - 4 - larguraZebra, yDesenho, larguraZebra, bloco);
    ctx.fillRect(fim + 4, yDesenho, larguraZebra, bloco);
  }

  // 4. Linhas brancas de acostamento
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(inicio - 4, 0, 4, ALTURA_CANVAS);
  ctx.fillRect(fim, 0, 4, ALTURA_CANVAS);

  // 5. Divisórias tracejadas entre as faixas
  const tracejado = 40;
  const ciclo = tracejado * 2;
  for (let i = 1; i < faixas; i++) {
    const xDivisoria = inicio + i * larguraFaixa;
    for (let y = -ciclo; y < ALTURA_CANVAS + ciclo; y += ciclo) {
      const yDesenho = y + deslocamento;
      if (yDesenho + tracejado > 0 && yDesenho < ALTURA_CANVAS) {
        ctx.fillRect(xDivisoria - 2, yDesenho, 4, tracejado);
      }
    }
  }
}

/** Linha de chegada: quadriculado preto e branco de borda a borda, 2 fileiras de 12 px. */
function desenharLinhaDeChegada(linha) {
  const { inicio, fim } = estado.geometria;
  const lado = 12;
  ctx.save();
  for (let fileira = 0; fileira < 2; fileira++) {
    for (let coluna = 0, x = inicio; x < fim; coluna++, x += lado) {
      ctx.fillStyle = (coluna + fileira) % 2 === 0 ? '#ffffff' : '#0f172a';
      ctx.fillRect(x, linha.y + fileira * lado, Math.min(lado, fim - x), lado);
    }
  }
  ctx.restore();
}

/**
 * Desenha o posto de gasolina (base, bomba, visor e mangueira). Copiado da Corrida do Rael.
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
 * Desenha um carro visto de cima. O do Rael é azul com faixa branca central; os rivais
 * usam a cor sorteada pelo motor e não têm faixa, para diferir também pela forma.
 *
 * @param {{ x: number, y: number, w: number, h: number }} c
 * @param {{ cor: string, faixaCorrida?: string | null, alfa?: number, realceContorno?: boolean }} opcoes
 */
function desenharCarro(c, { cor, faixaCorrida = null, alfa = 1, realceContorno = false }) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alfa));

  // Realce de contorno para movimento reduzido
  if (realceContorno) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(c.x - 2, c.y - 2, c.w + 4, c.h + 4);
  }

  // Chassi
  ctx.fillStyle = cor;
  ctx.fillRect(c.x + 4, c.y, c.w - 8, c.h);

  // Faixa de corrida central (só o carro do Rael)
  if (faixaCorrida) {
    ctx.fillStyle = faixaCorrida;
    ctx.fillRect(c.x + c.w / 2 - 3, c.y + 1, 6, c.h - 2);
  }

  // Cabine (tom mais escuro da própria cor)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(c.x + 7, c.y + 12, c.w - 14, c.h - 26);

  // Pára-brisa dianteiro
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(c.x + 9, c.y + 16, c.w - 18, 9);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillRect(c.x + 12, c.y + 18, 6, 5);

  // Vidro traseiro
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(c.x + 10, c.y + c.h - 22, c.w - 20, 6);

  // 4 rodas pretas nas extremidades
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

function desenharJogador() {
  const reduzido = prefereMovimentoReduzido();
  const t = estado.tempoDesdeBatida;
  const imune = t !== null;

  let deslocamentoX = 0;
  if (!reduzido && inicioDaTremida !== null) {
    const decorrido = relogioDaTela - inicioDaTremida;
    if (decorrido < DURACAO_TREMIDA) {
      deslocamentoX = AMPLITUDE_TREMIDA * Math.sin(decorrido * Math.PI * 2 * 12);
    }
  }

  // Pisca a 2 Hz durante a imunidade; com movimento reduzido, só o contorno.
  let alfa = 1;
  if (imune && !reduzido && Math.floor(t / (PERIODO_PISCA / 2)) % 2 === 0) alfa = 0.45;

  ctx.save();
  ctx.translate(deslocamentoX, 0);
  desenharCarro(estado.carro, {
    cor: COR_DO_JOGADOR,
    faixaCorrida: '#ffffff',
    alfa,
    realceContorno: imune && reduzido,
  });
  ctx.restore();
}

function desenharFumacas() {
  ctx.save();
  for (const f of fumacas) {
    const progresso = f.idade / DURACAO_FUMACA;
    ctx.globalAlpha = 0.55 * (1 - progresso);
    ctx.fillStyle = '#9ca3af';
    ctx.beginPath();
    ctx.arc(f.x + f.lado * progresso * 10, f.y, 6 + progresso * 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function desenharMaisUns() {
  const reduzido = prefereMovimentoReduzido();
  ctx.save();
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#0f172a';
  ctx.fillStyle = '#fde047';
  for (const m of maisUns) {
    const progresso = m.idade / DURACAO_MAIS_UM;
    const y = reduzido ? m.y : m.y - progresso * 40;
    ctx.globalAlpha = 1 - progresso;
    ctx.strokeText('+1', m.x, y);
    ctx.fillText('+1', m.x, y);
  }
  ctx.restore();
}

// -----------------------------------------------------------------------------
// Loop do jogo
// -----------------------------------------------------------------------------

function atualizarEfeitos(dt) {
  relogioDaTela += dt;

  maisUns = maisUns.filter(m => (m.idade += dt) < DURACAO_MAIS_UM);

  for (const f of fumacas) {
    f.idade += dt;
    f.y += estado.velocidade * dt * 0.5;
  }
  fumacas = fumacas.filter(f => f.idade < DURACAO_FUMACA);

  // Fumacinha cinza enquanto dura a lentidão da batida (2 s).
  const t = estado.tempoDesdeBatida;
  if (t !== null && t < DURACAO_LENTIDAO && !prefereMovimentoReduzido() &&
      relogioDaTela - ultimaFumaca >= INTERVALO_FUMACA) {
    ultimaFumaca = relogioDaTela;
    const { carro } = estado;
    fumacas.push({
      x: carro.x + carro.w / 2,
      y: carro.y + carro.h,
      idade: 0,
      lado: fumacas.length % 2 === 0 ? -1 : 1,
    });
  }
}

function atualizar(dt) {
  if (faseDaTela !== FASES.CORRIDA) return;

  const eventos = avancarCorrida(estado, { dt, direcao: obterDirecaoDeEntrada() }, { sortear });
  atualizarEfeitos(dt);
  atualizarGasolina(estado.gasolina, estado.reserva);
  for (const evento of eventos) {
    tratarEvento(evento);
    if (faseDaTela !== FASES.CORRIDA) break;
  }
}

function renderizar() {
  ctx.clearRect(0, 0, LARGURA_CANVAS, ALTURA_CANVAS);

  // Grama, pista, zebras e faixas
  desenharPista();

  if (estado.linhaDeChegada) desenharLinhaDeChegada(estado.linhaDeChegada);
  if (estado.posto) desenharPosto(estado.posto);
  // Seta verde: entra na Etapa 4 (condição de aquecimento e ajuda).

  for (const rival of estado.rivais) {
    desenharCarro(rival, { cor: rival.cor, alfa: rival.alfa });
  }

  desenharJogador();
  desenharFumacas();
  desenharMaisUns();
}

function loopDoJogo(timestamp) {
  if (ultimoTempo === 0) ultimoTempo = timestamp;
  const dt = Math.max(0, Math.min(DT_MAXIMO, (timestamp - ultimoTempo) / 1000));
  ultimoTempo = timestamp;

  atualizar(dt);
  renderizar();

  requestAnimationFrame(loopDoJogo);
}

// Único RAF do ciclo de vida da página.
requestAnimationFrame(loopDoJogo);
