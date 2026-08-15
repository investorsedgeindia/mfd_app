import React, { useState } from 'react';
import {
  Building2,
  Users,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  FileCheck,
  Search,
  Upload,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  Send,
} from 'lucide-react';
import { AMC_PARTNERS } from '../data/sampleData';
import { AmcPartner, ClientProfile, DistributorDetails } from '../types';

interface DistributorHubProps {
  distributor: DistributorDetails;
  clients: ClientProfile[];
  onSelectClient: (clientId: string) => void;
  onOpenOnboarding: () => void;
  onOpenCasUpload: () => void;
}

export const DistributorHub: React.FC<DistributorHubProps> = ({
  distributor,
  clients,
  onSelectClient,
  onOpenOnboarding,
  onOpenCasUpload,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKycFilter, setSelectedKycFilter] = useState<string>('ALL');
  const [isSyncingFeeds, setIsSyncingFeeds] = useState(false);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);

  const handleSyncFeeds = () => {
    setIsSyncingFeeds(true);
    setTimeout(() => {
      setIsSyncingFeeds(false);
      setLastSyncMessage('Successfully reconciled 44 AMCs via CAMS & KFintech SFTP mailback feeds (142 folios updated).');
      setTimeout(() => setLastSyncMessage(null), 5000);
    }, 1200);
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKyc = selectedKycFilter === 'ALL' || c.kycStatus === selectedKycFilter;
    return matchesSearch && matchesKyc;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Distributor Stats Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                MFD Operations &amp; AUM Analytics
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                ARN: {distributor.arn}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">
              {distributor.firmName}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Principal Distributor: {distributor.distributorName} | EUIN: {distributor.euin} | Registered in {distributor.officeCity}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSyncFeeds}
              disabled={isSyncingFeeds}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl border border-gray-300 shadow-xs transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFeeds ? 'animate-spin text-blue-600' : ''}`} />
              <span>{isSyncingFeeds ? 'Reconciling Feeds...' : 'Sync RTA Feeds'}</span>
            </button>
            <button
              onClick={onOpenOnboarding}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs transition"
            >
              <span>+ Onboard New Client</span>
            </button>
          </div>
        </div>

        {lastSyncMessage && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{lastSyncMessage}</span>
          </div>
        )}

        {/* Distributor High-Level Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200">
            <span className="text-gray-500 text-xs block font-medium">Total AUM Under ARN</span>
            <span className="text-xl md:text-2xl font-extrabold text-slate-900 font-mono mt-0.5 block">
              ₹{(distributor.totalAum / 10000000).toFixed(2)} Cr
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">+18.2% YTD Growth</span>
          </div>

          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200">
            <span className="text-gray-500 text-xs block font-medium">Monthly SIP Book</span>
            <span className="text-xl md:text-2xl font-extrabold text-blue-600 font-mono mt-0.5 block">
              ₹{(distributor.monthlySipBook / 100000).toFixed(1)} L / mo
            </span>
            <span className="text-[10px] text-gray-500 font-medium">Auto e-NACH collection</span>
          </div>

          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200">
            <span className="text-gray-500 text-xs block font-medium">Active Investor Accounts</span>
            <span className="text-xl md:text-2xl font-extrabold text-slate-900 font-mono mt-0.5 block">
              {distributor.totalInvestors} Clients
            </span>
            <span className="text-[10px] text-blue-600 font-medium">98.5% KYC Validated</span>
          </div>

          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200">
            <span className="text-gray-500 text-xs block font-medium">BSE / NSE Gateway</span>
            <span className="text-xl md:text-2xl font-extrabold text-slate-900 font-mono mt-0.5 block">
              Active
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Paperless UCC Ready</span>
          </div>
        </div>
      </div>

      {/* Client CRM & KYC Directory */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Client CRM &amp; Investment Portfolio Directory
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Click any customer to switch into their individual portfolio viewing screen
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, PAN, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 w-52"
              />
            </div>

            <select
              value={selectedKycFilter}
              onChange={(e) => setSelectedKycFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All KYC Statuses</option>
              <option value="VALIDATED">KYC Validated</option>
              <option value="REGISTERED">KYC Registered</option>
              <option value="UNDER_PROCESS">Under Process</option>
            </select>
          </div>
        </div>

        {/* Client List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-600 font-semibold uppercase text-[10px]">
                <th className="py-3 px-3">Investor Name &amp; Contact</th>
                <th className="py-3 px-3">PAN &amp; City</th>
                <th className="py-3 px-3">KYC Status</th>
                <th className="py-3 px-3 text-right">Portfolio Value</th>
                <th className="py-3 px-3 text-right">Total Gain (XIRR)</th>
                <th className="py-3 px-3 text-right">Monthly SIP</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {filteredClients.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 text-xs">{c.name}</div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                      <span>{c.email}</span>
                      <span>•</span>
                      <span>{c.phone}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-mono text-slate-800 font-bold">{c.pan}</div>
                    <div className="text-[11px] text-gray-500">{c.city}, {c.state}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        c.kycStatus === 'VALIDATED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : c.kycStatus === 'REGISTERED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {c.kycStatus.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    ₹{c.currentValue.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3 text-right font-mono">
                    <div className="text-emerald-600 font-bold">
                      +{c.absoluteReturn.toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-gray-500">XIRR: {c.xirr}%</div>
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-slate-700">
                    ₹{c.activeSipMonthly.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectClient(c.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow-xs transition inline-flex items-center gap-1"
                    >
                      <span>View Portfolio</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AMC Empanelment & RTA Mailback Feed Matrix */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> AMC Empanelment &amp; RTA Feed Sync Status
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Live status of your registered ARN ({distributor.arn}) across Indian AMCs and RTAs (CAMS &amp; KFintech)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {AMC_PARTNERS.map((amc) => (
            <div
              key={amc.id}
              className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">{amc.shortName}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      amc.rta === 'CAMS' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    RTA: {amc.rta}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500">
                  Empanelment Code: <strong className="text-slate-800 font-mono">{amc.empanelmentCode}</strong>
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  AUM Under ARN: <strong className="text-blue-600 font-mono font-bold">₹{(amc.totalAum / 100000).toFixed(1)} L</strong> ({amc.foliosManaged} folios)
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-500">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {amc.feedSyncStatus}
                </span>
                <span>{amc.lastSyncTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
