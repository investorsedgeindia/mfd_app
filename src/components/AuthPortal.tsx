import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  CreditCard,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Building2,
  Smartphone,
  TrendingUp,
} from 'lucide-react';
import { AuthSession, ClientProfile, DistributorDetails } from '../types';
import {
  loginWithCredentials,
  loginWithOtp,
  registerNewClientAccount,
  resetPassword,
} from '../services/authService';

interface AuthPortalProps {
  distributor: DistributorDetails;
  clients: ClientProfile[];
  onLoginSuccess: (session: AuthSession, newClientCreated?: ClientProfile) => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  distributor,
  clients,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [roleTab, setRoleTab] = useState<'client' | 'distributor'>('client');

  // Login state
  const [identifier, setIdentifier] = useState('ABCPS1234K'); // Default demo: Rajesh Sharma
  const [password, setPassword] = useState('Investor@123');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Signup state
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    pan: '',
    password: '',
    confirmPassword: '',
    city: 'Mumbai',
    state: 'Maharashtra',
  });

  // Forgot password state
  const [forgotId, setForgotId] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [isForgotOtpSent, setIsForgotOtpSent] = useState(false);

  // Switch role tabs
  const handleRoleTabChange = (role: 'client' | 'distributor') => {
    setRoleTab(role);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (role === 'distributor') {
      setIdentifier('investorsedgeindia@gmail.com');
      setPassword('Distributor@123');
    } else {
      setIdentifier('ABCPS1234K');
      setPassword('Investor@123');
    }
  };

  // Trigger simulated OTP
  const handleSendOtp = (targetId: string, isForgot = false) => {
    if (!targetId.trim()) {
      setErrorMsg('Please enter your registered PAN, Email, or Mobile number first.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (isForgot) {
        setIsForgotOtpSent(true);
        setForgotOtp('123456');
      } else {
        setIsOtpSent(true);
        setOtp('123456');
      }
      setSuccessMsg('Verification OTP sent to your registered mobile and email. Demo OTP: 123456');
      setOtpTimer(30);
      const interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 600);
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (loginMethod === 'password') {
        const result = loginWithCredentials(identifier, password, clients);
        if (result.success && result.session) {
          onLoginSuccess(result.session);
        } else {
          setErrorMsg(result.message || 'Login failed. Please check your credentials.');
        }
      } else {
        const result = loginWithOtp(identifier, otp, clients);
        if (result.success && result.session) {
          onLoginSuccess(result.session);
        } else {
          setErrorMsg(result.message || 'Invalid OTP. Please try again.');
        }
      }
    }, 500);
  };

  // Handle Signup Submit
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!signupForm.name.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!signupForm.email.trim() || !signupForm.email.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (!signupForm.phone.trim() || signupForm.phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    const cleanPan = signupForm.pan.trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      setErrorMsg('Please enter a valid 10-character Indian Income Tax PAN (e.g. ABCPS1234K).');
      return;
    }
    if (signupForm.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const result = registerNewClientAccount(
        {
          name: signupForm.name,
          email: signupForm.email,
          phone: signupForm.phone,
          pan: cleanPan,
          password: signupForm.password,
          city: signupForm.city,
          state: signupForm.state,
        },
        clients
      );

      if (result.success && result.session) {
        onLoginSuccess(result.session, result.newClient);
      } else {
        setErrorMsg(result.message || 'Account registration failed.');
      }
    }, 700);
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!forgotId.trim()) {
      setErrorMsg('Please enter your registered PAN / Email.');
      return;
    }
    if (!forgotOtp.trim()) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    if (forgotNewPass.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    const result = resetPassword(forgotId, forgotNewPass);
    if (result.success) {
      setSuccessMsg(result.message);
      setAuthMode('login');
      setIdentifier(forgotId);
      setPassword(forgotNewPass);
    } else {
      setErrorMsg(result.message);
    }
  };

  // Quick Demo Login Shortcut
  const handleQuickDemoLogin = (pan: string, name: string) => {
    setRoleTab('client');
    setAuthMode('login');
    setLoginMethod('password');
    setIdentifier(pan);
    setPassword('Investor@123');
    setErrorMsg(null);
    setSuccessMsg(`Selected demo credentials for ${name}. Click "Sign In to Client Portal" below.`);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand & Trust Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>AMFI Registered MFD Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Secure Investor &amp; Advisor Access
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Login to view your consolidated mutual fund portfolio, live XIRR, SIP debits, capital gains statements, and execute paperless transactions.
            </p>
          </div>

          {/* Key Security Pillars */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">256-Bit Bank Grade Encryption</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Direct exchange integration with BSE StAR MF and NPCI e-NACH mandate routing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">SEBI &amp; AMFI Compliant</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  ARN-198420 | EUIN: E-428190 | Registered with all 44 Indian AMCs via CAMS &amp; KFintech.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Consolidated Single-View Tracking</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Automated CAS upload reconciliation with real-time NAV and benchmark alpha analysis.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Demo Credentials Card */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Demo Test Credentials
              </span>
              <span className="text-[10px] font-mono text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                1-Click Populate
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ABCPS1234K', 'Rajesh Sharma')}
                className="p-2 bg-white hover:bg-blue-100/60 rounded-xl border border-blue-200 text-left transition shadow-2xs"
              >
                <div className="font-semibold text-slate-800">Rajesh Sharma</div>
                <div className="text-[10px] text-gray-500 font-mono">PAN: ABCPS1234K</div>
                <div className="text-[10px] text-blue-600 font-medium mt-0.5">Pass: Investor@123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('BHKPP8492L', 'Priya Patel')}
                className="p-2 bg-white hover:bg-blue-100/60 rounded-xl border border-blue-200 text-left transition shadow-2xs"
              >
                <div className="font-semibold text-slate-800">Priya Patel</div>
                <div className="text-[10px] text-gray-500 font-mono">PAN: BHKPP8492L</div>
                <div className="text-[10px] text-blue-600 font-medium mt-0.5">Pass: Investor@123</div>
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                handleRoleTabChange('distributor');
                setAuthMode('login');
                setIdentifier('investorsedgeindia@gmail.com');
                setPassword('Distributor@123');
                setSuccessMsg('Distributor demo credentials populated (ARN-198420).');
              }}
              className="w-full text-center py-1.5 px-3 bg-white hover:bg-blue-100/60 text-blue-800 text-[11px] font-semibold rounded-lg border border-blue-200 transition"
            >
              Sign In as Distributor Admin (ARN-198420)
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Login / Register Card */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            {/* Top Mode Selector Tabs */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`text-sm font-bold pb-1 transition border-b-2 ${
                    authMode === 'login'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`text-sm font-bold pb-1 transition border-b-2 ${
                    authMode === 'signup'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-slate-900'
                  }`}
                >
                  Create New Investor Account
                </button>
              </div>

              {authMode === 'login' && (
                <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => handleRoleTabChange('client')}
                    className={`px-3 py-1 rounded-lg transition ${
                      roleTab === 'client'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-gray-600 hover:text-slate-900'
                    }`}
                  >
                    Investor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleTabChange('distributor')}
                    className={`px-3 py-1 rounded-lg transition ${
                      roleTab === 'distributor'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-gray-600 hover:text-slate-900'
                    }`}
                  >
                    Distributor
                  </button>
                </div>
              )}
            </div>

            {/* Error & Success Feedback Banners */}
            {errorMsg && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Method Switch: Password vs OTP */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="font-semibold text-slate-700">
                    {roleTab === 'client' ? 'Investor Portfolio Login' : 'MFD Partner Backoffice Login'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('password')}
                      className={`hover:underline ${loginMethod === 'password' ? 'font-bold text-blue-600' : 'text-gray-500'}`}
                    >
                      Password
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('otp')}
                      className={`hover:underline ${loginMethod === 'otp' ? 'font-bold text-blue-600' : 'text-gray-500'}`}
                    >
                      Fast OTP
                    </button>
                  </div>
                </div>

                {/* Identifier Input (PAN or Email) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {roleTab === 'client' ? 'Investor PAN / Registered Email *' : 'Distributor Email / ARN *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      {roleTab === 'client' ? <CreditCard className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={roleTab === 'client' ? 'e.g. ABCPS1234K or rajesh@example.com' : 'investorsedgeindia@gmail.com'}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition uppercase-placeholder"
                    />
                  </div>
                </div>

                {/* Password Input or OTP Input */}
                {loginMethod === 'password' ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setForgotId(identifier);
                        }}
                        className="text-[11px] text-blue-600 hover:underline font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        6-Digit Security OTP *
                      </label>
                      <button
                        type="button"
                        disabled={otpTimer > 0 || isLoading}
                        onClick={() => handleSendOtp(identifier)}
                        className="text-[11px] text-blue-600 hover:underline font-medium disabled:text-gray-400"
                      >
                        {isOtpSent ? (otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP') : 'Send OTP'}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit OTP (e.g. 123456)"
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-2 mt-4 active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>{roleTab === 'client' ? 'Sign In to Client Portfolio' : 'Sign In to Distributor Hub'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500">
                    New investor?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Create your investor account
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* 2. SIGN UP / CREATE ACCOUNT FORM */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name (As on PAN &amp; Aadhaar) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      placeholder="e.g. Ramesh Chandra Verma"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Permanent Account Number (PAN) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={10}
                        required
                        value={signupForm.pan}
                        onChange={(e) =>
                          setSignupForm({ ...signupForm, pan: e.target.value.toUpperCase() })
                        }
                        placeholder="ABCPS1234K"
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-sm font-mono uppercase text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number (For OTP &amp; BSE StAR) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={signupForm.phone}
                        onChange={(e) =>
                          setSignupForm({ ...signupForm, phone: e.target.value })
                        }
                        placeholder="+91 98765 43210"
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (For CAS statements &amp; Folio Alerts) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      placeholder="ramesh.verma@example.com"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Create Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={signupForm.password}
                        onChange={(e) =>
                          setSignupForm({ ...signupForm, password: e.target.value })
                        }
                        placeholder="At least 6 characters"
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={signupForm.confirmPassword}
                        onChange={(e) =>
                          setSignupForm({ ...signupForm, confirmPassword: e.target.value })
                        }
                        placeholder="Confirm password"
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={signupForm.city}
                      onChange={(e) => setSignupForm({ ...signupForm, city: e.target.value })}
                      placeholder="e.g. Mumbai"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={signupForm.state}
                      onChange={(e) => setSignupForm({ ...signupForm, state: e.target.value })}
                      placeholder="e.g. Maharashtra"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Creating Investor Account...</span>
                    ) : (
                      <>
                        <span>Complete Registration &amp; Open Portfolio</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-1">
                  <p className="text-xs text-gray-500">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* 3. FORGOT PASSWORD FORM */}
            {authMode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Registered PAN or Email *
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSendOtp(forgotId, true)}
                      className="text-[11px] text-blue-600 hover:underline font-medium"
                    >
                      {isForgotOtpSent ? 'Resend Code' : 'Send Code'}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={forgotId}
                    onChange={(e) => setForgotId(e.target.value)}
                    placeholder="Enter your PAN or Email"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    6-Digit Verification Code (Demo OTP: 123456) *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={forgotNewPass}
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="w-1/3 bg-gray-100 hover:bg-gray-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl transition"
                  >
                    Back to Login
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs transition"
                  >
                    Set New Password &amp; Continue
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
