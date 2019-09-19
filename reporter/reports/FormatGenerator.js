import fs from 'fs';
import path from 'path';
import util from 'util';

import csvStringify from 'csv-stringify';

import FormatColors from './FormatColors';
import MovePDFDocument from '../MovePDFDocument';

const readFile = util.promisify(fs.readFile);

class FormatGenerator {
  static csvTimestamp(t) {
    return t.toISOString().slice(0, 16).replace('T', ' ');
  }

  static async init() {
    // load City of Toronto logo
    const cotLogoPath = path.resolve(__dirname, '../cot_logo.png');
    FormatGenerator.cotLogoData = await readFile(cotLogoPath);

    // initialize CSS colors map
    await FormatColors.init();
  }

  static async csv({ columns, rows }) {
    return csvStringify(rows, {
      cast: {
        date: FormatGenerator.csvTimestamp,
      },
      columns,
      header: true,
    });
  }

  static async excel(excelLayout) {
    // TODO: implement this
    return excelLayout;
  }

  static async pdf({
    layout,
  }) {
    const colorPrimaryDark = await FormatColors.var('--primary-dark');

    const doc = new MovePDFDocument({
      layout,
      margins: 0.25 * FormatGenerator.PT_PER_IN,
      size: 'letter',
    });

    // HEADER
    doc
      .save()
      .fillColor(colorPrimaryDark)
      .strokeColor(colorPrimaryDark);

    doc
      .fontSize(18)
      .text(
        'Traffic Safety Unit',
        0.25 * FormatGenerator.PT_PER_IN,
        0.35 * FormatGenerator.PT_PER_IN,
        {
          align: 'center',
          width: 8 * FormatGenerator.PT_PER_IN,
        },
      )
      .fontSize(12)
      .text(
        'Graphical 24-Hour Count Summary Report',
        0.25 * FormatGenerator.PT_PER_IN,
        0.65 * FormatGenerator.PT_PER_IN,
        {
          align: 'center',
          width: 8 * FormatGenerator.PT_PER_IN,
        },
      );

    doc.image(
      FormatGenerator.cotLogoData,
      0.25 * FormatGenerator.PT_PER_IN,
      0.25 * FormatGenerator.PT_PER_IN,
      {
        fit: [
          1.5 * FormatGenerator.PT_PER_IN,
          0.75 * FormatGenerator.PT_PER_IN,
        ],
      },
    );

    doc
      .moveTo(0.25 * FormatGenerator.PT_PER_IN, 1 * FormatGenerator.PT_PER_IN)
      .lineTo(8.25 * FormatGenerator.PT_PER_IN, 1 * FormatGenerator.PT_PER_IN)
      .stroke();

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
