type LayoutMainProps = {
  children: React.ReactNode;
};

const LayoutMain = (props: LayoutMainProps) => {
  const { children } = props;
  return <main className='l-main'>{children}</main>;
};

export default LayoutMain;
