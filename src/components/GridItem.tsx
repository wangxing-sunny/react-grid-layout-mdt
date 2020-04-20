import React, {
  useState,
  CSSProperties,
  useCallback,
  useMemo,
  memo
} from 'react';
import {
  DraggableCore /* , DraggableEvent, DraggableData */
} from 'react-draggable';
import { Resizable /* , ResizeCallbackData */ } from 'react-resizable';
import { setTopLeft, setTransform } from '../utils/baseUtils';
import classNames from 'classnames';

import {
  Size,
  /* GridDragEvent,
  GridResizeEvent,
  DropParams,
  Coordinate, */
  Position,
  GridItemProps,
  Block
} from '../interfaces';
const GridItem = memo((props: GridItemProps) => {
  const {
    className,
    style,
    isStatic = false,
    isDraggable = true,
    isResizable = true,
    x,
    y,
    w,
    h,
    minW = 1,
    maxW,
    minH = 1,
    maxH,
    // cols,
    // rows,
    maxCols,
    maxRows,
    colWidth,
    rowHeight,
    margin,
    containerPadding,
    cssTransforms = true,
    transformScale = 1,
    droppingPosition,
    handle,
    cancel,
    children
  } = props;
  /* eslint-disable-next-line */
  const [dragging, setDragging] = useState<Position>();
  const [resizing, setResizing] = useState<Size>(); /* eslint-disable-line */

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

  const mixinResizbale = useCallback(
    (fp: React.ReactElement, position: Block): React.ReactElement => {
      console.log(fp);
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
          // onResizeStop={onResizeStop}
          // onResizeStart={onResizeStart}
          // onResize={onResize}
        >
          {fp}
        </Resizable>
      );
    },
    [calcPosition, isResizable, maxCols, maxH, maxRows, maxW, minH, minW, x]
  );

  const mixinDraggable = useCallback(
    (fp: React.ReactElement): React.ReactElement => {
      console.log(fp);
      if (!isDraggable) return fp;
      return (
        <DraggableCore
          // onStart={onDragStart}
          // onDrag={onDrag}
          // onStop={onDragStop}
          handle={handle}
          cancel={`.react-resizable-handle${cancel ? ', ' + cancel : ''}`}
          scale={transformScale}
        >
          {fp}
        </DraggableCore>
      );
    },
    [cancel, handle, isDraggable, transformScale]
  );

  const itemPosition = useMemo(() => calcPosition(x, y, w, h), [
    calcPosition,
    h,
    w,
    x,
    y
  ]);

  const item = useMemo(() => {
    const child = React.Children.only(children);
    console.log(child);
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
          dropping: Boolean(droppingPosition),
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
    droppingPosition,
    isDraggable,
    isStatic,
    itemPosition,
    resizing,
    style,
    children
  ]);

  return mixinDraggable(mixinResizbale(item, itemPosition));
});

export default GridItem;
