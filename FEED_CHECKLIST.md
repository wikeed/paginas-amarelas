# Feed Público - Checklist de Implementação

## ✅ Implementado

### Arquivos Criados/Modificados

- [x] `lib/text.ts` - Função `formatTimeAgo()` para "há X tempo"
- [x] `components/feed/FeedItem.tsx` - Card individual de atividade
- [x] `components/feed/FeedList.tsx` - Lista com paginação cursor-based
- [x] `app/feed/page.tsx` - Server Component com rota pública

### Recursos Core

- [x] Rota pública `/feed` acessível sem autenticação
- [x] Mostrar últimos livros adicionados/atualizados ordenado por `updatedAt DESC`
- [x] Card com dados do usuário (avatar + @username) com link para `/u/[username]`
- [x] Informações do livro (capa, título, autor, status)
- [x] Timestamp "há X tempo" (formatTimeAgo)
- [x] Badge "NOVO" para livros criados há menos de 24h
- [x] Paginação cursor-based (evita offset/N+1)
- [x] Responsividade: layout coluna mobile → linha tablet+

### Segurança & Privacidade

- [x] Select específico no Prisma (sem email, password, ids internos)
- [x] Apenas dados públicos: username, name, image
- [x] Nenhuma informação sensível exposta

### Performance

- [x] Query única com `include` otimizado (select campos necessários)
- [x] Paginação cursor-based (melhor que offset)
- [x] Revalidate ISR a cada 30s para atividade recente
- [x] Metadata dinâmica/estática apropriada

### Responsividade (Mobile-First)

- [x] Padding adaptativo (p-4 mobile, p-6 tablet+)
- [x] Layout flexível (flex-col mobile, flex-row tablet+)
- [x] Imagens adaptativas via `<BookCover>`
- [x] Truncate/clamp para títulos longos
- [x] Gap responsivo entre elementos

---

## 📋 Testes Sugeridos

### Funcionalidade

- [ ] Feed exibe últimos 10 livros ordenados por updatedAt DESC
- [ ] Clicar em @username leva para `/u/[username]`
- [ ] Badge "NOVO" aparece apenas para livros < 24h
- [ ] Botão "Carregar mais" quando há >10 livros
- [ ] Clique em "Carregar mais" carrega próxima página via cursor
- [ ] Feed vazio mostra mensagem quando nenhum livro existe

### Responsividade

- [ ] Mobile (360px): layout vertical, cards legíveis
- [ ] Tablet (768px): layout horizontal com capa lado esquerdo
- [ ] Desktop (1024px+): espaçamento otimizado

### Performance

- [ ] Primeira carga <1s (com 10 itens)
- [ ] Build não gera warnings de type
- [ ] ISR revalidate 30s funciona (live update a cada 30s)

### Segurança

- [ ] Nenhum email/password exposto em request/response
- [ ] Nenhum ID interno de usuário na URL/card
- [ ] Dados retornados apenas de select específico

---

## 🚀 Próximas Melhorias (Escopo Futuro)

### Tabela Activity (não implementado agora)

```typescript
model Activity {
  id        Int       @id @default(autoincrement())
  type      String    // "book_added" | "book_updated" | "book_finished"
  userId    Int
  user      User      @relation(fields: [userId], references: [id])
  bookId    Int
  book      Book      @relation(fields: [bookId], references: [id])
  createdAt DateTime  @default(now())
}
```

- Usar `Activity` em vez de fallback `Book.updatedAt`
- Permite rastrear mais tipos de ação (finished reading, etc.)
- Melhor separation of concerns

### Features Sociais

- [ ] Botão "Like" /coração em cada card
- [ ] Contador de "curtidas"
- [ ] Comentários em livros (pequeno widget comentário)
- [ ] "Seguidores" / "Seguindo" no perfil público
- [ ] Feed filtrado por "Seguindo" vs "Explorar"

### Discover/Trending

- [ ] Página `/discover` com livros mais "curtidos" da semana
- [ ] Tags/Gêneros populares
- [ ] Livros mais adicionados por status

### Notificações

- [ ] Notificar quando alguém curtir meu livro
- [ ] Notificar quando alguém comentar em minha atividade
- [ ] Badge de notificações no header

### Analytics

- [ ] Trending page com livros mais populares
- [ ] Estatísticas: livros por gênero, status mais comum, etc.

---

## 📝 Notas de Arquitetura

### ISR (Incremental Static Regeneration)

- `revalidate: 30` => Página revalidada a cada 30s
- Cache hit primeiro, rebuild silencioso em background após 30s
- Trade-off: até 30s de lag para ver atividade "ao vivo"
- **Alternativa**: remover `revalidate` para sempre SSR (mais "live" mas menos cacheable)

### Cursor vs Offset

- **Cursor**: Usa `id` do último item, resiliente a insersões/deleções entre páginas
- **Offset**: Simples mas pode pular itens se novos forem adicionados
- Implementado: **Cursor** (melhor UX)

### Select Prisma

```typescript
select: {
  id, title, author, coverUrl, status, createdAt, updatedAt,
  user: { select: { username, name, image } }
}
```

- Evita overfetch de campos desnecessários
- Tipo-seguro @ compile time
- Nenhuma exposição de email/password

---

## 🔗 Links Relacionados

- Perfil Público: `/u/[username]` (já implementado)
- Dashboard: `/dashboard` (próprios livros)
- API de Livros: `/api/books` (para adicionar via frontend)
