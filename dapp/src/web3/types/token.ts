//-----------------------------------------------------------------------------------------------//
import { ERC20 } from '../ABIs/erc20';
import { address } from './address';
import { BN } from './bn';
import { Contract } from './contract';
import { ITxPayload } from './tx';

//-----------------------------------------------------------------------------------------------//
export class Token extends Contract {
  public _name: string = null as any
  public _symbol: string = null as any
  public _decimals: BN = null as any

  constructor(chainId: string, address: string) {
    super(chainId, address, ERC20);
  }

  public static async new(chainId: string, address: address): Promise<Token> {
    return await new Token(chainId, address).refresh();
  }

  public async refresh(): Promise<Token> {
    await this.name();
    await this.symbol();
    await this.decimals();
    return this;
  }

  public async name(): Promise<string> {
    this._name = await this.call('name');
    return this._name;
  }

  public async symbol(): Promise<string> {
    this._symbol = await this.call('symbol');
    return this._symbol;
  }

  public async decimals(): Promise<BN> {
    this._decimals = new BN(await this.call('decimals'));
    return this._decimals;
  }

  public async getAllowance(owner: string, spender: string): Promise<BN> {
    return new BN(await this.call('allowance', owner, spender));
  }

  public setAllowance(spender: string, amount: BN): ITxPayload {
    return {
      to: this.address,
      data: this.encodeABI('approve', spender, amount.toString()),
      gas: BN.toHex('50,000'),
      value: '0',
    };
  }

  public transfer(to: string, amount: BN): ITxPayload {
    return {
      to: this.address,
      data: this.encodeABI('transfer', to, amount.toString()),
      gas: BN.toHex('300,000'),
      value: '0',
    };
  }

  public async balanceOf(account: address): Promise<BN> {
    return new BN(await this.call('balanceOf', account))
  }
}
