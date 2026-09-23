/**
 * Corrida 3D — geometria de apresentação, sem avanço da simulação.
 * Perspectiva adaptada de Util.project e segmentação de Render.segment:
 * https://github.com/jakesgordon/javascript-racer/tree/3e8a060b5900755db27f899612a74a77427c853e
 * Copyright (c) 2012, 2013, 2014, 2015, 2016 Jake Gordon and contributors.
 * MIT — cópia integral em LICENSE-javascript-racer.txt. Sem assets externos.
 * Motor importado do Grande Prêmio, derivado de Pixel Racer:
 * Copyright (c) 2026 Tarek Elomami — MIT, LICENSE-pixel-racer.txt.
 */
import { ALTURA_CANVAS, LARGURA_CANVAS, MARGEM_COLISAO } from '../grande-premio/jogo.js';

export const ALTURA_CARROCERIA = 34;
// O motor usa literalmente 4 na coleta; não exporta uma constante para essa margem.
const MARGEM_COLETA = 4;
const DISTANCIA_PROXIMA = -200;
const DISTANCIA_DISTANTE = 3500;

/**
 * Câmera criada por criarCena. Curva decorativa só além dos 300 px de contato.
 * Preserva subpixels: arredondar aqui causaria saltos durante trocas de faixa.
 * null significa recorte no plano próximo (z <= 100) ou entrada não finita.
 */
export function projetarPonto({ x, y }, camera) {
  const d = camera.referencia - y;
  const z = camera.profundidade + d;
  if (!Number.isFinite(x) || !Number.isFinite(z) || z <= camera.recorte) return null;
  const escala = camera.profundidade / z;
  const t = Math.max(0, Math.min(1, (d - 300) / 600));
  const curva = camera.movimentoReduzido ? 0 : (camera.curva ?? 0) * t * t * (3 - 2 * t);
  const telaX = camera.centro + (x - camera.centro + curva) * escala;
  const telaY = camera.horizonte + (camera.referencia - camera.horizonte) * escala;
  if (![telaX, telaY, escala].every(Number.isFinite)) return null;
  return { x: telaX, y: telaY, escala };
}

/** Cantos em ordem: dianteiro esquerdo, dianteiro direito, traseiro direito, traseiro esquerdo. */
function projetarRetangulo({ x, y, w, h }, camera, margem = 0) {
  if (![x, y, w, h].every(Number.isFinite) || w < 2 * margem || h < 2 * margem) return null;
  const pontos = [
    { x: x + margem, y: y + margem },
    { x: x + w - margem, y: y + margem },
    { x: x + w - margem, y: y + h - margem },
    { x: x + margem, y: y + h - margem },
  ].map(ponto => projetarPonto(ponto, camera));
  return pontos.every(Boolean) ? pontos : null;
}

/**
 * A base é o centro traseiro no chão. h é comprimento lógico, não altura do sprite.
 * Objetos que interceptam o plano próximo são omitidos inteiros; esse plano fica além
 * da região em que o motor mantém rivais/postos. Não recortar pegadas ao viewport:
 * elas ainda servem de âncora para a carroceria quando a base sai pela borda inferior.
 */
export function projetarObjeto(objeto, camera) {
  const pegada = projetarRetangulo(objeto, camera);
  if (!pegada) return null;
  const base = projetarPonto({ x: objeto.x + objeto.w / 2, y: objeto.y + objeto.h }, camera);
  if (!base) return null;
  return {
    base,
    pegada,
    escala: base.escala,
    largura: pegada[2].x - pegada[3].x,
    alturaCarroceria: ALTURA_CARROCERIA * base.escala,
    centroLongitudinal: objeto.y + objeto.h / 2,
  };
}

/** Recorte de polígonos convexos no viewport lógico, independente de Canvas. */
function recortarPoligono(pontos) {
  let resultado = pontos.map(({ x, y }) => ({ x, y }));
  for (const [eixo, limite, sentido] of [
    ['x', 0, 1], ['x', LARGURA_CANVAS, -1],
    ['y', 0, 1], ['y', ALTURA_CANVAS, -1],
  ]) {
    const entrada = resultado;
    resultado = [];
    for (let i = 0; i < entrada.length; i++) {
      const a = entrada[i];
      const b = entrada[(i + 1) % entrada.length];
      const dentroA = (a[eixo] - limite) * sentido >= 0;
      const dentroB = (b[eixo] - limite) * sentido >= 0;
      if (dentroA) resultado.push(a);
      if (dentroA !== dentroB) {
        const t = (limite - a[eixo]) / (b[eixo] - a[eixo]);
        resultado.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, [eixo]: limite });
      }
    }
  }
  return resultado;
}

function criarSegmentos(estado, camera, quantidade) {
  const { inicio, fim, larguraFaixa } = estado.geometria;
  const comprimento = (DISTANCIA_DISTANTE - DISTANCIA_PROXIMA) / quantidade;
  return Array.from({ length: quantidade }, (_, indice) => {
    // Distante → próximo, como os objetos. A malha é fixa; marcas/zebras usam a
    // coordenada do mundo (d + distancia), contínua mesmo quando o carro desacelera.
    const dPerto = DISTANCIA_PROXIMA + (quantidade - indice - 1) * comprimento;
    const dLonge = dPerto + comprimento;
    const y = camera.referencia - dLonge;
    const retangulo = { x: inicio, y, w: fim - inicio, h: comprimento };
    return {
      dPerto,
      dLonge,
      mundoPerto: dPerto + estado.distancia,
      mundoLonge: dLonge + estado.distancia,
      poligono: recortarPoligono(projetarRetangulo(retangulo, camera)),
      faixas: Array.from({ length: estado.faixas }, (_, faixa) => recortarPoligono(
        projetarRetangulo({ ...retangulo, x: inicio + faixa * larguraFaixa, w: larguraFaixa }, camera),
      )),
    };
  });
}

/** Marcas presas ao mundo: as extremidades se deslocam continuamente, sem trocar
 * a cor de um segmento fixo inteiro quando a distância cruza um múltiplo. */
function criarMarcas(estado, camera, quantidade) {
  const { inicio, fim, larguraFaixa } = estado.geometria;
  const marcas = [];
  const adicionar = (x, w, dPerto, dLonge, cor) => {
    const pegada = projetarRetangulo({ x, w, y: camera.referencia - dLonge, h: dLonge - dPerto }, camera);
    if (pegada) marcas.push({ cor, poligono: recortarPoligono(pegada) });
  };
  const passo = (DISTANCIA_DISTANTE - DISTANCIA_PROXIMA) / quantidade;
  for (let i = 0; i < quantidade; i++) {
    const perto = DISTANCIA_PROXIMA + i * passo;
    for (const x of [inicio - 3, fim]) adicionar(x, 3, perto, perto + passo, '#ffffff');
  }
  for (let mundo = Math.floor((estado.distancia - 200) / 40) * 40;
    mundo < estado.distancia + 3500; mundo += 40) {
    const perto = Math.max(-200, mundo - estado.distancia);
    const longe = Math.min(3500, mundo + 40 - estado.distancia);
    const cor = Math.abs(Math.round(mundo / 40)) % 2 ? '#ffffff' : '#dc2626';
    for (const x of [inicio - 13, fim + 3]) adicionar(x, 10, perto, longe, cor);
  }
  for (let mundo = Math.floor((estado.distancia - 200) / 100) * 100;
    mundo < estado.distancia + 3500; mundo += 100) {
    const perto = Math.max(-200, mundo - estado.distancia);
    const longe = Math.min(3500, mundo + 55 - estado.distancia);
    if (longe <= perto) continue;
    for (let faixa = 1; faixa < estado.faixas; faixa++) {
      adicionar(inicio + faixa * larguraFaixa - 2, 4, perto, longe, '#f8fafc');
    }
  }
  return marcas;
}

function objetoDaCena(objeto, tipo, id, camera) {
  const projecao = projetarObjeto(objeto, camera);
  if (!projecao) return null;
  return {
    ...projecao,
    tipo,
    id,
    faixa: objeto.faixa ?? null,
    cor: tipo === 'jogador' ? '#0f5aa8' : objeto.cor ?? null,
    alfa: objeto.alfa ?? 1,
    saindo: objeto.saindo ?? false,
    contado: objeto.contado ?? false,
    comAjuda: objeto.comAjuda ?? objeto.ajuda ?? false,
    // Apenas dados: a futura tela/renderizador decide exibi-los em desenvolvimento.
    // O jogador tem duas pegadas porque colisão e coleta usam margens diferentes.
    hitboxes: {
      colisao: tipo === 'posto' ? null : projetarRetangulo(objeto, camera, MARGEM_COLISAO),
      coleta: tipo === 'rival' ? null : projetarRetangulo(objeto, camera, MARGEM_COLETA),
    },
  };
}

/**
 * Snapshot visual novo, sem referências mutáveis ao estado do motor.
 * movimentoReduzido força reta; curva decorativa deriva só da distância do motor.
 * qualidade é opção técnica para medição, nunca configuração na tela infantil.
 */
export function criarCena(estado, { movimentoReduzido = false, qualidade = 'padrao' } = {}) {
  const camera = {
    referencia: estado.carro.y,
    centro: LARGURA_CANVAS / 2,
    horizonte: 170,
    profundidade: 700,
    recorte: 100,
    movimentoReduzido,
    curva: movimentoReduzido ? 0 : 18 * Math.sin(2 * Math.PI * estado.distancia / 2400),
  };
  const objetos = [objetoDaCena(estado.carro, 'jogador', 'jogador', camera)];
  for (const rival of estado.rivais) objetos.push(objetoDaCena(rival, 'rival', rival.id, camera));
  if (estado.posto) objetos.push(objetoDaCena(estado.posto, 'posto', 'posto', camera));
  const visiveis = objetos.filter(Boolean);
  visiveis.sort((a, b) => {
    const profundidade = a.centroLongitudinal - b.centroLongitudinal;
    if (profundidade !== 0) return profundidade;
    if (a.tipo !== b.tipo) return a.tipo < b.tipo ? -1 : 1;
    if (a.id === b.id) return 0;
    return a.id < b.id ? -1 : 1;
  });

  let linhaDeChegada = null;
  if (estado.linhaDeChegada) {
    const { y } = estado.linhaDeChegada;
    const inicio = projetarPonto({ x: estado.geometria.inicio, y }, camera);
    const fim = projetarPonto({ x: estado.geometria.fim, y }, camera);
    if (inicio && fim) {
      const ladrilhos = [];
      for (let fileira = 0; fileira < 2; fileira++) {
        for (let coluna = 0; coluna < 20; coluna++) {
          const largura = (estado.geometria.fim - estado.geometria.inicio) / 20;
          const poligono = projetarRetangulo({
            x: estado.geometria.inicio + coluna * largura, w: largura,
            y: y - 24 + fileira * 12, h: 12,
          }, camera);
          if (poligono) ladrilhos.push({ poligono: recortarPoligono(poligono), cor: (coluna + fileira) % 2 ? '#0f172a' : '#ffffff' });
        }
      }
      linhaDeChegada = { inicio, fim, ladrilhos };
    }
  }
  return {
    camera,
    segmentos: criarSegmentos(estado, camera, qualidade === 'economica' ? 40 : 80),
    marcas: criarMarcas(estado, camera, qualidade === 'economica' ? 40 : 80),
    objetos: visiveis,
    linhaDeChegada,
  };
}
