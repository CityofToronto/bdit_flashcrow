import fs from 'fs';
import path from 'path';
import util from 'util';

import csvStringify from 'csv-stringify';

import TimeFormatters from '@/lib/time/TimeFormatters';
import FormatCss from './FormatCss';
import MovePDFDocument from '../MovePDFDocument';

const readFile = util.promisify(fs.readFile);

class FormatGenerator {
  static async init() {
    // load City of Toronto logo
    const cotLogoPath = path.resolve(__dirname, '../cot_logo.png');
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
    layout,
  }) {
    const fontSizeXS = FormatCss.var('--font-size-xs');
    const fontSizeM = FormatCss.var('--font-size-m');
    const fontSizeXL = FormatCss.var('--font-size-xl');
    const primaryDark = FormatCss.var('--primary-dark');
    const spaceM = FormatCss.var('--space-m');
    const spaceXL = FormatCss.var('--space-xl');
    const space2XL = FormatCss.var('--space-2xl');
    const space3XL = FormatCss.var('--space-3xl');

    let width = 8.5 * FormatGenerator.PT_PER_IN;
    let height = 11 * FormatGenerator.PT_PER_IN;
    if (layout === 'landscape') {
      const temp = width;
      width = height;
      height = temp;
    }
    const margin = spaceXL;
    const widthUsable = width - 2 * margin;

    const now = new Date();

    const doc = new MovePDFDocument({
      layout,
      margins: margin,
      size: 'letter',
    });

    // HEADER
    doc
      .save()
      .fillColor(primaryDark)
      .strokeColor(primaryDark);

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
        'Graphical 24-Hour Count Summary Report',
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

    // CHART

    // TABLE

    // FOOTER
    doc
      .save();

    const textFooter = 'Page 1 of 1';
    const heightFooter = doc.heightOfString(textFooter, optionsH);
    const nowStr = TimeFormatters.formatDateTime(now);
    const generatedAt = `Generated at: ${nowStr}`;
    doc
      .fontSize(fontSizeXS)
      .text(textFooter, margin, height - margin - heightFooter, optionsH)
      .text(generatedAt, margin, height - margin - heightFooter, {
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

FormatGenerator.cotLogoData = null;

/**
 * By typographical convention, a point is 1/72 of an inch.  Many media (both
 * online and offline, including PDF) adhere to this convention.
 *
 * @see https://en.wikipedia.org/wiki/Point_(typography)#Current_DTP_point_system
 */
FormatGenerator.PT_PER_IN = 72;

export default FormatGenerator;
