import { embaralhar } from '../../shared/texto.js';

export function palavrasDoNivel(palavras, { nivel = 'normal', primeiraRodada = false } = {}) {
  if (primeiraRodada || nivel === 'facil') return palavras.filter(item => item.tipo === 'vogal');
  if (nivel === 'esperto') return [...palavras];
  return palavras.filter(item => item.tipo !== 'oclusiva');
}

/**
 * A pista é uma palavra; a resposta é outra palavra com o mesmo som. Todos os
 * distratores vêm de grupos diferentes, portanto há exatamente uma resposta.
 */
export function montarRodadaSons(palavras, {
  quantidade = 6, alternativas = 3, nivel = 'normal', primeiraRodada = false,
  embaralharLista = embaralhar,
} = {}) {
  const bolsa = palavrasDoNivel(palavras, { nivel, primeiraRodada });
  const alvos = embaralharLista(bolsa.filter(item =>
    bolsa.some(outro => outro.id !== item.id && outro.som === item.som)))
    .slice(0, Math.min(quantidade, bolsa.length));

  return alvos.map(alvo => {
    const resposta = embaralharLista(bolsa.filter(item => item.id !== alvo.id && item.som === alvo.som))[0];
    const distratores = embaralharLista(bolsa.filter(item => item.som !== alvo.som));
    return {
      id: `${alvo.id}-${resposta.id}`,
      alvo,
      respostaId: resposta.id,
      opcoes: embaralharLista([resposta, ...distratores.slice(0, alternativas - 1)]),
    };
  });
}
