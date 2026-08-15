import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Upload,
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { FolioHolding } from '../types';

interface CasUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportHoldings: (imported: FolioHolding[]) => void;
  clientPan: string;
}

export const CasUploadModal: React.FC<CasUploadModalProps> = ({
  isOpen,
  onClose,
  onImportHoldings,
  clientPan,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState(clientPan || 'ABCPS1234K');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedFolios, setParsedFolios] = useState<FolioHolding[] | null>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSimulateParse = () => {
    setIsParsing(true);
    setTimeout(() => {
      setIsParsing(false);
      const mockImported: FolioHolding[] = [
        {
          id: 'cas-imp-1',
          clientId: 'cli-001',
          amcName: 'Tata Mutual Fund',
          amcLogoText: 'Tata',
          schemeName: 'Tata Digital India Fund - Regular Plan - Growth',
          category: 'EQUITY',
          subCategory: 'Sectoral / Thematic',
          folioNumber: '77491028/01',
          units: 1240.5,
          avgPurchaseNav: 38.2,
          currentNav: 52.4,
          navDate: '2026-08-14',
          investedAmount: 474000,
          currentValue: 650022,
          returnsAmount: 176022,
          returnsPercentage: 37.13,
          xirr: 20.4,
          isin: 'INF277K01585',
          riskometer: 'VERY_HIGH',
          sipLinked: true,
          sipAmount: 5000,
          nextSipDate: '2026-09-07',
        },
        {
          id: 'cas-imp-2',
          clientId: 'cli-001',
          amcName: 'Quant Mutual Fund',
          amcLogoText: 'Quant',
          schemeName: 'Quant Small Cap Fund - Regular Plan - Growth',
          category: 'EQUITY',
          subCategory: 'Small Cap',
          folioNumber: '33910294/19',
          units: 980.0,
          avgPurchaseNav: 170.0,
          currentNav: 245.8,
          navDate: '2026-08-14',
          investedAmount: 166600,
          currentValue: 240884,
          returnsAmount: 74284,
          returnsPercentage: 44.58,
          xirr: 28.2,
          isin: 'INF966L01AA3',
          riskometer: 'VERY_HIGH',
          sipLinked: false,
        },
      ];
      setParsedFolios(mockImported);
    }, 1200);
  };

  const handleConfirmMerge = () => {
    if (parsedFolios) {
      onImportHoldings(parsedFolios);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Import CAS (Consolidated Account Statement)</h3>
              <p className="text-[11px] text-gray-500">Supported: CAMS, KFintech, CDSL &amp; NSDL CAS PDFs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-slate-900 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!parsedFolios ? (
          <div className="space-y-4">
            {/* Drag and drop upload zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition bg-gray-50/50"
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-900">
                {selectedFile ? selectedFile.name : 'Drag and drop your CAS PDF file here, or browse'}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                e.g. CAMS_Detailed_CAS_2026.pdf (Max 10MB)
              </p>
              <input
                type="file"
                accept=".pdf,.csv,.xlsx"
                className="hidden"
                id="cas-file-input"
                onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
              />
              <label
                htmlFor="cas-file-input"
                className="mt-3 inline-block bg-white hover:bg-gray-50 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer border border-gray-300 shadow-xs"
              >
                Select File
              </label>
            </div>

            {/* Password input */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                PDF Password (Typically Investor's PAN in UPPERCASE)
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCPS1234K"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 font-mono uppercase focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSimulateParse}
              disabled={isParsing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              {isParsing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Decrypting &amp; Parsing CAS Folios...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Unlock &amp; Extract Mutual Fund Folios</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Extracted {parsedFolios.length} Active Folios from CAS statement!</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {parsedFolios.map((f) => (
                <div
                  key={f.id}
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{f.schemeName}</div>
                    <div className="text-[11px] text-gray-500">
                      Folio: <span className="font-mono text-slate-700">{f.folioNumber}</span> • Units: {f.units}
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-blue-600">
                    ₹{f.currentValue.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => setParsedFolios(null)}
                className="text-xs text-gray-500 hover:text-slate-900 px-3 py-2 font-medium"
              >
                Upload Different File
              </button>
              <button
                onClick={handleConfirmMerge}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs transition"
              >
                Merge into Client Portfolio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
