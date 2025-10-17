-- Script para remover a constraint única que impede múltiplas instâncias da mesma coleção
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a constraint existe
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'user_collections'::regclass 
AND contype = 'u';

-- 2. Remover a constraint única se existir
-- (Substitua 'user_collections_user_id_collection_id_key' pelo nome real da constraint)
ALTER TABLE user_collections DROP CONSTRAINT IF EXISTS user_collections_user_id_collection_id_key;

-- 3. Verificar se a constraint foi removida
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'user_collections'::regclass 
AND contype = 'u';

-- 4. Opcional: Adicionar um índice para performance (sem constraint única)
CREATE INDEX IF NOT EXISTS idx_user_collections_user_collection 
ON user_collections(user_id, collection_id);
