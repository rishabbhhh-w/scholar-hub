export type ApplicationStatus = 
  | "draft"
  | "submitted"
  | "institute_verification"
  | "nodal_verification"
  | "sanctioned"
  | "disbursed"
  | "rejected"
  | "action_required";

export interface TimelineStep {
  title: string;
  date?: string;
  status: "completed" | "current" | "upcoming" | "error";
  description: string;
  officer?: string;
}

export interface ApplicationRecord {
  id: string;
  trackingNumber: string;
  scholarshipId: string;
  scholarshipTitle: string;
  ministry: string;
  amount: string;
  submissionDate: string;
  lastUpdated: string;
  status: ApplicationStatus;
  statusLabel: string;
  stageProgress: number; // 0 to 100
  academicYear: string;
  applicantName: string;
  assignedOfficer: string;
  assignedOffice: string;
  remarks: string;
  actionNeeded?: string;
  timeline: TimelineStep[];
}

export const APPLICATIONS: ApplicationRecord[] = [
  {
    id: "app-001",
    trackingNumber: "NFST-2026-JH-90412",
    scholarshipId: "nfst-2026",
    scholarshipTitle: "National Fellowship for ST Students",
    ministry: "Ministry of Tribal Affairs",
    amount: "₹37,000 / month",
    submissionDate: "2026-08-14",
    lastUpdated: "2026-09-12",
    status: "nodal_verification",
    statusLabel: "Nodal Officer Verification",
    stageProgress: 65,
    academicYear: "2026-27",
    applicantName: "Scholar Applicant",
    assignedOfficer: "Shri R.K. Soren (State Tribal Welfare Officer)",
    assignedOffice: "Directorate of Tribal Welfare, Ranchi, Jharkhand",
    remarks: "Institute physical verification completed. Forwarded to State Nodal Directorate for sanction list generation.",
    timeline: [
      {
        title: "Application Submitted Online",
        date: "14 Aug 2026",
        status: "completed",
        description: "Application successfully submitted with digital signature.",
      },
      {
        title: "Institute Level Verification",
        date: "28 Aug 2026",
        status: "completed",
        description: "Verified by Dean of Student Affairs, Central University of Jharkhand.",
        officer: "Prof. S. Kerketta"
      },
      {
        title: "State Nodal Directorate Scrutiny",
        date: "12 Sep 2026",
        status: "current",
        description: "Verification of ST tribe certificate and admission status in progress.",
        officer: "Shri R.K. Soren"
      },
      {
        title: "Ministry Sanction Order",
        status: "upcoming",
        description: "Official sanction decree generated and uploaded to portal."
      },
      {
        title: "Direct Benefit Transfer (PFMS)",
        status: "upcoming",
        description: "Fellowship disbursement directly into Aadhaar seeded account."
      }
    ]
  },
  {
    id: "app-002",
    trackingNumber: "POST-2026-JH-44810",
    scholarshipId: "post-matric-st-2026",
    scholarshipTitle: "Post-Matric Scholarship for ST Students",
    ministry: "Ministry of Tribal Affairs & State Govt",
    amount: "₹1,20,000 / year",
    submissionDate: "2026-08-02",
    lastUpdated: "2026-09-10",
    status: "action_required",
    statusLabel: "Action Required: Re-upload Document",
    stageProgress: 45,
    academicYear: "2026-27",
    applicantName: "Scholar Applicant",
    assignedOfficer: "District Welfare Officer, Ranchi",
    assignedOffice: "Collectorate Compound, Ranchi",
    remarks: "Income Certificate issued prior to 1st April 2026 is invalid for Current FY. Please upload current FY 2026-27 certificate issued by Tehsildar.",
    actionNeeded: "Upload Current FY 2026-27 Income Certificate",
    timeline: [
      {
        title: "Application Submitted",
        date: "02 Aug 2026",
        status: "completed",
        description: "Submitted along with initial documents.",
      },
      {
        title: "Institute Verification",
        date: "18 Aug 2026",
        status: "completed",
        description: "Endorsed by college principal."
      },
      {
        title: "District Scrutiny Defect Notice",
        date: "10 Sep 2026",
        status: "error",
        description: "Discrepancy identified in financial year validity of income certificate.",
        officer: "DWO Ranchi"
      },
      {
        title: "Final Approval & Sanction",
        status: "upcoming",
        description: "Pending resolution of defective document."
      },
      {
        title: "Disbursement via e-Kalyan",
        status: "upcoming",
        description: "Tuition and maintenance fee credit."
      }
    ]
  },
  {
    id: "app-003",
    trackingNumber: "TOP-2025-JH-11902",
    scholarshipId: "top-class-st-2026",
    scholarshipTitle: "Top Class Education Scheme for ST Students",
    ministry: "Ministry of Tribal Affairs",
    amount: "₹2,50,000",
    submissionDate: "2025-09-10",
    lastUpdated: "2026-01-20",
    status: "disbursed",
    statusLabel: "Disbursed via PFMS",
    stageProgress: 100,
    academicYear: "2025-26",
    applicantName: "Scholar Applicant",
    assignedOfficer: "Under Secretary, Ministry of Tribal Affairs",
    assignedOffice: "Shastri Bhawan, New Delhi",
    remarks: "Full annual sanction amount of ₹2,50,000 credited to beneficiary State Bank of India account via DBT (UTR: SBIN26012089412).",
    timeline: [
      {
        title: "Application Submitted",
        date: "10 Sep 2025",
        status: "completed",
        description: "Submitted successfully on National Scholarship Portal."
      },
      {
        title: "Institute Endorsement",
        date: "25 Sep 2025",
        status: "completed",
        description: "Verified by Registrar."
      },
      {
        title: "Ministry Sanctioned",
        date: "15 Nov 2025",
        status: "completed",
        description: "Sanction order #MoTA/TC/2025/11902 published."
      },
      {
        title: "PFMS DBT Credit",
        date: "20 Jan 2026",
        status: "completed",
        description: "₹2,50,000 successfully disbursed."
      }
    ]
  },
  {
    id: "app-004",
    trackingNumber: "NOS-2026-DRAFT-09",
    scholarshipId: "nos-st-2026",
    scholarshipTitle: "National Overseas Scholarship for ST",
    ministry: "Ministry of Tribal Affairs",
    amount: "₹45,00,000",
    submissionDate: "2026-09-05",
    lastUpdated: "2026-09-05",
    status: "draft",
    statusLabel: "Draft (Saved)",
    stageProgress: 20,
    academicYear: "2026-27",
    applicantName: "Scholar Applicant",
    assignedOfficer: "Not Assigned Yet",
    assignedOffice: "Overseas Cell, New Delhi",
    remarks: "Draft application saved. Passport copy and unconditional offer letter still to be attached.",
    actionNeeded: "Complete Sections 4 & 5 before 30 Nov",
    timeline: [
      {
        title: "Draft Created",
        date: "05 Sep 2026",
        status: "current",
        description: "Personal and academic information filled."
      },
      {
        title: "Submission",
        status: "upcoming",
        description: "Upload remaining admission letter and submit."
      }
    ]
  }
];
