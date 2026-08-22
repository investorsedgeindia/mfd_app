import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthPortal } from './components/AuthPortal';
import { InvestorDashboard } from './components/InvestorDashboard';
import { ClientOnboarding } from './components/ClientOnboarding';
import { DistributorHub } from './components/DistributorHub';
import { SipCalculators } from './components/SipCalculators';
import { CasUploadModal } from './components/CasUploadModal';
import { TransactModal } from './components/TransactModal';
import { RedeemModal } from './components/RedeemModal';
import { ProposalModal } from './components/ProposalModal';
import { KraLookupModal } from './components/KraLookupModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import {
  INITIAL_DISTRIBUTOR,
  SAMPLE_CLIENTS,
  SAMPLE_HOLDINGS,
  SAMPLE_SIPS,
  SAMPLE_TRANSACTIONS,
} from './data/sampleData';
import {
  AuthSession,
  ClientProfile,
  FolioHolding,
  SIPSchedule,
  SupabaseConfigStatus,
  TransactionRecord,
} from './types';
import { getStoredSession, saveStoredSession } from './services/authService';
import {
  fetchClients,
  fetchDistributorDetails,
  fetchHoldings,
  fetchSips,
  fetchTransactions,
  saveHolding,
} from './services/supabaseService';
import { checkSupabaseConnection, getSupabaseConfig } from './lib/supabaseClient';
import { ShieldCheck, Lock } from 'lucide-react';

export default function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(() =>
    getStoredSession()
  );

  const [activeTab, setActiveTab] = useState<
    'investor' | 'onboarding' | 'distributor' | 'calculators'
  >('investor');

  const [distributor, setDistributor] = useState(INITIAL_DISTRIBUTOR);
  const [clients, setClients] = useState<ClientProfile[]>(SAMPLE_CLIENTS);

  // If logged in as client, default to their own clientId
  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    const initialSession = getStoredSession();
    if (initialSession?.user.role === 'client' && initialSession.user.clientId) {
      return initialSession.user.clientId;
    }
    return 'cli-001';
  });

  // Supabase Connection Status State
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseConfigStatus>(() =>
    getSupabaseConfig()
  );

  // Sync selectedClientId when authSession changes
  useEffect(() => {
    if (authSession?.user.role === 'client' && authSession.user.clientId) {
      setSelectedClientId(authSession.user.clientId);
    }
  }, [authSession]);

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
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Load live data from Supabase (or local cache) on mount
  useEffect(() => {
    let isMounted = true;

    async function initializeDatabaseData() {
      try {
        // 1. Check Supabase connection
        const connStatus = await checkSupabaseConnection();
        if (isMounted) setSupabaseStatus(connStatus);

        // 2. Fetch clients
        const fetchedClients = await fetchClients();
        if (isMounted && fetchedClients.length > 0) {
          setClients(fetchedClients);
        }

        // 3. Fetch distributor details
        const dist = await fetchDistributorDetails();
        if (isMounted && dist) {
          setDistributor(dist);
        }
      } catch (err) {
        console.warn('Initial Supabase sync notice:', err);
      }
    }

    initializeDatabaseData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch holdings, SIPs, and transactions when selectedClientId changes
  useEffect(() => {
    let isMounted = true;

    async function loadClientPortfolio() {
      if (!selectedClientId) return;
      try {
        const [clientHoldings, clientSips, clientTxs] = await Promise.all([
          fetchHoldings(selectedClientId),
          fetchSips(selectedClientId),
          fetchTransactions(selectedClientId),
        ]);

        if (isMounted) {
          setHoldingsState((prev) => ({
            ...prev,
            [selectedClientId]: clientHoldings,
          }));
          setSipsState((prev) => ({
            ...prev,
            [selectedClientId]: clientSips,
          }));
          setTransactionsState((prev) => ({
            ...prev,
            [selectedClientId]: clientTxs,
          }));
        }
      } catch (err) {
        console.warn('Portfolio load note for client:', selectedClientId, err);
      }
    }

    loadClientPortfolio();
    return () => {
      isMounted = false;
    };
  }, [selectedClientId]);

  const currentClient =
    clients.find((c) => c.id === selectedClientId) || clients[0];
  const currentHoldings = holdingsState[selectedClientId] || [];
  const currentSips = sipsState[selectedClientId] || [];
  const currentTransactions = transactionsState[selectedClientId] || [];

  // Handlers
  const handleLoginSuccess = (session: AuthSession, newClientCreated?: ClientProfile) => {
    if (newClientCreated) {
      setClients((prev) => [newClientCreated, ...prev]);
      setHoldingsState((prev) => ({ ...prev, [newClientCreated.id]: [] }));
      setSipsState((prev) => ({ ...prev, [newClientCreated.id]: [] }));
      setTransactionsState((prev) => ({ ...prev, [newClientCreated.id]: [] }));
      setSelectedClientId(newClientCreated.id);
    } else if (session.user.role === 'client' && session.user.clientId) {
      setSelectedClientId(session.user.clientId);
    }
    setAuthSession(session);
    setActiveTab('investor');
  };

  const handleLogout = () => {
    saveStoredSession(null);
    setAuthSession(null);
  };

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
      const updated = [...existing, ...imported];
      return {
        ...prev,
        [selectedClientId]: updated,
      };
    });

    // Asynchronously save imported holdings to Supabase
    imported.forEach((h) => {
      saveHolding(h).catch((err) => console.warn('Supabase CAS holding save note:', err));
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

  const handleRedemptionSuccess = (
    updatedHolding: FolioHolding | null,
    newTx: TransactionRecord
  ) => {
    setHoldingsState((prev) => {
      const existing = prev[selectedClientId] || [];
      let updated: FolioHolding[];
      if (updatedHolding === null) {
        // Full redemption — remove the holding that was redeemed
        updated = existing.filter((h) => h.id !== newTx.folioNumber &&
          // fallback: remove by matching folioNumber
          !(h.folioNumber === newTx.folioNumber)
        );
      } else {
        // Partial — replace with updated holding
        updated = existing.map((h) =>
          h.folioNumber === updatedHolding.folioNumber ? updatedHolding : h
        );
      }
      return { ...prev, [selectedClientId]: updated };
    });

    setTransactionsState((prev) => {
      const existing = prev[selectedClientId] || [];
      return { ...prev, [selectedClientId]: [newTx, ...existing] };
    });
  };

  // If user is not authenticated, show the secure Client & Distributor Login Portal
  if (!authSession) {
    return (
      <div className="min-h-screen bg-gray-50 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Simple Regulatory Header */}
        <header className="bg-slate-900 px-4 py-2 text-xs text-slate-300 border-b border-slate-800 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> AMFI Registered MFD
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>BSE StAR MF &amp; NSE NMF II Gateway</span>
              </div>
            </div>
          </div>
        </header>

        {/* Auth Portal View */}
        <main className="flex-1 flex items-center justify-center">
          <AuthPortal
            distributor={distributor}
            clients={clients}
            onLoginSuccess={handleLoginSuccess}
          />
        </main>

        {/* Clean Footer */}
        <footer className="bg-white border-t border-gray-200 text-xs text-gray-500 py-4 text-center">
          <p className="text-[11px] max-w-2xl mx-auto text-gray-500">
            SEBI &amp; AMFI Regulated Mutual Fund Distribution Portal
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Main Navbar with Session Info & Logout */}
      <Navbar
        session={authSession}
        onLogout={handleLogout}
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
        onOpenRedeem={() => setIsRedeemOpen(true)}
        onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
        supabaseStatus={supabaseStatus}
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
            onOpenRedeem={() => setIsRedeemOpen(true)}
            isClient={authSession.user.role === 'client'}
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

        {activeTab === 'distributor' && authSession.user.role === 'distributor' && (
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
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

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

      <RedeemModal
        isOpen={isRedeemOpen}
        onClose={() => setIsRedeemOpen(false)}
        client={currentClient}
        holdings={currentHoldings}
        onRedemptionSuccess={handleRedemptionSuccess}
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
              <span className="text-gray-600">
                ARN: <strong className="text-slate-900 font-mono">{distributor.arn}</strong>
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">
                EUIN: <strong className="text-slate-900 font-mono">{distributor.euin}</strong>
              </span>
            </div>
            <p className="text-[11px] text-gray-500 max-w-2xl leading-normal">
              Statutory Disclaimer: Mutual Fund investments are subject to market risks, read all scheme related documents carefully.
              This platform provides execution, portfolio analytics, and digital KYC facilities for registered clients under AMFI regulations.
            </p>
          </div>

          <div className="text-[11px] text-gray-500 text-right">
            <div>
              Exchange Routing: <strong className="text-slate-700">BSE StAR MF / NSE NMF II</strong>
            </div>
            <div className="text-blue-600 font-medium mt-0.5">
              SEBI &amp; AMFI Compliant Digital Architecture
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
