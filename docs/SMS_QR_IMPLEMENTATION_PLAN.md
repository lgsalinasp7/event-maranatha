# Plan de Implementación: Envío de WhatsApp con Enlace y Generación de QR

## 📋 Resumen del Sistema

Implementar un flujo donde:
1. Al completar el registro, se envía un mensaje de WhatsApp con un enlace único al celular del usuario
2. Al hacer clic en el enlace, se genera y muestra el código QR en el dispositivo móvil
3. El usuario puede guardar o compartir el QR desde su celular

---

## 🏗️ Arquitectura Propuesta

```
Registro → Guardar en BD → Generar Token Único → Enviar WhatsApp → 
Usuario hace clic → Validar Token → Generar QR → Mostrar QR en móvil
```

---

## 🔧 Opciones de Servicios WhatsApp

### Opción 1: BuilderBot (⭐ RECOMENDADO - Open Source)
- **Ventajas**: 
  - ✅ **Código abierto y gratuito** (sin costos por mensaje)
  - ✅ Framework específico para WhatsApp
  - ✅ Diseñado para Node.js/TypeScript
  - ✅ Interfaz visual para crear bots
  - ✅ Integración con WhatsApp Web/WhatsApp Business API
  - ✅ Soporte para múltiples proveedores (Baileys, Twilio, etc.)
  - ✅ Documentación en español
  - ✅ Comunidad activa en Latinoamérica
  - ✅ Permite automatización avanzada de conversaciones
  - ✅ Análisis de imágenes y documentos PDF
- **Desventajas**: 
  - Requiere configuración inicial más compleja
  - Necesitas mantener el servidor (pero puedes usar Vercel/Serverless)
  - Requiere aprobación de Meta para producción (igual que otras opciones)
- **Costo**: **GRATIS** (solo costos de hosting si usas servidor propio)
- **Librería**: `@builderbot/bot` (npm)
- **Instalación**: `pnpm create builderbot@latest`
- **Documentación**: https://builderbot.app/es

### Opción 2: Twilio WhatsApp API
- **Ventajas**: 
  - Muy confiable y fácil de integrar
  - Excelente documentación
  - Soporte para WhatsApp Business API
  - API REST simple (similar a SMS)
  - Plan gratuito para desarrollo
  - Muy popular en Colombia y Latinoamérica
- **Desventajas**: 
  - Costo por mensaje (~$0.005 USD por mensaje)
  - Requiere aprobación de Meta para producción
  - Ventana de 24 horas para responder (gratis después de eso)
- **Costo**: ~$0.005 USD por mensaje
- **Librería**: `twilio` (npm)

### Opción 3: WhatsApp Business API Oficial (Meta)
- **Ventajas**:
  - Oficial de Meta/Facebook
  - Integración nativa
  - Sin intermediarios
- **Desventajas**:
  - Configuración más compleja
  - Requiere aprobación de Meta
  - Requiere número de WhatsApp Business verificado
  - Proceso de onboarding más largo
- **Costo**: Variable según plan
- **Librería**: `whatsapp-web.js` o API oficial de Meta

### Opción 4: MessageBird WhatsApp
- **Ventajas**:
  - Buena cobertura en Latinoamérica
  - API simple
  - Soporte para WhatsApp
- **Desventajas**:
  - Menos popular que Twilio
  - Requiere aprobación de Meta
- **Costo**: Variable según país
- **Librería**: `messagebird` (npm)

### Opción 5: 360dialog (WhatsApp Business API Provider)
- **Ventajas**:
  - Especializado en WhatsApp Business API
  - Buena documentación
  - Precio competitivo
- **Desventajas**:
  - Menos conocido que Twilio
  - Requiere aprobación de Meta
- **Costo**: Variable
- **Librería**: API REST personalizada

**Recomendación**: **BuilderBot** es la mejor opción porque:
1. ✅ **Es GRATIS** (sin costos por mensaje)
2. ✅ Framework moderno diseñado específicamente para WhatsApp
3. ✅ Perfecto para Next.js/TypeScript
4. ✅ Puede funcionar con Serverless Functions de Vercel
5. ✅ Más flexible y personalizable
6. ✅ Documentación en español

**Alternativa**: Si prefieres algo más simple y no te importa pagar por mensaje, **Twilio** sigue siendo una excelente opción.

---

## 📦 Librerías Necesarias

### Opción A: BuilderBot (Recomendado)
```bash
# Crear proyecto BuilderBot
pnpm create builderbot@latest

# O instalar en proyecto existente
npm install @builderbot/bot @builderbot/whatsapp
```

### Opción B: Twilio WhatsApp API
```bash
npm install twilio
npm install --save-dev @types/twilio
```

### Para Generación de QR (ya existe):
```bash
# Ya tienes la función generateSimpleQR, pero podemos mejorar con:
npm install qrcode
npm install --save-dev @types/qrcode
```

### Para Tokens Seguros:
```bash
# Ya viene con Next.js, pero podemos usar:
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

---

## 🗄️ Cambios en la Base de Datos

### Actualizar Schema de Prisma

```prisma
model Registration {
  id            String   @id @default(uuid())
  firstName     String
  lastName      String
  phone         String
  gender        Gender
  address       String
  hasChildren   Boolean  @default(false)
  qrCode        String?
  attended      Boolean  @default(false)
  timestamp     DateTime @default(now())
  
  // Nuevos campos
  whatsappToken String?  @unique  // Token único para el enlace WhatsApp
  whatsappSent  Boolean  @default(false)  // Si se envió el WhatsApp
  whatsappSentAt DateTime?  // Fecha de envío del WhatsApp
  qrGenerated   Boolean  @default(false)  // Si se generó el QR desde el enlace
  
  children      Child[]
  
  @@index([phone])
  @@index([whatsappToken])
}
```

---

## 🔐 Flujo de Seguridad

1. **Token Único**: Generar un token UUID único al crear el registro
2. **Token con Expiración**: El token expira después de 7 días (configurable)
3. **Validación**: Verificar que el token existe y no ha expirado antes de mostrar el QR
4. **Rate Limiting**: Limitar intentos de acceso al enlace (prevenir fuerza bruta)

---

## 📝 Pasos de Implementación

### Fase 1: Configuración Inicial

#### 1.1 Instalar Dependencias
```bash
npm install twilio qrcode jsonwebtoken
npm install --save-dev @types/twilio @types/qrcode @types/jsonwebtoken
```

#### 1.2 Variables de Entorno
Agregar a `.env.local`:
```env
# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Número de Twilio WhatsApp (formato: whatsapp:+número)

# JWT para tokens
JWT_SECRET=your_jwt_secret_key_here

# URL base de la aplicación (para los enlaces WhatsApp)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # En producción: https://tu-dominio.com
```

#### 1.3 Actualizar Schema de Prisma
```bash
npm run db:migrate dev --name add_whatsapp_fields
```

---

### Fase 2: Crear Servicio WhatsApp

#### 2.1 Crear `lib/whatsapp-service.ts`
```typescript
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER; // Formato: whatsapp:+14155238886

const client = twilio(accountSid, authToken);

export async function sendWhatsApp(phoneNumber: string, message: string): Promise<boolean> {
  try {
    // Formatear número colombiano para WhatsApp
    const formattedPhone = formatColombianPhoneForWhatsApp(phoneNumber);
    
    await client.messages.create({
      body: message,
      from: twilioWhatsApp, // Número de Twilio WhatsApp
      to: formattedPhone,   // Número destino en formato whatsapp:+57...
    });
    
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    return false;
  }
}

function formatColombianPhoneForWhatsApp(phone: string): string {
  // Remover espacios y caracteres especiales
  const cleaned = phone.replace(/\D/g, '');
  
  // Si empieza con 3 y tiene 10 dígitos, agregar código de país
  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    return `whatsapp:+57${cleaned}`;
  }
  
  // Si ya tiene código de país, retornar con formato WhatsApp
  if (cleaned.startsWith('57')) {
    return `whatsapp:+${cleaned}`;
  }
  
  // Formato por defecto
  return `whatsapp:+57${cleaned}`;
}
```

---

### Fase 3: Actualizar API de Registro

#### 3.1 Modificar `app/api/registrations/route.ts`

```typescript
import { v4 as uuidv4 } from 'uuid';
import { sendWhatsApp } from '@/lib/whatsapp-service';

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
  
  // Mensaje WhatsApp (puede incluir emojis y formato)
  const whatsappMessage = `🎉 ¡Bienvenido a la Mega Fiesta de Gracia, ${firstName}!

✅ Tu registro fue exitoso.

📱 Accede a tu código QR aquí:
${qrLink}

¡Te esperamos en el evento! 🙏✨`;
  
  // Enviar WhatsApp (asíncrono, no bloquea la respuesta)
  sendWhatsApp(phone, whatsappMessage).then(success => {
    if (success) {
      // Actualizar registro con estado de WhatsApp enviado
      prisma.registration.update({
        where: { id: newRegistration.id },
        data: {
          whatsappSent: true,
          whatsappSentAt: new Date(),
        },
      });
    }
  });
  
  // Retornar respuesta inmediatamente (no esperar WhatsApp)
  return NextResponse.json(formattedRegistration, { status: 201 });
}
```

---

### Fase 4: Crear Página de QR Dinámico

#### 4.1 Crear `app/qr/[token]/page.tsx`

```typescript
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { QrCode, Download, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function QRPage() {
  const params = useParams();
  const token = params.token as string;
  const [qrData, setQrData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<any>(null);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const response = await fetch(`/api/qr/${token}`);
        if (!response.ok) {
          throw new Error('Token inválido o expirado');
        }
        const data = await response.json();
        setQrData(data.qrCode);
        setRegistrationData(data.registration);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchQR();
    }
  }, [token]);

  const handleDownload = () => {
    if (!qrData) return;
    const link = document.createElement('a');
    link.href = qrData;
    link.download = `qr-${registrationData?.firstName}-${registrationData?.lastName}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Generando tu código QR...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enlace Inválido</h2>
          <p className="text-gray-600">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {registrationData?.firstName}!
          </h1>
          <p className="text-gray-600">
            Tu código QR está listo para el evento
          </p>
        </div>

        {qrData && (
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white p-4 rounded-xl border-4 border-purple-200 mb-4">
              <Image
                src={qrData}
                alt="QR Code"
                width={250}
                height={250}
                className="rounded-lg"
              />
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Descargar QR
            </button>
          </div>
        )}

        <div className="bg-purple-50 rounded-xl p-4 text-sm text-gray-700">
          <p className="font-semibold mb-2">Información del Registro:</p>
          <p><strong>Nombre:</strong> {registrationData?.firstName} {registrationData?.lastName}</p>
          <p><strong>Celular:</strong> {registrationData?.phone}</p>
          <p><strong>Fecha:</strong> {new Date(registrationData?.timestamp).toLocaleDateString()}</p>
        </div>
      </motion.div>
    </div>
  );
}
```

---

### Fase 5: Crear API para Generar QR

#### 5.1 Crear `app/api/qr/[token]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQRData, generateSimpleQR } from '@/lib/event-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Base de datos no configurada' },
      { status: 503 }
    );
  }

  try {
    const { token } = await params;

    // Buscar registro por token
    const registration = await prisma.registration.findUnique({
      where: { whatsappToken: token },
      include: { children: true },
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 404 }
      );
    }

    // Verificar si el token no ha expirado (7 días)
    const tokenAge = Date.now() - new Date(registration.timestamp).getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    
    if (tokenAge > sevenDays) {
      return NextResponse.json(
        { error: 'Este enlace ha expirado' },
        { status: 410 }
      );
    }

    // Generar QR si no existe o regenerar
    let qrCode = registration.qrCode;
    
    if (!qrCode) {
      const qrData = generateQRData({
        id: registration.id,
        firstName: registration.firstName,
        lastName: registration.lastName,
        phone: registration.phone,
        gender: registration.gender.toLowerCase() as 'male' | 'female' | 'other',
        address: registration.address,
        hasChildren: registration.hasChildren,
        children: registration.children.map(child => ({
          id: child.id,
          name: child.name,
          gender: child.gender.toLowerCase() as 'male' | 'female',
          age: child.age,
        })),
      });
      qrCode = generateSimpleQR(qrData);
      
      // Guardar QR en la base de datos
      await prisma.registration.update({
        where: { id: registration.id },
        data: { qrCode, qrGenerated: true },
      });
    }

    // Formatear respuesta
    const formattedRegistration = {
      id: registration.id,
      firstName: registration.firstName,
      lastName: registration.lastName,
      phone: registration.phone,
      gender: registration.gender.toLowerCase(),
      address: registration.address,
      hasChildren: registration.hasChildren,
      children: registration.children,
      timestamp: registration.timestamp.getTime(),
    };

    return NextResponse.json({
      qrCode,
      registration: formattedRegistration,
    });
  } catch (error) {
    console.error('Error generating QR:', error);
    return NextResponse.json(
      { error: 'Error al generar el código QR' },
      { status: 500 }
    );
  }
}
```

---

## 🎨 Mejoras Adicionales

### 1. Mejorar Generación de QR
Usar librería `qrcode` para QR más profesionales:

```typescript
import QRCode from 'qrcode';

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrDataURL = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrDataURL;
  } catch (error) {
    console.error('Error generating QR:', error);
    return '';
  }
}
```

### 2. Personalizar Mensaje SMS
Permitir personalización del mensaje SMS desde variables de entorno.

### 3. Tracking de SMS
Agregar webhooks de Twilio para rastrear el estado de entrega de SMS.

### 4. Reenvío de SMS
Permitir reenviar el SMS si el usuario no lo recibió.

---

## 💰 Estimación de Costos

### Twilio WhatsApp (Colombia):
- **Precio por mensaje**: ~$0.005 USD (más barato que SMS)
- **500 registros**: ~$2.50 USD
- **1000 registros**: ~$5.00 USD

### Consideraciones:
- Twilio ofrece créditos gratuitos para nuevas cuentas ($15 USD)
- Los números de prueba son gratuitos pero solo funcionan con números verificados
- **Ventana de 24 horas**: Después de que el usuario responde, puedes enviar mensajes gratis por 24 horas
- **Aprobación de Meta**: Para producción necesitas aprobación de Meta/Facebook

---

## 🔒 Consideraciones de Seguridad

1. **Tokens Únicos**: Usar UUID v4 para tokens impredecibles
2. **Expiración**: Los tokens expiran después de 7 días
3. **Rate Limiting**: Implementar límites de solicitudes por IP
4. **Validación**: Verificar que el token existe y pertenece al registro
5. **HTTPS**: Asegurar que la aplicación use HTTPS en producción

---

## 📱 Pruebas

### Pruebas Locales:
1. Usar número de prueba de Twilio
2. Verificar número personal en Twilio Console
3. Probar envío de SMS a número verificado
4. Probar acceso al enlace con token válido

### Pruebas en Producción:
1. Configurar número de Twilio para producción
2. Probar con números reales de Colombia
3. Verificar que los enlaces funcionan correctamente
4. Monitorear logs de errores

---

## 🚀 Orden de Implementación

1. ✅ Instalar dependencias
2. ✅ Configurar variables de entorno
3. ✅ Actualizar schema de Prisma
4. ✅ Crear servicio SMS
5. ✅ Actualizar API de registro
6. ✅ Crear API de QR por token
7. ✅ Crear página de QR dinámico
8. ✅ Probar flujo completo
9. ✅ Desplegar en producción

---

## 📚 Recursos

- [Twilio Node.js SDK](https://www.twilio.com/docs/libraries/node)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [QRCode npm](https://www.npmjs.com/package/qrcode)
- [Next.js Dynamic Routes](https://nextjs.org/docs/routing/dynamic-routes)

---

## ⚠️ Notas Importantes

1. **Números de Prueba**: Twilio requiere verificar números para pruebas
2. **Formato de Números**: Asegurar formato correcto (whatsapp:+57XXXXXXXXXX)
3. **Costo**: Monitorear uso de WhatsApp para controlar costos
4. **Ventana de 24 horas**: Después de que el usuario responde, puedes enviar mensajes gratis por 24 horas
5. **Aprobación de Meta**: Para producción necesitas aprobación de Meta/Facebook Business
6. **Plantilla de Mensajes**: En producción, necesitas usar plantillas pre-aprobadas para mensajes fuera de la ventana de 24 horas
7. **Compliance**: Asegurar cumplimiento con políticas de WhatsApp Business

---

## 📋 Configuración de Twilio WhatsApp

### Paso 1: Crear cuenta en Twilio
1. Ir a https://www.twilio.com
2. Crear cuenta gratuita
3. Verificar número de teléfono

### Paso 2: Configurar WhatsApp Sandbox
1. En Twilio Console, ir a Messaging > Try it out > Send a WhatsApp message
2. Seguir las instrucciones para unirte al Sandbox
3. Enviar el código que te dan al número de WhatsApp de Twilio
4. Una vez unido, puedes enviar mensajes de prueba

### Paso 3: Solicitar Aprobación para Producción
1. Completar el formulario de WhatsApp Business API en Twilio
2. Proporcionar información del negocio
3. Esperar aprobación de Meta (puede tomar varios días)
4. Una vez aprobado, recibirás un número de WhatsApp Business

### Paso 4: Configurar Variables de Entorno
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Sandbox o número aprobado
```

---

¿Quieres que proceda con la implementación de alguna fase específica?

