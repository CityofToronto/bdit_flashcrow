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
  reason: {
    required,
  },
  reasonOther: {
    requiredIfOtherReason: requiredIf(({ reason }) => reason === StudyRequestReason.OTHER),
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
};

export default ValidationsStudyRequest;
