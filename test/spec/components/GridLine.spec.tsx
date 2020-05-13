import * as React from 'react';
import { render } from '@testing-library/react';
import GridLine from '../../../src/components/GridLine';

describe('GridItem', () => {
  it('renders correctly', () => {
    const { debug } = render(
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
    );
    debug();
  });
});
