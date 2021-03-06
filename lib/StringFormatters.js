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
 *
 * @param {?string} name (e.g. Lawrence)
 * @param {?string} type (e.g. Ave)
 * @param {?string} dir (e.g. W)
 * @returns {string} combined street name (e.g. Lawrence Ave W), or `null`
 * if `name` is empty
 */
function formatCombinedStreet(name, type, dir) {
  if (!name) {
    return null;
  }
  const parts = [name];
  if (type) {
    parts.push(type);
    if (dir) {
      parts.push(dir);
    }
  }
  const combinedStreet = parts.map(part => part.trim())
    .join(' ')
    .trim();
  if (combinedStreet === '') {
    return null;
  }
  return combinedStreet;
}

/**
 * Normalizes location descriptions.
 *
 * @param {string} description - raw description from centreline / FLOW
 * @returns {string} normalized description
 */
function formatCountLocationDescription(description) {
  return description
    .toLowerCase()
    .split(/\s+/g)
    .map((part) => {
      let normalizedPart = part.trim();
      if (normalizedPart === '') {
        return '';
      }
      if (CORRECTIONS[normalizedPart]) {
        normalizedPart = CORRECTIONS[normalizedPart];
      }
      if (LOWERCASE_WORDS.includes(normalizedPart)) {
        return normalizedPart;
      }
      for (let i = 0; i < UPPERCASE_WORDS.length; i += 1) {
        const word = UPPERCASE_WORDS[i];
        if (normalizedPart.indexOf(word) !== -1) {
          return normalizedPart.replace(word, word.toUpperCase());
        }
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
 * @param {number} duration - duration, in hours
 * @returns {string} human-readable duration
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

function formatOxfordCommaList(parts) {
  const n = parts.length;
  const maybeAndParts = parts.map((part, i) => {
    if (i === n - 1 && n > 1) {
      return `and ${part}`;
    }
    return part;
  });
  const separator = n <= 2 ? ' ' : ', ';
  return maybeAndParts.join(separator);
}

function formatUsername(user) {
  const { uniqueName } = user;
  const i = uniqueName.indexOf('\\');
  if (i === -1) {
    return uniqueName;
  }
  return uniqueName.slice(i + 1);
}

const StringFormatters = {
  formatCombinedStreet,
  formatCountLocationDescription,
  formatDuration,
  formatOxfordCommaList,
  formatUsername,
};

export {
  StringFormatters as default,
  formatCombinedStreet,
  formatCountLocationDescription,
  formatDuration,
  formatOxfordCommaList,
  formatUsername,
};
