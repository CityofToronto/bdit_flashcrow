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

export default {
  formatCountLocationDescription,
};
