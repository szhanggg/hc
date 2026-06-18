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
  const events = await prisma.calendarEvent.findMany({
    orderBy: { date: 'asc' },
  });
  return NextResponse.json(events, { headers: CORS });
}

export async function POST(req: Request) {
  const body = await req.json() as {
    id: string;
    title: string;
    date: string;
    location: string;
    locationLabel: string;
    kitType: string;
    iconName: string;
    needed: number;
    pledged?: number;
    status?: string;
    planningLeadMonths?: number;
    notes?: string;
    sponsorStatus?: string;
  };

  const event = await prisma.calendarEvent.upsert({
    where: { id: body.id },
    update: {
      title: body.title,
      date: body.date,
      location: body.location,
      locationLabel: body.locationLabel,
      kitType: body.kitType,
      iconName: body.iconName,
      needed: body.needed,
      pledged: body.pledged ?? 0,
      status: body.status ?? 'planning',
      planningLeadMonths: body.planningLeadMonths ?? 0,
      notes: body.notes ?? null,
      sponsorStatus: body.sponsorStatus ?? null,
    },
    create: {
      id: body.id,
      title: body.title,
      date: body.date,
      location: body.location,
      locationLabel: body.locationLabel,
      kitType: body.kitType,
      iconName: body.iconName,
      needed: body.needed,
      pledged: body.pledged ?? 0,
      status: body.status ?? 'planning',
      planningLeadMonths: body.planningLeadMonths ?? 0,
      notes: body.notes ?? null,
      sponsorStatus: body.sponsorStatus ?? null,
    },
  });

  return NextResponse.json(event, { status: 201, headers: CORS });
}
