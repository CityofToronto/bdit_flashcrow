import BackendClient from '@/lib/api/BackendClient';

class InjectBackendClient {
  constructor(server) {
    this.backendClient = new BackendClient('');
    this.csrf = null;
    this.server = server;
    this.user = null;
  }

  getInjectOptions(apiUrl, apiOptions) {
    const {
      body,
      headers,
      method,
    } = apiOptions;
    const injectOptions = {
      headers,
      method,
      url: apiUrl,
    };
    if (body !== undefined) {
      injectOptions.payload = body;
    }
    if (this.csrf === null) {
      if (method !== 'GET') {
        throw new Error('CSRF token required for non-GET API calls');
      }
    } else {
      const { csrf } = this;
      /* eslint-disable-next-line dot-notation */
      headers['Cookie'] = `csrf=${csrf}`;
      headers['X-CSRF-Token'] = csrf;
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

  async fetch(url, options) {
    const apiOptions = BackendClient.getFetchOptions(options);
    const apiUrl = this.backendClient.getFetchUrl(url, apiOptions);
    const injectOptions = this.getInjectOptions(apiUrl, apiOptions);
    const response = await this.server.inject(injectOptions);
    return this.handleResponse(response);
  }
}

export default InjectBackendClient;
