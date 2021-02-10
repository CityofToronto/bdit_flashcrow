import ArrayStats from '@/lib/math/ArrayStats';

class TableUtils {
  static getNumSectionColumns(section) {
    if (section.length === 0) {
      /*
       * This can happen for sections that aren't provided in the layout.  For
       * instance, the header and footer are both optional, and default to the
       * empty list if not provided.
       */
      return 0;
    }
    /*
     * Since we define the table layouts ourselves, we can take the shortcut
     * of assuming that these layouts specify an equal number of columns in each
     * row.  Given that, we only need to check the first row.
     */
    const [firstRow] = section;
    return ArrayStats.sum(
      firstRow.map(({ colspan = 1 }) => colspan),
    );
  }

  static getNumTableColumns(header, body, footer) {
    const numHeaderColumns = TableUtils.getNumSectionColumns(header);
    const numBodyColumns = TableUtils.getNumSectionColumns(body);
    const numFooterColumns = TableUtils.getNumSectionColumns(footer);
    return Math.max(
      numHeaderColumns,
      numBodyColumns,
      numFooterColumns,
    );
  }

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
