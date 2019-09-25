const fs = require('fs');
const path = require('path');

const key = fs.readFileSync(path.join(__dirname, 'ssl', 'localhost.key'));
const cert = fs.readFileSync(path.join(__dirname, 'ssl', 'localhost.crt'));

/**
 * Vue configuration.  Note that this is the only file in CommonJS module style;
 * `vue-cli-service` balks at running ES6 modules.
 */
module.exports = {
  publicPath: '/',
  devServer: {
    historyApiFallback: true,
    host: '0.0.0.0',
    https: { key, cert },
    proxy: {
      '/api': {
        target: 'https://localhost:8081/',
        pathRewrite: {
          '^/api': '',
        },
      },
      '/reporter': {
        target: 'https://localhost:8082/',
        pathRewrite: {
          '^/reporter': '',
        },
      },
    },
    public: 'localhost:8080',
    watchOptions: {
      poll: 1000,
    },
  },
};
