
import React from 'react';
import { Player } from '../types';
import { PLAYER_X } from '../constants';

interface GameStatusProps {
  winner: { player: Player; line: number[] } | null;
  currentPlayer: Player;
  isDraw: boolean;
}

const PlayerIndicator: React.FC<{player: Player}> = ({ player }) => (
    <div className="flex items-center justify-center gap-2">
        <span className={`font-bold text-4xl ${player === PLAYER_X ? 'text-sky-600' : 'text-rose-500'}`}>
            {player}
        </span>
    </div>
);


const GameStatus: React.FC<GameStatusProps> = ({ winner, currentPlayer, isDraw }) => {
  let statusMessage;

  if (winner) {
    statusMessage = (
      <div className="flex flex-col items-center gap-2">
        <span className="text-3xl font-bold text-amber-500">Venceu!</span>
        <PlayerIndicator player={winner.player} />
      </div>
    );
  } else if (isDraw) {
    statusMessage = <span className="text-3xl font-bold text-slate-600">Empate!</span>;
  } else {
    statusMessage = (
      <div className="flex flex-col items-center gap-2">
        <span className="text-xl text-slate-500">Vez de:</span>
        <PlayerIndicator player={currentPlayer} />
      </div>
    );
  }

  return (
    <div className="mb-4 h-24 flex items-center justify-center">
      {statusMessage}
    </div>
  );
};

export default GameStatus;
