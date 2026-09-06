
import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, Player, SquareValue, Vitoria } from './types';
import GameBoard from './components/GameBoard';
import GameStatus from './components/GameStatus';
import ModeSelector from './components/ModeSelector';
import { PLAYER_X, PLAYER_O } from './constants';
import { aplicarJogada, findBestMove } from './lib/logica';

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [board, setBoard] = useState<SquareValue[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>(PLAYER_X);
  const [winner, setWinner] = useState<Vitoria | null>(null);
  const [isDraw, setIsDraw] = useState<boolean>(false);

  const handleSquareClick = useCallback((index: number) => {
    if (board[index] || winner || isDraw) {
      return;
    }
    
    // Prevent player from clicking during computer's turn
    if (gameMode === GameMode.PVC && currentPlayer === PLAYER_O) {
      return;
    }

    const resultado = aplicarJogada(board, index, currentPlayer);
    setBoard(resultado.tabuleiro);

    if (resultado.vencedor) {
      setWinner(resultado.vencedor);
    } else if (resultado.empate) {
      setIsDraw(true);
    } else {
      setCurrentPlayer(currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X);
    }
  }, [board, winner, isDraw, gameMode, currentPlayer]);
  
  useEffect(() => {
    if (gameMode === GameMode.PVC && currentPlayer === PLAYER_O && !winner && !isDraw) {
      const timer = setTimeout(() => {
        const bestMove = findBestMove(board);
        if (bestMove === -1) return;

        const resultado = aplicarJogada(board, bestMove, PLAYER_O);
        setBoard(resultado.tabuleiro);

        if (resultado.vencedor) {
          setWinner(resultado.vencedor);
        } else if (resultado.empate) {
          setIsDraw(true);
        } else {
          setCurrentPlayer(PLAYER_X);
        }
      }, 700); // Add a small delay for a more natural feel
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode, winner, isDraw, board]);


  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer(PLAYER_X);
    setWinner(null);
    setIsDraw(false);
  };
  
  const changeMode = () => {
    resetGame();
    setGameMode(null);
  };

  return (
    <div className="min-h-screen bg-sky-200 flex flex-col items-center justify-center p-4 text-center text-slate-800">
      <header className="mb-6">
        <h1 className="text-5xl md:text-7xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          Jogo da Velha
        </h1>
        <h2 className="text-2xl md:text-3xl text-amber-300 font-bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
          Divertido
        </h2>
      </header>

      <main className="bg-white/70 backdrop-blur-sm p-6 rounded-3xl shadow-2xl w-full max-w-md">
        {gameMode === null ? (
          <ModeSelector onSelectMode={setGameMode} />
        ) : (
          <>
            <GameStatus winner={winner} currentPlayer={currentPlayer} isDraw={isDraw} />
            <GameBoard 
              board={board} 
              onSquareClick={handleSquareClick} 
              winningLine={winner?.line}
              isGameOver={!!winner || isDraw}
            />
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={resetGame}
                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full text-xl shadow-lg transform hover:scale-105 transition-transform duration-200"
              >
                Jogar de Novo
              </button>
              <button 
                onClick={changeMode}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full text-xl shadow-lg transform hover:scale-105 transition-transform duration-200"
              >
                Mudar Modo
              </button>
            </div>
          </>
        )}
      </main>
       <footer className="mt-8 text-white/80">
        Criado com diversão para os pequenos!
      </footer>
    </div>
  );
};

export default App;
