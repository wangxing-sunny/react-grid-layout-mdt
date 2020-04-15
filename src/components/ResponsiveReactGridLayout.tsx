import * as React from "react";
import * as PropTypes from "prop-types";
import isEqual from "lodash/isEqual";

import {
  cloneLayout,
  synchronizeLayoutWithChildren,
  validateLayout,
  noop
} from "./utils";
import {
  getBreakpointFromWidth,
  getColsFromBreakpoint,
  findOrGenerateResponsiveLayout,
} from "./responsiveUtils";
import { Breakpoint, Breakpoints } from "./responsiveUtils";
import ReactGridLayout from "./ReactGridLayout";
import { BaseProps } from "./ReactGridLayout";
import { typeName, Layout } from "./utils";

/**
 * Get a value of margin or containerPadding.
 *
 * @param  {Array | Object} param Margin | containerPadding, e.g. [10, 10] | {lg: [10, 10], ...}.
 * @param  {String} breakpoint   Breakpoint: lg, md, sm, xs and etc.
 * @return {Array}
 */

function getIndentationValue(
  param: { [key: string]: [number, number] } | [number, number],
  breakpoint: Breakpoint
) {
  return Array.isArray(param) ? param : param[breakpoint];
}

type ResponsiveState = {
  layout: Layout,
  breakpoint: Breakpoint,
  cols: number,
  layouts?: { [key: string]: Layout }
};

export interface Layouts {
  [key: string]: Layout 
}

type ExtendsProps = Omit<BaseProps,
"cols" | "layouts" | "margin" | "containerPadding" | "onLayoutChange">;

export interface ResponsiveProps extends ExtendsProps {
  // Responsive config
  breakpoint: Breakpoint,
  breakpoints: Breakpoints,
  cols: Breakpoints,
  layouts: Layouts,
  margin: { [key: string]: [number, number] } | [number, number],
  containerPadding: { [key: string]: [number, number] } | [number, number],

  // Callbacks
  onBreakpointChange: (breakPoint: Breakpoint, cols: number) => void,
  onLayoutChange: (layout: Layout, lauouts: Layouts) => void,
  onWidthChange: (
    containerWidth: number,
    margin: [number, number],
    cols: number,
    containerPadding: [number, number] | null
  ) => void
};

export default class ResponsiveReactGridLayout extends React.Component<ResponsiveProps, ResponsiveState> {
  static defaultProps = {
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    layouts: {},
    margin: [5, 5],
    containerPadding: [5, 5],
    onBreakpointChange: noop,
    onLayoutChange: noop,
    onWidthChange: noop
  };

  constructor(props: ResponsiveProps) {
    super(props);
  }

  state = this.generateInitialState();

  generateInitialState(): ResponsiveState {
    const { width, breakpoints, layouts, cols } = this.props;
    const breakpoint = getBreakpointFromWidth(breakpoints, width);
    const colNo = getColsFromBreakpoint(breakpoint, cols);
    // verticalCompact compatibility, now deprecated
    const compactType =
      this.props.verticalCompact === false ? null : this.props.compactType;
    // Get the initial layout. This can tricky; we try to generate one however possible if one doesn't exist
    // for this layout.
    const initialLayout = findOrGenerateResponsiveLayout(
      layouts,
      breakpoints,
      breakpoint,
      breakpoint,
      colNo,
      compactType
    );

    return {
      layout: initialLayout,
      breakpoint: breakpoint,
      cols: colNo
    };
  }

  static getDerivedStateFromProps(nextProps: ResponsiveProps, prevState: ResponsiveState) {
    if (!isEqual(nextProps.layouts, prevState.layouts)) {
      // Allow parent to set layouts directly.
      const { breakpoint, cols } = prevState;

      // Since we're setting an entirely new layout object, we must generate a new responsive layout
      // if one does not exist.
      const newLayout = findOrGenerateResponsiveLayout(
        nextProps.layouts,
        nextProps.breakpoints,
        breakpoint,
        breakpoint,
        cols,
        nextProps.compactType
      );
      return { layout: newLayout, layouts: nextProps.layouts };
    }

    return null;
  }

  componentDidUpdate(prevProps: ResponsiveProps) {
    // Allow parent to set width or breakpoint directly.
    if (
      this.props.width != prevProps.width ||
      this.props.breakpoint !== prevProps.breakpoint ||
      !isEqual(this.props.breakpoints, prevProps.breakpoints) ||
      !isEqual(this.props.cols, prevProps.cols)
    ) {
      this.onWidthChange(this.props);
    }
  }

  // wrap layouts so we do not need to pass layouts to child
  onLayoutChange = (layout: Layout) => {
    this.props.onLayoutChange(layout, {
      ...this.props.layouts,
      [this.state.breakpoint]: layout
    });
  };

  /**
   * When the width changes work through breakpoints and reset state with the new width & breakpoint.
   * Width changes are necessary to figure out the widget widths.
   */
  onWidthChange(nextProps: ResponsiveProps) {
    const { breakpoints, cols, layouts, compactType } = nextProps;
    const newBreakpoint =
      nextProps.breakpoint ||
      getBreakpointFromWidth(nextProps.breakpoints, nextProps.width);

    const lastBreakpoint = this.state.breakpoint;
    const newCols: number = getColsFromBreakpoint(newBreakpoint, cols);

    // Breakpoint change
    if (
      lastBreakpoint !== newBreakpoint ||
      this.props.breakpoints !== breakpoints ||
      this.props.cols !== cols
    ) {
      // Preserve the current layout if the current breakpoint is not present in the next layouts.
      if (!(lastBreakpoint in layouts))
        layouts[lastBreakpoint] = cloneLayout(this.state.layout);

      // Find or generate a new layout.
      let layout = findOrGenerateResponsiveLayout(
        layouts,
        breakpoints,
        newBreakpoint,
        lastBreakpoint,
        newCols,
        compactType
      );

      // This adds missing items.
      layout = synchronizeLayoutWithChildren(
        layout,
        nextProps.children,
        newCols,
        compactType
      );

      // Store the new layout.
      layouts[newBreakpoint] = layout;

      // callbacks
      this.props.onLayoutChange(layout, layouts);
      this.props.onBreakpointChange(newBreakpoint, newCols);

      this.setState({
        breakpoint: newBreakpoint,
        layout: layout,
        cols: newCols
      });
    }

    const margin = getIndentationValue(nextProps.margin, newBreakpoint);
    const containerPadding = getIndentationValue(
      nextProps.containerPadding,
      newBreakpoint
    );

    //call onWidthChange on every change of width, not only on breakpoint changes
    this.props.onWidthChange(
      nextProps.width,
      margin,
      newCols,
      containerPadding
    );
  }

  render() {
    /* eslint-disable no-unused-vars */
    const {
      breakpoint,
      breakpoints,
      cols,
      layouts,
      margin,
      containerPadding,
      onBreakpointChange,
      onLayoutChange,
      onWidthChange,
      ...other
    } = this.props;
    /* eslint-enable no-unused-vars */

    return (
      <ReactGridLayout
        {...other}
        margin={getIndentationValue(margin, this.state.breakpoint)}
        containerPadding={getIndentationValue(
          containerPadding,
          this.state.breakpoint
        )}
        onLayoutChange={this.onLayoutChange}
        layout={this.state.layout}
        cols={this.state.cols}
      />
    );
  }
}
