import React from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout-mdt";

const ReactGridLayout = WidthProvider(RGL);

export default class BasicLayout extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    items: 20,
    rowHeight: 30,
    onLayoutChange: function() {},
    cols: 12
  };

  constructor(props) {
    super(props);

    const layout = this.generateLayout();
    this.state = { layout };
  }

  generateDOM() {
    return _.map(_.range(this.props.items), function(i) {
      return (
        <div key={i}>
          <span className="text">{i}</span>
        </div>
      );
    });
  }

  generateLayout() {
    const p = this.props;
    return _.map(new Array(p.items), function(item, i) {
      const y = _.result(p, "y") || Math.ceil(Math.random() * 4) + 1;
      return {
        x: (i * 2) % 12,
        y: Math.floor(i / 6) * y,
        w: 2,
        h: y,
        i: i.toString()
      };
    });
  }

  onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
  }

  render() {
    /* return (
      <ReactGridLayout
        layout={this.state.layout}
        onLayoutChange={this.onLayoutChange}
        {...this.props}
      >
        {this.generateDOM()}
      </ReactGridLayout>
    ); */
    const style = {
      position:'absolute',
      top:'50%',
      left:'50%',
      width:375,
      height:550,
      transform:'translate(-50%, -50%)',
      borderRadius:20,
      boxSizing:'content-box',
      overflowX:'hidden',
      overflowY: 'auto'
    };
    return (
      <div style={{height:600,position:'relative',display:'flex'}}>
        <div style={{width:100}}></div>
        <div style={{position:'relative',flex:'1 1'}}>
          <div style={{position:'absolute',top:0,left:0,bottom:0,right:0}}>
            <div style={style}>
              <ReactGridLayout
                layout={this.state.layout}
                onLayoutChange={this.onLayoutChange}
                {...this.props}
              >
                {this.generateDOM()}
              </ReactGridLayout>
            </div>
          </div>
        </div>
        <div style={{width:100}}></div>
      </div>
    )
  }
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(BasicLayout));
}
