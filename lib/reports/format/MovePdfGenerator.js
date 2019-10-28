import fs from 'fs';
import path from 'path';
import util from 'util';

import PdfPrinter from 'pdfmake';

import {
  PageOrientation,
  PT_PER_IN,
} from '@/lib/Constants';
import ArrayStats from '@/lib/math/ArrayStats';
import FormatCss from '@/lib/reports/format/FormatCss';
import TimeFormatters from '@/lib/time/TimeFormatters';

const readFile = util.promisify(fs.readFile);

/**
 * Given a PDF layout, generates a PDF from it using `pdfmake`.
 *
 * @param {Object} layout - PDF layout
 */
class MovePdfGenerator {
  constructor({
    type: reportType,
    date: reportDate,
    content,
  }) {
    /*
     * Page dimensions and margins.  For now, we always use letter-sized paper.
     */
    let width = 8.5 * PT_PER_IN;
    let height = 11 * PT_PER_IN;
    if (reportType.orientation === PageOrientation.LANDSCAPE) {
      const temp = width;
      width = height;
      height = temp;
    }
    this.width = width;
    this.height = height;
    this.margin = FormatCss.var('--space-l');

    this.reportType = reportType;
    this.reportDate = reportDate;
    this.content = content;
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
    const fontSizeXL = FormatCss.var('--font-size-xl');
    const spaceM = FormatCss.var('--space-m');
    const space2XL = FormatCss.var('--space-2xl');
    const space3XL = FormatCss.var('--space-3xl');
    return {
      stack: [
        {
          columns: [
            {
              image: MovePdfGenerator.COT_LOGO_DATA,
              fit: [space3XL, space2XL],
            },
            [
              {
                text: MovePdfGenerator.ORG_NAME,
                alignment: 'center',
                color: colorPrimaryDark,
                fontSize: fontSizeXL,
              },
              {
                text: this.reportType.label,
                alignment: 'center',
                color: colorPrimaryDark,
              },
            ],
            { text: '' },
          ],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: spaceM,
              x2: this.width - this.margin * 2,
              y2: spaceM,
              lineColor: colorPrimaryDark,
            },
          ],
        },
      ],
      margin: this.margin,
    };
  }

  generateBarChart() {
    return [`${this.reportType}: bar chart`];
  }

  generateCountMetadata() {
    return [`${this.reportType}: count metadata`];
  }

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
    const numHeaderColumns = MovePdfGenerator.getNumSectionColumns(header);
    const numBodyColumns = MovePdfGenerator.getNumSectionColumns(body);
    const numFooterColumns = MovePdfGenerator.getNumSectionColumns(footer);
    return Math.max(
      numHeaderColumns,
      numBodyColumns,
      numFooterColumns,
    );
  }

  static getColumnWidths(columnStyles, numColumns) {
    const widths = new Array(numColumns).fill('auto');
    columnStyles.forEach(({ c, style }) => {
      // TODO: support other style metadata
      const { width } = MovePdfGenerator.normalizeStyle(style);
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

  static normalizeStyle(style) {
    const defaultStyle = {
      bold: false,
      bt: false,
      bl: false,
      bb: false,
      br: false,
      fontSize: null,
      muted: false,
      width: null,
    };
    return Object.assign(defaultStyle, style);
  }

  static normalizeCell(cell, header) {
    const defaultOptions = {
      value: null,
      rowspan: 1,
      colspan: 1,
      header,
      style: {},
    };
    const cellNormalized = Object.assign(defaultOptions, cell);
    cellNormalized.style = MovePdfGenerator.normalizeStyle(cellNormalized.style);
    return cellNormalized;
  }

  static getSectionRows(section, header, numColumns) {
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
          header: cellHeader,
          style: {
            bold,
            bt,
            bl,
            bb,
            br,
            fontSize: fontSizeStr,
            muted,
          },
        } = MovePdfGenerator.normalizeCell(cell, header);
        const text = value === null ? '' : value.toString();
        const cellNormalized = {
          text,
          border: [bl, bt, br, bb],
        };
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
        if (cellHeader || bold) {
          cellNormalized.bold = true;
        }
        if (fontSizeStr !== null) {
          const fontSize = FormatCss.var(`--font-size-${fontSizeStr}`);
          cellNormalized.fontSize = fontSize;
        }
        if (muted) {
          const color = FormatCss.var('--disabled-dark');
          cellNormalized.color = color;
        }
        rows[r][c] = cellNormalized;
        c += colspan;
      });
    });
    return rows;
  }

  static getTableRows(header, body, footer, numColumns) {
    const headerRows = MovePdfGenerator.getSectionRows(header, true, numColumns);
    const bodyRows = MovePdfGenerator.getSectionRows(body, false, numColumns);
    const footerRows = MovePdfGenerator.getSectionRows(footer, false, numColumns);
    return [
      ...headerRows,
      ...bodyRows,
      ...footerRows,
    ];
  }

  /* eslint-disable class-methods-use-this */
  generateTable({
    title = null,
    caption = null,
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
    const numColumns = MovePdfGenerator.getNumTableColumns(header, body, footer);
    const tableRows = MovePdfGenerator.getTableRows(header, body, footer, numColumns);
    const tableBlock = {
      table: {
        body: tableRows,
      },
      layout: MovePdfGenerator.TABLE_LAYOUT,
    };
    if (columnStyles.length > 0) {
      const widths = MovePdfGenerator.getColumnWidths(columnStyles, numColumns);
      tableBlock.table.widths = widths;
    }
    if (header.length > 0) {
      tableBlock.table.headerRows = header.length;
    }
    content.push(tableBlock);
    return content;
  }

  generateContent() {
    return Array.prototype.concat.apply(
      [],
      this.content.map(({ type: blockType, options }) => {
        const { suffix } = blockType;
        const generateBlock = this[`generate${suffix}`].bind(this);
        return generateBlock(options);
      }),
    );
  }

  generateFooter(currentPage, pageCount) {
    const fontSizeXS = FormatCss.var('--font-size-xs');
    const dateStr = TimeFormatters.formatDefault(this.reportDate);
    const reportGeneratedAt = `Generated at: ${dateStr}`;
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
    const fontSizeM = FormatCss.var('--font-size-m');
    const spaceM = FormatCss.var('--space-m');
    const spaceXL = FormatCss.var('--space-xl');
    const space2XL = FormatCss.var('--space-2xl');

    const header = this.generateHeader();
    const content = this.generateContent();
    const footer = this.generateFooter.bind(this);
    const pageMargins = [
      this.margin,
      this.margin + space2XL + spaceM,
      this.margin,
      this.margin + spaceXL,
    ];

    return {
      defaultStyle: {
        font: 'Helvetica',
        fontSize: fontSizeM,
        lineHeight: 1.25,
      },
      header,
      content,
      footer,
      pageMargins,
      pageOrientation: this.reportType.orientation.pdfkitLayout,
      pageSize: 'letter',
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
 * City of Toronto logo, in PNG format.
 *
 * @type {Buffer}
 */
MovePdfGenerator.COT_LOGO_DATA = null;

/**
 * @type {string}
 */
MovePdfGenerator.ORG_NAME = 'Traffic Safety Unit';

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
