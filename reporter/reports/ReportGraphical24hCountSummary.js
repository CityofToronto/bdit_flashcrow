import { ReportType } from '@/lib/Constants';
import CountDAO from '@/../lib/db/CountDAO';
import CountDataDAO from '@/../lib/db/CountDataDAO';
import { InvalidReportIdError } from '@/../lib/error/MoveErrors';
import ReportBase from './ReportBase';

/**
 * Subclass of {@link ReportBase} for the Graphical 24-Hour Count Summary
 * Report.
 */
class ReportGraphical24hCountSummary extends ReportBase {
  /* eslint-disable class-methods-use-this */
  type() {
    return ReportType.GRAPHICAL_24H_COUNT_SUMMARY;
  }

  /**
   * Parses an ID in the format `{categoryId}/{id}`, and returns it as a
   * {@link Count}.
   *
   * @param {string} rawId - ID to parse
   * @throws {InvalidReportIdError}
   */
  async parseId(rawId) {
    const parts = rawId.split('/');
    if (parts.length !== 2) {
      throw new InvalidReportIdError(rawId);
    }

    let categoryId = parts.shift();
    categoryId = parseInt(categoryId, 10);
    if (Number.isNaN(categoryId)) {
      throw new InvalidReportIdError(rawId);
    }

    let id = parts.shift();
    id = parseInt(id, 10);
    if (Number.isNaN(id)) {
      throw new InvalidReportIdError(rawId);
    }

    const count = await CountDAO.byIdAndCategory(id, categoryId);
    if (count === null) {
      throw new InvalidReportIdError(rawId);
    }
    return count;
  }

  async fetchRawData(count) {
    // TODO: validate this data in some way?
    return CountDataDAO.byCount(count);
  }

  transformData(countData) {
    const volumeByHour = new Array(24).fill(0);
    countData.forEach(({ t, data: { COUNT } }) => {
      const h = t.getHours();
      volumeByHour[h] += COUNT;
    });
    return volumeByHour;
  }

  generateCsvLayout(count, volumeByHour) {
    const { date: countDate } = count;
    const year = countDate.getFullYear();
    const month = countDate.getMonth();
    const date = countDate.getDate();
    const rows = volumeByHour.map((value, hour) => {
      const time = new Date(year, month, date, hour);
      return { time, count: value };
    });
    const columns = [
      { key: 'time', header: 'Time' },
      { key: 'count', header: 'Count' },
    ];
    return { columns, rows };
  }

  getPdfMetadata(count) {
    const {
      arteryCode,
      date,
      locationDesc,
      stationCode,
      type,
    } = count;
    return {
      reportName: 'Graphical 24-Hour Count Summary Report',
      reportDate: new Date(),
      date,
      locationDesc,
      identifiers: [
        { name: 'Study Category', value: type.value },
        { name: 'Station Number', value: stationCode },
        { name: 'Artery Code', value: arteryCode },
      ],
    };
  }

  generatePdfLayout(count, volumeByHour) {
    const chartOptions = {
      chartData: volumeByHour,
    };

    const metadata = this.getPdfMetadata(count);
    const headers = volumeByHour.map((_, hour) => ({ key: hour, text: hour }));
    const tableOptions = {
      table: {
        headers,
        rows: [volumeByHour],
      },
    };
    return {
      layout: 'portrait',
      metadata,
      content: [
        { type: 'chart', options: chartOptions },
        { type: 'table', options: tableOptions },
      ],
    };
  }
}

export default ReportGraphical24hCountSummary;
