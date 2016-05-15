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
      'ng-new-router': path.join(__dirname, 'js', 'router.es5.js'),
      'node-forge': path.join(__dirname, 'js', 'forge.min.js')
    }
  },
  resolveLoader: {
    modulesDirectories: [path.join(__dirname, 'node_modules')]
  },
  node: {
    Buffer: true
  },
  output: {
    path: path.join(__dirname, 'build', 'app'),
    filename: 'cryptoCalc.js'
  },
  entry: [
    path.join(__dirname, 'app', 'cryptoCalcModule.ts')
  ],
  ts: {
    configFileName: path.join(__dirname, 'tsconfig.json')
  }

};
