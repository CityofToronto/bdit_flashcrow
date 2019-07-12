const config = require('../config');
const vueConfig = require('../../vue.config');

const PORT_HTTPS_DEFAULT = 443;
const {
  session: { domain = 'localhost' },
  webPort = PORT_HTTPS_DEFAULT,
} = config;
const { publicPath } = vueConfig;

/**
 * Email message options, to be passed to `Mailer.send()`.
 *
 * @typedef {Object} EmailOptions
 * @property {String} from - sender email address
 * @property {Array<String>} to - recipient email addresses
 * @property {String} subject - subject line of email
 * @property {String} html - HTML body of email
 */

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
  /**
   * Normalizes the given path into a full URL, using the current `domain` and `publicPath`
   * settings of MOVE:
   *
   * - `domain` is configured in `lib/config.js`;
   * - `publicPath` is configured in `vue.config.js`.
   *
   * This produces an email-friendly link that links back to the currently running server.
   *
   * @param {String} path - path to normalize
   * @return {String} full URL
   */
  static getUrl(path) {
    const port = webPort === PORT_HTTPS_DEFAULT ? '' : `:${webPort}`;
    return `https://${domain}${port}${publicPath}#${path}`;
  }

  /* eslint-disable no-empty-function, class-methods-use-this */
  /**
   * Performs any asynchronous data fetching required to render this email message.
   * This may include roundtrips to DB, other APIs, etc.
   *
   * This is always called before other `get` methods.
   *
   * @returns {Promise<undefined>} when data fetching is complete
   */
  async init() {}

  /* eslint-disable class-methods-use-this */
  /**
   * Returns a list of recipients.  For consistency, this should *always* return a list, never a
   * single String.
   *
   * This is always called after `init()`.
   *
   * @returns {Array<String>} list of recipients
   */
  getRecipients() {
    throw new Error('getRecipients() not implemented!');
  }

  /* eslint-disable class-methods-use-this */
  /**
   * Returns the email subject line.
   *
   * This is always called after `init()`.
   *
   * @returns {String} email subject line
   */
  getSubject() {
    throw new Error('getSubject() not implemented!');
  }

  /* eslint-disable class-methods-use-this */
  /**
   * Returns the HTML body of the email, as a String.  Implementations should take care to
   * properly escape variables, e.g. through Mustache double-bracket (`{{}}`) syntax.
   *
   * We may eventually investigate `vue-server-renderer` for rendering HTML emails, but
   * for now we use Mustache for most complex cases.
   *
   * This is always called after `init()`.
   *
   * @returns {String} HTML body of email
   */
  render() {
    throw new Error('render() not implemented!');
  }

  /**
   * Returns email message options to be passed to `Mailer.send()`
   *
   * @returns {Promise<EmailOptions>} options to be passed to `Mailer.send()`
   */
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

/**
 * Outgoing email address for MOVE.  This same email address is also used as an incoming
 * "reach the team" point of contact.
 *
 * @memberof EmailBase
 * @type {String}
 */
EmailBase.FROM = 'MOVE <move@toronto.ca>';

/**
 * Alias for Data Collection Supervisors at the City of Toronto.
 *
 * @memberof EmailBase
 * @type {String}
 */
EmailBase.TO_TSU = 'trafficdata@toronto.ca';

module.exports = EmailBase;
