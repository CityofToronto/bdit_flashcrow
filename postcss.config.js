module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-nested': {},
    'postcss-custom-properties': {
      importFrom: 'src/components/tds/tds.css',
      preserve: false,
    },
  },
};
