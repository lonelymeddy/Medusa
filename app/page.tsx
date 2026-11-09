"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  GitPullRequest,
  Activity,
  ArrowRight,
  Terminal,
  Clock,
  ExternalLink,
  ChevronRight,
  Shield,
  Code2,
} from "lucide-react";
import { TaskComposer } from "@/components/TaskComposer";
import { MedusaLogo } from "@/components/MedusaLogo";
import { JulesSession } from "@/lib/jules-engine/types";
import { formatTimestamp, cn } from "@/lib/utils";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<JulesSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jules/sessions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSessions(data.sessions || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  const totalTasks = sessions.length;
  const activeTasks = sessions.filter(
    (s) => s.status === "executing" || s.status === "planning" || s.status === "analyzing"
  ).length;
  const completedTasks = sessions.filter((s) => s.status === "completed").length;
  const failedTasks = sessions.filter((s) => s.status === "failed").length;
  const pullRequestsCount = sessions.filter((s) => Boolean(s.prUrl)).length;
  const distinctRepos = Array.from(new Set(sessions.map((s) => s.repoUrl)));

  const recentLogs = sessions
    .flatMap((s) =>
      (s.logs || []).map((l) => ({
        ...l,
        sessionId: s.id,
        repoUrl: s.repoUrl,
      }))
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a101d] via-[#080d17] to-[#070b13] border border-[#172338] p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Autonomous AI Software Engineer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Investigate. Formulate Diffs. Verify. Deploy.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Medusa autonomously inspects your GitHub repositories, identifies bugs, writes targeted git merge diffs, executes test suites, and opens pull requests.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <MedusaLogo size={70} />
          </div>
        </div>
      </div>

      <TaskComposer />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-[#090d16] border border-[#162238] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">Active Tasks</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{activeTasks}</div>
          <div className="text-[10px] text-slate-500 font-mono">Running loops</div>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-[#162238] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{completedTasks}</div>
          <div className="text-[10px] text-slate-500 font-mono">Verified fixes</div>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-[#162238] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">Failed</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{failedTasks}</div>
          <div className="text-[10px] text-slate-500 font-mono">Requires attention</div>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-[#162238] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">Pull Requests</span>
            <GitPullRequest className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 font-mono">{pullRequestsCount}</div>
          <div className="text-[10px] text-slate-500 font-mono">Generated branches</div>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-[#162238] space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">Repositories</span>
            <GitBranch className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{distinctRepos.length}</div>
          <div className="text-[10px] text-slate-500 font-mono">Tracked targets</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#090d16] border border-[#162238] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#141e30] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Recent Agent Tasks</h2>
            </div>
            <Link
              href="/tasks"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition-colors"
            >
              <span>View all ({totalTasks})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No tasks launched yet. Submit a prompt in the composer above to begin.
            </div>
          ) : (
            <div className="space-y-2.5">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="p-3.5 rounded-xl bg-[#060a12] border border-[#141f33] hover:border-[#22334f] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-cyan-300 truncate">
                        {session.repoUrl.replace("https://github.com/", "")}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold",
                          session.status === "completed" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                          session.status === "executing" && "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse",
                          session.status === "failed" && "bg-rose-500/10 text-rose-400 border border-rose-500/20",
                          session.status === "idle" && "bg-slate-800 text-slate-400"
                        )}
                      >
                        {session.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 truncate">{session.taskPrompt}</p>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(session.createdAt)}
                      </span>
                      <span>Branch: {session.newBranch}</span>
                    </div>
                  </div>

                  <Link
                    href={`/workspace?sessionId=${session.id}`}
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0e1626] hover:bg-[#162238] border border-[#202e48] text-xs font-medium text-slate-200 transition-colors"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-[#090d16] border border-[#162238] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#141e30] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Agent Telemetry Stream</h2>
            </div>
            <Link
              href="/logs"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition-colors"
            >
              <span>Full logs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No telemetry events recorded yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-[#060a12] border border-[#141f33] space-y-1 font-mono text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span
                      className={cn(
                        "uppercase font-semibold px-1.5 py-0.2 rounded",
                        log.level === "success" && "text-emerald-400 bg-emerald-500/10",
                        log.level === "action" && "text-cyan-400 bg-cyan-500/10",
                        log.level === "reasoning" && "text-blue-400 bg-blue-500/10",
                        log.level === "error" && "text-rose-400 bg-rose-500/10",
                        log.level === "info" && "text-slate-400 bg-slate-800"
                      )}
                    >
                      {log.level}
                    </span>
                    <span>{formatTimestamp(log.timestamp)}</span>
                  </div>
                  <p className="text-slate-300 leading-snug line-clamp-2">{log.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
