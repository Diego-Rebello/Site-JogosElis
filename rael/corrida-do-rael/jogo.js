/**
 * Corrida do Rael — Motor puro de geometria, colisão e trechos.
 * Derivado de cálculos do Pixel Racer sob licença MIT.
 * Cópia da licença em LICENSE-pixel-racer.txt.
 */

import { embaralhar } from '../../shared/texto.js';

export const LARGURA_CANVAS = 400;
export const ALTURA_CANVAS = 700;
export const QUANTIDADE_DE_TRECHOS = 6;
export const VELOCIDADE_DA_PISTA = 110;
export const VELOCIDADE_DO_CARRO = 220;
export const RESPOSTA_POSTO = 'posto';

/**
 * Converte qualquer valor de configuração para 2, 3 ou 4 faixas.
 * O padrão é 3.
 *
 * @param {unknown} alternativas
 * @returns {2 | 3 | 4}
 */
export function quantidadeDeFaixas(alternativas) {
  const n = typeof alternativas === 'string' ? parseInt(alternativas, 10) : Number(alternativas);
  if (n === 2 || n === 3 || n === 4) return n;
  return 3;
}

/**
 * Devolve a geometria útil da pista: { inicio, fim, largura, larguraFaixa, faixas }.
 * inicio e fim são as bordas internas dirigíveis.
 *
 * @param {{ largura?: number, margem?: number, faixas?: number }} [opcoes]
 * @returns {{ inicio: number, fim: number, largura: number, larguraFaixa: number, faixas: number }}
 */
export function geometriaDaPista({ largura = LARGURA_CANVAS, margem = 36, faixas = 3 } = {}) {
  const f = quantidadeDeFaixas(faixas);
  const larg = (Number.isFinite(largura) && largura > 0) ? largura : LARGURA_CANVAS;
  let marg = (Number.isFinite(margem) && margem >= 0) ? margem : 36;
  if (marg * 2 >= larg) {
    marg = 36;
  }
  const inicio = marg;
  const fim = larg - marg;
  const larguraUtil = fim - inicio;
  const larguraFaixa = larguraUtil / f;

  return {
    inicio,
    fim,
    largura: larg,
    larguraFaixa,
    faixas: f,
  };
}

/**
 * Centro X de uma faixa válida. Índices fora do intervalo [0, faixas - 1] são limitados.
 *
 * @param {number} indice
 * @param {{ inicio: number, larguraFaixa: number, faixas: number }} [geometria]
 * @returns {number}
 */
export function centroDaFaixa(indice, geometria) {
  const geom = geometria || geometriaDaPista();
  const f = geom.faixas;
  let i = Number.isFinite(indice) ? Math.floor(indice) : 0;
  if (i < 0) i = 0;
  if (i >= f) i = f - 1;
  return geom.inicio + (i + 0.5) * geom.larguraFaixa;
}

/**
 * Determina o índice da faixa ocupada pelo centro X do carro.
 *
 * @param {number} x Borda esquerda do carro
 * @param {number} larguraCarro Largura do carro
 * @param {{ inicio: number, larguraFaixa: number, faixas: number }} [geometria]
 * @returns {number}
 */
export function faixaDoCarro(x, larguraCarro, geometria) {
  const geom = geometria || geometriaDaPista();
  const larg = (Number.isFinite(larguraCarro) && larguraCarro > 0) ? larguraCarro : 44;
  const posX = Number.isFinite(x) ? x : geom.inicio;
  const centroX = posX + larg / 2;
  const relativo = centroX - geom.inicio;
  let i = Math.floor(relativo / geom.larguraFaixa);
  if (i < 0) i = 0;
  if (i >= geom.faixas) i = geom.faixas - 1;
  return i;
}

/**
 * Movimento contínuo horizontal do carro.
 * x é a borda esquerda; direção é normalizada para -1, 0 ou 1;
 * dt negativo ou inválido vale zero; a saída fica limitada entre inicio e fim - largura.
 *
 * @param {{
 *   x: number,
 *   direcao: number,
 *   velocidade?: number,
 *   dt: number,
 *   inicio?: number,
 *   fim?: number,
 *   largura?: number
 * }} params
 * @returns {number} Nova coordenada x
 */
export function moverCarro({
  x,
  direcao,
  velocidade = VELOCIDADE_DO_CARRO,
  dt,
  inicio = 36,
  fim = 364,
  largura = 44,
}) {
  const ini = Number.isFinite(inicio) ? inicio : 36;
  const f = Number.isFinite(fim) ? fim : 364;
  const larg = (Number.isFinite(largura) && largura > 0) ? largura : 44;
  const minX = ini;
  const maxX = Math.max(minX, f - larg);

  const posX = Number.isFinite(x) ? x : minX;
  const vel = (Number.isFinite(velocidade) && velocidade >= 0) ? velocidade : VELOCIDADE_DO_CARRO;
  const passoTempo = (Number.isFinite(dt) && dt > 0) ? dt : 0;

  let dir = 0;
  if (direcao > 0) dir = 1;
  else if (direcao < 0) dir = -1;

  const novoX = posX + dir * vel * passoTempo;
  return Math.max(minX, Math.min(maxX, novoX));
}

/**
 * Teste AABB puro com margem de tolerância configurável, derivado do original.
 *
 * @param {{ x: number, y: number, w: number, h: number }} a
 * @param {{ x: number, y: number, w: number, h: number }} b
 * @param {number} [margem=4]
 * @returns {boolean}
 */
export function retangulosSeSobrepoem(a, b, margem = 4) {
  if (!a || !b) return false;
  const m = Number.isFinite(margem) ? margem : 4;
  return (
    a.x + m < b.x + b.w - m &&
    a.x + a.w - m > b.x + m &&
    a.y + m < b.y + b.h - m &&
    a.y + a.h - m > b.y + m
  );
}

/**
 * Cria a lista de trechos da rodada com postos e poças de óleo determinísticos.
 * Posto e óleo nunca ficam na mesma faixa e o posto nunca repete 3 vezes seguidas.
 * O primeiro trecho tem posto em faixa adjacente à posição inicial do carro.
 *
 * @param {{
 *   faixas?: number,
 *   quantidade?: number,
 *   embaralharLista?: <T>(lista: T[]) => T[]
 * }} [opcoes]
 * @returns {Array<{ id: string, postoFaixa: number, oleoFaixa: number, respostaId: 'posto' }>}
 */
export function montarTrechos({
  faixas = 3,
  quantidade = QUANTIDADE_DE_TRECHOS,
  embaralharLista = embaralhar,
} = {}) {
  const qtd = Number.isFinite(quantidade) ? Math.floor(quantidade) : QUANTIDADE_DE_TRECHOS;
  if (qtd <= 0) return [];

  const totalFaixas = quantidadeDeFaixas(faixas);
  const todasAsFaixas = Array.from({ length: totalFaixas }, (_, k) => k);
  const faixaInicialCarro = Math.floor((totalFaixas - 1) / 2);
  const faixasAdjacentes = todasAsFaixas.filter(f => Math.abs(f - faixaInicialCarro) === 1);

  const trechos = [];

  for (let i = 0; i < qtd; i++) {
    let candidatosPosto = todasAsFaixas;

    if (i === 0 && faixasAdjacentes.length > 0) {
      candidatosPosto = faixasAdjacentes;
    } else if (i >= 2) {
      const p1 = trechos[i - 1].postoFaixa;
      const p2 = trechos[i - 2].postoFaixa;
      if (p1 === p2) {
        candidatosPosto = todasAsFaixas.filter(f => f !== p1);
      }
    }

    const embaralhadoPosto = embaralharLista([...candidatosPosto]);
    const postoFaixa = embaralhadoPosto[0] ?? 0;

    const candidatosOleo = todasAsFaixas.filter(f => f !== postoFaixa);
    const embaralhadoOleo = embaralharLista([...candidatosOleo]);
    const oleoFaixa = embaralhadoOleo[0] ?? (postoFaixa === 0 ? 1 : 0);

    trechos.push({
      id: `trecho-${i + 1}`,
      postoFaixa,
      oleoFaixa,
      respostaId: RESPOSTA_POSTO,
    });
  }

  return trechos;
}

/**
 * Avalia o resultado do encontro entre o carro e os itens da pista.
 * 'posto', 'oleo', 'passou' ou null enquanto o encontro ainda está ativo.
 * Posto tem prioridade se duas AABBs se sobrepuserem no mesmo frame.
 *
 * @param {{
 *   carro?: { x: number, y: number, w: number, h: number },
 *   posto?: { x: number, y: number, w: number, h: number },
 *   oleo?: { x: number, y: number, w: number, h: number },
 *   itensPassaram?: boolean
 * }} params
 * @returns {'posto' | 'oleo' | 'passou' | null}
 */
export function resultadoDoEncontro({ carro, posto, oleo, itensPassaram = false }) {
  if (!carro) return null;

  if (posto && retangulosSeSobrepoem(carro, posto)) {
    return RESPOSTA_POSTO;
  }

  if (oleo && retangulosSeSobrepoem(carro, oleo)) {
    return 'oleo';
  }

  if (itensPassaram === true) {
    return 'passou';
  }

  if (posto && oleo) {
    const fundoCarro = carro.y + carro.h;
    if (posto.y > fundoCarro && oleo.y > fundoCarro) {
      return 'passou';
    }
  }

  return null;
}

/**
 * Calcula a quantidade de segmentos preenchidos do tanque (0 a total).
 *
 * @param {number} concluidos Quantidade de trechos concluídos
 * @param {number} [total=QUANTIDADE_DE_TRECHOS] Total de trechos da rodada
 * @returns {number}
 */
export function progressoDoTanque(concluidos, total = QUANTIDADE_DE_TRECHOS) {
  const tot = (Number.isFinite(total) && total > 0) ? Math.floor(total) : QUANTIDADE_DE_TRECHOS;
  if (!Number.isFinite(concluidos) || concluidos <= 0) return 0;
  const c = Math.floor(concluidos);
  if (c >= tot) return tot;
  return c;
}
