import React, { useState, useMemo } from 'react';
import {
  X,
  ArrowDownCircle,
  Building,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Info,
  ChevronDown,
  Banknote,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { ClientProfile, FolioHolding, TransactionRecord } from '../types';
import { saveTransaction } from '../services/supabaseService';

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProfile;
  holdings: FolioHolding[];
  onRedemptionSuccess: (updatedHolding: FolioHolding | null, newTx: TransactionRecord) => void;
}

type RedemptionMode = 'FULL' | 'PARTIAL_AMOUNT' | 'PARTIAL_UNITS';

/** Estimate holding period in days from navDate or assume ~400 days for demo */
function estimateDaysHeld(navDate: string): number {
  try {
    const purchaseApprox = new Date(navDate);
    purchaseApprox.setFullYear(purchaseApprox.getFullYear() - 1); // assume bought ~1yr before current nav date
    const today = new Date();
    return Math.max(0, Math.floor((today.getTime() - purchaseApprox.getTime()) / 86400000));
  } catch {
    return 400; // safe default
  }
}

export const RedeemModal: React.FC<RedeemModalProps> = ({
  isOpen,
  onClose,
  client,
  holdings,
  onRedemptionSuccess,
}) => {
  const [selectedHoldingId, setSelectedHoldingId] = useState<string>(holdings[0]?.id || '');
  const [redemptionMode, setRedemptionMode] = useState<RedemptionMode>('PARTIAL_AMOUNT');
  const [partialAmount, setPartialAmount] = useState<number>(10000);
  const [partialUnits, setPartialUnits] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successOrderRef, setSuccessOrderRef] = useState('');

  if (!isOpen) return null;

  const selectedHolding = holdings.find((h) => h.id === selectedHoldingId) || holdings[0];

  // -- Computed values --
  const daysHeld = selectedHolding ? estimateDaysHeld(selectedHolding.navDate) : 400;
  const isLongTerm = daysHeld >= 365;

  const redeemableUnits =
    redemptionMode === 'FULL'
      ? selectedHolding?.units || 0
      : redemptionMode === 'PARTIAL_UNITS'
      ? partialUnits
      : selectedHolding
      ? partialAmount / selectedHolding.currentNav
      : 0;

  const redeemableValue =
    redemptionMode === 'FULL'
      ? selectedHolding?.currentValue || 0
      : redemptionMode === 'PARTIAL_AMOUNT'
      ? partialAmount
      : (selectedHolding?.currentNav || 0) * partialUnits;

  // Tax calculation (Budget 2024 rules)
  const taxInfo = useMemo(() => {
    if (!selectedHolding) return { tax: 0, rate: 0, label: '' };
    const totalCost = selectedHolding.investedAmount;
    const totalValue = selectedHolding.currentValue;
    const gainRatio = totalCost > 0 ? (totalValue - totalCost) / totalCost : 0;
    const estimatedGainOnRedeem = Math.max(0, redeemableValue * gainRatio);

    if (isLongTerm) {
      // LTCG: 12.5% above ₹1.25L (Union Budget 2024)
      const ltcgExemption = 125000;
      const taxable = Math.max(0, estimatedGainOnRedeem - ltcgExemption);
      return {
        tax: Math.round(taxable * 0.125),
        rate: 12.5,
        label: 'LTCG @ 12.5% (above ₹1.25L exemption)',
        gain: estimatedGainOnRedeem,
      };
    } else {
      // STCG: 20% flat (Budget 2024)
      return {
        tax: Math.round(estimatedGainOnRedeem * 0.2),
        rate: 20,
        label: 'STCG @ 20% (short-term holding)',
        gain: estimatedGainOnRedeem,
      };
    }
  }, [selectedHolding, redeemableValue, isLongTerm]);

  const netPayout = Math.max(0, redeemableValue - taxInfo.tax);

  // -- Validation --
  const isValid = (() => {
    if (!selectedHolding) return false;
    if (redemptionMode === 'PARTIAL_AMOUNT') {
      return partialAmount >= 100 && partialAmount <= selectedHolding.currentValue;
    }
    if (redemptionMode === 'PARTIAL_UNITS') {
      return partialUnits > 0 && partialUnits <= selectedHolding.units;
    }
    return true; // FULL
  })();

  const handleSubmit = () => {
    if (!selectedHolding || !isValid) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const orderRef = `BSE_REDEEM_${Date.now()}`;
      setSuccessOrderRef(orderRef);
      setIsSubmitting(false);
      setShowSuccess(true);

      const redeemedUnits = Number(redeemableUnits.toFixed(3));
      const redeemedValue = Number(redeemableValue.toFixed(2));

      const newTx: TransactionRecord = {
        id: `tx-rdm-${Date.now()}`,
        clientId: client.id,
        date: new Date().toISOString().split('T')[0],
        schemeName: selectedHolding.schemeName,
        amcName: selectedHolding.amcName,
        folioNumber: selectedHolding.folioNumber,
        type: 'REDEMPTION',
        amount: redeemedValue,
        units: redeemedUnits,
        nav: selectedHolding.currentNav,
        status: 'PROCESSING',
        orderReference: orderRef,
      };

      // Compute updated holding (null if full redemption)
      let updatedHolding: FolioHolding | null = null;
      if (redemptionMode !== 'FULL') {
        const remainingUnits = selectedHolding.units - redeemedUnits;
        const remainingValue = remainingUnits * selectedHolding.currentNav;
        const ratioRedeemed = redeemedUnits / selectedHolding.units;
        updatedHolding = {
          ...selectedHolding,
          units: Number(remainingUnits.toFixed(3)),
          currentValue: Number(remainingValue.toFixed(2)),
          investedAmount: Number(
            (selectedHolding.investedAmount * (1 - ratioRedeemed)).toFixed(2)
          ),
          returnsAmount: Number(
            (remainingValue - selectedHolding.investedAmount * (1 - ratioRedeemed)).toFixed(2)
          ),
        };
      }

      saveTransaction(newTx).catch((err) =>
        console.warn('Supabase redemption tx save note:', err)
      );

      setTimeout(() => {
        onRedemptionSuccess(updatedHolding, newTx);
        onClose();
        setShowSuccess(false);
        setIsSubmitting(false);
      }, 2000);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-rose-200 uppercase tracking-wider">
                BSE StAR MF Gateway
              </div>
              <h3 className="text-base font-bold text-white">Redeem / Withdraw Investment</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {showSuccess ? (
            /* Success State */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto border-2 border-emerald-200">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Redemption Order Placed!</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Your redemption request has been submitted to BSE StAR MF. Proceeds will be
                  credited to your linked bank account within <strong>T+3 working days</strong>.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-left space-y-1.5 border border-gray-200">
                <div className="flex justify-between text-slate-700">
                  <span className="text-gray-500">Order Reference:</span>
                  <span className="font-mono font-semibold text-slate-900">{successOrderRef}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="text-gray-500">Credit Account:</span>
                  <span className="font-medium">
                    {client.bankDetails.bankName} ({client.bankDetails.maskedAccountNumber})
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="text-gray-500">Expected Payout:</span>
                  <span className="font-bold text-emerald-600">
                    ₹{netPayout.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Settlement:</span>
                  <span className="font-medium text-blue-600">T+3 Working Days</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 1. Select Holding */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Select Scheme / Folio to Redeem *
                </label>
                {holdings.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-xl border border-gray-200">
                    No holdings found. Please invest first.
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedHoldingId}
                      onChange={(e) => setSelectedHoldingId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-400 font-medium appearance-none pr-8"
                    >
                      {holdings.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.schemeName} — ₹{h.currentValue.toLocaleString('en-IN')} (
                          {h.units.toFixed(2)} units)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                )}

                {selectedHolding && (
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                      Folio: {selectedHolding.folioNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold ${
                        isLongTerm
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isLongTerm ? '✓ Long-Term (LTCG)' : '⚠ Short-Term (STCG)'}
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                      NAV: ₹{selectedHolding.currentNav.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Redemption Mode */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Redemption Type *
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200">
                  {(
                    [
                      { id: 'FULL', label: 'Full Redeem' },
                      { id: 'PARTIAL_AMOUNT', label: 'By Amount (₹)' },
                      { id: 'PARTIAL_UNITS', label: 'By Units' },
                    ] as { id: RedemptionMode; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setRedemptionMode(opt.id)}
                      className={`py-2 text-[11px] rounded-lg font-semibold transition ${
                        redemptionMode === opt.id
                          ? 'bg-white text-rose-600 shadow-sm'
                          : 'text-gray-500 hover:text-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Amount / Units input */}
              {redemptionMode !== 'FULL' && selectedHolding && (
                <div>
                  {redemptionMode === 'PARTIAL_AMOUNT' ? (
                    <>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Redemption Amount (₹) *
                        <span className="text-gray-400 font-normal ml-1">
                          (max ₹{selectedHolding.currentValue.toLocaleString('en-IN')})
                        </span>
                      </label>
                      <input
                        type="number"
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(Number(e.target.value))}
                        min={100}
                        max={selectedHolding.currentValue}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-rose-400 focus:outline-none"
                      />
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {[5000, 10000, 25000, 50000].map((val) => (
                          <button
                            key={val}
                            onClick={() =>
                              setPartialAmount(Math.min(val, selectedHolding.currentValue))
                            }
                            className="text-[11px] bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-medium px-2 py-1 rounded border border-gray-300 shadow-sm transition"
                          >
                            ₹{val / 1000}k
                          </button>
                        ))}
                        <button
                          onClick={() => setPartialAmount(Math.round(selectedHolding.currentValue / 2))}
                          className="text-[11px] bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-medium px-2 py-1 rounded border border-gray-300 shadow-sm transition"
                        >
                          50%
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Number of Units *
                        <span className="text-gray-400 font-normal ml-1">
                          (max {selectedHolding.units.toFixed(3)} units)
                        </span>
                      </label>
                      <input
                        type="number"
                        value={partialUnits}
                        onChange={(e) => setPartialUnits(Number(e.target.value))}
                        min={0.001}
                        max={selectedHolding.units}
                        step={0.001}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-rose-400 focus:outline-none"
                      />
                    </>
                  )}
                </div>
              )}

              {/* 4. Redemption Summary */}
              {selectedHolding && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2.5 text-xs">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Redemption Summary
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Units to Redeem</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {redeemableUnits.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Redemption Value</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ₹{redeemableValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span className="flex items-center gap-1">
                      <span>
                        {isLongTerm ? 'Est. LTCG Tax' : 'Est. STCG Tax'}
                      </span>
                      <span className="text-[10px] text-gray-400">({taxInfo.rate}%)</span>
                    </span>
                    <span className="font-mono text-rose-600 font-semibold">
                      -₹{taxInfo.tax.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Est. Net Payout</span>
                    <span className="font-mono text-emerald-600">
                      ₹{netPayout.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {/* 5. Tax Notice */}
              <div
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-[11px] ${
                  isLongTerm
                    ? 'bg-blue-50/60 border-blue-100 text-blue-800'
                    : 'bg-amber-50/70 border-amber-200 text-amber-800'
                }`}
              >
                {isLongTerm ? (
                  <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                )}
                <div>
                  <strong>{isLongTerm ? 'LTCG (Budget 2024):' : 'STCG Alert:'}</strong>{' '}
                  {isLongTerm
                    ? 'Long-term equity gains above ₹1.25 Lakhs per FY are taxed at 12.5% (Finance Act 2024). Consider tax-harvesting within exemption limits.'
                    : 'Units held for less than 1 year attract Short-Term Capital Gains (STCG) tax at 20%. Holding longer may be more tax-efficient.'}
                </div>
              </div>

              {/* 6. Bank & Settlement */}
              <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-[11px] text-gray-600 space-x-1">
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs mb-1">
                    <Building className="w-3.5 h-3.5 text-gray-400" />
                    Proceeds Credit Details
                  </div>
                  <div className="flex justify-between">
                    <span>Credit to Bank:</span>
                    <span className="font-medium text-slate-800">
                      {client.bankDetails.bankName} ({client.bankDetails.maskedAccountNumber})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Settlement:
                    </span>
                    <span className="font-medium text-blue-700">T+3 Working Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Banknote className="w-3 h-3" /> NAV Applied:
                    </span>
                    <span className="font-medium text-slate-800">Same Day (if before 3 PM IST)</span>
                  </div>
                </div>
              </div>

              {/* 7. SEBI Risk Warning */}
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Redemption is subject to exit load (if applicable) and applicable taxes per
                  Finance Act 2024. Mutual Fund investments are subject to market risks.
                </span>
              </div>

              {/* 8. Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting || holdings.length === 0}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-xs py-3 rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting to BSE StAR MF...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownCircle className="w-4 h-4" />
                    <span>
                      Confirm Redemption (₹
                      {redeemableValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })})
                    </span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
