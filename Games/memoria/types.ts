export interface CardData {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface Player {
  id: number;
  name: string;
  score: number;
}

export type GameState = 'setup' | 'playing' | 'finished';
