import { normalizar } from '../../shared/texto.js';

/** Letras diferentes que precisam ser descobertas, já sem acentos ou cedilha. */
export function letrasDaPalavra(palavra) {
  return new Set([...normalizar(palavra)].filter(letra => /[A-Z]/.test(letra)));
}

/** Mostra as letras tentadas mantendo a grafia original da palavra. */
export function revelarPalavra(palavra, letrasTentadas, revelarTudo = false) {
  const tentadas = new Set([...letrasTentadas].map(normalizar));
  return [...palavra].map(letra => {
    const chave = normalizar(letra);
    if (!/[A-Z]/.test(chave)) return letra;
    return revelarTudo || tentadas.has(chave) ? letra : '_';
  });
}

/** Confere se todas as letras da palavra já foram tentadas. */
export function palavraFoiDescoberta(palavra, letrasTentadas) {
  const tentadas = new Set([...letrasTentadas].map(normalizar));
  return [...letrasDaPalavra(palavra)].every(letra => tentadas.has(letra));
}
