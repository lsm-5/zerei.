import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import CollectionPreviewModal from "@/components/CollectionPreviewModal";
import { useCollectionStore } from "@/contexts/CollectionStoreContext";
import { showSuccess, showError } from "@/utils/toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";

const StorePage = () => {
  const [selectedCollection, setSelectedCollection] = useState<any | null>(null);
  const { addCollection, storeData } = useCollectionStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    storeData.forEach((collection: any) => {
      (collection.tags || []).forEach((tag: string) => tags.add(tag));
    });
    const sortedTags = Array.from(tags).sort();
    return ["Todos", ...sortedTags];
  }, [storeData]);

  const filteredCollections = useMemo(() => {
    return storeData.filter((collection: any) => {
      const matchesSearch = searchTerm === "" ||
        collection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTag = selectedTag === null || selectedTag === "Todos" || (collection.tags || []).includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [searchTerm, selectedTag, storeData]);

  const handleAcquireCollection = (collection: any, isPublic: boolean) => {
    const success = addCollection(collection, isPublic);
    if (success) {
      showSuccess(`Coleção "${collection.title}" adicionada!`);
    } else {
      showError("Você já possui esta coleção.");
    }
    setSelectedCollection(null);
  };

  return (
    <Layout>
      <div className="flex flex-col w-full animate-fade-in">
        <h1 className="text-3xl font-bold mb-4">Loja de Coleções</h1>
        <p className="text-muted-foreground mb-8">Explore novas coleções para adicionar ao seu acervo.</p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar coleções..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag || (tag === "Todos" && selectedTag === null) ? "default" : "outline"}
                onClick={() => setSelectedTag(tag === "Todos" ? null : tag)}
                className="whitespace-nowrap"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {filteredCollections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection: any) => (
              <div 
                key={collection.id}
                className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer aspect-[9/14]"
                onClick={() => setSelectedCollection(collection)}
              >
                <div className={`absolute z-10 transform -rotate-45 ${collection.price === 0 ? 'bg-green-600' : 'bg-blue-600'} text-center text-white font-semibold py-1 left-[-35px] top-[22px] w-[160px] shadow-lg text-sm`}>
                  {collection.price === 0 ? 'Grátis' : `R$ ${collection.price.toFixed(2).replace('.', ',')}`}
                </div>

                <img 
                  src={collection.cover} 
                  alt={collection.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                
                <div className="absolute top-3 right-3 z-10 flex flex-wrap gap-2 justify-end">
                  {(collection.tags || []).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="backdrop-blur-sm bg-black/30 text-white border-none">{tag}</Badge>
                  ))}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-bold text-lg truncate">{collection.title}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-white/90 text-sm truncate flex-1">{collection.subtitle}</p>
                    <div className="flex items-center gap-1 text-white/90">
                      <Users className="h-4 w-4" />
                      <span className="text-xs font-bold">{collection.acquisitions}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Nenhuma coleção encontrada com os filtros selecionados.</p>
          </div>
        )}
      </div>

      <CollectionPreviewModal
        collection={selectedCollection}
        isOpen={!!selectedCollection}
        onClose={() => setSelectedCollection(null)}
        onAcquire={handleAcquireCollection}
      />
    </Layout>
  );
};

export default StorePage;