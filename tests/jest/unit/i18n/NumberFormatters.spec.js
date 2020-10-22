import NumberFormatters from '@/lib/i18n/NumberFormatters';

test('NumberFormatters.formatDefault', () => {
  let x = null;
  expect(NumberFormatters.formatDefault(x)).toEqual('');

  x = 42;
  expect(NumberFormatters.formatDefault(x)).toEqual('42');

  x = 17.25;
  expect(NumberFormatters.formatDefault(x)).toEqual('17.25');

  x = 1234;
  expect(NumberFormatters.formatDefault(x)).toEqual('1,234');
});

test('NumberFormatters.formatDecimal', () => {
  let x = null;
  expect(NumberFormatters.formatDecimal(x, 1)).toEqual('');

  x = 42;
  expect(NumberFormatters.formatDecimal(x, 1)).toEqual('42.0');

  x = 17.25;
  expect(NumberFormatters.formatDecimal(x, 1)).toEqual('17.3');
  expect(NumberFormatters.formatDecimal(x, 2)).toEqual('17.25');

  x = 1234;
  expect(NumberFormatters.formatDecimal(x, 1)).toEqual('1,234.0');
});

test('NumberFormatters.formatPercent', () => {
  let x = null;
  expect(NumberFormatters.formatPercent(x, 1)).toEqual('');

  x = 0.42;
  expect(NumberFormatters.formatPercent(x, 1)).toEqual('42.0%');

  x = 0.1725;
  expect(NumberFormatters.formatPercent(x, 1)).toEqual('17.3%');
  expect(NumberFormatters.formatPercent(x, 2)).toEqual('17.25%');

  x = 12.34;
  expect(NumberFormatters.formatPercent(x, 1)).toEqual('1,234.0%');
});
