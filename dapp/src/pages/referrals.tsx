import Script from 'next/script';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { BN } from '../web3/types/bn';
import { handleNetworkSwitch, MAX_VALUE, REFERRAL_TIERS, SUPPORTED_CHAINS, ZERO_ADDRESS } from '../utils/utils';
import Head from 'next/head';
import Hero from '../components/UI/Hero';
import LayoutContainer from 'src/components/Layout/LayoutContainer';
import InputCopyToClipboard from 'src/components/UI/Inputs/InputCopyToClipboard';
import CardContent from 'src/components/UI/CardContent';
import LayoutFlex from 'src/components/Layout/LayoutFlex';
import LayoutGrid from 'src/components/Layout/LayoutGrid';
import { StackitReferral } from 'src/web3/contracts/StackitReferral';
import { StackitV3 } from 'src/web3/contracts/StackitV3';
import { address } from 'src/web3/types/address';
import Button from 'src/components/UI/Button';
import { Web3Instances } from 'src/web3/constants/web3';
import { ContractInfo, Addresses } from 'src/web3/constants/addresses';
import { Position } from 'src/web3/types/stream';
import { useRouter } from 'next/router';
import { Token } from '../web3/types/token';

import data from '../data/pancakeswap-bsc.json';

const Referrals = () => {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [userRefLink, setUserRefLink] = useState(new BN(0));
  const [referrer, setReferrer] = useState('');
  const [defaultReferrer, setDefaultReferrer] = useState('');
  const [referredList, setReferredList] = useState(Array<address>);
  const [changeReferrerInput, setChangeReferrerInput] = useState(0);
  const [signUpInput, setSignUpInput] = useState(0);
  const [userTvl, setUserTvl] = useState(new BN(0));
  const [refLink, setRefLink] = useState('' as any);

  const updateRefLink = () => {
    setRefLink(router.query.ref);
  };

  useEffect(() => {
    updateRefLink();
  }, [router.query]);

  const getConnectedAccount = async () => {
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
      setAccount(accounts[0]);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateUserTvl = async () => {
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

          //status: "ongoing" | "finished" | "paused"
          if (Number(streamInfo.isactive)) position.status = 'ongoing';
          else if (Number(streamInfo.shares)) position.status = 'paused';
          else position.status = 'finished';

          //invested: BN
          const decimals = await new Token(chainId, streamInfo.buyWith).decimals();
          position.invested = (await stackit.amountLeftInStream(id)).weiToEther(decimals);

          //startDate: Date, endDate: Date
          const startTime = new BN(streamInfo.startTime);
          position.startDate = new Date(startTime.toNumber() * 1000);
          position.endDate = new Date(startTime.add(new BN(streamInfo.interval).mul(streamInfo.iteration)).toNumber() * 1000);

          //pnl: BN
          position.pnl = new BN(0);

          return position;
        })
      );

      let _balance = new BN(0);
      await Promise.all(
        positions.map(async pos => {
          _balance = _balance.add(pos.invested);
        })
      );
      setUserTvl(_balance);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    updateUserTvl();
  }, [account]);

  const updateDefaultReferrer = async () => {
    try {
      const chainId = String((window as any).ethereum.chainId);
      if (!SUPPORTED_CHAINS.includes(chainId)) {
        await handleNetworkSwitch();
        return;
      }
      const stackitRef = new StackitReferral(chainId);
      const _defaultReferrer = '0x1F8a6a5cABd68b528A8E3f44E2a1D20A49Fc8861';
      setDefaultReferrer(_defaultReferrer);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    getConnectedAccount();
    updateDefaultReferrer();
  }, []);

  const updateIsSignedUp = async () => {
    if (account)
      try {
        const chainId = String((window as any).ethereum.chainId);
        if (!SUPPORTED_CHAINS.includes(chainId)) {
          await handleNetworkSwitch();
          return;
        }
        const stackitRef = new StackitReferral(chainId);
        const _isSignedUp = await stackitRef.isUserSignedUp(account);
        setIsSignedUp(_isSignedUp);
      } catch (err: any) {
        toast.error(err.message);
      }
  };

  useEffect(() => {
    updateIsSignedUp();
  }, [account]);

  const updateUserRefLink = async () => {
    if (account && isSignedUp)
      try {
        const chainId = String((window as any).ethereum.chainId);
        if (!SUPPORTED_CHAINS.includes(chainId)) {
          await handleNetworkSwitch();
          return;
        }
        const stackitRef = new StackitReferral(chainId);
        const _userRefLink = await stackitRef.userReferralLink(account);
        setUserRefLink(_userRefLink);
      } catch (err: any) {
        toast.error(err.message);
      }
  };

  useEffect(() => {
    updateUserRefLink();
  }, [account, isSignedUp]);

  const updateReferrer = async () => {
    if (account && isSignedUp)
      try {
        const chainId = String((window as any).ethereum.chainId);
        if (!SUPPORTED_CHAINS.includes(chainId)) {
          await handleNetworkSwitch();
          return;
        }
        const stackitRef = new StackitReferral(chainId);
        const _referrer = await stackitRef.getWasReferredFrom(account);
        setReferrer(_referrer);
      } catch (err: any) {
        toast.error(err.message);
      }
  };

  useEffect(() => {
    updateReferrer();
  }, [account, isSignedUp]);

  const updateReferredList = async () => {
    if (account)
      try {
        const chainId = String((window as any).ethereum.chainId);
        if (!SUPPORTED_CHAINS.includes(chainId)) {
          await handleNetworkSwitch();
          return;
        }
        const stackitRef = new StackitReferral(chainId);
        const codesList = await stackitRef.getuserReferralList(account);
        const addressesList = await Promise.all(codesList.map(code => stackitRef.referralLinkSecurity(code)));
        setReferredList(addressesList);
      } catch (err: any) {
        toast.error(err.message);
      }
  };

  useEffect(() => {
    updateReferredList();
  }, [account]);

  const signUp = async () => {
    if (account)
      try {
        const chainId = String((window as any).ethereum.chainId);
        if (!SUPPORTED_CHAINS.includes(chainId)) {
          await handleNetworkSwitch();
          return;
        }
        const stackitReferral = new StackitReferral(chainId);

        // check ref link
        let _refLink = refLink || signUpInput;
        if (_refLink) {
          const checkRefLink = await stackitReferral.referralLinkSecurity(_refLink);
          if (checkRefLink != ZERO_ADDRESS) {
            console.log(`referral link detected, signing up now !`);
            const signupTx = await stackitReferral.signUpWithReferral(account, _refLink);
            await (window as any).ethereum.request({
              method: 'eth_sendTransaction',
              params: [
                {
                  from: account,
                  ...signupTx,
                },
              ],
            });
          }
        } else {
          const latestBlockNumber = await Web3Instances[chainId].eth.getBlockNumber();
          const txPayload = await stackitReferral.signUp(account, latestBlockNumber);
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
      } catch (err: any) {
        toast.error(err.message);
      }
  };

  const handleChangeReferrerInput = (e: any) => setChangeReferrerInput(e.target.value);
  const handleSignUpInput = (e: any) => setSignUpInput(e.target.value);

  const changeReferrer = async () => {
    if (account && changeReferrerInput)
      try {
        const chainId = String((window as any).ethereum.chainId);
        if (!SUPPORTED_CHAINS.includes(chainId)) {
          await handleNetworkSwitch();
          return;
        }
        const stackitRef = new StackitReferral(chainId);
        const txPayload = await stackitRef.changeReferralLink(account, changeReferrerInput);
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
      }
  };

  const isUserTier = (i: number) => {
    const tiers = [new BN('0'), new BN('1,000'), new BN('10,000'), new BN('100,000'), new BN('1,000,000'), MAX_VALUE];
    i = i >= tiers.length ? tiers.length - 1 : i;
    if (tiers[i].lte(userTvl) && userTvl.lt(tiers[i + 1])) {
      return true;
    }
    return false;
  };

  return (
    <>
      <Head>
        <title>Referrals - Stackit</title>
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
      <Hero heading='Referrals' subHeading='Invite users and claim rewards' />
      <LayoutContainer size='sm' margin='u-mt-32 u-mb-40'>
        <LayoutGrid rows={2} columns={2} rowsResponsive={1} columnsResponsive={1}>
          {isSignedUp ? (
            <CardContent>
              <p className='u-mb-8'>Your Stackit referral link:</p>
              <InputCopyToClipboard textToCopy={'https://beta.stackit.finance/?ref=' + userRefLink} />
            </CardContent>
          ) : (
            <CardContent>
              <p className='u-mb-8'>Signup and start referring your friends !</p>
              {refLink ? <></> : <input className='u-mb-8' id='signUpInput' type='number' placeholder="your referrer's code" autoComplete='off' autoCorrect='off' spellCheck='false' inputMode='decimal' onChange={e => handleSignUpInput(e)} autoFocus />}
              <Button size='md' color='gradient' title='Click to sign up' onClick={signUp}>
                Sign Up
              </Button>
            </CardContent>
          )}
          <CardContent>
            <p className='u-mb-8'>Your total revenue from referrals:</p>
            <p className='coming-soon'>Coming soon.</p>
          </CardContent>
          <CardContent>
            <p className='u-mb-8'>Your total cashback:</p>
            <p className='coming-soon'>Coming soon.</p>
          </CardContent>
        </LayoutGrid>
        <LayoutFlex direction='row-center-space-between u-mtb-16'>
          <h3>Referral tiers</h3>
          <div className='card__status'>
            <span className='select__badge u-bg-ongoing'></span>
            <p>Your current referral tier</p>
          </div>
        </LayoutFlex>
        <LayoutGrid rows={2} columns={3} rowsResponsive={1} columnsResponsive={1}>
          {REFERRAL_TIERS.map((item, i) => (
            <CardContent key={item.tier}>
              <LayoutFlex direction='row-center-space-between u-mb-16'>
                <h3>{item.tier}</h3>
                {isUserTier(i) ? (
                  <div className='card__status'>
                    <span className='select__badge u-bg-ongoing u-mr-0'></span>
                  </div>
                ) : null}
              </LayoutFlex>
              <LayoutFlex direction='row-center-space-between'>
                <p>{item.discount}</p>
                <p>{item.referral}</p>
              </LayoutFlex>
            </CardContent>
          ))}
        </LayoutGrid>
        <h3 className='u-mtb-16'>Your referrer</h3>
        <LayoutGrid rows={1} columns={1} rowsResponsive={1} columnsResponsive={1}>
          {referrer == defaultReferrer ? (
            <CardContent>
              <p className='u-mb-8'>
                Forgot to use your referrer's link? Enter your referrer's code below and get an extra <strong className='u-green'>+2% cashback</strong> on your fees!
              </p>
              <input className='u-mb-8' id='changeReferrer' type='number' autoComplete='off' autoCorrect='off' spellCheck='false' inputMode='decimal' onChange={e => handleChangeReferrerInput(e)} autoFocus />
              <Button size='md' color='gradient' title='Click to change referrer' onClick={changeReferrer}>
                Change referrer
              </Button>
            </CardContent>
          ) : (
            <CardContent>
              <p className='u-mb-8'>{referrer}</p>
            </CardContent>
          )}
        </LayoutGrid>
        <h3 className='u-mtb-16'>Your referrals</h3>
        {referredList.length > 0 ? (
          <LayoutGrid rows={1} columns={1} rowsResponsive={1} columnsResponsive={1}>
            <CardContent>
              {referredList.map((address, id) => (
                <p key={id} className='u-mb-8'>
                  {address}
                </p>
              ))}
            </CardContent>
          </LayoutGrid>
        ) : (
          'No referrals.'
        )}
      </LayoutContainer>
    </>
  );
};

export default Referrals;
