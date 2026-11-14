import { montarCabecalho } from '../../shared/cabecalho.js';
import { animar, lancarConfete } from '../../shared/confete.js';
import { nomeDaCrianca, obterConfiguracoes, registrarPartida } from '../../shared/progresso.js';
import { tocar } from '../../shared/sons.js';
import { carregarArte, criarIcone } from './arte.js';
import { desejos, produtos, temas } from './dados.js';
import {
  SECOES,
  caminho,
  celulaEm,
  entrada,
  podeAndar,
  prateleirasVizinhas,
  secaoMaisProxima,
  vizinhaLivre,
  casasDe,
} from './mapa.js';
import { criarRenderizador } from './renderizador.js';
import {
  NIVEIS,
  alternativasDeTroco,
  chegarAoCaixa,
  colocarNoCarrinho,
  conferirDados,
  contaArmada,
  coracoesDoCarrinho,
  criarCompra,
  criarGerador,
  devolverDesejo,
  digitar,
  espiar,
  faltando,
  formatarDinheiro,
  gerarMissao,
  levarDesejo,
  mudarQuantidade,
  opcoesNoNivel,
  pagar,
  precoNoNivel,
  responderConta,
  resultadoDaCompra,
  totalDoCarrinho,
} from './jogo.js';

montarCabecalho('Mercadinho');

const problemasDados = conferirDados();
if (problemasDados.length) {
  throw new Error(problemasDados.join('\n'));
}

const $ = id => document.getElementById(id);

const produtoPorId = Object.fromEntries(produtos.map(p => [p.id, p]));
const desejoPorId = Object.fromEntries(desejos.map(d => [d.id, d]));
const temaPorId = Object.fromEntries(temas.map(t => [t.id, t]));
const secaoPorId = Object.fromEntries(Object.values(SECOES).map(s => [s.id, s]));

const SECOES_LISTA_RAPIDA = [
  ...Object.values(SECOES),
  { id: 'guloseimas', nome: 'Guloseimas', emoji: '🍬' },
];

const ROTULOS_POSICAO = {
  'em-conta': 'a mais em conta',
  meio: 'a do meio',
  queridinha: 'a queridinha da família',
};

const FASES = {
  inicio: $('fase-inicio'),
  missao: $('fase-missao'),
  loja: $('fase-loja'),
  caixa: $('fase-caixa'),
  resultado: $('fase-resultado'),
};

const PAINEIS = {
  prateleira: $('painel-prateleira'),
  lista: $('painel-lista'),
  carrinho: $('painel-carrinho'),
};

const CHAVE_ESTADO_MERCADINHO = 'jogos-elis:mercadinho';
const PASSO_MS = 1000 / 6;
const ATRASO_REDUZIDO_MS = 150;
const DELTAS_DIRECAO = {
  cima: { dx: 0, dy: -1 },
  baixo: { dx: 0, dy: 1 },
  esquerda: { dx: -1, dy: 0 },
  direita: { dx: 1, dy: 0 },
};

let nivelSelecionado = Number(obterConfiguracoes().niveis?.mercadinho) || 2;
if (![1, 2, 3].includes(nivelSelecionado)) nivelSelecionado = 2;

let faseAtual = 'inicio';
let compra = null;
let secaoAberta = null;

let painelAtivo = null;
let gatilhoDoPainel = null;
let contextoPrateleira = null;
let quantidadePrateleira = 1;

let timerEspiada = null;
let timerCupom = null;
let partidaRegistrada = false;

let estadoCaixa = resetarEstadoCaixa();

let modoListaPreferido = lerPreferenciaModoLista();
let arteFalhou = false;
let renderizador = criarRenderizador($('mapa-canvas'));

const nav = {
  posicao: entrada(),
  posRender: entrada(),
  direcao: 'cima',
  quadro: 0,
  fasePasso: 0,
  passosDados: 0,
  fila: [],
  destinoFinal: null,
  acaoAoChegar: null,
  direcaoAoChegar: null,
  passoOrigem: null,
  passoDestino: null,
  passoInicioMs: 0,
  rafId: null,
  timerReduzido: null,
  ultimoAnuncioFrente: '',
};

carregarArte().catch(() => {
  arteFalhou = true;
  renderizador = null;
  atualizarBotoesModoInicio();
  if (faseAtual === 'loja' && compra) {
    renderizarLoja();
  }
});

function lerPreferenciaModoLista() {
  try {
    const bruto = localStorage.getItem(CHAVE_ESTADO_MERCADINHO);
    if (!bruto) return false;
    const dados = JSON.parse(bruto);
    return dados?.versao === 1 && dados.modoLista === true;
  } catch {
    return false;
  }
}

function salvarPreferenciaModoLista(valor) {
  try {
    const bruto = localStorage.getItem(CHAVE_ESTADO_MERCADINHO);
    const parsed = bruto ? JSON.parse(bruto) : null;
    const base = parsed && typeof parsed === 'object' && parsed.versao === 1
      ? parsed
      : {
          versao: 1,
          cofrinho: 0,
          sonhoAtual: null,
          sonhosRealizados: [],
          compras: 0,
          tutorialVisto: false,
        };
    localStorage.setItem(CHAVE_ESTADO_MERCADINHO, JSON.stringify({ ...base, modoLista: Boolean(valor) }));
  } catch {
    /* armazenamento indisponível: preferência fica só nesta sessão */
  }
}

function usarListaRapida() {
  return modoListaPreferido || arteFalhou || !renderizador;
}

function atualizarBotoesModoInicio() {
  const mapaDisponivel = !arteFalhou && Boolean(renderizador);
  const listaAtiva = usarListaRapida();
  const btnAndar = $('btn-modo-andar');
  const btnLista = $('btn-modo-lista');
  if (btnAndar) {
    btnAndar.disabled = !mapaDisponivel;
    btnAndar.setAttribute('aria-pressed', String(!listaAtiva));
  }
  if (btnLista) {
    btnLista.setAttribute('aria-pressed', String(listaAtiva));
  }
}

function resetarNavegacao() {
  pararMovimento();
  const inicio = entrada();
  nav.posicao = { ...inicio };
  nav.posRender = { ...inicio };
  nav.direcao = 'cima';
  nav.quadro = 0;
  nav.fasePasso = 0;
  nav.passosDados = 0;
  nav.ultimoAnuncioFrente = '';
}

function direcaoEntre(de, para) {
  const dx = para.x - de.x;
  const dy = para.y - de.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? 'direita' : 'esquerda';
  }
  return dy >= 0 ? 'baixo' : 'cima';
}

function pararMovimento(redesenhar = false) {
  if (nav.rafId !== null) {
    cancelAnimationFrame(nav.rafId);
    nav.rafId = null;
  }
  if (nav.timerReduzido !== null) {
    clearTimeout(nav.timerReduzido);
    nav.timerReduzido = null;
  }
  nav.fila = [];
  nav.destinoFinal = null;
  nav.acaoAoChegar = null;
  nav.direcaoAoChegar = null;
  nav.passoOrigem = null;
  nav.passoDestino = null;
  nav.quadro = 0;
  nav.fasePasso = 0;
  nav.posRender = { ...nav.posicao };
  if (redesenhar && faseAtual === 'loja' && !usarListaRapida()) {
    desenharMapa();
  }
}

function nomeDoAlvo(celula) {
  if (!celula) return '';
  if (celula.tipo === 'produto') return produtoPorId[celula.id]?.nome || 'Produto';
  if (celula.tipo === 'desejo') return desejoPorId[celula.id]?.nome || 'Guloseima';
  if (celula.tipo === 'caixa') return 'Caixa';
  return '';
}

function alvoAdjacenteAtual() {
  const delta = DELTAS_DIRECAO[nav.direcao] || DELTAS_DIRECAO.cima;
  const fx = nav.posicao.x + delta.dx;
  const fy = nav.posicao.y + delta.dy;
  const frontal = celulaEm(fx, fy);
  if (frontal.tipo === 'produto' || frontal.tipo === 'desejo' || frontal.tipo === 'caixa') {
    return { x: fx, y: fy, ...frontal };
  }
  const vizinhos = prateleirasVizinhas(nav.posicao);
  return vizinhos[0] || null;
}

function atualizarIndicacaoMapa({ anunciarSeMudou = false } = {}) {
  if (!compra || usarListaRapida()) return;

  const secao = secaoMaisProxima(nav.posicao);
  $('loja-secao-atual').textContent = `📍 Você está em: ${secao.nome}`;

  const alvo = alvoAdjacenteAtual();
  const btn = $('btn-interagir-mapa');
  if (!alvo) {
    btn.hidden = true;
    btn.textContent = '';
    nav.ultimoAnuncioFrente = '';
    return;
  }

  const nome = nomeDoAlvo(alvo);
  btn.hidden = false;
  btn.textContent = `Ver: ${nome}`;

  const chave = `${alvo.tipo}:${alvo.id}`;
  if (anunciarSeMudou && chave !== nav.ultimoAnuncioFrente) {
    nav.ultimoAnuncioFrente = chave;
    anunciar(`Você está em frente a: ${nome}`);
  }
}

function desenharMapa() {
  if (!renderizador || !compra || usarListaRapida()) return;
  const baloesNivel1 = compra.missao.nivel === 1
    ? compra.missao.itens
        .filter(item => (compra.carrinho[item.produtoId]?.quantidade || 0) < item.quantidade)
        .map(item => casasDe(item.produtoId))
        .filter(Boolean)
    : [];

  const alvo = alvoAdjacenteAtual();
  renderizador.desenhar({
    posX: nav.posRender.x,
    posY: nav.posRender.y,
    direcao: nav.direcao,
    quadro: nav.quadro,
    fasePasso: nav.fasePasso,
    itensNoCarrinho: contarTotalNoCarrinho(),
    destinoCaminhada: nav.destinoFinal,
    destaqueCasa: alvo ? { x: alvo.x, y: alvo.y } : null,
    baloesNivel1,
  });
}

function executarAcaoCelula(celula, gatilho) {
  if (!celula) return;
  if (celula.tipo === 'produto') {
    tocar('clique');
    abrirPrateleiraProduto(celula.id, gatilho);
  } else if (celula.tipo === 'desejo') {
    tocar('clique');
    abrirPrateleiraGuloseima(celula.id, gatilho);
  } else if (celula.tipo === 'caixa') {
    tocar('clique');
    entrarNoCaixa();
  }
}

function acionarInteracaoAdjacente(gatilho = $('btn-interagir-mapa')) {
  const alvo = alvoAdjacenteAtual();
  if (!alvo) return;
  pararMovimento(false);
  nav.direcao = direcaoEntre(nav.posicao, alvo);
  desenharMapa();
  executarAcaoCelula(alvo, gatilho);
}

function concluirCaminhada() {
  nav.rafId = null;
  nav.passoOrigem = null;
  nav.passoDestino = null;
  nav.quadro = 0;
  nav.fasePasso = 0;
  nav.posRender = { ...nav.posicao };
  nav.destinoFinal = null;

  const acao = nav.acaoAoChegar;
  const dirFinal = nav.direcaoAoChegar;
  nav.acaoAoChegar = null;
  nav.direcaoAoChegar = null;

  if (dirFinal) {
    nav.direcao = dirFinal;
  }

  desenharMapa();
  atualizarIndicacaoMapa({ anunciarSeMudou: !acao });

  if (acao) {
    executarAcaoCelula(acao, $('mapa-canvas'));
  }
}

function avancarProximoPasso(agora) {
  if (!nav.fila.length) return false;
  const proximo = nav.fila.shift();
  nav.passoOrigem = { ...nav.posicao };
  nav.passoDestino = proximo;
  nav.passoInicioMs = agora;
  nav.direcao = direcaoEntre(nav.posicao, proximo);
  return true;
}

function animarPasso(agora) {
  nav.rafId = null;
  if (faseAtual !== 'loja' || painelAtivo || usarListaRapida() || document.hidden) {
    pararMovimento();
    return;
  }

  if (!nav.passoDestino) {
    if (!avancarProximoPasso(agora)) {
      concluirCaminhada();
      return;
    }
  }

  const t = Math.min(1, (agora - nav.passoInicioMs) / PASSO_MS);
  nav.posRender = {
    x: nav.passoOrigem.x + (nav.passoDestino.x - nav.passoOrigem.x) * t,
    y: nav.passoOrigem.y + (nav.passoDestino.y - nav.passoOrigem.y) * t,
  };
  nav.quadro = Math.floor(t * 2);
  nav.fasePasso = (nav.passosDados + t) * Math.PI;

  if (t >= 1) {
    nav.passosDados += 1;
    nav.posicao = { ...nav.passoDestino };
    nav.posRender = { ...nav.posicao };
    nav.passoOrigem = null;
    nav.passoDestino = null;
    atualizarIndicacaoMapa({ anunciarSeMudou: nav.fila.length === 0 });

    if (!avancarProximoPasso(agora)) {
      concluirCaminhada();
      return;
    }
  }

  desenharMapa();
  nav.rafId = requestAnimationFrame(animarPasso);
}

function andarPara(destino, { acaoAoChegar = null, direcaoAoChegar = null } = {}) {
  if (!podeAndar(destino.x, destino.y)) return;

  if (querMenosMovimento()) {
    if (nav.timerReduzido !== null) {
      clearTimeout(nav.timerReduzido);
      nav.timerReduzido = null;
    }
    if (nav.rafId !== null) {
      cancelAnimationFrame(nav.rafId);
      nav.rafId = null;
    }
    nav.passoOrigem = null;
    nav.passoDestino = null;
    nav.quadro = 0;
    nav.posRender = { ...nav.posicao };

    if (nav.posicao.x === destino.x && nav.posicao.y === destino.y) {
      nav.acaoAoChegar = acaoAoChegar;
      nav.direcaoAoChegar = direcaoAoChegar;
      concluirCaminhada();
      return;
    }

    const rota = caminho(nav.posicao, destino);
    if (!rota) return;

    nav.destinoFinal = { ...destino };
    nav.acaoAoChegar = acaoAoChegar;
    nav.direcaoAoChegar = direcaoAoChegar;
    nav.timerReduzido = setTimeout(() => {
      nav.timerReduzido = null;
      if (faseAtual !== 'loja' || painelAtivo || usarListaRapida()) return;
      const penultimo = rota.length >= 2 ? rota[rota.length - 2] : nav.posicao;
      nav.posicao = { ...destino };
      nav.posRender = { ...destino };
      nav.direcao = direcaoAoChegar || direcaoEntre(penultimo, destino);
      nav.quadro = 0;
      concluirCaminhada();
    }, ATRASO_REDUZIDO_MS);
    return;
  }

  const base = nav.passoDestino || nav.posicao;
  const rota = caminho(base, destino);
  if (rota === null) return;

  nav.fila = rota;
  nav.destinoFinal = { ...destino };
  nav.acaoAoChegar = acaoAoChegar;
  nav.direcaoAoChegar = direcaoAoChegar;

  if (!nav.passoDestino && rota.length === 0) {
    concluirCaminhada();
    return;
  }

  if (nav.rafId === null) {
    if (!nav.passoDestino) {
      avancarProximoPasso(performance.now());
      desenharMapa();
    }
    nav.rafId = requestAnimationFrame(animarPasso);
  }
}

function andarUmaCasa(direcao) {
  if (faseAtual !== 'loja' || painelAtivo || usarListaRapida()) return;
  const delta = DELTAS_DIRECAO[direcao];
  if (!delta) return;

  if (nav.timerReduzido !== null) {
    clearTimeout(nav.timerReduzido);
    nav.timerReduzido = null;
  }
  nav.acaoAoChegar = null;
  nav.direcaoAoChegar = null;

  // Se já está animando um passo, atualiza a fila a partir da casa de chegada ou bloqueia se não for andar
  if (nav.passoDestino) {
    const prox = { x: nav.passoDestino.x + delta.dx, y: nav.passoDestino.y + delta.dy };
    if (podeAndar(prox.x, prox.y)) {
      nav.fila = [prox];
      nav.destinoFinal = prox;
    } else {
      nav.fila = [];
      nav.destinoFinal = { ...nav.passoDestino };
    }
    return;
  }

  const nx = nav.posicao.x + delta.dx;
  const ny = nav.posicao.y + delta.dy;
  if (!podeAndar(nx, ny)) {
    nav.direcao = direcao;
    nav.quadro = 0;
    nav.destinoFinal = null;
    desenharMapa();
    atualizarIndicacaoMapa({ anunciarSeMudou: true });
    return;
  }

  if (querMenosMovimento()) {
    nav.posicao = { x: nx, y: ny };
    nav.posRender = { ...nav.posicao };
    nav.direcao = direcao;
    nav.quadro = 0;
    nav.destinoFinal = null;
    desenharMapa();
    atualizarIndicacaoMapa({ anunciarSeMudou: true });
    return;
  }

  nav.fila = [{ x: nx, y: ny }];
  nav.destinoFinal = { x: nx, y: ny };
  avancarProximoPasso(performance.now());
  desenharMapa();
  nav.rafId = requestAnimationFrame(animarPasso);
}

function interagirComCasa(x, y) {
  if (faseAtual !== 'loja' || painelAtivo || usarListaRapida()) return;
  const celula = celulaEm(x, y);

  if (celula.tipo === 'parede') return;
  if (celula.tipo === 'piso') {
    andarPara({ x, y });
    return;
  }

  const ehInterativa = celula.tipo === 'produto' || celula.tipo === 'desejo' || celula.tipo === 'caixa';
  if (!ehInterativa) return;

  const alvo = { ...celula, x, y };
  const paradaAdjacente =
    !nav.passoDestino
    && nav.timerReduzido === null
    && Math.abs(nav.posicao.x - x) + Math.abs(nav.posicao.y - y) === 1;

  if (paradaAdjacente) {
    nav.direcao = direcaoEntre(nav.posicao, alvo);
    nav.quadro = 0;
    desenharMapa();
    atualizarIndicacaoMapa({ anunciarSeMudou: false });
    executarAcaoCelula(alvo, $('mapa-canvas'));
    return;
  }

  const base = nav.passoDestino || nav.posicao;
  const vizinha = vizinhaLivre(base, alvo);
  if (!vizinha) return;

  andarPara(vizinha, {
    acaoAoChegar: alvo,
    direcaoAoChegar: direcaoEntre(vizinha, alvo),
  });
}

function resetarEstadoCaixa() {
  return {
    etapa: 'cupom',
    linhasCupom: [],
    valoresCupom: [],
    indiceCupom: 0,
    tentativaTotal: 1,
    tentativaTroco: 1,
    valorDigitado: 0,
    totalCompra: 0,
    trocoCompra: 0,
    tipoArmada: null,
  };
}

function querMenosMovimento() {
  return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function anunciar(texto) {
  const regiao = $('anuncio-leitor');
  regiao.textContent = '';
  requestAnimationFrame(() => {
    regiao.textContent = texto;
  });
}

function juntarComE(partes) {
  if (partes.length === 0) return '';
  if (partes.length === 1) return partes[0];
  if (partes.length === 2) return `${partes[0]} e ${partes[1]}`;
  return `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`;
}

function criarCoracoesElemento(qtd) {
  const span = document.createElement('span');
  span.setAttribute('role', 'img');
  span.setAttribute('aria-label', `${qtd} de 3 corações`);
  span.textContent = '❤️'.repeat(qtd) + '🤍'.repeat(3 - qtd);
  return span;
}

function limparEspiada() {
  if (timerEspiada) {
    clearTimeout(timerEspiada);
    timerEspiada = null;
  }
  const aviso = $('espiada-aviso');
  aviso.hidden = true;
  aviso.textContent = '';
}

function limparCupomTimer() {
  if (timerCupom) {
    clearInterval(timerCupom);
    timerCupom = null;
  }
}

function mostrarFase(nome) {
  limparEspiada();
  limparCupomTimer();
  pararMovimento(false);
  fecharPainel(false);

  faseAtual = nome;
  for (const [chave, secao] of Object.entries(FASES)) {
    secao.hidden = chave !== nome;
  }

  if (nome === 'loja' && !usarListaRapida() && renderizador) {
    renderizador.ajustarTamanho();
    atualizarIndicacaoMapa({ anunciarSeMudou: false });
    desenharMapa();
    $('mapa-canvas').focus();
    return;
  }

  const alvoFoco = FASES[nome].querySelector('h2, button:not([disabled]):not([hidden])');
  if (alvoFoco) {
    if (!alvoFoco.hasAttribute('tabindex') && alvoFoco.tagName !== 'BUTTON') {
      alvoFoco.setAttribute('tabindex', '-1');
    }
    alvoFoco.focus();
  }
}

function compraEmAndamento() {
  return Boolean(
    compra && !compra.paga && (faseAtual === 'loja' || faseAtual === 'caixa'),
  );
}

function confirmarSaidaDaCompra() {
  if (!compraEmAndamento()) return true;
  return window.confirm('Sair e perder esta compra?');
}

function selecionarNivel(nivel) {
  nivelSelecionado = Number(nivel);
  document.querySelectorAll('.nivel[data-nivel]').forEach(botao => {
    const ativo = Number(botao.dataset.nivel) === nivelSelecionado;
    botao.setAttribute('aria-pressed', String(ativo));
  });
}

function iniciarNovaMissao() {
  const semente = (Math.floor(Math.random() * 0x7fffffff) + 1) >>> 0;
  const missao = gerarMissao({ nivel: nivelSelecionado, semente });
  compra = criarCompra(missao);
  secaoAberta = null;
  partidaRegistrada = false;
  estadoCaixa = resetarEstadoCaixa();
  resetarNavegacao();
  renderizarMissao();
  mostrarFase('missao');
  anunciar(`Nova missão: ${missao.titulo}. Orçamento ${formatarDinheiro(missao.orcamento)}.`);
}

function renderizarMissao() {
  const { missao } = compra;
  const tema = temaPorId[missao.temaId] || temas[0];
  $('missao-titulo').textContent = `${tema.emoji} ${missao.titulo}`;

  const convite = $('missao-convite');
  convite.replaceChildren();
  convite.append(document.createTextNode(`${tema.convite} Você tem `));
  const strongDinheiro = document.createElement('strong');
  strongDinheiro.textContent = formatarDinheiro(missao.orcamento);
  convite.append(strongDinheiro, document.createTextNode('. A família fica feliz com '));
  const strongCoracoes = document.createElement('strong');
  strongCoracoes.textContent = `${missao.metaCoracoes} ❤️`;
  convite.append(strongCoracoes, document.createTextNode(' ou mais.'));

  const lista = $('missao-lista');
  lista.replaceChildren();
  for (const item of missao.itens) {
    const produto = produtoPorId[item.produtoId];
    const secao = secaoPorId[produto.secao];
    const li = document.createElement('li');
    li.className = 'lista-missao__item';
    li.textContent = `${produto.emoji} ${item.quantidade} × ${produto.nome} (${produto.medida}) · ${secao.nome}`;
    lista.append(li);
  }
}

function contarItensCompletos() {
  return compra.missao.itens.filter(
    item => (compra.carrinho[item.produtoId]?.quantidade || 0) >= item.quantidade,
  ).length;
}

function contarTotalNoCarrinho() {
  const unidadesProdutos = Object.values(compra.carrinho)
    .reduce((acc, entrada) => acc + entrada.quantidade, 0);
  return unidadesProdutos + compra.desejos.length;
}

function secaoTemItemFaltando(secaoId) {
  if (secaoId === 'guloseimas') return false;
  return compra.missao.itens.some(item => {
    const produto = produtoPorId[item.produtoId];
    const noCarrinho = compra.carrinho[item.produtoId]?.quantidade || 0;
    return produto.secao === secaoId && noCarrinho < item.quantidade;
  });
}

function renderizarPainelFixo() {
  const { missao } = compra;
  const nivel = missao.nivel;

  $('loja-dinheiro').textContent = `💰 Você tem ${formatarDinheiro(missao.orcamento)}`;

  const coracoes = coracoesDoCarrinho(compra);
  const metaBatida = coracoes >= missao.metaCoracoes;
  const elCoracoes = $('loja-coracoes');
  elCoracoes.textContent = `❤️ ${coracoes} de ${missao.metaCoracoes}${metaBatida ? ' ✓' : ''}`;
  elCoracoes.classList.toggle('meta-batida', metaBatida);

  const completos = contarItensCompletos();
  const totalLista = missao.itens.length;
  $('btn-abrir-lista').textContent =
    `📝 Lista (${completos} de ${totalLista}${completos === totalLista ? ' ✓' : ''})`;

  $('btn-abrir-carrinho').textContent = `🛒 Carrinho (${contarTotalNoCarrinho()})`;

  const btnEspiar = $('btn-espiar');
  if (NIVEIS[nivel].espiadas > 0) {
    btnEspiar.hidden = false;
    btnEspiar.textContent = `👀 Espiar o total (${compra.espiadasRestantes})`;
  } else {
    btnEspiar.hidden = true;
  }

  const barraBox = $('barra-nivel1');
  if (nivel === 1) {
    const total = totalDoCarrinho(compra);
    const pct = Math.min(100, Math.round((total / missao.orcamento) * 100));
    barraBox.hidden = false;
    $('barra-nivel1-texto').textContent = `No carrinho: ${formatarDinheiro(total)}`;
    const preenchimento = $('barra-nivel1-preenchimento');
    preenchimento.style.width = `${pct}%`;
    preenchimento.className = 'barra-nivel1__preenchimento';
    if (total > missao.orcamento) {
      preenchimento.classList.add('barra-nivel1__preenchimento--vermelho');
    } else if (pct > 80) {
      preenchimento.classList.add('barra-nivel1__preenchimento--amarelo');
    } else {
      preenchimento.classList.add('barra-nivel1__preenchimento--verde');
    }
  } else {
    barraBox.hidden = true;
  }
}

function renderizarLoja() {
  renderizarPainelFixo();

  const listaAtiva = usarListaRapida();
  const cabSecao = $('loja-secao-atual');
  const btnVoltarSecoes = $('btn-voltar-secoes');
  const btnAlternarModo = $('btn-alternar-modo-loja');
  const mapaBloco = $('loja-mapa-bloco');
  const gradeSecoes = $('grade-secoes');
  const listaProdutos = $('lista-produtos');
  const btnIrCaixa = $('btn-ir-caixa');

  if (btnAlternarModo) {
    btnAlternarModo.hidden = arteFalhou || !renderizador;
    btnAlternarModo.textContent = listaAtiva ? '🚶 Ver no mapa' : '📝 Lista rápida';
  }
  btnIrCaixa.hidden = !listaAtiva;

  if (!listaAtiva) {
    mapaBloco.hidden = false;
    btnVoltarSecoes.hidden = true;
    gradeSecoes.hidden = true;
    listaProdutos.hidden = true;
    atualizarIndicacaoMapa({ anunciarSeMudou: false });
    if (faseAtual === 'loja' && renderizador) {
      renderizador.ajustarTamanho();
      desenharMapa();
    }
    return;
  }

  mapaBloco.hidden = true;

  if (!secaoAberta) {
    cabSecao.textContent = '📍 Escolha uma seção';
    btnVoltarSecoes.hidden = true;
    gradeSecoes.hidden = false;
    listaProdutos.hidden = true;

    gradeSecoes.replaceChildren();
    for (const sec of SECOES_LISTA_RAPIDA) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'botao botao--neutro botao-secao';
      btn.dataset.secao = sec.id;

      const emoji = document.createElement('span');
      emoji.className = 'botao-secao__emoji';
      emoji.setAttribute('aria-hidden', 'true');
      emoji.textContent = sec.emoji;

      const nome = document.createElement('span');
      nome.className = 'botao-secao__nome';
      const dicaNivel1 = compra.missao.nivel === 1 && secaoTemItemFaltando(sec.id) ? ' (!)' : '';
      nome.textContent = `${sec.nome}${dicaNivel1}`;

      btn.append(emoji, nome);
      btn.addEventListener('click', () => {
        tocar('clique');
        secaoAberta = sec.id;
        renderizarLoja();
        anunciar(`Você abriu a seção ${sec.nome}`);
        btnVoltarSecoes.focus();
      });
      gradeSecoes.append(btn);
    }
    return;
  }

  const infoSecao = SECOES_LISTA_RAPIDA.find(s => s.id === secaoAberta);
  cabSecao.textContent = `📍 ${infoSecao.emoji} ${infoSecao.nome}`;
  btnVoltarSecoes.hidden = false;
  gradeSecoes.hidden = true;
  listaProdutos.hidden = false;
  listaProdutos.replaceChildren();

  if (secaoAberta === 'guloseimas') {
    const limite = NIVEIS[compra.missao.nivel].maximoDeDesejos;
    for (const desejo of desejos) {
      const jaNoCarrinho = compra.desejos.includes(desejo.id);
      const preco = precoNoNivel(desejo.preco, compra.missao.nivel);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `botao botao--neutro cartao-produto${jaNoCarrinho ? ' cartao-produto--no-carrinho' : ''}`;
      card.dataset.guloseimaId = desejo.id;

      const emoji = document.createElement('span');
      emoji.className = 'cartao-produto__emoji';
      emoji.setAttribute('aria-hidden', 'true');
      emoji.textContent = desejo.emoji;

      const corpo = document.createElement('span');
      corpo.className = 'cartao-produto__corpo';

      const titulo = document.createElement('span');
      titulo.className = 'cartao-produto__nome';
      titulo.textContent = `${desejo.nome} (${desejo.marca})`;

      const detalhe = document.createElement('span');
      detalhe.className = 'cartao-produto__detalhe';
      detalhe.textContent = jaNoCarrinho
        ? `${formatarDinheiro(preco)} · No carrinho (${compra.desejos.length}/${limite})`
        : `${formatarDinheiro(preco)} · ${'❤️'.repeat(desejo.coracoes)}`;

      corpo.append(titulo, detalhe);
      card.append(emoji, corpo);
      card.addEventListener('click', () => {
        tocar('clique');
        abrirPrateleiraGuloseima(desejo.id, card);
      });
      listaProdutos.append(card);
    }
    return;
  }

  const itensDaSecao = produtos.filter(p => p.secao === secaoAberta);
  for (const produto of itensDaSecao) {
    const entrada = compra.carrinho[produto.id];
    const itemMissao = compra.missao.itens.find(i => i.produtoId === produto.id);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `botao botao--neutro cartao-produto${entrada ? ' cartao-produto--no-carrinho' : ''}`;
    card.dataset.produtoId = produto.id;

    const emoji = document.createElement('span');
    emoji.className = 'cartao-produto__emoji';
    emoji.setAttribute('aria-hidden', 'true');
    emoji.textContent = produto.emoji;

    const corpo = document.createElement('span');
    corpo.className = 'cartao-produto__corpo';

    const nome = document.createElement('span');
    nome.className = 'cartao-produto__nome';
    const faltaNoCarrinho = itemMissao && (entrada?.quantidade || 0) < itemMissao.quantidade;
    const marcaListaNivel1 = compra.missao.nivel === 1 && faltaNoCarrinho ? ' (!)' : '';
    nome.textContent = `${produto.nome}${marcaListaNivel1}`;

    const detalhe = document.createElement('span');
    detalhe.className = 'cartao-produto__detalhe';
    detalhe.textContent = entrada
      ? `${produto.medida} · No carrinho: ${entrada.quantidade}`
      : produto.medida;

    corpo.append(nome, detalhe);
    card.append(emoji, corpo);
    card.addEventListener('click', () => {
      tocar('clique');
      abrirPrateleiraProduto(produto.id, card);
    });
    listaProdutos.append(card);
  }
}

/* ---------------- Painéis modais ---------------- */

function elementosFocaveis(container) {
  return [...container.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter(el => !el.hidden && el.offsetParent !== null);
}

function abrirPainel(elPainel, gatilho) {
  pararMovimento(false);
  fecharPainel(false);
  painelAtivo = elPainel;
  gatilhoDoPainel = gatilho || document.activeElement;
  elPainel.hidden = false;

  const focaveis = elementosFocaveis(elPainel);
  if (focaveis.length) {
    focaveis[0].focus();
  }
}

function fecharPainel(devolverFoco = true) {
  if (!painelAtivo) return;
  const painel = painelAtivo;
  const gatilho = gatilhoDoPainel;
  painel.hidden = true;
  painelAtivo = null;
  gatilhoDoPainel = null;
  contextoPrateleira = null;

  if (devolverFoco && gatilho && document.contains(gatilho) && !gatilho.closest('[hidden]')) {
    gatilho.focus();
  }
}

function abrirPrateleiraProduto(produtoId, gatilho) {
  contextoPrateleira = { tipo: 'produto', id: produtoId };
  quantidadePrateleira = 1;
  renderizarPrateleiraProduto();
  abrirPainel(PAINEIS.prateleira, gatilho);
}

function renderizarPrateleiraProduto() {
  if (!contextoPrateleira || contextoPrateleira.tipo !== 'produto') return;
  const produto = produtoPorId[contextoPrateleira.id];
  const nivel = compra.missao.nivel;
  const itemMissao = compra.missao.itens.find(i => i.produtoId === produto.id);
  const entrada = compra.carrinho[produto.id];

  $('prateleira-titulo').textContent = `${produto.emoji} ${produto.nome} · ${produto.medida}`;
  if (itemMissao) {
    $('prateleira-subtitulo').textContent = entrada
      ? `Na lista: ${itemMissao.quantidade} · No carrinho: ${entrada.quantidade}`
      : `Na lista: ${itemMissao.quantidade}`;
  } else {
    $('prateleira-subtitulo').textContent = 'Comparação de preços';
  }

  const aviso = $('prateleira-aviso');
  const qtdBloco = $('prateleira-qtd-bloco');
  if (itemMissao) {
    aviso.hidden = true;
    qtdBloco.hidden = false;
    atualizarControlesQuantidade();
  } else {
    aviso.hidden = false;
    aviso.textContent = 'Hoje isto não está na lista.';
    qtdBloco.hidden = true;
  }

  const container = $('prateleira-opcoes');
  container.replaceChildren();

  const opcoes = [...opcoesNoNivel(produto, nivel)].sort((a, b) => a.preco - b.preco);
  for (const opcao of opcoes) {
    const selecionada = entrada?.opcaoId === opcao.id;
    const cartao = document.createElement('div');
    cartao.className = `opcao-cartao${selecionada ? ' opcao-cartao--selecionada' : ''}`;
    cartao.dataset.opcaoId = opcao.id;

    const cabeca = document.createElement('div');
    cabeca.className = 'opcao-cartao__cabeca';

    const ident = document.createElement('div');
    ident.className = 'opcao-cartao__identidade';

    const icone = criarIcone(produto.id, opcao.id, 2);
    icone.classList.add('opcao-cartao__emoji');

    const marca = document.createElement('strong');
    marca.className = 'opcao-cartao__marca';
    marca.textContent = opcao.rotulo;

    const preco = document.createElement('span');
    preco.className = 'opcao-cartao__preco';
    preco.textContent = formatarDinheiro(opcao.preco);

    ident.append(icone, marca);
    cabeca.append(ident, preco);

    const rodape = document.createElement('div');
    rodape.className = 'opcao-cartao__rodape';
    rodape.append(criarCoracoesElemento(opcao.coracoes));

    if (itemMissao) {
      const calc = document.createElement('span');
      calc.className = 'opcao-cartao__calculo';
      calc.dataset.preco = String(opcao.preco);
      calc.textContent = formatarEtiquetaQuantidade(quantidadePrateleira, opcao.preco, nivel);
      rodape.append(calc);
    }

    cartao.append(cabeca, rodape);

    if (itemMissao) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'botao botao--sucesso opcao-cartao__botao';
      if (!entrada) {
        btn.textContent = 'Colocar no carrinho';
      } else if (entrada.opcaoId !== opcao.id) {
        btn.textContent = 'Trocar por esta';
      } else if (entrada.quantidade === quantidadePrateleira) {
        btn.textContent = 'No carrinho ✓ (manter)';
      } else {
        btn.textContent = 'Atualizar quantidade';
      }

      btn.addEventListener('click', () => {
        const res = colocarNoCarrinho(compra, produto.id, opcao.id, quantidadePrateleira);
        if (res.recusa) {
          tocar('erro');
          return;
        }
        compra = res.compra;
        tocar('acerto');
        anunciar(`${produto.nome} ${opcao.rotulo} no carrinho (${quantidadePrateleira})`);
        renderizarLoja();
        if (usarListaRapida()) {
          gatilhoDoPainel = $('lista-produtos').querySelector(`[data-produto-id="${produto.id}"]`) || gatilhoDoPainel;
        }
        fecharPainel();
      });

      cartao.append(btn);
    }

    container.append(cartao);
  }
}

function formatarEtiquetaQuantidade(qtd, precoUnitario, nivel) {
  if (nivel === 1) {
    return `${qtd} × ${formatarDinheiro(precoUnitario)} = ${formatarDinheiro(qtd * precoUnitario)}`;
  }
  return `${qtd} × ${formatarDinheiro(precoUnitario)}`;
}

function atualizarControlesQuantidade() {
  $('prateleira-qtd-valor').textContent = String(quantidadePrateleira);
  $('btn-qtd-menos').disabled = quantidadePrateleira <= 1;
  $('btn-qtd-mais').disabled = quantidadePrateleira >= 6;
}

function alterarQuantidadePrateleira(delta) {
  const proxima = Math.max(1, Math.min(6, quantidadePrateleira + delta));
  if (proxima === quantidadePrateleira) return;
  quantidadePrateleira = proxima;
  tocar('clique');
  atualizarControlesQuantidade();

  if (!contextoPrateleira || contextoPrateleira.tipo !== 'produto') return;
  const produto = produtoPorId[contextoPrateleira.id];
  const entrada = compra.carrinho[produto.id];
  const nivel = compra.missao.nivel;

  $('prateleira-opcoes').querySelectorAll('.opcao-cartao').forEach(cartao => {
    const calc = cartao.querySelector('.opcao-cartao__calculo');
    if (calc) {
      calc.textContent = formatarEtiquetaQuantidade(
        quantidadePrateleira,
        Number(calc.dataset.preco),
        nivel,
      );
    }
    if (entrada && entrada.opcaoId === cartao.dataset.opcaoId) {
      const btn = cartao.querySelector('.opcao-cartao__botao');
      if (btn) {
        btn.textContent = entrada.quantidade === quantidadePrateleira
          ? 'No carrinho ✓ (manter)'
          : 'Atualizar quantidade';
      }
    }
  });
}

function abrirPrateleiraGuloseima(desejoId, gatilho) {
  contextoPrateleira = { tipo: 'guloseima', id: desejoId };
  renderizarPrateleiraGuloseima();
  abrirPainel(PAINEIS.prateleira, gatilho);
}

function renderizarPrateleiraGuloseima() {
  if (!contextoPrateleira || contextoPrateleira.tipo !== 'guloseima') return;
  const desejo = desejoPorId[contextoPrateleira.id];
  const nivel = compra.missao.nivel;
  const limite = NIVEIS[nivel].maximoDeDesejos;
  const jaLevada = compra.desejos.includes(desejo.id);
  const limiteAtingido = compra.desejos.length >= limite;
  const preco = precoNoNivel(desejo.preco, nivel);

  $('prateleira-titulo').textContent = `${desejo.emoji} ${desejo.nome}`;
  $('prateleira-subtitulo').textContent = `Guloseima · ${desejo.marca}`;
  $('prateleira-qtd-bloco').hidden = true;

  const aviso = $('prateleira-aviso');
  aviso.hidden = false;
  aviso.textContent = `Hoje pode levar até ${limite} ${limite === 1 ? 'guloseima' : 'guloseimas'}.`;

  const container = $('prateleira-opcoes');
  container.replaceChildren();

  const cartao = document.createElement('div');
  cartao.className = `opcao-cartao${jaLevada ? ' opcao-cartao--selecionada' : ''}`;

  const cabeca = document.createElement('div');
  cabeca.className = 'opcao-cartao__cabeca';

  const ident = document.createElement('div');
  ident.className = 'opcao-cartao__identidade';

  const icone = criarIcone(desejo.id, null, 2);
  icone.classList.add('opcao-cartao__emoji');

  const marca = document.createElement('strong');
  marca.className = 'opcao-cartao__marca';
  marca.textContent = desejo.marca;

  const elPreco = document.createElement('span');
  elPreco.className = 'opcao-cartao__preco';
  elPreco.textContent = formatarDinheiro(preco);

  ident.append(icone, marca);
  cabeca.append(ident, elPreco);

  const rodape = document.createElement('div');
  rodape.className = 'opcao-cartao__rodape';
  rodape.append(criarCoracoesElemento(desejo.coracoes));

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `botao ${jaLevada ? 'botao--neutro' : 'botao--sucesso'} opcao-cartao__botao`;

  if (jaLevada) {
    btn.textContent = 'Devolver';
    btn.addEventListener('click', () => {
      compra = devolverDesejo(compra, desejo.id).compra;
      tocar('clique');
      anunciar(`${desejo.nome} devolvida.`);
      renderizarLoja();
      if (usarListaRapida()) {
        gatilhoDoPainel = $('lista-produtos').querySelector(`[data-guloseima-id="${desejo.id}"]`) || gatilhoDoPainel;
      }
      fecharPainel();
    });
  } else {
    btn.textContent = 'Levar';
    if (limiteAtingido) {
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
    }
    btn.addEventListener('click', () => {
      const res = levarDesejo(compra, desejo.id);
      if (res.recusa) {
        tocar('erro');
        anunciar(aviso.textContent);
        return;
      }
      compra = res.compra;
      tocar('acerto');
      anunciar(`${desejo.nome} no carrinho.`);
      renderizarLoja();
      if (usarListaRapida()) {
        gatilhoDoPainel = $('lista-produtos').querySelector(`[data-guloseima-id="${desejo.id}"]`) || gatilhoDoPainel;
      }
      fecharPainel();
    });
  }

  cartao.append(cabeca, rodape, btn);
  container.append(cartao);
}

function abrirPainelLista(gatilho) {
  const { missao } = compra;
  const tema = temaPorId[missao.temaId] || temas[0];
  $('lista-painel-meta').textContent =
    `${tema.emoji} ${missao.titulo} · Você tem ${formatarDinheiro(missao.orcamento)} · Meta: ${missao.metaCoracoes} ❤️`;

  const ul = $('lista-painel-itens');
  ul.replaceChildren();
  for (const item of missao.itens) {
    const produto = produtoPorId[item.produtoId];
    const secao = secaoPorId[produto.secao];
    const entrada = compra.carrinho[item.produtoId];
    const completo = (entrada?.quantidade || 0) >= item.quantidade;
    const li = document.createElement('li');
    li.className = 'lista-painel__item';

    let texto = `${completo ? '✅' : '⬜'} ${produto.emoji} ${produto.nome} · ${secao.nome} — pedir ${item.quantidade} (${produto.medida})`;
    if (entrada) {
      const op = opcoesNoNivel(produto, missao.nivel).find(o => o.id === entrada.opcaoId);
      texto += ` · no carrinho: ${entrada.quantidade} (${op.rotulo})`;
    }
    li.textContent = texto;
    ul.append(li);
  }

  const boxGuloseimas = $('lista-painel-guloseimas');
  if (compra.desejos.length) {
    const nomes = compra.desejos.map(id => desejoPorId[id].nome);
    boxGuloseimas.textContent = `🍬 Guloseimas no carrinho: ${juntarComE(nomes)}.`;
  } else {
    const limite = NIVEIS[missao.nivel].maximoDeDesejos;
    boxGuloseimas.textContent = `🍬 Guloseimas: nenhuma (pode levar até ${limite}).`;
  }

  abrirPainel(PAINEIS.lista, gatilho);
}

function abrirPainelCarrinho(gatilho) {
  renderizarPainelCarrinho();
  abrirPainel(PAINEIS.carrinho, gatilho);
}

function renderizarPainelCarrinho(focoDesejado = null) {
  const nivel = compra.missao.nivel;
  const container = $('carrinho-painel-itens');
  container.replaceChildren();

  const entradas = Object.entries(compra.carrinho);
  const temItens = entradas.length > 0 || compra.desejos.length > 0;

  if (!temItens) {
    const vazio = document.createElement('p');
    vazio.textContent = 'Seu carrinho está vazio.';
    container.append(vazio);
  }

  for (const [produtoId, entrada] of entradas) {
    const produto = produtoPorId[produtoId];
    const opcao = opcoesNoNivel(produto, nivel).find(o => o.id === entrada.opcaoId);
    const linha = document.createElement('div');
    linha.className = 'carrinho-linha';

    const info = document.createElement('div');
    info.className = 'carrinho-linha__info';
    info.textContent = `${produto.emoji} ${produto.nome} (${opcao.rotulo}) — ${formatarEtiquetaQuantidade(entrada.quantidade, opcao.preco, nivel)}`;

    const controles = document.createElement('div');
    controles.className = 'carrinho-linha__controles';

    const btnMenos = document.createElement('button');
    btnMenos.type = 'button';
    btnMenos.className = 'botao botao--neutro botao-qtd';
    btnMenos.dataset.itemId = produtoId;
    btnMenos.dataset.acao = 'menos';
    btnMenos.setAttribute('aria-label', `Diminuir ${produto.nome}`);
    btnMenos.textContent = '−';
    btnMenos.addEventListener('click', () => {
      const novaQtd = entrada.quantidade - 1;
      compra = mudarQuantidade(compra, produtoId, novaQtd).compra;
      tocar('clique');
      renderizarLoja();
      renderizarPainelCarrinho(novaQtd > 0 ? { itemId: produtoId, acao: 'menos' } : null);
    });

    const btnMais = document.createElement('button');
    btnMais.type = 'button';
    btnMais.className = 'botao botao--neutro botao-qtd';
    btnMais.dataset.itemId = produtoId;
    btnMais.dataset.acao = 'mais';
    btnMais.setAttribute('aria-label', `Aumentar ${produto.nome}`);
    btnMais.textContent = '+';
    btnMais.disabled = entrada.quantidade >= 6;
    btnMais.addEventListener('click', () => {
      const novaQtd = entrada.quantidade + 1;
      compra = mudarQuantidade(compra, produtoId, novaQtd).compra;
      tocar('clique');
      renderizarLoja();
      renderizarPainelCarrinho({ itemId: produtoId, acao: 'mais' });
    });

    const btnRemover = document.createElement('button');
    btnRemover.type = 'button';
    btnRemover.className = 'botao botao--neutro botao-qtd';
    btnRemover.dataset.itemId = produtoId;
    btnRemover.dataset.acao = 'remover';
    btnRemover.setAttribute('aria-label', `Remover ${produto.nome}`);
    btnRemover.textContent = '🗑️';
    btnRemover.addEventListener('click', () => {
      compra = mudarQuantidade(compra, produtoId, 0).compra;
      tocar('clique');
      renderizarLoja();
      renderizarPainelCarrinho();
    });

    controles.append(btnMenos, btnMais, btnRemover);
    linha.append(info, controles);
    container.append(linha);
  }

  for (const desejoId of compra.desejos) {
    const desejo = desejoPorId[desejoId];
    const preco = precoNoNivel(desejo.preco, nivel);
    const linha = document.createElement('div');
    linha.className = 'carrinho-linha';

    const info = document.createElement('div');
    info.className = 'carrinho-linha__info';
    info.textContent = `${desejo.emoji} ${desejo.nome} (${desejo.marca}) — ${formatarDinheiro(preco)}`;

    const controles = document.createElement('div');
    controles.className = 'carrinho-linha__controles';

    const btnRemover = document.createElement('button');
    btnRemover.type = 'button';
    btnRemover.className = 'botao botao--neutro';
    btnRemover.setAttribute('aria-label', `Devolver ${desejo.nome}`);
    btnRemover.textContent = '🗑️ Devolver';
    btnRemover.addEventListener('click', () => {
      compra = devolverDesejo(compra, desejoId).compra;
      tocar('clique');
      renderizarLoja();
      renderizarPainelCarrinho();
    });

    controles.append(btnRemover);
    linha.append(info, controles);
    container.append(linha);
  }

  const totalBox = $('carrinho-painel-total');
  if (nivel === 1 && temItens) {
    totalBox.hidden = false;
    totalBox.textContent = `Total: ${formatarDinheiro(totalDoCarrinho(compra))}`;
  } else {
    totalBox.hidden = true;
    totalBox.textContent = '';
  }

  if (focoDesejado) {
    const alvo = container.querySelector(
      `button[data-item-id="${focoDesejado.itemId}"][data-acao="${focoDesejado.acao}"]`,
    );
    if (alvo && !alvo.disabled) {
      alvo.focus();
      return;
    }
  }
  if (painelAtivo === PAINEIS.carrinho) {
    const focaveis = elementosFocaveis(PAINEIS.carrinho);
    if (focaveis.length && !PAINEIS.carrinho.contains(document.activeElement)) {
      focaveis[0].focus();
    }
  }
}

function acionarEspiada() {
  if (!compra || NIVEIS[compra.missao.nivel].espiadas <= 0) return;

  const aviso = $('espiada-aviso');
  const res = espiar(compra);
  if (res.recusa === 'sem-espiadas') {
    tocar('erro');
    aviso.hidden = false;
    aviso.textContent = 'As espiadas acabaram. Some de cabeça!';
    anunciar(aviso.textContent);
    return;
  }

  compra = res.compra;
  tocar('clique');
  renderizarPainelFixo();

  if (timerEspiada) clearTimeout(timerEspiada);
  aviso.hidden = false;
  aviso.textContent = `Total até agora: ${formatarDinheiro(res.total)}`;
  anunciar(aviso.textContent);

  timerEspiada = setTimeout(() => {
    timerEspiada = null;
    aviso.hidden = true;
    aviso.textContent = '';
  }, 4000);
}

/* ---------------- Caixa ---------------- */

function formatarNumeroVirgula(centavos) {
  const valor = Math.max(0, Math.trunc(Number(centavos) || 0));
  return `${Math.floor(valor / 100)},${String(valor % 100).padStart(2, '0')}`;
}

function formatarSomaArmada(valores) {
  if (valores.length === 2) {
    return contaArmada(valores[0], valores[1], '+').join('\n');
  }
  const soma = valores.reduce((a, b) => a + b, 0);
  const textos = valores.map(formatarNumeroVirgula);
  const textoSoma = formatarNumeroVirgula(soma);
  const largura = Math.max(
    ...textos.map(t => t.length + 2),
    textoSoma.length + 2,
  );
  const linhas = textos.map((texto, idx) => (
    idx === textos.length - 1
      ? `+ ${texto.padStart(largura - 2, ' ')}`
      : texto.padStart(largura, ' ')
  ));
  linhas.push('─'.repeat(largura));
  linhas.push(textoSoma.padStart(largura, ' '));
  return linhas.join('\n');
}

function construirTecladoNumerico() {
  const grid = $('teclado-numerico');
  grid.replaceChildren();
  const teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'apagar', '0', 'ok'];

  for (const tecla of teclas) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'botao teclado-numerico__tecla';
    if (tecla === 'ok') {
      btn.classList.add('botao--sucesso');
      btn.textContent = 'OK';
      btn.setAttribute('aria-label', 'Confirmar valor');
      btn.addEventListener('click', confirmarTecladoCaixa);
    } else if (tecla === 'apagar') {
      btn.classList.add('botao--neutro');
      btn.textContent = '⌫';
      btn.setAttribute('aria-label', 'Apagar último dígito');
      btn.addEventListener('click', () => digitarTecla('apagar'));
    } else {
      btn.classList.add('botao--neutro');
      btn.textContent = tecla;
      btn.addEventListener('click', () => digitarTecla(Number(tecla)));
    }
    grid.append(btn);
  }
}

function atualizarVisorCaixa() {
  $('caixa-visor').textContent = formatarDinheiro(estadoCaixa.valorDigitado);
}

function digitarTecla(tecla) {
  if (
    faseAtual !== 'caixa'
    || (estadoCaixa.etapa !== 'conta-total' && estadoCaixa.etapa !== 'conta-troco')
    || compra.missao.nivel === 1
  ) {
    return;
  }
  estadoCaixa.valorDigitado = digitar(estadoCaixa.valorDigitado, tecla);
  tocar('clique');
  atualizarVisorCaixa();
}

function confirmarTecladoCaixa() {
  if (faseAtual !== 'caixa') return;
  if (estadoCaixa.etapa === 'conta-total') {
    submeterRespostaCaixa('total', estadoCaixa.valorDigitado);
  } else if (estadoCaixa.etapa === 'conta-troco') {
    submeterRespostaCaixa('troco', estadoCaixa.valorDigitado);
  }
}

function renderizarBlocosCaixa() {
  const { etapa } = estadoCaixa;
  $('caixa-faltando').hidden = etapa !== 'faltando';
  $('caixa-cupom').hidden = etapa === 'faltando';
  $('caixa-estouro').hidden = etapa !== 'estourou';
  $('caixa-conta').hidden = !['conta-total', 'conta-troco', 'armada'].includes(etapa);
  $('caixa-rodape').hidden = etapa !== 'cupom';
}

function montarLinhasDoCupom() {
  const nivel = compra.missao.nivel;
  const linhas = [];
  const valores = [];

  for (const item of compra.missao.itens) {
    const entrada = compra.carrinho[item.produtoId];
    if (!entrada) continue;
    const produto = produtoPorId[item.produtoId];
    const opcao = opcoesNoNivel(produto, nivel).find(o => o.id === entrada.opcaoId);
    const precoItem = opcao.preco * entrada.quantidade;
    valores.push(precoItem);
    linhas.push({
      esquerda: `${produto.emoji} ${produto.nome} (${opcao.rotulo})`,
      direita: formatarEtiquetaQuantidade(entrada.quantidade, opcao.preco, nivel),
    });
  }

  for (const desejoId of compra.desejos) {
    const desejo = desejoPorId[desejoId];
    const preco = precoNoNivel(desejo.preco, nivel);
    valores.push(preco);
    linhas.push({
      esquerda: `${desejo.emoji} ${desejo.nome} (${desejo.marca})`,
      direita: formatarEtiquetaQuantidade(1, preco, nivel),
    });
  }

  return { linhas, valores };
}

function entrarNoCaixa() {
  estadoCaixa = resetarEstadoCaixa();
  const itensFaltando = faltando(compra);

  if (itensFaltando.length > 0) {
    const res = chegarAoCaixa(compra);
    compra = res.compra;
    estadoCaixa.etapa = 'faltando';
    mostrarFase('caixa');
    renderizarBlocosCaixa();

    const nomes = res.faltando.map(f => {
      const prod = produtoPorId[f.produtoId];
      return f.falta > 1 ? `${f.falta}× ${prod.nome.toLowerCase()}` : prod.nome.toLowerCase();
    });
    const texto = `Ainda falta: ${juntarComE(nomes)}.`;
    $('caixa-faltando-texto').textContent = texto;
    anunciar(texto);
    $('btn-voltar-faltando').focus();
    return;
  }

  const { linhas, valores } = montarLinhasDoCupom();
  estadoCaixa.linhasCupom = linhas;
  estadoCaixa.valoresCupom = valores;
  estadoCaixa.etapa = 'cupom';

  $('cupom-linhas').replaceChildren();
  $('cupom-total-revelado').hidden = true;
  $('cupom-total-revelado').textContent = '';
  $('caixa-feedback').textContent = '';
  $('caixa-feedback').className = 'feedback';
  $('caixa-conta-armada').hidden = true;
  $('btn-continuar-caixa').hidden = true;

  mostrarFase('caixa');
  renderizarBlocosCaixa();

  if (querMenosMovimento() || linhas.length === 0) {
    pularCupom();
  } else {
    $('btn-pular-cupom').hidden = false;
    timerCupom = setInterval(() => {
      if (estadoCaixa.indiceCupom < estadoCaixa.linhasCupom.length) {
        acrescentarLinhaCupom(estadoCaixa.linhasCupom[estadoCaixa.indiceCupom]);
        estadoCaixa.indiceCupom++;
      }
      if (estadoCaixa.indiceCupom >= estadoCaixa.linhasCupom.length) {
        concluirCupom();
      }
    }, 200);
  }
}

function acrescentarLinhaCupom(linha) {
  const li = document.createElement('li');
  li.className = 'cupom-linha';
  const esq = document.createElement('span');
  esq.textContent = linha.esquerda;
  const dir = document.createElement('span');
  dir.textContent = linha.direita;
  li.append(esq, dir);
  $('cupom-linhas').append(li);
}

function pularCupom() {
  limparCupomTimer();
  while (estadoCaixa.indiceCupom < estadoCaixa.linhasCupom.length) {
    acrescentarLinhaCupom(estadoCaixa.linhasCupom[estadoCaixa.indiceCupom]);
    estadoCaixa.indiceCupom++;
  }
  concluirCupom();
}

function concluirCupom() {
  limparCupomTimer();
  $('btn-pular-cupom').hidden = true;

  if (compra.missao.nivel === 3) {
    abrirContaDoTotal();
  } else {
    revelarTotalEConferirEstouro();
  }
}

function abrirContaDoTotal() {
  estadoCaixa.etapa = 'conta-total';
  estadoCaixa.tentativaTotal = 1;
  estadoCaixa.valorDigitado = 0;

  renderizarBlocosCaixa();
  $('caixa-pergunta').textContent = 'Quanto deu a compra?';
  $('caixa-alternativas').hidden = true;
  $('caixa-teclado-bloco').hidden = false;
  $('caixa-feedback').textContent = '';
  $('caixa-feedback').className = 'feedback';
  $('caixa-conta-armada').hidden = true;
  $('btn-continuar-caixa').hidden = true;
  construirTecladoNumerico();
  atualizarVisorCaixa();
  anunciar('Quanto deu a compra? Digite o total.');
}

function revelarTotalEConferirEstouro(mensagemAnterior = '') {
  const res = chegarAoCaixa(compra);
  compra = res.compra;
  estadoCaixa.totalCompra = res.total;

  $('cupom-total-revelado').hidden = false;
  $('cupom-total-revelado').textContent = `Total da compra: ${formatarDinheiro(res.total)}`;

  if (res.situacao === 'estourou') {
    estadoCaixa.etapa = 'estourou';
    renderizarBlocosCaixa();
    const msg = `Ih, passou! A compra deu ${formatarDinheiro(res.total)} e você tem ${formatarDinheiro(compra.missao.orcamento)}. Passou ${formatarDinheiro(res.diferenca)}. Vamos devolver ou trocar alguma coisa?`;
    $('caixa-estouro-texto').textContent = msg;
    tocar('erro');
    anunciar(msg);
    $('btn-voltar-estouro').focus();
    return;
  }

  abrirContaDoTroco(res.total, res.troco, mensagemAnterior);
}

function abrirContaDoTroco(total, troco, mensagemAnterior = '') {
  estadoCaixa.etapa = 'conta-troco';
  estadoCaixa.totalCompra = total;
  estadoCaixa.trocoCompra = troco;
  estadoCaixa.tentativaTroco = 1;
  estadoCaixa.valorDigitado = 0;

  renderizarBlocosCaixa();
  const pergunta = `Você entrega ${formatarDinheiro(compra.missao.orcamento)}. A compra deu ${formatarDinheiro(total)}. Quanto volta de troco?`;
  $('caixa-pergunta').textContent = pergunta;
  $('caixa-conta-armada').hidden = true;
  $('btn-continuar-caixa').hidden = true;

  const feedback = $('caixa-feedback');
  if (mensagemAnterior) {
    feedback.textContent = mensagemAnterior;
    feedback.className = 'feedback feedback--certo';
  } else {
    feedback.textContent = '';
    feedback.className = 'feedback';
  }

  if (compra.missao.nivel === 1) {
    $('caixa-teclado-bloco').hidden = true;
    const altBox = $('caixa-alternativas');
    altBox.hidden = false;
    altBox.replaceChildren();
    const rnd = criarGerador(compra.missao.semente + compra.estouros + 1);
    const opcoes = alternativasDeTroco(troco, rnd);
    for (const valorAlt of opcoes) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'botao botao--neutro';
      btn.textContent = formatarDinheiro(valorAlt);
      btn.addEventListener('click', () => submeterRespostaCaixa('troco', valorAlt, btn));
      altBox.append(btn);
    }
  } else {
    $('caixa-alternativas').hidden = true;
    $('caixa-teclado-bloco').hidden = false;
    construirTecladoNumerico();
    atualizarVisorCaixa();
  }

  anunciar(pergunta);
}

function submeterRespostaCaixa(tipo, valor, botaoClicado = null) {
  const tentativa = tipo === 'total' ? estadoCaixa.tentativaTotal : estadoCaixa.tentativaTroco;
  const res = responderConta(compra, tipo, valor, tentativa);
  compra = res.compra;

  const feedback = $('caixa-feedback');

  if (res.certa) {
    tocar('acerto');
    feedback.textContent = 'Isso mesmo!';
    feedback.className = 'feedback feedback--certo';
    anunciar('Isso mesmo!');

    if (tipo === 'total') {
      revelarTotalEConferirEstouro('Isso mesmo!');
    } else {
      finalizarCompraPaga();
    }
    return;
  }

  tocar('erro');
  if (tentativa === 1) {
    if (tipo === 'total') {
      estadoCaixa.tentativaTotal = 2;
    } else {
      estadoCaixa.tentativaTroco = 2;
    }
    estadoCaixa.valorDigitado = 0;
    atualizarVisorCaixa();
    feedback.textContent = 'Quase! Confira e tente de novo.';
    feedback.className = 'feedback feedback--errado';
    anunciar(feedback.textContent);
    animar(compra.missao.nivel === 1 && tipo === 'troco' ? $('caixa-alternativas') : $('caixa-visor'), 'tremer');
    if (botaoClicado) {
      botaoClicado.disabled = true;
    }
    return;
  }

  // Segunda falha: mostra a conta armada e botão de continuar
  estadoCaixa.etapa = 'armada';
  estadoCaixa.tipoArmada = tipo;
  renderizarBlocosCaixa();

  feedback.textContent = 'Vamos ver juntas:';
  feedback.className = 'feedback feedback--errado';

  const armada = $('caixa-conta-armada');
  armada.hidden = false;
  armada.textContent = tipo === 'total'
    ? formatarSomaArmada(estadoCaixa.valoresCupom)
    : contaArmada(compra.missao.orcamento, estadoCaixa.totalCompra, '-').join('\n');

  $('teclado-numerico').querySelectorAll('button').forEach(b => { b.disabled = true; });
  $('caixa-alternativas').querySelectorAll('button').forEach(b => { b.disabled = true; });

  const btnContinuar = $('btn-continuar-caixa');
  btnContinuar.hidden = false;
  btnContinuar.textContent = tipo === 'total' ? 'Continuar' : 'Ver resultado';
  btnContinuar.focus();
  anunciar(`Vamos ver juntas: a resposta certa é ${formatarDinheiro(res.respostaCerta)}.`);
}

function finalizarCompraPaga() {
  compra = pagar(compra);
  const res = resultadoDaCompra(compra);

  if (!partidaRegistrada) {
    partidaRegistrada = true;
    registrarPartida('mercadinho', {
      acertos: res.acertos,
      erros: res.erros,
      estrelas: res.estrelas,
    });
  }

  renderizarResultado(res);
  mostrarFase('resultado');
  tocar('vitoria');
  lancarConfete();
}

function renderizarResultado(res) {
  const nome = nomeDaCrianca();
  let frase = `${nome}, compra feita! Na próxima dá para caprichar mais.`;
  if (res.estrelas === 3) {
    frase = `${nome}, compra perfeita!`;
  } else if (res.estrelas === 2) {
    frase = `${nome}, muito bem! Faltou pouco.`;
  }
  $('resultado-titulo').textContent = frase;

  const estrelasEl = $('resultado-estrelas');
  estrelasEl.textContent = '⭐'.repeat(res.estrelas) + '☆'.repeat(3 - res.estrelas);
  estrelasEl.setAttribute('aria-label', `${res.estrelas} de 3 estrelas`);

  const objetivos = $('resultado-objetivos');
  objetivos.replaceChildren();
  const itensObjetivo = [
    `${res.objetivos.missaoCumprida ? '✅' : '⬜'} Missão cumprida · Compra paga dentro do orçamento`,
    `${res.objetivos.familiaFeliz ? '✅' : '⬜'} Família feliz · ${res.coracoes} de ${compra.missao.metaCoracoes} corações`,
    `${res.objetivos.contasCertas ? '✅' : '⬜'} Contas certas · Sem estouros e acertou de primeira`,
  ];
  for (const texto of itensObjetivo) {
    const li = document.createElement('li');
    li.className = 'resultado-objetivos__item';
    li.textContent = texto;
    objetivos.append(li);
  }

  const resumo = $('resultado-resumo');
  resumo.replaceChildren();

  const pEscolhas = document.createElement('p');
  const partesEscolhas = res.escolhas.map(e => {
    const prod = produtoPorId[e.produtoId];
    return `${prod.nome}: ${e.rotulo}, ${ROTULOS_POSICAO[e.posicao]}`;
  });
  pEscolhas.textContent = `Suas escolhas — ${partesEscolhas.join(' · ')}.`;
  resumo.append(pEscolhas);

  if (res.aMais.length) {
    const pExtra = document.createElement('p');
    const extras = res.aMais.map(extra => {
      const prod = produtoPorId[extra.produtoId];
      return `${extra.sobra} ${prod.nome.toLowerCase()} a mais`;
    });
    pExtra.textContent = `Você levou ${juntarComE(extras)}.`;
    resumo.append(pExtra);
  }

  const pGuloseima = document.createElement('p');
  if (compra.desejos.length === 0) {
    pGuloseima.textContent = 'Você não levou guloseima.';
  } else {
    const nomes = compra.desejos.map(id => desejoPorId[id].nome);
    pGuloseima.textContent = `Você levou ${juntarComE(nomes)}.`;
  }
  resumo.append(pGuloseima);

  const pCoracoes = document.createElement('p');
  pCoracoes.textContent = `${res.coracoes} ${res.coracoes === 1 ? 'coração' : 'corações'}. O máximo possível hoje era ${compra.missao.maximoCoracoes}.`;
  resumo.append(pCoracoes);

  const pTroco = document.createElement('p');
  pTroco.textContent = `Sobrou ${formatarDinheiro(res.troco)}.`;
  resumo.append(pTroco);

  anunciar(`${frase} ${res.estrelas} de 3 estrelas.`);
}

/* ---------------- Eventos ---------------- */

selecionarNivel(nivelSelecionado);
atualizarBotoesModoInicio();

document.querySelectorAll('.nivel[data-nivel]').forEach(botao => {
  botao.addEventListener('click', () => {
    tocar('clique');
    selecionarNivel(botao.dataset.nivel);
  });
});

$('btn-modo-andar').addEventListener('click', () => {
  if (!renderizador || arteFalhou) return;
  tocar('clique');
  modoListaPreferido = false;
  salvarPreferenciaModoLista(false);
  atualizarBotoesModoInicio();
});

$('btn-modo-lista').addEventListener('click', () => {
  tocar('clique');
  modoListaPreferido = true;
  salvarPreferenciaModoLista(true);
  atualizarBotoesModoInicio();
});

$('btn-comecar').addEventListener('click', () => {
  tocar('clique');
  iniciarNovaMissao();
});

$('btn-ir-compras').addEventListener('click', () => {
  tocar('clique');
  renderizarLoja();
  mostrarFase('loja');
  anunciar(
    usarListaRapida()
      ? 'Você entrou no mercado. Escolha uma seção.'
      : 'Você entrou no mercado. Toque no mapa ou use as setas para andar.',
  );
});

$('btn-alternar-modo-loja').addEventListener('click', () => {
  if (!renderizador || arteFalhou) return;
  tocar('clique');
  pararMovimento(false);
  modoListaPreferido = !modoListaPreferido;
  salvarPreferenciaModoLista(modoListaPreferido);
  atualizarBotoesModoInicio();
  renderizarLoja();
  if (!usarListaRapida()) {
    renderizador.ajustarTamanho();
    desenharMapa();
    $('mapa-canvas').focus();
    anunciar('Modo mapa ativado.');
  } else {
    anunciar('Lista rápida ativada.');
  }
});

$('btn-interagir-mapa').addEventListener('click', () => {
  acionarInteracaoAdjacente($('btn-interagir-mapa'));
});

$('mapa-canvas').addEventListener('click', evento => {
  if (!renderizador || faseAtual !== 'loja' || painelAtivo || usarListaRapida()) return;
  const casa = renderizador.eventoParaCasa(evento);
  if (!casa) return;
  interagirComCasa(casa.x, casa.y);
});

window.addEventListener('resize', () => {
  if (faseAtual === 'loja' && !usarListaRapida() && renderizador) {
    renderizador.ajustarTamanho();
    desenharMapa();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pararMovimento(true);
  }
});

$('btn-voltar-inicio').addEventListener('click', () => {
  tocar('clique');
  compra = null;
  mostrarFase('inicio');
});

$('btn-voltar-secoes').addEventListener('click', () => {
  tocar('clique');
  secaoAberta = null;
  renderizarLoja();
  anunciar('Todas as seções.');
  const primeiraSecao = $('grade-secoes').querySelector('button');
  if (primeiraSecao) primeiraSecao.focus();
});

$('btn-abrir-lista').addEventListener('click', () => {
  tocar('clique');
  abrirPainelLista($('btn-abrir-lista'));
});

$('btn-abrir-carrinho').addEventListener('click', () => {
  tocar('clique');
  abrirPainelCarrinho($('btn-abrir-carrinho'));
});

$('btn-espiar').addEventListener('click', acionarEspiada);

$('btn-ir-caixa').addEventListener('click', () => {
  tocar('clique');
  entrarNoCaixa();
});

$('btn-sair-loja').addEventListener('click', () => {
  if (!confirmarSaidaDaCompra()) return;
  tocar('clique');
  compra = null;
  mostrarFase('inicio');
});

$('btn-voltar-faltando').addEventListener('click', () => {
  tocar('clique');
  renderizarLoja();
  mostrarFase('loja');
});

$('btn-voltar-estouro').addEventListener('click', () => {
  tocar('clique');
  renderizarLoja();
  mostrarFase('loja');
});

$('btn-voltar-loja-caixa').addEventListener('click', () => {
  if (estadoCaixa.etapa !== 'cupom') return;
  tocar('clique');
  renderizarLoja();
  mostrarFase('loja');
});

$('btn-pular-cupom').addEventListener('click', () => {
  tocar('clique');
  pularCupom();
});

$('btn-continuar-caixa').addEventListener('click', () => {
  tocar('clique');
  if (estadoCaixa.tipoArmada === 'total') {
    revelarTotalEConferirEstouro();
  } else {
    finalizarCompraPaga();
  }
});

$('btn-jogar-de-novo').addEventListener('click', () => {
  tocar('clique');
  iniciarNovaMissao();
});

$('btn-trocar-nivel').addEventListener('click', () => {
  tocar('clique');
  compra = null;
  mostrarFase('inicio');
});

$('btn-qtd-menos').addEventListener('click', () => alterarQuantidadePrateleira(-1));
$('btn-qtd-mais').addEventListener('click', () => alterarQuantidadePrateleira(1));

$('btn-fechar-prateleira').addEventListener('click', () => {
  tocar('clique');
  fecharPainel();
});
$('btn-fechar-lista').addEventListener('click', () => {
  tocar('clique');
  fecharPainel();
});
$('btn-fechar-carrinho').addEventListener('click', () => {
  tocar('clique');
  fecharPainel();
});

Object.values(PAINEIS).forEach(painel => {
  painel.addEventListener('click', evento => {
    if (evento.target === painel) {
      tocar('clique');
      fecharPainel();
    }
  });
});

const linkInicioCabecalho = document.querySelector('.cabecalho__inicio');
if (linkInicioCabecalho) {
  linkInicioCabecalho.addEventListener('click', evento => {
    if (!confirmarSaidaDaCompra()) {
      evento.preventDefault();
    }
  });
}

document.addEventListener('keydown', evento => {
  if (painelAtivo) {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      tocar('clique');
      fecharPainel();
      return;
    }

    if (evento.key === 'Tab') {
      const focaveis = elementosFocaveis(painelAtivo);
      if (!focaveis.length) {
        evento.preventDefault();
        return;
      }
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (evento.shiftKey && (document.activeElement === primeiro || !painelAtivo.contains(document.activeElement))) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && (document.activeElement === ultimo || !painelAtivo.contains(document.activeElement))) {
        evento.preventDefault();
        primeiro.focus();
      }
    }
    return;
  }

  if (
    faseAtual === 'loja'
    && !usarListaRapida()
    && !evento.ctrlKey
    && !evento.metaKey
    && !evento.altKey
  ) {
    const mapaDirecoes = {
      ArrowUp: 'cima',
      w: 'cima',
      W: 'cima',
      ArrowDown: 'baixo',
      s: 'baixo',
      S: 'baixo',
      ArrowLeft: 'esquerda',
      a: 'esquerda',
      A: 'esquerda',
      ArrowRight: 'direita',
      d: 'direita',
      D: 'direita',
    };
    const direcao = mapaDirecoes[evento.key];
    if (direcao) {
      evento.preventDefault();
      andarUmaCasa(direcao);
      return;
    }

    if (
      (evento.key === 'Enter' || evento.key === ' ')
      && !evento.target?.closest?.('button, a, input, select, textarea')
      && alvoAdjacenteAtual()
    ) {
      evento.preventDefault();
      acionarInteracaoAdjacente($('mapa-canvas'));
      return;
    }
  }

  if (
    faseAtual === 'caixa'
    && !$('caixa-teclado-bloco').hidden
    && (estadoCaixa.etapa === 'conta-total' || estadoCaixa.etapa === 'conta-troco')
  ) {
    if (/^[0-9]$/.test(evento.key)) {
      evento.preventDefault();
      digitarTecla(Number(evento.key));
    } else if (evento.key === 'Backspace' || evento.key === 'Delete') {
      evento.preventDefault();
      digitarTecla('apagar');
    } else if (evento.key === 'Enter' && evento.target?.tagName !== 'BUTTON') {
      evento.preventDefault();
      confirmarTecladoCaixa();
    }
  }
});
