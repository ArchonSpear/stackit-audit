import Script from 'next/script';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { StackitV3 } from 'src/web3/contracts/StackitV3';
import { ContractInfo } from '../web3/constants/addresses';
import { BN } from '../web3/types/bn';
import { Position } from 'src/web3/types/stream';
import Head from 'next/head';
import SlidingPane from 'react-sliding-pane';
import LayoutContainer from '../components/Layout/LayoutContainer';
import LayoutGrid from '../components/Layout/LayoutGrid';
import CardPosition from '../components/UI/CardPosition';
import Hero from '../components/UI/Hero';
import Withdraw from 'src/components/UI/Withdraw';
import Topup from 'src/components/UI/Topup';
import { handleNetworkSwitch, SUPPORTED_CHAINS } from 'src/utils/utils';
import { Token } from 'src/web3/types/token';

import data from '../data/pancakeswap-bsc.json';

const Positions = () => {
  const ref = React.createRef();
  const [status, setStatus] = useState('all');
  const [positions, setPositions] = useState([] as Position[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTopupPaneOpen, setIsTopupPaneOpen] = useState(false);
  const [isTopupPaneClicked, setIsTopupPaneClicked] = useState({} as Position);
  const [isWithdrawPaneOpen, setIsWithdrawPaneOpen] = useState(false);
  const [isWithdrawPaneClicked, setIsWithdrawPaneClicked] = useState({} as Position);
  const [isLoading, setIsLoading] = useState(true);
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
      const chainId = String((window as any).ethereum.chainId);
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
          position.assetOut = data.find(x => x.address === streamInfo.toBuy) as any;
          if (!position.assetOut) {
            const token = await Token.new(chainId, streamInfo.toBuy);
            position.assetOut = {
              name: token._name,
              symbol: token._symbol,
              address: streamInfo.toBuy,
              chainId: chainId,
              decimals: Number(token._decimals),
              image: '/images/unknown.svg',
            } as any;
          }

          //invested: BN
          const decimals = await new Token(chainId, streamInfo.buyWith).decimals();
          position.invested = (await stackit.amountLeftInStream(id)).weiToEther(decimals);

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
      setIsLoading(!isLoading);
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

  const getFilteredList = () => {
    if (!status || status === 'all') {
      return positions;
    }
    return positions.filter(position => position.status === status);
  };

  const filteredPositions = useMemo(getFilteredList, [status, positions]);

  const handleTopupPaneOpen = (id: any) => {
    setIsTopupPaneClicked(positions.find(x => x.id === id) as Position);
    setIsTopupPaneOpen(!isTopupPaneOpen);
  };

  const handleTopupPaneClose = () => {
    setIsTopupPaneOpen(!isTopupPaneOpen);
    setIsTopupPaneClicked({} as Position);
  };

  const handleWithdrawPaneOpen = (id: any) => {
    setIsWithdrawPaneClicked(positions.find(x => x.id === id) as Position);
    setIsWithdrawPaneOpen(!isWithdrawPaneOpen);
  };

  const handleWithdrawPaneClose = () => {
    setIsWithdrawPaneOpen(!isWithdrawPaneOpen);
    setIsWithdrawPaneClicked({} as Position);
  };

  return (
    <>
      <Head>
        <title>Positions - Stackit</title>
        <meta name='description' content='Stackit' />
      </Head>
      <Script src='https://www.googletagmanager.com/gtag/js?id=G-0224EGLHQT' strategy='afterInteractive' />
      <Script id='google-analytics' strategy='afterInteractive'>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-0224EGLHQT');
        `}
      </Script>
      <Hero heading='Positions' subHeading='View all of your investments' />
      <LayoutContainer size='md' margin='u-mt-32 u-mb-40'>
        <LayoutGrid rows={2} columns={3} rowsResponsive={1} columnsResponsive={1}>
          {!isLoading ? filteredPositions.filter(position => position.assetOut?.name.toLowerCase().includes(searchQuery.toLowerCase()) || (position.assetOut as any)?.symbol.toLowerCase().includes(searchQuery.toLowerCase())).map((position, id) => <CardPosition key={id} position={position} handleTopupPaneOpen={handleTopupPaneOpen} handleWithdrawPaneOpen={handleWithdrawPaneOpen} />) : 'Loading positions...'}
        </LayoutGrid>
      </LayoutContainer>
      <SlidingPane className='sliding-pane' overlayClassName='sliding-pane__overlay' isOpen={isTopupPaneOpen} title='Topup' width='600px' onRequestClose={handleTopupPaneClose}>
        <Topup ref={ref} position={isTopupPaneClicked} />
      </SlidingPane>
      <SlidingPane className='sliding-pane' overlayClassName='sliding-pane__overlay' isOpen={isWithdrawPaneOpen} title='Withdraw' width='600px' onRequestClose={handleWithdrawPaneClose}>
        <Withdraw ref={ref} position={isWithdrawPaneClicked} />
      </SlidingPane>
    </>
  );
};

export default Positions;
