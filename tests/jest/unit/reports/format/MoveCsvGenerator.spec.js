import MoveCsvGenerator from '@/lib/reports/format/MoveCsvGenerator';
import { readableStreamToString } from '@/lib/io/StreamUtils';
import DateTime from '@/lib/time/DateTime';

test('MoveCsvGenerator#generate', async () => {
  let columns;
  let rows;
  let generator;
  let readableStream;
  let str;

  columns = [];
  rows = [];
  generator = new MoveCsvGenerator(columns, rows);
  readableStream = await generator.generate();
  str = await readableStreamToString(readableStream);
  expect(str).toEqual('\n');

  columns = ['a'];
  rows = [];
  generator = new MoveCsvGenerator(columns, rows);
  readableStream = await generator.generate();
  str = await readableStreamToString(readableStream);
  expect(str).toEqual('a\n');

  columns = ['a', 'b'];
  rows = [];
  generator = new MoveCsvGenerator(columns, rows);
  readableStream = await generator.generate();
  str = await readableStreamToString(readableStream);
  expect(str).toEqual('a,b\n');

  columns = ['a'];
  rows = [[1]];
  generator = new MoveCsvGenerator(columns, rows);
  readableStream = await generator.generate();
  str = await readableStreamToString(readableStream);
  expect(str).toEqual('a\n1\n');

  columns = ['a', 'b'];
  rows = [[1, 2]];
  generator = new MoveCsvGenerator(columns, rows);
  readableStream = await generator.generate();
  str = await readableStreamToString(readableStream);
  expect(str).toEqual('a,b\n1,2\n');

  columns = ['a', 'b'];
  rows = [[1, 2], [3, 4]];
  generator = new MoveCsvGenerator(columns, rows);
  readableStream = await generator.generate();
  str = await readableStreamToString(readableStream);
  expect(str).toEqual('a,b\n1,2\n3,4\n');
});

test('MoveCsvGenerator#generate [DateTime]', async () => {
  const dt = DateTime.fromObject({
    year: 2000,
    month: 1,
    day: 1,
    hour: 7,
    minute: 45,
  });
  const columns = ['Time', 'Count', 'Flag', 'Notes'];
  const rows = [
    [dt, 42, true, 'foo'],
    [dt.plus({ minutes: 15 }), 1729, false, 'bar baz'],
  ];
  const generator = new MoveCsvGenerator(columns, rows);
  const readableStream = await generator.generate();
  const str = await readableStreamToString(readableStream);
  expect(str).toEqual(`Time,Count,Flag,Notes
2000-01-01 07:45,42,1,foo
2000-01-01 08:00,1729,,bar baz
`);
});
