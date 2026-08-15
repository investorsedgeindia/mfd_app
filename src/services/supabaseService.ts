import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  BankDetails,
  ClientProfile,
  DistributorDetails,
  FolioHolding,
  InvestorGoal,
  NomineeDetails,
  SIPSchedule,
  TransactionRecord,
  UserAccount,
} from '../types';
import {
  INITIAL_DISTRIBUTOR,
  SAMPLE_CLIENTS,
  SAMPLE_HOLDINGS,
  SAMPLE_SIPS,
  SAMPLE_TRANSACTIONS,
} from '../data/sampleData';

// Local storage fallback cache keys
const CACHE_KEY_CLIENTS = 'mfd_supabase_cache_clients_v1';
const CACHE_KEY_HOLDINGS = 'mfd_supabase_cache_holdings_v1';
const CACHE_KEY_SIPS = 'mfd_supabase_cache_sips_v1';
const CACHE_KEY_TXS = 'mfd_supabase_cache_txs_v1';
const CACHE_KEY_GOALS = 'mfd_supabase_cache_goals_v1';
const CACHE_KEY_DISTRIBUTOR = 'mfd_supabase_cache_distributor_v1';

// Initial Demo Goals
export const INITIAL_GOALS: Record<string, InvestorGoal[]> = {
  'cli-001': [
    {
      id: 'goal-001',
      clientId: 'cli-001',
      goalName: 'Retirement Corpus @ 55',
      targetAmount: 50000000,
      targetDate: '2043-06-14',
      currentAccumulated: 3385000,
      monthlySipAllocated: 35000,
      category: 'RETIREMENT',
    },
    {
      id: 'goal-002',
      clientId: 'cli-001',
      goalName: 'Child Higher Education Abroad',
      targetAmount: 15000000,
      targetDate: '2036-05-01',
      currentAccumulated: 1200000,
      monthlySipAllocated: 10000,
      category: 'CHILD_EDUCATION',
    },
  ],
  'cli-002': [
    {
      id: 'goal-101',
      clientId: 'cli-002',
      goalName: 'Dream Home Downpayment',
      targetAmount: 4000000,
      targetDate: '2028-12-31',
      currentAccumulated: 1420000,
      monthlySipAllocated: 25000,
      category: 'HOME_PURCHASE',
    },
  ],
};

// ==============================================================================
// 1. CLIENT PROFILES (Master, Bank, Nominees)
// ==============================================================================

export async function fetchClients(): Promise<ClientProfile[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: dbClients, error: clientsErr } = await supabase
        .from('client_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientsErr) throw clientsErr;

      if (dbClients && dbClients.length > 0) {
        // Fetch banks and nominees in parallel
        const { data: dbBanks } = await supabase.from('client_bank_accounts').select('*');
        const { data: dbNominees } = await supabase.from('client_nominees').select('*');

        const mappedClients: ClientProfile[] = dbClients.map((row: any) => {
          const bankRow = dbBanks?.find((b: any) => b.client_id === row.id);
          const clientNominees = (dbNominees || [])
            .filter((n: any) => n.client_id === row.id)
            .map((n: any) => ({
              name: n.nominee_name,
              relation: n.relation,
              dateOfBirth: n.date_of_birth,
              sharePercentage: Number(n.share_percentage || 100),
              isMinor: Boolean(n.is_minor),
              guardianName: n.guardian_name,
            }));

          const bankDetails: BankDetails = bankRow
            ? {
                bankName: bankRow.bank_name,
                accountNumber: bankRow.account_number,
                maskedAccountNumber: bankRow.masked_account_number,
                ifscCode: bankRow.ifsc_code,
                accountType: bankRow.account_type || 'SAVINGS',
                branchName: bankRow.branch_name || 'Main Branch',
                verifiedName: bankRow.verified_name || row.name,
                pennyDropSuccess: Boolean(bankRow.penny_drop_success),
                pennyDropRefId: bankRow.penny_drop_ref_id,
                mandateApproved: Boolean(bankRow.mandate_approved),
              }
            : {
                bankName: 'HDFC Bank Ltd',
                accountNumber: '50100492819201',
                maskedAccountNumber: '••••••••9201',
                ifscCode: 'HDFC0000240',
                accountType: 'SAVINGS',
                branchName: 'Mumbai Main',
                verifiedName: row.name,
                pennyDropSuccess: true,
                mandateApproved: true,
              };

          return {
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            pan: row.pan,
            dateOfBirth: row.date_of_birth,
            gender: row.gender || 'MALE',
            city: row.city || 'Mumbai',
            state: row.state || 'Maharashtra',
            pincode: row.pincode || '400001',
            kycStatus: row.kyc_status || 'VALIDATED',
            kraAgency: row.kra_agency || 'CVL_KRA',
            aadhaarLast4: row.aadhaar_last4 || '0000',
            digilockerVerified: Boolean(row.digilocker_verified),
            bankDetails,
            nominees: clientNominees.length > 0 ? clientNominees : [
              {
                name: 'Family Nominee',
                relation: 'Spouse',
                dateOfBirth: '1992-01-01',
                sharePercentage: 100,
                isMinor: false,
              },
            ],
            riskProfile: row.risk_profile || 'MODERATE',
            uccBse: row.ucc_bse,
            uccNse: row.ucc_nse,
            fatcaTaxResidentIndia: Boolean(row.fatca_tax_resident_india),
            pepStatus: Boolean(row.pep_status),
            joinedDate: row.joined_date || new Date().toISOString().split('T')[0],
            totalInvested: Number(row.total_invested || 0),
            currentValue: Number(row.current_value || 0),
            absoluteReturn: Number(row.absolute_return || 0),
            xirr: Number(row.xirr || 0),
            activeSipMonthly: Number(row.active_sip_monthly || 0),
            avatarUrl: row.avatar_url,
          };
        });

        localStorage.setItem(CACHE_KEY_CLIENTS, JSON.stringify(mappedClients));
        return mappedClients;
      }
    } catch (err) {
      console.warn('Supabase fetchClients failed, using local cache:', err);
    }
  }

  // Fallback to local storage or SAMPLE_CLIENTS
  try {
    const cached = localStorage.getItem(CACHE_KEY_CLIENTS);
    if (cached) return JSON.parse(cached);
  } catch {}
  return SAMPLE_CLIENTS;
}

export async function saveClientProfile(client: ClientProfile): Promise<{ success: boolean; error?: string }> {
  // Update local cache immediately
  try {
    const cached = localStorage.getItem(CACHE_KEY_CLIENTS);
    const clientsList: ClientProfile[] = cached ? JSON.parse(cached) : SAMPLE_CLIENTS;
    const idx = clientsList.findIndex((c) => c.id === client.id || c.pan === client.pan);
    if (idx >= 0) {
      clientsList[idx] = client;
    } else {
      clientsList.unshift(client);
    }
    localStorage.setItem(CACHE_KEY_CLIENTS, JSON.stringify(clientsList));
  } catch (err) {
    console.error('Failed to update local client cache:', err);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Upsert Client Profile
      const { error: profileErr } = await supabase.from('client_profiles').upsert(
        {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          pan: client.pan,
          date_of_birth: client.dateOfBirth,
          gender: client.gender,
          city: client.city,
          state: client.state,
          pincode: client.pincode,
          kyc_status: client.kycStatus,
          kra_agency: client.kraAgency,
          aadhaar_last4: client.aadhaarLast4,
          digilocker_verified: client.digilockerVerified,
          risk_profile: client.riskProfile,
          ucc_bse: client.uccBse,
          ucc_nse: client.uccNse,
          fatca_tax_resident_india: client.fatcaTaxResidentIndia,
          pep_status: client.pepStatus,
          joined_date: client.joinedDate,
          total_invested: client.totalInvested,
          current_value: client.currentValue,
          absolute_return: client.absoluteReturn,
          xirr: client.xirr,
          active_sip_monthly: client.activeSipMonthly,
        },
        { onConflict: 'id' }
      );

      if (profileErr) throw profileErr;

      // 2. Upsert Bank Details
      if (client.bankDetails) {
        await supabase.from('client_bank_accounts').upsert(
          {
            id: `bank-${client.id}`,
            client_id: client.id,
            bank_name: client.bankDetails.bankName,
            account_number: client.bankDetails.accountNumber,
            masked_account_number: client.bankDetails.maskedAccountNumber,
            ifsc_code: client.bankDetails.ifscCode,
            account_type: client.bankDetails.accountType,
            branch_name: client.bankDetails.branchName,
            verified_name: client.bankDetails.verifiedName,
            penny_drop_success: client.bankDetails.pennyDropSuccess,
            penny_drop_ref_id: client.bankDetails.pennyDropRefId,
            mandate_approved: client.bankDetails.mandateApproved,
            is_primary: true,
          },
          { onConflict: 'id' }
        );
      }

      // 3. Upsert Nominees
      if (client.nominees && client.nominees.length > 0) {
        for (let i = 0; i < client.nominees.length; i++) {
          const nominee = client.nominees[i];
          await supabase.from('client_nominees').upsert(
            {
              id: `nom-${client.id}-${i}`,
              client_id: client.id,
              nominee_name: nominee.name,
              relation: nominee.relation,
              date_of_birth: nominee.dateOfBirth,
              share_percentage: nominee.sharePercentage,
              is_minor: nominee.isMinor,
              guardian_name: nominee.guardianName,
            },
            { onConflict: 'id' }
          );
        }
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Failed to upsert client in Supabase:', err);
      return { success: false, error: err?.message || 'Database error' };
    }
  }

  return { success: true };
}

// ==============================================================================
// 2. FOLIO HOLDINGS
// ==============================================================================

export async function fetchHoldings(clientId: string): Promise<FolioHolding[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('folio_holdings')
        .select('*')
        .eq('client_id', clientId)
        .order('current_value', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          clientId: row.client_id,
          amcName: row.amc_name,
          amcLogoText: row.amc_logo_text || row.amc_name.split(' ')[0],
          schemeName: row.scheme_name,
          category: row.category,
          subCategory: row.sub_category,
          folioNumber: row.folio_number,
          units: Number(row.units),
          avgPurchaseNav: Number(row.avg_purchase_nav),
          currentNav: Number(row.current_nav),
          navDate: row.nav_date,
          investedAmount: Number(row.invested_amount),
          currentValue: Number(row.current_value),
          returnsAmount: Number(row.returns_amount),
          returnsPercentage: Number(row.returns_percentage),
          xirr: Number(row.xirr),
          isin: row.isin,
          riskometer: row.riskometer,
          sipLinked: Boolean(row.sip_linked),
          sipAmount: row.sip_amount ? Number(row.sip_amount) : undefined,
          nextSipDate: row.next_sip_date,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetchHoldings failed, falling back to local state:', err);
    }
  }

  // Local fallback
  try {
    const cached = localStorage.getItem(CACHE_KEY_HOLDINGS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed[clientId]) return parsed[clientId];
    }
  } catch {}

  return SAMPLE_HOLDINGS[clientId] || [];
}

export async function saveHolding(holding: FolioHolding): Promise<{ success: boolean }> {
  // Update local cache
  try {
    const cached = localStorage.getItem(CACHE_KEY_HOLDINGS);
    const map = cached ? JSON.parse(cached) : { ...SAMPLE_HOLDINGS };
    const list = map[holding.clientId] || [];
    map[holding.clientId] = [holding, ...list.filter((h: FolioHolding) => h.id !== holding.id)];
    localStorage.setItem(CACHE_KEY_HOLDINGS, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to cache holding locally:', err);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('folio_holdings').upsert(
        {
          id: holding.id,
          client_id: holding.clientId,
          amc_name: holding.amcName,
          amc_logo_text: holding.amcLogoText,
          scheme_name: holding.schemeName,
          category: holding.category,
          sub_category: holding.subCategory,
          folio_number: holding.folioNumber,
          units: holding.units,
          avg_purchase_nav: holding.avgPurchaseNav,
          current_nav: holding.currentNav,
          nav_date: holding.navDate,
          invested_amount: holding.investedAmount,
          current_value: holding.currentValue,
          returns_amount: holding.returnsAmount,
          returns_percentage: holding.returnsPercentage,
          xirr: holding.xirr,
          isin: holding.isin,
          riskometer: holding.riskometer,
          sip_linked: holding.sipLinked,
          sip_amount: holding.sipAmount,
          next_sip_date: holding.nextSipDate,
        },
        { onConflict: 'id' }
      );
    } catch (err) {
      console.warn('Failed to save holding to Supabase:', err);
    }
  }

  return { success: true };
}

// ==============================================================================
// 3. SIP SCHEDULES
// ==============================================================================

export async function fetchSips(clientId: string): Promise<SIPSchedule[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('sip_schedules')
        .select('*')
        .eq('client_id', clientId)
        .order('amount', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          clientId: row.client_id,
          schemeName: row.scheme_name,
          amcName: row.amc_name,
          folioNumber: row.folio_number,
          amount: Number(row.amount),
          frequency: row.frequency,
          sipDay: Number(row.sip_day),
          nextDebitDate: row.next_debit_date,
          startDate: row.start_date,
          mandateType: row.mandate_type,
          mandateRef: row.mandate_ref,
          status: row.status,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetchSips failed, falling back to local state:', err);
    }
  }

  // Local fallback
  try {
    const cached = localStorage.getItem(CACHE_KEY_SIPS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed[clientId]) return parsed[clientId];
    }
  } catch {}

  return SAMPLE_SIPS[clientId] || [];
}

export async function saveSipSchedule(sip: SIPSchedule): Promise<{ success: boolean }> {
  // Update local cache
  try {
    const cached = localStorage.getItem(CACHE_KEY_SIPS);
    const map = cached ? JSON.parse(cached) : { ...SAMPLE_SIPS };
    const list = map[sip.clientId] || [];
    map[sip.clientId] = [sip, ...list.filter((s: SIPSchedule) => s.id !== sip.id)];
    localStorage.setItem(CACHE_KEY_SIPS, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to cache SIP locally:', err);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('sip_schedules').upsert(
        {
          id: sip.id,
          client_id: sip.clientId,
          scheme_name: sip.schemeName,
          amc_name: sip.amcName,
          folio_number: sip.folioNumber,
          amount: sip.amount,
          frequency: sip.frequency,
          sip_day: sip.sipDay,
          next_debit_date: sip.nextDebitDate,
          start_date: sip.startDate,
          mandate_type: sip.mandateType,
          mandate_ref: sip.mandateRef,
          status: sip.status,
        },
        { onConflict: 'id' }
      );
    } catch (err) {
      console.warn('Failed to save SIP to Supabase:', err);
    }
  }

  return { success: true };
}

// ==============================================================================
// 4. TRANSACTIONS
// ==============================================================================

export async function fetchTransactions(clientId: string): Promise<TransactionRecord[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          clientId: row.client_id,
          date: row.date,
          schemeName: row.scheme_name,
          amcName: row.amc_name,
          folioNumber: row.folio_number,
          type: row.type,
          amount: Number(row.amount),
          units: Number(row.units),
          nav: Number(row.nav),
          status: row.status,
          orderReference: row.order_reference,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetchTransactions failed, using local state:', err);
    }
  }

  // Local fallback
  try {
    const cached = localStorage.getItem(CACHE_KEY_TXS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed[clientId]) return parsed[clientId];
    }
  } catch {}

  return SAMPLE_TRANSACTIONS[clientId] || [];
}

export async function saveTransaction(tx: TransactionRecord): Promise<{ success: boolean }> {
  // Update local cache
  try {
    const cached = localStorage.getItem(CACHE_KEY_TXS);
    const map = cached ? JSON.parse(cached) : { ...SAMPLE_TRANSACTIONS };
    const list = map[tx.clientId] || [];
    map[tx.clientId] = [tx, ...list.filter((t: TransactionRecord) => t.id !== tx.id)];
    localStorage.setItem(CACHE_KEY_TXS, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to cache tx locally:', err);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('transactions').upsert(
        {
          id: tx.id,
          client_id: tx.clientId,
          date: tx.date,
          scheme_name: tx.schemeName,
          amc_name: tx.amcName,
          folio_number: tx.folioNumber,
          type: tx.type,
          amount: tx.amount,
          units: tx.units,
          nav: tx.nav,
          status: tx.status,
          order_reference: tx.orderReference,
        },
        { onConflict: 'id' }
      );
    } catch (err) {
      console.warn('Failed to record transaction in Supabase:', err);
    }
  }

  return { success: true };
}

// ==============================================================================
// 5. INVESTOR GOALS
// ==============================================================================

export async function fetchGoals(clientId: string): Promise<InvestorGoal[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('investor_goals')
        .select('*')
        .eq('client_id', clientId)
        .order('target_amount', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          clientId: row.client_id,
          goalName: row.goal_name,
          targetAmount: Number(row.target_amount),
          targetDate: row.target_date,
          currentAccumulated: Number(row.current_accumulated || 0),
          monthlySipAllocated: row.monthly_sip_allocated ? Number(row.monthly_sip_allocated) : undefined,
          category: row.category || 'WEALTH_CREATION',
        }));
      }
    } catch (err) {
      console.warn('Supabase fetchGoals failed, using local goals:', err);
    }
  }

  // Local fallback
  try {
    const cached = localStorage.getItem(CACHE_KEY_GOALS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed[clientId]) return parsed[clientId];
    }
  } catch {}

  return INITIAL_GOALS[clientId] || [];
}

export async function saveGoal(goal: InvestorGoal): Promise<{ success: boolean }> {
  try {
    const cached = localStorage.getItem(CACHE_KEY_GOALS);
    const map = cached ? JSON.parse(cached) : { ...INITIAL_GOALS };
    const list = map[goal.clientId] || [];
    map[goal.clientId] = [goal, ...list.filter((g: InvestorGoal) => g.id !== goal.id)];
    localStorage.setItem(CACHE_KEY_GOALS, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to cache goal locally:', err);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('investor_goals').upsert(
        {
          id: goal.id,
          client_id: goal.clientId,
          goal_name: goal.goalName,
          target_amount: goal.targetAmount,
          target_date: goal.targetDate,
          current_accumulated: goal.currentAccumulated,
          monthly_sip_allocated: goal.monthlySipAllocated,
          category: goal.category,
        },
        { onConflict: 'id' }
      );
    } catch (err) {
      console.warn('Failed to save goal to Supabase:', err);
    }
  }

  return { success: true };
}

// ==============================================================================
// 6. DISTRIBUTOR DETAILS
// ==============================================================================

export async function fetchDistributorDetails(arn = 'ARN-198420'): Promise<DistributorDetails> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('distributor_profiles')
        .select('*')
        .eq('arn', arn)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        return {
          arn: data.arn,
          euin: data.euin,
          distributorName: data.distributor_name,
          firmName: data.firm_name,
          email: data.email,
          mobile: data.mobile,
          officeCity: data.office_city,
          bseMemberCode: data.bse_member_code || 'BSE-MFD-94821',
          nseMemberCode: data.nse_member_code || 'NSE-NMF-51209',
          camsAgentCode: data.cams_agent_code || 'CAM-884210',
          kfinAgentCode: data.kfin_agent_code || 'KFN-339180',
          totalAum: Number(data.total_aum || INITIAL_DISTRIBUTOR.totalAum),
          totalInvestors: Number(data.total_investors || INITIAL_DISTRIBUTOR.totalInvestors),
          monthlySipBook: Number(data.monthly_sip_book || INITIAL_DISTRIBUTOR.monthlySipBook),
        };
      }
    } catch (err) {
      console.warn('Supabase fetchDistributorDetails failed:', err);
    }
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY_DISTRIBUTOR);
    if (cached) return JSON.parse(cached);
  } catch {}

  return INITIAL_DISTRIBUTOR;
}
