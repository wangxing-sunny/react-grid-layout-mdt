import React, { memo } from 'react';
import GridItem from '../src/components/GridItem';
import GridLine from '../src/components/GridLine';
import ReactGridLayout from '../src/lib/ReactGridLayout';
import map from 'lodash/map';
import range from 'lodash/range';

const ItemApp = memo(() => {
  return (
    <GridItem
      className="grid-item"
      style={{ backgroundColor: '#123', width: '100%', height: '100%' }}
      isDraggable
      x={0}
      y={0}
      w={6}
      h={6}
      margin={[5, 5]}
      containerPadding={[5, 5]}
      colWidth={60}
      rowHeight={60}
      cssTransforms
      i="item1"
    >
      <div>render grid item</div>
    </GridItem>
  )
});

const LineApp = memo(() => {
  return (
    <GridLine
      cols={6}
      rows={6}
      width={385}
      height={385}
      margin={[5, 5]}
      padding={[0, 0]}
      colWidth={60}
      rowHeight={60}
    />
  )
});

function generateLayout() {
  return map(new Array(20), function(item, i) {
    const y = Math.ceil(Math.random() * 4) + 1;
    return {
      x: (i * 2) % 12,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: i.toString()
    };
  });
}

const App = memo(() => {
  const layout = generateLayout();
  return (
    <ReactGridLayout layout={layout}>
      {map(range(20), i => {
        return (
          <div key={i}>
            <span className="text">{i}</span>
          </div>
        );
      })}
    </ReactGridLayout>
  )
})

export default App;
export { ItemApp, LineApp };
