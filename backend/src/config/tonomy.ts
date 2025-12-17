// Tonomy configuration for backend
export interface TonomyConfig {
  network: 'mainnet' | 'testnet';
  ssoOrigin: string;
  blockchainUrl: string;
  keySecret?: string;
}

export function getTonomyConfig(): TonomyConfig {
  const network = (process.env.TONOMY_NETWORK || 'testnet') as 'mainnet' | 'testnet';

  if (network === 'mainnet') {
    return {
      network: 'mainnet',
      ssoOrigin: 'https://accounts.tonomy.io',
      blockchainUrl: 'https://blockchain-api.tonomy.io',
      keySecret: process.env.TONOMY_KEY_SECRET,
    };
  }

  return {
    network: 'testnet',
    ssoOrigin: process.env.TONOMY_SSO_ORIGIN || 'https://accounts.testnet.tonomy.io',
    blockchainUrl:
      process.env.TONOMY_BLOCKCHAIN_URL || 'https://blockchain-api-testnet.tonomy.io',
  };
}
