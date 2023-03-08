//-----------------------------------------------------------------------------------------------//
import { Contract } from '../types/contract';
import { STACKIT_POOLED } from '../ABIs/stackitPooled';
import { Addresses } from '../constants/addresses';
import { BN, value } from '../types/bn';
import { address } from '../types/address';
import { PooledStream } from '../types/stream';
import { ITxPayload } from '../types/tx';
import { Errors } from '../constants/errors';
import { sol_require } from '../../utils/utils';


//-----------------------------------------------------------------------------------------------//
interface Vaults {
  asset: address
  tokenA: address
  tokenB: address
  vault: address
  want: address
  route?: address[]
  aggregateRoute?: address[]
}


//interface RecordCounter {
//  counter: BN;
//}
type RecordCounter = BN


//-----------------------------------------------------------------------------------------------//
export class StackitPooled extends Contract {
  public _unirouter: address;
  public _treasury: address;
  public _Referrals: address;
  public _GasCostOracle: address;
  public _feeToken: address;
  public _DIADaptor: address;
  public _ReferralFeesAggregator: address;
  public _PooledClaimer: address;
  public _tester: BN;
  public _trxCostPercentFee: BN;
  public _treasuryInboundFees: BN;
  public _treasuryOutboundFees: BN;
  public _buybackFees: BN;
  public _pancakeSwapFees: BN;
  public _minimumDeposit: BN;
  public _MAX_INT: BN;
  public _vala: BN;
  public _valb: BN;
  public _valc: BN;
  public _valinit: BN;


  /***********************************************************************************************\
   *  Constructors
  \***********************************************************************************************/

  constructor(chainId: string) {
    super(chainId, Addresses.STACKIT_POOLED[chainId], STACKIT_POOLED);
    this._unirouter = null as any;
    this._treasury = null as any;
    this._Referrals = null as any;
    this._GasCostOracle = null as any;
    this._feeToken = null as any;
    this._DIADaptor = null as any;
    this._ReferralFeesAggregator = null as any;
    this._PooledClaimer = null as any;
    this._tester = null as any;
    this._trxCostPercentFee = null as any;
    this._treasuryInboundFees = null as any;
    this._treasuryOutboundFees = null as any;
    this._buybackFees = null as any;
    this._pancakeSwapFees = null as any;
    this._minimumDeposit = null as any;
    this._MAX_INT = null as any;
    this._vala = null as any;
    this._valb = null as any;
    this._valc = null as any;
    this._valinit = null as any;
  }


  public static async new(chainId: string): Promise<StackitPooled> {
    return await new StackitPooled(chainId).refresh();
  }


  public async refresh(): Promise<StackitPooled> {
    await this.unirouter();
    await this.treasury();
    await this.Referrals();
    await this.GasCostOracle();
    await this.feeToken();
    await this.DIADaptor();
    await this.ReferralFeesAggregator();
    await this.PooledClaimer();
    await this.tester();
    await this.trxCostPercentFee();
    await this.treasuryInboundFees();
    await this.treasuryOutboundFees();
    await this.buybackFees();
    await this.pancakeSwapFees();
    await this.minimumDeposit();
    await this.MAX_INT();
    await this.vala();
    await this.valb();
    await this.valc();
    await this.valinit();
    return this;
  }


  /***********************************************************************************************\
   *  Variables
  \***********************************************************************************************/

  public async unirouter(): Promise<address> {
    this._unirouter = await this.call('unirouter');
    return this._unirouter;
  }


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


  public async PooledClaimer(): Promise<address> {
    this._PooledClaimer = await this.call('PooledClaimer');
    return this._PooledClaimer;
  }


  public async tester(): Promise<BN> {
    this._tester = new BN(await this.call('tester'));
    return this._tester;
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


  public async pancakeSwapFees(): Promise<BN> {
    this._pancakeSwapFees = new BN(await this.call('pancakeSwapFees'));
    return this._pancakeSwapFees;
  }


  public async minimumDeposit(): Promise<BN> {
    this._minimumDeposit = new BN(await this.call('minimumDeposit'));
    return this._minimumDeposit;
  }


  public async allStreams(streamId: value): Promise<BN> {
    try {
      return new BN(await this.call('allStreams', streamId));
    } catch (error) {
      console.error(error)
      throw Errors['StackitPooled.allStreams.NoStreamFound']
    }
  }


  public async activeStreams(streamId: value): Promise<BN> {
    try {
      return new BN(await this.call('activeStreams', streamId));
    } catch (error) {
      console.error(error)
      throw Errors['StackitPooled.activeStreams.NoStreamFound']
    }
  }


  public async recordcounter(index: value): Promise<RecordCounter> {
    try {
      return await this.call('recordcounter', index);
    } catch (error) {
      console.error(error)
      throw Errors['StackitPooled.activeStreams.NoStreamFound']
    }
  }


  public async MAX_INT(): Promise<BN> {
    this._MAX_INT = new BN(await this.call('MAX_INT'));
    return this._MAX_INT;
  }


  public async vala(): Promise<BN> {
    this._vala = new BN(await this.call('vala'));
    return this._vala;
  }


  public async valb(): Promise<BN> {
    this._valb = new BN(await this.call('valb'));
    return this._valb;
  }


  public async valc(): Promise<BN> {
    this._valc = new BN(await this.call('valc'));
    return this._valc;
  }


  public async valinit(): Promise<BN> {
    this._valinit = new BN(await this.call('valinit'));
    return this._valinit;
  }


  /***********************************************************************************************\
   *  Mappings
  \***********************************************************************************************/

  public async list(user: address, index: value): Promise<BN> {
    try {
      return new BN(await this.call('list', user, index));
    } catch (error) {
      console.error(error)
      throw "unknown error" // todo
    }
  }


  public async streams(streamId: value): Promise<PooledStream> {
    const obj = await this.call('streams', streamId);
    return {
      totalAmount: new BN(obj.totalAmount),
      interval: new BN(obj.interval),
      startTime: new BN(obj.startTime),
      lastSwap: new BN(obj.lastSwap),
      isactive: new BN(obj.isactive),
      buyWithSwapped: new BN(obj.buyWithSwapped),
      toBuyReceived: new BN(obj.toBuyReceived),
      route: obj.route,
      buyWith: obj.buyWith,
      toBuy: obj.toBuy,
      shares: new BN(obj.shares),
    }
  }


  public async amounts(streamId: value): Promise<PooledStream> {
    const obj = await this.call('amounts', streamId);
    return {
      totalAmount: new BN(obj.totalAmount),
      interval: new BN(obj.interval),
      startTime: new BN(obj.startTime),
      lastSwap: new BN(obj.lastSwap),
      isactive: new BN(obj.lastSwap),
      buyWithSwapped: new BN(obj.lastSwap),
      toBuyReceived: new BN(obj.lastSwap),
      route: obj.lastSwap,
      buyWith: obj.lastSwap,
      toBuy: obj.lastSwap,
      shares: new BN(obj.lastSwap),
    }
  }


  public async vaults(asset: address): Promise<Vaults> {
    const obj = await this.call('vaults', asset);
    return {
      asset: obj.asset,
      tokenA: obj.tokenA,
      tokenB: obj.tokenB,
      vault: obj.vault,
      want: obj.want,
      route: obj.route,
      aggregateRoute: obj.aggregateRoute,
    }
  }


  public async amountLeftInStream(streamId: value): Promise<BN> {
    return new BN(await this.call('amountLeftInStream', streamId));
  }


  public async userAggregatedDiscount(streamId: value): Promise<BN> {
    return new BN(await this.call('userAggregatedDiscount', streamId));
  }


  public async minimumAmountPerBuy(asset: address): Promise<BN> {
    return new BN(await this.call('minimumAmountPerBuy', asset));
  }


  public async isUserInStream(user: address, streamId: value): Promise<boolean> {
    return await this.call('isUserInStream', user, streamId);
  }


  public async assetsAggregate(backetId: value, assetIndex: value): Promise<address[]> {
    try {
      return await this.call('assetsAggregate', backetId, assetIndex);
    } catch (error) {
      console.error(error)
      throw "unknown error" // todo
    }
  }


  public async assetsAggregateExist(backetId: value): Promise<boolean> {
    return await this.call('assetsAggregateExist', backetId);
  }


  public async streamNature(streamId: value): Promise<boolean> {
    return await this.call('streamNature', streamId);
  }


  public async streamBasketOfAsset(streamId: value): Promise<BN> {
    return new BN(await this.call('streamBasketOfAsset', streamId));
  }


  /***********************************************************************************************\
   *  View Functions
  \***********************************************************************************************/

  public async getListOfStreams(user: address): Promise<BN[]> {
    return (await this.call('getListOfStreams', user)).map((id: string) => new BN(id));
  }


  public async getCollateralPrice(asset: address): Promise<BN> {
    try {
      return new BN(await this.call('getCollateralPrice', asset));
    } catch (error) {
      console.error(error)
      throw "unknown error" // todo
    }
  }


  public async retVals(): Promise<BN[]> {
    const res: string[] = await this.call('retVals')
    return Object.values(res).map((id: string) => new BN(id))
  }


  public async getUserShares(streamId: value): Promise<BN> {
    return new BN(await this.call('getUserShares', streamId));
  }


  public async getMultipleAmountForStream(streamId: value, token: address): Promise<BN> {
    return new BN(await this.call('getMultipleAmountForStream', streamId, token));
  }


  public async getStreamAggregatedDiscount(streamId: value): Promise<BN> {
    return new BN(await this.call('getStreamAggregatedDiscount', streamId));
  }


  public async getAccruedReferralFeesForAsset(user: address, buyWith: address): Promise<BN> {
    return new BN(await this.call('getAccruedReferralFeesForAsset', user, buyWith));
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


  public async getAssetRoutes(asset: address, basketAsset: address): Promise<address[]> {
    return await this.call('getAssetRoutes', asset, basketAsset);
  }


  public async getStreamBasketOfAssets(streamId: value): Promise<BN> {
    return new BN(await this.call('getStreamBasketOfAssets', streamId));
  }


  public async getStreamRepartition(streamId: value, assetIndex: value): Promise<BN> {
    try {
      return new BN(await this.call('getStreamRepartition', streamId, assetIndex));
    } catch (error) {
      console.error(error)
      throw "unknown error" // todo
    }
  }


  public async getStreamStats(streamId: value): Promise<Partial<PooledStream>> {
    return await this.call('getStreamStats', streamId);
  }


  public async getStreamDetails(streamId: value): Promise<Partial<PooledStream>> {
    return await this.call('getStreamDetails', streamId);
  }


  public async getUserAmountInStream(streamId: value, user: address): Promise<BN> {
    return new BN(await this.call('getUserAmountInStream', streamId, user));
  }


  public async isMultipleStream(streamId: value): Promise<boolean> {
    return await this.call('isMultipleStream', streamId);
  }


  public async getSequence(streamId: value): Promise<BN> {
    try {
      return new BN(await this.call('getSequence', streamId))
    } catch (error) {
      console.error(error)
      throw "unknown error" // todo
    }
  }


  public async fetchAllActiveStreams(): Promise<BN[]> {
    return (await this.call('fetchAllActiveStreams')).map((id: string) => new BN(id))
  }


  public async check_time(streamId: value): Promise<BN> {
    return new BN(await this.call('check_time', streamId));
  }


  /***********************************************************************************************\
   *  Write Functions
  \***********************************************************************************************/

  public async getInStream(
    user: address,
    amount: value,
    streamId: value,
    iteration: value,
  ): Promise<ITxPayload> {
    const isUserInStream = await this.isUserInStream(user, streamId)
    const { buyWith } = await this.getStreamDetails(streamId)
    const minimumAmountPerBuy = await this.minimumAmountPerBuy(buyWith as string)
    sol_require(isUserInStream == false, "Already in stream");
    sol_require(
      new BN(amount).gte(minimumAmountPerBuy),
      "Please add more than the minimum amount per buy",
    );
    return this.writeTx('getInStream', amount, streamId, iteration);
  }
}
