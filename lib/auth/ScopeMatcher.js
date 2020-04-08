function hasAuthScope(user, scope) {
  if (user === null) {
    return false;
  }
  if (Array.isArray(scope)) {
    return scope.some(authScope => user.scope.includes(authScope));
  }
  return user.scope.includes(scope);
}

const ScopeMatcher = {
  hasAuthScope,
};

export {
  ScopeMatcher as default,
  hasAuthScope,
};
