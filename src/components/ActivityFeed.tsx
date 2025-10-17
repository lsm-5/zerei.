import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Activity {
  id: string;
  type: string;
  timestamp: string;
  comment?: string;
  cardId?: number;
}

interface ActivityFeedProps {
  activities: Activity[];
  collection?: any;
}

const ActivityFeed = ({ activities, collection }: ActivityFeedProps) => {
  if (!activities || activities.length === 0) {
    return (
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Nenhuma atividade ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-6">
          {activities.map((activity, index) => {
            // Get card info from the collection
            const cardInfo = collection?.cards?.find((c: any) => c.id === activity.cardId);
            const cardTitle = cardInfo?.title || 'Card desconhecido';
            
            return (
              <li 
                key={activity.id} 
                className="flex items-start space-x-4 opacity-0 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Avatar>
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">Você</span> completou o card{' '}
                    <span className="font-semibold">{cardTitle}</span>.
                  </p>
                  {activity.comment && (
                    <p className="text-sm text-muted-foreground border-l-2 pl-3 my-1.5 italic">
                      "{activity.comment}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;