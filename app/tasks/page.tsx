"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  Filter,
  Clock,
  GitBranch,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Plus,
  Loader2,
} from "lucide-react";
import { JulesSession } from "@/lib/jules-engine/types";
import { formatTimestamp, cn } from "@/lib/utils";

export default function TasksPage() {
  const [sessions, setSessions] = useState<JulesSession[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jules/sessions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSessions(data.sessions || []);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = sessions.filter((s) => {
    const matchesSearch =
      s.taskPrompt.toLowerCase().includes(search.toLowerCase()) ||
      s.repoUrl.toLowerCase().includes(search.toLowerCase()) ||
      s.newBranch.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#162238] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Autonomous Tasks & History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, inspect, and resume persistent autonomous coding agent runs.
          </p>
        </div>

        <Link
          href="/#new-task"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#090d16] border border-[#162238] rounded-xl p-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by prompt, repository or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#05080e] border border-[#1c293f] focus:border-cyan-500 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Status:</span>
          {["all", "completed", "executing", "failed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-2.5 py-1 rounded-md capitalize transition-colors",
                statusFilter === st
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
          <span className="text-xs font-mono">Loading saved tasks...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#090d16] border border-[#162238] rounded-2xl">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No tasks found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or launch a new task.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((session) => (
            <div
              key={session.id}
              className="p-4 bg-[#090d16] border border-[#162238] hover:border-[#22334f] rounded-xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-cyan-300">
                    {session.repoUrl.replace("https://github.com/", "")}
                  </span>
                  <span className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold",
                    session.status === "completed" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                    session.status === "executing" && "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse",
                    session.status === "failed" && "bg-rose-500/10 text-rose-400 border border-rose-500/20",
                    session.status === "idle" && "bg-slate-800 text-slate-400"
                  )}>
                    {session.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {formatTimestamp(session.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-slate-200 font-medium line-clamp-2">
                  {session.taskPrompt}
                </p>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                    {session.newBranch}
                  </span>
                  <span>•</span>
                  <span>{session.diffs.length} diff files</span>
                  <span>•</span>
                  <span>{session.logs.length} logs</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {session.prUrl && (
                  <a
                    href={session.prUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/25 transition-colors"
                  >
                    <span>PR Ready</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <Link
                  href={`/workspace?sessionId=${session.id}`}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#0e1626] hover:bg-[#162238] border border-[#202e48] text-xs font-medium text-slate-200 transition-colors"
                >
                  <span>Open Workspace</span>
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
