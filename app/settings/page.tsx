"use client";

import React, { useState } from "react";
import { Settings, Shield, Lock, Save, Check } from "lucide-react";

export default function SettingsPage() {
  const [scopeStrictness, setScopeStrictness] = useState("strict");
  const [allowNetworkScan, setAllowNetworkScan] = useState(true);
  const [allowCodeAudit, setAllowCodeAudit] = useState(true);
  const [allowMalwareTriage, setAllowMalwareTriage] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#000000] p-6 md:p-10 space-y-8">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#E50914]" />
          <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-white">
            Security & Agent Settings
          </h1>
        </div>
        <p className="text-xs md:text-sm text-[#A1A1AA]">
          Configure authorized boundary rules, scope enforcement, and autonomous agent behavior.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#242424] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#242424] pb-3">
            <Shield className="w-4 h-4 text-[#E50914]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Authorized Scope Enforcement
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Execution Boundaries</span>
                <span className="text-[#A1A1AA]">Enforce explicit user authorization before launching network scans.</span>
              </div>
              <select
                value={scopeStrictness}
                onChange={(e) => setScopeStrictness(e.target.value)}
                className="bg-[#000000] border border-[#242424] text-white rounded-full px-3 py-1.5 focus:border-[#E50914] focus:outline-none"
              >
                <option value="strict">Strict (Explicit Authorization Only)</option>
                <option value="permissive">Standard Defense</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#242424]">
              <div>
                <span className="font-semibold text-white block">Active Network Service Discovery</span>
                <span className="text-[#A1A1AA]">Allow Nmap / TCP socket port discovery within user authorized scope.</span>
              </div>
              <input
                type="checkbox"
                checked={allowNetworkScan}
                onChange={(e) => setAllowNetworkScan(e.target.checked)}
                className="w-4 h-4 accent-[#E50914] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#242424]">
              <div>
                <span className="font-semibold text-white block">Source Code SAST & Secret Auditing</span>
                <span className="text-[#A1A1AA]">Detect hardcoded credentials, API keys, and injection vulnerabilities.</span>
              </div>
              <input
                type="checkbox"
                checked={allowCodeAudit}
                onChange={(e) => setAllowCodeAudit(e.target.checked)}
                className="w-4 h-4 accent-[#E50914] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#242424]">
              <div>
                <span className="font-semibold text-white block">Isolated Static Malware Triage</span>
                <span className="text-[#A1A1AA]">Enable Shannon entropy calculation, hash generation, and string extraction.</span>
              </div>
              <input
                type="checkbox"
                checked={allowMalwareTriage}
                onChange={(e) => setAllowMalwareTriage(e.target.checked)}
                className="w-4 h-4 accent-[#E50914] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#242424] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#242424] pb-3">
            <Lock className="w-4 h-4 text-[#E50914]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Platform Hygiene & Security
            </h2>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Medusa implements zero client-side credential storage. All API keys and secrets reside strictly in protected environment variables and server memory. Scans are executed defensibly without unauthorized compromise.
          </p>

          <div className="flex items-center justify-end pt-2">
            <button
              onClick={handleSave}
              className="pill-btn-primary text-xs flex items-center gap-1.5"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5 text-white" />}
              {saved ? "Saved Changes" : "Save Preferences"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
