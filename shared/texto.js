/**
 * texto.js — funções de texto e sorteio usadas por mais de um jogo.
 * Módulo ES: importe com `import { normalizar } from '../../shared/texto.js'`.
 */

/**
 * Tira acentos e cedilha e deixa tudo em maiúsculas.
 * "coração" vira "CORACAO"; serve para comparar o que a criança digitou
 * sem exigir que ela acerte a acentuação.
 */
export function normalizar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

/**
 * Fisher-Yates: devolve uma cópia embaralhada em que toda ordem tem a
 * mesma chance de sair. (O velho `sort(() => Math.random() - 0.5)` é
 * enviesado e não deve ser usado.)
 */
export function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Sorteia um item. Passando `evitar`, tenta não repetir o item anterior
 * (só repete se a lista tiver um único item).
 */
export function sortear(lista, evitar) {
  if (lista.length === 0) return undefined;
  if (lista.length === 1) return lista[0];
  let escolhido;
  do {
    escolhido = lista[Math.floor(Math.random() * lista.length)];
  } while (evitar !== undefined && escolhido === evitar);
  return escolhido;
}

/** Sorteia `n` itens diferentes, na ordem embaralhada. */
export function sortearVarios(lista, n) {
  return embaralhar(lista).slice(0, Math.max(0, Math.min(n, lista.length)));
}
