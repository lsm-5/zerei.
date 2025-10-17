import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Lock } from 'lucide-react';
import FriendCollectionPreviewModal from '@/components/FriendCollectionPreviewModal';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePage = () => {
  const { id } = useParams();
  const { session } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<any | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!id || !session) return;
      setLoading(true);

      // Check if viewing own profile
      const ownProfile = id === session.user.id;
      setIsOwnProfile(ownProfile);

      // 1. Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError || !profileData) {
        console.error('Error fetching profile:', profileError);
        setProfile(null);
        setLoading(false);
        return;
      }
      setProfile(profileData);

      // 2. Check if user is a friend (if not own profile)
      let isFriendStatus = ownProfile; // Own profile is always "friend"
      
      if (!ownProfile) {
        // Check friendship in both directions
        const { data: friendship, error: friendshipError } = await supabase
          .from('friendships')
          .select('*')
          .or(`and(user_one_id.eq.${session.user.id},user_two_id.eq.${id}),and(user_one_id.eq.${id},user_two_id.eq.${session.user.id})`)
          .eq('status', 'accepted')
          .maybeSingle();


        if (friendshipError) {
          console.error('Error checking friendship:', friendshipError);
        } else {
          isFriendStatus = !!friendship;
        }
      }
      
      setIsFriend(isFriendStatus);


      // 3. Fetch user's collections and their completion status
      // If viewing own profile or friend profile, show all collections
      // Otherwise, show only public collections
      

      // Try a simpler query first
      let query = supabase
        .from('user_collections')
        .select(`
          id,
          is_public,
          collections (
            id,
            title,
            subtitle,
            cover,
            cards (id, title, cover)
          )
        `)
        .eq('user_id', id);

      // Only show public collections for non-own profiles
      // Friends and non-friends can only see public collections
      if (!ownProfile) {
        query = query.eq('is_public', true);
      }

      const { data: collectionsData, error: collectionsError } = await query;

      console.log('Profile collections query:', {
        userId: id,
        ownProfile,
        isFriend: isFriendStatus,
        queryFilter: !ownProfile ? 'public only' : 'all',
        collectionsCount: collectionsData?.length || 0
      });

      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
      } else if (collectionsData) {
        // Fetch completed cards separately for each collection
        const formattedCollections = await Promise.all(
          collectionsData.map(async (uc: any) => {
            const { data: completedCards, error: completedError } = await supabase
              .rpc('get_friend_completed_cards', {
                p_user_collection_id: uc.id,
                p_viewer_id: session.user.id,
                p_owner_id: id
              });

            if (completedError) {
              console.error('Error fetching completed cards:', completedError);
              console.log('RPC params:', { user_collection_id: uc.id, viewer_id: session.user.id, owner_id: id });
            } else {
              console.log('Completed cards for collection:', uc.id, completedCards?.length || 0);
            }

            return {
              id: uc.collections?.id,
              instanceId: uc.id,
              title: uc.collections?.title,
              subtitle: uc.collections?.subtitle,
              cover: uc.collections?.cover,
              isPublic: uc.is_public,
              completedCount: completedCards?.length || 0,
              totalCount: uc.collections?.cards?.length || 0,
              cards: uc.collections?.cards || [],
              completedCardIds: new Set(completedCards?.map((c: any) => c.card_id) || [])
            };
          })
        );
        setCollections(formattedCollections);
      }

      setLoading(false);
    };

    fetchProfileData();
  }, [id, session]);

  if (loading) {
    return (
      <Layout>
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="aspect-[9/14] rounded-lg" />
          ))}
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold">Usuário não encontrado</h1>
          <p className="text-muted-foreground mt-2">O perfil que você está procurando não existe.</p>
          <Button asChild variant="link" className="mt-4">
            <Link to="/amigos">Voltar para Amigos</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <Link to="/amigos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Amigos
        </Link>

        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            <AvatarImage src={profile.avatar_url} alt={profile.name} />
            <AvatarFallback className="text-3xl">{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">
              {collections.length} {isOwnProfile ? 'coleções' : 'coleções públicas'}
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">
          Coleções de {profile.name}
          {isOwnProfile && " (Suas coleções)"}
        </h2>
        
        {!isOwnProfile && collections.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma Coleção Pública</h3>
            <p className="text-muted-foreground mb-4">
              {profile.name} não possui coleções públicas disponíveis.
            </p>
            <p className="text-sm text-muted-foreground">
              Apenas coleções marcadas como públicas são visíveis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection: any) => (
              <div 
                key={collection.id} 
                className="relative group cursor-pointer"
                onClick={() => setSelectedCollection(collection)}
              >
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <div className={`p-1.5 ${collection.isPublic ? 'bg-black/50' : 'bg-blue-600/80'} text-white rounded-md backdrop-blur-sm`} 
                       title={collection.isPublic ? "Pública" : "Privada"}>
                    {collection.isPublic ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </div>
                  <div className="px-2 py-1 bg-black/50 text-white text-xs font-semibold rounded-md backdrop-blur-sm">
                    {collection.completedCount} / {collection.totalCount}
                  </div>
                </div>
                <div className="relative group overflow-hidden rounded-lg shadow-lg aspect-[9/14]">
                  <img 
                    src={collection.cover} 
                    alt={collection.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-white font-bold text-lg truncate">{collection.title}</h3>
                    <p className="text-white/90 text-sm truncate">{collection.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <FriendCollectionPreviewModal
        collection={selectedCollection}
        isOpen={!!selectedCollection}
        onClose={() => setSelectedCollection(null)}
      />
    </Layout>
  );
};

export default ProfilePage;