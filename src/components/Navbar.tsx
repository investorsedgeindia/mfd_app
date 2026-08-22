import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  UserCheck,
  LayoutDashboard,
  Calculator,
  User,
  Building2,
  FileSpreadsheet,
  Search,
  Sparkles,
  LogOut,
  ArrowDownCircle,
  Menu,
  X,
} from 'lucide-react';
import { Database } from 'lucide-react';
import { AuthSession, ClientProfile, DistributorDetails, SupabaseConfigStatus } from '../types';

interface NavbarProps {
  session: AuthSession;
  onLogout: () => void;
  activeTab: 'investor' | 'onboarding' | 'distributor' | 'calculators';
  setActiveTab: (tab: 'investor' | 'onboarding' | 'distributor' | 'calculators') => void;
  distributor: DistributorDetails;
  clients: ClientProfile[];
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  onOpenKraLookup: () => void;
  onOpenCasUpload: () => void;
  onOpenProposal: () => void;
  onOpenTransact: () => void;
  onOpenRedeem?: () => void;
  onOpenSupabaseConfig?: () => void;
  supabaseStatus?: SupabaseConfigStatus;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  onLogout,
  activeTab,
  setActiveTab,
  distributor,
  clients,
  selectedClientId,
  setSelectedClientId,
  onOpenKraLookup,
  onOpenCasUpload,
  onOpenProposal,
  onOpenTransact,
  onOpenRedeem,
  onOpenSupabaseConfig,
  supabaseStatus,
}) => {
  const isClient = session.user.role === 'client';
  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 text-slate-800 shadow-sm">
      {/* ── Top Strip ── */}
      {isClient ? (
        /* Client: minimal welcome strip */
        <div className="bg-slate-900 px-4 py-1.5 text-xs text-slate-300 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">AMFI Registered MFD</span>
            <span className="text-slate-600">|</span>
            <span>
              Managed by{' '}
              <strong className="text-white">{distributor.firmName}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              ARN: <strong className="text-white font-mono">{distributor.arn}</strong>
            </span>
          </div>
          <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Secure Investor Portal
          </div>
        </div>
      ) : (
        /* Distributor: full tool strip */
        <div className="bg-slate-900 px-4 py-1.5 text-xs text-slate-300 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> AMFI Registered MFD
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">
              ARN: <strong className="text-white font-mono">{distributor.arn}</strong> (EUIN:{' '}
              <span className="font-mono">{distributor.euin}</span>)
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-400">
              Exchange: BSE StAR MF ({distributor.bseMemberCode}) &amp; NSE NMF II
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {onOpenSupabaseConfig && (
              <button
                onClick={onOpenSupabaseConfig}
                className="flex items-center gap-1.5 text-emerald-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-0.5 rounded border border-slate-700 transition"
                title="Supabase PostgreSQL Database Status & Schema"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    supabaseStatus?.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <Database className="w-3 h-3 text-emerald-400" />
                <span>
                  {supabaseStatus?.isConnected ? 'Supabase Live' : 'Database (Supabase)'}
                </span>
              </button>
            )}
            <button
              onClick={onOpenKraLookup}
              className="flex items-center gap-1 text-sky-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-0.5 rounded border border-slate-700 transition"
            >
              <Search className="w-3 h-3 text-sky-400" /> Live KRA Checker
            </button>
            <button
              onClick={onOpenCasUpload}
              className="flex items-center gap-1 text-amber-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-0.5 rounded border border-slate-700 transition"
            >
              <FileSpreadsheet className="w-3 h-3 text-amber-400" /> Import CAS PDF
            </button>
          </div>
        </div>
      )}

      {/* ── Main Nav Bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('investor')}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
                  Investors<span className="text-blue-600">Edge</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {isClient ? 'Investor Portal' : 'Partner Hub'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate max-w-[200px] sm:max-w-none font-medium">
                {isClient
                  ? `Welcome, ${session.user.name.split(' ')[0]}! 👋`
                  : distributor.firmName}
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200">
            {/* My Portfolio — always visible */}
            <button
              id="nav-tab-investor"
              onClick={() => setActiveTab('investor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'investor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-slate-900 hover:bg-gray-200/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{isClient ? 'My Portfolio' : 'Client Portfolio'}</span>
            </button>

            {/* e-KYC / Onboarding — shown for distributor only */}
            {!isClient && (
              <button
                id="nav-tab-onboarding"
                onClick={() => setActiveTab('onboarding')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'onboarding'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-slate-900 hover:bg-gray-200/60'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Digital e-KYC</span>
              </button>
            )}

            {/* Distributor Hub — distributor only */}
            {!isClient && (
              <button
                id="nav-tab-distributor"
                onClick={() => setActiveTab('distributor')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'distributor'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-slate-900 hover:bg-gray-200/60'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Distributor Hub</span>
              </button>
            )}

            {/* MF Calculators — always visible */}
            <button
              id="nav-tab-calculators"
              onClick={() => setActiveTab('calculators')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'calculators'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-slate-900 hover:bg-gray-200/60'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>MF Tools</span>
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2">
            {/* Client Switcher — distributor only */}
            {!isClient && activeTab === 'investor' && (
              <div className="relative hidden lg:block">
                <label className="text-[10px] uppercase font-bold text-gray-500 block -mb-0.5">
                  Client View:
                </label>
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 shadow-sm">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-2"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id} className="bg-white text-slate-800">
                        {c.name} ({c.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {/* Invest / SIP */}
              <button
                id="btn-transact"
                onClick={onOpenTransact}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-sm transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isClient ? 'Invest / SIP' : 'Transact / SIP'}</span>
              </button>

              {/* Redeem — client only */}
              {isClient && onOpenRedeem && (
                <button
                  id="btn-redeem"
                  onClick={onOpenRedeem}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-sm transition active:scale-95"
                >
                  <ArrowDownCircle className="w-3.5 h-3.5" />
                  <span>Withdraw</span>
                </button>
              )}

              {/* Proposal PDF — distributor only */}
              {!isClient && (
                <button
                  onClick={onOpenProposal}
                  className="hidden sm:flex items-center gap-1.5 bg-white hover:bg-gray-50 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg border border-gray-300 shadow-sm transition"
                >
                  <span>Proposal PDF</span>
                </button>
              )}
            </div>

            {/* User Badge & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                  {session.user.name}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {isClient ? `PAN: ${session.user.pan}` : 'ARN: ' + distributor.arn}
                </span>
              </div>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Dropdown Menu ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-3 space-y-1">
            <button
              onClick={() => { setActiveTab('investor'); setMobileMenuOpen(false); }}
              className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg ${
                activeTab === 'investor' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {isClient ? 'My Portfolio' : 'Client Portfolio'}
            </button>
            {!isClient && (
              <button
                onClick={() => { setActiveTab('onboarding'); setMobileMenuOpen(false); }}
                className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg ${
                  activeTab === 'onboarding' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Digital e-KYC
              </button>
            )}
            {!isClient && (
              <button
                onClick={() => { setActiveTab('distributor'); setMobileMenuOpen(false); }}
                className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg ${
                  activeTab === 'distributor' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Distributor Hub
              </button>
            )}
            <button
              onClick={() => { setActiveTab('calculators'); setMobileMenuOpen(false); }}
              className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg ${
                activeTab === 'calculators' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Calculator className="w-4 h-4" />
              MF Tools
            </button>
            {/* Mobile action buttons */}
            <div className="flex gap-2 px-2 pt-2">
              <button
                onClick={() => { onOpenTransact(); setMobileMenuOpen(false); }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white font-semibold text-xs py-2.5 rounded-lg"
              >
                <Sparkles className="w-3.5 h-3.5" /> Invest / SIP
              </button>
              {isClient && onOpenRedeem && (
                <button
                  onClick={() => { onOpenRedeem(); setMobileMenuOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-rose-600 text-white font-semibold text-xs py-2.5 rounded-lg"
                >
                  <ArrowDownCircle className="w-3.5 h-3.5" /> Withdraw
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
