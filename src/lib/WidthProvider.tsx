import React, { useRef } from 'react';
import { BaseProps } from './ReactGridLayout';
import { bottom } from '../utils/baseUtils';

export interface WPProps {
  className?: string;
  measureBeforeMount: boolean;
  style?: object;
}

export interface WPState {
  width: number;
  rowHeight: number;
}

export interface ComposedProps extends BaseProps, WPProps {}
/*
 * A simple HOC that provides facility for listening to container resizes.
 */
export default function WidthProvider(
  ComposedComponent: React.ComponentType<BaseProps>
): React.ComponentType<ComposedProps> {
  return class WidthProvider extends React.Component<ComposedProps, WPState> {
    static defaultProps = {
      measureBeforeMount: false
    };

    state = {
      width: 1280,
      rowHeight: 0
    };

    mounted = false;

    componentDidMount() {
      this.mounted = true;

      window.addEventListener('resize', this.onWindowResize);
      // Call to properly set the breakpoint and resize the elements.
      // Note that if you're doing a full-width element, this can get a little wonky if a scrollbar
      // appears because of the grid. In that case, fire your own resize event, or set `overflow: scroll` on your body.
      this.onWindowResize();
    }

    componentWillUnmount() {
      this.mounted = false;
      window.removeEventListener('resize', this.onWindowResize);
    }

    onWindowResize = () => {
      if (!this.mounted) return;
      // eslint-disable-next-line react/no-find-dom-node
      const node = ReactDOM.findDOMNode(this);
      if (node instanceof HTMLElement) {
        const { layout } = this.props;
        this.setState({
          width: node.offsetWidth,
          rowHeight: node.offsetHeight / bottom(layout)
        });
      }
    };

    render() {
      const { measureBeforeMount, ...rest } = this.props;
      if (measureBeforeMount && !this.mounted) {
        return (
          <div className={this.props.className} style={this.props.style} />
        );
      }

      return <ComposedComponent {...rest} {...this.state} />;
    }
  };
}
