import Web3 from 'web3';
import { Chains } from './chains';

const instanciateCoinbaseCloud = (): Web3 => {
  // Import environment variables
  const url = process.env.NODE_ENDPOINT as string;
  const username = process.env.NODE_USERNAME as string;
  const password = process.env.NODE_PASSWORD as string;

  // Create base64 string of project credentials
  const string = `${username}:${password}`;
  const base64String = Buffer.from(string).toString("base64");

  // Options
  const options = {
    keepAlive: true,
    withCredentials: true,
    timeout: 20000, // ms
    headers: [
      {
        name: 'Authorization',
        value: `Basic ${base64String}`
      },
    ]
  };

  // Create web3 node provider using project credentials
  const web3Provider = new Web3.providers.HttpProvider(url, options);
  return new Web3(web3Provider);
}

export const Web3Instances: { [chainId: string]: Web3 } = {
  [Chains.ethereum]: instanciateCoinbaseCloud(),
  [Chains.polygon]: new Web3('https://polygon-rpc.com'),
  [Chains.bsc]: new Web3('https://rpc.ankr.com/bsc'),
  [Chains.arbitrum]: new Web3('https://rpc.ankr.com/arbitrum'),
};
