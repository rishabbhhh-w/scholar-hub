export type DocumentStatus = "verified" | "in_review" | "needs_attention" | "expiring_soon";

export interface StudentDocument {
  id: string;
  name: string;
  category: "Identity" | "Caste & Tribe" | "Income" | "Academic" | "Institution" | "Banking";
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: DocumentStatus;
  statusText: string;
  digilockerVerified: boolean;
  issueAuthority: string;
  validUntil?: string;
  previewUrl?: string;
  issueNotes?: string;
}

export const INITIAL_DOCUMENTS: StudentDocument[] = [
  {
    id: "doc-1",
    name: "Aadhaar Card (UIDAI)",
    category: "Identity",
    fileName: "aadhaar_card_masked.pdf",
    fileSize: "1.2 MB",
    uploadedAt: "12 May 2026",
    status: "verified",
    statusText: "Verified via DigiLocker",
    digilockerVerified: true,
    issueAuthority: "Unique Identification Authority of India (UIDAI)",
    validUntil: "Lifetime",
  },
  {
    id: "doc-2",
    name: "Scheduled Tribe (ST) Certificate",
    category: "Caste & Tribe",
    fileName: "st_certificate_jharkhand_sdm.pdf",
    fileSize: "2.4 MB",
    uploadedAt: "15 May 2026",
    status: "verified",
    statusText: "Verified by State Revenue Portal",
    digilockerVerified: true,
    issueAuthority: "Sub-Divisional Magistrate (SDM), Ranchi",
    validUntil: "Permanent / Lifetime",
  },
  {
    id: "doc-3",
    name: "M.Sc. Consolidated Marksheet & Degree",
    category: "Academic",
    fileName: "msc_anthropology_cuj_marksheet.pdf",
    fileSize: "3.8 MB",
    uploadedAt: "20 June 2026",
    status: "verified",
    statusText: "Verified by Academic Bank of Credits (ABC)",
    digilockerVerified: true,
    issueAuthority: "Central University of Jharkhand",
  },
  {
    id: "doc-4",
    name: "B.Sc. Degree Certificate",
    category: "Academic",
    fileName: "bsc_st_xaviers_degree.pdf",
    fileSize: "2.1 MB",
    uploadedAt: "20 June 2026",
    status: "verified",
    statusText: "Verified by DigiLocker",
    digilockerVerified: true,
    issueAuthority: "St. Xavier's College, Ranchi",
  },
  {
    id: "doc-5",
    name: "Class 10th ICSE Certificate (DOB Proof)",
    category: "Identity",
    fileName: "class_10th_pass_certificate.pdf",
    fileSize: "1.5 MB",
    uploadedAt: "15 May 2026",
    status: "verified",
    statusText: "Verified by CISCE Portal",
    digilockerVerified: true,
    issueAuthority: "Council for the Indian School Certificate Examinations",
  },
  {
    id: "doc-6",
    name: "Class 12th Intermediate Marksheet",
    category: "Academic",
    fileName: "class_12th_science_marksheet.pdf",
    fileSize: "1.8 MB",
    uploadedAt: "15 May 2026",
    status: "verified",
    statusText: "Verified",
    digilockerVerified: true,
    issueAuthority: "JAC Board Ranchi",
  },
  {
    id: "doc-7",
    name: "SBI Passbook & Mandate (Aadhaar Seeded)",
    category: "Banking",
    fileName: "sbi_passbook_dbt_mandate.pdf",
    fileSize: "950 KB",
    uploadedAt: "18 May 2026",
    status: "verified",
    statusText: "NPCI DBT Active & Verified",
    digilockerVerified: false,
    issueAuthority: "State Bank of India (Ranchi Main Branch)",
  },
  {
    id: "doc-8",
    name: "Ph.D. Coursework Admission Letter",
    category: "Institution",
    fileName: "phd_admission_letter_2026.pdf",
    fileSize: "1.1 MB",
    uploadedAt: "10 Aug 2026",
    status: "verified",
    statusText: "Verified by Nodal Desk",
    digilockerVerified: false,
    issueAuthority: "Office of the Dean, CUJ",
  },
  // 2 documents needing attention (exactly matching "8 documents ready, 2 need attention")
  {
    id: "doc-9",
    name: "Annual Family Income Certificate (FY 2026-27)",
    category: "Income",
    fileName: "income_cert_previous_year.pdf",
    fileSize: "1.7 MB",
    uploadedAt: "02 Aug 2026",
    status: "needs_attention",
    statusText: "Action Needed: Previous FY uploaded",
    digilockerVerified: false,
    issueAuthority: "Circle Officer, Kanke, Ranchi",
    issueNotes: "The uploaded certificate belongs to FY 2024-25. Please upload the income certificate for the current financial year (2026-27) to avoid application rejection.",
  },
  {
    id: "doc-10",
    name: "Current Semester Bonafide Certificate",
    category: "Institution",
    fileName: "bonafide_certificate_unsigned.pdf",
    fileSize: "840 KB",
    uploadedAt: "12 Aug 2026",
    status: "needs_attention",
    statusText: "Action Needed: Missing Principal Stamp",
    digilockerVerified: false,
    issueAuthority: "Department of Tribal Studies, CUJ",
    issueNotes: "The official round seal/stamp of the Head of Department is missing on page 1. Please obtain the stamp and re-upload.",
  }
];
