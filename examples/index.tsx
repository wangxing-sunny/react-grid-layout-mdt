import React, { memo } from 'react';
import GridItem from '../src/components/GridItem';
import GridLine from '../src/components/GridLine';

const App = memo(() => {
  return (
    <>
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
      <div>123</div>
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
    </>
  )
});

export default App;
