import { email, required, requiredIf } from 'vuelidate/lib/validators';

import { StudyRequestReason } from '@/lib/Constants';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';

const ValidationsStudyRequestBulk = {
  ccEmails: {
    requiredIfUrgent: requiredIf(({ urgent }) => urgent),
    $each: {
      required,
      torontoInternal(ccEmail) {
        return email(ccEmail) && ccEmail.endsWith('@toronto.ca');
      },
    },
  },
  dueDate: {
    required,
  },
  estimatedDeliveryDate: {},
  name: {
    required,
  },
  reason: {
    required,
  },
  reasonOther: {
    requiredIfOtherReason: requiredIf(({ reason }) => reason === StudyRequestReason.OTHER),
  },
  studyRequests: {
    required,
    $each: ValidationsStudyRequest,
  },
  urgent: {},
  urgentReason: {
    requiredIfUrgent: requiredIf(({ urgent }) => urgent),
  },
};

export default ValidationsStudyRequestBulk;
