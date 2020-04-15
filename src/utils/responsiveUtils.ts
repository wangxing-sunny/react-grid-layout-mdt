import { Layout, CompactType } from '../interfaces/index';
import { cloneLayout, compact, correctBounds } from './baseUtils';

export enum Breakpoint {
  lg = 'lg',
  md = 'md',
  sm = 'sm',
  xs = 'xs',
  xxs = 'xxs'
}

interface Responsive<T> {
  [Breakpoint.lg]?: T;
  [Breakpoint.md]?: T;
  [Breakpoint.sm]?: T;
  [Breakpoint.xs]?: T;
  [Breakpoint.xxs]?: T;
}

export type ResponsiveLayout = Responsive<Layout>;

export type Breakpoints = Responsive<number>;

export function getBreakpointFromWidth(
  breakpoints: Breakpoints,
  width: number
): Breakpoint {
  const sorted = sortBreakpoints(breakpoints);
  let matching = sorted[0];
  for (let i = 1, len = sorted.length; i < len; i++) {
    const breakpointName = sorted[i];
    if (width > breakpoints[breakpointName]) matching = breakpointName;
  }
  return matching;
}

export function getColsFromBreakpoint(
  point: Breakpoint,
  breakpoints: Breakpoints
): number {
  if (!breakpoints[point]) {
    throw new Error(
      `ResponsiveReactGridLayout: entry for breakpoint ${point} is missing!`
    );
  }
  return breakpoints[point];
}

export function findOrGenerateResponsiveLayout(
  layouts: ResponsiveLayout,
  breakpoints: Breakpoints,
  breakpoint: Breakpoint,
  lastBreakpoint: Breakpoint,
  cols: number,
  compactType: CompactType
): Layout {
  if (layouts[breakpoint]) return cloneLayout(layouts[breakpoint]);
  let layout: Layout = layouts[lastBreakpoint];
  const breakpointsSorted = sortBreakpoints(breakpoints);
  const breakpointsAbove = breakpointsSorted.slice(
    breakpointsSorted.indexOf(breakpoint)
  );
  for (let i = 0, len = breakpointsAbove.length; i < len; i++) {
    const b = breakpointsAbove[i];
    if (layouts[b]) {
      layout = layouts[b];
      break;
    }
  }
  layout = cloneLayout(layout || []);
  return compact(correctBounds(layout, { cols: cols }), compactType, cols);
}

export function sortBreakpoints(breakpoints: Breakpoints): Breakpoint[] {
  const keys: Breakpoint[] = Object.keys(breakpoints).map(
    bp => bp as Breakpoint
  );
  return keys.sort(function(a, b) {
    return breakpoints[a] - breakpoints[b];
  });
}
