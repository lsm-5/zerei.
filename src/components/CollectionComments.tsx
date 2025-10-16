import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollectionStore } from '@/contexts/CollectionStoreContext';
import { Button } from '@/components/ui/button';
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
  user: {
    id: number;
    name: string;
    avatar: string;
  };
  commentText: string;
  timestamp: string;
  isPrimary: boolean;
  feedItemId: number;
  commentId?: number;
  isMainComment: boolean;
}

interface CollectionCommentsProps {
  comments: Comment[];
}

const MOCK_USER_ID = 99;

const CollectionComments = ({ comments }: CollectionCommentsProps) => {
  const { removeCommentFromFeedItem, removeMainCommentFromFeedItem } = useCollectionStore();

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

  const handleDelete = (comment: Comment) => {
    if (comment.isMainComment) {
      removeMainCommentFromFeedItem(comment.feedItemId);
    } else if (comment.commentId) {
      removeCommentFromFeedItem(comment.feedItemId, comment.commentId);
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
                <AvatarImage src={comment.user.avatar} />
                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold">{comment.user.name}</p>
                <p className={cn(
                  "text-sm border-l-2 pl-3 my-1.5 italic",
                  comment.isPrimary ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  "{comment.commentText}"
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
              {comment.user.id === MOCK_USER_ID && (
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