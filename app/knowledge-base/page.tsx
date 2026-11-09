"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  Shield,
  Layers,
  Code2,
  Loader2,
} from "lucide-react";
import { ProjectRuleInstruction } from "@/lib/jules-engine/types";
import { formatTimestamp } from "@/lib/utils";

export default function KnowledgeBasePage() {
  const [rules, setRules] = useState<ProjectRuleInstruction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ProjectRuleInstruction["category"]>("architecture");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/jules/knowledge-base");
      const data = await res.json();
      if (data.success) {
        setRules(data.rules || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/jules/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, content }),
      });
      const data = await res.json();
      if (data.success) {
        setTitle("");
        setContent("");
        await fetchRules();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await fetch(`/api/jules/knowledge-base?id=${id}`, { method: "DELETE" });
      await fetchRules();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="border-b border-[#162238] pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span>Knowledge Base & Project Memory</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure persistent project guidelines, architecture decisions, and forbidden files that Medusa respects during task execution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#090d16] border border-[#162238] rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white">Add Project Rule or Guideline</h2>

          <form onSubmit={handleAddRule} className="space-y-3">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Rule Title</label>
              <input
                type="text"
                placeholder="e.g. Always Use Strict TypeScript Interfaces"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#05080e] border border-[#1c293f] focus:border-cyan-500 rounded-lg p-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#05080e] border border-[#1c293f] focus:border-cyan-500 rounded-lg p-2 text-xs text-slate-100 font-mono"
              >
                <option value="architecture">Architecture & Modular Structure</option>
                <option value="coding_standards">Coding Standards & Styling</option>
                <option value="testing">Testing Requirements</option>
                <option value="security">Security & Secret Protection</option>
                <option value="forbidden_files">Forbidden / Read-Only Files</option>
                <option value="deployment">Deployment Requirements</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Instruction Details</label>
              <textarea
                rows={4}
                placeholder="Describe exact constraints for the autonomous agent..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-[#05080e] border border-[#1c293f] focus:border-cyan-500 rounded-lg p-2 text-xs text-slate-100 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !title.trim() || !content.trim()}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Save Instruction to Project Memory</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 bg-[#090d16] border border-[#162238] rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white">Active Instructions ({rules.length})</h2>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mb-2" />
              <span className="text-xs font-mono">Loading rules...</span>
            </div>
          ) : rules.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No project instructions added yet.
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-xl bg-[#05080e] border border-[#141e30] space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{rule.title}</span>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                    {rule.category}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{rule.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
