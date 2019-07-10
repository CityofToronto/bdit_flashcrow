const nodemailer = require('nodemailer');

const TRANSPORT = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail',
});

// TODO: DRY with src/lib/TimeFormatters
function format(d, options) {
  if (!d) {
    return '';
  }
  return new Intl.DateTimeFormat('en-US', options).format(d);
}

function formatDefault(d) {
  return format(d);
}

class Mailer {
  static send(message) {
    return TRANSPORT.sendMail(message);
  }

  static sendStudyRequestConfirmation({ email, name }, studyRequest) {
    const to = [
      `${name} <${email}>`,
    ].concat(studyRequest.ccEmails);
    const subject = `Confirmation: Request ${studyRequest.id}`;
    /*
     * TODO: this is effectively just a port of FcModalRequestStudyConfirmation
     * to non-Vue templating.  We should have a better way to do this.
     */
    const estimatedDeliveryDate = formatDefault(studyRequest.estimatedDeliveryDate);
    let htmlPriority;
    if (studyRequest.priority === 'URGENT') {
      htmlPriority = `
    <p>
      You've marked this request urgent.  The Traffic Safety Unit will
      contact you to make adjustments to the schedule.
    </p>`;
    } else {
      htmlPriority = `
    <p>
      The Traffic Safety Unit will contact you if there are unforeseen
      scheduling changes.
    </p>
  `;
    }
    const html = `
<div>
  <p>Thank you for your request!</p>
  <p>
    You should receive your data by
    <strong>${estimatedDeliveryDate}</strong>.
  </p>
  ${htmlPriority}
</div>`;
    const message = {
      from: 'MOVE <move@move.intra.dev-toronto.ca>',
      to,
      subject,
      html,
    };
    return Mailer.send(message);
  }
}

module.exports = Mailer;
