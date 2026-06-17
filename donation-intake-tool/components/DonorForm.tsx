"use client";

import React, { useMemo, useState } from "react";

type FormState = {
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  organizationName: string;
  donationDate: string;
  itemDescription: string;
  category: string;
  quantity: string;
  condition: string;
  packagingStatus: string;
  dropOffLocation: string;
  notes: string;
  manualDecision: "AUTO" | "ACCEPT" | "SOMETIMES" | "DECLINE";
};

type SubmitResult = {
  decision: string;
  reason: string;
  rule?: string;
  confidence: number | null;
};

const initialState: FormState = {
  donorName: "",
  donorEmail: "",
  donorPhone: "",
  organizationName: "",
  donationDate: new Date().toISOString().slice(0, 10),
  itemDescription: "",
  category: "",
  quantity: "1",
  condition: "",
  packagingStatus: "",
  dropOffLocation: "Palo Alto",
  notes: "",
  manualDecision: "AUTO",
};

export default function DonorForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [result, setResult] = useState<SubmitResult | null>(null);

  const canSubmit = useMemo(() => {
    return (
      form.donorName.trim() &&
      form.itemDescription.trim() &&
      form.donorEmail.trim()
    );
  }, [form]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setPhoto(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    } else {
      setPhotoPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setResult(null);

    try {
      let photoBase64: string | null = null;

      if (photo) {
        photoBase64 = await toBase64(photo);
      }

      const payload = {
        ...form,
        photoName: photo?.name || null,
        photoType: photo?.type || null,
        photoBase64,
      };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Submission failed");
      }

      const data = await res.json();
      setResult(data);
      setMessage("Donation submitted successfully.");
      setForm(initialState);
      setPhoto(null);
      setPhotoPreview(null);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-md">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">
        Donor Intake Form
      </h1>
      <p className="mb-6 text-sm text-gray-600">
        Use this form to record in-kind donation details and upload a photo if available.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Donor Name"
            value={form.donorName}
            onChange={(v) => updateField("donorName", v)}
            required
          />
          <Field
            label="Donor Email"
            value={form.donorEmail}
            onChange={(v) => updateField("donorEmail", v)}
            type="email"
            required
          />
          <Field
            label="Donor Phone"
            value={form.donorPhone}
            onChange={(v) => updateField("donorPhone", v)}
          />
          <Field
            label="Organization Name"
            value={form.organizationName}
            onChange={(v) => updateField("organizationName", v)}
          />
          <Field
            label="Donation Date"
            value={form.donationDate}
            onChange={(v) => updateField("donationDate", v)}
            type="date"
          />
          <Field
            label="Category"
            value={form.category}
            onChange={(v) => updateField("category", v)}
            placeholder="e.g. toys, books, diapers"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Quantity"
            value={form.quantity}
            onChange={(v) => updateField("quantity", v)}
            type="number"
            min="1"
          />
          <SelectField
            label="Manual Decision"
            value={form.manualDecision}
            onChange={(v) => updateField("manualDecision", v as FormState["manualDecision"])}
            options={["AUTO", "ACCEPT", "SOMETIMES", "DECLINE"]}
          />
          <Field
            label="Condition"
            value={form.condition}
            onChange={(v) => updateField("condition", v)}
            placeholder="e.g. new, unopened, used, good condition"
          />
          <Field
            label="Packaging Status"
            value={form.packagingStatus}
            onChange={(v) => updateField("packagingStatus", v)}
            placeholder="e.g. original packaging, open box"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          <Field
            label="Drop-off Location"
            value={form.dropOffLocation}
            onChange={(v) => updateField("dropOffLocation", v)}
            placeholder="Palo Alto, SF Mission Bay, Oakland"
          />
        </div>

        <TextArea
          label="Item Description"
          value={form.itemDescription}
          onChange={(v) => updateField("itemDescription", v)}
          placeholder="Describe the item(s) being donated"
          required
        />

        <TextArea
          label="Notes"
          value={form.notes}
          onChange={(v) => updateField("notes", v)}
          placeholder="Any additional details, questions, or special circumstances"
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Photo Upload
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          />

          {photoPreview && (
            <div className="mt-4">
              <p className="mb-2 text-sm text-gray-600">Photo Preview</p>
              <img
                src={photoPreview}
                alt="Donation preview"
                className="max-h-72 rounded-xl border border-gray-200 object-contain"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Donation"}
          </button>

          <button
            type="button"
            onClick={() => {
              setForm(initialState);
              setPhoto(null);
              setPhotoPreview(null);
              setMessage("");
              setResult(null);
            }}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-gray-700"
          >
            Reset
          </button>
        </div>
      </form>

      {message && (
        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
          {message}
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Submission Result
          </h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Decision:</strong> {result.decision}
            </p>
            <p>
              <strong>Reason:</strong> {result.reason}
            </p>
            <p>
              <strong>Rule:</strong> {result.rule || "N/A"}
            </p>
            <p>
              <strong>Confidence:</strong>{" "}
              {typeof result.confidence === "number"
                ? `${Math.round(result.confidence * 100)}%`
                : "N/A"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        required={required}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        required={required}
      />
    </div>
  );
}

async function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
