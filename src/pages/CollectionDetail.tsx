import { useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ScratchCard from "@/components/ScratchCard";
import ScratchCardModal from "@/components/ScratchCardModal";
import CardStack from "@/components/CardStack";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, Layers, List, Heart } from "lucide-react";
import { useCollectionStore } from "@/contexts/CollectionStoreContext";
import ActivityFeed from "@/components/ActivityFeed";
import AchievementBadges from "@/components/AchievementBadges";
import CollectionCardListItem from "@/components/CollectionCardListItem";
import { Separator } from "@/components/ui/separator";
import CollectionComments from "@/components/CollectionComments";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CollectionDetailPage = () => {
  const { id } = useParams();
  const instanceId = Number(id);
  const { getCollectionById, getCompletedCardsForCollection, completeCard, getActivitiesForCollection, getAchievementsForCollection, getCommentsForCollection, likedCollections, toggleLikeCollection } = useCollectionStore();
  
  const collection = getCollectionById(instanceId);
  
  const [viewMode, setViewMode] = useState<'grid' | 'stack' | 'list'>('stack');
  const [selectedCard, setSelectedCard] = useState<any | null>(null);

  if (!collection) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold">Coleção não encontrada</h1>
          <p className="text-muted-foreground mt-2">A coleção que você está procurando não existe ou foi movida.</p>
        </div>
      </Layout>
    );
  }

  const completedCards = getCompletedCardsForCollection(instanceId);
  const activities = getActivitiesForCollection(instanceId);
  const achievements = getAchievementsForCollection(instanceId);
  const collectionComments = getCommentsForCollection(collection.id);

  const handleCompleteCard = (cardId: number, cardTitle: string, completionData: { date: Date; comment: string; collectionComment: string }) => {
    completeCard(instanceId, cardId, cardTitle, completionData);
  };

  const isLiked = likedCollections.has(collection.id);
  const likeCount = (collection.likes || 0) + (isLiked ? 1 : 0);

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h1 className="text-3xl font-bold">{collection.title}</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleLikeCollection(collection.id)}
                className="shrink-0"
              >
                <Heart className={cn("mr-2 h-4 w-4", isLiked && "fill-red-500 text-red-500")} />
                {likeCount}
              </Button>
            </div>
            <p className="text-muted-foreground">{collection.subtitle}</p>
          </div>
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'stack' | 'list')}>
            <ToggleGroupItem value="grid" aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="stack" aria-label="Stack view"><Layers className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view"><List className="h-4 w-4" /></ToggleGroupItem>
          </ToggleGroup>
        </div>

        {viewMode === 'stack' && (
          <div className="flex justify-center">
            <CardStack cards={collection.cards} onCardClick={setSelectedCard} completedCards={completedCards} />
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {collection.cards.map((card: any, index: number) => (
              <div key={card.id} className="opacity-0 animate-slide-up cursor-pointer transition-transform duration-300 hover:scale-105" style={{ animationDelay: `${index * 75}ms` }} onClick={() => setSelectedCard(card)}>
                <ScratchCard card={card} scratchable={false} number={index + 1} isCompleted={completedCards.has(card.id)} />
              </div>
            ))}
          </div>
        )}
        
        {viewMode === 'list' && (
          <div className="space-y-4">
            {collection.cards.map((card: any, index: number) => {
              const completionActivity = activities.find((act: any) => act.cardId === card.id);
              const completionDate = completionActivity ? new Date(completionActivity.timestamp) : null;
              return (
                <CollectionCardListItem
                  key={card.id}
                  card={card}
                  number={index + 1}
                  isCompleted={completedCards.has(card.id)}
                  onClick={() => setSelectedCard(card)}
                  completionDate={completionDate}
                />
              );
            })}
          </div>
        )}

        <Separator className="my-8" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Comentários</h2>
            <CollectionComments comments={collectionComments} />
          </div>
          <div className="space-y-6">
            <AchievementBadges achievements={achievements} totalCount={collection.cards.length} tags={collection.tags} />
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>

      <ScratchCardModal 
        card={selectedCard}
        isCardCompleted={selectedCard ? completedCards.has(selectedCard.id) : false}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        onComplete={handleCompleteCard}
        collectionInfo={{
          collectionId: instanceId,
          subtitle: collection.subtitle,
          completedCount: completedCards.size,
          totalCount: collection.cards.length,
        }}
        activities={activities}
      />
    </Layout>
  );
};

export default CollectionDetailPage;