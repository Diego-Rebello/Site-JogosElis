/**
 * jogo.js — a lógica de Palmas nas Palavras (P03), sem nada de tela.
 *
 * O que a P03 exige e está garantido aqui:
 * - a contagem depende só dos toques, nunca do tempo entre eles;
 * - limpar e o exemplo zeram os círculos;
 * - o número escolhido em "Quantos pedaços?" é comparado com a divisão
 *   cadastrada, e não com a quantidade de palmas que a criança bateu.
 */
import { embaralhar } from '../../shared/texto.js';

/** Até onde vai cada nível. O nível vem do botão de dificuldade da etapa. */
const LIMITES = {
  facil: { minimo: 2, maximo: 2, modelo: 'antes', pergunta: false },
  normal: { minimo: 1, maximo: 3, modelo: 'sob-pedido', pergunta: false },
  esperto: { minimo: 1, maximo: 4, modelo: 'sob-pedido', pergunta: true },
};

export function regrasDoNivel(nivel) {
  return LIMITES[nivel] || LIMITES.normal;
}

/**
 * As palavras de uma rodada: seis, sem repetir, dentro da faixa de sílabas do
 * nível. Se a faixa tiver menos de seis palavras, devolve as que houver.
 */
export function montarRodada(palavras, { nivel = 'normal', quantidade = 6, embaralharLista = embaralhar } = {}) {
  const { minimo, maximo } = regrasDoNivel(nivel);
  const cabem = palavras.filter(item => item.silabas.length >= minimo && item.silabas.length <= maximo);
  return embaralharLista(cabem).slice(0, Math.min(quantidade, cabem.length));
}

/**
 * A tela mantém as sílabas em caixa alta, mas a voz recebe minúsculas.
 * Sintetizadores costumam soletrar `LI` como "ele, i"; `li` é pronunciado
 * como uma sílaba inteira. O mesmo vale para encontros como `vro`.
 */
export function silabasParaFala(silabas = []) {
  return silabas.map(silaba => ({ texto: silaba.toLocaleLowerCase('pt-BR') }));
}

/**
 * As palmas de uma palavra. `limite` evita que uma sequência de toques
 * acidentais vire um número enorme na tela; não é erro, é só teto.
 */
export function criarPalmas(palavra, { limite = 8 } = {}) {
  let palmas = 0;
  let tentativas = 0;

  return {
    palavra,
    esperado: palavra.silabas.length,

    /** Uma palma. Devolve quantas já foram. */
    bater() {
      if (palmas < limite) palmas += 1;
      return palmas;
    },

    /** Zera os círculos. Não conta como tentativa. */
    limpar() {
      palmas = 0;
      return palmas;
    },

    /**
     * Confere as palmas com a divisão cadastrada.
     * `mostrarResposta` fica true na segunda tentativa: a partir daí a tela
     * demonstra a divisão e a palavra segue, sem tirar nada de ninguém.
     */
    conferir() {
      tentativas += 1;
      const certo = palmas === palavra.silabas.length;
      return {
        certo,
        palmas,
        esperado: palavra.silabas.length,
        tentativas,
        mostrarResposta: !certo && tentativas >= 2,
      };
    },

    /** "Quantos pedaços?": compara com a divisão, nunca com as palmas. */
    responderNumero(numero) {
      return { certo: Number(numero) === palavra.silabas.length, esperado: palavra.silabas.length };
    },

    estado() {
      return { palmas, tentativas, esperado: palavra.silabas.length };
    },
  };
}
