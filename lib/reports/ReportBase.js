/* eslint-disable class-methods-use-this, no-unused-vars */
import { ReportFormat } from '@/lib/Constants';
import {
  InvalidReportFormatError,
  NotImplementedError,
} from '@/lib/error/MoveErrors';
import MoveCsvGenerator from '@/lib/reports/format/MoveCsvGenerator';
import MovePdfGenerator from '@/lib/reports/format/MovePdfGenerator';
import DateTime from '@/lib/time/DateTime';

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
   * @returns {ReportType} type of reports for this class
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
   * @param {string} id - ID of report to generate
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
   * @param {Object} options - extra report-specific options parsed from
   * {@link ReportController#getReport}
   * @param {Object} user - user context for report generation
   * @returns {*} data for the given ID and options
   */
  async fetchRawData(parsedId, options, user) {
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
   * @param {*} parsedId - ID with relevant parts parsed out
   * @param {*} rawData - data returned by {@link fetchRawData}
   * @param {Object} options - extra report-specific options parsed from
   * {@link ReportController#getReport}
   * @returns {*} result of calculations
   */
  transformData(parsedId, rawData, options) {
    throw new NotImplementedError();
  }

  generateCsv(parsedId, transformedData) {
    throw new NotImplementedError();
  }

  generateLayoutContent(parsedId, transformedData) {
    throw new NotImplementedError();
  }

  async generateLayoutHeader(parsedId, options) {
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
   * @param {ReportFormat} format - format to generate report in
   * @param {Object} options - additional report options
   * @param {Object} user - user context for report generation
   * @returns {stream.Duplex} stream
   * @throws {InvalidReportFormatError} if this report type does not support
   * the given format
   */
  async generate(id, format, options, user) {
    const parsedId = await this.parseId(id);
    const rawData = await this.fetchRawData(parsedId, options, user);
    const transformedData = this.transformData(parsedId, rawData, options);
    if (format === ReportFormat.JSON) {
      return {
        data: transformedData,
      };
    }
    if (format === ReportFormat.CSV) {
      const { columns, rows } = this.generateCsv(parsedId, transformedData);
      const csvGenerator = new MoveCsvGenerator(columns, rows);
      return csvGenerator.generate();
    }
    const type = this.type();
    const content = this.generateLayoutContent(parsedId, transformedData);
    const header = await this.generateLayoutHeader(parsedId, options);
    const collisionFactors = this.collisionFactors || {};
    const layout = {
      content,
      generatedAt: DateTime.local(),
      header,
      type,
      options,
      collisionFactors,
    };
    if (format === ReportFormat.PDF) {
      const pdfGenerator = new MovePdfGenerator(layout);
      return pdfGenerator.generate();
    }
    if (format === ReportFormat.WEB) {
      return layout;
    }
    throw new InvalidReportFormatError(format);
  }
}

export default ReportBase;
