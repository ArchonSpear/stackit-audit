//-----------------------------------------------------------------------------------------------//
import BigNumber from 'bignumber.js';

//-----------------------------------------------------------------------------------------------//
export type value = string | number | BN | BigNumber

export class BN extends BigNumber {
  constructor(n: value, base?: value) {
    BigNumber.config({
      EXPONENTIAL_AT: [-1e9, 1e9],
    });
    super(BN.cleanFormat(n), Number(base) || undefined);
  }

  public etherToWei(dp: value): BN {
    const _dp = new BN(dp);
    return this.mul(`1e${_dp}`).trunc();
  }
  public static etherToWei(n: value, dp: value): BN {
    const _n = new BN(n);
    const _dp = new BN(dp);
    return _n.mul(`1e${_dp}`).trunc();
  }

  public weiToEther(dp: value): BN {
    const _dp = new BN(dp);
    return this.div(`1e${_dp}`);
  }
  public static weiToEther(n: value, dp: value): BN {
    const _n = new BN(n);
    const _dp = new BN(dp);
    return _n.div(`1e${_dp}`);
  }

  public _1e(): BN {
    return new BN(`1e${this}`);
  }
  public static _1e(n: value): BN {
    const _n = new BN(n);
    return new BN(`1e${_n}`);
  }

  public add(n: value): BN {
    const _n = new BN(n);
    return new BN(this.plus(_n));
  }
  public static add(a: value, b: value): BN {
    const _a = new BN(a);
    const _b = new BN(b);
    return new BN(_a.plus(_b));
  }

  public sub(n: value): BN {
    const _n = new BN(n);
    return new BN(this.minus(_n));
  }
  public static sub(a: value, b: value): BN {
    const _a = new BN(a);
    const _b = new BN(b);
    return new BN(_a.minus(_b));
  }

  public mul(n: value): BN {
    const _n = new BN(n);
    return new BN(this.multipliedBy(_n));
  }
  public static mul(a: value, b: value): BN {
    const _a = new BN(a);
    const _b = new BN(b);
    return new BN(_a.multipliedBy(_b));
  }

  public div(n: value): BN {
    const _n = new BN(n);
    return new BN(this.dividedBy(_n));
  }
  public static div(numerator: value, denominator: value): BN {
    const _numerator = new BN(numerator);
    const _denominator = new BN(denominator);
    return new BN(_numerator.dividedBy(_denominator));
  }

  public percent(n: value): BN {
    const _n = new BN(n);
    return this.mul(_n).div(100)
  }
  public static percent(n: value, percent: value): BN {
    const _n = new BN(n);
    const _percent = new BN(percent);
    return _n.mul(_percent).div(100)
  }

  public trunc(dp = 0): BN {
    const _dp = new BN(dp);
    return new BN(this.toFixed(_dp.toNumber(), BN.ROUND_DOWN));
  }
  public static trunc(n: value, dp = 0): BN {
    const _n = new BN(n);
    const _dp = new BN(dp);
    return new BN(_n.toFixed(_dp.toNumber(), BN.ROUND_DOWN));
  }

  public round(dp = 0): BN {
    const _dp = new BN(dp);
    return new BN(this.toFixed(_dp.toNumber(), BN.ROUND_HALF_UP));
  }
  public static round(n: value, dp = 0): BN {
    const _n = new BN(n);
    const _dp = new BN(dp);
    return new BN(_n.toFixed(_dp.toNumber(), BN.ROUND_HALF_UP));
  }

  public integer(): BN {
    return new BN(this.toString().split('.')[0]);
  }
  public static integer(n: value): BN {
    const _n = new BN(n);
    return new BN(_n.toString().split('.')[0]);
  }

  public decimals(): BN {
    return new BN(this.toString().split('.')[1]);
  }
  public static decimals(n: value): BN {
    const _n = new BN(n);
    return new BN(_n.toString().split('.')[1]);
  }

  public toHex(): string {
    return '0x' + this.toString(16);
  }
  public static toHex(n: value): string {
    const _n = new BN(n);
    return '0x' + _n.toString(16);
  }

  public format(): string {
    return this.trunc(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  public static format(n: value): string {
    return new BN(n)
      .trunc(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  private static cleanFormat(n: value): string {
    return n.toString().replaceAll(',', '');
  }
}
