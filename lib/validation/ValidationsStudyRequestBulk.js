import { email, required } from 'vuelidate/lib/validators';

import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';

const ValidationsStudyRequestBulk = {
  ccEmails: {
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
  notes: {},
  studyRequests: {
    required,
    $each: ValidationsStudyRequest,
  },
};

export default ValidationsStudyRequestBulk;
