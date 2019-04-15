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

function apiFetch(url, options) {
  let apiUrl = `/flashcrow/api${url}`;
  const defaultOptions = {
    credentials: 'include',
    method: 'GET',
  };
  const apiOptions = Object.assign(defaultOptions, options);
  if (apiOptions.data) {
    if (apiOptions.method === 'GET') {
      const qs = getQueryString(apiOptions.data);
      apiUrl = `${apiUrl}?${qs}`;
    } else {
      apiOptions.headers = {
        'Content-Type': 'application/json',
      };
      apiOptions.body = JSON.stringify(apiOptions.data);
    }
    delete apiOptions.data;
  }
  return fetch(apiUrl, apiOptions)
    .then(response => response.json());
}

export default apiFetch;
