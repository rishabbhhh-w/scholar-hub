export interface Scholarship {
  id: string;
  slug: string;
  title: string;
  ministry: string;
  category: "ST" | "SC" | "OBC" | "General" | "Minority" | "All";
  educationLevel: "Pre-Matric" | "Post-Matric" | "Undergraduate" | "Postgraduate" | "Ph.D. / Fellowship";
  matchScore: number;
  deadline: string;
  closingDateFormatted: string;
  amount: number;
  amountFormatted: string;
  amountPeriod: "month" | "year" | "one-time" | "total";
  description: string;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  benefits: string[];
  selectionProcess: string;
  sponsoringBody: "Central Ministry" | "State Government" | "UGC" | "Autonomous Body";
  tags: string[];
  isFeatured?: boolean;
  state?: string;
  genderEligibility: "All" | "Female Only";
  maxAnnualIncome?: number;
  minPercentageRequired?: number;
  status?: "active" | "closed" | "inactive";
}

export const SCHOLARSHIPS: Scholarship[] = [];
