module.exports = {
  baseUrl: '/flashcrow/',
  devServer: {
    proxy: {
      '/flashcrow/api': {
        target: 'http://localhost:8081/',
        pathRewrite: {
          '^/flashcrow/api': '',
        },
      },
    },
  },
};
