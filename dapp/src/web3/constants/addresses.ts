import { Assets } from './assets';
import { Chains } from './chains';
import { address } from '../types/address';

export const Addresses: {
  [name: string]: { [chainId: string]: address };
} = {
  [Assets.MATIC]: {
    [Chains.polygon]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  },
  [Assets.DAI]: {
    [Chains.polygon]: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
  },
  [Assets.BUSD]: {
    [Chains.bsc]: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
  },
  [Assets.USDC]: {
    [Chains.polygon]: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    [Chains.bsc]: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  },
  [Assets.USDT]: {
    [Chains.polygon]: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    [Chains.bsc]: '0x55d398326f99059fF775485246999027B3197955',
  },
  [Assets.BTC]: {
    [Chains.polygon]: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
  },
  [Assets.ETH]: {
    [Chains.polygon]: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  },
  [Assets.AVAX]: {
    [Chains.polygon]: '0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b',
  },
  [Assets.MANA]: {
    [Chains.polygon]: '0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4',
  },
  [Assets.SAND]: {
    [Chains.polygon]: '0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683',
  },
  [Assets.LINK]: {
    [Chains.polygon]: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
  },
  [Assets.AAVE]: {
    [Chains.polygon]: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
  },
  [Assets.CRV]: {
    [Chains.polygon]: '0x172370d5cd63279efa6d502dab29171933a610af',
  },
  'STACKIT': {
    [Chains.polygon]: '0xceB5AB48b0E4DE27d24D30FBd934eb7D7049F213',
  },
  'STACKIT_V2': {
    [Chains.polygon]: '0x95D9B99827ab119716d02c574E011367553d1687',
  },
  'STACKIT_V3': {
    [Chains.bsc]: '0x848109AcBD6EFD1acF4521aCDc78Cb8b4A19f99e',
    [Chains.arbitrum]: '0xA9E2C2AcDDD2A6814fC1b1B9B00b0B3a0E6aEd14',
  },
  'MOO_STARGATE_USDC': {
    [Chains.polygon]: '0x2f4bba9fc4f77f16829f84181eb7c8b50f639f95',
    [Chains.arbitrum]: '0x892785f33cdee22a30aef750f285e18c18040c3e',
  },
  'MOO_STARGATE_USDT': {
    [Chains.polygon]: '0x1C480521100c962F7da106839a5A504B5A7457a1',
    [Chains.arbitrum]: '0xb6cfcf89a7b22988bfc96632ac2a9d6dab60d641',
  },
  'STACKIT_POOLED': {
    [Chains.polygon]: '0x92B2775E05CCabc2d603cae27F1722a7EC9149c5',
  },
  'REFERRAL_FEES_AGGREGATOR': {
    [Chains.polygon]: '0x4691c280AF93521241aD9878bbBeCB97b4b0840C',
    [Chains.bsc]: '0x8FE5338c514Ccbe69bB02bC204943D2098C9dd3a',
    [Chains.arbitrum]: '0x1e7Dff9E134Ce21d3D5b5698d196F06f925b0EfD',
  },
  'STACKIT_REFERRAL': {
    [Chains.polygon]: '0x77C7396Ad1c271268D02567aB73d83c4c1B1A171',
    [Chains.bsc]: '0x51099E1b1f598D1C70f50d969C808afc73Cd42De',
    [Chains.arbitrum]: '0x46F2939E8f9A0cE2f881a587aaD8FAA3320BBF5E',
  },
  'POOLED_CLAIMER': {
    [Chains.polygon]: '0x92809c11254D9291ed6662494738B22F50C08Dbd',
  }
};

export const ContractInfo: {
  [contract: address]: { name: string, ticker: string, chainId: string };
} = {
  // Coins
  '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270': { name: "Polygon", ticker: Assets.MATIC, chainId: Chains.polygon },
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': { name: "DAI", ticker: Assets.DAI, chainId: Chains.polygon },
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': { name: "USD Coin", ticker: Assets.USDC, chainId: Chains.polygon },
  '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d': { name: "USD Coin", ticker: Assets.USDC, chainId: Chains.bsc },
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': { name: "Tether", ticker: Assets.USDT, chainId: Chains.polygon },
  '0x55d398326f99059fF775485246999027B3197955': { name: "Tether", ticker: Assets.USDT, chainId: Chains.bsc },
  '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56': { name: "BUSD", ticker: Assets.BUSD, chainId: Chains.bsc },
  '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6': { name: "Bitcoin", ticker: Assets.BTC, chainId: Chains.polygon },
  '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619': { name: "Ethereum", ticker: Assets.ETH, chainId: Chains.polygon },
  '0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b': { name: "Avalanche", ticker: Assets.AVAX, chainId: Chains.polygon },
  '0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4': { name: "Mana", ticker: Assets.MANA, chainId: Chains.polygon },
  '0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683': { name: "Sandbox", ticker: Assets.SAND, chainId: Chains.polygon },
  '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39': { name: "Chainlink", ticker: Assets.LINK, chainId: Chains.polygon },
  '0xD6DF932A45C0f255f85145f286eA0b292B21C90B': { name: "Aave", ticker: Assets.AAVE, chainId: Chains.polygon },
  '0x172370d5cd63279efa6d502dab29171933a610af': { name: "Curve", ticker: Assets.CRV, chainId: Chains.polygon },


  // Vaults & LPs
  '0x2f4bba9fc4f77f16829f84181eb7c8b50f639f95': { name: "MOO_STARGATE_USDC", ticker: "", chainId: Chains.polygon },
  '0x1C480521100c962F7da106839a5A504B5A7457a1': { name: "MOO_STARGATE_USDT", ticker: "", chainId: Chains.polygon },


  // Stackit contracts
  '0xceB5AB48b0E4DE27d24D30FBd934eb7D7049F213': { name: "STACKIT", ticker: "", chainId: Chains.polygon },
  '0x95D9B99827ab119716d02c574E011367553d1687': { name: "STACKIT_V2", ticker: "", chainId: Chains.polygon },

  '0x848109AcBD6EFD1acF4521aCDc78Cb8b4A19f99e': { name: "STACKIT_V3", ticker: "", chainId: Chains.bsc },
  '0xA9E2C2AcDDD2A6814fC1b1B9B00b0B3a0E6aEd14': { name: "STACKIT_V3", ticker: "", chainId: Chains.arbitrum },

  '0x4691c280AF93521241aD9878bbBeCB97b4b0840C': { name: "REFERRAL_FEES_AGGREGATOR", ticker: "", chainId: Chains.polygon },
  '0x8FE5338c514Ccbe69bB02bC204943D2098C9dd3a': { name: "REFERRAL_FEES_AGGREGATOR", ticker: "", chainId: Chains.bsc },
  '0x1e7Dff9E134Ce21d3D5b5698d196F06f925b0EfD': { name: "REFERRAL_FEES_AGGREGATOR", ticker: "", chainId: Chains.arbitrum },

  '0x77C7396Ad1c271268D02567aB73d83c4c1B1A171': { name: "STACKIT_REFERRAL", ticker: "", chainId: Chains.polygon },
  '0x51099E1b1f598D1C70f50d969C808afc73Cd42De': { name: "STACKIT_REFERRAL", ticker: "", chainId: Chains.bsc },
  '0x46F2939E8f9A0cE2f881a587aaD8FAA3320BBF5E': { name: "STACKIT_REFERRAL", ticker: "", chainId: Chains.arbitrum },

  '0x92B2775E05CCabc2d603cae27F1722a7EC9149c5': { name: "STACKIT_POOLED", ticker: "", chainId: Chains.polygon },
  '0x92809c11254D9291ed6662494738B22F50C08Dbd': { name: "POOLED_CLAIMER", ticker: "", chainId: Chains.polygon }
};
