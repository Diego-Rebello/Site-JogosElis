/**
 * Toque na Figura — a primeira brincadeira dos Jogos do Rael.
 *
 * Ela existe para valer (a criança ouve o nome e toca na figura), e também é
 * o teste de ponta a ponta da P00: usa a fala em camadas de shared/fala.js, o
 * catálogo de figuras, o motor de rodada curta e o álbum de figurinhas. Se
 * esta tela funciona no tablet e em modo avião, a base da etapa está de pé.
 *
 * Regras da seção 6.0 do MELHORIAS que aparecem aqui:
 * - nada fala antes do toque em "Vamos brincar";
 * - demonstração antes da primeira pergunta;
 * - cinco desafios, sem cronômetro, sem vidas e sem placar;
 * - errar duas vezes mostra a resposta e a rodada segue;
 * - "ouvir de novo" não conta como tentativa;
 * - terminar rende uma figurinha, com ajuda ou sem ajuda.
 */
import { montarCabecalho } from '../../shared/cabecalho.js';
import { tocar } from '../../shared/sons.js';
import { lancarConfete } from '../../shared/confete.js';
import {
  definirPreferencia, falarSequencia, limpar, modoAcompanhado, parar, preparar,
} from '../../shared/fala.js';
import { criarSessao, montarDesafios } from '../../shared/rodada.js';
import { obterConfiguracoes, registrarRodada } from '../../shared/descobertas.js';
import { caminhoDaFigura, figurasDoTema, nomeComArtigo, figura } from '../../shared/catalogo-figuras.js';

const ATIVIDADE = 'toque-na-figura';
const DESAFIOS_POR_RODADA = 5;

montarCabecalho('Toque na Figura');

const $ = id => document.getElementById(id);
const telas = {
  convite: $('tela-convite'),
  brincadeira: $('tela-brincadeira'),
  fim: $('tela-fim'),
};

const configuracoes = obterConfiguracoes();
definirPreferencia(configuracoes.voz);

let sessao = null;
let demonstracao = null;
/** O que o botão "Ouvir de novo" repete: sempre a pista, nunca o retorno. */
let pistaAtual = [];

/** "Toque no gato!" / "Toque na bola!" */
function toqueNa(id) {
  const dados = figura(id);
  if (!dados) return 'Toque na figura!';
  return `Toque n${dados.artigo} ${dados.nome}!`;
}

function mostrarTela(nome) {
  Object.entries(telas).forEach(([chave, elemento]) => {
    elemento.hidden = chave !== nome;
  });
}

/** Fala a pista e deixa o roteiro do adulto pronto para o modo acompanhado. */
async function dizerPista(itens) {
  pistaAtual = itens;
  const texto = itens.map(item => item.texto).join(' ');
  $('roteiro-fala').textContent = texto;
  $('roteiro').hidden = !modoAcompanhado();
  await falarSequencia(itens);
}

function pintarPassos() {
  if (!sessao) return;
  const { indice, total, fase } = sessao.estado();
  $('passos').innerHTML = Array.from({ length: total }, (_, i) => {
    const feito = i < indice || (i === indice && (fase === 'acertou' || fase === 'demonstrando'));
    const agora = i === indice && !feito;
    return `<span class="passos__item${feito ? ' passos__item--feito' : ''}${agora ? ' passos__item--agora' : ''}"></span>`;
  }).join('');
}

/**
 * Desenha as alternativas.
 * `apenas` deixa só uma opção clicável (usado na demonstração).
 */
function pintarOpcoes(desafio, { marcada = null, apenas = null } = {}) {
  const area = $('opcoes');
  area.className = `opcoes${desafio.opcoes.length === 2 ? ' opcoes--2' : ''}`;
  area.innerHTML = desafio.opcoes.map(item => {
    const marcas = [
      'opcao',
      item.id === marcada ? 'opcao--mostrada' : '',
      apenas && item.id !== apenas ? 'opcao--apagada' : '',
    ].filter(Boolean).join(' ');
    return `<button class="${marcas}" type="button" data-id="${item.id}"${apenas && item.id !== apenas ? ' disabled' : ''}>
      <img class="opcao__figura" src="${caminhoDaFigura(item.id)}" alt="" aria-hidden="true" width="104" height="104">
      <span class="opcao__palavra">${item.nome.toUpperCase()}</span>
    </button>`;
  }).join('');
}

function travarOpcoes(certa) {
  $('opcoes').querySelectorAll('.opcao').forEach(botao => {
    botao.disabled = true;
    if (botao.dataset.id === certa) botao.classList.add('opcao--certa');
  });
}

// --- demonstração ---------------------------------------------------------

async function abrirDemonstracao() {
  const bolsa = figurasDoTema(configuracoes.tema);
  demonstracao = montarDesafios({
    itens: bolsa,
    quantidade: 1,
    alternativas: configuracoes.alternativas,
  })[0];

  mostrarTela('brincadeira');
  $('passos').innerHTML = '';
  $('continuar').hidden = true;
  $('retorno').textContent = '';
  $('retorno').className = 'feedback retorno';

  const alvo = demonstracao.alvo.id;
  $('instrucao').textContent = `Olha só: ${nomeComArtigo(alvo)}.`;
  pintarOpcoes(demonstracao, { marcada: alvo, apenas: alvo });
  await dizerPista([
    { texto: 'Olha só.' },
    { texto: `${nomeComArtigo(alvo)}.` },
    { texto: toqueNa(alvo) },
  ]);
}

async function responderDemonstracao() {
  tocar('acerto');
  travarOpcoes(demonstracao.alvo.id);
  $('retorno').textContent = 'Isso! Agora é você.';
  $('retorno').className = 'feedback retorno feedback--certo';
  $('continuar').hidden = false;
  $('continuar').focus();
  await dizerPista([{ texto: 'Isso! Agora é você.' }]);
}

// --- rodada ---------------------------------------------------------------

function abrirRodada() {
  const bolsa = figurasDoTema(configuracoes.tema);
  sessao = criarSessao({
    desafios: montarDesafios({
      itens: bolsa,
      quantidade: DESAFIOS_POR_RODADA,
      alternativas: configuracoes.alternativas,
    }),
  });
  demonstracao = null;
  mostrarTela('brincadeira');
  perguntar();
}

async function perguntar() {
  const { desafio } = sessao.estado();
  if (!desafio) return;
  $('continuar').hidden = true;
  $('retorno').textContent = '';
  $('retorno').className = 'feedback retorno';
  $('instrucao').textContent = `Cadê ${nomeComArtigo(desafio.alvo.id)}?`;
  pintarOpcoes(desafio);
  pintarPassos();
  await dizerPista([{ texto: `Cadê ${nomeComArtigo(desafio.alvo.id)}?` }]);
}

async function responder(idEscolhido) {
  const { desafio } = sessao.estado();
  const resultado = sessao.responder(idEscolhido);
  const alvo = desafio.alvo.id;

  if (resultado.certo) {
    tocar('acerto');
    travarOpcoes(alvo);
    $('retorno').textContent = `É ${nomeComArtigo(alvo)}! Muito bem!`;
    $('retorno').className = 'feedback retorno feedback--certo';
    $('continuar').hidden = false;
    $('continuar').focus();
    await dizerPista([{ texto: `É ${nomeComArtigo(alvo)}!` }, { texto: 'Muito bem!' }]);
    return;
  }

  if (resultado.fase === 'demonstrando') {
    tocar('clique');
    travarOpcoes(alvo);
    $('opcoes').querySelector(`[data-id="${alvo}"]`)?.classList.add('opcao--mostrada');
    $('retorno').textContent = `Olha, aqui está ${nomeComArtigo(alvo)}.`;
    $('retorno').className = 'feedback retorno';
    $('continuar').hidden = false;
    $('continuar').focus();
    await dizerPista([{ texto: `Olha, aqui está ${nomeComArtigo(alvo)}.` }]);
    return;
  }

  // Primeira tentativa errada: a pista volta, sem tirar nada de ninguém.
  tocar('clique');
  const escolhida = $('opcoes').querySelector(`[data-id="${idEscolhido}"]`);
  escolhida?.classList.add('tremer');
  setTimeout(() => escolhida?.classList.remove('tremer'), 400);
  $('retorno').textContent = 'Quase! Escute de novo.';
  $('retorno').className = 'feedback retorno';
  await dizerPista([
    { texto: 'Quase!' },
    { texto: `Cadê ${nomeComArtigo(alvo)}?` },
  ]);
}

// --- fim da rodada --------------------------------------------------------

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
    { texto: 'Você conseguiu!' },
    { texto: `Ganhou uma figurinha: ${nomeComArtigo(figurinha)}.` },
  ]);
}

// --- ligações da tela -----------------------------------------------------

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
  await abrirDemonstracao();
});

$('opcoes').addEventListener('click', evento => {
  const botao = evento.target.closest('.opcao');
  if (!botao || botao.disabled) return;
  if (demonstracao) {
    responderDemonstracao();
    return;
  }
  responder(botao.dataset.id);
});

$('repetir').addEventListener('click', () => {
  if (pistaAtual.length) falarSequencia(pistaAtual);
});

$('continuar').addEventListener('click', () => {
  tocar('clique');
  parar();
  if (demonstracao) {
    abrirRodada();
    return;
  }
  const estado = sessao.avancar();
  if (estado.fase === 'fim') encerrar();
  else perguntar();
});

$('de-novo').addEventListener('click', () => {
  tocar('clique');
  parar();
  abrirRodada();
});

// Sair da página não pode deixar uma frase falando sozinha no aparelho.
window.addEventListener('pagehide', limpar);
window.addEventListener('beforeunload', limpar);
