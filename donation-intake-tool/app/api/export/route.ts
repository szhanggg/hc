import { NextResponse } from "next/server";
import { getSubmissions } from "@/lib/storage";
import { toCSV } from "@/lib/csv";

export async function GET() {
  const submissions = await getSubmissions();
  const csv = toCSV(submissions);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="donations.csv"'
    }
  });
}