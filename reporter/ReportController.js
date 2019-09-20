import Joi from '@hapi/joi';

import { ReportFormat } from '@/lib/Constants';
import { InvalidReportFormatError } from '@/../lib/error/MoveErrors';
import ReportFactory from './reports/ReportFactory';

/**
 * @param {string} format
 * @returns {string}
 * @throws {InvalidReportFormatError}
 */
function getReportMimeType(format) {
  if (format === ReportFormat.CSV) {
    return 'text/csv';
  }
  if (format === ReportFormat.JSON) {
    return 'application/json';
  }
  if (format === ReportFormat.PDF) {
    return 'application/pdf';
  }
  throw new InvalidReportFormatError(format);
}

/**
 * Reporting-related routes.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const ReportController = [];

/**
 * Fetch the given report in the given format.
 *
 * TODO: handle multi-fetch of reports
 *
 * @memberof ReportController
 * @name getReports
 * @type {Hapi.ServerRoute}
 */
ReportController.push({
  method: 'GET',
  path: '/reports',
  options: {
    validate: {
      query: {
        type: Joi.string().required(),
        id: Joi.string().required(),
        format: Joi
          .string()
          .valid(...Object.values(ReportFormat))
          .required(),
      },
    },
  },
  handler: async (request, h) => {
    const { type, id, format } = request.query;
    const report = ReportFactory.getInstance(type);
    const reportStream = await report.generate(id, format);
    const reportMimeType = getReportMimeType(format);
    return h.response(reportStream)
      .type(reportMimeType);
  },
});

export default ReportController;
