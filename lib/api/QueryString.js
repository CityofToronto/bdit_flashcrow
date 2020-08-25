/**
 * Query string generation utilities.
 */
class QueryString {
  /**
   * Encodes the given key-value pair as part of a URL query string.  These are
   * concatenated by `getQueryString()` below.
   *
   * @param {string} key - key to be encoded
   * @param {*} value - value to be encoded
   * @returns {string} URL-encoded key-value pair
   */
  static keyValuePart(key, value) {
    const keyEncoded = encodeURIComponent(key);
    const valueEncoded = encodeURIComponent(value);
    return `${keyEncoded}=${valueEncoded}`;
  }

  /**
   * Encodes an object mapping keys to values into a query string using `getQueryStringPart()`.
   *
   * Any key with an array of values is encoded as multiple key-value pairs, one for each value
   * in the array.
   *
   * @param {Object} params - key-value pairs to be encoded
   * @returns {string} URL-encoded query string, without the leading `?`
   */
  static get(params) {
    const qsParts = [];
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((subValue) => {
          const qsPart = QueryString.keyValuePart(key, subValue);
          qsParts.push(qsPart);
        });
      } else if (value !== null) {
        const qsPart = QueryString.keyValuePart(key, value);
        qsParts.push(qsPart);
      }
    });
    return qsParts.join('&');
  }
}

export default QueryString;
