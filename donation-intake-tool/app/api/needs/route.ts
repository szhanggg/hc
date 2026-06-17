import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET() {
  const needs = await prisma.need.findMany();
  return NextResponse.json(needs, { headers: CORS });
}

export async function POST(req: Request) {
  const body = await req.json() as {
    id: string;
    name: string;
    house: string;
    quantityNeeded: number;
    unitCost: number;
    daysOpen: number;
    category: string;
    description?: string;
  };

  const need = await prisma.need.upsert({
    where: { id: body.id },
    update: {
      quantityNeeded: body.quantityNeeded,
      description: body.description,
    },
    create: {
      id: body.id,
      name: body.name,
      house: body.house,
      quantityNeeded: body.quantityNeeded,
      quantityFulfilled: 0,
      unitCost: body.unitCost,
      daysOpen: body.daysOpen,
      category: body.category,
      description: body.description,
    },
  });

  return NextResponse.json(need, { status: 201, headers: CORS });
}
