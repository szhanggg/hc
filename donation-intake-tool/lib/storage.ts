import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "data", "submissions.json");

export async function saveSubmission(submission: any) {
  let existing = [];

  try {
    const file = await fs.readFile(filePath, "utf-8");
    existing = JSON.parse(file);
  } catch {
    existing = [];
  }

  existing.push(submission);
  await fs.writeFile(filePath, JSON.stringify(existing, null, 2));
  return submission;
}

export async function getSubmissions() {
  try {
    const file = await fs.readFile(filePath, "utf-8");
    return JSON.parse(file);
  } catch {
    return [];
  }
}