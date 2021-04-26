import { dateRangeValid } from '@/lib/validation/ValidationHelpers';

const ValidationsCommonFilters = {
  dateRangeStart: {
    startBeforeEnd(dateRangeStart, { dateRangeEnd }) {
      return dateRangeValid({ start: dateRangeStart, end: dateRangeEnd });
    },
  },
  dateRangeEnd: {
    startBeforeEnd(dateRangeEnd, { dateRangeStart }) {
      return dateRangeValid({ start: dateRangeStart, end: dateRangeEnd });
    },
  },
};

export default ValidationsCommonFilters;
