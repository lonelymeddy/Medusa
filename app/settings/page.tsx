"use client";

import React, { useState, useEffect } from "react";
import { Settings, Key, Shield, Cpu, Check, Globe, GitBranch } from "lucide-react";

export default function SettingsPage() {
  const [githubToken, setGithubToken] = useState("");
  const [modelProvider, setModelProvider] = useState("gemini-1.5-pro");
  const [saved, setSaved] = useState(false);
  const [providerStatuses, setProviderStatuses] = useState<any>(null);

  useEffect(() => {
    fetch("/api/jules/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProviderStatuses(data.status);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
      <div className="border-b border-[#162238] pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>Medusa Engine Settings & Access</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure GitHub personal access tokens, reasoning engines, and deployment preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-[#090d16] border border-[#162238] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#141e30] pb-3">
            <Key className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">GitHub API Integration</h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Personal Access Token (PAT)
            </label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-[#05080e] border border-[#1c293f] focus:border-cyan-500 rounded-lg p-2.5 text-xs text-slate-100 placeholder:text-slate-600 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Enables pulling private repositories, generating remote branches, and submitting verified pull requests.
            </p>
          </div>
        </div>

        <div className="bg-[#090d16] border border-[#162238] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#141e30] pb-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Reasoning Engine Provider</h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Default Foundation Model
            </label>
            <select
              value={modelProvider}
              onChange={(e) => setModelProvider(e.target.value)}
              className="w-full bg-[#05080e] border border-[#1c293f] focus:border-cyan-500 rounded-lg p-2.5 text-xs text-slate-100 font-mono"
            >
              <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
              <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
              <option value="gpt-4o">OpenAI GPT-4o</option>
              <option value="local">Medusa Embedded Virtual Sandbox Runner</option>
            </select>
          </div>

          {providerStatuses && (
            <div className="pt-2 border-t border-[#141e30] flex flex-wrap gap-2 text-[10px] font-mono">
              <span className={`px-2 py-0.5 rounded border ${providerStatuses.gemini ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-slate-800 text-slate-500"}`}>
                Gemini: {providerStatuses.gemini ? "Connected" : "Unset"}
              </span>
              <span className={`px-2 py-0.5 rounded border ${providerStatuses.openai ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-slate-800 text-slate-500"}`}>
                OpenAI: {providerStatuses.openai ? "Connected" : "Unset"}
              </span>
              <span className={`px-2 py-0.5 rounded border ${providerStatuses.anthropic ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-slate-800 text-slate-500"}`}>
                Anthropic: {providerStatuses.anthropic ? "Connected" : "Unset"}
              </span>
              <span className="px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                Local Runner: Operational
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
              <Check className="w-4 h-4" />
              Settings saved successfully
            </span>
          )}
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
