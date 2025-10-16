import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";

interface Collection {
  id: number;
  title: string;
  subtitle: string;
  cover: string;
}

interface Invitation {
  id: number;
  inviter: {
    name: string;
    avatar: string;
  };
  collection: Collection;
}

interface CollectionInviteCardProps {
  invitation: Invitation;
  onAccept: (inviteId: number, collectionId: number) => void;
  onDecline: (inviteId: number) => void;
  onPreview: (collection: Collection) => void;
}

const CollectionInviteCard = ({ invitation, onAccept, onDecline, onPreview }: CollectionInviteCardProps) => {
  const { inviter, collection } = invitation;

  return (
    <Card className="border-primary/50 border-2 animate-fade-in flex flex-col">
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={inviter.avatar} alt={inviter.name} />
            <AvatarFallback>{inviter.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="text-sm">
            <span className="font-semibold">{inviter.name}</span> convidou você para participar.
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow cursor-pointer" onClick={() => onPreview(collection)}>
        <div className="relative group overflow-hidden aspect-[9/14] h-full">
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
      </CardContent>
      <CardFooter className="p-3 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => onDecline(invitation.id)}>
          <X className="h-4 w-4 mr-2" />
          Recusar
        </Button>
        <Button onClick={() => onAccept(invitation.id, collection.id)}>
          <Check className="h-4 w-4 mr-2" />
          Aceitar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CollectionInviteCard;