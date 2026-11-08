"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  FileCheck2,
  FileCode2,
  Stethoscope,
  Boxes,
  ScrollText,
  Play,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<
    "health" | "review" | "tests" | "deploy" | "deps" | "logs"
  >("health");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Form inputs
  const [repoUrl, setRepoUrl] = useState("https://github.com/facebook/react");
  const [codeSnippet, setCodeSnippet] = useState(
    "function handleRequest(req: any) {\n  console.log(req.body);\n  return req.body.status;\n}"
  );
  const [logText, setLogText] = useState(
    "HTTP/2 502 Bad Gateway\nError: listen EADDRINUSE: address already in use :::3000\n    at Server.setupListenHandle [as _listen2] (node:net:1898:16)"
  );

  const runHealthScan = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/jules/health-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const runCodeReview = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/jules/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeSnippet, filepath: "src/handler.ts" }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const runTestGenerator = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/jules/generate-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceCode: codeSnippet, filename: "src/handler.ts" }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const runDeployDoctor = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/jules/deploy-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPlatform: "Render" }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const runDependencyDoctor = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/jules/dependency-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const runLogAnalyzer = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/jules/log-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logText }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-[#1b263b] pb-4">
        <h1 className="text-jules-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-400" />
          <span>Diagnostic & Engineering Toolset</span>
        </h1>
        <p className="text-jules-sm text-slate-400 mt-1">
          Autonomous repository scanners, code reviewers, deployment doctors, and log analyzers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#1b263b] pb-3">
        {[
          { id: "health", label: "Health Scanner", icon: ShieldCheck },
          { id: "review", label: "Code Reviewer", icon: FileCheck2 },
          { id: "tests", label: "Test Generator", icon: FileCode2 },
          { id: "deploy", label: "Deployment Doctor", icon: Stethoscope },
          { id: "deps", label: "Dependency Doctor", icon: Boxes },
          { id: "logs", label: "Log Analyzer", icon: ScrollText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setResult(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-jules-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-[#0b101a] border border-[#1e2a3f] text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main interactive panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-[#0b101a] border border-[#1e2a3f] rounded-xl p-5 space-y-4">
          {activeTab === "health" && (
            <div className="space-y-4">
              <h3 className="text-jules-base font-semibold text-slate-200">
                Repository Health Scanner
              </h3>
              <p className="text-jules-xs text-slate-400">
                Scans repository architecture, CI/CD configuration, dependencies, and code hygiene.
              </p>
              <div>
                <label className="text-jules-xs font-mono text-slate-400 block mb-1">
                  Repository URL
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-[#080d16] border border-[#23314a] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 text-jules-sm text-slate-100 font-mono"
                />
              </div>
              <button
                onClick={runHealthScan}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-jules-sm flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Scan Repository</span>
              </button>
            </div>
          )}

          {activeTab === "review" && (
            <div className="space-y-4">
              <h3 className="text-jules-base font-semibold text-slate-200">AI Code Reviewer</h3>
              <p className="text-jules-xs text-slate-400">
                Inspects code for anti-patterns, performance bottlenecks, and type safety issues.
              </p>
              <div>
                <label className="text-jules-xs font-mono text-slate-400 block mb-1">
                  Source Code
                </label>
                <textarea
                  rows={6}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  className="w-full bg-[#080d16] border border-[#23314a] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 text-jules-sm text-slate-100 font-mono"
                />
              </div>
              <button
                onClick={runCodeReview}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-jules-sm flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Review Code</span>
              </button>
            </div>
          )}

          {activeTab === "tests" && (
            <div className="space-y-4">
              <h3 className="text-jules-base font-semibold text-slate-200">AI Test Generator</h3>
              <p className="text-jules-xs text-slate-400">
                Generates automated unit and integration tests with edge-case validation.
              </p>
              <div>
                <label className="text-jules-xs font-mono text-slate-400 block mb-1">
                  Target Code Implementation
                </label>
                <textarea
                  rows={6}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  className="w-full bg-[#080d16] border border-[#23314a] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 text-jules-sm text-slate-100 font-mono"
                />
              </div>
              <button
                onClick={runTestGenerator}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-jules-sm flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Generate Test Suite</span>
              </button>
            </div>
          )}

          {activeTab === "deploy" && (
            <div className="space-y-4">
              <h3 className="text-jules-base font-semibold text-slate-200">Deployment Doctor</h3>
              <p className="text-jules-xs text-slate-400">
                Audits Render, Vercel, and Docker configuration files, port bindings, and startup scripts.
              </p>
              <div className="p-3 bg-[#080d16] border border-[#1b263b] rounded-lg text-jules-xs text-slate-300">
                Target Platform: <strong>Render Node / Standalone Container</strong>
              </div>
              <button
                onClick={runDeployDoctor}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-jules-sm flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Diagnose Deployment Configuration</span>
              </button>
            </div>
          )}

          {activeTab === "deps" && (
            <div className="space-y-4">
              <h3 className="text-jules-base font-semibold text-slate-200">Dependency Doctor</h3>
              <p className="text-jules-xs text-slate-400">
                Scans package manifests for outdated, vulnerable, or incompatible modules.
              </p>
              <button
                onClick={runDependencyDoctor}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-jules-sm flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Scan Dependencies</span>
              </button>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="space-y-4">
              <h3 className="text-jules-base font-semibold text-slate-200">Error Log Analyzer</h3>
              <p className="text-jules-xs text-slate-400">
                Diagnoses stack traces, deployment 502 errors, and runtime exceptions.
              </p>
              <div>
                <label className="text-jules-xs font-mono text-slate-400 block mb-1">
                  Runtime Log / Stack Trace
                </label>
                <textarea
                  rows={6}
                  value={logText}
                  onChange={(e) => setLogText(e.target.value)}
                  className="w-full bg-[#080d16] border border-[#23314a] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-2.5 text-jules-sm text-slate-100 font-mono"
                />
              </div>
              <button
                onClick={runLogAnalyzer}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-jules-sm flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Analyze Logs</span>
              </button>
            </div>
          )}
        </div>

        {/* Results output panel */}
        <div className="lg:col-span-6 bg-[#0b101a] border border-[#1e2a3f] rounded-xl p-5 flex flex-col">
          <h3 className="text-jules-base font-semibold text-slate-200 border-b border-[#182336] pb-3 mb-3">
            Diagnostic Output
          </h3>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
              <span className="text-jules-sm">Executing autonomous analysis...</span>
            </div>
          ) : result ? (
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="p-3 bg-[#080d16] border border-[#1b263b] rounded-lg">
                <span className="text-emerald-400 text-jules-sm font-semibold flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Analysis Complete
                </span>
                <pre className="text-jules-xs font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-jules-sm py-12">
              Select a diagnostic tool and execute an analysis to inspect structured findings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
