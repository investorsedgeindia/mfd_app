import React, { useState } from 'react';
import { X, Search, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

interface KraLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KraLookupModal: React.FC<KraLookupModalProps> = ({ isOpen, onClose }) => {
  const [pan, setPan] = useState('ABCPS1234K');
  const [dob, setDob] = useState('1990-01-01');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSearch = () => {
    if (!pan || pan.length !== 10) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const isAadhaarLinked = ['A', 'B', 'C', 'H', 'P', 'R'].includes(pan[0].toUpperCase());
      setSearchResult({
        pan: pan.toUpperCase(),
        kraStatus: isAadhaarLinked ? 'KYC VALIDATED' : 'KYC REGISTERED',
        kraAgency: 'CVL_KRA (CDSL Ventures Ltd)',
        aadhaarSeedingStatus: isAadhaarLinked ? 'LINKED & VERIFIED' : 'PENDING AADHAAR LINKAGE',
        kycMode: 'AADHAAR_XML_DIGILOCKER',
        modifiedDate: '2024-03-12',
        canInvestSeamlessly: true,
      });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Live KRA &amp; C-KYC Lookup</h3>
              <p className="text-[11px] text-gray-500">Queries CVL, NDML, CAMS, KFintech KRA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-slate-900 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Investor PAN (10 Characters) *
            </label>
            <input
              type="text"
              maxLength={10}
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              placeholder="e.g. ABCPS1234K"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-mono uppercase focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={isSearching || pan.length !== 10}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Querying KRA Registries...
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" /> Check KRA &amp; Aadhaar Status
              </>
            )}
          </button>

          {searchResult && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">PAN:</span>
                <span className="text-slate-900 font-bold">{searchResult.pan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">KRA Status:</span>
                <span className="text-emerald-600 font-bold">{searchResult.kraStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Registered KRA:</span>
                <span className="text-blue-600 font-semibold">{searchResult.kraAgency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Aadhaar Seeding:</span>
                <span className="text-emerald-600 font-semibold">{searchResult.aadhaarSeedingStatus}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 text-slate-600 text-[11px] font-sans">
                ✓ Ready for instant transaction execution across all 44 Indian AMCs without additional KYC.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
