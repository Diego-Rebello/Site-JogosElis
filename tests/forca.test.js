import { describe, expect, it } from 'vitest';
import { letrasDaPalavra, palavraFoiDescoberta, revelarPalavra } from '../Games/forca/jogo.js';

describe('Forca', () => {
  it('revela letras sem diferenciar acentos', () => {
    expect(revelarPalavra('CORAÇÃO', ['a', 'o'])).toEqual(['_', 'O', '_', 'A', '_', 'Ã', 'O']);
  });

  it('trata Ç como C', () => {
    expect(revelarPalavra('MAÇÃ', ['m', 'a', 'c'])).toEqual(['M', 'A', 'Ç', 'Ã']);
    expect([...letrasDaPalavra('MAÇÃ')].sort()).toEqual(['A', 'C', 'M']);
  });

  it('detecta vitória quando todas as letras foram tentadas', () => {
    expect(palavraFoiDescoberta('LEÃO', ['l', 'e', 'a', 'o'])).toBe(true);
    expect(palavraFoiDescoberta('LEÃO', ['l', 'e', 'a'])).toBe(false);
  });
});
