import React, { useState } from 'react';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Download,
  PlusCircle,
  RefreshCw,
  Sparkles,
  FileText,
  ChevronRight,
  ArrowDownCircle,
  Target,
  Wallet,
  Lightbulb,
  BadgeIndianRupee,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { ClientProfile, FolioHolding, SIPSchedule, TransactionRecord } from '../types';

interface InvestorDashboardProps {
  client: ClientProfile;
  holdings: FolioHolding[];
  sips: SIPSchedule[];
  transactions: TransactionRecord[];
  onOpenTransact: () => void;
  onOpenCasUpload: () => void;
  onOpenProposal: () => void;
  onOpenRedeem?: () => void;
  isClient?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  EQUITY: '#2563eb', // blue-600
  DEBT: '#0ea5e9', // sky-500
  HYBRID: '#f59e0b', // amber-500
  COMMODITY: '#8b5cf6', // purple-500
  ELSS_TAX_SAVER: '#10b981', // emerald-500
  SOLUTION_ORIENTED: '#ec4899', // pink-500
};

export const InvestorDashboard: React.FC<InvestorDashboardProps> = ({
  client,
  holdings,
  sips,
  transactions,
  onOpenTransact,
  onOpenCasUpload,
  onOpenProposal,
  onOpenRedeem,
  isClient = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'holdings' | 'sips' | 'tax' | 'transactions'>('holdings');
  const [selectedHolding, setSelectedHolding] = useState<FolioHolding | null>(null);

  // Compute Live Metrics
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0) || client.currentValue;
  const totalInvestedAmount = holdings.reduce((sum, h) => sum + h.investedAmount, 0) || client.totalInvested;
  const totalReturns = totalCurrentValue - totalInvestedAmount;
  const returnsPercent = totalInvestedAmount > 0 ? (totalReturns / totalInvestedAmount) * 100 : 0;
  const overallXirr = client.xirr || 18.4;

  // Asset Allocation calculation
  const allocationMap = holdings.reduce((acc, h) => {
    acc[h.category] = (acc[h.category] || 0) + h.currentValue;
    return acc;
  }, {} as Record<string, number>);

  const pieData = (Object.entries(allocationMap) as [string, number][]).map(([category, value]) => ({
    name: category.replace('_', ' '),
    value: Number(value),
    percentage: totalCurrentValue > 0 ? Math.round((Number(value) / totalCurrentValue) * 100) : 0,
    color: CATEGORY_COLORS[category] || '#64748b',
  }));

  // Budget 2024 Tax Computation
  const equityGain = totalReturns > 0 ? totalReturns * 0.85 : 0;
  const ltcgExemptionLimit = 125000; // ₹1.25 Lakhs as per Union Budget 2024
  const taxableLtcg = Math.max(0, equityGain - ltcgExemptionLimit);
  const estimatedLtcgTax = Math.round(taxableLtcg * 0.125); // 12.5% tax rate
  const estimatedStcgTax = Math.round(Math.max(0, totalReturns * 0.15) * 0.2); // 20% on STCG

  return (
    <div className="space-y-6 pb-16">
      {/* Top Investor Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-xs">
              {client.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  {client.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> KYC Validated
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                <span>
                  PAN: <strong className="text-slate-800 font-mono">{client.pan}</strong>
                </span>
                <span>•</span>
                <span>
                  BSE UCC: <strong className="text-slate-800 font-mono">{client.uccBse || 'BSE_UCC_001'}</strong>
                </span>
                <span>•</span>
                <span>
                  Risk Profile: <strong className="text-blue-600 font-medium">{client.riskProfile}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenTransact}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Invest / Start SIP</span>
            </button>
            {isClient ? (
              onOpenRedeem && (
                <button
                  onClick={onOpenRedeem}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95"
                >
                  <ArrowDownCircle className="w-3.5 h-3.5" />
                  <span>Withdraw / Redeem</span>
                </button>
              )
            ) : (
              <button
                onClick={onOpenCasUpload}
                className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-slate-700 font-medium text-xs px-3.5 py-2 rounded-xl border border-gray-300 shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Import CAS</span>
              </button>
            )}
          </div>
        </div>

        {/* Bank & Mandate Info Bar */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-gray-400" />
            <span>
              Primary Linked Bank: <strong className="text-slate-800 font-medium">{client.bankDetails.bankName}</strong> ({client.bankDetails.maskedAccountNumber})
            </span>
            <span className="text-emerald-700 text-[10px] font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
              Penny Drop Verified
            </span>
          </div>
          <div className="text-gray-500">
            Distributor: <strong className="text-slate-900 font-medium">InvestorsEdge Wealth (ARN-198420)</strong>
          </div>
        </div>
      </div>

      {/* Main Portfolio Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Portfolio Value */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium mb-1">
            <span>Current Portfolio Value</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            ₹{totalCurrentValue.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between font-medium">
            <span>Invested: ₹{totalInvestedAmount.toLocaleString('en-IN')}</span>
            <span className="text-gray-400">{holdings.length} Folios</span>
          </div>
        </div>

        {/* Card 2: Overall Profit / Gain */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium mb-1">
            <span>Total Gain / Returns</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 font-mono tracking-tight flex items-baseline gap-1">
            +₹{totalReturns.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{returnsPercent.toFixed(2)}% Absolute Return</span>
          </div>
        </div>

        {/* Card 3: Annualized XIRR */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium mb-1">
            <span>Annualized XIRR Return</span>
            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
              Cashflow Weighted
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-blue-600 font-mono tracking-tight">
            {overallXirr}%
          </div>
          <div className="mt-2 text-xs text-gray-500 font-medium">
            Outperforming Nifty 50 TRI benchmark
          </div>
        </div>

        {/* Card 4: Monthly SIP Book */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium mb-1">
            <span>Active Monthly SIP</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            ₹{(client.activeSipMonthly || 45000).toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{sips.length || 4} Active e-NACH Mandates</span>
          </div>
        </div>
      </div>

      {/* Asset Allocation & Portfolio Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Allocation Visualizer */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-blue-600" /> Asset Allocation
            </h2>
            <span className="text-xs text-gray-500">SEBI Classification</span>
          </div>

          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] text-gray-500 font-medium">Equities</span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {pieData.find((p) => p.name === 'EQUITY')?.percentage || 75}%
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="capitalize font-medium">{item.name.toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-semibold text-slate-900">₹{item.value.toLocaleString('en-IN')}</span>
                  <span className="text-gray-500 text-[11px]">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advisory Card — client vs distributor version */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                {isClient ? (
                  <><Lightbulb className="w-4 h-4 text-blue-600" /> Your Portfolio Insights</>
                ) : (
                  <><Sparkles className="w-4 h-4 text-blue-600" /> Distributor Portfolio Advisory &amp; Next Review</>
                )}
              </h2>
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                {isClient ? 'SEBI Compliant' : 'ARN-198420 Monitored'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Healthy Wealth Creation Trajectory</h4>
                  <p className="text-slate-700 text-[11px] mt-0.5 leading-relaxed">
                    {isClient ? (
                      <>Your portfolio is generating <strong>{overallXirr}% annualized XIRR</strong>. Your next SIP of <strong>₹{(client.activeSipMonthly || 0).toLocaleString('en-IN')}</strong> will auto-debit from your linked bank account.
                      </>
                    ) : (
                      <>Portfolio is generating <strong>{overallXirr}% XIRR</strong> across Flexi Cap and Mid Cap holdings. Next monthly SIP of <strong>₹{(client.activeSipMonthly || 45000).toLocaleString('en-IN')}</strong> will execute on 5th of next month via HDFC Bank e-NACH mandate.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <BadgeIndianRupee className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-xs">Union Budget 2024 — Tax Insight</h4>
                  <p className="text-amber-800/90 text-[11px] mt-0.5 leading-relaxed">
                    Long Term Capital Gains (LTCG) above ₹1.25 Lakhs/FY are taxed at 12.5%.
                    {totalReturns > 0 && (
                      <> You have an unrealized gain of <strong>₹{totalReturns.toLocaleString('en-IN')}</strong>. Consider strategic tax harvesting before redeeming.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-gray-500">
              {isClient
                ? 'NAV updated daily by CAMS/KFintech. Portfolio values as of latest NAV.'
                : 'Last RTA daily feed sync: Today, 06:30 AM IST (CAMS/KFintech)'}
            </span>
            {!isClient && (
              <button
                onClick={onOpenProposal}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Generate Printable Portfolio Factsheet <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for Holdings, SIP Schedule, Capital Gains & Transactions */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Navigation Sub-Tabs */}
        <div className="bg-gray-50 px-4 pt-3 border-b border-gray-200 flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'holdings', label: `Scheme Holdings (${holdings.length})`, icon: Layers },
            { id: 'sips', label: `SIP Schedules (${sips.length || 4})`, icon: Calendar },
            { id: 'tax', label: 'Budget 2024 Capital Gains', icon: FileText },
            { id: 'transactions', label: 'Transaction History', icon: RefreshCw },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 font-semibold border-b-2 whitespace-nowrap transition ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Scheme Holdings Table */}
        {activeSubTab === 'holdings' && (
          <div className="p-4 overflow-x-auto">
            {holdings.length === 0 ? (
              /* ── Empty State ── */
              <div className="text-center py-16 px-6">
                <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <Wallet className="w-9 h-9 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {isClient ? 'Start Your Investment Journey' : 'No Holdings Found'}
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5 leading-relaxed">
                  {isClient
                    ? 'You have no mutual fund holdings yet. Start a SIP or make a lumpsum investment to begin growing your wealth.'
                    : 'No holdings data available for this client. Import CAS or add a transaction.'}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={onOpenTransact}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    {isClient ? 'Start Investing' : 'Add Transaction'}
                  </button>
                  {!isClient && (
                    <button
                      onClick={onOpenCasUpload}
                      className="flex items-center gap-2 bg-white hover:bg-gray-50 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-xl border border-gray-300 transition"
                    >
                      <Download className="w-4 h-4" /> Import CAS
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Scheme &amp; AMC</th>
                    <th className="py-3 px-3">Folio Number</th>
                    <th className="py-3 px-3 text-right">Units</th>
                    <th className="py-3 px-3 text-right">Current NAV</th>
                    <th className="py-3 px-3 text-right">Invested Value</th>
                    <th className="py-3 px-3 text-right">Current Value</th>
                    <th className="py-3 px-3 text-right">Returns (XIRR)</th>
                    <th className="py-3 px-3 text-center">SIP Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-slate-700">
                  {holdings.map((holding) => (
                    <tr key={holding.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-xs max-w-xs">{holding.schemeName}</div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          <span className="text-blue-600 font-semibold">{holding.amcLogoText}</span>
                          <span>•</span>
                          <span>{holding.subCategory}</span>
                          <span>•</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              holding.riskometer === 'VERY_HIGH'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {holding.riskometer.replace('_', ' ')}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-gray-600 text-[11px]">
                        {holding.folioNumber}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-gray-700">
                        {holding.units.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 text-right font-mono">
                        <div className="text-slate-900 font-semibold">₹{holding.currentNav.toFixed(2)}</div>
                        <div className="text-[10px] text-gray-400">Avg: ₹{holding.avgPurchaseNav.toFixed(2)}</div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-gray-700">
                        ₹{holding.investedAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{holding.currentValue.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono">
                        <div className={`font-bold ${holding.returnsAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {holding.returnsAmount >= 0 ? '+' : ''}₹{holding.returnsAmount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-medium">
                          {holding.returnsPercentage.toFixed(1)}% (XIRR: {holding.xirr}%)
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {holding.sipLinked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                            Active (₹{holding.sipAmount?.toLocaleString('en-IN')})
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">Lumpsum Only</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={onOpenTransact}
                            className="text-[11px] bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 rounded-lg border border-blue-200 shadow-sm transition"
                          >
                            + Invest
                          </button>
                          {isClient && onOpenRedeem && (
                            <button
                              onClick={onOpenRedeem}
                              className="text-[11px] bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg border border-rose-200 shadow-sm transition"
                            >
                              Redeem
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: SIP Schedules */}
        {activeSubTab === 'sips' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">
                Automated monthly investments executing through NPCI e-NACH mandate
              </span>
              <button
                onClick={onOpenTransact}
                className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline"
              >
                + Register New SIP
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sips.map((sip) => (
                <div
                  key={sip.id}
                  className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-blue-600 text-sm font-mono">
                        ₹{sip.amount.toLocaleString('en-IN')} / month
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {sip.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-xs">{sip.schemeName}</h3>
                    <div className="text-[11px] text-gray-500 mt-1">
                      Folio: <span className="font-mono text-slate-700">{sip.folioNumber}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
                    <span>Debit Day: {sip.sipDay}th of month</span>
                    <span>Next: <strong className="text-slate-900">{sip.nextDebitDate}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Budget 2024 Capital Gains */}
        {activeSubTab === 'tax' && (
          <div className="p-5 space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Income Tax (Budget 2024) Capital Gains Summary
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Updated with Finance Act 2024 rules: LTCG 12.5% above ₹1.25 Lakhs exemption; STCG 20%.
                  </p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium">
                  FY 2026-27 Tax Regime
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                  <span className="text-gray-500 text-xs block">Total Unrealized Gains</span>
                  <span className="text-base font-bold text-emerald-600 font-mono">
                    ₹{totalReturns.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                  <span className="text-gray-500 text-xs block">LTCG ₹1.25L Exemption Status</span>
                  <span className="text-base font-bold text-blue-600 font-mono">
                    ₹1,25,000 / FY Utilizable
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                  <span className="text-gray-500 text-xs block">Estimated Net Tax Liability</span>
                  <span className="text-base font-bold text-amber-600 font-mono">
                    ₹{(estimatedLtcgTax + estimatedStcgTax).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Transaction Records */}
        {activeSubTab === 'transactions' && (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-600 font-semibold text-[10px] uppercase">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Scheme</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Units</th>
                  <th className="py-2.5 px-3 text-right">NAV</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Order Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-2.5 px-3 font-mono text-gray-500">{tx.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-xs truncate">
                      {tx.schemeName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-700">
                      {tx.units.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-700">
                      ₹{tx.nav.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">✓ {tx.status}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-500 text-[11px]">
                      {tx.orderReference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
