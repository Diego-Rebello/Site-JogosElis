
import React from 'react';
import { GameMode } from '../types';

interface ModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8">
      <h3 className="text-3xl font-bold text-slate-700 mb-4">Como você quer jogar?</h3>
      <button
        onClick={() => onSelectMode(GameMode.PVC)}
        className="w-full max-w-xs bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-6 rounded-full text-2xl shadow-lg transform hover:scale-105 transition-transform duration-200"
      >
        Contra o Computador
      </button>
      <button
        onClick={() => onSelectMode(GameMode.PVP)}
        className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-full text-2xl shadow-lg transform hover:scale-105 transition-transform duration-200"
      >
        Com um Amigo
      </button>
    </div>
  );
};

export default ModeSelector;
