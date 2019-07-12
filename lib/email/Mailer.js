const sendgridMail = require('@sendgrid/mail');

const config = require('../config');

const { sendGrid: sendGridApiKey } = config;
sendgridMail.setApiKey(sendGridApiKey);

/**
 * `Mailer` is a lightweight wrapper around the underlying email library.
 */
class Mailer {
  /**
   * Sends the given email.
   *
   * @param {EmailOptions} options - email message options
   */
  static async send(options) {
    return sendgridMail.send(options);
  }
}

module.exports = Mailer;
