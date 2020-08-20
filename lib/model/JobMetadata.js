import JobType from '@/lib/jobs/JobType';
import Joi from '@/lib/model/Joi';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';

/*
 * Job metadata instances are generated within `JobMetadataDAO.create` from a `pg-boss` job
 * and an authenticated user, so there is no concept of a "transient" instance here.
 */
const PERSISTED_COLUMNS = {
  jobId: Joi.string().uuid(),
  userId: Joi.number().integer().positive(),
  type: Joi.enum().ofType(JobType),
  state: Joi.string(),
  dismissed: Joi.boolean(),
  progressCurrent: Joi.number().integer().min(0),
  progressTotal: Joi.number().integer().positive(),
  createdAt: Joi.dateTimeZone(),
  startedAt: Joi.dateTimeZone().allow(null),
  completedAt: Joi.dateTimeZone().allow(null),
  result: Joi.object().unknown().allow(null),
};

const JobMetadata = new Model(ModelField.persisted(PERSISTED_COLUMNS));

export default JobMetadata;
