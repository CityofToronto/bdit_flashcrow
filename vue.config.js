const fs = require('fs');
const path = require('path');

const key = fs.readFileSync(path.join(__dirname, 'ssl', 'localhost.key'));
const cert = fs.readFileSync(path.join(__dirname, 'ssl', 'localhost.crt'));

module.exports = {
  baseUrl: '/flashcrow/',
  devServer: {
    host: 'localhost',
    https: { key, cert },
    proxy: {
      '/flashcrow/api': {
        target: 'https://localhost:8081/',
        pathRewrite: {
          '^/flashcrow/api': '',
        },
      },
    },
  },
};
