process.env.VUE_CLI_BABEL_TARGET_NODE = true;
process.env.VUE_CLI_BABEL_TRANSPILE_MODULES = true;

let { TEST_DIR } = process.env;
if (TEST_DIR === undefined) {
  TEST_DIR = '**';
}

module.exports = {
  collectCoverageFrom: [
    'lib/**/*.js',
    '!**/node_modules/**',
  ],
  coverageDirectory: '<rootDir>/tests/coverage',
  coverageThreshold: {
    'lib/': {
      branches: 35,
      functions: 35,
      lines: 35,
      statements: 35,
    },
  },
  moduleFileExtensions: [
    'js',
    'json',
    'vue',
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFiles: [
    '<rootDir>/tests/unitSetup.js',
  ],
  snapshotSerializers: [
    'jest-serializer-vue',
  ],
  testMatch: [
    `**/tests/jest/${TEST_DIR}/*.spec.js`,
  ],
  testURL: 'https://localhost:8080/',
};
