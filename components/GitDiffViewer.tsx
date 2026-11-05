"use client";

import React, { useState } from "react";
import { FileDiff } from "@/lib/jules-engine/types";
import { FileCode, Plus, Minus, ExternalLink, GitCommit, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface GitDiffViewerProps {
  diffs: FileDiff[];
  prUrl?: string;
  branchName?: string;
  onSubmitPR?: () => void;
  isSubmitting?: boolean;
}

export const GitDiffViewer: React.FC<GitDiffViewerProps> = ({
  diffs,
  prUrl,
  branchName,
  onSubmitPR,
  isSubmitting = false,
}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  if (!diffs || diffs.length === 0) {
    return (
      <div className="bg-[#0b101a] border border-[#1e2a3f] rounded-xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
        <FileCode className="w-8 h-8 text-slate-600 mb-2.5" />
        <h4 className="text-jules-base font-medium text-slate-300">No code changes generated yet</h4>
        <p className="text-jules-sm text-slate-500 max-w-sm mt-1">
          When Jules analyzes issues or implements features, atomic git merge diffs will appear here in real-time.
        </p>
      </div>
    );
  }

  const currentDiff = diffs[selectedFileIndex] || diffs[0];
  const patchLines = (currentDiff.patch || "").split("\n");

  return (
    <div className="bg-[#0b101a] border border-[#1e2a3f] rounded-xl flex flex-col h-full overflow-hidden shadow-lg">
      <div className="h-10 bg-[#0e1626] border-b border-[#1b263b] px-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-jules-sm font-semibold text-slate-200">Git Merge Diffs</span>
          <span className="text-jules-micro font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {diffs.length} {diffs.length === 1 ? 'file' : 'files'} modified
          </span>
        </div>

        <div className="flex items-center gap-2">
          {branchName && (
            <span className="hidden sm:inline-block text-jules-micro font-mono text-slate-400 bg-[#162136] px-2 py-1 rounded border border-[#23314c]">
              branch: {branchName}
            </span>
          )}

          {prUrl ? (
            <a
              href={prUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-jules-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
            >
              <span>View Pull Request</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : onSubmitPR ? (
            <button
              type="button"
              onClick={onSubmitPR}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-jules-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-all shadow-sm"
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Creating PR..." : "Create Pull Request"}</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="border-b border-[#1b263b] bg-[#0c1322] px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto">
        {diffs.map((diff, idx) => {
          const isSelected = idx === selectedFileIndex;
          return (
            <button
              key={diff.filepath}
              onClick={() => setSelectedFileIndex(idx)}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1 rounded text-jules-xs font-mono transition-colors",
                isSelected
                  ? "bg-[#182338] text-blue-400 border border-[#2b3c58]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#121a2a]"
              )}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{diff.filepath}</span>
              <span className="text-[10px] text-emerald-400">+{diff.additions}</span>
              <span className="text-[10px] text-rose-400">-{diff.deletions}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 p-3.5 overflow-y-auto bg-[#070b12] font-mono text-jules-code">
        <div className="space-y-0.5">
          {patchLines.map((line, index) => {
            const isAdd = line.startsWith("+");
            const isDel = line.startsWith("-");
            return (
              <div
                key={index}
                className={cn(
                  "px-2 py-0.5 rounded flex items-start gap-3",
                  isAdd && "bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500",
                  isDel && "bg-rose-950/40 text-rose-300 border-l-2 border-rose-500",
                  !isAdd && !isDel && "text-slate-400"
                )}
              >
                <span className="w-7 text-right select-none text-slate-600 text-[11px] flex-shrink-0">
                  {index + 1}
                </span>
                <span className="whitespace-pre flex-1">{line}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
