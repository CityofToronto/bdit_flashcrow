import EmailBase from '@/lib/email/EmailBase';
import EmailFoo from '@/lib/test/email/EmailFoo';

test('EmailBase.getUrl', () => {
  let url = EmailBase.getUrl('');
  expect(url).toEqual('https://localhost:8080/');

  url = EmailBase.getUrl('/');
  expect(url).toEqual('https://localhost:8080/');

  url = EmailBase.getUrl('requests/study/42');
  expect(url).toEqual('https://localhost:8080/requests/study/42');

  url = EmailBase.getUrl('/requests/study/42');
  expect(url).toEqual('https://localhost:8080/requests/study/42');

  url = EmailBase.getUrl('requests/study/42/');
  expect(url).toEqual('https://localhost:8080/requests/study/42/');

  url = EmailBase.getUrl('/requests/study/42/');
  expect(url).toEqual('https://localhost:8080/requests/study/42/');
});

test('EmailBase.getOptions', async () => {
  const email = new EmailFoo(1729);
  await expect(email.getOptions()).resolves.toEqual({
    from: 'move-team@email1.dev-toronto.ca',
    to: ['move-ops+1730@toronto.ca'],
    reply_to: 'move-team@toronto.ca',
    subject: 'Foo: 1729 -> 1730',
    html: '<h1>Foo</h1><p>incremented to 1730</p>',
  });
});
