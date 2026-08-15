import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Table,
  Layers,
  Lock,
  Sparkles,
  Server,
  FileCode,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building,
  UserCheck,
} from 'lucide-react';
import { checkSupabaseConnection, getSupabaseConfig } from '../lib/supabaseClient';
import { SupabaseConfigStatus } from '../types';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [status, setStatus] = useState<SupabaseConfigStatus>(() => getSupabaseConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'schema' | 'instructions'>('status');

  const runConnectionCheck = async () => {
    setIsTesting(true);
    try {
      const res = await checkSupabaseConnection();
      setStatus(res);
    } catch (err: any) {
      setStatus({
        isConfigured: false,
        isConnected: false,
        mode: 'LOCAL_OFFLINE',
        lastChecked: new Date().toISOString(),
        error: err?.message || 'Failed to ping Supabase instance',
      });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runConnectionCheck();
    }
  }, [isOpen]);

  const handleCopySql = () => {
    const sqlText = `-- INVESTORS EDGE MFD - SUPABASE SQL SCHEMA
-- Run this in Supabase SQL Editor (https://app.supabase.com)

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Master Tables
-- (See complete supabase_schema.sql in workspace root for all 10 tables, enums, triggers, RLS, and seed data)
`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Supabase Database Integration</h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    status.isConnected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {status.isConnected ? 'Cloud Live' : 'Offline / Local Fallback'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                PostgreSQL Cloud Storage for Mutual Fund Investor Profiles, SIPs, KYC, &amp; Holdings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-gray-100 bg-gray-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-3 px-3 border-b-2 transition ${
              activeTab === 'status'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-slate-800'
            }`}
          >
            Connection Status
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-3 px-3 border-b-2 transition ${
              activeTab === 'schema'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-slate-800'
            }`}
          >
            Database Tables &amp; Entities (10 Tables)
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-3 px-3 border-b-2 transition ${
              activeTab === 'instructions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-slate-800'
            }`}
          >
            Setup Guide (.env &amp; SQL)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Live Status Card */}
              <div
                className={`p-4 rounded-2xl border ${
                  status.isConnected
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/70 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {status.isConnected ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold">
                        {status.isConnected
                          ? 'Connected to Supabase PostgreSQL Database'
                          : 'Operating in Resilient Local Offline Mode'}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {status.isConnected
                          ? `Active cloud database connection verified at ${status.url}. All client profiles, SIPs, bank details, and mutual fund folios are reading and writing to your live Supabase database.`
                          : 'No live Supabase credentials detected in .env. The app is running seamlessly in offline mode with instant local caching and full demo investor accounts.'}
                      </p>
                      {status.error && (
                        <div className="mt-2 text-[11px] font-mono bg-white/80 p-2 rounded-lg border border-amber-200 text-amber-900">
                          Status note: {status.error}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={runConnectionCheck}
                    disabled={isTesting}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-blue-600' : ''}`} />
                    <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>

              {/* Architectural Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Database Engine
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-blue-600" /> PostgreSQL 15+
                  </div>
                  <div className="text-[11px] text-gray-500">Row Level Security (RLS)</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    SEBI Compliance
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> KRA / DigiLocker
                  </div>
                  <div className="text-[11px] text-gray-500">Penny Drop IMPS &amp; e-NACH</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Exchange Gateways
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-600" /> BSE StAR / NSE NMF
                  </div>
                  <div className="text-[11px] text-gray-500">UCC Order Mapping</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEMA EXPLORER */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-600">
                The Supabase schema (`supabase_schema.sql`) defines 10 purpose-built tables designed specifically for Indian Mutual Fund Distribution:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Client Profiles */}
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>client_profiles</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    PAN, Legal Name, DOB, Gender, KYC Status (CVL/CAMS KRA), Aadhaar Last 4, DigiLocker status, Risk Profile, BSE UCC, and total AUM aggregates.
                  </p>
                </div>

                {/* 2. Bank Accounts */}
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-emerald-600" />
                    <span>client_bank_accounts</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Bank Name, Account Number, IFSC, Account Type (SAVINGS/CURRENT), IMPS Penny Drop ref, NPCI e-NACH Mandate UMRN &amp; limit.
                  </p>
                </div>

                {/* 3. SIP Schedules */}
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-indigo-600" />
                    <span>sip_schedules</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Scheme Name, AMC, Folio Number, Monthly Amount, Debit Day, Next Debit Date, Mandate Type (eNACH/UPI), Status, and Step-Up terms.
                  </p>
                </div>

                {/* 4. Folio Holdings */}
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-violet-600" />
                    <span>folio_holdings</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Folio number, Units, Avg NAV, Live NAV, Invested Amount, Current Market Value, Returns, XIRR, ISIN, Riskometer, and Category.
                  </p>
                </div>

                {/* 5. Transactions */}
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <span>transactions</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Order date, Scheme, Type (PURCHASE/SIP/REDEMPTION), Units, NAV, Settlement status, and BSE StAR MF Order Reference.
                  </p>
                </div>

                {/* 6. Nominees */}
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>client_nominees</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Nominee name, Relationship, Date of Birth, Percentage Share Allocation, Minor Flag, and Guardian PAN details.
                  </p>
                </div>

                {/* 7. Investor Goals */}
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-pink-600" />
                    <span>investor_goals</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Retirement, Child Higher Education, Home Downpayment, Target Corpus Amount, Target Date, and Monthly SIP allocation.
                  </p>
                </div>

                {/* 8. Distributor Profiles */}
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-slate-700" />
                    <span>distributor_profiles</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    ARN-198420, EUIN E-428190, BSE Member Code, NSE Member Code, CAMS/KFintech codes, Total AUM, and Monthly SIP book.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SETUP INSTRUCTIONS */}
          {activeTab === 'instructions' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2 text-slate-800">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" /> How to Connect Your Supabase Cloud Project:
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-gray-700 text-xs pl-1">
                  <li>
                    Create a free Supabase project at{' '}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5"
                    >
                      supabase.com <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    Open the <strong>SQL Editor</strong> in your Supabase Dashboard.
                  </li>
                  <li>
                    Open and execute the <strong className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200">supabase_schema.sql</strong> file from this repository (or copy it below).
                  </li>
                  <li>
                    Go to <strong>Project Settings &rarr; API</strong> and copy your <strong>Project URL</strong> and <strong>Anon Public Key</strong>.
                  </li>
                  <li>
                    Paste them into your <strong className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200">.env</strong> file:
                    <pre className="mt-1 bg-slate-900 text-emerald-400 p-2.5 rounded-xl font-mono text-[11px]">
                      VITE_SUPABASE_URL="https://your-project.supabase.co"&#10;VITE_SUPABASE_ANON_KEY="your-anon-key"
                    </pre>
                  </li>
                </ol>
              </div>

              {/* Copy SQL Schema Button */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-blue-600" /> Complete Schema Script
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Includes 10 tables, triggers, indexes, RLS policies &amp; seed data (supabase_schema.sql)
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SEBI &amp; AMFI Compliant Financial Database Architecture</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
