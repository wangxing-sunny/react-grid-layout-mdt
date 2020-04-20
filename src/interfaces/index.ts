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

export interface Coordinate {
  x: number;
  y: number;
  w: number;
  h: number;
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

export interface ReactDraggableCallbackData {
  node: HTMLElement;
  x?: number;
  y?: number;
  deltaX: number;
  deltaY: number;
  lastX?: number;
  lastY?: number;
}

export interface GridDragEvent {
  e: DraggableEvent;
  node: HTMLElement;
  newPosition: Position;
}

export interface GridResizeEvent {
  e: React.SyntheticEvent;
  node: HTMLElement;
  size: Size;
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

export type EventCallback = (
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
  cols: number;
  rows: number;
  colWidth: number;
  rowHeight: number;
  maxRows?: number;
  maxCols?: number;

  containerWidth?: number;
  margin: [number, number];
  containerPadding: [number, number];

  cssTransforms?: boolean;
  transformScale?: number;
  droppingPosition?: DropParams;

  resizeHandles?: string[];
  // Draggability
  cancel?: string;
  handle?: string;

  // onDrag?: GridItemDragCallback;
  // onDragStart?: GridItemDragCallback;
  // onDragStop?: GridItemDragCallback;
  // onResize?: GridItemResizeCallback;
  // onResizeStart?: GridItemResizeCallback;
  // onResizeStop?: GridItemResizeCallback;

  children: React.ReactElement;
}

export interface BaseProps {
  className?: string; // class
  style?: CSSProperties; // style

  width?: number; // 容器宽度
  columnWidth?: number; // 单格宽度
  cols?: number; // 列数
  maxCols?: number; // 最大列数

  height?: number; // 容器高度
  rowHeight?: number; // 单格高度
  rows?: number; // 行数
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
  showGrid?: boolean; // 显示网格
  gridColor?: string; // 网格颜色
  resizableHandles?: Array<string>; // TODO，可调整大小的方向
  draggableCancel?: string; // 不可拖拽的元素选择器
  draggableHandle?: string; // 用于拖拽的元素选择器
  useCSSTransforms?: boolean; // 使用CSS3-translate代替position+top+left定位
  transformScale?: number; // 容器存在scale时设置，保证拖拽不出错
  droppingItem?: LayoutItem; // 从外部拖拽的项目
  // callbacks
  onLayoutChange?: (layout: Layout) => void;
  onDragStart?: EventCallback; // 开始拖拽
  onDrag?: EventCallback; // 拖拽中
  onDragStop?: EventCallback; // 停止拖拽
  onResizeStart?: EventCallback; // 开始调整大小
  onResize?: EventCallback; // 调整大小中
  onResizeStop?: EventCallback; // 停止调整大小
  onDrop?: (param: DropParams) => void; // 放置
  children?: React.ReactNode; // 子元素
}
