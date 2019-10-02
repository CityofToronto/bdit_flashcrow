import Joi from '@hapi/joi';

import { ReportFormat, ReportType } from '@/lib/Constants';
import ReportFactory from './reports/ReportFactory';

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
        type: Joi
          .string()
          .valid(...ReportType.enumValues.map(({ name }) => name))
          .required(),
        id: Joi.string().required(),
        format: Joi
          .string()
          .valid(...ReportFormat.enumValues.map(({ name }) => name))
          .required(),
      },
    },
  },
  handler: async (request, h) => {
    const { type, id, format } = request.query;
    const reportType = ReportType.enumValueOf(type);
    const reportFormat = ReportFormat.enumValueOf(format);
    const reportInstance = ReportFactory.getInstance(reportType);
    const reportStream = await reportInstance.generate(id, reportFormat);
    return h.response(reportStream)
      .type(reportType.mimeType);
  },
});

export default ReportController;
