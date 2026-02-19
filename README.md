# Páginas Amarelas - Guia de Início

Uma aplicação full-stack para gerenciar sua biblioteca pessoal de livros, construída com **Next.js 14**, **React**, **PostgreSQL**, **Prisma**, e **NextAuth.js**.

## 🎯 Features

- ✅ **Autenticação Segura** - NextAuth.js com senhas hasheadas (bcryptjs)
- ✅ **CRUD de Livros** - Criar, ler, atualizar e deletar livros
- ✅ **Filtros por Status** - A ler, Lendo, Lido
- ✅ **Busca em Tempo Real** - Busque por título ou autor
- ✅ **Dashboard Responsivo** - Design mobile-first com Tailwind CSS
- ✅ **Proteção de Rotas** - Middleware para autenticação
- ✅ **Validação Robusta** - Zod validation no cliente e servidor

## 📋 Pré-requisitos

- **Node.js 18+** - [Download aqui](https://nodejs.org/)
- **PostgreSQL 12+** - [Download aqui](https://www.postgresql.org/)
- **npm** ou **yarn**

## 🚀 Instalação e Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados

Crie um arquivo `.env.local` na raiz do projeto:

```env
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/paginas_amarelas"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-super-segura"
```

**Para gerar uma chave segura no Windows PowerShell:**

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 3. Criar banco de dados PostgreSQL

```sql
CREATE DATABASE paginas_amarelas;
```

### 4. Executar migrations Prisma

```bash
npx prisma db push
```

Isso criará as tabelas `users` e `books` automaticamente.

### 5. (Opcional) Visualizar banco de dados

```bash
npx prisma studio
```

## 🏃 Executar o projeto

### Desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:3000

### Build para produção

```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
paginas-amarelas-next/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts     (NextAuth handler)
│   │   │   └── register/route.ts          (Registro)
│   │   └── books/
│   │       ├── route.ts                   (GET, POST books)
│   │       └── [id]/route.ts              (GET, PUT, DELETE book)
│   ├── dashboard/
│   │   └── page.tsx                       (Dashboard principal)
│   ├── layout.tsx                         (Layout global)
│   ├── page.tsx                           (Página de autenticação)
│   └── providers.tsx                      (SessionProvider)
├── components/
│   ├── AuthForm.tsx                       (Formulário login/registro)
│   ├── BookCard.tsx                       (Card de livro)
│   ├── BookDetailsModal.tsx               (Modal de detalhes)
│   ├── DashboardHeader.tsx                (Header do dashboard)
│   ├── EditBookModal.tsx                  (Modal de edição)
│   └── Modal.tsx                          (Componente base Modal)
├── lib/
│   ├── auth.ts                            (Configuração NextAuth)
│   ├── prisma.ts                          (Cliente Prisma)
│   └── validations.ts                     (Schemas Zod)
├── prisma/
│   └── schema.prisma                      (Modelos do banco)
├── styles/
│   └── globals.css                        (Estilos globais)
├── middleware.ts                          (Proteção de rotas)
├── .env.example                           (Variáveis de ambiente)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🔐 Segurança Implementada

- **NextAuth.js** - Gerenciamento seguro de sessão
- **JWT** - Tokens criptografados
- **bcryptjs** - Hashing de senhas
- **HTTP-only Cookies** - Proteção contra XSS
- **Middleware** - Proteção de rotas autenticadas
- **Validação Zod** - Validation em cliente e servidor

## 📚 Como usar

### 1. Registrar novo usuário

- Acesse http://localhost:3000
- Clique em "Registrar"
- Preencha os dados e clique em "Registrar"

### 2. Fazer login

- Volte para "Entrar"
- Digite suas credenciais

### 3. Adicionar livro

_(Feature a implementar - criar página de criação)_

### 4. Editar livro

- Clique no botão "Editar" do livro
- Atualize os dados

### 5. Filtrar por status

- Use os botões de filtro no topo
- "A ler", "Lendo", "Lido"

## 🎨 Estética Preservada

Mantemos a paleta de cores original:

- **Azul Escuro**: `#1a1f3a` (primary)
- **Ciano**: `#22d3ee` (secondary)
- **Verde**: `#10b981` (accent)
- **Amarelo/Laranja**: Gradiente para buttons

## 🛠️ Tecnologias

| Tecnologia      | Versão | Uso                    |
| --------------- | ------ | ---------------------- |
| Next.js         | 14+    | Framework React        |
| React           | 18+    | UI Library             |
| TypeScript      | 5+     | Tipagem estática       |
| Tailwind CSS    | 3+     | Estilos                |
| PostgreSQL      | 12+    | Banco de dados         |
| Prisma          | 5+     | ORM                    |
| NextAuth.js     | 4+     | Autenticação           |
| Zod             | 3+     | Validação              |
| React Hook Form | 7+     | Gerenciamento de forms |
| SWR             | 2+     | Data fetching          |

## 📝 Próximas Features

- [ ] Upload de imagem de capa do livro
- [ ] Página para adicionar novo livro
- [ ] Classificação e avaliações
- [ ] Exportar lista de livros
- [ ] Dark/Light mode toggle
- [ ] Integração com APIs de livros (Google Books, etc)
- [ ] Compartilhamento de listas entre usuários

## 🐛 Troubleshooting

### Erro "DATABASE_URL" não encontrado

- Certifique-se de criar `.env.local` na raiz do projeto

### Erro ao conectar ao PostgreSQL

- Verifique se o PostgreSQL está rodando
- Confirme as credenciais em `DATABASE_URL`

### Erro na migration do Prisma

```bash
npx prisma migrate reset  # CUIDADO: Deleta e recria banco
```

## 📞 Suporte

Para reportar bugs ou sugerir melhorias, crie uma issue no repositório.

---

**Desenvolvido com ❤️ using Next.js**
