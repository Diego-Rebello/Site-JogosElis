import { montarCabecalho } from '../../shared/cabecalho.js';
import { tocar } from '../../shared/sons.js';
import { lancarConfete } from '../../shared/confete.js';
import { definirPreferencia, falar, falarSequencia, limpar, modoAcompanhado, parar, preparar } from '../../shared/fala.js';
import { criarSessao } from '../../shared/rodada.js';
import { obterConfiguracoes, registrarRodada } from '../../shared/descobertas.js';
import { caminhoDaFigura, figura, nomeComArtigo } from '../../shared/catalogo-figuras.js';
import { QUESTOES_RIMA } from './dados.js';
import { montarRodadaRimas } from './jogo.js';

const ATIVIDADE = 'rimas-com-figuras';
const $ = id => document.getElementById(id);
const telas = { convite: $('tela-convite'), brincadeira: $('tela-brincadeira'), fim: $('tela-fim') };
const configuracoes = obterConfiguracoes();
definirPreferencia(configuracoes.voz);
montarCabecalho('Rimas com Figuras');

let sessao = null;
let demonstracao = false;
let pistaAtual = [];

function mostrarTela(nome) {
  Object.entries(telas).forEach(([chave, elemento]) => { elemento.hidden = chave !== nome; });
}

async function dizerPista(itens) {
  pistaAtual = itens;
  $('roteiro-fala').textContent = itens.map(item => item.texto).join(' ');
  $('roteiro').hidden = !modoAcompanhado();
  const resultados = await falarSequencia(itens);
  if (resultados.includes('sem-fala')) $('roteiro').hidden = false;
}

function pintarPassos() {
  if (!sessao || demonstracao) { $('passos').innerHTML = ''; return; }
  const { indice, total, fase } = sessao.estado();
  $('passos').innerHTML = Array.from({ length: total }, (_, i) => {
    const feito = i < indice || (i === indice && fase !== 'pergunta');
    return `<span class="passos__item${feito ? ' passos__item--feito' : i === indice ? ' passos__item--agora' : ''}"></span>`;
  }).join('');
}

function pintarDesafio(desafio, { guiado = false } = {}) {
  $('figura-alvo').src = caminhoDaFigura(desafio.alvo.id);
  $('figura-alvo').alt = desafio.alvo.nome;
  $('palavra-alvo').textContent = desafio.alvo.nome.toUpperCase();
  $('instrucao').textContent = `${desafio.alvo.nome}! O que rima com ${desafio.alvo.nome}?`;
  $('opcoes').className = `opcoes${desafio.opcoes.length === 2 ? ' opcoes--2' : ''}`;
  $('opcoes').innerHTML = desafio.opcoes.map(item => `<div class="opcao-com-audio">
    <button class="opcao${guiado && item.id === desafio.respostaId ? ' opcao--mostrada' : ''}" type="button" data-id="${item.id}"${guiado && item.id !== desafio.respostaId ? ' disabled' : ''}>
      <img class="opcao__figura" src="${caminhoDaFigura(item.id)}" alt="" aria-hidden="true" width="104" height="104">
      <span class="opcao__palavra">${item.nome.toUpperCase()}</span>
    </button>
    <button class="botao ouvir-opcao" type="button" data-ouvir="${item.id}" aria-label="Ouvir ${item.nome}">🔊 ${item.nome}</button>
  </div>`).join('');
  $('continuar').hidden = true;
  $('retorno').textContent = '';
  $('retorno').className = 'feedback retorno';
  pintarPassos();
}

function desafioAtual() { return sessao?.estado().desafio; }

async function abrirDemonstracao() {
  demonstracao = true;
  const quantidade = configuracoes.alternativas;
  const ids = ['pato', 'bola', 'sol', 'livro'].slice(0, quantidade);
  const desafio = { alvo: figura('gato'), respostaId: 'pato', opcoes: ids.map(figura) };
  sessao = criarSessao({ desafios: [desafio] });
  mostrarTela('brincadeira');
  pintarDesafio(desafio, { guiado: true });
  await dizerPista([
    { texto: 'Olha só. Gato e pato terminam parecido.' },
    { texto: 'Gato. Pato.' },
    { texto: 'Toque no pato.' },
  ]);
}

function abrirRodada() {
  demonstracao = false;
  sessao = criarSessao({ desafios: montarRodadaRimas(QUESTOES_RIMA, {
    quantidade: 6, alternativas: configuracoes.alternativas,
  }) });
  mostrarTela('brincadeira');
  perguntar();
}

async function perguntar() {
  const desafio = desafioAtual();
  pintarDesafio(desafio);
  await dizerPista([
    { texto: `${desafio.alvo.nome}.` },
    { texto: `O que rima com ${desafio.alvo.nome}?` },
  ]);
}

function travar(respostaId) {
  $('opcoes').querySelectorAll('.opcao').forEach(botao => {
    botao.disabled = true;
    if (botao.dataset.id === respostaId) botao.classList.add('opcao--certa');
  });
}

async function responder(id) {
  const desafio = desafioAtual();
  const resultado = sessao.responder(id);
  const escolhida = figura(id);
  const resposta = figura(desafio.respostaId);
  if (resultado.certo) {
    tocar('acerto');
    travar(desafio.respostaId);
    $('retorno').textContent = `${desafio.alvo.nome} e ${resposta.nome} rimam!`;
    $('retorno').className = 'feedback retorno feedback--certo';
    $('continuar').hidden = false;
    $('continuar').focus();
    await dizerPista([{ texto: `${desafio.alvo.nome}. ${resposta.nome}. Os finais combinam!` }]);
  } else if (resultado.fase === 'demonstrando') {
    tocar('clique');
    travar(desafio.respostaId);
    $('opcoes').querySelector(`[data-id="${desafio.respostaId}"]`)?.classList.add('opcao--mostrada');
    $('retorno').textContent = `Escute: ${desafio.alvo.nome}, ${resposta.nome}.`;
    $('continuar').hidden = false;
    $('continuar').focus();
    await dizerPista([{ texto: `Escute. ${desafio.alvo.nome}. ${resposta.nome}. Eles rimam.` }]);
  } else {
    tocar('clique');
    $('retorno').textContent = 'Quase! Escute os nomes de novo.';
    await dizerPista([{ texto: `${desafio.alvo.nome}. ${escolhida.nome}. Tente outra figura.` }]);
  }
}

async function encerrar() {
  const { figurinha } = registrarRodada(ATIVIDADE);
  mostrarTela('fim');
  $('figurinha').src = caminhoDaFigura(figurinha);
  $('figurinha').alt = `Figurinha nova: ${figura(figurinha)?.nome || figurinha}`;
  $('texto-fim').textContent = `Você ganhou uma figurinha: ${nomeComArtigo(figurinha)}!`;
  tocar('vitoria');
  lancarConfete();
  await dizerPista([{ texto: 'Você encontrou as rimas!' }, { texto: `Ganhou uma figurinha: ${nomeComArtigo(figurinha)}.` }]);
}

$('comecar').addEventListener('click', async () => {
  tocar('clique');
  $('comecar').disabled = true;
  const estado = await preparar();
  if (!estado.sinteseDisponivel && !estado.mudo && configuracoes.voz !== 'sem-fala') {
    $('aviso-voz').textContent = 'Um adulto pode ler as frases da tela.';
    $('aviso-voz').hidden = false;
  }
  $('comecar').disabled = false;
  abrirDemonstracao();
});

$('opcoes').addEventListener('click', evento => {
  const ouvir = evento.target.closest('[data-ouvir]');
  if (ouvir) { falar({ texto: figura(ouvir.dataset.ouvir)?.nome }, { lembrar: false }); return; }
  const botao = evento.target.closest('[data-id]');
  if (botao && !botao.disabled) responder(botao.dataset.id);
});

$('repetir').addEventListener('click', () => pistaAtual.length && falarSequencia(pistaAtual));
$('continuar').addEventListener('click', () => {
  tocar('clique'); parar();
  if (demonstracao) { abrirRodada(); return; }
  if (sessao.avancar().fase === 'fim') encerrar(); else perguntar();
});
$('de-novo').addEventListener('click', () => { tocar('clique'); parar(); abrirRodada(); });
window.addEventListener('pagehide', limpar);
window.addEventListener('beforeunload', limpar);
