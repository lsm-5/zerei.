import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from 'lucide-react';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (email: string) => void;
}

const AddFriendModal = ({ isOpen, onClose, onAddFriend }: AddFriendModalProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email válido.');
      return;
    }
    onAddFriend(email);
    setEmail('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Amigo</DialogTitle>
          <DialogDescription>
            Digite o email do seu amigo para enviar uma solicitação.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="friend-email">Email do Amigo</Label>
          <Input
            id="friend-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="amigo@exemplo.com"
            type="email"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit}>
            <UserPlus className="mr-2 h-4 w-4" />
            Enviar Solicitação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;