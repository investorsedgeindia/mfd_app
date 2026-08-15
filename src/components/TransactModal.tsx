import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CreditCard,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { ClientProfile, FolioHolding, SIPSchedule, TransactionRecord } from '../types';
import { saveHolding, saveSipSchedule, saveTransaction } from '../services/supabaseService';

interface TransactModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProfile;
  onTransactionSuccess: (
    newHolding: FolioHolding,
    newSip?: SIPSchedule,
    newTx?: TransactionRecord
  ) => void;
}

const AVAILABLE_SCHEMES = [
  {
    name: 'Parag Parikh Flexi Cap Fund - Regular - Growth',
    amc: 'PPFAS Mutual Fund',
    category: 'EQUITY' as const,
    subCategory: 'Flexi Cap',
    minLumpsum: 1000,
    minSip: 1000,
    currentNav: 82.65,
    isin: 'INF879O01019',
    riskometer: 'VERY_HIGH' as const,
  },
  {
    name: 'HDFC Mid-Cap Opportunities Fund - Regular - Growth',
    amc: 'HDFC Mutual Fund',
    category: 'EQUITY' as const,
    subCategory: 'Mid Cap',
    minLumpsum: 5000,
    minSip: 500,
    currentNav: 174.3,
    isin: 'INF179K01965',
    riskometer: 'VERY_HIGH' as const,
  },
  {
    name: 'ICICI Prudential Balanced Advantage Fund - Regular - Growth',
    amc: 'ICICI Prudential MF',
    category: 'HYBRID' as const,
    subCategory: 'Dynamic Asset Allocation',
    minLumpsum: 5000,
    minSip: 500,
    currentNav: 74.8,
    isin: 'INF109K01139',
    riskometer: 'HIGH' as const,
  },
  {
    name: 'Nippon India Small Cap Fund - Regular - Growth',
    amc: 'Nippon India MF',
    category: 'EQUITY' as const,
    subCategory: 'Small Cap',
    minLumpsum: 5000,
    minSip: 1000,
    currentNav: 172.4,
    isin: 'INF204K01W83',
    riskometer: 'VERY_HIGH' as const,
  },
  {
    name: 'UTI Nifty 50 Index Fund - Regular - Growth',
    amc: 'UTI Mutual Fund',
    category: 'EQUITY' as const,
    subCategory: 'Large Cap Index',
    minLumpsum: 1000,
    minSip: 500,
    currentNav: 198.4,
    isin: 'INF789F01048',
    riskometer: 'VERY_HIGH' as const,
  },
];

export const TransactModal: React.FC<TransactModalProps> = ({
  isOpen,
  onClose,
  client,
  onTransactionSuccess,
}) => {
  const [transactType, setTransactType] = useState<'SIP' | 'LUMPSUM'>('SIP');
  const [selectedSchemeIndex, setSelectedSchemeIndex] = useState(0);
  const [amount, setAmount] = useState(10000);
  const [sipDay, setSipDay] = useState(5);
  const [paymentMode, setPaymentMode] = useState<'UPI_AUTOPAY' | 'ENACH_NETBANKING'>('ENACH_NETBANKING');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const scheme = AVAILABLE_SCHEMES[selectedSchemeIndex];

  const handleSubmitOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      const folioNo = `${Math.floor(10000000 + Math.random() * 90000000)}/01`;
      const units = Number((amount / scheme.currentNav).toFixed(2));

      const newHolding: FolioHolding = {
        id: `hol-${Date.now()}`,
        clientId: client.id,
        amcName: scheme.amc,
        amcLogoText: scheme.amc.split(' ')[0],
        schemeName: scheme.name,
        category: scheme.category,
        subCategory: scheme.subCategory,
        folioNumber: folioNo,
        units: units,
        avgPurchaseNav: scheme.currentNav,
        currentNav: scheme.currentNav,
        navDate: new Date().toISOString().split('T')[0],
        investedAmount: amount,
        currentValue: amount,
        returnsAmount: 0,
        returnsPercentage: 0,
        xirr: 16.5,
        isin: scheme.isin,
        riskometer: scheme.riskometer,
        sipLinked: transactType === 'SIP',
        sipAmount: transactType === 'SIP' ? amount : undefined,
        nextSipDate: transactType === 'SIP' ? `2026-09-0${sipDay}` : undefined,
      };

      const newSip: SIPSchedule | undefined =
        transactType === 'SIP'
          ? {
              id: `sip-${Date.now()}`,
              clientId: client.id,
              schemeName: scheme.name,
              amcName: scheme.amc,
              folioNumber: folioNo,
              amount: amount,
              frequency: 'MONTHLY',
              sipDay: sipDay,
              nextDebitDate: `2026-09-0${sipDay}`,
              startDate: new Date().toISOString().split('T')[0],
              mandateType: paymentMode === 'UPI_AUTOPAY' ? 'UPI_AUTOPAY' : 'eNACH',
              mandateRef: `UMRN_HDFC_${Date.now()}`,
              status: 'ACTIVE',
            }
          : undefined;

      const newTx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        clientId: client.id,
        date: new Date().toISOString().split('T')[0],
        schemeName: scheme.name,
        amcName: scheme.amc,
        folioNumber: folioNo,
        type: transactType === 'SIP' ? 'SIP_INSTALLMENT' : 'PURCHASE',
        amount: amount,
        units: units,
        nav: scheme.currentNav,
        status: 'SETTLED',
        orderReference: `BSE_${transactType}_${Date.now()}`,
      };

      // Asynchronously persist to Supabase Database
      saveHolding(newHolding).catch((err) => console.warn('Supabase save holding note:', err));
      if (newSip) {
        saveSipSchedule(newSip).catch((err) => console.warn('Supabase save sip note:', err));
      }
      if (newTx) {
        saveTransaction(newTx).catch((err) => console.warn('Supabase save tx note:', err));
      }

      setTimeout(() => {
        onTransactionSuccess(newHolding, newSip, newTx);
        onClose();
        setShowSuccess(false);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase">
                BSE StAR MF Gateway
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-semibold border border-blue-100">
                ARN-198420
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Initiate Mutual Fund Investment for {client.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-slate-900 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Order Executed Successfully!</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {transactType === 'SIP' ? 'Monthly SIP registered with e-NACH mandate' : 'Lumpsum order placed'} via BSE StAR MF. Payment confirmed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Lumpsum vs SIP selector */}
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
              <button
                onClick={() => setTransactType('SIP')}
                className={`py-2 rounded-lg font-semibold transition ${
                  transactType === 'SIP'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-gray-500 hover:text-slate-900'
                }`}
              >
                Monthly SIP (Systematic)
              </button>
              <button
                onClick={() => setTransactType('LUMPSUM')}
                className={`py-2 rounded-lg font-semibold transition ${
                  transactType === 'LUMPSUM'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-gray-500 hover:text-slate-900'
                }`}
              >
                One-Time Lumpsum
              </button>
            </div>

            {/* Scheme Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Select Mutual Fund Scheme *
              </label>
              <select
                value={selectedSchemeIndex}
                onChange={(e) => setSelectedSchemeIndex(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              >
                {AVAILABLE_SCHEMES.map((s, idx) => (
                  <option key={s.isin} value={idx}>
                    {s.name} (NAV: ₹{s.currentNav})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount input with chips */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {transactType === 'SIP' ? 'Monthly SIP Amount (₹)' : 'Investment Amount (₹)'} *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-1.5 mt-2">
                {[5000, 10000, 25000, 50000, 100000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className="text-[11px] bg-white hover:bg-gray-100 text-slate-700 font-medium px-2 py-1 rounded border border-gray-300 shadow-xs"
                  >
                    ₹{(val / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {/* SIP Date Picker if SIP */}
            {transactType === 'SIP' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Monthly Debit Day
                  </label>
                  <select
                    value={sipDay}
                    onChange={(e) => setSipDay(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                  >
                    <option value={1}>1st of month</option>
                    <option value={5}>5th of month</option>
                    <option value={10}>10th of month</option>
                    <option value={15}>15th of month</option>
                    <option value={20}>20th of month</option>
                    <option value={25}>25th of month</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Auto-Debit Mandate
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                  >
                    <option value="ENACH_NETBANKING">e-NACH (Bank NetBanking)</option>
                    <option value="UPI_AUTOPAY">UPI AutoPay (GPay / PhonePe)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Linked Bank Info & SEBI Disclaimer */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-[11px] text-gray-500 space-y-1">
              <div className="flex justify-between text-slate-700">
                <span>Debit Account:</span>
                <span className="font-mono text-slate-900 font-medium">
                  {client.bankDetails.bankName} ({client.bankDetails.maskedAccountNumber})
                </span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Investor BSE UCC:</span>
                <span className="font-mono text-blue-600 font-semibold">{client.uccBse || 'BSE_UCC_001'}</span>
              </div>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Routing to BSE StAR MF Gateway...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Confirm Order (₹{amount.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
