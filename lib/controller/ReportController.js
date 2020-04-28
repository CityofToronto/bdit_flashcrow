import Boom from '@hapi/boom';

import {
  HttpStatus,
  ReportFormat,
  ReportParameter,
  ReportType,
} from '@/lib/Constants';
import { EnumValueError } from '@/lib/error/MoveErrors';
import Joi from '@/lib/model/Joi';
import ReportFactory from '@/lib/reports/ReportFactory';

/**
 * Reporting-related routes.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const ReportController = [];

/**
 * Builds the validation schema corresponding to the given report parameter type.
 *
 * TODO: move this directly into the `ReportParameter` enum
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
 * @memberof ReportController
 * @name getReport
 * @type {Hapi.ServerRoute}
 */
ReportController.push({
  method: 'GET',
  path: '/reports',
  options: {
    validate: {
      query: Joi.object({
        type: Joi.enum().ofType(ReportType).required(),
        id: Joi.string().required(),
        format: Joi.enum().ofType(ReportFormat).required(),
      }).unknown(),
    },
  },
  handler: async (request, h) => {
    const {
      type: reportType,
      id,
      format: reportFormat,
      ...options
    } = request.query;

    let reportOptions;
    try {
      const reportTypeParameterSchema = getSchemaForReportType(reportType);
      reportOptions = await reportTypeParameterSchema.validateAsync(options);
    } catch (err) {
      const { statusCode } = HttpStatus.BAD_REQUEST;
      return Boom.boomify(err, { statusCode, override: false });
    }

    const reportInstance = ReportFactory.getInstance(reportType);
    const reportStream = await reportInstance.generate(id, reportFormat, reportOptions);
    return h.response(reportStream)
      .type(reportType.mimeType);
  },
});

export default ReportController;
