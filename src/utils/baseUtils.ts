import React, { CSSProperties } from 'react';
import { Layout, LayoutItem, CompactType, Block } from '../interfaces/index';
import map from 'lodash/map';
import isEqual from 'lodash/isEqual';
import filter from 'lodash/filter';
import cloneDeep from 'lodash/cloneDeep';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * 计算布局最底部坐标
 */
export function bottom(layout: Layout): number {
  let max = 0,
    bottomY;
  for (let i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].y + layout[i].h;
    if (bottomY > max) max = bottomY;
  }
  return max;
}

/**
 * 计算布局最右侧坐标
 */
export function right(layout: Layout): number {
  let max = 0,
    rightX;
  for (let i = 0, len = layout.length; i < len; i++) {
    rightX = layout[i].x + layout[i].w;
    if (rightX > max) max = rightX;
  }
  return max;
}

/**
 * 复制单个网格项属性
 */
export function cloneLayoutItem(layoutItem: LayoutItem): LayoutItem {
  return {
    w: layoutItem.w,
    h: layoutItem.h,
    x: layoutItem.x,
    y: layoutItem.y,
    i: layoutItem.i,
    minW: layoutItem.minW,
    maxW: layoutItem.maxW,
    minH: layoutItem.minH,
    maxH: layoutItem.maxH,
    moved: Boolean(layoutItem.moved),
    static: Boolean(layoutItem.static),
    isDraggable: layoutItem.isDraggable,
    isResizable: layoutItem.isResizable
  };
}

/**
 * 复制布局
 */
export function cloneLayout(layout: Layout): Layout {
  return map(layout, layoutItem => {
    return cloneLayoutItem(layoutItem);
  });
}

/**
 * 简化比较两个react-node
 */
export function childrenEqual(a: React.ReactNode, b: React.ReactNode): boolean {
  return isEqual(
    React.Children.map(a, c => (c as any).key),
    React.Children.map(b, c => (c as any).key)
  );
}

/**
 * 检测两个布局项是否重合
 */
export function collides(l1: LayoutItem, l2: LayoutItem): boolean {
  if (l1.i === l2.i) return false;
  if (l1.x + l1.w <= l2.x) return false;
  if (l1.x >= l2.x + l2.w) return false;
  if (l1.y + l1.h <= l2.y) return false;
  if (l1.y >= l2.y + l2.h) return false;
  return true;
}

/**
 * 取消留白
 */
export function compact(
  layout: Layout,
  compactType: CompactType,
  cols: number
): Layout {
  const compareWith = getStatics(layout);
  const sorted = sortLayoutItems(layout, compactType);
  const out = new Array(layout.length);

  for (let i = 0, len = sorted.length; i < len; i++) {
    let l = cloneLayoutItem(sorted[i]);
    if (!l.static) {
      l = compactItem(compareWith, l, compactType, cols, sorted);
      compareWith.push(l);
    }
    out[layout.indexOf(sorted[i])] = l;
    l.moved = false;
  }
  return out;
}
/**
 * 移动会发生碰撞的项目
 */
function resolveCompactionCollision(
  layout: Layout,
  item: LayoutItem,
  moveToCoord: number,
  axis: 'x' | 'y'
) {
  item[axis] += 1;
  const sizeProps = axis === 'x' ? 'w' : 'h';
  const itemIndex = layout
    .map(layoutItem => {
      return layoutItem.i;
    })
    .indexOf(item.i);

  for (let i = itemIndex + 1; i < layout.length; i++) {
    const otherItem = layout[i];
    if (otherItem.static) continue;
    if (otherItem.y > item.y + item.h) break;

    if (collides(item, otherItem)) {
      resolveCompactionCollision(
        layout,
        otherItem,
        moveToCoord + item[sizeProps],
        axis
      );
    }
  }

  item[axis] = moveToCoord;
}

/**
 * 堆积
 */
export function compactItem(
  compareWith: Layout,
  l: LayoutItem,
  compactType: CompactType,
  cols: number,
  fullLayout: Layout
): LayoutItem {
  const compactV = compactType === CompactType.vertical;
  const compactH = compactType === CompactType.horizontal;
  if (compactV) {
    l.y = Math.min(bottom(compareWith), l.y);
    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      l.y--;
    }
  } else if (compactH) {
    l.x = Math.min(right(compareWith), l.x);
    while (l.x > 0 && !getFirstCollision(compareWith, l)) {
      l.x--;
    }
  }

  let collides;
  while ((collides = getFirstCollision(compareWith, l))) {
    if (compactV) {
      resolveCompactionCollision(fullLayout, l, collides.y + collides.h, 'y');
    } else if (compactH) {
      resolveCompactionCollision(fullLayout, l, collides.x + collides.w, 'x');
    }
    if (compactH && l.x + l.w > cols) {
      l.x = cols - l.w;
      l.y++;
    }
  }
  return l;
}

/**
 * 限制边界
 */
export function correctBounds(
  layout: Layout,
  bounds: { cols: number }
): Layout {
  const collidesWith = getStatics(layout);
  for (let i = 0, len = layout.length; i < len; i++) {
    const l = layout[i];
    if (l.x + l.w > bounds.cols) l.x = bounds.cols - l.w;
    if (l.x < 0) {
      l.x = 0;
      l.w = bounds.cols;
    }
    if (!l.static) {
      collidesWith.push(l);
    } else {
      while (getFirstCollision(collidesWith, l)) {
        l.y++;
      }
    }
  }
  return layout;
}

/**
 * 根据id获取布局项
 */
export function getLayoutItem(layout: Layout, id: string): LayoutItem | null {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (layout[i].i === id) return layout[i];
  }
  return null;
}

/**
 * 获取第一个与给出的网格项重合的网格项
 */
export function getFirstCollision(
  layout: Layout,
  layoutItem: LayoutItem
): LayoutItem | null {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (collides(layout[i], layoutItem)) return layout[i];
  }
  return null;
}

/**
 * 获取所有与给出的网格项重合的网格项
 */
export function getAllCollisions(
  layout: Layout,
  layoutItem: LayoutItem
): Array<LayoutItem> {
  return filter(layout, l => collides(l, layoutItem));
}

/**
 * 获取所有固定grid
 */
export function getStatics(layout: Layout): Array<LayoutItem> {
  return layout.filter(l => l.static);
}

/**
 * 移动元素
 */
export function moveElement(
  layout: Layout,
  l: LayoutItem,
  x?: number,
  y?: number,
  isUserAction?: boolean,
  preventCollision?: boolean,
  compactType?: CompactType,
  cols?: number
): Layout {
  if (l.static) return layout;
  if (l.y === y && l.x === x) return layout;
  log(`把${l.i}从[${l.x},${l.y}]移动到[${String(x)},${String(y)}]`);
  const oldX = l.x,
    oldY = l.y;

  if (typeof x === 'number') l.x = x;
  if (typeof y === 'number') l.y = y;
  l.moved = true;

  let sorted = sortLayoutItems(layout, compactType);
  const movingUp =
    compactType === CompactType.vertical && typeof y === 'number'
      ? oldY >= y
      : compactType === CompactType.horizontal && typeof x === 'number'
      ? oldX >= x
      : false;
  if (movingUp) sorted.reverse();
  const collisions = getAllCollisions(sorted, l);

  if (preventCollision && collisions.length) {
    log(`${l.i}禁止碰撞，还原`);
    l.x = oldX;
    l.y = oldY;
    l.moved = false;
    return layout;
  }

  for (let i = 0, len = collisions.length; i < len; i++) {
    const collision = collisions[i];
    log(
      `解决${l.i}位置[${l.x},${l.y}]和${collision.i}位置[${collision.x},${collision.y}]的碰撞。`
    );
    if (collision.moved) continue;
    if (collision.static) {
      layout = moveElementAwayFromCollision(
        layout,
        collision,
        l,
        isUserAction,
        compactType,
        cols
      );
    } else {
      layout = moveElementAwayFromCollision(
        layout,
        l,
        collision,
        isUserAction,
        compactType,
        cols
      );
    }
  }

  return layout;
}

/**
 * 如果存在位置冲突，将元素移开
 */
export function moveElementAwayFromCollision(
  layout: Layout,
  collidesWith: LayoutItem,
  itemToMove: LayoutItem,
  isUserAction?: boolean,
  compactType?: CompactType,
  cols?: number
): Layout {
  const compactH = compactType === CompactType.horizontal;
  const compactV = compactType !== CompactType.horizontal;
  const preventCollision = collidesWith.static;
  if (isUserAction) {
    isUserAction = false;
    const fakeItem: LayoutItem = {
      x: compactH ? Math.max(collidesWith.x - itemToMove.w, 0) : itemToMove.x,
      y: compactV ? Math.max(collidesWith.y - itemToMove.h, 0) : itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: '-1'
    };
    if (!getFirstCollision(layout, fakeItem)) {
      log(
        `Doing reverse collision on ${itemToMove.i} up to [${fakeItem.x},${fakeItem.y}].`
      );
      return moveElement(
        layout,
        itemToMove,
        compactH ? fakeItem.x : undefined,
        compactV ? fakeItem.y : undefined,
        isUserAction,
        preventCollision,
        compactType,
        cols
      );
    }
  }

  return moveElement(
    layout,
    itemToMove,
    compactH ? itemToMove.x + 1 : undefined,
    compactV ? itemToMove.y + 1 : undefined,
    isUserAction,
    preventCollision,
    compactType,
    cols
  );
}

export function perc(num: number): string {
  return num * 100 + '%';
}

export function setTransform({
  top,
  left,
  width,
  height
}: Block): CSSProperties {
  const translate = `translate(${left}px,${top}px)`;
  return {
    transform: translate,
    WebkitTransform: translate,
    msTransform: translate,
    OTransform: translate,
    width: `${width}px`,
    height: `${height}px`,
    position: 'absolute'
  };
}

export function setTopLeft({ top, left, width, height }: Block): CSSProperties {
  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
    position: 'absolute'
  };
}

/**
 * 从左上到又下排序网格
 */
export function sortLayoutItems(
  layout: Layout,
  compactType: CompactType
): Layout {
  if (compactType === 'horizontal') {
    return sortLayoutItemsByColRow(layout);
  } else {
    return sortLayoutItemsByRowCol(layout);
  }
}

/**
 * 先上下后左右排序
 */
export function sortLayoutItemsByRowCol(layout: Layout): Layout {
  return cloneDeep(layout).sort(function(a, b) {
    if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
      return 1;
    } else if (a.y === b.y && a.x === b.x) {
      return 0;
    }
    return -1;
  });
}

/**
 * 先左右后上下排序
 */
export function sortLayoutItemsByColRow(layout: Layout): Layout {
  return cloneDeep(layout).sort(function(a, b) {
    if (a.x > b.x || (a.x === b.x && a.y > b.y)) {
      return 1;
    } else if (a.y === b.y && a.x === b.x) {
      return 0;
    }
    return -1;
  });
}

/**
 * 使用children生成layout
 */
export function synchronizeLayoutWithChildren(
  initialLayout: Layout,
  children: React.ReactNode,
  cols: number,
  compactType: CompactType
): Layout {
  initialLayout = initialLayout || [];

  let layout: Layout = [];
  React.Children.forEach(children, (child: React.ReactElement, i: number) => {
    const exists = getLayoutItem(initialLayout, String(child.key));
    if (exists) {
      layout[i] = cloneLayoutItem(exists);
    } else {
      const g = child.props['data-grid'];
      if (g) {
        if (!isProduction) {
          validateLayout([g], 'ReactGridLayout.children');
        }
        layout[i] = cloneLayoutItem({ ...g, i: child.key });
      } else {
        layout[i] = cloneLayoutItem({
          w: 1,
          h: 1,
          x: 0,
          y: bottom(layout),
          i: String(child.key)
        });
      }
    }
  });
  layout = correctBounds(layout, { cols: cols });
  layout = compact(layout, compactType, cols);

  return layout;
}

/**
 * 检测layout是否符合格式
 */
export function validateLayout(
  layout: Layout,
  contextName: string = 'Layout'
): void {
  const subProps = ['x', 'y', 'w', 'h'];
  if (!Array.isArray(layout))
    throw new Error(contextName + ' must be an array!');
  for (let i = 0, len = layout.length; i < len; i++) {
    const item = layout[i];
    for (let j = 0; j < subProps.length; j++) {
      if (typeof item[subProps[j] as keyof LayoutItem] !== 'number') {
        throw new Error(
          `ReactGridLayout: ${contextName}[${i}].${subProps[j]} must be a number!`
        );
      }
    }
    if (item.i && typeof item.i !== 'string') {
      throw new Error(
        `ReactGridLayout: ${contextName}[${i}].i must be a string!`
      );
    }
    if (item.static !== undefined && typeof item.static !== 'boolean') {
      throw new Error(
        `ReactGridLayout: ${contextName}[${i}].static must be a boolean!`
      );
    }
  }
}

export function autoBindHandlers(
  el: { [key: string]: any },
  fns: Array<string>
): void {
  fns.forEach(key => (el[key] = el[key].bind(el)));
}

function log(...args: any) {
  if (isProduction) return;
  // eslint-disable-next-line no-console
  console.log(...args);
}

export type Noop = () => void;
