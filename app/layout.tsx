import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Scholar Hub | AI-Powered Scholarship & Fellowship Platform",
  description: "Discover scholarships made for you, understand eligibility, organise documents, and track every application with confidence.",
  keywords: ["Scholar Hub", "Scholarships", "Fellowships", "AI Scholarship Matching", "National Fellowship ST", "Post-Matric Scholarship", "Education Grants"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#fcfbf9] text-stone-900 antialiased selection:bg-emerald-200 selection:text-emerald-950 dark:bg-[#07130e] dark:text-stone-100">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
