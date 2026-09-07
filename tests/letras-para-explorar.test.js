import { describe, expect, it } from 'vitest';
import { letrasIniciais } from '../shared/descobertas.js';
import { EXEMPLOS_POR_LETRA, LETRAS_DO_SOM_INICIAL, NOMES_DAS_LETRAS } from '../rael/letras-para-explorar/dados.js';
import { limparConjunto, montarRodadaLetras } from '../rael/letras-para-explorar/jogo.js';

const semEmbaralhar = lista => [...lista];

describe('Letras para Explorar (P06)', () => {
  it('monta o conjunto inicial com vogais, nome e letras frequentes sem repetir', () => {
    const letras = letrasIniciais('Rael');
    expect(letras).toEqual(['R', 'A', 'E', 'L', 'I', 'O', 'U', 'B', 'M', 'P', 'S']);
    letras.forEach(letra => expect(EXEMPLOS_POR_LETRA[letra]).toHaveLength(2));
  });

  it('conhece o nome das 26 letras e limpa valores inválidos', () => {
    expect(Object.keys(NOMES_DAS_LETRAS)).toHaveLength(26);
    expect(limparConjunto(['a', 'B', 'A', '?'])).toEqual(['A', 'B']);
  });

  it('monta seis pareamentos visuais com uma única letra igual', () => {
    const rodada = montarRodadaLetras(letrasIniciais('Rael'), {
      modo: 'iguais', alternativas: 3, embaralharLista: semEmbaralhar,
    });
    expect(rodada).toHaveLength(6);
    rodada.forEach(desafio => {
      expect(desafio.mostrarModelo).toBe(true);
      expect(desafio.opcoes.filter(item => item.letra === desafio.alvo.letra)).toHaveLength(1);
    });
  });

  it('no modo falado esconde o modelo e no modo inicial usa só letras vistas em P05', () => {
    const conjunto = Object.keys(NOMES_DAS_LETRAS);
    const ouvir = montarRodadaLetras(conjunto, { modo: 'ouvir', embaralharLista: semEmbaralhar });
    expect(ouvir.every(item => !item.mostrarModelo)).toBe(true);
    const inicio = montarRodadaLetras(conjunto, { modo: 'inicio', embaralharLista: semEmbaralhar });
    expect(inicio).toHaveLength(6);
    inicio.forEach(item => {
      expect(LETRAS_DO_SOM_INICIAL).toContain(item.alvo.letra);
      expect(item.alvo.palavra).toBeTruthy();
    });
  });
});
