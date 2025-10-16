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
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);

  const fetchFriends = useCallback(async () => {
    if (!session) return;

    // Buscar todas as amizades onde o usuário está envolvido
    const { data: friendships, error: friendshipsError } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_one_id.eq.${session.user.id},user_two_id.eq.${session.user.id}`);

    if (friendshipsError) {
      console.error("Error fetching friendships:", friendshipsError);
      return;
    }

    if (!friendships || friendships.length === 0) {
      setFriends([]);
      setRequests([]);
      setSentRequests([]);
      return;
    }

    // Coletar todos os IDs únicos de usuários
    const userIds = new Set();
    friendships.forEach(f => {
      userIds.add(f.user_one_id);
      userIds.add(f.user_two_id);
    });

    // Buscar todos os perfis
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', Array.from(userIds));

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return;
    }

    // Criar mapa de ID para perfil
    const profileMap = new Map();
    profiles?.forEach(profile => {
      profileMap.set(profile.id, profile);
    });

    // Processar amizades aceitas
    const acceptedFriends = friendships
      .filter(f => f.status === 'accepted')
      .map(f => {
        const friendId = f.user_one_id === session.user.id ? f.user_two_id : f.user_one_id;
        return profileMap.get(friendId);
      })
      .filter(Boolean);

    // Processar solicitações recebidas (pendentes onde o usuário atual não é o action_user)
    const pendingRequests = friendships
      .filter(f => f.status === 'pending' && f.action_user_id !== session.user.id)
      .map(f => {
        const requesterId = f.user_one_id === session.user.id ? f.user_two_id : f.user_one_id;
        const profile = profileMap.get(requesterId);
        return profile ? { ...profile, friendship: f } : null;
      })
      .filter(Boolean);

    // Processar solicitações enviadas (pendentes onde o usuário atual é o action_user)
    const sentRequests = friendships
      .filter(f => f.status === 'pending' && f.action_user_id === session.user.id)
      .map(f => {
        const targetId = f.user_one_id === session.user.id ? f.user_two_id : f.user_one_id;
        const profile = profileMap.get(targetId);
        return profile ? { ...profile, friendship: f } : null;
      })
      .filter(Boolean);

    setFriends(acceptedFriends);
    setRequests(pendingRequests);
    setSentRequests(sentRequests);
  }, [session]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleFriendAction = async (friendship: any, newStatus: 'accepted' | 'declined') => {
    const { error } = await supabase
      .from('friendships')
      .update({ 
        status: newStatus, 
        action_user_id: session?.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', friendship.id);

    if (error) {
      showError(`Não foi possível ${newStatus === 'accepted' ? 'aceitar' : 'recusar'} a solicitação.`);
      console.error('Error updating friendship:', error);
    } else {
      showSuccess(`Solicitação ${newStatus === 'accepted' ? 'aceita' : 'recusada'}!`);
      fetchFriends();
    }
  };

  const handleCancelSentRequest = async (friendship: any) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendship.id);

    if (error) {
      showError("Não foi possível cancelar a solicitação.");
      console.error('Error canceling friendship:', error);
    } else {
      showSuccess("Solicitação cancelada!");
      fetchFriends();
    }
  };

  const handleAddFriend = async (email: string) => {
    if (!session) return;

    if (email === session.user.email) {
      return showError("Você não pode adicionar a si mesmo.");
    }

    try {
      // 1. Buscar o perfil do usuário pelo email
      const { data: profileData, error: rpcError } = await supabase.rpc('get_profile_by_email', { p_email: email });
      
      if (rpcError) {
        console.error('RPC Error:', rpcError);
        return showError("Erro ao verificar usuário. Tente novamente.");
      }
      
      if (!profileData || profileData.length === 0) {
        return showError("Usuário não encontrado com este email. Verifique se o email está correto e se o usuário já se cadastrou.");
      }
      
      const targetProfile = profileData[0];
      
      // 2. Verificar se já existe uma amizade entre os usuários
      const { data: existingFriendship, error: checkError } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_one_id.eq.${session.user.id},user_two_id.eq.${targetProfile.id}),and(user_one_id.eq.${targetProfile.id},user_two_id.eq.${session.user.id})`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing friendship:', checkError);
        return showError("Erro ao verificar amizade existente.");
      }

      // 3. Se já existe uma amizade, verificar o status
      if (existingFriendship) {
        switch (existingFriendship.status) {
          case 'pending':
            if (existingFriendship.action_user_id === session.user.id) {
              return showError("Você já enviou uma solicitação para este usuário. Aguarde a resposta.");
            } else {
              return showError("Este usuário já enviou uma solicitação para você. Verifique suas solicitações pendentes.");
            }
          case 'accepted':
            return showError("Vocês já são amigos!");
          case 'declined':
            // Permitir reenviar solicitação se foi recusada
            break;
        }
      }

      // 4. Criar nova solicitação de amizade
      // Sempre colocar o ID menor como user_one_id para evitar duplicatas
      const userOneId = session.user.id < targetProfile.id ? session.user.id : targetProfile.id;
      const userTwoId = session.user.id < targetProfile.id ? targetProfile.id : session.user.id;

      const { error: insertError } = await supabase.from('friendships').insert({
        user_one_id: userOneId,
        user_two_id: userTwoId,
        status: 'pending',
        action_user_id: session.user.id, // Quem está enviando a solicitação
      });

      if (insertError) {
        if (insertError.code === '23505') {
          showError("Solicitação já existe entre vocês.");
        } else {
          showError("Erro ao enviar solicitação de amizade.");
          console.error('Insert error:', insertError);
        }
      } else {
        showSuccess(`Solicitação de amizade enviada para ${targetProfile.name || email}!`);
        // Atualizar a lista de amigos
        fetchFriends();
      }
    } catch (exception) {
      console.error('Exception in handleAddFriend:', exception);
      return showError("Erro inesperado. Tente novamente.");
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
          <TabsList className="grid w-full grid-cols-3 sm:w-96">
            <TabsTrigger value="friends">Meus Amigos ({friends.length})</TabsTrigger>
            <TabsTrigger value="requests">Solicitações ({requests.length})</TabsTrigger>
            <TabsTrigger value="sent">Enviados ({sentRequests.length})</TabsTrigger>
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

          <TabsContent value="sent" className="mt-6">
            <div className="space-y-4">
              {sentRequests.map(request => (
                <Card key={request.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={request.avatar_url} alt={request.name} />
                        <AvatarFallback>{request.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{request.name}</p>
                        <p className="text-sm text-muted-foreground">Aguardando resposta...</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleCancelSentRequest(request.friendship)}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {sentRequests.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhuma solicitação enviada.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <AddFriendModal isOpen={isAddFriendModalOpen} onClose={() => setIsAddFriendModalOpen(false)} onAddFriend={handleAddFriend} />
    </Layout>
  );
};

export default FriendsPage;