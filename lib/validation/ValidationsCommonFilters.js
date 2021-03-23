import { requiredIf } from 'vuelidate/lib/validators';

const ValidationsCommonFilters = {
  dateRangeStart: {
    requiredIfApplyDateRange: requiredIf(({ applyDateRange }) => applyDateRange),
  },
  dateRangeEnd: {
    requiredIfApplyDateRange: requiredIf(({ applyDateRange }) => applyDateRange),
  },
};

export default ValidationsCommonFilters;
