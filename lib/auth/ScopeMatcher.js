function hasAuthScope(user, authScope) {
  if (user === null) {
    return false;
  }
  if (Array.isArray(authScope)) {
    return authScope.some(subAuthScope => hasAuthScope(user, subAuthScope));
  }
  return user.scope.includes(authScope);
}

const ScopeMatcher = {
  hasAuthScope,
};

export {
  ScopeMatcher as default,
  hasAuthScope,
};
