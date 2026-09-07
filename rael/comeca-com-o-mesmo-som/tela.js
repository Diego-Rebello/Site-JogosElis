import { montarCabecalho } from '../../shared/cabecalho.js';
import { tocar } from '../../shared/sons.js';
import { lancarConfete } from '../../shared/confete.js';
import { definirPreferencia, falar, falarSequencia, limpar, modoAcompanhado, parar, preparar } from '../../shared/fala.js';
import { criarSessao } from '../../shared/rodada.js';
import { nivelDaEtapa, obterConfiguracoes, registrarRodada, rodadasDe } from '../../shared/descobertas.js';
import { caminhoDaFigura, figura, nomeComArtigo } from '../../shared/catalogo-figuras.js';
import { PALAVRAS_SOM } from './dados.js';
import { montarRodadaSons } from './jogo.js';

const ATIVIDADE = 'comeca-com-o-mesmo-som';
const $ = id => document.getElementById(id);
const telas = { convite: $('tela-convite'), brincadeira: $('tela-brincadeira'), fim: $('tela-fim') };
const configuracoes = obterConfiguracoes();
definirPreferencia(configuracoes.voz);
montarCabecalho('Começa com o Mesmo Som');

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
  $('instrucao').textContent = `Qual começa como ${desafio.alvo.nome}?`;
  $('letra-revelada').hidden = true;
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

function audioPalavra(item) { return { texto: item.nome, audio: item.audio }; }

async function abrirDemonstracao() {
  demonstracao = true;
  const alvo = PALAVRAS_SOM.find(item => item.id === 'flor');
  const resposta = PALAVRAS_SOM.find(item => item.id === 'foguete');
  const extras = ['bola', 'sapo', 'uva'].slice(0, configuracoes.alternativas - 1)
    .map(id => PALAVRAS_SOM.find(item => item.id === id));
  const desafio = { alvo, respostaId: resposta.id, opcoes: [resposta, ...extras] };
  sessao = criarSessao({ desafios: [desafio] });
  mostrarTela('brincadeira');
  pintarDesafio(desafio, { guiado: true });
  await dizerPista([
    audioPalavra(alvo),
    { texto: 'Ffffflor começa com este som.', audio: alvo.audioSom },
    audioPalavra(resposta),
    { texto: 'Fffffoguete começa igual. Toque no foguete.' },
  ]);
}

function abrirRodada() {
  demonstracao = false;
  sessao = criarSessao({ desafios: montarRodadaSons(PALAVRAS_SOM, {
    quantidade: 6,
    alternativas: configuracoes.alternativas,
    nivel: nivelDaEtapa(),
    primeiraRodada: rodadasDe(ATIVIDADE) === 0,
  }) });
  mostrarTela('brincadeira');
  perguntar();
}

async function perguntar() {
  const desafio = desafioAtual();
  pintarDesafio(desafio);
  await dizerPista([audioPalavra(desafio.alvo), { texto: `Qual começa como ${desafio.alvo.nome}?` }]);
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
  const escolhida = PALAVRAS_SOM.find(item => item.id === id);
  const resposta = PALAVRAS_SOM.find(item => item.id === desafio.respostaId);
  if (resultado.certo) {
    tocar('acerto');
    travar(desafio.respostaId);
    $('letra-revelada').textContent = `${desafio.alvo.letra} de ${desafio.alvo.nome.toUpperCase()}`;
    $('letra-revelada').hidden = false;
    $('retorno').textContent = `${desafio.alvo.nome} e ${resposta.nome} começam igual!`;
    $('retorno').className = 'feedback retorno feedback--certo';
    $('continuar').hidden = false;
    $('continuar').focus();
    const somOuLetra = desafio.alvo.tipo === 'oclusiva'
      ? { texto: `Letra ${desafio.alvo.letra}. ${desafio.alvo.letra} de ${desafio.alvo.nome}.` }
      : { texto: `${desafio.alvo.letra}.`, audio: desafio.alvo.audioSom };
    await dizerPista([
      somOuLetra,
      audioPalavra(desafio.alvo), audioPalavra(resposta), { texto: 'Começam com o mesmo som!' },
    ]);
  } else if (resultado.fase === 'demonstrando') {
    tocar('clique');
    travar(desafio.respostaId);
    $('opcoes').querySelector(`[data-id="${desafio.respostaId}"]`)?.classList.add('opcao--mostrada');
    $('retorno').textContent = `Escute: ${desafio.alvo.nome}, ${resposta.nome}.`;
    $('continuar').hidden = false;
    $('continuar').focus();
    await dizerPista([audioPalavra(desafio.alvo), audioPalavra(resposta), { texto: 'Começam igual.' }]);
  } else {
    tocar('clique');
    $('retorno').textContent = 'Quase! Escute de novo.';
    await dizerPista([audioPalavra(desafio.alvo), audioPalavra(escolhida), { texto: 'Tente outra figura.' }]);
  }
}

async function encerrar() {
  const { figurinha } = registrarRodada(ATIVIDADE);
  mostrarTela('fim');
  $('figurinha').src = caminhoDaFigura(figurinha);
  $('figurinha').alt = `Figurinha nova: ${figura(figurinha)?.nome || figurinha}`;
  $('texto-fim').textContent = `Você ganhou uma figurinha: ${nomeComArtigo(figurinha)}!`;
  tocar('vitoria'); lancarConfete();
  await dizerPista([{ texto: 'Que ouvidos atentos!' }, { texto: `Ganhou uma figurinha: ${nomeComArtigo(figurinha)}.` }]);
}

$('comecar').addEventListener('click', async () => {
  tocar('clique'); $('comecar').disabled = true;
  const estado = await preparar();
  if (!estado.sinteseDisponivel && !estado.mudo && configuracoes.voz !== 'sem-fala') {
    $('aviso-voz').textContent = 'Um adulto pode ler as frases da tela.'; $('aviso-voz').hidden = false;
  }
  $('comecar').disabled = false; abrirDemonstracao();
});
$('opcoes').addEventListener('click', evento => {
  const ouvir = evento.target.closest('[data-ouvir]');
  if (ouvir) {
    const item = PALAVRAS_SOM.find(palavra => palavra.id === ouvir.dataset.ouvir);
    falar(audioPalavra(item), { lembrar: false }); return;
  }
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
