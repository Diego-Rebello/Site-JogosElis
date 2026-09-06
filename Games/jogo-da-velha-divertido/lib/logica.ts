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

export const findBestMove = (currentBoard: SquareValue[]): number => {
  // 1. Prioridade Máxima: Vencer o jogo
  // A IA verifica se pode vencer na próxima jogada.
  for (let i = 0; i < 9; i++) {
    if (currentBoard[i] === null) {
      const tempBoard = [...currentBoard];
      tempBoard[i] = PLAYER_O;
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
        tempBoard[i] = PLAYER_X;
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
