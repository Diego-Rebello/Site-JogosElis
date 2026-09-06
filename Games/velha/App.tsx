
import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, Player, SquareValue, Vitoria } from './types';
import GameBoard from './components/GameBoard';
import GameStatus from './components/GameStatus';
import ModeSelector from './components/ModeSelector';
import { PLAYER_X, PLAYER_O } from './constants';
import { aplicarJogada, findBestMove } from './lib/logica';
import Cabecalho from './components/Cabecalho';
import { tocar } from '../../shared/sons.js';
import { lancarConfete } from '../../shared/confete.js';

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

    tocar('clique');
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

  // Som e confete do fim de partida, em um lugar só: tanto a jogada da criança
  // quanto a do computador podem encerrar o jogo.
  useEffect(() => {
    if (winner) {
      // Contra o computador, quem ganha com O é a máquina: aí não tem festa.
      const criancaPerdeu = gameMode === GameMode.PVC && winner.player === PLAYER_O;
      if (criancaPerdeu) {
        tocar('erro');
      } else {
        tocar('vitoria');
        lancarConfete();
      }
    } else if (isDraw) {
      tocar('acerto');
    }
  }, [winner, isDraw, gameMode]);
  
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
    tocar('clique');
    setBoard(Array(9).fill(null));
    setCurrentPlayer(PLAYER_X);
    setWinner(null);
    setIsDraw(false);
  };
  
  const changeMode = () => {
    resetGame();
    setGameMode(null);
  };

  const escolherModo = (modo: GameMode) => {
    tocar('clique');
    setGameMode(modo);
  };

  return (
    <div className="fundo-jogos flex min-h-dvh flex-col text-center text-slate-800">
      <Cabecalho titulo="Jogo da Velha Divertido" />

      <div className="flex flex-1 flex-col items-center justify-center p-4">
      <main className="bg-white/70 backdrop-blur-sm p-6 rounded-3xl shadow-2xl w-full max-w-md">
        {gameMode === null ? (
          <ModeSelector onSelectMode={escolherModo} />
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
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-full text-xl shadow-lg transform hover:scale-105 transition-transform duration-200"
              >
                Jogar de Novo
              </button>
              <button 
                onClick={changeMode}
                className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full text-xl shadow-lg transform hover:scale-105 transition-transform duration-200"
              >
                Mudar Modo
              </button>
            </div>
          </>
        )}
      </main>
      <footer className="mt-8 text-slate-600">
        Criado com diversão para os pequenos!
      </footer>
      </div>
    </div>
  );
};

export default App;
