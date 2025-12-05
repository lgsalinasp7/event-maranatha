# Guía de Deployment - GitHub → Vercel → Neon

## ✅ Paso 1: Código en GitHub (Completado)

El código ya está en: `https://github.com/maranathamonteria/event-maranatha`

## 📊 Paso 2: Configurar Neon Database

### 2.1 Crear Proyecto en Neon

1. Ve a [Neon Console](https://console.neon.tech)
2. Inicia sesión o crea una cuenta
3. Click en **"Create Project"**
4. Configura:
   - **Project Name**: `event-maranatha`
   - **Database Name**: `neondb` (o el que prefieras)
   - **Region**: Elige la más cercana a tus usuarios
   - **PostgreSQL Version**: 16 (recomendado)
5. Click en **"Create Project"**

### 2.2 Obtener Connection String

1. Una vez creado el proyecto, ve a **"Connection Details"**
2. Selecciona **"Connection string"** → **"Pooled connection"** (recomendado para Vercel)
3. Copia la URL completa (formato: `postgresql://user:password@host/database?sslmode=require`)
4. **Guarda esta URL** - la necesitarás para Vercel

### 2.3 (Opcional) Crear Branch para Desarrollo

Neon permite crear branches de base de datos. Puedes crear uno para desarrollo:
- Ve a **"Branches"** → **"Create Branch"**
- Nombre: `dev` o `development`

## 🚀 Paso 3: Configurar Vercel

### 3.1 Conectar Repositorio

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New Project"**
3. Selecciona **"Import Git Repository"**
4. Busca y selecciona `maranathamonteria/event-maranatha`
5. Click en **"Import"**

### 3.2 Configurar Variables de Entorno

En la pantalla de configuración del proyecto:

1. Ve a la sección **"Environment Variables"**
2. Agrega las siguientes variables:

#### Variable 1: DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: Pega la connection string de Neon que copiaste
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Variable 2: NEXTAUTH_SECRET
- **Name**: `NEXTAUTH_SECRET`
- **Value**: Genera una clave secreta (ver abajo)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

**Para generar NEXTAUTH_SECRET:**
```bash
# En PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# O usa un generador online: https://generate-secret.vercel.app/32
```

#### Variable 3: NODE_ENV
- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environments**: ✅ Production solamente

### 3.3 Configurar Build Settings

Vercel debería detectar automáticamente Next.js, pero verifica:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (raíz del proyecto)
- **Build Command**: `prisma generate && next build` (ya configurado en vercel.json)
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install` (automático)

### 3.4 Deploy

1. Click en **"Deploy"**
2. Vercel comenzará a construir y desplegar tu aplicación
3. Espera a que termine (puede tomar 2-5 minutos)

## 🔗 Paso 4: Conectar Neon con Vercel (Integración)

### 4.1 Integración Directa (Recomendado)

Neon ofrece integración directa con Vercel:

1. En **Neon Console**, ve a tu proyecto
2. Ve a **"Integrations"** → **"Vercel"**
3. Click en **"Connect Vercel"**
4. Autoriza la conexión
5. Selecciona tu proyecto de Vercel (`event-maranatha`)
6. Neon creará automáticamente la variable `DATABASE_URL` en Vercel

**Ventajas:**
- Variables de entorno configuradas automáticamente
- Branches de base de datos para preview deployments
- Gestión simplificada

### 4.2 Configuración Manual (Alternativa)

Si prefieres configurar manualmente, sigue el Paso 3.2.

## ✅ Paso 5: Verificar Deployment

### 5.1 Verificar Build

1. En Vercel Dashboard, ve a **"Deployments"**
2. Verifica que el build haya sido exitoso
3. Si hay errores, revisa los logs

### 5.2 Aplicar Schema a la Base de Datos

Una vez que Vercel esté conectado con Neon:

**Opción A: Desde tu máquina local**
```bash
# Asegúrate de tener DATABASE_URL en .env.local
npm run db:push
```

**Opción B: Usar Prisma Migrate (recomendado)**
```bash
npm run db:migrate
```

**Opción C: Desde Vercel (usando Vercel CLI)**
```bash
# Instala Vercel CLI
npm i -g vercel

# Conecta con tu proyecto
vercel link

# Ejecuta migración
vercel env pull .env.local
npm run db:migrate
```

### 5.3 Poblar Datos Iniciales

```bash
npm run db:seed
```

Esto creará los usuarios por defecto en Neon.

## 🔍 Paso 6: Verificar que Todo Funciona

1. **Visita tu URL de Vercel**: `https://tu-proyecto.vercel.app`
2. **Prueba el login** con:
   - Admin: `admin@maranatha.com` / `admin123`
   - Organizador: `organizador@maranatha.com` / `org2024`
3. **Verifica el dashboard** (solo admin)
4. **Prueba crear un registro**

## 🔄 Paso 7: Configurar Auto-Deploy

Vercel está configurado para hacer auto-deploy cuando:
- Haces push a `main` → Deploy a producción
- Haces push a otras ramas → Preview deployment

Cada preview deployment puede tener su propia branch de Neon (si usas la integración).

## 📝 Checklist de Deployment

- [ ] Proyecto creado en Neon
- [ ] Connection string copiada
- [ ] Proyecto importado en Vercel desde GitHub
- [ ] Variables de entorno configuradas en Vercel:
  - [ ] `DATABASE_URL`
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `NODE_ENV`
- [ ] Deploy exitoso en Vercel
- [ ] Schema aplicado a Neon (`db:push` o `db:migrate`)
- [ ] Datos iniciales poblados (`db:seed`)
- [ ] Aplicación funcionando correctamente

## 🐛 Troubleshooting

### Error: "Prisma Client not generated"

En Vercel, el build command debe incluir `prisma generate`. Ya está configurado en `vercel.json`.

### Error: "Can't reach database server"

- Verifica que `DATABASE_URL` esté correctamente configurada en Vercel
- Asegúrate de usar la connection string "Pooled" de Neon (no "Direct")
- Verifica que Neon permita conexiones desde Vercel (debería ser automático)

### Error: "Environment variable not found"

- Verifica que todas las variables estén en Vercel Dashboard
- Asegúrate de que estén marcadas para el entorno correcto
- Haz un nuevo deploy después de agregar variables

### El deploy falla

1. Revisa los logs en Vercel Dashboard
2. Verifica que `package.json` tenga todos los scripts necesarios
3. Asegúrate de que Prisma esté en `dependencies` (no solo `devDependencies`)

## 📚 Recursos

- [Neon Documentation](https://neon.tech/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Neon + Vercel Integration](https://neon.tech/docs/guides/vercel)

