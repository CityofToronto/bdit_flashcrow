/* eslint-disable class-methods-use-this, no-unused-vars */
import { ReportFormat } from '@/lib/Constants';
import {
  InvalidReportFormatError,
  NotImplementedError,
} from '@/../lib/error/MoveErrors';
import FormatGenerator from './FormatGenerator';

/**
 * Common superclass for reports.  Subclasses of `ReportBase` represent
 * types of reports, and instances of those subclasses represent individual
 * reports (e.g. for a particular study, set of collisions, etc.)
 *
 * In general, a *report* is really just the combination of these three
 * elements:
 *
 * - a way to fetch raw data for a given ID;
 * - a set of calculations performed on that raw data;
 * - a visualization for the result of those calculations.
 *
 * @param {string} id - ID to generate report for
 */
class ReportBase {
  /**
   * Type of reports represented by this class.  This should return
   * one of the values in `Constants.ReportType`.
   *
   * `ReportFactory` uses this to help build an instance of the correct
   * subclass of `ReportBase` for the `type` parameter passed to
   * `GET /reports`.
   *
   * @abstract
   * @returns {string} type of reports for this class
   */
  type() {
    throw new NotImplementedError();
  }

  /**
   * For flexibility, we allow different report types to implement their ID
   * space in different ways.
   *
   * As an example: traffic study-related reports might use `COUNT_INFO_ID`
   * from `COUNTINFO` or `COUNTINFOMICS`.  However, collision-related reports
   * might instead use a `{centrelineType}/{centrelineId}` location key, or
   * they might use a saved list of collision IDs.
   *
   * This method is intended to perform any parsing that would make the ID
   * easier to work with in other methods.  It should also validate the ID
   * in the process; for instance, it might check relevant databases to
   * verify that the corresponding entry exists.
   *
   * @abstract
   * @param {string} id - ID of report to generate.
   * @returns {Object} ID with relevant parts parsed out
   * @throws {InvalidReportIdError} if the given ID is invalid for this report type
   */
  async parseId(id) {
    throw new NotImplementedError();
  }

  /**
   * Fetch raw data for the given report ID.  This method may assume that
   * the ID is valid, as {@link parseId} is supposed to guarantee that.
   *
   * @abstract
   * @param {Object} parsedId - ID as parsed for convenience by {@link parseId}
   * @returns {*} data for the given ID
   */
  async fetchRawData(parsedId) {
    throw new NotImplementedError();
  }

  /**
   * Perform any calculations on the raw data that are needed to produce this
   * report.  This might include time bucketing, aggregate statistics, or
   * other report-specific logic.
   *
   * This method must not perform any asynchronous operations, and it
   * must return a value that does not share any references with `rawData`.
   *
   * @abstract
   * @param {*} rawData - data returned by {@link fetchRawData}
   * @returns {*} result of calculations
   */
  transformData(rawData) {
    throw new NotImplementedError();
  }

  generateCsvLayout(transformedData) {
    throw new NotImplementedError();
  }

  generateExcelLayout(transformedData) {
    throw new NotImplementedError();
  }

  generatePdfLayout(transformedData) {
    throw new NotImplementedError();
  }

  /**
   * Generate the report of this type with the given ID, in the given format.
   *
   * The report is produced as a {@link stream.Duplex} that can be passed to
   * Hapi's `h.response()`.  Any API endpoints that call this should not
   * rely on `ReportBase` for MIME type information, as this can be inferred
   * from `format`.
   *
   * @param {string} id - ID to generate report for
   * @param {string} format - one of the values in {@link ReportFormat}
   * @returns {stream.Duplex} stream
   * @throws {InvalidReportFormatError} if this report type does not support
   * the given format
   */
  async generate(id, format) {
    const parsedId = await this.parseId(id);
    const rawData = await this.fetchRawData(parsedId);
    const transformedData = this.transformData(rawData);
    if (format === ReportFormat.CSV) {
      const csvLayout = this.generateCsvLayout(parsedId, transformedData);
      return FormatGenerator.csv(csvLayout);
    }
    if (format === ReportFormat.EXCEL) {
      const excelLayout = this.generateExcelLayout(parsedId, transformedData);
      return FormatGenerator.excel(excelLayout);
    }
    if (format === ReportFormat.JSON) {
      return transformedData;
    }
    if (format === ReportFormat.PDF) {
      const pdfLayout = this.generatePdfLayout(parsedId, transformedData);
      return FormatGenerator.pdf(pdfLayout);
    }
    throw new InvalidReportFormatError(format);
  }
}

export default ReportBase;
