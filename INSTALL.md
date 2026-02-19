# 🚀 Guia de Instalação - Páginas Amarelas

## ✅ Pré-requisitos

Certifique-se de ter instalado:

- **Node.js 18+**
- **PostgreSQL 12+**
- **npm** ou **yarn**

## 📦 Passo 1: Instalar Dependências

```bash
npm install
```

Isso instalará todos os pacotes necessários:

- Next.js, React, TypeScript
- NextAuth.js, Prisma, PostgreSQL client
- Tailwind CSS
- Validações Zod e React Hook Form

## 🗄️ Passo 2: Configurar PostgreSQL

### Windows

1. **Instale PostgreSQL** se ainda não tiver:
   - Download: https://www.postgresql.org/download/windows/
   - Durante a instalação, anote a senha do usuário `postgres`

2. **Abra pgAdmin** (vem com PostgreSQL) e crie um novo banco:
   ```sql
   CREATE DATABASE paginas_amarelas;
   ```

### macOS (com Homebrew)

```bash
brew install postgresql@15
brew services start postgresql@15
createdb paginas_amarelas
```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb paginas_amarelas
```

## 🔐 Passo 3: Configurar Variáveis de Ambiente

Na raiz do projeto, crie ou edite o arquivo `.env.local`:

```env
# Database
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/paginas_amarelas"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-uma-chave-segura-aqui"
```

### Gerar uma chave segura:

**Windows (PowerShell):**

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**macOS/Linux:**

```bash
openssl rand -base64 32
```

### Valores padrão (de exemplo):

- **Usuario PostgreSQL**: `postgres`
- **Senha**: A que você definiu durante a instalação do PostgreSQL
- **Host**: `localhost`
- **Port**: `5432` (padrão)
- **Database**: `paginas_amarelas`

## 🗃️ Passo 4: Preparar o Banco de Dados

### Executar migrations (criar tabelas)

```bash
npm run db:push
```

Este comando criará automaticamente as tabelas `users` e `books` no PostgreSQL.

### (Opcional) Adicionar dados de teste

```bash
npm run db:seed
```

Isso criará:

- Um usuário de teste: `leitor` / `senha123`
- 8 livros de exemplo

## 🎮 Passo 5: Iniciar o Servidor

```bash
npm run dev
```

O servidor estará disponível em: **http://localhost:3000**

## 📖 Primeiro Uso

### Opção A: Com dados de teste

Se executou `npm run db:seed`:

- **Usuário**: `leitor`
- **Senha**: `senha123`

### Opção B: Criar nova conta

1. Acesse http://localhost:3000/
2. Clique em "Registrar"
3. Preencha os dados
4. Faça login

## 🔧 Troubleshooting

### Erro: "connect ECONNREFUSED 127.0.0.1:5432"

- PostgreSQL não está rodando
- **Solução**: Inicie o PostgreSQL (Services no Windows, `brew services start postgresql@15` no macOS)

### Erro: "database paginas_amarelas does not exist"

```bash
# Crie o banco manualmente:
createdb paginas_amarelas
```

### Erro: "password authentication failed for user 'postgres'"

- Senha incorreta em DATABASE_URL
- **Solução**: Verifique a senha que definiu durante a instalação do PostgreSQL

### Erro: "NEXTAUTH_SECRET não está definido"

- Faltou gerar a chave secreta
- **Solução**: Siga o Passo 3 novamente

### Erro: "ts-node not found" (ao rodar db:seed)

```bash
npm install -D ts-node @types/node
npm run db:seed
```

## 🧹 Resetar o Banco (Cuidado!)

**Isso deletará TODOS os dados:**

```bash
npm run db:reset
npm run db:seed  # (opcional) restaurar dados de teste
```

## 📊 Visualizar Banco de Dados

```bash
npm run db:studio
```

Isso abre uma interface visual (Prisma Studio) em http://localhost:5555

## ✨ Próximos Passos

1. Explorar o dashboard em http://localhost:3000/dashboard
2. Adicionar/editar/deletar livros
3. Testar filtros e busca
4. Verificar logs no terminal

## 📞 Suporte

Se encontrar problemas:

1. Verifique se PostgreSQL está rodando
2. Confirme as variáveis em `.env.local`
3. Tente limpar cache: `rm -rf .next node_modules`
4. Reinstale: `npm install`

---

**Pronto para usar! 🎉**
