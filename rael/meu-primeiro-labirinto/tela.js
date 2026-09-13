import { montarCabecalho } from '../../shared/cabecalho.js';
import { tocar } from '../../shared/sons.js';
import { lancarConfete, animar } from '../../shared/confete.js';
import { definirPreferencia, falarSequencia, limpar, modoAcompanhado, parar, preparar } from '../../shared/fala.js';
import { nivelDaEtapa, obterConfiguracoes, registrarRodada, rodadasDe } from '../../shared/descobertas.js';
import { caminhoDaFigura, figura, nomeComArtigo } from '../../shared/catalogo-figuras.js';
import {
  DIRECOES, criarPartida, direcaoEntre, haParedeEntre, mapasDoNivel, posicoesDaRota, resolverMapa,
} from '../../Games/labirinto/jogo.js';

const ATIVIDADE = 'meu-primeiro-labirinto';
const $ = id => document.getElementById(id);
const telas = { convite: $('tela-convite'), brincadeira: $('tela-brincadeira'), fim: $('tela-fim') };
const configuracoes = obterConfiguracoes();
const nivel = nivelDaEtapa();
const modoClassico = configuracoes.labirinto === 'classico';
const mapas = mapasDoNivel(nivel, { classico: modoClassico });
const NOMES_NIVEL = modoClassico ? {
  facil: 'Clássico · 9 por 9', normal: 'Clássico · 12 por 12', esperto: 'Clássico · 15 por 15',
} : {
  facil: 'Explorar · 15 por 15', normal: 'Planejar · 20 por 20', esperto: 'Combinar · 25 por 25',
};
const TECLA_PARA_DIRECAO = Object.fromEntries(Object.entries(DIRECOES).map(([id, dados]) => [dados.tecla, id]));
const FIGURAS = {
  G: { src: '/figuras/casa.svg', nome: 'garagem' },
  '*': { src: '/figuras/estrela.svg', nome: 'estrela' },
  K: { src: '/figuras/chave.svg', nome: 'chave' },
  S: { src: '/figuras/labirinto/semaforo.svg', nome: 'semáforo' },
  L: { src: '/figuras/labirinto/alavanca.svg', nome: 'alavanca' },
  B: { src: '/figuras/labirinto/ponte.svg', nome: 'ponte' },
  P: { src: '/figuras/labirinto/portao.svg', nome: 'portão' },
  X: { src: '/figuras/labirinto/obras.svg', nome: 'trecho em obras' },
};
const VISIVEIS = [5, 9, Number.POSITIVE_INFINITY];

definirPreferencia(configuracoes.voz);
montarCabecalho('Meu Primeiro Labirinto');

let indiceMapa = rodadasDe(ATIVIDADE) % mapas.length;
let partida = null;
let pistaAtual = [];
let dicaVisual = null;
let centroVisual = null;
let indiceVisao = VISIVEIS.length - 1;
let bloqueiosSeguidos = { motivo: '', quantidade: 0 };
let tipoDemo = null;

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
const idDaCasa = posicao => `${posicao.linha},${posicao.coluna}`;
const temSimbolo = (mapa, simbolo) => mapa.layout.some(linha => linha.includes(simbolo));

function imagem(src, classe = '') {
  return `<img class="casa-labirinto__figura ${classe}" src="${src}" alt="" aria-hidden="true">`;
}

function conteudoDaCasa(simbolo, estado) {
  const id = idDaCasa(estado.casaRenderizada);
  if (simbolo === 'G') return imagem(FIGURAS.G.src);
  if (simbolo === '*' && !estado.itensColetados.includes('estrela')) return imagem(FIGURAS['*'].src, 'casa-labirinto__figura--item');
  if (simbolo === 'K' && !estado.itensColetados.includes('chave')) return imagem(FIGURAS.K.src, 'casa-labirinto__figura--item');
  if (simbolo === 'S') return imagem(estado.semaforosVerdes.includes(id) ? '/figuras/labirinto/semaforo-verde.svg' : FIGURAS.S.src);
  if (simbolo === 'L') return imagem(FIGURAS.L.src, estado.alavancasAcionadas.includes(id) ? 'casa-labirinto__figura--aberto' : '');
  if (simbolo === 'B') return imagem(FIGURAS.B.src, estado.pontesBaixadas.includes(id) ? 'casa-labirinto__figura--aberto' : '');
  if (simbolo === 'P') return imagem(FIGURAS.P.src, estado.portoesAbertos.includes(id) ? 'casa-labirinto__figura--aberto' : '');
  if (simbolo === 'X') return imagem(FIGURAS.X.src);
  return '';
}

function classesDasParedes(mapa, casa, prefixo = 'casa-labirinto--parede-') {
  return Object.entries(DIRECOES).filter(([, delta]) => haParedeEntre(mapa, casa, {
    linha: casa.linha + delta.linha, coluna: casa.coluna + delta.coluna,
  })).map(([direcao]) => `${prefixo}${direcao}`);
}

function limitesDaJanela(mapa, centro) {
  const quantidade = Math.min(VISIVEIS[indiceVisao], mapa.tamanho);
  const metade = Math.floor(quantidade / 2);
  const linha = Math.max(0, Math.min(mapa.tamanho - quantidade, centro.linha - metade));
  const coluna = Math.max(0, Math.min(mapa.tamanho - quantidade, centro.coluna - metade));
  return { quantidade, linha, coluna };
}

function nomeDaCasa(simbolo, estado, temCarrinho) {
  if (temCarrinho) return 'Carrinho';
  if (simbolo === '*' && estado.itensColetados.includes('estrela')) return 'Caminho';
  if (simbolo === 'K' && estado.itensColetados.includes('chave')) return 'Caminho';
  return FIGURAS[simbolo]?.nome || 'Caminho';
}

function decoracao(casa, simbolo) {
  if (simbolo !== '.') return '';
  const valor = (casa.linha * 31 + casa.coluna * 17) % 97;
  if (valor === 7) return 'casa-labirinto--lago';
  if (valor === 19) return 'casa-labirinto--praca';
  if (valor === 41) return 'casa-labirinto--jardim';
  return '';
}

function objetivosDoMapa(estado) {
  const objetivos = [];
  const adicionar = (simbolo, feito, posicao) => objetivos.push({ simbolo, feito, posicao, ...FIGURAS[simbolo] });
  const obstaculo = simbolo => estado.mapa.obstaculos.find(item => item.simbolo === simbolo);
  if (temSimbolo(estado.mapa, 'S')) {
    const item = obstaculo('S'); adicionar('S', estado.semaforosVerdes.includes(item.id), item.posicao);
  }
  if (temSimbolo(estado.mapa, 'K')) adicionar('K', estado.itensColetados.includes('chave'), estado.mapa.itens.find(item => item.simbolo === 'K')?.posicao);
  if (temSimbolo(estado.mapa, 'P')) {
    const item = obstaculo('P'); adicionar('P', estado.portoesAbertos.includes(item.id), item.posicao);
  }
  if (temSimbolo(estado.mapa, 'L')) {
    const item = obstaculo('L'); adicionar('L', estado.alavancasAcionadas.includes(item.id), item.posicao);
  }
  if (temSimbolo(estado.mapa, 'B')) {
    const item = obstaculo('B'); adicionar('B', estado.pontesBaixadas.includes(item.id), item.posicao);
  }
  if (temSimbolo(estado.mapa, '*')) adicionar('*', estado.itensColetados.includes('estrela'), estado.mapa.estrela);
  adicionar('G', estado.concluida, estado.mapa.destino);
  return objetivos;
}

function rotaVisualDoEstado(estado) {
  const passos = resolverMapa(estado.mapa, estado.posicao, estado.itensColetados, estado) || [];
  return new Set(posicoesDaRota(estado.mapa, passos, estado.posicao).map(idDaCasa));
}

function pintarObjetivos(estado) {
  $('objetivos').innerHTML = objetivosDoMapa(estado).map(objetivo => `
    <div class="objetivo ${objetivo.feito ? 'objetivo--feito' : ''}" data-objetivo="${objetivo.simbolo}">
      <span class="objetivo__figura"><img src="${objetivo.src}" alt="${objetivo.nome}"></span>
      <span class="objetivo__nome">${objetivo.nome}</span>
    </div>`).join('');
}

function atualizarAcao() {
  const botao = $('acao-contextual');
  const acao = partida?.acaoDisponivel();
  botao.hidden = !acao;
  if (!acao) return;
  const dados = acao.tipo === 'esperar'
    ? { src: FIGURAS.S.src, texto: 'Esperar o verde', icone: '✋' }
    : { src: FIGURAS.L.src, texto: 'Baixar a ponte', icone: '👇' };
  botao.dataset.acao = acao.tipo;
  botao.setAttribute('aria-label', dados.texto);
  botao.innerHTML = `<span aria-hidden="true">${dados.icone}</span><img src="${dados.src}" alt=""><span>${dados.texto}</span>`;
}

function pintarTabuleiro() {
  const estado = partida.estado();
  const { mapa, posicao } = estado;
  const centro = centroVisual || posicao;
  const janela = limitesDaJanela(mapa, centro);
  const naTrilha = new Set(estado.trilha.map(idDaCasa));
  const naRota = rotaVisualDoEstado(estado);
  const mapaInteiro = janela.quantidade === mapa.tamanho;
  $('tabuleiro').style.setProperty('--visiveis', janela.quantidade);
  $('tabuleiro').classList.toggle('tabuleiro--inteiro', mapaInteiro);
  $('tabuleiro').setAttribute('aria-label', mapaInteiro
    ? `Mapa inteiro do labirinto ${mapa.tamanho} por ${mapa.tamanho}. O caminho azul mostra como chegar às figuras.`
    : `Parte visível do labirinto ${mapa.tamanho} por ${mapa.tamanho}.`);
  const casas = [];
  for (let linha = janela.linha; linha < janela.linha + janela.quantidade; linha += 1) {
    for (let coluna = janela.coluna; coluna < janela.coluna + janela.quantidade; coluna += 1) {
      const simbolo = mapa.layout[linha][coluna];
      const casa = { linha, coluna };
      const temCarrinho = mesmaCasa(casa, posicao);
      const classes = [
        'casa-labirinto', ...classesDasParedes(mapa, casa), decoracao(casa, simbolo),
        simbolo === 'X' ? 'casa-labirinto--obras' : '',
        naRota.has(idDaCasa(casa)) ? 'casa-labirinto--rota' : '',
        FIGURAS[simbolo] ? 'casa-labirinto--objetivo' : '',
        naTrilha.has(idDaCasa(casa)) && !temCarrinho ? 'casa-labirinto--trilha' : '',
        mesmaCasa(casa, dicaVisual) ? 'casa-labirinto--dica' : '',
      ].filter(Boolean).join(' ');
      const adjacente = Boolean(direcaoEntre(posicao, casa)) && !haParedeEntre(mapa, posicao, casa);
      const tag = adjacente ? 'button' : 'div';
      const atributos = adjacente ? `type="button" data-linha="${linha}" data-coluna="${coluna}"` : '';
      const estadoDaCasa = { ...estado, casaRenderizada: casa };
      casas.push(`<${tag} class="${classes}" ${atributos} role="gridcell" aria-label="${nomeDaCasa(simbolo, estado, temCarrinho)}">
        ${conteudoDaCasa(simbolo, estadoDaCasa)}
        ${temCarrinho ? imagem('/figuras/carro.svg') : ''}
      </${tag}>`);
    }
  }
  $('tabuleiro').innerHTML = casas.join('');
  $('diminuir').disabled = indiceVisao === VISIVEIS.length - 1;
  $('ampliar').disabled = indiceVisao === 0;
  pintarObjetivos(estado);
  atualizarAcao();
}

function pintarMapaGeral() {
  const estado = partida.estado();
  const { mapa, posicao } = estado;
  const trilha = new Set(estado.trilha.map(idDaCasa));
  const rota = rotaVisualDoEstado(estado);
  const especiais = new Set([mapa.destino, ...mapa.itens.map(item => item.posicao), ...mapa.obstaculos.map(item => item.posicao)].map(idDaCasa));
  $('tabuleiro-geral').style.setProperty('--tamanho', mapa.tamanho);
  $('tabuleiro-geral').innerHTML = mapa.layout.flatMap((linha, numeroLinha) => [...linha].map((simbolo, coluna) => {
    const casa = { linha: numeroLinha, coluna };
    const classes = [
      'casa-geral', ...classesDasParedes(mapa, casa, 'casa-geral--parede-'),
      trilha.has(idDaCasa(casa)) ? 'casa-geral--visitada' : '', mesmaCasa(casa, posicao) ? 'casa-geral--atual' : '',
      rota.has(idDaCasa(casa)) ? 'casa-geral--rota' : '',
      especiais.has(idDaCasa(casa)) && simbolo !== 'X' ? 'casa-geral--objetivo' : '', simbolo === 'X' ? 'casa-geral--obras' : '',
    ].filter(Boolean).join(' ');
    const estadoDaCasa = { ...estado, casaRenderizada: casa };
    const figura = mesmaCasa(casa, posicao) ? imagem('/figuras/carro.svg') : conteudoDaCasa(simbolo, estadoDaCasa);
    const conteudo = figura.replaceAll('casa-labirinto__figura', 'casa-geral__figura');
    return `<span class="${classes}" title="${nomeDaCasa(simbolo, estado, mesmaCasa(casa, posicao))}">${conteudo}</span>`;
  })).join('');
}

function limparDica() {
  dicaVisual = null;
  centroVisual = null;
  document.querySelectorAll('.controle--dica, .objetivo--dica').forEach(item => item.classList.remove('controle--dica', 'objetivo--dica'));
}

function tiposDeDemonstracao() {
  if (!partida) return [];
  const mapa = partida.estado().mapa;
  return [temSimbolo(mapa, 'S') && 'semaforo', temSimbolo(mapa, 'L') && 'ponte', temSimbolo(mapa, 'P') && 'portao', temSimbolo(mapa, 'X') && 'obras'].filter(Boolean);
}

function dadosDaDemo(tipo) {
  return {
    semaforo: { antes: FIGURAS.S.src, gesto: '✋', depois: '/figuras/labirinto/semaforo-verde.svg', texto: 'Pare no vermelho. Toque no semáforo para esperar o verde.' },
    ponte: { antes: FIGURAS.L.src, gesto: '👇', depois: FIGURAS.B.src, texto: 'Encontre a alavanca. Toque nela para baixar a ponte.' },
    portao: { antes: FIGURAS.K.src, gesto: '➜', depois: FIGURAS.P.src, texto: 'Pegue a chave com a mesma figura. Depois o portão abre.' },
    obras: { antes: FIGURAS.X.src, gesto: '↶', depois: '/figuras/carro.svg', texto: 'A rua está em obras. Procure o caminho que passa ao lado.' },
  }[tipo];
}

function abrirDialogo(dialogo) {
  if (typeof dialogo.showModal === 'function') dialogo.showModal();
  else dialogo.setAttribute('open', '');
}

function fecharDialogo(dialogo) {
  if (typeof dialogo.close === 'function') dialogo.close();
  else dialogo.removeAttribute('open');
}

function abrirDemonstracao(tipo = tiposDeDemonstracao()[0]) {
  if (!tipo) return;
  tipoDemo = tipo;
  const dados = dadosDaDemo(tipo);
  $('demonstracao-visual').innerHTML = `
    <div class="passo-demo"><img src="${dados.antes}" alt=""></div>
    <span class="seta-demo" aria-hidden="true">${dados.gesto} ➜</span>
    <div class="passo-demo"><img src="${dados.depois}" alt=""></div>`;
  abrirDialogo($('demonstracao'));
  dizerPista([{ texto: dados.texto }]);
}

function abrirMapa({ falarInstrucao = true, demonstrar = false } = {}) {
  parar();
  limparDica();
  bloqueiosSeguidos = { motivo: '', quantidade: 0 };
  partida = criarPartida(mapas[indiceMapa]);
  $('nivel').textContent = `${NOMES_NIVEL[nivel]} · mapa ${indiceMapa + 1} de ${mapas.length}`;
  $('retorno').textContent = '';
  $('retorno').className = 'feedback retorno retorno--labirinto';
  mostrarTela('brincadeira');
  pintarTabuleiro();
  const texto = modoClassico
    ? (nivel === 'esperto' ? 'Pegue a estrela e leve o carrinho até a garagem!' : 'Leve o carrinho até a garagem!')
    : 'Siga as figuras e leve o carrinho até a garagem!';
  $('instrucao').textContent = texto;
  if (falarInstrucao) dizerPista([{ texto }, { texto: 'Use as setas e os botões com figuras.' }]);
  if (demonstrar) abrirDemonstracao();
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

function registrarBloqueio(motivo) {
  bloqueiosSeguidos = bloqueiosSeguidos.motivo === motivo
    ? { motivo, quantidade: bloqueiosSeguidos.quantidade + 1 } : { motivo, quantidade: 1 };
  if (bloqueiosSeguidos.quantidade < 2) return;
  const tipo = { semaforo: 'semaforo', ponte: 'ponte', portao: 'portao', obras: 'obras' }[motivo];
  if (tipo) abrirDemonstracao(tipo);
  bloqueiosSeguidos.quantidade = 0;
}

async function mover(direcao) {
  if (!partida || partida.estado().concluida) return;
  limparDica();
  const resultado = partida.mover(direcao);
  if (!resultado.valido) {
    tocar('clique');
    const mensagens = {
      parede: 'Tem um jardim aí. Tente outra seta!', limite: 'O caminho continua para outro lado!',
      semaforo: 'O sinal está vermelho. Pare e toque no semáforo!', ponte: 'A ponte está levantada. Procure a alavanca!',
      portao: 'O portão precisa da chave!', obras: 'A rua está em obras. Faça o desvio!',
    };
    $('retorno').textContent = mensagens[resultado.motivo] || 'Tente outro caminho!';
    dicaVisual = resultado.alvo || null;
    registrarBloqueio(resultado.motivo);
    animar($('janela-tabuleiro'), 'tremer');
    pintarTabuleiro();
    return;
  }
  bloqueiosSeguidos = { motivo: '', quantidade: 0 };
  tocar(resultado.itemColetado || resultado.abriuPortao ? 'acerto' : 'clique');
  pintarTabuleiro();
  if (resultado.itemColetado === 'chave') {
    $('retorno').textContent = 'Você pegou a chave! Agora encontre o portão.';
    await dizerPista([{ texto: 'Você pegou a chave! Agora encontre o portão.' }]);
  } else if (resultado.pegouEstrela) {
    $('retorno').textContent = 'Você pegou a estrela! Agora vá até a garagem.';
    await dizerPista([{ texto: 'Você pegou a estrela! Agora vá até a garagem.' }]);
  } else if (resultado.abriuPortao) {
    $('retorno').textContent = 'A chave abriu o portão!';
    await dizerPista([{ texto: 'A chave abriu o portão!' }]);
  } else if (resultado.chegouSemItens) {
    const pendente = objetivosDoMapa(resultado.estado).find(item => !item.feito && item.simbolo !== 'G');
    $('retorno').textContent = `Ainda falta ${pendente?.nome || 'uma figura'}!`;
    await dizerPista([{ texto: $('retorno').textContent }]);
  } else {
    $('retorno').textContent = '';
  }
  if (resultado.concluida) concluir();
}

async function agir() {
  const tipo = $('acao-contextual').dataset.acao;
  limparDica();
  const resultado = partida?.agir(tipo);
  if (!resultado?.valido) return;
  tocar('acerto');
  const texto = resultado.acao === 'esperar' ? 'Ficou verde! Agora pode atravessar.' : 'A ponte baixou! Agora pode passar.';
  $('retorno').textContent = texto;
  pintarTabuleiro();
  await dizerPista([{ texto }]);
}

function objetivoPendente(estado) {
  return objetivosDoMapa(estado).find(item => !item.feito && item.simbolo !== 'G')
    || objetivosDoMapa(estado).find(item => !item.feito);
}

function mostrarDica() {
  if (!partida) return;
  dicaVisual = null;
  centroVisual = null;
  document.querySelectorAll('.controle--dica, .objetivo--dica').forEach(item => item.classList.remove('controle--dica', 'objetivo--dica'));
  const dica = partida.dica();
  if (!dica) return;
  const pendente = objetivoPendente(partida.estado());
  dicaVisual = dica.destino;
  pintarTabuleiro();
  if (pendente) document.querySelector(`[data-objetivo="${pendente.simbolo}"]`)?.classList.add('objetivo--dica');
  if (dica.direcao) document.querySelector(`[data-direcao="${dica.direcao}"]`)?.classList.add('controle--dica');
  const frase = dica.acao === 'esperar' ? 'Toque no semáforo e espere o verde.'
    : dica.acao === 'acionar' ? 'Toque na alavanca para baixar a ponte.'
      : `Tente ir ${DIRECOES[dica.direcao].nome}.`;
  $('retorno').textContent = frase;
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
  abrirMapa({ demonstrar: !modoClassico });
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
$('acao-contextual').addEventListener('click', agir);
$('dica').addEventListener('click', () => { tocar('clique'); mostrarDica(); });
$('recomecar').addEventListener('click', () => {
  tocar('clique'); limparDica(); partida.reiniciar(); bloqueiosSeguidos = { motivo: '', quantidade: 0 };
  $('retorno').textContent = 'Vamos tentar este caminho de novo!'; pintarTabuleiro();
});
$('outro-mapa').addEventListener('click', () => {
  tocar('clique'); indiceMapa = (indiceMapa + 1) % mapas.length; abrirMapa({ demonstrar: !modoClassico });
});
$('repetir').addEventListener('click', () => pistaAtual.length && falarSequencia(pistaAtual));
$('de-novo').addEventListener('click', () => {
  tocar('clique'); indiceMapa = (indiceMapa + 1) % mapas.length; abrirMapa({ demonstrar: !modoClassico });
});
$('diminuir').addEventListener('click', () => { indiceVisao = Math.min(VISIVEIS.length - 1, indiceVisao + 1); pintarTabuleiro(); });
$('ampliar').addEventListener('click', () => { indiceVisao = Math.max(0, indiceVisao - 1); pintarTabuleiro(); });
$('voltar-carrinho').addEventListener('click', () => { centroVisual = null; dicaVisual = null; pintarTabuleiro(); });
$('ver-mapa').addEventListener('click', () => { pintarMapaGeral(); abrirDialogo($('mapa-geral')); });
$('fechar-mapa').addEventListener('click', () => fecharDialogo($('mapa-geral')));
$('ajuda').addEventListener('click', () => abrirDemonstracao());
$('fechar-demo').addEventListener('click', () => fecharDialogo($('demonstracao')));
$('ouvir-demo').addEventListener('click', () => tipoDemo && dizerPista([{ texto: dadosDaDemo(tipoDemo).texto }]));
window.addEventListener('keydown', evento => {
  const direcao = TECLA_PARA_DIRECAO[evento.key];
  if (!direcao || telas.brincadeira.hidden || $('demonstracao').open || $('mapa-geral').open) return;
  evento.preventDefault(); mover(direcao);
});
window.addEventListener('pagehide', limpar);
window.addEventListener('beforeunload', limpar);
