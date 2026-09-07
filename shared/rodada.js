/**
 * rodada.js — o motor das rodadas curtas de Primeiras Descobertas
 * (Jogos do Rael): sortear os desafios, contar as tentativas e decidir a hora
 * de demonstrar a resposta.
 *
 * Serve para toda atividade do tipo "ouça/veja a pista e toque na alternativa
 * certa" — P01, P04, P05, P06, P08, P10 e P11. As que não são de alternativa
 * (P02, P03, P09) usam só o pedaço de persistência, em descobertas.js.
 *
 * Regras da seção 6.0 que estão codificadas aqui:
 * - o alvo não se repete dentro da mesma rodada;
 * - só uma alternativa é a certa;
 * - depois de duas tentativas a resposta é demonstrada e a rodada segue;
 * - errar não tira ponto nem vida: a rodada sempre termina.
 */
import { embaralhar } from './texto.js';

/** @typedef {{ id: string }} Item */
/** @typedef {{ alvo: Item, opcoes: Item[] }} Desafio */

/**
 * Monta os desafios de uma rodada.
 *
 * @param {object} config
 * @param {Item[]} config.itens         de onde saem alvos e distratores
 * @param {number} [config.quantidade]  quantos desafios (5 a 8 nesta etapa)
 * @param {number} [config.alternativas] quantas opções por desafio (2, 3 ou 4)
 * @param {(lista: any[]) => any[]} [config.embaralharLista] injetável nos testes
 * @returns {Desafio[]}
 */
export function montarDesafios({ itens = [], quantidade = 5, alternativas = 3, embaralharLista = embaralhar } = {}) {
  const disponiveis = itens.filter(item => item && item.id !== undefined);
  const porOpcao = Math.max(2, Math.min(alternativas, disponiveis.length));
  if (disponiveis.length < 2) return [];

  const alvos = embaralharLista(disponiveis).slice(0, Math.max(0, Math.min(quantidade, disponiveis.length)));

  return alvos.map(alvo => {
    const outros = embaralharLista(disponiveis.filter(item => item.id !== alvo.id));
    const opcoes = embaralharLista([alvo, ...outros.slice(0, porOpcao - 1)]);
    return { alvo, opcoes };
  });
}

/**
 * A rodada em si. Nasce na fase 'pergunta' do primeiro desafio.
 *
 * Fases: 'pergunta' (esperando o toque), 'acertou', 'demonstrando'
 * (mostrando a resposta depois de duas tentativas) e 'fim'.
 */
export function criarSessao({ desafios = [], tentativasAteDemonstrar = 2 } = {}) {
  let indice = 0;
  let tentativas = 0;
  let fase = desafios.length ? 'pergunta' : 'fim';
  let semAjuda = 0;
  let comAjuda = 0;

  function estado() {
    return {
      indice,
      numero: Math.min(indice + 1, desafios.length),
      total: desafios.length,
      desafio: desafios[indice] || null,
      tentativas,
      fase,
    };
  }

  return {
    estado,

    /**
     * Registra o toque numa alternativa.
     * @returns {{ certo: boolean, fase: string, tentativas: number, ultimo: boolean }}
     */
    responder(idEscolhido) {
      if (fase !== 'pergunta') return { ...estado(), certo: fase === 'acertou', ultimo: indice >= desafios.length - 1 };
      const desafio = desafios[indice];
      const idCerto = desafio?.respostaId ?? desafio?.alvo?.id;
      const certo = Boolean(desafio) && String(idEscolhido) === String(idCerto);
      tentativas += 1;

      if (certo) {
        fase = 'acertou';
        if (tentativas === 1) semAjuda += 1;
        else comAjuda += 1;
      } else if (tentativas >= tentativasAteDemonstrar) {
        fase = 'demonstrando';
        comAjuda += 1;
      }

      return { certo, fase, tentativas, ultimo: indice >= desafios.length - 1 };
    },

    /** Vai para o próximo desafio, ou para o fim da rodada. */
    avancar() {
      if (fase === 'fim') return estado();
      if (indice >= desafios.length - 1) {
        fase = 'fim';
      } else {
        indice += 1;
        tentativas = 0;
        fase = 'pergunta';
      }
      return estado();
    },

    /** Recomeça a mesma rodada do zero (o botão "de novo"). */
    reiniciar() {
      indice = 0;
      tentativas = 0;
      semAjuda = 0;
      comAjuda = 0;
      fase = desafios.length ? 'pergunta' : 'fim';
      return estado();
    },

    /**
     * O que contar no fim. Serve para a comemoração e para o adulto observar,
     * nunca para pontuar a criança.
     */
    resumo() {
      return {
        total: desafios.length,
        semAjuda,
        comAjuda,
        concluida: fase === 'fim',
      };
    },
  };
}
