/**
 * Corrida 3D — arte própria em Canvas, sem regras nem relógio.
 * Polígonos/escala adaptados de Render.segment e Render.sprite, javascript-racer:
 * https://github.com/jakesgordon/javascript-racer/tree/3e8a060b5900755db27f899612a74a77427c853e
 * Copyright (c) 2012, 2013, 2014, 2015, 2016 Jake Gordon and contributors.
 * MIT — LICENSE-javascript-racer.txt. Nenhum asset externo.
 * Integração derivada de Pixel Racer, Copyright (c) 2026 Tarek Elomami,
 * MIT — LICENSE-pixel-racer.txt.
 */
import { ALTURA_CANVAS, LARGURA_CANVAS } from '../grande-premio/jogo.js';

// Parte do Canvas lógico 400×700 que aparece na tela. O céu acima de TOPO_DA_VISTA
// não tem jogo; cortá-lo deixa a pista mais larga no celular. A base continua em 700
// porque rivais ultrapassados saem por baixo antes de o motor removê-los (y ≤ 720).
export const TOPO_DA_VISTA = 120;
export const ALTURA_DA_VISTA = ALTURA_CANVAS - TOPO_DA_VISTA;
const COR_DO_CEU = '#9cddf5';

function caminho(ctx, pontos) {
  if (!pontos || pontos.length < 3 || pontos.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) return false;
  ctx.beginPath();
  ctx.moveTo(pontos[0].x, pontos[0].y);
  for (const p of pontos.slice(1)) ctx.lineTo(p.x, p.y);
  ctx.closePath();
  return true;
}

function poligono(ctx, pontos, cor, contorno = null) {
  if (!caminho(ctx, pontos)) return;
  ctx.fillStyle = cor;
  ctx.fill();
  if (contorno) {
    ctx.strokeStyle = contorno;
    ctx.stroke();
  }
}

function desenharEstrada(ctx, cena) {
  ctx.fillStyle = COR_DO_CEU;
  ctx.fillRect(0, 0, 400, 700);
  ctx.fillStyle = '#4c9b52';
  ctx.fillRect(0, cena.camera.horizonte, 400, 700 - cena.camera.horizonte);
  // A continuação distante é só fundo: nenhum objeto interativo fica ali.
  const longe = cena.segmentos[0].poligono;
  if (longe.length >= 2) poligono(ctx, [
    { x: cena.camera.centro, y: cena.camera.horizonte }, longe[1], longe[0],
  ], '#374151');
  for (const segmento of cena.segmentos) poligono(ctx, segmento.poligono, '#374151');
  for (const marca of cena.marcas) poligono(ctx, marca.poligono, marca.cor);
  desenharNevoa(ctx, cena.camera);
}

/** A estrada some aos poucos na distância; os carros surgem logo abaixo da névoa. */
function desenharNevoa(ctx, camera) {
  const { horizonte, nevoa } = camera;
  if (!Number.isFinite(nevoa) || nevoa <= horizonte) return;
  const gradiente = ctx.createLinearGradient(0, horizonte, 0, nevoa);
  gradiente.addColorStop(0, 'rgba(156, 221, 245, 0.92)');
  gradiente.addColorStop(1, 'rgba(156, 221, 245, 0)');
  ctx.fillStyle = gradiente;
  ctx.fillRect(0, horizonte, LARGURA_CANVAS, nevoa - horizonte);
}

function desenharLinhaDeChegada(ctx, linha) {
  if (linha) for (const ladrilho of linha.ladrilhos) poligono(ctx, ladrilho.poligono, ladrilho.cor);
}

/** Poça escura com brilho, apoiada na pegada do óleo; some aos poucos depois de usada. */
function desenharOleo(ctx, oleo) {
  if (!oleo || !oleo.pegada || oleo.pegada.length < 3) return;
  const xs = oleo.pegada.map(p => p.x);
  const ys = oleo.pegada.map(p => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const rx = (Math.max(...xs) - Math.min(...xs)) / 2;
  const ry = (Math.max(...ys) - Math.min(...ys)) / 2;
  if (![cx, cy, rx, ry].every(Number.isFinite) || rx <= 0 || ry <= 0) return;
  ctx.save();
  try {
    ctx.globalAlpha = Math.max(0, Math.min(1, oleo.alfa * (oleo.usado ? 0.6 : 1)));
    ctx.fillStyle = '#0b0b12';
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = Math.max(1, 2 * oleo.escala);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(cx - rx * 0.3, cy - ry * 0.25, rx * 0.28, ry * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
  } finally { ctx.restore(); }
}

/** Pisca-pisca: lanterna âmbar do lado da troca e uma seta âmbar sobre o teto. */
function desenharPiscaPisca(ctx, objeto, apresentacao, topo) {
  const { base, largura: w, alturaCarroceria: h, sinal } = objeto;
  const aceso = apresentacao.movimentoReduzido || (apresentacao.tempo ?? 0) % 0.4 < 0.22;
  if (!aceso) return;
  ctx.fillStyle = '#f59e0b';
  const lanternaX = sinal < 0 ? base.x - w * 0.46 : base.x + w * 0.28;
  ctx.fillRect(lanternaX, base.y - h * 0.4, w * 0.18, h * 0.22);
  // Seta com tamanho mínimo: longe, o carro é pequeno, mas o aviso precisa aparecer.
  const t = Math.max(11, w * 0.4);
  const y = topo - t * 0.9;
  const ponta = base.x + sinal * t;
  poligono(ctx, [
    { x: ponta, y },
    { x: ponta - sinal * t, y: y - t * 0.7 },
    { x: ponta - sinal * t, y: y + t * 0.7 },
  ], '#f59e0b', '#78350f');
}

function desenharCarroTraseiro(ctx, objeto, apresentacao) {
  const { pegada, base, largura: w, alturaCarroceria: h, escala: s } = objeto;
  const jogador = objeto.tipo === 'jogador';
  ctx.save();
  try {
    if (jogador && Number.isFinite(objeto.derrapando) && !apresentacao.movimentoReduzido) {
      // Balanço do escorregão, em torno do centro traseiro; a pegada no chão também gira.
      ctx.translate(base.x, base.y);
      ctx.rotate(0.14 * Math.sin((apresentacao.tempo ?? 0) * 26));
      ctx.translate(-base.x, -base.y);
    }
    ctx.globalAlpha = Math.max(0, Math.min(1, objeto.alfa));
    if (jogador && apresentacao.imune && !apresentacao.movimentoReduzido) {
      ctx.globalAlpha *= (apresentacao.tempo % 0.5 < 0.25) ? 0.55 : 1;
    }
    ctx.lineWidth = Math.max(1, 1.5 * s);
    const [fe, fd, td, te] = pegada;
    // A sombra mostra todo o comprimento lógico. Rodas e carroceria ficam dentro
    // da largura projetada, inclusive ao raspar um rival na faixa vizinha.
    poligono(ctx, pegada, '#17202dcc', '#dbeafe');
    const alto = [
      { x: fe.x + 2 * fe.escala, y: fe.y - h * 0.35 },
      { x: fd.x - 2 * fd.escala, y: fd.y - h * 0.35 },
      { x: td.x - 2 * s, y: td.y - h },
      { x: te.x + 2 * s, y: te.y - h },
    ];
    poligono(ctx, [fe, alto[0], alto[3], te], objeto.cor, '#0f172a');
    poligono(ctx, [fd, alto[1], alto[2], td], objeto.cor, '#0f172a');
    poligono(ctx, alto, objeto.cor, '#0f172a');
    poligono(ctx, [alto[3], alto[2], td, te], objeto.cor, '#0f172a');
    // Faixa branca sobre o teto, janela traseira escura e duas lanternas vermelhas.
    const frenteX = (alto[0].x + alto[1].x) / 2;
    poligono(ctx, [
      { x: frenteX - 3 * s, y: alto[0].y }, { x: frenteX + 3 * s, y: alto[1].y },
      { x: base.x + 3 * s, y: base.y - h }, { x: base.x - 3 * s, y: base.y - h },
    ], '#ffffff');
    ctx.fillStyle = '#102a43';
    ctx.fillRect(base.x - w * 0.34, base.y - h * 0.9, w * 0.68, h * 0.38);
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(base.x - w * 0.29, base.y - h * 0.85, w * 0.22, h * 0.08);
    ctx.fillStyle = '#111827';
    for (const x of [te.x, td.x - 5 * s]) ctx.fillRect(x, base.y - 10 * s, 5 * s, 10 * s);
    ctx.fillStyle = '#fecaca';
    for (const x of [base.x - w * 0.4, base.x + w * 0.22]) ctx.fillRect(x, base.y - h * 0.35, w * 0.18, h * 0.16);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(base.x - w * 0.14, base.y - h * 0.23, w * 0.28, h * 0.12);
    if (jogador && apresentacao.imune && caminho(ctx, pegada)) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    if (jogador && Number.isFinite(objeto.derrapando) && caminho(ctx, pegada)) {
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    if (!jogador && objeto.sinal) desenharPiscaPisca(ctx, objeto, apresentacao, Math.min(alto[2].y, alto[3].y));
  } finally { ctx.restore(); }
}

function desenharPosto(ctx, objeto) {
  const { base, largura: w, escala: s, pegada } = objeto;
  ctx.save();
  try {
    ctx.lineWidth = 2 * s;
    poligono(ctx, pegada, objeto.comAjuda ? '#4ade8099' : '#22c55e66', '#bbf7d0');
    const h = 48 * s;
    ctx.fillStyle = '#166534';
    ctx.fillRect(base.x - w / 2, base.y - 5 * s, w, 5 * s);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(base.x - w * 0.32, base.y - h, w * 0.64, h - 5 * s);
    ctx.strokeStyle = '#17202d';
    ctx.strokeRect(base.x - w * 0.32, base.y - h, w * 0.64, h - 5 * s);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(base.x - w * 0.45, base.y - h - 6 * s, w * 0.9, 8 * s);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(base.x - w * 0.22, base.y - h + 8 * s, w * 0.44, 14 * s);
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(base.x - w * 0.16, base.y - h + 11 * s, w * 0.32, 5 * s);
    ctx.beginPath();
    ctx.moveTo(base.x + w * 0.32, base.y - h + 14 * s);
    ctx.lineTo(base.x + w * 0.43, base.y - h + 20 * s);
    ctx.lineTo(base.x + w * 0.43, base.y - 13 * s);
    ctx.lineTo(base.x + w * 0.28, base.y - 13 * s);
    ctx.stroke();
  } finally { ctx.restore(); }
}

function desenharSeta(ctx, seta) {
  if (!seta) return;
  const { de, para } = seta;
  const sentido = Math.sign(para.x - de.x) || 1;
  ctx.strokeStyle = '#bbf7d0';
  ctx.lineWidth = 12 * de.escala;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(de.x, de.y);
  ctx.lineTo(para.x, para.y);
  ctx.stroke();
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 6 * de.escala;
  ctx.stroke();
  poligono(ctx, [para,
    { x: para.x - sentido * 15 * para.escala, y: para.y - 12 * para.escala },
    { x: para.x - sentido * 15 * para.escala, y: para.y + 12 * para.escala },
  ], '#15803d', '#bbf7d0');
}

function desenharEfeitos(ctx, apresentacao) {
  for (const efeito of apresentacao.efeitos || []) {
    const { ponto, idade, tipo } = efeito;
    if (!ponto || ![ponto.x, ponto.y, ponto.escala, idade].every(Number.isFinite)) continue;
    ctx.save();
    try {
      ctx.globalAlpha = Math.max(0, Math.min(1, 1 - idade / 0.8));
      if (tipo === 'mais-um') {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 3;
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        const y = ponto.y - 20 - (apresentacao.movimentoReduzido ? 0 : idade * 28);
        ctx.strokeText('+1', ponto.x, y);
        ctx.fillText('+1', ponto.x, y);
      } else if (!apresentacao.movimentoReduzido) {
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(ponto.x, ponto.y - idade * 18, (3 + idade * 6) * ponto.escala, 0, Math.PI * 2);
        ctx.fill();
      }
    } finally { ctx.restore(); }
  }
}

/** Sem listeners/RAF: a tela é dona do ciclo de vida e passa o DPR atual. */
export function criarRenderizador(canvas, { qualidade = 'padrao' } = {}) {
  const ctx = canvas.getContext('2d');
  let ativo = true;
  function redimensionar(dpr = 1) {
    if (!ativo) return;
    const limite = qualidade === 'economica' ? 1 : 1.5;
    const escala = Number.isFinite(dpr) ? Math.max(1, Math.min(limite, dpr)) : 1;
    canvas.width = Math.round(LARGURA_CANVAS * escala);
    canvas.height = Math.round(ALTURA_DA_VISTA * escala);
    ctx.setTransform(escala, 0, 0, escala, 0, -TOPO_DA_VISTA * escala);
  }
  function desenhar(cena, apresentacao = {}) {
    if (!ativo) return;
    ctx.save();
    try {
      ctx.beginPath();
      ctx.rect(0, TOPO_DA_VISTA, LARGURA_CANVAS, ALTURA_DA_VISTA);
      ctx.clip();
      desenharEstrada(ctx, cena);
      desenharLinhaDeChegada(ctx, cena.linhaDeChegada);
      desenharOleo(ctx, cena.oleo);
      desenharSeta(ctx, apresentacao.seta);
      for (const objeto of cena.objetos) {
        if (objeto.tipo === 'posto') desenharPosto(ctx, objeto);
        else desenharCarroTraseiro(ctx, objeto, apresentacao);
      }
      desenharEfeitos(ctx, apresentacao);
      // Esta opção é removida pelo build de produção, mesmo se passada pelo chamador.
      if (import.meta.env.DEV && apresentacao.hitboxes) {
        ctx.lineWidth = 1;
        if (caminho(ctx, cena.oleo?.hitbox)) {
          ctx.strokeStyle = '#facc15';
          ctx.stroke();
        }
        for (const objeto of cena.objetos) {
          for (const [tipo, pontos] of Object.entries(objeto.hitboxes || {})) {
            if (caminho(ctx, pontos)) {
              ctx.strokeStyle = tipo === 'colisao' ? '#f472b6' : '#67e8f9';
              ctx.stroke();
            }
          }
        }
      }
    } finally { ctx.restore(); }
  }
  redimensionar();
  return { redimensionar, desenhar, destruir() { ativo = false; } };
}
