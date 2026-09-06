import { beforeEach, describe, expect, it } from 'vitest';
import { calcularEstrelas, obterProgresso, registrarPartida, zerarProgresso } from '../shared/progresso.js';

function criarArmazenamento() {
  const dados = new Map();
  return {
    getItem: chave => dados.get(chave) ?? null,
    setItem: (chave, valor) => dados.set(chave, valor),
    removeItem: chave => dados.delete(chave),
  };
}

describe('Progresso', () => {
  let armazenamento;
  beforeEach(() => { armazenamento = criarArmazenamento(); });

  it('calcula 3, 2 e 1 estrelas nas faixas corretas', () => {
    expect(calcularEstrelas(9, 1)).toBe(3);
    expect(calcularEstrelas(7, 3)).toBe(2);
    expect(calcularEstrelas(6, 4)).toBe(1);
  });

  it('acumula partidas usando armazenamento injetado', () => {
    registrarPartida('forca', { acertos: 1, erros: 2, estrelas: 2 }, armazenamento);
    registrarPartida('forca', { acertos: 1, erros: 0, estrelas: 3 }, armazenamento);
    expect(obterProgresso(armazenamento).forca).toMatchObject({
      partidas: 2, acertos: 2, erros: 2, melhorEstrelas: 3,
    });
  });

  it('zera todo o progresso', () => {
    registrarPartida('memoria', { acertos: 1 }, armazenamento);
    expect(zerarProgresso(armazenamento)).toBe(true);
    expect(obterProgresso(armazenamento)).toEqual({});
  });
});
