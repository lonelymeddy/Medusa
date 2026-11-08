"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GitBranch, Star, GitFork, ExternalLink, ShieldCheck, Plus, Check } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

interface PresetRepo {
  owner: string;
  repo: string;
  url: string;
  language: string;
  description: string;
}

export default function RepositoriesPage() {
  const [presets, setPresets] = useState<PresetRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await fetch("/api/jules/repos");
      const data = await res.json();
      if (data.presets) {
        setPresets(data.presets);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-[#1b263b] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-jules-xl font-bold tracking-tight text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-400" />
            <span>Connected Repositories</span>
          </h1>
          <p className="text-jules-sm text-slate-400 mt-1">
            Repositories configured for Medusa autonomous codebase analysis, regression testing, and PR creation.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presets.map((repo) => (
            <div
              key={repo.url}
              className="p-5 bg-[#0b101a] border border-[#1e2a3f] hover:border-[#2b3c58] rounded-xl flex flex-col justify-between gap-4 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-jules-base font-semibold font-mono text-white">
                    {repo.owner}/{repo.repo}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {repo.language}
                  </span>
                </div>
                <p className="text-jules-sm text-slate-400 leading-relaxed">
                  {repo.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#172236]">
                <div className="flex items-center gap-2 text-jules-micro text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Medusa Sandbox Ready</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded hover:bg-[#162136] text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <Link
                    href="/"
                    className="px-3 py-1.5 rounded-md text-jules-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  >
                    Select for Task
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
