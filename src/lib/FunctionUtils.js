// TODO: move into separate library
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
