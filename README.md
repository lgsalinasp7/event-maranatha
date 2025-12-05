# Event Maranatha

Sistema de registro de eventos desarrollado con Next.js, Tailwind CSS y shadcn/ui.

## 🚀 Características

- **Registro Multi-paso**: Formulario de registro en 3 pasos con validación
- **Generación de QR**: Códigos QR únicos generados automáticamente
- **Escaneo de QR**: Sistema para marcar asistencia mediante códigos QR
- **Dashboard**: Panel de control con estadísticas y lista de registrados
- **Exportación CSV**: Exporta todos los registros a formato CSV
- **Autenticación**: Sistema de autenticación con roles (Admin/Organizador)
- **Base de Datos**: Integración con Neon (PostgreSQL) usando Prisma
- **Diseño Responsive**: Optimizado para dispositivos móviles y desktop
- **Animaciones**: Transiciones suaves con Framer Motion

## 🛠️ Tecnologías

- **Next.js 16** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos utilitarios
- **shadcn/ui** - Sistema de diseño basado en componentes
- **Framer Motion** - Animaciones
- **Prisma** - ORM para base de datos
- **Neon** - Base de datos PostgreSQL serverless
- **Lucide React** - Iconos

## 📁 Estructura del Proyecto

```
event-maranatha/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Página principal (landing/login)
│   ├── dashboard/         # Dashboard (solo admin)
│   ├── escanear/          # Escaneo de QR
│   ├── exito/             # Página de éxito post-registro
│   └── login/             # Página de login
├── components/
│   ├── ui/                # Componentes de shadcn/ui
│   ├── auth/              # Componentes de autenticación
│   └── event/             # Componentes específicos del evento
├── contexts/              # Contextos de React
│   └── auth-context.tsx   # Contexto de autenticación
├── hooks/                 # Hooks personalizados
├── lib/                   # Utilidades
│   ├── prisma.ts          # Cliente de Prisma
│   ├── auth-utils.ts      # Utilidades de autenticación
│   └── event-utils.ts     # Utilidades del evento
├── prisma/                # Prisma Schema
│   └── schema.prisma      # Schema de base de datos
└── types/                 # Tipos TypeScript
    ├── auth.ts
    └── event.ts
```

## 🏃 Inicio Rápido

### Prerequisitos

- Node.js 18+ instalado
- Cuenta en Neon (https://neon.tech) para la base de datos
- Cuenta en Vercel (opcional, para deployment)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/maranathamonteria/event-maranatha.git
cd event-maranatha
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` basado en `.env.example`:

```bash
cp .env.example .env.local
```

Edita `.env.local` y agrega tu connection string de Neon:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
NEXTAUTH_SECRET="tu-secret-key-aqui"
NODE_ENV="development"
```

4. **Configurar la base de datos**

```bash
# Generar el cliente de Prisma
npm run db:generate

# Aplicar el schema a la base de datos
npm run db:push

# O usar migraciones (recomendado para producción)
npm run db:migrate
```

5. **Ejecutar en desarrollo**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build de Producción

```bash
npm run build
npm start
```

## 🔐 Autenticación

### Usuarios por defecto

**Administrador** (puede ver dashboard):
- Email: `admin@maranatha.com`
- Password: `admin123`

**Organizador** (solo landing page):
- Email: `organizador@maranatha.com`
- Password: `org2024`

Para agregar más usuarios, edita `lib/auth-utils.ts` o usa la base de datos.

## 📝 Uso

1. **Registro**: Los usuarios pueden registrarse completando el formulario de 3 pasos
2. **QR Code**: Al completar el registro, se genera automáticamente un código QR único
3. **Escaneo**: Los organizadores pueden escanear códigos QR para marcar asistencia
4. **Dashboard**: Solo administradores pueden ver estadísticas y lista completa de registrados
5. **Exportación**: Exporta todos los registros a CSV desde el dashboard

## 🗄️ Base de Datos

El proyecto usa Prisma como ORM y Neon como base de datos PostgreSQL.

### Modelos

- **User**: Usuarios administradores/organizadores
- **Registration**: Registros de eventos
- **Child**: Niños asociados a registros

### Comandos de Prisma

```bash
# Generar cliente de Prisma
npm run db:generate

# Aplicar cambios al schema
npm run db:push

# Crear migración
npm run db:migrate

# Abrir Prisma Studio (GUI para la BD)
npm run db:studio
```

## 🚀 Deployment en Vercel

1. **Conectar con GitHub**
   - Push tu código a GitHub
   - Conecta el repositorio en Vercel

2. **Configurar variables de entorno en Vercel**
   - Ve a Settings → Environment Variables
   - Agrega `DATABASE_URL` con tu connection string de Neon
   - Agrega `NEXTAUTH_SECRET` (genera uno aleatorio)

3. **Deploy**
   - Vercel detectará automáticamente Next.js
   - El build incluirá la generación de Prisma Client

## 📦 Dependencias Principales

- `next`: ^16.0.7
- `react`: ^19.2.0
- `prisma`: ^6.x
- `@prisma/client`: ^6.x
- `framer-motion`: ^12.23.25
- `lucide-react`: ^0.556.0
- `tailwindcss`: ^4

## 🎨 Diseño

El proyecto utiliza un diseño moderno con:
- Gradientes suaves (purple, pink, blue)
- Animaciones fluidas
- Componentes reutilizables
- Diseño responsive

## 📄 Licencia

Este proyecto es privado.
