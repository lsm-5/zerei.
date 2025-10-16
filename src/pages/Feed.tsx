import Layout from "@/components/Layout";
import { Layers } from "lucide-react";

const FeedPage = () => {
  return (
    <Layout>
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-6 text-xl font-semibold">Bem-vindo ao Zerei!</h2>
        <p className="mt-2 text-muted-foreground">
          Adquira coleções na loja e comece a completar seus cards.
          <br />
          Sua atividade e a de seus amigos aparecerão aqui em breve!
        </p>
      </div>
    </Layout>
  );
};

export default FeedPage;