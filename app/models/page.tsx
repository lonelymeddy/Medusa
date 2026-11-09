"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  CheckCircle2,
  Key,
  Shield,
  Zap,
  Loader2,
  Check,
} from "lucide-react";

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextWindow: string;
  status: string;
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [activeProvider, setActiveProvider] = useState("local");
  const [apiKey, setApiKey] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("gemini");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/jules/models")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setModels(data.models || []);
          setActiveProvider(data.activeProvider || "local");
        }
      });
  }, []);

  const handleConfigureKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/jules/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey: apiKey.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setApiKey("");
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-[#162238] pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>AI Foundation Models & Provider Architecture</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure multi-provider LLM engines (Gemini, Claude 3.5, OpenAI GPT-4o, and embedded runner).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-sm font-bold text-white">Registered Model Engines</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {models.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-[#090d16] border border-[#162238] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{m.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {m.provider}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Context Window: <strong className="text-slate-200">{m.contextWindow}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Adapter Operational</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#090d16] border border-[#162238] rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <span>Configure Provider API Key</span>
          </h2>

          <form onSubmit={handleConfigureKey} className="space-y-3">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Target Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full bg-[#05080e] border border-[#1c293f] focus:border-cyan-500 rounded-lg p-2 text-xs text-slate-100 font-mono"
              >
                <option value="gemini">Google Gemini</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">API Key</label>
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[#05080e] border border-[#1c293f] focus:border-cyan-500 rounded-lg p-2 text-xs text-slate-100 font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Keys are retained server-side in sandbox memory and are never exposed to browser bundles.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving || !apiKey.trim()}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Provider Key</span>
            </button>

            {saved && (
              <div className="text-xs font-mono text-emerald-400 text-center">
                Provider credentials updated successfully.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
