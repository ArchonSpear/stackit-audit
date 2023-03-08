import Head from 'next/head';
import Hero from '../components/UI/Hero';

const Error404 = () => (
  <>
    <Head>
      <title>404 Not Found - Stackit</title>
      <meta name='description' content='Stackit' />
    </Head>
    <Hero page='invest'>
      <div className='hero__heading'>
        <h1>404 Not Found</h1>
      </div>
    </Hero>
  </>
);

export default Error404;
