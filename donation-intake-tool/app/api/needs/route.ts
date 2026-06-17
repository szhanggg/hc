import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const needs = await prisma.need.findMany();
  return NextResponse.json(needs);
}
