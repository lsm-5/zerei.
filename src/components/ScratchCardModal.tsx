import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ScratchCard from './ScratchCard';
import CompletionForm from './CompletionForm';
import { ArrowLeft } from 'lucide-react';
import { useCollectionStore } from '@/contexts/CollectionStoreContext';
import { playAchievementSound } from '@/utils/sound';

interface CardData {
  id: number;
  title: string;
  image: string;
  cover?: string;
}

interface CollectionInfo {
  collectionId: number;
  subtitle: string;
  completedCount: number;
  totalCount: number;
}

interface Activity {
  id: string;
  cardTitle: string;
  timestamp: string;
  comment?: string;
}

interface ScratchCardModalProps {
  card: CardData | null;
  isOpen: boolean;
  isCardCompleted: boolean;
  onClose: () => void;
  onComplete: (cardId: number, cardTitle: string, data: { date: Date; comment: string; collectionComment: string }) => void;
  collectionInfo: CollectionInfo;
  activities: Activity[];
}

const ScratchCardModal = ({ card, isOpen, isCardCompleted, onClose, onComplete, collectionInfo, activities }: ScratchCardModalProps) => {
  const [isRevealed, setIsRevealed] = useState(isCardCompleted);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRevealed(isCardCompleted);
      setShowConfetti(false);
    }
  }, [isOpen, card, isCardCompleted]);

  if (!card) return null;

  const handleReveal = () => {
    setIsRevealed(true);
    setShowConfetti(true);
    playAchievementSound();
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const handleSave = (data: { date: Date; comment: string; collectionComment: string }) => {
    onComplete(card.id, card.title, data);
    onClose();
  };

  const isLastCard = !isCardCompleted && collectionInfo.completedCount + 1 === collectionInfo.totalCount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0">
        {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen md:min-h-[70vh]">
          <div className="flex items-center justify-center bg-muted/40">
            <ScratchCard 
              card={card} 
              onReveal={handleReveal} 
              scratchable={!isCardCompleted} 
              isCompleted={isCardCompleted} 
            />
          </div>
          <div className="p-8 flex flex-col">
            <div className="flex-grow overflow-y-auto pr-4">
              {isRevealed ? (
                <div>
                  <CompletionForm 
                    title={card.title} 
                    subtitle={collectionInfo.subtitle}
                    completedCount={collectionInfo.completedCount + (isCardCompleted ? 0 : 1)}
                    totalCount={collectionInfo.totalCount}
                    onSave={handleSave}
                    isLastCard={isLastCard}
                  />
                </div>
              ) : (
                <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full p-8 border-2 border-dashed rounded-lg">
                  <p className="font-semibold">Raspe o card ao lado para revelar a imagem.</p>
                  <ArrowLeft className="w-8 h-8 mt-4 animate-pulse" />
                  <p className="mt-4">Depois, você poderá adicionar seus comentários.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScratchCardModal;