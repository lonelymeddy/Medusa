"use client";

import React, { useState } from "react";
import { Terminal as TerminalIcon, Play, Trash2, Loader2 } from "lucide-react";

interface TerminalCommandLog {
  id: string;
  command: string;
  stdout: string;
  stderr: string;
  code: number;
  timestamp: number;
}

export default function TerminalPage() {
  const [command, setCommand] = useState("node -v");
  const [logs, setLogs] = useState<TerminalCommandLog[]>([
    {
      id: "init",
      command: "node -v && git --version",
      stdout: "v22.22.1\ngit version 2.43.0",
      stderr: "",
      code: 0,
      timestamp: Date.now(),
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isRunning) return;

    setIsRunning(true);
    const cmdToRun = command.trim();

    try {
      const res = await fetch("/api/jules/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmdToRun }),
      });
      const data = await res.json();

      setLogs((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: cmdToRun,
          stdout: data.stdout || "",
          stderr: data.stderr || data.error || "",
          code: typeof data.exitCode === "number" ? data.exitCode : 1,
          timestamp: Date.now(),
        },
      ]);
      setCommand("");
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: cmdToRun,
          stdout: "",
          stderr: err.message,
          code: 1,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 flex flex-col">
      <div className="flex items-center justify-between border-b border-[#162238] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-cyan-400" />
            <span>Isolated Development Terminal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Execute sandboxed commands for Node.js, Python, Git, and test frameworks in a secure container.
          </p>
        </div>

        <button
          onClick={() => setLogs([])}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#090d16] border border-[#162238] hover:border-[#22334f] text-xs font-mono text-slate-400 hover:text-white"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Console</span>
        </button>
      </div>

      <div className="flex-1 min-h-[450px] bg-[#05080e] border border-[#162238] rounded-2xl flex flex-col font-mono text-xs overflow-hidden shadow-2xl">
        <div className="px-4 py-2.5 bg-[#080d16] border-b border-[#141e30] flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] text-slate-400 ml-2">medusa-sandbox: ~/workspace</span>
          </div>
          <span className="text-[10px] text-cyan-400 uppercase">Interactive Session</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <span>$</span>
                <span>{log.command}</span>
                <span className="text-[10px] text-slate-500 ml-auto">
                  status: {log.code}
                </span>
              </div>
              {log.stdout && (
                <pre className="text-slate-300 whitespace-pre-wrap pl-3">{log.stdout}</pre>
              )}
              {log.stderr && (
                <pre className="text-rose-400 whitespace-pre-wrap pl-3">{log.stderr}</pre>
              )}
            </div>
          ))}

          {isRunning && (
            <div className="flex items-center gap-2 text-cyan-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Executing command in isolated runner...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleExecute} className="p-3 bg-[#080d16] border-t border-[#141e30] flex items-center gap-2">
          <span className="text-cyan-400 font-bold">$</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Type command (e.g. npm test, git status, python3 --version)..."
            className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-600 focus:outline-none font-mono text-xs"
            disabled={isRunning}
          />
          <button
            type="submit"
            disabled={isRunning || !command.trim()}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <span>Run</span>
            <Play className="w-3 h-3 fill-current" />
          </button>
        </form>
      </div>
    </div>
  );
}
