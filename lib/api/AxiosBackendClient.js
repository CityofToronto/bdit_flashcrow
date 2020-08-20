import axios from 'axios';

import QueryString from '@/lib/api/QueryString';

/**
 * Class representing clients to RESTful backend services.
 *
 * Note that, when using this in a backend context, `baseURL` should be an absolute URL as
 * there is no equivalent in that environment to browser context for forming relative URLs.
 *
 * @param {string} baseURL - root path of resources (e.g. `/api`, `/reporter`), as commonly
 * configured to proxy through to backend via `nginx` or `webpack-dev-server`
 * @param {Object?} options - additional `axios` options, to be used as defaults for every
 * request
 */
class AxiosBackendClient {
  constructor(baseURL, options = {}) {
    this.axiosClient = axios.create({
      baseURL,
      paramsSerializer: QueryString.get,
      withCredentials: true,
      xsrfCookieName: 'csrf',
      xsrfHeaderName: 'X-CSRF-Token',
      ...options,
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
        throw new Error('must provide CSRF token for non-GET requests');
      }
      headers['X-CSRF-Token'] = csrf;
      if (data !== undefined) {
        headers['Content-Type'] = 'application/json';
        axiosOptions.data = data;
      }
    }
    return axiosOptions;
  }

  async fetch(url, options = {}) {
    const axiosOptions = AxiosBackendClient.getAxiosOptions(options);
    const response = await this.axiosClient.request({
      url,
      ...axiosOptions,
    });
    return response.data;
  }
}

export default AxiosBackendClient;
