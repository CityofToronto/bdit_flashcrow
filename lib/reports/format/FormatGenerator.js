import csvStringify from 'csv-stringify';

import TimeFormatters from '@/lib/time/TimeFormatters';
import MovePdfGenerator from './MovePdfGenerator';

/**
 * Generates CSV and PDF reports from the layout information returned by {@link ReportBase}
 * subclasses.
 */
class FormatGenerator {
  static async csv({ columns, rows }) {
    return csvStringify(rows, {
      cast: {
        date: TimeFormatters.formatCsv,
      },
      columns,
      header: true,
    });
  }

  static async pdf(layout) {
    const pdfGenerator = new MovePdfGenerator(layout);
    return pdfGenerator.generate();
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
