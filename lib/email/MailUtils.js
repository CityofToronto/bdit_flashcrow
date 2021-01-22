import Mailer from '@/lib/email/Mailer';
import LogTag from '@/lib/log/LogTag';

async function sendEmailSafe(request, email) {
  try {
    const emailOptions = await email.getOptions();
    const emailResponse = await Mailer.send(emailOptions);
    request.log(LogTag.DEBUG, emailResponse);
    return true;
  } catch (err) {
    request.log(LogTag.ERROR, err);
    return false;
  }
}

const MailUtils = {
  sendEmailSafe,
};

export {
  MailUtils as default,
  sendEmailSafe,
};
