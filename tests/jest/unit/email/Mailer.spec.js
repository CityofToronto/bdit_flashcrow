import Mailer from '@/lib/email/Mailer';
import EmailFoo from '@/lib/test/email/EmailFoo';

test('Mailer.convertToSes', async () => {
  const email = new EmailFoo(17);
  const options = await email.getOptions();
  expect(Mailer.convertToSes(options)).toEqual({
    Destination: {
      ToAddresses: ['move-ops+18@toronto.ca'],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: '<h1>Foo</h1><p>incremented to 18</p>',
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Foo: 17 -> 18',
      },
    },
    Source: 'move-team@email1.dev-toronto.ca',
    ReplyToAddresses: ['move-ops@toronto.ca'],
  });
});
