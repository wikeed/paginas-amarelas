import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Gera um número aleatório entre min e max
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Dados de exemplo para seed
 */
const sampleBooks = {
  'a-ler': [
    {
      title: 'O Código Da Vinci',
      author: 'Dan Brown',
      genre: 'Mistério / Thriller',
      pages: 489,
      summary: 'Uma busca pelo Santo Graal através de símbolos e pistas.',
    },
    {
      title: 'Orgulho e Preconceito',
      author: 'Jane Austen',
      genre: 'Romance Clássico',
      pages: 279,
      summary: 'A vida e o amor de Elizabeth Bennet na Inglaterra Georgiana.',
    },
    {
      title: 'A Culpa é das Estrelas',
      author: 'John Green',
      genre: 'Romance / Drama',
      pages: 349,
      summary: 'A história de dois adolescentes com câncer que encontram o amor.',
    },
    {
      title: 'O Senhor dos Anéis: A Sociedade do Anel',
      author: 'J.R.R. Tolkien',
      genre: 'Fantasia / Aventura',
      pages: 423,
      summary: 'O início da épica jornada para destruir o Anel Único.',
    },
    {
      title: 'A Revolução América por Taylor Swift',
      author: 'Various Authors',
      genre: 'Ficção / Drama',
      pages: 356,
      summary: 'Uma coletânea de histórias inspiradas em revoluções.',
    },
  ],
  lendo: [
    {
      title: '1984',
      author: 'George Orwell',
      genre: 'Ficção Científica / Distopia',
      pages: 328,
      summary: 'Uma sociedade totalitária controlada pelo Grande Irmão.',
    },
    {
      title: 'O Alquimista',
      author: 'Paulo Coelho',
      genre: 'Ficção Filosófica',
      pages: 224,
      summary: 'A jornada de um menino em busca do ouro e seu tesouro pessoal.',
    },
    {
      title: 'Harry Potter e a Câmara Secreta',
      author: 'J.K. Rowling',
      genre: 'Fantasia',
      pages: 341,
      summary: 'O segundo ano de Harry em Hogwarts traz novos mistérios.',
    },
    {
      title: 'O Hobbit',
      author: 'J.R.R. Tolkien',
      genre: 'Fantasia / Aventura',
      pages: 310,
      summary: 'A jornada inesperada de Bilbo Bolseiro em busca de tesouro.',
    },
    {
      title: 'Memórias Póstumas de Brás Cubas',
      author: 'Machado de Assis',
      genre: 'Romance Clássico',
      pages: 368,
      summary: 'A vida inusitada de um defunto-autor que narra sua própria história.',
    },
  ],
  lido: [
    {
      title: 'O Pequeno Príncipe',
      author: 'Antoine de Saint-Exupéry',
      genre: 'Ficção / Infantil',
      pages: 96,
      summary: 'Uma história poética sobre um menino príncipe que viaja entre planetas.',
    },
    {
      title: 'Dom Casmurro',
      author: 'Machado de Assis',
      genre: 'Romance Clássico',
      pages: 256,
      summary: 'Um dos maiores romances da literatura brasileira.',
    },
    {
      title: 'Harry Potter e a Pedra Filosofal',
      author: 'J.K. Rowling',
      genre: 'Fantasia',
      pages: 309,
      summary: 'O começo da jornada de Harry Potter em Hogwarts.',
    },
    {
      title: 'Grande Sertão: Veredas',
      author: 'Guimarães Rosa',
      genre: 'Romance Clássico',
      pages: 494,
      summary: 'A épica história de Riobaldo, um ex-jagunço que relembra sua vida.',
    },
    {
      title: 'O Cortiço',
      author: 'Aluísio Azevedo',
      genre: 'Romance Realista',
      pages: 203,
      summary: 'A vida das pessoas de um cortiço no Rio de Janeiro do século XIX.',
    },
  ],
};

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Deletar dados existentes (opcional - descomentar para limpar)
    // await prisma.book.deleteMany({});
    // await prisma.user.deleteMany({});
    // console.log('🗑️  Dados anteriores removidos');

    // Buscar o ÚLTIMO usuário criado (mais recente)
    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    let user = allUsers[0];

    if (!user) {
      // Se não houver usuário, criar um de teste
      const hashedPassword = await bcrypt.hash('senha123', 10);
      user = await prisma.user.create({
        data: {
          name: 'Leitor de Exemplo',
          username: 'leitor',
          email: 'leitor@example.com',
          password: hashedPassword,
        },
      });

      console.log(`✅ Usuário criado: ${user.username}`);
    } else {
      console.log(`✅ Usando usuário: ${user.username} (${user.email})`);
    }

    // Verificar quantidade de livros existentes para este usuário
    const bookCount = await prisma.book.count({
      where: { userId: user.id },
    });

    if (bookCount >= 15) {
      console.log(
        `⚠️  Já existem ${bookCount} livros para "${user.username}". Pulando criação de livros de exemplo.`
      );
    } else {
      console.log(`\n📚 Criando livros de exemplo para "${user.username}"...`);

      let createdCount = 0;

      // Criar livros para cada status
      for (const [status, books] of Object.entries(sampleBooks)) {
        for (const bookData of books) {
          // Verificar se o livro já existe para este usuário
          const existingBook = await prisma.book.findFirst({
            where: {
              userId: user.id,
              title: bookData.title,
              author: bookData.author,
            },
          });

          if (!existingBook) {
            const newBook = await prisma.book.create({
              data: {
                ...bookData,
                status,
                // Para livros sendo lidos, definir currentPage como número aleatório menor que pages
                currentPage:
                  status === 'lendo' ? randomInt(1, Math.floor(bookData.pages * 0.8)) : null,
                userId: user.id,
              },
            });

            createdCount++;
            console.log(`   ✓ ${newBook.title} (${status})`);
          }
        }
      }

      console.log(`\n✅ ${createdCount} livros de exemplo criados com sucesso!`);
    }

    const finalCount = await prisma.book.count({
      where: { userId: user.id },
    });

    console.log(`\n📖 Total de livros para "${user.username}": ${finalCount}`);
    console.log(`\n🔐 Credenciais de acesso:`);
    console.log(`   Usuário: ${user.username}`);
    console.log(`   Email: ${user.email}`);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
