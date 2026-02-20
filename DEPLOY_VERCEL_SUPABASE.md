# Guia de Deploy na Vercel + Supabase

## 📋 Passos de Configuração

### 1️⃣ Supabase (Database)

#### a) Criar projeto Supabase
1. Ir para [supabase.com](https://supabase.com)
2. Sign in / Create account
3. "New Project" → Escolher organização/região
4. Aguardar inicialização

#### b) Obter Connection String
1. Home do projeto → "Connect"
2. Selecionar "Prisma"
3. Copiar a string (formato: `postgresql://postgres:[password]@[project].supabase.co:5432/postgres`)
4. Guardar valor de `[password]` que foi gerado

### 2️⃣ Atualizar `.env.production` localmente
```bash
# Abrir .env.production e substituir:
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres?schema=public"
NEXTAUTH_URL="https://seu-projeto-vercel.vercel.app"
NEXTAUTH_SECRET="94877d422a226b8e123438a43ebe9e9dc292c653f92fb89e451bf4db9c1d7e65"
```

### 3️⃣ Rodar Migrations no Supabase
```bash
# Use DATABASE_URL do Supabase para aplicar schema
DATABASE_URL="postgresql://..." npx prisma db push
```

### 4️⃣ Vercel - Adicionar Environment Variables
1. Ir para [vercel.com](https://vercel.com)
2. Projeto "paginas-amarelas" → Settings → Environment Variables
3. Adicionar 3 variáveis:
   - **DATABASE_URL**: `postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres?schema=public`
   - **NEXTAUTH_URL**: `https://seu-projeto-vercel.vercel.app`
   - **NEXTAUTH_SECRET**: `94877d422a226b8e123438a43ebe9e9dc292c653f92fb89e451bf4db9c1d7e65`

> ⚠️ Se o projeto já está conectado ao GitHub, Vercel pode detectar mudanças automaticamente

### 5️⃣ Redeploy na Vercel
1. Vercel Dashboard → Seu projeto
2. "Deployments" → Redeployar (ou esperar push automático)
3. Aguardar build e deploy

### 6️⃣ Verificar Deploy
```bash
curl https://seu-projeto-vercel.vercel.app/api/books
# Deve retornar erro 401 (não autenticado) - sinal de que API funciona
```

---

## 🔐 Segurança

- ✅ `.env` local nunca é commitado (está em `.gitignore`)
- ✅ `.env.example` com template (sem valores reais) está versionado
- ✅ `.env.production` tem vars de produção (não versionar git)
- ✅ Supabase armazena DATABASE_URL com segurança

---

## 🚀 Checklist Final

- [ ] Supabase projeto criado
- [ ] Connection string obtida
- [ ] `.env.production` atualizado com valores Supabase
- [ ] `npx prisma db push` executado contra Supabase
- [ ] Vercel env vars configuradas
- [ ] Deploy realizado
- [ ] Testes: `/feed` carrega, `/u/username` funciona, login/register OK

---

## 📝 Observações

- Se o app tiver uploads de imagens em `/public/uploads`, Vercel não persiste → migrar para storage externo (Cloudinary, Supabase Storage)
- ISR (revalidate: 30) funciona normalmente na Vercel
- NextAuth com Supabase PostgreSQL é compatível

---

## Próximo passo

Uma vez que tudo estiver funcionando em produção, considere:
- [ ] Adicionar logging/monitoring (Sentry, LogRocket)
- [ ] Setup de backup automático Supabase
- [ ] Custom domain Vercel
