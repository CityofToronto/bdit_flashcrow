class TableUtils {
  static normalizeStyle(style, header) {
    const alignment = header ? 'center' : 'right';
    const defaultStyle = {
      alignment,
      bold: header,
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
    return Object.assign(defaultStyle, style);
  }

  static normalizeCell(cell, header, tableStyle) {
    const {
      value = null,
      rowspan = 1,
      colspan = 1,
      header: cellHeader = header,
      style: cellStyle = {},
    } = cell;
    const mergedStyle = {
      ...tableStyle,
      ...cellStyle,
    };
    const style = TableUtils.normalizeStyle(mergedStyle, cellHeader);
    return {
      value,
      rowspan,
      colspan,
      header: cellHeader,
      style,
    };
  }
}

export default TableUtils;
