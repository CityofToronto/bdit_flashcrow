const webpack = require('webpack');

module.exports = {
  baseUrl: '/flashcrow/',
  devServer: {
    proxy: 'http://localhost:8081',
  },
};
