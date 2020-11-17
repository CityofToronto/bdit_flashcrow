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
    const defaultOptions = {
      baseURL,
      paramsSerializer: QueryString.get,
      withCredentials: true,
      xsrfCookieName: 'csrf',
      xsrfHeaderName: 'X-CSRF-Token',
      ...options,
    };
    this.axiosClient = axios.create(defaultOptions);
    this.defaultOptions = defaultOptions;
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

  /**
   * Issues the given request and downloads the result using the `<a href="..." download>`
   * trick.
   *
   * This will only work in browser contexts!  Do *not* call this method from node.js services,
   * as `document.createElement` will fail there.  In node.js, you should instead use
   * {@link AxiosBackendClient#fetch} or {@link AxiosBackendClient#getUri}, then process the
   * resulting response stream; see {@link JobRunnerGenerateReports#runImpl} for an example.
   *
   * @param {string} url - URL to download
   * @param {Object} options - additional options (e.g. GET parameters, POST payload,
   * credentials, CSRF tokens, etc.)
   */
  download(url, options = {}) {
    const uriDownload = this.getUri(url, options);
    const $a = document.createElement('a');
    $a.setAttribute('download', '');
    $a.setAttribute('href', uriDownload);
    $a.setAttribute('target', '_blank');
    $a.click();
    /*
     * Note that $a has not been added to the DOM, and is garbage collected here.
     */
  }

  async fetch(url, options = {}) {
    const axiosOptions = AxiosBackendClient.getAxiosOptions(options);
    const response = await this.axiosClient.request({
      url,
      ...axiosOptions,
    });
    return response.data;
  }

  getUri(url, options = {}) {
    const axiosOptions = AxiosBackendClient.getAxiosOptions(options);
    const uri = this.axiosClient.getUri({
      url,
      ...axiosOptions,
    });
    /*
     * The `getUri` method in `axios` doesn't prepend `baseURL`, so we have to do that
     * manually here.
     */
    return `${this.defaultOptions.baseURL}${uri}`;
  }
}

export default AxiosBackendClient;
