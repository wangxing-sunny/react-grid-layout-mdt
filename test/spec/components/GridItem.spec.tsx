import React from 'react';
import { render } from '@testing-library/react';
import GridItem from '../../../src/components/GridItem';

describe('GridItem', () => {
  it('renders with text', () => {
    const text = 'text';
    const item = render(
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
        cols={10}
        rows={10}
      >
        <div>
          <span>{text}</span>
        </div>
      </GridItem>
    );
    // console.log(item.container);
    // expect(item.container.childNodes[0]).toEqual(
    //   'react-grid-layout-item grid-item'
    // );
  });
});
