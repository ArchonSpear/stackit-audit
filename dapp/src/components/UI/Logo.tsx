import Image from 'next/image';
import Link from 'next/link';
import AppLogo from '../../assets/images/logo/logo.svg';

const Logo = () => {
	return (
		<Link href='/'>
			<a href='/' className='logo' title='Click to go home'>
				<Image src={AppLogo} alt='Stackit Logo' />
			</a>
		</Link>
	);
};

export default Logo;
