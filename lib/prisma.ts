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
    // En este caso, retornar null y las rutas de API manejarán el error
    // Esto aplica para Vercel, Railway y otros entornos de build
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                       process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !connectionString;
    
    if (isBuildTime || process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT) {
      return null as any; // Type assertion para evitar errores de tipo
    }
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

