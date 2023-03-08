//-----------------------------------------------------------------------------------------------//
import { sol_require, ZERO_ADDRESS } from '../../utils/utils';
import { STACKIT_REFERRAL } from '../ABIs/StackitReferral';
import { Addresses } from '../constants/addresses';
import { address } from '../types/address';
import { BN, value } from '../types/bn';
import { Contract } from '../types/contract';
import { ITxPayload } from '../types/tx';


//-----------------------------------------------------------------------------------------------//
interface getAmountLeftReturn {
  amountLeft: BN
  collateralPrice: BN
  value: BN
  toBuyReceived: BN
  receivedPrice: BN
  tokensValue: BN
}


//-----------------------------------------------------------------------------------------------//
export class StackitReferral extends Contract {
  public _Stackit: address;
  public _StackitSharedStream: address;
  public _maxDiscountStep: BN;
  public _maxDiscount: BN;
  public _maxReferralStep: BN;
  public _maxReferral: BN;
  public _defaultReferralLink: BN;
  public _DIADaptor: address;
  public _tester: BN;


  /***********************************************************************************************\
   *  Constructors
  \***********************************************************************************************/

  constructor(chainId: string) {
    super(chainId, Addresses.STACKIT_REFERRAL[chainId], STACKIT_REFERRAL);
    this._Stackit = null as any;
    this._StackitSharedStream = null as any;
    this._maxDiscountStep = null as any;
    this._maxDiscount = null as any;
    this._maxReferralStep = null as any;
    this._maxReferral = null as any;
    this._defaultReferralLink = null as any;
    this._DIADaptor = null as any;
    this._tester = null as any;
  }


  public static async new(chainId: string): Promise<StackitReferral> {
    return await new StackitReferral(chainId).refresh();
  }


  public async refresh(): Promise<StackitReferral> {
    await this.Stackit();
    await this.StackitSharedStream();
    await this.maxDiscountStep();
    await this.maxDiscount();
    await this.maxReferralStep();
    await this.maxReferral();
    await this.defaultReferralLink();
    await this.DIADaptor();
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


  public async StackitSharedStream(): Promise<address> {
    this._StackitSharedStream = await this.call('StackitSharedStream');
    return this._StackitSharedStream;
  }


  public async maxDiscountStep(): Promise<BN> {
    this._maxDiscountStep = new BN(await this.call('maxDiscountStep'));
    return this._maxDiscountStep;
  }


  public async maxDiscount(): Promise<BN> {
    this._maxDiscount = new BN(await this.call('maxDiscount'));
    return this._maxDiscount;
  }


  public async maxReferralStep(): Promise<BN> {
    this._maxReferralStep = new BN(await this.call('maxReferralStep'));
    return this._maxReferralStep;
  }


  public async maxReferral(): Promise<BN> {
    this._maxReferral = new BN(await this.call('maxReferral'));
    return this._maxReferral;
  }


  public async defaultReferralLink(): Promise<BN> {
    this._defaultReferralLink = new BN(await this.call('defaultReferralLink'));
    return this._defaultReferralLink;
  }


  public async DIADaptor(): Promise<address> {
    this._DIADaptor = await this.call('DIADaptor');
    return this._DIADaptor;
  }


  public async tester(): Promise<BN> {
    this._tester = new BN(await this.call('tester'));
    return this._tester;
  }


  public async discountArray(step: value): Promise<BN> {
    return new BN(await this.call('discountArray', step));
  }

  public async referralArray(step: value): Promise<BN> {
    return new BN(await this.call('referralArray', step));
  }


  /***********************************************************************************************\
   *  Mappings
  \***********************************************************************************************/

  public async userReferralList(user: address, blockNumber: value): Promise<BN[]> {
    try {
      return (await this.call('userReferralList', user, blockNumber)).map((id: string) => new BN(id));
    } catch (error) {
      console.error(error)
      throw "unknown error" // todo
    }
  }


  public async userReferralLink(user: address): Promise<BN> {
    return new BN(await this.call('userReferralLink', user));
  }


  public async userReferralStatus(user: address): Promise<boolean> {
    return await this.call('userReferralStatus', user);
  }


  public async referralLinkSecurity(blockNumber: value): Promise<address> {
    return await this.call('referralLinkSecurity', blockNumber);
  }


  public async userReferredFrom(user: address): Promise<BN> {
    return new BN(await this.call('userReferredFrom', user));
  }


  public async assetMultiplier(asset: address): Promise<BN> {
    return new BN(await this.call('assetMultiplier', asset));
  }


  public async isWhitelisted(user: address): Promise<boolean> {
    return await this.call('isWhitelisted', user);
  }


  public async discountPercentOnReferralCount(streamId: value): Promise<BN> {
    return new BN(await this.call('discountPercentOnReferralCount', streamId));
  }


  public async referralPercentOnReferralCount(streamId: value): Promise<BN> {
    return new BN(await this.call('referralPercentOnReferralCount', streamId));
  }


  public async whitelistedDiscount(user: address): Promise<BN> {
    return new BN(await this.call('whitelistedDiscount', user));
  }


  public async whitelistedReferralFees(user: address): Promise<BN> {
    return new BN(await this.call('whitelistedReferralFees', user));
  }


  public async canChangeReferralLink(user: address): Promise<boolean> {
    return await this.call('canChangeReferralLink', user);
  }


  public async userInSharedStream(user: address): Promise<boolean> {
    return await this.call('userInSharedStream', user);
  }


  /***********************************************************************************************\
   *  View Functions
  \***********************************************************************************************/

  public async getAmountLeft(streamId: value): Promise<getAmountLeftReturn> {
    const obj: number[] = await this.call('getAmountLeft', streamId.toString())
    return {
      amountLeft: new BN(obj[0]),
      collateralPrice: new BN(obj[1]),
      value: new BN(obj[2]),
      toBuyReceived: new BN(obj[3]),
      receivedPrice: new BN(obj[4]),
      tokensValue: new BN(obj[5]),
    }
  }


  public async getUserTVL(user: address): Promise<BN> {
    return new BN(await this.call('getUserTVL', user));
  }


  public async getUserSharedStreamTVL(user: address): Promise<BN> {
    return new BN(await this.call('getUserSharedStreamTVL', user));
  }


  public async isWhitelistedAddress(user: address): Promise<boolean> {
    return await this.call('isWhitelistedAddress', user);
  }


  public async getWasReferredFrom(user: address): Promise<address> {
    return await this.call('getWasReferredFrom', user);
  }


  public async getDiscountForStep(step: value): Promise<BN> {
    return new BN(await this.call('getDiscountForStep', step.toString()));
  }


  public async getuserReferralList(user: address): Promise<BN[]> {
    return (await this.call('getuserReferralList', user)).map((id: string) => new BN(id));
  }


  public async getuserCount(user: address): Promise<BN> {
    return new BN(await this.call('getuserCount', user));
  }


  public async isUserAbleToChangeLink(user: address): Promise<boolean> {
    return await this.call('isUserAbleToChangeLink', user);
  }


  public async isUserSignedUp(user: address): Promise<boolean> {
    return await this.call('isUserSignedUp', user);
  }


  public async getMaxDiscountStep(): Promise<BN> {
    return new BN(await this.call('getMaxDiscountStep'));
  }


  public async getMaxDiscount(): Promise<BN> {
    return new BN(await this.call('getMaxDiscount'));
  }


  public async getUserReferralLink(user: address): Promise<BN> {
    return new BN(await this.call('getUserReferralLink', user));
  }


  public async getCollateralPrice(token: address): Promise<BN> {
    return new BN(await this.call('getCollateralPrice', token));
  }


  public async getUserReferralDiscount(user: address): Promise<BN> {
    return new BN(await this.call('getUserReferralDiscount', user));
  }


  public async getUserReferralFees(user: address): Promise<BN> {
    return new BN(await this.call('getUserReferralFees', user));
  }


  public async isInSharedStream(user: address): Promise<boolean> {
    return this.call('isInSharedStream', user);
  }


  /***********************************************************************************************\
   *  Write Functions
  \***********************************************************************************************/

  public async changeReferralLink(user: address, referralLink: value): Promise<ITxPayload> {
    const canChangeReferralLink = await this.canChangeReferralLink(user)
    const referralLinkSecurity = await this.referralLinkSecurity(referralLink)
    sol_require(canChangeReferralLink == true, "You already signed up with a link or changed it once");
    sol_require(referralLinkSecurity != ZERO_ADDRESS, "Referral Link does not exist");
    return this.writeTx('changeReferralLink', referralLink);
  }


  public async signUp(user: address, blockNumber: value): Promise<ITxPayload> {
    const userReferralStatus = await this.userReferralStatus(user)
    const referralLinkSecurity = await this.referralLinkSecurity(blockNumber)
    sol_require(userReferralStatus == false, "You are already registered");
    sol_require(referralLinkSecurity == ZERO_ADDRESS, "Referral Link already taken");
    return this.writeTx('signUp', user);
  }


  public async signUpWithReferral(user: address, referralLink: value): Promise<ITxPayload> {
    const userReferralStatus = await this.userReferralStatus(user)
    const userReferredFrom = await this.userReferredFrom(user)
    const referralLinkSecurity = await this.referralLinkSecurity(referralLink)
    sol_require(userReferralStatus == false, "You are already registered");
    sol_require(Number(userReferredFrom) == 0, "You are already have a referral");
    sol_require(referralLinkSecurity != ZERO_ADDRESS, "Referral Link does not exist");
    return this.writeTx('signUpWithReferral', referralLink, user);
  }
}
