import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Delete existing data
    await prisma.book.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test user
    const hashedPassword = await bcrypt.hash('senha123', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Leitor de Exemplo',
        username: 'leitor',
        email: 'leitor@example.com',
        password: hashedPassword,
      },
    });

    console.log(`✅ Usuário criado: ${user.username}`);

    // Create sample books
    const books = [
      {
        title: 'O Pequeno Príncipe',
        author: 'Antoine de Saint-Exupéry',
        genre: 'Ficção / Infantil',
        pages: 96,
        status: 'lido',
        summary: 'Uma história poética sobre um menino príncipe que viaja entre planetas.',
        image: 'https://picsum.photos/300/400?random=1',
      },
      {
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        genre: 'Romance Clássico',
        pages: 256,
        status: 'lido',
        summary: 'Um dos maiores romances da literatura brasileira.',
        image: 'https://picsum.photos/300/400?random=2',
      },
      {
        title: '1984',
        author: 'George Orwell',
        genre: 'Ficção Científica / Distopia',
        pages: 328,
        status: 'lendo',
        summary: 'Uma sociedade totalitária controlada pelo Grande Irmão.',
        image: 'https://picsum.photos/300/400?random=3',
      },
      {
        title: 'Harry Potter e a Pedra Filosofal',
        author: 'J.K. Rowling',
        genre: 'Fantasia',
        pages: 309,
        status: 'lido',
        summary: 'O começo da jornada de Harry Potter em Hogwarts.',
        image: 'https://picsum.photos/300/400?random=4',
      },
      {
        title: 'O Código Da Vinci',
        author: 'Dan Brown',
        genre: 'Mistério / Thriller',
        pages: 489,
        status: 'a-ler',
        summary: 'Uma busca pelo Santo Graal através de símbolos e pistas.',
        image: 'https://picsum.photos/300/400?random=5',
      },
      {
        title: 'O Hobbit',
        author: 'J.R.R. Tolkien',
        genre: 'Fantasia',
        pages: 310,
        status: 'lido',
        summary: 'A jornada inesperada de Bilbo Bolseiro.',
        image: 'https://picsum.photos/300/400?random=6',
      },
      {
        title: 'O Alquimista',
        author: 'Paulo Coelho',
        genre: 'Ficção Filosófica',
        pages: 224,
        status: 'lendo',
        summary: 'A jornada de um menino em busca do ouro e seu tesouro pessoal.',
        image: 'https://picsum.photos/300/400?random=7',
      },
      {
        title: 'Orgulho e Preconceito',
        author: 'Jane Austen',
        genre: 'Romance Clássico',
        pages: 279,
        status: 'a-ler',
        summary: 'A vida e o amor de Elizabeth Bennet na Inglaterra Georgiana.',
        image: 'https://picsum.photos/300/400?random=8',
      },
    ];

    const createdBooks = await Promise.all(
      books.map((book) =>
        prisma.book.create({
          data: {
            ...book,
            userId: user.id,
          },
        })
      )
    );

    console.log(`✅ ${createdBooks.length} livros criados com sucesso!`);
    console.log(`\n📚 Dados de teste criados:`);
    console.log(`   Usuário: leitor`);
    console.log(`   Senha: senha123`);
    console.log(`   Email: leitor@example.com`);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
