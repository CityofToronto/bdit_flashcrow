/**
 * Class representing clients to RESTful backend services.
 *
 * @param {string} root - root path of resources (e.g. `/api`, `/reporter`), as commonly
 * configured to proxy through to backend via `nginx` or `webpack-dev-server`
 */
class BackendClient {
  constructor(root) {
    this.root = root;
  }

  /**
   * Builds the URL to be passed to `fetch()`.  For GET requests, this involves
   * using `getQueryString()` to URL-encode `apiOptions.data`.
   *
   * @param {string} url - path of API endpoint to call
   * @param {Object} apiOptions - options to be passed to `fetch()`
   * @returns {string} full URL to pass to `fetch()`
   */
  getFetchUrl(url, apiOptions) {
    let apiUrl = `${this.root}${url}`;
    if (apiOptions.data && apiOptions.method === 'GET') {
      const qs = BackendClient.getQueryString(apiOptions.data);
      apiUrl = `${apiUrl}?${qs}`;
    }
    return apiUrl;
  }

  /**
   * Encodes the given key-value pair as part of a URL query string.  These are
   * concatenated by `getQueryString()` below.
   *
   * @param {string} key - key to be encoded
   * @param {*} value - value to be encoded
   * @returns {string} URL-encoded key-value pair
   */
  static getQueryStringPart(key, value) {
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
   * @returns {string} URL-encoded query string, without the leading `?`
   */
  static getQueryString(data) {
    const qsParts = [];
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((subValue) => {
          const qsPart = BackendClient.getQueryStringPart(key, subValue);
          qsParts.push(qsPart);
        });
      } else {
        const qsPart = BackendClient.getQueryStringPart(key, value);
        qsParts.push(qsPart);
      }
    });
    return qsParts.join('&');
  }

  /**
   * Normalizes API options to be passed to `fetch()`.  For non-GET requests, this
   * involves setting the CSRF token and JSON-encoding data into the request body.
   *
   * @param {Object} options - options to be normalized
   * @returns {Object} normalized options
   */
  static getFetchOptions(options) {
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
   * @param {string} url - path of REST API resource to fetch
   * @param {Object} options - options to fetch with
   * @param {string} options.method - HTTP method to call the REST API resource with
   * @returns {Promise<(Object|Array)>} promise that resolves to JSON response body
   * @throws {Object} if `fetch()` results in an HTTP 4xx or HTTP 5xx error
   */
  async fetch(url, options) {
    const apiOptions = BackendClient.getFetchOptions(options);
    const apiUrl = this.getFetchUrl(url, apiOptions);
    delete apiOptions.csrf;
    delete apiOptions.data;
    const response = await fetch(apiUrl, apiOptions);
    if (response.status >= 400) {
      // HTTP 4xx / 5xx
      try {
        const responseBody = await response.json();
        throw responseBody;
      } catch (err) {
        /*
        * Create JSON response that looks similar to one returned by @hapi/boom - except
        * that there's (probably) no backend to return it!
        */
        /* eslint-disable no-throw-literal */
        throw {
          statusCode: response.status,
          error: response.statusText,
          message: response.statusText,
        };
      }
    }
    if (response.redirected) {
      // HTTP 3xx
      /*
      * In this case, the frontend should not be depending on the response here;
      * instead, it will be redirected.
      */
      return {
        __redirect: response.url,
      };
    }
    const responseBody = await response.json();
    if (response.ok) {
      // HTTP 2xx
      return responseBody;
    }
    // ???
    throw responseBody;
  }
}

const apiClient = new BackendClient('/api');
async function apiFetch(url, options) {
  return apiClient.fetch(url, options);
}

const reporterClient = new BackendClient('/reporter');
async function reporterFetch(url, options) {
  return reporterClient.fetch(url, options);
}

export {
  BackendClient as default,
  apiFetch,
  reporterFetch,
};
