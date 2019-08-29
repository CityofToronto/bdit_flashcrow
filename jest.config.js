process.env.VUE_CLI_BABEL_TARGET_NODE = true;
process.env.VUE_CLI_BABEL_TRANSPILE_MODULES = true;

let { TEST_DIR } = process.env;
if (TEST_DIR === undefined) {
  TEST_DIR = '**';
}

module.exports = {
  collectCoverageFrom: [
    'lib/db/**/*.js',
    'src/lib/**/*.js',
    '!**/node_modules/**',
  ],
  coverageDirectory: '<rootDir>/tests/coverage',
  coverageThreshold: {
    'lib/db': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    'src/lib/': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
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
    '^@/(.*)$': '<rootDir>/src/$1',
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
