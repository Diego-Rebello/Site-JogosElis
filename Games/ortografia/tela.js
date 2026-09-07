/**
 * tela.js — liga o motor de jogo.js ao DOM da Ortografia Divertida (J01).
 * Aqui só entram eventos e desenho: nenhuma regra de ortografia mora neste
 * arquivo.
 */
import { montarCabecalho } from '../../shared/cabecalho.js';
import { lancarConfete, animar } from '../../shared/confete.js';
import { calcularEstrelas, obterConfiguracoes, registrarPartida } from '../../shared/progresso.js';
import { tocar } from '../../shared/sons.js';
import {
  ITENS_POR_RODADA,
  MISTURADO,
  conferir,
  conferirDados,
  listarPacotes,
  montarRodada,
  niveis,
  normalizarPacote,
  obterPacote,
  pacotes,
  partesDaPalavra,
} from './jogo.js';

montarCabecalho('Ortografia Divertida');

// Um dado incoerente aparece na abertura da página, não no meio da rodada.
const problemas = conferirDados();
if (problemas.length) throw new Error(`dados.js com problema:\n${problemas.join('\n')}`);

const $ = id => document.getElementById(id);
const telas = ['tela-pacotes', 'tela-jogo', 'tela-final'];

const configuracoes = obterConfiguracoes();
const nomeCrianca = configuracoes.nomeCrianca.toUpperCase();
const pacotePadrao = normalizarPacote(configuracoes.niveis.ortografia);

let pacoteAtual = pacotePadrao;
let rodada = [];
let indice = 0;
let acertos = 0;
let erros = 0;
let respondida = false;
let timeout = null;

function exibirTela(id) {
  telas.forEach(tela => { $(tela).hidden = tela !== id; });
}

function limparEspera() {
  if (timeout) clearTimeout(timeout);
  timeout = null;
}

/* --- tela de escolha da regra ------------------------------------------- */

function botaoDePacote({ id, nome, emoji, exemplo }) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao botao--neutro pacote';
  botao.dataset.pacote = id;

  const cara = document.createElement('span');
  cara.className = 'pacote__emoji';
  cara.setAttribute('aria-hidden', 'true');
  cara.textContent = emoji;

  const texto = document.createElement('span');
  const titulo = document.createElement('span');
  titulo.textContent = nome;
  texto.append(titulo);

  if (id === pacotePadrao) {
    const marca = document.createElement('span');
    marca.className = 'pacote__padrao';
    marca.textContent = 'seu nível';
    texto.append(marca);
  }

  const linha = document.createElement('span');
  linha.className = 'pacote__exemplo';
  linha.textContent = exemplo;
  texto.append(linha);

  botao.append(cara, texto);
  botao.addEventListener('click', () => iniciarRodada(id));
  return botao;
}

function montarTelaDePacotes() {
  const lista = $('lista-niveis');
  const porId = Object.fromEntries(listarPacotes().map(pacote => [pacote.id, pacote]));

  for (const nivel of niveis) {
    const bloco = document.createElement('section');
    bloco.className = 'nivel';

    const titulo = document.createElement('h3');
    titulo.className = 'nivel__titulo';
    titulo.textContent = nivel.titulo;

    const grade = document.createElement('div');
    grade.className = 'pacotes';
    nivel.pacotes.forEach(id => grade.append(botaoDePacote(porId[id])));

    bloco.append(titulo, grade);
    lista.append(bloco);
  }

  const misturado = document.createElement('section');
  misturado.className = 'nivel';
  const tituloMisturado = document.createElement('h3');
  tituloMisturado.className = 'nivel__titulo';
  tituloMisturado.textContent = 'Tudo junto';
  const grade = document.createElement('div');
  grade.className = 'pacotes';
  grade.append(botaoDePacote({
    id: MISTURADO,
    nome: 'Misturado',
    emoji: '🎲',
    exemplo: 'Palavras de todas as regras',
  }));
  misturado.append(tituloMisturado, grade);
  lista.append(misturado);
}

/* --- rodada -------------------------------------------------------------- */

function nomeDoPacote(id) {
  return id === MISTURADO ? 'MISTURADO' : obterPacote(id).nome.toUpperCase();
}

function iniciarRodada(id = pacoteAtual) {
  limparEspera();
  pacoteAtual = id;
  rodada = montarRodada(id);
  indice = 0;
  acertos = 0;
  erros = 0;
  $('placar-acertos').textContent = '0';
  $('placar-erros').textContent = '0';
  $('progresso').max = rodada.length;
  $('total-itens').textContent = rodada.length;
  $('nome-do-pacote').textContent = `REGRA: ${nomeDoPacote(id)}`;
  tocar('clique');
  exibirTela('tela-jogo');
  mostrarItem();
}

/** Escreve a palavra com a lacuna: "CA" + "_" destacado + "O". */
function pintarPalavra(item, revelar = false) {
  const { antes, letra, depois } = partesDaPalavra(item);
  const alvo = $('palavra');
  alvo.textContent = '';

  const meio = document.createElement('span');
  meio.className = revelar ? 'letra-destaque' : 'palavra__lacuna';
  // Sempre um "_" só: dois entregariam que a resposta tem duas letras (RR, SS, CH).
  meio.textContent = revelar ? letra : '_';

  alvo.append(document.createTextNode(antes), meio, document.createTextNode(depois));
  alvo.setAttribute('aria-label', revelar
    ? `A palavra certa é ${item.palavra}`
    : `${antes} lacuna ${depois}`);
}

function montarOpcoes(item) {
  const caixa = $('opcoes');
  caixa.textContent = '';
  caixa.classList.toggle('opcoes--tres', item.opcoes.length > 2);
  for (const opcao of item.opcoes) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'botao opcao';
    botao.textContent = opcao;
    botao.setAttribute('aria-label', `Completar com ${opcao}`);
    botao.addEventListener('click', () => responder(opcao));
    caixa.append(botao);
  }
}

/**
 * O aviso tem duas partes: o veredito curto, em caixa alta como o resto do
 * placar, e a regra em fonte de leitura — ela é o que a criança precisa ler
 * com calma, e em caixa alta um parágrafo inteiro fica pesado demais.
 */
function feedback(texto, estado, regra = '') {
  const alvo = $('feedback');
  alvo.textContent = texto;
  alvo.className = `feedback${estado ? ` feedback--${estado}` : ''}`;
  $('regra').textContent = regra;
  $('regra').hidden = !regra;
}

function mostrarItem() {
  respondida = false;
  const item = rodada[indice];
  $('palavra-atual').textContent = indice + 1;
  $('progresso').value = indice;
  $('dica').textContent = item.dica || 'Complete a palavra com a letra certa.';
  pintarPalavra(item);
  montarOpcoes(item);
  feedback('', null);
  $('btn-entendi').hidden = true;
}

function responder(opcao) {
  if (respondida) return;
  respondida = true;

  const item = rodada[indice];
  const acertou = conferir(item, opcao);
  $('opcoes').querySelectorAll('button').forEach(botao => { botao.disabled = true; });
  pintarPalavra(item, true);

  if (acertou) {
    acertos++;
    $('placar-acertos').textContent = acertos;
    feedback(`MUITO BEM, ${nomeCrianca}!`, 'certo', item.regra);
    tocar('acerto');
    animar($('palavra'), 'pular');
    timeout = setTimeout(avancar, 1400);
  } else {
    erros++;
    $('placar-erros').textContent = erros;
    feedback(`A PALAVRA CERTA É ${item.palavra}.`, 'errado', item.regra);
    tocar('erro');
    animar($('palavra'), 'tremer');
    $('btn-entendi').hidden = false;
    $('btn-entendi').focus();
  }
}

function avancar() {
  limparEspera();
  indice++;
  $('progresso').value = indice;
  if (indice >= rodada.length) finalizar();
  else mostrarItem();
}

function finalizar() {
  const estrelas = calcularEstrelas(acertos, erros);
  // Duas chaves de propósito: a do pacote guarda o progresso de cada regra e a
  // geral é a que a página inicial e o mural mostram no cartão do jogo.
  registrarPartida(`ortografia:${pacoteAtual}`, { acertos, erros, estrelas });
  registrarPartida('ortografia', { acertos, erros, estrelas });

  $('resumo-final').textContent =
    `PARABÉNS, ${nomeCrianca}! VOCÊ ACERTOU ${acertos} DE ${rodada.length} EM ${nomeDoPacote(pacoteAtual)}.`;
  $('estrelas-final').textContent = '⭐'.repeat(estrelas);
  exibirTela('tela-final');
  tocar('vitoria');
  lancarConfete();
}

function voltarParaEscolha() {
  limparEspera();
  tocar('clique');
  exibirTela('tela-pacotes');
  const padrao = $('lista-niveis').querySelector(`[data-pacote="${pacoteAtual}"]`);
  if (padrao) padrao.focus();
}

/* --- ligação ------------------------------------------------------------- */

montarTelaDePacotes();
$('btn-entendi').addEventListener('click', avancar);
$('btn-de-novo').addEventListener('click', () => iniciarRodada());
[$('btn-trocar'), $('btn-outra-regra')].forEach(botao =>
  botao.addEventListener('click', voltarParaEscolha));

$('total-itens').textContent = ITENS_POR_RODADA;
$('progresso').max = ITENS_POR_RODADA;

// Deixa o nível configurado pelo adulto pronto para o Enter, sem tirar a
// escolha da criança.
if (pacotes[pacotePadrao]) {
  const preferido = $('lista-niveis').querySelector(`[data-pacote="${pacotePadrao}"]`);
  if (preferido) preferido.focus({ preventScroll: true });
}
