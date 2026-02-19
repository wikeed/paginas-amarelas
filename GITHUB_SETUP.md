# 🚀 Guia: Enviando o Projeto para GitHub

## ✅ Preparação Concluída

O repositório git foi **inicializado localmente** com um commit inicial incluindo:

- ✅ Todos os arquivos do projeto
- ✅ Configurações do App Router (Next.js 14)
- ✅ Sistema de autenticação (NextAuth.js)
- ✅ API de livros com CRUD
- ✅ Sistema de capas com upload de imagens
- ✅ Banco de dados (Schema Prisma com migrations)
- ✅ Validações Zod
- ✅ Estilo Tailwind CSS

**Commit inicial criado:** `Initial commit: Páginas Amarelas - Full-stack book library app`

---

## 📝 Próximos Passos: Enviar para GitHub

### 1️⃣ Criar Repositório no GitHub

1. Acesse [https://github.com/new](https://github.com/new)
2. Preencha os dados:
   - **Repository name**: `paginas-amarelas` (ou seu nome preferido)
   - **Description**: `Full-stack book library app built with Next.js 14, Prisma, NextAuth and Tailwind CSS`
   - **Visibility**: Escolha Public ou Private
   - **NÃO** inicialize com README, .gitignore ou license (já temos localmente)

3. Clique em **Create repository**

---

### 2️⃣ Adicionar Remote e Fazer Push

Copie o comando que aparecerá após criar o repositório (parecido com este):

```bash
git remote add origin https://github.com/SEU_USERNAME/paginas-amarelas.git
git branch -M main
git push -u origin main
```

**Ou via SSH** (se tiver configurado):

```bash
git remote add origin git@github.com:SEU_USERNAME/paginas-amarelas.git
git branch -M main
git push -u origin main
```

---

### 3️⃣ Executar no seu Terminal

No PowerShell do seu projeto:

```powershell
# Adicionar remote (substitua pelos seus dados)
git remote add origin https://github.com/SEU_USERNAME/paginas-amarelas.git

# Renomear branch para main (se necessário)
git branch -M main

# Fazer push para GitHub
git push -u origin main
```

---

### 4️⃣ Configurar no GitHub (Opcional)

Após fazer push, você pode:

1. **Adicionar arquivo de branch protection** (Settings → Branches)
2. **Configurar CI/CD** (adicionar GitHub Actions)
3. **Habilitar discussions** (Settings → General)
4. **Adicionar colaboradores** (Settings → Collaborators)

---

## 📦 Estrutura do Repositório

```
paginas-amarelas/
├── app/                          # App Router (Next.js 14)
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth.js endpoints
│   │   ├── books/                # CRUD de livros
│   │   ├── google-books/         # Busca de livros API
│   │   └── upload/               # Upload de imagens
│   ├── dashboard/                # Dashboard principal
│   ├── layout.tsx                # Layout global
│   ├── page.tsx                  # Página de login
│   └── globals.css               # Estilos globais
│
├── components/                   # Componentes React
│   ├── BookCard.tsx              # Card de livro
│   ├── BookCover.tsx             # Componente de capa
│   ├── BookCoverUpload.tsx       # Upload de capa
│   ├── CreateBookModal.tsx       # Modal criar livro
│   ├── EditBookModal.tsx         # Modal editar livro
│   ├── BookDetailsModal.tsx      # Modal detalhes
│   └── ...                       # Outros componentes
│
├── lib/                          # Utilitários
│   ├── auth.ts                   # Configuração NextAuth
│   ├── prisma.ts                 # Cliente Prisma
│   └── validations.ts            # Schemas Zod
│
├── prisma/                       # banco de dados
│   ├── schema.prisma             # Model Prisma
│   ├── migrations/               # Histórico de migrations
│   └── seed.ts                   # Seed (opcional)
│
├── .env.example                  # Template de variáveis
├── .gitignore                    # Arquivos ignorados
├── package.json                  # Dependências
├── tsconfig.json                 # Configuração TypeScript
├── tailwind.config.ts            # Tailwind CSS
├── next.config.js                # Configuração Next.js
└── README.md                     # Documentação

```

---

## 🔑 Variáveis de Ambiente

O arquivo `.env.example` contém template com:

- `DATABASE_URL` - String de conexão PostgreSQL
- `NEXTAUTH_URL` - URL da aplicação
- `NEXTAUTH_SECRET` - Chave secreta JWT

**⚠️ Importante**: Nunca faça commit do `.env` (já está no `.gitignore`)

---

## 📚 Documentação Incluída

- **README.md** - Guia de início e features
- **INSTALL.md** - Instruções de instalação detalhadas
- **CAPAS_IMPLEMENTACAO.md** - Documentação do sistema de capas
- **.github/copilot-instructions.md** - Instruções customizadas do Copilot

---

## ✨ Features Principais

### 🔐 Autenticação

- Registro e login com NextAuth.js
- Senhas hasheadas com bcryptjs
- Proteção de rotas via middleware

### 📚 Gerenciamento de Livros

- **CRUD Completo**: Criar, ler, atualizar, deletar
- **Busca em Tempo Real**: Por título ou autor
- **Filtros por Status**: A ler, Lendo, Lido
- **Rastreamento de Leitura**: Página atual quando "Lendo"

### 🖼️ Sistema de Capas

- Placeholder elegante para livros sem capa
- Upload de arquivo local (`/public/uploads`)
- URL manual (colar link direto)
- Retirada automática da API (Open Library)

### 💾 Banco de Dados

- PostgreSQL com Prisma ORM
- 3 migrations principais gerenciadas
- Relacionamentos User ↔ Book via CASCADE
- Campos opcionais (gênero, páginas)

### 🎨 Interface

- Design responsivo (mobile-first)
- Tailwind CSS com cores customizadas
- Temas escuros elegantes
- Modais reutilizáveis

---

## 🛠️ Tecnologias

| Stack               | Ferramenta                       |
| ------------------- | -------------------------------- |
| **Frontend**        | Next.js 14, React 18, TypeScript |
| **Backend**         | API Routes, Node.js              |
| **Database**        | PostgreSQL, Prisma ORM           |
| **Auth**            | NextAuth.js, bcryptjs            |
| **Validation**      | Zod schemas                      |
| **Styling**         | Tailwind CSS, PostCSS            |
| **Package Manager** | npm                              |

---

## 🚀 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Iniciar servidor localhost:3000

# Build e produção
npm run build        # Build para produção
npm start            # Iniciar em produção

# Database
npx prisma db push   # Aplicar schema ao banco
npx prisma studio   # Abrir Prisma Studio (GUI)
npx prisma migrate  # Criar/aplicar migrations

# Git
git log              # Ver histórico de commits
git branch           # Ver ou criar branches
git switch -c feat   # Criar nova branch

```

---

## 📞 Suporte

Se o push não funcionar:

1. **Autenticação HTTPS**: Use token de acesso pessoal em vez de senha
   - Settings → Developer settings → Personal access tokens
   - Escopo: `repo`, `admin:repo_hook`

2. **SSH**: Configure chave SSH para melhor segurança
   - [Guia GitHub SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

3. **Problemas de merge**: Se houver conflitos, use `git pull` antes de push

---

## 📋 Checklist

- [x] Repositório git inicializado localmente
- [x] Commit inicial criado
- [ ] Repositório criado no GitHub
- [ ] Remote adicionado (`git remote add origin`)
- [ ] Branch renomeado para `main`
- [ ] Código feito push (`git push -u origin main`)
- [ ] Colaboradores convidados (opcional)
- [ ] Documentação revisada

---

**Bom envio! 🎉**

```bash
# Se precisar de ajuda
git remote -v     # Ver remotes configurados
git status        # Ver status atual
git log --oneline # Ver commits recentes
```
