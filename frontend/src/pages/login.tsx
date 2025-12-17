// Login page
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { TonomyLoginButton } from '@/components/TonomyLoginButton';
import { isAuthenticated } from '@/utils/tonomyAuth';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome to Tonomy Project</h1>
        <p>Login with your Tonomy ID to access the platform</p>

        <div className="login-options">
          <TonomyLoginButton
            className="tonomy-login-btn"
            requestKyc={false}
            requestEmail={true}
            onError={(error) => {
              console.error('Login error:', error);
            }}
          />
        </div>

        <div className="login-info">
          <p>Don't have a Tonomy ID?</p>
          <a href="https://tonomy.io/tonomy-id" target="_blank" rel="noopener noreferrer">
            Create one here
          </a>
        </div>
      </div>
    </div>
  );
}
