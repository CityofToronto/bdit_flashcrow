import fs from 'fs';
import util from 'util';

import { reviver } from '@/lib/JsonUtils';

const readFile = util.promisify(fs.readFile);

async function loadJson(path) {
  const json = await readFile(path, 'utf8');
  return JSON.parse(json, reviver);
}

function loadJsonSync(path) {
  const json = fs.readFileSync(path, 'utf8');
  return JSON.parse(json, reviver);
}

const TestDataLoader = {
  loadJson,
  loadJsonSync,
};

export {
  TestDataLoader as default,
  loadJson,
  loadJsonSync,
};
