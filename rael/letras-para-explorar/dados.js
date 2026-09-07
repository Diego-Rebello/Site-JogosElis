import { FIGURAS } from '../../shared/catalogo-figuras.js';

export const NOMES_DAS_LETRAS = {
  A: 'á', B: 'bê', C: 'cê', D: 'dê', E: 'ê', F: 'efe', G: 'gê', H: 'agá', I: 'i',
  J: 'jota', K: 'cá', L: 'ele', M: 'eme', N: 'ene', O: 'ô', P: 'pê', Q: 'quê',
  R: 'erre', S: 'esse', T: 'tê', U: 'u', V: 'vê', W: 'dáblio', X: 'xis',
  Y: 'ípsilon', Z: 'zê',
};

/** Letras que já aparecem como associação explícita em P05. */
export const LETRAS_DO_SOM_INICIAL = ['A', 'E', 'I', 'O', 'U', 'F', 'M', 'S', 'L', 'P', 'B', 'T'];

function primeiraLetra(nome) {
  return nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').charAt(0).toUpperCase();
}

export const EXEMPLOS_POR_LETRA = Object.fromEntries(
  Object.keys(NOMES_DAS_LETRAS).map(letra => [
    letra,
    FIGURAS.filter(item => primeiraLetra(item.nome) === letra).slice(0, 2),
  ]),
);

export function nomeDaLetra(letra) {
  return NOMES_DAS_LETRAS[letra] || letra;
}
