import React from "react";
import _ from "lodash";
import { Adaptive } from "react-grid-layout-mdt";

export default class AdaptiveLayout extends React.Component {
  static defaultProps = {
    className: "layout",
    maxCols: 12,
    cols: 12
  };

  state = {
    mounted: false,
    layout: generateLayout()
  };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  generateDOM() {
    return _.map(this.state.layout, function(l, i) {
      return (
        <div key={i.toString()} className={l.static ? "static" : ""}>
          {l.static ? (
            <span
              className="text"
              title="This item is static and cannot be removed or resized."
            >
              Static - {i}
            </span>
          ) : (
            <span className="text">{i}</span>
          )}
        </div>
      );
    });
  }

  onLayoutChange = (layout) => {
    this.setState({
      layout
    })
  };

  onDrop = elemParams => {
    alert(`Element parameters: ${JSON.stringify(elemParams)}`);
  };

  render() {
    const child = this.generateDOM();
    return (
      <div style={{height:600,width:800}}>
        <Adaptive
          {...this.props}
          layout={this.state.layout}
          onLayoutChange={this.onLayoutChange}
          rowsAdatable={true}
          // onDrop={this.onDrop}
          // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
          // and set `measureBeforeMount={true}`.
          // useCSSTransforms={this.state.mounted}
        >
          {child}
        </Adaptive>
      </div>
    );
  }
}

function generateLayout() {
  const ret = _.map(_.range(0, 25), function(item, i) {
    var y = Math.ceil(Math.random() * 4) + 1;
    return {
      x: (_.random(0, 5) * 2) % 12,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: i.toString()
    };
  });
  return ret;
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(AdaptiveLayout));
}
