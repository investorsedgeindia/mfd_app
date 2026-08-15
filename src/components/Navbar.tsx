import React from 'react';
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
  ChevronDown,
} from 'lucide-react';
import { ClientProfile, DistributorDetails } from '../types';

interface NavbarProps {
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
}

export const Navbar: React.FC<NavbarProps> = ({
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
}) => {
  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 text-slate-800 shadow-xs">
      {/* Top Regulatory & ARN Strip */}
      <div className="bg-slate-900 px-4 py-1.5 text-xs text-slate-300 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> AMFI Registered MFD
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">
            ARN: <strong className="text-white font-mono">{distributor.arn}</strong> (EUIN: <span className="font-mono">{distributor.euin}</span>)
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">
            Exchange: BSE StAR MF ({distributor.bseMemberCode}) &amp; NSE NMF II
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
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

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('investor')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
                  MFD<span className="text-blue-600">Edge</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  India Suite
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate max-w-[200px] sm:max-w-none font-medium">
                {distributor.firmName}
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200">
            <button
              id="nav-tab-investor"
              onClick={() => setActiveTab('investor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'investor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-slate-900 hover:bg-gray-200/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Client Portfolio</span>
            </button>

            <button
              id="nav-tab-onboarding"
              onClick={() => setActiveTab('onboarding')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'onboarding'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-slate-900 hover:bg-gray-200/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Digital e-KYC Onboarding</span>
            </button>

            <button
              id="nav-tab-distributor"
              onClick={() => setActiveTab('distributor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'distributor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-slate-900 hover:bg-gray-200/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Distributor Hub</span>
            </button>

            <button
              id="nav-tab-calculators"
              onClick={() => setActiveTab('calculators')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'calculators'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-slate-900 hover:bg-gray-200/60'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>MF Tools</span>
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2.5">
            {/* Investor Switcher (if on investor tab) */}
            {activeTab === 'investor' && (
              <div className="relative group">
                <label className="text-[10px] uppercase font-bold text-gray-500 block -mb-0.5">
                  Viewing As:
                </label>
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 shadow-xs">
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

            <button
              onClick={onOpenTransact}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-sm transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transact / SIP</span>
            </button>

            <button
              onClick={onOpenProposal}
              className="hidden sm:flex items-center gap-1.5 bg-white hover:bg-gray-50 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg border border-gray-300 shadow-xs transition"
            >
              <span>Proposal PDF</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-gray-200 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('investor')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'investor' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Client Portfolio
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'onboarding' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Digital e-KYC
          </button>
          <button
            onClick={() => setActiveTab('distributor')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'distributor' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Distributor Hub
          </button>
          <button
            onClick={() => setActiveTab('calculators')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === 'calculators' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            MF Tools
          </button>
        </div>
      </div>
    </header>
  );
};
