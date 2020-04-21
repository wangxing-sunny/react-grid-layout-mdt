import { CSSProperties } from 'react';
import { DraggableEvent } from 'react-draggable';

export interface Position {
  left: number;
  top: number;
}

export interface Size {
  width: number;
  height: number;
}
export interface Block {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface GridPosition {
  x: number;
  y: number;
}

export interface GridSize {
  w: number;
  h: number;
}

export interface GridBlock {
  x: number;
  y: number;
  w: number;
  h: number;
}

export enum ResizableHandles {
  s = 's',
  w = 'w',
  e = 'e',
  n = 'n',
  sw = 'sw',
  nw = 'nw',
  se = 'se',
  ne = 'ne'
}

export interface LayoutItem {
  w: number;
  h: number;
  x: number;
  y: number;
  i: string;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  moved?: boolean;
  isStatic?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export type Layout = Array<LayoutItem>;

export interface GridDragEvent {
  e: DraggableEvent;
  node: HTMLElement;
  position: Position;
}

export interface LayoutItemDragParam {
  i: string;
  position: GridPosition;
  event: GridDragEvent;
}

export type LayoutItemDragEvent = (param: LayoutItemDragParam) => void;

export interface GridResizeEvent {
  e: React.SyntheticEvent;
  node: HTMLElement;
  size: Size;
}

export interface LayoutItemResizeParam {
  i: string;
  size: GridSize;
  event: GridResizeEvent;
}

export type LayoutItemResizeEvent = (param: LayoutItemResizeParam) => void;

export interface ReactDraggableCallbackData {
  node: HTMLElement;
  x?: number;
  y?: number;
  deltaX: number;
  deltaY: number;
  lastX?: number;
  lastY?: number;
}

export type DragOverEvent = MouseEvent & {
  nativeEvent: {
    layerX: number;
    layerY: number;
    target: {
      className: string;
    };
  };
};

export type LayoutEventCallback = (
  layout: Layout,
  oldItem?: LayoutItem,
  newItem?: LayoutItem,
  placeholder?: LayoutItem,
  event?: DraggableEvent | React.SyntheticEvent,
  element?: HTMLElement
) => void;

export enum CompactType {
  horizontal = 'horizontal',
  vertical = 'vertical',
  both = 'both',
  none = ''
}

export interface DropParams extends LayoutItem {
  event: Event;
}

export interface GridItemProps extends LayoutItem {
  className?: string;
  style?: React.CSSProperties;
  colWidth: number;
  rowHeight: number;
  maxRows?: number;
  maxCols?: number;

  margin: [number, number];
  containerPadding: [number, number];

  cssTransforms?: boolean;
  transformScale?: number;

  resizeHandles?: Array<ResizableHandles>;
  // Draggability
  cancel?: string;
  handle?: string;

  onDrag?: LayoutItemDragEvent;
  onDragStart?: LayoutItemDragEvent;
  onDragStop?: LayoutItemDragEvent;
  onResize?: LayoutItemResizeEvent;
  onResizeStart?: LayoutItemResizeEvent;
  onResizeStop?: LayoutItemResizeEvent;

  children: React.ReactElement;
}

export interface GridLineProps {
  width: number;
  height: number;
  cols: number;
  rows: number;
  borderWidth: number;
  borderStyle: string;
  borderColor: string;
}

export interface BaseProps {
  className?: string; // class
  style?: CSSProperties; // style

  width?: number; // 容器宽度
  colWidth?: number; // 单格宽度
  maxCols?: number; // 最大列数

  height?: number; // 容器高度
  rowHeight?: number; // 单格高度
  maxRows?: number; // 最大行数

  autoSize?: boolean; // 自动缩放撑满容器
  squareGrid?: boolean; // 正方形网格，columnWidth = rowHeight

  layout: Layout; // 布局

  compactType?: CompactType; // 堆积方向
  preventCollision?: boolean; // 禁止推挤
  margin?: [number, number]; // 网格间距
  containerPadding?: [number, number]; // 容器内边距
  isDraggable?: boolean; // 可拖拽
  isResizable?: boolean; // 可改变大小
  isDroppable?: boolean; // 可拖动添加
  showGridLine?: boolean; // 显示网格线
  lineWidth?: number; // 网格线宽
  lineStyle?: string; // 网格线样式
  lineColor?: string; // 网格线颜色
  resizableHandles?: Array<ResizableHandles>; // TODO，可调整大小的方向
  draggableCancel?: string; // 不可拖拽的元素选择器
  draggableHandle?: string; // 用于拖拽的元素选择器
  cssTransforms?: boolean; // 使用CSS3-translate代替position+top+left定位
  transformScale?: number; // 容器存在scale时设置，保证拖拽不出错
  // callbacks
  onLayoutChange?: (layout: Layout) => void;
  onDragStart?: LayoutEventCallback; // 开始拖拽
  onDrag?: LayoutEventCallback; // 拖拽中
  onDragStop?: LayoutEventCallback; // 停止拖拽
  onResizeStart?: LayoutEventCallback; // 开始调整大小
  onResize?: LayoutEventCallback; // 调整大小中
  onResizeStop?: LayoutEventCallback; // 停止调整大小
  children?: React.ReactElement; // 子元素
}
