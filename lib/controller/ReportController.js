import Boom from '@hapi/boom';
import Joi from '@hapi/joi';

import {
  HttpStatus,
  ReportFormat,
  ReportType,
} from '@/lib/Constants';
import ReportFactory from '@/lib/reports/ReportFactory';

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
      query: Joi.object({
        type: Joi
          .string()
          .valid(...ReportType.enumValues.map(({ name }) => name))
          .required(),
        id: Joi.string().required(),
        format: Joi
          .string()
          .valid(...ReportFormat.enumValues.map(({ name }) => name))
          .required(),
      }).unknown(),
    },
  },
  handler: async (request, h) => {
    const {
      type,
      id,
      format,
      ...options
    } = request.query;
    const reportType = ReportType.enumValueOf(type);

    const { options: reportTypeOptions = {} } = reportType;
    let reportOptions;
    try {
      reportOptions = await Joi.validate(options, reportTypeOptions);
    } catch (err) {
      return Boom.boomify(err, { statusCode: HttpStatus.BAD_REQUEST, override: false });
    }

    const reportFormat = ReportFormat.enumValueOf(format);
    const reportInstance = ReportFactory.getInstance(reportType);
    const reportStream = await reportInstance.generate(id, reportFormat, reportOptions);
    return h.response(reportStream)
      .type(reportType.mimeType);
  },
});

export default ReportController;
