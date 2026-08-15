/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfigStatus } from '../types';

const rawUrl = (((import.meta as any)?.env?.VITE_SUPABASE_URL as string) || '').trim();
const rawKey = (((import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string) || '').trim();

export const isSupabaseConfigured: boolean = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl.startsWith('https://') &&
  !rawUrl.includes('your-project-ref') &&
  !rawKey.includes('your-supabase-anon-key')
);

// Initialize Supabase Client if configured, otherwise create a mock-safe instance
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawUrl, rawKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const getSupabaseConfig = (): SupabaseConfigStatus => {
  return {
    isConfigured: isSupabaseConfigured,
    isConnected: false,
    url: rawUrl || undefined,
    mode: isSupabaseConfigured ? 'SUPABASE_CLOUD' : 'LOCAL_OFFLINE',
  };
};

/**
 * Validates connection to the live Supabase instance by pinging distributor_profiles
 */
export async function checkSupabaseConnection(): Promise<SupabaseConfigStatus> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      isConfigured: false,
      isConnected: false,
      url: rawUrl,
      mode: 'LOCAL_OFFLINE',
      lastChecked: new Date().toISOString(),
      error: 'Supabase credentials not configured in .env (Running in Local Mode)',
    };
  }

  try {
    const { data, error } = await supabase
      .from('distributor_profiles')
      .select('arn')
      .limit(1);

    if (error) {
      return {
        isConfigured: true,
        isConnected: false,
        url: rawUrl,
        mode: 'LOCAL_OFFLINE',
        lastChecked: new Date().toISOString(),
        error: error.message || 'Failed to query Supabase tables. Ensure SQL schema is executed.',
      };
    }

    return {
      isConfigured: true,
      isConnected: true,
      url: rawUrl,
      mode: 'SUPABASE_CLOUD',
      lastChecked: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      isConnected: false,
      url: rawUrl,
      mode: 'LOCAL_OFFLINE',
      lastChecked: new Date().toISOString(),
      error: err?.message || 'Network error connecting to Supabase instance',
    };
  }
}
