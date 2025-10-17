-- Script com função corrigida para criar coleção a partir de JSON
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar colunas se não existirem
ALTER TABLE cards ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS cover TEXT;

-- 2. Função corrigida para criar coleção a partir de JSON
CREATE OR REPLACE FUNCTION create_collection_from_json(collection_json JSONB)
RETURNS TABLE(collection_id INTEGER, cards_created INTEGER) AS $$
DECLARE
    new_collection_id INTEGER;
    card_item JSONB;
    cards_count INTEGER := 0;
    collection_data JSONB;
BEGIN
    -- Extrair dados da coleção do objeto "collection"
    collection_data := collection_json->'collection';
    
    -- Inserir a coleção
    INSERT INTO collections (title, subtitle, description, cover)
    VALUES (
        collection_data->>'title',
        collection_data->>'subtitle',
        collection_data->>'description',
        collection_data->>'cover'
    )
    RETURNING id INTO new_collection_id;
    
    -- Inserir os cards
    FOR card_item IN SELECT * FROM jsonb_array_elements(collection_json->'cards')
    LOOP
        INSERT INTO cards (collection_id, title, description, order_index, cover)
        VALUES (
            new_collection_id,
            card_item->>'title',
            card_item->>'description',
            (card_item->>'order_index')::INTEGER,
            card_item->>'cover'
        );
        cards_count := cards_count + 1;
    END LOOP;
    
    -- Retornar resultado
    RETURN QUERY SELECT new_collection_id, cards_count;
END;
$$ LANGUAGE plpgsql;

-- 3. Testar a função com o JSON
SELECT * FROM create_collection_from_json('{
  "collection": {
    "title": "Top 10 Jogos de Todos os Tempos",
    "subtitle": "Uma seleção dos maiores clássicos",
    "description": "Descubra os jogos que marcaram gerações e definiram a indústria dos videogames. Cada card representa um título icônico que todo gamer deveria conhecer.",
    "cover": "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  "cards": [
    {
      "title": "The Legend of Zelda: Ocarina of Time",
      "description": "O épico de aventura que definiu o gênero action-RPG",
      "order_index": 1,
      "cover": "https://picsum.photos/seed/TheLegendofZeldaOcarinaofTime1/400/560"
    },
    {
      "title": "Super Mario 64",
      "description": "O primeiro jogo 3D do encanador mais famoso do mundo",
      "order_index": 2,
      "cover": "https://picsum.photos/seed/SuperMario642/400/560"
    },
    {
      "title": "Chrono Trigger",
      "description": "A obra-prima do RPG japonês com múltiplos finais",
      "order_index": 3,
      "cover": "https://picsum.photos/seed/ChronoTrigger3/400/560"
    },
    {
      "title": "Final Fantasy VII",
      "description": "O RPG que popularizou o gênero no ocidente",
      "order_index": 4,
      "cover": "https://picsum.photos/seed/FinalFantasyVII4/400/560"
    },
    {
      "title": "Half-Life 2",
      "description": "O FPS que revolucionou a narrativa em jogos",
      "order_index": 5,
      "cover": "https://picsum.photos/seed/HalfLife25/400/560"
    },
    {
      "title": "Portal 2",
      "description": "O puzzle game com humor e mecânicas únicas",
      "order_index": 6,
      "cover": "https://picsum.photos/seed/Portal26/400/560"
    },
    {
      "title": "Red Dead Redemption 2",
      "description": "O western épico com mundo aberto imersivo",
      "order_index": 7,
      "cover": "https://picsum.photos/seed/RedDeadRedemption27/400/560"
    },
    {
      "title": "The Witcher 3: Wild Hunt",
      "description": "O RPG de mundo aberto com narrativa excepcional",
      "order_index": 8,
      "cover": "https://picsum.photos/seed/TheWitcher3WildHunt8/400/560"
    },
    {
      "title": "Minecraft",
      "description": "O sandbox que conquistou o mundo",
      "order_index": 9,
      "cover": "https://picsum.photos/seed/Minecraft9/400/560"
    },
    {
      "title": "Tetris",
      "description": "O puzzle atemporal que nunca sai de moda",
      "order_index": 10,
      "cover": "https://picsum.photos/seed/Tetris10/400/560"
    }
  ]
}'::JSONB);

-- 4. Verificar se foi criada corretamente
SELECT 
  c.id,
  c.title,
  c.subtitle,
  COUNT(cards.id) as total_cards
FROM collections c
LEFT JOIN cards ON c.id = cards.collection_id
WHERE c.title = 'Top 10 Jogos de Todos os Tempos'
GROUP BY c.id, c.title, c.subtitle;
