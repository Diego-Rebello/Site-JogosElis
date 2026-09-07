const inteiro = (minimo, maximo, aleatorio = Math.random) =>
  Math.floor(aleatorio() * (maximo - minimo + 1)) + minimo;

export const TABUADAS = Object.freeze([2, 3, 4, 5, 6, 7, 8, 9, 10]);
export const TODAS = 'todas';

export function chaveDoFato(tabuada, fator, operacao = 'multiplicacao') {
  return `${operacao}:${tabuada}:${fator}`;
}

function escolherComPeso(valores, peso, aleatorio = Math.random) {
  const pesos = valores.map(valor => Math.max(1, Number(peso(valor)) || 1));
  const total = pesos.reduce((soma, valor) => soma + valor, 0);
  let alvo = aleatorio() * total;
  for (let i = 0; i < valores.length; i++) {
    alvo -= pesos[i];
    if (alvo < 0) return valores[i];
  }
  return valores[valores.length - 1];
}

/** Gera multiplicação ou divisão exata. Em "todas", fatos mais errados pesam mais. */
export function gerarQuestao(tabuada = TODAS, modo = 'multiplicacao', opcoes = {}) {
  const { ultimaChave = '', errosPorFato = {}, aleatorio = Math.random } = opcoes;
  if (tabuada !== TODAS && !TABUADAS.includes(Number(tabuada))) {
    throw new RangeError(`Tabuada inválida: ${tabuada}`);
  }
  if (!['multiplicacao', 'divisao'].includes(modo)) throw new RangeError(`Modo inválido: ${modo}`);

  const tabuadas = tabuada === TODAS ? TABUADAS : [Number(tabuada)];
  const candidatos = tabuadas.flatMap(base => Array.from({ length: 10 }, (_, indice) => {
    const fator = indice + 1;
    const chave = chaveDoFato(base, fator, modo);
    return { base, fator, chave };
  })).filter(fato => fato.chave !== ultimaChave);

  const fato = escolherComPeso(candidatos, candidato =>
    1 + (Number(errosPorFato[candidato.chave]) || 0) * 3, aleatorio);
  const produto = fato.base * fato.fator;
  return modo === 'divisao'
    ? { tabuada: fato.base, fator: fato.fator, operacao: modo, numero1: produto, numero2: fato.base,
        simbolo: '÷', resposta: fato.fator, chave: fato.chave, linhas: fato.base, colunas: fato.fator }
    : { tabuada: fato.base, fator: fato.fator, operacao: modo, numero1: fato.base, numero2: fato.fator,
        simbolo: '×', resposta: produto, chave: fato.chave, linhas: fato.base, colunas: fato.fator };
}

export function gerarOpcoes(resposta, aleatorio = Math.random) {
  const certas = new Set([Number(resposta)]);
  const distancia = Math.max(3, Math.ceil(Number(resposta) * 0.25));
  while (certas.size < 3) {
    const candidata = Math.max(0, Number(resposta) + inteiro(-distancia, distancia, aleatorio));
    certas.add(candidata);
  }
  return [...certas].sort(() => aleatorio() - 0.5);
}

export function idDaTabuada(tabuada) {
  return tabuada === TODAS ? TODAS : String(Number(tabuada));
}
