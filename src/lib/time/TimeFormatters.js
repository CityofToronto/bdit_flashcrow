function format(d, options) {
  if (!d) {
    return '';
  }
  return new Intl.DateTimeFormat('en-US', options).format(d);
}

function formatDefault(d) {
  if (!d) {
    return '';
  }
  return new Intl.DateTimeFormat('en-US').format(d);
}

function formatTimeOfDay(d) {
  return format(d, {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatYearMonth(d) {
  return format(d, {
    year: 'numeric',
    month: 'short',
  });
}


export default {
  formatDefault,
  formatTimeOfDay,
  formatYearMonth,
};
