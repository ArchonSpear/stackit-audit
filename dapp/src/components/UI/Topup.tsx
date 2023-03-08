import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Addresses } from '../../web3/constants/addresses';
import { Token } from '../../web3/types/token';
import { BN } from '../../web3/types/bn';
import { StackitV3 } from 'src/web3/contracts/StackitV3';
import { handleNetworkSwitch, MAX_VALUE, SUPPORTED_CHAINS } from '../../utils/utils';
import { Position } from 'src/web3/types/stream';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

declare var window: any;

type TopupProps = {
  position: Position;
};

const Topup = React.forwardRef((props: TopupProps, ref: any) => {
  const { position } = props;
  const [account, setAccount] = useState('');
  const [availableBalanceInEther, setAvailableBalanceInEther] = useState(new BN(0));
  const [topupAmount, setTopupAmount] = useState(new BN(0));
  const [isLoading, setIsLoading] = useState(false);

  const handleTopupAmount = (e: any) => setTopupAmount(new BN(e.target.value || 0));

  const handleTopup = async () => {
    setIsLoading(true);
    try {
      // contracts info
      const chainId = String((window as any).ethereum.chainId)
      if (!SUPPORTED_CHAINS.includes(chainId)) {
        await handleNetworkSwitch();
        return;
      }
      const stackit = new StackitV3(chainId);
      const stackitAddress = Addresses['STACKIT_V3'][chainId];
      const assetInAddress = Addresses[position.assetIn.ticker.toUpperCase()][chainId];
      const token = new Token(chainId, assetInAddress);
      const decimals = await token.decimals();

      // check allowance for assetIn
      const allowance = await token.getAllowance(account, stackitAddress);
      if (allowance.isLessThan(topupAmount.etherToWei(decimals))) {
        const txPayload = token.setAllowance(stackitAddress, MAX_VALUE);
        await window.ethereum.request({
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
      const amountPerBuy = topupAmount
        .div(position.streamInfo.iteration)
        .etherToWei(decimals)

      // topup
      const txPayload = await stackit.topUp(position.id, amountPerBuy);
      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account,
            ...txPayload,
          },
        ],
      });
      toast.success('Topup successful.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidTopupParams = () => {
    return availableBalanceInEther.gte(topupAmount) && topupAmount.gt(0);
  };

  const getConnectedAccount = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
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
      const chainId = String((window as any).ethereum.chainId)
      if (!SUPPORTED_CHAINS.includes(chainId)) {
        await handleNetworkSwitch();
        return;
      }
      const token = new Token(chainId, Addresses[tokenName.toUpperCase()][chainId]);
      const decimals = await token.decimals();
      const balanceInEther = new BN(await token.call('balanceOf', account)).weiToEther(decimals);
      setAvailableBalanceInEther(balanceInEther);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    getConnectedAccount();
    if (account) {
      fetchBalance(position.assetIn.ticker);
    }
  }, [account]);

  return (
    <div className='invest' ref={ref}>
      {position.assetOut ? (
        <>
          <label>Selected product</label>
          <div className='invest__product'>
            <img src={(position.assetOut as any)?.image} alt={`${position.assetOut.name} logo`} className='invest__image' />
            <div className='invest__title'>
              <h5>{position.assetOut.ticker}</h5>
              <h4>{position.assetOut.name}</h4>
            </div>
          </div>
          <div className='input-number u-mb-20'>
            <div className='input-number__label'>
              <label htmlFor='topupAmount'>Total topup amount</label>
              <p>
                Available: {availableBalanceInEther.format()} {position.assetIn.ticker}
              </p>
            </div>
            <div className='input-number__input'>
              <input id='topupAmount' placeholder='0.0' type='number' min='0' autoComplete='off' autoCorrect='off' spellCheck='false' inputMode='decimal' onChange={handleTopupAmount} autoFocus />
            </div>
            <div className='input-number__messages'>{topupAmount.gt(availableBalanceInEther) ? <p>Insufficient balance</p> : null}</div>
          </div>
          <p className='u-mb-20'>
            You are adding {topupAmount.div(position.streamInfo.iteration).toString()} {position.assetIn.ticker} to the remaining {position.streamInfo.iteration.toString()} iterations of this investment plan
          </p>
          <Button size='lg' title='Click to confirm topup' color='green' onClick={handleTopup} disabled={!isValidTopupParams()}>
            {!isLoading ? 'Confirm' : <LoadingSpinner />}
          </Button>
        </>
      ) : (
        <></>
      )}
    </div>
  );
});

export default Topup;
