"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Bug,
  Sparkles,
  TestTube2,
  Play,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<"review" | "bugs" | "refactor" | "tests">("review");
  const [language, setLanguage] = useState("typescript");
  const [code, setCode] = useState(
    `export async function handleStream(req: Request) {\n  const data = await req.json();\n  // Potential uncaught exception if payload is malformed\n  return process(data.payload.items);\n}`
  );
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const runAnalysis = async () => {
    setIsLoading(true);
    setResult(null);

    const actionMap = {
      review: "explain",
      bugs: "bugs",
      refactor: "refactor",
      tests: "generate-tests",
    };

    try {
      const res = await fetch("/api/jules/code-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionMap[activeTab],
          code,
          language,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.analysis);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setResult(`Execution failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-[#162238] pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          <span>Code Intelligence & Automated Reviews</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform multi-dimensional code reviews, bug detection, security checks, and automated test generation.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap text-xs">
        {[
          { id: "review", label: "Architecture Review", icon: CheckCircle2 },
          { id: "bugs", label: "Bug & Vuln Detection", icon: Bug },
          { id: "refactor", label: "Refactoring Recommendations", icon: Sparkles },
          { id: "tests", label: "Test Suite Generation", icon: TestTube2 },
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
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all",
                isActive
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  : "bg-[#090d16] border border-[#162238] text-slate-400 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 text-cyan-400" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-[#090d16] border border-[#162238] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Source Code Input</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#05080e] border border-[#1c293f] rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono"
            >
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>

          <textarea
            rows={14}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-[#05080e] border border-[#1c293f] focus:border-cyan-500 rounded-xl p-3 text-xs text-slate-100 font-mono resize-none leading-relaxed"
          />

          <button
            onClick={runAnalysis}
            disabled={isLoading || !code.trim()}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Code Invariants...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Autonomous Analysis</span>
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-6 bg-[#090d16] border border-[#162238] rounded-2xl p-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-[#141e30] pb-3">
            <span className="text-xs font-mono text-slate-400 uppercase">Analysis Findings</span>
            {result && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy findings"}</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-[#05080e] border border-[#141e30] rounded-xl p-4">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
                <span className="text-xs font-mono">Running code review agent...</span>
              </div>
            ) : result ? (
              <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                {result}
              </pre>
            ) : (
              <div className="py-20 text-center text-slate-500 text-xs">
                Run an analysis to inspect structured recommendations, security vulnerabilities, or generated tests.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
