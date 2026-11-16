"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plus,
  History,
  KeyRound,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { MedusaLogo } from "@/components/MedusaLogo";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  // Exactly four sidebar items
  const navItems = [
    { name: "New Chat", href: "/", icon: Plus, highlight: true },
    { name: "History", href: "/history", icon: History },
    { name: "API", href: "/api-settings", icon: KeyRound },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#000000] border-r border-[#242424] transition-all duration-200 ease-in-out lg:static",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#242424]">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden" onClick={onCloseMobile}>
            <MedusaLogo size={28} />
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-widest text-white">MEDUSA</span>
                <span className="text-[10px] font-mono text-[#E50914] -mt-0.5 tracking-wider font-semibold">CYBER DEFENSE</span>
              </div>
            )}
          </Link>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-full text-[#A1A1AA] hover:text-white hover:bg-[#0A0A0A]"
            aria-label="Close mobile navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            if (item.highlight) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all",
                    isActive
                      ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/20"
                      : "bg-[#0A0A0A] text-white border border-[#242424] hover:border-[#E50914] hover:bg-[#E50914]/10",
                    collapsed && "justify-center px-2 py-2"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-[#E50914]")} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all",
                  isActive
                    ? "bg-[#0A0A0A] text-[#E50914] border border-[#E50914] font-semibold"
                    : "text-[#A1A1AA] hover:text-white hover:bg-[#0A0A0A] border border-transparent",
                  collapsed && "justify-center px-2 py-2"
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-[#E50914]" : "text-[#A1A1AA]")} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        <div className="p-3 border-t border-[#242424] bg-[#000000] flex flex-col gap-2">
          {(!collapsed || mobileOpen) ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
                <span className="text-[11px] font-mono text-[#A1A1AA]">
                  Autonomous Agent Active
                </span>
              </div>
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-full text-[#A1A1AA] hover:text-white hover:bg-[#0A0A0A] transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center p-2 rounded-full text-[#A1A1AA] hover:text-white hover:bg-[#0A0A0A] transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
