import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn("skeleton-shimmer rounded-md bg-[#131c2d]", className)}
      {...props}
    />
  );
};

export const PlanStepSkeleton: React.FC = () => {
  return (
    <div className="p-3.5 rounded-lg border border-[#1e293b] bg-[#0c121e] space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
};

export const DiffFileSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-lg border border-[#1e293b] bg-[#0a0e17] space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-28 w-full" />
    </div>
  );
};

export const TerminalLogSkeleton: React.FC = () => {
  return (
    <div className="space-y-2 p-3 font-mono text-xs">
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-3.5 w-1/2" />
      <Skeleton className="h-3.5 w-2/3" />
      <Skeleton className="h-3.5 w-5/6" />
    </div>
  );
};
