import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2 } from "lucide-react";

interface Card {
  id: number;
  title: string;
  image?: string;
  cover?: string;
}

interface Collection {
  id: number;
  title: string;
  subtitle: string;
  cover: string;
  cards: Card[];
  completedCount: number;
  totalCount: number;
  completedCardIds: Set<number>;
}

interface FriendCollectionPreviewModalProps {
  collection: Collection | null;
  isOpen: boolean;
  onClose: () => void;
}

const FriendCollectionPreviewModal = ({ collection, isOpen, onClose }: FriendCollectionPreviewModalProps) => {
  if (!collection) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="w-full">
            <img src={collection.cover} alt={collection.title} className="rounded-lg shadow-lg aspect-[9/14] object-cover w-full" />
          </div>
          <div className="flex flex-col h-full">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl">{collection.title}</DialogTitle>
              <DialogDescription>{collection.subtitle}</DialogDescription>
            </DialogHeader>
            <div className="py-4 flex-grow">
              <h4 className="font-semibold mb-2">Progresso ({collection.completedCount}/{collection.totalCount}):</h4>
              <ScrollArea className="h-64 rounded-md border p-4">
                <ul className="space-y-3">
                  {collection.cards.map((card, index) => (
                    <li key={card.id} className={`flex items-center gap-3 text-sm ${collection.completedCardIds.has(card.id) ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                      {collection.completedCardIds.has(card.id) ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <span className="font-mono w-7 text-center flex-shrink-0">{index + 1}.</span>
                      )}
                      {card.image && (
                        <div className="w-12 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <img 
                            src={collection.completedCardIds.has(card.id) && card.cover ? card.cover : card.image} 
                            alt={card.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <span className="truncate">{card.title}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FriendCollectionPreviewModal;