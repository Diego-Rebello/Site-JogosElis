import { embaralhar } from '../../shared/texto.js';
import { EXEMPLOS_POR_LETRA, LETRAS_DO_SOM_INICIAL, NOMES_DAS_LETRAS } from './dados.js';

export function limparConjunto(letras) {
  const validas = Object.keys(NOMES_DAS_LETRAS);
  return [...new Set((letras || []).map(letra => String(letra).toUpperCase()))]
    .filter(letra => validas.includes(letra));
}

export function montarRodadaLetras(letras, {
  modo = 'iguais', quantidade = 6, alternativas = 3, embaralharLista = embaralhar,
} = {}) {
  let conjunto = limparConjunto(letras);
  const temFigura = letra => LETRAS_DO_SOM_INICIAL.includes(letra) && EXEMPLOS_POR_LETRA[letra]?.length;
  let candidatas = modo === 'inicio' ? conjunto.filter(temFigura) : conjunto;
  if (modo === 'inicio' && !candidatas.length) {
    // O adulto deixou só letras sem figura: usa as letras com figura para não ficar sem rodada.
    candidatas = LETRAS_DO_SOM_INICIAL.filter(temFigura);
    conjunto = [...new Set([...conjunto, ...candidatas])];
  }
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
