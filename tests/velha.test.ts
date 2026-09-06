import { describe, expect, it } from 'vitest';
import { PLAYER_O, PLAYER_X } from '../Games/velha/constants';
import { checkWinner, findBestMove, melhorJogadaMinimax, WINNING_COMBINATIONS } from '../Games/velha/lib/logica';
import type { Player, SquareValue } from '../Games/velha/types';

const outro = (jogador: Player): Player => jogador === PLAYER_X ? PLAYER_O : PLAYER_X;

describe('Jogo da Velha', () => {
  it('encontra as oito linhas vencedoras', () => {
    for (const linha of WINNING_COMBINATIONS) {
      const tabuleiro: SquareValue[] = Array(9).fill(null);
      linha.forEach(indice => { tabuleiro[indice] = PLAYER_X; });
      expect(checkWinner(tabuleiro)).toEqual({ player: PLAYER_X, line: linha });
    }
  });

  it('o nível Fácil vence quando há uma jogada vencedora', () => {
    expect(findBestMove([PLAYER_O, PLAYER_O, null, PLAYER_X, null, PLAYER_X, null, null, null])).toBe(2);
    expect(findBestMove([PLAYER_X, null, null, PLAYER_O, PLAYER_X, null, PLAYER_O, null, null], PLAYER_X)).toBe(8);
  });

  it('o minimax não perde 200 partidas contra jogadas aleatórias', () => {
    for (let partida = 0; partida < 200; partida++) {
      const ia: Player = partida % 2 === 0 ? PLAYER_X : PLAYER_O;
      let vez: Player = Math.floor(partida / 2) % 2 === 0 ? PLAYER_X : PLAYER_O;
      const tabuleiro: SquareValue[] = Array(9).fill(null);

      while (!checkWinner(tabuleiro) && tabuleiro.some(casa => casa === null)) {
        const indice = vez === ia
          ? melhorJogadaMinimax(tabuleiro, ia)
          : (() => {
              const livres = tabuleiro.map((casa, i) => casa === null ? i : -1).filter(i => i >= 0);
              return livres[Math.floor(Math.random() * livres.length)];
            })();
        tabuleiro[indice] = vez;
        vez = outro(vez);
      }
      expect(checkWinner(tabuleiro)?.player).not.toBe(outro(ia));
    }
  });
});
