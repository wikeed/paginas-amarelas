# Configuração do Supabase para Upload de Imagens

## ❌ Erro Comum: "invalid Compact JWS"

Este erro ocorre quando a chave `SUPABASE_SERVICE_ROLE_KEY` está incorreta ou malformada.

---

## ✅ Como Configurar Corretamente

### 1. Acesse seu Projeto Supabase

- Vá para: https://app.supabase.com
- Selecione seu projeto

### 2. Obtenha as Chaves Corretas

**Settings → API**

Você encontrará duas chaves importantes:

#### a) Project URL
```
https://[seu-projeto].supabase.co
```
**Copie para `.env` como:**
```env
SUPABASE_URL="https://seu-projeto.supabase.co"
```

#### b) Service Role Key (secret)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

⚠️ **ATENÇÃO:**
- Use a **service_role** (não a anon key!)
- Tem 3 partes separadas por pontos (`.`)
- Começa com `eyJ`
- É muito longa (~200+ caracteres)

**Copie para `.env` como:**
```env
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Criar Bucket de Storage

**Storage → Create a new bucket**

- **Name:** `uploads`
- **Public:** ✅ Marcado (para URLs públicas)
- **File size limit:** 10 MB
- **Allowed MIME types:** `image/jpeg,image/png,image/webp,image/gif`

### 4. Configurar Políticas de Storage (RLS)

**Storage → Policies → uploads**

#### Política 1: Upload (INSERT)
```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');
```

#### Política 2: Download (SELECT)
```sql
CREATE POLICY "Allow public to read uploads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'uploads');
```

### 5. Configurar CORS (se necessário)

**Settings → API → CORS**

Adicione:
```
http://localhost:3000
https://seu-dominio.com
```

---

## 🔧 Verificar Configuração

### Teste 1: Verificar Chaves

Execute no terminal:
```bash
node -e "console.log('URL:', process.env.SUPABASE_URL); console.log('Key parts:', process.env.SUPABASE_SERVICE_ROLE_KEY?.split('.').length);"
```

**Esperado:**
```
URL: https://seu-projeto.supabase.co
Key parts: 3
```

### Teste 2: Verificar no Código

Adicione temporariamente em `lib/supabase.ts`:
```typescript
console.log('Supabase URL:', supabaseUrl);
console.log('Key válida:', supabaseServiceKey?.split('.').length === 3);
```

---

## 🚨 Problemas Comuns

### "invalid Compact JWS"
❌ **Causa:** Chave JWT malformada
✅ **Solução:** Copie novamente do Supabase, use `service_role` key

### "Row level security policy violation"
❌ **Causa:** Políticas RLS não configuradas
✅ **Solução:** Crie as policies acima no bucket `uploads`

### "Storage bucket not found"
❌ **Causa:** Bucket não existe ou nome errado
✅ **Solução:** Crie bucket chamado `uploads` (ou ajuste `SUPABASE_STORAGE_BUCKET`)

### "CORS policy error"
❌ **Causa:** Domínio não autorizado
✅ **Solução:** Adicione seu domínio nas configurações CORS

---

## 🔄 Fallback Automático

**Boa notícia:** O sistema agora tem fallback automático!

Se Supabase falhar (por qualquer motivo):
1. ⚠️ Log de erro é registrado
2. 🔄 Sistema tenta upload local (`public/uploads/`)
3. ✅ Imagem salva com sucesso
4. 📝 Response indica `storage: 'local'`

**Logs no console:**
```
Supabase upload error: invalid Compact JWS
Fazendo fallback para storage local...
✅ Upload local bem-sucedido: /uploads/a3f2e1c8.jpg
```

---

## 📝 Arquivo `.env` Completo

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[password]@db.[projeto].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-32-caracteres"

# Supabase Storage
SUPABASE_URL="https://[projeto].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...muito-longa..."
SUPABASE_STORAGE_BUCKET="uploads"
```

---

## ✅ Testar Upload

1. Reinicie o servidor: `npm run dev`
2. Faça login
3. Vá para `/profile`
4. Tente fazer upload de uma foto
5. Verifique o console do servidor:
   - Se vir "✅ Upload Supabase bem-sucedido" → Configurado! 🎉
   - Se vir "Fazendo fallback para storage local" → Ainda usando local (funciona, mas não é ideal para produção)

---

## 🌐 Diferença: Local vs Supabase

### Local Storage (`public/uploads/`)
- ✅ Funciona sem configuração
- ✅ Bom para desenvolvimento
- ❌ Não escalável (arquivos no servidor)
- ❌ Perdidos em deploy (Vercel, etc.)

### Supabase Storage
- ✅ CDN global (rápido)
- ✅ Escalável (infinito)
- ✅ Persiste em deploys
- ✅ URLs públicas permanentes
- ❌ Requer configuração inicial

---

**Recomendação:** Configure Supabase para produção, mas o fallback local garante que o sistema sempre funcione! 🚀
