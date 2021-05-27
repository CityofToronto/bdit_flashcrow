import { email, required } from 'vuelidate/lib/validators';

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
};

export default ValidationsStudyRequestBulk;
