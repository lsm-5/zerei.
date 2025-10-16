import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, UserCheck, UserX } from 'lucide-react';
import AddFriendModal from '@/components/AddFriendModal';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const FriendsPage = () => {
  const { session } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);

  const fetchFriends = useCallback(async () => {
    if (!session) return;

    const { data, error } = await supabase
      .from('friendships')
      .select('*, user_one:profiles!user_one_id(*), user_two:profiles!user_two_id(*)')
      .or(`user_one_id.eq.${session.user.id},user_two_id.eq.${session.user.id}`);

    if (error) {
      console.error("Error fetching friends:", error);
      return;
    }

    const acceptedFriends = data
      .filter(f => f.status === 'accepted')
      .map(f => f.user_one_id === session.user.id ? f.user_two : f.user_one);
    
    const pendingRequests = data
      .filter(f => f.status === 'pending' && f.action_user_id !== session.user.id)
      .map(f => ({ ...f.user_one, friendship: f }));

    setFriends(acceptedFriends);
    setRequests(pendingRequests);
  }, [session]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleFriendAction = async (friendship: any, newStatus: 'accepted' | 'declined') => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: newStatus, action_user_id: session?.user.id })
      .eq('user_one_id', friendship.user_one_id)
      .eq('user_two_id', friendship.user_two_id);

    if (error) {
      showError(`Não foi possível ${newStatus === 'accepted' ? 'aceitar' : 'recusar'} a solicitação.`);
    } else {
      showSuccess(`Solicitação ${newStatus === 'accepted' ? 'aceita' : 'recusada'}!`);
      fetchFriends();
    }
  };

  const handleAddFriend = async (email: string) => {
    if (!session) return;

    if (email === session.user.email) {
      return showError("Você não pode adicionar a si mesmo.");
    }

    const { data: friendData, error: rpcError } = await supabase.rpc('get_profile_by_email', { p_email: email });

    if (rpcError || !friendData || friendData.length === 0) {
      return showError("Usuário não encontrado com este email.");
    }
    const friendProfile = friendData[0];

    const { error: insertError } = await supabase.from('friendships').insert({
      user_one_id: session.user.id,
      user_two_id: friendProfile.id,
      status: 'pending',
      action_user_id: session.user.id,
    });

    if (insertError) {
      if (insertError.code === '23505') {
        showError("Você já enviou uma solicitação para este usuário ou já são amigos.");
      } else {
        showError("Erro ao enviar solicitação.");
      }
    } else {
      showSuccess(`Solicitação de amizade enviada para ${friendProfile.name || email}!`);
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Amigos</h1>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar amigos..." className="pl-10" />
            </div>
            <Button onClick={() => setIsAddFriendModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="friends">
          <TabsList className="grid w-full grid-cols-2 sm:w-96">
            <TabsTrigger value="friends">Meus Amigos ({friends.length})</TabsTrigger>
            <TabsTrigger value="requests">Solicitações ({requests.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends" className="mt-6">
            {friends.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {friends.map(friend => (
                  <Card key={friend.id} className="text-center">
                    <CardContent className="p-6 flex flex-col items-center gap-4">
                      <Link to={`/perfil/${friend.id}`}>
                        <Avatar className="h-20 w-20 border-2 hover:border-primary transition-colors">
                          <AvatarImage src={friend.avatar_url} alt={friend.name} />
                          <AvatarFallback className="text-2xl">{friend.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <Link to={`/perfil/${friend.id}`} className="font-semibold hover:underline">{friend.name}</Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Você ainda não adicionou nenhum amigo.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <div className="space-y-4">
              {requests.map(request => (
                <Card key={request.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={request.avatar_url} alt={request.name} />
                        <AvatarFallback>{request.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold">{request.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" onClick={() => handleFriendAction(request.friendship, 'accepted')}><UserCheck className="h-4 w-4" /></Button>
                      <Button size="icon" variant="outline" onClick={() => handleFriendAction(request.friendship, 'declined')}><UserX className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {requests.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhuma solicitação de amizade pendente.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <AddFriendModal isOpen={isAddFriendModalOpen} onClose={() => setIsAddFriendModalOpen(false)} onAddFriend={handleAddFriend} />
    </Layout>
  );
};

export default FriendsPage;