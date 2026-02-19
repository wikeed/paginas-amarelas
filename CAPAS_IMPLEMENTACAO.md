# Sistema de Capas de Livros - Implementação

## 📋 Resumo das Mudanças

Um sistema profissional de gerenciamento de capas de livros foi implementado com placeholder elegante, upload de imagens e remoção do campo de data de lançamento.

---

## 🔧 Mudanças Técnicas

### 1. **Schema Prisma** (`prisma/schema.prisma`)

```prisma
// Removido:
- image: String?
- releaseDate: DateTime?

// Adicionado:
- coverUrl: String?          // URL da capa (API, upload ou manual)
- coverSource: String?       // "api" | "upload" | "manual"
```

**Migration**: `npx prisma db push --force-reset`

### 2. **Validações** (`lib/validations.ts`)

```typescript
// Removido:
- image
- releaseDate

// Adicionado:
- coverUrl: z.string().optional()
- coverSource: z.enum(['api', 'upload', 'manual']).optional()
```

### 3. **Componentes Novos**

#### **BookCover.tsx**

Componente reutilizável que exibe capa de livro com placeholder elegante.

**Props:**

- `title: string` - Título do livro
- `coverUrl?: string | null` - URL da capa
- `className?: string` - Classes Tailwind customizadas

**Funcionalidade:**

- Se `coverUrl` existir → Exibe a imagem
- Se não existir → Mostra placeholder com:
  - Gradient decorativo
  - Ícone de livro
  - Título abreviado
  - Proporção fixa

#### **BookCoverUpload.tsx**

Gerenciador completo de upload e configuração de capas.

**Props:**

- `title: string` - Título do livro
- `currentCoverUrl?: string | null` - Capa atual
- `onCoverChange: (url, source) => void` - Callback ao mudar capa
- `onRemoveCover: () => void` - Callback ao remover capa

**Funcionalidades:**

- 📤 **Upload de arquivo**: Salva em `/public/uploads`
- 🔗 **URL manual**: Colar link direto
- ✕ **Remover**: Deletar capa atual
- Validação de tipo (imagens) e tamanho (máx 5MB)
- Prévia ao vivo da capa

### 4. **API de Upload** (`app/api/upload/route.ts`)

**Endpoint:** `POST /api/upload`

**Fluxo:**

1. Recebe arquivo via FormData
2. Valida tipo (image/\*) e tamanho (<5MB)
3. Gera nome único (hash aleatório)
4. Salva em `/public/uploads/`
5. Retorna URL pública

**Resposta:**

```json
{
  "url": "/uploads/abc123def456.jpg",
  "filename": "abc123def456.jpg"
}
```

### 5. **Componentes Atualizados**

#### **CreateBookModal.tsx**

- Removido campos `image` e `releaseDate`
- Adicionado componente `<BookCoverUpload />`
- Ao selecionar livro da API:
  - Se houver imagem → `coverUrl` + `coverSource: 'api'`
  - Se não houver → sem capa (placeholder no card)

#### **EditBookModal.tsx**

- Mesma estrutura do CreateBookModal
- Widget de página atual (status="lendo")
- Upload integrado

#### **BookCard.tsx**

- Removido: renderização manual de imagem
- Adicionado: componente `<BookCover />`
- Agora recebe `coverUrl` em vez de `image`

#### **Dashboard** (`app/dashboard/page.tsx`)

- Atualizado para passar `coverUrl` ao BookCard

### 6. **Configuração Next.js** (`next.config.js`)

```javascript
images: {
  domains: [
    'picsum.photos',
    'books.google.com',
    'covers.openlibrary.org',
    'localhost'  // ← Novo para uploads locais
  ],
  unoptimized: process.env.NODE_ENV === 'development'
}
```

---

## 📦 Fluxo de Dados

### Criar Livro com Capa

```
1. Buscar sugestão (API)
   ↓
2. Selecionar livro
   ├─ If imagem disponível → coverUrl (api)
   └─ If sem imagem → placeholder
   ↓
3. (Opcional) Ajustar capa
   ├─ Upload arquivo → /public/uploads → coverUrl (upload)
   ├─ Colar URL → coverUrl (manual)
   └─ Remover → coverUrl = null
   ↓
4. Salvar → coverUrl + coverSource no banco
```

---

## 🎨 Placeholder Visual

- **Fundo**: Gradient tema do app (primary → secondary)
- **Decoação**: Círculos difusos (accent + secondary)
- **Ícone**: SVG de livro em escala cinza
- **Texto**: Título abreviado (40 caracteres)
- **Proporção**: Matcheia imagens reais (aspect-[2/3])

---

## ✅ Funcionalidades

- ✅ Fallback automático com placeholder elegante
- ✅ Upload de arquivo local
- ✅ Entrada de URL manual
- ✅ Remoção de capa
- ✅ Tracking de origem (API/upload/manual)
- ✅ Validação de arquivo (tipo + tamanho)
- ✅ Compatível com autocomplete (API)
- ✅ Sem quebra na lógica existente
- ✅ Remover data de lançamento conforme pedido

---

## 🚀 Próximos Passos (Opcional)

1. **Cloud Storage**: Integrar AWS S3 ou similar
2. **Crop de Imagem**: Permitir ajustar/cortar capa
3. **Otimização**: Usar sharp para redimensionar
4. **Banco de Imagens**: Integrar mais APIs de capa
5. **Histórico**: Rastrear mudanças de capa

---

## 🧪 Testando

```bash
# 1. Iniciar servidor
npm run dev

# 2. Criar livro com:
# - Buscar sugestão (terá capa da API)
# - Upload de arquivo local
# - Colar URL manual
# - Remover capa (verá placeholder)

# 3. Editar livro e modificar capa

# 4. Ver cards com/sem capa
```

---

## 📁 Estrutura de Arquivos

```
components/
├── BookCover.tsx          ← Componente de capa reutilizável
├── BookCoverUpload.tsx    ← Gerenciador de upload
├── BookCard.tsx           ← Atualizado
├── CreateBookModal.tsx    ← Atualizado
└── EditBookModal.tsx      ← Atualizado

app/api/
└── upload/
    └── route.ts           ← API de upload

public/
└── uploads/               ← Pasta de uploads (criada automaticamente)

prisma/
└── schema.prisma          ← Atualizado

lib/
└── validations.ts         ← Atualizado
```

---

## ⚡ Resumo Técnico

| Aspecto         | Antes                       | Depois                     |
| --------------- | --------------------------- | -------------------------- |
| Campo de capa   | `image`                     | `coverUrl` + `coverSource` |
| Data lançamento | `releaseDate`               | Removido                   |
| Fallback capa   | "Sem imagem" (texto)        | Placeholder elegante       |
| Upload          | ❌ Não tinha                | ✅ Local (/public/uploads) |
| URL manual      | ❌ Não tinha                | ✅ Suportado               |
| Componente capa | Duplicado em vários lugares | ✅ Reutilizável BookCover  |
