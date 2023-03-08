import { BN } from '../../web3/types/bn';
import { INVEST_PERIOD_OPTIONS } from '../../utils/utils';

type TransactionSummaryProps = {
  assetIn: string;
  assetOut: string;
  investmentAmount: BN;
  frequency: string;
  iterations: BN;
  fees: BN;
  cashback: BN;
  yields: BN;
  apy: BN;
};

const TransactionSummary = (props: TransactionSummaryProps) => {
  const { assetIn, assetOut, investmentAmount, frequency, iterations, fees, cashback, yields, apy } = props;
  const amountPerSwap = investmentAmount.div(iterations);
  const frequencyInSeconds = new BN(INVEST_PERIOD_OPTIONS.find(x => x.id === frequency)?.value || NaN);
  const fromDate = new Date().toLocaleDateString();
  const untilDate = iterations.lt(2) ? '-' : new Date(Date.now() + frequencyInSeconds.mul(iterations).toNumber() * 1000).toLocaleDateString();

  const transactionSummaryRow = [
    { label: 'From', value: fromDate },
    { label: 'Until', value: untilDate == 'Invalid Date' ? '-' : untilDate },
    { label: 'APY', value: apy.toNumber(), currency: '%' },
    { label: 'Total amount', value: investmentAmount.isNaN() ? '' : investmentAmount.format(), currency: assetIn },
  ];

  return (
    <div className='transaction-summary'>
      <p className='u-mb-8'>Investment summary</p>
      <div className='transaction-summary__row'>
        <p>
          {iterations.gte(2) && !iterations.isNaN() && amountPerSwap.gt(0) ? amountPerSwap.trunc(4).toString() : ''} {assetIn} will be swapped {frequency} to {assetOut}
        </p>
      </div>
      {transactionSummaryRow.map(item => (
        <div key={item.label} className='transaction-summary__row'>
          <p>{item.label}</p>
          <p>
            {item.value + ' '}
            {item.currency}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TransactionSummary;
