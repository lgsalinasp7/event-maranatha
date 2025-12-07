import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Función para obtener el cliente de Prisma (lazy initialization)
// Retorna PrismaClient | null para permitir type-safe null checks en las rutas API
function getPrismaClient(): PrismaClient | null {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    // Si no hay DATABASE_URL, retornar null (tanto en build como en runtime)
    // Esto permite que las rutas API verifiquen `if (!prisma)` y retornen 503
    // en lugar de fallar al importar el módulo
    return null;
  }

  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    const client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client;
    }

    return client;
  } catch (error) {
    // Si hay un error al inicializar, retornar null en lugar de lanzar
    // Esto permite que las rutas API manejen el error apropiadamente
    console.error('Error initializing Prisma client:', error);
    return null;
  }
}

// Prisma Client con adapter para Prisma 7
// Se inicializa de forma lazy para evitar errores durante el build
// Tipo: PrismaClient | null - permite type-safe null checks en las rutas API
// Las rutas API deben verificar `if (!prisma)` antes de usar para retornar 503
export const prisma: PrismaClient | null = getPrismaClient();
