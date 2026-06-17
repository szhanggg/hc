import OpenAI from "openai";
import type { ResponseInputContent } from "openai/resources/responses/responses";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type AiClassificationResult = {
  likelyDecision: "ACCEPT" | "SOMETIMES" | "DECLINE";
  confidence: number;
  reason: string;
  matchedRules: string[];
  needsReview: boolean;
  questions: string[];
};

export async function classifyDonationWithAI(input: {
  donorName?: string;
  itemDescription: string;
  condition?: string;
  packagingStatus?: string;
  notes?: string;
  rulesText: string;
  photoBase64?: string | null;
  photoMimeType?: string | null;
}): Promise<AiClassificationResult> {
  const {
    donorName,
    itemDescription,
    condition,
    packagingStatus,
    notes,
    rulesText,
    photoBase64,
    photoMimeType,
  } = input;

  const userContent: ResponseInputContent[] = [
    {
      type: "input_text",
      text: `
You are helping triage donations for RMHC Bay Area.

Use the policy exactly as written. If unclear, choose SOMETIMES and ask for human review.

Policy:
${rulesText}

Donation details:
- Donor: ${donorName || "N/A"}
- Item description: ${itemDescription}
- Condition: ${condition || "N/A"}
- Packaging status: ${packagingStatus || "N/A"}
- Notes: ${notes || "N/A"}

Return JSON only with exactly these fields:
{
  "likelyDecision": "ACCEPT" | "SOMETIMES" | "DECLINE",
  "confidence": number,
  "reason": string,
  "matchedRules": string[],
  "needsReview": boolean,
  "questions": string[]
}
`,
    },
  ];

  if (photoBase64 && photoMimeType) {
    userContent.push({
      type: "input_image",
      detail: "auto",
      image_url: photoBase64.startsWith("data:")
        ? photoBase64
        : `data:${photoMimeType};base64,${photoBase64}`,
    });
  }

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are a careful donation intake assistant. Follow policy strictly. Never invent rules. Return valid JSON only.",
      },
      {
        role: "user",
        content: userContent,
      },
    ],
  });

  const raw = response.output_text?.trim() || "";
  const text = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: AiClassificationResult;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`AI returned invalid JSON: ${raw}`);
  }

  return parsed;
}