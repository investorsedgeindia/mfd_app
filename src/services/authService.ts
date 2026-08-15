import { AuthSession, ClientProfile, UserAccount } from '../types';
import { SAMPLE_CLIENTS } from '../data/sampleData';

const USERS_STORAGE_KEY = 'mfd_users_db_v1';
const SESSION_STORAGE_KEY = 'mfd_auth_session_v1';

// Seed initial users from sample data
export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-distributor-1',
    email: 'investorsedgeindia@gmail.com',
    pan: 'AAAPI1984K',
    phone: '+91 98200 12345',
    name: 'Investors Edge Financial (MFD Admin)',
    password: 'Distributor@123',
    role: 'distributor',
    createdAt: '2022-01-01',
  },
  {
    id: 'user-cli-001',
    email: 'rajesh.sharma@example.com',
    pan: 'ABCPS1234K',
    phone: '+91 98210 98765',
    name: 'Rajesh V. Sharma',
    password: 'Investor@123',
    role: 'client',
    clientId: 'cli-001',
    createdAt: '2022-03-15',
  },
  {
    id: 'user-cli-002',
    email: 'priya.patel@example.com',
    pan: 'BHKPP8492L',
    phone: '+91 98450 11223',
    name: 'Priya Ananya Patel',
    password: 'Investor@123',
    role: 'client',
    clientId: 'cli-002',
    createdAt: '2023-01-10',
  },
  {
    id: 'user-cli-003',
    email: 'vikram.malhotra@example.com',
    pan: 'AYZPM9012F',
    phone: '+91 98110 55443',
    name: 'Dr. Vikram Malhotra',
    password: 'Investor@123',
    role: 'client',
    clientId: 'cli-003',
    createdAt: '2021-08-20',
  },
  {
    id: 'user-cli-004',
    email: 'ananya.d@example.com',
    pan: 'CGHPD4512N',
    phone: '+91 97654 32109',
    name: 'Ananya Deshmukh',
    password: 'Investor@123',
    role: 'client',
    clientId: 'cli-004',
    createdAt: '2023-09-01',
  },
];

export function getStoredUsers(): UserAccount[] {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users in localStorage', err);
  }
}

export function getStoredSession(): AuthSession | null {
  try {
    const data = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveStoredSession(session: AuthSession | null): void {
  try {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to update session in localStorage', err);
  }
}

export function loginWithCredentials(
  identifier: string, // Email, PAN, or Phone
  password: string,
  clientsList: ClientProfile[]
): { success: boolean; session?: AuthSession; message?: string } {
  const cleanId = identifier.trim().toUpperCase();
  const users = getStoredUsers();

  const matchedUser = users.find(
    (u) =>
      u.email.toUpperCase() === cleanId ||
      u.pan.toUpperCase() === cleanId ||
      u.phone.replace(/[\s+-]/g, '') === cleanId.replace(/[\s+-]/g, '')
  );

  if (!matchedUser) {
    return {
      success: false,
      message: 'No account found with this Email / PAN. Please verify or register a new investor account.',
    };
  }

  if (matchedUser.password !== password) {
    return {
      success: false,
      message: 'Incorrect password. Try demo password "Investor@123" or reset your password.',
    };
  }

  const clientProfile = matchedUser.clientId
    ? clientsList.find((c) => c.id === matchedUser.clientId)
    : undefined;

  const session: AuthSession = {
    user: matchedUser,
    clientProfile,
    token: `token_${matchedUser.id}_${Date.now()}`,
    loginTime: new Date().toISOString(),
  };

  saveStoredSession(session);
  return { success: true, session };
}

export function loginWithOtp(
  identifier: string,
  otp: string,
  clientsList: ClientProfile[]
): { success: boolean; session?: AuthSession; message?: string } {
  const cleanId = identifier.trim().toUpperCase();
  const users = getStoredUsers();

  const matchedUser = users.find(
    (u) =>
      u.email.toUpperCase() === cleanId ||
      u.pan.toUpperCase() === cleanId ||
      u.phone.replace(/[\s+-]/g, '') === cleanId.replace(/[\s+-]/g, '')
  );

  if (!matchedUser) {
    return {
      success: false,
      message: 'No account found for this PAN / Mobile.',
    };
  }

  // Accept any 6-digit OTP in demo mode
  if (!/^\d{6}$/.test(otp.trim())) {
    return {
      success: false,
      message: 'Please enter a valid 6-digit OTP (e.g. 123456).',
    };
  }

  const clientProfile = matchedUser.clientId
    ? clientsList.find((c) => c.id === matchedUser.clientId)
    : undefined;

  const session: AuthSession = {
    user: matchedUser,
    clientProfile,
    token: `token_otp_${matchedUser.id}_${Date.now()}`,
    loginTime: new Date().toISOString(),
  };

  saveStoredSession(session);
  return { success: true, session };
}

export function registerNewClientAccount(
  data: {
    name: string;
    email: string;
    phone: string;
    pan: string;
    password: string;
    city: string;
    state: string;
  },
  clientsList: ClientProfile[]
): { success: boolean; session?: AuthSession; newClient?: ClientProfile; message?: string } {
  const users = getStoredUsers();
  const cleanPan = data.pan.trim().toUpperCase();
  const cleanEmail = data.email.trim().toLowerCase();

  if (users.some((u) => u.pan.toUpperCase() === cleanPan)) {
    return {
      success: false,
      message: `An account already exists for PAN ${cleanPan}. Please sign in instead.`,
    };
  }

  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return {
      success: false,
      message: `An account already exists for Email ${cleanEmail}. Please sign in instead.`,
    };
  }

  const newClientId = `cli-${Date.now()}`;
  const newUserAccount: UserAccount = {
    id: `user-${newClientId}`,
    email: cleanEmail,
    pan: cleanPan,
    phone: data.phone.trim(),
    name: data.name.trim(),
    password: data.password,
    role: 'client',
    clientId: newClientId,
    createdAt: new Date().toISOString().split('T')[0],
  };

  // Generate initial client profile
  const newClientProfile: ClientProfile = {
    id: newClientId,
    name: data.name.trim(),
    email: cleanEmail,
    phone: data.phone.trim(),
    pan: cleanPan,
    dateOfBirth: '1995-01-01',
    gender: 'MALE',
    city: data.city || 'Mumbai',
    state: data.state || 'Maharashtra',
    pincode: '400001',
    kycStatus: 'VALIDATED',
    kraAgency: 'CVL_KRA',
    aadhaarLast4: '9988',
    digilockerVerified: true,
    bankDetails: {
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50100' + Math.floor(100000000 + Math.random() * 900000000),
      maskedAccountNumber: '••••••••' + Math.floor(1000 + Math.random() * 9000),
      ifscCode: 'HDFC0000240',
      accountType: 'SAVINGS',
      branchName: (data.city || 'Mumbai') + ' Main',
      verifiedName: data.name.trim().toUpperCase(),
      pennyDropSuccess: true,
      pennyDropRefId: 'PENNY_REF_' + Date.now(),
      mandateApproved: true,
    },
    nominees: [
      {
        name: 'Family Nominee',
        relation: 'Spouse',
        dateOfBirth: '1996-05-10',
        sharePercentage: 100,
        isMinor: false,
      },
    ],
    riskProfile: 'MODERATE',
    uccBse: `UCC_${cleanPan}`,
    uccNse: `NSE_${cleanPan}`,
    fatcaTaxResidentIndia: true,
    pepStatus: false,
    joinedDate: new Date().toISOString().split('T')[0],
    totalInvested: 0,
    currentValue: 0,
    absoluteReturn: 0,
    xirr: 0,
    activeSipMonthly: 0,
  };

  const updatedUsers = [...users, newUserAccount];
  saveStoredUsers(updatedUsers);

  const session: AuthSession = {
    user: newUserAccount,
    clientProfile: newClientProfile,
    token: `token_${newUserAccount.id}_${Date.now()}`,
    loginTime: new Date().toISOString(),
  };

  saveStoredSession(session);

  return {
    success: true,
    session,
    newClient: newClientProfile,
  };
}

export function resetPassword(
  identifier: string,
  newPassword: string
): { success: boolean; message: string } {
  const cleanId = identifier.trim().toUpperCase();
  const users = getStoredUsers();

  const userIndex = users.findIndex(
    (u) =>
      u.email.toUpperCase() === cleanId ||
      u.pan.toUpperCase() === cleanId ||
      u.phone.replace(/[\s+-]/g, '') === cleanId.replace(/[\s+-]/g, '')
  );

  if (userIndex === -1) {
    return { success: false, message: 'No registered user found with that identifier.' };
  }

  users[userIndex].password = newPassword;
  saveStoredUsers(users);
  return { success: true, message: 'Password reset successfully. You can now sign in.' };
}
