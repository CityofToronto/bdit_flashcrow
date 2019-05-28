import { required, requiredIf } from 'vuelidate/lib/validators';

export default {
  studyRequest: {
    meta: {
      reason: {
        required,
      },
    },
    items: {
      $each: {
        meta: {
          daysOfWeek: {
            required,
          },
          notes: {
            requiredIfOtherHours: requiredIf(meta => meta.hours === 'OTHER'),
          },
        },
      },
    },
  },
};
