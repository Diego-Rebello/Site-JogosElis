import React, { useState, useEffect, useCallback } from 'react';
import type { CardData, Player, GameState } from './types';

// --- Game Configuration & Logic ---

const EMOJI_POOL = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🚗', '✈️', '🚀', '⛵️', '🍕', '🍔', '🍓', '🍉'];
const PAIR_COUNT = 8;
const PLAYER_COLORS = [
  'bg-indigo-500', // Player 1
  'bg-red-500',    // Player 2
  'bg-emerald-500',// Player 3
  'bg-amber-500',  // Player 4
];

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const generateCards = (): CardData[] => {
  const shuffledPool = shuffleArray(EMOJI_POOL);
  const gameEmojis = shuffledPool.slice(0, PAIR_COUNT);
  const duplicatedEmojis = shuffleArray([...gameEmojis, ...gameEmojis]);
  return duplicatedEmojis.map((emoji, index) => ({
    id: index,
    emoji: emoji,
    isFlipped: false,
    isMatched: false,
  }));
};


// --- UI Components ---

// Setup Screen Component
interface SetupScreenProps {
  onStartGame: (playerCount: number) => void;
}
const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
    <h1 className="text-5xl sm:text-6xl font-fredoka text-indigo-700 tracking-wider mb-4">
      Jogo da Memória Emoji
    </h1>
    <p className="text-gray-600 text-xl mb-12">Quantos jogadores?</p>
    <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4">
      {[1, 2, 3, 4].map(count => (
        <button
          key={count}
          onClick={() => onStartGame(count)}
          className="bg-white hover:bg-teal-100 text-indigo-600 font-fredoka text-3xl rounded-2xl shadow-lg w-32 h-32 flex items-center justify-center transition-transform transform hover:scale-110"
        >
          {count}
        </button>
      ))}
    </div>
  </div>
);

// Card Component
interface CardComponentProps {
  card: CardData;
  onClick: (id: number) => void;
  isDisabled: boolean;
}
const CardComponent: React.FC<CardComponentProps> = ({ card, onClick, isDisabled }) => {
  const { isFlipped, isMatched, id } = card;
  const handleClick = () => {
    if (!isFlipped && !isMatched && !isDisabled) onClick(id);
  };
  const cardInnerClasses = `relative w-full h-full text-center transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped || isMatched ? '[transform:rotateY(180deg)]' : ''}`;

  return (
    <div className="w-20 h-24 sm:w-24 sm:h-32 [perspective:1000px] cursor-pointer" onClick={handleClick}>
      <div className={cardInnerClasses}>
        <div className="absolute w-full h-full rounded-lg shadow-md bg-indigo-500 hover:bg-indigo-600 transition-colors flex items-center justify-center [backface-visibility:hidden]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className={`absolute w-full h-full rounded-lg shadow-md flex items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden] ${isMatched ? 'bg-emerald-200' : 'bg-white'}`}>
          <span className="text-4xl sm:text-5xl">{card.emoji}</span>
        </div>
      </div>
    </div>
  );
};

// Victory Modal Component
interface VictoryModalProps {
  players: Player[];
  onPlayAgain: () => void;
}
const VictoryModal: React.FC<VictoryModalProps> = ({ players, onPlayAgain }) => {
  const highScore = Math.max(...players.map(p => p.score));
  const winners = players.filter(p => p.score === highScore);
  const winnerMessage = winners.length > 1 ? 'É um empate!' : `${winners[0].name} Venceu!`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
      <div className="bg-white rounded-2xl p-8 text-center shadow-2xl transform transition-all scale-100 opacity-100">
        <h2 className="text-4xl font-fredoka text-yellow-500 mb-4">{winnerMessage}</h2>
        <div className="space-y-2 text-gray-700 text-lg">
          {players.map(player => (
             <p key={player.id}>{player.name}: <span className={`font-bold ${winners.some(w => w.id === player.id) ? 'text-yellow-500' : 'text-gray-600'}`}>{player.score}</span> pontos</p>
          ))}
        </div>
        <button onClick={onPlayAgain} className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
          Jogar Novamente
        </button>
      </div>
    </div>
  );
};

// Scoreboard Component
interface ScoreboardProps {
    players: Player[];
    currentPlayerId: number;
    onNameChange: (id: number, newName: string) => void;
    onNewGame: () => void;
}
const Scoreboard: React.FC<ScoreboardProps> = ({ players, currentPlayerId, onNameChange, onNewGame }) => (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-3 sm:gap-4 text-center">
            {players.map((player, index) => (
                <div key={player.id} className={`p-3 rounded-lg transition-all duration-300 ${currentPlayerId === player.id ? `${PLAYER_COLORS[index % PLAYER_COLORS.length]} text-white scale-110 shadow-lg` : 'bg-gray-200'}`}>
                    <input 
                        type="text"
                        value={player.name}
                        onChange={(e) => onNameChange(player.id, e.target.value)}
                        className={`text-sm font-bold uppercase tracking-wider text-center w-24 bg-transparent focus:outline-none ${currentPlayerId === player.id ? 'placeholder-white/70' : 'placeholder-gray-500'}`}
                        aria-label={`Nome do Jogador ${player.id}`}
                    />
                    <div className="text-2xl font-fredoka">{player.score}</div>
                </div>
            ))}
        </div>
        <button onClick={onNewGame} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-5 rounded-lg transition-transform transform hover:scale-105">
            Novo Jogo
        </button>
    </div>
);

// Game Board Component
interface GameBoardProps {
    cards: CardData[];
    flippedIds: number[];
    matchedIds: number[];
    onCardClick: (id: number) => void;
    isChecking: boolean;
}
const GameBoard: React.FC<GameBoardProps> = ({ cards, flippedIds, matchedIds, onCardClick, isChecking }) => (
    <main className="grid grid-cols-4 gap-3 sm:gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg">
      {cards.map(card => {
          const isFlipped = flippedIds.includes(card.id);
          const isMatched = matchedIds.includes(card.id);
          return <CardComponent key={card.id} card={{ ...card, isFlipped, isMatched }} onClick={onCardClick} isDisabled={isChecking} />;
      })}
    </main>
);


// --- Main App Component ---

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<number>(1);
  const [players, setPlayers] = useState<Player[]>([]);

  // Effect to check for matches when two cards are flipped
  useEffect(() => {
    if (flippedIds.length !== 2) return;

    setIsChecking(true);
    const [firstId, secondId] = flippedIds;
    const firstCard = cards.find(c => c.id === firstId);
    const secondCard = cards.find(c => c.id === secondId);

    if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
      // Match found
      setMatchedIds(prev => [...prev, firstId, secondId]);
      setPlayers(prev => prev.map(p => p.id === currentPlayerId ? { ...p, score: p.score + 1 } : p));
      setFlippedIds([]);
      setIsChecking(false);
    } else {
      // No match, switch turns
      setTimeout(() => {
        setFlippedIds([]);
        if (players.length > 1) {
            setCurrentPlayerId(prev => (prev % players.length) + 1);
        }
        setIsChecking(false);
      }, 1000);
    }
  }, [flippedIds, cards, currentPlayerId, players.length]);

  // Effect to check for game completion
  useEffect(() => {
    if (cards.length > 0 && matchedIds.length === cards.length) {
      setTimeout(() => setGameState('finished'), 500);
    }
  }, [matchedIds, cards.length]);

  const handleStartGame = (playerCount: number) => {
    const newPlayers = Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      name: `Jogador ${i + 1}`,
      score: 0,
    }));
    setPlayers(newPlayers);
    setCards(generateCards());
    setFlippedIds([]);
    setMatchedIds([]);
    setCurrentPlayerId(1);
    setIsChecking(false);
    setGameState('playing');
  };

  const handleNewGame = useCallback(() => {
    // Resets the game but keeps players and names
    setPlayers(prev => prev.map(p => ({ ...p, score: 0 })));
    setCards(generateCards());
    setFlippedIds([]);
    setMatchedIds([]);
    setCurrentPlayerId(1);
    setIsChecking(false);
    setGameState('playing');
  }, []);

  const handleCardClick = (id: number) => {
    if (isChecking || flippedIds.length >= 2 || flippedIds.includes(id) || matchedIds.includes(id)) {
      return;
    }
    setFlippedIds(prev => [...prev, id]);
  };
  
  const handleNameChange = (playerId: number, newName: string) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, name: newName } : p));
  };

  if (gameState === 'setup') {
    return <SetupScreen onStartGame={handleStartGame} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {gameState === 'finished' && <VictoryModal players={players} onPlayAgain={handleNewGame} />}
      
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-fredoka text-indigo-700 tracking-wider">
            Jogo da Memória Emoji
          </h1>
          <p className="text-gray-500 mt-1">Encontre os pares!</p>
        </header>

        <Scoreboard 
            players={players} 
            currentPlayerId={currentPlayerId}
            onNameChange={handleNameChange}
            onNewGame={handleNewGame}
        />
        
        <GameBoard
            cards={cards}
            flippedIds={flippedIds}
            matchedIds={matchedIds}
            onCardClick={handleCardClick}
            isChecking={isChecking}
        />
        
        <footer className="text-center text-gray-400 text-sm mt-8">
            Criado para crianças de 4 a 8 anos.
        </footer>
      </div>
    </div>
  );
};

export default App;
