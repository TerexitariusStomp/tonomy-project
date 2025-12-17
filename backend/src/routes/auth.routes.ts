// Express routes for authentication endpoints
import { Router, Request, Response } from 'express';
import TonomyVerificationService from '../services/TonomyVerificationService';
import UserService from '../services/UserService';

const router = Router();

// POST /api/auth/verify-kyc
router.post('/verify-kyc', async (req: Request, res: Response) => {
  try {
    const { username, credential } = req.body;

    if (!username || !credential) {
      return res.status(400).json({ error: 'Missing username or credential' });
    }

    const kycData = await TonomyVerificationService.verifyKycCredential(credential);

    if (kycData.subject !== username) {
      return res.status(400).json({ error: 'Username mismatch in credential' });
    }

    await UserService.recordKycVerification(username, kycData.claims.id, kycData.kycVerified);

    return res.json({
      success: true,
      kycVerified: kycData.kycVerified,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('KYC verification failed:', error);
    return res.status(400).json({
      error: error instanceof Error ? error.message : 'Verification failed',
    });
  }
});

// POST /api/auth/login-callback
router.post('/login-callback', async (req: Request, res: Response) => {
  try {
    const { username, did, email } = req.body;

    if (!username || !did) {
      return res.status(400).json({ error: 'Missing user data' });
    }

    const user = await UserService.upsertUser({
      username,
      did,
      email,
    });

    const accessToken = TonomyVerificationService.generateAccessToken(username, did);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.tonomyUsername,
        did: user.did,
        kycVerified: user.kycVerified,
      },
    });
  } catch (error) {
    console.error('Login callback failed:', error);
    return res.status(400).json({
      error: error instanceof Error ? error.message : 'Login failed',
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const username = (req as any).user?.username;

    if (!username) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await UserService.findByUsername(username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        id: user.id,
        username: user.tonomyUsername,
        did: user.did,
        email: user.email,
        kycVerified: user.kycVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('accessToken');
  return res.json({ success: true });
});

export function authenticateToken(req: Request, res: Response, next: Function) {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = require('jsonwebtoken').verify(
      token,
      process.env.SESSION_SECRET || 'default-secret'
    );
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export default router;
