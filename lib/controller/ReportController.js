import Boom from '@hapi/boom';

import {
  HttpStatus,
  ReportFormat,
  ReportParameter,
  ReportType,
} from '@/lib/Constants';
import { hasAuthScope } from '@/lib/auth/ScopeMatcher';
import { EnumValueError } from '@/lib/error/MoveErrors';
import StoragePath from '@/lib/io/storage/StoragePath';
import CollisionFilters from '@/lib/model/CollisionFilters';
import Joi from '@/lib/model/Joi';
import StudyRequestFilters from '@/lib/model/StudyRequestFilters';
import ReportFactory from '@/lib/reports/ReportFactory';

/**
 * Reporting-related routes.  Note that routes in this controller are handled by `reporter`.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const ReportController = [];

/**
 * Builds the validation schema corresponding to the given report parameter type.
 *
 * @param {ReportParameter} reportParameter - report parameter type
 * @returns `Joi` schema for the given report parameter type
 * @throws {EnumValueError} if `reportParameter` is not a valid `ReportParameter`
 */
function getSchemaForReportParameter(reportParameter) {
  if (reportParameter === ReportParameter.BOOLEAN) {
    return Joi.boolean().required();
  }
  if (reportParameter === ReportParameter.DATE) {
    return Joi.dateTime().required();
  }
  if (reportParameter === ReportParameter.PREVENTABLE_COLLISIONS) {
    return Joi.array().length(3).items(
      Joi.number().integer().min(0).required(),
    ).required();
  }
  throw new EnumValueError(reportParameter);
}

/**
 *
 * @param {ReportType} reportType - type of report to get parameter schema for
 */
function getSchemaForReportType(reportType) {
  if (reportType === ReportType.COLLISION_DIRECTORY
    || reportType === ReportType.COLLISION_TABULATION) {
    return Joi.object().keys(CollisionFilters);
  }
  if (reportType === ReportType.TRACK_REQUESTS) {
    return Joi.object().keys(StudyRequestFilters);
  }
  const { options = {} } = reportType;
  const schema = {};
  Object.entries(options).forEach(([name, reportParameter]) => {
    const reportParameterSchema = getSchemaForReportParameter(reportParameter);
    schema[name] = reportParameterSchema;
  });
  return Joi.object().keys(schema);
}

/**
 * Fetch the report of the given `id` and `type` in the given `format`.
 *
 * The interpretation of `id` depends on the report `type`.  For traffic study reports, this
 * identifies the specific traffic study.  For collision study reports, this identifies a
 * location selection, and all collisions from that selection are used.
 *
 * Some report types call for additional user-supplied parameters.  See {@link ReportType}
 * for more details; these are listed in `options` under specific report types.  User-supplied
 * parameters can be provided as additional GET query parameters.
 *
 * Note that this can return CSV, JSON, or PDF data, depending on the value of `format`.  See
 * {@link ReportFormat} for the mapping from `format` values to specific MIME types.
 *
 * Note also that this endpoint does not currently set `Content-Disposition`.  Use `FileSaver`
 * to initiate client-side download of the response body.
 *
 * HTTP 400 if expected user-supplied parameters are missing, or if unexpected user-supplied
 * parameters are provided; these parameters must match those expected by the report type.
 *
 * @memberof ReportController
 * @name getReport
 * @type {Hapi.ServerRoute}
 */
ReportController.push({
  method: 'GET',
  path: '/reports',
  options: {
    auth: { mode: 'try' },
    description: 'Generate reports in various formats',
    tags: ['api'],
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

    const user = request.auth.credentials;
    if (reportType.scope && !hasAuthScope(user, reportType.scope)) {
      return Boom.forbidden(`not authorized to generate reports of type ${reportType.name}`);
    }

    let reportOptions;
    try {
      const reportTypeParameterSchema = getSchemaForReportType(reportType);
      reportOptions = await reportTypeParameterSchema.validateAsync(options);
    } catch (err) {
      const { statusCode } = HttpStatus.BAD_REQUEST;
      return Boom.boomify(err, { statusCode, override: false });
    }

    const reportInstance = ReportFactory.getInstance(reportType);
    const reportStream = await reportInstance.generate(id, reportFormat, reportOptions, user);
    const response = h.response(reportStream)
      .type(reportFormat.mimeType);

    if (reportFormat.download) {
      const report = {
        type: reportType,
        id,
        format: reportFormat,
        ...reportOptions,
      };
      const { key } = await StoragePath.forReport(report);
      response.header('Content-Disposition', `attachment; filename="${key}"`);
    }

    return response;
  },
});

export default ReportController;
