"use client";

import React, { useState, useEffect } from "react";
import {
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  Server,
  Globe,
  RefreshCw,
  Loader2,
  Terminal,
} from "lucide-react";
import { DeploymentRecord } from "@/lib/jules-engine/types";
import { formatTimestamp, cn } from "@/lib/utils";

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [diagnosing, setDiagnosing] = useState(false);

  useEffect(() => {
    fetchDeployments();
  }, []);

  const fetchDeployments = async () => {
    try {
      const res = await fetch("/api/jules/deployments");
      const data = await res.json();
      if (data.success) {
        setDeployments(data.deployments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const runLiveDiagnosis = async (env: "render" | "vercel") => {
    setDiagnosing(true);
    try {
      const res = await fetch("/api/jules/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environment: env }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchDeployments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDiagnosing(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#162238] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-cyan-400" />
            <span>Deployment Doctor & Platform Runtime</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor Render, Vercel, and Docker deployment health, port bindings, and runtime parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => runLiveDiagnosis("render")}
            disabled={diagnosing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold"
          >
            {diagnosing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>Run Render Probe</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#090d16] border border-[#162238] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-sm text-white">Render Standalone Container</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              0.0.0.0 Binding
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Node.js runtime dynamically binds to <code>HOSTNAME=&quot;0.0.0.0&quot;</code> and <code>$PORT</code> with standalone static assets mirrored to avoid 502 bad gateway errors.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-[#162238] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-sm text-white">Vercel Serverless Edge</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Zero Config
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Configured with <code>vercel.json</code> to natively deploy Next.js 14 App Router routes with instant CDN asset delivery.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Diagnostic Audit Records</h2>
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mb-2" />
            <span className="text-xs font-mono">Loading records...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {deployments.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-xl bg-[#090d16] border border-[#162238] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono uppercase font-bold text-white">
                      {d.environment}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {formatTimestamp(d.timestamp)}
                    </span>
                  </div>
                  {d.targetUrl && (
                    <span className="text-[11px] font-mono text-cyan-400">{d.targetUrl}</span>
                  )}
                </div>
                <p className="text-xs text-slate-300">{d.summary}</p>
                <pre className="p-2.5 rounded-lg bg-[#05080e] border border-[#141e30] font-mono text-[11px] text-slate-400 overflow-x-auto">
                  {JSON.stringify(d.diagnostics, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
