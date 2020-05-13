import React, {
  useState,
  CSSProperties,
  useCallback,
  useMemo,
  memo
} from 'react';
import { DraggableCore, DraggableEvent, DraggableData } from 'react-draggable';
import { Resizable, ResizeCallbackData } from 'react-resizable';
import { setTopLeft, setTransform } from '../utils/baseUtils';
import classNames from 'classnames';

import { GridItemProps, Position, Size, Block } from '../interfaces';
const GridItem = memo((props: GridItemProps) => {
  const {
    className,
    style,
    isStatic = false,
    isDraggable = true,
    isResizable = true,
    i,
    x,
    y,
    w,
    h,
    minW = 1,
    maxW,
    minH = 1,
    maxH,
    maxCols,
    maxRows,
    colWidth,
    rowHeight,
    margin,
    containerPadding,
    cssTransforms = true,
    transformScale = 1,
    handle,
    cancel,
    onResizeStart,
    onResize,
    onResizeStop,
    onDragStart,
    onDrag,
    onDragStop,
    children
  } = props;
  const [dragging, setDragging] = useState<Position | null>(null);
  const [resizing, setResizing] = useState<Size | null>(null);

  const createStyle = useCallback(
    (pos: Block) => {
      let style: CSSProperties = {};
      if (cssTransforms) {
        style = setTransform(pos);
      } else {
        style = setTopLeft(pos);
      }

      return style;
    },
    [cssTransforms]
  );

  const calcXY = useCallback(
    ({
      top,
      left
    }: Position): {
      x: number;
      y: number;
    } => {
      let x = Math.round((left - containerPadding[0]) / (colWidth + margin[0]));
      let y = Math.round((top - containerPadding[1]) / (rowHeight + margin[1]));

      x = Math.max(maxCols ? Math.min(x, maxCols - w) : x, 0);
      y = Math.max(maxRows ? Math.min(y, maxRows - h) : y, 0);
      return { x, y };
    },
    [colWidth, containerPadding, h, margin, maxCols, maxRows, rowHeight, w]
  );

  const calcWH = useCallback(
    ({
      width,
      height
    }: Size): {
      w: number;
      h: number;
    } => {
      let w = Math.round((width + margin[0]) / (colWidth + margin[0]));
      let h = Math.round((height + margin[1]) / (rowHeight + margin[1]));

      w = Math.max(maxCols ? Math.min(w, maxCols - x) : w, 0);
      h = Math.max(maxRows ? Math.min(h, maxRows - y) : h, 0);

      w = Math.max(maxW ? Math.min(w, maxW) : w, minW);
      h = Math.max(maxH ? Math.min(h, maxH) : w, minH);
      return { w, h };
    },
    [
      colWidth,
      margin,
      maxCols,
      maxH,
      maxRows,
      maxW,
      minH,
      minW,
      rowHeight,
      x,
      y
    ]
  );

  const calcPosition = useCallback(
    (x: number, y: number, w: number, h: number) => {
      const out: Block = { top: 0, left: 0, width: 0, height: 0 };
      if (resizing) {
        out.width = resizing.width;
        out.height = resizing.height;
      } else {
        out.width = Math.round(colWidth * w + (w - 1) * margin[0]);
        out.height = Math.round(rowHeight * h + (h - 1) * margin[1]);
      }
      if (dragging) {
        out.top = dragging.top;
        out.left = dragging.left;
      } else {
        out.top = Math.round((rowHeight + margin[1]) * y + containerPadding[1]);
        out.left = Math.round((colWidth + margin[0]) * x + containerPadding[0]);
      }
      return out;
    },
    [colWidth, containerPadding, dragging, margin, resizing, rowHeight]
  );

  const itemPosition = useMemo(() => calcPosition(x, y, w, h), [
    calcPosition,
    h,
    w,
    x,
    y
  ]);

  const _onDragStart = useCallback(
    (e: DraggableEvent, { node }: DraggableData) => {
      if (!onDragStart) return;
      const newPosition: Position = { top: 0, left: 0 };
      const { offsetParent } = node;
      if (!offsetParent) return;
      const parentRect = offsetParent.getBoundingClientRect();
      const clientRect = node.getBoundingClientRect();
      const cLeft = clientRect.left / transformScale;
      const pLeft = parentRect.left / transformScale;
      const cTop = clientRect.top / transformScale;
      const pTop = parentRect.top / transformScale;
      newPosition.left = cLeft - pLeft + offsetParent.scrollLeft;
      newPosition.top = cTop - pTop + offsetParent.scrollTop;
      setDragging(newPosition);
      const xy = calcXY(newPosition);
      onDragStart({
        i,
        position: xy,
        event: {
          e,
          node,
          position: newPosition
        }
      });
    },
    [calcXY, i, onDragStart, transformScale]
  );
  const _onDrag = useCallback(
    (e: DraggableEvent, { node, deltaX, deltaY }: DraggableData) => {
      if (!onDrag) return;
      const newPosition: Position = { top: 0, left: 0 };
      if (!dragging) throw new Error('onDrag called before onDragStart.');
      newPosition.left = dragging.left + deltaX;
      newPosition.top = dragging.top + deltaY;
      setDragging(newPosition);
      const xy = calcXY(newPosition);
      onDrag({
        i,
        position: xy,
        event: {
          e,
          node,
          position: newPosition
        }
      });
    },
    [calcXY, dragging, i, onDrag]
  );
  const _onDragStop = useCallback(
    (e: DraggableEvent, { node }: DraggableData) => {
      if (!onDragStop) return;
      const newPosition: Position = { top: 0, left: 0 };
      if (!dragging) throw new Error('onDragEnd called before onDragStart.');
      newPosition.left = dragging.left;
      newPosition.top = dragging.top;
      setDragging(null);
      const xy = calcXY(newPosition);
      onDragStop({
        i,
        position: xy,
        event: {
          e,
          node,
          position: newPosition
        }
      });
    },
    [calcXY, dragging, i, onDragStop]
  );

  const _onResizeStart = useCallback(
    (e: React.SyntheticEvent, { node, size }: ResizeCallbackData) => {
      if (!onResizeStart) return;
      const wh = calcWH(size);
      setResizing(size);
      onResizeStart({ i, size: wh, event: { e, node, size } });
    },
    [calcWH, i, onResizeStart]
  );
  const _onResize = useCallback(
    (e: React.SyntheticEvent, { node, size }: ResizeCallbackData) => {
      if (!onResize) return;
      const wh = calcWH(size);
      setResizing(size);
      onResize({ i, size: wh, event: { e, node, size } });
    },
    [calcWH, i, onResize]
  );
  const _onResizeStop = useCallback(
    (e: React.SyntheticEvent, { node, size }: ResizeCallbackData) => {
      if (!onResizeStop) return;
      const wh = calcWH(size);
      setResizing(null);
      onResizeStop({ i, size: wh, event: { e, node, size } });
    },
    [calcWH, i, onResizeStop]
  );

  const mixinResizbale = useCallback(
    (fp: React.ReactElement, position: Block): React.ReactElement => {
      if (!isResizable) return fp;
      const minWH = calcPosition(0, 0, minW, minH);
      const minConstraints: [number, number] = [minWH.width, minWH.height];
      let mw = 0;
      if (maxW && maxCols) {
        mw = Math.min(maxW, maxCols - x);
      } else if (!maxW && maxCols) {
        mw = maxCols - x;
      } else if (maxW && !maxCols) {
        mw = maxW;
      } else {
        mw = Infinity;
      }

      let mh = 0;
      if (maxH && maxRows) {
        mh = Math.min(maxH, maxRows - x);
      } else if (!maxH && maxRows) {
        mh = maxRows - x;
      } else if (maxH && !maxRows) {
        mh = maxH;
      } else {
        mh = Infinity;
      }

      const maxWH = calcPosition(0, 0, mw, mh);
      const maxConstraints: [number, number] = [maxWH.width, maxWH.height];
      return (
        <Resizable
          width={position.width}
          height={position.height}
          minConstraints={minConstraints}
          maxConstraints={maxConstraints}
          onResizeStart={_onResizeStart}
          onResize={_onResize}
          onResizeStop={_onResizeStop}
        >
          {fp}
        </Resizable>
      );
    },
    [
      _onResize,
      _onResizeStart,
      _onResizeStop,
      calcPosition,
      isResizable,
      maxCols,
      maxH,
      maxRows,
      maxW,
      minH,
      minW,
      x
    ]
  );

  const mixinDraggable = useCallback(
    (fp: React.ReactElement): React.ReactElement => {
      if (!isDraggable) return fp;
      return (
        <DraggableCore
          onStart={_onDragStart}
          onDrag={_onDrag}
          onStop={_onDragStop}
          handle={handle}
          cancel={`.react-resizable-handle${cancel ? ', ' + cancel : ''}`}
          scale={transformScale}
        >
          {fp}
        </DraggableCore>
      );
    },
    [
      _onDrag,
      _onDragStart,
      _onDragStop,
      cancel,
      handle,
      isDraggable,
      transformScale
    ]
  );

  const item = useMemo(() => {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      className: classNames(
        'react-grid-layout-item',
        child.props.className,
        className,
        {
          static: isStatic,
          resizing: Boolean(resizing),
          'react-draggable': isDraggable,
          'react-draggable-dragging': Boolean(dragging),
          cssTransforms: cssTransforms
        }
      ),
      style: {
        ...style,
        ...child.props.style,
        ...createStyle(itemPosition)
      }
    });
  }, [
    className,
    createStyle,
    cssTransforms,
    dragging,
    isDraggable,
    isStatic,
    itemPosition,
    resizing,
    style,
    children
  ]);

  return mixinDraggable(mixinResizbale(item, itemPosition));
});

GridItem.displayName = 'GridItem';

export default GridItem;
