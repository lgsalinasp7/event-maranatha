import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Función para obtener el cliente de Prisma (lazy initialization)
function getPrismaClient() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    // Durante el build, DATABASE_URL puede no estar disponible
    // En este caso, retornar null SOLO durante el build, no en runtime
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
    
    // Solo retornar null durante el build, nunca en runtime
    if (isBuildTime) {
      return null as any; // Type assertion para evitar errores de tipo
    }
    
    // En runtime, si no hay DATABASE_URL, lanzar error
    throw new Error('DATABASE_URL no está configurada');
  }

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
}

// Prisma Client con adapter para Prisma 7
// Se inicializa de forma lazy para evitar errores durante el build
export const prisma = getPrismaClient();

