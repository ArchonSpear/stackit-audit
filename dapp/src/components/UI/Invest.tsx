import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { StackitReferral } from '../../web3/contracts/StackitReferral';
import { Addresses } from '../../web3/constants/addresses';
import { BN } from '../../web3/types/bn';
import { Token } from '../../web3/types/token';
import { INVEST_PERIOD_OPTIONS, INVEST_STABLECOINS, INVEST_MIN_ITERATIONS, MAX_VALUE, DEFAULT_INVEST_MIN_AMOUNT_PER_SWAP, ZERO_ADDRESS, handleNetworkSwitch, INVEST_YIELDS, SUPPORTED_CHAINS } from '../../utils/utils';
import Button from './Button';
import Select from 'react-select';
import TransactionSummary from './TransactionSummary';
import TabNav from './Tabs/TabNav';
import LoadingSpinner from './LoadingSpinner';
import { useRouter } from 'next/router';
import { StackitV3 } from 'src/web3/contracts/StackitV3';
import axios from 'axios';

const Invest = React.forwardRef(({ coin }: any, ref: any) => {
  const router = useRouter();
  const [account, setAccount] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [iterations, setIterations] = useState(new BN(0));
  const [availableBalanceInEther, setAvailableBalanceInEther] = useState(new BN(0));
  const [investmentAmount, setInvestmentAmount] = useState(new BN(0));
  const [assetIn, setAssetIn] = useState('BUSD');
  const [yieldOption, setYieldOption] = useState('None');
  const [isLoading, setIsLoading] = useState(false);
  const [assetOut] = useState(coin);
  const [fees] = useState(new BN(0));
  const [cashback] = useState(new BN(0));
  const [yields] = useState(new BN(0));
  const [apy, setApy] = useState(new BN(0));
  const [minAmountPerBuyInEther, setMinAmountPerBuyInEther] = useState(new BN(0));
  const [refLink, setRefLink] = useState('' as any);

  const updateRefLink = () => {
    setRefLink(router.query.ref);
  };

  useEffect(() => {
    updateRefLink();
  }, [router.query]);

  const updateApy = async () => {
    let _apy = new BN(0);
    if (!(assetIn == 'DAI' || assetIn == 'USDC') && yieldOption == 'Stargate') {
      try {
        const { data } = await axios.get('https://api.beefy.finance/apy');
        _apy = new BN(data[`stargate-bsc-` + assetIn.toLocaleLowerCase()]).mul(100).trunc(2);
      } catch (_) { }
    }
    setApy(_apy);
  };

  useEffect(() => {
    updateApy();
  }, [yieldOption, assetIn]);

  const handleInvestmentAmount = (e: any) => setInvestmentAmount(new BN(e.target.value));

  const handleIteration = (e: any) => setIterations(new BN(e.target.value));

  const isValidActivateParams = () => {
    return investmentAmount.lte(availableBalanceInEther) && investmentAmount.div(iterations).gte(minAmountPerBuyInEther) && iterations.gte(INVEST_MIN_ITERATIONS);
  };

  const getConnectedAccount = async () => {
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
      setAccount(accounts[0]);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const fetchBalance = async (tokenName: any) => {
    if (!account) {
      return;
    }
    try {
      const chainId = String((window as any).ethereum.chainId);
      if (!SUPPORTED_CHAINS.includes(chainId)) {
        await handleNetworkSwitch();
        return;
      }
      const token = new Token(chainId, Addresses[tokenName][chainId]);
      const decimals = await token.decimals();
      const balanceInEther = (await token.balanceOf(account)).div('1e' + decimals);
      setAvailableBalanceInEther(balanceInEther);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateMinAmountPerBuyInEther = async () => {
    // contracts info
    const chainId = String((window as any).ethereum.chainId);
    if (!SUPPORTED_CHAINS.includes(chainId)) {
      await handleNetworkSwitch();
      return;
    }
    const stackit = new StackitV3(chainId);
    const assetInAddress = Addresses[assetIn][chainId];
    const token = new Token(chainId, assetInAddress);
    const decimals = await token.decimals();

    // calculate min amount from contract
    const minAmountPerBuyInEtherFromContract = (await stackit.getMinimumAmount(assetInAddress)).weiToEther(decimals);

    // set min amount or default
    const _minAmountPerBuyInEther = minAmountPerBuyInEtherFromContract.gt(DEFAULT_INVEST_MIN_AMOUNT_PER_SWAP) ? minAmountPerBuyInEtherFromContract : DEFAULT_INVEST_MIN_AMOUNT_PER_SWAP;
    setMinAmountPerBuyInEther(_minAmountPerBuyInEther);
  };

  useEffect(() => {
    updateMinAmountPerBuyInEther();
  }, [assetIn]);

  useEffect(() => {
    getConnectedAccount();
    if (account) {
      fetchBalance(assetIn);
    }
  }, [account, assetIn]);

  const handleInvestment = async () => {
    setIsLoading(true);
    try {
      const chainId = String((window as any).ethereum.chainId);
      if (!SUPPORTED_CHAINS.includes(chainId)) {
        await handleNetworkSwitch();
        return;
      }

      // check ref link
      const stackitReferral = new StackitReferral(chainId);
      const checkRefLink = await stackitReferral.referralLinkSecurity(refLink || 0);
      let validLinkOrZero = checkRefLink != ZERO_ADDRESS ? String(refLink) : '0';

      // stackit contracts info
      const stackit = new StackitV3(chainId);
      const assetInAddress = Addresses[assetIn][chainId];
      const assetOutAddress = assetOut.address;
      const stackitAddress = Addresses['STACKIT_V3'][chainId];
      const token = new Token(chainId, assetInAddress);
      const decimals = await token.decimals();

      // check allowance for assetIn
      const allowance = await token.getAllowance(account, stackitAddress);
      if (allowance.isLessThan(investmentAmount.etherToWei(decimals))) {
        const txPayload = token.setAllowance(stackitAddress, MAX_VALUE);
        await (window as any).ethereum.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: account,
              ...txPayload,
            },
          ],
        });
      }
      console.log(`current allowance: ${allowance}`);

      // stream info
      const _amountPerBuy = investmentAmount.div(iterations).etherToWei(decimals);
      const _frequency = new BN(INVEST_PERIOD_OPTIONS.find(x => x.id === frequency)?.value || NaN);
      const startTime = new BN(Date.now() / 1000 + 60).trunc(); // now + 1minutes
      const hasYield = yieldOption == 'None' ? false : true;

      // activate DCA
      const txPayload = await stackit.activate(_amountPerBuy, _frequency, assetInAddress, validLinkOrZero, assetOutAddress, iterations, startTime, hasYield);
      await (window as any).ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account,
            ...txPayload,
          },
        ],
      });
      toast.success('Investment successful.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='invest'>
      <label>Selected product</label>
      <div className='invest__product'>
        <img src={coin.image} alt={`${coin.name} logo`} className='invest__image' />
        <div className='invest__title'>
          <h5>{coin.symbol}</h5>
          <h4>{coin.name}</h4>
        </div>
      </div>
      <div className='input-number u-mb-20'>
        <div className='input-number__label'>
          <label htmlFor='investmentAmount'>Total investment amount</label>
          <p>
            Available: {new BN(String(availableBalanceInEther)).format()} {assetIn}
          </p>
        </div>
        <div className='input-number__input'>
          <Select
            className='select__input'
            instanceId='stablecoin'
            options={INVEST_STABLECOINS}
            defaultValue={INVEST_STABLECOINS[0]}
            isSearchable={false}
            onChange={choice => {
              setAssetIn(choice ? choice.value : '');
              if (choice && (choice.value == 'DAI' || choice.value == 'USDC')) {
                setYieldOption(INVEST_YIELDS[0].label);
              }
            }}
            isOptionDisabled={coin => coin.isDisabled}
            formatOptionLabel={coin => (
              <div className='select__option'>
                <img src={coin.image} alt={`${coin.label} logo`} />
                <span>{coin.label}</span>
              </div>
            )}
          />
          <input id='investmentAmount' placeholder='0.0' type='number' min='0' autoComplete='off' autoCorrect='off' spellCheck='false' inputMode='decimal' onChange={handleInvestmentAmount} autoFocus />
        </div>
        <div className='input-number__messages'>
          {investmentAmount.div(iterations).lt(minAmountPerBuyInEther) ? (
            <p>
              The minimum investment amount is {minAmountPerBuyInEther.toString()} {assetIn} per iteration
            </p>
          ) : null}
          {investmentAmount.gt(availableBalanceInEther) ? <p>Insufficient balance</p> : null}
        </div>
      </div>
      <div className='tabs'>
        <p>Yields</p>
        <ul className='tabs__nav'>
          <Select
            className='select__input'
            instanceId='yields'
            options={INVEST_YIELDS}
            defaultValue={INVEST_YIELDS[0]}
            value={INVEST_YIELDS.find(x => x.label == yieldOption)}
            isSearchable={false}
            onChange={choice => setYieldOption(choice ? choice.label : '')}
            isOptionDisabled={option => {
              if (option.label == 'Stargate' && (assetIn == 'DAI' || assetIn == 'USDC')) {
                return true;
              } else {
                return false;
              }
            }}
            formatOptionLabel={option => (
              <div className='select__option'>
                <img src={option.image} alt={`${option.label} logo`} />
                <span>{option.label}</span>
              </div>
            )}
          />
        </ul>
      </div>
      <div className='tabs'>
        <p>Frequency</p>
        <ul className='tabs__nav'>
          {INVEST_PERIOD_OPTIONS.map(period => (
            <TabNav key={period.id} title={period.title} id={period.id} activeTab={frequency} setActiveTab={setFrequency}></TabNav>
          ))}
        </ul>
        <p>Iterations</p>
        <input id='iterations' placeholder='0' type='number' min='2' autoComplete='off' autoCorrect='off' spellCheck='false' inputMode='decimal' onChange={handleIteration} />
        <div className='input-number__messages'>{iterations.lt(INVEST_MIN_ITERATIONS) ? <p>The minimum number of iterations is {INVEST_MIN_ITERATIONS}</p> : null}</div>
      </div>
      <TransactionSummary assetIn={assetIn} assetOut={assetOut.symbol} investmentAmount={investmentAmount} frequency={frequency} iterations={iterations} fees={fees} cashback={cashback} yields={yields} apy={apy} />
      <Button size='lg' title='Click to start investing' onClick={handleInvestment} disabled={!isValidActivateParams()} color='green'>
        {!isLoading ? 'Confirm' : <LoadingSpinner />}
      </Button>
    </div>
  );
});

export default Invest;
