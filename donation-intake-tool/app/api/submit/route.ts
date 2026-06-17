import { NextResponse } from "next/server";
import { classifyDonationWithAI } from "@/lib/openai";
import { saveSubmission } from "@/lib/storage";
import { rulesText } from "@/lib/policy";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let decision: string;
    let reason: string;
    let rule: string;
    let confidence: number | null = null;

    if (body.manualDecision && body.manualDecision !== "AUTO") {
      decision = body.manualDecision;
      reason = "Staff manual override.";
      rule = "Manual override";
    } else {
      const aiResult = await classifyDonationWithAI({
        donorName: body.donorName,
        itemDescription: body.itemDescription,
        condition: body.condition,
        packagingStatus: body.packagingStatus,
        notes: body.notes,
        rulesText,
        photoBase64: body.photoBase64,
        photoMimeType: body.photoType,
      });

      decision = aiResult.likelyDecision;
      reason = aiResult.reason;
      rule = aiResult.matchedRules?.[0] ?? "N/A";
      confidence = aiResult.confidence;
    }

    const submission = {
      ...body,
      photoBase64: undefined,
      decision,
      reason,
      rule,
      confidence,
      createdAt: new Date().toISOString(),
    };

    await saveSubmission(submission);

    return NextResponse.json({ decision, reason, rule, confidence });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Submission failed" },
      { status: 500 }
    );
  }
}
