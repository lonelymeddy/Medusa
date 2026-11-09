"use client";

import React, { useState, useEffect } from "react";
import { KeyRound, CheckCircle2, XCircle, RefreshCw, Zap, ShieldCheck } from "lucide-react";
import { ProviderStatus } from "@/lib/ai-provider";

export default function ApiSettingsPage() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string>("");

  const loadProviders = async () => {
    try {
      const res = await fetch("/api/cyber/providers");
      const data = await res.json();
      if (data.success) {
        setProviders(data.providers);
        setActiveProvider(data.activeProvider);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleTestConnection = async (providerId: string) => {
    setTestingId(providerId);
    try {
      await fetch("/api/cyber/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", provider: providerId }),
      });
      await loadProviders();
    } catch (err) {
      console.error(err);
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#000000] p-6 md:p-10 space-y-8">
      <div className="max-w-5xl mx-auto space-y-2">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-[#E50914]" />
          <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-white">
            AI Provider Credentials & Orchestration
          </h1>
        </div>
        <p className="text-xs md:text-sm text-[#A1A1AA]">
          Manage and independently verify Medusa&apos;s primary AI model providers. All credentials authenticate server-side with automated fallback.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 text-[#E50914] animate-spin" />
          </div>
        ) : (
          providers.map((p) => {
            const isLocal = p.id === "local";
            return (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#242424] hover:border-[#E50914]/50 transition-colors space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#000000] border border-[#242424] flex items-center justify-center">
                      <Zap className="w-5 h-5 text-[#E50914]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                        {activeProvider === p.id && (
                          <span className="pill-badge-red text-[10px] py-0.5">Active Default</span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-[#A1A1AA]">
                        Credential: {p.maskedKey}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`pill-badge text-xs ${
                        p.status === "connected"
                          ? "border-[#E50914] text-white"
                          : p.status === "error"
                          ? "border-[#B00020] text-[#B00020]"
                          : "border-[#242424] text-[#A1A1AA]"
                      }`}
                    >
                      {p.status === "connected" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#E50914]" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      {p.status.toUpperCase()}
                      {p.latencyMs ? ` (${p.latencyMs}ms)` : ""}
                    </span>

                    {!isLocal && (
                      <button
                        onClick={() => handleTestConnection(p.id)}
                        disabled={testingId === p.id}
                        className="pill-btn-secondary text-xs flex items-center gap-1.5"
                      >
                        {testingId === p.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E50914]" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#E50914]" />
                        )}
                        Test Connection
                      </button>
                    )}
                  </div>
                </div>

                {p.error && (
                  <div className="p-3 rounded-xl bg-[#000000] border border-[#B00020] text-[11px] font-mono text-white">
                    {p.error}
                  </div>
                )}

                <div className="border-t border-[#242424] pt-3">
                  <div className="text-[10px] font-mono uppercase text-[#A1A1AA] mb-2">
                    Discovered & Tuned Models
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.models.map((m) => (
                      <div
                        key={m.id}
                        className="pill-badge text-xs flex items-center gap-2"
                      >
                        <span className="font-semibold text-white">{m.name}</span>
                        <span className="text-[10px] text-[#A1A1AA]">({Math.round(m.contextWindow / 1000)}k ctx)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
