import React, { useState } from 'react';
import ScratchCard from './ScratchCard';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface CardData {
  id: number;
  title: string;
  image: string;
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
    <div className="flex w-full items-center justify-center gap-4">
      <Button onClick={handlePrev} variant="outline" size="icon" className="shrink-0">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="relative h-[450px] w-full max-w-xs flex items-center justify-center">
        {cards.map((card, index) => {
          const position = (index - activeIndex + cards.length) % cards.length;
          
          if (position >= 4) return null;

          const isFrontCard = position === 0;
          const originalIndex = getCardOriginalIndex(card.id);

          return (
            <div
              key={card.id}
              className="absolute w-64 transition-all duration-500 ease-in-out"
              style={{
                transform: `translateX(${position * 15}px) scale(${1 - position * 0.08})`,
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
                isCompleted={completedCards.has(card.id)}
              />
            </div>
          );
        })}
      </div>
      <Button onClick={handleNext} variant="outline" size="icon" className="shrink-0">
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CardStack;