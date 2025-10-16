import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Card {
  id: number;
  title: string;
}

interface Collection {
  id: number;
  title: string;
  subtitle: string;
  cover: string;
  cards: Card[];
}

interface CollectionPreviewModalProps {
  collection: Collection | null;
  isOpen: boolean;
  onClose: () => void;
  onAcquire: (collection: Collection, isPublic: boolean) => void;
  showAcquireButton?: boolean;
}

const CollectionPreviewModal = ({ collection, isOpen, onClose, onAcquire, showAcquireButton = true }: CollectionPreviewModalProps) => {
  const [isPublic, setIsPublic] = useState(true);

  if (!collection) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="w-full">
            <img 
              src={collection.cover} 
              alt={collection.title} 
              className="rounded-lg shadow-lg aspect-[9/14] object-cover w-full" 
            />
          </div>
          <div className="flex flex-col h-full">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl">{collection.title}</DialogTitle>
              <DialogDescription>{collection.subtitle}</DialogDescription>
            </DialogHeader>
            <div className="py-4 flex-grow">
              <h4 className="font-semibold mb-2">Cards nesta coleção:</h4>
              <ScrollArea className="h-56 rounded-md border p-4">
                <ul className="space-y-2">
                  {collection.cards.map((card, index) => (
                    <li key={card.id} className="flex items-center text-sm">
                      <span className="font-mono text-muted-foreground mr-3">{index + 1}.</span>
                      <span>{card.title}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
            {showAcquireButton && (
              <div className="flex items-center space-x-2 pt-4">
                <Switch id="public-switch" checked={isPublic} onCheckedChange={setIsPublic} />
                <Label htmlFor="public-switch">Tornar pública</Label>
              </div>
            )}
            <DialogFooter className="pt-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                {showAcquireButton ? 'Cancelar' : 'Fechar'}
              </Button>
              {showAcquireButton && (
                <Button type="button" onClick={() => onAcquire(collection, isPublic)}>
                  <Check className="mr-2 h-4 w-4" />
                  Obter Coleção
                </Button>
              )}
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionPreviewModal;