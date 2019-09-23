import CountDAO from '@/../lib/db/CountDAO';
import CountDataDAO from '@/../lib/db/CountDataDAO';
import { InvalidReportIdError } from '@/../lib/error/MoveErrors';

import ReportBase from './ReportBase';


class ReportBaseFlow extends ReportBase {
  /* eslint-disable class-methods-use-this */

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
        { name: 'Study Category', value: type.label },
        { name: 'Station Number', value: stationCode },
        { name: 'Artery Code', value: arteryCode },
      ],
    };
  }
}

export default ReportBaseFlow;
