import csvStringify from 'csv-stringify';

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
        date: TimeFormatters.formatCsv,
      },
      columns: this.columns,
      header: true,
    });
  }
}

export default MoveCsvGenerator;
