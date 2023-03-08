//-----------------------------------------------------------------------------------------------//
import { Contract } from '../types/contract';
import { BN, value } from '../types/bn';
import { address } from '../types/address';
import { Addresses } from '../constants/addresses';
import { POOLED_CLAIMER } from '../ABIs/pooledClaimer';
import { ITxPayload } from '../types/tx';
import { Errors } from '../constants/errors';


//-----------------------------------------------------------------------------------------------//
export class PooledClaimer extends Contract {
  public _Stackit: address;
  public _vala: BN;
  public _valb: BN;
  public _valc: BN;
  public _vald: BN;
  public _vale: BN;
  public _valf: BN;
  public _valg: BN;
  public _tester: BN;


  /***********************************************************************************************\
   *  Constructors
  \***********************************************************************************************/

  constructor(chainId: string) {
    super(chainId, Addresses.POOLED_CLAIMER[chainId], POOLED_CLAIMER);
    this._Stackit = null as any;
    this._vala = null as any;
    this._valb = null as any;
    this._valc = null as any;
    this._vald = null as any;
    this._vale = null as any;
    this._valf = null as any;
    this._valg = null as any;
    this._tester = null as any;
  }


  public static async new(chainId: string): Promise<PooledClaimer> {
    return await new PooledClaimer(chainId).refresh();
  }


  public async refresh(): Promise<PooledClaimer> {
    await this.Stackit();
    await this.vala();
    await this.valb();
    await this.valc();
    await this.vald();
    await this.vale();
    await this.valf();
    await this.valg();
    await this.tester();
    return this;
  }


  /***********************************************************************************************\
   *  Variables
  \***********************************************************************************************/

  public async Stackit(): Promise<address> {
    this._Stackit = await this.call('Stackit');
    return this._Stackit;
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


  public async vald(): Promise<BN> {
    this._valc = new BN(await this.call('valc'));
    return this._valc;
  }


  public async vale(): Promise<BN> {
    this._valc = new BN(await this.call('valc'));
    return this._valc;
  }


  public async valf(): Promise<BN> {
    this._valc = new BN(await this.call('valc'));
    return this._valc;
  }


  public async valg(): Promise<BN> {
    this._valc = new BN(await this.call('valc'));
    return this._valc;
  }


  public async tester(): Promise<BN> {
    this._tester = new BN(await this.call('tester'));
    return this._tester;
  }


  /***********************************************************************************************\
   *  Mappings
  \***********************************************************************************************/

  public async userAmountPerBuy(user: address, streamId: value): Promise<BN> {
    return new BN(await this.call('userAmountPerBuy', user, streamId));
    // it seems it returns 0 even if user or streamId is nonsense,
    // QUESTION: return 0 == error ?
  }


  public async userSequences(user: address, streamId: value): Promise<BN> {
    try {
      return new BN(await this.call('userSequences', user, streamId));
    } catch (error) {
      console.error(error)
      throw "unknown error" // todo
      // it reverts if user or streamId is wrong
      // QUESTION: it seems not init right now ? Didnt test success yet
    }
  }


  public async userSequencesMultiple(user: address, streamId: value): Promise<BN> {
    try {
      return new BN(await this.call('userSequencesMultiple', user, streamId));
    } catch (error) {
      console.error(error)
      throw "unknown error" // todo
      // it reverts if user or streamId is wrong
      // QUESTION: it seems not init right now ? Didnt test success yet
    }
  }


  public async userSequenceExist(user: address, streamId: value): Promise<boolean> {
    return await this.call('userSequenceExist', user, streamId);
  }


  public async userSequenceExistMultiple(user: address, streamId: value): Promise<boolean> {
    return await this.call('userSequenceExistMultiple', user, streamId);
  }


  public async feesPerAssets(asset: address): Promise<BN> {
    return new BN(await this.call('feesPerAssets', asset));
  }


  public async boughtAmountsPerEpochs(streamId: value, epoch: value): Promise<BN> {
    return new BN(await this.call('boughtAmountsPerEpochs', streamId, epoch));
  }


  public async buyAmountsPerEpochs(streamId: value, epoch: value): Promise<BN> {
    return new BN(await this.call('buyAmountsPerEpochs', streamId, epoch));
  }


  public async userLastEpochClaimed(user: address, streamId: value): Promise<BN> {
    return new BN(await this.call('userLastEpochClaimed', user, streamId));
  }


  public async epochs(streamId: value): Promise<BN> {
    return new BN(await this.call('epochs', streamId));
  }


  public async boughtAmountsPerEpochsMultiple(
    streamId: value,
    epoch: value,
    assetIndex: value,
  ): Promise<BN> {
    try {
      return new BN(await this.call('boughtAmountsPerEpochsMultiple',
        streamId,
        epoch,
        assetIndex,
      ));
    } catch (error) {
      console.error(error)
      throw "unknown error" // todo
      // it reverts if user or streamId is wrong
      // QUESTION: it seems not init right now ? Didnt test success yet
    }
  }


  public async buyAmountsPerEpochsMultiple(
    streamId: value,
    epoch: value,
    assetIndex: value,
  ): Promise<BN> {
    try {
      return new BN(await this.call('buyAmountsPerEpochsMultiple', streamId, epoch, assetIndex));
    } catch (error) {
      console.error(error)
      throw "unknown error" // todo
      // it reverts if user or streamId is wrong
      // QUESTION: it seems not init right now ? Didnt test success yet
    }
  }


  public async userLastEpochClaimedMultiple(user: address, streamId: value): Promise<BN> {
    try {
      return new BN(await this.call('userLastEpochClaimedMultiple', user, streamId));
    } catch (error) {
      console.error(error)
      throw "unknown error" // todo
      // it reverts if user or streamId is wrong
      // QUESTION: it seems not init right now ? Didnt test success yet
    }
  }


  /***********************************************************************************************\
   *  View Functions
  \***********************************************************************************************/

  public async retVals(): Promise<BN[]> {
    const res: string[] = await this.call('retVals')
    return Object.values(res).map((id: string) => new BN(id))
  }


  public async getAssetForCount(streamId: value): Promise<address> {
    try {
      return await this.call('getAssetForCount', streamId);
    } catch (error) {
      console.error(error)
      throw Errors['PooledClaimer.getAssetForCount.NoStreamFound']
    }
  }


  public async getAssetsForCount(streamId: value): Promise<address[]> {
    try {
      return await this.call('getAssetsForCount', streamId);
    } catch (error) {
      console.error(error)
      throw Errors['PooledClaimer.getAssetsForCount.NoStreamFound']
    }
  }


  public async getBoughtAmountForEpoch(streamId: value, epoch: value): Promise<BN> {
    return new BN(await this.call('getBoughtAmountForEpoch', streamId, epoch));
  }


  public async getBuyAmountForEpoch(streamId: value, epoch: value): Promise<BN> {
    return new BN(await this.call('getBuyAmountForEpoch', streamId, epoch));
  }


  public async getSequenceEpoch(streamId: value): Promise<BN> {
    return new BN(await this.call('getSequenceEpoch', streamId));
  }


  /***********************************************************************************************\
   *  Write Functions
  \***********************************************************************************************/

  // QUESTION: there is require(msg.sender == Stackit, "Not Stackit");
  // does it mean i should integrate it, its only to be called by stackit contract ?
  public async addAssetForUser(
    user: address,
    streamId: value,
    amountPerBuy: value,
    iteration: value,
    isMultiple: boolean,
  ): Promise<ITxPayload> {
    return this.writeTx('addAssetForUser',
      user,
      streamId,
      amountPerBuy,
      iteration,
      isMultiple,
    );
  }


  // same QUESTION
  public async addAmounts(amount: value, streamId: value, buyAmount: value): Promise<ITxPayload> {
    return this.writeTx('addAmounts', amount, streamId, buyAmount);
  }


  // same QUESTION
  public async addAmountsMultiple(
    amount: value[],
    streamId: value,
    buyAmount: value[],
    asset: address[],
  ): Promise<ITxPayload> {
    return this.writeTx('addAmountsMultiple', amount, streamId, buyAmount, asset);
  }


  public async claimAmounts(): Promise<ITxPayload> {
    return this.writeTx('claimAmounts');
  }


  public async claimAmountsMultiple(): Promise<ITxPayload> {
    return this.writeTx('claimAmountsMultiple');
  }


  // QUESTION: should it be integrated or just use the above ?
  // coz it is still public, should it be internal in the contract ?
  public async _claimAmountsMultiple(): Promise<ITxPayload> {
    return this.writeTx('_claimAmountsMultiple');
  }
}

