import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { handleNetworkSwitch, SUPPORTED_CHAINS } from 'src/utils/utils';
import { StackitV3 } from 'src/web3/contracts/StackitV3';
import { BN } from 'src/web3/types/bn';
import { Position } from 'src/web3/types/stream';
import Button from './Button';

type CardPositionProps = {
  position: Position;
  handleTopupPaneOpen: Function;
  handleWithdrawPaneOpen: Function;
};

const CardPosition = (props: CardPositionProps) => {
  const { position, handleTopupPaneOpen, handleWithdrawPaneOpen } = props;
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState(position.status);

  const getConnectedAccount = async () => {
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
      setAccount(accounts[0]);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handlePause = async (streamId: BN) => {
    const chainId = String((window as any).ethereum.chainId)
    if (!SUPPORTED_CHAINS.includes(chainId)) {
      await handleNetworkSwitch();
      return;
    }
    const stackit = new StackitV3(chainId);
    const txPayload = await stackit.stop(streamId);
    await (window as any).ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: account,
          ...txPayload,
        },
      ],
    });
    setStatus('paused');
  };

  const handleResume = async (streamId: BN) => {
    const chainId = String((window as any).ethereum.chainId)
    if (!SUPPORTED_CHAINS.includes(chainId)) {
      await handleNetworkSwitch();
      return;
    }
    const stackit = new StackitV3(chainId);
    const txPayload = await stackit.start(streamId);
    await (window as any).ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: account,
          ...txPayload,
        },
      ],
    });
    setStatus('ongoing');
  };

  useEffect(() => {
    getConnectedAccount();
  }, [account]);

  const isPaused = () => {
    return !Number(position.streamInfo.isactive) && Number(position.streamInfo.shares)
  }

  const isFinished = () => {
    return !Number(position.streamInfo.isactive) && !Number(position.streamInfo.shares)
  }

  return (
    <div className='card card--position' data-key={position.id}>
      <div className='card__header'>
        <div className='card__wrapper'>
          <div className='card__wrapper--image'>
            <img src={(position.assetOut as any)?.image} alt={`${position.assetOut.name} logo`} className='card__image' />
            <img src={`/images/logo-${position.assetIn.ticker.toLowerCase()}.svg`} alt={`${position.assetIn.name} logo`} className='card__image' />
          </div>
          <div className='card__title'>
            <h5>{(position.assetOut as any)?.symbol.toUpperCase()}</h5>
            <h4>{position.assetOut.name}</h4>
          </div>
        </div>
        <div className='card__status'>
          <span className={`select__badge u-bg-${status}`}></span>
          <h4>{status}</h4>
        </div>
      </div>
      <div className='card__body'>
        <div className='card__value'>
          <h5>Currently invested:</h5>
          <h4>${position.invested.format()}</h4>
        </div>
        <div className='card__value'>
        </div>
        <div className='card__value'>
          <h5>Start date:</h5>
          <h4>{position.startDate.toLocaleDateString()}</h4>
        </div>
        <div className='card__value'>
          <h5>End date:</h5>
          <h4>{isFinished()
            ? new Date(Number(position.streamInfo.lastSwap) * 1000 || position.endDate).toLocaleDateString()
            : isPaused()
              ? "-"
              : new Date(
                Date.now() + new BN(position.streamInfo.interval).mul(position.streamInfo.iteration).mul(1000).toNumber()
              ).toLocaleDateString()
          }</h4>
        </div>
      </div>
      <div className='card__footer'>
        <Button size='sm' title={`Click to top up ${position.assetOut.name} investment plan`} onClick={() => handleTopupPaneOpen(position.id)} disabled={status == 'finished'} color='green'>
          Top up
        </Button>
        {status == 'ongoing' ? (
          <Button size='sm' title={`Click to pause ${position.assetOut.name} investment plan`} onClick={() => handlePause(position.id)} color='yellow'>
            Pause
          </Button>
        ) : (
          <Button size='sm' title={`Click to resume ${position.assetOut.name} investment plan`} onClick={() => handleResume(position.id)} disabled={status == 'finished'} color='yellow'>
            Resume
          </Button>
        )}
        <Button size='sm' title={`Click to withdraw ${position.assetOut.name} investment plan`} onClick={() => handleWithdrawPaneOpen(position.id)} disabled={status == 'finished'} color='red'>
          Withdraw
        </Button>
      </div>
    </div>
  );
};

export default CardPosition;
