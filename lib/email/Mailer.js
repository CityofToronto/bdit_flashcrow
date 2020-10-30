import AWS from 'aws-sdk';

import config from '@/lib/config/MoveConfig';

/*
 * We may eventually have to make this dynamically configurable (e.g. if we
 * also spin up servers in `ca-central-1`), but for now this is fine.
 */
AWS.config.update({ region: 'us-east-1' });

const awsSes = new AWS.SES({ apiVersion: '2010-12-01' });

/**
 * `Mailer` is a lightweight wrapper around the underlying email library.
 */
class Mailer {
  /**
   * Converts the given options as returned by {@link EmailBase#getOptions} to
   * AWS SES options, as documented in the AWS documentation.
   *
   * @see {@link https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/ses-examples-sending-email.html|AWS SES examples}
   * @param {Object} options - SendGrid options as returned by {@link EmailBase#getOptions}
   * @returns {Object} AWS SES-compatible options
   */
  static convertToSes({
    from,
    to,
    reply_to: replyTo,
    subject,
    html,
  }) {
    return {
      Destination: {
        ToAddresses: to,
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: html,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: from,
      ReplyToAddresses: [replyTo],
    };
  }

  /**
   * Sends the given email.
   *
   * @param {EmailOptions} options - email message options
   */
  static async send(options) {
    if (config.ENV === 'production') {
      const awsSesOptions = Mailer.convertToSes(options);
      return awsSes.sendEmail(awsSesOptions).promise();
    }
    /*
     * In non-EC2 environments, we just return the options and do not actually send any email.
     * We used to send email through SendGrid in this case, but removing that allows us to
     * trim down our list of dependencies.
     *
     * If you need to verify that emails are properly structured in local development or test
     * environments, write a unit test.
     */
    return options;
  }
}

export default Mailer;
