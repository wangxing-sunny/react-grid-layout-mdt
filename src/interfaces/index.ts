import { CSSProperties } from 'react';
import { DraggableEvent } from 'react-draggable';

export interface LayoutItem {
  w?: number;
  h?: number;
  x?: number;
  y?: number;
  i: string;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  moved?: boolean;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export type Layout = Array<LayoutItem>;

export interface Block {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ReactDraggableCallbackData {
  node: HTMLElement;
  x?: number;
  y?: number;
  deltaX: number;
  deltaY: number;
  lastX?: number;
  lastY?: number;
}

export interface PartialPosition {
  left: number;
  top: number;
}

export interface DroppingPosition {
  x: number;
  y: number;
  e: DraggableEvent;
}

export interface Size {
  width: number;
  height: number;
}

export interface GridDragEvent {
  e: DraggableEvent;
  node: HTMLElement;
  newPosition: PartialPosition;
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
  none = ''
}

export interface BaseProps {
  className?: string;
  style?: CSSProperties;
  width?: number;
  autoSize?: boolean;
  cols?: number;
  resizableHandles?: Array<string>;
  draggableCancel?: string;
  draggableHandle?: string;
  verticalCompact?: boolean;
  compactType?: CompactType;
  layout?: Layout;
  margin?: [number, number];
  containerPadding?: [number, number] | null;
  rowHeight?: number;
  maxRows?: number;
  maxCols?: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  isDroppable?: boolean;
  preventCollision?: boolean;
  showGrid?: boolean;
  gridColor?: string;
  useCSSTransforms?: boolean;
  transformScale?: number;
  droppingItem?: LayoutItem;
  // callbacks
  onLayoutChange?: (layout: Layout) => void;
  onDrag?: EventCallback;
  onDragStart?: EventCallback;
  onDragStop?: EventCallback;
  onResize?: EventCallback;
  onResizeStart?: EventCallback;
  onResizeStop?: EventCallback;
  onDrop?: (itemPosition: ItemPosition) => void;
  children?: React.ReactNode;
}
