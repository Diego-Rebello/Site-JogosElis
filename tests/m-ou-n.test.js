import { describe, expect, it } from 'vitest';
import { gerarLacuna, listaDePalavras } from '../Games/m-ou-n/jogo.js';

describe('M ou N', () => {
  it('gera uma lacuna válida para toda a lista', () => {
    expect(listaDePalavras.length).toBeGreaterThan(100);
    for (const palavra of listaDePalavras) {
      const lacuna = gerarLacuna(palavra);
      expect(['M', 'N']).toContain(lacuna.resposta);
      expect(lacuna.texto.replace('_', lacuna.resposta)).toBe(palavra);
    }
  });

  it.each([['MEMBRO', 'M'], ['NUNCA', 'N'], ['CAMPO', 'M']])('encontra a letra de %s', (palavra, resposta) => {
    expect(gerarLacuna(palavra).resposta).toBe(resposta);
  });
});
