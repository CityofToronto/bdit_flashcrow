/**
 *
 * @param {number} wait - time, in milliseconds, to delay for
 * @returns {Promise<void>} a promise that resolves after given delay
 */
function asyncDelay(wait) {
  return new Promise((resolve) => {
    setTimeout(resolve, wait);
  });
}

/**
 * "Debounces" `func` by wrapping it in a function that, when called,
 * resets an internal timeout.  `func` is only called once it's been
 * `wait` milliseconds since the last call to the function returned by
 * `debounce(func, wait)`.
 *
 * This is commonly used to throttle REST API calls, especially during
 * user interactions that produce a high volume of events (e.g. mouse
 * motion).
 *
 * @memberof FunctionUtils
 * @param {Function} func - function to debounce
 * @param {number} wait - time, in milliseconds, to wait after last call
 * to `debounce(func, wait)` before `func()` is called
 * @returns {Function} debounced version of `func`
 */
function debounce(func, wait) {
  let timeout = null;
  return function debounceWrapper(...args) {
    const context = this;
    const later = function later() {
      timeout = null;
      func.apply(context, args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Identity function: returns its input.
 *
 * @memberof FunctionUtils
 * @param {*} x - value to return
 * @return {*} `x`
 */
function identity(x) {
  return x;
}

/**
 * "No operation", i.e. a function that does nothing.
 *
 * @memberof FunctionUtils
 */
function noop() {}

/**
 * @namespace
 */
const FunctionUtils = {
  asyncDelay,
  debounce,
  identity,
  noop,
};

export {
  FunctionUtils as default,
  asyncDelay,
  debounce,
  identity,
  noop,
};
