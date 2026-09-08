import type { CardData, ModoDasCartas } from '../types';
import { temas, type NomeDoTema } from './temas';

export function embaralhar<T>(lista: readonly T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function validarQuantidade(quantidade: number): number {
  if (!Number.isInteger(quantidade) || quantidade < 2 || quantidade % 2 !== 0) {
    throw new RangeError('A quantidade de cartas precisa ser um número par.');
  }
  return quantidade / 2;
}

function gerarCartasDeEmojis(quantidade: number, tema: NomeDoTema): CardData[] {
  const quantidadeDePares = validarQuantidade(quantidade);
  const emojis = temas[tema];
  if (!emojis || quantidadeDePares > emojis.length) throw new RangeError('Tema sem emojis suficientes.');
  const escolhidos = embaralhar(emojis).slice(0, quantidadeDePares);
  return embaralhar(escolhidos.flatMap(emoji => [
    { face: emoji, chavePar: `emoji:${emoji}`, tipoFace: 'figura' as const },
    { face: emoji, chavePar: `emoji:${emoji}`, tipoFace: 'figura' as const },
  ])).map((carta, id) => ({ id, ...carta, isFlipped: false, isMatched: false }));
}

interface Conta { face: string; resultado: number; operacao: 'soma' | 'multiplicacao' }

const CONTAS_SOMA: Conta[] = [];
for (let resultado = 4; resultado <= 40; resultado += 1) {
  const minimo = Math.max(2, resultado - 20);
  const maximo = Math.min(20, Math.floor(resultado / 2));
  for (let primeiro = minimo; primeiro <= maximo; primeiro += 1) {
    CONTAS_SOMA.push({ face: `${primeiro} + ${resultado - primeiro}`, resultado, operacao: 'soma' });
  }
}

const CONTAS_MULTIPLICACAO: Conta[] = [];
for (let primeiro = 2; primeiro <= 10; primeiro += 1) {
  for (let segundo = primeiro; segundo <= 10; segundo += 1) {
    CONTAS_MULTIPLICACAO.push({ face: `${primeiro} × ${segundo}`, resultado: primeiro * segundo, operacao: 'multiplicacao' });
  }
}

function umaContaPorResultado(contas: Conta[]): Conta[] {
  const porResultado = new Map<number, Conta[]>();
  embaralhar(contas).forEach(conta => {
    const grupo = porResultado.get(conta.resultado) || [];
    grupo.push(conta);
    porResultado.set(conta.resultado, grupo);
  });
  return embaralhar([...porResultado.values()].map(grupo => embaralhar(grupo)[0]));
}

function escolherContas(quantidade: number, modo: Exclude<ModoDasCartas, 'emojis'>): Conta[] {
  const quantidadeDePares = validarQuantidade(quantidade);
  if (modo !== 'mistas') {
    const banco = modo === 'soma' ? CONTAS_SOMA : CONTAS_MULTIPLICACAO;
    const escolhidas = umaContaPorResultado(banco).slice(0, quantidadeDePares);
    if (escolhidas.length < quantidadeDePares) throw new RangeError('Não há resultados distintos suficientes.');
    return escolhidas;
  }

  const usadas = new Set<number>();
  const somas = umaContaPorResultado(CONTAS_SOMA);
  const multiplicacoes = umaContaPorResultado(CONTAS_MULTIPLICACAO);
  const escolhidas: Conta[] = [];
  const adicionar = (banco: Conta[], limite: number) => {
    for (const conta of banco) {
      if (escolhidas.length >= limite) break;
      if (usadas.has(conta.resultado)) continue;
      usadas.add(conta.resultado);
      escolhidas.push(conta);
    }
  };
  const metade = Math.ceil(quantidadeDePares / 2);
  adicionar(somas, metade);
  adicionar(multiplicacoes, quantidadeDePares);
  adicionar([...somas, ...multiplicacoes], quantidadeDePares);
  if (escolhidas.length < quantidadeDePares) throw new RangeError('Não há resultados distintos suficientes.');
  return embaralhar(escolhidas);
}

export function gerarCartasDeContas(quantidade: number, modo: Exclude<ModoDasCartas, 'emojis'> = 'mistas'): CardData[] {
  const contas = escolherContas(quantidade, modo);
  const cartas = contas.flatMap(conta => {
    const chavePar = `resultado:${conta.resultado}`;
    return [
      { face: conta.face, chavePar, tipoFace: 'conta' as const },
      { face: String(conta.resultado), chavePar, tipoFace: 'resultado' as const },
    ];
  });
  return embaralhar(cartas).map((carta, id) => ({ id, ...carta, isFlipped: false, isMatched: false }));
}

export function gerarCartas(quantidade: number, tema: NomeDoTema, modo: ModoDasCartas = 'emojis'): CardData[] {
  return modo === 'emojis'
    ? gerarCartasDeEmojis(quantidade, tema)
    : gerarCartasDeContas(quantidade, modo);
}

export function calcularEstrelas(jogadas: number, pares: number): number {
  if (jogadas <= 1.5 * pares) return 3;
  if (jogadas <= 2.5 * pares) return 2;
  return 1;
}
