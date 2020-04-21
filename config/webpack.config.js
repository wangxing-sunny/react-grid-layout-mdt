const path = require('path');

module.exports = {
  entry: './build/index.js',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'main.js',
    libraryTarget: 'umd',
    globalObject: 'this',
    library: 'RGL'
  },
  mode: 'development'
  // target: 'web'
};
