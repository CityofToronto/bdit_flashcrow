import { requiredIf } from 'vuelidate/lib/validators';

const ValidationsFilters = {
  dateRangeStart: {
    requiredIfApplyDateRange: requiredIf(({ applyDateRange }) => applyDateRange),
  },
  dateRangeEnd: {
    requiredIfApplyDateRange: requiredIf(({ applyDateRange }) => applyDateRange),
  },
};

export default ValidationsFilters;
