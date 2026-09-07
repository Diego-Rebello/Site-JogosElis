import { existsSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { figura } from '../shared/catalogo-figuras.js';
import { PALAVRAS_SOM, SONS_INICIAIS } from '../rael/comeca-com-o-mesmo-som/dados.js';
import { montarRodadaSons, palavrasDoNivel } from '../rael/comeca-com-o-mesmo-som/jogo.js';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const semEmbaralhar = lista => [...lista];

describe('Começa com o Mesmo Som (P05)', () => {
  it('tem trinta palavras com figuras e áudios locais', () => {
    expect(PALAVRAS_SOM).toHaveLength(30);
    expect(new Set(PALAVRAS_SOM.map(item => item.id)).size).toBe(30);
    PALAVRAS_SOM.forEach(item => {
      expect(figura(item.id)).toBeTruthy();
      expect(existsSync(resolve(RAIZ, item.audio.slice(1)))).toBe(true);
      expect(existsSync(resolve(RAIZ, item.audioSom.slice(1)))).toBe(true);
    });
    expect(SONS_INICIAIS).toHaveLength(12);
    expect(readdirSync(resolve(RAIZ, 'audio/palavras')).filter(nome => nome.endsWith('.wav'))).toHaveLength(30);
    expect(readdirSync(resolve(RAIZ, 'audio/sons-iniciais')).filter(nome => nome.endsWith('.wav'))).toHaveLength(12);
  });

  it('começa só pelas vogais e reserva oclusivas para o modo esperto', () => {
    expect(palavrasDoNivel(PALAVRAS_SOM, { primeiraRodada: true }).every(item => item.tipo === 'vogal')).toBe(true);
    expect(palavrasDoNivel(PALAVRAS_SOM, { nivel: 'facil' }).every(item => item.tipo === 'vogal')).toBe(true);
    expect(palavrasDoNivel(PALAVRAS_SOM, { nivel: 'normal' }).some(item => item.tipo === 'oclusiva')).toBe(false);
    expect(palavrasDoNivel(PALAVRAS_SOM, { nivel: 'esperto' }).some(item => item.tipo === 'oclusiva')).toBe(true);
  });

  it('monta seis desafios com uma única alternativa do mesmo som', () => {
    [2, 3, 4].forEach(alternativas => {
      const rodada = montarRodadaSons(PALAVRAS_SOM, {
        alternativas, nivel: 'esperto', embaralharLista: semEmbaralhar,
      });
      expect(rodada).toHaveLength(6);
      rodada.forEach(desafio => {
        expect(desafio.opcoes).toHaveLength(alternativas);
        expect(desafio.opcoes.filter(item => item.som === desafio.alvo.som)).toHaveLength(1);
        expect(desafio.opcoes.some(item => item.id === desafio.respostaId)).toBe(true);
      });
    });
  });
});
