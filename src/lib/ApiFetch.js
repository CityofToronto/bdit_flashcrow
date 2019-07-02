function getQueryStringPart(key, value) {
  const keyEncoded = encodeURIComponent(key);
  const valueEncoded = encodeURIComponent(value);
  return `${keyEncoded}=${valueEncoded}`;
}

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

function getFetchUrl(url, apiOptions) {
  let apiUrl = `/flashcrow/api${url}`;
  if (apiOptions.data && apiOptions.method === 'GET') {
    const qs = getQueryString(apiOptions.data);
    apiUrl = `${apiUrl}?${qs}`;
  }
  return apiUrl;
}

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
