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
import NotificationBell from "./NotificationBell";
import { getInitials, getDisplayName } from "@/utils/avatarHelpers";

const Header = () => {
  const { session, logout } = useAuth();
  const user = session?.user;
  const { addCollection, storeData } = useCollectionStore();
  const { settings } = useSettingsStore();


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
          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer h-9 w-9">
                <AvatarImage src={avatarSrc} alt={user?.user_metadata.name} />
                <AvatarFallback>{getInitials(user?.user_metadata.name)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none break-words">
                    {getDisplayName(user?.user_metadata.name, user?.email)}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground break-words">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <NavLink to="/config">
                <DropdownMenuItem className="cursor-pointer py-2">
                  Configurações
                </DropdownMenuItem>
              </NavLink>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer focus:bg-red-100 focus:text-red-600 py-2">
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