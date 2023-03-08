//-----------------------------------------------------------------------------------------------//
import { STACKIT_V3 } from '../ABIs/StackitV3';
import { Addresses } from '../constants/addresses';
import { address } from '../types/address';
import { BN, value } from '../types/bn';
import { Contract } from '../types/contract';
import { Stream } from '../types/stream';
import { ITxPayload } from '../types/tx';



//-----------------------------------------------------------------------------------------------//
interface StreamAmounts {
  //has no yield
  assetAmount: BN;
}


interface RecordCounter {
  counter: BN;
}


interface Vaults {
  asset: address;
  vault: address;
}


//-----------------------------------------------------------------------------------------------//
export class StackitV3 extends Contract {
  public _treasury: address = null as any;
  public _Referrals: address = null as any;
  public _GasCostOracle: address = null as any;
  public _feeToken: address = null as any;
  public _DIADaptor: address = null as any;
  public _ReferralFeesAggregator: address = null as any;
  public _stargateRouter: address = null as any;
  public _trxCostPercentFee: BN = null as any;
  public _treasuryInboundFees: BN = null as any;
  public _treasuryOutboundFees: BN = null as any;
  public _buybackFees: BN = null as any;
  public _allStreams: BN[] = null as any;
  public _activeStreams: BN[] = null as any;
  public _allStreamsReady: BN[] = null as any;
  public _MAX_INT: BN = null as any;
  public _AGGREGATION_ROUTER_V5: address = null as any;


  /***********************************************************************************************\
   *  Constructors
  \***********************************************************************************************/

  constructor(chainId: string) {
    super(chainId, Addresses.STACKIT_V3[chainId], STACKIT_V3);
  }


  public static async new(chainId: string): Promise<StackitV3> {
    return await new StackitV3(chainId).refresh();
  }


  public async refresh(): Promise<StackitV3> {
    await this.treasury();
    await this.Referrals();
    await this.GasCostOracle();
    await this.feeToken();
    await this.DIADaptor();
    await this.ReferralFeesAggregator();
    await this.stargateRouter();
    await this.trxCostPercentFee();
    await this.treasuryInboundFees();
    await this.treasuryOutboundFees();
    await this.buybackFees();
    await this.allStreams();
    await this.activeStreams();
    await this.allStreamsReady();
    await this.MAX_INT();
    await this.AGGREGATION_ROUTER_V5();
    return this;
  }


  /***********************************************************************************************\
   *  Variables
  \***********************************************************************************************/

  public async treasury(): Promise<address> {
    this._treasury = await this.call('treasury');
    return this._treasury;
  }


  public async Referrals(): Promise<address> {
    this._Referrals = await this.call('Referrals');
    return this._Referrals;
  }


  public async GasCostOracle(): Promise<address> {
    this._GasCostOracle = await this.call('GasCostOracle');
    return this._GasCostOracle;
  }


  public async feeToken(): Promise<address> {
    this._feeToken = await this.call('feeToken');
    return this._feeToken;
  }


  public async DIADaptor(): Promise<address> {
    this._DIADaptor = await this.call('DIADaptor');
    return this._DIADaptor;
  }


  public async ReferralFeesAggregator(): Promise<address> {
    this._ReferralFeesAggregator = await this.call('ReferralFeesAggregator');
    return this._ReferralFeesAggregator;
  }


  public async stargateRouter(): Promise<address> {
    this._stargateRouter = await this.call('stargateRouter');
    return this._stargateRouter;
  }


  public async trxCostPercentFee(): Promise<BN> {
    this._trxCostPercentFee = new BN(await this.call('trxCostPercentFee'));
    return this._trxCostPercentFee;
  }


  public async treasuryInboundFees(): Promise<BN> {
    this._treasuryInboundFees = new BN(await this.call('treasuryInboundFees'));
    return this._treasuryInboundFees;
  }


  public async treasuryOutboundFees(): Promise<BN> {
    this._treasuryOutboundFees = new BN(await this.call('treasuryOutboundFees'));
    return this._treasuryOutboundFees;
  }


  public async buybackFees(): Promise<BN> {
    this._buybackFees = new BN(await this.call('buybackFees'));
    return this._buybackFees;
  }


  public async allStreams(): Promise<BN[]> {
    this._allStreams = (await this.call('allStreams')).map((id: string) => new BN(id));
    return this._allStreams;
  }


  public async activeStreams(): Promise<BN[]> {
    this._activeStreams = (await this.call('activeStreams')).map((id: string) => new BN(id));
    return this._activeStreams;
  }


  public async recordcounter(index: value): Promise<RecordCounter> {
    return await this.call('recordcounter', index);
  }


  public async allStreamsReady(): Promise<BN[]> {
    this._allStreamsReady = (await this.call('allStreamsReady')).map((id: string) => new BN(id));
    return this._allStreamsReady;
  }


  public async MAX_INT(): Promise<BN> {
    this._MAX_INT = new BN(await this.call('MAX_INT'));
    return this._MAX_INT;
  }


  public async AGGREGATION_ROUTER_V5(): Promise<address> {
    this._AGGREGATION_ROUTER_V5 = await this.call('AGGREGATION_ROUTER_V5');
    return this._AGGREGATION_ROUTER_V5;
  }


  /***********************************************************************************************\
   *  Mappings
  \***********************************************************************************************/

  public async list(user: address): Promise<BN[]> {
    return (await this.call('list', user)).map((id: string) => new BN(id));
  }


  public async streams(streamId: value): Promise<Stream> {
    return (await this.call('streams', streamId)).map((id: string) => new BN(id));
  }


  public async streamAmounts(streamId: value): Promise<StreamAmounts> {
    const o = await this.call('streamAmounts', streamId);
    return {
      //has no yield
      assetAmount: new BN(o[1]),
    }
  }


  public async getStreamTVL(streamId: value): Promise<BN> {
    //const streamHasYield = await this.isYieldActive(streamId)
    const streamAmounts = await this.streamAmounts(streamId);
    //if (streamHasYield) {
    //  return new BN(streamAmounts.stargateAmount)
    //} else {
    return new BN(streamAmounts.assetAmount)
    //}
  }


  public async vaults(asset: address): Promise<Vaults> {
    const o = await this.call('vaults', asset);
    return {
      asset: o[0],
      vault: o[1],
    }
  }


  public async amountLeftInStream(streamId: value): Promise<BN> {
    return new BN(await this.call('amountLeftInStream', streamId))
  }


  public async userAggregatedDiscount(streamId: value): Promise<BN> {
    return new BN(await this.call('userAggregatedDiscount', streamId))
  }


  public async assetDecimals(asset: address): Promise<BN> {
    return new BN(await this.call('assetDecimals', asset))
  }


  // one asset basket ID for an array of assets
  public async assetsAggregate(basketId: value): Promise<address[]> {
    return await this.call('assetsAggregate', basketId)
  }


  public async assetsAggregateExist(basketId: value): Promise<boolean> {
    return await this.call('assetsAggregateExist', basketId)
  }


  // true = multi // false = single
  public async streamNature(streamId: value): Promise<boolean> {
    return await this.call('streamNature', streamId)
  }


  public async streamYield(streamId: value): Promise<boolean> {
    return await this.call('streamYield', streamId)
  }


  public async assetHasYield(asset: address): Promise<boolean> {
    return await this.call('assetHasYield', asset)
  }


  public async stargatePoolID(asset: address): Promise<BN> {
    return new BN(await this.call('stargatePoolID', asset))
  }


  public async stargateAsset(asset: address): Promise<address> {
    return await this.call('stargateAsset', asset)
  }


  public async streamReady(streamId: value): Promise<boolean> {
    return await this.call('streamReady', streamId)
  }


  public async streamReadyBuyAmount(streamId: value): Promise<BN> {
    return new BN(await this.call('streamReadyBuyAmount', streamId))
  }


  public async streamBasketOfAsset(basketId: value): Promise<BN> {
    return new BN(await this.call('streamBasketOfAsset', basketId))
  }


  public async minimumAmountPerBuy(asset: address): Promise<BN> {
    return new BN(await this.call('minimumAmountPerBuy', asset))
  }


  public async assetRouter(asset: address): Promise<address> {
    return await this.call('assetRouter', asset)
  }


  /***********************************************************************************************\
   *  View Functions
  \***********************************************************************************************/

  public async getCollateralPrice(asset: address): Promise<BN> {
    return new BN(await this.call('getCollateralPrice', asset));
  }


  public async getUserShares(streamId: value): Promise<BN> {
    return new BN(await this.call('getUserShares', streamId));
  }


  public async getMultipleAmountForStream(streamId: value, asset: address): Promise<BN> {
    return new BN(await this.call('getMultipleAmountForStream', streamId, asset));
  }


  public async getStreamAggregatedDiscount(streamId: value): Promise<BN> {
    return new BN(await this.call('getStreamAggregatedDiscount', streamId));
  }


  public async getAmountLeftInVault(streamId: value): Promise<BN> {
    return new BN(await this.call('getAmountLeftInVault', streamId));
  }


  public async getAllStreams(): Promise<BN[]> {
    return (await this.call('getAllStreams')).map((id: string) => new BN(id));
  }


  public async getAssetsAggregate(basketId: value): Promise<address[]> {
    return await this.call('getAssetsAggregate', basketId);
  }


  public async getSingleRouteForAssets(buyWith: address, toBuy: address): Promise<address[]> {
    return await this.call('getSingleRouteForAssets', buyWith, toBuy);
  }


  public async getMinimumAmount(buyWith: address): Promise<BN> {
    return new BN(await this.call('getMinimumAmount', buyWith));
  }


  public async getAssetRoutes(asset: address, backetAsset: address): Promise<address[]> {
    return await this.call('getAssetRoutes', asset, backetAsset);
  }


  public async getListOfStreams(user: address): Promise<BN[]> {
    return (await this.call('getListOfStreams', user)).map((streamId: string) => new BN(streamId));
  }


  public async getStreamBasketOfAssets(streamId: value): Promise<BN> {
    return new BN(await this.call('getStreamBasketOfAssets', streamId));
  }


  public async getStreamRepartition(streamId: value, assetIndex: value): Promise<BN> {
    return new BN(await this.call('getStreamRepartition', streamId, assetIndex));
  }


  private async getStreamStats(streamId: value): Promise<Partial<Stream>> {
    return await this.call('getStreamStats', streamId);
  }


  private async getStreamDetails(streamId: value): Promise<Partial<Stream>> {
    return await this.call('getStreamDetails', streamId);
  }


  public async getStreamInfo(streamId: value): Promise<Stream> {
    const streamStats: any = await this.getStreamStats(streamId);
    const streamDetails: any = await this.getStreamDetails(streamId);
    return {
      id: new BN(streamId),
      // streamStats
      amount: new BN(streamStats.amount),
      buyWithSwapped: new BN(streamStats.buyWithSwapped),
      shares: new BN(streamStats.shares),
      toBuyReceived: new BN(streamStats.toBuyReceived),
      totalAmount: new BN(streamStats.totalAmount),
      // streamDetails
      buyWith: streamDetails.buyWith,
      interval: new BN(streamDetails.interval),
      isactive: new BN(streamDetails.isactive),
      iteration: new BN(streamDetails.iteration),
      lastSwap: new BN(streamDetails.lastSwap),
      startTime: new BN(streamDetails.startTime),
      toBuy: streamDetails.toBuy,
    };
  }


  public async isYieldActive(streamId: value): Promise<boolean> {
    return await this.call('isYieldActive', streamId);
  }


  public async isMultipleStream(streamId: value): Promise<boolean> {
    return await this.call('isMultipleStream', streamId);
  }


  public async isStreamReady(streamId: value): Promise<boolean> {
    return await this.call('isStreamReady', streamId);
  }

  public async getStreamReadyBuyAmount(streamId: value): Promise<BN> {
    return new BN(await this.call('getStreamReadyBuyAmount', streamId));
  }

  public async check_time(streamId: value): Promise<BN> {
    return new BN(await this.call('check_time', streamId));
  }


  public async getAssetRouter(asset: address): Promise<address> {
    return await this.call('getAssetRouter', asset);
  }


  /***********************************************************************************************\
   *  Write Functions
  \***********************************************************************************************/

  public async activate(
    amount: value,
    intervalInSec: value,
    buyWith: address,
    refLink: value,
    toBuy: address,
    iteration: value,
    startTime: value,
    yieldActive: boolean,
  ): Promise<ITxPayload> {
    return this.writeTxWithGas('activate',
      new BN('2,000,000'),
      amount,
      intervalInSec,
      buyWith,
      refLink,
      toBuy,
      iteration,
      startTime,
      yieldActive,
    );
  }


  public async activateMultiple(
    amount: value,
    intervalInSec: value,
    buyWith: address,
    refLink: value,
    iteration: value,
    streamBasketOfAsset: value,
    streamAggregateRepartition: value[],
    startTime: value,
    yieldActive: boolean,
  ): Promise<ITxPayload> {
    return this.writeTxWithGas('activateMultiple',
      new BN('5,000,000'),
      amount,
      intervalInSec,
      buyWith,
      refLink,
      streamBasketOfAsset,
      streamAggregateRepartition,
      iteration,
      startTime,
      yieldActive,
    );
  }


  public async stop(streamId: value): Promise<ITxPayload> {
    return this.writeTxWithGas('stop', new BN('1,000,000'), streamId);
  }


  public async start(streamId: value): Promise<ITxPayload> {
    return this.writeTxWithGas('start', new BN('1,000,000'), streamId);
  }


  public async editIntervals(streamId: value, newInterval: value): Promise<ITxPayload> {
    return this.writeTxWithGas('editIntervals', new BN('1,000,000'), streamId, newInterval);
  }


  public async topUp(streamId: value, amount: value): Promise<ITxPayload> {
    return this.writeTxWithGas('topUp', new BN('1,000,000'), streamId, amount);
  }


  public async withdrawAsset(streamId: value): Promise<ITxPayload> {
    return this.writeTxWithGas('withdrawAsset', new BN('1,000,000'), streamId);
  }


  /*
  public async convertCompoundedAmount(streamId: value): Promise<ITxPayload> {
    const stream = await this.getStreamInfo(streamId)
    const now = Date.now()
    sol_require(stream.isactive.eq(1), 'Stream stopped')
    sol_require(stream.lastSwap.add(stream.interval).lt(now), '!time, Back to sleep bruvv')
    sol_require(stream.startTime.lt(now), 'Not time to start yet')
    return this.writeTx('convertCompoundedAmount', new BN('2,000,000'), streamId)
  }

  public async executeBuy(streamId: value, _data: any, _swapSimple: boolean): Promise<ITxPayload> {
    return this.writeTx('executeBuy', new BN('2,000,000'), streamId, _data, _swapSimple);
  }
  */
}
