"use client";

import React, { useState, useEffect } from "react";
import {
  FolderGit2,
  Search,
  X,
  Check,
  ExternalLink,
  Lock,
  Globe,
  Sparkles,
  GitBranch,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface RepoItem {
  owner: string;
  repo: string;
  url: string;
  language: string;
  description: string;
  isPrivate?: boolean;
  isExample?: boolean;
  stars?: number;
  defaultBranch?: string;
}

interface RepoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUrl: string;
  onSelectRepo: (repo: RepoItem, branch?: string) => void;
}

export const RepoSelectorModal: React.FC<RepoSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedUrl,
  onSelectRepo,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "user" | "examples">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userRepos, setUserRepos] = useState<RepoItem[]>([]);
  const [examples, setExamples] = useState<RepoItem[]>([]);
  const [customUrl, setCustomUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<string[]>(["main"]);
  const [selectedBranch, setSelectedBranch] = useState("main");

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch("/api/jules/repos")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setExamples(data.examples || data.presets || []);
            setUserRepos(data.userRepos || []);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredUserRepos = userRepos.filter(
    (r) =>
      r.repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExamples = examples.filter(
    (r) =>
      r.repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      const parts = customUrl.trim().split("/");
      const repo = parts[parts.length - 1] || "custom-repo";
      const owner = parts[parts.length - 2] || "github";
      onSelectRepo(
        {
          owner,
          repo,
          url: customUrl.trim(),
          language: "polyglot",
          description: "Custom GitHub repository",
          isExample: false,
        },
        selectedBranch
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#090d16] border border-[#1b263b] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#162238] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-cyan-400" />
              <span>Select Target Repository</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose a connected GitHub repository or explore labeled polyglot templates.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#131b2c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-[#162238] space-y-3 bg-[#060a12]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search repositories by name, owner, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1424] border border-[#23314a] focus:border-cyan-500 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 font-sans"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-3 py-1.5 rounded-md font-medium transition-colors",
                activeTab === "all"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#101826]"
              )}
            >
              All Repositories ({filteredUserRepos.length + filteredExamples.length})
            </button>
            <button
              onClick={() => setActiveTab("user")}
              className={cn(
                "px-3 py-1.5 rounded-md font-medium transition-colors",
                activeTab === "user"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#101826]"
              )}
            >
              Connected Repositories ({filteredUserRepos.length})
            </button>
            <button
              onClick={() => setActiveTab("examples")}
              className={cn(
                "px-3 py-1.5 rounded-md font-medium transition-colors",
                activeTab === "examples"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#101826]"
              )}
            >
              Sample Templates ({filteredExamples.length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
              <span className="text-xs font-mono">Loading repositories...</span>
            </div>
          ) : (
            <>
              {(activeTab === "all" || activeTab === "user") && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
                    <span>Authorized Repositories</span>
                    <span className="text-emerald-400 font-normal">Verified Access</span>
                  </div>

                  {filteredUserRepos.length === 0 ? (
                    <div className="p-4 rounded-lg bg-[#0b101a] border border-[#182338] text-xs text-slate-400 text-center">
                      No personalized repositories connected yet. Configure your GitHub Personal Access Token in Settings to load your private & organization repos.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {filteredUserRepos.map((repo) => (
                        <div
                          key={repo.url}
                          onClick={() => {
                            onSelectRepo(repo, selectedBranch);
                            onClose();
                          }}
                          className={cn(
                            "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3",
                            selectedUrl === repo.url
                              ? "bg-cyan-950/20 border-cyan-500/50 text-cyan-300"
                              : "bg-[#0b101a] border-[#182338] hover:border-[#2a3c58] hover:bg-[#101726] text-slate-200"
                          )}
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm truncate font-mono text-white">
                                {repo.owner}/{repo.repo}
                              </span>
                              {repo.isPrivate ? (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 font-mono">
                                  <Lock className="w-2.5 h-2.5" /> Private
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1 font-mono">
                                  <Globe className="w-2.5 h-2.5" /> Public
                                </span>
                              )}
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono uppercase">
                                {repo.language}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate">{repo.description}</p>
                          </div>
                          {selectedUrl === repo.url && (
                            <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(activeTab === "all" || activeTab === "examples") && (
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
                    <span>Sample Polyglot Repositories</span>
                    <span className="text-blue-400 font-normal">Examples / Demonstrations</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredExamples.map((repo) => (
                      <div
                        key={repo.url}
                        onClick={() => {
                          onSelectRepo(repo, selectedBranch);
                          onClose();
                        }}
                        className={cn(
                          "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3",
                          selectedUrl === repo.url
                            ? "bg-cyan-950/20 border-cyan-500/50 text-cyan-300"
                            : "bg-[#0b101a] border-[#182338] hover:border-[#2a3c58] hover:bg-[#101726] text-slate-200"
                        )}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate font-mono text-white">
                              {repo.owner}/{repo.repo}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                              Sample Repo
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono uppercase">
                              {repo.language}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">{repo.description}</p>
                        </div>
                        {selectedUrl === repo.url && (
                          <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-[#162238] bg-[#060a12] space-y-2">
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Or enter any public GitHub repository URL..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 bg-[#0d1424] border border-[#23314a] focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 font-mono"
            />
            <button
              type="submit"
              disabled={!customUrl.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
            >
              Use Repo
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
