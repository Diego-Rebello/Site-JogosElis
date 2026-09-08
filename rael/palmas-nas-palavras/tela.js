/**
 * tela.js — Palmas nas Palavras (P03).
 *
 * O passo a passo de cada palavra:
 *   1. a figura aparece e a palavra é falada inteira;
 *   2. no nível fácil, o modelo vem em seguida: cada sílaba é dita e um
 *      círculo acende junto (é o `aoComecar` de falarSequencia que sincroniza);
 *   3. a criança bate palmas no botão grande, uma por pedaço, sem pressa —
 *      o tempo entre os toques não significa nada;
 *   4. "Pronto!" compara a quantidade de palmas com a divisão cadastrada;
 *   5. no nível esperto, ainda vem "Quantos pedaços?", cuja resposta é
 *      comparada com a divisão, e não com as palmas.
 *
 * Errar não tira nada: na segunda tentativa a divisão é demonstrada e a
 * palavra segue.
 */
import { montarCabecalho } from '../../shared/cabecalho.js';
import { tocar } from '../../shared/sons.js';
import { lancarConfete } from '../../shared/confete.js';
import { definirPreferencia, falarSequencia, limpar as limparFala, modoAcompanhado, parar, preparar } from '../../shared/fala.js';
import { nivelDaEtapa, obterConfiguracoes, registrarRodada } from '../../shared/descobertas.js';
import { caminhoDaFigura, figura, nomeComArtigo } from '../../shared/catalogo-figuras.js';
import { MAIS_PEDACOS, PALAVRAS } from './dados.js';
import { criarPalmas, montarRodada, regrasDoNivel, silabasParaFala } from './jogo.js';

const ATIVIDADE = 'palmas-nas-palavras';

montarCabecalho('Palmas nas Palavras');

const $ = id => document.getElementById(id);
const telas = {
  convite: $('tela-convite'),
  demonstracao: $('tela-demonstracao'),
  brincadeira: $('tela-brincadeira'),
  fim: $('tela-fim'),
};

const configuracoes = obterConfiguracoes();
definirPreferencia(configuracoes.voz);
const nivel = nivelDaEtapa();
const regras = regrasDoNivel(nivel);

let palavras = [];
let indice = 0;
let palmas = null;
let resolvida = false;         // a palavra já foi conferida: os botões descansam
let pistaAtual = [];
let modeloVisivel = false;

function mostrarTela(nome) {
  Object.entries(telas).forEach(([chave, elemento]) => { elemento.hidden = chave !== nome; });
}

async function dizerPista(itens, opcoes) {
  pistaAtual = itens;
  $('roteiro-fala').textContent = itens.map(item => item.texto).join(' ');
  $('roteiro').hidden = !modoAcompanhado();
  await falarSequencia(itens, opcoes);
}

function pintarPassos() {
  $('passos').innerHTML = palavras.map((_, i) => {
    const feito = i < indice || (i === indice && resolvida);
    const agora = i === indice && !feito;
    return `<span class="passos__item${feito ? ' passos__item--feito' : ''}${agora ? ' passos__item--agora' : ''}"></span>`;
  }).join('');
}

/**
 * Desenha os círculos.
 * `modelo` mostra a quantidade certa em círculos pontilhados, e `acesos`
 * diz quantos ficam pintados. No nível fácil o modelo está sempre à vista.
 */
function pintarCirculos({ modelo = 0, acesos = 0 } = {}) {
  const total = Math.max(modelo, acesos);
  $('quantidade-palmas').textContent = String(acesos);
  $('circulos').setAttribute('aria-label', `${acesos} ${acesos === 1 ? 'palma batida' : 'palmas batidas'}`);
  $('circulos').innerHTML = Array.from({ length: total }, (_, i) => {
    const classes = ['circulo', i < modelo && i >= acesos ? 'circulo--modelo' : '', i < acesos ? 'circulo--aceso' : ''];
    return `<span class="${classes.filter(Boolean).join(' ')}">
      <span class="circulo__numero">${i + 1}</span>
      <span class="circulo__palma" aria-hidden="true">${i < acesos ? '👏' : ''}</span>
    </span>`;
  }).join('');
}

/** Liga visualmente cada pedaço falado à palma correspondente. */
function pintarPedacos(silabas, { acesos = 0 } = {}) {
  $('pedacos-palavra').hidden = false;
  $('pedacos-palavra').innerHTML = silabas.map((silaba, i) => `<span class="pedaco-visual${i < acesos ? ' pedaco-visual--aceso' : ''}">
    <span>${silaba}</span><small>palma ${i + 1}</small>
  </span>`).join('');
}

function pintarPalmas() {
  const { palmas: batidas } = palmas.estado();
  const modelo = regras.modelo === 'antes' || modeloVisivel ? palmas.esperado : 0;
  pintarCirculos({ modelo, acesos: batidas });
}

/**
 * Fala a palavra em pedaços acendendo um círculo por sílaba.
 * Zera as palmas no começo, e não no fim: se a criança bater palma no meio do
 * exemplo, o que ela fez continua valendo.
 */
async function mostrarModelo() {
  palmas.limpar();
  modeloVisivel = true;
  const desta = palmas;
  const { silabas } = palmas.palavra;
  pintarPedacos(silabas, { acesos: 0 });
  pintarCirculos({ modelo: silabas.length, acesos: 0 });
  await dizerPista(silabasParaFala(silabas), {
    aoComecar: posicao => {
      pintarPedacos(silabas, { acesos: posicao + 1 });
      pintarCirculos({ modelo: silabas.length, acesos: posicao + 1 });
    },
  });
  pintarPedacos(silabas, { acesos: silabas.length });
  // Volta às palmas realmente batidas, mas deixa o modelo numerado à vista.
  setTimeout(() => { if (palmas === desta) pintarPalmas(); }, 700);
}

// --- demonstração antes da primeira rodada -------------------------------

async function reproduzirDemonstracao() {
  parar();
  $('mapa-demo').querySelectorAll('[data-demo-pedaco]').forEach(item => item.classList.remove('mapa-pedacos__item--aceso'));
  const itens = [
    { texto: 'Pato.' },
    { texto: 'Pato tem dois pedaços.' },
    ...silabasParaFala(['PA', 'TO']),
    { texto: 'Uma palma para cada pedaço. Duas palmas!' },
  ];
  $('roteiro-demo').hidden = !modoAcompanhado();
  const resultados = await falarSequencia(itens, {
    aoComecar: posicao => {
      if (posicao < 2 || posicao > 3) return;
      $('mapa-demo').querySelector(`[data-demo-pedaco="${posicao - 2}"]`)?.classList.add('mapa-pedacos__item--aceso');
    },
  });
  if (resultados.includes('sem-fala')) $('roteiro-demo').hidden = false;
}

function abrirDemonstracao() {
  mostrarTela('demonstracao');
  reproduzirDemonstracao();
}

// --- uma palavra -----------------------------------------------------------

async function abrirPalavra() {
  const palavra = palavras[indice];
  palmas = criarPalmas(palavra);
  resolvida = false;
  modeloVisivel = false;

  $('figura-palavra').src = caminhoDaFigura(palavra.id);
  $('figura-palavra').alt = figura(palavra.id)?.nome || palavra.palavra;
  $('palavra-escrita').textContent = palavra.palavra;
  $('instrucao').textContent = 'Bata uma palma para cada pedaço!';
  $('retorno').textContent = '';
  $('retorno').className = 'feedback retorno';
  $('continuar').hidden = true;
  $('area-pergunta').hidden = true;
  $('pedacos-palavra').hidden = true;
  $('pedacos-palavra').innerHTML = '';
  $('palma').disabled = false;
  $('pronto').disabled = false;
  pintarPalmas();
  pintarPassos();

  await dizerPista([{ texto: `${nomeComArtigo(palavra.id)}.` }]);
  if (regras.modelo === 'antes') await mostrarModelo();
}

function travarPalavra() {
  resolvida = true;
  $('palma').disabled = true;
  $('pronto').disabled = true;
  pintarPassos();
}

async function conferir() {
  if (resolvida) return;
  const resultado = palmas.conferir();

  if (resultado.certo) {
    tocar('acerto');
    travarPalavra();
    modeloVisivel = true;
    pintarPedacos(palmas.palavra.silabas, { acesos: palmas.esperado });
    pintarPalmas();
    const frase = `Isso! ${palmas.palavra.palavra} tem ${resultado.esperado} ${resultado.esperado === 1 ? 'pedaço' : 'pedaços'}.`;
    $('retorno').textContent = frase;
    $('retorno').className = 'feedback retorno feedback--certo';
    await dizerPista([{ texto: frase }]);
    if (regras.pergunta) abrirPergunta();
    else liberarContinuar();
    return;
  }

  if (resultado.mostrarResposta) {
    tocar('clique');
    travarPalavra();
    $('retorno').textContent = 'Vamos juntos!';
    $('retorno').className = 'feedback retorno';
    await dizerPista([{ texto: 'Vamos juntos.' }]);
    const { silabas } = palmas.palavra;
    modeloVisivel = true;
    pintarPedacos(silabas, { acesos: 0 });
    pintarCirculos({ modelo: silabas.length, acesos: 0 });
    await dizerPista(silabasParaFala(silabas), {
      aoComecar: posicao => {
        pintarPedacos(silabas, { acesos: posicao + 1 });
        pintarCirculos({ modelo: silabas.length, acesos: posicao + 1 });
      },
    });
    if (regras.pergunta) abrirPergunta();
    else liberarContinuar();
    return;
  }

  // Primeira tentativa fora da conta: limpa e convida a tentar de novo.
  tocar('clique');
  $('retorno').textContent = 'Quase! Escuta de novo e tenta.';
  $('retorno').className = 'feedback retorno';
  await mostrarModelo();
}

function liberarContinuar() {
  $('continuar').hidden = false;
  $('continuar').focus();
}

function abrirPergunta() {
  $('area-pergunta').hidden = false;
  $('numeros').innerHTML = Array.from({ length: MAIS_PEDACOS }, (_, i) =>
    `<button class="botao numero" type="button" data-numero="${i + 1}">${i + 1}</button>`).join('');
  dizerPista([{ texto: 'Quantos pedaços?' }]);
}

$('numeros').addEventListener('click', async evento => {
  const botao = evento.target.closest('[data-numero]');
  if (!botao) return;
  const resposta = palmas.responderNumero(botao.dataset.numero);
  $('numeros').querySelectorAll('.numero').forEach(item => { item.disabled = true; });
  tocar(resposta.certo ? 'acerto' : 'clique');
  const frase = resposta.certo
    ? `Isso! ${resposta.esperado}.`
    : `São ${resposta.esperado} pedaços.`;
  $('retorno').textContent = frase;
  $('retorno').className = `feedback retorno${resposta.certo ? ' feedback--certo' : ''}`;
  liberarContinuar();
  await dizerPista([{ texto: frase }]);
});

// --- rodada ----------------------------------------------------------------

function abrirRodada() {
  palavras = montarRodada(PALAVRAS, { nivel });
  indice = 0;
  $('modelo').hidden = regras.modelo === 'antes';   // no fácil o modelo já vem sozinho
  mostrarTela('brincadeira');
  abrirPalavra();
}

async function encerrar() {
  const { figurinha } = registrarRodada(ATIVIDADE);
  const dados = figura(figurinha);
  mostrarTela('fim');
  $('figurinha').src = caminhoDaFigura(figurinha);
  $('figurinha').alt = `Figurinha nova: ${dados ? dados.nome : figurinha}`;
  $('texto-fim').textContent = `Você ganhou uma figurinha: ${nomeComArtigo(figurinha)}!`;
  tocar('vitoria');
  lancarConfete();
  await dizerPista([
    { texto: 'Quantas palmas!' },
    { texto: `Ganhou uma figurinha: ${nomeComArtigo(figurinha)}.` },
  ]);
}

$('comecar').addEventListener('click', async () => {
  tocar('clique');
  $('comecar').disabled = true;
  const estado = await preparar();
  if (!estado.sinteseDisponivel && !estado.mudo && configuracoes.voz !== 'sem-fala') {
    const aviso = $('aviso-voz');
    aviso.textContent = 'Este aparelho não tem voz em português. Um adulto pode ler as frases da tela.';
    aviso.hidden = false;
  }
  $('comecar').disabled = false;
  abrirDemonstracao();
});

$('repetir-demo').addEventListener('click', () => {
  tocar('clique');
  reproduzirDemonstracao();
});

$('jogar').addEventListener('click', () => {
  tocar('clique');
  parar();
  abrirRodada();
});

$('palma').addEventListener('click', () => {
  if (resolvida) return;
  parar();                       // a palma da criança tem prioridade sobre a fala
  tocar('clique');
  palmas.bater();
  pintarPalmas();
});

$('limpar').addEventListener('click', () => {
  if (resolvida) return;
  tocar('clique');
  palmas.limpar();
  pintarPalmas();
  $('retorno').textContent = '';
  $('retorno').className = 'feedback retorno';
});

$('modelo').addEventListener('click', () => {
  if (resolvida) return;
  mostrarModelo();
});

$('pronto').addEventListener('click', conferir);

$('repetir').addEventListener('click', () => {
  if (pistaAtual.length) falarSequencia(pistaAtual);
});

$('continuar').addEventListener('click', () => {
  tocar('clique');
  parar();
  if (indice >= palavras.length - 1) {
    encerrar();
    return;
  }
  indice += 1;
  abrirPalavra();
});

$('de-novo').addEventListener('click', () => {
  tocar('clique');
  parar();
  abrirRodada();
});

window.addEventListener('pagehide', limparFala);
window.addEventListener('beforeunload', limparFala);
