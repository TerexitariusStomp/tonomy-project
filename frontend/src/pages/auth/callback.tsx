// Callback handler after Tonomy login
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { processLoginCallback, saveUserSession, getUserSession } from '@/utils/tonomyAuth';

interface CallbackState {
  loading: boolean;
  error: string | null;
  authenticated: boolean;
}

export default function CallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<CallbackState>({
    loading: true,
    error: null,
    authenticated: false,
  });

  useEffect(() => {
    if (!router.isReady) return;

    async function handleCallback() {
      try {
        const response = await processLoginCallback();
        saveUserSession(response.user);

        if (response.data.kyc?.verifiableCredential) {
          try {
            const verifyResponse = await fetch('/api/auth/verify-kyc', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: response.user.username,
                credential: response.data.kyc.verifiableCredential,
              }),
            });

            if (!verifyResponse.ok) {
              console.warn('KYC verification warning:', verifyResponse.statusText);
            }
          } catch (err) {
            console.error('KYC verification error:', err);
          }
        }

        setState({
          loading: false,
          error: null,
          authenticated: true,
        });

        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } catch (error) {
        console.error('Callback processing failed:', error);
        setState({
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication failed',
          authenticated: false,
        });
      }
    }

    handleCallback();
  }, [router.isReady, router]);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>
          <h2>Authenticating with Tonomy...</h2>
          <p>Please wait while we verify your identity.</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="error-container">
          <h2>Authentication Error</h2>
          <p>{state.error}</p>
          <button onClick={() => router.push('/login')}>Back to Login</button>
        </div>
      </div>
    );
  }

  if (state.authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="success-container">
          <h2>Welcome!</h2>
          <p>Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
}
