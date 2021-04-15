const ValidationsCommonFilters = {
  dateRangeStart: {
    startBeforeEnd(dateRangeStart, { dateRangeEnd }) {
      if (dateRangeStart === null || dateRangeEnd === null) {
        return true;
      }
      return dateRangeStart.valueOf() < dateRangeEnd.valueOf();
    },
  },
  dateRangeEnd: {
    startBeforeEnd(dateRangeEnd, { dateRangeStart }) {
      if (dateRangeStart === null || dateRangeEnd === null) {
        return true;
      }
      return dateRangeStart.valueOf() < dateRangeEnd.valueOf();
    },
  },
};

export default ValidationsCommonFilters;
