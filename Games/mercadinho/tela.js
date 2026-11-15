import { montarCabecalho } from '../../shared/cabecalho.js';
import { animar, lancarConfete } from '../../shared/confete.js';
import { nomeDaCrianca, obterConfiguracoes, registrarPartida } from '../../shared/progresso.js';
import { tocar } from '../../shared/sons.js';
import {
  FIGURA_DO_PRODUTO,
  ICONE_DO_SONHO,
  ICONE_DO_TEMA,
  SECOES_VISUAIS,
  criarFigura,
  criarIconeUi,
} from './figuras.js';
import { desejos, produtos, sonhos, temas } from './dados.js';
import {
  comPreferencia,
  depositar,
  escolherSonho,
  gravarCofrinho,
  lerCofrinho,
  podeRealizar,
  realizarSonho,
  sonhosDisponiveis,
} from './cofrinho.js';
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
import { CONSULTA_LAYOUT_LARGO, criarRenderizador } from './renderizador.js';
import {
  NIVEIS,
  alternativasDeTroco,
  chegarAoCaixa,
  colocarNoCarrinho,
  conferirDados,
  contaArmada,
  somaArmada,
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
const secaoVisualPorId = Object.fromEntries(Object.values(SECOES_VISUAIS).map(s => [s.id, s]));

const SECOES_LISTA_RAPIDA = [
  ...Object.values(SECOES),
  { id: 'guloseimas', nome: 'Guloseimas' },
];

const ROTULOS_POSICAO = {
  'em-conta': 'a mais em conta',
  meio: 'a do meio',
  queridinha: 'a queridinha da família',
};

const FASES = {
  inicio: $('fase-inicio'),
  tutorial: $('fase-tutorial'),
  missao: $('fase-missao'),
  loja: $('fase-loja'),
  caixa: $('fase-caixa'),
  resultado: $('fase-resultado'),
};

const PAINEIS = {
  prateleira: $('painel-prateleira'),
  gondola: $('painel-gondola'),
  lista: $('painel-lista'),
  carrinho: $('painel-carrinho'),
};

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

let estadoCofrinho = lerCofrinho();
let escolhendoSonho = false;
let modoListaPreferido = estadoCofrinho.modoLista;
let tutorialVisto = estadoCofrinho.tutorialVisto;
let indiceTutorial = 0;
let destinoAposTutorial = 'missao';
let ultimoTemaId = null;
// Sem a janela do mapa (ex.: ambiente sem DOM), o renderizador vem null e o jogo cai na lista rápida.
const renderizador = criarRenderizador($('mapa-janela'));
const consultaLayoutLargo = typeof window.matchMedia === 'function'
  ? window.matchMedia(CONSULTA_LAYOUT_LARGO)
  : null;
let ultimoLayoutLargo = Boolean(consultaLayoutLargo?.matches);

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

function salvarEstadoCofrinho(novo) {
  estadoCofrinho = novo;
  gravarCofrinho(estadoCofrinho); // armazenamento bloqueado: vale só nesta sessão
}

function salvarPreferencia(campo, valor) {
  salvarEstadoCofrinho(comPreferencia(estadoCofrinho, campo, valor));
}

function salvarPreferenciaModoLista(valor) {
  salvarPreferencia('modoLista', Boolean(valor));
}

function usarListaRapida() {
  return modoListaPreferido || !renderizador;
}

function atualizarBotoesModoInicio() {
  const mapaDisponivel = Boolean(renderizador);
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
  $('loja-secao-atual').textContent = `Você está em: ${secao.nome}`;

  const alvo = alvoAdjacenteAtual();
  const btn = $('btn-interagir-mapa');
  btn.hidden = false;

  if (!alvo) {
    btn.disabled = true;
    btn.className = 'botao botao--neutro botao-interagir-mapa';
    btn.textContent = 'Toque no mapa';
    nav.ultimoAnuncioFrente = '';
    return;
  }

  const nome = nomeDoAlvo(alvo);
  btn.disabled = false;
  btn.className = 'botao botao--sucesso botao-interagir-mapa';
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
    executarAcaoCelula(acao, $('mapa-janela'));
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
    executarAcaoCelula(alvo, $('mapa-janela'));
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
  span.className = 'coracoes';
  span.setAttribute('role', 'img');
  span.setAttribute('aria-label', `${qtd} de 3 corações`);
  for (let i = 0; i < 3; i++) {
    span.append(criarIconeUi(i < qtd ? 'coracao' : 'coracao-vazio', 22));
  }
  return span;
}

function criarIconeInline(nome) {
  const img = criarIconeUi(nome, 0);
  img.classList.add('icone-texto');
  return img;
}

function criarCaixaCheckVazio() {
  const caixa = document.createElement('span');
  caixa.className = 'caixa-check-vazio';
  caixa.setAttribute('aria-hidden', 'true');
  return caixa;
}

function hidratarIconesEstaticos() {
  document.querySelectorAll('[data-icone]').forEach(el => {
    const nome = el.dataset.icone;
    const tamanho = Number(el.dataset.tamanho) || 24;
    if (nome) {
      el.replaceChildren(criarIconeUi(nome, tamanho));
    }
  });
}

function animarItemParaOCarrinho(origemEl) {
  const btnCarrinho = $('btn-abrir-carrinho');
  if (!btnCarrinho) return;

  if (!querMenosMovimento() && origemEl) {
    const rOrig = origemEl.getBoundingClientRect();
    const rDest = btnCarrinho.getBoundingClientRect();
    if (rOrig.width > 0 && rOrig.height > 0 && rDest.width > 0 && rDest.height > 0) {
      const clone = origemEl.cloneNode(true);
      clone.classList.add('fig-voadora');
      clone.style.left = `${rOrig.left}px`;
      clone.style.top = `${rOrig.top}px`;
      clone.style.width = `${rOrig.width}px`;
      clone.style.height = `${rOrig.height}px`;
      document.body.append(clone);

      const dx = (rDest.left + rDest.width / 2) - (rOrig.left + rOrig.width / 2);
      const dy = (rDest.top + rDest.height / 2) - (rOrig.top + rOrig.height / 2);

      requestAnimationFrame(() => {
        clone.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(0.32)`;
        clone.style.opacity = '0.15';
      });
      setTimeout(() => clone.remove(), 310);
    }
  }

  if (!querMenosMovimento()) {
    animar(btnCarrinho, 'pular', 350);
    const contaPeao = document.querySelector('.peao__conta');
    if (contaPeao) animar(contaPeao, 'pular', 350);
  }
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

function atualizarModoViewportLoja() {
  const modoMapa = Boolean(faseAtual === 'loja' && compra && !usarListaRapida());
  document.body.classList.toggle('jogo-mercadinho--mapa', modoMapa);
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
  if (nome === 'inicio') {
    escolhendoSonho = false;
    renderizarCofrinho();
  }
  atualizarModoViewportLoja();

  if (nome === 'loja' && !usarListaRapida() && renderizador) {
    renderizarLoja();
    renderizador.ajustarTamanho();
    atualizarIndicacaoMapa({ anunciarSeMudou: false });
    desenharMapa();
    $('mapa-janela').focus();
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

const CARTOES_TUTORIAL = [
  {
    icones: ['lista', 'saco-de-dinheiro'],
    titulo: 'A lista e o dinheiro',
    texto: () => 'Cada compra tem uma lista e um dinheiro certinho. Compre tudo o que está na lista sem passar do dinheiro que você tem.',
  },
  {
    icones: ['menina', 'mercado'],
    titulo: 'Andar e abrir prateleiras',
    texto: () => (usarListaRapida()
      ? 'Toque numa seção do mercado e depois num produto para ver as marcas e os preços.'
      : 'Toque no chão para andar e numa prateleira para ver as marcas e os preços. No computador, as setas também andam.'),
  },
  {
    icones: ['coracao', 'pirulito'],
    titulo: 'Corações e guloseimas',
    texto: () => 'Cada marca vale corações. Junte os corações da meta e a família fica feliz. Perto do caixa tem guloseimas, mas dá para levar só um pouquinho.',
  },
  {
    icones: ['cupom', 'moeda'],
    titulo: 'O caixa',
    texto: () => 'Pegou tudo? Vá até um caixa. Lá aparece o cupom da compra e você calcula o troco.',
  },
];

function abrirTutorial(destino) {
  destinoAposTutorial = destino;
  indiceTutorial = 0;
  renderizarTutorial();
  mostrarFase('tutorial');
  $('tutorial-titulo').focus();
}

function renderizarTutorial() {
  const cartao = CARTOES_TUTORIAL[indiceTutorial];
  const total = CARTOES_TUTORIAL.length;
  $('tutorial-passo').textContent = `Como jogar · ${indiceTutorial + 1} de ${total}`;
  $('tutorial-icones').replaceChildren(...cartao.icones.map(nome => criarIconeUi(nome, 64)));
  $('tutorial-titulo').textContent = cartao.titulo;
  $('tutorial-texto').textContent = cartao.texto();
  $('tutorial-pontos').replaceChildren(...CARTOES_TUTORIAL.map((_, i) => {
    const ponto = document.createElement('span');
    ponto.className = `tutorial__ponto${i === indiceTutorial ? ' tutorial__ponto--atual' : ''}`;
    return ponto;
  }));
  $('btn-tutorial-voltar').hidden = indiceTutorial === 0;
  const ultimo = indiceTutorial === total - 1;
  $('btn-tutorial-proximo').textContent = ultimo
    ? (destinoAposTutorial === 'missao' ? 'Ver a lista de hoje' : 'Entendi!')
    : 'Próximo →';
  $('btn-tutorial-pular').hidden = ultimo;
}

function avancarTutorial(delta) {
  const novo = indiceTutorial + delta;
  if (novo >= CARTOES_TUTORIAL.length) {
    concluirTutorial();
    return;
  }
  indiceTutorial = Math.max(0, novo);
  renderizarTutorial();
  $('tutorial-titulo').focus();
  anunciar(`${CARTOES_TUTORIAL[indiceTutorial].titulo}. ${$('tutorial-texto').textContent}`);
}

function concluirTutorial() {
  if (!tutorialVisto) {
    tutorialVisto = true;
    salvarPreferencia('tutorialVisto', true);
  }
  if (destinoAposTutorial === 'missao') {
    iniciarNovaMissao();
  } else {
    mostrarFase('inicio');
    $('btn-como-jogar').focus();
  }
}

function iniciarNovaMissao() {
  // Missão seguida nunca repete o tema da anterior (e, com isso, nunca repete a lista).
  let missao = null;
  for (let tentativa = 0; tentativa < 10; tentativa++) {
    const semente = (Math.floor(Math.random() * 0x7fffffff) + 1) >>> 0;
    missao = gerarMissao({ nivel: nivelSelecionado, semente });
    if (missao.temaId !== ultimoTemaId) break;
  }
  ultimoTemaId = missao.temaId;
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
  $('missao-titulo').replaceChildren(
    criarIconeInline(ICONE_DO_TEMA[missao.temaId] || 'cesto'),
    document.createTextNode(missao.titulo),
  );

  const convite = $('missao-convite');
  convite.replaceChildren();
  convite.append(document.createTextNode(`${tema.convite} Você tem `));
  const strongDinheiro = document.createElement('strong');
  strongDinheiro.textContent = formatarDinheiro(missao.orcamento);
  convite.append(strongDinheiro, document.createTextNode('. A família fica feliz com '));
  const strongCoracoes = document.createElement('strong');
  strongCoracoes.append(document.createTextNode(`${missao.metaCoracoes} `), criarIconeInline('coracao'));
  convite.append(strongCoracoes, document.createTextNode('ou mais.'));

  const lista = $('missao-lista');
  lista.replaceChildren();
  for (const item of missao.itens) {
    const produto = produtoPorId[item.produtoId];
    const secao = secaoPorId[produto.secao];
    const iconeItem = FIGURA_DO_PRODUTO[produto.id]?.[1] || 'cesto';
    const li = document.createElement('li');
    li.className = 'lista-missao__item';
    li.append(
      criarIconeInline(iconeItem),
      document.createTextNode(`${item.quantidade} × ${produto.nome} (${produto.medida}) · ${secao.nome}`),
    );
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

function preencherFichaHud(el, iconeNome, principal, detalhe, ariaTexto, { detalheAntes = false } = {}) {
  const nos = [criarIconeUi(iconeNome, 22)];
  const span = document.createElement('span');
  span.className = 'ficha__valor';
  span.textContent = principal;
  if (detalhe) {
    const small = document.createElement('small');
    small.textContent = detalhe;
    if (detalheAntes) {
      nos.push(small, span);
    } else {
      nos.push(span, small);
    }
  } else {
    nos.push(span);
  }
  el.replaceChildren(...nos);
  el.setAttribute('aria-label', ariaTexto);
}

function renderizarPainelFixo() {
  const { missao } = compra;
  const nivel = missao.nivel;
  const valorOrcamento = formatarDinheiro(missao.orcamento);

  preencherFichaHud(
    $('loja-dinheiro'),
    'saco-de-dinheiro',
    valorOrcamento,
    'Você tem',
    `Você tem ${valorOrcamento}`,
    { detalheAntes: true },
  );

  const coracoes = coracoesDoCarrinho(compra);
  const metaBatida = coracoes >= missao.metaCoracoes;
  const elCoracoes = $('loja-coracoes');
  preencherFichaHud(
    elCoracoes,
    'coracao',
    String(coracoes),
    `de ${missao.metaCoracoes}${metaBatida ? ' ✓' : ''}`,
    `${coracoes} de ${missao.metaCoracoes} corações${metaBatida ? ', meta atingida' : ''}`,
  );
  elCoracoes.classList.toggle('meta-batida', metaBatida);

  const completos = contarItensCompletos();
  const totalLista = missao.itens.length;
  const seloListaCompleto = completos === totalLista ? ' ✓' : '';
  preencherFichaHud(
    $('btn-abrir-lista'),
    'lista',
    'Lista',
    `${completos} de ${totalLista}${seloListaCompleto}`,
    `Lista (${completos} de ${totalLista}${seloListaCompleto})`,
  );

  const totalItensCarrinho = contarTotalNoCarrinho();
  preencherFichaHud(
    $('btn-abrir-carrinho'),
    'carrinho',
    'Carrinho',
    String(totalItensCarrinho),
    `Carrinho (${totalItensCarrinho})`,
  );

  const btnEspiar = $('btn-espiar');
  if (NIVEIS[nivel].espiadas > 0) {
    btnEspiar.hidden = false;
    preencherFichaHud(
      btnEspiar,
      'olhos',
      'Espiar',
      String(compra.espiadasRestantes),
      `Espiar o total (${compra.espiadasRestantes})`,
    );
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
  atualizarModoViewportLoja();

  const listaAtiva = usarListaRapida();
  const cabecalhoLoja = $('loja-cabecalho');
  const cabIcone = $('loja-cabecalho-icone');
  const cabSecao = $('loja-secao-atual');
  const btnVoltarSecoes = $('btn-voltar-secoes');
  const btnAlternarModo = $('btn-alternar-modo-loja');
  const mapaBloco = $('loja-mapa-bloco');
  const gradeSecoes = $('grade-secoes');
  const listaProdutos = $('lista-produtos');
  const btnInteragirMapa = $('btn-interagir-mapa');
  const btnIrCaixa = $('btn-ir-caixa');
  const btnSairLoja = $('btn-sair-loja');
  const acoesLoja = $('acoes-loja');
  const layoutLargo = Boolean(consultaLayoutLargo?.matches);
  ultimoLayoutLargo = layoutLargo;

  if (btnAlternarModo) {
    btnAlternarModo.hidden = !renderizador;
  }

  btnIrCaixa.hidden = false;
  btnIrCaixa.replaceChildren(criarIconeUi('cupom', 20), 'Ir para o caixa');

  if (!listaAtiva) {
    cabecalhoLoja.className = 'loja-cabecalho';
    cabecalhoLoja.style.removeProperty('--sec');
    cabIcone.hidden = true;
    cabIcone.replaceChildren();
    btnVoltarSecoes.hidden = true;

    if (layoutLargo) {
      $('painel-fixo').append(btnSairLoja);
      acoesLoja.append(btnInteragirMapa, btnIrCaixa);
      if (btnAlternarModo) {
        btnAlternarModo.className = 'botao botao--neutro botao-alternar-modo';
        btnAlternarModo.replaceChildren(criarIconeUi('lista', 20), 'Lista rápida');
        btnAlternarModo.setAttribute('aria-label', 'Mudar para lista rápida');
        acoesLoja.append(btnAlternarModo);
      }
    } else {
      $('hud-linha1').append(btnSairLoja);
      acoesLoja.append(btnInteragirMapa, btnIrCaixa);
      if (btnAlternarModo) {
        btnAlternarModo.className = 'botao selo-modo';
        btnAlternarModo.replaceChildren(criarIconeUi('lista', 20), 'Lista rápida');
        btnAlternarModo.setAttribute('aria-label', 'Mudar para lista rápida');
        mapaBloco.append(btnAlternarModo);
      }
    }

    mapaBloco.append($('espiada-aviso'));
    btnSairLoja.className = 'botao botao--neutro ficha ficha--sair';
    btnSairLoja.textContent = 'Sair';
    btnIrCaixa.className = 'botao botao--neutro';

    mapaBloco.hidden = false;
    gradeSecoes.hidden = true;
    listaProdutos.hidden = true;
    atualizarIndicacaoMapa({ anunciarSeMudou: false });
    if (faseAtual === 'loja') desenharMapa();
    return;
  }

  $('painel-fixo').append($('espiada-aviso'));
  acoesLoja.append(btnInteragirMapa, btnIrCaixa, btnSairLoja);
  btnSairLoja.className = 'botao botao--neutro';
  btnSairLoja.textContent = 'Trocar nível';
  btnInteragirMapa.hidden = true;
  btnIrCaixa.className = 'botao botao--sucesso';

  mapaBloco.hidden = true;

  if (!secaoAberta) {
    cabecalhoLoja.className = 'loja-cabecalho';
    cabecalhoLoja.style.removeProperty('--sec');
    cabIcone.hidden = true;
    cabIcone.replaceChildren();
    cabSecao.replaceChildren(document.createTextNode('Escolha uma seção'));
    btnVoltarSecoes.hidden = true;

    if (btnAlternarModo) {
      btnAlternarModo.className = 'botao botao--neutro botao-alternar-modo';
      btnAlternarModo.replaceChildren(criarIconeUi('mercado', 20), 'Ver no mapa');
      btnAlternarModo.setAttribute('aria-label', 'Ver no mapa');
      cabecalhoLoja.append(btnAlternarModo);
    }

    gradeSecoes.hidden = false;
    listaProdutos.hidden = true;

    gradeSecoes.replaceChildren();
    for (const sec of SECOES_LISTA_RAPIDA) {
      const secVisual = secaoVisualPorId[sec.id] || SECOES_VISUAIS.M;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'botao botao--neutro botao-secao';
      btn.dataset.secao = sec.id;
      btn.style.setProperty('--sec', secVisual.cor);

      const icone = document.createElement('span');
      icone.className = 'botao-secao__icone';
      icone.setAttribute('aria-hidden', 'true');
      icone.append(criarIconeUi(secVisual.icone, 40));

      const nome = document.createElement('span');
      nome.className = 'botao-secao__nome';
      const dicaNivel1 = compra.missao.nivel === 1 && secaoTemItemFaltando(sec.id) ? ' (!)' : '';
      nome.textContent = `${sec.nome}${dicaNivel1}`;

      btn.append(icone, nome);
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
  const secVisual = secaoVisualPorId[secaoAberta] || SECOES_VISUAIS.M;
  cabecalhoLoja.className = 'loja-cabecalho loja-cabecalho--secao';
  cabecalhoLoja.style.setProperty('--sec', secVisual.cor);

  btnVoltarSecoes.hidden = false;
  btnVoltarSecoes.textContent = '←';
  btnVoltarSecoes.setAttribute('aria-label', 'Todas as seções');

  cabIcone.hidden = false;
  cabIcone.replaceChildren(criarIconeUi(secVisual.icone, 28));

  const subtituloCab = document.createElement('small');
  subtituloCab.className = 'loja-secao-atual__subtitulo';
  subtituloCab.textContent = 'Toque num produto para ver as marcas';
  cabSecao.replaceChildren(document.createTextNode(infoSecao.nome), subtituloCab);

  if (btnAlternarModo) {
    btnAlternarModo.className = 'botao botao--neutro botao-alternar-modo';
    const textoModo = document.createElement('span');
    textoModo.className = 'botao-alternar-modo__texto';
    textoModo.textContent = 'Ver no mapa';
    btnAlternarModo.replaceChildren(criarIconeUi('mercado', 20), textoModo);
    btnAlternarModo.setAttribute('aria-label', 'Ver no mapa');
    cabecalhoLoja.append(btnAlternarModo);
  }

  gradeSecoes.hidden = true;
  listaProdutos.hidden = false;
  montarGondola(secaoAberta, listaProdutos);
}

function montarGondola(secaoId, recipiente) {
  recipiente.classList.add('gondola');
  recipiente.classList.toggle('gondola--geladeira', secaoId === 'laticinios' || secaoId === 'bebidas');
  recipiente.replaceChildren();

  const grade = document.createElement('div');
  grade.className = 'gondola__grade';
  recipiente.append(grade);

  if (secaoId === 'guloseimas') {
    const limite = NIVEIS[compra.missao.nivel].maximoDeDesejos;
    const limiteAtingido = compra.desejos.length >= limite;

    for (const desejo of desejos) {
      const jaNoCarrinho = compra.desejos.includes(desejo.id);
      const preco = precoNoNivel(desejo.preco, compra.missao.nivel);

      const vaga = document.createElement('button');
      vaga.type = 'button';
      vaga.className = `vaga${jaNoCarrinho ? ' vaga--feito' : limiteAtingido ? ' vaga--limite' : ''}`;
      vaga.dataset.guloseimaId = desejo.id;
      vaga.setAttribute(
        'aria-label',
        `${desejo.nome} (${desejo.marca}), ${formatarDinheiro(preco)}${jaNoCarrinho ? ', no carrinho' : limiteAtingido ? ', limite de guloseimas atingido' : ''}`,
      );

      if (jaNoCarrinho || limiteAtingido) {
        const chip = document.createElement('span');
        chip.className = 'vaga__chip';
        chip.textContent = jaNoCarrinho ? '✓ Pegou' : 'Limite';
        vaga.append(chip);
      }

      const fig = criarFigura(desejo.id, null, 78, { marca: false });

      const tabua = document.createElement('span');
      tabua.className = 'vaga__tabua';
      tabua.setAttribute('aria-hidden', 'true');

      const etq = document.createElement('span');
      etq.className = 'etq';
      const nome = document.createElement('span');
      nome.textContent = desejo.nome;
      const detalhe = document.createElement('small');
      detalhe.textContent = `${formatarDinheiro(preco)} · ${desejo.marca}`;
      etq.append(nome, detalhe);

      vaga.append(fig, tabua, etq);
      vaga.addEventListener('click', () => {
        tocar('clique');
        abrirPrateleiraGuloseima(desejo.id, vaga);
      });
      grade.append(vaga);
    }
    return;
  }

  const itensDaSecao = produtos.filter(p => p.secao === secaoId);
  for (const produto of itensDaSecao) {
    const entrada = compra.carrinho[produto.id];
    const itemMissao = compra.missao.itens.find(i => i.produtoId === produto.id);
    const naLista = Boolean(itemMissao);
    const completo = naLista ? (entrada?.quantidade || 0) >= itemMissao.quantidade : Boolean(entrada);

    const vaga = document.createElement('button');
    vaga.type = 'button';
    vaga.className = `vaga${naLista ? ' vaga--na-lista' : ''}${completo ? ' vaga--feito' : ''}`;
    vaga.dataset.produtoId = produto.id;
    vaga.setAttribute(
      'aria-label',
      `${produto.nome}, ${produto.medida}${itemMissao ? `, na lista: ${itemMissao.quantidade}` : ''}${entrada ? `, no carrinho: ${entrada.quantidade}` : ''}`,
    );

    if (completo || naLista) {
      const chip = document.createElement('span');
      chip.className = 'vaga__chip';
      chip.textContent = completo ? '✓ Pegou' : `Lista: ${itemMissao.quantidade}`;
      vaga.append(chip);
    }

    const fig = criarFigura(produto.id, null, 78, { marca: false });

    const tabua = document.createElement('span');
    tabua.className = 'vaga__tabua';
    tabua.setAttribute('aria-hidden', 'true');

    const etq = document.createElement('span');
    etq.className = 'etq';
    const nome = document.createElement('span');
    nome.textContent = produto.nome;
    const medida = document.createElement('small');
    medida.textContent = produto.medida;
    etq.append(nome, medida);

    vaga.append(fig, tabua, etq);
    vaga.addEventListener('click', () => {
      tocar('clique');
      abrirPrateleiraProduto(produto.id, vaga);
    });
    grade.append(vaga);
  }
}

/* ---------------- Painéis modais ---------------- */

function elementosFocaveis(container) {
  return [...container.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter(el => !el.hidden && el.offsetParent !== null);
}

/**
 * Abre um painel modal. O contexto da prateleira é definido (e o conteúdo renderizado)
 * só depois de fechar o painel anterior, que zera contextoPrateleira.
 */
function abrirPainel(elPainel, gatilho, contexto = null, renderizar = null) {
  pararMovimento(false);
  fecharPainel(false);
  contextoPrateleira = contexto;
  renderizar?.();
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

function configurarCabecalhoFolha(prefixo, secVisual, tituloTexto, subtituloTexto, iconeNome = secVisual.icone) {
  $(`${prefixo}-topo`).style.setProperty('--sec', secVisual.cor);
  $(`${prefixo}-icone`).replaceChildren(criarIconeUi(iconeNome, 22));
  $(`${prefixo}-titulo`).textContent = tituloTexto;
  $(`${prefixo}-subtitulo`).textContent = subtituloTexto;
}

function criarEtiquetaPreco(centavos) {
  const el = document.createElement('div');
  el.className = 'preco';
  const simbolo = document.createElement('small');
  simbolo.textContent = 'R$';
  const valor = document.createTextNode(formatarDinheiro(centavos).replace(/^R\$\s*/, ''));
  el.append(simbolo, valor);
  return el;
}

function abrirPainelGondola(secaoId, gatilho) {
  const secVisual = secaoVisualPorId[secaoId] || SECOES_VISUAIS.M;
  const nomeSecao = secaoPorId[secaoId]?.nome || secVisual.nome;
  configurarCabecalhoFolha('gondola', secVisual, nomeSecao, 'Todos os produtos da seção');
  montarGondola(secaoId, $('gondola-lista'));
  abrirPainel(PAINEIS.gondola, gatilho);
}

function configurarAtalhoGondola(secaoId, secVisual) {
  const btnVerGondola = $('btn-ver-gondola');
  if (usarListaRapida()) {
    btnVerGondola.hidden = true;
    btnVerGondola.onclick = null;
    return;
  }
  btnVerGondola.hidden = false;
  btnVerGondola.textContent = `‹ Ver toda a gôndola de ${secVisual.nome}`;
  btnVerGondola.onclick = () => {
    tocar('clique');
    const retorno = gatilhoDoPainel && !gatilhoDoPainel.closest('#painel-gondola')
      ? gatilhoDoPainel
      : ($('btn-interagir-mapa').hidden ? $('mapa-janela') : $('btn-interagir-mapa'));
    abrirPainelGondola(secaoId, retorno);
  };
}

function abrirPrateleiraProduto(produtoId, gatilho) {
  const noCarrinho = compra.carrinho[produtoId]?.quantidade;
  quantidadePrateleira = Math.max(1, Math.min(6, noCarrinho || 1));
  const gatilhoEstavel = gatilho?.closest?.('#painel-gondola') ? gatilhoDoPainel : gatilho;
  abrirPainel(PAINEIS.prateleira, gatilhoEstavel, { tipo: 'produto', id: produtoId }, renderizarPrateleiraProduto);
}

function renderizarPrateleiraProduto() {
  if (!contextoPrateleira || contextoPrateleira.tipo !== 'produto') return;
  const produto = produtoPorId[contextoPrateleira.id];
  const nivel = compra.missao.nivel;
  const itemMissao = compra.missao.itens.find(i => i.produtoId === produto.id);
  const entrada = compra.carrinho[produto.id];
  const secVisual = secaoVisualPorId[produto.secao] || SECOES_VISUAIS.M;

  const subtitulo = itemMissao
    ? (entrada
        ? `${secVisual.nome} · Na lista: ${itemMissao.quantidade} · No carrinho: ${entrada.quantidade}`
        : `${secVisual.nome} · Na lista: ${itemMissao.quantidade}`)
    : `${secVisual.nome} · Comparação de preços`;
  const iconeProduto = FIGURA_DO_PRODUTO[produto.id]?.[1] || secVisual.icone;
  configurarCabecalhoFolha('prateleira', secVisual, `${produto.nome} · ${produto.medida}`, subtitulo, iconeProduto);

  const aviso = $('prateleira-aviso');
  const qtdBloco = $('prateleira-qtd-bloco');
  if (itemMissao) {
    aviso.hidden = true;
    aviso.replaceChildren();
    qtdBloco.hidden = false;
    atualizarControlesQuantidade();
  } else {
    aviso.hidden = false;
    aviso.replaceChildren(criarIconeUi('olhos', 22), 'Hoje isto não está na lista.');
    qtdBloco.hidden = true;
  }

  const container = $('prateleira-opcoes');
  container.className = `opcoes${produto.secao === 'laticinios' || produto.secao === 'bebidas' ? ' opcoes--geladeira' : ''}`;
  container.replaceChildren();

  const opcoes = [...opcoesNoNivel(produto, nivel)].sort((a, b) => a.preco - b.preco);
  const sufixoCols = opcoes.length === 1 ? 'uma' : opcoes.length === 2 ? 'duas' : '';

  const gradeFigs = document.createElement('div');
  gradeFigs.className = `opcoes__figuras${sufixoCols ? ` opcoes__figuras--${sufixoCols}` : ''}`;
  gradeFigs.style.setProperty('--cols', String(opcoes.length));

  const tabua = document.createElement('div');
  tabua.className = 'opcoes__tabua';
  tabua.setAttribute('aria-hidden', 'true');

  const gradePes = document.createElement('div');
  gradePes.className = `opcoes__pes${sufixoCols ? ` opcoes__pes--${sufixoCols}` : ''}`;
  gradePes.style.setProperty('--cols', String(opcoes.length));

  const larguraFig = window.innerWidth >= 600 ? 120 : 100;
  const ehSolto = FIGURA_DO_PRODUTO[produto.id]?.[0] === 'solto';

  for (const opcao of opcoes) {
    const selecionada = entrada?.opcaoId === opcao.id;

    const slotFig = document.createElement('div');
    slotFig.className = 'opcao';
    const figEl = criarFigura(produto.id, opcao.id, larguraFig, { marca: !ehSolto });
    slotFig.append(figEl);
    gradeFigs.append(slotFig);

    const pe = document.createElement('div');
    const mesmaOpcaoEMesmaQtd = selecionada && entrada.quantidade === quantidadePrateleira;
    pe.className = `pe${mesmaOpcaoEMesmaQtd ? ' pe--escolhida' : ''}`;
    pe.dataset.opcaoId = opcao.id;

    pe.append(criarEtiquetaPreco(opcao.preco));

    if (itemMissao && nivel === 1) {
      const calc = document.createElement('span');
      calc.className = 'pe__calculo';
      calc.dataset.preco = String(opcao.preco);
      calc.textContent = formatarEtiquetaQuantidade(quantidadePrateleira, opcao.preco, nivel);
      pe.append(calc);
    }

    const marca = document.createElement('strong');
    marca.className = 'pe__marca';
    marca.textContent = opcao.rotulo;
    pe.append(marca, criarCoracoesElemento(opcao.coracoes));

    if (itemMissao) {
      const btn = document.createElement('button');
      btn.type = 'button';
      if (!entrada) {
        btn.className = 'botao botao--sucesso pe__botao';
        btn.textContent = 'Pegar';
        btn.setAttribute('aria-label', `Colocar ${produto.nome} ${opcao.rotulo} no carrinho`);
      } else if (!selecionada) {
        btn.className = 'botao botao--sucesso pe__botao';
        btn.textContent = 'Trocar';
        btn.setAttribute('aria-label', `Trocar para ${produto.nome} ${opcao.rotulo}`);
      } else if (entrada.quantidade === quantidadePrateleira) {
        btn.className = 'botao botao--neutro pe__botao';
        btn.textContent = '✓ Pegou';
        btn.disabled = true;
        btn.setAttribute('aria-label', `${produto.nome} ${opcao.rotulo} no carrinho (${quantidadePrateleira})`);
      } else {
        btn.className = 'botao botao--sucesso pe__botao';
        btn.textContent = 'Atualizar';
        btn.setAttribute('aria-label', `Atualizar quantidade de ${produto.nome} ${opcao.rotulo} para ${quantidadePrateleira}`);
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
        animarItemParaOCarrinho(figEl);
        if (usarListaRapida()) {
          gatilhoDoPainel = $('lista-produtos').querySelector(`[data-produto-id="${produto.id}"]`) || gatilhoDoPainel;
        }
        fecharPainel();
      });

      pe.append(btn);
    }

    gradePes.append(pe);
  }

  container.append(gradeFigs, tabua, gradePes);
  configurarAtalhoGondola(produto.secao, secVisual);
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

  $('prateleira-opcoes').querySelectorAll('.pe').forEach(pe => {
    const calc = pe.querySelector('.pe__calculo');
    if (calc) {
      calc.textContent = formatarEtiquetaQuantidade(
        quantidadePrateleira,
        Number(calc.dataset.preco),
        nivel,
      );
    }
    if (entrada && entrada.opcaoId === pe.dataset.opcaoId) {
      const btn = pe.querySelector('.pe__botao');
      if (btn) {
        const opcao = opcoesNoNivel(produto, nivel).find(o => o.id === entrada.opcaoId);
        const mesmaQtd = entrada.quantidade === quantidadePrateleira;
        pe.classList.toggle('pe--escolhida', mesmaQtd);
        btn.disabled = mesmaQtd;
        btn.className = `botao ${mesmaQtd ? 'botao--neutro' : 'botao--sucesso'} pe__botao`;
        btn.textContent = mesmaQtd ? '✓ Pegou' : 'Atualizar';
        btn.setAttribute(
          'aria-label',
          mesmaQtd
            ? `${produto.nome} ${opcao?.rotulo || ''} no carrinho (${quantidadePrateleira})`
            : `Atualizar quantidade de ${produto.nome} ${opcao?.rotulo || ''} para ${quantidadePrateleira}`,
        );
      }
    }
  });
}

function abrirPrateleiraGuloseima(desejoId, gatilho) {
  const gatilhoEstavel = gatilho?.closest?.('#painel-gondola') ? gatilhoDoPainel : gatilho;
  abrirPainel(PAINEIS.prateleira, gatilhoEstavel, { tipo: 'guloseima', id: desejoId }, renderizarPrateleiraGuloseima);
}

function renderizarPrateleiraGuloseima() {
  if (!contextoPrateleira || contextoPrateleira.tipo !== 'guloseima') return;
  const desejo = desejoPorId[contextoPrateleira.id];
  const nivel = compra.missao.nivel;
  const limite = NIVEIS[nivel].maximoDeDesejos;
  const jaLevada = compra.desejos.includes(desejo.id);
  const limiteAtingido = compra.desejos.length >= limite;
  const preco = precoNoNivel(desejo.preco, nivel);
  const secVisual = SECOES_VISUAIS.G;
  const iconeGuloseima = FIGURA_DO_PRODUTO[desejo.id]?.[1] || secVisual.icone;

  configurarCabecalhoFolha('prateleira', secVisual, desejo.nome, `${secVisual.nome} · ${desejo.marca}`, iconeGuloseima);
  $('prateleira-qtd-bloco').hidden = true;

  const aviso = $('prateleira-aviso');
  aviso.hidden = false;
  aviso.replaceChildren(
    criarIconeUi('alfinete', 22),
    `Hoje pode levar até ${limite} ${limite === 1 ? 'guloseima' : 'guloseimas'}.`,
  );

  const container = $('prateleira-opcoes');
  container.className = 'opcoes';
  container.replaceChildren();

  const gradeFigs = document.createElement('div');
  gradeFigs.className = 'opcoes__figuras opcoes__figuras--uma';

  const tabua = document.createElement('div');
  tabua.className = 'opcoes__tabua';
  tabua.setAttribute('aria-hidden', 'true');

  const gradePes = document.createElement('div');
  gradePes.className = 'opcoes__pes opcoes__pes--uma';

  const larguraFig = window.innerWidth >= 600 ? 120 : 100;
  const slotFig = document.createElement('div');
  slotFig.className = 'opcao';
  const figEl = criarFigura(desejo.id, null, larguraFig, { marca: true });
  slotFig.append(figEl);
  gradeFigs.append(slotFig);

  const pe = document.createElement('div');
  pe.className = `pe${jaLevada ? ' pe--escolhida' : ''}`;

  const marca = document.createElement('strong');
  marca.className = 'pe__marca';
  marca.textContent = desejo.marca;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `botao ${jaLevada ? 'botao--neutro' : 'botao--sucesso'} pe__botao`;

  if (jaLevada) {
    btn.textContent = 'Devolver';
    btn.setAttribute('aria-label', `Devolver ${desejo.nome} (${desejo.marca})`);
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
    btn.textContent = limiteAtingido ? 'Limite' : 'Levar';
    btn.setAttribute('aria-label', `Levar ${desejo.nome} (${desejo.marca})`);
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
      animarItemParaOCarrinho(figEl);
      if (usarListaRapida()) {
        gatilhoDoPainel = $('lista-produtos').querySelector(`[data-guloseima-id="${desejo.id}"]`) || gatilhoDoPainel;
      }
      fecharPainel();
    });
  }

  pe.append(criarEtiquetaPreco(preco), marca, criarCoracoesElemento(desejo.coracoes), btn);
  gradePes.append(pe);
  container.append(gradeFigs, tabua, gradePes);
  configurarAtalhoGondola('guloseimas', secVisual);
}

function abrirPainelLista(gatilho) {
  const { missao } = compra;
  $('lista-painel-meta').replaceChildren(
    criarIconeInline(ICONE_DO_TEMA[missao.temaId] || 'cesto'),
    document.createTextNode(`${missao.titulo} · Você tem ${formatarDinheiro(missao.orcamento)} · Meta: ${missao.metaCoracoes} `),
    criarIconeInline('coracao'),
  );

  const ul = $('lista-painel-itens');
  ul.replaceChildren();
  for (const item of missao.itens) {
    const produto = produtoPorId[item.produtoId];
    const secao = secaoPorId[produto.secao];
    const entrada = compra.carrinho[item.produtoId];
    const completo = (entrada?.quantidade || 0) >= item.quantidade;
    const li = document.createElement('li');
    li.className = 'lista-painel__item';

    const checkEl = completo ? criarIconeInline('confirmado') : criarCaixaCheckVazio();
    const iconeItem = FIGURA_DO_PRODUTO[produto.id]?.[1] || 'cesto';
    let texto = `${produto.nome} · ${secao.nome} — pedir ${item.quantidade} (${produto.medida})`;
    if (entrada) {
      const op = opcoesNoNivel(produto, missao.nivel).find(o => o.id === entrada.opcaoId);
      texto += ` · no carrinho: ${entrada.quantidade} (${op.rotulo})`;
    }
    li.append(checkEl, criarIconeInline(iconeItem), document.createTextNode(texto));
    ul.append(li);
  }

  const boxGuloseimas = $('lista-painel-guloseimas');
  const iconeGuloseima = criarIconeInline(SECOES_VISUAIS.G.icone);
  if (compra.desejos.length) {
    const nomes = compra.desejos.map(id => desejoPorId[id].nome);
    boxGuloseimas.replaceChildren(iconeGuloseima, document.createTextNode(`Guloseimas no carrinho: ${juntarComE(nomes)}.`));
  } else {
    const limite = NIVEIS[missao.nivel].maximoDeDesejos;
    boxGuloseimas.replaceChildren(iconeGuloseima, document.createTextNode(`Guloseimas: nenhuma (pode levar até ${limite}).`));
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

    const topo = document.createElement('div');
    topo.className = 'carrinho-linha__topo';
    const fig = criarFigura(produtoId, entrada.opcaoId, 44, { marca: true });
    const info = document.createElement('div');
    info.className = 'carrinho-linha__info';
    info.textContent = `${produto.nome} (${opcao.rotulo}) — ${formatarEtiquetaQuantidade(entrada.quantidade, opcao.preco, nivel)}`;
    topo.append(fig, info);

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
    btnRemover.replaceChildren(criarIconeUi('lixeira', 20));
    btnRemover.addEventListener('click', () => {
      compra = mudarQuantidade(compra, produtoId, 0).compra;
      tocar('clique');
      renderizarLoja();
      renderizarPainelCarrinho();
    });

    controles.append(btnMenos, btnMais, btnRemover);
    linha.append(topo, controles);
    container.append(linha);
  }

  for (const desejoId of compra.desejos) {
    const desejo = desejoPorId[desejoId];
    const preco = precoNoNivel(desejo.preco, nivel);
    const linha = document.createElement('div');
    linha.className = 'carrinho-linha';

    const topo = document.createElement('div');
    topo.className = 'carrinho-linha__topo';
    const fig = criarFigura(desejoId, null, 44, { marca: true });
    const info = document.createElement('div');
    info.className = 'carrinho-linha__info';
    info.textContent = `${desejo.nome} (${desejo.marca}) — ${formatarDinheiro(preco)}`;
    topo.append(fig, info);

    const controles = document.createElement('div');
    controles.className = 'carrinho-linha__controles';

    const btnRemover = document.createElement('button');
    btnRemover.type = 'button';
    btnRemover.className = 'botao botao--neutro';
    btnRemover.setAttribute('aria-label', `Devolver ${desejo.nome}`);
    btnRemover.replaceChildren(criarIconeInline('lixeira'), document.createTextNode('Devolver'));
    btnRemover.addEventListener('click', () => {
      compra = devolverDesejo(compra, desejoId).compra;
      tocar('clique');
      renderizarLoja();
      renderizarPainelCarrinho();
    });

    controles.append(btnRemover);
    linha.append(topo, controles);
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
      icone: FIGURA_DO_PRODUTO[produto.id]?.[1] || 'cesto',
      esquerda: `${produto.nome} (${opcao.rotulo})`,
      direita: formatarEtiquetaQuantidade(entrada.quantidade, opcao.preco, nivel),
    });
  }

  for (const desejoId of compra.desejos) {
    const desejo = desejoPorId[desejoId];
    const preco = precoNoNivel(desejo.preco, nivel);
    valores.push(preco);
    linhas.push({
      icone: FIGURA_DO_PRODUTO[desejo.id]?.[1] || 'pirulito',
      esquerda: `${desejo.nome} (${desejo.marca})`,
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
  if (linha.icone) {
    esq.append(criarIconeInline(linha.icone));
  }
  esq.append(document.createTextNode(linha.esquerda));
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
    ? somaArmada(estadoCaixa.valoresCupom).join('\n')
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
    salvarEstadoCofrinho(depositar(estadoCofrinho, res.troco));
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
  estrelasEl.replaceChildren();
  for (let i = 0; i < 3; i++) {
    const estrela = criarIconeUi('estrela', 36);
    if (i >= res.estrelas) {
      estrela.classList.add('estrela-apagada');
    }
    estrelasEl.append(estrela);
  }
  estrelasEl.setAttribute('aria-label', `${res.estrelas} de 3 estrelas`);

  const objetivos = $('resultado-objetivos');
  objetivos.replaceChildren();
  const itensObjetivo = [
    { ok: res.objetivos.missaoCumprida, texto: 'Missão cumprida · Compra paga dentro do orçamento' },
    { ok: res.objetivos.familiaFeliz, texto: `Família feliz · ${res.coracoes} de ${compra.missao.metaCoracoes} corações` },
    { ok: res.objetivos.contasCertas, texto: 'Contas certas · Sem estouros e acertou de primeira' },
  ];
  for (const item of itensObjetivo) {
    const li = document.createElement('li');
    li.className = 'resultado-objetivos__item';
    li.append(
      item.ok ? criarIconeInline('confirmado') : criarCaixaCheckVazio(),
      document.createTextNode(item.texto),
    );
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
  pTroco.className = 'resultado-cofrinho';
  pTroco.id = 'resultado-cofrinho';
  const porco = document.createElement('span');
  porco.className = 'resultado-cofrinho__porco';
  porco.append(criarIconeInline('porquinho'));
  if (res.troco > 0 && !querMenosMovimento()) {
    const moeda = criarIconeUi('moeda', 22);
    moeda.classList.add('moedinha-cai');
    moeda.addEventListener('animationend', () => {
      moeda.remove();
      animar(porco, 'pular');
    }, { once: true });
    porco.append(moeda);
  }
  pTroco.append(
    porco,
    document.createTextNode(res.troco > 0
      ? `Sobrou ${formatarDinheiro(res.troco)}. Foi para o cofrinho! ${textoDoCofrinhoNoResultado()}`
      : `Não sobrou troco desta vez. ${textoDoCofrinhoNoResultado()}`),
  );
  resumo.append(pTroco);

  anunciar(`${frase} ${res.estrelas} de 3 estrelas.`);
}

/* ---------------- Cofrinho e sonhos ---------------- */

const sonhoPorId = Object.fromEntries(sonhos.map(s => [s.id, s]));

function criarBarraDoSonho(sonho) {
  const guardado = Math.min(estadoCofrinho.cofrinho, sonho.preco);
  const pct = Math.round((guardado / sonho.preco) * 100);
  const barra = document.createElement('div');
  barra.className = 'cofrinho__barra';
  barra.setAttribute('role', 'progressbar');
  barra.setAttribute('aria-valuemin', '0');
  barra.setAttribute('aria-valuemax', '100');
  barra.setAttribute('aria-valuenow', String(pct));
  barra.setAttribute('aria-label', `Juntou ${formatarDinheiro(estadoCofrinho.cofrinho)} de ${formatarDinheiro(sonho.preco)}`);
  const preenchimento = document.createElement('div');
  preenchimento.className = 'cofrinho__barra-preenchimento';
  preenchimento.style.width = `${pct}%`;
  barra.append(preenchimento);
  return barra;
}

function renderizarCofrinho() {
  $('cofrinho-valor').textContent = formatarDinheiro(estadoCofrinho.cofrinho);
  const conteudo = $('cofrinho-conteudo');
  conteudo.replaceChildren();
  const sonho = sonhoPorId[estadoCofrinho.sonhoAtual];

  if (!sonho || escolhendoSonho) {
    const pergunta = document.createElement('p');
    pergunta.className = 'cofrinho__texto';
    pergunta.textContent = sonho
      ? 'Trocar de sonho? O dinheiro do cofrinho continua guardado.'
      : 'Escolha um sonho para juntar com o troco das compras:';
    const grade = document.createElement('div');
    grade.className = 'cofrinho__sonhos';
    grade.setAttribute('role', 'group');
    grade.setAttribute('aria-label', 'Sonhos para juntar');
    for (const opcao of sonhosDisponiveis(estadoCofrinho)) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'botao botao--neutro cofrinho__sonho';
      btn.dataset.sonho = opcao.id;
      btn.setAttribute('aria-pressed', String(opcao.id === estadoCofrinho.sonhoAtual));
      const nome = document.createElement('span');
      nome.className = 'cofrinho__sonho-nome';
      nome.textContent = opcao.nome;
      const preco = document.createElement('span');
      preco.className = 'cofrinho__sonho-preco';
      preco.textContent = formatarDinheiro(opcao.preco);
      btn.append(criarIconeUi(ICONE_DO_SONHO[opcao.id], 40), nome, preco);
      btn.addEventListener('click', () => {
        tocar('clique');
        escolhendoSonho = false;
        salvarEstadoCofrinho(escolherSonho(estadoCofrinho, opcao.id));
        renderizarCofrinho();
        anunciar(`Sonho escolhido: ${opcao.nome}.`);
        $('cofrinho-titulo').focus();
      });
      grade.append(btn);
    }
    conteudo.append(pergunta, grade);
    if (sonho) {
      const cancelar = document.createElement('button');
      cancelar.type = 'button';
      cancelar.className = 'botao botao--neutro cofrinho__acao';
      cancelar.textContent = `Continuar com ${sonho.nome}`;
      cancelar.addEventListener('click', () => {
        tocar('clique');
        escolhendoSonho = false;
        renderizarCofrinho();
        $('cofrinho-titulo').focus();
      });
      conteudo.append(cancelar);
    }
  } else {
    const linha = document.createElement('div');
    linha.className = 'cofrinho__sonho-atual';
    const textos = document.createElement('div');
    textos.className = 'cofrinho__sonho-textos';
    const nome = document.createElement('strong');
    nome.textContent = sonho.nome;
    const quanto = document.createElement('span');
    quanto.className = 'cofrinho__quanto';
    quanto.textContent = `${formatarDinheiro(Math.min(estadoCofrinho.cofrinho, sonho.preco))} de ${formatarDinheiro(sonho.preco)}`;
    textos.append(nome, criarBarraDoSonho(sonho), quanto);
    linha.append(criarIconeUi(ICONE_DO_SONHO[sonho.id], 56), textos);
    conteudo.append(linha);

    const acao = document.createElement('button');
    acao.type = 'button';
    if (podeRealizar(estadoCofrinho)) {
      const aviso = document.createElement('p');
      aviso.className = 'cofrinho__texto cofrinho__texto--pronto';
      aviso.textContent = 'Você juntou o suficiente!';
      conteudo.append(aviso);
      acao.id = 'btn-realizar-sonho';
      acao.className = 'botao botao--sucesso cofrinho__acao';
      acao.textContent = 'Realizar o sonho';
      acao.addEventListener('click', () => {
        const realizado = sonho;
        salvarEstadoCofrinho(realizarSonho(estadoCofrinho));
        tocar('vitoria');
        lancarConfete();
        renderizarCofrinho();
        anunciar(`Sonho realizado: ${realizado.nome} foi para a estante! Escolha o próximo sonho.`);
        $('cofrinho-titulo').focus();
      });
    } else {
      acao.className = 'botao botao--neutro cofrinho__acao';
      acao.textContent = 'Trocar sonho';
      acao.addEventListener('click', () => {
        tocar('clique');
        escolhendoSonho = true;
        renderizarCofrinho();
        $('cofrinho-conteudo').querySelector('button')?.focus();
      });
    }
    conteudo.append(acao);
  }

  const estante = $('cofrinho-estante');
  const lista = $('cofrinho-estante-lista');
  lista.replaceChildren();
  estante.hidden = estadoCofrinho.sonhosRealizados.length === 0;
  for (const id of estadoCofrinho.sonhosRealizados) {
    const li = document.createElement('li');
    li.className = 'cofrinho__estante-item';
    const icone = criarIconeUi(ICONE_DO_SONHO[id], 44);
    icone.alt = sonhoPorId[id].nome;
    icone.title = sonhoPorId[id].nome;
    li.append(icone);
    lista.append(li);
  }
}

function textoDoCofrinhoNoResultado() {
  const sonho = sonhoPorId[estadoCofrinho.sonhoAtual];
  const guardado = `No cofrinho: ${formatarDinheiro(estadoCofrinho.cofrinho)}.`;
  if (!sonho) return `${guardado} Escolha um sonho na tela inicial.`;
  if (podeRealizar(estadoCofrinho)) return `${guardado} Já dá para realizar o sonho! Veja na tela inicial.`;
  return `${guardado} Faltam ${formatarDinheiro(sonho.preco - estadoCofrinho.cofrinho)} para: ${sonho.nome}.`;
}

/* ---------------- Eventos ---------------- */

selecionarNivel(nivelSelecionado);
atualizarBotoesModoInicio();
hidratarIconesEstaticos();
renderizarCofrinho();

document.querySelectorAll('.nivel[data-nivel]').forEach(botao => {
  botao.addEventListener('click', () => {
    tocar('clique');
    selecionarNivel(botao.dataset.nivel);
  });
});

$('btn-modo-andar').addEventListener('click', () => {
  if (!renderizador) return;
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
  if (tutorialVisto) {
    iniciarNovaMissao();
  } else {
    abrirTutorial('missao');
  }
});

$('btn-como-jogar').addEventListener('click', () => {
  tocar('clique');
  abrirTutorial('inicio');
});

$('btn-tutorial-proximo').addEventListener('click', () => {
  tocar('clique');
  avancarTutorial(1);
});

$('btn-tutorial-voltar').addEventListener('click', () => {
  tocar('clique');
  avancarTutorial(-1);
});

$('btn-tutorial-pular').addEventListener('click', () => {
  tocar('clique');
  concluirTutorial();
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
  if (!renderizador) return;
  tocar('clique');
  pararMovimento(false);
  modoListaPreferido = !modoListaPreferido;
  salvarPreferenciaModoLista(modoListaPreferido);
  atualizarBotoesModoInicio();
  renderizarLoja();
  if (!usarListaRapida()) {
    renderizador.ajustarTamanho();
    desenharMapa();
    $('mapa-janela').focus();
    anunciar('Modo mapa ativado.');
  } else {
    anunciar('Lista rápida ativada.');
  }
});

$('btn-interagir-mapa').addEventListener('click', () => {
  acionarInteracaoAdjacente($('btn-interagir-mapa'));
});

$('mapa-janela').addEventListener('click', evento => {
  if (!renderizador || faseAtual !== 'loja' || painelAtivo || usarListaRapida()) return;
  const casa = renderizador.eventoParaCasa(evento);
  if (!casa) return;
  interagirComCasa(casa.x, casa.y);
});

function tratarMudancaLayoutLargo(evento) {
  const largoAgora = typeof evento?.matches === 'boolean'
    ? evento.matches
    : Boolean(consultaLayoutLargo?.matches);
  if (largoAgora === ultimoLayoutLargo) return;
  ultimoLayoutLargo = largoAgora;
  if (faseAtual === 'loja' && compra && !usarListaRapida() && renderizador) {
    renderizarLoja();
    renderizador.ajustarTamanho();
    desenharMapa();
  }
}

consultaLayoutLargo?.addEventListener?.('change', tratarMudancaLayoutLargo);

window.addEventListener('resize', () => {
  if (faseAtual === 'loja' && !usarListaRapida() && renderizador) {
    const largoAgora = Boolean(consultaLayoutLargo?.matches);
    if (largoAgora !== ultimoLayoutLargo) {
      ultimoLayoutLargo = largoAgora;
      renderizarLoja();
    }
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
$('btn-fechar-gondola').addEventListener('click', () => {
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
      acionarInteracaoAdjacente($('mapa-janela'));
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
