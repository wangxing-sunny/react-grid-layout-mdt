import 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import DevLayout from './examples/17-adaptive-layout.jsx';
import makeLayout from './test-hook';

const Layout = makeLayout(DevLayout);

export default hot(Layout);
