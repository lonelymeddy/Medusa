"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { JulesSession } from "@/lib/jules-engine/types";
import { formatTimestamp, cn } from "@/lib/utils";
import { Layers, GitBranch, ExternalLink, Clock, CheckCircle2, ChevronRight, Terminal } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<JulesSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/jules/sessions");
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-[#1b263b] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-jules-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Autonomous Coding Sessions</span>
          </h1>
          <p className="text-jules-sm text-slate-400 mt-1">
            History of Jules agent executions, test verifications, and created pull requests.
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-jules-sm font-semibold transition-colors"
        >
          New Session
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-12 text-center bg-[#0b101a] border border-[#1e2a3f] rounded-xl flex flex-col items-center">
          <Layers className="w-10 h-10 text-slate-600 mb-3" />
          <h3 className="text-jules-base font-semibold text-slate-300">No agent sessions recorded yet</h3>
          <p className="text-jules-sm text-slate-500 mt-1 mb-4">
            Start an autonomous task from the Workspace to see real-time sessions here.
          </p>
          <Link
            href="/"
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-jules-sm font-medium"
          >
            Launch Workspace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="p-4 bg-[#0b101a] border border-[#1e2a3f] hover:border-[#2a3c58] rounded-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-jules-sm font-semibold text-blue-400">
                    {session.repoUrl.replace("https://github.com/", "")}
                  </span>
                  <span className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded uppercase font-medium",
                    session.status === 'completed' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                    session.status === 'executing' && "bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse",
                    session.status === 'idle' && "bg-slate-800 text-slate-400 border border-slate-700"
                  )}>
                    {session.status}
                  </span>
                </div>

                <p className="text-jules-sm text-slate-200 font-medium line-clamp-1">
                  {session.taskPrompt}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-jules-micro text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTimestamp(session.createdAt)}
                  </span>
                  <span>Branch: {session.newBranch}</span>
                  <span>{session.diffs.length} diff files</span>
                  <span>{session.logs.length} logs</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {session.prUrl && (
                  <a
                    href={session.prUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md text-jules-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
                  >
                    <span>PR Ready</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <Link
                  href="/"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-jules-xs font-medium bg-[#162236] text-slate-200 hover:bg-[#1f2e48] border border-[#2b3c58] transition-colors"
                >
                  <span>Open in Workspace</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
