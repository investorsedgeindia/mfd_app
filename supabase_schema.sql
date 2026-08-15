-- ==============================================================================
-- INVESTORS EDGE MUTUAL FUND DISTRIBUTION (MFD) PLATFORM
-- SUPABASE POSTGRESQL DATABASE SCHEMA & MIGRATION SCRIPT
-- Compliant with SEBI & AMFI Regulatory Guidelines
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. CUSTOM ENUMS
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('client', 'distributor');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE kyc_status_type AS ENUM ('VALIDATED', 'REGISTERED', 'NOT_AVAILABLE', 'UNDER_PROCESS', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE kra_agency_type AS ENUM ('CVL_KRA', 'CAMS_KRA', 'NDML_KRA', 'KFINTECH_KRA', 'DOTEX_KRA');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE risk_profile_type AS ENUM ('CONSERVATIVE', 'MODERATELY_CONSERVATIVE', 'MODERATE', 'MODERATELY_HIGH', 'AGGRESSIVE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE scheme_category_type AS ENUM ('EQUITY', 'DEBT', 'HYBRID', 'COMMODITY', 'ELSS_TAX_SAVER', 'SOLUTION_ORIENTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE riskometer_level_type AS ENUM ('LOW', 'MODERATE', 'MODERATELY_HIGH', 'HIGH', 'VERY_HIGH');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE sip_frequency_type AS ENUM ('MONTHLY', 'WEEKLY', 'QUARTERLY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE sip_status_type AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED', 'FAILED_MANDATE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE mandate_type_enum AS ENUM ('eNACH', 'BSE_ISIP', 'UPI_AUTOPAY', 'PHYSICAL_NACH');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type_enum AS ENUM ('PURCHASE', 'SIP_INSTALLMENT', 'REDEMPTION', 'SWITCH_IN', 'SWITCH_OUT', 'STP', 'SWP', 'DIVIDEND_REINVEST');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tx_status_type AS ENUM ('SETTLED', 'PROCESSING', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE bank_account_type_enum AS ENUM ('SAVINGS', 'CURRENT', 'NRE', 'NRO');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================
-- 2. DISTRIBUTOR / MFD FIRM DETAILS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS distributor_profiles (
    id TEXT PRIMARY KEY DEFAULT 'dist-arn-198420',
    arn TEXT NOT NULL UNIQUE,
    euin TEXT NOT NULL,
    distributor_name TEXT NOT NULL,
    firm_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    office_city TEXT NOT NULL DEFAULT 'Mumbai, Maharashtra',
    bse_member_code TEXT,
    nse_member_code TEXT,
    cams_agent_code TEXT,
    kfin_agent_code TEXT,
    total_aum NUMERIC(15, 2) DEFAULT 0.00,
    total_investors INTEGER DEFAULT 0,
    monthly_sip_book NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. USERS / LOGIN CREDENTIALS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS users_accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT NOT NULL UNIQUE,
    pan TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL, -- Stored password or salt hash
    role user_role_type NOT NULL DEFAULT 'client',
    client_id TEXT, -- Foreign key link to client_profiles.id
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. CLIENT / INVESTOR MASTER PROFILES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS client_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    arn_id TEXT REFERENCES distributor_profiles(arn) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    pan TEXT NOT NULL UNIQUE,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL DEFAULT 'MALE',
    address_line1 TEXT,
    city TEXT NOT NULL DEFAULT 'Mumbai',
    state TEXT NOT NULL DEFAULT 'Maharashtra',
    pincode TEXT NOT NULL DEFAULT '400001',
    country TEXT NOT NULL DEFAULT 'India',
    
    -- KYC & KRA Details (SEBI Compliant)
    kyc_status kyc_status_type NOT NULL DEFAULT 'VALIDATED',
    kra_agency kra_agency_type NOT NULL DEFAULT 'CVL_KRA',
    aadhaar_last4 TEXT NOT NULL DEFAULT '0000',
    digilocker_verified BOOLEAN DEFAULT TRUE,
    pan_aadhaar_linked BOOLEAN DEFAULT TRUE,
    kyc_verified_date DATE DEFAULT CURRENT_DATE,
    kra_ref_number TEXT,
    ipv_photo_url TEXT,
    esign_completed BOOLEAN DEFAULT TRUE,
    
    -- Regulatory & Tax Compliance
    fatca_tax_resident_india BOOLEAN DEFAULT TRUE,
    pep_status BOOLEAN DEFAULT FALSE, -- Politically Exposed Person
    occupation TEXT DEFAULT 'PRIVATE_SECTOR',
    income_slab TEXT DEFAULT '10_TO_25_LAKH',
    birth_country TEXT DEFAULT 'India',
    
    -- Exchange Order Identifiers
    ucc_bse TEXT,
    ucc_nse TEXT,
    can_number TEXT, -- MFU Common Account Number
    
    -- Risk Profile & Investment Preference
    risk_profile risk_profile_type NOT NULL DEFAULT 'MODERATE',
    investment_horizon TEXT DEFAULT 'MORE_THAN_5_YEARS',
    primary_goal TEXT DEFAULT 'WEALTH_CREATION',
    
    -- Aggregate Financial Metrics (Updated via triggers / sync)
    joined_date DATE DEFAULT CURRENT_DATE,
    total_invested NUMERIC(15, 2) DEFAULT 0.00,
    current_value NUMERIC(15, 2) DEFAULT 0.00,
    absolute_return NUMERIC(8, 2) DEFAULT 0.00,
    xirr NUMERIC(6, 2) DEFAULT 0.00,
    active_sip_monthly NUMERIC(15, 2) DEFAULT 0.00,
    avatar_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link users_accounts client_id to client_profiles
ALTER TABLE users_accounts 
    DROP CONSTRAINT IF EXISTS fk_user_client;
ALTER TABLE users_accounts 
    ADD CONSTRAINT fk_user_client 
    FOREIGN KEY (client_id) REFERENCES client_profiles(id) ON DELETE SET NULL;

-- ==============================================================================
-- 5. CLIENT BANK ACCOUNTS & MANDATES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS client_bank_accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_id TEXT NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    masked_account_number TEXT NOT NULL,
    ifsc_code TEXT NOT NULL,
    account_type bank_account_type_enum NOT NULL DEFAULT 'SAVINGS',
    branch_name TEXT,
    verified_name TEXT NOT NULL,
    
    -- Penny Drop IMPS Validation
    penny_drop_success BOOLEAN DEFAULT TRUE,
    penny_drop_ref_id TEXT,
    penny_drop_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- Mandate & Auto-Debit Registration (e-NACH / UPI)
    mandate_approved BOOLEAN DEFAULT TRUE,
    mandate_type mandate_type_enum DEFAULT 'eNACH',
    mandate_umrn TEXT, -- NPCI Unique Mandate Reference Number
    mandate_max_limit NUMERIC(12, 2) DEFAULT 100000.00,
    is_primary BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. CLIENT NOMINEES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS client_nominees (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_id TEXT NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
    nominee_name TEXT NOT NULL,
    relation TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    share_percentage NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    is_minor BOOLEAN DEFAULT FALSE,
    guardian_name TEXT,
    guardian_pan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. MUTUAL FUND FOLIO HOLDINGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS folio_holdings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_id TEXT NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
    amc_name TEXT NOT NULL,
    amc_logo_text TEXT NOT NULL,
    scheme_name TEXT NOT NULL,
    category scheme_category_type NOT NULL DEFAULT 'EQUITY',
    sub_category TEXT NOT NULL,
    folio_number TEXT NOT NULL,
    units NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    avg_purchase_nav NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    current_nav NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    nav_date DATE DEFAULT CURRENT_DATE,
    invested_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    current_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    returns_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    returns_percentage NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    xirr NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    isin TEXT NOT NULL,
    riskometer riskometer_level_type NOT NULL DEFAULT 'VERY_HIGH',
    sip_linked BOOLEAN DEFAULT FALSE,
    sip_amount NUMERIC(12, 2),
    next_sip_date DATE,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. SYSTEMATIC INVESTMENT PLANS (SIP SCHEDULES)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS sip_schedules (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_id TEXT NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
    scheme_name TEXT NOT NULL,
    amc_name TEXT NOT NULL,
    folio_number TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    frequency sip_frequency_type NOT NULL DEFAULT 'MONTHLY',
    sip_day INTEGER NOT NULL CHECK (sip_day >= 1 AND sip_day <= 31),
    next_debit_date DATE NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    mandate_type mandate_type_enum NOT NULL DEFAULT 'eNACH',
    mandate_ref TEXT NOT NULL,
    status sip_status_type NOT NULL DEFAULT 'ACTIVE',
    step_up_percentage NUMERIC(5, 2) DEFAULT 0.00,
    step_up_frequency_months INTEGER DEFAULT 12,
    total_installments_completed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. TRANSACTION LEDGER
-- ==============================================================================

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_id TEXT NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    scheme_name TEXT NOT NULL,
    amc_name TEXT NOT NULL,
    folio_number TEXT NOT NULL,
    type transaction_type_enum NOT NULL DEFAULT 'PURCHASE',
    amount NUMERIC(15, 2) NOT NULL,
    units NUMERIC(12, 4) NOT NULL,
    nav NUMERIC(12, 4) NOT NULL,
    status tx_status_type NOT NULL DEFAULT 'SETTLED',
    order_reference TEXT NOT NULL,
    exchange_order_id TEXT,
    payment_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. INVESTOR FINANCIAL GOALS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS investor_goals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_id TEXT NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
    goal_name TEXT NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL,
    target_date DATE NOT NULL,
    current_accumulated NUMERIC(15, 2) DEFAULT 0.00,
    monthly_sip_allocated NUMERIC(12, 2) DEFAULT 0.00,
    category TEXT DEFAULT 'WEALTH_CREATION',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. CLIENT COMPLIANCE DOCUMENTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS client_documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_id TEXT NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'PAN_CARD', 'AADHAAR', 'CHEQUE', 'IPV_PHOTO', 'ESIGN_DOC', 'CAS_PDF'
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    verification_status TEXT DEFAULT 'VERIFIED',
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. CAS (CONSOLIDATED ACCOUNT STATEMENT) UPLOADS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS cas_uploads (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_id TEXT NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    statement_period TEXT,
    folios_count INTEGER DEFAULT 0,
    total_valuation NUMERIC(15, 2) DEFAULT 0.00,
    imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 13. INDEXES FOR HIGH-SPEED QUERYING
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users_accounts(email);
CREATE INDEX IF NOT EXISTS idx_users_pan ON users_accounts(pan);
CREATE INDEX IF NOT EXISTS idx_client_pan ON client_profiles(pan);
CREATE INDEX IF NOT EXISTS idx_client_email ON client_profiles(email);
CREATE INDEX IF NOT EXISTS idx_client_phone ON client_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_client_ucc ON client_profiles(ucc_bse);
CREATE INDEX IF NOT EXISTS idx_holdings_client ON folio_holdings(client_id);
CREATE INDEX IF NOT EXISTS idx_holdings_folio ON folio_holdings(folio_number);
CREATE INDEX IF NOT EXISTS idx_sips_client ON sip_schedules(client_id);
CREATE INDEX IF NOT EXISTS idx_sips_status ON sip_schedules(status);
CREATE INDEX IF NOT EXISTS idx_tx_client ON transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_bank_client ON client_bank_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_nominee_client ON client_nominees(client_id);
CREATE INDEX IF NOT EXISTS idx_goals_client ON investor_goals(client_id);

-- ==============================================================================
-- 14. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ==============================================================================

CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_client_profiles_updated ON client_profiles;
CREATE TRIGGER trigger_client_profiles_updated
BEFORE UPDATE ON client_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trigger_folio_holdings_updated ON folio_holdings;
CREATE TRIGGER trigger_folio_holdings_updated
BEFORE UPDATE ON folio_holdings
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trigger_sip_schedules_updated ON sip_schedules;
CREATE TRIGGER trigger_sip_schedules_updated
BEFORE UPDATE ON sip_schedules
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trigger_users_accounts_updated ON users_accounts;
CREATE TRIGGER trigger_users_accounts_updated
BEFORE UPDATE ON users_accounts
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- ==============================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE distributor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE folio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sip_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cas_uploads ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for demo and authenticated client sessions
CREATE POLICY "Public read for distributor_profiles" ON distributor_profiles FOR SELECT USING (true);
CREATE POLICY "Public update for distributor_profiles" ON distributor_profiles FOR ALL USING (true);

CREATE POLICY "Allow all access to users_accounts" ON users_accounts FOR ALL USING (true);
CREATE POLICY "Allow all access to client_profiles" ON client_profiles FOR ALL USING (true);
CREATE POLICY "Allow all access to client_bank_accounts" ON client_bank_accounts FOR ALL USING (true);
CREATE POLICY "Allow all access to client_nominees" ON client_nominees FOR ALL USING (true);
CREATE POLICY "Allow all access to folio_holdings" ON folio_holdings FOR ALL USING (true);
CREATE POLICY "Allow all access to sip_schedules" ON sip_schedules FOR ALL USING (true);
CREATE POLICY "Allow all access to transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all access to investor_goals" ON investor_goals FOR ALL USING (true);
CREATE POLICY "Allow all access to client_documents" ON client_documents FOR ALL USING (true);
CREATE POLICY "Allow all access to cas_uploads" ON cas_uploads FOR ALL USING (true);

-- ==============================================================================
-- 16. SEED DATA (INITIAL DISTRIBUTOR & DEMO INVESTORS)
-- ==============================================================================

-- Seed Distributor
INSERT INTO distributor_profiles (id, arn, euin, distributor_name, firm_name, email, mobile, office_city, bse_member_code, nse_member_code, cams_agent_code, kfin_agent_code, total_aum, total_investors, monthly_sip_book)
VALUES (
    'dist-arn-198420',
    'ARN-198420',
    'E-428190',
    'InvestorsEdge Wealth Partners',
    'Investors Edge Financial Services LLP',
    'investorsedgeindia@gmail.com',
    '+91 98200 12345',
    'Mumbai, Maharashtra',
    'BSE-MFD-94821',
    'NSE-NMF-51209',
    'CAM-884210',
    'KFN-339180',
    48500000.00,
    142,
    1850000.00
) ON CONFLICT (id) DO UPDATE SET
    distributor_name = EXCLUDED.distributor_name,
    total_aum = EXCLUDED.total_aum,
    monthly_sip_book = EXCLUDED.monthly_sip_book;

-- Seed Client 1: Rajesh V. Sharma
INSERT INTO client_profiles (
    id, arn_id, name, email, phone, pan, date_of_birth, gender, city, state, pincode,
    kyc_status, kra_agency, aadhaar_last4, digilocker_verified, risk_profile, ucc_bse, ucc_nse,
    fatca_tax_resident_india, pep_status, joined_date, total_invested, current_value, absolute_return, xirr, active_sip_monthly
) VALUES (
    'cli-001', 'ARN-198420', 'Rajesh V. Sharma', 'rajesh.sharma@example.com', '+91 98210 98765', 'ABCPS1234K',
    '1988-06-14', 'MALE', 'Mumbai', 'Maharashtra', '400053',
    'VALIDATED', 'CVL_KRA', '8821', TRUE, 'AGGRESSIVE', 'UCC_RAJESH_001', 'NSE_RAJESH_001',
    TRUE, FALSE, '2022-03-15', 2450000.00, 3385000.00, 38.16, 18.40, 45000.00
) ON CONFLICT (pan) DO NOTHING;

-- Seed Client 2: Priya Patel
INSERT INTO client_profiles (
    id, arn_id, name, email, phone, pan, date_of_birth, gender, city, state, pincode,
    kyc_status, kra_agency, aadhaar_last4, digilocker_verified, risk_profile, ucc_bse, ucc_nse,
    fatca_tax_resident_india, pep_status, joined_date, total_invested, current_value, absolute_return, xirr, active_sip_monthly
) VALUES (
    'cli-002', 'ARN-198420', 'Priya Ananya Patel', 'priya.patel@example.com', '+91 98450 11223', 'BHKPP8492L',
    '1994-11-03', 'FEMALE', 'Ahmedabad', 'Gujarat', '380015',
    'VALIDATED', 'CAMS_KRA', '4192', TRUE, 'MODERATELY_HIGH', 'UCC_PRIYA_002', 'NSE_PRIYA_002',
    TRUE, FALSE, '2023-01-10', 1100000.00, 1420000.00, 29.09, 21.20, 25000.00
) ON CONFLICT (pan) DO NOTHING;

-- Seed Bank Account for Rajesh Sharma
INSERT INTO client_bank_accounts (
    id, client_id, bank_name, account_number, masked_account_number, ifsc_code, account_type, branch_name, verified_name, penny_drop_success, penny_drop_ref_id, mandate_approved, mandate_umrn
) VALUES (
    'bank-cli-001', 'cli-001', 'HDFC Bank Ltd', '50100492819201', '••••••••9201', 'HDFC0000240', 'SAVINGS', 'Andheri West, Mumbai', 'RAJESH VINOD SHARMA', TRUE, 'PENNY_HDFC_992182', TRUE, 'UMRN_HDFC_9921827361'
) ON CONFLICT (id) DO NOTHING;

-- Seed Nominee for Rajesh Sharma
INSERT INTO client_nominees (
    id, client_id, nominee_name, relation, date_of_birth, share_percentage, is_minor
) VALUES (
    'nom-cli-001', 'cli-001', 'Sunita Rajesh Sharma', 'Spouse', '1990-09-22', 100.00, FALSE
) ON CONFLICT (id) DO NOTHING;

-- Seed Folio Holdings for Rajesh Sharma
INSERT INTO folio_holdings (
    id, client_id, amc_name, amc_logo_text, scheme_name, category, sub_category, folio_number, units, avg_purchase_nav, current_nav, nav_date, invested_amount, current_value, returns_amount, returns_percentage, xirr, isin, riskometer, sip_linked, sip_amount, next_sip_date
) VALUES 
('hol-001', 'cli-001', 'Parag Parikh Mutual Fund', 'PPFAS', 'Parag Parikh Flexi Cap Fund - Regular Plan - Growth', 'EQUITY', 'Flexi Cap', '10928301/44', 1420.45, 54.20, 82.65, CURRENT_DATE, 770000.00, 1174002.00, 404002.00, 52.47, 22.40, 'INF879O01019', 'VERY_HIGH', TRUE, 15000.00, CURRENT_DATE + INTERVAL '20 days'),
('hol-002', 'cli-001', 'HDFC Mutual Fund', 'HDFC', 'HDFC Mid-Cap Opportunities Fund - Regular Plan - Growth', 'EQUITY', 'Mid Cap', '48291039/12', 5120.18, 112.50, 174.30, CURRENT_DATE, 576000.00, 892447.00, 316447.00, 54.94, 24.10, 'INF179K01965', 'VERY_HIGH', TRUE, 10000.00, CURRENT_DATE + INTERVAL '25 days'),
('hol-003', 'cli-001', 'ICICI Prudential Mutual Fund', 'ICICI Pru', 'ICICI Prudential Balanced Advantage Fund - Regular - Growth', 'HYBRID', 'Dynamic Asset Allocation', '88392019/90', 9420.35, 58.10, 74.80, CURRENT_DATE, 547000.00, 704642.00, 157642.00, 28.82, 14.20, 'INF109K01139', 'HIGH', TRUE, 10000.00, CURRENT_DATE + INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- Seed SIP Schedules for Rajesh Sharma
INSERT INTO sip_schedules (
    id, client_id, scheme_name, amc_name, folio_number, amount, frequency, sip_day, next_debit_date, start_date, mandate_type, mandate_ref, status
) VALUES 
('sip-001', 'cli-001', 'Parag Parikh Flexi Cap Fund - Regular - Growth', 'PPFAS Mutual Fund', '10928301/44', 15000.00, 'MONTHLY', 5, CURRENT_DATE + INTERVAL '20 days', '2022-04-05', 'eNACH', 'UMRN_HDFC_9921827361', 'ACTIVE'),
('sip-002', 'cli-001', 'HDFC Mid-Cap Opportunities Fund - Regular - Growth', 'HDFC Mutual Fund', '48291039/12', 10000.00, 'MONTHLY', 10, CURRENT_DATE + INTERVAL '25 days', '2022-04-10', 'eNACH', 'UMRN_HDFC_9921827361', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Seed Transactions for Rajesh Sharma
INSERT INTO transactions (
    id, client_id, date, scheme_name, amc_name, folio_number, type, amount, units, nav, status, order_reference
) VALUES 
('tx-001', 'cli-001', CURRENT_DATE - INTERVAL '6 days', 'HDFC Mid-Cap Opportunities Fund - Regular - Growth', 'HDFC Mutual Fund', '48291039/12', 'SIP_INSTALLMENT', 10000.00, 57.37, 174.30, 'SETTLED', 'BSE_ORD_88421092'),
('tx-002', 'cli-001', CURRENT_DATE - INTERVAL '11 days', 'Parag Parikh Flexi Cap Fund - Regular - Growth', 'PPFAS Mutual Fund', '10928301/44', 'SIP_INSTALLMENT', 15000.00, 181.48, 82.65, 'SETTLED', 'BSE_ORD_88421001')
ON CONFLICT (id) DO NOTHING;

-- Seed Goals for Rajesh Sharma
INSERT INTO investor_goals (
    id, client_id, goal_name, target_amount, target_date, current_accumulated, monthly_sip_allocated, category
) VALUES 
('goal-001', 'cli-001', 'Retirement Independence @ 55', 50000000.00, '2043-06-14', 3385000.00, 35000.00, 'RETIREMENT'),
('goal-002', 'cli-001', 'Child Higher Education Abroad', 15000000.00, '2036-05-01', 1200000.00, 10000.00, 'CHILD_EDUCATION')
ON CONFLICT (id) DO NOTHING;

-- Seed Users for Login
INSERT INTO users_accounts (id, email, pan, phone, name, password_hash, role, client_id)
VALUES 
('usr-distributor', 'investorsedgeindia@gmail.com', 'AAAPI1984K', '+91 98200 12345', 'Investors Edge Financial (MFD Admin)', 'Distributor@123', 'distributor', NULL),
('usr-cli-001', 'rajesh.sharma@example.com', 'ABCPS1234K', '+91 98210 98765', 'Rajesh V. Sharma', 'Investor@123', 'client', 'cli-001'),
('usr-cli-002', 'priya.patel@example.com', 'BHKPP8492L', '+91 98450 11223', 'Priya Ananya Patel', 'Investor@123', 'client', 'cli-002')
ON CONFLICT (email) DO NOTHING;
