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
}

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: "nfst-2026",
    slug: "national-fellowship-for-st-students",
    title: "National Fellowship for ST Students",
    ministry: "Ministry of Tribal Affairs",
    category: "ST",
    educationLevel: "Ph.D. / Fellowship",
    matchScore: 96,
    deadline: "2026-09-28",
    closingDateFormatted: "Closes 28 Sep",
    amount: 37000,
    amountFormatted: "₹37,000 / month",
    amountPeriod: "month",
    description: "Financial assistance to Scheduled Tribe students for pursuing higher education leading to M.Phil. and Ph.D. degrees in Sciences, Humanities, and Social Sciences in recognized Indian Universities.",
    eligibilityCriteria: [
      "Must belong to a notified Scheduled Tribe (ST) community",
      "Must have secured admission to regular and full-time M.Phil/Ph.D. course",
      "Maximum age 35 years for Men, 40 years for Women candidates",
      "Total family annual income must not exceed ₹6.0 Lakhs per annum",
      "Must not be in receipt of any other fellowship or salary"
    ],
    requiredDocuments: [
      "Aadhaar Card linked with Bank Account (DBT active)",
      "Valid ST Caste Certificate issued by competent authority",
      "Post-Graduation Degree & Consolidated Marksheets",
      "Ph.D. Registration / Admission Confirmation Letter",
      "Valid Annual Family Income Certificate (Current Financial Year)",
      "Institution Bonafide Certificate with Official Seal"
    ],
    benefits: [
      "JRF Fellowship: ₹37,000/month for initial 2 years",
      "SRF Fellowship: ₹42,000/month for remaining 3 years",
      "Contingency Grant: ₹10,000/year (Humanities) & ₹12,000/year (Sciences)",
      "Escort / Reader assistance for PwD scholars: ₹3,000/month",
      "HRA as per Central Government norms for host institute location"
    ],
    selectionProcess: "Merit-based selection prepared by Ministry committee evaluated on PG scores and research domain alignment with affirmative tribal development goals.",
    sponsoringBody: "Central Ministry",
    tags: ["M.Phil / Ph.D.", "Tribal Affairs", "High Value", "DBT Enabled"],
    isFeatured: true,
    genderEligibility: "All",
    maxAnnualIncome: 600000,
    minPercentageRequired: 55,
  },
  {
    id: "post-matric-st-2026",
    slug: "post-matric-scholarship-for-st-students",
    title: "Post-Matric Scholarship for ST Students",
    ministry: "Ministry of Tribal Affairs & State Govts",
    category: "ST",
    educationLevel: "Undergraduate",
    matchScore: 94,
    deadline: "2026-10-15",
    closingDateFormatted: "Closes 15 Oct",
    amount: 120000,
    amountFormatted: "Up to ₹1,20,000 / year",
    amountPeriod: "year",
    description: "Centrally sponsored scheme providing financial support to ST students studying at post-matriculation or post-secondary stages to enable them to complete their education.",
    eligibilityCriteria: [
      "Candidate must belong to Scheduled Tribe category",
      "Must have passed Matriculation/Higher Secondary examination",
      "Total family annual income must not exceed ₹2,50,000 from all sources",
      "Student must be enrolled in recognized college/polytechnic/university",
      "All children of the same parents eligible (no 2-child restriction for ST)"
    ],
    requiredDocuments: [
      "Aadhaar Card & Samagra/JanAadhaar ID",
      "Competent ST Community Certificate",
      "Income Certificate issued by Tehsildar/SDM",
      "Class 10th and 12th Marksheets",
      "Current Year Fee Receipt and Institute Bonafide",
      "Bank Account Details (Aadhaar Seeded)"
    ],
    benefits: [
      "Full non-refundable compulsory tuition fee reimbursement",
      "Monthly maintenance allowance: Up to ₹1,200/month (Hosteller) / ₹550/month (Day scholar)",
      "Book grant and study tour charges for professional degrees",
      "Thesis typing and printing charges for postgraduate research"
    ],
    selectionProcess: "All eligible ST students fulfilling income and institutional recognition criteria are granted assistance without quota capping.",
    sponsoringBody: "Central Ministry",
    tags: ["Undergraduate", "Polytechnic", "Tuition Waiver", "All States"],
    isFeatured: true,
    genderEligibility: "All",
    maxAnnualIncome: 250000,
    minPercentageRequired: 50,
  },
  {
    id: "nos-st-2026",
    slug: "national-overseas-scholarship-for-st-candidates",
    title: "National Overseas Scholarship for ST",
    ministry: "Ministry of Tribal Affairs",
    category: "ST",
    educationLevel: "Postgraduate",
    matchScore: 89,
    deadline: "2026-11-30",
    closingDateFormatted: "Closes 30 Nov",
    amount: 4500000,
    amountFormatted: "₹45,00,000 (Full Overseas Grant)",
    amountPeriod: "total",
    description: "Prestigious central scholarship facilitating ST students to pursue Masters, Ph.D. and Post-Doctoral research programs in premier universities abroad in USA, UK, Germany, Canada, and Australia.",
    eligibilityCriteria: [
      "Must belong to Scheduled Tribe community",
      "Minimum 55% marks or equivalent grade in qualifying Master's degree",
      "Family income must not exceed ₹6,00,000 per annum",
      "Age below 35 years as on 1st July of the application year",
      "Must have secured unconditional offer letter from top 500 QS ranked university"
    ],
    requiredDocuments: [
      "Valid Indian Passport",
      "Unconditional Admission Letter from Foreign University",
      "Official Degree Certificates and Transcripts",
      "ST Tribe Certificate & Domicile",
      "GRE / GMAT / IELTS / TOEFL Scorecard",
      "ITR verification of parents or income certificate"
    ],
    benefits: [
      "Full tuition fees paid directly to the foreign university",
      "Annual maintenance allowance: £9,900 (UK) / $15,400 (USA & Other countries)",
      "Return economy airfare and visa application fees",
      "Medical insurance coverage and incidental contingency allowance"
    ],
    selectionProcess: "National merit list generated based on QS ranking of host institution, academic credentials, and interview rounds.",
    sponsoringBody: "Central Ministry",
    tags: ["Abroad", "Masters & PhD", "Full Ride", "QS Top 500"],
    isFeatured: true,
    genderEligibility: "All",
    maxAnnualIncome: 600000,
    minPercentageRequired: 55,
  },
  {
    id: "top-class-st-2026",
    slug: "top-class-education-scheme-for-st-students",
    title: "Top Class Education Scheme for ST Students",
    ministry: "Ministry of Tribal Affairs",
    category: "ST",
    educationLevel: "Undergraduate",
    matchScore: 92,
    deadline: "2026-10-31",
    closingDateFormatted: "Closes 31 Oct",
    amount: 250000,
    amountFormatted: "Full Fees + ₹86,000 / year",
    amountPeriod: "year",
    description: "Support for meritorious ST students admitted into premier notified institutions such as IITs, NITs, IIMs, AIIMS, NLUs, and IIITs across India.",
    eligibilityCriteria: [
      "Must be an ST student admitted into an institute notified under Top Class scheme",
      "Total family annual income must not exceed ₹6.0 Lakhs per annum",
      "Beneficiary must have cleared national entrance test (JEE Advanced, CAT, NEET, CLAT)"
    ],
    requiredDocuments: [
      "Entrance Exam Rank Card and Seat Allotment Letter",
      "Institute Admission Card and Fee Structure",
      "ST Category Certificate",
      "Income Certificate from Competent Authority",
      "Aadhaar Card and Bank Account with NPCI mapping"
    ],
    benefits: [
      "Full tuition fee and non-refundable charges (up to ₹2.0 Lakhs for private institutes)",
      "Living expenses allowance: ₹3,000 per month (₹36,000/year)",
      "Books and stationery allowance: ₹5,000 per year",
      "One-time laptop/computer purchase allowance: ₹45,000"
    ],
    selectionProcess: "Direct institutional quota allocation administered through National Scholarship Portal (NSP).",
    sponsoringBody: "Central Ministry",
    tags: ["IIT / IIM / NIT", "Merit-Based", "Computer Grant", "Premier Institutes"],
    isFeatured: false,
    genderEligibility: "All",
    maxAnnualIncome: 600000,
    minPercentageRequired: 60,
  },
  {
    id: "pragati-girls-2026",
    slug: "aicte-pragati-scholarship-for-girl-students",
    title: "AICTE Pragati Scholarship for Girls",
    ministry: "All India Council for Technical Education",
    category: "All",
    educationLevel: "Undergraduate",
    matchScore: 88,
    deadline: "2026-10-20",
    closingDateFormatted: "Closes 20 Oct",
    amount: 50000,
    amountFormatted: "₹50,000 / year",
    amountPeriod: "year",
    description: "Empowering female technical scholars admitted to AICTE approved degree and diploma programs to advance women in engineering and technology disciplines.",
    eligibilityCriteria: [
      "Exclusively for female students admitted to 1st year of Degree or Diploma in AICTE approved college",
      "Family annual income should be less than ₹8 Lakhs per annum",
      "Maximum two girls per family are eligible"
    ],
    requiredDocuments: [
      "Class 10th and 12th Marksheet",
      "Centralized Admission Process (CAP) allotment letter",
      "Family Income Certificate from SDM/Tehsildar",
      "Parents declaration stating not more than two daughters",
      "Aadhaar Seeded Bank Passbook"
    ],
    benefits: [
      "Fixed lump sum of ₹50,000 per annum for every year of study",
      "Can be utilized for college fees, laptop purchase, books, and competitive exam fees"
    ],
    selectionProcess: "State-wise merit prepared on qualifying marks in 12th standard or equivalent diploma entrance.",
    sponsoringBody: "Autonomous Body",
    tags: ["Women in STEM", "Engineering", "Diploma", "AICTE"],
    isFeatured: false,
    genderEligibility: "Female Only",
    maxAnnualIncome: 800000,
    minPercentageRequired: 60,
  },
  {
    id: "begum-hazrat-2026",
    slug: "begum-hazrat-mahal-national-scholarship",
    title: "Begum Hazrat Mahal National Scholarship",
    ministry: "Ministry of Minority Affairs",
    category: "Minority",
    educationLevel: "Pre-Matric",
    matchScore: 84,
    deadline: "2026-11-15",
    closingDateFormatted: "Closes 15 Nov",
    amount: 12000,
    amountFormatted: "₹12,000 / year",
    amountPeriod: "year",
    description: "Financial assistance for meritorious girl students belonging to notified minority communities (Muslims, Christians, Sikhs, Buddhists, Jains, and Parsis) studying in classes 9 to 12.",
    eligibilityCriteria: [
      "Only for girl students belonging to notified national minority communities",
      "Must have secured minimum 50% marks in previous aggregate examination",
      "Family annual income from all sources must not exceed ₹2,00,000"
    ],
    requiredDocuments: [
      "Self-declaration of Minority Community certificate",
      "Income Certificate from designated state revenue officer",
      "Previous Academic Year Marksheet with minimum 50% marks",
      "School verification certificate signed by Headmaster/Principal"
    ],
    benefits: [
      "Class 9 & 10: ₹5,000 per year towards tuition and study supplies",
      "Class 11 & 12: ₹6,000 per year directly credited via DBT"
    ],
    selectionProcess: "Merit based on academic performance subject to state quotas.",
    sponsoringBody: "Central Ministry",
    tags: ["Girls", "School Education", "Minority Welfare", "Direct Benefit Transfer"],
    isFeatured: false,
    genderEligibility: "Female Only",
    maxAnnualIncome: 200000,
    minPercentageRequired: 50,
  },
  {
    id: "pre-matric-tribal-2026",
    slug: "pre-matric-scholarship-for-st-students",
    title: "Pre-Matric Scholarship for ST Students (Classes IX & X)",
    ministry: "Ministry of Tribal Affairs",
    category: "ST",
    educationLevel: "Pre-Matric",
    matchScore: 91,
    deadline: "2026-09-30",
    closingDateFormatted: "Closes 30 Sep",
    amount: 6500,
    amountFormatted: "₹6,500 / year",
    amountPeriod: "year",
    description: "Scheme to minimize dropout rates of tribal students transition from upper primary to secondary stages and build stronger foundation for higher studies.",
    eligibilityCriteria: [
      "Student must belong to Scheduled Tribe community",
      "Enrolled in regular full-time classes IX or X in Government or recognized school",
      "Parental income ceiling of ₹2,50,000 per annum"
    ],
    requiredDocuments: [
      "Student Caste Certificate",
      "Parents Income Affidavit / Certificate",
      "School Admission Register extract",
      "Student Aadhaar number"
    ],
    benefits: [
      "Day Scholars: ₹2,250/year allowance + ₹750 book grant",
      "Hostellers: ₹5,250/year allowance + ₹1,000 special grant"
    ],
    selectionProcess: "Universal coverage for all eligible ST students enrolled in recognized secondary schools.",
    sponsoringBody: "Central Ministry",
    tags: ["Secondary School", "Dropout Prevention", "Tribal Welfare"],
    isFeatured: false,
    genderEligibility: "All",
    maxAnnualIncome: 250000,
    minPercentageRequired: 40,
  },
  {
    id: "inspire-dst-2026",
    slug: "dst-inspire-fellowship-scheme",
    title: "INSPIRE Fellowship Scheme",
    ministry: "Department of Science and Technology",
    category: "All",
    educationLevel: "Ph.D. / Fellowship",
    matchScore: 85,
    deadline: "2026-10-30",
    closingDateFormatted: "Closes 30 Oct",
    amount: 42000,
    amountFormatted: "₹42,000 / month",
    amountPeriod: "month",
    description: "Attracting university 1st rank holders in Natural & Basic Sciences or top GPAT/GATE scorers to pursue doctoral research at premier Indian research institutions.",
    eligibilityCriteria: [
      "First rank holder in Post-Graduate degree in Basic & Applied Sciences from recognized Indian university",
      "Or INSPIRE Scholar who secured minimum 70% in PG examination",
      "Admitted to Ph.D. program in recognized university/institute"
    ],
    requiredDocuments: [
      "University 1st Rank Certificate issued by Registrar",
      "Ph.D. Joining Report & Research Proposal",
      "Complete Grade Cards (B.Sc. & M.Sc.)",
      "Endorsement Certificate from Host Institution"
    ],
    benefits: [
      "₹37,000/month for initial two years (JRF)",
      "₹42,000/month for subsequent three years (SRF)",
      "Annual contingency grant of ₹20,000",
      "House Rent Allowance (HRA) as applicable"
    ],
    selectionProcess: "Rigorous scientific review of research proposal and candidate academic standing.",
    sponsoringBody: "Central Ministry",
    tags: ["Science & Tech", "Ph.D.", "Research Grant", "Rank Holders"],
    isFeatured: false,
    genderEligibility: "All",
    minPercentageRequired: 70,
  }
];
