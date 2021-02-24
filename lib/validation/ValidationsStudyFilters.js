import { requiredIf } from 'vuelidate/lib/validators';

const ValidationsStudyFilters = {
  dateRangeStart: {
    requiredIfApplyDateRange: requiredIf(({ applyDateRange }) => applyDateRange),
  },
  dateRangeEnd: {
    requiredIfApplyDateRange: requiredIf(({ applyDateRange }) => applyDateRange),
  },
};

export default ValidationsStudyFilters;
