// Configuration for Tonomy SDK across environments
export const getTonomyConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isTestnet = process.env.VITE_TONOMY_NETWORK === 'testnet';

  if (isProduction && !isTestnet) {
    return {
      ssoWebsiteOrigin: 'https://accounts.tonomy.io',
      blockchainUrl: 'https://blockchain-api.tonomy.io',
      appName: 'Tonomy Project',
      callbackPath: '/auth/callback',
    };
  }

  // Testnet/Development
  return {
    ssoWebsiteOrigin:
      process.env.VITE_TONOMY_SSO_ORIGIN || 'https://accounts.testnet.tonomy.io',
    blockchainUrl:
      process.env.VITE_TONOMY_BLOCKCHAIN_URL || 'https://blockchain-api-testnet.tonomy.io',
    appName: 'Tonomy Project (Testnet)',
    callbackPath: '/auth/callback',
  };
};
