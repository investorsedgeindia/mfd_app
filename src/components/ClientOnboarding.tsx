import React, { useState, useRef } from 'react';
import {
  UserCheck,
  ShieldCheck,
  CreditCard,
  Building,
  FileCheck2,
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  MapPin,
  Clock,
  Lock,
  RefreshCw,
  Eye,
  FileText,
  User,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClientProfile, KycStatus, KraAgency, RiskProfileType, OnboardingFormState } from '../types';

interface ClientOnboardingProps {
  onClientCreated: (newClient: ClientProfile) => void;
  onGoToInvestorView: (clientId: string) => void;
}

const INITIAL_FORM: OnboardingFormState = {
  currentStep: 1,
  pan: 'ABCPS1234K',
  dob: '1992-05-18',
  fullName: 'Rajesh Vinod Sharma',
  gender: 'MALE',
  kraCheckResult: {
    status: null,
    agency: null,
    panExempt: false,
  },
  aadhaarNumber: '482910298821',
  aadhaarOtp: '492810',
  digilockerStatus: 'IDLE',
  fetchedAddress: {
    line1: 'Flat 402, Green Meadows, Link Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
  },
  bankAccountNumber: '50100492819201',
  confirmBankAccountNumber: '50100492819201',
  ifscCode: 'HDFC0000240',
  bankName: 'HDFC Bank Ltd',
  branchName: 'Andheri West, Mumbai',
  accountType: 'SAVINGS',
  pennyDropStatus: 'IDLE',
  pennyDropMatchedName: '',
  taxResidentIndiaOnly: true,
  birthCountry: 'India',
  occupation: 'PRIVATE_SECTOR',
  incomeSlab: '10_TO_25_LAKH',
  isPep: false,
  nomineeName: 'Sunita Sharma',
  nomineeRelation: 'Spouse',
  nomineeDob: '1994-08-12',
  nomineeShare: 100,
  investmentHorizon: 'MORE_THAN_5_YEARS',
  riskTolerance: 'HIGH_GROWTH',
  primaryGoal: 'WEALTH_CREATION',
  calculatedRisk: 'AGGRESSIVE',
  ipvPhotoCaptured: false,
  eSignOtp: '891023',
  eSignCompleted: false,
};

export const ClientOnboarding: React.FC<ClientOnboardingProps> = ({
  onClientCreated,
  onGoToInvestorView,
}) => {
  const [form, setForm] = useState<OnboardingFormState>(INITIAL_FORM);
  const [isVerifyingKra, setIsVerifyingKra] = useState(false);
  const [isVerifyingPennyDrop, setIsVerifyingPennyDrop] = useState(false);
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isSubmittingUcc, setIsSubmittingUcc] = useState(false);
  const [createdClient, setCreatedClient] = useState<ClientProfile | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Step 1: PAN KRA Check
  const handleKraCheck = () => {
    if (!form.pan || form.pan.length !== 10) return;
    setIsVerifyingKra(true);
    setTimeout(() => {
      setIsVerifyingKra(false);
      // Realistic simulation: If PAN starts with A/B/C/H -> KYC Validated
      const isAlreadyValidated = ['A', 'B', 'C', 'H', 'P'].includes(form.pan[0].toUpperCase());
      const agency: KraAgency = 'CVL_KRA';
      const status: KycStatus = isAlreadyValidated ? 'VALIDATED' : 'REGISTERED';

      setForm((prev) => ({
        ...prev,
        kraCheckResult: {
          status,
          agency,
          panExempt: false,
          registeredOn: '2021-04-10',
          message:
            status === 'VALIDATED'
              ? 'PAN is KYC Validated with Aadhaar linkage in CVL-KRA. Eligible for instant paperless mutual fund transactions across all AMCs.'
              : 'PAN is KYC Registered. Can proceed with quick DigiLocker / Aadhaar OTP verification.',
        },
        fullName: prev.fullName || 'RAJESH VINOD SHARMA',
      }));
    }, 900);
  };

  // Step 2: DigiLocker Fetch
  const handleDigilockerFetch = () => {
    setForm((prev) => ({ ...prev, digilockerStatus: 'SENDING_OTP' }));
    setTimeout(() => {
      setForm((prev) => ({
        ...prev,
        digilockerStatus: 'FETCHED',
        fetchedAddress: {
          line1: 'B-402, Orchid Heights, Opp Infinity Mall',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400053',
        },
      }));
    }, 1200);
  };

  // Step 3: Penny Drop IMPS
  const handlePennyDrop = () => {
    if (!form.bankAccountNumber || !form.ifscCode) return;
    setIsVerifyingPennyDrop(true);
    setTimeout(() => {
      setIsVerifyingPennyDrop(false);
      setForm((prev) => ({
        ...prev,
        pennyDropStatus: 'SUCCESS',
        pennyDropMatchedName: form.fullName.toUpperCase(),
        bankName: form.ifscCode.startsWith('HDFC')
          ? 'HDFC Bank'
          : form.ifscCode.startsWith('ICIC')
          ? 'ICICI Bank'
          : form.ifscCode.startsWith('SBIN')
          ? 'State Bank of India'
          : 'Axis Bank Ltd',
        branchName: 'Andheri West Branch, Mumbai',
      }));
    }, 1000);
  };

  // Step 5: Risk Profile Calculation
  const calculateRisk = () => {
    let score = 0;
    if (form.investmentHorizon === 'MORE_THAN_5_YEARS') score += 3;
    else if (form.investmentHorizon === '3_TO_5_YEARS') score += 2;
    else score += 1;

    if (form.riskTolerance === 'HIGH_GROWTH') score += 3;
    else if (form.riskTolerance === 'BALANCED') score += 2;
    else score += 1;

    let profile: RiskProfileType = 'MODERATE';
    if (score >= 5) profile = 'AGGRESSIVE';
    else if (score >= 4) profile = 'MODERATELY_HIGH';
    else if (score >= 3) profile = 'MODERATE';
    else profile = 'CONSERVATIVE';

    return profile;
  };

  // Step 6: Camera IPV Start
  const startCamera = async () => {
    setIsCapturingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable; falling back to simulated snapshot', err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && cameraStream) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedPhotoUrl(dataUrl);
      }
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    } else {
      // Simulation placeholder
      setCapturedPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop');
    }
    setForm((prev) => ({ ...prev, ipvPhotoCaptured: true }));
    setIsCapturingCamera(false);
  };

  // Final Step: Complete Onboarding & Generate BSE UCC
  const handleFinalSubmit = () => {
    setIsSubmittingUcc(true);

    setTimeout(() => {
      setIsSubmittingUcc(false);
      const generatedUcc = `BSE_UCC_${form.pan}_${Math.floor(100 + Math.random() * 900)}`;

      const newClient: ClientProfile = {
        id: `cli-${Date.now()}`,
        name: form.fullName || 'New Investor',
        email: 'investor.' + form.pan.toLowerCase() + '@example.com',
        phone: '+91 98200 ' + Math.floor(10000 + Math.random() * 90000),
        pan: form.pan,
        dateOfBirth: form.dob,
        gender: (form.gender as 'MALE' | 'FEMALE' | 'OTHER') || 'MALE',
        city: form.fetchedAddress.city || 'Mumbai',
        state: form.fetchedAddress.state || 'Maharashtra',
        pincode: form.fetchedAddress.pincode || '400053',
        kycStatus: form.kraCheckResult.status || 'VALIDATED',
        kraAgency: form.kraCheckResult.agency || 'CVL_KRA',
        aadhaarLast4: form.aadhaarNumber.slice(-4),
        digilockerVerified: true,
        bankDetails: {
          bankName: form.bankName || 'HDFC Bank',
          accountNumber: form.bankAccountNumber,
          maskedAccountNumber: '••••••••' + form.bankAccountNumber.slice(-4),
          ifscCode: form.ifscCode,
          accountType: form.accountType,
          branchName: form.branchName || 'Branch',
          verifiedName: form.pennyDropMatchedName || form.fullName,
          pennyDropSuccess: true,
          pennyDropRefId: 'PENNY_REF_' + Date.now(),
          mandateApproved: true,
        },
        nominees: [
          {
            name: form.nomineeName || 'Nominee',
            relation: form.nomineeRelation || 'Spouse',
            dateOfBirth: form.nomineeDob || '1995-01-01',
            sharePercentage: form.nomineeShare || 100,
            isMinor: false,
          },
        ],
        riskProfile: calculateRisk(),
        uccBse: generatedUcc,
        uccNse: `NSE_${form.pan}`,
        fatcaTaxResidentIndia: form.taxResidentIndiaOnly,
        pepStatus: form.isPep,
        joinedDate: new Date().toISOString().split('T')[0],
        totalInvested: 0,
        currentValue: 0,
        absoluteReturn: 0,
        xirr: 0,
        activeSipMonthly: 0,
      };

      setCreatedClient(newClient);
      onClientCreated(newClient);

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Paperless Digital Onboarding Engine
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              Instant Investor e-KYC &amp; BSE StAR UCC Creator
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              SEBI Compliant 6-Step Digital Onboarding: KRA Query → DigiLocker Aadhaar → Penny Drop Bank Check → FATCA → Risk Profile → Video IPV.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium">
              ARN: ARN-198420 Auto-Mapped
            </span>
          </div>
        </div>

        {/* Multi-Step Progress Tracker */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-6 gap-2">
            {[
              { num: 1, label: 'PAN & KRA', icon: CreditCard },
              { num: 2, label: 'DigiLocker', icon: ShieldCheck },
              { num: 3, label: 'Bank Check', icon: Building },
              { num: 4, label: 'FATCA & Nominee', icon: FileCheck2 },
              { num: 5, label: 'Risk Profile', icon: UserCheck },
              { num: 6, label: 'IPV & UCC', icon: Camera },
            ].map((step) => {
              const Icon = step.icon;
              const isActive = form.currentStep === step.num;
              const isPast = form.currentStep > step.num || createdClient !== null;

              return (
                <button
                  key={step.num}
                  disabled={createdClient !== null}
                  onClick={() => setForm((prev) => ({ ...prev, currentStep: step.num }))}
                  className={`flex flex-col items-center text-center p-2 rounded-xl border transition ${
                    isActive
                      ? 'bg-blue-50/80 border-blue-500 text-blue-700 font-bold'
                      : isPast
                      ? 'bg-gray-50 border-gray-200 text-emerald-600 font-medium'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs mb-1 ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold'
                        : isPast
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[11px] leading-tight truncate w-full hidden sm:block">
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Success Modal / Screen if Client Created */}
      {createdClient ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center space-y-6 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-600">
              Onboarding Completed Successfully
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Investor {createdClient.name} is Ready to Invest!
            </h2>
            <p className="text-xs text-gray-500 mt-2 max-w-lg mx-auto">
              Unique Client Code (UCC) generated on BSE StAR MF and mapped to ARN-198420.
              Bank account verified via IMPS penny-drop. All AMCs ready for paperless SIP &amp; Lumpsum.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 max-w-md mx-auto text-left border border-gray-200 text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-gray-500">Investor PAN:</span>
              <span className="text-slate-900 font-bold">{createdClient.pan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">BSE StAR UCC:</span>
              <span className="text-blue-600 font-bold">{createdClient.uccBse}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Verified Bank:</span>
              <span className="text-slate-900">{createdClient.bankDetails.bankName} ({createdClient.bankDetails.maskedAccountNumber})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">KYC Status:</span>
              <span className="text-emerald-600 font-bold">KYC VALIDATED (CVL-KRA)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Risk Profile:</span>
              <span className="text-blue-600 font-bold">{createdClient.riskProfile}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onGoToInvestorView(createdClient.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition"
            >
              Open Investor Portfolio Dashboard
            </button>
            <button
              onClick={() => {
                setCreatedClient(null);
                setForm(INITIAL_FORM);
              }}
              className="bg-white hover:bg-gray-50 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-gray-300 shadow-xs transition"
            >
              Onboard Another Customer
            </button>
          </div>
        </div>
      ) : (
        /* Multi-Step Wizard Body */
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xs">
          {/* STEP 1: PAN & KRA Registry Check */}
          {form.currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" /> Step 1: PAN &amp; Live KRA Status Query
                  </h2>
                  <span className="text-xs text-gray-500 font-medium">Phase 02 Architecture</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter the investor's PAN and Date of Birth to query CVL-KRA, NDML, CAMS KRA, and KFintech registries in real-time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Permanent Account Number (PAN) *
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={form.pan}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, pan: e.target.value.toUpperCase() }))
                    }
                    placeholder="e.g. ABCPS1234K"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono uppercase focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Date of Birth (As per PAN / Aadhaar) *
                  </label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm((prev) => ({ ...prev, dob: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Full Legal Name (As on Income Tax Registry)
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter full name"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* KRA Status Check Trigger & Result */}
              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Real-time KRA Registry Lookup</span>
                    <span className="text-[11px] text-gray-500">
                      Querying CVL, NDML, CAMS, KFintech &amp; DotEx KRA
                    </span>
                  </div>
                  <button
                    onClick={handleKraCheck}
                    disabled={isVerifyingKra || form.pan.length !== 10}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-xs transition"
                  >
                    {isVerifyingKra ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Querying KRA...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" /> Check KRA Status
                      </>
                    )}
                  </button>
                </div>

                {form.kraCheckResult.status && (
                  <div
                    className={`rounded-lg p-3.5 border text-xs ${
                      form.kraCheckResult.status === 'VALIDATED'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-blue-50 border-blue-200 text-blue-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-sm mb-1">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> KRA Status:{' '}
                        {form.kraCheckResult.status === 'VALIDATED' ? 'KYC VALIDATED' : 'KYC REGISTERED'}
                      </span>
                      <span className="font-mono text-xs text-gray-600">
                        Agency: {form.kraCheckResult.agency}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">{form.kraCheckResult.message}</p>
                  </div>
                )}
              </div>

              {/* Next CTA */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (!form.kraCheckResult.status) handleKraCheck();
                    setForm((prev) => ({ ...prev, currentStep: 2 }));
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-xs"
                >
                  <span>Continue to DigiLocker &amp; Address</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DigiLocker & Aadhaar Address */}
          {form.currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" /> Step 2: DigiLocker / Aadhaar e-KYC Verification
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Officially Valid Document (OVD) fetch from UIDAI via DigiLocker. Extracts verified address and demographic proof.
                </p>
              </div>

              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                      DL
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Government of India DigiLocker Integration</h4>
                      <p className="text-[11px] text-gray-500">
                        Pulls signed XML containing name, date of birth, gender, and full address.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDigilockerFetch}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-xs transition"
                  >
                    {form.digilockerStatus === 'FETCHED' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Verified via DigiLocker
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" /> Pull from DigiLocker
                      </>
                    )}
                  </button>
                </div>

                {/* Aadhaar Input Masked */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Aadhaar Number (Masked storage compliance)
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      value={form.aadhaarNumber}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, aadhaarNumber: e.target.value }))
                      }
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Aadhaar OTP (Simulation)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={form.aadhaarOtp}
                      onChange={(e) => setForm((prev) => ({ ...prev, aadhaarOtp: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Address Display */}
                <div className="bg-white rounded-xl p-3.5 border border-gray-200 text-xs space-y-2">
                  <span className="text-gray-500 font-semibold block text-[11px] uppercase tracking-wider">
                    Verified Address Details:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={form.fetchedAddress.line1}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            fetchedAddress: { ...prev.fetchedAddress, line1: e.target.value },
                          }))
                        }
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={form.fetchedAddress.city}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            fetchedAddress: { ...prev.fetchedAddress, city: e.target.value },
                          }))
                        }
                        placeholder="City"
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={form.fetchedAddress.state}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            fetchedAddress: { ...prev.fetchedAddress, state: e.target.value },
                          }))
                        }
                        placeholder="State"
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={form.fetchedAddress.pincode}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            fetchedAddress: { ...prev.fetchedAddress, pincode: e.target.value },
                          }))
                        }
                        placeholder="Pincode"
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setForm((prev) => ({ ...prev, currentStep: 1 }))}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-slate-900 px-3 py-2 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setForm((prev) => ({ ...prev, currentStep: 3 }))}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-xs"
                >
                  <span>Continue to Bank Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Bank Account Verification (Penny Drop IMPS) */}
          {form.currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" /> Step 3: Bank Account Verification (Penny Drop)
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  SEBI mandates 100% electronic validation. A ₹1.00 IMPS penny drop verifies the investor's bank account name matches their PAN name.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Bank Account Number *
                  </label>
                  <input
                    type="text"
                    value={form.bankAccountNumber}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, bankAccountNumber: e.target.value }))
                    }
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Confirm Bank Account Number *
                  </label>
                  <input
                    type="text"
                    value={form.confirmBankAccountNumber}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, confirmBankAccountNumber: e.target.value }))
                    }
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Bank IFSC Code *
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={form.ifscCode}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))
                    }
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono uppercase focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Account Type
                  </label>
                  <select
                    value={form.accountType}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        accountType: e.target.value as 'SAVINGS' | 'CURRENT',
                      }))
                    }
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="SAVINGS">Savings Account</option>
                    <option value="CURRENT">Current Account</option>
                  </select>
                </div>
              </div>

              {/* Penny Drop Simulation Box */}
              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      IMPS ₹1.00 Penny Drop Verification
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Matches NPCI returned name with PAN name
                    </span>
                  </div>
                  <button
                    onClick={handlePennyDrop}
                    disabled={isVerifyingPennyDrop}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-xs transition"
                  >
                    {isVerifyingPennyDrop ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying Bank...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Execute Penny Drop
                      </>
                    )}
                  </button>
                </div>

                {form.pennyDropStatus === 'SUCCESS' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 text-xs text-emerald-900 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Bank Account Verified
                        Successfully
                      </span>
                      <span className="font-mono text-[11px] text-emerald-700">Match: 100% (High Confidence)</span>
                    </div>
                    <p className="text-[11px] text-slate-700">
                      Registered Name in Bank: <strong>{form.pennyDropMatchedName}</strong> ({form.bankName}, {form.branchName})
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setForm((prev) => ({ ...prev, currentStep: 2 }))}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-slate-900 px-3 py-2 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => {
                    if (form.pennyDropStatus !== 'SUCCESS') handlePennyDrop();
                    setForm((prev) => ({ ...prev, currentStep: 4 }));
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-xs"
                >
                  <span>Continue to FATCA &amp; Nominee</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: FATCA & Nominee Declaration */}
          {form.currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-blue-600" /> Step 4: FATCA / CRS Declaration &amp; Nominee
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  SEBI &amp; Income Tax mandate mandatory FATCA declaration and at least one nominee registration for all mutual fund folios.
                </p>
              </div>

              {/* FATCA Block */}
              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                  1. FATCA / Tax Residency Declaration
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Country of Tax Residency
                    </label>
                    <input
                      type="text"
                      disabled
                      value="India Only (Resident Individual)"
                      className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-xs text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Gross Annual Income Slab
                    </label>
                    <select
                      value={form.incomeSlab}
                      onChange={(e) => setForm((prev) => ({ ...prev, incomeSlab: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    >
                      <option value="1_TO_5_LAKH">₹1 Lakh – ₹5 Lakhs</option>
                      <option value="5_TO_10_LAKH">₹5 Lakhs – ₹10 Lakhs</option>
                      <option value="10_TO_25_LAKH">₹10 Lakhs – ₹25 Lakhs</option>
                      <option value="ABOVE_25_LAKH">Above ₹25 Lakhs</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    id="pep-check"
                    checked={form.isPep}
                    onChange={(e) => setForm((prev) => ({ ...prev, isPep: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <label htmlFor="pep-check">
                    I am a Politically Exposed Person (PEP) or related to a PEP
                  </label>
                </div>
              </div>

              {/* Nominee Block */}
              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                  2. Primary Nominee Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Nominee Full Name *
                    </label>
                    <input
                      type="text"
                      value={form.nomineeName}
                      onChange={(e) => setForm((prev) => ({ ...prev, nomineeName: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Relationship *
                    </label>
                    <select
                      value={form.nomineeRelation}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, nomineeRelation: e.target.value }))
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Brother">Brother</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Nominee Share (%)
                    </label>
                    <input
                      type="number"
                      value={form.nomineeShare}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, nomineeShare: Number(e.target.value) }))
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setForm((prev) => ({ ...prev, currentStep: 3 }))}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-slate-900 px-3 py-2 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setForm((prev) => ({ ...prev, currentStep: 5 }))}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-xs"
                >
                  <span>Continue to Risk Profiling</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Risk Profiling */}
          {form.currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" /> Step 5: SEBI Risk Suitability Profiling
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Assess investor risk tolerance before recommending High Growth / Small-Cap schemes.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200">
                  <label className="text-xs font-bold text-slate-900 block mb-2">
                    1. What is your expected investment horizon?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'LESS_THAN_3_YEARS', label: 'Short Term (< 3 Years)' },
                      { id: '3_TO_5_YEARS', label: 'Medium Term (3 - 5 Years)' },
                      { id: 'MORE_THAN_5_YEARS', label: 'Long Term (5+ Years)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setForm((prev) => ({ ...prev, investmentHorizon: opt.id }))}
                        className={`text-xs p-2.5 rounded-lg border text-left transition ${
                          form.investmentHorizon === opt.id
                            ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold'
                            : 'bg-white border-gray-300 text-slate-700 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200">
                  <label className="text-xs font-bold text-slate-900 block mb-2">
                    2. If the stock market drops 15% in a month, what will you do?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'PANIC_EXIT', label: 'Sell and preserve capital in liquid funds' },
                      { id: 'BALANCED', label: 'Hold tight and wait for market recovery' },
                      { id: 'HIGH_GROWTH', label: 'Buy more units at discounted NAV!' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setForm((prev) => ({ ...prev, riskTolerance: opt.id }))}
                        className={`text-xs p-2.5 rounded-lg border text-left transition ${
                          form.riskTolerance === opt.id
                            ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold'
                            : 'bg-white border-gray-300 text-slate-700 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Computed Risk Result Banner */}
                <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-500 block uppercase font-bold">
                      Calculated Investor Risk Category
                    </span>
                    <span className="text-base font-extrabold text-blue-700">
                      {calculateRisk()} PROFILE
                    </span>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 font-medium">
                    High Growth &amp; Equity Eligible
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setForm((prev) => ({ ...prev, currentStep: 4 }))}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-slate-900 px-3 py-2 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setForm((prev) => ({ ...prev, currentStep: 6 }))}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-xs"
                >
                  <span>Continue to Video IPV &amp; e-Sign</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Video IPV & Aadhaar eSign + BSE UCC Creation */}
          {form.currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" /> Step 6: Live Video IPV &amp; BSE StAR UCC Creation
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  SEBI mandates In-Person Verification (IPV) with geo-tagging and timestamp watermark before dispatching UCC to BSE/NSE.
                </p>
              </div>

              {/* IPV Camera Area */}
              <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-200 text-center space-y-4">
                <div className="relative max-w-sm mx-auto rounded-xl overflow-hidden bg-gray-100 border border-gray-300 aspect-video flex items-center justify-center">
                  {isCapturingCamera ? (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  ) : capturedPhotoUrl ? (
                    <div className="relative w-full h-full">
                      <img
                        src={capturedPhotoUrl}
                        alt="IPV Snapshot"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-xs text-[10px] text-slate-800 p-1.5 rounded flex items-center justify-between font-mono border border-gray-200">
                        <span className="flex items-center gap-1 text-slate-700">
                          <MapPin className="w-3 h-3 text-blue-600" /> Lat 19.0760, Long 72.8777 (Mumbai)
                        </span>
                        <span className="flex items-center gap-1 text-slate-700">
                          <Clock className="w-3 h-3 text-blue-600" /> {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center space-y-2">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto" />
                      <span className="text-xs text-gray-500 block">
                        Live Web Camera / Selfie In-Person Verification
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-2">
                  {!isCapturingCamera ? (
                    <button
                      onClick={startCamera}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-xs transition"
                    >
                      <Camera className="w-3.5 h-3.5" /> Start Live Camera
                    </button>
                  ) : (
                    <button
                      onClick={capturePhoto}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-xs transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Capture Geo-Tagged Snapshot
                    </button>
                  )}
                </div>
              </div>

              {/* Aadhaar e-Sign Agreement */}
              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" /> Digital Aadhaar e-Sign on Account Opening Form (AOF)
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">NSDL / ESP ESP-99</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  I hereby authorize <strong>InvestorsEdge Wealth Partners (ARN-198420)</strong> to register my Unique Client Code (UCC) on BSE StAR MF and process mutual fund transactions on my behalf as an AMFI registered distributor.
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> OTP 891023 Authenticated via UIDAI e-Sign
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setForm((prev) => ({ ...prev, currentStep: 5 }))}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-slate-900 px-3 py-2 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmittingUcc}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-xs transition transform active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingUcc ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Registering on BSE StAR MF...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Generate UCC &amp; Activate Account
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
