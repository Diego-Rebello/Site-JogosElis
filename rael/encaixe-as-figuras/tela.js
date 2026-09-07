/**
 * tela.js — Encaixe as Figuras (P02).
 *
 * Duas maneiras de jogar, sempre as duas ao mesmo tempo:
 * - tocar na peça e depois no lugar (é o caminho garantido, e o único que a
 *   aceitação da P02 exige);
 * - arrastar a peça até o lugar, com eventos de ponteiro, que cobrem dedo e
 *   mouse com o mesmo código.
 *
 * A sombra e os pedaços saem do próprio SVG da figura: `filter: brightness(0)`
 * para a sombra e `background-position` para o recorte. Por isso as doze cenas
 * não precisaram de nenhuma ilustração nova.
 */
import { montarCabecalho } from '../../shared/cabecalho.js';
import { tocar } from '../../shared/sons.js';
import { lancarConfete } from '../../shared/confete.js';
import { definirPreferencia, falarSequencia, limpar, modoAcompanhado, parar, preparar } from '../../shared/fala.js';
import { nivelDaEtapa, obterConfiguracoes, registrarRodada } from '../../shared/descobertas.js';
import { caminhoDaFigura, figura, nomeComArtigo } from '../../shared/catalogo-figuras.js';
import { CENAS } from './dados.js';
import { criarMontagem, montarCena, montarRodada } from './jogo.js';

const ATIVIDADE = 'encaixe-as-figuras';
const LADO_DA_PECA = 92;      // px na bandeja; a altura acompanha o formato do recorte

montarCabecalho('Encaixe as Figuras');

const $ = id => document.getElementById(id);
const telas = { convite: $('tela-convite'), brincadeira: $('tela-brincadeira'), fim: $('tela-fim') };

const configuracoes = obterConfiguracoes();
definirPreferencia(configuracoes.voz);

let cenas = [];
let indiceDaCena = 0;
let cena = null;
let montagem = null;
let ensinando = false;         // true durante a demonstração da primeira cena
let pistaAtual = [];

function mostrarTela(nome) {
  Object.entries(telas).forEach(([chave, elemento]) => { elemento.hidden = chave !== nome; });
}

async function dizerPista(itens) {
  pistaAtual = itens;
  $('roteiro-fala').textContent = itens.map(item => item.texto).join(' ');
  $('roteiro').hidden = !modoAcompanhado();
  await falarSequencia(itens);
}

function pintarPassos() {
  $('passos').innerHTML = cenas.map((_, i) => {
    const feito = i < indiceDaCena;
    const agora = i === indiceDaCena;
    return `<span class="passos__item${feito ? ' passos__item--feito' : ''}${agora ? ' passos__item--agora' : ''}"></span>`;
  }).join('');
}

/**
 * O estilo que recorta um pedaço do SVG, ou a figura inteira na silhueta.
 * O endereço vai entre aspas simples: o texto todo mora dentro de um
 * atributo style="...", e uma aspa dupla aqui fecharia o atributo no meio.
 */
function estiloDaImagem(item, largura) {
  const endereco = caminhoDaFigura(item.figura);
  if (cena.tipo === 'silhueta') {
    return { largura, altura: largura, css: `background-image:url('${endereco}');background-size:contain;background-repeat:no-repeat;background-position:center` };
  }
  const altura = Math.round(largura * (item.colunas / item.linhas));
  const x = item.colunas > 1 ? (item.coluna / (item.colunas - 1)) * 100 : 50;
  const y = item.linhas > 1 ? (item.linha / (item.linhas - 1)) * 100 : 50;
  return {
    largura,
    altura,
    css: `background-image:url('${endereco}');--tamanho:${item.colunas * 100}% ${item.linhas * 100}%;--posicao:${x}% ${y}%`,
  };
}

function desenharDestinos() {
  const area = $('destinos');
  const grade = cena.tipo === 'pedacos';
  area.className = `destinos ${grade ? 'destinos--grade' : 'destinos--fila'}`;
  area.style.cssText = grade ? `--colunas:${cena.colunas};--linhas:${cena.linhas}` : '';

  const { colocadas } = montagem.estado();
  area.innerHTML = cena.destinos.map(destino => {
    const cheio = Boolean(colocadas[destino.id]);
    const largura = grade ? 0 : 96;
    const imagem = estiloDaImagem(destino, largura);
    const medida = grade ? '' : `width:${imagem.largura}px;height:${imagem.altura}px;`;
    const classes = ['destino', cheio ? 'destino--cheio' : ''].filter(Boolean).join(' ');
    const interior = grade
      ? `<span class="recorte${cheio ? '' : ' sombra'}" style="${imagem.css};width:100%;height:100%"></span>`
      : `<span class="recorte${cheio ? '' : ' sombra'}" style="${imagem.css};width:82%;height:82%"></span>`;
    return `<button class="${classes}" type="button" data-destino="${destino.id}" style="${medida}">${interior}</button>`;
  }).join('');
}

function desenharPecas() {
  const { selecionada, colocadas } = montagem.estado();
  const guardadas = new Set(Object.values(colocadas));
  $('pecas').innerHTML = cena.pecas.map(peca => {
    const imagem = estiloDaImagem(peca, LADO_DA_PECA);
    const classes = [
      'peca',
      selecionada === peca.id ? 'peca--escolhida' : '',
      guardadas.has(peca.id) ? 'peca--guardada' : '',
    ].filter(Boolean).join(' ');
    const nome = cena.tipo === 'silhueta' ? (figura(peca.figura)?.nome || peca.figura) : 'pedaço';
    return `<button class="${classes}" type="button" data-peca="${peca.id}" aria-label="${nome}">
      <span class="recorte" style="${imagem.css};width:${imagem.largura}px;height:${imagem.altura}px"></span>
    </button>`;
  }).join('');
}

function desenhar() {
  desenharDestinos();
  desenharPecas();
  pintarPassos();
}

// --- abrir uma cena --------------------------------------------------------

async function abrirCena() {
  cena = montarCena(cenas[indiceDaCena]);
  montagem = criarMontagem(cena);
  ensinando = indiceDaCena === 0;
  $('continuar').hidden = true;
  $('retorno').textContent = '';
  $('retorno').className = 'feedback retorno';
  $('instrucao').textContent = cena.instrucao;
  desenhar();

  if (ensinando) {
    await dizerPista([{ texto: cena.instrucao }, { texto: 'Olha como faz.' }]);
    await demonstrar();
  } else {
    await dizerPista([{ texto: cena.instrucao }]);
  }
}

/** Mostra um encaixe do começo ao fim: acende a peça, acende o lugar, encaixa. */
async function demonstrar() {
  const proximo = montagem.proximoEncaixe();
  if (!proximo) return;
  const pecaNaTela = $('pecas').querySelector(`[data-peca="${proximo.peca.id}"]`);
  const destinoNaTela = $('destinos').querySelector(`[data-destino="${proximo.destinoId}"]`);
  pecaNaTela?.classList.add('peca--escolhida');
  destinoNaTela?.classList.add('destino--alvo');

  await dizerPista([{ texto: 'Esta peça vai aqui.' }]);
  montagem.encaixar(proximo.destinoId, proximo.peca.id);
  tocar('acerto');
  desenhar();
  ensinando = false;
  $('retorno').textContent = 'Agora é você!';
  $('retorno').className = 'feedback retorno feedback--certo';
  await dizerPista([{ texto: 'Agora é você!' }]);
}

// --- responder -------------------------------------------------------------

async function tentarEncaixe(destinoId, pecaId) {
  const resultado = montagem.encaixar(destinoId, pecaId);
  if (resultado.ignorado) {
    desenhar();
    return;
  }

  if (!resultado.certo) {
    tocar('clique');
    desenhar();   // redesenha primeiro: senão o tremor iria para um elemento já descartado
    const alvo = $('destinos').querySelector(`[data-destino="${destinoId}"]`);
    alvo?.classList.add('tremer');
    setTimeout(() => alvo?.classList.remove('tremer'), 400);
    $('retorno').textContent = 'Aqui não. Tenta outro lugar!';
    $('retorno').className = 'feedback retorno';
    await dizerPista([{ texto: 'Aqui não. Tenta outro lugar!' }]);
    return;
  }

  tocar('acerto');
  desenhar();

  if (!montagem.estado().completa) {
    $('retorno').textContent = 'Isso! Encaixou.';
    $('retorno').className = 'feedback retorno feedback--certo';
    await dizerPista([{ texto: 'Isso! Encaixou.' }]);
    return;
  }

  const comemoracao = cena.tipo === 'silhueta'
    ? 'Todas no lugar!'
    : `Ficou pronto: ${nomeComArtigo(cena.figura)}!`;
  $('retorno').textContent = comemoracao;
  $('retorno').className = 'feedback retorno feedback--certo';
  $('continuar').hidden = false;
  $('continuar').focus();
  lancarConfete(900);
  await dizerPista([{ texto: comemoracao }]);
}

// --- arrastar --------------------------------------------------------------

let voando = null;
/* Depois de um arraste o navegador ainda dispara um clique na peça. Sem esta
   marca, esse clique selecionaria de novo a peça que acabou de ser encaixada. */
let acabouDeArrastar = false;

function comecarArraste(botao, evento) {
  const caixa = botao.getBoundingClientRect();
  const clone = botao.cloneNode(true);
  clone.classList.add('peca--voando');
  clone.style.width = `${caixa.width}px`;
  clone.style.height = `${caixa.height}px`;
  document.body.append(clone);
  voando = {
    clone,
    pecaId: botao.dataset.peca,
    deslocamentoX: evento.clientX - caixa.left,
    deslocamentoY: evento.clientY - caixa.top,
    moveu: false,
  };
  mover(evento);
}

function mover(evento) {
  if (!voando) return;
  voando.clone.style.left = `${evento.clientX - voando.deslocamentoX}px`;
  voando.clone.style.top = `${evento.clientY - voando.deslocamentoY}px`;
}

function soltar(evento) {
  if (!voando) return;
  const { clone, pecaId, moveu } = voando;
  clone.remove();
  voando = null;
  if (!moveu) return;                      // foi um toque, não um arraste
  acabouDeArrastar = true;
  setTimeout(() => { acabouDeArrastar = false; }, 0);
  const embaixo = document.elementFromPoint(evento.clientX, evento.clientY);
  const destino = embaixo?.closest('[data-destino]');
  if (destino) tentarEncaixe(destino.dataset.destino, pecaId);
  else desenhar();
}

$('pecas').addEventListener('pointerdown', evento => {
  const botao = evento.target.closest('.peca');
  if (!botao || botao.classList.contains('peca--guardada') || ensinando) return;
  botao.setPointerCapture?.(evento.pointerId);
  comecarArraste(botao, evento);
});

$('pecas').addEventListener('pointermove', evento => {
  if (!voando) return;
  voando.moveu = true;
  mover(evento);
});

$('pecas').addEventListener('pointerup', soltar);
$('pecas').addEventListener('pointercancel', () => {
  voando?.clone.remove();
  voando = null;
});

// --- tocar na peça e depois no lugar ---------------------------------------

$('pecas').addEventListener('click', evento => {
  const botao = evento.target.closest('.peca');
  if (!botao || botao.classList.contains('peca--guardada') || ensinando || acabouDeArrastar) return;
  tocar('clique');
  montagem.selecionar(botao.dataset.peca);
  desenhar();
});

$('destinos').addEventListener('click', evento => {
  const botao = evento.target.closest('[data-destino]');
  if (!botao || ensinando) return;
  const { selecionada } = montagem.estado();
  if (!selecionada) {
    $('retorno').textContent = 'Toque primeiro numa peça.';
    $('retorno').className = 'feedback retorno';
    return;
  }
  tentarEncaixe(botao.dataset.destino, selecionada);
});

// --- rodada ----------------------------------------------------------------

function abrirRodada() {
  cenas = montarRodada(CENAS, { nivel: nivelDaEtapa() });
  indiceDaCena = 0;
  mostrarTela('brincadeira');
  abrirCena();
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
    { texto: 'Você montou tudo!' },
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

$('repetir').addEventListener('click', () => {
  if (pistaAtual.length) falarSequencia(pistaAtual);
});

// "Me mostra" encaixa uma peça sozinho. Pode ser usado quantas vezes quiser:
// pedir ajuda não muda a comemoração do fim. Enquanto a frase é dita o botão
// descansa, senão dois toques seguidos apontariam a mesma peça duas vezes.
let mostrando = false;
$('mostrar').addEventListener('click', async () => {
  if (ensinando || mostrando || montagem.estado().completa) return;
  const proximo = montagem.proximoEncaixe();
  if (!proximo) return;
  mostrando = true;
  $('mostrar').disabled = true;
  tocar('clique');
  try {
    $('destinos').querySelector(`[data-destino="${proximo.destinoId}"]`)?.classList.add('destino--alvo');
    await dizerPista([{ texto: 'Esta peça vai aqui.' }]);
    await tentarEncaixe(proximo.destinoId, proximo.peca.id);
  } finally {
    mostrando = false;
    $('mostrar').disabled = false;
  }
});

$('continuar').addEventListener('click', () => {
  tocar('clique');
  parar();
  if (indiceDaCena >= cenas.length - 1) {
    encerrar();
    return;
  }
  indiceDaCena += 1;
  abrirCena();
});

$('de-novo').addEventListener('click', () => {
  tocar('clique');
  parar();
  abrirRodada();
});

window.addEventListener('pagehide', limpar);
window.addEventListener('beforeunload', limpar);
