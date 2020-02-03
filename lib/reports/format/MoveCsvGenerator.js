import csvStringify from 'csv-stringify';

import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';

/**
 * Generates CSV reports from the CSV columns / rows info returned by
 * {@link ReportBase#generateCsv} implementations.
 */
class MoveCsvGenerator {
  constructor(columns, rows) {
    this.columns = columns;
    this.rows = rows;
  }

  async generate() {
    return csvStringify(this.rows, {
      cast: {
        object(value) {
          if (value instanceof DateTime) {
            return TimeFormatters.formatCsv(value);
          }
          return JSON.stringify(value);
        },
      },
      columns: this.columns,
      header: true,
    });
  }
}

export default MoveCsvGenerator;
