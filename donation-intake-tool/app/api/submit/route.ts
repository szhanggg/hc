import { NextResponse } from "next/server";
import { classifyDonationWithAI } from "@/lib/openai";
import { matchDonation } from "@/lib/rules";
import { saveSubmission } from "@/lib/storage";
import { rulesText } from "@/lib/policy";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

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
      try {
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
      } catch (error: unknown) {
        console.warn("AI classification failed; using local rules.", error);

        const fallback = matchDonation({
          itemDescription: body.itemDescription,
          packaging: body.packagingStatus,
          condition: body.condition,
          category: body.category,
        });

        decision = fallback.decision;
        reason = `${fallback.reason} AI classification was unavailable, so local policy rules were used.`;
        rule = fallback.rule;
        confidence = null;
      }
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
      { error: getErrorMessage(error) || "Submission failed" },
      { status: 500 }
    );
  }
}
