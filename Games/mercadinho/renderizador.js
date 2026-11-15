import {
  FIGURA_DO_PRODUTO,
  SECOES_VISUAIS,
  criarFigura,
  criarIconeUi,
  misturar,
} from './figuras.js';
import { ALTURA, LARGURA, MAPA, celulaEm, entrada } from './mapa.js';

export const CONSULTA_LAYOUT_LARGO = '(min-width: 1024px) and (min-aspect-ratio: 5/4)';

// MediaQueryList guardadas uma vez: ler .matches é barato, criar a consulta a cada quadro não.
const consultaLargo = typeof window !== 'undefined' ? window.matchMedia?.(CONSULTA_LAYOUT_LARGO) ?? null : null;
const consultaMenosMovimento = typeof window !== 'undefined'
  ? window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null
  : null;

function emLayoutLargo() {
  return Boolean(consultaLargo?.matches);
}

function arredondarPixelAparelho(valor) {
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  return Math.round(valor * dpr) / dpr;
}

function tipoParede(x, y, portaX) {
  if (y === 0) return 'topo';
  if (y === ALTURA - 1) {
    return Math.abs(x - portaX) <= 1 ? 'porta' : 'fundo';
  }
  return 'lado';
}

function agruparBlocosSecoes() {
  const visitados = Array.from({ length: ALTURA }, () => Array(LARGURA).fill(false));
  const blocos = [];

  for (let y = 0; y < ALTURA; y++) {
    for (let x = 0; x < LARGURA; x++) {
      const letra = MAPA[y][x];
      if (!SECOES_VISUAIS[letra] || visitados[y][x]) continue;

      const fila = [[x, y]];
      const casas = [];
      visitados[y][x] = true;

      while (fila.length) {
        const [cx, cy] = fila.shift();
        casas.push([cx, cy]);
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (
            ny >= 0
            && ny < ALTURA
            && nx >= 0
            && nx < LARGURA
            && !visitados[ny][nx]
            && MAPA[ny][nx] === letra
          ) {
            visitados[ny][nx] = true;
            fila.push([nx, ny]);
          }
        }
      }

      blocos.push({ letra, casas });
    }
  }

  return blocos;
}

export function criarRenderizador(janela) {
  if (!janela) return null;

  let casa = 52;
  let camX = 0;
  let camY = 0;
  let quadrosDesenhados = 0;

  let elMapa = null;
  let elDestino = null;
  let elPeao = null;
  let elConta = null;

  const nichosPorChave = new Map();
  const caixasPorChave = new Map();

  let ultimoMapaTransform = '';
  let ultimoPeaoTransform = '';
  let ultimaLadoEsquerdo = false;
  let ultimoItensCarrinho = -1;
  let ultimoDestinoChave = '';
  let ultimoDestaqueChave = '';
  let baloesAtivos = new Set();

  // Tamanho da casa e da janela só mudam com resize/layout: medir no desenho de cada quadro
  // forçava layout síncrono durante a caminhada. Os observadores marcam quando remedir.
  let tamanhoSujo = true;
  let larguraJanela = 0;
  let alturaJanela = 0;
  const marcarSujo = () => { tamanhoSujo = true; };
  if (typeof ResizeObserver === 'function') {
    const observador = new ResizeObserver(marcarSujo);
    observador.observe(janela);
    if (janela.parentElement) observador.observe(janela.parentElement);
  }
  consultaLargo?.addEventListener?.('change', marcarSujo);
  if (typeof window !== 'undefined') window.addEventListener('resize', marcarSujo);

  const ultimosDados = {};
  function gravarDado(chave, valor) {
    const texto = String(valor);
    if (ultimosDados[chave] === texto) return;
    ultimosDados[chave] = texto;
    janela.dataset[chave] = texto;
  }

  function medidasEspacoPai() {
    const pai = janela.parentElement;
    if (!pai) return null;
    const csPai = getComputedStyle(pai);
    const padX = (parseFloat(csPai.paddingLeft) || 0) + (parseFloat(csPai.paddingRight) || 0);
    const padY = (parseFloat(csPai.paddingTop) || 0) + (parseFloat(csPai.paddingBottom) || 0);
    const csJanela = getComputedStyle(janela);
    const bordaX = (parseFloat(csJanela.borderLeftWidth) || 0) + (parseFloat(csJanela.borderRightWidth) || 0);
    const bordaY = (parseFloat(csJanela.borderTopWidth) || 0) + (parseFloat(csJanela.borderBottomWidth) || 0);
    const dispW = pai.clientWidth - padX;
    const dispH = pai.clientHeight - padY;
    return {
      dispW,
      dispH,
      bordaX,
      bordaY,
      L: Math.max(0, dispW - bordaX),
      A: Math.max(0, dispH - bordaY),
    };
  }

  function calcularCasa() {
    if (emLayoutLargo()) {
      const esp = medidasEspacoPai();
      if (!esp || esp.L <= 0 || esp.A <= 0) return casa;
      const calculada = Math.floor(Math.min(esp.L / LARGURA, esp.A / ALTURA));
      return Math.max(40, Math.min(64, calculada));
    }
    const largura = janela.clientWidth || 0;
    if (!largura) return casa;
    if (largura >= 1152) {
      return Math.min(64, Math.floor(largura / LARGURA));
    }
    return Math.max(48, Math.min(64, Math.floor(largura / 7)));
  }

  function aplicarTamanhoJanela() {
    if (!emLayoutLargo()) {
      if (janela.style.width) janela.style.width = '';
      if (janela.style.height) janela.style.height = '';
      return;
    }
    const esp = medidasEspacoPai();
    if (!esp || esp.dispW <= 0 || esp.dispH <= 0) return;
    janela.style.width = `${Math.min(esp.dispW, LARGURA * casa + esp.bordaX)}px`;
    janela.style.height = `${Math.min(esp.dispH, ALTURA * casa + esp.bordaY)}px`;
  }

  function montarMapa(novaCasa) {
    casa = novaCasa;
    nichosPorChave.clear();
    caixasPorChave.clear();
    baloesAtivos = new Set();
    ultimoMapaTransform = '';
    ultimoPeaoTransform = '';
    ultimaLadoEsquerdo = false;
    ultimoItensCarrinho = -1;
    ultimoDestinoChave = '';
    ultimoDestaqueChave = '';

    const ent = entrada();
    let iCaixa = 0;
    const em = (x, y) => (x < 0 || y < 0 || x >= LARGURA || y >= ALTURA ? '#' : MAPA[y][x]);

    const mapa = document.createElement('div');
    mapa.className = 'mapa';
    mapa.setAttribute('aria-hidden', 'true');
    mapa.style.setProperty('--casa', `${casa}px`);

    // 1. Tapete na entrada
    const tapete = document.createElement('div');
    tapete.className = 'tapete';
    tapete.style.left = `${ent.x * casa + 5}px`;
    tapete.style.top = `${ent.y * casa + 12}px`;
    tapete.style.width = `${Math.max(12, casa - 10)}px`;
    tapete.style.height = `${Math.max(12, casa - 20)}px`;
    mapa.append(tapete);

    const pinos = [];

    // 2. Paredes, nichos e caixas
    for (let y = 0; y < ALTURA; y++) {
      for (let x = 0; x < LARGURA; x++) {
        const s = MAPA[y][x];
        if (s === '.') continue;

        if (s === '#') {
          const parede = document.createElement('div');
          parede.className = `casa parede parede--${tipoParede(x, y, ent.x)}`;
          parede.style.left = `${x * casa}px`;
          parede.style.top = `${y * casa}px`;
          mapa.append(parede);
          continue;
        }

        if (SECOES_VISUAIS[s]) {
          const sec = SECOES_VISUAIS[s];
          const cel = celulaEm(x, y);
          if (!cel || (cel.tipo !== 'produto' && cel.tipo !== 'desejo')) continue;

          const nicho = document.createElement('div');
          const classes = ['casa', 'nicho', `nicho--${sec.movel}`];
          if (em(x, y - 1) !== s) classes.push('b-cima');
          if (em(x, y + 1) !== s) classes.push('b-baixo');
          if (em(x - 1, y) !== s) classes.push('b-esq');
          if (em(x + 1, y) !== s) classes.push('b-dir');

          nicho.className = classes.join(' ');
          nicho.style.left = `${x * casa}px`;
          nicho.style.top = `${y * casa}px`;
          nicho.style.setProperty('--sec', sec.cor);
          nicho.style.setProperty('--sec-escura', misturar(sec.cor, '#000000', 0.18));
          nicho.style.setProperty('--sec-fundo', misturar(sec.cor, '#ffffff', 0.86));

          const solto = FIGURA_DO_PRODUTO[cel.id]?.[0] === 'solto';
          const larg = Math.round(casa * (solto ? 0.72 : 0.68));
          nicho.append(criarFigura(cel.id, null, larg, { marca: false }));
          mapa.append(nicho);

          // Pino fora da caixa de z-index do nicho para ficar sempre acima das placas
          const pino = document.createElement('span');
          pino.className = 'pino';
          pino.textContent = '!';
          pino.style.left = `${x * casa + casa / 2}px`;
          pino.style.top = `${y * casa - 12}px`;
          pino.hidden = true;
          pinos.push(pino);

          nichosPorChave.set(`${x},${y}`, { el: nicho, pino });
          continue;
        }

        if (s === 'K') {
          iCaixa += 1;
          const caixa = document.createElement('div');
          caixa.className = 'casa caixa-reg';
          caixa.style.left = `${x * casa}px`;
          caixa.style.top = `${y * casa}px`;

          const etiqueta = document.createElement('i');
          etiqueta.textContent = `Caixa ${iCaixa}`;

          caixa.append(criarIconeUi('cupom', Math.max(22, Math.round(casa * 0.58))), etiqueta);
          mapa.append(caixa);
          caixasPorChave.set(`${x},${y}`, caixa);
        }
      }
    }

    // 3. Marcador de destino
    const destino = document.createElement('div');
    destino.className = 'destino';
    destino.hidden = true;
    mapa.append(destino);

    // 4. Placas de seção
    for (const { letra, casas } of agruparBlocosSecoes()) {
      const sec = SECOES_VISUAIS[letra];
      const minY = Math.min(...casas.map(c => c[1]));
      const topo = casas.filter(c => c[1] === minY).map(c => c[0]);
      const cx = (Math.min(...topo) + Math.max(...topo) + 1) / 2;
      const xPx = letra === 'H' ? cx * casa + casa * 0.55 : cx * casa;
      const yPx = minY === 1 ? casa * 0.78 : minY * casa;

      const placa = document.createElement('div');
      placa.className = 'placa';
      placa.style.left = `${xPx}px`;
      placa.style.top = `${yPx}px`;
      placa.style.setProperty('--sec', sec.cor);
      placa.append(criarIconeUi(sec.icone, 20), document.createTextNode(sec.nome));
      mapa.append(placa);
    }

    // 5. Pinos (!) acima das placas
    for (const pino of pinos) {
      mapa.append(pino);
    }

    // 6. Peão
    const peao = document.createElement('div');
    peao.className = 'peao';

    const rosto = document.createElement('span');
    rosto.className = 'peao__rosto';
    rosto.append(criarIconeUi('menina', 32));

    const carrinho = document.createElement('span');
    carrinho.className = 'peao__carrinho';
    carrinho.append(criarIconeUi('carrinho', 18));

    const conta = document.createElement('span');
    conta.className = 'peao__conta';
    conta.hidden = true;

    peao.append(rosto, carrinho, conta);
    mapa.append(peao);

    elMapa = mapa;
    elDestino = destino;
    elPeao = peao;
    elConta = conta;

    janela.replaceChildren(mapa);
  }

  /**
   * Mede e (re)monta o mapa. Enquanto a janela está escondida não monta nada: medir ali dá
   * tamanho errado e o mapa teria de ser refeito ao aparecer.
   */
  function ajustarTamanho() {
    if (!emLayoutLargo()) {
      if (janela.style.width) janela.style.width = '';
      if (janela.style.height) janela.style.height = '';
    }
    if (janela.getClientRects().length === 0) {
      tamanhoSujo = true;
      return;
    }
    const novaCasa = calcularCasa();
    if (!elMapa || novaCasa !== casa) {
      montarMapa(novaCasa);
    }
    aplicarTamanhoJanela();
    larguraJanela = janela.clientWidth;
    alturaJanela = janela.clientHeight;
    tamanhoSujo = false;
    gravarDado('casaPx', casa);
  }

  function desenhar(estado) {
    if (!estado) return;
    if (!elMapa || tamanhoSujo) {
      ajustarTamanho();
    }
    if (!elMapa) return;

    quadrosDesenhados += 1;

    const largJanela = larguraJanela || casa * 7;
    const altJanela = alturaJanela || casa * 9;
    const larguraMapa = LARGURA * casa;
    const alturaMapa = ALTURA * casa;

    let brutoCamX = larguraMapa <= largJanela
      ? -(largJanela - larguraMapa) / 2
      : (estado.posX + 0.5) * casa - largJanela / 2;
    let brutoCamY = alturaMapa <= altJanela
      ? -(altJanela - alturaMapa) / 2
      : (estado.posY + 0.5) * casa - altJanela / 2;

    if (larguraMapa > largJanela) {
      brutoCamX = Math.max(0, Math.min(larguraMapa - largJanela, brutoCamX));
    }
    if (alturaMapa > altJanela) {
      brutoCamY = Math.max(0, Math.min(alturaMapa - altJanela, brutoCamY));
    }

    camX = arredondarPixelAparelho(brutoCamX);
    camY = arredondarPixelAparelho(brutoCamY);

    const mapaTransform = `translate3d(${-camX}px, ${-camY}px, 0)`;
    if (mapaTransform !== ultimoMapaTransform) {
      elMapa.style.transform = mapaTransform;
      ultimoMapaTransform = mapaTransform;
    }

    const reduzido = Boolean(consultaMenosMovimento?.matches);
    const pulo = reduzido ? 0 : Math.abs(Math.sin(estado.fasePasso || 0)) * 4;
    const peaoX = arredondarPixelAparelho(estado.posX * casa);
    const peaoY = arredondarPixelAparelho(estado.posY * casa - 6 - pulo);
    const peaoTransform = `translate3d(${peaoX}px, ${peaoY}px, 0)`;
    if (peaoTransform !== ultimoPeaoTransform) {
      elPeao.style.transform = peaoTransform;
      ultimoPeaoTransform = peaoTransform;
    }

    if (estado.direcao === 'esquerda' || estado.direcao === 'direita') {
      const ladoEsquerdo = estado.direcao === 'esquerda';
      if (ladoEsquerdo !== ultimaLadoEsquerdo) {
        elPeao.classList.toggle('peao--esquerda', ladoEsquerdo);
        ultimaLadoEsquerdo = ladoEsquerdo;
      }
    }

    const itens = Number(estado.itensNoCarrinho) || 0;
    if (itens !== ultimoItensCarrinho) {
      elConta.hidden = itens <= 0;
      elConta.textContent = itens > 0 ? String(itens) : '';
      ultimoItensCarrinho = itens;
    }

    const dest = estado.destinoCaminhada;
    const destinoChave = dest ? `${dest.x},${dest.y}` : '';
    if (destinoChave !== ultimoDestinoChave) {
      if (dest) {
        elDestino.hidden = false;
        elDestino.style.transform = `translate3d(${dest.x * casa}px, ${dest.y * casa}px, 0)`;
      } else {
        elDestino.hidden = true;
      }
      ultimoDestinoChave = destinoChave;
    }

    const dist = estado.destaqueCasa;
    const destaqueChave = dist ? `${dist.x},${dist.y}` : '';
    if (destaqueChave !== ultimoDestaqueChave) {
      if (ultimoDestaqueChave) {
        nichosPorChave.get(ultimoDestaqueChave)?.el.classList.remove('nicho--destaque');
        caixasPorChave.get(ultimoDestaqueChave)?.classList.remove('caixa-reg--destaque');
      }
      if (destaqueChave) {
        nichosPorChave.get(destaqueChave)?.el.classList.add('nicho--destaque');
        caixasPorChave.get(destaqueChave)?.classList.add('caixa-reg--destaque');
      }
      ultimoDestaqueChave = destaqueChave;
    }

    const novosBaloes = new Set((estado.baloesNivel1 || []).map(c => `${c.x},${c.y}`));
    for (const chave of baloesAtivos) {
      if (!novosBaloes.has(chave)) {
        const reg = nichosPorChave.get(chave);
        if (reg) {
          reg.el.classList.remove('nicho--na-lista');
          reg.pino.hidden = true;
        }
      }
    }
    for (const chave of novosBaloes) {
      if (!baloesAtivos.has(chave)) {
        const reg = nichosPorChave.get(chave);
        if (reg) {
          reg.el.classList.add('nicho--na-lista');
          reg.pino.hidden = false;
        }
      }
    }
    baloesAtivos = novosBaloes;

    // Lidos pelo script de captura (docs/planos/mercadinho-arte/capturar.mjs).
    gravarDado('casaPx', casa);
    gravarDado('camX', camX);
    gravarDado('camY', camY);
    gravarDado('direcao', estado.direcao);
  }

  function eventoParaCasa(evento) {
    const rect = janela.getBoundingClientRect();
    if (!rect.width || !rect.height || !casa) return null;
    const xCss = evento.clientX - rect.left - janela.clientLeft + camX;
    const yCss = evento.clientY - rect.top - janela.clientTop + camY;
    const x = Math.floor(xCss / casa);
    const y = Math.floor(yCss / casa);
    if (x < 0 || y < 0 || x >= LARGURA || y >= ALTURA) return null;
    return { x, y };
  }

  function obterMetricas() {
    return {
      escala: 1,
      casaPx: casa,
      larguraCss: janela.clientWidth,
      alturaCss: janela.clientHeight,
      camX,
      camY,
      larguraMapaPx: LARGURA * casa,
      alturaMapaPx: ALTURA * casa,
      quadrosDesenhados,
    };
  }

  // Não monta aqui: a loja começa escondida. O primeiro ajustarTamanho com a janela
  // visível (ao entrar na loja no modo mapa) monta o mapa uma vez, já no tamanho certo.

  return {
    ajustarTamanho,
    desenhar,
    eventoParaCasa,
    obterMetricas,
  };
}
