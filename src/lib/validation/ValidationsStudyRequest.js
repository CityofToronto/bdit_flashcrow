import { required, requiredIf } from 'vuelidate/lib/validators';

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

const validations = {
  studyRequest: {
    meta: {
      hasServiceRequestId: {
        required,
      },
      serviceRequestId: {
        requiredIfHasServiceRequestId: requiredIf(meta => meta.hasServiceRequestId),
      },
      dueDate: {
        required,
      },
      reasons: {
        required,
      },
      ccEmails: {
        allTorontoInternal(ccEmails) {
          return ccEmails
            .trim()
            .split(',')
            .map(ccEmail => ccEmail.trim())
            .filter(ccEmail => ccEmail !== '')
            .every(ccEmail => ccEmail.endsWith('@toronto.ca'));
        },
      },
    },
    items: {
      $each: {
        meta: {
          daysOfWeek: {
            required,
            needsValidDuration(daysOfWeek, { duration }) {
              const k = numConsecutiveDaysOfWeek(daysOfWeek);
              return k * 24 >= duration;
            },
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
  },
};

export default {
  numConsecutiveDaysOfWeek,
  validations,
};
