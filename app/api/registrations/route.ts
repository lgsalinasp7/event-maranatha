import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Gender, ChildGender } from '@prisma/client';

// GET - Obtener todos los registros
export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Base de datos no configurada' },
      { status: 503 }
    );
  }

  try {
    const registrations = await prisma.registration.findMany({
      include: {
        children: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Transformar a formato compatible con el frontend
    const formattedRegistrations = registrations.map((reg: any) => ({
      id: reg.id,
      firstName: reg.firstName,
      lastName: reg.lastName,
      phone: reg.phone,
      gender: reg.gender.toLowerCase() as 'male' | 'female' | 'other',
      address: reg.address,
      hasChildren: reg.hasChildren,
      children: reg.children.map((child: any) => ({
        id: child.id,
        name: child.name,
        gender: child.gender.toLowerCase() as 'male' | 'female',
        age: child.age,
      })),
      qrCode: reg.qrCode,
      timestamp: reg.timestamp.getTime(),
      attended: reg.attended,
    }));

    return NextResponse.json(formattedRegistrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Error al obtener los registros' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo registro
export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Base de datos no configurada' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      gender,
      address,
      hasChildren,
      children,
      qrCode,
    } = body;

    // Validar datos requeridos
    if (!firstName || !lastName || !phone || !gender || !address) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Mapear género a enum de Prisma
    const genderMap: Record<string, Gender> = {
      male: Gender.MALE,
      female: Gender.FEMALE,
      other: Gender.OTHER,
    };

    // Crear registro con niños
    const registration = await prisma.registration.create({
      data: {
        firstName,
        lastName,
        phone,
        gender: genderMap[gender.toLowerCase()] || Gender.OTHER,
        address,
        hasChildren: hasChildren || false,
        qrCode: qrCode || '',
        attended: false,
        timestamp: new Date(),
        children: {
          create: (children || []).map((child: any) => ({
            name: child.name,
            gender: child.gender.toLowerCase() === 'male' ? ChildGender.MALE : ChildGender.FEMALE,
            age: parseInt(child.age) || 0,
          })),
        },
      },
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

    return NextResponse.json(formattedRegistration, { status: 201 });
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { error: 'Error al crear el registro' },
      { status: 500 }
    );
  }
}

