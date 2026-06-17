import OpenAI from "openai";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

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
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  const prompt = `You are helping triage donations for RMHC Bay Area.

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
}`;

  type ContentPart =
    | OpenAI.Chat.ChatCompletionContentPartText
    | OpenAI.Chat.ChatCompletionContentPartImage;

  const userContent: ContentPart[] = [{ type: "text", text: prompt }];

  if (photoBase64 && photoMimeType) {
    const dataUrl = photoBase64.startsWith("data:")
      ? photoBase64
      : `data:${photoMimeType};base64,${photoBase64}`;
    userContent.push({
      type: "image_url",
      image_url: { url: dataUrl, detail: "low" },
    });
  }

  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    max_tokens: 1024,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a careful donation intake assistant. Follow policy strictly. Never invent rules. Return valid JSON only.",
      },
      { role: "user", content: userContent },
    ],
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? "";

  let parsed: AiClassificationResult;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`AI returned invalid JSON: ${raw}`);
  }

  return parsed;
}
