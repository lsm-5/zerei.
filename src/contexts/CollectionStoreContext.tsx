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
  const [completedCards, setCompletedCards] = useState<any>({});

  const fetchData = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: storeData, error: storeError } = await supabase
      .from('collections')
      .select('*, cards(*)');
    if (storeError) console.error('Error fetching store collections:', storeError);
    else setStoreCollections(storeData || []);

    const { data: userCollectionsData, error: userCollectionsError } = await supabase
      .from('user_collections')
      .select('*, collections(*, cards(*))')
      .eq('user_id', session.user.id);
    
    if (userCollectionsError) console.error('Error fetching user collections:', userCollectionsError);
    else setUserCollections(userCollectionsData || []);

    if (userCollectionsData) {
      const user_collection_ids = userCollectionsData.map(uc => uc.id);
      if (user_collection_ids.length > 0) {
        const { data: completedData, error: completedError } = await supabase
          .from('user_completed_cards')
          .select('user_collection_id, card_id')
          .in('user_collection_id', user_collection_ids);

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
    }

    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addCollection = async (collection: any, isPublic: boolean = true) => {
    if (!session) return false;

    const alreadyExists = userCollections.some(uc => uc.collection_id === collection.id);
    if (alreadyExists) {
      showError("Você já possui esta coleção.");
      return false;
    }

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
      showSuccess(`Coleção "${collection.title}" adicionada!`);
    }
    return true;
  };

  const getCollectionById = (userCollectionId: number) => {
    const uc = userCollections.find(c => c.id === userCollectionId);
    return uc ? { ...uc.collections, instanceId: uc.id, isPublic: uc.is_public, isArchived: uc.is_archived } : null;
  };

  const getCompletedCardsForCollection = (userCollectionId: number): Set<number> => {
    return new Set(completedCards[userCollectionId] || []);
  };

  const completeCard = async (userCollectionId: number, cardId: number, cardTitle: string, completionData: { date: Date; comment: string; collectionComment: string }) => {
    const { error } = await supabase
      .from('user_completed_cards')
      .insert({ user_collection_id: userCollectionId, card_id: cardId, completed_at: completionData.date.toISOString(), comment: completionData.comment });

    if (error) {
      console.error('Error completing card:', error);
      showError("Não foi possível salvar o progresso.");
      return;
    }

    setCompletedCards(prev => ({ ...prev, [userCollectionId]: [...(prev[userCollectionId] || []), cardId] }));
    showSuccess(`Card "${cardTitle}" completado!`);
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

  const activeCollections = userCollections.filter(c => !c.is_archived).map(c => ({ ...c.collections, instanceId: c.id, isPublic: c.is_public, isArchived: c.is_archived }));
  const archivedCollections = userCollections.filter(c => c.is_archived).map(c => ({ ...c.collections, instanceId: c.id, isPublic: c.is_public, isArchived: c.is_archived }));

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
    getActivitiesForCollection: () => [],
    getAchievementsForCollection: () => [],
    getCommentsForCollection: () => [],
    toggleLikeCollection: () => showError("Funcionalidade em desenvolvimento."),
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