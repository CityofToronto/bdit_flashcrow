/* eslint-disable class-methods-use-this */
import fs from 'fs';
import path from 'path';
import util from 'util';

import PdfPrinter from 'pdfmake';

import { ORG_NAME, PageOrientation } from '@/lib/Constants';
import NumberFormatters from '@/lib/i18n/NumberFormatters';
import FormatCss from '@/lib/reports/format/FormatCss';
import TableUtils from '@/lib/reports/format/TableUtils';
import BarChartGenerator from '@/lib/reports/svg/BarChartGenerator';
import SvgStringRenderer from '@/lib/reports/svg/SvgStringRenderer';
import TimeFormatters from '@/lib/time/TimeFormatters';

const readFile = util.promisify(fs.readFile);

/**
 * Given a PDF layout, generates a PDF from it using `pdfmake`.
 *
 * @param {Object} layout - PDF layout
 */
class MovePdfGenerator {
  constructor({
    content,
    generatedAt,
    header,
    type: reportType,
  }) {
    /*
     * Page dimensions and margins.  For now, we always use letter-sized paper.
     */
    let { height, width } = reportType.size;
    if (reportType.orientation === PageOrientation.LANDSCAPE) {
      const temp = width;
      width = height;
      height = temp;
    }
    this.width = width;
    this.height = height;
    this.margin = FormatCss.var('--space-l');

    this.content = content;
    this.header = header;
    this.generatedAt = generatedAt;
    this.reportType = reportType;
  }

  static async init() {
    // load City of Toronto logo
    const cotLogoPath = path.resolve(__dirname, '../../../public/cot_logo.png');
    MovePdfGenerator.COT_LOGO_DATA = await readFile(cotLogoPath);

    // initialize CSS colors map
    await FormatCss.init();

    // initialize fonts
    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
      },
    };
    MovePdfGenerator.PDF_PRINTER = new PdfPrinter(fonts);

    // initialize table layout
    const lineWidth = 0.5;
    const colorBase = FormatCss.var('--base');
    const spaceXS = FormatCss.var('--space-xs');
    const spaceS = FormatCss.var('--space-s');

    MovePdfGenerator.TABLE_LAYOUT = {
      hLineWidth() {
        return lineWidth;
      },
      vLineWidth() {
        return lineWidth;
      },
      hLineColor() {
        return colorBase;
      },
      vLineColor() {
        return colorBase;
      },
      paddingLeft() {
        return spaceS;
      },
      paddingTop() {
        return spaceXS;
      },
      paddingRight() {
        return spaceS;
      },
      paddingBottom() {
        return spaceXS;
      },
    };
  }

  generateHeader() {
    const colorPrimaryDark = FormatCss.var('--primary-dark');
    const fontSizeXS = FormatCss.var('--font-size-xs');
    const fontSizeXL = FormatCss.var('--font-size-xl');
    const spaceS = FormatCss.var('--space-s');
    const spaceL = FormatCss.var('--space-l');
    const space2XL = FormatCss.var('--space-2xl');
    const space3XL = FormatCss.var('--space-3xl');
    return {
      stack: [
        {
          columns: [
            {
              image: MovePdfGenerator.COT_LOGO_DATA,
              fit: [space3XL, space2XL],
              width: space3XL,
            },
            {
              margin: [spaceL, spaceS, 0, 0],
              stack: [
                {
                  text: ORG_NAME,
                  alignment: 'left',
                  color: colorPrimaryDark,
                },
                {
                  text: this.reportType.label,
                  alignment: 'left',
                  color: colorPrimaryDark,
                  fontSize: fontSizeXL,
                },
              ],
            },
            {
              margin: [0, spaceS, 0, 0],
              stack: [
                {
                  text: this.header.info,
                  alignment: 'right',
                  color: colorPrimaryDark,
                  fontSize: fontSizeXS,
                },
                {
                  text: this.header.subinfo,
                  alignment: 'right',
                  color: colorPrimaryDark,
                  fontSize: fontSizeXS,
                },
              ],
            },
          ],
        },
      ],
      margin: [this.margin, this.margin, this.margin, 0],
    };
  }

  // ReportBlock.BAR_CHART

  generateBarChart(options, numColumns) {
    const colorBase = FormatCss.var('--base');
    const colorInk = FormatCss.var('--ink');
    const spaceL = FormatCss.var('--space-l');
    const space3XL = FormatCss.var('--space-3xl');
    const widthTotal = this.width - 2 * this.margin - (numColumns - 1) * spaceL;
    const width = widthTotal / numColumns;
    const height = space3XL * 4;
    const barChartOptions = {
      colorAxis: colorInk,
      colorBars: colorBase,
      width,
      height,
      ...options,
    };
    const svg = SvgStringRenderer.render(BarChartGenerator, barChartOptions);
    return [{
      svg,
    }];
  }

  // ReportBlock.METADATA

  static getMetadataBlock({ cols, name, value }) {
    const fontSizeM = FormatCss.var('--font-size-m');
    const fontSizeL = FormatCss.var('--font-size-l');

    const stack = [
      {
        color: '#696969',
        fontSize: fontSizeM,
        text: name,
      },
    ];

    if (value === null) {
      stack.push({
        fontSize: fontSizeL,
        text: 'None',
      });
    } else if (Number.isFinite(value)) {
      const text = NumberFormatters.formatDefault(value);
      stack.push({
        fontSize: fontSizeL,
        text,
      });
    } else {
      const text = value.toString();
      stack.push({
        fontSize: fontSizeL,
        text,
      });
    }

    const pct = MovePdfGenerator.COLS_PERCENT[cols];
    const width = `${pct}%`;

    return { stack, width };
  }

  static getMetadataRows(entries) {
    const rows = [];
    if (entries.length === 0) {
      return rows;
    }
    let row = null;
    let c = 0;
    entries.forEach((entry, i) => {
      const { cols } = entry;
      if (i === 0 || c + cols > MovePdfGenerator.COLS_GRID) {
        row = [];
        c = 0;
        rows.push(row);
      }
      row.push(entry);
      c += cols;
    });
    return rows;
  }

  generateMetadata({ entries }) {
    const spaceM = FormatCss.var('--space-m');
    const rows = MovePdfGenerator.getMetadataRows(entries);
    return rows.map(row => ({
      columns: row.map(MovePdfGenerator.getMetadataBlock),
      margin: [0, 0, 0, spaceM],
    }));
  }

  // ReportBlock.PAGE_BREAK

  generatePageBreak() {
    return [
      {
        pageBreak: 'after',
        text: '',
      },
    ];
  }

  // ReportBlock.TABLE

  static getColumnWidths(columnStyles, numColumns) {
    const widths = new Array(numColumns).fill('auto');
    columnStyles.forEach(({ c, style = {} }) => {
      const { width } = TableUtils.normalizeStyle(style, false);
      if (width === null) {
        widths[c] = '*';
      } else {
        const columnWidth = FormatCss.var(`--space-${width}`);
        widths[c] = columnWidth;
      }
    });
    return widths;
  }

  static getNumSectionRows(section) {
    if (section.length === 0) {
      return 0;
    }
    const rowLimits = section.map((row, r) => {
      const rowSpans = row.map(({ rowspan = 1 }) => rowspan);
      return r + Math.max(...rowSpans);
    });
    return Math.max(...rowLimits);
  }

  static getBlockForValue(value) {
    if (value === true) {
      return {
        svg: MovePdfGenerator.ICON_CHECK,
      };
    }
    if (value === false) {
      return {
        svg: MovePdfGenerator.ICON_TIMES,
      };
    }
    if (value === null) {
      return { text: ' ' };
    }
    if (Number.isFinite(value)) {
      const text = NumberFormatters.formatDefault(value);
      return { text };
    }
    const text = value.toString();
    return { text };
  }

  static getSectionRows(section, header, numColumns, tableStyle) {
    const numRows = MovePdfGenerator.getNumSectionRows(section);
    const rows = new Array(numRows);
    for (let r = 0; r < numRows; r += 1) {
      rows[r] = new Array(numColumns).fill(null);
    }
    section.forEach((row, r) => {
      let c = 0;
      row.forEach((cell) => {
        while (rows[r][c] !== null) {
          c += 1;
        }
        const {
          value,
          rowspan,
          colspan,
          style: {
            alignment,
            bold,
            bt,
            bl,
            bb,
            br,
            fontSize: fontSizeStr,
            muted,
            peak,
            shade,
          },
        } = TableUtils.normalizeCell(cell, header, tableStyle);
        const block = MovePdfGenerator.getBlockForValue(value);
        const blockIsSvg = Object.prototype.hasOwnProperty.call(block, 'svg');
        const cellNormalized = {
          ...block,
          alignment,
          border: [bl, bt, br, bb],
        };
        if (header) {
          const fillColor = FormatCss.var('--base-lighter');
          cellNormalized.fillColor = fillColor;
        }
        if (rowspan > 1) {
          cellNormalized.rowSpan = rowspan;
          for (let dr = 1; dr < rowspan; dr += 1) {
            rows[r + dr][c] = MovePdfGenerator.TABLE_CELL_EMPTY;
          }
        }
        if (colspan > 1) {
          cellNormalized.colSpan = colspan;
          for (let dc = 1; dc < colspan; dc += 1) {
            rows[r][c + dc] = MovePdfGenerator.TABLE_CELL_EMPTY;
          }
        }
        if (bold) {
          cellNormalized.bold = true;
        }
        if (fontSizeStr !== null) {
          const fontSize = FormatCss.var(`--font-size-${fontSizeStr}`);
          if (blockIsSvg) {
            cellNormalized.fit = [fontSize, fontSize];
          } else {
            cellNormalized.fontSize = fontSize;
          }
        } else if (blockIsSvg) {
          const { DEFAULT_FONT_SIZE } = MovePdfGenerator;
          const size = FormatCss.var(`--font-size-${DEFAULT_FONT_SIZE}`);
          cellNormalized.fit = [size, size];
        }
        if (muted) {
          const color = FormatCss.var('--disabled-dark');
          cellNormalized.color = color;
        }
        if (peak) {
          const fillColor = FormatCss.var('--error-light');
          cellNormalized.fillColor = fillColor;
          cellNormalized.bold = true;
        } else if (shade) {
          const fillColor = FormatCss.var('--base-lightest');
          cellNormalized.fillColor = fillColor;
        }
        rows[r][c] = cellNormalized;
        c += colspan;
      });
    });
    return rows;
  }

  static getTableRows(header, body, footer, numColumns, tableStyle) {
    const headerRows = MovePdfGenerator.getSectionRows(header, true, numColumns, tableStyle);
    const bodyRows = MovePdfGenerator.getSectionRows(body, false, numColumns, tableStyle);
    const footerRows = MovePdfGenerator.getSectionRows(footer, false, numColumns, tableStyle);
    return [
      ...headerRows,
      ...bodyRows,
      ...footerRows,
    ];
  }

  generateTable({
    title = null,
    caption = null,
    dontBreakTable = false,
    tableStyle = {},
    columnStyles = [],
    header = [],
    body,
    footer = [],
  }) {
    const fontSizeL = FormatCss.var('--font-size-l');
    const content = [];
    if (title !== null) {
      content.push({
        text: title,
        fontSize: fontSizeL,
      });
    }
    if (caption !== null) {
      content.push({
        text: caption,
      });
    }
    const numColumns = TableUtils.getNumTableColumns(header, body, footer);
    const tableRows = MovePdfGenerator.getTableRows(
      header,
      body,
      footer,
      numColumns,
      tableStyle,
    );
    const tableBlock = {
      table: {
        body: tableRows,
        dontBreakRows: true,
      },
      layout: MovePdfGenerator.TABLE_LAYOUT,
    };
    if (columnStyles.length > 0) {
      const widths = MovePdfGenerator.getColumnWidths(columnStyles, numColumns);
      tableBlock.table.widths = widths;
    }
    if (header.length > 0) {
      tableBlock.table.headerRows = header.length;
      if (dontBreakTable) {
        tableBlock.table.keepWithHeaderRows = body.length;
      }
    }
    content.push(tableBlock);
    if (dontBreakTable) {
      return [{
        stack: content,
        unbreakable: true,
      }];
    }
    return content;
  }

  generateContentForReportBlock({ type: blockType, options }, numColumns) {
    const spaceM = FormatCss.var('--space-m');
    const { suffix } = blockType;
    const generateContentBlocks = this[`generate${suffix}`].bind(this);
    const contentBlocks = generateContentBlocks(options, numColumns);
    let n = contentBlocks.length;
    if (n === 0) {
      contentBlocks.push({});
      n = 1;
    }
    contentBlocks[n - 1].margin = [0, 0, 0, spaceM];
    return contentBlocks;
  }

  generateContentRow(contentRow) {
    const spaceL = FormatCss.var('--space-l');
    if (Array.isArray(contentRow)) {
      /*
       * Arrays of report blocks are rendered into equal-width columns.  This process
       * is non-recursive: to limit report complexity, you cannot nest columns within
       * columns!
       */
      const n = contentRow.length;
      return [{
        columns: contentRow.map(reportBlock => ({
          stack: this.generateContentForReportBlock(reportBlock, n),
        })),
        columnGap: spaceL,
      }];
    }
    return this.generateContentForReportBlock(contentRow, 1);
  }

  generateContent() {
    return Array.prototype.concat.apply(
      [],
      this.content.map(this.generateContentRow.bind(this)),
    );
  }

  generateFooter(currentPage, pageCount) {
    const fontSizeXS = FormatCss.var('--font-size-xs');
    const generatedAtStr = TimeFormatters.formatDateTime(this.generatedAt);
    const reportGeneratedAt = `Generated at: ${generatedAtStr}`;
    return {
      columns: [
        { text: '' },
        {
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: 'center',
          fontSize: fontSizeXS,
        },
        {
          text: reportGeneratedAt,
          alignment: 'right',
          fontSize: fontSizeXS,
        },
      ],
      margin: this.margin,
    };
  }

  generateDocDefinition() {
    const { DEFAULT_FONT_SIZE } = MovePdfGenerator;
    const fontSize = FormatCss.var(`--font-size-${DEFAULT_FONT_SIZE}`);
    const spaceXL = FormatCss.var('--space-xl');
    const space2XL = FormatCss.var('--space-2xl');

    const header = this.generateHeader();
    const content = this.generateContent();
    const footer = this.generateFooter.bind(this);
    const pageMargins = [
      this.margin,
      this.margin + space2XL,
      this.margin,
      this.margin + spaceXL,
    ];
    const pageOrientation = this.reportType.orientation.pdfkitLayout;
    const { height, width } = this.reportType.size;
    const pageSize = { height, width };

    return {
      defaultStyle: {
        font: 'Helvetica',
        fontSize,
        lineHeight: 1.2,
      },
      header,
      content,
      footer,
      pageMargins,
      pageOrientation,
      pageSize,
    };
  }

  generate() {
    const docDefinition = this.generateDocDefinition();
    const doc = MovePdfGenerator.PDF_PRINTER.createPdfKitDocument(docDefinition);
    doc.end();
    return doc;
  }
}

/**
 * Number of columns in metadata grid.
 *
 * @type {number}
 */
MovePdfGenerator.COLS_GRID = 12;

/**
 * Percent width for columns according to grid.
 *
 * @type {Array}
 */
MovePdfGenerator.COLS_PERCENT = new Array(MovePdfGenerator.COLS_GRID + 1);
for (let i = 0; i <= MovePdfGenerator.COLS_GRID; i++) {
  const pct = Math.round(100 * i / MovePdfGenerator.COLS_GRID);
  MovePdfGenerator.COLS_PERCENT[i] = pct;
}

/**
 * City of Toronto logo, in PNG format.
 *
 * @type {Buffer}
 */
MovePdfGenerator.COT_LOGO_DATA = null;

/**
 * @type {string}
 */
MovePdfGenerator.DEFAULT_FONT_SIZE = 's';

/**
 * Used for `true` values in tables.
 *
 * @type {string}
 */
MovePdfGenerator.ICON_CHECK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"/></svg>';

/**
 * Used for `false` values in tables.
 *
 * @type {string}
 */
MovePdfGenerator.ICON_TIMES = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"/></svg>';

/**
 * {@link PdfPrinter} instance for generating PDFs.  We initialize this once
 * at class-level to avoid repeat overhead from initializing fonts.
 *
 * @type {PdfPrinter}
 */
MovePdfGenerator.PDF_PRINTER = null;

/**
 * @type {Object}
 */
MovePdfGenerator.TABLE_CELL_EMPTY = {};

/**
 * @type {Object}
 */
MovePdfGenerator.TABLE_LAYOUT = null;

export default MovePdfGenerator;
