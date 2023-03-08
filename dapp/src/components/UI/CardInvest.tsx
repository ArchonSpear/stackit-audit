import Button from './Button';

type cardInvestProps = {
	coin: {
		symbol: string;
		image: string;
		name: string;
		address: any;
		chainId: number;
		decimals: number;
	};
	handlePaneOpen: Function;
};

const CardInvest = (props: cardInvestProps) => {
	const { coin, handlePaneOpen } = props;

	return (
		<div className='card card--invest' key={coin.symbol}>
			<div className='card__header'>
				<div className='card__wrapper'>
					<img src={coin.image} alt={`${coin.name} logo`} className='card__image' />
					<div className='card__title'>
						<h5>{coin.symbol.toUpperCase()}</h5>
						<h4>{coin.name}</h4>
					</div>
				</div>
			</div>
			<div className='card__body'>
				<Button size='sm' title={`Click to invest in ${coin.name}`} onClick={() => handlePaneOpen(coin.symbol)} color='green'>
					Invest
				</Button>
			</div>
		</div>
	);
};

export default CardInvest;
