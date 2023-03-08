import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { handleNetworkSwitch, SUPPORTED_CHAINS } from '../../utils/utils';
import { Addresses } from '../../web3/constants/addresses';
import { Token } from '../../web3/types/token';
import { BN } from '../../web3/types/bn';
import { StackitV3 } from 'src/web3/contracts/StackitV3';
import { Position } from 'src/web3/types/stream';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

declare var window: any;

type WithdrawProps = {
  position: Position;
};

const Withdraw = React.forwardRef((props: WithdrawProps, ref: any) => {
  const { position } = props;
  const [account, setAccount] = useState(null);
  const [availableBalance, setAvailableBalance] = useState(new BN(0));
  const [withdrawAmount, setWithdrawAmount] = useState(new BN(0));
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdrawAmount = (e: any) => setWithdrawAmount(new BN(e.target.value || 0));

  const handleWithdraw = async () => {
    setIsLoading(true);
    try {
      const chainId = String((window as any).ethereum.chainId)
      if (!SUPPORTED_CHAINS.includes(chainId)) {
        await handleNetworkSwitch();
        return;
      }
      const stackit = new StackitV3(chainId);
      const streamHasYield = await stackit.isYieldActive(position.id)
      const assetInAddress = Addresses[position.assetIn.ticker.toUpperCase()][chainId];
      const token = new Token(chainId, assetInAddress);
      const decimals = await token.decimals();

      // withdraw
      const txPayload = await stackit.withdrawAsset(position.id);
      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account,
            ...txPayload,
          },
        ],
      });
      toast.success('Withdraw successful.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidWithdrawParams = () => {
    return availableBalance.gte(withdrawAmount) && withdrawAmount.gt(0);
  };

  const getConnectedAccount = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      setAccount(accounts[0]);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    getConnectedAccount();
    if (position && position.invested) {
      setAvailableBalance(position.invested);
    }
  }, [account, availableBalance, position, position.invested]);

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
          <div className='input-number__label'>
            <label htmlFor='withdrawAmount'>Total withdrawal amount</label>
            <p>
              Available: {availableBalance.format()} {position.assetIn.ticker}
            </p>
          </div>
          {position.streamInfo.lastSwap.eq(0) ?
            <>
              <p className='u-mb-20 red'>
                Your position must have been swapped at least once before you can withdraw
              </p>
              <Button size='lg' title='Click to confirm withdrawel' color='grey' onClick={() => { }} disabled={true}>
                Confirm
              </Button>
            </>
            :
            <Button size='lg' title='Click to confirm withdrawel' color='green' onClick={handleWithdraw} disabled={false}>
              {!isLoading ? 'Confirm' : <LoadingSpinner />}
            </Button>
          }
        </>
      ) : (
        <></>
      )}
    </div>
  );
});

export default Withdraw;
