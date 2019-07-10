const Mailer = require('../email/Mailer');

const EmailController = [];

EmailController.push({
  method: 'POST',
  path: '/email/send',
  handler: async () => {
    const message = {
      from: 'flashcrow@move.intra.dev-toronto.ca',
      to: 'Evan.Savage@toronto.ca',
      subject: 'Message',
      text: 'I hope this message gets delivered!',
    };
    return Mailer.send(message);
  },
});

module.exports = EmailController;
