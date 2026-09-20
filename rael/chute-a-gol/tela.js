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
 * - sao 5 penaltis, com placar, fala e a figurinha do album no fim;
 * - tres modos no inicio: chutar, defender (o Rael vira goleiro) ou alternado.
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
  DURACAO_DO_MERGULHO,
  ESPERA_DO_ADVERSARIO,
  PASSO_ANGULO,
  PASSO_GOLEIRO,
  QUANTIDADE_DE_CHUTES,
  ajustarAngulo,
  anguloDoAdversario,
  calcularImpactoNoGol,
  duracaoDoChuteAdversario,
  ehSucesso,
  mensagemDoPapel,
  moverGoleiro,
  moverGoleiroJogador,
  papelDaVez,
  resultadoDaDefesa,
  resultadoDoChute,
  resumoDaRodada,
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
  modo: $('tela-modo'),
  brincadeira: $('tela-brincadeira'),
  fim: $('tela-fim'),
};

const configuracoes = obterConfiguracoes();
definirPreferencia(configuracoes.voz);
montarCabecalho('Chute a Gol');

let modo = 'chutar';
let papel = 'chutar';
let chute = 0;
let gols = 0;
let defesas = 0;
let historico = [];
let chutando = false;
let resolvendo = false;
let jogando = false;
let goleiroDir = 1;
let animacaoGoleiro = 0;
let anguloMira = 0;
let goleiroPausa = 0;
let framesSemFinta = 0;
let velocidadeExtra = 1;
let mergulhando = false;
let recarregandoMergulho = false;
let ultimaDirecao = 1;
let tempoDoAdversario = 0;
let tempoDoVoo = 0;
let tempoDoProximo = 0;
let tempoDaMensagem = 0;

function mostrarTela(nome) {
  Object.entries(telas).forEach(([chave, el]) => {
    if (el) el.hidden = chave !== nome;
  });
}

function dizer(itens, opcoes) {
  return falarSequencia(Array.isArray(itens) ? itens : [{ texto: itens }], opcoes);
}

function limparTempos() {
  [tempoDoAdversario, tempoDoVoo, tempoDoProximo, tempoDaMensagem].forEach(id => clearTimeout(id));
  tempoDoAdversario = 0;
  tempoDoVoo = 0;
  tempoDoProximo = 0;
  tempoDaMensagem = 0;
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

/** Onde a bola sai e onde ela cruza a linha do gol. */
function geometriaDoChute() {
  const origemX = field.clientWidth * 0.5;
  const origemY = field.clientHeight - 64;
  const goalY = field.clientWidth <= 480 ? 128 : 136;
  return { origemX, origemY, goalY, distanciaY: Math.max(10, origemY - goalY) };
}

/** Os limites em que o goleiro anda, sem passar por cima das traves. */
function limitesDoGoleiro() {
  const { inicio, fim, traveLargura } = medidasDoGol();
  const meia = goalkeeper.clientWidth * 0.5;
  const margem = (traveLargura || 16) + 4;
  return { min: inicio + margem + meia, max: fim - margem - meia };
}

// --- Mira angular e linha tracejada ---

function atualizarGuiaMira() {
  if (!field || papel !== 'chutar') return;
  const { origemX, origemY, goalY, distanciaY } = geometriaDoChute();
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

function mirar(delta, comSom = true) {
  if (chutando || !jogando) return;
  anguloMira = ajustarAngulo(anguloMira, delta);
  atualizarGuiaMira();
  if (comSom) tocar('clique');
}

// --- shootBall / checkGoal / displayGoalMessage ---

function shootBall() {
  if (chutando || !jogando || papel !== 'chutar') return;
  chutando = true;

  if (guiaMira) guiaMira.style.opacity = '0';

  const { origemX, distanciaY } = geometriaDoChute();
  const impactoX = calcularImpactoNoGol({ origemX, distanciaY, anguloGraus: anguloMira });

  football.style.setProperty('--chute-x', `${impactoX - origemX}px`);
  football.style.setProperty('--distancia-chute', `${-distanciaY}px`);
  football.style.animationDuration = `${DURACAO_DO_CHUTE}ms`;

  striker.classList.add('chutando');
  football.classList.add('chutando');
  tocar('clique');

  tempoDoVoo = setTimeout(() => {
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
  encerrarLance(resultado);
}

// --- Pênalti do adversário (o Rael no gol) ---

function penaltiDoAdversario() {
  if (!jogando) return;
  chutando = true;
  resolvendo = false;
  striker.classList.add('preparando');
  goalMessage.textContent = 'Prepare-se!';

  const espera = ESPERA_DO_ADVERSARIO + (chute === 0 ? 600 : 0);
  tempoDoAdversario = setTimeout(() => {
    if (!jogando) return;
    striker.classList.remove('preparando');
    goalMessage.textContent = '';

    const { origemX, distanciaY } = geometriaDoChute();
    const angulo = anguloDoAdversario(Math.random());
    const impactoX = calcularImpactoNoGol({ origemX, distanciaY, anguloGraus: angulo });
    const duracao = duracaoDoChuteAdversario(chute);

    striker.style.setProperty('--inclinacao-batedor', `${angulo * 0.45}deg`);
    football.style.setProperty('--chute-x', `${impactoX - origemX}px`);
    football.style.setProperty('--distancia-chute', `${-distanciaY}px`);
    football.style.animationDuration = `${duracao}ms`;

    striker.classList.add('chutando');
    football.classList.add('chutando');
    tocar('clique');

    tempoDoVoo = setTimeout(() => {
      striker.classList.remove('chutando');
      checarDefesa(impactoX);
    }, duracao);
  }, espera);
}

function checarDefesa(impactoX) {
  resolvendo = true;
  const { centro, largura, traveLargura } = medidasDoGol();
  const resultado = resultadoDaDefesa({
    bolaX: impactoX,
    goalpostPos: centro,
    goalpostLargura: largura,
    goleiroPos: posicaoDe(goalkeeper),
    goleiroLargura: goalkeeper.clientWidth,
    traveLargura,
    mergulhando,
  });
  encerrarLance(resultado);
}

/** Fecha o lance: conta, comemora, fala e chama o próximo pênalti. */
function encerrarLance(resultado) {
  resolvendo = true;
  const sucesso = ehSucesso(papel, resultado);
  historico.push({ papel, resultado, sucesso });

  if (papel === 'chutar' && resultado === 'gol') gols++;
  if (papel === 'defender' && sucesso) defesas++;

  if (sucesso) {
    tocar('acerto');
    lancarConfete();
    if (mascote) {
      mascote.classList.add('comemorando');
      setTimeout(() => mascote.classList.remove('comemorando'), 1800);
    }
  } else {
    tocar('clique');
  }

  if (resultado === 'defesa') {
    goalkeeper.classList.add('pegou');
    setTimeout(() => goalkeeper.classList.remove('pegou'), 500);
  } else if (resultado === 'trave') {
    goalpost.classList.add('tremeu');
    setTimeout(() => goalpost.classList.remove('tremeu'), 500);
  }

  pintarPlacar();
  const frase = mensagemDoPapel(papel, resultado);
  displayGoalMessage(frase);
  dizer([{ texto: frase }]);

  tempoDoProximo = setTimeout(proximoChute, 1600);
}

function displayGoalMessage(message) {
  clearTimeout(tempoDaMensagem);
  goalMessage.textContent = message;
  tempoDaMensagem = setTimeout(() => {
    goalMessage.textContent = '';
  }, 2000);
}

// --- Vaivem do goleiro do computador (com fintas e paradinhas imprevisíveis) ---

function animarGoleiro() {
  const { min: limiteMin, max: limiteMax } = limitesDoGoleiro();
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

// --- Goleiro do jogador ---

function centralizarGoleiro() {
  const { min, max } = limitesDoGoleiro();
  goalkeeper.style.left = `${(min + max) * 0.5}px`;
}

function moverMeuGoleiro(delta, comSom = true) {
  if (!jogando || papel !== 'defender' || resolvendo) return;
  const { min, max } = limitesDoGoleiro();
  const nova = moverGoleiroJogador(posicaoDe(goalkeeper), delta, min, max);
  goalkeeper.style.left = `${nova}px`;
  ultimaDirecao = delta < 0 ? -1 : 1;
  if (comSom) tocar('clique');
}

/** Mergulho: por meio segundo o goleiro estica os braços e alcança mais longe. */
function mergulhar() {
  if (!jogando || papel !== 'defender' || resolvendo) return;
  if (mergulhando || recarregandoMergulho) return;
  mergulhando = true;
  goalkeeper.classList.add('mergulhando', ultimaDirecao < 0 ? 'mergulhando--esq' : 'mergulhando--dir');
  tocar('clique');
  setTimeout(() => {
    mergulhando = false;
    goalkeeper.classList.remove('mergulhando', 'mergulhando--esq', 'mergulhando--dir');
    recarregandoMergulho = true;
    setTimeout(() => { recarregandoMergulho = false; }, 220);
  }, DURACAO_DO_MERGULHO);
}

// --- Controles que mudam conforme o papel ---

/** O som sai no toque, não em cada repetição: segurar a seta não vira chiado. */
function aoSeta(delta, comSom = true) {
  if (papel === 'defender') {
    moverMeuGoleiro(delta < 0 ? -PASSO_GOLEIRO : PASSO_GOLEIRO, comSom);
  } else {
    mirar(delta < 0 ? -PASSO_ANGULO : PASSO_ANGULO, comSom);
  }
}

function aoBotaoCentral() {
  if (papel === 'defender') mergulhar();
  else shootBall();
}

function aplicarPapel() {
  const defendendo = papel === 'defender';

  striker.classList.toggle('adversario', defendendo);
  goalkeeper.classList.toggle('do-jogador', defendendo);

  $('papel-atual').textContent = defendendo ? '🧤 Você defende' : '⚽ Você chuta';

  $('chutar').textContent = defendendo ? 'PULAR' : 'CHUTAR';
  $('esquerda').setAttribute('aria-label', defendendo ? 'Mover o goleiro para a esquerda' : 'Mirar para a esquerda');
  $('direita').setAttribute('aria-label', defendendo ? 'Mover o goleiro para a direita' : 'Mirar para a direita');
  $('dica-controles').innerHTML = defendendo
    ? 'No teclado: <b>A</b> e <b>D</b> (ou setas) para mover o goleiro, <b>Barra de Espaço</b> para pular.'
    : 'No teclado: <b>A</b> e <b>D</b> (ou setas) para mirar, <b>Barra de Espaço</b> para chutar.';

  if (guiaMira) guiaMira.style.opacity = defendendo ? '0' : '1';
}

// --- Rodada ---

function pintarPlacar() {
  const marcas = Array.from({ length: QUANTIDADE_DE_CHUTES }, (_, i) => {
    const lance = historico[i];
    if (!lance) return '·';
    if (!lance.sucesso) return '·';
    return lance.papel === 'defender' ? '🧤' : '⚽';
  });
  const sucessos = historico.filter(lance => lance.sucesso).length;
  $('placar').textContent = marcas.join('');
  $('placar').setAttribute('aria-label', `${sucessos} de ${QUANTIDADE_DE_CHUTES} jogadas boas`);
}

function recolocarBola() {
  football.classList.remove('chutando');
  football.style.setProperty('--chute-x', '0px');
  football.style.left = '50%';
  striker.style.left = 'calc(50% - 24px)';
  striker.style.setProperty('--inclinacao-batedor', `${papel === 'chutar' ? anguloMira * 0.45 : 0}deg`);
  atualizarGuiaMira();
}

function iniciarPenalti() {
  papel = papelDaVez(modo, chute);
  chutando = false;
  resolvendo = false;
  mergulhando = false;
  recarregandoMergulho = false;
  goleiroPausa = 0;
  framesSemFinta = 0;
  velocidadeExtra = 1;
  anguloMira = 0;
  goalkeeper.classList.remove('mergulhando', 'mergulhando--esq', 'mergulhando--dir');

  clearTimeout(tempoDaMensagem);
  aplicarPapel();
  recolocarBola();
  goalMessage.textContent = '';
  $('chute-atual').textContent = `Pênalti ${chute + 1} de ${QUANTIDADE_DE_CHUTES}`;
  pintarPlacar();

  if (papel === 'defender') {
    pararGoleiro();
    centralizarGoleiro();
    if (modo === 'alternado') dizer([{ texto: 'Agora você defende!' }]);
    penaltiDoAdversario();
  } else {
    comecarGoleiro();
    if (modo === 'alternado' && chute > 0) dizer([{ texto: 'Agora você chuta!' }]);
  }
}

function proximoChute() {
  chute++;
  if (chute >= QUANTIDADE_DE_CHUTES) {
    encerrar();
    return;
  }
  iniciarPenalti();
}

function abrirRodada(escolha) {
  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }
  limparTempos();
  modo = escolha || 'chutar';
  chute = 0;
  gols = 0;
  defesas = 0;
  historico = [];
  jogando = true;
  goleiroDir = 1;
  ultimaDirecao = 1;
  mostrarTela('brincadeira');
  iniciarPenalti();

  const boasVindas = {
    chutar: 'Mire com as setas e chute para fazer gol no Caldeirão do Furacão!',
    defender: 'Você é o goleiro! Use as setas para se mexer e o botão para pular na bola.',
    alternado: 'Agora um chute, agora uma defesa. Vamos começar chutando!',
  };
  dizer([{ texto: boasVindas[modo] || boasVindas.chutar }]);
}

function abrirEscolhaDeModo() {
  limparTempos();
  jogando = false;
  pararGoleiro();
  mostrarTela('modo');
  dizer([{ texto: 'Como você quer jogar? Chutar, defender ou alternado?' }]);
}

/** Uma bola para cada pênalti batido, uma luva para cada pênalti defendido. */
function marcadorDoLance(lance) {
  if (lance?.papel === 'defender') {
    return `
      <span class="bolas-fim__item" aria-hidden="true">
        <svg class="bolas-fim__luva" viewBox="0 0 48 56" width="30" height="36"><use href="#icone-luva" /></svg>
      </span>
    `;
  }
  return `
    <span class="bolas-fim__item" aria-hidden="true">
      <img src="/figuras/bola.svg" alt="" width="36" height="36">
    </span>
  `;
}

function tituloDaConclusao(sucessos) {
  if (modo === 'defender') return defesas > 0 ? 'Muralha do Furacão!' : 'Quase, goleirão!';
  if (modo === 'alternado') return sucessos > 0 ? 'Craque completo!' : 'Quase, Furacão!';
  return gols > 0 ? 'Festa no Caldeirão!' : 'Quase, Furacão!';
}

async function encerrar() {
  jogando = false;
  limparTempos();
  pararGoleiro();
  if (guiaMira) guiaMira.style.opacity = '0';
  striker.classList.remove('adversario', 'preparando');
  goalkeeper.classList.remove('do-jogador');
  const { figurinha: premio, conquistasNovas } = registrarRodada('chute-a-gol');
  mostrarTela('fim');

  const sucessos = historico.filter(lance => lance.sucesso).length;
  $('titulo-fim').textContent = tituloDaConclusao(sucessos);

  const bolas = $('bolas-fim');
  bolas.innerHTML = historico.map(marcadorDoLance).join('');
  const itensBola = Array.from(bolas.querySelectorAll('.bolas-fim__item'));
  const posicoesBoas = historico
    .map((lance, i) => (lance.sucesso ? i : -1))
    .filter(i => i >= 0);

  const numeros = ['um', 'dois', 'três', 'quatro', 'cinco'];
  const convite = {
    chutar: 'Vamos contar os gols do Furacão!',
    defender: 'Vamos contar as defesas do Furacão!',
    alternado: 'Vamos contar as jogadas boas do Furacão!',
  };
  const fecho = {
    chutar: `${sucessos} ${sucessos === 1 ? 'golaço' : 'golaços'} do Furacão!`,
    defender: `${sucessos} ${sucessos === 1 ? 'defesa' : 'defesas'} do Furacão!`,
    alternado: `${sucessos} ${sucessos === 1 ? 'jogada boa' : 'jogadas boas'} do Furacão!`,
  };
  const contagem = sucessos > 0
    ? [
        { texto: convite[modo] || convite.chutar },
        ...numeros.slice(0, sucessos).map(texto => ({ texto })),
        { texto: fecho[modo] || fecho.chutar },
      ]
    : [{ texto: 'Vamos tentar de novo no Caldeirão!' }];

  const figInfo = figura(premio);
  $('figurinha').src = caminhoDaFigura(premio);
  $('figurinha').alt = `Figurinha nova: ${figInfo?.nome || premio}`;
  $('texto-fim').textContent = `${resumoDaRodada({ modo, gols, defesas })} pelo Furacão e ganhou uma figurinha: ${nomeComArtigo(premio)}!`;

  tocar('vitoria');
  lancarConfete();

  const falasDaConquista = anunciarConquistas(conquistasNovas, {
    depoisDe: $('texto-fim'),
    dizer,
  });

  await dizer(contagem, {
    aoComecar: (indice) => {
      if (indice >= 1 && indice <= sucessos) {
        const bola = itensBola[posicoesBoas[indice - 1]];
        if (bola) {
          bola.classList.add('bola-contada');
          tocar('clique');
        }
      }
    },
  });

  const elogio = {
    chutar: sucessos > 0 ? 'Você é o artilheiro do Furacão!' : 'O Furacão nunca desiste!',
    defender: sucessos > 0 ? 'Você é o paredão do Furacão!' : 'O Furacão nunca desiste!',
    alternado: sucessos > 0 ? 'Você chuta e defende como craque!' : 'O Furacão nunca desiste!',
  };

  await dizer([
    { texto: `Ganhou uma figurinha: ${nomeComArtigo(premio)}.` },
    { texto: elogio[modo] || elogio.chutar },
    ...falasDaConquista,
  ]);
}

// --- Controles: teclado (setas, A/D, Espaço) mais toque ---
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.key === ' ' || event.key === 'Spacebar') {
    event.preventDefault();
    aoBotaoCentral();
    return;
  }

  switch (event.key) {
    case 'a':
    case 'A':
    case 'ArrowLeft':
      aoSeta(-1, !event.repeat);
      break;
    case 'd':
    case 'D':
    case 'ArrowRight':
      aoSeta(1, !event.repeat);
      break;
    case 'l':
    case 'L':
    case 'Enter':
      event.preventDefault();
      aoBotaoCentral();
      break;
  }
});

/** No toque, segurar a seta continua mirando (ou andando, quando é o goleiro). */
function ligarSeta(botao, lado) {
  let timer = 0;
  const comecar = evento => {
    evento.preventDefault();
    aoSeta(lado);
    timer = setInterval(() => aoSeta(lado, false), papel === 'defender' ? 70 : 90);
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

ligarSeta($('esquerda'), -1);
ligarSeta($('direita'), 1);
$('chutar').addEventListener('click', () => {
  $('chutar').blur();
  aoBotaoCentral();
});

window.addEventListener('resize', () => {
  if (!jogando) return;
  if (papel === 'defender') {
    const { min, max } = limitesDoGoleiro();
    goalkeeper.style.left = `${moverGoleiroJogador(posicaoDe(goalkeeper), 0, min, max)}px`;
  } else {
    atualizarGuiaMira();
  }
});

['modo-chutar', 'modo-defender', 'modo-alternado'].forEach(id => {
  $(id).addEventListener('click', () => {
    tocar('clique');
    parar();
    abrirRodada($(id).dataset.modo);
  });
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
  abrirEscolhaDeModo();
});

$('de-novo').addEventListener('click', () => {
  tocar('clique');
  parar();
  abrirEscolhaDeModo();
});

window.addEventListener('pagehide', limpar);
window.addEventListener('beforeunload', limpar);
mostrarTela('convite');
