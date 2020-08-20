import QueryString from '@/lib/api/QueryString';

class InjectBackendClient {
  constructor(server) {
    this.csrf = null;
    this.server = server;
    this.user = null;
  }

  static getInjectUrl(url, options) {
    const { data, method = 'GET' } = options;
    if (data === undefined || method !== 'GET') {
      return url;
    }
    const qs = QueryString.get(data);
    return `${url}?${qs}`;
  }

  getInjectOptions(url, options) {
    const injectUrl = InjectBackendClient.getInjectUrl(url, options);
    const {
      data,
      method = 'GET',
    } = options;
    const headers = {};
    const injectOptions = {
      headers,
      method,
      url: injectUrl,
    };
    if (method !== 'GET') {
      if (this.csrf === null) {
        throw new Error('must provide CSRF token for non-GET requests');
      }
      const { csrf } = this;
      /* eslint-disable-next-line dot-notation */
      headers['Cookie'] = `csrf=${csrf}`;
      headers['X-CSRF-Token'] = csrf;
      if (data !== undefined) {
        headers['Content-Type'] = 'application/json';
        injectOptions.payload = data;
      }
    }
    if (this.user !== null) {
      const credentials = this.getAuthCredentials();
      injectOptions.auth = {
        strategy: 'session',
        credentials,
      };
    }
    return injectOptions;
  }

  getAuthCredentials() {
    if (this.user === null) {
      return null;
    }
    let { scope } = this.user;
    scope = scope.map(authScope => authScope.toString());
    return {
      ...this.user,
      scope,
    };
  }

  setUser(user) {
    this.user = user;
  }

  static getResponseCsrf(response) {
    const { 'set-cookie': setCookie = [] } = response.headers;
    let csrf = null;
    setCookie.forEach((headerCookie) => {
      headerCookie.split(';')
        .forEach((part) => {
          const [key, value] = part.trim().split('=').map(decodeURIComponent);
          if (key === 'csrf' && value !== undefined) {
            csrf = value;
          }
        });
    });
    return csrf;
  }

  async handleResponse(response) {
    const csrf = InjectBackendClient.getResponseCsrf(response);
    if (csrf !== null) {
      this.csrf = csrf;
    }
    return response;
  }

  async fetch(url, options = {}) {
    const injectOptions = this.getInjectOptions(url, options);
    const response = await this.server.inject(injectOptions);
    return this.handleResponse(response);
  }
}

export default InjectBackendClient;
