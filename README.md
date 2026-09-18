# Scholar Hub 🎓🇮🇳

**Scholar Hub** is an intelligent, national-level scholarship aggregation and management platform designed to help ST/SC/OBC/Minority/General students across India discover, check eligibility, apply for, and track government & institutional scholarships (NSP, PFMS, UGC, State Schemes). It also features a dedicated **Nodal Officer Portal** for administrative review, student roster management, and application verification.

---

## 🚀 Features

### 👨‍🎓 Student Portal (`/dashboard`)
- **Scholarship Discovery (`/scholarships`)**: Searchable directory of Post-Matric, Pre-Matric, UG, PG, and PhD scholarship schemes.
- **AI Recommendations (`/recommendations`)**: AI-powered match scoring based on student category, state domicile, and education level.
- **Eligibility Checker (`/eligibility`)**: Step-by-step interactive form evaluating criteria against scholarship guidelines.
- **My Documents Vault (`/documents`)**: Secure document storage for income certificates, caste certificates, marksheets, and identity proofs.
- **Applications & Tracking (`/applications`)**: Live tracking numbers (`NSH-2026-XXXXXX`), approval stages, and status updates.
- **Notifications Center (`/notifications`)**: Deadline advisories, verification alerts, and direct benefit disbursement notices.
- **Scholar AI Assistant (`/assistant`)**: Intelligent scholarship advisor powered by **Google Gemini 1.5 Flash API** answering queries in English & Hinglish.

### 🛡️ Nodal Officer Portal (`/admin`)
- **Admin Dashboard (`/admin`)**: Real-time statistics (*Total Applications*, *Pending Review*, *Approved This Month*, *Total Students Registered*).
- **Applications Review (`/admin/applications`)**: Full review workspace with student detail inspection, green **Approve** button, and red **Reject** button with reason selection (*Incomplete documents*, *Not eligible*, *Duplicate application*, *Other*). Automatically sends notifications to applicants upon status updates.
- **All Students Directory (`/admin/students`)**: Filterable student roster (by ST, SC, OBC, General, Minority, or State) with slide-over drawer inspecting profile credentials, document counts, and application history.
- **Notifications Manager (`/admin/notifications`)**: Broadcast system-wide advisories and deadline alerts directly to all registered students.
- **Settings & Preferences (`/admin/settings`)**: Profile updates, email/password change via Supabase Auth, platform preferences, and security audit logs.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, RLS Policies, Auth, Storage)
- **AI Model**: [Google Gemini 1.5 Flash API](https://ai.google.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📂 Project Structure

```
scholar-hub/
├── app/
│   ├── (dashboard)/
│   │   ├── admin/               # Nodal Officer routes (/admin, /admin/applications, etc.)
│   │   ├── applications/        # Student application tracking
│   │   ├── assistant/           # Scholar AI Assistant (Gemini API)
│   │   ├── dashboard/           # Student space overview
│   │   ├── documents/           # Document vault
│   │   ├── eligibility/         # Eligibility checker
│   │   ├── notifications/       # Student notifications center
│   │   ├── recommendations/     # AI recommendation engine
│   │   └── scholarships/        # Scholarship discovery list
│   ├── api/
│   │   └── chat/                # Gemini 1.5 Flash streaming/JSON API route
│   ├── auth/                    # Auth page (Student register & discreet Admin login)
│   ├── globals.css              # Global styles & theme definitions
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Public landing page
├── components/
│   ├── layout/                  # Sidebar & Header components
│   ├── shared/                  # Reusable UI widgets & modals
│   └── ui/                      # Base primitives (Button, Input, Badge, etc.)
├── lib/
│   ├── hooks/                   # Custom hooks (useUserProfile)
│   ├── supabase/                # Supabase SSR client, server, and middleware helpers
│   └── utils.ts                 # Formatting & class merging utilities
├── supabase/
│   ├── schema.sql               # Database schema & RLS policies
│   └── seed.sql                 # Sample seed data for scholarships & profiles
└── middleware.ts                # Vercel-optimized routing & role protection
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini API (for Scholar AI Assistant)
GEMINI_API_KEY=your-gemini-api-key
```

---

## 🗄️ Database Setup (Supabase)

1. Open your Supabase project SQL Editor.
2. Run the code inside `supabase/schema.sql` to create tables (`profiles`, `scholarships`, `applications`, `documents`, `notifications`), triggers, and RLS policies.
3. Run `supabase/seed.sql` to populate sample scholarships and admin credentials.

---

## 🛈 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rishabbhhh-w/scholar-hub.git
   cd scholar-hub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the project in Vercel.
3. Add the required Environment Variables in Vercel settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
4. Deploy! `middleware.ts` is pre-configured with Node.js runtime compatibility and fail-safe error handling for Vercel Edge routing.

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
