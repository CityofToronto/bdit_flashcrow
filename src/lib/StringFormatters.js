const CORRECTIONS = {
  nb: 'n/b',
  eb: 'e/b',
  sb: 's/b',
  wb: 'w/b',
};
const LOWERCASE_WORDS = [
  'and',
  'at',
  'of',
];
const UPPERCASE_WORDS = [
  'n/b',
  'e/b',
  's/b',
  'w/b',
  'px',
];

/**
 * Normalizes location descriptions.
 *
 * @param {String} description - raw description from centreline / FLOW
 * @returns {String} normalized description
 */
function formatCountLocationDescription(description) {
  return description
    .toLowerCase()
    .match(/\b(\w|\/)+\b/g)
    .map((part) => {
      let normalizedPart = part;
      if (CORRECTIONS[normalizedPart]) {
        normalizedPart = CORRECTIONS[normalizedPart];
      }
      if (LOWERCASE_WORDS.includes(normalizedPart)) {
        return normalizedPart;
      }
      if (UPPERCASE_WORDS.includes(normalizedPart)) {
        return normalizedPart.toUpperCase();
      }
      return normalizedPart[0].toUpperCase() + normalizedPart.slice(1);
    })
    .join(' ');
}

/**
 * Formats the given duration in hours in a human-readable manner.  This is primarily
 * used for automatic traffic study durations, especially in the "Request Data" user
 * flow.
 *
 * @param {Number} duration - duration, in hours
 * @returns {String} human-readable duration
 */
function formatDuration(duration) {
  const days = duration / 24;
  if (days === 1) {
    return '1 day';
  }
  if (days === 7) {
    return '1 week';
  }
  return `${days} days`;
}

export default {
  formatCountLocationDescription,
  formatDuration,
};
