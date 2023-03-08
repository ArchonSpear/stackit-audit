import Script from 'next/script';
import { Web3ReactProvider } from '@web3-react/core';
import Head from 'next/head';
import Web3 from 'web3';
import { provider } from 'web3-core';
import LayoutHeader from '../components/Layout/LayoutHeader';
import LayoutFooter from '../components/Layout/LayoutFooter';
import LayoutMain from '../components/Layout/LayoutMain';
import '../assets/stylesheets/main.scss';
import 'react-toastify/dist/ReactToastify.css';
import 'react-sliding-pane/dist/react-sliding-pane.css';

const Stackit = ({ Component, pageProps }: any) => {
	const getLibrary = (provider: provider) => {
		const library = new Web3(provider);
		(library as any).pollingInterval = 8000; // frequency provider is polling
		return library;
	};

	return (
		<>
			<Head>
				<link rel='icon' href='/favicon.ico' />
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
			<Web3ReactProvider getLibrary={getLibrary}>
				<LayoutHeader />
				<LayoutMain>
					<Component {...pageProps} />
					<div id='portal' />
				</LayoutMain>
				<LayoutFooter />
			</Web3ReactProvider>
		</>
	);
};

export default Stackit;
