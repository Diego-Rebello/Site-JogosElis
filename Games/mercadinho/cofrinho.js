// Cofrinho, sonhos e preferências do Mercadinho (PLANO-MERCADINHO.md, seção 2.10).
// Funções puras: cada uma devolve um estado novo. O armazenamento é injetado, como em
// shared/progresso.js, para os testes rodarem sem navegador. Dinheiro sempre em centavos.

import { sonhos } from './dados.js';

export const CHAVE_COFRINHO = 'jogos-elis:mercadinho';
export const VERSAO_COFRINHO = 1;

const sonhoPorId = Object.fromEntries(sonhos.map(s => [s.id, s]));

function armazenamentoPadrao() {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function centavosValidos(valor) {
  return Number.isSafeInteger(valor) && valor >= 0 ? valor : 0;
}

/** Estado de quem nunca jogou. */
export function estadoInicial() {
  return {
    versao: VERSAO_COFRINHO,
    cofrinho: 0,
    sonhoAtual: null,
    sonhosRealizados: [],
    compras: 0,
    tutorialVisto: false,
    modoLista: false,
  };
}

/**
 * Lê o estado salvo. JSON inválido, versão desconhecida ou armazenamento bloqueado devolvem
 * o estado inicial; campos estragados voltam ao valor inicial um por um.
 */
export function lerCofrinho(armazenamento = armazenamentoPadrao()) {
  const inicial = estadoInicial();
  let dados;
  try {
    const bruto = armazenamento?.getItem(CHAVE_COFRINHO);
    if (!bruto) return inicial;
    dados = JSON.parse(bruto);
  } catch {
    return inicial;
  }
  if (!dados || typeof dados !== 'object' || dados.versao !== VERSAO_COFRINHO) return inicial;

  return {
    versao: VERSAO_COFRINHO,
    cofrinho: centavosValidos(dados.cofrinho),
    sonhoAtual: sonhoPorId[dados.sonhoAtual] ? dados.sonhoAtual : null,
    sonhosRealizados: Array.isArray(dados.sonhosRealizados)
      ? [...new Set(dados.sonhosRealizados.filter(id => sonhoPorId[id]))]
      : [],
    compras: centavosValidos(dados.compras),
    tutorialVisto: dados.tutorialVisto === true,
    modoLista: dados.modoLista === true,
  };
}

/** Grava o estado. Devolve false se o armazenamento estiver bloqueado ou ausente. */
export function gravarCofrinho(estado, armazenamento = armazenamentoPadrao()) {
  if (!armazenamento) return false;
  try {
    armazenamento.setItem(CHAVE_COFRINHO, JSON.stringify(estado));
    return true;
  } catch {
    return false;
  }
}

/** Troco de uma compra paga: soma no cofrinho e conta mais uma compra. */
export function depositar(estado, centavos) {
  return {
    ...estado,
    cofrinho: estado.cofrinho + centavosValidos(centavos),
    compras: estado.compras + 1,
  };
}

/** Sonhos que podem ser escolhidos agora: os que ainda não estão na estante (ou todos, se já estiverem). */
export function sonhosDisponiveis(estado) {
  const faltam = sonhos.filter(s => !estado.sonhosRealizados.includes(s.id));
  return faltam.length ? faltam : [...sonhos];
}

/** Escolhe (ou troca) o sonho atual. Trocar não mexe no dinheiro do cofrinho. */
export function escolherSonho(estado, id) {
  if (!sonhosDisponiveis(estado).some(s => s.id === id)) return estado;
  return { ...estado, sonhoAtual: id };
}

export function podeRealizar(estado) {
  const sonho = sonhoPorId[estado.sonhoAtual];
  return Boolean(sonho) && estado.cofrinho >= sonho.preco;
}

/** Desconta o preço exato, guarda o sonho na estante e deixa a escolha do próximo em aberto. */
export function realizarSonho(estado) {
  if (!podeRealizar(estado)) return estado;
  const sonho = sonhoPorId[estado.sonhoAtual];
  return {
    ...estado,
    cofrinho: estado.cofrinho - sonho.preco,
    sonhoAtual: null,
    // Depois de todos realizados os sonhos voltam a ser escolhíveis; a estante não repete.
    sonhosRealizados: estado.sonhosRealizados.includes(sonho.id)
      ? estado.sonhosRealizados
      : [...estado.sonhosRealizados, sonho.id],
  };
}

/**
 * Zera cofrinho, sonhos e compras, mantendo as preferências (tutorialVisto, modoLista).
 * Devolve false se não deu para gravar.
 */
export function zerarCofrinho(armazenamento = armazenamentoPadrao()) {
  const atual = lerCofrinho(armazenamento);
  return gravarCofrinho(
    { ...estadoInicial(), tutorialVisto: atual.tutorialVisto, modoLista: atual.modoLista },
    armazenamento,
  );
}

/** Muda uma preferência simples (tutorialVisto, modoLista). */
export function comPreferencia(estado, campo, valor) {
  if (campo !== 'tutorialVisto' && campo !== 'modoLista') return estado;
  return { ...estado, [campo]: Boolean(valor) };
}
