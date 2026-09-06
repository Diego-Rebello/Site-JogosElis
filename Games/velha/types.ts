
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
