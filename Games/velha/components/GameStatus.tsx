import React from 'react';
import { Player, Vitoria } from '../types';
import { PLAYER_X } from '../constants';

interface GameStatusProps {
  winner: Vitoria | null;
  currentPlayer: Player;
  isDraw: boolean;
  nomes: Record<Player, string>;
}

const PlayerIndicator: React.FC<{ player: Player }> = ({ player }) => (
  <span className={`font-bold text-4xl ${player === PLAYER_X ? 'text-sky-600' : 'text-rose-500'}`}>{player}</span>
);

const GameStatus: React.FC<GameStatusProps> = ({ winner, currentPlayer, isDraw, nomes }) => {
  let statusMessage;
  if (winner) {
    statusMessage = <div className="flex flex-col items-center gap-1"><span className="text-2xl font-bold text-amber-600">🎉 {nomes[winner.player]} venceu!</span><PlayerIndicator player={winner.player} /></div>;
  } else if (isDraw) {
    statusMessage = <span className="text-3xl font-bold text-slate-600">Deu empate!</span>;
  } else {
    statusMessage = <div className="flex items-center justify-center gap-3"><span className="text-xl text-slate-600">Vez de {nomes[currentPlayer]}:</span><PlayerIndicator player={currentPlayer} /></div>;
  }
  return <div className="mb-3 flex min-h-20 items-center justify-center" aria-live="polite">{statusMessage}</div>;
};

export default GameStatus;
