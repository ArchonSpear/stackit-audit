//-----------------------------------------------------------------------------------------------//
export interface ITxPayload {
  nonce?: number; // The nonce to use when signing this transaction. Default will use web3.eth.getTransactionCount().
  chainId?: number; // The chain id to use when signing this transaction.Default will use web3.eth.net.getId().
  to?: string; // The receiver of the transaction, can be empty when deploying a contract.
  data?: string; // The call data of the transaction, can be empty for simple value transfers.
  value?: string; // The value of the transaction in wei.
  gasPrice?: string; // The gas price set by this transaction, if empty, it will use web3.eth.getGasPrice()
  gas: string; // The gas provided by the transaction.
  chain?: string; // Defaults to mainnet.
  hardfork?: string; // Defaults to berlin.
  Common?: {
    // The Common object
    customChain?: {
      // The custom chain properties
      name?: string; // The name of the chain
      networkId: number; // Network ID of the custom chain
      chainId: string; // Chain ID of the custom chain
    };
    baseChain?: string; // mainnet, goerli, kovan, rinkeby, or ropsten
    hardfork?: string; // chainstart, homestead, dao, tangerineWhistle, spuriousDragon, byzantium, constantinople, petersburg, istanbul, or berlin
  };
}

export interface ITransactionReceipt {
  blockHash: string;
  blockNumber: number;
  contractAddress: string | null;
  cumulativeGasUsed: number;
  from: string;
  gasUsed: number;
  logs: Array<{
    address: string;
    topics: Array<string>;
    data: string;
    blockNumber: number;
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    logIndex: number;
    removed: boolean;
    id: string;
  }>;
  logsBloom: string;
  status: boolean;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  type: '0x0' | '0x1';
}
