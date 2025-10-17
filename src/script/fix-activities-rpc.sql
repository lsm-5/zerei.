-- Script para corrigir o RPC get_activities_with_engagement
-- Execute este script no SQL Editor do Supabase

-- Recriar o RPC get_activities_with_engagement para garantir que retorna o user_id correto
CREATE OR REPLACE FUNCTION get_activities_with_engagement(
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  activity_id INTEGER,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  user_avatar TEXT,
  type TEXT,
  collection_id INTEGER,
  collection_title TEXT,
  collection_cover TEXT,
  card_id INTEGER,
  card_title TEXT,
  card_cover TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  like_count BIGINT,
  user_liked BOOLEAN,
  comment_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as activity_id,
    a.user_id,  -- ← IMPORTANTE: Sempre retorna o user_id da tabela activities
    COALESCE(p.name, 'Usuário') as user_name,
    COALESCE(p.email, '') as user_email,
    COALESCE(p.avatar_url, '') as user_avatar,
    a.type,
    a.collection_id,
    c.title as collection_title,
    c.cover as collection_cover,
    a.card_id,
    cards.title as card_title,
    cards.cover as card_cover,
    a.metadata,
    a.created_at,
    COALESCE(like_counts.like_count, 0) as like_count,
    COALESCE(user_likes.user_liked, false) as user_liked,
    COALESCE(comment_counts.comment_count, 0) as comment_count
  FROM activities a
  LEFT JOIN profiles p ON a.user_id = p.id
  LEFT JOIN collections c ON a.collection_id = c.id
  LEFT JOIN cards ON a.card_id = cards.id
  LEFT JOIN (
    SELECT 
      activity_id,
      COUNT(*) as like_count
    FROM activity_likes
    GROUP BY activity_id
  ) like_counts ON a.id = like_counts.activity_id
  LEFT JOIN (
    SELECT 
      activity_id,
      CASE WHEN COUNT(*) > 0 THEN true ELSE false END as user_liked
    FROM activity_likes
    WHERE user_id = COALESCE(p_user_id, auth.uid())
    GROUP BY activity_id
  ) user_likes ON a.id = user_likes.activity_id
  LEFT JOIN (
    SELECT 
      activity_id,
      COUNT(*) as comment_count
    FROM activity_comments
    GROUP BY activity_id
  ) comment_counts ON a.id = comment_counts.activity_id
  WHERE (p_user_id IS NULL OR a.user_id = p_user_id)
  ORDER BY a.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário explicativo:
-- Este RPC garante que o user_id retornado é sempre o da tabela activities,
-- que é quem realmente fez a ação (raspou o card, completou a coleção, etc.)
-- Não importa se a coleção é compartilhada - o user_id sempre será quem fez a ação
