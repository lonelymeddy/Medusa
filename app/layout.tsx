import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "MEDUSA — Autonomous AI Software Engineer",
  description: "Autonomous software engineering agent that investigates codebases, diagnoses bugs, formulates targeted merge diffs, executes test suites, and opens pull requests.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b12] text-slate-100 font-sans">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
