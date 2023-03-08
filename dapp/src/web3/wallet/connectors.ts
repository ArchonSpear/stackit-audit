import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';

const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 137, 56, 42161],
});

const walletconnect = new WalletConnectConnector({
  rpc: 'https://rpc.ankr.com/bsc',
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
});

const walletlink = new WalletLinkConnector({
  url: 'https://rpc.ankr.com/bsc',
  appName: 'stackit',
});

export const connectors: { [key: string]: any } = {
  injected: injected,
  walletConnect: walletconnect,
  coinbaseWallet: walletlink,
};
