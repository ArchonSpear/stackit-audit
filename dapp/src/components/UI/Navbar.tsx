import Web3 from 'web3';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWeb3React } from '@web3-react/core';
import { connectors } from '../../web3/wallet/connectors';
import { NAVIGATION_ITEMS, shortAddress, DEFAULT_NETWORK, SUPPORTED_CHAINS } from '../../utils/utils';
import Button from './Button';
import AppLogo from './Logo';
import Modal from './Modal';
import LayoutFlex from '../Layout/LayoutFlex';
import CoinbaseLogo from '../../assets/images/logo/logo-coinbase.svg';
import WalletConnectLogo from '../../assets/images/logo/logo-wallet-connect.svg';
import MetamaskLogo from '../../assets/images/logo/logo-metamask.svg';

const Navbar = () => {
  const [chainId, setChainId] = useState(DEFAULT_NETWORK.chainId);
  const router = useRouter();
  const { account, activate, deactivate, active } = useWeb3React();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [metamask, setMetamask] = useState({} as any);
  const [refLink, setRefLink] = useState('' as any);

  const updateRefLink = () => {
    setRefLink(router.query.ref);
  };

  useEffect(() => {
    updateRefLink();
  }, [router.query]);

  const handleWrongNetwork = async () => {
    if (!SUPPORTED_CHAINS.includes(Web3.utils.toHex(metamask.networkVersion))) {
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

  const setWalletProvider = (type: any) => {
    window.localStorage.setItem('provider', type);
  };

  const refreshState = () => window.localStorage.setItem('provider', undefined as any);

  const disconnectWallet = () => {
    refreshState();
    deactivate();
  };

  useEffect(() => {
    const provider = window.localStorage.getItem('provider');
    if (provider) activate(connectors[provider]);
    setMetamask((window as any).ethereum);
  }, []);

  useEffect(() => {
    setChainId(Web3.utils.toHex(metamask.networkVersion))
  }, [metamask]);

  useEffect(() => {
    handleWrongNetwork();
  }, [chainId]);

  return (
    <>
      <div className='navbar'>
        <div className='navbar__left'>
          <AppLogo />
          <nav className={isNavOpen ? 'is-active' : ''}>
            {NAVIGATION_ITEMS.map(item => (
              <Link href={refLink ? item.route + '?ref=' + refLink : item.route} key={item.label}>
                <a className={router.pathname == `${item.route}` ? 'active' : ''} title={`Click to view ${item.label.toLowerCase()}`} data-disabled={item.isDisabled}>
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>
        <div className='navbar__right'>
          <Link href='https://t.me/stackit_finance' title='Click to contact us'>
            Contact
          </Link>
          <Button size='hamburger' title='Click to open menu' onClick={() => setIsNavOpen(!isNavOpen)}>
            <svg width='18' height='12' viewBox='0 0 18 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <g clipPath='url(#clip0_3_2)'>
                <path d='M0.75 0.75H17.25M0.75 6H17.25M0.75 11.25H17.25' stroke='white' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
              </g>
              <defs>
                <clipPath id='clip0_3_2'>
                  <rect width='18' height='12' fill='white' />
                </clipPath>
              </defs>
            </svg>
          </Button>
          {!active ? (
            <Button title='Click to connect wallet' onClick={() => setIsWalletModalOpen(true)} color='green'>
              Connect Wallet
            </Button>
          ) : (
            <Button title='Click to disconnect wallet' onClick={disconnectWallet} color='green'>
              {shortAddress(account as string)}
            </Button>
          )}
        </div>
      </div>
      <Modal title='Select Wallet' isOpen={isWalletModalOpen} onCloseModal={() => setIsWalletModalOpen(false)}>
        <LayoutFlex direction='column' margin='u-plr-20'>
          <Button
            color='transparent'
            size='wallet'
            title='Click to select Coinbase Wallet'
            onClick={() => {
              activate(connectors.coinbaseWallet);
              setWalletProvider('coinbaseWallet');
              setIsWalletModalOpen(false);
            }}
          >
            <LayoutFlex direction='row-justify-center'>
              <Image src={CoinbaseLogo} alt='Coinbase Logo' />
              Coinbase Wallet
            </LayoutFlex>
          </Button>
          <Button
            color='transparent'
            size='wallet'
            title='Click to select Wallet Connect'
            onClick={() => {
              activate(connectors.walletConnect);
              setWalletProvider('walletConnect');
              setIsWalletModalOpen(false);
            }}
          >
            <LayoutFlex direction='row-justify-center'>
              <Image src={WalletConnectLogo} alt='Wallet Connect Logo' />
              Wallet Connect
            </LayoutFlex>
          </Button>
          <Button
            color='transparent'
            size='wallet'
            title='Click to select Metamask'
            onClick={() => {
              activate(connectors.injected);
              setWalletProvider('injected');
              setIsWalletModalOpen(false);
            }}
          >
            <LayoutFlex direction='row-justify-center'>
              <Image src={MetamaskLogo} alt='Metamask Logo' />
              Metamask
            </LayoutFlex>
          </Button>
        </LayoutFlex>
      </Modal>
    </>
  );
};

export default Navbar;
