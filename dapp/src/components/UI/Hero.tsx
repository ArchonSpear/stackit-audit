import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { handleNetworkSwitch, SUPPORTED_CHAINS } from 'src/utils/utils';
import { ContractInfo, Addresses } from 'src/web3/constants/addresses';
import { StackitV3 } from 'src/web3/contracts/StackitV3';
import { BN } from 'src/web3/types/bn';
import { Position } from 'src/web3/types/stream';
import { Token } from 'src/web3/types/token';
import LayoutContainer from '../Layout/LayoutContainer';
import LayoutFlex from '../Layout/LayoutFlex';

import data from '../../data/pancakeswap-bsc.json';

type HeroProps = {
  heading?: string;
  subHeading?: string;
  children?: React.ReactNode;
  page?: any;
};

const Hero = (props: HeroProps) => {
  const { heading, subHeading, children } = props;
  const [, setPositions] = useState([] as Position[]);
  const [balance, setBalance] = useState(new BN(0));
  const [totalSwapped, setTotalSwapped] = useState(new BN(0));
  const [account, setAccount] = useState(null);

  const getConnectedAccount = async () => {
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
      setAccount(accounts[0]);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getPositionData = async () => {
    if (!account) return;
    try {
      const chainId = String((window as any).ethereum.chainId)
      if (!SUPPORTED_CHAINS.includes(chainId)) {
        await handleNetworkSwitch();
        return;
      }
      const stackit = new StackitV3(chainId);
      const streamIds = await stackit.getListOfStreams(account);

      // create position objects
      const positions: Position[] = await Promise.all(
        streamIds.map(async id => {
          // id, streamInfo
          const streamInfo = await stackit.getStreamInfo(id);
          const position: Position = { id, streamInfo } as any;

          // assetIn, assetOut //workaround... react is weird... TODO: clean this code
          Object.keys(ContractInfo).map(x => {
            if (Number(x) == Number(streamInfo.buyWith)) position.assetIn = ContractInfo[x];
          });
          position.assetOut = data.find(x => x.address === streamInfo.toBuy) as any
          if (!position.assetOut) {
            const token = await Token.new(chainId, streamInfo.toBuy)
            position.assetOut = {
              name: token._name,
              symbol: token._symbol,
              address: streamInfo.toBuy,
              chainId: chainId,
              decimals: Number(token._decimals),
              image: '/images/unknown.svg',
            } as any
          }

          //invested: BN
          const decimals = await new Token(chainId, streamInfo.buyWith).decimals()
          position.invested = (await stackit.amountLeftInStream(id)).weiToEther(decimals)

          //status: "ongoing" | "finished" | "paused"
          if (Number(streamInfo.isactive)) position.status = 'ongoing';
          else if (Number(position.invested)) position.status = 'paused';
          else position.status = 'finished';

          //startDate: Date, endDate: Date
          const startTime = new BN(streamInfo.startTime);
          position.startDate = new Date(startTime.toNumber() * 1000);
          position.endDate = new Date(startTime.add(new BN(streamInfo.interval).mul(streamInfo.iteration)).toNumber() * 1000);

          //pnl: BN
          position.pnl = new BN(0);

          return position;
        })
      );
      setPositions(positions);

      let _balance = new BN(0);
      let _totalSwapped = new BN(0);
      await Promise.all(
        positions.map(async pos => {
          const decimals = await new Token(chainId, pos.streamInfo.buyWith).decimals();
          _balance = _balance.add(pos.invested);
          _totalSwapped = _totalSwapped.add(pos.streamInfo.buyWithSwapped.weiToEther(decimals));
        })
      );
      setBalance(_balance);
      setTotalSwapped(_totalSwapped);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    getConnectedAccount();
    if (account) {
      getPositionData();
    }
  }, [account]);

  return (
    <div className='hero'>
      <LayoutContainer size='md' margin='u-mb-0'>
        <LayoutFlex direction='row-center-space-between' margin='u-mb-60'>
          <div className='hero__heading'>
            <h1>{heading}</h1>
            <h3>{subHeading}.</h3>
          </div>
          <div className='hero__portfolio'>
            <ul key='balance'>
              <li>Current investments</li>
              <li>${balance.format()} USD</li>
            </ul>
            <ul key='contribution'>
              <li>All time investments</li>
              <li>${totalSwapped.format()} USD</li>
            </ul>
          </div>
        </LayoutFlex>
        {children}
      </LayoutContainer>
    </div>
  );
};

export default Hero;
