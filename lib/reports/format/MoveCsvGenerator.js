import stream from 'stream';

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
    const csvStream = csvStringify(this.rows, {
      cast: {
        object(value) {
          if (value instanceof DateTime) {
            return TimeFormatters.formatCsv(value);
          }
          return value.toString();
        },
      },
      columns: this.columns,
      header: true,
    });

    /*
     * The stream returned by `csvStringify` doesn't `pipe` correctly (see
     * https://github.com/adaltas/node-csv-stringify/issues/66 for more details).  In particular,
     * it handles close-during-write incorrectly, so that `curl` can be used to crash MOVE
     * Reporter as follows:
     *
     * ```
     * curl -k -I "https://localhost:8200/reports?type=SPEED_PERCENTILE&id=4%2F2010692&format=CSV"
     * ```
     *
     * This is because `curl -I` fetches headers, then closes the stream before fetching the
     * response body: a perfect close-during-write example!
     *
     * To work around this, we pipe the CSV stream through an instance of `stream.PassThrough`
     * here.  This properly handles close-during-write, preventing the crash.
     */
    const duplexStream = new stream.PassThrough();
    csvStream.pipe(duplexStream);
    return duplexStream;
  }
}

export default MoveCsvGenerator;
