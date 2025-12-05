// Script para probar la conexión a Neon
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL no está configurada en .env.local');
  process.exit(1);
}

// Crear pool y adapter para Prisma 7
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['info', 'warn', 'error'],
});

async function testConnection() {
  console.log('🔌 Probando conexión a Neon...\n');
  
  try {
    // Test 1: Conectar a la base de datos
    console.log('1️⃣ Intentando conectar a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa!\n');

    // Test 2: Verificar que podemos ejecutar queries
    console.log('2️⃣ Ejecutando query de prueba...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query ejecutada correctamente:', result);
    console.log('');

    // Test 3: Verificar versión de PostgreSQL
    console.log('3️⃣ Verificando versión de PostgreSQL...');
    const version = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT version()
    `;
    console.log('✅ Versión de PostgreSQL:', version[0]?.version);
    console.log('');

    // Test 4: Verificar tablas existentes
    console.log('4️⃣ Verificando tablas existentes...');
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    console.log('📊 Tablas encontradas:', tables.length);
    tables.forEach(table => {
      console.log(`   - ${table.tablename}`);
    });
    console.log('');

    // Test 5: Verificar si las tablas de Prisma existen
    console.log('5️⃣ Verificando tablas de Prisma...');
    const prismaTables = ['users', 'registrations', 'children'];
    const existingTables = tables.map(t => t.tablename);
    
    prismaTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table} existe`);
      } else {
        console.log(`   ⚠️  ${table} NO existe (necesita aplicar schema)`);
      }
    });
    console.log('');

    console.log('✨ Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al conectar:', error);
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexión cerrada.');
  }
}

testConnection();

