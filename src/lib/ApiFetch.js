function apiFetch(url, options) {
  const apiUrl = `/flashcrow/api${url}`;
  const apiOptions = options || {};
  Object.assign(apiOptions, {
    credentials: 'include',
  });
  return fetch(apiUrl, apiOptions)
    .then(response => response.json());
}

export default apiFetch;
