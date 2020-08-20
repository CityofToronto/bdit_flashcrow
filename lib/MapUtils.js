function mapBy(xs, key) {
  return new Map(xs.map(x => [key(x), x]));
}

function setdefault(map, key, defaultValue) {
  if (map.has(key)) {
    return map.get(key);
  }
  map.set(key, defaultValue);
  return defaultValue;
}

const MapUtils = {
  mapBy,
  setdefault,
};

export {
  MapUtils as default,
  mapBy,
  setdefault,
};
