/**
 * Encodes the given key-value pair as part of a URL query string.  These are
 * concatenated by `getQueryString()` below.
 *
 * @param {String} key - key to be encoded
 * @param {*} value - value to be encoded
 * @returns {String} URL-encoded key-value pair
 */
function getQueryStringPart(key, value) {
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
 * @param {Object} data - key-value pairs to be encoded
 * @returns {String} URL-encoded query string, without the leading `?`
 */
function getQueryString(data) {
  const qsParts = [];
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((subValue) => {
        const qsPart = getQueryStringPart(key, subValue);
        qsParts.push(qsPart);
      });
    } else {
      const qsPart = getQueryStringPart(key, value);
      qsParts.push(qsPart);
    }
  });
  return qsParts.join('&');
}

/**
 * Builds the URL to be passed to `fetch()`.  For GET requests, this involves
 * using `getQueryString()` to URL-encode `apiOptions.data`.
 *
 * @param {String} url - path of API endpoint to call
 * @param {Object} apiOptions - options to be passed to `fetch()`
 * @returns {String} full URL to pass to `fetch()`
 */
function getFetchUrl(url, apiOptions) {
  let apiUrl = `/flashcrow/api${url}`;
  if (apiOptions.data && apiOptions.method === 'GET') {
    const qs = getQueryString(apiOptions.data);
    apiUrl = `${apiUrl}?${qs}`;
  }
  return apiUrl;
}

/**
 * Normalizes API options to be passed to `fetch()`.  For non-GET requests, this
 * involves setting the CSRF token and JSON-encoding data into the request body.
 *
 * @param {Object} options - options to be normalized
 * @returns {Object} normalized options
 */
function getFetchOptions(options) {
  const defaultOptions = {
    credentials: 'include',
    headers: {},
    method: 'GET',
  };
  const apiOptions = Object.assign(defaultOptions, options);
  const { csrf, data } = apiOptions;
  if (apiOptions.method !== 'GET') {
    if (csrf !== undefined) {
      apiOptions.headers['X-CSRF-Token'] = csrf;
    }
    if (data !== undefined) {
      apiOptions.headers['Content-Type'] = 'application/json';
      apiOptions.body = JSON.stringify(data);
    }
  }
  return apiOptions;
}

/**
 * Fetch the REST API resource at the given path, using the given options.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 * @param {String} url - path of REST API resource to fetch
 * @param {Object} options - options to fetch with
 * @param {String} options.method - HTTP method to call the REST API resource with
 * @returns {Promise<(Object|Array)>} promise that resolves to JSON response body
 */
function apiFetch(url, options) {
  const apiOptions = getFetchOptions(options);
  const apiUrl = getFetchUrl(url, apiOptions);
  delete apiOptions.csrf;
  delete apiOptions.data;
  return fetch(apiUrl, apiOptions)
    .then(response => response.json());
}

export {
  apiFetch as default,
  getFetchOptions,
  getFetchUrl,
  getQueryString,
};
