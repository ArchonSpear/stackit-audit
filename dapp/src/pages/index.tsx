import Script from 'next/script';
import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import Head from 'next/head';
import SlidingPane from 'react-sliding-pane';
import LayoutContainer from '../components/Layout/LayoutContainer';
import LayoutGrid from '../components/Layout/LayoutGrid';
import CardInvest from '../components/UI/CardInvest';
import InputSearch from '../components/UI/Inputs/InputSearch';
import Invest from '../components/UI/Invest';
import Hero from '../components/UI/Hero';
import { isAddress } from '../utils/address';
import dataBSC from '../data/pancakeswap-bsc.json';
import dataARB from '../data/sushiswap-arbitrum.json';
import { Token } from '../web3/types/token';
import { DEFAULT_NETWORK, SUPPORTED_CHAINS } from 'src/utils/utils';
import Web3 from 'web3';

const Home = () => {
  const ref = React.createRef();
  const [chainId, setChainId] = useState(DEFAULT_NETWORK.chainId);
  const [metamask, setMetamask] = useState({} as any);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [isPaneOpen, setIsPaneOpen] = useState(false);
  const [isPaneClicked, setIsPaneClicked] = useState([]);
  const [state, setstate] = useState({
    query: '',
    coins: null as any,
  });
  const dataPerChain = {
    '0x38': dataBSC,
    '0xa4b1': dataARB,
  }

  const handleWrongNetwork = async () => {
    if (!SUPPORTED_CHAINS.includes(metamask.chainId)) {
      try {
        await metamask.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: Web3.utils.toHex(chainId) }],
        });
      } catch (err: any) {
        if (err.code === 4902) {
          await metamask.request({
            method: 'wallet_addEthereumChain',
            params: [DEFAULT_NETWORK],
          });
        }
      }
    }
  };

  useEffect(() => {
    setMetamask((window as any).ethereum);
  }, []);

  useEffect(() => {
    setChainId(metamask.chainId);
  }, [metamask]);

  useEffect(() => {
    setIsLoadingToken(true);
    handleWrongNetwork();
    if (chainId == '0x38' || chainId == '0xa4b1') {
      setstate({
        ...state,
        coins: dataPerChain[chainId],
      });
      setIsLoadingToken(false);
    }
  }, [chainId]);

  const handlePaneOpen = (symbol: any) => {
    // @ts-ignore: Unreachable code error
    setIsPaneClicked(state.coins.find(x => x.symbol === symbol));
    setIsPaneOpen(!isPaneOpen);
    document.body.classList.add('is-fixed');
  };

  const handlePaneClose = () => {
    setIsPaneOpen(!isPaneOpen);
    setIsPaneClicked([]);
    document.body.classList.remove('is-fixed');
  };

  const handleSearch = async (e: any) => {
    if (chainId == '0x38' || chainId == '0xa4b1') {
      const data = dataPerChain[chainId]
      const query = e.target.value;
      setstate({
        query,
        coins: data,
      });
      const _isAddress = isAddress(query);

      // known tokens
      let results = data.filter(coin => {
        if (_isAddress) {
          return coin.address.toLowerCase().includes(query.toLowerCase());
        } else {
          return coin.name.toLowerCase().includes(query.toLowerCase()) || coin.symbol.toLowerCase().includes(query.toLowerCase());
        }
      });

      // unknown token, try to get contract info
      if (_isAddress && results.length == 0) {
        setIsLoadingToken(true);
        try {
          const token = await Token.new(chainId, query);
          results = [
            {
              name: token._name,
              symbol: token._symbol,
              address: query,
              chainId: Number(chainId),
              decimals: Number(token._decimals),
              image: '/images/unknown.svg',
            },
          ];
        } catch (err) {
          /* couldnt instanciate token */
        }
        setIsLoadingToken(false);
      }

      setstate({
        query,
        coins: results,
      });
    }
  };

  return (
    <>
      <Head>
        <title>Invest - Stackit</title>
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
      <Hero heading='Setup New Position' subHeading='Setup an automatic dollar cost averaging strategy in seconds' />
      <LayoutContainer size='sm' margin='u-mt-32 u-mb-40'>
        <InputSearch placeholder='Search token name or paste address' value={state.query} onChange={handleSearch} />
        <LayoutGrid rows={2} columns={3} rowsResponsive={1} columnsResponsive={1}>
          {isLoadingToken || state.coins == null ? 'Loading...' : !state.coins.length ? 'No results' : state.coins.map((coin: any, idx: any) => <CardInvest key={idx} coin={coin} handlePaneOpen={handlePaneOpen} />)}
        </LayoutGrid>
      </LayoutContainer>
      <SlidingPane className='sliding-pane' overlayClassName='sliding-pane__overlay' isOpen={isPaneOpen} title='Create an investment plan' width='600px' onRequestClose={handlePaneClose}>
        <Invest ref={ref} coin={isPaneClicked} />
      </SlidingPane>
      <ToastContainer />
    </>
  );
};

export default Home;
