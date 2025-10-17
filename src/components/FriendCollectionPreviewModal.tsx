import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2 } from "lucide-react";

interface Card {
  id: number;
  title: string;
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
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-start">
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
              <ScrollArea className="h-48 md:h-64 rounded-md border p-4">
                <ul className="space-y-3">
                  {collection.cards.map((card, index) => (
                    <li key={card.id} className={`flex items-center gap-3 text-sm ${collection.completedCardIds.has(card.id) ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                      {collection.completedCardIds.has(card.id) ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex-shrink-0 flex items-center justify-center">
                          <span className="text-xs font-mono">{index + 1}</span>
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