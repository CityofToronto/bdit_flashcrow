import EmailBase from '@/lib/email/EmailBase';

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

export default EmailFoo;
