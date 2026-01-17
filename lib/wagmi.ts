import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat } from 'wagmi/chains';
import { http } from 'wagmi';

type SalvusWagmiConfig = ReturnType<typeof getDefaultConfig>;

declare global {
  interface Window {
    __SALVUS_WC_CONFIG__?: SalvusWagmiConfig;
    __WC_INITED__?: boolean;
  }
}

let cachedConfig: SalvusWagmiConfig | undefined;

function createConfig(): SalvusWagmiConfig {
  return getDefaultConfig({
    appName: 'Salvus',
    projectId: '30a7d8617d62d0f7842321c81e2ecb37',
    chains: [hardhat],
    transports: {
      [hardhat.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545'),
    },
  });
}

export function initWalletConnect() {
  if (cachedConfig) {
    return;
  }

  if (typeof window === 'undefined') {
    cachedConfig = createConfig();
    return;
  }

  const w = window as Window;

  if (w.__SALVUS_WC_CONFIG__) {
    cachedConfig = w.__SALVUS_WC_CONFIG__;
    return;
  }

  if (w.__WC_INITED__) {
    return;
  }

  const config = createConfig();

  w.__WC_INITED__ = true;
  w.__SALVUS_WC_CONFIG__ = config;
  cachedConfig = config;
}

export function getWagmiConfig(): SalvusWagmiConfig {
  if (!cachedConfig) {
    initWalletConnect();
  }

  if (!cachedConfig) {
    throw new Error('WalletConnect config failed to initialize');
  }

  return cachedConfig;
}

export const config = getWagmiConfig();
