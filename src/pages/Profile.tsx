import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Lock } from 'lucide-react';
import FriendCollectionPreviewModal from '@/components/FriendCollectionPreviewModal';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const ProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<any | null>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<any | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!id) return;
      setLoading(true);

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

      // 2. Fetch user's public collections and their completion status
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('user_collections')
        .select(`
          id,
          is_public,
          collections (
            id,
            title,
            subtitle,
            cover,
            cards (id, title, image, cover)
          ),
          user_completed_cards (
            card_id
          )
        `)
        .eq('user_id', id)
        .eq('is_public', true);

      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
      } else if (collectionsData) {
        const formattedCollections = collectionsData.map(uc => ({
          id: uc.collections.id,
          instanceId: uc.id,
          title: uc.collections.title,
          subtitle: uc.collections.subtitle,
          cover: uc.collections.cover,
          isPublic: uc.is_public,
          completedCount: uc.user_completed_cards.length,
          totalCount: uc.collections.cards.length,
          cards: uc.collections.cards,
          completedCardIds: new Set(uc.user_completed_cards.map((c: any) => c.card_id))
        }));
        setCollections(formattedCollections);
      }

      setLoading(false);
    };

    fetchProfileData();
  }, [id]);

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
            <p className="text-muted-foreground">{collections.length} coleções públicas</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Coleções de {profile.name}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection: any) => (
            <div 
              key={collection.id} 
              className="relative group cursor-pointer"
              onClick={() => setSelectedCollection(collection)}
            >
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <div className="p-1.5 bg-black/50 text-white rounded-md backdrop-blur-sm" title="Pública">
                  <Eye className="h-4 w-4" />
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