import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
  console.log('🔌 Aplicando schema a Railway PostgreSQL...');

  // Usar DATABASE_PUBLIC_URL para conexión externa
  const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_PUBLIC_URL o DATABASE_URL no está definida');
    console.log('💡 Usa: DATABASE_PUBLIC_URL="tu-url-aqui" npm run db:push');
    process.exit(1);
  }

  console.log('📡 Conectando a Railway PostgreSQL...');
  console.log(`   Host: ${connectionString.split('@')[1]?.split('/')[0]}`);

  let pool: Pool | null = null;
  let prisma: PrismaClient | null = null;

  try {
    pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conexión exitosa!');

    // Verificar tablas existentes
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public';
    `;
    console.log(`📊 Tablas existentes: ${tables.length}`);
    tables.forEach(table => console.log(`   - ${table.tablename}`));

    // Aplicar schema usando db push
    console.log('\n📝 Aplicando schema...');
    console.log('💡 Ejecuta: DATABASE_PUBLIC_URL="tu-url" npx prisma db push');
    
    console.log('\n✨ Verificación completada!');
    console.log('📋 Próximos pasos:');
    console.log('   1. Ejecuta: DATABASE_PUBLIC_URL="tu-url" npx prisma db push');
    console.log('   2. O usa: npx prisma migrate dev');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
    if (pool) {
      await pool.end();
    }
  }
}

main();
