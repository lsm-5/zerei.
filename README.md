# Zerei.

Zerei é uma aplicação web moderna para gerenciamento de coleções e acompanhamento de progresso pessoal. A plataforma permite que usuários adquiram coleções, completem cards individuais e acompanhem seu progresso de forma gamificada.

## 🚀 Funcionalidades

### Autenticação
- Sistema de login/cadastro com Supabase Auth
- Interface de autenticação em português
- Proteção de rotas para usuários autenticados

### Coleções
- **Loja de Coleções**: Navegue e adquira novas coleções
- **Minhas Coleções**: Gerencie suas coleções adquiridas
- **Progresso**: Acompanhe o progresso de conclusão de cada coleção
- **Arquivamento**: Organize coleções ativas e arquivadas
- **Privacidade**: Configure coleções como públicas ou privadas
- **Reset**: Reinicie o progresso de uma coleção

### Cards e Progresso
- Sistema de cards individuais dentro de cada coleção
- Marcação de cards como completados
- Comentários e data de conclusão
- Acompanhamento visual do progresso

### Interface
- Design moderno e responsivo
- Tema claro/escuro
- Componentes UI com shadcn/ui
- Animações e transições suaves
- Notificações toast para feedback

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **TanStack Query** - Gerenciamento de estado servidor

### UI/UX
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Radix UI** - Componentes primitivos acessíveis
- **Lucide React** - Ícones
- **next-themes** - Gerenciamento de tema

### Backend
- **Supabase** - Backend as a Service
  - Autenticação
  - Banco de dados PostgreSQL
  - Real-time subscriptions

### Desenvolvimento
- **ESLint** - Linting
- **PostCSS** - Processamento CSS
- **pnpm** - Gerenciador de pacotes

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes UI base (shadcn/ui)
│   ├── Layout.tsx       # Layout principal
│   ├── Header.tsx       # Cabeçalho da aplicação
│   └── ...              # Outros componentes
├── contexts/            # Contextos React
│   ├── AuthContext.tsx  # Contexto de autenticação
│   └── CollectionStoreContext.tsx # Contexto de coleções
├── hooks/               # Hooks customizados
├── integrations/        # Integrações externas
│   └── supabase/        # Configuração do Supabase
├── pages/               # Páginas da aplicação
│   ├── AuthPage.tsx     # Página de login/cadastro
│   ├── Feed.tsx         # Feed principal
│   ├── Collections.tsx  # Página de coleções
│   ├── Store.tsx        # Loja de coleções
│   └── ...              # Outras páginas
├── utils/               # Utilitários
└── lib/                 # Bibliotecas e configurações
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- pnpm (recomendado) ou npm/yarn
- Conta no Supabase

### Configuração

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd zerei
   ```

2. **Instale as dependências**
   ```bash
   pnpm install
   ```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   VITE_SUPABASE_URL=sua_supabase_url
   VITE_SUPABASE_ANON_KEY=sua_supabase_anon_key
   ```

4. **Execute o projeto**
   ```bash
   pnpm dev
   ```

   A aplicação estará disponível em `http://localhost:8080`

### Scripts Disponíveis

- `pnpm dev` - Executa o servidor de desenvolvimento
- `pnpm build` - Gera build de produção
- `pnpm build:dev` - Gera build de desenvolvimento
- `pnpm preview` - Visualiza o build de produção
- `pnpm lint` - Executa o linter

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **collections** - Coleções disponíveis na loja
- **cards** - Cards individuais dentro das coleções
- **user_collections** - Relacionamento usuário-coleção
- **user_completed_cards** - Cards completados pelos usuários

## 🎨 Design System

O projeto utiliza o shadcn/ui como base para componentes, com customizações em Tailwind CSS:

- **Cores**: Sistema de cores com suporte a tema claro/escuro
- **Tipografia**: Fontes Inter e Lexend
- **Espaçamento**: Sistema consistente de espaçamentos
- **Componentes**: Componentes acessíveis e reutilizáveis

## 🔧 Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as tabelas necessárias
3. Configure as políticas de RLS (Row Level Security)
4. Adicione as credenciais no arquivo `.env`

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- Desktop
- Tablet
- Mobile

## 🌐 Deploy

O projeto está configurado para deploy no Vercel com:
- Build automático
- Variáveis de ambiente configuradas
- Configuração de roteamento SPA

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte, entre em contato através de:
- Issues no GitHub
- Email: [seu-email@exemplo.com]

---

Desenvolvido com ❤️ usando React, TypeScript e Supabase.