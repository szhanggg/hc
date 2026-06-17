export type DonationDecision = "ACCEPT" | "SOMETIMES" | "DECLINE";

export type Submission = {
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  organizationName?: string;
  donationDate?: string;
  itemDescription?: string;
  category?: string;
  quantity?: string;
  condition?: string;
  packagingStatus?: string;
  dropOffLocation?: string;
  notes?: string;
  manualDecision?: "AUTO" | DonationDecision;
  photoName?: string | null;
  photoType?: string | null;
  photoBase64?: string;
  decision?: DonationDecision | string;
  reason?: string;
  rule?: string;
  confidence?: number | null;
  createdAt?: string;
};
