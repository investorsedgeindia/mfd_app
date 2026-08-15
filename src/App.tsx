import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { InvestorDashboard } from './components/InvestorDashboard';
import { ClientOnboarding } from './components/ClientOnboarding';
import { DistributorHub } from './components/DistributorHub';
import { SipCalculators } from './components/SipCalculators';
import { CasUploadModal } from './components/CasUploadModal';
import { TransactModal } from './components/TransactModal';
import { ProposalModal } from './components/ProposalModal';
import { KraLookupModal } from './components/KraLookupModal';
import {
  INITIAL_DISTRIBUTOR,
  SAMPLE_CLIENTS,
  SAMPLE_HOLDINGS,
  SAMPLE_SIPS,
  SAMPLE_TRANSACTIONS,
} from './data/sampleData';
import { ClientProfile, FolioHolding, SIPSchedule, TransactionRecord } from './types';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'investor' | 'onboarding' | 'distributor' | 'calculators'
  >('investor');

  const [distributor, setDistributor] = useState(INITIAL_DISTRIBUTOR);
  const [clients, setClients] = useState<ClientProfile[]>(SAMPLE_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string>('cli-001');

  const [holdingsState, setHoldingsState] =
    useState<Record<string, FolioHolding[]>>(SAMPLE_HOLDINGS);
  const [sipsState, setSipsState] = useState<Record<string, SIPSchedule[]>>(SAMPLE_SIPS);
  const [transactionsState, setTransactionsState] =
    useState<Record<string, TransactionRecord[]>>(SAMPLE_TRANSACTIONS);

  // Modals state
  const [isKraLookupOpen, setIsKraLookupOpen] = useState(false);
  const [isCasUploadOpen, setIsCasUploadOpen] = useState(false);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [isTransactOpen, setIsTransactOpen] = useState(false);

  const currentClient =
    clients.find((c) => c.id === selectedClientId) || clients[0];
  const currentHoldings = holdingsState[selectedClientId] || [];
  const currentSips = sipsState[selectedClientId] || [];
  const currentTransactions = transactionsState[selectedClientId] || [];

  // Handlers
  const handleClientCreated = (newClient: ClientProfile) => {
    setClients((prev) => [newClient, ...prev]);
    setSelectedClientId(newClient.id);
    setHoldingsState((prev) => ({ ...prev, [newClient.id]: [] }));
    setSipsState((prev) => ({ ...prev, [newClient.id]: [] }));
    setTransactionsState((prev) => ({ ...prev, [newClient.id]: [] }));
  };

  const handleImportCasHoldings = (imported: FolioHolding[]) => {
    setHoldingsState((prev) => {
      const existing = prev[selectedClientId] || [];
      return {
        ...prev,
        [selectedClientId]: [...existing, ...imported],
      };
    });
  };

  const handleTransactionSuccess = (
    newHolding: FolioHolding,
    newSip?: SIPSchedule,
    newTx?: TransactionRecord
  ) => {
    setHoldingsState((prev) => {
      const existing = prev[selectedClientId] || [];
      return {
        ...prev,
        [selectedClientId]: [newHolding, ...existing],
      };
    });

    if (newSip) {
      setSipsState((prev) => {
        const existing = prev[selectedClientId] || [];
        return {
          ...prev,
          [selectedClientId]: [newSip, ...existing],
        };
      });
    }

    if (newTx) {
      setTransactionsState((prev) => {
        const existing = prev[selectedClientId] || [];
        return {
          ...prev,
          [selectedClientId]: [newTx, ...existing],
        };
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        distributor={distributor}
        clients={clients}
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        onOpenKraLookup={() => setIsKraLookupOpen(true)}
        onOpenCasUpload={() => setIsCasUploadOpen(true)}
        onOpenProposal={() => setIsProposalOpen(true)}
        onOpenTransact={() => setIsTransactOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'investor' && (
          <InvestorDashboard
            client={currentClient}
            holdings={currentHoldings}
            sips={currentSips}
            transactions={currentTransactions}
            onOpenTransact={() => setIsTransactOpen(true)}
            onOpenCasUpload={() => setIsCasUploadOpen(true)}
            onOpenProposal={() => setIsProposalOpen(true)}
          />
        )}

        {activeTab === 'onboarding' && (
          <ClientOnboarding
            onClientCreated={handleClientCreated}
            onGoToInvestorView={(clientId) => {
              setSelectedClientId(clientId);
              setActiveTab('investor');
            }}
          />
        )}

        {activeTab === 'distributor' && (
          <DistributorHub
            distributor={distributor}
            clients={clients}
            onSelectClient={(clientId) => {
              setSelectedClientId(clientId);
              setActiveTab('investor');
            }}
            onOpenOnboarding={() => setActiveTab('onboarding')}
            onOpenCasUpload={() => setIsCasUploadOpen(true)}
          />
        )}

        {activeTab === 'calculators' && <SipCalculators />}
      </main>

      {/* Modals */}
      <CasUploadModal
        isOpen={isCasUploadOpen}
        onClose={() => setIsCasUploadOpen(false)}
        onImportHoldings={handleImportCasHoldings}
        clientPan={currentClient.pan}
      />

      <TransactModal
        isOpen={isTransactOpen}
        onClose={() => setIsTransactOpen(false)}
        client={currentClient}
        onTransactionSuccess={handleTransactionSuccess}
      />

      <ProposalModal
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
        client={currentClient}
        distributor={distributor}
        holdings={currentHoldings}
      />

      <KraLookupModal
        isOpen={isKraLookupOpen}
        onClose={() => setIsKraLookupOpen(false)}
      />

      {/* Clean Minimal Footer */}
      <footer className="bg-white border-t border-gray-200 text-xs text-gray-500 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>{distributor.firmName}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">ARN: <strong className="text-slate-900 font-mono">{distributor.arn}</strong></span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">EUIN: <strong className="text-slate-900 font-mono">{distributor.euin}</strong></span>
            </div>
            <p className="text-[11px] text-gray-500 max-w-2xl leading-normal">
              Statutory Disclaimer: Mutual Fund investments are subject to market risks, read all scheme related documents carefully.
              This platform provides execution, portfolio analytics, and digital KYC facilities for registered clients under AMFI regulations.
            </p>
          </div>

          <div className="text-[11px] text-gray-500 text-right">
            <div>Exchange Routing: <strong className="text-slate-700">BSE StAR MF / NSE NMF II</strong></div>
            <div className="text-blue-600 font-medium mt-0.5">SEBI &amp; AMFI Compliant Digital Architecture</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
