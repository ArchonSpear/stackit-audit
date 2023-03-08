//-----------------------------------------------------------------------------------------------//
import { ABI } from './abi';
import { Contract as _contract } from 'web3-eth-contract';
import { Web3Instances } from '../constants/web3';
import { ITxPayload } from './tx';
import { BN } from './bn';

//-----------------------------------------------------------------------------------------------//
export class Contract {
  public readonly chainId: string;
  public readonly address: string;
  public readonly abi: ABI;
  protected readonly instance: _contract;

  constructor(chainId: string, address: string, abi: ABI) {
    // TODO: validation utils like this.chainId = validate(chainId) return chainId or throw
    this.chainId = String(chainId)
    this.address = address; // TODO: validate address checksum
    this.abi = abi; // TODO: validate ABI
    this.instance = this.instanciate();
  }

  /**
   * return instance for given contract [address] & [ABI]
   */
  private instanciate(): _contract {
    // TODO: make web3 object validator
    // TODO: check explorer if given ABI and address correspond on chain
    // RESEARCH: can we grab ABI from address on chain ? prob not, maybe just compare byte codes
    return new Web3Instances[this.chainId].eth.Contract(this.abi, this.address);
    // TODO: double check that contract is properly instanciated (match ChainId x Address x ABI)
  }

  /**
   * call contract method and return result
   */
  public async call(method: string, ...params: any[]): Promise<any> {
    return await this.instance.methods[method](...params.map(p => String(p))).call();
  }

  /**
   * prepare tx to execute contract method
   */
  public async writeTx(method: string, ...params: any[]): Promise<ITxPayload> {
    const exec = this.instance.methods[method](...params.map(p => {
      if (typeof p === "boolean") {
        return p
      } else {
        return String(p)
      }
    }))
    let gasEstimate = new BN('5,000,000') // default
    try {
      gasEstimate = new BN(await exec.estimateGas()).mul(1.5).trunc()
    } catch (_error) { }
    return {
      to: this.address,
      value: BN.toHex('0'),
      gas: gasEstimate.toHex(),
      data: exec.encodeABI(),
    };
  }

  public async writeTxWithGas(method: string, gas: BN, ...params: any[]): Promise<ITxPayload> {
    const exec = this.instance.methods[method](...params.map(p => {
      if (typeof p === "boolean") {
        return p
      } else {
        return String(p)
      }
    }))
    return {
      to: this.address,
      value: BN.toHex('0'),
      gas: gas.toHex(),
      data: exec.encodeABI(),
    };
  }

  /**
   * encode contract call data to be sent
   */
  public encodeABI(method: string, ...params: any[]): string {
    return this.instance.methods[method](...params.map(p => String(p))).encodeABI();
  }
}
