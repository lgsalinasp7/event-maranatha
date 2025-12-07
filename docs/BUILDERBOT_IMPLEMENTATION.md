# Implementación con BuilderBot

## 🎯 ¿Por qué BuilderBot?

BuilderBot es un framework de código abierto diseñado específicamente para crear bots de WhatsApp. Es la mejor opción para este proyecto porque:

- ✅ **100% GRATIS** - No hay costos por mensaje
- ✅ Framework moderno para Node.js/TypeScript
- ✅ Perfecto para Next.js y Vercel
- ✅ Documentación en español
- ✅ Comunidad activa en Latinoamérica

---

## 📋 Arquitectura con BuilderBot

```
Registro → Guardar en BD → Generar Token → BuilderBot envía WhatsApp → 
Usuario hace clic → Validar Token → Generar QR → Mostrar QR
```

---

## 🚀 Instalación y Configuración

### Paso 1: Instalar BuilderBot

```bash
# Opción 1: Crear proyecto nuevo de BuilderBot
pnpm create builderbot@latest

# Opción 2: Instalar en proyecto existente
npm install @builderbot/bot @builderbot/whatsapp
```

### Paso 2: Configurar Variables de Entorno

Agregar a `.env.local`:

```env
# BuilderBot - WhatsApp
WHATSAPP_SESSION_PATH=./sessions
WHATSAPP_PHONE_NUMBER=+573001234567  # Tu número de WhatsApp Business

# Para usar con Baileys (WhatsApp Web)
BAILEYS_AUTH_PATH=./auth_info_baileys

# Para usar con Twilio (opcional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# URL base de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔧 Implementación

### Opción A: BuilderBot con Baileys (WhatsApp Web)

Esta opción usa WhatsApp Web directamente, sin necesidad de aprobación de Meta (ideal para desarrollo).

#### 1. Crear Servicio WhatsApp con BuilderBot

Crear `lib/whatsapp-builderbot.ts`:

```typescript
import { createBot, createProvider, createFlow } from '@builderbot/bot';
import { BaileysProvider } from '@builderbot/whatsapp';

// Configurar proveedor Baileys
const provider = createProvider(BaileysProvider, {
  authPath: process.env.BAILEYS_AUTH_PATH || './auth_info_baileys',
});

// Crear bot
export const bot = createBot({
  provider,
  database: null, // O usar base de datos si necesitas persistencia
});

// Función para enviar mensaje con enlace QR
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    // Formatear número colombiano
    const formattedPhone = formatColombianPhone(phoneNumber);
    
    // Enviar mensaje
    await bot.sendMessage(formattedPhone, message);
    
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    return false;
  }
}

function formatColombianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    return `57${cleaned}@s.whatsapp.net`;
  }
  
  if (cleaned.startsWith('57')) {
    return `${cleaned}@s.whatsapp.net`;
  }
  
  return `57${cleaned}@s.whatsapp.net`;
}
```

#### 2. Crear API Route para WhatsApp

Crear `app/api/whatsapp/send/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp-builderbot';

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();
    
    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone and message are required' },
        { status: 400 }
      );
    }
    
    const success = await sendWhatsAppMessage(phone, message);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in WhatsApp API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### Opción B: BuilderBot con Twilio (Producción)

Para producción, puedes usar BuilderBot con Twilio como proveedor.

#### 1. Configurar BuilderBot con Twilio

```typescript
import { createBot, createProvider } from '@builderbot/bot';
import { TwilioProvider } from '@builderbot/whatsapp';

const provider = createProvider(TwilioProvider, {
  accountSid: process.env.TWILIO_ACCOUNT_SID!,
  authToken: process.env.TWILIO_AUTH_TOKEN!,
  phoneNumber: process.env.TWILIO_WHATSAPP_NUMBER!,
});

export const bot = createBot({
  provider,
});
```

---

## 📝 Actualizar API de Registro

Modificar `app/api/registrations/route.ts`:

```typescript
import { v4 as uuidv4 } from 'uuid';
import { sendWhatsAppMessage } from '@/lib/whatsapp-builderbot';

export async function POST(request: NextRequest) {
  // ... código existente ...
  
  // Generar token único para WhatsApp
  const whatsappToken = uuidv4();
  
  const newRegistration = await prisma.registration.create({
    data: {
      // ... campos existentes ...
      whatsappToken,
      whatsappSent: false,
    },
  });
  
  // Construir URL del enlace
  const qrLink = `${process.env.NEXT_PUBLIC_APP_URL}/qr/${whatsappToken}`;
  
  // Mensaje WhatsApp con emojis
  const whatsappMessage = `🎉 ¡Bienvenido a la Mega Fiesta de Gracia, ${firstName}!

✅ Tu registro fue exitoso.

📱 Accede a tu código QR aquí:
${qrLink}

¡Te esperamos en el evento! 🙏✨`;
  
  // Enviar WhatsApp (asíncrono)
  sendWhatsAppMessage(phone, whatsappMessage).then(success => {
    if (success) {
      prisma.registration.update({
        where: { id: newRegistration.id },
        data: {
          whatsappSent: true,
          whatsappSentAt: new Date(),
        },
      });
    }
  });
  
  return NextResponse.json(formattedRegistration, { status: 201 });
}
```

---

## 🔐 Configuración de Baileys (WhatsApp Web)

### Para Desarrollo:

1. **Primera vez**: Al iniciar el bot, escanearás el código QR con tu WhatsApp
2. **Sesiones**: BuilderBot guarda la sesión en `auth_info_baileys/`
3. **Reconexión**: En siguientes ejecuciones, se reconecta automáticamente

### Crear Script de Inicialización

Crear `scripts/init-whatsapp.ts`:

```typescript
import { createBot, createProvider } from '@builderbot/bot';
import { BaileysProvider } from '@builderbot/whatsapp';

const provider = createProvider(BaileysProvider, {
  authPath: './auth_info_baileys',
});

const bot = createBot({
  provider,
});

// Iniciar bot y mostrar QR para escanear
bot.on('ready', () => {
  console.log('✅ Bot listo!');
});

bot.on('qr', (qr) => {
  console.log('📱 Escanea este QR con WhatsApp:');
  console.log(qr);
});

bot.start();
```

Ejecutar:
```bash
npx tsx scripts/init-whatsapp.ts
```

---

## 🚀 Despliegue en Vercel

### Consideraciones:

1. **Sesiones**: Baileys guarda sesiones en archivos. En Vercel (Serverless), necesitas:
   - Usar almacenamiento externo (S3, Redis) para sesiones
   - O usar Twilio como proveedor (más fácil para Serverless)

2. **Recomendación para Vercel**: Usar BuilderBot con Twilio

### Configuración para Vercel:

```typescript
// lib/whatsapp-builderbot.ts
import { createBot, createProvider } from '@builderbot/bot';
import { TwilioProvider } from '@builderbot/whatsapp';

// Solo usar Twilio en producción (Vercel)
const provider = process.env.VERCEL
  ? createProvider(TwilioProvider, {
      accountSid: process.env.TWILIO_ACCOUNT_SID!,
      authToken: process.env.TWILIO_AUTH_TOKEN!,
      phoneNumber: process.env.TWILIO_WHATSAPP_NUMBER!,
    })
  : createProvider(BaileysProvider, {
      authPath: './auth_info_baileys',
    });

export const bot = createBot({ provider });
```

---

## 📚 Recursos BuilderBot

- **Documentación oficial**: https://builderbot.app/es
- **GitHub**: https://github.com/codigoencasa/bot-whatsapp
- **Ejemplos**: https://github.com/codigoencasa/bot-whatsapp/tree/main/examples
- **Comunidad**: Discord de BuilderBot

---

## ✅ Ventajas de BuilderBot vs Twilio

| Característica | BuilderBot | Twilio |
|---------------|------------|--------|
| **Costo** | ✅ GRATIS | ❌ ~$0.005/mensaje |
| **Setup inicial** | ⚠️ Más complejo | ✅ Más simple |
| **Flexibilidad** | ✅ Muy flexible | ⚠️ Limitado |
| **Automatización** | ✅ Flujos avanzados | ⚠️ Básico |
| **Serverless** | ⚠️ Requiere ajustes | ✅ Perfecto |
| **Desarrollo** | ✅ WhatsApp Web | ⚠️ Requiere aprobación |

---

## 🎯 Recomendación Final

- **Desarrollo**: Usar BuilderBot con Baileys (WhatsApp Web) - GRATIS y fácil de probar
- **Producción**: 
  - Opción 1: BuilderBot con Twilio (si quieres mantener BuilderBot)
  - Opción 2: Twilio directamente (más simple para Serverless)

---

¿Quieres que implemente BuilderBot en tu proyecto?

