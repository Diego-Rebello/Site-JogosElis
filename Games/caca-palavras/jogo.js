import { normalizar } from '../../shared/texto.js';

export const dificuldades = Object.freeze({
  facil: { nome: 'Fácil', tamanho: 8, diagonais: false, invertidas: false },
  medio: { nome: 'Médio', tamanho: 10, diagonais: true, invertidas: false },
  dificil: { nome: 'Desafio', tamanho: 12, diagonais: true, invertidas: true },
});

const DIRECOES = Object.freeze({
  direita: [0, 1], baixo: [1, 0], diagonalBaixoDireita: [1, 1], diagonalBaixoEsquerda: [1, -1],
  esquerda: [0, -1], cima: [-1, 0], diagonalCimaEsquerda: [-1, -1], diagonalCimaDireita: [-1, 1],
});

const sortear = (lista, aleatorio) => lista[Math.floor(aleatorio() * lista.length)];
const embaralhar = (lista, aleatorio) => {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

export function palavraDaGrade(palavra) {
  return normalizar(palavra).replace(/[^A-Z]/g, '');
}

/** Escolhe sem repetição apenas palavras que cabem no tamanho atual. */
export function escolherPalavras(palavras, tamanho, quantidade = 8, aleatorio = Math.random) {
  const candidatas = palavras.filter(item => palavraDaGrade(typeof item === 'string' ? item : item[0]).length <= tamanho);
  if (candidatas.length < quantidade) throw new RangeError(`Só há ${candidatas.length} palavras que cabem na grade ${tamanho}×${tamanho}.`);
  return embaralhar(candidatas, aleatorio).slice(0, quantidade);
}

function direcoesPermitidas(opcoes) {
  const lista = [DIRECOES.direita, DIRECOES.baixo];
  if (opcoes.diagonais) lista.push(DIRECOES.diagonalBaixoDireita, DIRECOES.diagonalBaixoEsquerda);
  if (opcoes.invertidas) lista.push(DIRECOES.esquerda, DIRECOES.cima, DIRECOES.diagonalCimaEsquerda, DIRECOES.diagonalCimaDireita);
  return lista;
}

function tentarColocar(grade, palavra, direcoes, aleatorio) {
  const tamanho = grade.length;
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    const [dl, dc] = sortear(direcoes, aleatorio);
    const linha = Math.floor(aleatorio() * tamanho);
    const coluna = Math.floor(aleatorio() * tamanho);
    const fimL = linha + dl * (palavra.length - 1), fimC = coluna + dc * (palavra.length - 1);
    if (fimL < 0 || fimC < 0 || fimL >= tamanho || fimC >= tamanho) continue;
    const celulas = [...palavra].map((letra, i) => ({ linha: linha + dl * i, coluna: coluna + dc * i, letra }));
    if (!celulas.every(c => grade[c.linha][c.coluna] === '' || grade[c.linha][c.coluna] === c.letra)) continue;
    celulas.forEach(c => { grade[c.linha][c.coluna] = c.letra; });
    return { inicio: { linha, coluna }, fim: { linha: fimL, coluna: fimC }, celulas };
  }
  return null;
}

/** Gera a grade e devolve as coordenadas usadas, úteis para validar e pintar. */
export function gerarGrade(palavras, tamanho, opcoes = {}) {
  const aleatorio = opcoes.aleatorio || Math.random;
  const limpas = palavras.map(p => typeof p === 'string' ? p : p.palavra).map(palavraDaGrade);
  if (!Number.isInteger(tamanho) || tamanho < 2) throw new RangeError('Tamanho de grade inválido.');
  if (limpas.some(p => !p || p.length > tamanho)) throw new RangeError('Há uma palavra que não cabe na grade.');
  const direcoes = direcoesPermitidas(opcoes);

  for (let reinicio = 0; reinicio < 100; reinicio++) {
    const grade = Array.from({ length: tamanho }, () => Array(tamanho).fill(''));
    const colocacoes = [];
    let falhou = false;
    for (const palavra of [...limpas].sort((a,b)=>b.length-a.length)) {
      const colocacao = tentarColocar(grade, palavra, direcoes, aleatorio);
      if (!colocacao) { falhou = true; break; }
      colocacoes.push({ palavra, ...colocacao });
    }
    if (falhou) continue;
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (const linha of grade) for (let c=0;c<tamanho;c++) if (!linha[c]) linha[c]=sortear(letras,aleatorio);
    return { grade, colocacoes, palavras: limpas };
  }
  throw new Error('Não foi possível montar a grade depois de várias tentativas.');
}

export function caminhoEntre(inicio, fim) {
  const dl = fim.linha - inicio.linha, dc = fim.coluna - inicio.coluna;
  if (!(dl === 0 || dc === 0 || Math.abs(dl) === Math.abs(dc))) return [];
  const passos = Math.max(Math.abs(dl), Math.abs(dc));
  const pl = Math.sign(dl), pc = Math.sign(dc);
  return Array.from({length: passos + 1}, (_,i)=>({linha: inicio.linha + pl*i, coluna: inicio.coluna + pc*i}));
}

export function lerCaminho(grade, caminho) {
  return caminho.map(({linha,coluna})=>grade[linha]?.[coluna] ?? '').join('');
}

export function localizarPalavra(grade, palavra) {
  const alvo = palavraDaGrade(palavra), tamanho = grade.length;
  for(let l=0;l<tamanho;l++) for(let c=0;c<tamanho;c++) for(const [dl,dc] of Object.values(DIRECOES)){
    const caminho=Array.from({length:alvo.length},(_,i)=>({linha:l+dl*i,coluna:c+dc*i}));
    if(caminho.every(p=>p.linha>=0&&p.coluna>=0&&p.linha<tamanho&&p.coluna<tamanho) && lerCaminho(grade,caminho)===alvo) return caminho;
  }
  return null;
}
