"use client";

import React, { useRef, useEffect } from "react";
import { Terminal, Copy, Check, Circle } from "lucide-react";
import { JulesLogEntry } from "@/lib/jules-engine/types";
import { formatTimestamp, cn } from "@/lib/utils";

interface LiveTerminalProps {
  logs: JulesLogEntry[];
  isRunning?: boolean;
}

export const LiveTerminal: React.FC<LiveTerminalProps> = ({ logs, isRunning = false }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${formatTimestamp(l.timestamp)}] [${l.level.toUpperCase()}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelColor = (level: JulesLogEntry['level']) => {
    switch (level) {
      case 'reasoning':
        return 'text-sky-400';
      case 'action':
        return 'text-violet-400';
      case 'success':
        return 'text-emerald-400';
      case 'warning':
        return 'text-amber-400';
      case 'error':
        return 'text-rose-400';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="bg-[#080d16] border border-[#1b263b] rounded-xl flex flex-col h-full overflow-hidden shadow-lg">
      <div className="h-10 bg-[#0e1626] border-b border-[#1b263b] px-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-jules-sm font-mono font-medium text-slate-200">Medusa Terminal & Reasoner</span>
          {isRunning && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              Thinking...
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopyLogs}
          className="flex items-center gap-1 px-2 py-1 rounded text-jules-micro text-slate-400 hover:text-slate-200 hover:bg-[#162136] transition-colors"
          title="Copy log stream"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 p-3.5 overflow-y-auto font-mono text-jules-code leading-relaxed space-y-2 bg-[#070b12]"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 italic py-8 text-center font-sans text-jules-sm">
            Ready to initiate autonomous reasoning and actions.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-jules-xs">
              <span className="text-slate-600 select-none flex-shrink-0">
                [{formatTimestamp(log.timestamp)}]
              </span>
              <span className={cn("uppercase text-[10px] px-1 py-0.2 rounded border font-semibold flex-shrink-0",
                log.level === 'reasoning' && "bg-sky-950/60 text-sky-400 border-sky-800/40",
                log.level === 'action' && "bg-violet-950/60 text-violet-300 border-violet-800/40",
                log.level === 'success' && "bg-emerald-950/60 text-emerald-300 border-emerald-800/40",
                log.level === 'error' && "bg-rose-950/60 text-rose-300 border-rose-800/40",
                log.level === 'warning' && "bg-amber-950/60 text-amber-300 border-amber-800/40",
                log.level === 'info' && "bg-slate-800/60 text-slate-400 border-slate-700/40"
              )}>
                {log.level}
              </span>
              <div className="flex-1 break-words">
                <span className={getLevelColor(log.level)}>{log.message}</span>
                {log.details && (
                  <pre className="mt-1 p-2 rounded bg-[#0a0f1c] border border-[#1b263b] text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
