import TableUtils from '@/lib/reports/format/TableUtils';

test('TableUtils.normalizeStyle', () => {
  let style;
  let header;
  let expected;

  style = {};
  header = false;
  expected = {
    alignment: 'right',
    bold: false,
    bt: false,
    bl: false,
    bb: false,
    br: false,
    fontSize: null,
    muted: false,
    peak: false,
    shade: false,
    width: null,
  };
  expect(TableUtils.normalizeStyle(style, header)).toEqual(expected);

  style = {};
  header = true;
  expected = {
    alignment: 'center',
    bold: true,
    bt: false,
    bl: false,
    bb: false,
    br: false,
    fontSize: null,
    muted: false,
    peak: false,
    shade: false,
    width: null,
  };
  expect(TableUtils.normalizeStyle(style, header)).toEqual(expected);

  style = {
    alignment: 'left',
    muted: true,
    width: '4xl',
  };
  header = false;
  expected = {
    alignment: 'left',
    bold: false,
    bt: false,
    bl: false,
    bb: false,
    br: false,
    fontSize: null,
    muted: true,
    peak: false,
    shade: false,
    width: '4xl',
  };
  expect(TableUtils.normalizeStyle(style, header)).toEqual(expected);
});

test('TableUtils.normalizeCell', () => {
  let cell;
  let header;
  let tableStyle;
  let expected;

  cell = {};
  header = true;
  tableStyle = {};
  expected = {
    value: null,
    rowspan: 1,
    mvcrDetails: null,
    colspan: 1,
    header,
    style: {
      alignment: 'center',
      bold: true,
      bt: false,
      bl: false,
      bb: false,
      br: false,
      fontSize: null,
      muted: false,
      peak: false,
      shade: false,
      width: null,
    },
  };
  expect(TableUtils.normalizeCell(cell, header, tableStyle)).toEqual(expected);

  cell = {
    value: 'foobar',
    rowspan: 2,
    header: false,
    style: { bt: true, br: true, fontSize: 'l' },
  };
  header = true;
  tableStyle = {};
  expected = {
    value: 'foobar',
    rowspan: 2,
    colspan: 1,
    mvcrDetails: null,
    header: false,
    style: {
      alignment: 'right',
      bold: false,
      bt: true,
      bl: false,
      bb: false,
      br: true,
      fontSize: 'l',
      muted: false,
      peak: false,
      shade: false,
      width: null,
    },
  };
  expect(TableUtils.normalizeCell(cell, header, tableStyle)).toEqual(expected);

  cell = {
    value: 'foobar',
    rowspan: 2,
    style: { bl: true, bb: true, fontSize: 'l' },
  };
  header = false;
  tableStyle = { fontSize: 'xs', peak: true };
  expected = {
    value: 'foobar',
    rowspan: 2,
    colspan: 1,
    mvcrDetails: null,
    header: false,
    style: {
      alignment: 'right',
      bold: false,
      bt: false,
      bl: true,
      bb: true,
      br: false,
      fontSize: 'l',
      muted: false,
      peak: true,
      shade: false,
      width: null,
    },
  };
  expect(TableUtils.normalizeCell(cell, header, tableStyle)).toEqual(expected);
});
