// React component for Tonomy login
import { useState } from 'react';
import { initiateLoginWithTonomy } from '@/utils/tonomyAuth';

export interface TonomyLoginButtonProps {
  className?: string;
  requestKyc?: boolean;
  requestEmail?: boolean;
  onError?: (error: Error) => void;
}

export function TonomyLoginButton({
  className,
  requestKyc = false,
  requestEmail = false,
  onError,
}: TonomyLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      await initiateLoginWithTonomy({
        username: true,
        kyc: requestKyc,
        email: requestEmail,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      onError?.(error);
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleClick} disabled={loading} className={className}>
        {loading ? 'Connecting to Tonomy...' : 'Login with Tonomy ID'}
      </button>
      {error && (
        <div className="error-message" style={{ color: 'red', marginTop: '8px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
