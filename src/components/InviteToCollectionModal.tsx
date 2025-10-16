import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCollectionStore } from "@/contexts/CollectionStoreContext";
import { showSuccess } from '@/utils/toast';
import { Send } from 'lucide-react';

interface InviteToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  friendName: string;
}

const InviteToCollectionModal = ({ isOpen, onClose, friendName }: InviteToCollectionModalProps) => {
  const { activeCollections } = useCollectionStore();
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);

  const handleInvite = () => {
    if (selectedCollectionId) {
      const collection = activeCollections.find((c: any) => c.id === selectedCollectionId);
      showSuccess(`Convite enviado para ${friendName} para a coleção "${collection.title}"!`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar {friendName}</DialogTitle>
          <DialogDescription>Selecione uma de suas coleções para convidar {friendName} para participar.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h4 className="font-semibold mb-2">Suas Coleções Ativas:</h4>
          <ScrollArea className="h-64 rounded-md border">
            <div className="p-4 space-y-2">
              {activeCollections.map((collection: any) => (
                <div
                  key={collection.id}
                  className={`p-3 rounded-md cursor-pointer border-2 ${selectedCollectionId === collection.id ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-accent'}`}
                  onClick={() => setSelectedCollectionId(collection.id)}
                >
                  <p className="font-semibold">{collection.title}</p>
                  <p className="text-sm text-muted-foreground">{collection.subtitle}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleInvite} disabled={!selectedCollectionId}>
            <Send className="mr-2 h-4 w-4" />
            Enviar Convite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteToCollectionModal;