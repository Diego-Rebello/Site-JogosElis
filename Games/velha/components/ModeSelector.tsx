import React, { useState } from 'react';
import { PLAYER_O, PLAYER_X } from '../constants';
import { ConfiguracaoPartida, GameMode, NivelComputador, Player } from '../types';

interface ModeSelectorProps {
  modoPadrao: GameMode;
  nomeCrianca: string;
  onStart: (configuracao: ConfiguracaoPartida) => void;
}

const opcao = 'min-h-12 rounded-2xl border-2 px-4 py-3 font-bold transition-colors';
const SIMBOLOS: Player[] = [PLAYER_X, PLAYER_O];

const ModeSelector: React.FC<ModeSelectorProps> = ({ modoPadrao, nomeCrianca, onStart }) => {
  const [modo, setModo] = useState<GameMode>(modoPadrao);
  const [simboloHumano, setSimboloHumano] = useState<Player>(PLAYER_X);
  const [primeiroJogador, setPrimeiroJogador] = useState<Player>(PLAYER_X);
  const [nivel, setNivel] = useState<NivelComputador>('facil');
  const [nomeJogador1, setNomeJogador1] = useState('Jogador 1');
  const [nomeJogador2, setNomeJogador2] = useState('Jogador 2');

  const nomes: Record<Player, string> = modo === GameMode.PVC
    ? {
        [simboloHumano]: nomeCrianca,
        [simboloHumano === PLAYER_X ? PLAYER_O : PLAYER_X]: 'Computador',
      } as Record<Player, string>
    : {
        [PLAYER_X]: nomeJogador1.trim() || 'Jogador 1',
        [PLAYER_O]: nomeJogador2.trim() || 'Jogador 2',
      };

  return (
    <form className="flex flex-col gap-5 text-left" onSubmit={(evento) => {
      evento.preventDefault();
      onStart({ modo, simboloHumano, primeiroJogador, nivel, nomes });
    }}>
      <h2 className="text-center text-3xl font-bold text-slate-700">Prepare a partida!</h2>

      <fieldset>
        <legend className="mb-2 text-lg font-bold text-slate-700">Como você quer jogar?</legend>
        <div className="grid grid-cols-2 gap-2">
          {[[GameMode.PVC, '🤖 Computador'], [GameMode.PVP, '🧑‍🤝‍🧑 Amigo']].map(([valor, texto]) => (
            <button key={valor} type="button" onClick={() => setModo(valor as GameMode)}
              className={`${opcao} ${modo === valor ? 'border-pink-500 bg-pink-100 text-pink-800' : 'border-slate-200 bg-white text-slate-700'}`}>
              {texto}
            </button>
          ))}
        </div>
      </fieldset>

      {modo === GameMode.PVC ? (
        <>
          <fieldset>
            <legend className="mb-2 text-lg font-bold text-slate-700">Qual é o seu símbolo?</legend>
            <div className="grid grid-cols-2 gap-2">
              {SIMBOLOS.map(simbolo => (
                <button key={simbolo} type="button" onClick={() => setSimboloHumano(simbolo)}
                  className={`${opcao} text-2xl ${simboloHumano === simbolo ? 'border-sky-500 bg-sky-100 text-sky-800' : 'border-slate-200 bg-white text-slate-700'}`}>
                  {simbolo}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-lg font-bold text-slate-700">Nível do computador</legend>
            <div className="grid grid-cols-2 gap-2">
              {([['facil', 'Fácil'], ['dificil', 'Difícil']] as const).map(([valor, texto]) => (
                <button key={valor} type="button" onClick={() => setNivel(valor)}
                  className={`${opcao} ${nivel === valor ? 'border-emerald-500 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-700'}`}>
                  {texto}
                </button>
              ))}
            </div>
          </fieldset>
        </>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="font-bold text-slate-700">Nome de X
            <input className="mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 px-3 text-lg" value={nomeJogador1}
              maxLength={24} onChange={evento => setNomeJogador1(evento.target.value)} />
          </label>
          <label className="font-bold text-slate-700">Nome de O
            <input className="mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 px-3 text-lg" value={nomeJogador2}
              maxLength={24} onChange={evento => setNomeJogador2(evento.target.value)} />
          </label>
        </div>
      )}

      <fieldset>
        <legend className="mb-2 text-lg font-bold text-slate-700">Quem começa?</legend>
        <div className="grid grid-cols-2 gap-2">
          {SIMBOLOS.map(simbolo => (
            <button key={simbolo} type="button" onClick={() => setPrimeiroJogador(simbolo)}
              className={`${opcao} ${primeiroJogador === simbolo ? 'border-amber-500 bg-amber-100 text-amber-900' : 'border-slate-200 bg-white text-slate-700'}`}>
              {nomes[simbolo]} ({simbolo})
            </button>
          ))}
        </div>
        <p className="mt-2 text-base text-slate-600">Depois, quem começa alterna a cada partida.</p>
      </fieldset>

      <button type="submit" className="min-h-12 rounded-full bg-pink-600 px-6 py-3 text-xl font-bold text-white shadow-lg hover:bg-pink-700">
        Começar
      </button>
    </form>
  );
};

export default ModeSelector;
