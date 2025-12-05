import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

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

