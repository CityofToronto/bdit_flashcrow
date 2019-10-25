import fs from 'fs';
import path from 'path';
import util from 'util';

import csvStringify from 'csv-stringify';
import PdfPrinter from 'pdfmake';

import { PageOrientation } from '@/lib/Constants';
import FormatCss from '@/lib/reports/format/FormatCss';
import MovePDFDocument from '@/lib/reports/format/MovePDFDocument';
import TimeFormatters from '@/lib/time/TimeFormatters';

const readFile = util.promisify(fs.readFile);

/**
 * Generates CSV and PDF reports from the layout information returned by {@link ReportBase}
 * subclasses.
 */
class FormatGenerator {
  static async init() {
    // load City of Toronto logo
    const cotLogoPath = path.resolve(__dirname, '../../../public/cot_logo.png');
    FormatGenerator.cotLogoData = await readFile(cotLogoPath);

    // initialize CSS colors map
    await FormatCss.init();
  }

  static async csv({ columns, rows }) {
    return csvStringify(rows, {
      cast: {
        date: TimeFormatters.formatCsv,
      },
      columns,
      header: true,
    });
  }

  static async pdf({
    type: reportType,
    date,
  }) {
    const colorPrimaryDark = FormatCss.var('--primary-dark');
    const fontSizeXS = FormatCss.var('--font-size-xs');
    const fontSizeM = FormatCss.var('--font-size-m');
    const fontSizeXL = FormatCss.var('--font-size-xl');
    const spaceM = FormatCss.var('--space-m');
    const spaceL = FormatCss.var('--space-l');
    const spaceXL = FormatCss.var('--space-xl');
    const space2XL = FormatCss.var('--space-2xl');
    const margin = spaceL;

    let width = 8.5 * FormatGenerator.PT_PER_IN;
    let height = 11 * FormatGenerator.PT_PER_IN;
    if (reportType.orientation === PageOrientation.LANDSCAPE) {
      const temp = width;
      width = height;
      height = temp;
    }

    const docDefinition = {
      defaultStyle: {
        font: 'Helvetica',
        fontSize: fontSizeM,
        lineHeight: 1.25,
      },
      header: {
        stack: [
          {
            columns: [
              {
                image: FormatGenerator.cotLogoData,
                fit: [space2XL * 1.5, spaceXL * 1.5],
              },
              [
                {
                  text: FormatGenerator.ORG_NAME,
                  alignment: 'center',
                  color: colorPrimaryDark,
                  fontSize: fontSizeXL,
                },
                {
                  text: reportType.label,
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
                x2: width - margin * 2,
                y2: spaceM,
                lineColor: colorPrimaryDark,
              },
            ],
          },
        ],
        margin,
      },
      content: [
        'test A',
        'test B',
        'test C',
      ],
      footer(currentPage, pageCount) {
        const dateStr = TimeFormatters.formatDefault(date);
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
          margin,
        };
      },
      pageMargins: [
        margin,
        margin + space2XL + spaceM,
        margin,
        margin + spaceXL,
      ],
      pageOrientation: reportType.orientation.pdfkitLayout,
      pageSize: 'letter',
    };

    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
      },
    };
    const pdfPrinter = new PdfPrinter(fonts);
    const doc = pdfPrinter.createPdfKitDocument(docDefinition);
    doc.end();
    return doc;
  }

  static async pdfOld({
    layout,
    metadata: {
      reportName,
      reportDate,
      date,
      locationDesc,
      identifiers,
    },
    content,
  }) {
    const colorBaseLight = FormatCss.var('--base-light');
    const colorInk = FormatCss.var('--ink');
    const colorPrimaryDark = FormatCss.var('--primary-dark');
    const fontSizeXS = FormatCss.var('--font-size-xs');
    const fontSizeS = FormatCss.var('--font-size-s');
    const fontSizeM = FormatCss.var('--font-size-m');
    const fontSizeL = FormatCss.var('--font-size-l');
    const fontSizeXL = FormatCss.var('--font-size-xl');
    const spaceXS = FormatCss.var('--space-xs');
    const spaceM = FormatCss.var('--space-m');
    const spaceL = FormatCss.var('--space-l');
    const spaceXL = FormatCss.var('--space-xl');
    const space2XL = FormatCss.var('--space-2xl');
    const space3XL = FormatCss.var('--space-3xl');
    const margin = spaceXL;

    let width = 8.5 * FormatGenerator.PT_PER_IN;
    let height = 11 * FormatGenerator.PT_PER_IN;
    if (layout === 'landscape') {
      const temp = width;
      width = height;
      height = temp;
    }

    const widthUsable = width - 2 * margin;

    const doc = new MovePDFDocument({
      layout,
      margins: margin,
      size: 'letter',
    });

    // HEADER
    doc
      .save()
      .fillColor(colorPrimaryDark)
      .strokeColor(colorPrimaryDark);

    const textH1 = 'Traffic Safety Unit';
    const optionsH = {
      align: 'center',
      width: widthUsable,
    };
    const heightH1 = doc.heightOfString(textH1, optionsH);
    doc
      .fontSize(fontSizeXL)
      .text(textH1, margin, margin + spaceM, optionsH)
      .fontSize(fontSizeM)
      .text(
        reportName,
        margin,
        margin + spaceM + heightH1 + spaceM,
        optionsH,
      );

    doc.image(
      FormatGenerator.cotLogoData,
      margin,
      margin,
      { fit: [space3XL, space2XL] },
    );

    const heightHeader = margin + space2XL;
    doc
      .moveTo(margin, heightHeader)
      .lineTo(width - margin, heightHeader)
      .stroke();

    doc
      .restore()
      .moveDown();

    // SUB-HEADER
    doc
      .save()
      .fontSize(fontSizeS);

    const dateStr = TimeFormatters.formatDefault(date);
    doc
      .text(locationDesc, margin, heightHeader + spaceL, {
        align: 'left',
        width: widthUsable / 2,
      })
      .moveDown()
      .text(`Date: ${dateStr}`, {
        align: 'left',
        width: widthUsable / 2,
      });
    identifiers.forEach(({ name, value }, i) => {
      const text = `${name}: ${value}`;
      const textOptions = {
        align: 'left',
        width: widthUsable / 2,
      };
      if (i === 0) {
        doc.text(text, margin + widthUsable / 2, heightHeader + spaceL, textOptions);
      } else {
        doc
          .moveDown()
          .text(text, textOptions);
      }
    });

    doc
      .restore()
      .moveDown();

    // MAIN LAYOUT

    content.forEach(({ type, options }) => {
      // TODO: deal with more complex layouts?
      const nextY = doc.y + spaceL;
      doc.save();
      if (type === 'chart') {
        const { chartData } = options;
        doc.chart(chartData, margin, nextY, widthUsable, space3XL * 4, {
          beforeAxisLabels() {
            doc
              .fillColor(colorInk)
              .fontSize(fontSizeM);
          },
          beforeAxisTicks() {
            doc
              .fillColor(colorInk)
              .fontSize(fontSizeS);
          },
          beforeBars() {
            doc.fillColor(colorBaseLight);
          },
          beforeTitle() {
            doc
              .fillColor(colorInk)
              .fontSize(fontSizeL);
          },
          labelAxisX: 'Start Hour',
          labelAxisY: 'Number of Vehicles',
          title: 'Volume by Hour of Day',
        });
      } else if (type === 'table') {
        const { table } = options;
        doc
          .table(table, margin, nextY, {
            beforeHeader() {
              doc.fontSize(fontSizeS);
            },
            beforeRow() {
              doc.fontSize(fontSizeXS);
            },
            columnSpacing: spaceXS,
          });
      }
      doc
        .moveDown()
        .restore();
    });

    // FOOTER
    doc.save();

    // TODO: put this in `.onAddPage()`, increment page number
    const textFooter = 'Page 1';
    const heightFooter = doc.heightOfString(textFooter, optionsH);
    const reportDateStr = TimeFormatters.formatDateTime(reportDate);
    const reportGeneratedAt = `Generated at: ${reportDateStr}`;
    doc
      .fontSize(fontSizeXS)
      .text(textFooter, margin, height - margin - heightFooter, optionsH)
      .text(reportGeneratedAt, margin, height - margin - heightFooter, {
        align: 'right',
        width: widthUsable,
      });

    doc
      .restore()
      .moveDown();

    doc.end();
    return doc;
  }
}

/**
 * City of Toronto logo, in PNG format.
 *
 * @type {Buffer}
 */
FormatGenerator.cotLogoData = null;

/**
 * @type {string}
 */
FormatGenerator.ORG_NAME = 'Traffic Safety Unit';

/**
 * By typographical convention, a point is 1/72 of an inch.  Many media (both
 * online and offline, including PDF) adhere to this convention.
 *
 * @type {number}
 * @see https://en.wikipedia.org/wiki/Point_(typography)#Current_DTP_point_system
 */
FormatGenerator.PT_PER_IN = 72;

export default FormatGenerator;
