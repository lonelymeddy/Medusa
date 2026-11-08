"use client";

import React, { useState, useEffect } from "react";
import { Settings, Key, Shield, Cpu, Check, Globe } from "lucide-react";

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
    <div className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="border-b border-[#1b263b] pb-4">
        <h1 className="text-jules-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <span>Medusa Agent Settings</span>
        </h1>
        <p className="text-jules-sm text-slate-400 mt-1">
          Configure authentication, LLM reasoning providers, execution sandboxes, and deployment parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* GitHub Authentication */}
        <div className="bg-[#0b101a] border border-[#1e2a3f] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#182336] pb-3">
            <Key className="w-4 h-4 text-blue-400" />
            <h3 className="text-jules-base font-semibold text-slate-200">GitHub API Integration</h3>
          </div>

          <div className="space-y-2">
            <label className="text-jules-sm font-medium text-slate-300">
              Personal Access Token (PAT)
            </label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-[#080d16] border border-[#23314a] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 text-jules-base text-slate-100 placeholder:text-slate-600 font-mono"
            />
            <p className="text-jules-micro text-slate-500">
              Required for pushing branches and opening Pull Requests on private or non-authenticated repositories.
            </p>
          </div>
        </div>

        {/* LLM Engine Configuration */}
        <div className="bg-[#0b101a] border border-[#1e2a3f] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#182336] pb-3">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="text-jules-base font-semibold text-slate-200">Reasoning Engine Provider</h3>
          </div>

          <div className="space-y-2">
            <label className="text-jules-sm font-medium text-slate-300">
              Active Foundation Model
            </label>
            <select
              value={modelProvider}
              onChange={(e) => setModelProvider(e.target.value)}
              className="w-full bg-[#080d16] border border-[#23314a] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 text-jules-base text-slate-100"
            >
              <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Default Reasoning Engine)</option>
              <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
              <option value="gpt-4o">OpenAI GPT-4o</option>
              <option value="local">Medusa Embedded Virtual Sandbox Runner</option>
            </select>
            <p className="text-jules-micro text-slate-500">
              Provides multi-lingual code reasoning, targeted merge diff formulation, and test reflection.
            </p>
          </div>

          {providerStatuses && (
            <div className="pt-2 border-t border-[#182336] flex flex-wrap gap-2 text-jules-micro">
              <span className={`px-2 py-0.5 rounded border ${providerStatuses.gemini ? "border-emerald-500/30 text-emerald-400" : "border-slate-700 text-slate-500"}`}>
                Gemini: {providerStatuses.gemini ? "Configured" : "Unset"}
              </span>
              <span className={`px-2 py-0.5 rounded border ${providerStatuses.openai ? "border-emerald-500/30 text-emerald-400" : "border-slate-700 text-slate-500"}`}>
                OpenAI: {providerStatuses.openai ? "Configured" : "Unset"}
              </span>
              <span className={`px-2 py-0.5 rounded border ${providerStatuses.anthropic ? "border-emerald-500/30 text-emerald-400" : "border-slate-700 text-slate-500"}`}>
                Anthropic: {providerStatuses.anthropic ? "Configured" : "Unset"}
              </span>
              <span className="px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-400">
                Local Runner: Available
              </span>
            </div>
          )}
        </div>

        {/* Deployment & Sandboxing */}
        <div className="bg-[#0b101a] border border-[#1e2a3f] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#182336] pb-3">
            <Globe className="w-4 h-4 text-blue-400" />
            <h3 className="text-jules-base font-semibold text-slate-200">Runtime & Deployment Target</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg border border-[#1f2d44] bg-[#0d1424]">
              <span className="text-jules-sm font-semibold text-white block">Vercel Serverless Ready</span>
              <p className="text-jules-micro text-slate-400 mt-1">
                Optimized for Next.js 14 App Router, Edge runtime support, and zero cold starts.
              </p>
            </div>
            <div className="p-3.5 rounded-lg border border-[#1f2d44] bg-[#0d1424]">
              <span className="text-jules-sm font-semibold text-white block">Render Container Ready</span>
              <p className="text-jules-micro text-slate-400 mt-1">
                Dockerized standalone Next.js server on 0.0.0.0 with dynamic $PORT.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-emerald-400 text-jules-sm font-medium">
              <Check className="w-4 h-4" />
              Settings saved successfully
            </span>
          )}
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-jules-sm font-semibold shadow-md shadow-blue-500/25 transition-all"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
