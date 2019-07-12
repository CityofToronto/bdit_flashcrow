const nodemailer = require('nodemailer');

const TRANSPORT = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail',
});

class Mailer {
  static async send(options) {
    return TRANSPORT.sendMail(options);
  }
}

module.exports = Mailer;
