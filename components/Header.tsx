"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Shield,
  Plus,
} from "lucide-react";

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const [activeProvider, setActiveProvider] = useState<string>("gemini");

  useEffect(() => {
    fetch("/api/cyber/providers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.activeProvider) {
          setActiveProvider(data.activeProvider);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="h-14 bg-[#000000] border-b border-[#242424] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-1.5 rounded-full text-[#A1A1AA] hover:text-white hover:bg-[#0A0A0A] transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="pill-badge text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
            <span className="text-[#A1A1AA]">Intelligence:</span>
            <span className="text-white font-semibold uppercase">{activeProvider}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="pill-btn-primary text-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 pill-badge text-xs">
          <Shield className="w-3.5 h-3.5 text-[#E50914]" />
          <span>Scope:</span>
          <span className="text-white font-semibold">Strict Defensive</span>
        </div>
      </div>
    </header>
  );
};
