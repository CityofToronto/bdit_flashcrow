import { InvalidCssVariableError } from '@/lib/error/MoveErrors';
import FormatCss from '@/lib/reports/format/FormatCss';

test('FormatCss.getVariableDeclarationFromLine', () => {
  let line = '';
  expect(FormatCss.getVariableDeclarationFromLine(line)).toEqual(null);

  line = 'not-valid-css';
  expect(FormatCss.getVariableDeclarationFromLine(line)).toEqual(null);

  line = '/* CSS COMMENT */';
  expect(FormatCss.getVariableDeclarationFromLine(line)).toEqual(null);

  line = 'table > tbody > tr > td {';
  expect(FormatCss.getVariableDeclarationFromLine(line)).toEqual(null);

  line = '  width: 400px';
  expect(FormatCss.getVariableDeclarationFromLine(line)).toEqual(null);

  line = '}';
  expect(FormatCss.getVariableDeclarationFromLine(line)).toEqual(null);

  line = '  --primary-lighter: #d9e8f6;';
  expect(FormatCss.getVariableDeclarationFromLine(line)).toEqual({
    name: '--primary-lighter',
    value: '#d9e8f6',
  });

  line = '  --font-size-xs: 0.75rem;';
  expect(FormatCss.getVariableDeclarationFromLine(line)).toEqual({
    name: '--font-size-xs',
    value: 9,
  });

  line = '  --space-2xl: 4rem;';
  expect(FormatCss.getVariableDeclarationFromLine(line)).toEqual({
    name: '--space-2xl',
    value: 48,
  });
});

test('FormatCss: initialize and fetch', async () => {
  await FormatCss.init();
  await expect(FormatCss.init()).resolves.toBeUndefined();

  expect(FormatCss.var('--primary-lighter')).toBe('#d9e8f6');
  expect(FormatCss.var('--font-size-xs')).toBe(9);
  expect(FormatCss.var('--space-2xl')).toBe(48);

  expect(() => {
    FormatCss.var('--does-not-exist');
  }).toThrow(InvalidCssVariableError);
});
