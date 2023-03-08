//-----------------------------------------------------------------------------------------------//
import { STACKIT } from '../ABIs/stackit';
import { BN, value } from '../types/bn';
import { address } from '../types/address';
import { Contract } from '../types/contract';
import { Stream } from '../types/stream';
import { ITxPayload } from '../types/tx';
import { Addresses } from '../constants/addresses';
import { Web3Instances } from '../constants/web3';
import { VAULT } from '../ABIs/vault';
import { LP } from '../ABIs/lp';
import { Token } from '../types/token';

//-----------------------------------------------------------------------------------------------//
export class Stackit extends Contract {
  public _pancakeSwapFees: BN;

  constructor(chainId: string) {
    super(chainId, Addresses.STACKIT[chainId], STACKIT);
    this._pancakeSwapFees = null as any;
  }

  public async pancakeSwapFees(): Promise<BN> {
    this._pancakeSwapFees = new BN(await this.call('pancakeSwapFees'));
    return this._pancakeSwapFees;
  }

  /**
   * @param token address
   * @returns price in USD
   */
  public async getCollateralPrice(token: address): Promise<BN> {
    return new BN(await this.call('getCollateralPrice', token));
  }

  /**
   * @param streamId from Stackit.getAllStreams()
   * @returns vault shares
   * @todo call vault.getPricePerFullShare to get number of underlying LP
   */
  public async getUserShares(streamId: BN): Promise<BN> {
    return new BN(await this.call('getUserShares', streamId.toString()));
  }

  /**
   * @returns USD price of vault shares
   */
  public async getPricePerShare(vaultAddress: address, lpAddress: address): Promise<BN> {
    const vault = new Contract(this.chainId, vaultAddress, VAULT)
    const lp = new Contract(this.chainId, lpAddress, LP)
    const lpPerShare = new BN(await vault.call("getPricePerFullShare"))
    const reserves = await lp.call("getReserves")
    const dp0 = await new Token(this.chainId, await lp.call("token0")).decimals()
    const dp1 = await new Token(this.chainId, await lp.call("token1")).decimals()
    const r0Ether = new BN(reserves._reserve0).div('1e' + dp0)
    const r1Ether = new BN(reserves._reserve1).div('1e' + dp1)
    const lpTotalSupply = await lp.call("totalSupply")
    const usdPerLP = new BN(r0Ether).add(r1Ether).div(lpTotalSupply)
    return lpPerShare.mul(usdPerLP).trunc()
  }

  /**
   * @param streamId from Stackit.getAllStreams()
   * @param token address
   * @returns amount already swapped out of the stream
   */
  public async getMultipleAmountForStream(streamId: BN, token: address): Promise<BN> {
    return new BN(await this.call('getMultipleAmountForStream', streamId.toString(), token));
  }

  /**
   * @param streamId from Stackit.getAllStreams()
   * @returns cashback already received out of the stream
   */
  public async getStreamAggregatedDiscount(streamId: BN): Promise<BN> {
    return new BN(await this.call('getStreamAggregatedDiscount', streamId.toString()));
  }

  /**
   * @param streamId from Stackit.getAllStreams()
   * @returns remaining amount to be swapped in the stream
   */
  public async getAmountLeftInVault(streamId: BN): Promise<BN> {
    return new BN(await this.call('getAmountLeftInVault', streamId.toString()));
  }

  /**
   * @returns all active and inactive streamId
   */
  public async getAllStreams(): Promise<BN[]> {
    return (await this.call('getAllStreams')).map((id: string) => new BN(id));
  }

  /**
   * @returns all active streamId
   */
  public async fetchAllActiveStreams(): Promise<BN[]> {
    return (await this.call('fetchAllActiveStreams')).map((id: string) => new BN(id));
  }

  /**
   * @param basketId
   * @returns assets addresses in the basket
   */
  public async getAssetsAggregate(basketId: BN): Promise<address[]> {
    return await this.call('getAssetsAggregate', basketId.toString());
  }

  /**
   * @param buyWith asset 
   * @returns min buy per swap for given asset
   */
  public async getMinimumAmount(buyWith: address): Promise<BN> {
    return new BN(await this.call('getMinimumAmount', buyWith));
  }

  /**
   * @description activate a new DCA stream
   * @param amount per iteration
   * @param intervalInSec between iterations
   * @param buyWith token address
   * @param toBuy token address
   * @param iteration number of iterations
   * @param streamBasketOfAsset basketId
   * @param streamAggregateRepartition percent per asset (min 10%), total must be 100%
   * @param startTime of first buy
   * @returns tx payload
   */
  public activate(amount: BN, intervalInSec: BN, buyWith: address, toBuy: address, iteration: BN, streamBasketOfAsset: BN, streamAggregateRepartition: BN[], startTime: BN): ITxPayload {
    return {
      to: this.address,
      value: '0x0',
      gas: Web3Instances[this.chainId].utils.toHex('2000000'),
      data: this.instance.methods
        .activate(
          amount.toString(),
          intervalInSec.toString(),
          buyWith,
          toBuy,
          iteration.toString(),
          streamBasketOfAsset.toString(),
          streamAggregateRepartition.map(x => x.toString()),
          startTime.toString(),
        )
        .encodeABI(),
    };
  }

  /**
   * @param user address
   * @returns active or inactive streams for given user address
   */
  public async getListOfStreams(user: address): Promise<BN[]> {
    return (await this.call('getListOfStreams', user)).map((stream: string) => new BN(stream));
  }

  /**
   * @param streamId from Stackit.getAllStreams()
   * @returns basketId
   */
  public async getStreamBasketOfAssets(streamId: BN): Promise<BN> {
    return new BN(await this.call('getStreamBasketOfAssets', streamId.toString()));
  }

  /**
   * @param streamId from Stackit.getAllStreams()
   * @param assetIndex index withing multiStream
   * @returns percent per asset
   */
  public async getStreamRepartition(streamId: value, assetIndex: value): Promise<BN> {
    return new BN(await this.call('getStreamRepartition', streamId, assetIndex));
  }

  /**
   * @param streamId from Stackit.getAllStreams()
   * @returns partial stream info (IUserInfo)
   */
  private async getStreamStats(streamId: BN): Promise<Partial<Stream>> {
    return await this.call('getStreamStats', streamId.toString());
  }

  /**
   * @param streamId from Stackit.getAllStreams()
   * @returns partial stream info (IUserDetails)
   */
  private async getStreamDetails(streamId: BN): Promise<Partial<Stream>> {
    return await this.call('getStreamDetails', streamId.toString());
  }

  /**
   * @param streamId from Stackit.getAllStreams()
   * @returns stream info
   */
  public async getStreamInfo(streamId: BN): Promise<Stream> {
    const userInfo: any = await this.getStreamStats(streamId);
    const userDetails: any = await this.getStreamDetails(streamId);
    return {
      id: streamId,
      amount: new BN(userInfo.amount),
      totalAmount: new BN(userInfo.totalAmount),
      buyWithSwapped: new BN(userInfo.buyWithSwapped),
      toBuyReceived: new BN(userInfo.toBuyReceived),
      shares: new BN(userInfo.shares),
      interval: new BN(userDetails.interval),
      startTime: new BN(userDetails.startTime),
      lastSwap: new BN(userDetails.lastSwap),
      isactive: new BN(userDetails.isactive),
      buyWith: userDetails.buyWith,
      toBuy: userDetails.toBuy,
      iteration: new BN(userDetails.iteration),
    };
  }

  /**
   * @param streamId from Stackit.getAllStreams()
   * @returns wether stream is multi or not
   */
  public async isMultipleStream(streamId: BN): Promise<boolean> {
    return await this.call('isMultipleStream', streamId.toString());
  }

  /**
   * @description pause DCA stream
   * @param streamId from Stackit.getAllStreams()
   * @returns tx payload
   */
  public stop(streamId: BN): ITxPayload {
    return {
      to: this.address,
      value: '0x0',
      gas: Web3Instances[this.chainId].utils.toHex('500000'),
      data: this.instance.methods.stop(streamId.toString()).encodeABI(),
    };
  }

  /**
   * @description resume DCA stream
   * @param streamId from Stackit.getAllStreams()
   * @returns tx payload
   */
  public start(streamId: BN): ITxPayload {
    return {
      to: this.address,
      value: '0x0',
      gas: Web3Instances[this.chainId].utils.toHex('500000'),
      data: this.instance.methods.start(streamId.toString()).encodeABI(),
    };
  }

  /**
   * @description update DCA stream's frequency
   * @param streamId from Stackit.getAllStreams()
   * @param interval between iterations
   * @returns tx payload
   */
  public editIntervals(streamId: BN, interval: BN): ITxPayload {
    return {
      to: this.address,
      value: '0x0',
      gas: Web3Instances[this.chainId].utils.toHex('3000000'),
      data: this.instance.methods.editIntervals(streamId.toString(), interval.toString()).encodeABI(),
    };
  }

  /**
   * @description add funds to DCA stream
   * @param streamId from Stackit.getAllStreams()
   * @param amount to top up
   * @returns tx payload
   */
  public topUp(streamId: BN, amount: BN): ITxPayload {
    return {
      to: this.address,
      value: '0x0',
      gas: Web3Instances[this.chainId].utils.toHex('2000000'),
      data: this.instance.methods.topUp(streamId.toString(), amount.toString()).encodeABI(),
    };
  }

  /**
   * @description withdraw funds from DCA stream
   * @param streamId from Stackit.getAllStreams()
   * @param amount to withdraw, in vault share
   * @returns tx payload
   */
  public withdrawAsset(streamId: BN, amount: BN): ITxPayload {
    return {
      to: this.address,
      value: '0x0',
      gas: Web3Instances[this.chainId].utils.toHex('2000000'),
      data: this.instance.methods.withdrawAsset(streamId.toString(), amount.toString()).encodeABI(),
    };
  }

  /**
   * @description check the right time to trigger a swap
   * @param streamId from Stackit.getAllStreams()
   * @returns remaining time in seconds
   */
  public async check_time(streamId: BN): Promise<BN> {
    return new BN(await this.call('check_time', streamId.toString()));
  }
}
