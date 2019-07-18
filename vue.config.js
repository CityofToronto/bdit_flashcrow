const fs = require('fs');
const path = require('path');

const key = fs.readFileSync(path.join(__dirname, 'ssl', 'localhost.key'));
const cert = fs.readFileSync(path.join(__dirname, 'ssl', 'localhost.crt'));

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
    },
    public: 'localhost:8080',
    watchOptions: {
      poll: 1000,
    },
  },
};
