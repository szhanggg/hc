import type { Submission } from "@/lib/types";

export function toCSV(rows: Submission[]) {
  const headers = [
    "donor_name",
    "donor_email",
    "donor_phone",
    "item_description",
    "decision",
    "decision_reason",
    "reviewer_note",
    "submitted_at"
  ];

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.donorName,
        row.donorEmail,
        row.donorPhone,
        row.itemDescription,
        row.decision,
        row.reason,
        "",
        row.createdAt
      ]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    )
  ];

  return lines.join("\n");
}
