"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Terminal,
  GitBranch,
  GitPullRequest,
  CheckCircle2,
  Stethoscope,
  Activity,
  Cpu,
  BookOpen,
  Settings,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
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

  const mainNav = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "New Task", href: "/#new-task", icon: PlusCircle, highlight: true },
    { name: "My Tasks", href: "/tasks", icon: Layers },
    { name: "Workspace", href: "/workspace", icon: Terminal },
    { name: "Repositories", href: "/repos", icon: GitBranch },
    { name: "Pull Requests", href: "/pull-requests", icon: GitPullRequest },
    { name: "Code Reviews", href: "/reviews", icon: CheckCircle2 },
    { name: "Terminal", href: "/terminal", icon: Terminal },
    { name: "Deployments", href: "/deployments", icon: Stethoscope },
    { name: "Activity Logs", href: "/logs", icon: Activity },
  ];

  const platformNav = [
    { name: "AI Models", href: "/models", icon: Cpu },
    { name: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const renderNavGroup = (items: typeof mainNav, title?: string) => (
    <div className="space-y-1">
      {title && !collapsed && (
        <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-500 font-medium">
          {title}
        </div>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.split("#")[0]);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onCloseMobile}
            title={collapsed ? item.name : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative",
              isActive
                ? "bg-blue-600/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#131b2c] border border-transparent",
              collapsed && "justify-center px-2"
            )}
          >
            <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200")} />
            {!collapsed && (
              <span className="truncate">{item.name}</span>
            )}
            {item.highlight && !collapsed && (
              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                Action
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#070b12] border-r border-[#152033] transition-all duration-300 ease-in-out lg:static",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#152033]">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden" onClick={onCloseMobile}>
            <MedusaLogo size={30} />
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wider text-white">MEDUSA</span>
                <span className="text-[10px] font-mono text-cyan-400 -mt-0.5 font-medium">Autonomous Agent</span>
              </div>
            )}
          </Link>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#131b2c]"
            aria-label="Close mobile navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {renderNavGroup(mainNav, "Workspace")}
          <div className="border-t border-[#131b2c] pt-4">
            {renderNavGroup(platformNav, "Configuration")}
          </div>
        </div>

        <div className="p-3 border-t border-[#152033] bg-[#05080e] flex flex-col gap-2">
          {(!collapsed || mobileOpen) ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shrink-0 font-mono text-xs font-bold">
                  ME
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-slate-200 truncate">Engineer Workspace</span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Autonomous Mode
                  </span>
                </div>
              </div>
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#131b2c] transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-[#131b2c] transition-colors"
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
