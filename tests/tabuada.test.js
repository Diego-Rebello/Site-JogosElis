import { describe, expect, it } from 'vitest';
import { gerarOpcoes, gerarQuestao, TABUADAS, TODAS } from '../Games/tabuada/jogo.js';

describe('Tabuada Relâmpago', () => {
  it.each(TABUADAS)('gera 1.000 questões dentro da tabuada %i', tabuada => {
    let ultimaChave = '';
    for (let i = 0; i < 1_000; i++) {
      const modo = i % 2 ? 'multiplicacao' : 'divisao';
      const q = gerarQuestao(tabuada, modo, { ultimaChave });
      expect(q.tabuada).toBe(tabuada);
      expect(q.fator).toBeGreaterThanOrEqual(1);
      expect(q.fator).toBeLessThanOrEqual(10);
      expect(q.numero1 * (modo === 'divisao' ? 1 : q.numero2)).toBe(modo === 'divisao' ? tabuada * q.fator : q.resposta);
      expect(q.resposta).toBe(modo === 'divisao' ? q.numero1 / q.numero2 : q.numero1 * q.numero2);
      expect(q.chave).not.toBe(ultimaChave);
      ultimaChave = q.chave;
    }
  });

  it('sorteia todas as tabuadas e sempre inclui a resposta nas opções', () => {
    const vistas = new Set();
    for (let i = 0; i < 1_000; i++) {
      const q = gerarQuestao(TODAS);
      vistas.add(q.tabuada);
      const opcoes = gerarOpcoes(q.resposta);
      expect(opcoes).toHaveLength(3);
      expect(opcoes).toContain(q.resposta);
    }
    expect([...vistas].sort((a,b)=>a-b)).toEqual(TABUADAS);
  });
});
