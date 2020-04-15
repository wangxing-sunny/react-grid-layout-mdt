import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as ReactDom from 'react-dom';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import { DraggableEvent } from 'react-draggable';

import { bottom, right, Layout, LayoutItem } from './utils/baseUtils';

import ReactGridLayout from './ReactGridLayout';
import { BaseProps } from './ReactGridLayout';

export interface AdaptiveProps extends BaseProps {
  rowsAdaptable?: boolean;
  squareGrid?: boolean;
  inner?: boolean;
}

type AdaptiveState = {
  currentWidth: number;
  currentHeight: number;
  realColWidth: number;
  realRowHeight: number;
  realCols: number;
  realRows: number;
  layout: LayoutItem[];
};

export default class AdaptiveReactGridLayout extends React.Component<
  AdaptiveProps,
  AdaptiveState
> {
  static defaultProps = {
    margin: [5, 5],
    maxCols: 12,
    rowsAdaptable: false,
    squareGrid: false,
    inner: false
  };

  constructor(props: AdaptiveProps) {
    super(props);
  }

  state = this.calculateRGLConfigs(this.props);

  resizeStartX: number;
  originWidth: number;
  maxWidth: number;

  timer: any;

  currentNode: Element | Text | null;
  parentNode: HTMLElement | null;

  componentDidMount() {
    // eslint-disable-next-line react/no-find-dom-node
    this.currentNode = ReactDom.findDOMNode(this);
    this.parentNode = this.currentNode.parentElement;
    const { showGrid, inner } = this.props;
    if (showGrid && inner) {
      this.timer = setInterval(() => {
        const state = this.calculateRGLConfigs(this.props);
        this.setState({
          ...state
        });
      }, 200);
    }
    const calcState = this.calculateRGLConfigs(this.props);
    if (!isEqual(calcState, this.state)) {
      this.setState({
        ...calcState
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: AdaptiveProps) {
    const calcState = this.calculateRGLConfigs(nextProps);
    if (!isEqual(calcState, this.state)) {
      this.setState({
        ...calcState
      });
    }
  }

  componentDidUpdate() {
    const calcState = this.calculateRGLConfigs(this.props);
    if (!isEqual(calcState, this.state)) {
      this.setState({
        ...calcState
      });
    }
  }

  componentWillUnmount() {
    const { showGrid, inner } = this.props;
    if (showGrid && inner) {
      clearInterval(this.timer);
    }
  }

  calculateRGLConfigs(props: AdaptiveProps): AdaptiveState {
    const {
      layout,
      maxCols,
      rowsAdaptable,
      squareGrid,
      margin,
      containerPadding,
      rowHeight
    } = props;
    const containerPaddingX = containerPadding
        ? containerPadding[0]
        : margin[0],
      containerPaddingY = containerPadding ? containerPadding[1] : margin[1];
    let nCurrentWidth, nCurrentHeight, nRealColWidth, nRealRowHeight;
    const nRealCols = Math.min(right(layout), maxCols),
      nRealRows = bottom(layout);
    if (!(this.parentNode instanceof HTMLElement)) {
      nRealColWidth = 100;
      nRealRowHeight = squareGrid ? nRealColWidth : rowHeight || 100;
      nCurrentWidth =
        nRealCols * nRealColWidth +
        2 * containerPaddingX +
        (nRealCols - 1) * margin[0];
      nCurrentHeight =
        nRealRows * nRealRowHeight +
        2 * containerPaddingY +
        (nRealRows - 1) * margin[1];
    } else {
      nCurrentWidth = this.parentNode.clientWidth;
      nCurrentHeight = this.parentNode.clientHeight;
      nRealColWidth =
        (nCurrentWidth - containerPaddingX * 2 - margin[0] * (nRealCols - 1)) /
        nRealCols;
      nRealRowHeight = rowsAdaptable
        ? (nCurrentHeight -
            containerPaddingY * 2 -
            margin[1] * (nRealRows - 1)) /
          nRealRows
        : squareGrid
        ? nRealColWidth
        : rowHeight || nRealColWidth;
    }
    return {
      currentWidth: nCurrentWidth,
      currentHeight: nCurrentHeight,
      realColWidth: nRealColWidth,
      realRowHeight: nRealRowHeight,
      realCols: nRealCols,
      realRows: nRealRows,
      layout: layout
    };
  }

  onResizeStart = (
    l: Layout,
    o: LayoutItem,
    n: LayoutItem,
    p: LayoutItem,
    e: React.SyntheticEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const { maxCols, margin, containerPadding } = this.props;
    const { currentWidth, realColWidth } = this.state;
    const containerPaddingX = containerPadding
      ? containerPadding[0]
      : margin[0];
    this.resizeStartX = (e as any).pageX || (e as any).touches[0].pageX;
    this.originWidth = currentWidth;
    this.maxWidth =
      maxCols * realColWidth +
      2 * containerPaddingX +
      (maxCols - 1) * margin[0];
    const { onResizeStart } = this.props;
    if (onResizeStart) {
      onResizeStart(l, o, n, p, e);
    }
  };

  onResize = (
    l: Layout,
    o: LayoutItem,
    n: LayoutItem,
    p: LayoutItem,
    e: React.SyntheticEvent
  ) => {
    const { realCols } = this.state;
    const { maxCols } = this.props;
    e.preventDefault();
    e.stopPropagation();
    const { onResize } = this.props;
    if (onResize) {
      onResize(l, o, n, p, e);
    }
    let deltaX: number =
      ((e as any).pageX || (e as any).touches[0].pageX) - this.resizeStartX;
    if (deltaX > 0 && n.w + n.x >= realCols && realCols < maxCols) {
      const selfNode = this.currentNode as HTMLElement;
      const expand = Math.min(this.originWidth + deltaX, this.maxWidth);
      selfNode.style.left = this.originWidth - expand + 'px';
    }
  };

  onResizeStop = (
    l: Layout,
    o: LayoutItem,
    n: LayoutItem,
    p: LayoutItem,
    e: React.SyntheticEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    this.resizeStartX = 0;
    const selfNode = this.currentNode as HTMLElement;
    selfNode.style.left = '0px';
    const { onResizeStop } = this.props;
    if (onResizeStop) {
      onResizeStop(l, o, n, p, e);
    }
  };

  onDragStart = (
    l: Layout,
    o: LayoutItem,
    n: LayoutItem,
    p: LayoutItem,
    e: React.SyntheticEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const { onDragStart } = this.props;
    if (onDragStart) {
      onDragStart(l, o, n, p, e);
    }
  };

  onDrag = (
    l: Layout,
    o: LayoutItem,
    n: LayoutItem,
    p: LayoutItem,
    e: React.SyntheticEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const { onDrag } = this.props;
    if (onDrag) {
      onDrag(l, o, n, p, e);
    }
  };

  onDragStop = (
    l: Layout,
    o: LayoutItem,
    n: LayoutItem,
    p: LayoutItem,
    e: React.SyntheticEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const { onDragStop } = this.props;
    if (onDragStop) {
      onDragStop(l, o, n, p, e);
    }
  };

  render() {
    /* eslint-disable no-unused-vars */
    const { maxCols, rowsAdaptable, inner, ...others } = this.props;
    /* eslint-enable no-unused-vars */
    const { currentWidth, realRowHeight, realCols, layout } = this.state;
    return (
      <ReactGridLayout
        {...others}
        layout={layout}
        cols={realCols}
        maxCols={maxCols}
        width={currentWidth}
        rowHeight={realRowHeight}
        onResizeStart={this.onResizeStart}
        onResize={this.onResize}
        onResizeStop={this.onResizeStop}
        onDragStart={this.onDragStart}
        onDrag={this.onDrag}
        onDragStop={this.onDragStop}
      />
    );
  }
}
