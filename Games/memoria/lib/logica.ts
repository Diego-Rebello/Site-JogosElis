import type { CardData } from '../types';
import { temas, type NomeDoTema } from './temas';

export function embaralhar<T>(lista: readonly T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function gerarCartas(quantidade: number, tema: NomeDoTema): CardData[] {
  if (!Number.isInteger(quantidade) || quantidade < 2 || quantidade % 2 !== 0) {
    throw new RangeError('A quantidade de cartas precisa ser um número par.');
  }
  const quantidadeDePares = quantidade / 2;
  const emojis = temas[tema];
  if (!emojis || quantidadeDePares > emojis.length) throw new RangeError('Tema sem emojis suficientes.');
  const escolhidos = embaralhar(emojis).slice(0, quantidadeDePares);
  return embaralhar([...escolhidos, ...escolhidos]).map((emoji, id) => ({ id, emoji, isFlipped: false, isMatched: false }));
}

export function calcularEstrelas(jogadas: number, pares: number): number {
  if (jogadas <= 1.5 * pares) return 3;
  if (jogadas <= 2.5 * pares) return 2;
  return 1;
}
