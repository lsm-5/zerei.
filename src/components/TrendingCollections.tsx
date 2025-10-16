import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useCollectionStore } from "@/contexts/CollectionStoreContext";

const TrendingCollections = () => {
  const { storeData } = useCollectionStore();

  // Get the top 3 collections based on acquisitions
  const trending = [...storeData]
    .sort((a: any, b: any) => b.acquisitions - a.acquisitions)
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coleções em Alta</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {trending.map((collection: any) => (
            <li key={collection.id}>
              <Link to="/loja" className="flex items-center gap-4 group">
                <img
                  src={collection.cover}
                  alt={collection.title}
                  className="w-16 h-20 object-cover rounded-md group-hover:opacity-80 transition-opacity"
                />
                <div>
                  <p className="font-semibold leading-tight group-hover:text-primary transition-colors">{collection.title}</p>
                  <p className="text-sm text-muted-foreground">{collection.subtitle}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TrendingCollections;