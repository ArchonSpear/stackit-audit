type cardContentProps = {
  children: any;
};

const CardContent = (props: cardContentProps) => {
  const { children } = props;

  return <div className='card card--content'>{children}</div>;
};

export default CardContent;
