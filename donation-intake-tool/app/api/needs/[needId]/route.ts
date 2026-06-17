import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ needId: string }> }
) {
  const { needId } = await params;
  const { qty } = await req.json() as { qty: number };

  const need = await prisma.need.findUnique({ where: { id: needId } });
  if (!need) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.need.update({
    where: { id: needId },
    data: {
      quantityFulfilled: Math.min(need.quantityFulfilled + qty, need.quantityNeeded),
    },
  });

  return NextResponse.json(updated);
}
