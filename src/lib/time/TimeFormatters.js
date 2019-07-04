import ArrayUtils from '@/lib/ArrayUtils';

function format(d, options) {
  if (!d) {
    return '';
  }
  return new Intl.DateTimeFormat('en-US', options).format(d);
}

function formatDefault(d) {
  return format(d);
}

function formatDayOfWeek(d) {
  return format(d, {
    weekday: 'short',
  });
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

// see https://stackoverflow.com/questions/30437134/how-to-get-the-weekday-names-using-intl
const DAYS_OF_WEEK = ArrayUtils.range(4, 11)
  .map(date => formatDayOfWeek(new Date(1970, 0, date)));

export default {
  DAYS_OF_WEEK,
  formatDayOfWeek,
  formatDefault,
  formatTimeOfDay,
  formatYearMonth,
};
