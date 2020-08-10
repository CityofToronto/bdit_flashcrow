import JobType from '@/lib/jobs/JobType';
import Joi from '@/lib/model/Joi';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';

const PERSISTED_COLUMNS = {
  state: Joi.string(),
  startedon: Joi.dateTime().allow(null),
  completedon: Joi.dateTime().allow(null),
};

const TRANSIENT_COLUMNS = {
  id: Joi.string().uuid(),
  name: Joi.enum().ofType(JobType),
  data: Joi.object().unknown(),
  createdon: Joi.dateTime(),
};

const Job = new Model([
  ...ModelField.persisted(PERSISTED_COLUMNS),
  ...ModelField.transient(TRANSIENT_COLUMNS),
]);

export default Job;
