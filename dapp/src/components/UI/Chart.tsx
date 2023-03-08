import React from 'react';

type ChartProps = {
  coin: any
}

const Chart = React.forwardRef((props: ChartProps, ref: any) => {
  const { coin } = props

  return (
    <div className='chart' ref={ref}>
      <p>Insert chart here</p>
    </div>
  );
});

export default Chart;
