function formatDate(d) {
  if (!d) {
    return '';
  }
  return new Intl.DateTimeFormat('en-US').format(d);
}


export default {
  formatDate,
};
