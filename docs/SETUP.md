# Guía de Configuración - Event Maranatha

## Configuración de Variables de Entorno

### 1. Crear archivo `.env.local`

Copia el archivo `.env.example` y renómbralo a `.env.local`:

```bash
cp .env.example .env.local
```

### 2. Configurar DATABASE_URL de Neon

1. Ve a [Neon Console](https://console.neon.tech)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a la sección "Connection Details"
4. Copia la connection string (formato: `postgresql://user:password@host/database?sslmode=require`)
5. Pégala en `.env.local` como `DATABASE_URL`

Ejemplo:
```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### 3. Configurar NEXTAUTH_SECRET

Genera una clave secreta aleatoria:

```bash
# En Linux/Mac
openssl rand -base64 32

# En Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Agrega el resultado a `.env.local`:
```env
NEXTAUTH_SECRET="tu-clave-secreta-generada"
```

## Configuración de Prisma

### 1. Generar el cliente de Prisma

```bash
npm run db:generate
```

### 2. Aplicar el schema a la base de datos

**Opción A: db push (desarrollo rápido)**
```bash
npm run db:push
```

**Opción B: Migraciones (recomendado para producción)**
```bash
npm run db:migrate
```

### 3. Poblar datos iniciales (seed)

```bash
npm run db:seed
```

Esto creará los usuarios por defecto:
- `admin@maranatha.com` / `admin123` (Admin)
- `organizador@maranatha.com` / `org2024` (Organizador)

### 4. Abrir Prisma Studio (GUI para la BD)

```bash
npm run db:studio
```

Esto abrirá una interfaz web en `http://localhost:5555` para visualizar y editar datos.

## Configuración en Vercel

### 1. Conectar con GitHub

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en "Add New Project"
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `event-maranatha`

### 2. Configurar Variables de Entorno

En la configuración del proyecto en Vercel:

1. Ve a **Settings** → **Environment Variables**
2. Agrega las siguientes variables:

| Variable | Valor | Entornos |
|----------|-------|----------|
| `DATABASE_URL` | Tu connection string de Neon | Production, Preview, Development |
| `NEXTAUTH_SECRET` | Tu clave secreta generada | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

### 3. Configurar Build Command

Vercel detectará automáticamente Next.js, pero asegúrate de que el build incluya:

```bash
prisma generate && next build
```

Esto ya está configurado en `vercel.json`.

### 4. Deploy

1. Click en **Deploy**
2. Vercel construirá y desplegará tu aplicación
3. Una vez completado, tendrás una URL de producción

## Verificación Post-Deploy

Después del deploy en Vercel:

1. Verifica que la aplicación carga correctamente
2. Prueba el login con las credenciales por defecto
3. Verifica que el dashboard funciona (solo para admin)
4. Prueba crear un registro de evento

## Troubleshooting

### Error: "Prisma Client not generated"

```bash
npm run db:generate
```

### Error: "Can't reach database server"

- Verifica que `DATABASE_URL` esté correctamente configurado
- Asegúrate de que Neon permite conexiones desde tu IP
- Verifica que el proyecto Neon esté activo

### Error en Vercel: "Environment variable not found"

- Verifica que todas las variables estén configuradas en Vercel
- Asegúrate de que estén marcadas para el entorno correcto (Production/Preview)

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Generar Prisma Client
npm run db:generate

# Aplicar cambios al schema
npm run db:push

# Crear migración
npm run db:migrate

# Abrir Prisma Studio
npm run db:studio

# Poblar datos iniciales
npm run db:seed

# Build de producción
npm run build
```

## Estructura de Base de Datos

### Tablas

- **users**: Usuarios administradores/organizadores
- **registrations**: Registros de eventos
- **children**: Niños asociados a registros

### Relaciones

- Un `Registration` puede tener muchos `Child`
- Un `Child` pertenece a un `Registration`

