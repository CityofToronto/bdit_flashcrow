import { email, required, requiredIf } from 'vuelidate/lib/validators';

function numConsecutiveDaysOfWeek(daysOfWeek) {
  const days = new Array(15).fill(false);
  daysOfWeek.forEach((i) => {
    days[i] = true;
    days[i + 7] = true;
  });
  let max = 0;
  let start = 0;
  let inRun = false;
  for (let i = 0; i < 15; i += 1) {
    if (days[i] && !inRun) {
      inRun = true;
      start = i;
    } else if (!days[i] && inRun) {
      inRun = false;
      const size = i - start;
      if (size > max) {
        max = size;
      }
    }
  }
  return max === 14 ? 7 : max;
}

const validationsMeta = {
  studyRequest: {
    dueDate: {
      required,
    },
    reasons: {
      required,
    },
    ccEmails: {
      $each: {
        torontoInternal(ccEmail) {
          return email(ccEmail) && ccEmail.endsWith('@toronto.ca');
        },
      },
    },
  },
};

const validations = {
  studyRequest: {
    ...validationsMeta.studyRequest,
    studies: {
      $each: {
        daysOfWeek: {
          required,
        },
        duration: {
          needsValidDaysOfWeek(duration, { daysOfWeek }) {
            const k = numConsecutiveDaysOfWeek(daysOfWeek);
            return k * 24 >= duration;
          },
        },
        notes: {
          requiredIfOtherHours: requiredIf(meta => meta.hours === 'OTHER'),
        },
      },
    },
  },
};

export default {
  numConsecutiveDaysOfWeek,
  validations,
  validationsMeta,
};
