import { email, required, requiredIf } from 'vuelidate/lib/validators';

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
  name: {
    required,
  },
  notes: {
    required,
  },
  studyRequests: {
    required,
    $each: ValidationsStudyRequest,
  },
};

export default ValidationsStudyRequestBulk;
