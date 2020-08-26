/**
 * `ObjectUtils` contains general utilities for managing JavaScript objects.
 */
class ObjectUtils {
  /**
   *
   * @param {Object} obj - object to check
   * @returns {boolean} whether `obj` is an empty plain object
   */
  static isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  static map(obj, fn) {
    const mappedObj = {};
    Object.entries(obj).forEach(([key, value]) => {
      mappedObj[key] = fn(value, key);
    });
    return mappedObj;
  }
}

export default ObjectUtils;
