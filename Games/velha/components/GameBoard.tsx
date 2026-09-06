
import React from 'react';
import { SquareValue } from '../types';
import Square from './Square';

interface GameBoardProps {
  board: SquareValue[];
  onSquareClick: (index: number) => void;
  winningLine?: number[] | null;
  isGameOver: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onSquareClick, winningLine, isGameOver }) => {
  return (
    <div className={`grid grid-cols-3 gap-3 md:gap-4 p-3 md:p-4 bg-sky-100 rounded-2xl shadow-inner ${isGameOver ? 'pointer-events-none' : ''}`}>
      {board.map((value, index) => {
        const isWinningSquare = winningLine?.includes(index) ?? false;
        return (
          <Square
            key={index}
            value={value}
            onClick={() => onSquareClick(index)}
            isWinning={isWinningSquare}
          />
        );
      })}
    </div>
  );
};

export default GameBoard;
