import axios from 'axios';

class InvalidBackendRequestError extends Error {}

/**
 * Class representing clients to RESTful backend services.
 *
 * @param {string} baseURL - root path of resources (e.g. `/api`, `/reporter`), as commonly
 * configured to proxy through to backend via `nginx` or `webpack-dev-server`
 */
class BackendClientNew {
  constructor(baseURL) {
    this.axiosClient = axios.create({
      baseURL,
      paramsSerializer: BackendClientNew.getQueryString,
      withCredentials: true,
      xsrfCookieName: 'csrf',
      xsrfHeaderName: 'X-CSRF-Token',
    });
  }

  static getAxiosOptions(options) {
    const {
      csrf,
      data,
      method = 'GET',
      responseType = 'json',
    } = options;
    const headers = {};
    const axiosOptions = {
      headers,
      method,
      responseType,
    };
    if (method === 'GET') {
      if (data !== undefined) {
        axiosOptions.params = data;
      }
    } else {
      if (csrf === undefined) {
        throw new InvalidBackendRequestError('must provide CSRF token for non-GET requests');
      }
      headers['X-CSRF-Token'] = csrf;
      if (data !== undefined) {
        headers['Content-Type'] = 'application/json';
        axiosOptions.data = data;
      }
    }
    return axiosOptions;
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
   * @param {Object} params - key-value pairs to be encoded
   * @returns {string} URL-encoded query string, without the leading `?`
   */
  static getQueryString(params) {
    const qsParts = [];
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((subValue) => {
          const qsPart = BackendClientNew.getQueryStringPart(key, subValue);
          qsParts.push(qsPart);
        });
      } else {
        const qsPart = BackendClientNew.getQueryStringPart(key, value);
        qsParts.push(qsPart);
      }
    });
    return qsParts.join('&');
  }

  async fetch(url, options = {}) {
    const axiosOptions = BackendClientNew.getAxiosOptions(options);
    const response = await this.axiosClient.request({
      url,
      ...axiosOptions,
    });
    return response.data;
  }
}

export default BackendClientNew;
