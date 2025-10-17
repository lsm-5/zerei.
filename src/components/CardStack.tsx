import React, { useState } from 'react';
import ScratchCard from './ScratchCard';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';

interface CardData {
  id: number;
  title: string;
  cover?: string;
}

interface CardStackProps {
  cards: CardData[];
  onCardClick: (card: CardData) => void;
  completedCards: Set<number>;
}

const CardStack = ({ cards, onCardClick, completedCards }: CardStackProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const getCardOriginalIndex = (cardId: number) => {
    return cards.findIndex(c => c.id === cardId);
  }

  return (
    <div className="flex w-full items-center justify-center gap-2 sm:gap-4 md:gap-6">
      <Button 
        onClick={handlePrev} 
        variant="outline" 
        size="icon" 
        className="shrink-0 h-10 w-10 sm:h-12 sm:w-12 hover:scale-110 transition-transform duration-200"
      >
        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      
      <div className="relative h-[400px] sm:h-[450px] md:h-[500px] w-full max-w-xs sm:max-w-sm flex items-center justify-center">
        {cards.map((card, index) => {
          const position = (index - activeIndex + cards.length) % cards.length;
          
          if (position >= 4) return null;

          const isFrontCard = position === 0;
          const originalIndex = getCardOriginalIndex(card.id);
          const isCompleted = completedCards.has(card.id);
          const showGrayOverlay = !isFrontCard && !isCompleted;

          return (
            <div
              key={card.id}
              className="absolute w-72 transition-all duration-700 ease-out"
              style={{
                transform: `translateX(${position * 20}px) scale(${1 - position * 0.1})`,
                zIndex: cards.length - position,
                opacity: position < 3 ? 1 : 0,
                cursor: isFrontCard ? 'pointer' : 'default',
              }}
              onClick={() => isFrontCard && onCardClick(card)}
            >
              <ScratchCard 
                card={card} 
                scratchable={false} 
                number={originalIndex + 1}
                isCompleted={isCompleted}
              />
              {showGrayOverlay && (
                <div className="absolute inset-0 bg-gray-300 rounded-lg flex items-center justify-center">
                  <Lock className="h-10 w-10 text-gray-600" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
            <Button 
              onClick={handleNext} 
              variant="outline" 
              size="icon" 
              className="shrink-0 h-10 w-10 sm:h-12 sm:w-12 hover:scale-110 transition-transform duration-200"
            >
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
    </div>
  );
};

export default CardStack;