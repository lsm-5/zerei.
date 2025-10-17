import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess, showError } from '@/utils/toast';
import { getInitials } from '@/utils/avatarHelpers';

interface Friend {
  id: string;
  name: string;
  avatar_url?: string;
}

interface InviteFriendToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: number;
  collectionTitle: string;
}

const InviteFriendToCollectionModal = ({ 
  isOpen, 
  onClose, 
  collectionId, 
  collectionTitle 
}: InviteFriendToCollectionModalProps) => {
  const { session } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && session) {
      fetchFriends();
    }
  }, [isOpen, session]);

  const fetchFriends = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      // 1) Buscar amizades do usuário logado
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_one_id.eq.${session.user.id},user_two_id.eq.${session.user.id}`)
        .eq('status', 'accepted');

      if (friendshipsError) {
        console.error('Error fetching friendships:', friendshipsError);
        showError('Erro ao carregar lista de amigos');
        return;
      }

      if (!friendships || friendships.length === 0) {
        setFriends([]);
        return;
      }

      // 2) Extrair IDs dos amigos (o outro usuário da relação)
      const friendIds = Array.from(new Set(friendships.map((f: any) => (
        f.user_one_id === session.user.id ? f.user_two_id : f.user_one_id
      ))));

      // 3) Buscar perfis desses IDs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        showError('Erro ao carregar lista de amigos');
        return;
      }

      const friendsList: Friend[] = (profiles || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        avatar_url: p.avatar_url,
      }));

      setFriends(friendsList);
    } catch (error) {
      console.error('Error fetching friends:', error);
      showError('Erro ao carregar lista de amigos');
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async (friendId: string) => {
    if (!session) return;
    
    setInviting(friendId);
    try {
      const { error } = await supabase
        .from('collection_invites')
        .insert({
          collection_id: collectionId,
          invited_by: session.user.id,
          invited_user: friendId,
          status: 'pending'
        });

      if (error) {
        console.error('Error sending invite:', error);
        showError('Erro ao enviar convite');
        return;
      }

      showSuccess('Convite enviado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Error sending invite:', error);
      showError('Erro ao enviar convite');
    } finally {
      setInviting(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar Amigo para "{collectionTitle}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : friends.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Você não tem amigos para convidar.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend.avatar_url} />
                      <AvatarFallback className="text-sm">
                        {getInitials(friend.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate max-w-[200px] sm:max-w-[260px]">{friend.name}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => sendInvite(friend.id)}
                    disabled={inviting === friend.id}
                    className="shrink-0"
                  >
                    {inviting === friend.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Convidar'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteFriendToCollectionModal;
