"use client";

import React, { useState } from "react";
import { GitBranch, Search, ChevronDown, Check, FolderGit2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PresetRepo {
  owner: string;
  repo: string;
  url: string;
  language: string;
  description: string;
}

const PRESET_REPOS: PresetRepo[] = [
  {
    owner: "facebook",
    repo: "react",
    url: "https://github.com/facebook/react",
    language: "TypeScript",
    description: "The library for web and native user interfaces"
  },
  {
    owner: "tiangolo",
    repo: "fastapi",
    url: "https://github.com/tiangolo/fastapi",
    language: "Python",
    description: "FastAPI framework, high performance, easy to learn, fast to code"
  },
  {
    owner: "gin-gonic",
    repo: "gin",
    url: "https://github.com/gin-gonic/gin",
    language: "Go",
    description: "Gin is a HTTP web framework written in Go"
  },
  {
    owner: "tokio-rs",
    repo: "tokio",
    url: "https://github.com/tokio-rs/tokio",
    language: "Rust",
    description: "A runtime for writing reliable asynchronous applications with Rust"
  }
];

interface RepoSelectorProps {
  selectedUrl: string;
  onSelectUrl: (url: string) => void;
  isLoading?: boolean;
}

export const RepoSelector: React.FC<RepoSelectorProps> = ({
  selectedUrl,
  onSelectUrl,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState(selectedUrl);

  const handleSelect = (url: string) => {
    setCustomUrl(url);
    onSelectUrl(url);
    setIsOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onSelectUrl(customUrl.trim());
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <FolderGit2 className="w-4 h-4 text-blue-400" />
          </div>
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            onBlur={() => onSelectUrl(customUrl)}
            placeholder="https://github.com/owner/repository"
            className="w-full bg-[#0d1424] border border-[#23314a] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-9 pr-24 py-2 text-jules-base text-slate-100 placeholder:text-slate-500 transition-all font-mono"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute inset-y-1 right-1 px-2.5 flex items-center gap-1.5 rounded bg-[#182338] hover:bg-[#202e49] text-jules-xs text-slate-300 font-sans border border-[#2c3d5a] transition-colors"
          >
            <span>Templates</span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", isOpen && "rotate-180")} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 p-2 bg-[#0c121e] border border-[#24344d] rounded-lg shadow-2xl z-40 backdrop-blur-md">
          <div className="px-2 py-1.5 text-jules-micro font-medium uppercase tracking-wider text-slate-400 border-b border-[#1b263b] mb-1.5 flex items-center justify-between">
            <span>Verified Polyglot Repositories</span>
            <span className="text-[10px] text-blue-400 font-mono">Preset Repos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {PRESET_REPOS.map((item) => {
              const isSelected = selectedUrl === item.url;
              return (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => handleSelect(item.url)}
                  className={cn(
                    "text-left p-2.5 rounded-md border transition-all flex flex-col gap-1",
                    isSelected
                      ? "bg-blue-500/10 border-blue-500/40 text-blue-300"
                      : "bg-[#111827] border-[#1d273b] hover:bg-[#162033] hover:border-[#2a3a55] text-slate-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-jules-sm font-semibold text-white">
                      {item.owner}/{item.repo}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e293b] text-slate-300 border border-[#334155]">
                      {item.language}
                    </span>
                  </div>
                  <p className="text-jules-micro text-slate-400 line-clamp-1">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
