import DateTime from '@/lib/time/DateTime';

const TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{3})?$/;

function reviver(key, value) {
  if (typeof value === 'string' && TIMESTAMP_REGEX.test(value)) {
    return DateTime.fromJSON(value);
  }
  return value;
}

const JsonUtils = {
  reviver,
};

export {
  JsonUtils as default,
  reviver,
};
