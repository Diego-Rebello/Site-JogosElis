export interface CardData {
  id: number;
  face: string;
  chavePar: string;
  tipoFace: 'figura' | 'conta' | 'resultado';
  isFlipped: boolean;
  isMatched: boolean;
}

export type ModoDasCartas = 'emojis' | 'soma' | 'multiplicacao' | 'mistas';

export interface Player {
  id: number;
  name: string;
  score: number;
}

export type GameState = 'setup' | 'playing' | 'finished';
