import React from 'react';
import { X, Printer, Download, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
import { ClientProfile, DistributorDetails, FolioHolding } from '../types';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProfile;
  distributor: DistributorDetails;
  holdings: FolioHolding[];
}

export const ProposalModal: React.FC<ProposalModalProps> = ({
  isOpen,
  onClose,
  client,
  distributor,
  holdings,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0) || client.currentValue;
  const totalInvested = holdings.reduce((s, h) => s + h.investedAmount, 0) || client.totalInvested;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header Controls */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 uppercase">
              SEBI Compliant Portfolio Factsheet &amp; Proposal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-slate-900 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Proposal Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-slate-800 space-y-6 shadow-xs">
          {/* Header of Statement */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {distributor.firmName}
              </h2>
              <p className="text-xs text-gray-500">AMFI Registered Mutual Fund Distributor</p>
              <div className="text-[11px] font-mono text-blue-600 font-semibold mt-1">
                ARN: {distributor.arn} • EUIN: {distributor.euin}
              </div>
            </div>
            <div className="text-right text-xs text-gray-500">
              <div>Date: {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
              <div>Platform: BSE StAR MF</div>
            </div>
          </div>

          {/* Client Details */}
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-medium">Investor Name</span>
              <span className="font-bold text-slate-900">{client.name}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-medium">PAN</span>
              <span className="font-bold font-mono text-slate-900">{client.pan}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-medium">Risk Profile</span>
              <span className="font-bold text-blue-600">{client.riskProfile}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-medium">Total Valuation</span>
              <span className="font-bold font-mono text-emerald-600">
                ₹{totalValue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Holdings Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Current Mutual Fund Asset Allocation:
            </h4>
            <div className="space-y-1.5 text-xs">
              {holdings.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-2.5 bg-gray-50/80 rounded-lg border border-gray-200"
                >
                  <div>
                    <div className="font-bold text-slate-900">{h.schemeName}</div>
                    <div className="text-[11px] text-gray-500">
                      {h.subCategory} • Folio: {h.folioNumber}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-slate-900 font-bold">₹{h.currentValue.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">+{h.returnsPercentage.toFixed(1)}% ({h.xirr}% XIRR)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statutory AMFI & SEBI Risk Disclaimer */}
          <div className="pt-4 border-t border-gray-200 text-[10px] text-gray-500 leading-relaxed">
            <p>
              <strong>Statutory Disclaimer:</strong> Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Past performance is not indicative of future returns. Mutual funds are distributed under Regular Plan with ARN-198420.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
