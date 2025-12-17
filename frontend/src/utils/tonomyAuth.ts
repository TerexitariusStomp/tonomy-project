// Tonomy authentication utilities
import { setSettings, ExternalUser } from '@tonomy/tonomy-id-sdk';
import { getTonomyConfig } from '@/config/tonomy.config';

export interface TonomyUser {
  username: string;
  did: string;
  email?: string;
  loginTimestamp: string;
}

export interface TonomyLoginResponse {
  user: TonomyUser;
  data: {
    kyc?: {
      value: Record<string, any>;
      verifiableCredential: string;
    };
    email?: string;
  };
}

// Initialize Tonomy SDK
export function initializeTonomy() {
  const config = getTonomyConfig();
  setSettings({
    ssoWebsiteOrigin: config.ssoWebsiteOrigin,
    blockchainUrl: config.blockchainUrl,
  });
}

// Initiate login flow
export async function initiateLoginWithTonomy(dataRequest?: {
  username?: boolean;
  kyc?: boolean;
  email?: boolean;
}) {
  try {
    const config = getTonomyConfig();

    await ExternalUser.loginWithTonomy({
      callbackPath: config.callbackPath,
      dataRequest: dataRequest || { username: true },
    });
  } catch (error) {
    console.error('Failed to initiate Tonomy login:', error);
    throw error;
  }
}

// Process callback and verify response
export async function processLoginCallback(): Promise<TonomyLoginResponse> {
  try {
    const result = await ExternalUser.verifyLoginResponse({
      external: true,
    });

    if (!result.user) {
      throw new Error('No user data in login response');
    }

    return {
      user: {
        username: result.user.username,
        did: result.user.did,
        email: result.user.email,
        loginTimestamp: new Date().toISOString(),
      },
      data: result.data || {},
    };
  } catch (error) {
    console.error('Failed to verify login response:', error);
    throw error;
  }
}

// Session storage helpers
export function saveUserSession(user: TonomyUser) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('tonomyUser', JSON.stringify(user));
  }
}

export function getUserSession(): TonomyUser | null {
  if (typeof window === 'undefined') return null;

  const stored = sessionStorage.getItem('tonomyUser');
  return stored ? JSON.parse(stored) : null;
}

export function isAuthenticated(): boolean {
  return getUserSession() !== null;
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('tonomyUser');
  }
}
