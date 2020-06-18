import { email, required, requiredIf } from 'vuelidate/lib/validators';

import { StudyHours } from '@/lib/Constants';

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

const ValidationsStudyRequest = {
  studyRequest: {
    ccEmails: {
      requiredIfUrgent: requiredIf(({ urgent }) => urgent),
      $each: {
        required,
        torontoInternal(ccEmail) {
          return email(ccEmail) && ccEmail.endsWith('@toronto.ca');
        },
      },
    },
    centrelineId: {
      required,
    },
    centrelineType: {
      required,
    },
    dueDate: {
      required,
    },
    geom: {
      required,
    },
    reasons: {
      required,
    },
    studyType: {
      required,
    },
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
      requiredIfOtherHours: requiredIf(({ hours }) => hours === StudyHours.OTHER),
    },
    urgentReason: {
      requiredIfUrgent: requiredIf(({ urgent }) => urgent),
    },
  },
};

export {
  ValidationsStudyRequest as default,
  numConsecutiveDaysOfWeek,
};
