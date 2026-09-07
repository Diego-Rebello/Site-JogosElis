import { montarCabecalho } from '../../shared/cabecalho.js';
import { tocar } from '../../shared/sons.js';
import { lancarConfete } from '../../shared/confete.js';
import { definirPreferencia, falarSequencia, limpar, modoAcompanhado, parar, preparar } from '../../shared/fala.js';
import { criarSessao } from '../../shared/rodada.js';
import { obterConfiguracoes, registrarRodada } from '../../shared/descobertas.js';
import { caminhoDaFigura, figura, nomeComArtigo } from '../../shared/catalogo-figuras.js';
import { EXEMPLOS_POR_LETRA, nomeDaLetra } from './dados.js';
import { montarRodadaLetras } from './jogo.js';

const ATIVIDADE = 'letras-para-explorar';
const $ = id => document.getElementById(id);
const telas = { convite: $('tela-convite'), brincadeira: $('tela-brincadeira'), mesa: $('tela-mesa'), fim: $('tela-fim') };
const configuracoes = obterConfiguracoes();
definirPreferencia(configuracoes.voz);
montarCabecalho('Letras para Explorar');

let sessao = null;
let modo = 'iguais';
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

function fraseDaPista(desafio) {
  if (modo === 'iguais') return `Encontre outra letra ${nomeDaLetra(desafio.alvo.letra)} igual a esta.`;
  if (modo === 'ouvir') return `Encontre a letra ${nomeDaLetra(desafio.alvo.letra)}.`;
  return `Qual letra começa ${desafio.alvo.palavra.nome}?`;
}

function itensDaPista(desafio) {
  if (modo === 'inicio') return [
    { texto: desafio.alvo.palavra.nome },
    { texto: `Qual letra começa ${desafio.alvo.palavra.nome}?` },
  ];
  return [{ texto: fraseDaPista(desafio) }];
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
  $('modelo-letra').textContent = desafio.alvo.letra;
  $('modelo-letra').hidden = !desafio.mostrarModelo;
  const comPalavra = Boolean(desafio.alvo.palavra);
  $('alvo-palavra').hidden = !comPalavra;
  if (comPalavra) {
    $('figura-palavra').src = caminhoDaFigura(desafio.alvo.palavra.id);
    $('figura-palavra').alt = desafio.alvo.palavra.nome;
    $('nome-palavra').textContent = desafio.alvo.palavra.nome.toUpperCase();
  }
  $('instrucao').textContent = fraseDaPista(desafio);
  $('opcoes').className = `opcoes opcoes-letras${desafio.opcoes.length === 2 ? ' opcoes--2' : ''}`;
  $('opcoes').innerHTML = desafio.opcoes.map(item => `<button class="opcao opcao-letra${guiado && item.id === desafio.respostaId ? ' opcao--mostrada' : ''}" type="button" data-id="${item.id}"${guiado && item.id !== desafio.respostaId ? ' disabled' : ''}>${item.letra}</button>`).join('');
  $('exemplos').hidden = true;
  $('continuar').hidden = true;
  $('retorno').textContent = '';
  $('retorno').className = 'feedback retorno';
  pintarPassos();
}

function desafioAtual() { return sessao?.estado().desafio; }

function htmlExemplos(letra) {
  const exemplos = EXEMPLOS_POR_LETRA[letra] || [];
  const figuras = exemplos.map(item => `<span class="exemplo-figura">
    <img src="${caminhoDaFigura(item.id)}" alt="${item.nome}" width="72" height="72">
    <span>${item.nome.toUpperCase()}</span>
  </span>`).join('');
  return `<strong class="exemplo-letra">${letra}</strong>${figuras || '<span>Ainda não há figura para esta letra.</span>'}`;
}

async function revelarExemplos(letra, area = $('exemplos')) {
  area.innerHTML = htmlExemplos(letra);
  area.hidden = false;
  const primeiro = EXEMPLOS_POR_LETRA[letra]?.[0];
  const itens = [{ texto: `Letra ${nomeDaLetra(letra)}.` }];
  if (primeiro) itens.push({ texto: `${letra} de ${primeiro.nome}.` });
  await dizerPista(itens);
}

function desafiosDoModo(modoEscolhido, quantidade = 6) {
  return montarRodadaLetras(configuracoes.letras, {
    modo: modoEscolhido, quantidade, alternativas: configuracoes.alternativas,
  });
}

async function abrirDemonstracao() {
  demonstracao = true;
  const desafio = desafiosDoModo(modo, 1)[0];
  sessao = criarSessao({ desafios: [desafio] });
  mostrarTela('brincadeira');
  pintarDesafio(desafio, { guiado: true });
  await dizerPista([{ texto: 'Olha só.' }, ...itensDaPista(desafio), { texto: `Toque na letra ${nomeDaLetra(desafio.respostaId)}.` }]);
}

function abrirRodada() {
  demonstracao = false;
  sessao = criarSessao({ desafios: desafiosDoModo(modo) });
  mostrarTela('brincadeira');
  perguntar();
}

async function perguntar() {
  const desafio = desafioAtual();
  pintarDesafio(desafio);
  await dizerPista(itensDaPista(desafio));
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
  if (resultado.certo) {
    tocar('acerto'); travar(desafio.respostaId);
    $('retorno').textContent = `Isso! É a letra ${desafio.respostaId}.`;
    $('retorno').className = 'feedback retorno feedback--certo';
    $('continuar').hidden = false; $('continuar').focus();
    await revelarExemplos(desafio.respostaId);
  } else if (resultado.fase === 'demonstrando') {
    tocar('clique'); travar(desafio.respostaId);
    $('opcoes').querySelector(`[data-id="${desafio.respostaId}"]`)?.classList.add('opcao--mostrada');
    $('retorno').textContent = `Aqui está a letra ${desafio.respostaId}.`;
    $('continuar').hidden = false; $('continuar').focus();
    await revelarExemplos(desafio.respostaId);
  } else {
    tocar('clique');
    $('retorno').textContent = 'Quase! Escute de novo.';
    await dizerPista(itensDaPista(desafio));
  }
}

function abrirMesa() {
  mostrarTela('mesa');
  $('mesa-letras').innerHTML = configuracoes.letras
    .map(letra => `<button class="opcao-letra mesa-letra" type="button" data-letra="${letra}">${letra}</button>`).join('');
  $('exemplos-mesa').innerHTML = '<span>Escolha uma letra.</span>';
  dizerPista([{ texto: 'Toque em qualquer letra para ouvir o nome e ver figuras.' }]);
}

async function encerrar() {
  const { figurinha } = registrarRodada(ATIVIDADE);
  mostrarTela('fim');
  $('figurinha').src = caminhoDaFigura(figurinha);
  $('figurinha').alt = `Figurinha nova: ${figura(figurinha)?.nome || figurinha}`;
  $('texto-fim').textContent = `Você ganhou uma figurinha: ${nomeComArtigo(figurinha)}!`;
  tocar('vitoria'); lancarConfete();
  await dizerPista([{ texto: 'Você explorou as letras!' }, { texto: `Ganhou uma figurinha: ${nomeComArtigo(figurinha)}.` }]);
}

document.querySelector('.modos-letras').addEventListener('click', async evento => {
  const botao = evento.target.closest('[data-modo]');
  if (!botao) return;
  tocar('clique');
  modo = botao.dataset.modo;
  const estado = await preparar();
  if (!estado.sinteseDisponivel && !estado.mudo && configuracoes.voz !== 'sem-fala') {
    $('aviso-voz').textContent = 'Um adulto pode ler as frases da tela.'; $('aviso-voz').hidden = false;
  }
  if (modo === 'mesa') abrirMesa(); else abrirDemonstracao();
});
$('opcoes').addEventListener('click', evento => {
  const botao = evento.target.closest('[data-id]');
  if (botao && !botao.disabled) responder(botao.dataset.id);
});
$('mesa-letras').addEventListener('click', evento => {
  const botao = evento.target.closest('[data-letra]');
  if (botao) { tocar('clique'); revelarExemplos(botao.dataset.letra, $('exemplos-mesa')); }
});
$('repetir').addEventListener('click', () => pistaAtual.length && falarSequencia(pistaAtual));
$('continuar').addEventListener('click', () => {
  tocar('clique'); parar();
  if (demonstracao) { abrirRodada(); return; }
  if (sessao.avancar().fase === 'fim') encerrar(); else perguntar();
});
$('de-novo').addEventListener('click', () => { tocar('clique'); parar(); abrirRodada(); });
$('voltar-modos').addEventListener('click', () => { parar(); mostrarTela('convite'); });
window.addEventListener('pagehide', limpar);
window.addEventListener('beforeunload', limpar);
