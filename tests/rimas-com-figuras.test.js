import { describe, expect, it } from 'vitest';
import { figura } from '../shared/catalogo-figuras.js';
import { GRUPOS_RIMA, QUESTOES_RIMA } from '../rael/rimas-com-figuras/dados.js';
import { montarRodadaRimas, rimam } from '../rael/rimas-com-figuras/jogo.js';

const semEmbaralhar = lista => [...lista];

describe('Rimas com Figuras (P04)', () => {
  it('tem vinte questões válidas, com ids distintos e figuras presentes', () => {
    expect(QUESTOES_RIMA).toHaveLength(20);
    expect(new Set(QUESTOES_RIMA.map(item => item.id)).size).toBe(20);
    QUESTOES_RIMA.forEach(item => {
      expect(figura(item.alvoId)).toBeTruthy();
      expect(figura(item.respostaId)).toBeTruthy();
      expect(GRUPOS_RIMA[item.grupoRima]).toContain(item.alvoId);
      expect(GRUPOS_RIMA[item.grupoRima]).toContain(item.respostaId);
      expect(item.alvoId).not.toBe(item.respostaId);
    });
  });

  it('monta seis alvos diferentes e respeita duas, três ou quatro opções', () => {
    [2, 3, 4].forEach(alternativas => {
      const rodada = montarRodadaRimas(QUESTOES_RIMA, { alternativas, embaralharLista: semEmbaralhar });
      expect(rodada).toHaveLength(6);
      expect(new Set(rodada.map(item => item.alvo.id)).size).toBe(6);
      rodada.forEach(item => expect(item.opcoes).toHaveLength(alternativas));
    });
  });

  it('deixa exatamente uma rima entre as alternativas', () => {
    const rodada = montarRodadaRimas(QUESTOES_RIMA, { alternativas: 4 });
    rodada.forEach(item => {
      expect(item.opcoes.filter(opcao => rimam(item.alvo.id, opcao.id))).toHaveLength(1);
      expect(item.opcoes.find(opcao => opcao.id === item.respostaId)).toBeTruthy();
    });
  });
});
