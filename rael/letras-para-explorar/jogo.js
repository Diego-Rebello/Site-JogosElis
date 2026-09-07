import { embaralhar } from '../../shared/texto.js';
import { EXEMPLOS_POR_LETRA, LETRAS_DO_SOM_INICIAL, NOMES_DAS_LETRAS } from './dados.js';

export const MODOS_LETRAS = ['iguais', 'ouvir', 'inicio'];

export function limparConjunto(letras) {
  const validas = Object.keys(NOMES_DAS_LETRAS);
  return [...new Set((letras || []).map(letra => String(letra).toUpperCase()))]
    .filter(letra => validas.includes(letra));
}

export function montarRodadaLetras(letras, {
  modo = 'iguais', quantidade = 6, alternativas = 3, embaralharLista = embaralhar,
} = {}) {
  const conjunto = limparConjunto(letras);
  const candidatas = modo === 'inicio'
    ? conjunto.filter(letra => LETRAS_DO_SOM_INICIAL.includes(letra) && EXEMPLOS_POR_LETRA[letra]?.length)
    : conjunto;
  const escolhidas = embaralharLista(candidatas).slice(0, Math.min(quantidade, candidatas.length));
  const quantidadeDeOpcoes = Math.min(alternativas, conjunto.length);

  return escolhidas.map(letra => {
    const distratores = embaralharLista(conjunto.filter(outra => outra !== letra));
    const palavra = modo === 'inicio' ? embaralharLista(EXEMPLOS_POR_LETRA[letra])[0] : null;
    return {
      id: `${modo}-${letra}`,
      alvo: { id: letra, letra, palavra },
      respostaId: letra,
      opcoes: embaralharLista([letra, ...distratores.slice(0, quantidadeDeOpcoes - 1)])
        .map(id => ({ id, letra: id })),
      mostrarModelo: modo === 'iguais',
    };
  });
}
