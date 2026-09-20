/**
 * Chute a Gol — tela.
 *
 * Portado do ani.js de https://github.com/hackingstar124/Football-game-in-HTML
 * (hackingstar124, Apache 2.0; copia da licenca em
 * LICENSE-Football-game-in-HTML.txt). Os nomes do original foram mantidos:
 * striker, football, goalpost, goalkeeper, goalMessage, moveStriker,
 * moveFootball, shootBall, checkGoal, displayGoalMessage, e as teclas A, D e L.
 *
 * O que mudou:
 * - os caminhos `F:\Penalty\...` viraram caminhos relativos (o original nao
 *   rodava fora da maquina do autor);
 * - o setInterval do goleiro lia `footballPos`, que nunca foi declarado ali, e
 *   quebrava a cada 25 ms; agora o goleiro vai e volta pela boca do gol, que e
 *   o que a animacao goalkeeperMove fazia na pratica;
 * - checkGoal so olhava o travessao; agora o goleiro defende de verdade;
 * - alem do teclado, da para jogar no toque (botoes ◀ CHUTAR ▶), porque o jogo
 *   roda no tablet;
 * - sao 5 penaltis, com placar, fala e a figurinha do album no fim.
 */
import { montarCabecalho } from '../../shared/cabecalho.js';
import { tocar } from '../../shared/sons.js';
import { lancarConfete } from '../../shared/confete.js';
import {
  definirPreferencia,
  falarSequencia,
  limpar,
  parar,
  preparar,
} from '../../shared/fala.js';
import { obterConfiguracoes, registrarRodada } from '../../shared/descobertas.js';
import { anunciarConquistas } from '../../shared/conquistas-tela.js';
import { caminhoDaFigura, figura, nomeComArtigo } from '../../shared/catalogo-figuras.js';
import {
  DURACAO_DO_CHUTE,
  PASSO_ANGULO,
  QUANTIDADE_DE_CHUTES,
  ajustarAngulo,
  calcularImpactoNoGol,
  ehTrave,
  mensagemDoResultado,
  moverGoleiro,
  resultadoDoChute,
  velocidadeDoGoleiro,
} from './jogo.js';

const $ = id => document.getElementById(id);

// Elementos da interface
const field = $('field');
const striker = $('striker');
const football = $('football');
const goalpost = $('goalpost');
const goalkeeper = $('goalkeeper');
const goalMessage = $('goal-message');
const mascote = $('mascote-furacao');
const guiaMira = $('guia-mira');
const miraLinha = $('mira-linha');
const miraAlvo = $('mira-alvo');

const telas = {
  convite: $('tela-convite'),
  brincadeira: $('tela-brincadeira'),
  fim: $('tela-fim'),
};

const configuracoes = obterConfiguracoes();
definirPreferencia(configuracoes.voz);
montarCabecalho('Chute a Gol');

let chute = 0;
let gols = 0;
let chutando = false;
let jogando = false;
let goleiroDir = 1;
let animacaoGoleiro = 0;
let anguloMira = 0;
let goleiroPausa = 0;
let framesSemFinta = 0;
let velocidadeExtra = 1;

function mostrarTela(nome) {
  Object.entries(telas).forEach(([chave, el]) => {
    if (el) el.hidden = chave !== nome;
  });
}

function dizer(itens, opcoes) {
  return falarSequencia(Array.isArray(itens) ? itens : [{ texto: itens }], opcoes);
}

/** Posicao horizontal de um elemento, como no original: parseInt do computed left. */
function posicaoDe(elemento) {
  return parseInt(getComputedStyle(elemento).left, 10) || 0;
}

/** Boca do gol: o centro e largura, mais a espessura da trave lateral (12% da largura). */
function medidasDoGol() {
  const centro = posicaoDe(goalpost);
  const largura = goalpost.clientWidth;
  const traveLargura = Math.round(largura * 0.12);
  return {
    centro,
    largura,
    traveLargura,
    inicio: centro - largura * 0.5,
    fim: centro + largura * 0.5,
  };
}

// --- Mira angular e linha tracejada ---

function atualizarGuiaMira() {
  if (!field) return;
  const origemX = field.clientWidth * 0.5;
  const origemY = field.clientHeight - 64;
  const goalY = field.clientWidth <= 480 ? 128 : 136;
  const distanciaY = Math.max(10, origemY - goalY);
  const impactoX = calcularImpactoNoGol({ origemX, distanciaY, anguloGraus: anguloMira });

  if (guiaMira && miraLinha && miraAlvo) {
    miraLinha.setAttribute('x1', `${origemX}`);
    miraLinha.setAttribute('y1', `${origemY}`);
    miraLinha.setAttribute('x2', `${impactoX}`);
    miraLinha.setAttribute('y2', `${goalY}`);

    miraAlvo.setAttribute('cx', `${impactoX}`);
    miraAlvo.setAttribute('cy', `${goalY}`);
    guiaMira.style.opacity = '1';
  }

  if (striker) {
    striker.style.setProperty('--inclinacao-batedor', `${anguloMira * 0.45}deg`);
  }
}

function mirar(delta) {
  if (chutando || !jogando) return;
  anguloMira = ajustarAngulo(anguloMira, delta);
  atualizarGuiaMira();
  tocar('clique');
}

// --- shootBall / checkGoal / displayGoalMessage ---

function shootBall() {
  if (chutando || !jogando) return;
  chutando = true;

  if (guiaMira) guiaMira.style.opacity = '0';

  const origemX = field.clientWidth * 0.5;
  const origemY = field.clientHeight - 64;
  const goalY = field.clientWidth <= 480 ? 128 : 136;
  const distanciaY = Math.max(10, origemY - goalY);
  const impactoX = calcularImpactoNoGol({ origemX, distanciaY, anguloGraus: anguloMira });
  const deltaX = impactoX - origemX;

  football.style.setProperty('--chute-x', `${deltaX}px`);
  football.style.setProperty('--distancia-chute', `${-distanciaY}px`);

  striker.classList.add('chutando');
  football.classList.add('chutando');
  tocar('clique');

  setTimeout(() => {
    striker.classList.remove('chutando');
    checkGoal(impactoX);
  }, DURACAO_DO_CHUTE);
}

function checkGoal(impactoX) {
  const { centro, largura, traveLargura } = medidasDoGol();
  const resultado = resultadoDoChute({
    footballPos: impactoX,
    goalpostPos: centro,
    goalpostLargura: largura,
    goalkeeperPos: posicaoDe(goalkeeper),
    goalkeeperLargura: goalkeeper.clientWidth,
    traveLargura,
  });

  pararGoleiro();

  if (resultado === 'gol') {
    gols++;
    tocar('acerto');
    lancarConfete();
    if (mascote) {
      mascote.classList.add('comemorando');
      setTimeout(() => mascote.classList.remove('comemorando'), 1800);
    }
  } else {
    tocar('clique');
    if (resultado === 'defesa') {
      goalkeeper.classList.add('pegou');
      setTimeout(() => goalkeeper.classList.remove('pegou'), 500);
    } else if (resultado === 'trave') {
      goalpost.classList.add('tremeu');
      setTimeout(() => goalpost.classList.remove('tremeu'), 500);
    }
  }

  pintarPlacar();
  displayGoalMessage(mensagemDoResultado(resultado));
  dizer([{ texto: mensagemDoResultado(resultado) }]);

  setTimeout(proximoChute, 1600);
}

function displayGoalMessage(message) {
  goalMessage.textContent = message;
  setTimeout(() => {
    goalMessage.textContent = '';
  }, 2000);
}

// --- Vaivem do goleiro (com fintas e paradinhas imprevisíveis) ---

function animarGoleiro() {
  const { inicio, fim, traveLargura } = medidasDoGol();
  const meia = goalkeeper.clientWidth * 0.5;
  const margem = (traveLargura || 16) + 4;
  const limiteMin = inicio + margem + meia;
  const limiteMax = fim - margem - meia;
  const posAtual = posicaoDe(goalkeeper);

  // Se estiver em paradinha / hesitação de leitura
  if (goleiroPausa > 0) {
    goleiroPausa--;
    animacaoGoleiro = requestAnimationFrame(animarGoleiro);
    return;
  }

  framesSemFinta++;

  // Comportamento dinâmico e imprevisível na área central do gol
  const larguraBoca = Math.max(10, limiteMax - limiteMin);
  const distCentro = Math.abs(posAtual - (limiteMin + limiteMax) * 0.5);
  const noMeio = distCentro < larguraBoca * 0.35;

  if (noMeio && framesSemFinta > 45) {
    const sorteio = Math.random();
    if (sorteio < 0.02) {
      // Paradinha: hesita na leitura do chute (~0.2s a 0.3s)
      goleiroPausa = Math.floor(10 + Math.random() * 8);
      framesSemFinta = 0;
      velocidadeExtra = 0.9 + Math.random() * 0.3;
    } else if (sorteio < 0.045) {
      // Finta: inverte a direção repentinamente!
      goleiroDir = -goleiroDir;
      framesSemFinta = 0;
      velocidadeExtra = 1.0 + Math.random() * 0.25;
    }
  }

  const velocidade = velocidadeDoGoleiro(chute) * velocidadeExtra;

  const passo = moverGoleiro({
    posicao: posAtual,
    direcao: goleiroDir,
    velocidade,
    inicio: limiteMin,
    fim: limiteMax,
  });

  if (passo.direcao !== goleiroDir) {
    goleiroDir = passo.direcao;
    framesSemFinta = 0;
    velocidadeExtra = 0.95 + Math.random() * 0.2;
  }

  goalkeeper.style.left = `${passo.posicao}px`;
  animacaoGoleiro = requestAnimationFrame(animarGoleiro);
}

function pararGoleiro() {
  if (animacaoGoleiro) cancelAnimationFrame(animacaoGoleiro);
  animacaoGoleiro = 0;
}

function comecarGoleiro() {
  pararGoleiro();
  animacaoGoleiro = requestAnimationFrame(animarGoleiro);
}

// --- Rodada ---

function pintarPlacar() {
  const feitos = '⚽'.repeat(gols);
  const vazios = '·'.repeat(Math.max(0, QUANTIDADE_DE_CHUTES - gols));
  $('placar').textContent = `${feitos}${vazios}`;
  $('placar').setAttribute('aria-label', `${gols} ${gols === 1 ? 'gol' : 'gols'}`);
}

function recolocarBola() {
  football.classList.remove('chutando');
  football.style.setProperty('--chute-x', '0px');
  football.style.left = '50%';
  striker.style.left = 'calc(50% - 24px)';
  striker.style.setProperty('--inclinacao-batedor', `${anguloMira * 0.45}deg`);
  atualizarGuiaMira();
}

function proximoChute() {
  chutando = false;
  chute++;

  if (chute >= QUANTIDADE_DE_CHUTES) {
    encerrar();
    return;
  }

  goleiroPausa = 0;
  framesSemFinta = 0;
  velocidadeExtra = 1;

  recolocarBola();
  $('chute-atual').textContent = `Pênalti ${chute + 1} de ${QUANTIDADE_DE_CHUTES}`;
  comecarGoleiro();
}

function abrirRodada() {
  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }
  chute = 0;
  gols = 0;
  chutando = false;
  jogando = true;
  goleiroDir = 1;
  anguloMira = 0;
  goleiroPausa = 0;
  framesSemFinta = 0;
  velocidadeExtra = 1;
  mostrarTela('brincadeira');
  recolocarBola();
  goalMessage.textContent = '';
  $('chute-atual').textContent = `Pênalti 1 de ${QUANTIDADE_DE_CHUTES}`;
  pintarPlacar();
  comecarGoleiro();
  dizer([{ texto: 'Mire com as setas e chute para fazer gol no Caldeirão do Furacão!' }]);
}

async function encerrar() {
  jogando = false;
  pararGoleiro();
  if (guiaMira) guiaMira.style.opacity = '0';
  const { figurinha: premio, conquistasNovas } = registrarRodada('chute-a-gol');
  mostrarTela('fim');

  $('titulo-fim').textContent = gols > 0 ? 'Festa no Caldeirão!' : 'Quase, Furacão!';

  const bolas = $('bolas-fim');
  bolas.innerHTML = Array.from({ length: QUANTIDADE_DE_CHUTES }, () => `
    <span class="bolas-fim__item" aria-hidden="true">
      <img src="/figuras/bola.svg" alt="" width="36" height="36">
    </span>
  `).join('');
  const itensBola = Array.from(bolas.querySelectorAll('.bolas-fim__item'));

  const numeros = ['um', 'dois', 'três', 'quatro', 'cinco'];
  const contagem = gols > 0
    ? [
        { texto: 'Vamos contar os gols do Furacão!' },
        ...numeros.slice(0, gols).map(texto => ({ texto })),
        { texto: `${gols} ${gols === 1 ? 'golaço' : 'golaços'} do Furacão!` },
      ]
    : [{ texto: 'Vamos tentar de novo no Caldeirão!' }];

  const figInfo = figura(premio);
  $('figurinha').src = caminhoDaFigura(premio);
  $('figurinha').alt = `Figurinha nova: ${figInfo?.nome || premio}`;
  $('texto-fim').textContent = `Você fez ${gols} de ${QUANTIDADE_DE_CHUTES} pênaltis pelo Furacão e ganhou uma figurinha: ${nomeComArtigo(premio)}!`;

  tocar('vitoria');
  lancarConfete();

  const falasDaConquista = anunciarConquistas(conquistasNovas, {
    depoisDe: $('texto-fim'),
    dizer,
  });

  await dizer(contagem, {
    aoComecar: (indice) => {
      if (indice >= 1 && indice <= gols) {
        const bola = itensBola[indice - 1];
        if (bola) {
          bola.classList.add('bola-contada');
          tocar('clique');
        }
      }
    },
  });

  await dizer([
    { texto: `Ganhou uma figurinha: ${nomeComArtigo(premio)}.` },
    { texto: gols > 0 ? 'Você é o artilheiro do Furacão!' : 'O Furacão nunca desiste!' },
    ...falasDaConquista,
  ]);
}

// --- Controles: teclado (setas, A/D, Espaço) mais toque ---
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.key === ' ' || event.key === 'Spacebar') {
    event.preventDefault();
    shootBall();
    return;
  }

  switch (event.key) {
    case 'a':
    case 'A':
    case 'ArrowLeft':
      mirar(-PASSO_ANGULO);
      break;
    case 'd':
    case 'D':
    case 'ArrowRight':
      mirar(PASSO_ANGULO);
      break;
    case 'l':
    case 'L':
    case 'Enter':
      event.preventDefault();
      shootBall();
      break;
  }
});

/** No toque, segurar a seta continua mirando. */
function ligarSeta(botao, delta) {
  let timer = 0;
  const comecar = evento => {
    evento.preventDefault();
    mirar(delta);
    timer = setInterval(() => mirar(delta), 90);
  };
  const terminar = () => {
    clearInterval(timer);
    timer = 0;
    botao.blur();
  };
  botao.addEventListener('pointerdown', comecar);
  botao.addEventListener('pointerup', terminar);
  botao.addEventListener('pointerleave', terminar);
  botao.addEventListener('pointercancel', terminar);
}

ligarSeta($('esquerda'), -PASSO_ANGULO);
ligarSeta($('direita'), PASSO_ANGULO);
$('chutar').addEventListener('click', () => {
  $('chutar').blur();
  shootBall();
});

window.addEventListener('resize', () => {
  if (jogando) atualizarGuiaMira();
});

$('comecar').addEventListener('click', async () => {
  tocar('clique');
  $('comecar').disabled = true;
  const estado = await preparar();
  if (!estado.sinteseDisponivel && !estado.mudo && configuracoes.voz !== 'sem-fala') {
    $('aviso-voz').textContent = 'Um adulto pode ler as frases da tela.';
    $('aviso-voz').hidden = false;
  }
  $('comecar').disabled = false;
  abrirRodada();
});

$('de-novo').addEventListener('click', () => {
  tocar('clique');
  parar();
  abrirRodada();
});

window.addEventListener('pagehide', limpar);
window.addEventListener('beforeunload', limpar);
mostrarTela('convite');
