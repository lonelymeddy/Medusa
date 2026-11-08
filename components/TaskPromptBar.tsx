"use client";

import React, { useState } from "react";
import { Play, Sparkles, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  "Fix failing edge cases in request processing",
  "Implement JWT authentication middleware and tokens",
  "Debug memory leak and clean up stream listeners",
  "Add unit test suite with 100% boundary coverage"
];

interface TaskPromptBarProps {
  prompt: string;
  onPromptChange: (p: string) => void;
  onStartAgent: (autoRun: boolean) => void;
  isRunning: boolean;
  disabled?: boolean;
}

export const TaskPromptBar: React.FC<TaskPromptBarProps> = ({
  prompt,
  onPromptChange,
  onStartAgent,
  isRunning,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-2.5 bg-[#0b101a] p-4 rounded-xl border border-[#1e2a3f]">
      <div className="flex items-center justify-between">
        <label className="text-jules-sm font-medium text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Task Objective</span>
        </label>
        <span className="text-jules-micro text-slate-500">Autonomous planning & code generation</span>
      </div>

      <div className="relative">
        <textarea
          rows={2}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe bug to fix, feature to build, or test to implement..."
          disabled={isRunning || disabled}
          className="w-full bg-[#080d16] border border-[#23314a] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-3 text-jules-base text-slate-100 placeholder:text-slate-500 transition-all resize-none"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-jules-micro text-slate-400 mr-1">Examples:</span>
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isRunning || disabled}
              onClick={() => onPromptChange(p)}
              className="text-jules-micro font-medium px-2 py-1 rounded bg-[#131b29] hover:bg-[#1a2538] border border-[#223046] text-slate-300 hover:text-blue-300 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isRunning || disabled || !prompt.trim()}
            onClick={() => onStartAgent(false)}
            className="px-3.5 py-1.5 rounded-lg text-jules-sm font-medium bg-[#162236] hover:bg-[#1f2e48] border border-[#2e4060] text-slate-200 disabled:opacity-50 transition-colors"
          >
            Step-by-Step
          </button>

          <button
            type="button"
            disabled={isRunning || disabled || !prompt.trim()}
            onClick={() => onStartAgent(true)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-jules-sm font-semibold flex items-center gap-2 transition-all shadow-md",
              isRunning
                ? "bg-amber-600/30 text-amber-300 border border-amber-500/40 cursor-wait"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25 disabled:opacity-50"
            )}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Medusa Agent...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Autonomous Run</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
