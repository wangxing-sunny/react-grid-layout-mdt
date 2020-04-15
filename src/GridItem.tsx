import React from 'react';
import { DraggableCore, DraggableEvent, DraggableData } from 'react-draggable';
import { Resizable, ResizeCallbackData } from 'react-resizable';
import { perc, setTopLeft, setTransform, Size } from './utils/baseUtils';
import classNames from 'classnames';

import {
  GridDragEvent,
  GridResizeEvent,
  DroppingPosition,
  Position
} from './utils/baseUtils';

type PartialPosition = {
  top: number;
  left: number;
};

export type ItemPosition = {
  x?: number;
  y?: number;
  w: number;
  h: number;
};

type GridItemResizeCallback = (
  i: string,
  pos: ItemPosition,
  Data: GridResizeEvent
) => void;

type GridItemDragCallback = (
  i: string,
  x: number,
  y: number,
  Data: GridDragEvent
) => void;

interface GIState {
  resizing?: Size;
  dragging?: PartialPosition;
  className: string;
}

interface GIProps {
  children: React.ReactNode;
  cols: number;
  containerWidth: number;
  margin: [number, number];
  containerPadding: [number, number];
  rowHeight: number;
  maxRows: number;
  maxCols?: number;
  isDraggable: boolean;
  isResizable: boolean;
  static?: boolean;
  useCSSTransforms?: boolean;
  usePercentages?: boolean;
  transformScale: number;
  droppingPosition?: DroppingPosition;

  resizeHandles?: string[];
  className?: string;
  style?: React.CSSProperties;
  // Draggability
  cancel?: string;
  handle?: string;

  x: number;
  y: number;
  w: number;
  h: number;

  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  i: string;

  onDrag?: GridItemDragCallback;
  onDragStart?: GridItemDragCallback;
  onDragStop?: GridItemDragCallback;
  onResize?: GridItemResizeCallback;
  onResizeStart?: GridItemResizeCallback;
  onResizeStop?: GridItemResizeCallback;

  [key: string]: any;
}

interface CalcPosition {
  x: number;
  y: number;
}

interface CalcSize {
  w: number;
  h: number;
}
/**
 * An individual item within a ReactGridLayout.
 */
export default class GridItem extends React.Component<GIProps, GIState> {
  static defaultProps = {
    className: '',
    cancel: '',
    handle: '',
    minH: 1,
    minW: 1,
    maxH: Infinity,
    maxW: Infinity,
    transformScale: 1
  };

  state: GIState = {
    resizing: null,
    dragging: null,
    className: ''
  };

  currentNode: HTMLElement;

  componentDidUpdate(prevProps: GIProps) {
    if (this.props.droppingPosition && prevProps.droppingPosition) {
      this.moveDroppingItem(prevProps);
    }
  }

  moveDroppingItem(prevProps: GIProps) {
    const { droppingPosition } = this.props;
    const { dragging } = this.state;

    if (!droppingPosition || !prevProps.droppingPosition) {
      return;
    }

    if (!this.currentNode) {
      // eslint-disable-next-line react/no-find-dom-node
      this.currentNode = ReactDOM.findDOMNode(this) as HTMLElement;
    }

    const shouldDrag =
      (dragging && droppingPosition.x !== prevProps.droppingPosition.x) ||
      droppingPosition.y !== prevProps.droppingPosition.y;

    if (!dragging) {
      this.onDragStart(droppingPosition.e, {
        node: this.currentNode,
        deltaX: droppingPosition.x,
        deltaY: droppingPosition.y
      } as DraggableData);
    } else if (shouldDrag) {
      const deltaX = droppingPosition.x - dragging.left;
      const deltaY = droppingPosition.y - dragging.top;

      this.onDrag(droppingPosition.e, {
        node: this.currentNode,
        deltaX,
        deltaY
      } as DraggableData);
    }
  }

  // Helper for generating column width
  calcColWidth(): number {
    const { margin, containerPadding, containerWidth, cols } = this.props;
    return (
      (containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols
    );
  }

  /**
   * Return position on the page given an x, y, w, h.
   * left, top, width, height are all in pixels.
   * @param  {Number}  x             X coordinate in grid units.
   * @param  {Number}  y             Y coordinate in grid units.
   * @param  {Number}  w             W coordinate in grid units.
   * @param  {Number}  h             H coordinate in grid units.
   * @return {Object}                Object containing coords.
   */
  calcPosition(
    x: number,
    y: number,
    w: number,
    h: number,
    state?: GIState
  ): Position {
    const { margin, containerPadding, rowHeight } = this.props;
    const colWidth = this.calcColWidth();
    let out = {} as Position;

    // If resizing, use the exact width and height as returned from resizing callbacks.
    if (state && state.resizing) {
      out.width = Math.round(state.resizing.width);
      out.height = Math.round(state.resizing.height);
    }
    // Otherwise, calculate from grid units.
    else {
      // 0 * Infinity === NaN, which causes problems with resize constraints;
      // Fix this if it occurs.
      // Note we do it here rather than later because Math.round(Infinity) causes deopt
      out.width =
        w === Infinity
          ? w
          : Math.round(colWidth * w + Math.max(0, w - 1) * margin[0]);
      out.height =
        h === Infinity
          ? h
          : Math.round(rowHeight * h + Math.max(0, h - 1) * margin[1]);
    }

    // If dragging, use the exact width and height as returned from dragging callbacks.
    if (state && state.dragging) {
      out.top = Math.round(state.dragging.top);
      out.left = Math.round(state.dragging.left);
    }
    // Otherwise, calculate from grid units.
    else {
      out.top = Math.round((rowHeight + margin[1]) * y + containerPadding[1]);
      out.left = Math.round((colWidth + margin[0]) * x + containerPadding[0]);
    }

    return out;
  }

  /**
   * Translate x and y coordinates from pixels to grid units.
   * @param  {Number} top  Top position (relative to parent) in pixels.
   * @param  {Number} left Left position (relative to parent) in pixels.
   * @return {Object} x and y in grid units.
   */
  calcXY(top: number, left: number): CalcPosition {
    const { margin, cols, maxCols, rowHeight, w, h, maxRows } = this.props;
    const colWidth = this.calcColWidth();

    // left = colWidth * x + margin * (x + 1)
    // l = cx + m(x+1)
    // l = cx + mx + m
    // l - m = cx + mx
    // l - m = x(c + m)
    // (l - m) / (c + m) = x
    // x = (left - margin) / (coldWidth + margin)
    let x = Math.round((left - margin[0]) / (colWidth + margin[0]));
    let y = Math.round((top - margin[1]) / (rowHeight + margin[1]));

    // Capping
    x = Math.max(Math.min(x, (maxCols || cols) - w), 0);
    y = Math.max(Math.min(y, maxRows - h), 0);

    return { x, y };
  }

  /**
   * Given a height and width in pixel values, calculate grid units.
   * @param  {Number} height Height in pixels.
   * @param  {Number} width  Width in pixels.
   * @return {Object} w, h as grid units.
   */
  calcWH({ height, width }: Size): CalcSize {
    const { margin, maxRows, maxCols, cols, rowHeight, x, y } = this.props;
    const colWidth = this.calcColWidth();

    // width = colWidth * w - (margin * (w - 1))
    // ...
    // w = (width + margin) / (colWidth + margin)
    let w = Math.round((width + margin[0]) / (colWidth + margin[0]));
    let h = Math.round((height + margin[1]) / (rowHeight + margin[1]));

    // Capping
    w = Math.max(Math.min(w, (maxCols || cols) - x), 0);
    h = Math.max(Math.min(h, maxRows - y), 0);
    return { w, h };
  }

  /**
   * This is where we set the grid item's absolute placement. It gets a little tricky because we want to do it
   * well when server rendering, and the only way to do that properly is to use percentage width/left because
   * we don't know exactly what the browser viewport is.
   * Unfortunately, CSS Transforms, which are great for performance, break in this instance because a percentage
   * left is relative to the item itself, not its container! So we cannot use them on the server rendering pass.
   *
   * @param  {Object} pos Position object with width, height, left, top.
   * @return {Object}     Style object.
   */
  createStyle(pos: Position): object {
    const { usePercentages, containerWidth, useCSSTransforms } = this.props;

    let style: { [key: string]: string | number };
    // CSS Transforms support (default)
    if (useCSSTransforms) {
      style = setTransform(pos);
    } else {
      // top,left (slow)
      style = setTopLeft(pos);

      // This is used for server rendering.
      if (usePercentages) {
        style.left = perc(pos.left / containerWidth);
        style.width = perc(pos.width / containerWidth);
      }
    }

    return style;
  }

  /**
   * Mix a Draggable instance into a child.
   * @param  {Element} child    Child element.
   * @return {Element}          Child wrapped in Draggable.
   */
  mixinDraggable(child: React.ReactNode): React.ReactNode {
    return (
      <DraggableCore
        onStart={this.onDragStart}
        onDrag={this.onDrag}
        onStop={this.onDragStop}
        handle={this.props.handle}
        cancel={
          '.react-resizable-handle' +
          (this.props.cancel ? ',' + this.props.cancel : '')
        }
        scale={this.props.transformScale}
      >
        {child}
      </DraggableCore>
    );
  }

  /**
   * Mix a Resizable instance into a child.
   * @param  {Element} child    Child element.
   * @param  {Object} position  Position object (pixel values)
   * @return {Element}          Child wrapped in Resizable.
   */
  mixinResizable(child: React.ReactNode, position: Position): React.ReactNode {
    const {
      cols,
      maxCols,
      x,
      minW,
      minH,
      maxW,
      maxH,
      resizeHandles
    } = this.props;
    // This is the max possible width - doesn't go to infinity because of the width of the window
    const maxWidth = this.calcPosition(0, 0, (maxCols || cols) - x, 0).width;

    // Calculate min/max constraints using our min & maxes
    const mins = this.calcPosition(0, 0, minW, minH);
    const maxes = this.calcPosition(0, 0, maxW, maxH);
    const minConstraints: [number, number] = [mins.width, mins.height];
    const maxConstraints: [number, number] = [
      Math.min(maxes.width, maxWidth),
      Math.min(maxes.height, Infinity)
    ];
    return (
      <Resizable
        width={position.width}
        height={position.height}
        minConstraints={minConstraints}
        maxConstraints={maxConstraints}
        onResizeStop={this.onResizeStop}
        onResizeStart={this.onResizeStart}
        onResize={this.onResize}
        resizeHandles={resizeHandles}
      >
        {child}
      </Resizable>
    );
  }

  /**
   * onDragStart event handler
   * @param  {Event}  e             event data
   * @param  {Object} callbackData  an object with node, delta and position information
   */
  onDragStart = (e: DraggableEvent, { node }: DraggableData): void | false => {
    if (!this.props.onDragStart) return false;

    const newPosition = {} as PartialPosition;

    // TODO: this wont work on nested parents
    const { offsetParent } = node;
    if (!offsetParent) return false;
    const parentRect = offsetParent.getBoundingClientRect();
    const clientRect = node.getBoundingClientRect();
    const cLeft = clientRect.left / this.props.transformScale;
    const pLeft = parentRect.left / this.props.transformScale;
    const cTop = clientRect.top / this.props.transformScale;
    const pTop = parentRect.top / this.props.transformScale;
    newPosition.left = cLeft - pLeft + offsetParent.scrollLeft;
    newPosition.top = cTop - pTop + offsetParent.scrollTop;
    this.setState({ dragging: newPosition });

    const { x, y } = this.calcXY(newPosition.top, newPosition.left);

    this.props.onDragStart &&
      this.props.onDragStart.call(this, this.props.i, x, y, {
        e,
        node,
        newPosition
      });
  };

  /**
   * onDrag event handler
   * @param  {Event}  e             event data
   * @param  {Object} callbackData  an object with node, delta and position information
   */
  onDrag = (
    e: DraggableEvent,
    { node, deltaX, deltaY }: DraggableData
  ): void | false => {
    if (!this.props.onDrag) return false;

    const newPosition: PartialPosition = { top: 0, left: 0 };

    if (!this.state.dragging)
      throw new Error('onDrag called before onDragStart.');
    newPosition.left = this.state.dragging.left + deltaX;
    newPosition.top = this.state.dragging.top + deltaY;
    this.setState({ dragging: newPosition });

    const { x, y } = this.calcXY(newPosition.top, newPosition.left);

    this.props.onDrag &&
      this.props.onDrag.call(this, this.props.i, x, y, {
        e,
        node,
        newPosition
      });
  };

  /**
   * onDragStop event handler
   * @param  {Event}  e             event data
   * @param  {Object} callbackData  an object with node, delta and position information
   */
  onDragStop = (e: DraggableEvent, { node }: DraggableData): void | false => {
    if (!this.props.onDragStop) return false;

    const newPosition: PartialPosition = { top: 0, left: 0 };

    if (!this.state.dragging)
      throw new Error('onDragEnd called before onDragStart.');
    newPosition.left = this.state.dragging.left;
    newPosition.top = this.state.dragging.top;
    this.setState({ dragging: null });

    const { x, y } = this.calcXY(newPosition.top, newPosition.left);

    this.props.onDragStop &&
      this.props.onDragStop.call(this, this.props.i, x, y, {
        e,
        node,
        newPosition
      });
  };

  /**
   * onResizeStop event handler
   * @param  {Event}  e             event data
   * @param  {Object} callbackData  an object with node and size information
   */
  onResizeStop = (
    e: React.SyntheticEvent,
    callbackData: ResizeCallbackData
  ) => {
    this.onResizeHandler(e, callbackData, 'onResizeStop');
  };

  /**
   * onResizeStart event handler
   * @param  {Event}  e             event data
   * @param  {Object} callbackData  an object with node and size information
   */
  onResizeStart = (
    e: React.SyntheticEvent,
    callbackData: ResizeCallbackData
  ) => {
    this.onResizeHandler(e, callbackData, 'onResizeStart');
  };

  /**
   * onResize event handler
   * @param  {Event}  e             event data
   * @param  {Object} callbackData  an object with node and size information
   */
  onResize = (e: React.SyntheticEvent, callbackData: ResizeCallbackData) => {
    this.onResizeHandler(e, callbackData, 'onResize');
  };

  /**
   * Wrapper around drag events to provide more useful data.
   * All drag events call the function with the given handler name,
   * with the signature (index, x, y).
   *
   * @param  {String} handlerName Handler name to wrap.
   * @return {Function}           Handler function.
   */
  onResizeHandler(
    e: React.SyntheticEvent,
    { node, size }: ResizeCallbackData,
    handlerName: string
  ) {
    const handler = this.props[handlerName];
    if (!handler) return;
    const { cols, maxCols, x, y, i, maxW, minW, maxH, minH } = this.props;
    // Get new XY
    let { w, h } = this.calcWH(size);

    // Cap w at numCols
    w = Math.min(w, (maxCols || cols) - x);
    // Ensure w is at least 1
    w = Math.max(w, 1);

    // Min/max capping
    w = Math.max(Math.min(w, maxW), minW);
    h = Math.max(Math.min(h, maxH), minH);

    this.setState({ resizing: handlerName === 'onResizeStop' ? null : size });

    handler.call(this, i, { x, y, w, h }, { e, node, size });
  }

  render() {
    const {
      x,
      y,
      w,
      h,
      isDraggable,
      isResizable,
      droppingPosition,
      useCSSTransforms
    } = this.props;

    const pos = this.calcPosition(x, y, w, h, this.state);
    const child = React.Children.only(this.props.children);

    // Create the child element. We clone the existing element but modify its className and style.
    let newChild: React.ReactNode = React.cloneElement(
      child as React.ReactElement,
      {
        className: classNames(
          'react-grid-item',
          (child as any).props.className,
          this.props.className,
          {
            static: this.props.static,
            resizing: Boolean(this.state.resizing),
            'react-draggable': isDraggable,
            'react-draggable-dragging': Boolean(this.state.dragging),
            dropping: Boolean(droppingPosition),
            cssTransforms: useCSSTransforms
          }
        ),
        // We can set the width and height on the child, but unfortunately we can't set the position.
        style: {
          ...this.props.style,
          ...(child as any).props.style,
          ...this.createStyle(pos)
        }
      }
    );

    // Resizable support. This is usually on but the user can toggle it off.
    if (isResizable) newChild = this.mixinResizable(newChild, pos);

    // Draggable support. This is always on, except for with placeholders.
    if (isDraggable) newChild = this.mixinDraggable(newChild);

    return newChild;
  }
}
