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
import { criarPalmas, montarRodada, regrasDoNivel } from './jogo.js';

const ATIVIDADE = 'palmas-nas-palavras';

montarCabecalho('Palmas nas Palavras');

const $ = id => document.getElementById(id);
const telas = { convite: $('tela-convite'), brincadeira: $('tela-brincadeira'), fim: $('tela-fim') };

const configuracoes = obterConfiguracoes();
definirPreferencia(configuracoes.voz);
const nivel = nivelDaEtapa();
const regras = regrasDoNivel(nivel);

let palavras = [];
let indice = 0;
let palmas = null;
let resolvida = false;         // a palavra já foi conferida: os botões descansam
let pistaAtual = [];

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
  $('circulos').innerHTML = Array.from({ length: total }, (_, i) => {
    const classes = ['circulo', i < modelo && i >= acesos ? 'circulo--modelo' : '', i < acesos ? 'circulo--aceso' : ''];
    return `<span class="${classes.filter(Boolean).join(' ')}"></span>`;
  }).join('');
}

function pintarPalmas() {
  const { palmas: batidas } = palmas.estado();
  const modelo = regras.modelo === 'antes' ? palmas.esperado : 0;
  pintarCirculos({ modelo, acesos: batidas });
}

/**
 * Fala a palavra em pedaços acendendo um círculo por sílaba.
 * Zera as palmas no começo, e não no fim: se a criança bater palma no meio do
 * exemplo, o que ela fez continua valendo.
 */
async function mostrarModelo() {
  palmas.limpar();
  const desta = palmas;
  const { silabas } = palmas.palavra;
  pintarCirculos({ modelo: silabas.length, acesos: 0 });
  await dizerPista(silabas.map(silaba => ({ texto: silaba })), {
    aoComecar: posicao => pintarCirculos({ modelo: silabas.length, acesos: posicao + 1 }),
  });
  // Deixa o último círculo à vista um instante antes de voltar ao estado real.
  setTimeout(() => { if (palmas === desta) pintarPalmas(); }, 700);
}

// --- uma palavra -----------------------------------------------------------

async function abrirPalavra() {
  const palavra = palavras[indice];
  palmas = criarPalmas(palavra);
  resolvida = false;

  $('figura-palavra').src = caminhoDaFigura(palavra.id);
  $('figura-palavra').alt = figura(palavra.id)?.nome || palavra.palavra;
  $('palavra-escrita').textContent = palavra.palavra;
  $('instrucao').textContent = 'Bata uma palma para cada pedaço!';
  $('retorno').textContent = '';
  $('retorno').className = 'feedback retorno';
  $('continuar').hidden = true;
  $('area-pergunta').hidden = true;
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
    pintarCirculos({ modelo: silabas.length, acesos: 0 });
    await dizerPista(silabas.map(silaba => ({ texto: silaba })), {
      aoComecar: posicao => pintarCirculos({ modelo: silabas.length, acesos: posicao + 1 }),
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
