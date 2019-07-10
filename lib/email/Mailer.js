const nodemailer = require('nodemailer');

const TRANSPORT = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail',
});

class Mailer {
  static send(message) {
    return TRANSPORT.sendMail(message);
  }
}

module.exports = Mailer;
