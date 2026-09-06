import { PLAYER_O, PLAYER_X } from '../constants';
import type { Player, SquareValue, Vitoria } from '../types';

export const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const checkWinner = (currentBoard: SquareValue[]): Vitoria | null => {
  for (const combinacao of WINNING_COMBINATIONS) {
    const [a, b, c] = combinacao;
    const valor = currentBoard[a];
    if (valor && valor === currentBoard[b] && valor === currentBoard[c]) {
      return { player: valor, line: combinacao };
    }
  }
  return null;
};

/**
 * Coloca a jogada no tabuleiro e já devolve o resultado dela.
 * Não altera o tabuleiro recebido: sempre devolve uma cópia nova.
 */
export function aplicarJogada(
  tabuleiro: SquareValue[],
  indice: number,
  jogador: Player,
): { tabuleiro: SquareValue[]; vencedor: Vitoria | null; empate: boolean } {
  const novoTabuleiro = [...tabuleiro];
  novoTabuleiro[indice] = jogador;
  const vencedor = checkWinner(novoTabuleiro);
  const empate = vencedor === null && novoTabuleiro.every(casa => casa !== null);
  return { tabuleiro: novoTabuleiro, vencedor, empate };
}

export const findBestMove = (currentBoard: SquareValue[], jogador: Player = PLAYER_O): number => {
  const adversario = jogador === PLAYER_X ? PLAYER_O : PLAYER_X;
  // 1. Prioridade Máxima: Vencer o jogo
  // A IA verifica se pode vencer na próxima jogada.
  for (let i = 0; i < 9; i++) {
    if (currentBoard[i] === null) {
      const tempBoard = [...currentBoard];
      tempBoard[i] = jogador;
      if (checkWinner(tempBoard)) {
        return i;
      }
    }
  }

  // 2. Chance de Bloquear: Não ser um oponente impossível
  // A IA tem uma chance de ~65% de bloquear o jogador, para que a criança possa ganhar às vezes.
  const shouldBlock = Math.random() > 0.35;
  if (shouldBlock) {
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        const tempBoard = [...currentBoard];
        tempBoard[i] = adversario;
        if (checkWinner(tempBoard)) {
          return i;
        }
      }
    }
  }

  // 3. Movimento Aleatório: Tornar o jogo imprevisível
  // Se não houver chance de vencer ou bloquear, a IA faz uma jogada aleatória.
  // Isso remove estratégias avançadas como sempre pegar o centro ou os cantos.
  const availableSquares = currentBoard
    .map((val, idx) => (val === null ? idx : -1))
    .filter((idx) => idx !== -1);

  if (availableSquares.length > 0) {
    return availableSquares[Math.floor(Math.random() * availableSquares.length)];
  }

  return -1; // Fallback, não deve ser alcançado em um jogo normal.
};

/**
 * Escolhe uma jogada perfeita para `jogador`. A função é pura: não altera o
 * tabuleiro e não depende de DOM, temporizadores ou números aleatórios.
 */
export function melhorJogadaMinimax(tabuleiro: SquareValue[], jogador: Player): number {
  const adversario = jogador === PLAYER_X ? PLAYER_O : PLAYER_X;
  const memoria = new Map<string, number>();

  function avaliar(estado: SquareValue[], vez: Player, profundidade: number): number {
    const vencedor = checkWinner(estado)?.player;
    if (vencedor === jogador) return 10 - profundidade;
    if (vencedor === adversario) return profundidade - 10;
    if (estado.every(casa => casa !== null)) return 0;

    const chave = `${estado.map(casa => casa ?? '-').join('')}:${vez}`;
    const lembrada = memoria.get(chave);
    if (lembrada !== undefined) return lembrada;

    const pontuacoes: number[] = [];
    for (let indice = 0; indice < estado.length; indice++) {
      if (estado[indice] !== null) continue;
      const proximo = [...estado];
      proximo[indice] = vez;
      pontuacoes.push(avaliar(proximo, vez === PLAYER_X ? PLAYER_O : PLAYER_X, profundidade + 1));
    }
    const pontuacao = vez === jogador ? Math.max(...pontuacoes) : Math.min(...pontuacoes);
    memoria.set(chave, pontuacao);
    return pontuacao;
  }

  let melhorIndice = -1;
  let melhorPontuacao = -Infinity;
  for (let indice = 0; indice < tabuleiro.length; indice++) {
    if (tabuleiro[indice] !== null) continue;
    const proximo = [...tabuleiro];
    proximo[indice] = jogador;
    const pontuacao = avaliar(proximo, adversario, 0);
    if (pontuacao > melhorPontuacao) {
      melhorPontuacao = pontuacao;
      melhorIndice = indice;
    }
  }
  return melhorIndice;
}
