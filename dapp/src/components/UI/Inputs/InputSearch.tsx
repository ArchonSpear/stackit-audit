type InputSearchProps = {
	placeholder: string;
	value: any;
	onChange: any;
};

const InputSearch = (props: InputSearchProps) => {
	const { placeholder, value, onChange } = props;

	return (
		<div className='input-search'>
			<input placeholder={placeholder} type='text' autoComplete='off' autoCorrect='off' spellCheck='false' value={value} onChange={onChange} />
		</div>
	);
};

export default InputSearch;
