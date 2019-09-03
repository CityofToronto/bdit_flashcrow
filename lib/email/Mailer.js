import AWS from 'aws-sdk';
import sendgridMail from '@sendgrid/mail';

import config from '../config/MoveConfig';

/*
 * We may eventually have to make this dynamically configurable (e.g. if we
 * also spin up servers in `ca-central-1`), but for now this is fine.
 */
AWS.config.update({ region: 'us-east-1' });

const { sendGrid: sendGridApiKey } = config;
sendgridMail.setApiKey(sendGridApiKey);

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
   * We don't have access to the SES credentials themselves, so we have to adopt a two-tiered
   * approach here: SendGrid in local development (so that this feature still works!) with
   * AWS SES on EC2.
   *
   * @param {EmailOptions} options - email message options
   */
  static async send(options) {
    if (config.ENV === 'production') {
      /*
       * For now, `'production'` here refers to any EC2 environment.  We will eventually
       * change that once our other AWS environments are spun up.
       */
      const awsSesOptions = Mailer.convertToSes(options);
      return awsSes.sendEmail(awsSesOptions).promise();
    }
    return sendgridMail.send(options);
  }
}

export default Mailer;
