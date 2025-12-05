import { PrismaClient, UserRole } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL no está configurada');
}

// Crear pool y adapter para Prisma 7
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuarios por defecto
  const admin = await prisma.user.upsert({
    where: { email: 'admin@maranatha.com' },
    update: {},
    create: {
      email: 'admin@maranatha.com',
      password: 'admin123', // En producción, esto debería estar hasheado
      role: UserRole.ADMIN,
    },
  });

  const organizer = await prisma.user.upsert({
    where: { email: 'organizador@maranatha.com' },
    update: {},
    create: {
      email: 'organizador@maranatha.com',
      password: 'org2024', // En producción, esto debería estar hasheado
      role: UserRole.ORGANIZER,
    },
  });

  console.log('✅ Usuarios creados:', { admin: admin.email, organizer: organizer.email });
  console.log('✨ Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

