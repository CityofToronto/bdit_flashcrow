import Joi from '@/lib/model/Joi';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';

const PERSISTED_COLUMNS = {
  jobId: Joi.string().uuid(),
  dismissed: Joi.boolean(),
  progressCurrent: Joi.number().integer().min(0),
};

const TRANSIENT_COLUMNS = {
  progressTotal: Joi.number().integer().positive(),
  metadata: Joi.object().unknown(),
};

const JobMetadata = new Model([
  ...ModelField.persisted(PERSISTED_COLUMNS),
  ...ModelField.transient(TRANSIENT_COLUMNS),
]);

export default JobMetadata;
