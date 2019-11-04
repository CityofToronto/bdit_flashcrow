import fs from 'fs';

import { reviver } from '@/lib/JsonUtils';

/**
 * Load data from file, "reviving" `DateTime` instances in the process.
 *
 * @param {string} path - path to JSON file
 * @returns {*} parsed JSON, using `JsonUtils.reviver` to "revive" `DateTime` instances
 */
function loadJsonSync(path) {
  const json = fs.readFileSync(path, 'utf8');
  return JSON.parse(json, reviver);
}


/**
 * Namespace for test data loading utilities.
 *
 * @namespace
 */
const TestDataLoader = {
  loadJsonSync,
};

export {
  TestDataLoader as default,
  loadJsonSync,
};
