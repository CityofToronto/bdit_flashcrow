class ObjectUtils {
  static map(obj, fn) {
    const mappedObj = {};
    Object.entries(obj).forEach(([key, value]) => {
      mappedObj[key] = fn(value, key);
    });
    return mappedObj;
  }
}

export default ObjectUtils;
