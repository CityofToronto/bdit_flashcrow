import { dateRangeValid } from '@/lib/validation/ValidationHelpers';

const ValidationsStudyRequestFilters = {
  createdAtStart: {
    startBeforeEnd(createdAtStart, { createdAtEnd }) {
      return dateRangeValid({ start: createdAtStart, end: createdAtEnd });
    },
  },
  createdAtEnd: {
    startBeforeEnd(createdAtEnd, { createdAtStart }) {
      return dateRangeValid({ start: createdAtStart, end: createdAtEnd });
    },
  },
  dueDateStart: {
    startBeforeEnd(dueDateStart, { dueDateEnd }) {
      return dateRangeValid({ start: dueDateStart, end: dueDateEnd });
    },
  },
  dueDateEnd: {
    startBeforeEnd(dueDateEnd, { dueDateStart }) {
      return dateRangeValid({ start: dueDateStart, end: dueDateEnd });
    },
  },
};

export default ValidationsStudyRequestFilters;
