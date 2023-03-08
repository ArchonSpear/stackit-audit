//-----------------------------------------------------------------------------------------------//
import { address } from './address';
import { BN } from './bn';


//-----------------------------------------------------------------------------------------------//
export interface Stream {
  id: BN;
  route?: address[];
  owner?: address;

  // getStreamStats
  amount: BN;
  totalAmount: BN;
  buyWithSwapped: BN;
  toBuyReceived: BN;
  shares: BN;

  // getStreamDetails
  interval: BN;
  startTime: BN;
  lastSwap: BN;
  isactive: BN;
  buyWith: address;
  toBuy: address;
  iteration: BN;
}


//-----------------------------------------------------------------------------------------------//
export interface PooledStream {
  totalAmount: BN;
  interval: BN;
  startTime: BN;
  lastSwap: BN;
  isactive: BN;
  buyWithSwapped: BN;
  toBuyReceived: BN;
  route?: address[];
  buyWith: address;
  toBuy: address;
  shares: BN;
}


//-----------------------------------------------------------------------------------------------//
export type Position = {
  id: BN
  streamInfo: Stream
  assetIn: { name: string, ticker: string, chainId: string }
  assetOut: { name: string, ticker: string, chainId: string }
  status: "ongoing" | "finished" | "paused"
  invested: BN
  pnl: BN
  startDate: Date
  endDate: Date
}
