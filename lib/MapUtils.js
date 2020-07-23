function setdefault(map, key, defaultValue) {
  if (map.has(key)) {
    return map.get(key);
  }
  map.set(key, defaultValue);
  return defaultValue;
}

const MapUtils = {
  setdefault,
};

export {
  MapUtils as default,
  setdefault,
};
