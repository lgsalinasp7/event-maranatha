# Configuración de Prisma con Neon

## Estado Actual

✅ **Completado:**
- Prisma instalado y configurado
- Schema creado con modelos: User, Registration, Child
- Cliente de Prisma generado
- Scripts de npm configurados
- Archivo de seed creado

## Próximos Pasos

### 1. Configurar Connection String de Neon

1. Ve a [Neon Console](https://console.neon.tech)
2. Crea un proyecto nuevo o selecciona uno existente
3. Copia la connection string
4. Agrega a `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

### 2. Aplicar Schema a la Base de Datos

```bash
# Opción 1: db push (rápido para desarrollo)
npm run db:push

# Opción 2: Migraciones (recomendado)
npm run db:migrate
```

### 3. Poblar Datos Iniciales

```bash
npm run db:seed
```

Esto creará los usuarios por defecto en la base de datos.

## Modelos de Base de Datos

### User
- `id`: String (CUID)
- `email`: String (único)
- `password`: String
- `role`: ADMIN | ORGANIZER
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Registration
- `id`: String (CUID)
- `firstName`: String
- `lastName`: String
- `phone`: String
- `gender`: MALE | FEMALE | OTHER
- `address`: String
- `hasChildren`: Boolean
- `qrCode`: String
- `attended`: Boolean
- `timestamp`: DateTime
- `children`: Child[] (relación)

### Child
- `id`: String (CUID)
- `registrationId`: String (FK)
- `name`: String
- `gender`: MALE | FEMALE
- `age`: Int
- `registration`: Registration (relación)

## Migración desde localStorage

Actualmente el proyecto usa `localStorage` para guardar registros. Para migrar a Prisma:

1. Los datos se guardarán en la base de datos Neon
2. Se puede mantener localStorage como fallback temporal
3. Crear funciones que usen Prisma en lugar de localStorage

## Comandos Disponibles

```bash
npm run db:generate  # Generar Prisma Client
npm run db:push      # Aplicar schema sin migraciones
npm run db:migrate   # Crear y aplicar migraciones
npm run db:studio    # Abrir GUI de Prisma
npm run db:seed      # Poblar datos iniciales
```

