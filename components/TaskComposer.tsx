"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderGit2,
  GitBranch,
  Play,
  Loader2,
  Cpu,
  Sparkles,
  ArrowRight,
  Layers,
  ChevronDown,
} from "lucide-react";
import { RepoSelectorModal, RepoItem } from "./RepoSelectorModal";

interface TaskComposerProps {
  initialRepoUrl?: string;
  initialPrompt?: string;
  onSessionCreated?: (session: any) => void;
}

export const TaskComposer: React.FC<TaskComposerProps> = ({
  initialRepoUrl = "https://github.com/facebook/react",
  initialPrompt = "Fix edge cases in async stream decoding and add regression coverage",
  onSessionCreated,
}) => {
  const router = useRouter();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [repoUrl, setRepoUrl] = useState(initialRepoUrl);
  const [selectedRepoName, setSelectedRepoName] = useState("facebook/react");
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("gemini-1.5-pro");

  const handleStartTask = async () => {
    if (!prompt.trim() || !repoUrl) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/jules/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl,
          taskPrompt: prompt.trim(),
          targetBranch: selectedBranch,
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        if (onSessionCreated) {
          onSessionCreated(data.session);
        } else {
          router.push(`/workspace?sessionId=${data.session.id}`);
        }
      }
    } catch (err) {
      console.error("Failed to initialize autonomous task", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRepo = (repo: RepoItem, branch?: string) => {
    setRepoUrl(repo.url);
    setSelectedRepoName(`${repo.owner}/${repo.repo}`);
    if (branch) setSelectedBranch(branch);
  };

  return (
    <div id="new-task" className="bg-[#090d16] border border-[#1b273d] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#141e30]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Autonomous Task Composer
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e1626] hover:bg-[#152038] border border-[#21314d] text-xs font-mono text-cyan-300 transition-colors"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">{selectedRepoName}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0e1626] border border-[#21314d] text-xs font-mono text-slate-300">
            <GitBranch className="w-3.5 h-3.5 text-blue-400" />
            <span>{selectedBranch}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-400">
          Describe the feature, bug fix, or refactoring you want Medusa to implement:
        </label>
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Find and fix the memory leak in the connection pool, update the test suite, and ensure 100% pass rate."
          className="w-full bg-[#05080e] border border-[#1e2c46] focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl p-3.5 text-sm text-slate-100 placeholder:text-slate-600 transition-all font-sans resize-none"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span>Model:</span>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-[#0e1626] border border-[#21314d] rounded px-2 py-1 text-slate-300 text-xs focus:outline-none font-mono"
          >
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
            <option value="gpt-4o">GPT-4o</option>
            <option value="local">Medusa Sandbox Engine</option>
          </select>
        </div>

        <button
          onClick={handleStartTask}
          disabled={isLoading || !prompt.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Initializing Autonomous Task...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Autonomous Task</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      <RepoSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedUrl={repoUrl}
        onSelectRepo={handleSelectRepo}
      />
    </div>
  );
};
