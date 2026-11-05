"use client";

import React from "react";
import { PlanStep } from "@/lib/jules-engine/types";
import { CheckCircle2, Circle, Clock, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanChecklistProps {
  plan: PlanStep[];
  currentStepIndex: number;
}

export const PlanChecklist: React.FC<PlanChecklistProps> = ({
  plan,
  currentStepIndex,
}) => {
  return (
    <div className="bg-[#0b101a] border border-[#1e2a3f] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-[#182336] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-jules-sm font-semibold text-slate-200">Execution Plan</span>
          <span className="text-jules-micro font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
            {plan.filter((s) => s.status === 'completed').length} / {plan.length} Steps
          </span>
        </div>
        <span className="text-jules-micro text-slate-400">Strict Step-Verification Loop</span>
      </div>

      <div className="space-y-2">
        {plan.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isInProgress = step.status === 'in_progress';
          const isPending = step.status === 'pending';
          const isFailed = step.status === 'failed';

          return (
            <div
              key={step.id}
              className={cn(
                "p-3 rounded-lg border transition-all flex flex-col gap-1.5",
                isInProgress
                  ? "bg-[#121c2e] border-blue-500/50 shadow-sm shadow-blue-500/10"
                  : isCompleted
                  ? "bg-[#0d1421] border-[#1f2b3e] opacity-95"
                  : "bg-[#090d16] border-[#172132] opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {isInProgress && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
                    {isPending && <Circle className="w-4 h-4 text-slate-500" />}
                    {isFailed && <AlertCircle className="w-4 h-4 text-rose-400" />}
                  </div>

                  <div>
                    <span className={cn(
                      "text-jules-sm font-medium leading-snug",
                      isInProgress ? "text-blue-300 font-semibold" : isCompleted ? "text-slate-200" : "text-slate-400"
                    )}>
                      {idx + 1}. {step.title}
                    </span>
                    <p className="text-jules-micro text-slate-400 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <span className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded uppercase font-medium",
                    isCompleted && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                    isInProgress && "bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse",
                    isPending && "bg-slate-800 text-slate-400 border border-slate-700",
                    isFailed && "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  )}>
                    {step.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
