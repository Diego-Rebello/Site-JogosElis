/**
 * jogo.js — o motor da Ortografia Divertida (J01), sem nenhum DOM.
 *
 * O motor é genérico: recebe o id de um pacote de dados.js (ou 'misturado')
 * e devolve a rodada pronta. Quem desenha na tela é o tela.js.
 */
import { embaralhar } from '../../shared/texto.js';
import { niveis, pacotes } from './dados.js';

export { niveis, pacotes };

export const ITENS_POR_RODADA = 10;

/** Id do pacote que mistura todas as regras. */
export const MISTURADO = 'misturado';

/** Os pacotes na ordem dos níveis, para montar a tela de escolha. */
export function listarPacotes() {
  return niveis.flatMap(nivel => nivel.pacotes.map(id => pacotes[id]));
}

/** Devolve o pacote pedido; erro claro se o id não existir. */
export function obterPacote(id) {
  const pacote = pacotes[id];
  if (!pacote) throw new Error(`Pacote desconhecido: ${id}`);
  return pacote;
}

/** Um id de pacote válido (cai no padrão se vier lixo do localStorage). */
export function normalizarPacote(id, padrao = 'g-j') {
  if (id === MISTURADO) return MISTURADO;
  return pacotes[id] ? id : padrao;
}

/**
 * Item pronto para a tela: além do dado cru, carrega de qual pacote veio,
 * quais opções mostrar e a regra a explicar. No modo misturado cada item
 * traz a sua própria regra, que é o que muda de uma pergunta para a outra.
 */
function prepararItem(item, pacote) {
  return {
    ...item,
    pacoteId: pacote.id,
    nomeDoPacote: pacote.nome,
    opcoes: pacote.opcoes,
    regra: pacote.regra,
  };
}

/** Todos os itens que podem cair no pacote pedido. */
export function itensDe(pacoteId) {
  const escolhidos = pacoteId === MISTURADO ? Object.values(pacotes) : [obterPacote(pacoteId)];
  return escolhidos.flatMap(pacote => pacote.itens.map(item => prepararItem(item, pacote)));
}

/**
 * Monta uma rodada sem repetir palavra. A mesma palavra aparece em mais de um
 * pacote (CORAÇÃO treina R e Ç), e no misturado ela poderia sair duas vezes.
 */
export function montarRodada(pacoteId, tamanho = ITENS_POR_RODADA, sortear = embaralhar) {
  const rodada = [];
  const usadas = new Set();
  for (const item of sortear(itensDe(pacoteId))) {
    if (usadas.has(item.palavra)) continue;
    usadas.add(item.palavra);
    rodada.push(item);
    if (rodada.length >= tamanho) break;
  }
  return rodada;
}

/** true se a opção tocada completa a palavra. */
export function conferir(item, opcao) {
  return String(opcao) === item.resposta;
}

/**
 * Quebra a palavra em três pedaços para a tela destacar a letra da lacuna
 * sem precisar montar HTML na mão: { antes, letra, depois }.
 */
export function partesDaPalavra(item) {
  const posicao = item.texto.indexOf('_');
  return {
    antes: item.texto.slice(0, posicao),
    letra: item.resposta,
    depois: item.texto.slice(posicao + 1),
  };
}

/** A palavra completa, montada a partir do texto com lacuna. */
export function preencher(item, opcao = item.resposta) {
  return item.texto.replace('_', opcao);
}

/**
 * Confere a coerência de um item. Devolve a lista de problemas (vazia quando
 * está tudo certo). Usada pelo teste e chamada na abertura da página, para um
 * dado errado aparecer na hora em vez de no meio da rodada.
 */
export function conferirItem(item, pacote) {
  const problemas = [];
  const lacunas = (item.texto.match(/_/g) || []).length;
  if (lacunas !== 1) problemas.push(`"${item.texto}" tem ${lacunas} lacunas (precisa ser 1)`);
  if (!pacote.opcoes.includes(item.resposta)) {
    problemas.push(`resposta "${item.resposta}" de ${item.palavra} não está nas opções do pacote`);
  }
  if (preencher(item) !== item.palavra) {
    problemas.push(`"${item.texto}" preenchido com "${item.resposta}" dá ${preencher(item)}, não ${item.palavra}`);
  }
  if (item.palavra.includes('_')) problemas.push(`${item.palavra} ainda tem lacuna`);
  const outras = pacote.opcoes.filter(opcao => opcao !== item.resposta);
  if (outras.some(opcao => preencher(item, opcao) === item.palavra)) {
    problemas.push(`${item.palavra} pode ser formada por mais de uma opção`);
  }
  return problemas;
}

/** Confere a base inteira de uma vez. */
export function conferirDados() {
  return Object.values(pacotes).flatMap(pacote =>
    pacote.itens.flatMap(item => conferirItem(item, pacote)));
}
