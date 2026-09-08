import { montarCabecalho } from '../../shared/cabecalho.js';
import { tocar } from '../../shared/sons.js';
import { lancarConfete, animar } from '../../shared/confete.js';
import { definirPreferencia, falarSequencia, limpar, modoAcompanhado, parar, preparar } from '../../shared/fala.js';
import { nivelDaEtapa, obterConfiguracoes, registrarRodada, rodadasDe } from '../../shared/descobertas.js';
import { caminhoDaFigura, figura, nomeComArtigo } from '../../shared/catalogo-figuras.js';
import { DIRECOES, criarPartida, direcaoEntre, mapasDoNivel } from '../../Games/labirinto/jogo.js';

const ATIVIDADE = 'meu-primeiro-labirinto';
const $ = id => document.getElementById(id);
const telas = { convite: $('tela-convite'), brincadeira: $('tela-brincadeira'), fim: $('tela-fim') };
const configuracoes = obterConfiguracoes();
const nivel = nivelDaEtapa();
const mapas = mapasDoNivel(nivel);
const NOMES_NIVEL = { facil: 'Caminho fácil · 3 por 3', normal: 'Primeiros caminhos · 4 por 4', esperto: 'Modo esperto · 5 por 5' };
const TECLA_PARA_DIRECAO = Object.fromEntries(Object.entries(DIRECOES).map(([id, dados]) => [dados.tecla, id]));

definirPreferencia(configuracoes.voz);
montarCabecalho('Meu Primeiro Labirinto');

let indiceMapa = rodadasDe(ATIVIDADE) % mapas.length;
let partida = null;
let pistaAtual = [];
let dicaVisual = null;

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

const mesmaCasa = (a, b) => Boolean(a && b && a.linha === b.linha && a.coluna === b.coluna);

function conteudoDaCasa(simbolo, estado) {
  if (simbolo === 'G') return '<img class="casa-labirinto__figura" src="/figuras/casa.svg" alt="" aria-hidden="true">';
  if (simbolo === '*' && !estado.coletouEstrela) {
    return '<img class="casa-labirinto__figura casa-labirinto__figura--estrela" src="/figuras/estrela.svg" alt="" aria-hidden="true">';
  }
  return '';
}

function pintarTabuleiro() {
  const estado = partida.estado();
  const { mapa, posicao } = estado;
  const naTrilha = new Set(estado.trilha.map(item => `${item.linha},${item.coluna}`));
  $('tabuleiro').style.setProperty('--tamanho', mapa.tamanho);
  $('tabuleiro').setAttribute('aria-label', `Labirinto ${mapa.tamanho} por ${mapa.tamanho}. Carrinho e garagem visíveis.`);
  $('tabuleiro').innerHTML = mapa.layout.flatMap((linha, numeroLinha) => [...linha].map((simbolo, coluna) => {
    if (simbolo === '#') return '<div class="casa-labirinto casa-labirinto--parede" role="gridcell" aria-label="Parede"></div>';
    const casa = { linha: numeroLinha, coluna };
    const temCarrinho = mesmaCasa(casa, posicao);
    const classes = ['casa-labirinto', naTrilha.has(`${numeroLinha},${coluna}`) && !temCarrinho ? 'casa-labirinto--trilha' : '', mesmaCasa(casa, dicaVisual) ? 'casa-labirinto--dica' : ''].filter(Boolean).join(' ');
    const nome = temCarrinho ? 'Carrinho' : simbolo === 'G' ? 'Garagem' : simbolo === '*' && !estado.coletouEstrela ? 'Estrela' : 'Caminho';
    return `<button class="${classes}" type="button" role="gridcell" data-linha="${numeroLinha}" data-coluna="${coluna}" aria-label="${nome}">
      ${conteudoDaCasa(simbolo, estado)}
      ${temCarrinho ? '<img class="casa-labirinto__figura" src="/figuras/carro.svg" alt="" aria-hidden="true">' : ''}
    </button>`;
  })).join('');
  $('status-estrela').hidden = !mapa.estrela || estado.coletouEstrela;
}

function limparDica() {
  dicaVisual = null;
  document.querySelectorAll('.controle--dica').forEach(item => item.classList.remove('controle--dica'));
}

function abrirMapa({ falarInstrucao = true } = {}) {
  parar();
  limparDica();
  partida = criarPartida(mapas[indiceMapa]);
  $('nivel').textContent = NOMES_NIVEL[nivel];
  $('retorno').textContent = '';
  $('retorno').className = 'feedback retorno retorno--labirinto';
  mostrarTela('brincadeira');
  pintarTabuleiro();
  const texto = nivel === 'esperto' ? 'Pegue a estrela e leve o carrinho até a garagem!' : 'Leve o carrinho até a garagem!';
  $('instrucao').textContent = texto;
  if (falarInstrucao) dizerPista([{ texto }, { texto: 'Use as setas.' }]);
}

async function concluir() {
  const { figurinha } = registrarRodada(ATIVIDADE);
  mostrarTela('fim');
  $('figurinha').src = caminhoDaFigura(figurinha);
  $('figurinha').alt = `Figurinha nova: ${figura(figurinha)?.nome || figurinha}`;
  $('texto-fim').textContent = `Você ganhou uma figurinha: ${nomeComArtigo(figurinha)}!`;
  tocar('vitoria');
  lancarConfete();
  await dizerPista([{ texto: 'Muito bem! O carrinho chegou à garagem!' }, { texto: `Você ganhou uma figurinha: ${nomeComArtigo(figurinha)}.` }]);
}

async function mover(direcao) {
  if (!partida || partida.estado().concluida) return;
  limparDica();
  const resultado = partida.mover(direcao);
  if (!resultado.valido) {
    tocar('clique');
    $('retorno').textContent = resultado.motivo === 'parede' ? 'Tem um jardim aí. Tente outra seta!' : 'O caminho continua para outro lado!';
    animar($('tabuleiro'), 'tremer');
    return;
  }
  tocar(resultado.pegouEstrela ? 'acerto' : 'clique');
  pintarTabuleiro();
  if (resultado.pegouEstrela) {
    $('retorno').textContent = 'Você pegou a estrela! Agora vá até a garagem.';
    $('retorno').className = 'feedback retorno retorno--labirinto feedback--certo';
    await dizerPista([{ texto: 'Você pegou a estrela! Agora vá até a garagem.' }]);
  } else if (resultado.chegouSemEstrela) {
    $('retorno').textContent = 'A estrela ficou para trás. Vamos buscá-la!';
    await dizerPista([{ texto: 'A estrela ficou para trás. Vamos buscá-la!' }]);
  } else {
    $('retorno').textContent = '';
    $('retorno').className = 'feedback retorno retorno--labirinto';
  }
  if (resultado.concluida) concluir();
}

function mostrarDica() {
  if (!partida) return;
  limparDica();
  const dica = partida.dica();
  if (!dica) return;
  dicaVisual = dica.destino;
  document.querySelector(`[data-direcao="${dica.direcao}"]`)?.classList.add('controle--dica');
  pintarTabuleiro();
  const frase = `Tente ir ${DIRECOES[dica.direcao].nome}.`;
  $('retorno').textContent = frase;
  $('retorno').className = 'feedback retorno retorno--labirinto';
  dizerPista([{ texto: frase }]);
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
  abrirMapa();
});
document.querySelector('.controles').addEventListener('click', evento => {
  const botao = evento.target.closest('[data-direcao]');
  if (botao) mover(botao.dataset.direcao);
});
$('tabuleiro').addEventListener('click', evento => {
  const casa = evento.target.closest('[data-linha][data-coluna]');
  if (!casa || !partida) return;
  const destino = { linha: Number(casa.dataset.linha), coluna: Number(casa.dataset.coluna) };
  const direcao = direcaoEntre(partida.estado().posicao, destino);
  if (direcao) mover(direcao);
});
$('dica').addEventListener('click', () => { tocar('clique'); mostrarDica(); });
$('recomecar').addEventListener('click', () => {
  tocar('clique'); limparDica(); partida.reiniciar();
  $('retorno').textContent = 'Vamos tentar este caminho de novo!';
  pintarTabuleiro();
});
$('outro-mapa').addEventListener('click', () => {
  tocar('clique'); indiceMapa = (indiceMapa + 1) % mapas.length; abrirMapa();
});
$('repetir').addEventListener('click', () => pistaAtual.length && falarSequencia(pistaAtual));
$('de-novo').addEventListener('click', () => {
  tocar('clique'); indiceMapa = (indiceMapa + 1) % mapas.length; abrirMapa();
});
window.addEventListener('keydown', evento => {
  const direcao = TECLA_PARA_DIRECAO[evento.key];
  if (!direcao || telas.brincadeira.hidden) return;
  evento.preventDefault(); mover(direcao);
});
window.addEventListener('pagehide', limpar);
window.addEventListener('beforeunload', limpar);
