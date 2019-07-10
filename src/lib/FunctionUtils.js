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
 * @param {Function} func - function to debounce
 * @param {Number} wait - time, in milliseconds, to wait after last call
 * to `debounce(func, wait)` before `func()` is called
 * @returns {Function} debounced version of `func`
 */
function debounce(func, wait) {
  let timeout;
  return function debounceWrapper(...args) {
    const context = this;
    const later = function later() {
      timeout = null;
      func.apply(context, args);
    };
    window.clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
    if (!timeout) {
      func.apply(context, args);
    }
  };
}

export default {
  debounce,
};
