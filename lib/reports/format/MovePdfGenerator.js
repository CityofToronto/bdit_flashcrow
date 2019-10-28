import fs from 'fs';
import path from 'path';
import util from 'util';

import PdfPrinter from 'pdfmake';

import {
  PageOrientation,
  PT_PER_IN,
} from '@/lib/Constants';
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
    // initialize fonts
    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
      },
    };
    MovePdfGenerator.PDF_PRINTER = new PdfPrinter(fonts);

    // load City of Toronto logo
    const cotLogoPath = path.resolve(__dirname, '../../../public/cot_logo.png');
    MovePdfGenerator.COT_LOGO_DATA = await readFile(cotLogoPath);

    // initialize CSS colors map
    await FormatCss.init();
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

  generateTable() {
    return [`${this.reportType}: table`];
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

export default MovePdfGenerator;
