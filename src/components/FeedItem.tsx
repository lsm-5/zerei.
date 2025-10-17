import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Crown, Trophy, Trash2, Lock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useCollectionStore } from "@/contexts/CollectionStoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
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
  id: number;
  user: {
    id: number;
    name: string;
    avatar: string;
  };
  text: string;
  removedAt?: string;
}

interface FeedItemProps {
  item: {
    id: number;
    user: { id: number; name: string; avatar: string };
    type: 'completed_card' | 'acquired_collection' | 'completed_collection' | 'achievement_unlocked' | 'liked_card';
    data: {
      collectionId: number;
      cardTitle?: string;
      cardCover?: string;
      collectionTitle: string;
      coverImage: string;
      achievementPercentage?: number;
      comment?: string;
      commentRemovedAt?: string;
    };
    timestamp: string;
    likes: number;
    comments: Comment[];
  };
}

const FeedItem = ({ item }: FeedItemProps) => {
  const { user, type, data, timestamp, comments } = item;
  const { session } = useAuth();
  const currentUser = session?.user;
  const { activeCollections, archivedCollections, likeActivity, unlikeActivity, addCommentToActivity, removeCommentFromActivity } = useCollectionStore();
  
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [activityComments, setActivityComments] = useState<any[]>([]);

  const userCollectionInstance = [...activeCollections, ...archivedCollections].find(c => c.id === data.collectionId);
  const userHasCollection = !!userCollectionInstance;

  // Carregar likes e comentários do banco
  useEffect(() => {
    const loadActivityData = async () => {
      if (!session) return;

      try {
        // Carregar likes
        const { data: likesData, error: likesError } = await supabase
          .from('activity_likes')
          .select('user_id')
          .eq('activity_id', item.id);

        if (!likesError && likesData) {
          const userLiked = likesData.some(like => like.user_id === session.user.id);
          setIsLiked(userLiked);
          setLikeCount(likesData.length);
        }

        // Carregar comentários
        const { data: commentsData, error: commentsError } = await supabase
          .from('activity_comments')
          .select(`
            id,
            comment,
            created_at,
            user_id,
            profiles!inner(name, avatar_url)
          `)
          .eq('activity_id', item.id)
          .is('removed_at', null)
          .order('created_at', { ascending: true });

        if (!commentsError && commentsData) {
          const formattedComments = commentsData.map((comment: any) => ({
            id: comment.id,
            user: {
              id: comment.user_id,
              name: comment.profiles?.name || 'Usuário',
              avatar: ''
            },
            text: comment.comment,
            createdAt: comment.created_at
          }));
          setActivityComments(formattedComments);
        }
      } catch (error) {
        console.error('Error loading activity data:', error);
      }
    };

    loadActivityData();
  }, [item.id, session]);

  const handleLike = async () => {
    if (isLiked) {
      const success = await unlikeActivity(item.id);
      if (success) {
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      }
    } else {
      const success = await likeActivity(item.id);
      if (success) {
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && currentUser) {
      const success = await addCommentToActivity(item.id, newComment.trim());
      if (success) {
        const commentToAdd = {
          id: Date.now(),
          user: { 
            id: currentUser.id,
            name: currentUser.user_metadata.name, 
            avatar: `https://api.dicebear.com/8.x/lorelei/svg?seed=${currentUser.email}` 
          },
          text: newComment.trim(),
        };
        setActivityComments(prev => [...prev, commentToAdd]);
        setNewComment("");
      }
    }
  };

  const renderActionText = () => {
    if (type === 'achievement_unlocked') {
      return (
        <p>
          Alcançou a conquista de <span className="font-bold text-pink-500">{data.achievementPercentage}%</span> na coleção{' '}
          <span className="font-semibold">{data.collectionTitle}</span>.
        </p>
      );
    }
    if (type === 'completed_collection') {
      return (
        <p>
          <span className="font-bold text-amber-500">ZEROU!</span> Completou a coleção inteira{' '}
          <span className="font-semibold">{data.collectionTitle}</span>.
        </p>
      );
    }
    if (type === 'completed_card') {
      return (
        <p>
          Completou o card <span className="font-semibold">{data.cardTitle}</span> da coleção{' '}
          <span className="font-semibold">{data.collectionTitle}</span>.
        </p>
      );
    }
    if (type === 'liked_card') {
      return (
        <p>
          Curtiu o card <span className="font-semibold">{data.cardTitle}</span> da coleção{' '}
          <span className="font-semibold">{data.collectionTitle}</span>.
        </p>
      );
    }
    if (type === 'acquired_collection') {
      return (
        <p>
          Adquiriu a coleção <span className="font-semibold">{data.collectionTitle}</span>!
        </p>
      );
    }
    return null;
  };

  const CoverImage = () => {
    // Para posts de conclusão de card, mostrar a imagem do card se disponível
    const imageSrc = (type === 'completed_card' && data.cardCover) ? data.cardCover : data.coverImage;
    const imageAlt = (type === 'completed_card' && data.cardTitle) ? data.cardTitle : data.collectionTitle;
    
    return (
      <img src={imageSrc} alt={imageAlt} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
    );
  };

  return (
    <Card className={cn(
      "w-full max-w-2xl mx-auto animate-fade-in transition-all",
      type === 'completed_collection' && "border-amber-400/50 border-2 shadow-amber-500/20 shadow-lg bg-amber-50/30 dark:bg-amber-900/10",
      type === 'achievement_unlocked' && "border-pink-400/50 border-2 shadow-pink-500/20 shadow-lg bg-pink-50/30 dark:bg-pink-900/10"
    )}>
      <CardHeader className="flex flex-row items-center gap-4">
        <Link to={`/perfil/${user.id}`} className="flex items-center gap-4 group flex-1">
          <Avatar>
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold group-hover:text-primary transition-colors">{getDisplayName(user.name, user.name)}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        </Link>
        {type === 'completed_collection' && (
          <div className="ml-auto text-amber-500 flex items-center gap-2 text-sm font-semibold">
            <Crown className="h-5 w-5" />
            <span>Coleção Completa</span>
          </div>
        )}
        {type === 'achievement_unlocked' && (
          <div className="ml-auto text-pink-500 flex items-center gap-2 text-sm font-semibold">
            <Trophy className="h-5 w-5" />
            <span>Nova Conquista</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-sm mb-4">{renderActionText()}</div>
        
        {(type === 'completed_card' && data.comment && !data.commentRemovedAt) && (
          <blockquote className="border-l-2 pl-4 italic text-sm text-muted-foreground mb-4">
            "{data.comment}"
          </blockquote>
        )}
        {(type === 'completed_collection' && data.comment && !data.commentRemovedAt) && (
          <blockquote className="border-l-2 pl-4 italic text-sm text-foreground mb-4 bg-muted/50 p-3 rounded-r-lg">
            <p className="font-semibold not-italic mb-1">Minha experiência:</p>
            "{data.comment}"
          </blockquote>
        )}

        {userHasCollection ? (
          <Link to={`/colecoes/${userCollectionInstance.instanceId}`} className="rounded-lg overflow-hidden aspect-video relative block group">
            <CoverImage />
          </Link>
        ) : (
          <div className="rounded-lg overflow-hidden aspect-video relative block group cursor-not-allowed">
            <CoverImage />
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4 text-center backdrop-blur-sm">
              <Lock className="h-8 w-8 mb-2" />
              <p className="font-semibold">Adquira esta coleção para ver</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-4">
          <Button variant="ghost" size="sm" onClick={handleLike}>
            <Heart className={cn("mr-2 h-4 w-4", isLiked && "fill-red-500 text-red-500")} /> {likeCount}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
            <MessageCircle className="mr-2 h-4 w-4" /> {activityComments.length}
          </Button>
        </div>
      </CardFooter>

      {showComments && (
        <div className="p-4 pt-0 border-t mx-6 mb-4">
          <form onSubmit={handleAddComment} className="flex gap-2 mt-4">
            <Input
              placeholder="Adicione um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button type="submit" disabled={!newComment.trim()}>Enviar</Button>
          </form>
          <div className="mt-4 space-y-4 max-h-60 overflow-y-auto pr-2">
            {activityComments.map((comment, index) => (
              <div key={comment.id || index} className="flex items-start gap-3 group">
                <Link to={`/perfil/${comment.user.id}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(comment.user.name)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="bg-muted/50 p-2 rounded-lg flex-1">
                  <Link to={`/perfil/${comment.user.id}`} className="font-semibold text-sm hover:underline">{getDisplayName(comment.user.name, comment.user.email)}</Link>
                  <p className="text-sm">{comment.text}</p>
                </div>
                {comment.user.id === currentUser?.id && (
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
                        <AlertDialogAction onClick={() => removeCommentFromActivity(item.id, comment.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default FeedItem;