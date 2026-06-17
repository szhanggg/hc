import rules from "@/data/rules.json";

export function matchDonation(input: {
  itemDescription: string;
  packaging?: string;
  condition?: string;
  category?: string;
}) {
  const text = `${input.itemDescription} ${input.packaging || ""} ${input.condition || ""} ${input.category || ""}`.toLowerCase();

  const declinations = ["stuffed animal", "pop tab", "medical", "used"];
  if (text.includes("stuffed animal")) {
    return {
      decision: "DECLINE",
      reason: "Stuffed animals are not accepted.",
      rule: "Decline: Stuffed animals"
    };
  }

  if (text.includes("furniture")) {
    return {
      decision: "SOMETIMES",
      reason: "Furniture is case-by-case and requires photos/dimensions.",
      rule: "Sometimes: Furniture"
    };
  }

  if (text.includes("diaper")) {
    return {
      decision: "ACCEPT",
      reason: "Diapers are accepted when new and unopened.",
      rule: "Accept: Diapers"
    };
  }

  return {
    decision: "SOMETIMES",
    reason: "Needs staff review because policy match is unclear.",
    rule: "Manual review required"
  };
}