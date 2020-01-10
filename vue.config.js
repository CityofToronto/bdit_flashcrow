const fs = require('fs');
const path = require('path');

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const { ENV, DEV } = require('./lib/config/Env');

const key = fs.readFileSync(path.join(__dirname, 'ssl', 'localhost.key'));
const cert = fs.readFileSync(path.join(__dirname, 'ssl', 'localhost.crt'));

/**
 * Vue configuration.  Note that this is the only file in CommonJS module style;
 * `vue-cli-service` balks at running ES6 modules.
 */
const vueConfig = {
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
      ignored: /node_modules/,
      poll: 2000,
    },
  },
  // see https://medium.com/@kenneth_chau/speeding-up-webpack-typescript-incremental-builds-by-7x-3912ba4c1d15
  // see https://cli.vuejs.org/guide/webpack.html#simple-configuration
  configureWebpack: {
    entry: './web/main.js',
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    },
    output: {
      pathinfo: false,
    },
    plugins: [
      // see https://medium.com/js-dojo/how-to-reduce-your-vue-js-bundle-size-with-webpack-3145bf5019b7
      new BundleAnalyzerPlugin({
        analyzerMode: ENV === DEV ? 'server' : 'disabled',
        analyzerHost: '0.0.0.0',
        analyzerPort: 9081,
      }),
    ],
    resolve: {
      alias: {
        '@': __dirname,
      },
    },
  },
  transpileDependencies: [
    'vuetify',
  ],
};

module.exports = vueConfig;
