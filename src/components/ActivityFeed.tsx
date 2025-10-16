import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Activity {
  id: string;
  cardTitle: string;
  timestamp: string;
  comment?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
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
          {activities.map((activity, index) => (
            <li 
              key={activity.id} 
              className="flex items-start space-x-4 opacity-0 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${activity.id}`} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">Você</span> completou o card{' '}
                  <span className="font-semibold">{activity.cardTitle}</span>.
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
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;