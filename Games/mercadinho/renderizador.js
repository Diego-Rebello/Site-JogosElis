import { ALTURA, LARGURA, celulaEm, entrada } from './mapa.js';
import {
  TAMANHO_CASA,
  desenharCasa,
  desenharPersonagem,
  desenharProduto,
} from './arte.js';

/**
 * Teto da resolução da camada estática (pixels de tela por pixel lógico).
 * A camada é dimensionada por ceil(escala × devicePixelRatio) e nunca passa disto,
 * para não estourar memória em telas densas (8× = 3072×2048, ~25 MB).
 */
const ESCALA_MAPA_MAXIMA = 8;
const FONTE_PADRAO = 'Fredoka One, Trebuchet MS, system-ui, sans-serif';

const PLACAS_SECAO = Object.freeze([
  { id: 'laticinios', rotulo: 'Laticínios', cor: '#256fa8', x: 5.0, y: 0.45 },
  { id: 'acougue', rotulo: 'Açougue', cor: '#d9383a', x: 12.5, y: 0.45 },
  { id: 'bebidas', rotulo: 'Bebidas', cor: '#0e7c90', x: 19.0, y: 0.45 },
  { id: 'padaria', rotulo: 'Padaria', cor: '#c67d3b', x: 5.5, y: 3.4 },
  { id: 'mercearia', rotulo: 'Mercearia', cor: '#e07a24', x: 12.0, y: 3.4 },
  { id: 'limpeza', rotulo: 'Limpeza', cor: '#7856c2', x: 18.0, y: 3.4 },
  { id: 'hortifruti', rotulo: 'Hortifrúti', cor: '#2e9556', x: 2.35, y: 8.2 },
  { id: 'guloseimas', rotulo: 'Guloseimas', cor: '#e44b86', x: 14.0, y: 10.4 },
  { id: 'caixas', rotulo: 'Caixas', cor: '#455a64', x: 12.0, y: 12.35 },
]);

function mesmoMovel(celulaA, x, y) {
  if (x < 0 || y < 0 || x >= LARGURA || y >= ALTURA) return false;
  const celulaB = celulaEm(x, y);
  if (celulaA.tipo === 'produto') {
    return celulaB.tipo === 'produto' && celulaB.secao === celulaA.secao;
  }
  if (celulaA.tipo === 'desejo') {
    return celulaB.tipo === 'desejo';
  }
  return celulaB.tipo === celulaA.tipo;
}

function criarCanvasMapa(escalaCamada) {
  const larguraMapa = LARGURA * TAMANHO_CASA;
  const alturaMapa = ALTURA * TAMANHO_CASA;
  const canvasMapa = document.createElement('canvas');
  canvasMapa.width = larguraMapa * escalaCamada;
  canvasMapa.height = alturaMapa * escalaCamada;

  const ctxMapa = canvasMapa.getContext('2d');
  if (!ctxMapa) return null;

  ctxMapa.imageSmoothingEnabled = true;
  ctxMapa.imageSmoothingQuality = 'high';
  ctxMapa.save();
  ctxMapa.scale(escalaCamada, escalaCamada);

  const ent = entrada();

  for (let y = 0; y < ALTURA; y++) {
    for (let x = 0; x < LARGURA; x++) {
      const celula = celulaEm(x, y);
      const acima = y > 0 ? celulaEm(x, y - 1) : null;
      const acimaSolido = Boolean(
        acima && (acima.tipo === 'parede' || acima.tipo === 'produto' || acima.tipo === 'desejo'),
      );
      const vizinhos = {
        casaX: x,
        casaY: y,
        ultimaLinha: ALTURA - 1,
        ehPortaEntrada: celula.tipo === 'parede' && y === ALTURA - 1 && Math.abs(x - ent.x) <= 1,
        acimaSolido,
        cima: mesmoMovel(celula, x, y - 1),
        baixo: mesmoMovel(celula, x, y + 1),
        esquerda: mesmoMovel(celula, x - 1, y),
        direita: mesmoMovel(celula, x + 1, y),
      };

      const px = x * TAMANHO_CASA;
      const py = y * TAMANHO_CASA;
      desenharCasa(ctxMapa, celula, px, py, vizinhos);
      if (celula.tipo === 'produto' || celula.tipo === 'desejo') {
        desenharProduto(ctxMapa, celula.id, null, px, py, vizinhos);
      }
    }
  }

  // Tapete de boas-vindas na entrada interna do mercado
  const matX = ent.x * TAMANHO_CASA + 1.5;
  const matY = ent.y * TAMANHO_CASA + 3.5;
  ctxMapa.fillStyle = '#e86898';
  ctxMapa.beginPath();
  if (typeof ctxMapa.roundRect === 'function') {
    ctxMapa.roundRect(matX, matY, 13, 9.5, 1.4);
  } else {
    ctxMapa.rect(matX, matY, 13, 9.5);
  }
  ctxMapa.fill();
  ctxMapa.strokeStyle = '#fff5f8';
  ctxMapa.lineWidth = 0.7;
  ctxMapa.stroke();

  ctxMapa.restore();
  return canvasMapa;
}

/**
 * Cria o renderizador do mapa com devicePixelRatio e câmera presa aos limites da loja.
 * A camada estática (gôndolas, embalagens, piso) só é desenhada no primeiro quadro,
 * na resolução da tela — quem joga na lista rápida nunca paga esse custo.
 * Retorna null se o contexto 2D do canvas não estiver disponível.
 */
export function criarRenderizador(canvas) {
  if (!canvas || typeof canvas.getContext !== 'function') return null;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  let canvasMapa = null;
  let escalaCamada = 0;
  let fonteCorpo = null;

  const larguraMapaLogica = LARGURA * TAMANHO_CASA;
  const alturaMapaLogica = ALTURA * TAMANHO_CASA;

  let escala = 3;
  let casaPx = TAMANHO_CASA * escala;
  let larguraLogica = 104;
  let alturaLogica = 128;
  let larguraCss = larguraLogica * escala;
  let alturaCss = alturaLogica * escala;
  let dpr = 1;
  let camX = 0;
  let camY = 0;
  let quadrosDesenhados = 0;
  let ultimoEstado = null;

  function obterLarguraDisponivel() {
    const moldura = canvas.closest('.mapa-moldura') || canvas.parentElement;
    const larguraMoldura = moldura?.clientWidth || 0;
    if (larguraMoldura > 0) {
      return Math.max(240, larguraMoldura - 6);
    }
    return Math.max(240, Math.min(860, (window.innerWidth || 360) - 48));
  }

  function ajustarTamanho() {
    const larguraDisponivel = obterLarguraDisponivel();
    escala = Math.max(3, Math.min(5, Math.floor(larguraDisponivel / 145)));
    casaPx = TAMANHO_CASA * escala;

    larguraLogica = Math.min(larguraMapaLogica, Math.floor(larguraDisponivel / escala));
    const alturaJanela = window.innerHeight || 640;
    const alturaMaxCss = Math.min(Math.floor(alturaJanela * 0.62), 8 * casaPx);
    alturaLogica = Math.min(
      alturaMapaLogica,
      Math.max(5 * TAMANHO_CASA, Math.floor(alturaMaxCss / escala)),
    );

    larguraCss = larguraLogica * escala;
    alturaCss = alturaLogica * escala;
    dpr = Math.max(1, window.devicePixelRatio || 1);

    canvas.width = Math.round(larguraCss * dpr);
    canvas.height = Math.round(alturaCss * dpr);
    canvas.style.width = `${larguraCss}px`;
    canvas.style.height = `${alturaCss}px`;
    canvas.dataset.escala = String(escala);
    canvas.dataset.casaPx = String(casaPx);
    canvas.dataset.larguraLogica = String(larguraLogica);
    canvas.dataset.alturaLogica = String(alturaLogica);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Se a densidade mudou (zoom, troca de monitor, rotação), a camada é refeita no próximo quadro
    if (canvasMapa && escalaDesejada() !== escalaCamada) {
      canvasMapa = null;
      escalaCamada = 0;
    }

    if (ultimoEstado) {
      calcularCamera(ultimoEstado.posX, ultimoEstado.posY);
    }
  }

  function escalaDesejada() {
    return Math.max(1, Math.min(ESCALA_MAPA_MAXIMA, Math.ceil(escala * dpr)));
  }

  /** Desenha a camada estática na primeira vez que for preciso (ou após mudar a densidade). */
  function garantirCamadaEstatica() {
    if (canvasMapa) return canvasMapa;
    // Se faltar memória para a resolução desejada, tenta resoluções menores
    for (let k = escalaDesejada(); k >= 1; k = k > 2 ? Math.floor(k / 2) : k - 1) {
      const camada = criarCanvasMapa(k);
      if (camada) {
        canvasMapa = camada;
        escalaCamada = k;
        return canvasMapa;
      }
    }
    return null;
  }

  function obterFonteCorpo() {
    if (fonteCorpo === null) {
      fonteCorpo = getComputedStyle(document.body).getPropertyValue('--fonte-corpo').trim()
        || FONTE_PADRAO;
    }
    return fonteCorpo;
  }

  function calcularCamera(posX, posY) {
    const centroX = (posX + 0.5) * TAMANHO_CASA;
    const centroY = (posY + 0.5) * TAMANHO_CASA;

    const maxCamX = Math.max(0, larguraMapaLogica - larguraLogica);
    const maxCamY = Math.max(0, alturaMapaLogica - alturaLogica);

    camX = Math.max(0, Math.min(maxCamX, Math.round(centroX - larguraLogica / 2)));
    camY = Math.max(0, Math.min(maxCamY, Math.round(centroY - alturaLogica / 2)));
  }

  function desenharPlacas() {
    const tamFonte = Math.round(escala * 4.4);
    const alturaPill = Math.round(tamFonte * 1.48);
    const padX = Math.round(tamFonte * 0.52);
    const raioPonto = Math.max(2.5, Math.round(tamFonte * 0.17));
    const gapPonto = Math.round(tamFonte * 0.35);

    ctx.save();
    ctx.font = `400 ${tamFonte}px ${obterFonteCorpo()}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    for (const placa of PLACAS_SECAO) {
      const px = Math.round((placa.x * TAMANHO_CASA - camX) * escala);
      const py = Math.round((placa.y * TAMANHO_CASA - camY) * escala);
      const larguraTexto = Math.ceil(ctx.measureText(placa.rotulo).width);
      const larguraPill = larguraTexto + padX * 2 + raioPonto * 2 + gapPonto;

      // Evita plaquinhas cortadas nas bordas verticais ou muito fora das bordas horizontais
      const margemBorda = 6;
      if (
        px < -larguraPill * 0.4
        || px > larguraCss + larguraPill * 0.4
        || py - alturaPill / 2 < 2
        || py + alturaPill / 2 > alturaCss - 2
      ) {
        continue;
      }

      const xMax = Math.max(margemBorda, Math.round(larguraCss - larguraPill - margemBorda));
      const x0 = Math.max(margemBorda, Math.min(xMax, Math.round(px - larguraPill / 2)));
      const y0 = Math.round(py - alturaPill / 2);

      // Placa suspensa de corredor com sombra, faixa superior colorida e marcador
      ctx.fillStyle = 'rgba(45, 32, 20, 0.2)';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x0, y0 + Math.max(1.5, Math.round(escala * 0.5)), larguraPill, alturaPill, escala * 2);
      } else {
        ctx.rect(x0, y0 + 2, larguraPill, alturaPill);
      }
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 253, 248, 0.96)';
      ctx.strokeStyle = placa.cor;
      ctx.lineWidth = Math.max(1.2, Math.round(escala * 0.45));
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x0, y0, larguraPill, alturaPill, escala * 2);
      } else {
        ctx.rect(x0, y0, larguraPill, alturaPill);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = placa.cor;
      ctx.beginPath();
      ctx.arc(x0 + padX + raioPonto, py, raioPonto, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3b2d54';
      ctx.fillText(placa.rotulo, x0 + padX + raioPonto * 2 + gapPonto, py + 0.5);
    }
    ctx.restore();
  }

  function desenharBaloesNivel1(casasDestaque) {
    if (!casasDestaque?.length) return;
    ctx.save();
    for (const pos of casasDestaque) {
      const bx = pos.x * TAMANHO_CASA + 8;
      const by = Math.max(5.5, pos.y * TAMANHO_CASA - 0.5);

      ctx.fillStyle = 'rgba(55, 40, 30, 0.22)';
      ctx.beginPath();
      ctx.arc(bx, by + 0.6, 4.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffd43b';
      ctx.strokeStyle = '#3b2d54';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(bx, by, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#3b2d54';
      ctx.font = 'bold 6.2px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', bx, by + 0.4);
    }
    ctx.restore();
  }

  function desenhar(estado) {
    ultimoEstado = estado;
    quadrosDesenhados += 1;

    calcularCamera(estado.posX, estado.posY);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, larguraCss, alturaCss);

    const camada = garantirCamadaEstatica();
    if (camada) {
      // Com a camada na resolução da tela a cópia é 1:1 (ou quase): reamostragem barata
      ctx.imageSmoothingEnabled = escalaCamada !== escala * dpr;
      ctx.imageSmoothingQuality = 'low';
      ctx.drawImage(
        camada,
        camX * escalaCamada,
        camY * escalaCamada,
        larguraLogica * escalaCamada,
        alturaLogica * escalaCamada,
        0,
        0,
        larguraCss,
        alturaCss,
      );
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.save();
    ctx.scale(escala, escala);
    ctx.translate(-camX, -camY);

    if (estado.destinoCaminhada) {
      const dx = estado.destinoCaminhada.x * TAMANHO_CASA;
      const dy = estado.destinoCaminhada.y * TAMANHO_CASA;
      ctx.fillStyle = 'rgba(216, 27, 127, 0.14)';
      ctx.strokeStyle = 'rgba(216, 27, 127, 0.72)';
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(dx + 2.2, dy + 2.2, TAMANHO_CASA - 4.4, TAMANHO_CASA - 4.4, 2.5);
      } else {
        ctx.rect(dx + 2.2, dy + 2.2, TAMANHO_CASA - 4.4, TAMANHO_CASA - 4.4);
      }
      ctx.fill();
      ctx.stroke();
    }

    if (estado.destaqueCasa) {
      const hx = estado.destaqueCasa.x * TAMANHO_CASA;
      const hy = estado.destaqueCasa.y * TAMANHO_CASA;
      ctx.fillStyle = 'rgba(255, 223, 77, 0.22)';
      ctx.strokeStyle = '#ffca28';
      ctx.lineWidth = 1.05;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(hx + 0.6, hy + 0.6, TAMANHO_CASA - 1.2, TAMANHO_CASA - 1.2, 1.8);
      } else {
        ctx.rect(hx + 0.6, hy + 0.6, TAMANHO_CASA - 1.2, TAMANHO_CASA - 1.2);
      }
      ctx.fill();
      ctx.stroke();
    }

    desenharBaloesNivel1(estado.baloesNivel1);
    ctx.restore();

    // Placas das seções desenhadas antes da personagem para nunca escondê-la
    desenharPlacas();

    ctx.save();
    ctx.scale(escala, escala);
    ctx.translate(-camX, -camY);
    desenharPersonagem(
      ctx,
      estado.direcao,
      estado.quadro,
      estado.posX * TAMANHO_CASA,
      estado.posY * TAMANHO_CASA,
      {
        itensNoCarrinho: estado.itensNoCarrinho || 0,
        fasePasso: estado.fasePasso,
      },
    );
    ctx.restore();

    canvas.dataset.camX = String(camX);
    canvas.dataset.camY = String(camY);
    canvas.dataset.quadros = String(quadrosDesenhados);
    canvas.dataset.posX = String(estado.posX);
    canvas.dataset.posY = String(estado.posY);
    canvas.dataset.direcao = String(estado.direcao);
    canvas.dataset.quadro = String(estado.quadro);
  }

  function eventoParaCasa(evento) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const xCss = ((evento.clientX - rect.left) / rect.width) * larguraCss;
    const yCss = ((evento.clientY - rect.top) / rect.height) * alturaCss;
    const xLog = xCss / escala + camX;
    const yLog = yCss / escala + camY;
    const x = Math.floor(xLog / TAMANHO_CASA);
    const y = Math.floor(yLog / TAMANHO_CASA);
    if (x < 0 || y < 0 || x >= LARGURA || y >= ALTURA) return null;
    return { x, y };
  }

  function obterMetricas() {
    return {
      escala,
      casaPx,
      larguraCss,
      alturaCss,
      larguraLogica,
      alturaLogica,
      camX,
      camY,
      larguraMapaLogica,
      alturaMapaLogica,
      quadrosDesenhados,
      escalaCamada,
    };
  }

  ajustarTamanho();

  return {
    ajustarTamanho,
    desenhar,
    eventoParaCasa,
    obterMetricas,
  };
}
