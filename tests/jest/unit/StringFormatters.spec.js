import {
  formatCountLocationDescription,
  formatDuration,
  formatOxfordCommaList,
} from '@/lib/StringFormatters';

test('StringFormatters.formatCountLocationDescription', () => {
  expect(formatCountLocationDescription('')).toEqual('');
  expect(formatCountLocationDescription(
    'any st n/b (px 123)',
  )).toEqual('Any St N/B (PX 123)');
  expect(formatCountLocationDescription(
    'Foo Ave EB',
  )).toEqual('Foo Ave E/B');
  expect(formatCountLocationDescription(
    'bar RD and baz blvd',
  )).toEqual('Bar Rd and Baz Blvd');
});

test('StringFormatters.formatDuration', () => {
  expect(formatDuration(24)).toEqual('1 day');
  expect(formatDuration(168)).toEqual('1 week');
  expect(formatDuration(72)).toEqual('3 days');
});

test('StringFormatters.formatOxfordCommaList', () => {
  expect(formatOxfordCommaList([])).toEqual('');
  expect(formatOxfordCommaList(['a'])).toEqual('a');
  expect(formatOxfordCommaList(['a', 'b'])).toEqual('a and b');
  expect(formatOxfordCommaList(['a', 'b', 'c'])).toEqual('a, b, and c');
});
