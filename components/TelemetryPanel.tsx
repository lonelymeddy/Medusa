"use client";

import React from "react";
import { TestRunResult } from "@/lib/jules-engine/types";
import { CheckCircle2, XCircle, ShieldCheck, Cpu, Clock, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface TelemetryPanelProps {
  testResults?: TestRunResult;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ testResults }) => {
  if (!testResults) {
    return (
      <div className="p-3 bg-[#0b101a] border border-[#1e2a3f] rounded-xl flex items-center justify-between text-jules-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          <span>Verification Telemetry: Idle</span>
        </div>
        <span className="font-mono text-slate-500 text-jules-micro">Awaiting test execution step</span>
      </div>
    );
  }

  return (
    <div className="bg-[#0b101a] border border-[#1e2a3f] rounded-xl p-3.5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {testResults.passed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400" />
          )}
          <span className="text-jules-sm font-semibold text-slate-200">
            {testResults.passed ? "All Polyglot Tests Passed" : "Test Failures Detected"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-jules-micro font-mono text-slate-400">
          <span>{testResults.passedTests}/{testResults.totalTests} Passed</span>
          <span>{testResults.durationMs}ms</span>
        </div>
      </div>

      <pre className="p-2.5 rounded bg-[#070b12] border border-[#1b263b] font-mono text-jules-micro text-slate-300 overflow-x-auto whitespace-pre-wrap">
        {testResults.output}
      </pre>
    </div>
  );
};
