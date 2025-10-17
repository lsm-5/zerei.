-- Script para corrigir a RPC get_activities_with_engagement
-- Problema: Feed mostra dono da coleção ao invés de quem realmente raspou o card
-- Solução: Usar activities.user_id (quem fez a ação) ao invés de user_collections.user_id

-- Remover função existente se houver
DROP FUNCTION IF EXISTS get_activities_with_engagement(UUID, INT, INT);

-- Recriar função com JOIN correto e aliases específicos
CREATE OR REPLACE FUNCTION get_activities_with_engagement(
  p_user_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  activity_id BIGINT,
  user_id UUID,
  user_name TEXT,
  user_avatar TEXT,
  type TEXT,
  collection_id INTEGER,
  collection_title TEXT,
  collection_cover TEXT,
  card_id INTEGER,
  card_title TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  like_count BIGINT,
  user_liked BOOLEAN,
  comment_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id AS activity_id,
    a.user_id,  -- ← CRÍTICO: user_id de quem FEZ a ação (activities.user_id)
    p.name AS user_name,
    p.avatar_url AS user_avatar,
    a.type,
    c.id AS collection_id,
    c.title AS collection_title,
    c.cover AS collection_cover,
    card.id AS card_id,
    card.title AS card_title,
    a.metadata,
    a.created_at,
    COALESCE(like_counts.like_count, 0) AS like_count,
    COALESCE(user_likes.user_liked, FALSE) AS user_liked,
    COALESCE(comment_counts.comment_count, 0) AS comment_count
  FROM activities a
  -- JOIN com profiles usando activities.user_id (quem fez a ação)
  LEFT JOIN profiles p ON p.id = a.user_id
  LEFT JOIN collections c ON c.id = a.collection_id
  LEFT JOIN cards card ON card.id = a.card_id
  -- Contagem de likes
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS like_count
    FROM activity_likes al
    WHERE al.activity_id = a.id
  ) like_counts ON TRUE
  -- Verificar se o usuário atual curtiu
  LEFT JOIN LATERAL (
    SELECT TRUE AS user_liked
    FROM activity_likes al2
    WHERE al2.activity_id = a.id AND al2.user_id = p_user_id
  ) user_likes ON TRUE
  -- Contagem de comentários
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS comment_count
    FROM activity_comments ac
    WHERE ac.activity_id = a.id
  ) comment_counts ON TRUE
  WHERE 
    -- Se p_user_id é NULL, buscar todas as atividades públicas
    (p_user_id IS NULL OR a.user_id = p_user_id)
  ORDER BY a.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Comentário explicativo:
-- Esta função corrige o problema onde o feed mostrava o dono da coleção
-- ao invés de quem realmente completou o card. Agora usa activities.user_id
-- que é o ID de quem realmente fez a ação (raspou o card).
--
-- Diferença chave:
-- - ANTES: JOIN com user_collections.user_id (dono da coleção)
-- - AGORA: JOIN com activities.user_id (quem fez a ação)
--
-- Correções aplicadas:
-- - Removido user_email (não existe na tabela profiles)
-- - Usado aliases específicos para evitar ambiguidade
-- - Corrigido JOIN para usar activities.user_id
-- - Corrigido tipos de dados (activity_id como BIGINT, type como TEXT, outros IDs como INTEGER)
--
-- Resultado: Feed mostra corretamente "User B completou Card 1" quando
-- User B raspa um card em uma coleção compartilhada de User A.
