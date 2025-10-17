import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollectionStore } from '@/contexts/CollectionStoreContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getInitials, getDisplayName } from '@/utils/avatarHelpers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Comment {
  id: string | number;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar: string;
  comment_text: string;
  activity_type: string;
  activity_id: number;
  card_id?: number;
  card_title?: string;
  is_main_comment: boolean;
  created_at: string;
}

interface CollectionCommentsProps {
  comments: Comment[];
}

const CollectionComments = ({ comments }: CollectionCommentsProps) => {
  const { removeCommentFromActivity } = useCollectionStore();

  if (!comments || comments.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="mx-auto h-8 w-8 mb-2" />
            <p className="font-semibold">Nenhum comentário ainda.</p>
            <p className="text-sm">Seja o primeiro a compartilhar sua experiência!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityTypeBadge = (activityType: string, cardTitle?: string) => {
    switch (activityType) {
      case 'acquired_collection':
        return <Badge variant="secondary" className="text-xs">Obteve coleção</Badge>;
      case 'completed_card':
        return <Badge variant="outline" className="text-xs">Completou {cardTitle}</Badge>;
      case 'completed_collection':
        return <Badge variant="default" className="text-xs">Concluiu coleção</Badge>;
      default:
        return null;
    }
  };

  const handleDelete = (comment: Comment) => {
    if (!comment.is_main_comment) {
      removeCommentFromActivity(comment.id as number);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <ul className="space-y-6">
          {comments.map((comment, index) => (
            <li 
              key={comment.id} 
              className="flex items-start space-x-4 opacity-0 animate-slide-up group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Avatar>
                <AvatarFallback>{getInitials(comment.user_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold">{getDisplayName(comment.user_name, comment.user_email)}</p>
                  {getActivityTypeBadge(comment.activity_type, comment.card_title)}
                </div>
                <p className={cn(
                  "text-sm border-l-2 pl-3 my-1.5 italic",
                  comment.is_main_comment ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  "{comment.comment_text}"
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
              {!comment.is_main_comment && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 shrink-0">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir comentário?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Seu comentário será removido permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(comment)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default CollectionComments;