import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CardData {
  id: number;
  title: string;
  cover?: string;
}

interface CollectionCardListItemProps {
  card: CardData;
  number: number;
  isCompleted: boolean;
  onClick: () => void;
  completionDate: Date | null;
}

const CollectionCardListItem = ({ card, number, isCompleted, onClick, completionDate }: CollectionCardListItemProps) => {
  return (
    <Card 
      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <img 
          src={card.cover} 
          alt={card.title} 
          className="w-16 h-24 object-cover rounded-md shadow-sm"
        />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Card #{number}</p>
          <h4 className="font-semibold text-lg">{card.title}</h4>
          {isCompleted && completionDate && (
            <p className="text-xs text-muted-foreground mt-1">
              Concluído em {format(completionDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-600">Completo</span>
            </>
          ) : (
            <>
              <Circle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Pendente</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CollectionCardListItem;