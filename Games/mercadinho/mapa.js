import { produtos, desejos } from './dados.js';

export const MAPA = Object.freeze([
  '########################',
  '#LLLLLLLL..AAA...BBBB..#',
  '#......................#',
  '#H.....................#',
  '#H...PP..MM..MM..ZZ....#',
  '#H...PP..MM..M...ZZ....#',
  '#H...PP..MM......Z.....#',
  '#H...P...MM............#',
  '#H.....................#',
  '#H.....................#',
  '#H.....................#',
  '#H.....GGGGGG..GGGGGG..#',
  '#H.....................#',
  '#H......K...K...K......#',
  '#..E...................#',
  '########################',
]);

export const ALTURA = MAPA.length;
export const LARGURA = MAPA[0].length;

export const SECOES = Object.freeze({
  H: Object.freeze({ id: 'hortifruti', nome: 'Hortifrúti', emoji: '🍎' }),
  P: Object.freeze({ id: 'padaria', nome: 'Padaria e matinais', emoji: '🍞' }),
  L: Object.freeze({ id: 'laticinios', nome: 'Laticínios e frios', emoji: '🥛' }),
  M: Object.freeze({ id: 'mercearia', nome: 'Mercearia', emoji: '🍚' }),
  A: Object.freeze({ id: 'acougue', nome: 'Açougue', emoji: '🥩' }),
  B: Object.freeze({ id: 'bebidas', nome: 'Bebidas', emoji: '🥤' }),
  Z: Object.freeze({ id: 'limpeza', nome: 'Limpeza e higiene', emoji: '🧴' }),
});

const DIRECOES = Object.freeze([
  Object.freeze({ dx: 0, dy: -1 }),
  Object.freeze({ dx: 1, dy: 0 }),
  Object.freeze({ dx: 0, dy: 1 }),
  Object.freeze({ dx: -1, dy: 0 }),
]);

const produtosPorSecao = Object.fromEntries(
  Object.values(SECOES).map(secao => [
    secao.id,
    produtos.filter(produto => produto.secao === secao.id),
  ]),
);

const grade = Array.from({ length: ALTURA }, () => new Array(LARGURA));
const casasProdutos = new Map();
const casasDesejos = new Map();
const prateleiras = [];
let pontoEntrada = { x: 3, y: 14 };

const contadoresSecao = Object.fromEntries(Object.keys(SECOES).map(letra => [letra, 0]));
let indiceDesejo = 0;
let indiceCaixa = 0;

for (let y = 0; y < ALTURA; y++) {
  for (let x = 0; x < LARGURA; x++) {
    const simbolo = MAPA[y][x];
    if (simbolo === '#') {
      grade[y][x] = Object.freeze({ tipo: 'parede' });
    } else if (simbolo === '.' || simbolo === 'E') {
      if (simbolo === 'E') pontoEntrada = { x, y };
      grade[y][x] = Object.freeze({ tipo: 'piso' });
    } else if (SECOES[simbolo]) {
      const secao = SECOES[simbolo];
      const indice = contadoresSecao[simbolo]++;
      const produto = produtosPorSecao[secao.id][indice];
      if (!produto) {
        throw new Error(`Falta produto para a casa ${simbolo} (${x}, ${y}) na seção ${secao.id}.`);
      }
      grade[y][x] = Object.freeze({ tipo: 'produto', id: produto.id, secao: secao.id });
      casasProdutos.set(produto.id, Object.freeze({ x, y }));
      prateleiras.push({ x, y, letra: simbolo, secao });
    } else if (simbolo === 'G') {
      const desejo = desejos[indiceDesejo++];
      if (!desejo) {
        throw new Error(`Falta guloseima para a casa G (${x}, ${y}).`);
      }
      grade[y][x] = Object.freeze({ tipo: 'desejo', id: desejo.id });
      casasDesejos.set(desejo.id, Object.freeze({ x, y }));
    } else if (simbolo === 'K') {
      indiceCaixa += 1;
      grade[y][x] = Object.freeze({ tipo: 'caixa', id: `caixa-${indiceCaixa}` });
    } else {
      throw new Error(`Símbolo desconhecido no mapa: "${simbolo}" em (${x}, ${y}).`);
    }
  }
}

function dentro(x, y) {
  return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < LARGURA && y < ALTURA;
}

export function celulaEm(x, y) {
  if (!dentro(x, y)) return Object.freeze({ tipo: 'parede' });
  return grade[y][x];
}

export function podeAndar(x, y) {
  if (!dentro(x, y)) return false;
  const simbolo = MAPA[y][x];
  return simbolo === '.' || simbolo === 'E';
}

export function entrada() {
  return { ...pontoEntrada };
}

export function casasDe(produtoId) {
  const pos = casasProdutos.get(produtoId);
  return pos ? { ...pos } : null;
}

export function casaDoDesejo(id) {
  const pos = casasDesejos.get(id);
  return pos ? { ...pos } : null;
}

export function caminho(de, para) {
  if (!de || !para || !podeAndar(de.x, de.y) || !podeAndar(para.x, para.y)) return null;
  if (de.x === para.x && de.y === para.y) return [];

  const total = LARGURA * ALTURA;
  const pai = new Int16Array(total).fill(-1);
  const visitado = new Uint8Array(total);
  const inicio = de.y * LARGURA + de.x;
  const destino = para.y * LARGURA + para.x;
  const fila = [inicio];
  visitado[inicio] = 1;

  for (let i = 0; i < fila.length; i++) {
    const atual = fila[i];
    if (atual === destino) {
      const rota = [];
      for (let p = destino; p !== inicio; p = pai[p]) {
        rota.push({ x: p % LARGURA, y: Math.floor(p / LARGURA) });
      }
      rota.reverse();
      return rota;
    }
    const cx = atual % LARGURA;
    const cy = Math.floor(atual / LARGURA);
    for (const { dx, dy } of DIRECOES) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (!podeAndar(nx, ny)) continue;
      const proximo = ny * LARGURA + nx;
      if (visitado[proximo]) continue;
      visitado[proximo] = 1;
      pai[proximo] = atual;
      fila.push(proximo);
    }
  }
  return null;
}

export function vizinhaLivre(de, alvo) {
  if (!de || !alvo || !podeAndar(de.x, de.y)) return null;
  let melhor = null;
  let menorDistancia = Infinity;

  for (const { dx, dy } of DIRECOES) {
    const nx = alvo.x + dx;
    const ny = alvo.y + dy;
    if (!podeAndar(nx, ny)) continue;
    const rota = caminho(de, { x: nx, y: ny });
    if (rota && rota.length < menorDistancia) {
      menorDistancia = rota.length;
      melhor = { x: nx, y: ny };
    }
  }
  return melhor;
}

export function prateleirasVizinhas(posicao) {
  if (!posicao) return [];
  const resultado = [];
  for (const { dx, dy } of DIRECOES) {
    const nx = posicao.x + dx;
    const ny = posicao.y + dy;
    const celula = celulaEm(nx, ny);
    if (celula.tipo === 'produto' || celula.tipo === 'desejo' || celula.tipo === 'caixa') {
      resultado.push({ x: nx, y: ny, ...celula });
    }
  }
  return resultado;
}

export function secaoMaisProxima(posicao) {
  if (!posicao) return SECOES.H;
  let melhor = prateleiras[0].secao;
  let menorDistancia = Infinity;
  for (const p of prateleiras) {
    const d = Math.abs(p.x - posicao.x) + Math.abs(p.y - posicao.y);
    if (d < menorDistancia) {
      menorDistancia = d;
      melhor = p.secao;
    }
  }
  return melhor;
}
