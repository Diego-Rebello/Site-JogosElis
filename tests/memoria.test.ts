import { describe, expect, it } from 'vitest';
import { calcularEstrelas, gerarCartas, gerarCartasDeContas } from '../Games/memoria/lib/logica';
import { nomesDosTemas } from '../Games/memoria/lib/temas';

describe('Jogo da Memória', () => {
  it.each(nomesDosTemas)('gera pares distintos no tema %s', (tema) => {
    for (const quantidade of [16, 24, 32]) {
      const cartas = gerarCartas(quantidade, tema);
      const contagens = new Map<string, number>();
      cartas.forEach(carta => contagens.set(carta.chavePar, (contagens.get(carta.chavePar) ?? 0) + 1));
      expect(cartas).toHaveLength(quantidade);
      expect(contagens.size).toBe(quantidade / 2);
      expect([...contagens.values()].every(total => total === 2)).toBe(true);
    }
  });

  it.each(['soma', 'multiplicacao', 'mistas'] as const)('gera contas com resultados únicos no modo %s', modo => {
    for (const quantidade of [16, 24, 32]) {
      const cartas = gerarCartasDeContas(quantidade, modo);
      const grupos = new Map<string, typeof cartas>();
      cartas.forEach(carta => grupos.set(carta.chavePar, [...(grupos.get(carta.chavePar) || []), carta]));
      expect(cartas).toHaveLength(quantidade);
      expect(grupos.size).toBe(quantidade / 2);
      expect([...grupos.values()].every(par => (
        par.length === 2
        && par.some(carta => carta.tipoFace === 'conta')
        && par.some(carta => carta.tipoFace === 'resultado')
      ))).toBe(true);
      const resultados = cartas.filter(carta => carta.tipoFace === 'resultado').map(carta => carta.face);
      expect(new Set(resultados).size).toBe(quantidade / 2);
    }
  });

  it('calcula 3, 2 e 1 estrelas nas faixas definidas', () => {
    expect(calcularEstrelas(12, 8)).toBe(3);
    expect(calcularEstrelas(20, 8)).toBe(2);
    expect(calcularEstrelas(21, 8)).toBe(1);
  });
});
