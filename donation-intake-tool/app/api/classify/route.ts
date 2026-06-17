import { NextResponse } from "next/server";
import { classifyDonationWithAI } from "@/lib/openai";
import { rulesText } from "@/lib/policy";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await classifyDonationWithAI({
      donorName: body.donorName,
      itemDescription: body.itemDescription,
      condition: body.condition,
      packagingStatus: body.packagingStatus,
      notes: body.notes,
      rulesText,
      photoBase64: body.photoBase64,
      photoMimeType: body.photoType,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "AI classification failed" },
      { status: 500 }
    );
  }
}
