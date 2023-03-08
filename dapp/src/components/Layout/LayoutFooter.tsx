const LayoutFooter = () => {
	return (
		<footer className='l-footer'>
			<p>
				Stackit &copy; {new Date().getFullYear()} | Built by{' '}
				<a href='https://archonspear.com/' title='Click to visit ArchonSpear website' target='_blank' rel='noopener noreferrer'>
					ArchonSpear
				</a>{' '}
				| Powered by{' '}
				<a href='https://kyber.network/' title='Click to visit Kyber website' target='_blank' rel='noopener noreferrer'>
					Kyber
				</a>{' '}
				&amp;{' '}
				<a href='https://beefy.com/' title='Click to visit Beefy website' target='_blank' rel='noopener noreferrer'>
					Beefy
				</a>
			</p>
		</footer>
	);
};

export default LayoutFooter;
