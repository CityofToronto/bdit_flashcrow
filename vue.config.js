const fs = require('fs');
const path = require('path');

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const packageJson = require('./package.json');
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
       * This header is slightly different from that used in our production `nginx` configs
       * in a few ways:
       *
       * - we allow `move.intra.dev-toronto.ca` as a `connect-src` to load map assets
       *   from the dev environment in development, but load these assets from `'self'` in
       *   production;
       * - we allow `'unsafe-eval'` as a `script-src` in development, but load scripts from
       *   `self` in production;
       * - we allow `'unsafe-inline'` as a `style-src` in development, but use a nonce in
       *   production.
       */
      'Content-Security-Policy': "default-src 'self'; connect-src 'self' basemaps.arcgis.com dc.oracleinfinity.io gis.toronto.ca move.intra.dev-toronto.ca; img-src 'self' data:; object-src 'none'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:",
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
  // see https://stackoverflow.com/questions/53285704/set-viewport-meta-tag-in-vue-js-application
  chainWebpack: (config) => {
    config
      .plugin('html')
      .tap((args) => {
        const [htmlHead, ...restArgs] = args;
        htmlHead.templateParameters = {
          VERSION: packageJson.version,
        };
        return [htmlHead, ...restArgs];
      });
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
