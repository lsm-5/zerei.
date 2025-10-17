import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

const CollectionStoreContext = createContext<any>(undefined);

export const CollectionStoreProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [storeCollections, setStoreCollections] = useState<any[]>([]);
  const [userCollections, setUserCollections] = useState<any[]>([]);
  const [memberCollections, setMemberCollections] = useState<any[]>([]);
  const [completedCards, setCompletedCards] = useState<any>({});
  const [activities, setActivities] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }
    setLoading(true);

    // Buscar coleções com contagem de aquisições
    const { data: storeData, error: storeError } = await supabase
      .from('collections')
      .select(`
        *,
        cards(*),
        user_collections(count)
      `);
    if (storeError) console.error('Error fetching store collections:', storeError);
    else {
      // Adicionar contagem de aquisições
      const collectionsWithAcquisitions = (storeData || []).map(collection => ({
        ...collection,
        acquisitions: collection.user_collections?.[0]?.count || 0
      }));
      setStoreCollections(collectionsWithAcquisitions);
    }

    const { data: userCollectionsData, error: userCollectionsError } = await supabase
      .from('user_collections')
      .select('*, collections(*, cards(*))')
      .eq('user_id', session.user.id);
    
    if (userCollectionsError) console.error('Error fetching user collections:', userCollectionsError);
    else setUserCollections(userCollectionsData || []);

    // Also fetch instances where user is a member (shared instances)
    const { data: memberCollectionsData, error: memberCollectionsError } = await supabase
      .from('user_collection_members')
      .select('user_collection_id, user_collections!inner(*, collections(*, cards(*)))')
      .eq('user_id', session.user.id);
    
    if (memberCollectionsError) console.error('Error fetching member collections:', memberCollectionsError);
    else {
      const mappedMemberCollections = (memberCollectionsData || []).map((mc: any) => ({
        ...mc.user_collections,
        instanceId: mc.user_collection_id
      }));
      setMemberCollections(mappedMemberCollections);
    }

    // Combine owned and member collections for completed cards and activities
    const allCollectionIds = [
      ...(userCollectionsData || []).map(uc => uc.id),
      ...(memberCollectionsData || []).map(mc => mc.user_collection_id)
    ];

    if (allCollectionIds.length > 0) {
      const { data: completedData, error: completedError } = await supabase
        .from('user_completed_cards')
        .select('user_collection_id, card_id')
        .in('user_collection_id', allCollectionIds);

      if (completedError) console.error('Error fetching completed cards:', completedError);
      else {
        const completedMap = (completedData || []).reduce((acc, item) => {
          if (!acc[item.user_collection_id]) {
            acc[item.user_collection_id] = [];
          }
          acc[item.user_collection_id].push(item.card_id);
          return acc;
        }, {});
        setCompletedCards(completedMap);
      }
    }

    // Fetch activities for all user collections (owned and member)
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .in('user_collection_id', allCollectionIds)
      .order('created_at', { ascending: false });

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
    } else {
      setActivities(activitiesData || []);
    }

    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addCollection = async (collection: any, isPublic: boolean = true) => {
    if (!session) return false;

    const { data, error } = await supabase
      .from('user_collections')
      .insert({ user_id: session.user.id, collection_id: collection.id, is_public: isPublic })
      .select('*, collections(*, cards(*))')
      .single();

    if (error) {
      console.error('Error adding collection:', error);
      showError("Não foi possível adicionar a coleção.");
      return false;
    }

    if (data) {
      setUserCollections(prev => [...prev, data]);
    }
    return true;
  };

  const getCollectionById = useCallback((userCollectionId: number) => {
    // First check owned collections
    const uc = userCollections.find(c => c.id === userCollectionId);
    if (uc) {
      return { ...uc.collections, instanceId: uc.id, isPublic: uc.is_public, isArchived: uc.is_archived };
    }
    
    // If not found in owned collections, check member collections
    const mc = memberCollections.find(c => c.instanceId === userCollectionId);
    if (mc) {
      return { ...mc.collections, instanceId: mc.instanceId, isPublic: mc.is_public, isArchived: mc.is_archived };
    }
    
    return null;
  }, [userCollections, memberCollections]);

  const getCompletedCardsForCollection = useCallback((userCollectionId: number): Set<number> => {
    return new Set(completedCards[userCollectionId] || []);
  }, [completedCards]);

  const getActivitiesForCollection = useCallback((userCollectionId: number) => {
    return activities
      .filter((activity: any) => activity.user_collection_id === userCollectionId)
      .map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        timestamp: activity.created_at,
        comment: activity.metadata?.comment,
        cardId: activity.card_id
      }));
  }, [activities]);

  const getAchievementsForCollection = useCallback((userCollectionId: number) => {
    return activities
      .filter((activity: any) => 
        activity.user_collection_id === userCollectionId && 
        (activity.type === 'achievement_unlocked' || activity.type === 'completed_collection')
      )
      .map((activity: any) => ({
        percentage: activity.metadata?.percentage || 100,
        timestamp: activity.created_at
      }));
  }, [activities]);

  const completeCard = async (userCollectionId: number, cardId: number, cardTitle: string, completionData: { date: Date; comment: string; collectionComment: string }) => {
    if (!session) return;

    // 1. Insert completed card
    const { error } = await supabase
      .from('user_completed_cards')
      .insert({ user_collection_id: userCollectionId, card_id: cardId, completed_at: completionData.date.toISOString(), comment: completionData.comment });

    if (error) {
      console.error('Error completing card:', error);
      showError("Não foi possível salvar o progresso.");
      return;
    }

    // 2. Get collection info
    const collection = userCollections.find(uc => uc.id === userCollectionId);
    if (!collection) return;

    const totalCards = collection.collections?.cards?.length || 0;
    const currentCompletedCount = (completedCards[userCollectionId] || []).length;
    const newCompletedCount = currentCompletedCount + 1;
    const percentage = Math.floor((newCompletedCount / totalCards) * 100);

    // 3. Check for achievement milestones (25%, 50%, 75%, 100%)
    const previousPercentage = Math.floor((currentCompletedCount / totalCards) * 100);
    const milestones = [25, 50, 75, 100];
    
    for (const milestone of milestones) {
      if (percentage >= milestone && previousPercentage < milestone) {
        // Check if achievement already exists
        const { data: existingAchievement } = await supabase
          .from('activities')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('user_collection_id', userCollectionId)
          .eq('type', milestone === 100 ? 'completed_collection' : 'achievement_unlocked')
          .eq('metadata->>percentage', milestone.toString())
          .maybeSingle();

        if (!existingAchievement) {
          // Create achievement activity
          const activityType = milestone === 100 ? 'completed_collection' : 'achievement_unlocked';
          const metadata: any = { percentage: milestone };
          
          if (milestone === 100 && completionData.collectionComment) {
            metadata.comment = completionData.collectionComment;
          }

          const { error: achievementError } = await supabase.from('activities').insert({
            user_id: session.user.id,
            user_collection_id: userCollectionId,
            collection_id: collection.collections.id,
            type: activityType,
            metadata: metadata
          });

          if (achievementError) {
            console.error('Error creating achievement activity:', achievementError);
            console.log('Achievement data:', { user_id: session.user.id, user_collection_id: userCollectionId, type: activityType, metadata });
          }
        }
      }
    }

    // 4. Create completed_card activity (idempotent)
    // Avoid duplicates if this function is called twice quickly
    const { data: existingCompleted, error: checkCompletedError } = await supabase
      .from('activities')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('user_collection_id', userCollectionId)
      .eq('card_id', cardId)
      .eq('type', 'completed_card')
      .maybeSingle();

    if (checkCompletedError) {
      console.error('Error checking existing completed_card activity:', checkCompletedError);
    }

    if (!existingCompleted) {
      const { error: cardActivityError } = await supabase.from('activities').insert({
        user_id: session.user.id,
        user_collection_id: userCollectionId,
        collection_id: collection.collections.id,
        card_id: cardId,
        type: 'completed_card',
        metadata: { comment: completionData.comment }
      });

      if (cardActivityError) {
        console.error('Error creating card activity:', cardActivityError);
        console.log('Card activity data:', { user_id: session.user.id, user_collection_id: userCollectionId, card_id: cardId });
      }
    }

    // 5. Update local state
    setCompletedCards(prev => ({ ...prev, [userCollectionId]: [...(prev[userCollectionId] || []), cardId] }));
    showSuccess(`Card "${cardTitle}" completado!`);
    
    // 6. Show special message for milestones
    if (percentage === 100 && previousPercentage < 100) {
      setTimeout(() => showSuccess("🎉 Parabéns! Você ZEROU a coleção!"), 500);
    } else if ([25, 50, 75].includes(percentage) && !milestones.includes(previousPercentage)) {
      setTimeout(() => showSuccess(`🏆 Conquista desbloqueada: ${percentage}%!`), 500);
    }

    // 7. Refresh data to get new activities
    await fetchData();
  };
  
  const archiveCollection = async (userCollectionId: number) => {
    const { error } = await supabase.from('user_collections').update({ is_archived: true }).eq('id', userCollectionId);
    if (error) return console.error('Error archiving collection:', error);
    setUserCollections(prev => prev.map(c => c.id === userCollectionId ? { ...c, is_archived: true } : c));
  };

  const unarchiveCollection = async (userCollectionId: number) => {
    const { error } = await supabase.from('user_collections').update({ is_archived: false }).eq('id', userCollectionId);
    if (error) return console.error('Error unarchiving collection:', error);
    setUserCollections(prev => prev.map(c => c.id === userCollectionId ? { ...c, is_archived: false } : c));
  };

  const toggleCollectionPrivacy = async (userCollectionId: number) => {
    const collection = userCollections.find(c => c.id === userCollectionId);
    if (!collection) return;
    const { error } = await supabase.from('user_collections').update({ is_public: !collection.is_public }).eq('id', userCollectionId);
    if (error) return console.error('Error toggling privacy:', error);
    setUserCollections(prev => prev.map(c => c.id === userCollectionId ? { ...c, is_public: !collection.is_public } : c));
  };

  const resetCollection = async (userCollectionId: number) => {
    const { error } = await supabase.from('user_completed_cards').delete().eq('user_collection_id', userCollectionId);
    if (error) return console.error('Error resetting collection:', error);
    setCompletedCards(prev => {
      const newState = { ...prev };
      delete newState[userCollectionId];
      return newState;
    });
    showSuccess("Coleção resetada com sucesso!");
  };

  const activeCollections = [
    ...userCollections.filter(c => !c.is_archived).map(c => ({ ...c.collections, instanceId: c.id, isPublic: c.is_public, isArchived: c.is_archived })),
    ...memberCollections.filter(c => !c.is_archived).map(c => ({ ...c.collections, instanceId: c.instanceId, isPublic: c.is_public, isArchived: c.is_archived }))
  ];
  const archivedCollections = [
    ...userCollections.filter(c => c.is_archived).map(c => ({ ...c.collections, instanceId: c.id, isPublic: c.is_public, isArchived: c.is_archived })),
    ...memberCollections.filter(c => c.is_archived).map(c => ({ ...c.collections, instanceId: c.instanceId, isPublic: c.is_public, isArchived: c.is_archived }))
  ];

  // Funções para gerenciar likes de atividades
  const likeActivity = async (activityId: number) => {
    if (!session) return false;
    
    const { error } = await supabase
      .from('activity_likes')
      .upsert({ activity_id: activityId, user_id: session.user.id }, {
        onConflict: 'activity_id,user_id'
      });
    
    if (error) {
      console.error('Error liking activity:', error);
      showError("Não foi possível curtir a atividade.");
      return false;
    }
    return true;
  };

  const unlikeActivity = async (activityId: number) => {
    if (!session) return false;
    
    const { error } = await supabase
      .from('activity_likes')
      .delete()
      .eq('activity_id', activityId)
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Error unliking activity:', error);
      showError("Não foi possível descurtir a atividade.");
      return false;
    }
    return true;
  };

  // Funções para gerenciar comentários de atividades
  const addCommentToActivity = async (activityId: number, comment: string) => {
    if (!session) return false;
    
    const { error } = await supabase
      .from('activity_comments')
      .insert({ activity_id: activityId, user_id: session.user.id, comment });
    
    if (error) {
      console.error('Error adding comment:', error);
      showError("Não foi possível adicionar o comentário.");
      return false;
    }
    return true;
  };

  const removeCommentFromActivity = async (commentId: number) => {
    if (!session) return false;
    
    const { error } = await supabase
      .from('activity_comments')
      .update({ removed_at: new Date().toISOString() })
      .eq('id', commentId)
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Error removing comment:', error);
      showError("Não foi possível remover o comentário.");
      return false;
    }
    return true;
  };

  // Função para buscar comentários de uma coleção
  const getCommentsForCollection = useCallback(async (userCollectionId: number) => {
    if (!session) return [];
    
    const { data, error } = await supabase.rpc('get_collection_comments', {
      p_user_collection_id: userCollectionId,
      p_limit: 50,
      p_offset: 0
    });
    
    if (error) {
      console.error('Error fetching collection comments:', error);
      return [];
    }
    
    return data || [];
  }, [session]);

  // Função para buscar total de likes de uma coleção
  const getLikesForCollection = useCallback(async (userCollectionId: number) => {
    if (!session) return 0;
    
    const { data, error } = await supabase.rpc('get_collection_likes', {
      p_user_collection_id: userCollectionId
    });
    
    if (error) {
      console.error('Error fetching collection likes:', error);
      return 0;
    }
    
    return data || 0;
  }, [session]);

  const value = {
    loading,
    storeData: storeCollections,
    activeCollections,
    archivedCollections,
    addCollection,
    getCollectionById,
    getCompletedCardsForCollection,
    completeCard,
    archiveCollection,
    unarchiveCollection,
    toggleCollectionPrivacy,
    resetCollection,
    // Placeholders for temporarily disabled features
    globalFeed: [],
    likedCollections: new Set(),
    getActivitiesForCollection,
    getAchievementsForCollection,
    getCommentsForCollection,
    getLikesForCollection,
    toggleLikeCollection: () => showError("Funcionalidade em desenvolvimento."),
    // Novas funções para atividades
    likeActivity,
    unlikeActivity,
    addCommentToActivity,
    removeCommentFromActivity,
  };

  return (
    <CollectionStoreContext.Provider value={value}>
      {children}
    </CollectionStoreContext.Provider>
  );
};

export const useCollectionStore = () => {
  const context = useContext(CollectionStoreContext);
  if (context === undefined) {
    throw new Error('useCollectionStore must be used within a CollectionStoreProvider');
  }
  return context;
};