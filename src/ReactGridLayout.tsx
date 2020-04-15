import * as React from 'react';
import * as PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import {
  autoBindHandlers,
  bottom,
  childrenEqual,
  cloneLayoutItem,
  compact,
  getLayoutItem,
  moveElement,
  synchronizeLayoutWithChildren,
  validateLayout,
  getAllCollisions,
  noop,
  right
} from './utils/baseUtils';
import GridItem, { ItemPosition } from './GridItem';

// Types
import {
  EventCallback,
  CompactType,
  GridResizeEvent,
  GridDragEvent,
  DragOverEvent,
  Layout,
  DroppingPosition,
  LayoutItem
} from './utils/baseUtils';

import '../css/styles.css';

type BaseState = {
  activeDrag?: LayoutItem;
  layout: Layout;
  mounted: boolean;
  oldDragItem?: LayoutItem;
  oldLayout?: Layout;
  oldResizeItem?: LayoutItem;
  droppingDOMNode?: React.ReactNode;
  droppingPosition?: DroppingPosition;
  // Mirrored props
  children: React.ReactNode;
  compactType?: CompactType;
  propsLayout?: Layout;
};

export interface BaseProps {
  className?: string;
  style?: object;
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

  // Callbacks
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
// End Types

const compactType = (props: BaseProps): CompactType => {
  const { verticalCompact, compactType } = props || {};

  return verticalCompact === false ? null : compactType;
};

const layoutClassName = 'react-grid-layout';
let isFirefox = false;
// Try...catch will protect from navigator not existing (e.g. node) or a bad implementation of navigator
try {
  isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
} catch (e) {
  /* Ignore */
}

/**
 * A reactive, fluid grid layout with draggable, resizable components.
 */

export default class ReactGridLayout extends React.Component<
  BaseProps,
  BaseState
> {
  // TODO publish internal ReactClass displayName transform
  static displayName = 'ReactGridLayout';

  static defaultProps: BaseProps = {
    autoSize: true,
    cols: 12,
    resizableHandles: ['se'],
    className: '',
    style: {},
    draggableHandle: '',
    draggableCancel: '',
    containerPadding: [5, 5],
    rowHeight: 150,
    maxRows: Infinity, // infinite vertical growth
    layout: [],
    margin: [5, 5],
    isDraggable: true,
    isResizable: true,
    isDroppable: false,
    useCSSTransforms: true,
    transformScale: 1,
    verticalCompact: true,
    compactType: 'vertical',
    preventCollision: false,
    showGrid: true,
    gridColor: '#38497b',
    droppingItem: {
      i: '__dropping-elem__',
      h: 1,
      w: 1
    },
    onLayoutChange: noop,
    onDragStart: noop,
    onDrag: noop,
    onDragStop: noop,
    onResizeStart: noop,
    onResize: noop,
    onResizeStop: noop,
    onDrop: noop
  };

  state: BaseState = {
    activeDrag: null,
    layout: synchronizeLayoutWithChildren(
      this.props.layout,
      this.props.children,
      this.props.cols,
      // Legacy support for verticalCompact: false
      compactType(this.props)
    ),
    mounted: false,
    oldDragItem: null,
    oldLayout: null,
    oldResizeItem: null,
    droppingDOMNode: null,
    children: []
  };

  dragEnterCounter = 0;

  constructor(props: BaseProps, context: any) {
    super(props, context);
    autoBindHandlers(this, [
      'onDragStart',
      'onDrag',
      'onDragStop',
      'onResizeStart',
      'onResize',
      'onResizeStop'
    ]);
  }

  componentDidMount() {
    this.setState({ mounted: true });
    // Possibly call back with layout on mount. This should be done after correcting the layout width
    // to ensure we don't rerender with the wrong width.
    this.onLayoutMaybeChanged(this.state.layout, this.props.layout);
  }

  static getDerivedStateFromProps(nextProps: BaseProps, prevState: BaseState) {
    let newLayoutBase;

    if (prevState.activeDrag) {
      return null;
    }

    // Legacy support for compactType
    // Allow parent to set layout directly.
    if (
      !isEqual(nextProps.layout, prevState.propsLayout) ||
      nextProps.compactType !== prevState.compactType
    ) {
      newLayoutBase = nextProps.layout;
    } else if (!childrenEqual(nextProps.children, prevState.children)) {
      // If children change, also regenerate the layout. Use our state
      // as the base in case because it may be more up to date than
      // what is in props.
      newLayoutBase = prevState.layout;
    }

    // We need to regenerate the layout.
    if (newLayoutBase) {
      const newLayout = synchronizeLayoutWithChildren(
        newLayoutBase,
        nextProps.children,
        nextProps.cols,
        compactType(nextProps)
      );

      return {
        layout: newLayout,
        // We need to save these props to state for using
        // getDerivedStateFromProps instead of componentDidMount (in which we would get extra rerender)
        compactType: nextProps.compactType,
        children: nextProps.children,
        propsLayout: nextProps.layout
      };
    }

    return null;
  }

  componentDidUpdate(prevProps: BaseProps, prevState: BaseState) {
    if (!this.state.activeDrag) {
      const newLayout = this.state.layout;
      const oldLayout = prevState.layout;
      this.onLayoutMaybeChanged(newLayout, oldLayout);
    }
  }

  /**
   * Calculates a pixel value for the container.
   * @return {String} Container height in pixels.
   */
  containerHeight(): string {
    if (!this.props.autoSize) return;
    const nbRow = bottom(this.state.layout);
    const containerPaddingY = this.props.containerPadding
      ? this.props.containerPadding[1]
      : this.props.margin[1];
    return (
      nbRow * this.props.rowHeight +
      (nbRow - 1) * this.props.margin[1] +
      containerPaddingY * 2 +
      'px'
    );
  }

  /**
   * When dragging starts
   * @param {String} i Id of the child
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} node The current dragging DOM element
   */
  onDragStart(i: string, x: number, y: number, { e, node }: GridDragEvent) {
    const { layout } = this.state;
    var l = getLayoutItem(layout, i);
    if (!l) return;

    this.setState({
      oldDragItem: cloneLayoutItem(l),
      oldLayout: this.state.layout
    });

    return this.props.onDragStart(layout, l, l, null, e, node);
  }

  /**
   * Each drag movement create a new dragelement and move the element to the dragged location
   * @param {String} i Id of the child
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} node The current dragging DOM element
   */
  onDrag(i: string, x: number, y: number, { e, node }: GridDragEvent) {
    const { oldDragItem } = this.state;
    let { layout } = this.state;
    const { cols, maxCols } = this.props;
    var l = getLayoutItem(layout, i);
    if (!l) return;

    // Create placeholder (display only)
    var placeholder = {
      w: l.w,
      h: l.h,
      x: l.x,
      y: l.y,
      placeholder: true,
      i: i
    };

    // Move the element to the dragged location.
    const isUserAction = true;
    layout = moveElement(
      layout,
      l,
      x,
      y,
      isUserAction,
      this.props.preventCollision,
      compactType(this.props),
      maxCols || cols
    );

    this.props.onDrag(layout, oldDragItem, l, placeholder, e, node);

    this.setState({
      layout: compact(layout, compactType(this.props), maxCols || cols),
      activeDrag: placeholder
    });
  }

  /**
   * When dragging stops, figure out which position the element is closest to and update its x and y.
   * @param  {String} i Index of the child.
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} node The current dragging DOM element
   */
  onDragStop(i: string, x: number, y: number, { e, node }: GridDragEvent) {
    const { oldDragItem } = this.state;
    let { layout } = this.state;
    const { cols, maxCols, preventCollision } = this.props;
    const l = getLayoutItem(layout, i);
    if (!l) return;

    // Move the element here
    const isUserAction = true;
    layout = moveElement(
      layout,
      l,
      x,
      y,
      isUserAction,
      preventCollision,
      compactType(this.props),
      maxCols || cols
    );
    if (this.state.activeDrag) {
      this.props.onDragStop(layout, oldDragItem, l, null, e, node);
    }

    // Set state
    const newLayout = compact(layout, compactType(this.props), maxCols || cols);
    const { oldLayout } = this.state;
    this.setState({
      activeDrag: null,
      layout: newLayout,
      oldDragItem: null,
      oldLayout: null
    });
    this.onLayoutMaybeChanged(newLayout, oldLayout);
  }

  onLayoutMaybeChanged(newLayout: Layout, oldLayout?: Layout) {
    if (!oldLayout) oldLayout = this.state.layout;

    if (!isEqual(oldLayout, newLayout)) {
      this.props.onLayoutChange(newLayout);
    }
  }

  onResizeStart(
    i: string,
    { w, h }: ItemPosition,
    { e, node }: GridResizeEvent
  ) {
    const { layout } = this.state;
    var l = getLayoutItem(layout, i);
    if (!l) return;

    this.setState({
      oldResizeItem: cloneLayoutItem(l),
      oldLayout: this.state.layout
    });

    this.props.onResizeStart(layout, l, l, null, e, node);
  }

  onResize(i: string, { w, h }: ItemPosition, { e, node }: GridResizeEvent) {
    const { layout, oldResizeItem } = this.state;
    const { cols, maxCols, preventCollision } = this.props;
    const l: LayoutItem | null = getLayoutItem(layout, i);
    if (!l) return;

    // Something like quad tree should be used
    // to find collisions faster
    let hasCollisions;
    if (preventCollision) {
      const collisions = getAllCollisions(layout, { ...l, w, h }).filter(
        layoutItem => layoutItem.i !== l.i
      );
      hasCollisions = collisions.length > 0;

      // If we're colliding, we need adjust the placeholder.
      if (hasCollisions) {
        // adjust w && h to maximum allowed space
        let leastX = Infinity,
          leastY = Infinity;
        collisions.forEach(layoutItem => {
          if (layoutItem.x > l.x) leastX = Math.min(leastX, layoutItem.x);
          if (layoutItem.y > l.y) leastY = Math.min(leastY, layoutItem.y);
        });

        if (Number.isFinite(leastX)) l.w = leastX - l.x;
        if (Number.isFinite(leastY)) l.h = leastY - l.y;
      }
    }

    if (!hasCollisions) {
      // Set new width and height.
      l.w = w;
      l.h = h;
    }

    // Create placeholder element (display only)
    var placeholder = {
      w: l.w,
      h: l.h,
      x: l.x,
      y: l.y,
      static: true,
      i: i
    };

    this.props.onResize(layout, oldResizeItem, l, placeholder, e, node);
    // Re-compact the layout and set the drag placeholder.
    const newLayout = compact(layout, compactType(this.props), maxCols || cols);
    // const { oldLayout } = this.state;
    this.setState({
      layout: newLayout,
      activeDrag: placeholder
    });
    // this.onLayoutMaybeChanged(newLayout, oldLayout);
  }

  onResizeStop(
    i: string,
    { w, h }: ItemPosition,
    { e, node }: GridResizeEvent
  ) {
    const { layout, oldResizeItem } = this.state;
    const { cols, maxCols } = this.props;
    var l = getLayoutItem(layout, i);

    this.props.onResizeStop(layout, oldResizeItem, l, null, e, node);

    // Set state
    const newLayout = compact(layout, compactType(this.props), maxCols || cols);
    const { oldLayout } = this.state;
    this.setState({
      activeDrag: null,
      layout: newLayout,
      oldResizeItem: null,
      oldLayout: null
    });
    this.onLayoutMaybeChanged(newLayout, oldLayout);
  }

  /**
   * Create a placeholder object.
   * @return {Element} Placeholder div.
   */
  placeholder(): React.ReactNode | null {
    const { activeDrag } = this.state;
    if (!activeDrag) return null;
    const {
      width,
      cols,
      maxCols,
      margin,
      containerPadding,
      rowHeight,
      maxRows,
      useCSSTransforms,
      transformScale,
      resizableHandles
    } = this.props;

    // {...this.state.activeDrag} is pretty slow, actually
    return (
      <GridItem
        w={activeDrag.w}
        h={activeDrag.h}
        x={activeDrag.x}
        y={activeDrag.y}
        i={activeDrag.i}
        className="react-grid-placeholder"
        containerWidth={width}
        cols={cols}
        margin={margin}
        containerPadding={containerPadding || margin}
        maxRows={maxRows}
        maxCols={maxCols}
        rowHeight={rowHeight}
        isDraggable={false}
        isResizable={false}
        useCSSTransforms={useCSSTransforms}
        transformScale={transformScale}
        resizeHandles={resizableHandles}
      >
        <div />
      </GridItem>
    );
  }

  /**
   * Given a grid item, set its style attributes & surround in a <Draggable>.
   * @param  {Element} child React element.
   * @return {Element}       Element wrapped in draggable and properly placed.
   */
  processGridItem(
    child: React.ReactNode,
    isDroppingItem?: boolean
  ): React.ReactNode | null {
    if (!child || !(child as any).key) return;
    const l = getLayoutItem(this.state.layout, String((child as any).key));
    if (!l) return null;
    const {
      width,
      cols,
      margin,
      containerPadding,
      rowHeight,
      maxRows,
      maxCols,
      resizableHandles,
      isDraggable,
      isResizable,
      useCSSTransforms,
      transformScale,
      draggableCancel,
      draggableHandle
    } = this.props;
    const { mounted, droppingPosition } = this.state;

    // Parse 'static'. Any properties defined directly on the grid item will take precedence.
    const draggable = Boolean(
      !l.static && isDraggable && (l.isDraggable || l.isDraggable == null)
    );
    const resizable = Boolean(
      !l.static && isResizable && (l.isResizable || l.isResizable == null)
    );

    return (
      <GridItem
        containerWidth={width}
        cols={cols}
        margin={margin}
        containerPadding={containerPadding || margin}
        maxRows={maxRows}
        maxCols={maxCols}
        rowHeight={rowHeight}
        cancel={draggableCancel}
        handle={draggableHandle}
        resizeHandles={resizableHandles}
        onDragStop={this.onDragStop}
        onDragStart={this.onDragStart}
        onDrag={this.onDrag}
        onResizeStart={this.onResizeStart}
        onResize={this.onResize}
        onResizeStop={this.onResizeStop}
        isDraggable={draggable}
        isResizable={resizable}
        useCSSTransforms={useCSSTransforms && mounted}
        usePercentages={!mounted}
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
        static={l.static}
        droppingPosition={isDroppingItem ? droppingPosition : undefined}
      >
        {child}
      </GridItem>
    );
  }

  onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // we should ignore events from layout's children in Firefox
    // to avoid unpredictable jumping of a dropping placeholder

    if (
      isFirefox &&
      // !e.nativeEvent.target.className.includes(layoutClassName)
      e.currentTarget.className.includes(layoutClassName)
    ) {
      return false;
    }

    const { droppingItem } = this.props;
    const { layout } = this.state;
    const { clientX, clientY } = e.nativeEvent;
    const droppingPosition = { x: clientX, y: clientY, e };
    const droppingDOMNode = React.createElement('div', {
      key: droppingItem.i
    });

    if (!this.state.droppingDOMNode) {
      this.setState({
        droppingDOMNode: droppingDOMNode,
        droppingPosition,
        layout: [
          ...layout,
          {
            ...droppingItem,
            x: 0,
            y: 0,
            static: false,
            isDraggable: true
          }
        ]
      });
    } else if (this.state.droppingPosition) {
      const shouldUpdatePosition =
        this.state.droppingPosition.x != clientX ||
        this.state.droppingPosition.y != clientY;
      shouldUpdatePosition && this.setState({ droppingPosition });
    }

    e.stopPropagation();
    e.preventDefault();
  };

  removeDroppingPlaceholder = () => {
    const { droppingItem, cols, maxCols } = this.props;
    const { layout } = this.state;

    const newLayout = compact(
      layout.filter(l => l.i !== droppingItem.i),
      compactType(this.props),
      maxCols || cols
    );

    this.setState({
      layout: newLayout,
      droppingDOMNode: null,
      activeDrag: null,
      droppingPosition: undefined
    });
  };

  onDragLeave = () => {
    this.dragEnterCounter--;

    // onDragLeave can be triggered on each layout's child.
    // But we know that count of dragEnter and dragLeave events
    // will be balanced after leaving the layout's container
    // so we can increase and decrease count of dragEnter and
    // when it'll be equal to 0 we'll remove the placeholder
    if (this.dragEnterCounter === 0) {
      this.removeDroppingPlaceholder();
    }
  };

  onDragEnter = () => {
    this.dragEnterCounter++;
  };

  onDrop = () => {
    const { droppingItem } = this.props;
    const { layout } = this.state;
    const { x, y, w, h } = layout.find(l => l.i === droppingItem.i) || {};

    // reset gragEnter counter on drop
    this.dragEnterCounter = 0;

    this.removeDroppingPlaceholder();

    this.props.onDrop({ x, y, w, h });
  };

  render() {
    const {
      className,
      style,
      isDroppable,
      width,
      cols,
      maxCols,
      rowHeight,
      margin,
      containerPadding,
      showGrid,
      gridColor
    } = this.props;
    const mergedClassName = classNames(layoutClassName, className);
    const mergedStyle = {
      height: this.containerHeight(),
      ...style
    };
    const paddingX = (containerPadding && containerPadding[0]) || margin[0];
    const paddingY = (containerPadding && containerPadding[1]) || margin[1];
    const columns = new Array(maxCols).fill('');
    const columnWidth = (width - 2 * paddingX - margin[0] * (cols - 1)) / cols;
    const rowWidth =
      maxCols * columnWidth + margin[0] * (maxCols - 1) + 2 * paddingX;
    const nbRow = bottom(this.state.layout);
    const rows = new Array(nbRow).fill('');

    return (
      <div
        className={mergedClassName}
        style={mergedStyle}
        onDrop={isDroppable ? this.onDrop : noop}
        onDragLeave={isDroppable ? this.onDragLeave : noop}
        onDragEnter={isDroppable ? this.onDragEnter : noop}
        onDragOver={isDroppable ? this.onDragOver : noop}
      >
        {showGrid && (
          <div className="react-grid-layout-grid">
            <div
              className="react-grid-layout-columns"
              style={{ height: mergedStyle.height }}
            >
              {columns.map((column, i) => {
                return (
                  <div
                    key={i}
                    className="react-grid-layout-column"
                    style={{
                      width: columnWidth,
                      marginLeft: i == 0 ? paddingX : margin[0],
                      borderLeft: '1px solid ' + gridColor,
                      borderRight: '1px solid ' + gridColor
                    }}
                  />
                );
              })}
            </div>
            <div className="react-grid-layout-rows" style={{ width: rowWidth }}>
              {rows.map((row, i) => {
                return (
                  <div
                    key={i}
                    className="react-grid-layout-row"
                    style={{
                      height: rowHeight,
                      marginTop: i == 0 ? paddingY : margin[1],
                      borderTop: '1px solid ' + gridColor,
                      borderBottom: '1px solid ' + gridColor
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
        {React.Children.map(this.props.children, child =>
          this.processGridItem(child)
        )}
        {isDroppable &&
          this.state.droppingDOMNode &&
          this.processGridItem(this.state.droppingDOMNode, true)}
        {this.placeholder()}
      </div>
    );
  }
}
