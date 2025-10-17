import { useState, useEffect } from 'react';
import Layout from "@/components/Layout";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import FeedItem from '@/components/FeedItem';
import { Layers, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showError } from '@/utils/toast';
import { getDisplayName } from '@/utils/avatarHelpers';

interface Activity {
  activity_id: number;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar: string;
  type: 'acquired_collection' | 'completed_card' | 'completed_collection' | 'achievement_unlocked';
  collection_id: number;
  collection_title: string;
  collection_cover: string;
  card_id?: number;
  card_title?: string;
  card_cover?: string;
  metadata: any;
  created_at: string;
  like_count: number;
  user_liked: boolean;
  comment_count: number;
}

const FeedPage = () => {
  const { session } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.rpc('get_activities_with_engagement', {
        p_user_id: null, // Buscar atividades de todos os usuários
        p_limit: 20,
        p_offset: 0
      });

      if (error) {
        console.error('Error fetching activities:', error);
        showError("Erro ao carregar atividades.");
        return;
      }

      // Para atividades de conclusão de card, buscar a imagem do card
      const activitiesWithCardImages = await Promise.all(
        (data || []).map(async (activity: any) => {
          if (activity.type === 'completed_card' && activity.card_id) {
            try {
              const { data: cardData, error: cardError } = await supabase
                .from('cards')
                .select('cover')
                .eq('id', activity.card_id)
                .single();

              if (!cardError && cardData) {
                return {
                  ...activity,
                  card_cover: cardData.cover
                };
              }
            } catch (error) {
              console.error('Error fetching card cover:', error);
            }
          }
          return activity;
        })
      );

      setActivities(activitiesWithCardImages);
    } catch (error) {
      console.error('Error:', error);
      showError("Erro ao carregar atividades.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
  };

  useEffect(() => {
    fetchActivities();
  }, [session]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-16">
          <RefreshCw className="mx-auto h-8 w-8 text-muted-foreground animate-spin" />
          <p className="mt-4 text-muted-foreground">Carregando atividades...</p>
        </div>
      </Layout>
    );
  }

  if (activities.length === 0) {
    return (
      <Layout>
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-6 text-xl font-semibold">Bem-vindo ao Zerei!</h2>
          <p className="mt-2 text-muted-foreground">
            Adquira coleções na loja e comece a completar seus cards.
            <br />
            Sua atividade e a de seus amigos aparecerão aqui!
          </p>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="mt-4"
            variant="outline"
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Feed de Atividades</h1>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
        </div>

        <div className="space-y-4">
          {activities.map((activity) => (
            <FeedItem
              key={activity.activity_id}
              item={{
                id: activity.activity_id,
                user: {
                  id: parseInt(activity.user_id),
                  name: getDisplayName(activity.user_name, activity.user_email),
                  avatar: activity.user_avatar || `https://api.dicebear.com/8.x/lorelei/svg?seed=${activity.user_id}`
                },
                type: activity.type,
                data: {
                  collectionId: activity.collection_id,
                  cardTitle: activity.card_title,
                  cardCover: activity.card_cover,
                  collectionTitle: activity.collection_title,
                  coverImage: activity.collection_cover,
                  achievementPercentage: activity.metadata?.percentage,
                  comment: activity.metadata?.comment,
                  commentRemovedAt: activity.metadata?.commentRemovedAt,
                },
                timestamp: activity.created_at,
                likes: activity.like_count || 0,
                comments: [], // Será implementado posteriormente
              }}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default FeedPage;