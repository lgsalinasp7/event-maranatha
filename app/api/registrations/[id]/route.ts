import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Actualizar asistencia de un registro
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Base de datos no configurada' },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { attended } = body;

    if (typeof attended !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo "attended" debe ser un booleano' },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.update({
      where: { id },
      data: { attended },
      include: {
        children: true,
      },
    });

    // Transformar respuesta
    const formattedRegistration = {
      id: registration.id,
      firstName: registration.firstName,
      lastName: registration.lastName,
      phone: registration.phone,
      gender: registration.gender.toLowerCase() as 'male' | 'female' | 'other',
      address: registration.address,
      hasChildren: registration.hasChildren,
      children: registration.children.map((child: any) => ({
        id: child.id,
        name: child.name,
        gender: child.gender.toLowerCase() as 'male' | 'female',
        age: child.age,
      })),
      qrCode: registration.qrCode,
      timestamp: registration.timestamp.getTime(),
      attended: registration.attended,
    };

    return NextResponse.json(formattedRegistration);
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el registro' },
      { status: 500 }
    );
  }
}

// GET - Obtener un registro por ID o QR Code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Base de datos no configurada' },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const byQrCode = searchParams.get('qr') === 'true';

    const registration = byQrCode
      ? await prisma.registration.findFirst({
          where: { qrCode: id },
          include: { children: true },
        })
      : await prisma.registration.findUnique({
          where: { id },
          include: { children: true },
        });

    if (!registration) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    // Transformar respuesta
    const formattedRegistration = {
      id: registration.id,
      firstName: registration.firstName,
      lastName: registration.lastName,
      phone: registration.phone,
      gender: registration.gender.toLowerCase() as 'male' | 'female' | 'other',
      address: registration.address,
      hasChildren: registration.hasChildren,
      children: registration.children.map((child: any) => ({
        id: child.id,
        name: child.name,
        gender: child.gender.toLowerCase() as 'male' | 'female',
        age: child.age,
      })),
      qrCode: registration.qrCode,
      timestamp: registration.timestamp.getTime(),
      attended: registration.attended,
    };

    return NextResponse.json(formattedRegistration);
  } catch (error) {
    console.error('Error fetching registration:', error);
    return NextResponse.json(
      { error: 'Error al obtener el registro' },
      { status: 500 }
    );
  }
}

