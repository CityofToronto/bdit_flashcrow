import { requiredIf } from 'vuelidate/lib/validators';

const ValidationsCollisionFilters = {
  dateRangeStart: {
    requiredIfApplyDateRange: requiredIf(({ applyDateRange }) => applyDateRange),
  },
  dateRangeEnd: {
    requiredIfApplyDateRange: requiredIf(({ applyDateRange }) => applyDateRange),
  },
  hoursOfDay: {
    fromBeforeTo(hoursOfDay) {
      const [fromHour, toHour] = hoursOfDay;
      return fromHour < toHour;
    },
  },
};

export default ValidationsCollisionFilters;
