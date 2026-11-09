"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { History, Search, Trash2, ArrowRight, ShieldAlert, Calendar, RefreshCw } from "lucide-react";
import { SecurityInvestigation } from "@/lib/cybersecurity/storage";

export default function HistoryPage() {
  const [investigations, setInvestigations] = useState<SecurityInvestigation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/cyber/history");
      const data = await res.json();
      if (data.success) {
        setInvestigations(data.investigations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this security investigation record?")) return;

    try {
      await fetch(`/api/cyber/history?id=${id}`, { method: "DELETE" });
      setInvestigations((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = investigations.filter(
    (inv) =>
      inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.target?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#000000] p-6 md:p-10 space-y-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#E50914]" />
              <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-white">
                Investigation History
              </h1>
            </div>
            <p className="text-xs md:text-sm text-[#A1A1AA]">
              Persistent archive of previous assessments, penetration tests, code audits, and incident investigations.
            </p>
          </div>

          <Link href="/" className="pill-btn-primary text-xs">
            Start New Investigation
          </Link>
        </div>

        <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#242424] focus-within:border-[#E50914] rounded-full p-2 px-4">
          <Search className="w-4 h-4 text-[#A1A1AA]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by target, title, or category..."
            className="flex-1 bg-transparent border-none text-white placeholder-[#A1A1AA] text-xs md:text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-3">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 text-[#E50914] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0A0A0A] border border-[#242424] space-y-3">
            <ShieldAlert className="w-8 h-8 text-[#A1A1AA] mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Investigations Found</h3>
            <p className="text-xs text-[#A1A1AA]">
              Initiate a cybersecurity prompt in the workspace to automatically create and persist investigations.
            </p>
          </div>
        ) : (
          filtered.map((inv) => (
            <div
              key={inv.id}
              className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#242424] hover:border-[#E50914]/50 transition-colors flex items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="pill-badge-red text-[10px] uppercase py-0.5">
                    {inv.category.replace("_", " ")}
                  </span>
                  <span className="text-[11px] font-mono text-[#A1A1AA] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </span>
                  <span className="pill-badge text-[10px] py-0.5">
                    {inv.findings?.length || 0} Findings
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#E50914] transition-colors">
                  {inv.title}
                </h3>
                {inv.target && (
                  <p className="text-xs font-mono text-[#A1A1AA] truncate">
                    Target: {inv.target}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => handleDelete(inv.id, e)}
                  className="p-2 rounded-full text-[#A1A1AA] hover:text-[#E50914] hover:bg-[#000000] transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link
                  href={`/?investigationId=${inv.id}`}
                  className="pill-btn-secondary text-xs flex items-center gap-1.5"
                >
                  Reopen
                  <ArrowRight className="w-3 h-3 text-[#E50914]" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
