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
    headers: {
      /*
       * This header is slightly different from that used in production in two ways:
       *
       * - we allow `move.intra.dev-toronto.ca` as a `connect-src`, as we load several map assets
       *   from the dev environment in local development (but load them from `'self'` in
       *   production);
       * - we allow `'unsafe-eval'` as a `script-src`, as this is needed by Vue in development
       *   (but not in production).
       *
       * Note that these two changes are *not* present in our `nginx` configs.
       */
      'Content-Security-Policy': "default-src 'self'; connect-src 'self' basemaps.arcgis.com dc.oracleinfinity.io move.intra.dev-toronto.ca; img-src 'self' data:; object-src 'none'; script-src 'self' 'unsafe-eval'; style-src-elem 'self' 'unsafe-inline'; worker-src 'self' blob:",
    },
    historyApiFallback: true,
    host: '0.0.0.0',
    https: { key, cert },
    proxy: {
      '/api': {
        target: 'https://localhost:8100/',
        pathRewrite: {
          '^/api': '',
        },
      },
      '/reporter': {
        target: 'https://localhost:8200/',
        pathRewrite: {
          '^/reporter': '',
        },
      },
      '/scheduler': {
        target: 'https://localhost:8300/',
        pathRewrite: {
          '^/scheduler': '',
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
        analyzerPort: 9080,
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
