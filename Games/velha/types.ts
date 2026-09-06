
import { PLAYER_X, PLAYER_O } from './constants';

export type Player = typeof PLAYER_X | typeof PLAYER_O;

export type SquareValue = Player | null;

export interface Vitoria {
  player: Player;
  line: number[];
}

export enum GameMode {
  PVP = 'PVP',
  PVC = 'PVC',
}

export type NivelComputador = 'facil' | 'dificil';

export interface ConfiguracaoPartida {
  modo: GameMode;
  simboloHumano: Player;
  primeiroJogador: Player;
  nivel: NivelComputador;
  nomes: Record<Player, string>;
}

export interface PlacarDaSessao {
  X: number;
  O: number;
  empates: number;
}
