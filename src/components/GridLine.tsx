import React, { memo, useMemo } from 'react';
import { GridLineProps } from '../interfaces';

const GridLine = memo(
  ({
    width,
    height,
    cols,
    rows,
    borderWidth,
    borderStyle,
    borderColor
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
    const colStyle = useMemo(() => {
      return {
        width: width,
        borderLeft: `${borderWidth}px ${borderStyle} ${borderColor}`,
        borderRight: `${borderWidth}px ${borderStyle} ${borderColor}`
      };
    }, [borderColor, borderStyle, borderWidth, width]);
    const rowStyle = useMemo(() => {
      return {
        height: height,
        borderTop: `${borderWidth}px ${borderStyle} ${borderColor}`,
        borderBottom: `${borderWidth}px ${borderStyle} ${borderColor}`
      };
    }, [borderColor, borderStyle, borderWidth, height]);
    return (
      <div className="react-grid-layout-grid">
        <div className="react-grid-layout-columns" style={{ height: '100%' }}>
          {arrCol.map(i => {
            return (
              <div
                key={`col-${i}`}
                className="react-grid-layout-col"
                style={colStyle}
              />
            );
          })}
        </div>
        <div className="react-grid-layout-rows" style={{ width: '100%' }}>
          {arrRow.map(i => {
            return (
              <div
                key={`row-${i}`}
                className="react-grid-layout-row"
                style={rowStyle}
              />
            );
          })}
        </div>
      </div>
    );
  }
);

export default GridLine;
