
import React from 'react';
import { SquareValue } from '../types';
import { PLAYER_X } from '../constants';

interface SquareProps {
  value: SquareValue;
  onClick: () => void;
  isWinning: boolean;
  /** Posição 0–8, usada no rótulo para leitores de tela. */
  index: number;
}

const LINHAS = ['de cima', 'do meio', 'de baixo'];
const COLUNAS = ['à esquerda', 'no centro', 'à direita'];

const Square: React.FC<SquareProps> = ({ value, onClick, isWinning, index }) => {
  // Em telas estreitas (< ~375 px) as casas encolhem junto com a largura da tela.
  const baseClasses = "w-[min(6rem,24vw)] h-[min(6rem,24vw)] md:w-28 md:h-28 flex items-center justify-center rounded-xl transition-all duration-300 transform";
  const stateClasses = isWinning 
    ? "bg-yellow-300 scale-110"
    : "bg-white hover:bg-pink-50 shadow-md hover:shadow-lg cursor-pointer";

  const animation = value ? 'animate-jump-in' : '';
  const color = value === PLAYER_X ? 'text-sky-600' : 'text-rose-500';

  const rotulo = `Casa ${LINHAS[Math.floor(index / 3)]} ${COLUNAS[index % 3]}: ${value ?? 'vazia'}`;

  return (
    <button onClick={onClick} className={`${baseClasses} ${stateClasses}`} aria-label={rotulo}>
      {value && (
        <span aria-hidden="true" className={`text-5xl sm:text-6xl md:text-7xl font-bold ${animation} ${color}`}>
          {value}
        </span>
      )}
    </button>
  );
};

export default Square;
