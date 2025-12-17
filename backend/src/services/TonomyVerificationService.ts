// Service to verify Tonomy credentials and handle user session
import { decode, verify } from 'jsonwebtoken';
import { getTonomyConfig } from '../config/tonomy';

export interface KycCredential {
  issuer: string;
  subject: string;
  credentialType: string;
  kycVerified: boolean;
  claims: Record<string, any>;
  issuedAt: number;
  expiresAt: number;
}

export class TonomyVerificationService {
  async verifyKycCredential(credential: string): Promise<KycCredential> {
    try {
      const decoded = decode(credential, { complete: true });

      if (!decoded) {
        throw new Error('Invalid credential format');
      }

      const payload = decoded.payload as any;
      const header = decoded.header as any;

      if (header.typ !== 'JWT' && header.typ !== 'tonomy:credential') {
        throw new Error('Invalid credential type');
      }

      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Credential expired');
      }

      const config = getTonomyConfig();
      if (!payload.iss || !payload.iss.includes('tonomy')) {
        throw new Error('Invalid credential issuer');
      }

      const credentialSubject = payload.vc?.credentialSubject || payload;

      return {
        issuer: payload.iss,
        subject: payload.sub || payload.username,
        credentialType: payload.type || 'KYC',
        kycVerified: credentialSubject.kycVerified === true,
        claims: credentialSubject,
        issuedAt: payload.iat || Math.floor(Date.now() / 1000),
        expiresAt: payload.exp || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      };
    } catch (error) {
      console.error('KYC credential verification failed:', error);
      throw new Error(
        `Credential verification failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async verifyLoginOrigin(origin: string): Promise<boolean> {
    const config = getTonomyConfig();
    return origin === config.ssoOrigin || origin === `https://${new URL(config.ssoOrigin).hostname}`;
  }

  generateAccessToken(username: string, did: string): string {
    const payload = {
      sub: username,
      did,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      type: 'access_token',
    };

    return require('jsonwebtoken').sign(payload, process.env.SESSION_SECRET || 'default-secret', {
      algorithm: 'HS256',
    });
  }
}

export default new TonomyVerificationService();
