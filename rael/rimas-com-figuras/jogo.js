import { FIGURAS, figura } from '../../shared/catalogo-figuras.js';
import { embaralhar } from '../../shared/texto.js';
import { GRUPOS_RIMA } from './dados.js';

const GRUPO_POR_FIGURA = new Map(Object.entries(GRUPOS_RIMA)
  .flatMap(([grupo, ids]) => ids.map(id => [id, grupo])));

/** Monta seis desafios sem repetir a figura-alvo na mesma rodada. */
export function montarRodadaRimas(questoes, {
  quantidade = 6, alternativas = 3, embaralharLista = embaralhar,
} = {}) {
  const escolhidas = [];
  const alvos = new Set();
  for (const questao of embaralharLista(questoes)) {
    if (alvos.has(questao.alvoId)) continue;
    alvos.add(questao.alvoId);
    escolhidas.push(questao);
    if (escolhidas.length >= quantidade) break;
  }

  return escolhidas.map(questao => {
    const alvo = figura(questao.alvoId);
    const resposta = figura(questao.respostaId);
    const distratores = embaralharLista(FIGURAS.filter(item =>
      item.id !== questao.alvoId
      && item.id !== questao.respostaId
      && GRUPO_POR_FIGURA.get(item.id) !== questao.grupoRima));
    const opcoes = embaralharLista([resposta, ...distratores.slice(0, alternativas - 1)]);
    return { ...questao, alvo, opcoes };
  }).filter(desafio => desafio.alvo && desafio.opcoes.length === alternativas);
}

export function rimam(idA, idB) {
  const grupo = GRUPO_POR_FIGURA.get(idA);
  return Boolean(grupo) && grupo === GRUPO_POR_FIGURA.get(idB);
}
