"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  GitBranch,
  Cpu,
  ShieldCheck,
  ExternalLink,
  Plus,
  Bell,
  RefreshCw,
} from "lucide-react";
import { MedusaLogo } from "@/components/MedusaLogo";

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const [providerInfo, setProviderInfo] = useState<{ active: string; hasToken: boolean }>({
    active: "local",
    hasToken: false,
  });

  useEffect(() => {
    fetch("/api/jules/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProviderInfo({
            active: data.activeProvider || "local",
            hasToken: Boolean(data.status?.github || process.env.GITHUB_TOKEN),
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="h-16 bg-[#070b12]/90 backdrop-blur-md border-b border-[#152033] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#131b2c] transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#0f1728] border border-[#1d2a44] text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Autonomous Engine:</span>
            <span className="text-cyan-400 font-semibold uppercase">{providerInfo.active}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/#new-task"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Task</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0e1626] border border-[#1e2d49] text-xs font-mono text-slate-300">
          <GitBranch className="w-3.5 h-3.5 text-blue-400" />
          <span>GitHub:</span>
          <span className={providerInfo.hasToken ? "text-emerald-400" : "text-amber-400"}>
            {providerInfo.hasToken ? "Connected" : "Preset Mode"}
          </span>
        </div>

        <Link
          href="/deployments"
          className="flex items-center gap-1.5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#131b2c] transition-colors"
          title="Platform Runtime Status"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </Link>

        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#0e1626] hover:bg-[#16223a] border border-[#1e2d49] transition-colors"
        >
          <span>GitHub</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </header>
  );
};
