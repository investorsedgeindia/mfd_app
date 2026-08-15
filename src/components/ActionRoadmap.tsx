import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  Code2,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  DollarSign,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ACTION_ROADMAP } from '../data/sampleData';
import { ActionRoadmapSection, RoadmapStep } from '../types';

interface ActionRoadmapProps {
  onStartOnboardingDemo: () => void;
  onViewInvestorPortfolio: () => void;
}

export const ActionRoadmap: React.FC<ActionRoadmapProps> = ({
  onStartOnboardingDemo,
  onViewInvestorPortfolio,
}) => {
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({
    c1: true,
    c2: true,
    c2_1: true,
    c2_2: true,
    c2_3: true,
    c3_2: true,
    c3_3: true,
    c4_1: true,
    c4_2: true,
    c4_3: true,
    c5_1: true,
    c5_2: true,
    c5_3: true,
    c6_1: true,
    c6_2: true,
    c6_3: true,
    c6_4: true,
    c7_1: true,
    c7_2: true,
    c8_1: true,
    c8_2: true,
    c8_3: true,
    c9_1: true,
    c9_2: true,
    c9_3: true,
    c9_4: true,
  });

  const [expandedStep, setExpandedStep] = useState<string>('step-1-1');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<number | 'ALL'>('ALL');

  const toggleChecklist = (id: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const totalChecklistItems = ACTION_ROADMAP.flatMap((p) =>
    p.steps.flatMap((s) => s.checklistItems)
  ).length;

  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / totalChecklistItems) * 100);

  const filteredRoadmap =
    selectedPhaseFilter === 'ALL'
      ? ACTION_ROADMAP
      : ACTION_ROADMAP.filter((p) => p.phase === selectedPhaseFilter);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner with Executive Summary */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-900/30 p-6 md:p-8 shadow-sm text-white">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Executable Implementation Blueprint
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            How to Build Your MFD Customer Portal &amp; Seamless e-KYC Onboarding
          </h1>
          <p className="mt-3 text-slate-300 text-sm md:text-base leading-relaxed">
            As an AMFI-registered MFD with AMC empanelments, you need 4 primary pillars:
            <strong className="text-white"> BSE StAR MF / NSE NMF transaction routing</strong>, <strong className="text-white">SEBI-compliant digital KYC &amp; KRA APIs</strong>,
            <strong className="text-white"> RTA daily data feeds (CAMS/KFintech)</strong>, and a <strong className="text-white">responsive investor portal with XIRR analytics</strong>.
          </p>

          {/* Quick Metrics & Progress */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/80 backdrop-blur rounded-xl p-3.5 border border-slate-700">
              <span className="text-slate-400 text-xs block font-medium">Execution Timeline</span>
              <span className="text-base font-bold text-white flex items-center gap-1 mt-0.5">
                <Calendar className="w-4 h-4 text-blue-400" /> 4 – 6 Weeks
              </span>
            </div>
            <div className="bg-slate-800/80 backdrop-blur rounded-xl p-3.5 border border-slate-700">
              <span className="text-slate-400 text-xs block font-medium">Action Phases</span>
              <span className="text-base font-bold text-white flex items-center gap-1 mt-0.5">
                <Layers className="w-4 h-4 text-sky-400" /> 5 Structured Phases
              </span>
            </div>
            <div className="bg-slate-800/80 backdrop-blur rounded-xl p-3.5 border border-slate-700">
              <span className="text-slate-400 text-xs block font-medium">Tech Stack</span>
              <span className="text-base font-bold text-white flex items-center gap-1 mt-0.5">
                <Cpu className="w-4 h-4 text-indigo-400" /> REST / SOAP / KRA
              </span>
            </div>
            <div className="bg-slate-800/80 backdrop-blur rounded-xl p-3.5 border border-slate-700">
              <span className="text-slate-400 text-xs block font-medium">Action Readiness</span>
              <span className="text-base font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {progressPercentage}% Done
              </span>
            </div>
          </div>

          {/* Quick CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartOnboardingDemo}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition"
            >
              <Zap className="w-4 h-4" /> Launch Interactive e-KYC Demo
            </button>
            <button
              onClick={onViewInvestorPortfolio}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-700 transition"
            >
              <FileCheck className="w-4 h-4 text-blue-400" /> View Client Investment Portal
            </button>
          </div>
        </div>
      </div>

      {/* Visual Architectural Data Flow Diagram */}
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" /> Complete System Architecture Flow
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              How data flows seamlessly between your website, Indian exchanges, RTAs, and KYC agencies
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Card 1 */}
          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-blue-600 mb-2">
                <span>01. CUSTOMER PORTAL</span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Investor Experience</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" /> Mobile-responsive Web Portal
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" /> Live Folio &amp; XIRR Returns
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" /> 1-Click Lumpsum &amp; SIP
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" /> CAS PDF Statement Upload
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-200 text-[11px] text-gray-500 font-medium">
              Tech: React, Tailwind, Next.js / Express
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-sky-600 mb-2">
                <span>02. DIGITAL KYC STACK</span>
                <ShieldCheck className="w-4 h-4 text-sky-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Identity &amp; Bank Engine</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" /> CVL/NDML/CAMS KRA Registry
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" /> DigiLocker Aadhaar e-KYC
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" /> Penny Drop Bank Validation
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" /> Camera IPV + GPS Geotag
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-200 text-[11px] text-gray-500 font-medium">
              Partners: Setu, Cashfree, Signzy, Decentro
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-amber-600 mb-2">
                <span>03. TRANSACTION ENGINE</span>
                <Building2 className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Exchange Order Routing</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> BSE StAR MF / NSE NMF II
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> Paperless UCC Creation
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> e-NACH / UPI AutoPay
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> ARN &amp; EUIN Auto-Stamping
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-200 text-[11px] text-gray-500 font-medium">
              Gateways: BSE WebService, ICCL, NPCI
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-purple-600 mb-2">
                <span>04. RTA DATA PIPELINE</span>
                <FileCheck className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Reconciliation &amp; NAV</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" /> CAMS WBR9 / WBR2 Feeds
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" /> KFintech DBF Automated Sync
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" /> Daily AMFI NAV Parser (11 PM)
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" /> Capital Gains &amp; Tax P&amp;L
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-200 text-[11px] text-gray-500 font-medium">
              Automation: Nightly Cron + SFTP / Webhook
            </div>
          </div>
        </div>
      </div>

      {/* Phase Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-gray-500">Filter Phase:</span>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setSelectedPhaseFilter('ALL')}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                selectedPhaseFilter === 'ALL'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All 5 Phases
            </button>
            {ACTION_ROADMAP.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPhaseFilter(p.phase)}
                className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                  selectedPhaseFilter === p.phase
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Phase {p.phase}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Checklist completed: <strong className="text-blue-600 font-bold">{completedCount}</strong> of{' '}
          <strong className="text-slate-900 font-bold">{totalChecklistItems}</strong> items
        </div>
      </div>

      {/* Detailed Action Phases */}
      <div className="space-y-6">
        {filteredRoadmap.map((section) => (
          <div
            key={section.id}
            className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-xs transition"
          >
            {/* Phase Header */}
            <div className="bg-gray-50/80 p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-600 text-sm">
                  P{section.phase}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Phase 0{section.phase}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-200/80 text-gray-700 font-medium">
                      {section.timeframe}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
                </div>
              </div>
              <p className="text-xs text-gray-500 max-w-md hidden md:block">
                {section.subtitle}
              </p>
            </div>

            {/* Steps in Phase */}
            <div className="divide-y divide-gray-200">
              {section.steps.map((step) => {
                const isExpanded = expandedStep === step.stepId;
                return (
                  <div key={step.stepId} className="p-5 transition hover:bg-gray-50/60">
                    {/* Step Header Toggle */}
                    <div
                      className="flex items-start justify-between gap-4 cursor-pointer"
                      onClick={() => setExpandedStep(isExpanded ? '' : step.stepId)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-blue-600">
                            {step.stepId.toUpperCase()}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed max-w-4xl">
                          {step.summary}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:text-slate-900 border border-gray-200 transition"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Step Expanded Content */}
                    {isExpanded && (
                      <div className="mt-5 pt-4 border-t border-gray-200 space-y-6">
                        {/* Why Crucial & Regulatory Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100">
                            <span className="text-[11px] uppercase font-bold text-blue-700 flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5" /> Why Crucial For Your Business
                            </span>
                            <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                              {step.whyCrucial}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
                            <span className="text-[11px] uppercase font-bold text-slate-700 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Regulatory Compliance
                            </span>
                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                              {step.regulatoryContext}
                            </p>
                          </div>
                        </div>

                        {/* Implementation Actions */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Step-by-Step Executable Actions:
                          </h4>
                          <div className="space-y-2">
                            {step.implementationActions.map((action, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2.5 bg-gray-50/70 p-2.5 rounded-lg border border-gray-200 text-xs text-slate-800"
                              >
                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] flex items-center justify-center shrink-0 font-bold">
                                  {idx + 1}
                                </div>
                                <span className="leading-relaxed">{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recommended Vendors & Partners */}
                        {step.recommendedPartnersOrVendors && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                              Recommended Institutional APIs &amp; Vendors:
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {step.recommendedPartnersOrVendors.map((vendor, vIdx) => (
                                <div
                                  key={vIdx}
                                  className="bg-white rounded-xl p-3 border border-gray-200 shadow-xs flex flex-col justify-between"
                                >
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-xs text-slate-900">{vendor.name}</span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                                        {vendor.type}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-600 mt-1.5 leading-normal">
                                      {vendor.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Technical Specs & Code Snippets */}
                        {step.technicalSpecs && (
                          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold uppercase text-blue-400 flex items-center gap-1.5">
                                <Terminal className="w-3.5 h-3.5" /> Technical API Specification
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                {step.technicalSpecs.protocol}
                              </span>
                            </div>

                            {step.technicalSpecs.sampleRequest && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
                                  <span>Sample Request Payload</span>
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        step.technicalSpecs?.sampleRequest || '',
                                        step.stepId + '-req'
                                      )
                                    }
                                    className="flex items-center gap-1 text-slate-400 hover:text-white"
                                  >
                                    {copiedCode === step.stepId + '-req' ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" /> Copied
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" /> Copy
                                      </>
                                    )}
                                  </button>
                                </div>
                                <pre className="bg-slate-900 p-3 rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto border border-slate-800">
                                  {step.technicalSpecs.sampleRequest}
                                </pre>
                              </div>
                            )}

                            {step.technicalSpecs.sampleResponse && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
                                  <span>Sample Response Structure</span>
                                </div>
                                <pre className="bg-slate-900 p-3 rounded-lg text-[11px] font-mono text-sky-300 overflow-x-auto border border-slate-800">
                                  {step.technicalSpecs.sampleResponse}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Pitfalls to Avoid */}
                        {step.pitfallsToAvoid && step.pitfallsToAvoid.length > 0 && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                            <span className="font-bold flex items-center gap-1.5 text-amber-800 mb-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Pitfalls to Avoid:
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800/90">
                              {step.pitfallsToAvoid.map((pitfall, pIdx) => (
                                <li key={pIdx}>{pitfall}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Step Checklists */}
                        <div className="pt-2 border-t border-gray-200">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                            Phase Deliverables Checklist:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {step.checklistItems.map((item) => {
                              const isDone = !!completedItems[item.id];
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => toggleChecklist(item.id)}
                                  className={`flex items-center gap-2.5 text-left p-2.5 rounded-lg border text-xs transition ${
                                    isDone
                                      ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                                      : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-gray-400 shrink-0" />
                                  )}
                                  <span className={isDone ? 'line-through text-gray-400' : 'font-medium'}>
                                    {item.text}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Practical Comparison Matrix: Build from Scratch vs Aggregators */}
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" /> Strategic Architecture Decision: Which Way to Build?
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Comparison between direct Exchange/RTA integration vs Fintech API aggregators
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-semibold">
                <th className="py-2.5 px-3">Dimension</th>
                <th className="py-2.5 px-3 text-blue-700 font-bold">Direct Route (BSE StAR + Setu/Cashfree)</th>
                <th className="py-2.5 px-3 text-slate-600 font-bold">White-Label SaaS (AssetPlus / Investwell)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              <tr className="hover:bg-gray-50/50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Distributor Branding &amp; UX</td>
                <td className="py-2.5 px-3 text-blue-900 font-medium">100% custom website on your own domain (e.g. yourbrand.in)</td>
                <td className="py-2.5 px-3 text-gray-500">Generic template with your logo sticker</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Client Data Ownership</td>
                <td className="py-2.5 px-3 text-blue-900 font-medium">You own 100% of investor database &amp; data privacy</td>
                <td className="py-2.5 px-3 text-gray-500">Shared multi-tenant database</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Exchange Fee</td>
                <td className="py-2.5 px-3 text-blue-900 font-medium">₹0 Exchange fee on BSE StAR MF for MFDs</td>
                <td className="py-2.5 px-3 text-gray-500">Included in monthly subscription</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Digital KYC Cost</td>
                <td className="py-2.5 px-3 text-blue-900 font-medium">~₹10–15 per full DigiLocker + Penny Drop check</td>
                <td className="py-2.5 px-3 text-gray-500">Bundled per active user/month</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Custom Features (AI / CAS)</td>
                <td className="py-2.5 px-3 text-blue-900 font-medium">Unlimited custom features, AI advisor, custom proposals</td>
                <td className="py-2.5 px-3 text-gray-500">Locked to vendor roadmap</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
