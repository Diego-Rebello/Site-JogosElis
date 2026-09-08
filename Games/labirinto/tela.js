import { montarCabecalho } from '../../shared/cabecalho.js';
import { tocar } from '../../shared/sons.js';
import { animar, lancarConfete } from '../../shared/confete.js';
import { obterConfiguracoes, registrarPartida } from '../../shared/progresso.js';
import {
  DIRECOES, MODOS_LABIRINTO, calcularEstrelasLabirinto, criarPartida, direcaoEntre,
  gerarMapaDoModo, haParedeEntre,
} from './jogo.js';

const $ = id => document.getElementById(id);
const telas = { inicio: $('tela-inicio'), demo: $('tela-demo'), jogo: $('tela-jogo'), fim: $('tela-fim') };
const TEMAS = {
  dinossauro: { personagem: { tipo: 'imagem', valor: '/figuras/dinossauro.svg', nome: 'dinossauro' }, destino: { tipo: 'emoji', valor: '🪺', nome: 'ninho' }, missao: 'Leve o dinossauro até o ninho!' },
  carrinho: { personagem: { tipo: 'imagem', valor: '/figuras/carro.svg', nome: 'carrinho' }, destino: { tipo: 'imagem', valor: '/figuras/casa.svg', nome: 'garagem' }, missao: 'Leve o carrinho até a garagem!' },
  cachorro: { personagem: { tipo: 'imagem', valor: '/figuras/cachorro.svg', nome: 'cachorro' }, destino: { tipo: 'imagem', valor: '/figuras/casa.svg', nome: 'casinha' }, missao: 'Leve o cachorro até a casinha!' },
};
const ITEM_VISUAL = {
  chave: { imagem: '/figuras/chave.svg', nome: 'chave' },
  'item-1': { imagem: '/figuras/chave.svg', nome: 'chave' },
  'item-2': { imagem: '/figuras/estrela.svg', nome: 'estrela' },
};
const TECLA_PARA_DIRECAO = Object.fromEntries(Object.entries(DIRECOES).map(([id, dados]) => [dados.tecla, id]));
const CHAVE_ESTATISTICAS = 'jogos-elis:labirinto:estatisticas';

montarCabecalho('Labirinto de Aventuras');

let modo = MODOS_LABIRINTO[obterConfiguracoes().niveis.labirinto] ? obterConfiguracoes().niveis.labirinto : 'aventureiro';
let tema = 'dinossauro';
let partida = null;
let numeroMapa = 0;
let sementeDaRodada = Date.now();
let totais = { movimentos: 0, dicas: 0 };
let dicaVisual = null;
let demonstracaoId = 0;

function mostrarTela(nome) {
  Object.entries(telas).forEach(([id, elemento]) => { elemento.hidden = id !== nome; });
}

function selecionar(grupo, atributo, valor) {
  document.querySelectorAll(`#${grupo} [${atributo}]`).forEach(botao => {
    botao.setAttribute('aria-pressed', String(botao.getAttribute(atributo) === valor));
  });
}

function visual(item, classe = '') {
  if (item.tipo === 'emoji') return `<span class="emoji-casa ${classe}" aria-hidden="true">${item.valor}</span>`;
  return `<img class="figura-casa ${classe}" src="${item.valor}" alt="" aria-hidden="true">`;
}

const mesmaCasa = (a, b) => Boolean(a && b && a.linha === b.linha && a.coluna === b.coluna);

function classesDeParede(mapa, posicao) {
  return Object.entries(DIRECOES).flatMap(([direcao, delta]) => {
    const vizinho = { linha: posicao.linha + delta.linha, coluna: posicao.coluna + delta.coluna };
    return haParedeEntre(mapa, posicao, vizinho) ? [`casa-labirinto--${direcao === 'cima' ? 'topo' : direcao === 'baixo' ? 'baixo' : direcao}`] : [];
  });
}

function itemPendenteNaCasa(estado, posicao) {
  return estado.mapa.itens.find(item => mesmaCasa(item.posicao, posicao) && !estado.itensColetados.includes(item.id));
}

function pintar() {
  const estado = partida.estado();
  const { mapa, posicao } = estado;
  const trilha = new Set(estado.trilha.map(item => `${item.linha},${item.coluna}`));
  $('tabuleiro').style.setProperty('--tamanho', mapa.tamanho);
  $('tabuleiro').classList.toggle('tabuleiro--desafio', mapa.tamanho === 9);
  $('tabuleiro').setAttribute('aria-label', `Labirinto ${mapa.tamanho} por ${mapa.tamanho}`);
  $('tabuleiro').innerHTML = mapa.layout.flatMap((linha, indiceLinha) => [...linha].map((simbolo, coluna) => {
    const casa = { linha: indiceLinha, coluna };
    const personagemAqui = mesmaCasa(casa, posicao);
    const destinoAqui = mesmaCasa(casa, mapa.destino);
    const item = itemPendenteNaCasa(estado, casa);
    const classes = ['casa-labirinto', ...classesDeParede(mapa, casa), trilha.has(`${indiceLinha},${coluna}`) && !personagemAqui ? 'casa-labirinto--trilha' : '', mesmaCasa(casa, dicaVisual) ? 'casa-labirinto--dica' : ''].filter(Boolean).join(' ');
    const conteudo = `${destinoAqui ? visual(TEMAS[tema].destino) : ''}${item ? `<img class="figura-casa figura-casa--item" src="${ITEM_VISUAL[item.id].imagem}" alt="" aria-hidden="true">` : ''}${personagemAqui ? visual(TEMAS[tema].personagem) : ''}`;
    const nome = personagemAqui ? TEMAS[tema].personagem.nome : destinoAqui ? TEMAS[tema].destino.nome : item ? ITEM_VISUAL[item.id].nome : 'caminho';
    return mapa.tamanho === 9
      ? `<div class="${classes}" role="gridcell" aria-label="${nome}">${conteudo}</div>`
      : `<button class="${classes}" type="button" role="gridcell" data-linha="${indiceLinha}" data-coluna="${coluna}" aria-label="${nome}">${conteudo}</button>`;
  })).join('');
  $('movimentos').textContent = estado.movimentos;
  $('dicas-usadas').textContent = estado.dicas;
  $('mapa-atual').textContent = `Mapa ${numeroMapa + 1} de 3 · ${MODOS_LABIRINTO[modo].nome}`;
  const pendentes = estado.mapa.itens.filter(item => !estado.itensColetados.includes(item.id)).map(item => ITEM_VISUAL[item.id].nome);
  $('missao').textContent = pendentes.length ? `${TEMAS[tema].missao} Pegue ${pendentes.join(' e ')}.` : TEMAS[tema].missao;
}

function limparDica() {
  dicaVisual = null;
  document.querySelectorAll('.controle--dica').forEach(elemento => elemento.classList.remove('controle--dica'));
}

function novoMapa() {
  limparDica();
  const semente = `${sementeDaRodada}-${numeroMapa}-${Math.random()}`;
  partida = criarPartida(gerarMapaDoModo(modo, { semente }));
  $('retorno').textContent = '';
  $('retorno').className = 'feedback retorno-labirinto';
  $('proximo').hidden = true;
  document.querySelectorAll('.controle, #dica, #recomecar, #trocar').forEach(botao => { botao.disabled = false; });
  mostrarTela('jogo');
  pintar();
}

function salvarEstatisticas(estrelas) {
  try {
    const todas = JSON.parse(localStorage.getItem(CHAVE_ESTATISTICAS) || '{}');
    const anterior = todas[modo] || { rodadas: 0, mapas: 0, movimentos: 0, dicas: 0, melhorEstrelas: 0 };
    todas[modo] = {
      rodadas: anterior.rodadas + 1,
      mapas: anterior.mapas + 3,
      movimentos: anterior.movimentos + totais.movimentos,
      dicas: anterior.dicas + totais.dicas,
      melhorEstrelas: Math.max(anterior.melhorEstrelas, estrelas),
      ultimaEm: new Date().toISOString(),
    };
    localStorage.setItem(CHAVE_ESTATISTICAS, JSON.stringify(todas));
  } catch { /* O jogo continua mesmo sem armazenamento. */ }
}

function encerrarRodada() {
  const estrelas = calcularEstrelasLabirinto(totais.dicas, 3);
  registrarPartida('labirinto', { acertos: 3, erros: totais.dicas, estrelas });
  salvarEstatisticas(estrelas);
  $('estrelas').textContent = '⭐'.repeat(estrelas);
  $('estrelas').setAttribute('aria-label', `${estrelas} estrelas conquistadas`);
  $('total-movimentos').textContent = totais.movimentos;
  $('total-dicas').textContent = totais.dicas;
  mostrarTela('fim');
  tocar('vitoria');
  lancarConfete();
}

function chegou() {
  $('retorno').textContent = numeroMapa === 2 ? 'Você completou a aventura!' : 'Destino alcançado! Muito bem!';
  $('retorno').className = 'feedback feedback--certo retorno-labirinto';
  document.querySelectorAll('.controle, #dica, #recomecar, #trocar').forEach(botao => { botao.disabled = true; });
  tocar('vitoria');
  lancarConfete(650);
  if (numeroMapa === 2) setTimeout(encerrarRodada, 700);
  else $('proximo').hidden = false;
}

function mover(direcao) {
  if (!partida?.estado() || partida.estado().concluida) return;
  limparDica();
  const resultado = partida.mover(direcao);
  if (!resultado.valido) {
    tocar('clique');
    $('retorno').textContent = 'Há uma parede aí. Tente outro caminho!';
    animar($('tabuleiro'), 'tremer');
    return;
  }
  totais.movimentos += 1;
  tocar(resultado.itemColetado ? 'acerto' : 'clique');
  $('retorno').textContent = resultado.itemColetado ? `Você encontrou ${ITEM_VISUAL[resultado.itemColetado].nome}!` : resultado.chegouSemItens ? 'Ainda falta buscar os itens!' : '';
  pintar();
  if (resultado.concluida) chegou();
}

function mostrarDica() {
  limparDica();
  const dica = partida?.dica();
  if (!dica) return;
  totais.dicas += 1;
  dicaVisual = dica.destino;
  document.querySelector(`[data-direcao="${dica.direcao}"]`)?.classList.add('controle--dica');
  $('retorno').textContent = `Tente ir ${DIRECOES[dica.direcao].nome}.`;
  pintar();
}

function comecarRodada() {
  demonstracaoId += 1;
  numeroMapa = 0;
  sementeDaRodada = Date.now();
  totais = { movimentos: 0, dicas: 0 };
  novoMapa();
}

async function demonstrar() {
  const id = ++demonstracaoId;
  mostrarTela('demo');
  $('experimentar').hidden = true;
  $('mini-personagem').className = 'mini-personagem';
  $('texto-demo').textContent = 'Primeiro, vá para a direita...';
  await new Promise(resolve => setTimeout(resolve, 550));
  if (id !== demonstracaoId) return;
  $('mini-personagem').classList.add('mini-personagem--um');
  tocar('clique');
  $('texto-demo').textContent = 'Mais uma vez para a direita!';
  await new Promise(resolve => setTimeout(resolve, 650));
  if (id !== demonstracaoId) return;
  $('mini-personagem').classList.replace('mini-personagem--um', 'mini-personagem--dois');
  tocar('acerto');
  $('texto-demo').textContent = 'Muito bem! Agora é sua vez.';
  $('experimentar').hidden = false;
  $('experimentar').focus();
}

$('temas').addEventListener('click', evento => {
  const botao = evento.target.closest('[data-tema]');
  if (!botao) return;
  tema = botao.dataset.tema;
  selecionar('temas', 'data-tema', tema);
  tocar('clique');
});
$('modos').addEventListener('click', evento => {
  const botao = evento.target.closest('[data-modo]');
  if (!botao) return;
  modo = botao.dataset.modo;
  selecionar('modos', 'data-modo', modo);
  tocar('clique');
});
selecionar('modos', 'data-modo', modo);
$('comecar').addEventListener('click', demonstrar);
$('pular-demo').addEventListener('click', comecarRodada);
$('experimentar').addEventListener('click', comecarRodada);
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
$('dica').addEventListener('click', mostrarDica);
$('recomecar').addEventListener('click', () => { limparDica(); partida.reiniciar(); $('retorno').textContent = 'Mapa recomeçado!'; pintar(); });
$('trocar').addEventListener('click', novoMapa);
$('proximo').addEventListener('click', () => { numeroMapa += 1; novoMapa(); });
$('jogar-novamente').addEventListener('click', comecarRodada);
$('configurar').addEventListener('click', () => mostrarTela('inicio'));
window.addEventListener('keydown', evento => {
  const direcao = TECLA_PARA_DIRECAO[evento.key];
  if (!direcao || telas.jogo.hidden) return;
  evento.preventDefault();
  mover(direcao);
});
