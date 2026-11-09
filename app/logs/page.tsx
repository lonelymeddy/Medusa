"use client";

import React, { useState, useEffect } from "react";
import { Activity, Clock, Search, Filter } from "lucide-react";
import { JulesSession } from "@/lib/jules-engine/types";
import { formatTimestamp, cn } from "@/lib/utils";

export default function LogsPage() {
  const [sessions, setSessions] = useState<JulesSession[]>([]);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
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

  const allLogs = sessions
    .flatMap((s) =>
      (s.logs || []).map((l) => ({
        ...l,
        sessionId: s.id,
        repoUrl: s.repoUrl,
        taskPrompt: s.taskPrompt,
      }))
    )
    .sort((a, b) => b.timestamp - a.timestamp);

  const filteredLogs = allLogs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.repoUrl.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-[#162238] pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <span>Platform Activity & Execution Logs</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time audit log of agent reasoning steps, file inspections, test executions, and git operations.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#090d16] border border-[#162238] rounded-xl p-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search activity logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#05080e] border border-[#1c293f] focus:border-cyan-500 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Level:</span>
          {["all", "action", "reasoning", "success", "error"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={cn(
                "px-2.5 py-1 rounded-md capitalize transition-colors",
                levelFilter === lvl
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#090d16] border border-[#162238] rounded-2xl p-4 space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No activity logs match the selected filters.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-lg bg-[#05080e] border border-[#141e30] space-y-1 font-mono text-xs"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 flex-wrap gap-2">
                <div className="flex items-center gap-2">
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
                  <span className="text-slate-400">{log.repoUrl.replace("https://github.com/", "")}</span>
                </div>
                <span>{formatTimestamp(log.timestamp)}</span>
              </div>
              <p className="text-slate-200 leading-relaxed">{log.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
