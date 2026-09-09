import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { figura } from '../shared/catalogo-figuras.js';
import { PALAVRAS_SOM, SONS_INICIAIS } from '../rael/comeca-com-o-mesmo-som/dados.js';
import { montarRodadaSons, palavrasDoNivel } from '../rael/comeca-com-o-mesmo-som/jogo.js';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const semEmbaralhar = lista => [...lista];

describe('Começa com o Mesmo Som (P05)', () => {
  it('tem quarenta e cinco palavras com figuras e áudios locais', () => {
    expect(PALAVRAS_SOM).toHaveLength(45);
    expect(new Set(PALAVRAS_SOM.map(item => item.id)).size).toBe(45);
    PALAVRAS_SOM.forEach(item => {
      expect(figura(item.id)).toBeTruthy();
      expect(existsSync(resolve(RAIZ, item.audio.slice(1)))).toBe(true);
      expect(statSync(resolve(RAIZ, item.audio.slice(1))).size).toBeGreaterThan(4096);
      expect(existsSync(resolve(RAIZ, item.audioSom.slice(1)))).toBe(true);
    });
    expect(SONS_INICIAIS).toHaveLength(12);
    expect(readdirSync(resolve(RAIZ, 'audio/palavras')).filter(nome => nome.endsWith('.wav'))).toHaveLength(45);
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

  it('distribui a resposta entre todas as posições sem privilegiar o meio', () => {
    [2, 3, 4].forEach(alternativas => {
      const rodada = montarRodadaSons(PALAVRAS_SOM, {
        alternativas, nivel: 'esperto', embaralharLista: semEmbaralhar,
      });
      const contagem = Array(alternativas).fill(0);
      rodada.forEach(desafio => {
        contagem[desafio.opcoes.findIndex(item => item.id === desafio.respostaId)] += 1;
      });
      expect(contagem.every(total => total > 0)).toBe(true);
      expect(Math.max(...contagem) - Math.min(...contagem)).toBeLessThanOrEqual(1);
    });
  });

  it('varia os sons antes de repetir o mesmo grupo na rodada', () => {
    const rodada = montarRodadaSons(PALAVRAS_SOM, {
      nivel: 'esperto', embaralharLista: semEmbaralhar,
    });
    expect(new Set(rodada.map(desafio => desafio.alvo.som)).size).toBe(rodada.length);
  });

  it('oferece mais de cento e cinquenta pares diferentes de palavras', () => {
    const pares = SONS_INICIAIS.reduce((total, som) => {
      const quantidade = PALAVRAS_SOM.filter(item => item.som === som).length;
      return total + quantidade * (quantidade - 1);
    }, 0);
    expect(pares).toBeGreaterThan(150);
  });
});
