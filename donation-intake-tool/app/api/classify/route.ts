import { NextResponse } from "next/server";
import { classifyDonationWithAI } from "@/lib/openai";
import { matchDonation } from "@/lib/rules";
import { rulesText } from "@/lib/policy";
import type { Submission } from "@/lib/types";

export async function POST(req: Request) {
  let body: Submission | undefined;

  try {
    body = await req.json();

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
    console.warn("AI classification failed; using local rules.", error);

    if (body) {
      const fallback = matchDonation({
        itemDescription: body.itemDescription,
        packaging: body.packagingStatus,
        condition: body.condition,
        category: body.category,
      });

      return NextResponse.json({
        likelyDecision: fallback.decision,
        confidence: 0,
        reason: `${fallback.reason} AI classification was unavailable, so local policy rules were used.`,
        matchedRules: [fallback.rule],
        needsReview: fallback.decision === "SOMETIMES",
        questions:
          fallback.decision === "SOMETIMES"
            ? ["Please ask staff to review this donation."]
            : [],
      });
    }

    return NextResponse.json(
      { error: "AI classification failed" },
      { status: 500 }
    );
  }
}
