import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Activity {
  id: string;
  cardTitle: string;
  timestamp: string;
  comment?: string;
}

interface CardCommentsProps {
  comments: Activity[];
}

const CardComments = ({ comments }: CardCommentsProps) => {
  if (!comments || comments.length === 0) {
    return (
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">Nenhum comentário ainda. Seja o primeiro!</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="font-semibold mb-3 text-lg">Comentários da Comunidade</h4>
      <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-foreground italic">
                "{comment.comment}"
              </p>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true, locale: ptBR })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardComments;