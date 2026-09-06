const inteiro = (minimo, maximo) =>
  Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;

const escolher = lista => lista[inteiro(0, lista.length - 1)];

function questao(nivel, operacao, numero1, numero2, resposta) {
  const simbolos = { soma: '+', subtracao: '−', multiplicacao: '×', divisao: '÷' };
  return {
    nivel: Number(nivel), operacao, numero1, numero2, resposta,
    simbolo: simbolos[operacao], chave: `${numero1}${simbolos[operacao]}${numero2}`,
  };
}

/** Gera uma questão sem conhecer o DOM. `operacao` também aceita "misto". */
export function gerarQuestao(nivel, operacao = 'misto') {
  const n = Number(nivel);
  const permitidas = { 1: ['soma'], 2: ['soma', 'subtracao'], 3: ['soma', 'subtracao'], 4: ['multiplicacao', 'divisao'], 5: ['soma', 'subtracao', 'multiplicacao'] }[n];
  if (!permitidas) throw new RangeError(`Nível inválido: ${nivel}`);
  const tipo = operacao === 'misto' ? escolher(permitidas) : operacao;
  if (!permitidas.includes(tipo)) throw new RangeError(`Operação ${operacao} não existe no nível ${nivel}`);

  if (n === 1) {
    const a = inteiro(1, 9), b = inteiro(1, 10 - a);
    return questao(n, tipo, a, b, a + b);
  }
  if (n === 2) {
    if (tipo === 'soma') { const a = inteiro(0, 20), b = inteiro(0, 20 - a); return questao(n, tipo, a, b, a + b); }
    const a = inteiro(0, 20), b = inteiro(0, a); return questao(n, tipo, a, b, a - b);
  }
  if (n === 3) {
    if (tipo === 'soma') { const a = inteiro(10, 90), b = inteiro(10, 100 - a); return questao(n, tipo, a, b, a + b); }
    const a = inteiro(20, 99), b = inteiro(10, a); return questao(n, tipo, a, b, a - b);
  }
  if (n === 4) {
    const a = inteiro(2, 10), b = inteiro(1, 10);
    return tipo === 'multiplicacao' ? questao(n, tipo, a, b, a * b) : questao(n, tipo, a * b, a, b);
  }
  if (tipo === 'multiplicacao') { const a = inteiro(10, 99), b = inteiro(10, 99); return questao(n, tipo, a, b, a * b); }
  if (tipo === 'soma') {
    let a, b;
    do { a = inteiro(100, 899); b = inteiro(100, 1000 - a); } while ((a % 10) + (b % 10) < 10);
    return questao(n, tipo, a, b, a + b);
  }
  let a, b;
  do { a = inteiro(101, 1000); b = inteiro(100, a); } while (a % 10 >= b % 10);
  return questao(n, tipo, a, b, a - b);
}

export function gerarOpcoes(resposta) {
  const distancia = Math.max(2, Math.ceil(Math.abs(resposta) * 0.2));
  const opcoes = new Set([resposta]);
  while (opcoes.size < 3) opcoes.add(Math.max(0, resposta + inteiro(-distancia, distancia)));
  return [...opcoes].sort(() => Math.random() - 0.5);
}
