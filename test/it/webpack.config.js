const path = require('path');

module.exports = {
  module: {
    loaders: [{
      test: /\.ts(x?)$/,
      loader: 'ts-loader'
    }]
  },
  resolve: {
    root: __dirname,
    extensions: ['', '.ts', '.js', '.json'],
    alias: {
      'node-forge': path.join(__dirname, '..', '..', 'js','forge.min.js')
    }
  },
  resolveLoader: {
    modulesDirectories: [path.join(__dirname, '..', '..', 'node_modules')]
  },
  node: {
    Buffer: true
  },
  output: {
    path: path.join(__dirname, '..', '..', 'build', 'test'),
    filename: 'test-all.js'
  },
  entry: [
    path.join(__dirname, 'test-all.ts')
  ],
  ts: {
    configFileName: path.join(__dirname, 'tsconfig.json')
  }

};
