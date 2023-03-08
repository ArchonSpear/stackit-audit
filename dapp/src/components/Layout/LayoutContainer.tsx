type LayoutContainerProps = {
  size: string;
  margin: string;
  children: React.ReactNode;
};

const LayoutContainer = (props: LayoutContainerProps) => {
  const { size, margin, children } = props;
  return <div className={`l-container l-container--${size} ${margin ? margin : ''}`}>{children}</div>;
};

export default LayoutContainer;
