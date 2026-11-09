"use client";

import React, { useState, useEffect } from "react";
import {
  FolderGit2,
  GitBranch,
  Globe,
  Lock,
  Search,
  ExternalLink,
  ChevronRight,
  FileText,
  Loader2,
  Code2,
} from "lucide-react";
import { RepoItem } from "@/components/RepoSelectorModal";
import { cn } from "@/lib/utils";

export default function ReposPage() {
  const [userRepos, setUserRepos] = useState<RepoItem[]>([]);
  const [examples, setExamples] = useState<RepoItem[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<RepoItem | null>(null);
  const [branches, setBranches] = useState<{ name: string }[]>([]);
  const [tree, setTree] = useState<{ path: string; type: string }[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTreeLoading, setIsTreeLoading] = useState(false);

  useEffect(() => {
    fetch("/api/jules/repos")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const ex = data.examples || data.presets || [];
          setExamples(ex);
          setUserRepos(data.userRepos || []);
          if (ex.length > 0) {
            handleSelectRepo(ex[0]);
          }
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelectRepo = async (repo: RepoItem) => {
    setSelectedRepo(repo);
    setIsTreeLoading(true);
    try {
      const branchRes = await fetch(`/api/jules/repos?action=branches&url=${encodeURIComponent(repo.url)}`);
      const branchData = await branchRes.json();
      if (branchData.success && branchData.branches) {
        setBranches(branchData.branches);
        setSelectedBranch(branchData.branches[0]?.name || "main");
      }

      const treeRes = await fetch(`/api/jules/repos?action=tree&url=${encodeURIComponent(repo.url)}&branch=main`);
      const treeData = await treeRes.json();
      if (treeData.success && treeData.tree) {
        setTree(treeData.tree);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTreeLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-[#162238] pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-cyan-400" />
          <span>Repository Manager & Inspector</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore connected GitHub codebases, inspect branches, and browse repository file trees.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#090d16] border border-[#162238] focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-4">
            {userRepos.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                  Authorized User Repositories
                </div>
                <div className="space-y-1.5">
                  {userRepos.map((repo) => (
                    <div
                      key={repo.url}
                      onClick={() => handleSelectRepo(repo)}
                      className={cn(
                        "p-3 rounded-xl border transition-all cursor-pointer",
                        selectedRepo?.url === repo.url
                          ? "bg-cyan-950/20 border-cyan-500/50 text-cyan-300"
                          : "bg-[#090d16] border-[#162238] hover:border-[#22334f] text-slate-200"
                      )}
                    >
                      <div className="font-semibold text-xs font-mono">{repo.owner}/{repo.repo}</div>
                      <div className="text-[11px] text-slate-400 truncate">{repo.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                Sample Demonstrations (Examples)
              </div>
              <div className="space-y-1.5">
                {examples.map((repo) => (
                  <div
                    key={repo.url}
                    onClick={() => handleSelectRepo(repo)}
                    className={cn(
                      "p-3 rounded-xl border transition-all cursor-pointer",
                      selectedRepo?.url === repo.url
                        ? "bg-cyan-950/20 border-cyan-500/50 text-cyan-300"
                        : "bg-[#090d16] border-[#162238] hover:border-[#22334f] text-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs font-mono">{repo.owner}/{repo.repo}</span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400">
                        {repo.language}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-1">{repo.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#090d16] border border-[#162238] rounded-2xl p-5 space-y-4">
          {selectedRepo ? (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#141e30] pb-3">
                <div>
                  <h2 className="text-base font-bold text-white font-mono">
                    {selectedRepo.owner}/{selectedRepo.repo}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedRepo.description}</p>
                </div>
                <a
                  href={selectedRepo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0e1626] hover:bg-[#162238] border border-[#202e48] text-xs font-medium text-slate-200"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">Active Branch:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {branches.map((b) => (
                    <button
                      key={b.name}
                      onClick={() => setSelectedBranch(b.name)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-mono transition-colors",
                        selectedBranch === b.name
                          ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                          : "bg-[#05080e] border border-[#1c293f] text-slate-400 hover:text-slate-200"
                      )}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-slate-400">Tracked Files</div>
                {isTreeLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mb-2" />
                    <span className="text-xs font-mono">Inspecting file tree...</span>
                  </div>
                ) : (
                  <div className="max-h-[360px] overflow-y-auto bg-[#05080e] border border-[#141e30] rounded-xl p-3 space-y-1 font-mono text-xs text-slate-300">
                    {tree.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-[#0e1626]">
                        <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{item.path}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-500 text-xs">
              Select a repository to inspect its structure.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
