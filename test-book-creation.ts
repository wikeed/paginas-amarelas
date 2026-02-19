import prisma from './lib/prisma.js';

async function testBookCreation() {
  try {
    // Find the latest user (should be 'leitor' from seed)
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!user) {
      console.error('No user found');
      return;
    }

    console.log('Found user:', user.id, user.username);

    // Try to create a book
    const book = await prisma.book.create({
      data: {
        title: 'Test Book',
        author: 'Test Author',
        status: 'a-ler',
        userId: user.id,
      },
    });

    console.log('Book created successfully:', book);
  } catch (error) {
    console.error('Error creating book:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testBookCreation();
