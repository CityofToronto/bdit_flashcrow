import Joi from '@/lib/model/Joi';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';

const PERSISTED_COLUMNS = {
  state: Joi.string(),
  startedon: Joi.dateTimeZone().allow(null),
  completedon: Joi.dateTimeZone().allow(null),
};

const TRANSIENT_COLUMNS = {
  id: Joi.string().uuid(),
  name: Joi.string(),
  data: Joi.object().unknown(),
  createdon: Joi.dateTimeZone(),
};

const Job = new Model([
  ...ModelField.persisted(PERSISTED_COLUMNS),
  ...ModelField.transient(TRANSIENT_COLUMNS),
]);

export default Job;
