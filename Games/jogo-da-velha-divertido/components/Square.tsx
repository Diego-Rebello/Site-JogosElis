
import React from 'react';
import { SquareValue } from '../types';
import { PLAYER_X } from '../constants';

interface SquareProps {
  value: SquareValue;
  onClick: () => void;
  isWinning: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinning }) => {
  const baseClasses = "w-24 h-24 md:w-28 md:h-28 flex items-center justify-center rounded-xl transition-all duration-300 transform";
  const stateClasses = isWinning 
    ? "bg-yellow-300 scale-110"
    : "bg-white hover:bg-sky-50 shadow-md hover:shadow-lg cursor-pointer";

  const animation = value ? 'animate-jump-in' : '';
  const color = value === PLAYER_X ? 'text-sky-600' : 'text-rose-500';

  return (
    <button onClick={onClick} className={`${baseClasses} ${stateClasses}`}>
      {value && (
        <span className={`text-6xl md:text-7xl font-bold ${animation} ${color}`}>
          {value}
        </span>
      )}
       <style>{`
        @keyframes jump-in {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-jump-in { animation: jump-in 0.3s ease-out forwards; }
      `}</style>
    </button>
  );
};

export default Square;
