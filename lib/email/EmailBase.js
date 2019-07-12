const config = require('../config');
const vueConfig = require('../../vue.config');

const { domain = 'localhost' } = config.session;
const { publicPath } = vueConfig;

/**
 * `EmailBase` is the superclass for all email notifications.  Subclasses are
 * expected to implement these methods as documented:
 *
 * - `getRecipients()`
 * - `getSubject()`
 * - `render()`
 *
 * These are used by `getOptions()` to build the set of options that is passed to
 * `Mailer.send()`, which itself is a *very* thin wrapper around `nodemailer`.
 *
 * Subclasses may optionally override `init()`, which is intended to cache any
 * related data that must be fetched asynchronously.
 *
 * @example
 * const email = new EmailStudyRequestConfirmation(user, studyRequest);
 * const options = await email.getOptions();
 * const mailResponse = await Mailer.send(options);
 *
 */
class EmailBase {
  static getUrl(path) {
    return `${domain}${publicPath}#${path}`;
  }

  /* eslint-disable no-empty-function, class-methods-use-this */
  async init() {}

  /* eslint-disable class-methods-use-this */
  getRecipients() {
    throw new Error('getRecipients() not implemented!');
  }

  /* eslint-disable class-methods-use-this */
  getSubject() {
    throw new Error('getSubject() not implemented!');
  }

  /* eslint-disable class-methods-use-this */
  render() {
    throw new Error('render() not implemented!');
  }

  async getOptions() {
    await this.init();
    const to = this.getRecipients();
    const subject = this.getSubject();
    const html = this.render();
    return {
      from: EmailBase.FROM,
      to,
      subject,
      html,
    };
  }
}

EmailBase.FROM = 'MOVE <move@move.intra.dev-toronto.ca>';
EmailBase.TO_TSU = 'trafficdata@toronto.ca';

module.exports = EmailBase;
