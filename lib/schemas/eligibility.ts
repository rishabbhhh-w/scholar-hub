import { z } from "zod";

export const eligibilitySchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  category: z.enum(["ST", "SC", "OBC", "General", "Minority"], {
    errorMap: () => ({ message: "Please select your category" }),
  }),
  stateOfDomicile: z.string().min(2, "Please select or enter your state"),
  currentEducationLevel: z.enum([
    "Pre-Matric",
    "Post-Matric",
    "Undergraduate",
    "Postgraduate",
    "Ph.D. / Fellowship",
  ], {
    errorMap: () => ({ message: "Please select your current education level" }),
  }),
  courseName: z.string().min(2, "Course / Degree name is required"),
  annualFamilyIncome: z.number({
    invalid_type_error: "Please enter a valid amount",
  }).min(0, "Income cannot be negative").max(5000000, "Please verify your income figure"),
  lastExamPercentage: z.number({
    invalid_type_error: "Please enter your percentage or GPA equivalent",
  }).min(0).max(100, "Percentage cannot exceed 100"),
  gender: z.enum(["Female", "Male", "Other"], {
    errorMap: () => ({ message: "Please select your gender" }),
  }),
  hasDisability: z.boolean().default(false),
  isFirstGenerationLearner: z.boolean().default(false),
  isAadhaarLinkedToBank: z.boolean().default(true),
  hasValidCasteCertificate: z.boolean().default(true),
});

export type EligibilityFormData = z.infer<typeof eligibilitySchema>;

export const defaultEligibilityValues: EligibilityFormData = {
  fullName: "Scholar Applicant",
  category: "ST",
  stateOfDomicile: "Jharkhand",
  currentEducationLevel: "Ph.D. / Fellowship",
  courseName: "Ph.D. in Tribal Studies & Anthropology",
  annualFamilyIncome: 180000,
  lastExamPercentage: 74.5,
  gender: "Female",
  hasDisability: false,
  isFirstGenerationLearner: true,
  isAadhaarLinkedToBank: true,
  hasValidCasteCertificate: true,
};
