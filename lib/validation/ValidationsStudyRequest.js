import { email, required, requiredIf } from 'vuelidate/lib/validators';

import { StudyHours } from '@/lib/Constants';
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
    requiredIfMultiDayStudy: requiredIf(
      ({ studyType }) => studyType !== null && studyType.isMultiDay,
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
    requiredIfSingleDayStudy: requiredIf(
      ({ studyType }) => studyType !== null && !studyType.isMultiDay,
    ),
  },
  notes: {
    requiredIfOtherHours: requiredIf(({ hours }) => hours === StudyHours.OTHER),
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
