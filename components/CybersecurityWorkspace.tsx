"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  Send,
  Upload,
  RefreshCw,
  Copy,
  Check,
  FileCode,
  Terminal,
  Download,
} from "lucide-react";
import { SecurityFinding } from "@/lib/cybersecurity/tools";
import { SecurityPlan } from "@/lib/cybersecurity/planner";
import { SecurityInvestigation, ChatSessionMessage } from "@/lib/cybersecurity/storage";

export default function CybersecurityWorkspace() {
  const [messages, setMessages] = useState<ChatSessionMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<SecurityPlan | null>(null);
  const [activeFindings, setActiveFindings] = useState<SecurityFinding[]>([]);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>("WAITING");
  const [attachedFile, setAttachedFile] = useState<{ filename: string; content: string; isBinary?: boolean } | null>(null);
  const [investigationId, setInvestigationId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activePlan, currentStatus]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/cyber/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setAttachedFile({
          filename: data.filename,
          content: data.content,
          isBinary: data.isBinary,
        });
      }
    } catch (err) {
      console.error("Upload error", err);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputPrompt;
    if (!promptToSend.trim() && !attachedFile) return;

    const userMessage: ChatSessionMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: promptToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt("");
    setIsLoading(true);
    setCurrentStatus("RUNNING");
    setCurrentTool("Autonomous Planner");

    try {
      const res = await fetch("/api/cyber/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptToSend,
          investigationId,
          attachment: attachedFile,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setInvestigationId(data.investigationId);
        const inv: SecurityInvestigation = data.investigation;
        setMessages(inv.messages);
        setActiveFindings(inv.findings || []);
        const lastMsg = inv.messages[inv.messages.length - 1];
        if (lastMsg?.plan) {
          setActivePlan(lastMsg.plan);
        }
        setCurrentStatus("COMPLETED");
        setCurrentTool(null);
        setAttachedFile(null);
      } else {
        setCurrentStatus("FAILED");
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: `Operation error: ${data.error || "Execution failed."}`,
            timestamp: new Date().toISOString(),
            status: "FAILED",
          },
        ]);
      }
    } catch (err: any) {
      setCurrentStatus("FAILED");
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `Connection error: ${err.message}`,
          timestamp: new Date().toISOString(),
          status: "FAILED",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RUNNING":
      case "SCANNING":
      case "ANALYZING":
        return "bg-[#E50914] text-white border-[#E50914]";
      case "COMPLETED":
        return "bg-[#0A0A0A] text-white border-[#242424]";
      case "FAILED":
        return "bg-[#B00020] text-white border-[#B00020]";
      default:
        return "bg-[#0A0A0A] text-[#A1A1AA] border-[#242424]";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#000000] text-white overflow-hidden">
      {/* Workspace Header */}
      <header className="h-14 border-b border-[#242424] bg-[#0A0A0A] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm tracking-wider uppercase text-white">
            Cybersecurity Command Workspace
          </span>
          <span className={`px-3 py-0.5 rounded-full text-xs font-mono border uppercase ${getStatusBadge(currentStatus)}`}>
            {currentStatus}
          </span>
          {currentTool && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono bg-[#000000] border border-[#242424] text-[#A1A1AA]">
              <Terminal className="w-3 h-3 text-[#E50914]" />
              {currentTool}
            </span>
          )}
        </div>

        {investigationId && (
          <div className="flex items-center gap-2">
            <a
              href={`/api/cyber/report?id=${investigationId}`}
              download
              className="pill-btn-secondary text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#E50914]" />
              Export Security Report
            </a>
          </div>
        )}
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Central Chat View */}
        <div className="flex-1 flex flex-col h-full bg-[#000000] overflow-hidden">
          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="max-w-3xl mx-auto py-12 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-[#0A0A0A] border border-[#242424] flex items-center justify-center">
                  <ShieldAlert className="w-8 h-8 text-[#E50914]" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                    MEDUSA AUTONOMOUS CYBERSECURITY INTELLIGENCE
                  </h1>
                  <p className="text-xs md:text-sm text-[#A1A1AA] max-w-xl mx-auto">
                    Execute authorized penetration tests, web vulnerability scans, source code SAST audits, malware static analysis, and incident response investigations.
                  </p>
                </div>

                {/* Example Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl pt-4">
                  {[
                    "Analyze this website for security vulnerabilities: https://example.com",
                    "Scan this network within authorized scope: 127.0.0.1",
                    "Audit source code for hardcoded secrets and command injection flaws",
                    "Perform static malware analysis and string extraction on suspicious sample",
                  ].map((example, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(example)}
                      className="text-left p-3.5 rounded-full bg-[#0A0A0A] border border-[#242424] hover:border-[#E50914] text-xs text-[#A1A1AA] hover:text-white transition-all"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div className="text-[11px] font-mono text-[#A1A1AA] mb-1 px-1">
                        {isUser ? "Authorized Operator" : "MEDUSA Intelligence"}
                      </div>

                      <div
                        className={`rounded-2xl p-5 max-w-3xl text-sm leading-relaxed ${
                          isUser
                            ? "bg-[#0A0A0A] border border-[#E50914]/40 text-white rounded-tr-none"
                            : "bg-[#0A0A0A] border border-[#242424] text-white rounded-tl-none"
                        }`}
                      >
                        <div className="whitespace-pre-wrap font-sans text-xs md:text-sm">
                          {msg.content}
                        </div>

                        {!isUser && (
                          <div className="mt-4 pt-3 border-t border-[#242424] flex items-center justify-between">
                            <span className="text-[10px] font-mono text-[#A1A1AA]">
                              {msg.findings ? `${msg.findings.length} findings correlated` : "Defensive Assessment"}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopy(msg.content, msg.id)}
                                className="pill-badge hover:text-white hover:border-[#E50914]"
                                title="Copy response"
                              >
                                {copiedId === msg.id ? <Check className="w-3 h-3 text-[#E50914]" /> : <Copy className="w-3 h-3" />}
                                Copy
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-3 p-4 rounded-full bg-[#0A0A0A] border border-[#E50914] max-w-md">
                    <RefreshCw className="w-4 h-4 text-[#E50914] animate-spin" />
                    <span className="text-xs font-mono text-white">
                      Executing security operations & correlating findings...
                    </span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
            )}
          </div>

          {/* Pill-Shaped Rounded Composer */}
          <div className="p-4 md:p-6 bg-[#000000] border-t border-[#242424] shrink-0">
            <div className="max-w-4xl mx-auto">
              {attachedFile && (
                <div className="mb-2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0A0A] border border-[#E50914] text-xs font-mono text-white w-fit">
                  <FileCode className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>{attachedFile.filename}</span>
                  <button
                    onClick={() => setAttachedFile(null)}
                    className="ml-2 hover:text-[#E50914]"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#242424] focus-within:border-[#E50914] rounded-full p-1.5 px-4 shadow-lg transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full text-[#A1A1AA] hover:text-white hover:bg-[#141414] transition-colors"
                  title="Attach source code, binary sample, or security logs"
                >
                  <Upload className="w-4 h-4 text-[#E50914]" />
                </button>

                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask Medusa to assess a website, scan ports, audit code, or triage malware..."
                  className="flex-1 bg-transparent border-none text-white placeholder-[#A1A1AA] text-xs md:text-sm focus:outline-none"
                  disabled={isLoading}
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || (!inputPrompt.trim() && !attachedFile)}
                  className="pill-btn-primary p-2 md:px-5 md:py-2 text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden md:inline ml-1.5">Investigate</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Execution & Findings Sidebar Panel */}
        {activePlan && (
          <aside className="w-80 md:w-96 border-l border-[#242424] bg-[#0A0A0A] flex flex-col h-full overflow-hidden shrink-0">
            <div className="p-4 border-b border-[#242424] flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-white">
                Live Execution Plan
              </span>
              <span className="pill-badge-red text-[10px]">
                {activePlan.tasks.length} Operations
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-3 rounded-xl bg-[#000000] border border-[#242424] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">Objective</span>
                <p className="text-xs text-white font-medium">{activePlan.objective}</p>
                <div className="text-[10px] font-mono text-[#E50914]">{activePlan.scope}</div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">Operations</span>
                {activePlan.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-[#000000] border border-[#242424] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#A1A1AA]">{task.tool}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono ${getStatusBadge(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="text-white text-xs">{task.title}</div>
                  </div>
                ))}
              </div>

              {activeFindings.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">Correlated Findings</span>
                    <span className="pill-badge-red text-[10px]">{activeFindings.length}</span>
                  </div>

                  <div className="space-y-2">
                    {activeFindings.map((finding) => (
                      <div
                        key={finding.id}
                        className="p-3 rounded-xl bg-[#000000] border border-[#242424] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                            finding.severity === "CRITICAL" || finding.severity === "HIGH"
                              ? "bg-[#E50914] text-white"
                              : "bg-[#242424] text-white"
                          }`}>
                            {finding.severity}
                          </span>
                          <span className="text-[10px] font-mono text-[#A1A1AA]">
                            {finding.category}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-white">{finding.title}</h4>
                        <p className="text-[11px] text-[#A1A1AA] line-clamp-2">{finding.description}</p>
                        <div className="text-[10px] font-mono text-[#E50914] truncate">
                          Asset: {finding.affectedAsset}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
