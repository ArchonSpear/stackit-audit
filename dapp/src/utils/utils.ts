import Web3 from 'web3';
import { Chains } from '../web3/constants/chains';
import { BN } from '../web3/types/bn';

export const sol_require = (condition: boolean, message?: string): void => {
  if (!condition) {
    throw new Error(message);
  }
  return;
};

export const shortAddress = (address: string) => {
  if (!address) return 'No Account';
  return `${address.slice(0, 6)}...${address.slice(36, 42)}`;
};

export const NAVIGATION_ITEMS = [
  { label: 'Invest', route: '/', isDisabled: false },
  { label: 'Positions', route: '/positions', isDisabled: false },
  { label: 'Referrals', route: '/referrals', isDisabled: false },
];

export const POSITION_FILTER_OPTIONS = [
  { label: 'All', value: 'all', color: 'grey' },
  { label: 'Ongoing', value: 'ongoing', color: 'green' },
  { label: 'Finished', value: 'finished', color: 'red' },
  { label: 'Paused', value: 'paused', color: 'yellow' },
];

export const INVEST_PERIOD_OPTIONS = [
  { title: 'Daily', id: 'daily', value: new BN(86400) },
  { title: 'Weekly', id: 'weekly', value: new BN(604800) },
  { title: 'Fortnightly', id: 'fortnightly', value: new BN(1209600) },
  { title: 'Monthly', id: 'monthly', value: new BN(2629746) },
];

export const INVEST_STABLECOINS = [
  { label: 'BUSD', value: 'BUSD', image: 'images/logo-busd.svg', isDisabled: false },
  { label: 'USDT', value: 'USDT', image: 'images/logo-usdt.svg', isDisabled: false },
  { label: 'USDC', value: 'USDC', image: 'images/logo-usdc.svg', isDisabled: false },
  { label: 'DAI', value: 'DAI', image: 'images/logo-dai.svg', isDisabled: true },
];

export const INVEST_YIELDS = [
  { label: 'None', value: 'Do not stake', image: 'images/icon-close.svg', isDisabled: false },
  { label: 'Stargate', value: 'stargate.finance', image: 'images/icon-chevron-up.svg', isDisabled: false },
];

export const REFERRAL_TIERS = [
  { tier: '$0 - $999', discount: 'Cashback: 0%', referral: 'Referral: 1%' },
  { tier: '$1,000 - $9,999', discount: 'Cashback: 2%', referral: 'Referral: 5%' },
  { tier: '$10,000 - $99,999', discount: 'Cashback: 4%', referral: 'Referral: 10%' },
  { tier: '$100,000 - $999,999', discount: 'Cashback: 6%', referral: 'Referral: 20%' },
  { tier: '$1,000,000 +', discount: 'Cashback: 8%', referral: 'Referral: 40%' },
];

export const DEFAULT_INVEST_MIN_AMOUNT_PER_SWAP = new BN(5);
export const INVEST_MIN_ITERATIONS = 2;

export const SUPPORTED_CHAINS = [
  '0x38', // BSC
  '0xa4b1', // ARBITRUM
];

export const NETWORKS = {
  '0xa4b1': {
    chainName: 'Arbitrum One',
    chainId: '0xa4b1',
    nativeCurrency: {
      name: 'ETH',
      decimals: 18,
      symbol: 'ETH',
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io'],
  },
  '0x38': {
    chainName: 'BNB Smart Chain',
    chainId: '0x38',
    nativeCurrency: {
      name: 'BNB',
      decimals: 18,
      symbol: 'BNB',
    },
    rpcUrls: ['https://rpc.ankr.com/bsc/'],
    blockExplorerUrls: ['https://bscscan.com/'],
  },
}

export const DEFAULT_NETWORK = NETWORKS['0xa4b1'];

export const MAX_VALUE = new BN('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const handleNetworkSwitch = async () => {
  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: DEFAULT_NETWORK.chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [DEFAULT_NETWORK],
        });
      } catch (addError) {
        // handle "add" error
      }
    }
    // handle other "switch" errors
  }
}
