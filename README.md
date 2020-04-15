# React-Grid-Layout-Mtd

## About this Project

Compile command:

```bash
yarn prepare
```

Then you can run

```bash
yarn build
```

to build umd, or run

```bash
yarn build-example
```

to build example files, or run

```bash
yarn view-example
```

to take a look at what can this package do, or run

```bash
yarn dev
```

to test a single example.

## Installation

Install the React-Grid-Layout-Mtd

```bash
npm install react-grid-layout-mdt
```

or

```bash
yarn add react-grid-layout-mdt
```

## Usage

```js
import GridLayout from 'react-grid-layout-mdt';

class MyFirstGrid extends React.Component {
  render() {
    // layout is an array of objects, see the demo for more complete usage
    var layout = [
      {i: 'a', x: 0, y: 0, w: 1, h: 2, static: true},
      {i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4},
      {i: 'c', x: 4, y: 0, w: 1, h: 2}
    ];
    return (
      <GridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={1200}>
        <div key="a">a</div>
        <div key="b">b</div>
        <div key="c">c</div>
      </GridLayout>
    )
  }
}
```

You may also choose to set layout properties directly on the children:

```js
import GridLayout from 'react-grid-layout-mdt';

class MyFirstGrid extends React.Component {
  render() {
    return (
      <GridLayout className="layout" cols={12} rowHeight={30} width={1200}>
        <div key="a" data-grid={{x: 0, y: 0, w: 1, h: 2, static: true}}>a</div>
        <div key="b" data-grid={{x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4}}>b</div>
        <div key="c" data-grid={{x: 4, y: 0, w: 1, h: 2}}>c</div>
      </GridLayout>
    )
  }
}
```

### Usage without Browserify/Webpack

A module usable in a `<script>` tag is included [here](/dist/react-grid-layout-mdt.min.js). It uses a UMD shim and
excludes `React`, so it must be otherwise available in your application, either via RequireJS or on `window.React`.

### Responsive Usage

To make RGL responsive, use the `<ResponsiveReactGridLayout>` element:

```js
import { Responsive as ResponsiveGridLayout } from 'react-grid-layout-mdt';

class MyResponsiveGrid extends React.Component {
  render() {
    // {lg: layout1, md: layout2, ...}
    var layouts = getLayoutsFromSomewhere();
    return (
      <ResponsiveGridLayout className="layout" layouts={layouts}
        breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
        cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}>
        <div key="1">1</div>
        <div key="2">2</div>
        <div key="3">3</div>
      </ResponsiveGridLayout>
    )
  }
}
```

When in responsive mode, you should supply at least one breakpoint via the `layouts` property.

When using `layouts`, it is best to supply as many breakpoints as possible, especially the largest one.
If the largest is provided, RGL will attempt to interpolate the rest.

You will also need to provide a `width`, when using `<ResponsiveReactGridLayout>` it is suggested you use the HOC
`WidthProvider` as per the instructions below.

For the time being, it is not possible to supply responsive mappings via the `data-grid` property on individual
items, but that is coming soon.

### Providing Grid Width

Both `<ResponsiveReactGridLayout>` and `<ReactGridLayout>` take `width` to calculate
positions on drag events. In simple cases a HOC `WidthProvider` can be used to automatically determine
width upon initialization and window resize events.

```js
import { Responsive, WidthProvider } from 'react-grid-layout-mdt';

const ResponsiveGridLayout = WidthProvider(Responsive);

class MyResponsiveGrid extends React.Component {
  render() {
    // {lg: layout1, md: layout2, ...}
    var layouts = getLayoutsFromSomewhere();
    return (
      <ResponsiveGridLayout className="layout" layouts={layouts}
        breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
        cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}>
        <div key="1">1</div>
        <div key="2">2</div>
        <div key="3">3</div>
      </ResponsiveGridLayout>
    )
  }
}
```

### Adapative Usage
When your container has a fixed width or height, you can use `<AdaptiveReactGridLayout>` to make the layout 
always adapt to the container.

```js
import { Adaptive } from 'react-grid-layout-mdt';

class MyAdaptiveGrid extends React.Component {
  render() {
    var layout = getLayoutsFromSomewhere();
    return (
      <Adaptive className="layout" layout={layout}
        maxCols={8} rowsAdaptable={true}>
        <div key="1">1</div>
        <div key="2">2</div>
        <div key="3">3</div>
      </Adaptive>
    )
  }
}
```

### Grid Layout Props

RGL supports the following properties (see the source for the final word on this):

```js
//
// Basic props
//

// This allows setting the initial width on the server side.
// This is required unless using the HOC <WidthProvider> or similar
width: number,

// If true, the container height swells and contracts to fit contents
autoSize?: boolean = true,

// Number of columns in this layout.
cols?: number = 12,
maxCols?: number = 12,

// A CSS selector for tags that will not be draggable.
// For example: draggableCancel:'.MyNonDraggableAreaClassName'
// If you forget the leading . it will not work.
draggableCancel?: string = '',

// A CSS selector for tags that will act as the draggable handle.
// For example: draggableHandle:'.MyDragHandleClassName'
// If you forget the leading . it will not work.
draggableHandle?: string = '',

// If true, the layout will compact vertically
verticalCompact?: boolean = true,

// Compaction type.
compactType?: ('vertical' | 'horizontal') = 'vertical';

// Layout is an array of object with the format:
// {x: number, y: number, w: number, h: number}
// The index into the layout must match the key used on each item component.
// If you choose to use custom keys, you can specify that key in the layout
// array objects like so:
// {i: string, x: number, y: number, w: number, h: number}
layout?: array = null, // If not provided, use data-grid props on children

// Margin between items [x, y] in px.
margin?: [number, number] = [5, 5],

// Padding inside the container [x, y] in px
containerPadding?: [number, number] = margin,

// Rows have a static height, but you can change this based on breakpoints
// if you like.
rowHeight?: number = 150,

// Configuration of a dropping element. Dropping element is a "virtual" element 
// which appears when you drag over some element from outside.
// It can be changed by passing specific parameters:
//  i - id of an element
//  w - width of an element
//  h - height of an element
droppingItem?: { i: string, w: number, h: number }

//
// Flags
//
isDraggable?: boolean = true,
isResizable?: boolean = true,
// Uses CSS3 translate() instead of position top/left.
// This makes about 6x faster paint performance
useCSSTransforms?: boolean = true,
// If parent DOM node of ResponsiveReactGridLayout or ReactGridLayout has "transform: scale(n)" css property,
// we should set scale coefficient to avoid render artefacts while dragging.
transformScale?: number = 1,

// If true, grid items won't change position when being
// dragged over.
preventCollision?: boolean = false;

// If true, droppable elements (with `draggable={true}` attribute) 
// can be dropped on the grid. It triggers "onDrop" callback
// with position and event object as parameters. 
// It can be useful for dropping an element in a specific position
//
// NOTE: In case of using Firefox you should add
// `onDragStart={e => e.dataTransfer.setData('text/plain', '')}` attribute
// along with `draggable={true}` otherwise this feature will work incorrect.
// onDragStart attribute is required for Firefox for a dragging initialization
// @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
isDroppable?: boolean = false

//
// Callbacks
//

// Callback so you can save the layout.
// Calls back with (currentLayout) after every drag or resize stop.
onLayoutChange: (layout: Layout) => void,

//
// All callbacks below have signature (layout, oldItem, newItem, placeholder, e, element).
// 'start' and 'stop' callbacks pass `undefined` for 'placeholder'.
//
type ItemCallback = (layout: Layout, oldItem: LayoutItem, newItem: LayoutItem,
                     placeholder: LayoutItem, e: MouseEvent, element: HTMLElement) => void;

// Calls when drag starts.
onDragStart: ItemCallback,
// Calls on each drag movement.
onDrag: ItemCallback,
// Calls when drag is complete.
onDragStop: ItemCallback,
// Calls when resize starts.
onResizeStart: ItemCallback,
// Calls when resize movement happens.
onResize: ItemCallback,
// Calls when resize is complete.
onResizeStop: ItemCallback,
// Calls when some element has been dropped
onDrop: (elemParams: { x: number, y: number, e: Event }) => void
```

### Responsive Grid Layout Props

The responsive grid layout can be used instead. It supports all of the props above, excepting `layout`.
The new properties and changes are:

```js
// {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
// Breakpoint names are arbitrary but must match in the cols and layouts objects.
breakpoints?: Object = {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0},

// # of cols. This is a breakpoint -> cols map, e.g. {lg: 12, md: 10, ...}
cols?: Object = {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},


// margin (in pixels). Can be specified either as horizontal and vertical margin, e.g. `[10, 10]` or as a breakpoint -> margin map, e.g. `{lg: [10, 10], md: [10, 10], ...}.
margin: [number, number] | {[breakpoint: $Keys<breakpoints>]: [number, number]}


// containerPadding (in pixels). Can be specified either as horizontal and vertical padding, e.g. `[10, 10]` or as a breakpoint -> containerPadding map, e.g. `{lg: [10, 10], md: [10, 10], ...}.
containerPadding: [number, number] | {[breakpoint: $Keys<breakpoints>]: [number, number]}


// layouts is an object mapping breakpoints to layouts.
// e.g. {lg: Layout, md: Layout, ...}
layouts: {[key: $Keys<breakpoints>]: Layout}

//
// Callbacks
//

// Calls back with breakpoint and new # cols
onBreakpointChange: (newBreakpoint: string, newCols: number) => void,

// Callback so you can save the layout.
// AllLayouts are keyed by breakpoint.
onLayoutChange: (currentLayout: Layout, allLayouts: {[key: $Keys<breakpoints>]: Layout}) => void,

// Callback when the width changes, so you can modify the layout as needed.
onWidthChange: (containerWidth: number, margin: [number, number], cols: number, containerPadding: [number, number]) => void;

```

### Responsive Grid Layout Props

```js
{
  // Vertical adatable.
  rowsAdaptable?: boolean = false,
  // Whether every grid has same width & height.
  squareGrid?: boolean = fasle
}
```

### Grid Item Props

```js
{

  // A string corresponding to the component key
  i: string,

  // These are all in grid units, not pixels
  x: number,
  y: number,
  w: number,
  h: number,
  minW?: number = 0,
  maxW?: number = Infinity,
  minH?: number = 0,
  maxH?: number = Infinity,

  // If true, equal to `isDraggable: false, isResizable: false`.
  static?: boolean = false,
  // If false, will not be draggable. Overrides `static`.
  isDraggable?: boolean = true,
  // If false, will not be resizable. Overrides `static`.
  isResizable?: boolean = true
}
```

## TODO List

- [x] Basic grid layout
- [x] Fluid grid layout
- [x] Grid packing
- [x] Draggable grid items
- [x] Live grid packing while dragging
- [x] Resizable grid items
- [x] Layouts per responsive breakpoint
- [x] Define grid attributes on children themselves (`data-grid` key)
- [x] Static elements
- [x] Persistent id per item for predictable localstorage restores, even when # items changes
- [x] Min/max w/h per item
- [x] Configurable show grid-lines
- [ ] Resizable handles on other corners
- [ ] Configurable w/h per breakpoint
