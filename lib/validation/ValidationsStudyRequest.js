import { email, required, requiredIf } from 'vuelidate/lib/validators';

import { StudyHours, StudyRequestReason } from '@/lib/Constants';
import { numConsecutiveDaysOfWeek } from '@/lib/time/TimeUtils';

const ValidationsStudyRequest = {
  ccEmails: {
    requiredIfUrgent: requiredIf(({ urgent }) => urgent),
    $each: {
      required,
      torontoInternal(ccEmail) {
        return email(ccEmail) && ccEmail.endsWith('@toronto.ca');
      },
    },
  },
  createdAt: {},
  daysOfWeek: {
    required,
  },
  duration: {
    requiredIfStudyTypeAutomatic: requiredIf(
      ({ studyType }) => studyType !== null && studyType.automatic,
    ),
    needsValidDaysOfWeek(duration, { daysOfWeek }) {
      const k = numConsecutiveDaysOfWeek(daysOfWeek);
      if (duration === 336) {
        return k * 24 >= 168;
      }
      return k * 24 >= duration;
    },
  },
  dueDate: {
    required,
  },
  hours: {
    requiredIfStudyTypeManual: requiredIf(
      ({ studyType }) => studyType !== null && !studyType.automatic,
    ),
  },
  notes: {
    requiredIfOtherHours: requiredIf(({ hours }) => hours === StudyHours.OTHER),
  },
  reason: {
    required,
  },
  reasonOther: {
    requiredIfOtherReason: requiredIf(({ reason }) => reason === StudyRequestReason.OTHER),
  },
  studyType: {
    required,
  },
  studyTypeOther: {
    requiredIfOtherStudyType: requiredIf(
      ({ studyType }) => studyType !== null && studyType.other,
    ),
  },
  urgent: {},
  urgentReason: {
    requiredIfUrgent: requiredIf(({ urgent }) => urgent),
  },
};

export default ValidationsStudyRequest;
