// Script para verificar los datos en Neon
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL no está configurada');
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verifyData() {
  console.log('🔍 Verificando datos en Neon...\n');
  
  try {
    await prisma.$connect();
    
    // Verificar usuarios
    console.log('👥 Usuarios en la base de datos:');
    const users = await prisma.user.findMany();
    console.log(`   Total: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    console.log('');
    
    // Verificar registros
    console.log('📝 Registros en la base de datos:');
    const registrations = await prisma.registration.findMany();
    console.log(`   Total: ${registrations.length}`);
    if (registrations.length > 0) {
      registrations.forEach(reg => {
        console.log(`   - ${reg.firstName} ${reg.lastName} (${reg.phone})`);
      });
    }
    console.log('');
    
    // Verificar niños
    console.log('👶 Niños registrados:');
    const children = await prisma.child.findMany();
    console.log(`   Total: ${children.length}`);
    if (children.length > 0) {
      children.forEach(child => {
        console.log(`   - ${child.name} (${child.age} años)`);
      });
    }
    console.log('');
    
    console.log('✅ Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();

