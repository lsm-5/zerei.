# 🗄️ Estrutura do Banco de Dados - Supabase

Este documento descreve a estrutura completa do banco de dados PostgreSQL do projeto Zerei, hospedado no Supabase.

## 📋 Visão Geral

O banco de dados é composto por 6 tabelas principais que gerenciam:
- **Usuários e perfis**
- **Coleções e cards**
- **Progresso dos usuários**
- **Sistema de amizades**

## 🏗️ Diagrama de Relacionamentos

```
auth.users (Supabase Auth)
    ↓ (1:1)
profiles
    ↓ (1:N)
user_collections ←→ collections (N:N)
    ↓ (1:N)           ↓ (1:N)
user_completed_cards  cards

profiles ←→ friendships ←→ profiles (N:N)
```

## 📊 Tabelas Detalhadas

### 1. `profiles` - Perfis dos Usuários

**Descrição**: Armazena informações dos perfis dos usuários autenticados.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| `id` | UUID | ID único do usuário | PK, FK → auth.users.id |
| `name` | TEXT | Nome do usuário | Opcional |
| `avatar_url` | TEXT | URL do avatar | Opcional |
| `created_at` | TIMESTAMP | Data de criação | Auto-gerado |
| `updated_at` | TIMESTAMP | Data de atualização | Auto-gerado |

**Relacionamentos**:
- `1:1` com `auth.users` (Supabase Auth)
- `1:N` com `user_collections`
- `1:N` com `friendships` (como user_one_id)
- `1:N` com `friendships` (como user_two_id)

**Políticas RLS**:
- ✅ Visualizar todos os perfis
- ✅ Atualizar apenas próprio perfil
- ✅ Inserir apenas próprio perfil

---

### 2. `collections` - Coleções Disponíveis

**Descrição**: Coleções de cards disponíveis na loja.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| `id` | SERIAL | ID único da coleção | PK |
| `title` | TEXT | Título da coleção | NOT NULL |
| `subtitle` | TEXT | Subtítulo da coleção | Opcional |
| `description` | TEXT | Descrição detalhada | Opcional |
| `cover` | TEXT | URL da imagem de capa | Opcional |
| `created_at` | TIMESTAMP | Data de criação | Auto-gerado |
| `updated_at` | TIMESTAMP | Data de atualização | Auto-gerado |

**Relacionamentos**:
- `1:N` com `cards`
- `N:N` com `profiles` (via `user_collections`)

**Políticas RLS**:
- ✅ Visualizar todas as coleções
- 🔒 Gerenciar apenas admins (service_role)

---

### 3. `cards` - Cards Individuais

**Descrição**: Cards individuais dentro das coleções.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| `id` | SERIAL | ID único do card | PK |
| `collection_id` | INTEGER | ID da coleção | FK → collections.id, NOT NULL |
| `title` | TEXT | Título do card | NOT NULL |
| `description` | TEXT | Descrição do card | Opcional |
| `order_index` | INTEGER | Ordem do card na coleção | Default: 0 |
| `created_at` | TIMESTAMP | Data de criação | Auto-gerado |
| `updated_at` | TIMESTAMP | Data de atualização | Auto-gerado |

**Relacionamentos**:
- `N:1` com `collections`
- `1:N` com `user_completed_cards`

**Políticas RLS**:
- ✅ Visualizar todos os cards
- 🔒 Gerenciar apenas admins (service_role)

---

### 4. `user_collections` - Coleções dos Usuários

**Descrição**: Relacionamento entre usuários e coleções (quando usuário adquire uma coleção).

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| `id` | SERIAL | ID único da instância | PK |
| `user_id` | UUID | ID do usuário | FK → profiles.id, NOT NULL |
| `collection_id` | INTEGER | ID da coleção | FK → collections.id, NOT NULL |
| `is_public` | BOOLEAN | Se a coleção é pública | Default: true |
| `is_archived` | BOOLEAN | Se a coleção está arquivada | Default: false |
| `created_at` | TIMESTAMP | Data de aquisição | Auto-gerado |
| `updated_at` | TIMESTAMP | Data de atualização | Auto-gerado |

**Restrições**:
- `UNIQUE(user_id, collection_id)` - Usuário não pode ter a mesma coleção duas vezes

**Relacionamentos**:
- `N:1` com `profiles`
- `N:1` com `collections`
- `1:N` com `user_completed_cards`

**Políticas RLS**:
- ✅ Visualizar próprias coleções
- ✅ Visualizar coleções públicas
- ✅ Inserir/atualizar/deletar apenas próprias coleções

---

### 5. `user_completed_cards` - Cards Completados

**Descrição**: Registra quais cards foram completados pelos usuários.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| `id` | SERIAL | ID único do registro | PK |
| `user_collection_id` | INTEGER | ID da coleção do usuário | FK → user_collections.id, NOT NULL |
| `card_id` | INTEGER | ID do card | FK → cards.id, NOT NULL |
| `completed_at` | TIMESTAMP | Data de conclusão | Auto-gerado |
| `comment` | TEXT | Comentário do usuário | Opcional |

**Restrições**:
- `UNIQUE(user_collection_id, card_id)` - Usuário não pode completar o mesmo card duas vezes

**Relacionamentos**:
- `N:1` com `user_collections`
- `N:1` com `cards`

**Políticas RLS**:
- ✅ Visualizar/gerenciar apenas próprios cards completados

---

### 6. `friendships` - Sistema de Amizades

**Descrição**: Gerencia o sistema de amizades entre usuários.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| `id` | SERIAL | ID único da amizade | PK |
| `user_one_id` | UUID | ID do primeiro usuário | FK → profiles.id, NOT NULL |
| `user_two_id` | UUID | ID do segundo usuário | FK → profiles.id, NOT NULL |
| `status` | TEXT | Status da amizade | 'pending', 'accepted', 'declined' |
| `action_user_id` | UUID | ID do usuário que fez a última ação | FK → profiles.id, NOT NULL |
| `created_at` | TIMESTAMP | Data de criação | Auto-gerado |
| `updated_at` | TIMESTAMP | Data de atualização | Auto-gerado |

**Restrições**:
- `UNIQUE(user_one_id, user_two_id)` - Não pode haver duplicatas
- `CHECK (user_one_id != user_two_id)` - Usuário não pode ser amigo de si mesmo

**Relacionamentos**:
- `N:1` com `profiles` (user_one_id)
- `N:1` com `profiles` (user_two_id)
- `N:1` com `profiles` (action_user_id)

**Políticas RLS**:
- ✅ Visualizar/gerenciar apenas próprias amizades

## 🔧 Funções Auxiliares

### `get_profile_by_email(p_email text)`

**Descrição**: Busca um perfil pelo email do usuário.

**Parâmetros**:
- `p_email` (TEXT): Email do usuário

**Retorno**:
- `id` (UUID): ID do usuário
- `name` (TEXT): Nome do usuário
- `email` (TEXT): Email do usuário
- `avatar_url` (TEXT): URL do avatar

**Uso**: Utilizada para encontrar usuários por email no sistema de amizades.

### `handle_new_user()`

**Descrição**: Função trigger que cria automaticamente um perfil quando um usuário se registra.

**Trigger**: `on_auth_user_created` - Executado após inserção em `auth.users`

## 🔒 Segurança (RLS)

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com políticas específicas:

- **Profiles**: Visualização pública, edição própria
- **Collections/Cards**: Visualização pública, edição apenas para admins
- **User Collections**: Visualização própria e pública, edição própria
- **Completed Cards**: Apenas próprios registros
- **Friendships**: Apenas próprias amizades

### Políticas de Acesso

```sql
-- Exemplo: Usuário pode ver apenas suas próprias coleções
CREATE POLICY "Users can view own collections" ON public.user_collections
    FOR SELECT USING (auth.uid() = user_id);
```

## 📈 Índices para Performance

### Índices Principais

- **profiles**: `name`, `created_at`
- **collections**: `title`, `created_at`
- **cards**: `collection_id`, `order_index`, `title`
- **user_collections**: `user_id`, `collection_id`, `is_public`, `is_archived`
- **user_completed_cards**: `user_collection_id`, `card_id`, `completed_at`
- **friendships**: `user_one_id`, `user_two_id`, `status`, `action_user_id`

## 🚀 Queries Comuns

### Buscar coleções de um usuário com progresso

```sql
SELECT 
    uc.id as instance_id,
    c.title,
    c.subtitle,
    c.cover,
    uc.is_public,
    COUNT(cc.id) as completed_count,
    COUNT(cards.id) as total_cards
FROM user_collections uc
JOIN collections c ON uc.collection_id = c.id
LEFT JOIN cards ON c.id = cards.collection_id
LEFT JOIN user_completed_cards cc ON uc.id = cc.user_collection_id AND cards.id = cc.card_id
WHERE uc.user_id = $1 AND uc.is_archived = false
GROUP BY uc.id, c.id;
```

### Buscar amigos de um usuário

```sql
SELECT 
    CASE 
        WHEN f.user_one_id = $1 THEN p2.*
        ELSE p1.*
    END as friend
FROM friendships f
JOIN profiles p1 ON f.user_one_id = p1.id
JOIN profiles p2 ON f.user_two_id = p2.id
WHERE (f.user_one_id = $1 OR f.user_two_id = $1) 
    AND f.status = 'accepted';
```

## 🔄 Fluxo de Dados

### 1. Registro de Usuário
1. Usuário se registra → `auth.users`
2. Trigger cria perfil → `profiles`
3. Usuário pode adquirir coleções → `user_collections`

### 2. Progresso em Coleções
1. Usuário completa card → `user_completed_cards`
2. Sistema calcula progresso baseado em `user_completed_cards` vs `cards`

### 3. Sistema de Amizades
1. Usuário envia solicitação → `friendships` (status: 'pending')
2. Amigo aceita/recusa → `friendships` (status: 'accepted'/'declined')

## 📝 Manutenção

### Backup
- Backup automático do Supabase
- Export manual via SQL Editor

### Monitoramento
- Logs de queries no Supabase Dashboard
- Métricas de performance disponíveis

### Atualizações
- Migrations via SQL Editor
- Versionamento de schema recomendado

---

**Última atualização**: $(date)
**Versão do Schema**: 1.0.0
