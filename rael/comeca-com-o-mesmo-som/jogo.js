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
  const porSom = bolsa.reduce((grupos, item) => {
    if (!grupos.has(item.som)) grupos.set(item.som, []);
    grupos.get(item.som).push(item);
    return grupos;
  }, new Map());
  const grupos = embaralharLista([...porSom.entries()]
    .filter(([, itens]) => itens.length > 1))
    .map(([som, itens]) => ({
      som,
      alvos: embaralharLista(itens).map(alvo => ({
        alvo,
        resposta: embaralharLista(itens.filter(item => item.id !== alvo.id))[0],
      })),
    }));

  // Espalha os sons pela rodada antes de repetir um grupo. Assim, seis
  // perguntas não ficam presas nas mesmas duas ou três letras.
  const pares = [];
  while (pares.length < quantidade && grupos.some(grupo => grupo.alvos.length)) {
    for (const grupo of grupos) {
      const par = grupo.alvos.shift();
      if (par) pares.push(par);
      if (pares.length === quantidade) break;
    }
  }

  // A posição correta também é balanceada: numa rodada de seis com três
  // opções, cada coluna recebe exatamente duas respostas.
  const posicoesCorretas = embaralharLista(Array.from(
    { length: pares.length },
    (_, indice) => indice % alternativas,
  ));

  return pares.map(({ alvo, resposta }, indice) => {
    const sonsDistratores = embaralharLista([...porSom.keys()].filter(som => som !== alvo.som));
    const distratores = sonsDistratores
      .slice(0, alternativas - 1)
      .map(som => embaralharLista(porSom.get(som))[0]);
    if (distratores.length < alternativas - 1) {
      const idsUsados = new Set(distratores.map(item => item.id));
      const reserva = embaralharLista(bolsa.filter(item =>
        item.som !== alvo.som && !idsUsados.has(item.id)));
      distratores.push(...reserva.slice(0, alternativas - 1 - distratores.length));
    }
    const opcoes = [...distratores];
    opcoes.splice(posicoesCorretas[indice], 0, resposta);
    return {
      id: `${alvo.id}-${resposta.id}`,
      alvo,
      respostaId: resposta.id,
      opcoes,
    };
  });
}
