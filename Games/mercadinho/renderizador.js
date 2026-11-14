import { ALTURA, LARGURA, celulaEm, entrada } from './mapa.js';
import {
  TAMANHO_CASA,
  desenharCasa,
  desenharPersonagem,
  desenharProduto,
} from './arte.js';

const PLACAS_SECAO = Object.freeze([
  { id: 'laticinios', rotulo: 'Laticínios', x: 5.0, y: 0.5 },
  { id: 'acougue', rotulo: 'Açougue', x: 12.5, y: 0.5 },
  { id: 'bebidas', rotulo: 'Bebidas', x: 19.0, y: 0.5 },
  { id: 'padaria', rotulo: 'Padaria', x: 5.5, y: 3.45 },
  { id: 'mercearia', rotulo: 'Mercearia', x: 12.0, y: 3.45 },
  { id: 'limpeza', rotulo: 'Limpeza', x: 18.0, y: 3.45 },
  { id: 'hortifruti', rotulo: 'Hortifrúti', x: 3.4, y: 8.5 },
  { id: 'guloseimas', rotulo: 'Guloseimas', x: 14.0, y: 10.45 },
  { id: 'caixas', rotulo: 'Caixas', x: 12.0, y: 12.45 },
]);

function criarCanvasMapa() {
  const larguraMapa = LARGURA * TAMANHO_CASA;
  const alturaMapa = ALTURA * TAMANHO_CASA;
  const canvasMapa = document.createElement('canvas');
  canvasMapa.width = larguraMapa;
  canvasMapa.height = alturaMapa;

  const ctxMapa = canvasMapa.getContext('2d');
  if (!ctxMapa) return null;

  for (let y = 0; y < ALTURA; y++) {
    for (let x = 0; x < LARGURA; x++) {
      const celula = celulaEm(x, y);
      const px = x * TAMANHO_CASA;
      const py = y * TAMANHO_CASA;
      desenharCasa(ctxMapa, celula, px, py);
      if (celula.tipo === 'produto' || celula.tipo === 'desejo') {
        desenharProduto(ctxMapa, celula.id, null, px, py);
      }
    }
  }

  // Tapete da entrada e marco da porta na parede de baixo
  const ent = entrada();
  ctxMapa.fillStyle = '#f8bbd0';
  ctxMapa.fillRect(ent.x * TAMANHO_CASA + 2, ent.y * TAMANHO_CASA + 3, 12, 10);
  ctxMapa.strokeStyle = '#ad155c';
  ctxMapa.lineWidth = 1;
  ctxMapa.strokeRect(ent.x * TAMANHO_CASA + 2.5, ent.y * TAMANHO_CASA + 3.5, 11, 9);

  ctxMapa.fillStyle = '#ffeaf1';
  ctxMapa.fillRect(ent.x * TAMANHO_CASA + 3, (ent.y + 1) * TAMANHO_CASA + 1, 10, 12);
  ctxMapa.fillStyle = '#d81b7f';
  ctxMapa.fillRect(ent.x * TAMANHO_CASA + 3, (ent.y + 1) * TAMANHO_CASA + 1, 10, 2);

  return canvasMapa;
}

/**
 * Cria o renderizador do mapa em canvas com camada estática fora da tela,
 * escala inteira, devicePixelRatio e câmera presa aos limites da loja.
 * Retorna null se o contexto 2D do canvas não estiver disponível.
 */
export function criarRenderizador(canvas) {
  if (!canvas || typeof canvas.getContext !== 'function') return null;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const canvasMapa = criarCanvasMapa();
  if (!canvasMapa) return null;

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
    return Math.max(240, Math.min(760, (window.innerWidth || 360) - 48));
  }

  function ajustarTamanho() {
    const larguraDisponivel = obterLarguraDisponivel();
    escala = Math.max(3, Math.min(5, Math.floor(larguraDisponivel / 144)));
    casaPx = TAMANHO_CASA * escala;

    larguraLogica = Math.min(larguraMapaLogica, Math.floor(larguraDisponivel / escala));
    const alturaJanela = window.innerHeight || 640;
    const alturaMaxCss = Math.min(Math.floor(alturaJanela * 0.6), 8 * casaPx);
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
    ctx.imageSmoothingEnabled = false;

    if (ultimoEstado) {
      calcularCamera(ultimoEstado.posX, ultimoEstado.posY);
    }
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
    const fonteCorpo = getComputedStyle(document.body).getPropertyValue('--fonte-corpo').trim()
      || 'Fredoka One, Trebuchet MS, system-ui, sans-serif';
    const tamFonte = 8 * escala;
    const alturaPill = Math.round(tamFonte * 1.25);
    const padX = Math.round(escala * 2.5);

    ctx.save();
    ctx.font = `400 ${tamFonte}px ${fonteCorpo}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const placa of PLACAS_SECAO) {
      const px = Math.round((placa.x * TAMANHO_CASA - camX) * escala);
      const py = Math.round((placa.y * TAMANHO_CASA - camY) * escala);
      const larguraTexto = Math.ceil(ctx.measureText(placa.rotulo).width);
      const larguraPill = larguraTexto + padX * 2;

      if (
        px + larguraPill / 2 < 0
        || px - larguraPill / 2 > larguraCss
        || py + alturaPill / 2 < 0
        || py - alturaPill / 2 > alturaCss
      ) {
        continue;
      }

      const x0 = Math.round(px - larguraPill / 2);
      const y0 = Math.round(py - alturaPill / 2);

      ctx.fillStyle = 'rgba(255, 251, 242, 0.9)';
      ctx.strokeStyle = 'rgba(59, 45, 84, 0.65)';
      ctx.lineWidth = Math.max(1, Math.floor(escala / 2));
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x0, y0, larguraPill, alturaPill, escala * 2);
      } else {
        ctx.rect(x0, y0, larguraPill, alturaPill);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#3b2d54';
      ctx.fillText(placa.rotulo, px, py + 1);
    }
    ctx.restore();
  }

  function desenharBaloesNivel1(casasDestaque) {
    if (!casasDestaque?.length) return;
    ctx.save();
    for (const pos of casasDestaque) {
      const bx = pos.x * TAMANHO_CASA + 8;
      const by = Math.max(5, pos.y * TAMANHO_CASA - 1);

      ctx.fillStyle = '#ffd166';
      ctx.strokeStyle = '#2b2b3a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#2b2b3a';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', bx, by + 0.5);
    }
    ctx.restore();
  }

  function desenhar(estado) {
    ultimoEstado = estado;
    quadrosDesenhados += 1;

    calcularCamera(estado.posX, estado.posY);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, larguraCss, alturaCss);

    ctx.drawImage(
      canvasMapa,
      camX,
      camY,
      larguraLogica,
      alturaLogica,
      0,
      0,
      larguraCss,
      alturaCss,
    );

    ctx.save();
    ctx.scale(escala, escala);
    ctx.translate(-camX, -camY);

    if (estado.destinoCaminhada) {
      const dx = estado.destinoCaminhada.x * TAMANHO_CASA;
      const dy = estado.destinoCaminhada.y * TAMANHO_CASA;
      ctx.strokeStyle = 'rgba(216, 27, 127, 0.75)';
      ctx.lineWidth = 1;
      ctx.strokeRect(dx + 2.5, dy + 2.5, TAMANHO_CASA - 5, TAMANHO_CASA - 5);
    }

    if (estado.destaqueCasa) {
      const hx = estado.destaqueCasa.x * TAMANHO_CASA;
      const hy = estado.destaqueCasa.y * TAMANHO_CASA;
      ctx.strokeStyle = '#ffdf4d';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(hx + 0.6, hy + 0.6, TAMANHO_CASA - 1.2, TAMANHO_CASA - 1.2);
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
