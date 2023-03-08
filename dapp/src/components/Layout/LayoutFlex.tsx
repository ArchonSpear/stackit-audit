type LayoutFlexProps = {
  direction: string;
  responsive?: string;
  margin?: string;
  children: React.ReactNode;
};

const LayoutFlex = (props: LayoutFlexProps) => {
  const { direction, responsive, margin, children } = props;
  return <div className={`l-flex l-flex--${direction} l-flex-responsive--${responsive} ${margin ? margin : ''}`}>{children}</div>;
};

export default LayoutFlex;
