import EmailBase from '@/lib/email/EmailBase';
import Mailer from '@/lib/email/Mailer';

function incrementASAP(x) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(x + 1);
    }, 0);
  });
}

class EmailFoo extends EmailBase {
  constructor(x) {
    super();
    this.x = x;
  }

  async init() {
    this.y = await incrementASAP(this.x);
  }

  getRecipients() {
    return [`move-ops+${this.y}@toronto.ca`];
  }

  getSubject() {
    return `Foo: ${this.x} -> ${this.y}`;
  }

  render() {
    return `<h1>Foo</h1><p>incremented to ${this.y}</p>`;
  }
}

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
    ReplyToAddresses: ['move-team@toronto.ca'],
  });
});
