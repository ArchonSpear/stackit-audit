//-----------------------------------------------------------------------------------------------//
import { Addresses } from '../constants/addresses';
import { Contract } from '../types/contract';
import { REFERRAL_FEES_AGGREGATOR } from '../ABIs/referralFeesAggregator';
import { address } from '../types/address';
import { BN, value } from '../types/bn';
import { sol_require } from '../../utils/utils';
import { ITxPayload } from '../types/tx';


//-----------------------------------------------------------------------------------------------//
export class ReferralFeesAggregator extends Contract {
  public _tester: BN;


  /***********************************************************************************************\
   *  Constructors
  \***********************************************************************************************/

  constructor(chainId: string) {
    super(chainId, Addresses.REFERRAL_FEES_AGGREGATOR[chainId], REFERRAL_FEES_AGGREGATOR);
    this._tester = null as any;
  }


  public static async new(chainId: string): Promise<ReferralFeesAggregator> {
    return await new ReferralFeesAggregator(chainId).refresh();
  }


  public async refresh(): Promise<ReferralFeesAggregator> {
    await this.tester();
    return this;
  }

  /***********************************************************************************************\
   *  Variables
  \***********************************************************************************************/

  public async tester(): Promise<BN> {
    this._tester = new BN(await this.call('tester'));
    return this._tester;
  }


  /***********************************************************************************************\
   *  Mappings
  \***********************************************************************************************/

  public async userAssets(user: address, assetIndex: value): Promise<address> {
    return await this.call('userAssets', user, assetIndex);
  }


  public async userAssetsExist(user: address): Promise<boolean> {
    return await this.call('userAssetsExist', user);
  }


  public async senderAllowed(sender: address): Promise<boolean> {
    return await this.call('senderAllowed', sender);
  }


  /***********************************************************************************************\
   *  View Functions
  \***********************************************************************************************/

  public async getuserAssetAmount(user: address, asset: address): Promise<BN> {
    return new BN(await this.call('getuserAssetAmount', user, asset));
  }


  /***********************************************************************************************\
   *  Write Functions
  \***********************************************************************************************/

  public async addAmountToUser(amount: value, asset: address, user: address): Promise<ITxPayload> {
    const senderAllowed = await this.senderAllowed(user)
    sol_require(senderAllowed == true, "Not allowed");
    return await this.writeTx('addAmountToUser', amount, asset, user);
  }


  public async claimReferralFees(): Promise<ITxPayload> {
    return await this.writeTx('claimReferralFees');
  }
}
