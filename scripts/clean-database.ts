import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDatabase() {
  try {
    console.log('🗑️  Iniciando limpeza do banco de dados...\n')
    
    // Deletar todos os livros primeiro (FK constraint)
    const deletedBooks = await prisma.book.deleteMany({})
    console.log(`✅ ${deletedBooks.count} livros deletados`)
    
    // Deletar todos os usuários
    const deletedUsers = await prisma.user.deleteMany({})
    console.log(`✅ ${deletedUsers.count} usuários deletados`)
    
    console.log('\n✨ Banco de dados limpo com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDatabase()
