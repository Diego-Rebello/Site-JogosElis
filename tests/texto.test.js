import { describe, expect, it } from 'vitest';
import { embaralhar, normalizar } from '../shared/texto.js';

describe('texto', () => {
  it('normaliza acentos e cedilha', () => {
    expect(normalizar('Coração')).toBe('CORACAO');
  });

  it('embaralha sem perder ou repetir elementos', () => {
    expect(embaralhar([1, 2, 3, 4]).sort()).toEqual([1, 2, 3, 4]);
  });

  it('distribui de maneira razoável as seis permutações', () => {
    const contagens = new Map();
    for (let i = 0; i < 10_000; i++) {
      const chave = embaralhar([1, 2, 3]).join('');
      contagens.set(chave, (contagens.get(chave) ?? 0) + 1);
    }
    expect(contagens.size).toBe(6);
    for (const quantidade of contagens.values()) {
      expect(quantidade / 10_000).toBeGreaterThanOrEqual(0.12);
      expect(quantidade / 10_000).toBeLessThanOrEqual(0.21);
    }
  });
});
