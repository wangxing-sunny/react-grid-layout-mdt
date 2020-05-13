import React from 'react';
import ReactDOM from 'react-dom';
import App from './index';
import whyDidYouRender from '@welldone-software/why-did-you-render';

whyDidYouRender(React, { trackAllPureComponents: true});

ReactDOM.render(<App />, document.getElementById('root'));
