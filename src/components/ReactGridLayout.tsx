import React, { memo, useMemo, useState, useEffect, useCallback } from 'react';
import { bottom, getLayoutItem, right } from '../utils/baseUtils';
import { BaseProps, ResizableHandles } from '../interfaces';
import map from 'lodash/map';
import GridLine from './GridLine';
import GridItem from './GridItem';

import '../css/styles.css';

const ReactGridLayout = memo((props: BaseProps) => {
  const {
    className = '',
    style,
    // width,
    colWidth = 80,
    maxCols = 32,
    // height,
    rowHeight = 45,
    maxRows = 100,
    // autoSize = true,
    // squareGrid = false,
    layout,
    // compactType = '',
    // preventCollision = false,
    margin = [5, 5],
    containerPadding = [0, 0],
    isDraggable = true,
    isResizable = true,
    showGridLine = true,
    lineWidth = 1,
    lineStyle = 'solid',
    lineColor = '#38497b',
    resizableHandles = [ResizableHandles.se],
    draggableCancel,
    draggableHandle,
    cssTransforms = true,
    transformScale = 1,
    // onLayoutChange,
    // onDragStart,
    // onDrag,
    // onDragStop,
    // onResizeStart,
    // onResize,
    // onResizeStop,
    children
  } = props;
  // const onDragEnter = () => {};
  // const onDragOver = () => {};
  // const onDragLeave = () => {};

  const [currentLayout, setCurrentLayout] = useState(layout);

  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout]);

  const currentCols = useMemo(() => {
    return right(currentLayout);
  }, [currentLayout]);

  const currentRows = useMemo(() => {
    return bottom(currentLayout);
  }, [currentLayout]);

  const layoutSize = useMemo(() => {
    const [containerPaddingX, containerPaddingY] = containerPadding;
    const [marginX, marginY] = margin;

    const width =
      currentCols * colWidth +
      (currentCols - 1) * marginY +
      containerPaddingX * 2;
    const height =
      currentRows * rowHeight +
      (currentRows - 1) * marginX +
      containerPaddingY * 2;
    return { width, height };
  }, [colWidth, containerPadding, currentCols, currentRows, margin, rowHeight]);

  const processGridItem = useCallback(
    (child: React.ReactNode): React.ReactElement | null => {
      if (!child || !(child as React.ReactElement).key) return;
      const l = getLayoutItem(
        currentLayout,
        String((child as React.ReactElement).key)
      );
      if (!l) return null;
      const draggable = Boolean(
        !l.isStatic &&
          isDraggable &&
          (l.isDraggable || l.isDraggable === undefined)
      );
      const resizable = Boolean(
        !l.isStatic &&
          isResizable &&
          (l.isResizable || l.isResizable === undefined)
      );

      return (
        <GridItem
          margin={margin}
          containerPadding={containerPadding}
          maxRows={maxRows}
          maxCols={maxCols}
          colWidth={colWidth}
          rowHeight={rowHeight}
          cancel={draggableCancel}
          handle={draggableHandle}
          resizeHandles={resizableHandles}
          // onDragStart={onDragStart}
          // onDrag={onDrag}
          // onDragStop={onDragStop}
          // onResizeStart={onResizeStart}
          // onResize={onResize}
          // onResizeStop={onResizeStop}
          isDraggable={draggable}
          isResizable={resizable}
          cssTransforms={cssTransforms}
          transformScale={transformScale}
          w={l.w}
          h={l.h}
          x={l.x}
          y={l.y}
          i={l.i}
          minH={l.minH}
          minW={l.minW}
          maxH={l.maxH}
          maxW={l.maxW}
          isStatic={l.isStatic}
        >
          {child}
        </GridItem>
      );
    },
    [
      colWidth,
      containerPadding,
      cssTransforms,
      currentLayout,
      draggableCancel,
      draggableHandle,
      isDraggable,
      isResizable,
      margin,
      maxCols,
      maxRows,
      resizableHandles,
      rowHeight,
      transformScale
    ]
  );

  return (
    <div className={`react-grid-layout ${className}`} style={style}>
      {showGridLine && (
        <GridLine
          cols={currentCols}
          rows={currentRows}
          width={layoutSize.width}
          height={layoutSize.height}
          borderWidth={lineWidth}
          borderStyle={lineStyle}
          borderColor={lineColor}
        />
      )}
      {map(children, child => processGridItem(child))}
      {/* isDroppable &&
        this.state.droppingDOMNode &&
        this.processGridItem(this.state.droppingDOMNode, true)}
      {this.placeholder()} */}
    </div>
  );
});

ReactGridLayout.displayName = 'ReactGridLayout';

export default ReactGridLayout;
