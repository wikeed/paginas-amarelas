/**
 * Normaliza string removendo acentos e convertendo para minúsculas
 * @example normalizeString("Ficção") => "ficcao"
 */
export function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Quebra texto em palavras normalizadas
 * @example tokenize("Dom Casmurro") => ["dom", "casmurro"]
 */
export function tokenize(str: string): string[] {
  return normalizeString(str)
    .split(/[\s\-\.,:;!?\'"\/]+/) // Separa por espaços e pontuação
    .filter((word) => word.length > 0);
}

/**
 * Alias para compatibilidade com código anterior
 * @deprecated Use normalizeString instead
 */
export function normalizeText(text: string): string {
  return normalizeString(text);
}

/**
 * Verifica se um texto contém uma substring (normalizado e case-insensitive)
 * @example matchesSubstring("O Cortiço", "cortic") => true
 */
export function matchesSubstring(text: string, query: string): boolean {
  if (!query.trim()) return true;
  return normalizeString(text).includes(normalizeString(query));
}

/**
 * Verifica se um texto começa com um prefixo (normalizado)
 * @example startsWithNormalized("Casamento", "cas") => true
 */
export function startsWithNormalized(text: string, query: string): boolean {
  if (!query.trim()) return true;
  return normalizeString(text).startsWith(normalizeString(query));
}

/**
 * Formata data para formato "há X tempo" (ex: "há 2 horas")
 * @example formatTimeAgo(new Date(Date.now() - 3600000)) => "há 1 hora"
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) return 'agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;

  const months = Math.floor(days / 30);
  if (months < 12) return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;

  const years = Math.floor(months / 12);
  return `há ${years} ${years === 1 ? 'ano' : 'anos'}`;
}

/**
 * Interface para objetos pesquisáveis
 */
export interface Searchable {
  title: string;
  author: string;
}

/**
 * Calcula ranking de relevância para um livro
 * Ranks:
 *   0 = Melhor: alguma PALAVRA do título/autor começa com o termo
 *   1 = Bom:   título/autor inteiro começa com o termo
 *   2 = OK:    título/autor contém o termo
 *   -1 = Sem match
 */
function calculateRelevance(book: Searchable, query: string): number {
  const normalizedQuery = normalizeString(query);

  // Rank 0: alguma PALAVRA começa com o termo
  const titleWords = tokenize(book.title);
  const authorWords = tokenize(book.author);

  const hasWordPrefix =
    titleWords.some((word) => word.startsWith(normalizedQuery)) ||
    authorWords.some((word) => word.startsWith(normalizedQuery));

  if (hasWordPrefix) return 0;

  // Rank 1: texto inteiro começa com o termo
  const textPrefixMatch =
    startsWithNormalized(book.title, query) || startsWithNormalized(book.author, query);

  if (textPrefixMatch) return 1;

  // Rank 2: contém o termo em qualquer posição
  const contentMatch = matchesSubstring(book.title, query) || matchesSubstring(book.author, query);

  if (contentMatch) return 2;

  return -1;
}

/**
 * Busca livros com ranking por relevância
 * - Mínimo 3 caracteres para aplicar filtro
 * - Retorna lista ordenada por relevância (rank), depois alfabética
 * @example searchBooks(books, "dem") => [Anjos e Demônios, Demonologia, ...]
 */
export function searchBooks<T extends Searchable>(books: T[], query: string): T[] {
  // Se query < 3 caracteres, retorna todos os livros
  if (query.trim().length < 3) {
    return books;
  }

  // Calcula relevância para cada livro
  const booksWithRank = books
    .map((book) => ({
      book,
      rank: calculateRelevance(book, query),
    }))
    .filter((item) => item.rank !== -1); // Remove sem match

  // Ordena por rank (crescente) e depois por título
  booksWithRank.sort((a, b) => {
    if (a.rank !== b.rank) {
      return a.rank - b.rank; // Rank menor = melhor
    }
    return a.book.title.localeCompare(b.book.title, undefined, { numeric: true });
  });

  return booksWithRank.map((item) => item.book);
}
