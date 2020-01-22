import Boom from '@hapi/boom';
import Joi from '@hapi/joi';

import {
  HttpStatus,
  ReportFormat,
  ReportParameter,
  ReportType,
} from '@/lib/Constants';
import { EnumValueError } from '@/lib/error/MoveErrors';
import ReportFactory from '@/lib/reports/ReportFactory';

/**
 * Reporting-related routes.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const ReportController = [];

/**
 *
 * @param {ReportParameter} reportParameter - report parameter type
 * @returns `Joi` schema for the given report parameter type
 * @throws {EnumValueError} if `reportParameter` is not a valid `ReportParameter`
 */
function getSchemaForReportParameter(reportParameter) {
  if (reportParameter === ReportParameter.BOOLEAN) {
    return Joi.boolean().required();
  }
  if (reportParameter === ReportParameter.DATE_YEAR) {
    return Joi.number().integer().positive().required();
  }
  if (reportParameter === ReportParameter.INTEGER_NON_NEGATIVE) {
    return Joi.number().integer().min(0).required();
  }
  if (reportParameter === ReportParameter.PREVENTABLE_COLLISIONS) {
    return Joi.array().length(3).items(
      Joi.number().integer().min(0).required(),
    ).required();
  }
  if (reportParameter === ReportParameter.USERNAME) {
    return Joi.string().required();
  }
  throw new EnumValueError(reportParameter);
}

/**
 *
 * @param {ReportType} reportType - type of report to get parameter schema for
 */
function getSchemaForReportType({ options = {} }) {
  const schema = {};
  Object.entries(options).forEach(([name, reportParameter]) => {
    const reportParameterSchema = getSchemaForReportParameter(reportParameter);
    schema[name] = reportParameterSchema;
  });
  return Joi.object().keys(schema);
}

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

    let reportOptions;
    try {
      const reportTypeParameterSchema = getSchemaForReportType(reportType);
      reportOptions = await reportTypeParameterSchema.validateAsync(options);
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
