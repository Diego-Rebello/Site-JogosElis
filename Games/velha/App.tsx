import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ConfiguracaoPartida, GameMode, PlacarDaSessao, Player, SquareValue, Vitoria } from './types';
import GameBoard from './components/GameBoard';
import GameStatus from './components/GameStatus';
import ModeSelector from './components/ModeSelector';
import { PLAYER_X, PLAYER_O } from './constants';
import { aplicarJogada, findBestMove, melhorJogadaMinimax } from './lib/logica';
import Cabecalho from './components/Cabecalho';
import { tocar } from '../../shared/sons.js';
import { lancarConfete } from '../../shared/confete.js';
import { obterConfiguracoes, registrarPartida } from '../../shared/progresso.js';

const preferencias = obterConfiguracoes();
const modoPadrao = preferencias.niveis.velha === GameMode.PVP ? GameMode.PVP : GameMode.PVC;
const outro = (jogador: Player): Player => jogador === PLAYER_X ? PLAYER_O : PLAYER_X;
const placarVazio = (): PlacarDaSessao => ({ X: 0, O: 0, empates: 0 });

const App: React.FC = () => {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoPartida | null>(null);
  const [board, setBoard] = useState<SquareValue[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>(PLAYER_X);
  const [proximoInicio, setProximoInicio] = useState<Player>(PLAYER_O);
  const [winner, setWinner] = useState<Vitoria | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [placar, setPlacar] = useState<PlacarDaSessao>(placarVazio);
  const partidaRegistradaRef = useRef(false);

  const computador = configuracao?.modo === GameMode.PVC ? outro(configuracao.simboloHumano) : null;

  const handleSquareClick = useCallback((index: number) => {
    if (!configuracao || board[index] || winner || isDraw || computador === currentPlayer) return;
    tocar('clique');
    const resultado = aplicarJogada(board, index, currentPlayer);
    setBoard(resultado.tabuleiro);
    if (resultado.vencedor) setWinner(resultado.vencedor);
    else if (resultado.empate) setIsDraw(true);
    else setCurrentPlayer(outro(currentPlayer));
  }, [board, computador, configuracao, currentPlayer, isDraw, winner]);

  useEffect(() => {
    if ((!winner && !isDraw) || !configuracao || partidaRegistradaRef.current) return;
    partidaRegistradaRef.current = true;
    if (winner) setPlacar(atual => ({ ...atual, [winner.player]: atual[winner.player] + 1 }));
    else setPlacar(atual => ({ ...atual, empates: atual.empates + 1 }));

    const criancaVenceu = Boolean(winner && (configuracao.modo === GameMode.PVP || winner.player === configuracao.simboloHumano));
    const criancaPerdeu = Boolean(winner && configuracao.modo === GameMode.PVC && winner.player === computador);
    if (criancaPerdeu) tocar('erro');
    else if (winner) { tocar('vitoria'); lancarConfete(); }
    else tocar('acerto');

    registrarPartida('velha', {
      acertos: criancaVenceu ? 1 : 0,
      erros: criancaPerdeu ? 1 : 0,
      estrelas: criancaVenceu ? 3 : isDraw ? 2 : 1,
    });
  }, [computador, configuracao, isDraw, winner]);

  useEffect(() => {
    if (!configuracao || !computador || computador !== currentPlayer || winner || isDraw) return;
    const timer = window.setTimeout(() => {
      const indice = configuracao.nivel === 'dificil'
        ? melhorJogadaMinimax(board, computador)
        : findBestMove(board, computador);
      if (indice === -1) return;
      const resultado = aplicarJogada(board, indice, computador);
      setBoard(resultado.tabuleiro);
      if (resultado.vencedor) setWinner(resultado.vencedor);
      else if (resultado.empate) setIsDraw(true);
      else setCurrentPlayer(outro(computador));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [board, computador, configuracao, currentPlayer, isDraw, winner]);

  const limparTabuleiro = (inicio: Player) => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer(inicio);
    setWinner(null);
    setIsDraw(false);
    partidaRegistradaRef.current = false;
  };

  const iniciar = (novaConfiguracao: ConfiguracaoPartida) => {
    tocar('clique');
    setConfiguracao(novaConfiguracao);
    limparTabuleiro(novaConfiguracao.primeiroJogador);
    setProximoInicio(outro(novaConfiguracao.primeiroJogador));
  };

  const novaPartida = () => {
    tocar('clique');
    limparTabuleiro(proximoInicio);
    setProximoInicio(outro(proximoInicio));
  };

  const mudarModo = () => {
    tocar('clique');
    setConfiguracao(null);
    limparTabuleiro(PLAYER_X);
  };

  return (
    <div className="fundo-jogos flex min-h-dvh flex-col text-center text-slate-800">
      <Cabecalho titulo="Jogo da Velha Divertido" />
      <div className="flex flex-1 flex-col items-center justify-center p-3 sm:p-4">
        <main className="w-full max-w-md rounded-3xl bg-white/80 p-4 shadow-2xl backdrop-blur-sm sm:p-6">
          {!configuracao ? (
            <ModeSelector modoPadrao={modoPadrao} nomeCrianca={preferencias.nomeCrianca} onStart={iniciar} />
          ) : (
            <>
              <section className="mb-2 rounded-2xl bg-white p-3 shadow" aria-label="Placar da sessão">
                <div className="grid grid-cols-3 gap-2 text-sm sm:text-base">
                  <span><strong className="text-sky-700">X</strong>: {placar.X}</span>
                  <span><strong className="text-rose-600">O</strong>: {placar.O}</span>
                  <span><strong>Empates</strong>: {placar.empates}</span>
                </div>
                <button onClick={() => { tocar('clique'); setPlacar(placarVazio()); }} className="mt-2 min-h-11 rounded-full bg-slate-200 px-4 font-bold text-slate-700 hover:bg-slate-300">Zerar placar</button>
              </section>
              <GameStatus winner={winner} currentPlayer={currentPlayer} isDraw={isDraw} nomes={configuracao.nomes} />
              <GameBoard board={board} onSquareClick={handleSquareClick} winningLine={winner?.line} isGameOver={!!winner || isDraw} />
              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                <button onClick={novaPartida} className="min-h-12 w-full rounded-full bg-emerald-600 px-5 py-3 text-lg font-bold text-white shadow-lg hover:bg-emerald-700 sm:w-auto">Nova partida</button>
                <button onClick={mudarModo} className="min-h-12 w-full rounded-full bg-pink-600 px-5 py-3 text-lg font-bold text-white shadow-lg hover:bg-pink-700 sm:w-auto">Mudar modo</button>
              </div>
            </>
          )}
        </main>
        <footer className="mt-6 text-slate-600">Criado com diversão para os pequenos!</footer>
      </div>
    </div>
  );
};

export default App;
