import { describe, expect, it } from 'vitest';
import { gerarQuestao } from '../Games/matematica/jogo.js';

const operacoes = {
  1: ['soma'],
  2: ['soma', 'subtracao'],
  3: ['soma', 'subtracao'],
  4: ['multiplicacao', 'divisao'],
  5: ['soma', 'subtracao', 'multiplicacao'],
};

describe('Matemática', () => {
  for (const [nivelTexto, tipos] of Object.entries(operacoes)) {
    const nivel = Number(nivelTexto);
    it(`respeita as faixas do nível ${nivel} em 1.000 amostras`, () => {
      for (let i = 0; i < 1_000; i++) {
        const questao = gerarQuestao(nivel, 'misto');
        expect(tipos).toContain(questao.operacao);
        expect(questao.numero1).toBeGreaterThanOrEqual(0);
        expect(questao.numero2).toBeGreaterThanOrEqual(0);
        expect(questao.resposta).toBeGreaterThanOrEqual(0);
        if (nivel === 1) expect(questao.resposta).toBeLessThanOrEqual(10);
        if (nivel === 2) expect(questao.resposta).toBeLessThanOrEqual(20);
        if (nivel === 3) expect(questao.resposta).toBeLessThanOrEqual(100);
        if (nivel === 4 && questao.operacao === 'divisao') {
          expect(questao.numero1 % questao.numero2).toBe(0);
          expect(questao.resposta).toBe(questao.numero1 / questao.numero2);
        }
        if (nivel === 5 && questao.operacao !== 'multiplicacao') expect(questao.resposta).toBeLessThanOrEqual(1_000);
      }
    });
  }
});
