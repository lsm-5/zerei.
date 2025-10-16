import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Layers, Bell, Check, X, Gift } from "lucide-react";
import { useCollectionStore } from "@/contexts/CollectionStoreContext";
import { showError, showSuccess } from "@/utils/toast";
import { useSettingsStore } from "@/hooks/useSettingsStore";

const initialMockNotifications: any[] = [];

const Header = () => {
  const { session, logout } = useAuth();
  const user = session?.user;
  const { addCollection, storeData } = useCollectionStore();
  const { settings } = useSettingsStore();
  const [notifications, setNotifications] = useState(initialMockNotifications);

  useEffect(() => {
    const SHOWN_NOTIFS_KEY = 'shown_new_collection_notifs_v1';
    const shownNotifs = JSON.parse(localStorage.getItem(SHOWN_NOTIFS_KEY) || '[]');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newCollections = storeData.filter((collection: any) => 
      new Date(collection.createdAt) > sevenDaysAgo && !shownNotifs.includes(collection.id)
    );

    if (newCollections.length > 0) {
      const newNotifications = newCollections.map((collection: any) => ({
        id: `new-${collection.id}`,
        type: 'new_collection',
        category: 'storeUpdates',
        text: `Nova coleção na loja: "${collection.title}"!`,
        time: 'Agora mesmo',
      }));

      setNotifications(prev => [...newNotifications, ...prev]);

      const updatedShownNotifs = [...shownNotifs, ...newCollections.map((c: any) => c.id)];
      localStorage.setItem(SHOWN_NOTIFS_KEY, JSON.stringify(updatedShownNotifs));
    }
  }, [storeData]);

  const handleAcceptInvite = (notificationId: number, collectionId: number) => {
    const collectionToAdd = storeData.find((c: any) => c.id === collectionId);
    if (collectionToAdd) {
      const success = addCollection(collectionToAdd);
      if (success) {
        showSuccess(`Você entrou na coleção "${collectionToAdd.title}"!`);
      } else {
        showError(`Você já faz parte da coleção "${collectionToAdd.title}".`);
      }
    } else {
      showError("Não foi possível encontrar a coleção.");
    }
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleDeclineInvite = (notificationId: number) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const filteredNotifications = notifications.filter(n => {
    return settings.notifications[n.category as keyof typeof settings.notifications] ?? true;
  });

  const avatarSrc = settings.profile.useInitialAvatar 
    ? '' 
    : `https://api.dicebear.com/8.x/lorelei/svg?seed=${settings.profile.avatarSeed || user?.email}`;

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto flex items-center justify-between p-4">
        <NavLink to="/" className="flex items-center gap-2 text-xl font-bold">
          <Layers className="h-6 w-6 text-primary" />
          <span className="font-heading">Zerei.</span>
        </NavLink>
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink to="/" className={({ isActive }) => `text-sm transition-colors hover:text-primary ${isActive ? 'font-bold text-primary' : 'font-medium text-muted-foreground'}`} end>
            Feed
          </NavLink>
          <NavLink to="/colecoes" className={({ isActive }) => `text-sm transition-colors hover:text-primary ${isActive ? 'font-bold text-primary' : 'font-medium text-muted-foreground'}`}>
            Coleções
          </NavLink>
          <NavLink to="/loja" className={({ isActive }) => `text-sm transition-colors hover:text-primary ${isActive ? 'font-bold text-primary' : 'font-medium text-muted-foreground'}`}>
            Loja
          </NavLink>
          <NavLink to="/amigos" className={({ isActive }) => `text-sm transition-colors hover:text-primary ${isActive ? 'font-bold text-primary' : 'font-medium text-muted-foreground'}`}>
            Amigos
          </NavLink>
        </nav>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="h-5 w-5" />
                {filteredNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filteredNotifications.length > 0 ? filteredNotifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-2" onSelect={(e) => e.preventDefault()}>
                  <div className="flex items-start gap-3 w-full">
                    {notification.type === 'new_collection' && <Gift className="h-4 w-4 mt-1 text-primary flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium whitespace-normal">{notification.text}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                  {notification.type === 'collection_invite' && (
                    <div className="flex gap-2 mt-2 self-end">
                      <Button size="sm" variant="outline" onClick={() => handleDeclineInvite(notification.id)}>
                        <X className="h-4 w-4 mr-1" /> Recusar
                      </Button>
                      <Button size="sm" onClick={() => handleAcceptInvite(notification.id, notification.collectionId!)}>
                        <Check className="h-4 w-4 mr-1" /> Aceitar
                      </Button>
                    </div>
                  )}
                </DropdownMenuItem>
              )) : (
                <p className="p-4 text-sm text-muted-foreground text-center">Nenhuma notificação nova.</p>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer h-9 w-9">
                <AvatarImage src={avatarSrc} alt={user?.user_metadata.name} />
                <AvatarFallback>{user?.user_metadata.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.user_metadata.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <NavLink to="/config">
                <DropdownMenuItem className="cursor-pointer">
                  Configurações
                </DropdownMenuItem>
              </NavLink>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer focus:bg-red-100 focus:text-red-600">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;