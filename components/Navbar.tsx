"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  Layers,
  GitBranch,
  Settings,
  Stethoscope,
  ExternalLink,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Workspace", href: "/", icon: Terminal },
    { name: "Sessions", href: "/sessions", icon: Layers },
    { name: "Repositories", href: "/repos", icon: GitBranch },
    { name: "Tools", href: "/tools", icon: Stethoscope },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <header className="h-14 border-b border-[#1e293b] bg-[#090d16]/95 backdrop-blur sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-jules-base tracking-tight text-slate-100 group-hover:text-blue-400 transition-colors">
                Medusa
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                Autonomous
              </span>
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-jules-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#182336] text-blue-400 border border-[#2b3a55]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#131b2a]"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#131d2e] border border-[#202e47] text-jules-micro text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Engine Online</span>
          <span className="text-slate-500">|</span>
          <span className="font-mono text-slate-400">Node v22 / Polyglot</span>
        </div>

        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-jules-xs font-medium text-slate-300 hover:text-white bg-[#151e2e] hover:bg-[#1c273c] border border-[#28354b] transition-all"
        >
          <span>GitHub</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </header>
  );
};
