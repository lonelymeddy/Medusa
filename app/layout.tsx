import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Medusa Autonomous Coding Agent",
  description: "Autonomous software engineer agent that codes, debugs, fixes, and verifies GitHub repositories across any programming language.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col antialiased selection:bg-blue-500/20 selection:text-blue-300">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
