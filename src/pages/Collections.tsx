import { useState } from "react";
import Layout from "@/components/Layout";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MoreHorizontal, Archive, Inbox, Eye, Lock } from "lucide-react";
import { useCollectionStore } from "@/contexts/CollectionStoreContext";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CollectionsPage = () => {
  const { activeCollections, archivedCollections, archiveCollection, unarchiveCollection, resetCollection, getCompletedCardsForCollection, toggleCollectionPrivacy } = useCollectionStore();
  const [showArchived, setShowArchived] = useState(false);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const pageTitle = showArchived ? "Coleções Arquivadas" : "Minhas Coleções";
  const publicCollections = activeCollections.filter((c: any) => c.isPublic);
  const privateCollections = activeCollections.filter((c: any) => !c.isPublic);

  const renderCollectionGrid = (collections: any[]) => {
    if (collections.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
          <p className="text-muted-foreground">Nenhuma coleção encontrada.</p>
        </div>
      );
    }

    return collections.map((collection: any) => {
      const completedCount = getCompletedCardsForCollection(collection.instanceId).size;
      const totalCount = collection.cards.length;
      const linkId = collection.instanceId || collection.id;

      return (
        <div key={linkId} className="relative group">
          <div className="absolute top-4 right-16 z-10 flex items-center gap-2">
            <div className="p-1.5 bg-black/50 text-white rounded-md backdrop-blur-sm" title={collection.isPublic ? 'Pública' : 'Privada'}>
              {collection.isPublic ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </div>
            <div className="px-2 py-1 bg-black/50 text-white text-xs font-semibold rounded-md backdrop-blur-sm">
              {completedCount} / {totalCount}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30 text-white"
                onClick={handleMenuClick}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={handleMenuClick}>
              <DropdownMenuItem onClick={() => toggleCollectionPrivacy(collection.instanceId)}>
                {collection.isPublic ? 'Tornar Privada' : 'Tornar Pública'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => resetCollection(collection.instanceId)}>
                Resetar coleção
              </DropdownMenuItem>
              <Separator />
              {showArchived ? (
                <DropdownMenuItem onClick={() => unarchiveCollection(collection.instanceId)}>
                  Desarquivar coleção
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-red-500" onClick={() => archiveCollection(collection.instanceId)}>
                  Arquivar coleção
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link to={`/colecoes/${linkId}`}>
            <div className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer aspect-[9/14]">
              <img 
                src={collection.cover} 
                alt={collection.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white font-bold text-lg truncate">{collection.title}</h3>
                <p className="text-white/90 text-sm truncate flex-1">{collection.subtitle}</p>
              </div>
            </div>
          </Link>
        </div>
      );
    });
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{pageTitle}</h1>
        <Button variant="outline" onClick={() => setShowArchived(!showArchived)}>
          {showArchived ? <Inbox className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
          {showArchived ? "Ver Ativas" : "Ver Arquivadas"}
        </Button>
      </div>

      {showArchived ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderCollectionGrid(archivedCollections)}
        </div>
      ) : (
        <Tabs defaultValue="public">
          <TabsList className="grid w-full grid-cols-2 sm:w-96">
            <TabsTrigger value="public">Públicas ({publicCollections.length})</TabsTrigger>
            <TabsTrigger value="private">Privadas ({privateCollections.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="public" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderCollectionGrid(publicCollections)}
            </div>
          </TabsContent>
          <TabsContent value="private" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderCollectionGrid(privateCollections)}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </Layout>
  );
};

export default CollectionsPage;