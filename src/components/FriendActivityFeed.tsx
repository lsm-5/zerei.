import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Activity {
  id: string;
  user: {
    id: number;
    name: string;
    avatar: string;
  };
  type: string;
  data: {
    collectionTitle: string;
    cardTitle?: string;
  };
  timestamp: string;
}

interface FriendActivityFeedProps {
  activities: Activity[];
}

const FriendActivityFeed = ({ activities }: FriendActivityFeedProps) => {
  const renderActionText = (activity: Activity) => {
    switch (activity.type) {
      case 'completed_card':
        return <>completou o card <strong>{activity.data.cardTitle}</strong></>;
      case 'completed_collection':
        return <>completou a coleção <strong>{activity.data.collectionTitle}</strong></>;
      case 'acquired_collection':
        return <>adquiriu a coleção <strong>{activity.data.collectionTitle}</strong></>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade dos Amigos</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <ul className="space-y-4">
            {activities.map((activity) => (
              <li key={activity.id} className="flex items-start gap-3">
                <Link to={`/perfil/${activity.user.id}`}>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <p className="text-sm">
                    <Link to={`/perfil/${activity.user.id}`} className="font-semibold hover:underline">
                      {activity.user.name}
                    </Link>{' '}
                    {renderActionText(activity)}.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground space-y-3 py-4">
            <Users className="mx-auto h-10 w-10" />
            <h3 className="font-semibold text-foreground">Nenhuma atividade recente</h3>
            <p className="text-sm">
              Conecte-se com amigos para ver o que eles estão completando e colecionando.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/amigos">Encontrar Amigos</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FriendActivityFeed;