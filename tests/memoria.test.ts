import { describe, expect, it } from 'vitest';
import { calcularEstrelas, gerarCartas } from '../Games/memoria/lib/logica';
import { nomesDosTemas } from '../Games/memoria/lib/temas';

describe('Jogo da Memória', () => {
  it.each(nomesDosTemas)('gera pares distintos no tema %s', (tema) => {
    for (const quantidade of [16, 24, 32]) {
      const cartas = gerarCartas(quantidade, tema);
      const contagens = new Map<string, number>();
      cartas.forEach(carta => contagens.set(carta.emoji, (contagens.get(carta.emoji) ?? 0) + 1));
      expect(cartas).toHaveLength(quantidade);
      expect(contagens.size).toBe(quantidade / 2);
      expect([...contagens.values()].every(total => total === 2)).toBe(true);
    }
  });

  it('calcula 3, 2 e 1 estrelas nas faixas definidas', () => {
    expect(calcularEstrelas(12, 8)).toBe(3);
    expect(calcularEstrelas(20, 8)).toBe(2);
    expect(calcularEstrelas(21, 8)).toBe(1);
  });
});
