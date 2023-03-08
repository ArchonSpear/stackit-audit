//-----------------------------------------------------------------------------------------------//
import { STACKIT_V2 } from '../ABIs/StackitV2';
import { BN, value } from '../types/bn';
import { address } from '../types/address';
import { Contract } from '../types/contract';
import { Stream } from '../types/stream';
import { ITxPayload } from '../types/tx';
import { Addresses, ContractInfo } from '../constants/addresses';
import { VAULT } from '../ABIs/vault';
import { STGLP } from '../ABIs/stglp';


//-----------------------------------------------------------------------------------------------//
interface StreamAmounts {
  //has yield
  stargateAmount: BN;
  //has no yield
  assetAmount: BN;
}


interface RecordCounter {
  counter: BN;
}


interface Vaults {
  asset: address;
  vault: address;
  router: address;
}


//-----------------------------------------------------------------------------------------------//
export class StackitV2 extends Contract {
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
  public _MAX_INT: BN = null as any;


  /***********************************************************************************************\
   *  Constructors
  \***********************************************************************************************/

  constructor(chainId: string) {
    super(chainId, Addresses.STACKIT_V2[chainId], STACKIT_V2);
  }


  public static async new(chainId: string): Promise<StackitV2> {
    return await new StackitV2(chainId).refresh();
  }


  public async refresh(): Promise<StackitV2> {
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
    await this.MAX_INT();
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


  public async MAX_INT(): Promise<BN> {
    this._MAX_INT = new BN(await this.call('MAX_INT'));
    return this._MAX_INT;
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
      //has yield
      stargateAmount: new BN(o[0] || 0),
      //has no yield
      assetAmount: new BN(o[1] || 0),
    }
  }


  public async getStreamTVL(streamId: value): Promise<BN> {
    const streamHasYield = await this.isYieldActive(streamId)
    const streamAmounts = await this.streamAmounts(streamId);
    if (streamHasYield) {
      return new BN(streamAmounts.stargateAmount)
    } else {
      return new BN(streamAmounts.assetAmount)
    }
  }


  public async getPPS(vaultAddress: address, asset: address): Promise<BN> {
    let beefyVaultAddress;
    let beefyVault;
    let beefyVaultDecimals;
    let stgSharesPerBeefySharesInEther;
    let stgSharesAddress;
    let stgShares;
    let stgSharesDecimals;
    let assetPerStgSharesInEther;
    beefyVaultAddress = vaultAddress;

    // beefy vault PPS // stgShares per beefyShares
    beefyVault = new Contract(this.chainId, beefyVaultAddress as string, VAULT)
    beefyVaultDecimals = await beefyVault.call('decimals')
    stgSharesPerBeefySharesInEther = new BN(await beefyVault.call("getPricePerFullShare")).weiToEther(beefyVaultDecimals)

    // stg pool PPS // asset per stgShares
    stgSharesAddress = await this.stargateAsset(asset)
    stgShares = new Contract(this.chainId, stgSharesAddress, STGLP)
    stgSharesDecimals = await stgShares.call('decimals')
    const stgTotalLiquidity = new BN(await stgShares.call("totalLiquidity"))
    const stgTotalSupply = new BN(await stgShares.call("totalSupply"))
    assetPerStgSharesInEther = stgTotalLiquidity.div(stgTotalSupply).weiToEther(stgSharesDecimals)

    // combined PPS // asset per beefyShares
    return assetPerStgSharesInEther.mul(stgSharesPerBeefySharesInEther)
  }


  public async assetToShares(amount: value, asset: address): Promise<BN> {
    let assetIn: any
    Object.keys(ContractInfo).map(x => {
      if (Number(x) == Number(asset)) assetIn = ContractInfo[x];
    });
    let beefyVaultAddress;
    if (assetIn.ticker == 'USDC') {
      beefyVaultAddress = Addresses.MOO_STARGATE_USDC[this.chainId];
    } else if (assetIn.ticker == 'USDT') {
      beefyVaultAddress = Addresses.MOO_STARGATE_USDT[this.chainId];
    }
    const pps = await this.getPPS(beefyVaultAddress as string, asset)
    return new BN(amount).div(pps)
  }


  public async sharesToAsset(shares: value, asset: address): Promise<BN> {
    let assetIn: any
    Object.keys(ContractInfo).map(x => {
      if (Number(x) == Number(asset)) assetIn = ContractInfo[x];
    });
    let beefyVaultAddress;
    if (assetIn.ticker == 'USDC') {
      beefyVaultAddress = Addresses.MOO_STARGATE_USDC[this.chainId];
    } else if (assetIn.ticker == 'USDT') {
      beefyVaultAddress = Addresses.MOO_STARGATE_USDT[this.chainId];
    }
    const pps = await this.getPPS(beefyVaultAddress as string, asset)
    return new BN(shares).mul(pps)
  }


  public async vaults(asset: address): Promise<Vaults> {
    const o = await this.call('vaults', asset);
    return {
      asset: o[0],
      vault: o[1],
      router: o[2],
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
    return this.writeTx('activate',
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
    return this.writeTx('activateMultiple',
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
    return this.writeTx('stop', streamId);
  }


  public async start(streamId: value): Promise<ITxPayload> {
    return this.writeTx('start', streamId);
  }


  public async editIntervals(streamId: value, newInterval: value): Promise<ITxPayload> {
    return this.writeTx('editIntervals', streamId, newInterval);
  }


  public async topUp(streamId: value, amount: value): Promise<ITxPayload> {
    return this.writeTx('topUp', streamId, amount);
  }


  public async withdrawAsset(streamId: value): Promise<ITxPayload> {
    return this.writeTx('withdrawAsset', streamId);
  }
}
