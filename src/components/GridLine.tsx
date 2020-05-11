import React, { memo, useMemo, useCallback, CSSProperties } from 'react';
import { GridLineProps } from '../interfaces';

const GridLine = memo(
  ({
    width,
    height,
    cols,
    rows,
    colWidth,
    rowHeight,
    margin,
    padding,
    lineWidth = 1,
    lineStyle = 'solid',
    lineColor = '#38497b'
  }: GridLineProps) => {
    const arrCol = useMemo(() => {
      const arr: number[] = [];
      for (let i = 0; i < cols; i++) {
        arr.push(i);
      }
      return arr;
    }, [cols]);

    const arrRow = useMemo(() => {
      const arr: number[] = [];
      for (let i = 0; i < rows; i++) {
        arr.push(i);
      }
      return arr;
    }, [rows]);

    const getMargin = useCallback(
      (pos: string, index: number): number => {
        return index === 0
          ? pos === 'left'
            ? padding[0]
            : padding[1]
          : pos === 'left'
          ? margin[0]
          : margin[1];
      },
      [margin, padding]
    );

    const colStyle = useCallback(
      (index: number): CSSProperties => {
        return {
          marginLeft: getMargin('left', index),
          width: colWidth,
          height: '100%',
          borderLeft: `${lineWidth}px ${lineStyle} ${lineColor}`,
          borderRight: `${lineWidth}px ${lineStyle} ${lineColor}`,
          boxSizing: 'border-box'
        };
      },
      [getMargin, colWidth, lineWidth, lineStyle, lineColor]
    );

    const rowStyle = useCallback(
      (index: number): CSSProperties => {
        return {
          marginTop: getMargin('top', index),
          height: rowHeight,
          width: '100%',
          borderTop: `${lineWidth}px ${lineStyle} ${lineColor}`,
          borderBottom: `${lineWidth}px ${lineStyle} ${lineColor}`,
          boxSizing: 'border-box'
        };
      },
      [getMargin, lineColor, lineStyle, lineWidth, rowHeight]
    );

    const columnBoxStyle = useMemo(() => {
      const style: CSSProperties = {
        height: height,
        position: 'absolute',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        boxSizing: 'border-box'
      };
      return style;
    }, [height]);

    const rowBoxStyle = useMemo(() => {
      const style: CSSProperties = {
        width: width,
        position: 'absolute',
        boxSizing: 'border-box'
      };
      return style;
    }, [width]);

    return (
      <div className="react-grid-layout-grid">
        <div className="react-grid-layout-columns" style={columnBoxStyle}>
          {arrCol.map(i => {
            return (
              <div
                key={`col-${i}`}
                className="react-grid-layout-col"
                style={colStyle(i)}
              ></div>
            );
          })}
        </div>
        <div className="react-grid-layout-rows" style={rowBoxStyle}>
          {arrRow.map(i => {
            return (
              <div
                key={`row-${i}`}
                className="react-grid-layout-row"
                style={rowStyle(i)}
              ></div>
            );
          })}
        </div>
      </div>
    );
  }
);

export default GridLine;
