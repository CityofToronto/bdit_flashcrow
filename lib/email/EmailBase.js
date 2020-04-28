/* eslint-disable class-methods-use-this */
import config from '@/lib/config/MoveConfig';
import vueConfig from '@/vue.config';

const PORT_HTTPS_DEFAULT = 443;
const {
  emailSender,
  session: { domain = 'localhost' },
  webPort = PORT_HTTPS_DEFAULT,
} = config;
const { publicPath } = vueConfig;

/**
 * Email message options, to be passed to `Mailer.send()`.
 *
 * @typedef {Object} EmailOptions
 * @property {string} from - sender email address
 * @property {Array<string>} to - recipient email addresses
 * @property {string} subject - subject line of email
 * @property {string} html - HTML body of email
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
   * - `domain` is configured in `lib/config/MoveConfig.js`;
   * - `publicPath` is configured in `vue.config.js`.
   *
   * This produces an email-friendly link that links back to the currently running server.
   *
   * @param {string} path - path to normalize
   * @return {string} full URL
   */
  static getUrl(path) {
    const port = webPort === PORT_HTTPS_DEFAULT ? '' : `:${webPort}`;
    let fullPath = `${publicPath}${path}`;
    fullPath = fullPath.replace('//', '/');
    return `https://${domain}${port}${fullPath}`;
  }

  /**
   * Performs any asynchronous data fetching required to render this email message.
   * This may include roundtrips to DB, other APIs, etc.
   *
   * This is always called before other `get` methods.
   *
   * @returns {Promise<undefined>} when data fetching is complete
   */
  async init() {
    /* eslint-disable-next-line no-empty-function */
  }

  /**
   * Returns the sender email address.  Eventually, this will depend on which tier
   * (dev, staging, QA, prod) the email is being sent from, but for now we simply
   * use the dev tier email address.
   *
   * @returns {string} sender
   */
  static getSender() {
    return emailSender;
  }

  /**
   * Returns a list of recipients.  For consistency, this should *always* return a list, never a
   * single String.
   *
   * This is always called after `init()`.
   *
   * @returns {Array<string>} list of recipients
   */
  getRecipients() {
    throw new Error('getRecipients() not implemented!');
  }

  /**
   * Returns the email subject line.
   *
   * This is always called after `init()`.
   *
   * @returns {string} email subject line
   */
  getSubject() {
    throw new Error('getSubject() not implemented!');
  }

  /**
   * Returns the HTML body of the email, as a String.  Implementations should take care to
   * properly escape variables, e.g. through Mustache double-bracket (`{{}}`) syntax.
   *
   * We may eventually investigate `vue-server-renderer` for rendering HTML emails, but
   * for now we use Mustache for most complex cases.
   *
   * This is always called after `init()`.
   *
   * @returns {string} HTML body of email
   */
  render() {
    throw new Error('render() not implemented!');
  }

  /**
   * Returns email message options to be passed to `Mailer.send()`.  These are
   * formatted as SendGrid API options as per their documentation
   *
   * @see {@link https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/index.html|SendGrid V3 Mail Send API}
   * @see Mailer.convertToSes
   * @returns {Promise<EmailOptions>} options to be passed to `Mailer.send()`
   */
  async getOptions() {
    await this.init();
    const from = EmailBase.getSender();
    const to = this.getRecipients();
    const subject = this.getSubject();
    const html = this.render();
    return {
      from,
      to,
      reply_to: EmailBase.REPLY_TO,
      subject,
      html,
    };
  }
}

/**
 * Reply-to address, so that email clients will direct people at our team's
 * incoming email address.
 */
EmailBase.REPLY_TO = 'move-team@toronto.ca';

/**
 * Alias for Data Collection Supervisors at the City of Toronto.
 *
 * @memberof EmailBase
 * @type {string}
 */
EmailBase.TO_TSU = 'trafficdata@toronto.ca';

export default EmailBase;
