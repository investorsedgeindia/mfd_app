export type KycStatus = 'VALIDATED' | 'REGISTERED' | 'NOT_AVAILABLE' | 'UNDER_PROCESS' | 'REJECTED';
export type KraAgency = 'CVL_KRA' | 'CAMS_KRA' | 'NDML_KRA' | 'KFINTECH_KRA' | 'DOTEX_KRA';
export type RiskProfileType = 'CONSERVATIVE' | 'MODERATELY_CONSERVATIVE' | 'MODERATE' | 'MODERATELY_HIGH' | 'AGGRESSIVE';
export type SchemeCategory = 'EQUITY' | 'DEBT' | 'HYBRID' | 'COMMODITY' | 'ELSS_TAX_SAVER' | 'SOLUTION_ORIENTED';
export type RiskometerLevel = 'LOW' | 'MODERATE' | 'MODERATELY_HIGH' | 'HIGH' | 'VERY_HIGH';

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  maskedAccountNumber: string;
  ifscCode: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'NRE' | 'NRO';
  branchName: string;
  verifiedName: string;
  pennyDropSuccess: boolean;
  pennyDropRefId?: string;
  mandateApproved?: boolean;
}

export interface NomineeDetails {
  name: string;
  relation: string;
  dateOfBirth: string;
  sharePercentage: number;
  isMinor: boolean;
  guardianName?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  pan: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  city: string;
  state: string;
  pincode: string;
  kycStatus: KycStatus;
  kraAgency: KraAgency;
  aadhaarLast4: string;
  digilockerVerified: boolean;
  bankDetails: BankDetails;
  nominees: NomineeDetails[];
  riskProfile: RiskProfileType;
  uccBse?: string;
  uccNse?: string;
  fatcaTaxResidentIndia: boolean;
  pepStatus: boolean; // Politically Exposed Person
  joinedDate: string;
  totalInvested: number;
  currentValue: number;
  absoluteReturn: number;
  xirr: number;
  activeSipMonthly: number;
  avatarUrl?: string;
}

export interface FolioHolding {
  id: string;
  clientId: string;
  amcName: string;
  amcLogoText: string;
  schemeName: string;
  category: SchemeCategory;
  subCategory: string;
  folioNumber: string;
  units: number;
  avgPurchaseNav: number;
  currentNav: number;
  navDate: string;
  investedAmount: number;
  currentValue: number;
  returnsAmount: number;
  returnsPercentage: number;
  xirr: number;
  isin: string;
  riskometer: RiskometerLevel;
  sipLinked: boolean;
  sipAmount?: number;
  nextSipDate?: string;
}

export interface SIPSchedule {
  id: string;
  clientId: string;
  schemeName: string;
  amcName: string;
  folioNumber: string;
  amount: number;
  frequency: 'MONTHLY' | 'WEEKLY' | 'QUARTERLY';
  sipDay: number;
  nextDebitDate: string;
  startDate: string;
  mandateType: 'eNACH' | 'BSE_ISIP' | 'UPI_AUTOPAY';
  mandateRef: string;
  status: 'ACTIVE' | 'PAUSED' | 'FAILED_MANDATE';
}

export interface TransactionRecord {
  id: string;
  clientId: string;
  date: string;
  schemeName: string;
  amcName: string;
  folioNumber: string;
  type: 'PURCHASE' | 'SIP_INSTALLMENT' | 'REDEMPTION' | 'SWITCH_IN' | 'SWITCH_OUT' | 'STP' | 'SWP';
  amount: number;
  units: number;
  nav: number;
  status: 'SETTLED' | 'PROCESSING' | 'REJECTED';
  orderReference: string;
}

export interface AmcPartner {
  id: string;
  name: string;
  shortName: string;
  rta: 'CAMS' | 'KFINTECH';
  arnEmpanelled: boolean;
  empanelmentCode: string;
  feedSyncStatus: 'LIVE_AUTOMATED' | 'DAILY_MAILBACK' | 'MANUAL_IMPORT';
  lastSyncTime: string;
  totalAum: number;
  foliosManaged: number;
}

export interface ActionRoadmapSection {
  phase: number;
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  timeframe: string;
  status: 'READY_TO_EXECUTE' | 'IN_PROGRESS' | 'CORE_FOUNDATION';
  steps: RoadmapStep[];
}

export interface RoadmapStep {
  stepId: string;
  title: string;
  summary: string;
  whyCrucial: string;
  regulatoryContext: string;
  implementationActions: string[];
  recommendedPartnersOrVendors?: { name: string; type: string; url?: string; description: string }[];
  technicalSpecs?: {
    protocol: string;
    apisNeeded: string[];
    sampleRequest?: string;
    sampleResponse?: string;
  };
  pitfallsToAvoid: string[];
  checklistItems: { id: string; text: string; doneByDefault?: boolean }[];
}

export interface OnboardingFormState {
  currentStep: number;
  // Step 1: PAN & KRA
  pan: string;
  dob: string;
  fullName: string;
  gender: string;
  kraCheckResult: {
    status: KycStatus | null;
    agency: KraAgency | null;
    panExempt: boolean;
    registeredOn?: string;
    message?: string;
  };
  // Step 2: Aadhaar eKYC / DigiLocker
  aadhaarNumber: string;
  aadhaarOtp: string;
  digilockerStatus: 'IDLE' | 'SENDING_OTP' | 'OTP_SENT' | 'FETCHED' | 'FAILED';
  fetchedAddress: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
    photoBase64?: string;
  };
  // Step 3: Bank & Penny Drop
  bankAccountNumber: string;
  confirmBankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  accountType: 'SAVINGS' | 'CURRENT';
  pennyDropStatus: 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  pennyDropMatchedName: string;
  // Step 4: FATCA & Declarations
  taxResidentIndiaOnly: boolean;
  birthCountry: string;
  occupation: string;
  incomeSlab: string;
  isPep: boolean;
  nomineeName: string;
  nomineeRelation: string;
  nomineeDob: string;
  nomineeShare: number;
  // Step 5: Risk Profiling
  investmentHorizon: string;
  riskTolerance: string;
  primaryGoal: string;
  calculatedRisk: RiskProfileType;
  // Step 6: IPV & eSign
  ipvPhotoCaptured: boolean;
  eSignOtp: string;
  eSignCompleted: boolean;
  generatedUcc?: string;
}

export interface DistributorDetails {
  arn: string;
  euin: string;
  distributorName: string;
  firmName: string;
  email: string;
  mobile: string;
  officeCity: string;
  bseMemberCode: string;
  nseMemberCode: string;
  camsAgentCode: string;
  kfinAgentCode: string;
  totalAum: number;
  totalInvestors: number;
  monthlySipBook: number;
}
