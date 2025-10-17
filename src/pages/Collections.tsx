import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MoreHorizontal, Archive, Inbox, Eye, Lock, Check, X } from "lucide-react";
import { useCollectionStore } from "@/contexts/CollectionStoreContext";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { showError, showSuccess } from "@/utils/toast";

const CollectionsPage = () => {
  const { activeCollections, archivedCollections, archiveCollection, unarchiveCollection, resetCollection, getCompletedCardsForCollection, toggleCollectionPrivacy } = useCollectionStore();
  const { session } = useAuth();
  const [invites, setInvites] = useState<any[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [memberCollections, setMemberCollections] = useState<any[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const pageTitle = showArchived ? "Coleções Arquivadas" : "Minhas Coleções";
  const publicCollections = activeCollections.filter((c: any) => c.isPublic);
  const privateCollections = activeCollections.filter((c: any) => !c.isPublic);

  const activeCollectionIds = useMemo(() => activeCollections.map((c: any) => c.instanceId || c.id), [activeCollections]);

  const [participantsByInstance, setParticipantsByInstance] = useState<Record<number, Array<{ id: string; name: string; avatar_url?: string }>>>({});

  useEffect(() => {
    const fetchInvites = async () => {
      if (!session) return;
      setLoadingInvites(true);
      try {
        const { data, error } = await supabase
          .from('collection_invites')
          .select(`
            id, collection_id, invited_by, invited_user, status, created_at,
            invited_by_profile:profiles!collection_invites_invited_by_fkey ( id, name, avatar_url ),
            inviter_instance:user_collections!collection_invites_collection_id_fkey (
              id, collection_id,
              collections ( id, title, subtitle, cover )
            )
          `)
          .eq('invited_user', session.user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) return;
        setInvites(data || []);
      } finally {
        setLoadingInvites(false);
      }
    };
    fetchInvites();
  }, [session]);

  useEffect(() => {
    const fetchParticipantsForActive = async () => {
      if (!session || activeCollectionIds.length === 0) return;
      try {
        const { data, error } = await supabase
          .from('user_collection_members')
          .select(`user_id, user_collection_id, profiles:profiles!user_collection_members_user_id_fkey ( id, name, avatar_url )`)
          .in('user_collection_id', activeCollectionIds);
        if (error) return;

        const grouped: Record<number, Array<{ id: string; name: string; avatar_url?: string }>> = {};
        (data || []).forEach((row: any) => {
          const inst = row.user_collection_id as number;
          const p = row.profiles;
          if (!p || p.id === session.user.id) return;
          if (!grouped[inst]) grouped[inst] = [];
          if (grouped[inst].length < 3) grouped[inst].push({ id: p.id, name: p.name, avatar_url: p.avatar_url });
        });
        setParticipantsByInstance(grouped);
      } catch (e) {
        // noop
      }
    };
    fetchParticipantsForActive();
  }, [session, activeCollectionIds.join(',')]);

  // Fetch instances where the user is a member (shared instances)
  useEffect(() => {
    const fetchMemberCollections = async () => {
      if (!session) return;
      const { data, error } = await supabase
        .from('user_collection_members')
        .select(`
          user_collection_id,
          user_collections:user_collections!inner (
            id, is_public,
            collections ( id, title, subtitle, cover, cards ( id ) )
          )
        `)
        .eq('user_id', session.user.id);
      if (error) return;
      const mapped = (data || []).map((row: any) => ({
        instanceId: row.user_collections.id,
        id: row.user_collections.collections.id,
        title: row.user_collections.collections.title,
        subtitle: row.user_collections.collections.subtitle,
        cover: row.user_collections.collections.cover,
        cards: row.user_collections.collections.cards || [],
        isPublic: row.user_collections.is_public,
      }));
      setMemberCollections(mapped);
    };
    fetchMemberCollections();
  }, [session]);

  const acceptInvite = async (inviteId: number) => {
    try {
      const { error } = await supabase.rpc('accept_collection_invite', { p_invite_id: inviteId });
      if (error) return showError('Erro ao aceitar convite.');
      showSuccess('Convite aceito!');
      // Update invite status in local state
      setInvites(prev => prev.map(i => i.id === inviteId ? { ...i, status: 'accepted' } : i));
      // Refresh collections to show new instance
      window.location.reload();
    } catch {
      showError('Erro ao aceitar convite.');
    }
  };

  const declineInvite = async (inviteId: number) => {
    try {
      const { error } = await supabase.rpc('decline_collection_invite', { p_invite_id: inviteId });
      if (error) return showError('Erro ao recusar convite.');
      showSuccess('Convite recusado.');
      // Update invite status in local state
      setInvites(prev => prev.map(i => i.id === inviteId ? { ...i, status: 'declined' } : i));
    } catch {
      showError('Erro ao recusar convite.');
    }
  };

  const refreshInvites = async () => {
    if (!session) return;
    setLoadingInvites(true);
    try {
      const { data, error } = await supabase
        .from('collection_invites')
        .select(`
          id, collection_id, invited_by, invited_user, status, created_at,
          invited_by_profile:profiles!collection_invites_invited_by_fkey ( id, name, avatar_url ),
          inviter_instance:user_collections!collection_invites_collection_id_fkey (
            id, collection_id,
            collections ( id, title, subtitle, cover )
          )
        `)
        .eq('invited_user', session.user.id)
        .order('created_at', { ascending: false });

      if (error) return;
      setInvites(data || []);
    } finally {
      setLoadingInvites(false);
    }
  };

  const renderCollectionGrid = (collections: any[]) => {
    if (collections.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
          <p className="text-muted-foreground">Nenhuma coleção encontrada.</p>
        </div>
      );
    }

    return collections.map((collection: any) => {
      const completedCount = getCompletedCardsForCollection(collection.instanceId).size;
      const totalCount = collection.cards.length;
      const linkId = collection.instanceId || collection.id;

      return (
        <div key={linkId} className="relative group">
          <div className="absolute top-4 right-16 z-10 flex items-center gap-2">
            <div className="p-1.5 bg-black/50 text-white rounded-md backdrop-blur-sm" title={collection.isPublic ? 'Pública' : 'Privada'}>
              {collection.isPublic ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </div>
            <div className="px-2 py-1 bg-black/50 text-white text-xs font-semibold rounded-md backdrop-blur-sm">
              {completedCount} / {totalCount}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30 text-white"
                onClick={handleMenuClick}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={handleMenuClick}>
              <DropdownMenuItem onClick={() => toggleCollectionPrivacy(collection.instanceId)}>
                {collection.isPublic ? 'Tornar Privada' : 'Tornar Pública'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => resetCollection(collection.instanceId)}>
                Resetar coleção
              </DropdownMenuItem>
              <Separator />
              {showArchived ? (
                <DropdownMenuItem onClick={() => unarchiveCollection(collection.instanceId)}>
                  Desarquivar coleção
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-red-500" onClick={() => archiveCollection(collection.instanceId)}>
                  Arquivar coleção
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link to={`/colecoes/${linkId}`}>
            <div className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer aspect-[9/14]">
              <img 
                src={collection.cover} 
                alt={collection.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white font-bold text-lg truncate">{collection.title}</h3>
                <p className="text-white/90 text-sm truncate flex-1">{collection.subtitle}</p>
                {participantsByInstance[collection.instanceId]?.length > 0 && (
                  <div className="mt-2 flex -space-x-2">
                    {participantsByInstance[collection.instanceId].slice(0,3).map((p) => (
                      <Avatar key={p.id} className="h-6 w-6 ring-2 ring-black/40">
                        <AvatarImage src={p.avatar_url} />
                        <AvatarFallback>{(p.name || '?').slice(0,1)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>
      );
    });
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{pageTitle}</h1>
        <Button variant="outline" onClick={() => setShowArchived(!showArchived)}>
          {showArchived ? <Inbox className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
          {showArchived ? "Ver Ativas" : "Ver Arquivadas"}
        </Button>
      </div>

      {showArchived ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderCollectionGrid(archivedCollections)}
        </div>
      ) : (
        <Tabs defaultValue="public">
          <TabsList className="grid w-full grid-cols-2 sm:w-96">
            <TabsTrigger value="public">Públicas ({publicCollections.length})</TabsTrigger>
            <TabsTrigger value="private">Privadas ({privateCollections.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="public" className="mt-6">
            {invites.length > 0 && (
              <div className="mb-6 p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Convites ({invites.length})</h3>
                </div>
                <div className="space-y-3">
                  {invites.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-md bg-muted/40">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={inv.invited_by_profile?.avatar_url} />
                          <AvatarFallback>{(inv.invited_by_profile?.name || '?').slice(0,1)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{inv.invited_by_profile?.name || 'Alguém'}</p>
                          <p className="text-xs text-muted-foreground truncate">Convidou você para "{inv.inviter_instance?.collections?.title}"</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => acceptInvite(inv.id)}>
                          <Check className="h-4 w-4 mr-1" /> Aceitar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => declineInvite(inv.id)}>
                          <X className="h-4 w-4 mr-1" /> Recusar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderCollectionGrid([...publicCollections, ...memberCollections.filter((c:any)=>c.isPublic)])}
            </div>
          </TabsContent>
          <TabsContent value="private" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderCollectionGrid([...privateCollections, ...memberCollections.filter((c:any)=>!c.isPublic)])}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </Layout>
  );
};

export default CollectionsPage;