type LayoutGridProps = {
  rows: number;
  columns: number;
  rowsResponsive?: number;
  columnsResponsive?: number;
  children: React.ReactNode;
};

const LayoutGrid = (props: LayoutGridProps) => {
  const { rows, columns, rowsResponsive, columnsResponsive, children } = props;
  return <div className={`l-grid l-grid--${rows}-row l-grid-responsive--${rowsResponsive}-row l-grid--${columns}-column l-grid-responsive--${columnsResponsive}-column`}>{children}</div>;
};

export default LayoutGrid;
